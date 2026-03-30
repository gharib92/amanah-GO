/*
 KYC Service (squelette)
 But: cette version est en "mock" et contient de nombreux commentaires pour débutant.
 Elle est pensée pour être ensuite branchée sur Amazon Rekognition (ou un partenaire KYC sur AWS).

 Fonctions exportées:
 - createKycSession(db, userId)
 - uploadKycSelfie(db, sessionId, { file, filename, r2Bucket? })
 - uploadKycDocument(db, sessionId, { file, filename, r2Bucket? })
 - checkKycStatus(db, sessionId)

 NOTE: "db" doit être l'objet D1Database (accessible via c.env.DB dans les routes).
 TODO: remplacer les parties mock par des appels réels AWS Rekognition / provider.
*/

import { generateId } from '../db.service'
import { createRekognitionClient, compareFacesWithBytes, compareFacesWithS3 } from '../aws/rekognition-client'

// Type simple pour la réponse standard
type KycSession = {
  id: string
  user_id: string
  provider: string
  provider_ref?: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  selfie_url?: string | null
  document_url?: string | null
  score?: number | null
}

// -------------------------------
// Helper: insérer une ligne KYC dans D1 (mock)
// -------------------------------
export async function createKycSession(db: any, userId: string): Promise<KycSession> {
  // Générer un id local pour la session KYC
  const id = generateId()
  const provider = 'aws-rekognition' // Par défaut, prévoir Rekognition

  // Insérer en base (table `kyc_requests` doit exister via migration)
  await db.prepare(`
    INSERT INTO kyc_requests (
      id, user_id, provider, provider_ref, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?)
  `).bind(id, userId, provider, null, 'PENDING', new Date().toISOString()).run()

  return {
    id,
    user_id: userId,
    provider,
    provider_ref: null,
    status: 'PENDING'
  }
}

// -------------------------------
// Upload selfie (mock)
// - file: instance de File/Blob transformée en ArrayBuffer (ou null si on fournit url)
// - filename: nom proposé
// - r2Bucket (optionnel): binding R2 pour stocker le fichier si on veut
// -------------------------------
export async function uploadKycSelfie(db: any, sessionId: string, options: { file?: ArrayBuffer | null, filename?: string, r2Bucket?: any } = {}): Promise<{ selfie_url: string }> {
  const { file, filename='selfie.jpg', r2Bucket } = options

  // Rechercher la session
  const row = await db.prepare('SELECT * FROM kyc_requests WHERE id = ?').bind(sessionId).first()
  if (!row) throw new Error('SESSION_NOT_FOUND')

  // Si on a un binding R2, on pourrait stocker le fichier là (TODO: production)
  if (file && r2Bucket) {
    // Exemples : créer une clé et put
    const key = `kyc/${sessionId}/selfie-${Date.now()}-${filename}`

    // TODO: Remplacer par r2Bucket.put(key, file, { httpMetadata: { contentType: 'image/jpeg' } })
    // await r2Bucket.put(key, file, { httpMetadata: { contentType: 'image/jpeg' } })
    // const publicUrl = `https://.../` + key

    // Pour l'instant, on stocke l'url mock
    const publicUrl = `r2://${key}`

    await db.prepare('UPDATE kyc_requests SET selfie_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(publicUrl, sessionId).run()

    return { selfie_url: publicUrl }
  }

  // Si on n'a pas de fichier (upload via provider client-side), on retourne une url mock
  const mockUrl = `https://mock.storage/kyc/${sessionId}/selfie.jpg`
  await db.prepare('UPDATE kyc_requests SET selfie_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(mockUrl, sessionId).run()
  return { selfie_url: mockUrl }
}

// -------------------------------
// Upload document (ID) (mock) - similaire à selfie
// -------------------------------
export async function uploadKycDocument(db: any, sessionId: string, options: { file?: ArrayBuffer | null, filename?: string, r2Bucket?: any } = {}): Promise<{ document_url: string }> {
  const { file, filename='id.jpg', r2Bucket } = options

  const row = await db.prepare('SELECT * FROM kyc_requests WHERE id = ?').bind(sessionId).first()
  if (!row) throw new Error('SESSION_NOT_FOUND')

  if (file && r2Bucket) {
    const key = `kyc/${sessionId}/document-${Date.now()}-${filename}`
    // TODO: r2Bucket.put(key, file, ...)
    const publicUrl = `r2://${key}`
    await db.prepare('UPDATE kyc_requests SET document_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(publicUrl, sessionId).run()
    return { document_url: publicUrl }
  }

  const mockUrl = `https://mock.storage/kyc/${sessionId}/document.jpg`
  await db.prepare('UPDATE kyc_requests SET document_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(mockUrl, sessionId).run()
  return { document_url: mockUrl }
}

// -------------------------------
// checkKycStatus (intégration Rekognition - squelette)
// - Si les deux URLs sont présentes, tenter d'appeler Rekognition (ex: CompareFaces)
// - Retourne { status, score }
// - Actuellement en mode mock si Rekognition non configuré (TODO: décommenter appels réels)
// -------------------------------
export async function checkKycStatus(db: any, sessionId: string): Promise<{ status: 'PENDING' | 'APPROVED' | 'REJECTED', score?: number | null }> {
  const row = await db.prepare('SELECT * FROM kyc_requests WHERE id = ?').bind(sessionId).first()
  if (!row) throw new Error('SESSION_NOT_FOUND')

  // Si on n'a pas encore les deux images, rester en PENDING
  if (!row.selfie_url || !row.document_url) {
    return { status: 'PENDING', score: null }
  }

  // 1) Créer le client Rekognition si possible (utilise les env AWS dans process.env)
  const client = await createRekognitionClient(process.env)

  // 2) Essayer d'appeler Rekognition (si configuré). Si échoue, fallback en mock.
  try {
    console.log('ℹ️ checkKycStatus: attempting Rekognition, client=', !!client)

    if (client) {
      // On va essayer d'obtenir les images en bytes. On supporte plusieurs formats d'URL.
      let selfieBytes: ArrayBuffer | null = null
      let documentBytes: ArrayBuffer | null = null

      // Helper interne: fetch avec timeout
      async function fetchWithTimeout(url: string, ms = 10000) {
        const controller = new AbortController()
        const id = setTimeout(() => controller.abort(), ms)
        try {
          const res = await fetch(url, { signal: controller.signal })
          clearTimeout(id)
          if (!res.ok) throw new Error('Fetch failed with status ' + res.status)
          return await res.arrayBuffer()
        } finally {
          clearTimeout(id)
        }
      }

      // Si les URLs commencent par '/' (endpoint interne), préfixer par location origin si possible
      const normalizeUrl = (u: string) => {
        if (u.startsWith('/')) {
          // Dans l'environnement workers, fetch('/') pourrait ne pas fonctionner, mais on essaye avec ORIGIN si défini
          const origin = process.env.APP_ORIGIN || 'http://localhost:3000'
          return origin + u
        }
        return u
      }

      try {
        // Récupérer les images (approche B)
        const selfieUrl = normalizeUrl(row.selfie_url)
        const documentUrl = normalizeUrl(row.document_url)

        console.log('ℹ️ fetching images for Rekognition:', selfieUrl, documentUrl)

        selfieBytes = await fetchWithTimeout(selfieUrl, 10000)
        documentBytes = await fetchWithTimeout(documentUrl, 10000)

        console.log('ℹ️ images fetched, calling Rekognition...')

        const resp = await compareFacesWithBytes(client, selfieBytes, documentBytes)

        if (!resp.success) {
          console.warn('⚠️ Rekognition compare failed:', resp.error)
          // Keep as PENDING for manual review
          await db.prepare('UPDATE kyc_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind('PENDING', sessionId).run()
          return { status: 'PENDING', score: null }
        }

        const score = (resp.similarity || 0) / 100 // similarity returned as percent (e.g. 75) -> convert 0-1
        const status: 'APPROVED' | 'REJECTED' = score >= 0.75 ? 'APPROVED' : 'REJECTED'

        // Mettre à jour la DB (on stocke le score en pourcentage pour lisibilité)
        await db.prepare('UPDATE kyc_requests SET status = ?, score = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(status, resp.similarity, sessionId).run()

        return { status, score }
      } catch (fetchErr: any) {
        console.error('❌ Error fetching images or calling Rekognition:', fetchErr)
        // En cas d'erreur on laisse la session en PENDING pour tentative manuelle plus tard
        await db.prepare('UPDATE kyc_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind('PENDING', sessionId).run()
        return { status: 'PENDING', score: null }
      }
    }

    // Si client non configuré, rester en mode mock (comportement existant pour tests)
    console.log('ℹ️ Rekognition non configuré - using mock score')
    const hash = Array.from(sessionId).reduce((acc: number, ch: string) => acc + ch.charCodeAt(0), 0)
    const score = (hash % 100) / 100 // score entre 0.0 et 0.99

    const status: 'APPROVED' | 'REJECTED' = score >= 0.75 ? 'APPROVED' : 'REJECTED'
    await db.prepare('UPDATE kyc_requests SET status = ?, score = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(status, score, sessionId).run()
    return { status, score }
  } catch (err: any) {
    console.warn('Rekognition attempt failed, falling back to mock. Error:', err)

    // En cas d'erreur avec Rekognition, laisser l'état en PENDING pour revue manuelle
    await db.prepare('UPDATE kyc_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind('PENDING', sessionId).run()

    return { status: 'PENDING', score: null }
  }
}

// -------------------------------
// Helper: allow webhook updates (provider calls your webhook with provider_ref)
// - providerRef: id venant du provider (ex: Rekognition job id or partner job id)
// - newStatus: 'APPROVED'|'REJECTED'
// - reason: optional text
// -------------------------------
export async function updateKycStatusByProviderRef(db: any, providerRef: string, newStatus: 'APPROVED' | 'REJECTED', reason?: string) {
  // Rechercher la session par provider_ref
  const row = await db.prepare('SELECT * FROM kyc_requests WHERE provider_ref = ?').bind(providerRef).first()
  if (!row) throw new Error('PROVIDER_REF_NOT_FOUND')

  await db.prepare('UPDATE kyc_requests SET status = ?, reason = ?, updated_at = CURRENT_TIMESTAMP WHERE provider_ref = ?').bind(newStatus, reason || null, providerRef).run()

  return await db.prepare('SELECT * FROM kyc_requests WHERE provider_ref = ?').bind(providerRef).first()
}
