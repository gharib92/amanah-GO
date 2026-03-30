/*
 KYC Routes (squelette)
 - expose des endpoints simples pour piloter le flow KYC mock
 - conçu pour être sécurisé (auth middleware) et facilement branché sur AWS Rekognition plus tard

 Routes proposées:
 POST /api/kyc/create-session        (protected) -> crée la session KYC
 POST /api/kyc/upload-selfie         (protected) -> upload selfie (multipart)
 POST /api/kyc/upload-document       (protected) -> upload document (multipart)
 GET  /api/kyc/status/:id           (protected or public) -> lire le statut
 POST /api/kyc/webhook              (public) -> endpoint pour provider (TODO: vérif signature)

 Note: importer et appeler `registerKycRoutes(app, authMiddleware)` depuis src/index.tsx
*/

import { Hono } from 'hono'
import { createKycSession, uploadKycSelfie, uploadKycDocument, checkKycStatus, updateKycStatusByProviderRef } from './kyc/service'

// Exporter une fonction pour enregistrer les routes et pouvoir injecter le middleware d'auth
export function registerKycRoutes(app: Hono<any>, authMiddleware?: any) {
  // Créer session KYC (utilisateur connecté)
  app.post('/api/kyc/create-session', authMiddleware, async (c) => {
    try {
      const db = c.env.DB // D1 Database (binding)
      const user = c.get('user')
      if (!user || !user.id) return c.json({ success: false, error: 'Utilisateur non authentifié' }, 401)

      const session = await createKycSession(db, user.id)
      return c.json({ success: true, session })
    } catch (err: any) {
      console.error('create-session error:', err)
      return c.json({ success: false, error: err.message || 'Erreur serveur' }, 500)
    }
  })

  // Upload selfie (multipart/form-data)
  // champ attendu: 'selfie'
  app.post('/api/kyc/upload-selfie', authMiddleware, async (c) => {
    try {
      const db = c.env.DB
      const form = await c.req.formData()
      const sessionId = form.get('session_id')
      const file = form.get('selfie')

      if (!sessionId) return c.json({ success: false, error: 'session_id requis' }, 400)

      // Si le navigateur envoie un File, nous pouvons récupérer l'arrayBuffer
      let arrayBuffer = null
      if (file && (file as any).arrayBuffer) {
        arrayBuffer = await (file as any).arrayBuffer()
      }

      // Optionnel: utiliser R2 si présent
      const r2 = (c.env as any).R2

      const result = await uploadKycSelfie(db, sessionId.toString(), { file: arrayBuffer, filename: (file as any)?.name || 'selfie.jpg', r2Bucket: r2 })
      return c.json({ success: true, ...result })
    } catch (err: any) {
      console.error('upload-selfie error:', err)
      return c.json({ success: false, error: err.message || 'Erreur serveur' }, 500)
    }
  })

  // Upload document (multipart/form-data)
  // champ attendu: 'document'
  app.post('/api/kyc/upload-document', authMiddleware, async (c) => {
    try {
      const db = c.env.DB
      const form = await c.req.formData()
      const sessionId = form.get('session_id')
      const file = form.get('document')

      if (!sessionId) return c.json({ success: false, error: 'session_id requis' }, 400)

      let arrayBuffer = null
      if (file && (file as any).arrayBuffer) {
        arrayBuffer = await (file as any).arrayBuffer()
      }

      const r2 = (c.env as any).R2
      const result = await uploadKycDocument(db, sessionId.toString(), { file: arrayBuffer, filename: (file as any)?.name || 'document.jpg', r2Bucket: r2 })
      return c.json({ success: true, ...result })
    } catch (err: any) {
      console.error('upload-document error:', err)
      return c.json({ success: false, error: err.message || 'Erreur serveur' }, 500)
    }
  })

  // Récupérer une photo selfie depuis R2 (centralisé)
  // Cette route tente de récupérer une image dans R2 pour l'utilisateur courant.
  // Si R2 n'est pas configuré, elle redirige vers une image placeholder en développement.
  app.get('/api/kyc/selfie/:fileId', async (c) => {
    try {
      const { R2 } = c.env
      const fileId = c.req.param('fileId')

      // En dev, renvoyer un placeholder si R2 non configuré
      if (!R2) {
        return c.redirect('https://via.placeholder.com/400x500?text=Selfie+KYC')
      }

      // Récupérer l'id user si la route est appelée par un utilisateur authentifié
      // NOTE: si l'utilisateur n'est pas authentifié, on utilise 'unknown' (comportement hérité)
      const userId = c.get('user')?.id || 'unknown'
      const extensions = ['jpg', 'jpeg', 'png', 'webp']

      for (const ext of extensions) {
        const key = `kyc/selfies/${userId}/${fileId}.${ext}`
        const object = await R2.get(key)

        if (object) {
          return new Response(object.body, {
            headers: {
              'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
              'Cache-Control': 'public, max-age=31536000'
            }
          })
        }
      }

      // Si aucune image trouvée, retourner le placeholder
      return c.redirect('https://via.placeholder.com/400x500?text=Selfie+KYC')

    } catch (err: any) {
      console.error('selfie fetch error:', err)
      return c.json({ success: false, error: err.message || 'Erreur serveur' }, 500)
    }
  })

  // Récupérer le statut KYC
  app.get('/api/kyc/status/:id', async (c) => {
    try {
      const db = c.env.DB
      const sessionId = c.req.param('id')
      const res = await checkKycStatus(db, sessionId)
      return c.json({ success: true, ...res })
    } catch (err: any) {
      console.error('status error:', err)
      return c.json({ success: false, error: err.message || 'Erreur serveur' }, 500)
    }
  })

  // Webhook public pour que le provider notifie des changements de statut
  // IMPORTANT: dans production, vérifier la signature / secret
  app.post('/api/kyc/webhook', async (c) => {
    try {
      // body attendu (exemple): { provider_ref: 'abc', status: 'APPROVED', reason: '...' }
      const payload = await c.req.json()
      const { provider_ref, status, reason } = payload
      if (!provider_ref || !status) return c.json({ success: false, error: 'provider_ref et status requis' }, 400)

      // TODO: Vérifier la signature / secret ici pour s'assurer que la requête vient bien du provider

      // Mettre à jour la session correspondante
      const updated = await updateKycStatusByProviderRef(c.env.DB, provider_ref, status === 'APPROVED' ? 'APPROVED' : 'REJECTED', reason)

      // (Optionel) Notifier user via email (utiliser sendEmail dans index)
      return c.json({ success: true, updated })
    } catch (err: any) {
      console.error('webhook error:', err)
      return c.json({ success: false, error: err.message || 'Erreur serveur' }, 500)
    }
  })

}
