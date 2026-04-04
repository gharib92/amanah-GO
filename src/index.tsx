import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { jwt } from 'hono/jwt'
import { sign, verify } from 'hono/jwt'
import * as bcrypt from 'bcryptjs'
import Stripe from 'stripe'
import './styles.css' // Import Tailwind CSS
import { renderVerifyProfilePage } from './views/verify-profile.view'
import { DatabaseService, generateId } from './db.service'
import { compareFaces, type AWSCredentials } from './aws-rekognition.service'
import { handleError, ErrorCodes, unauthorizedError, createErrorResponse } from './error.service'

// ==========================================
// CONSTANTS
// ==========================================
const JWT_EXPIRATION_DAYS = 30 // Token validity period in days
const JWT_EXPIRATION_SECONDS = 60 * 60 * 24 * JWT_EXPIRATION_DAYS

// Types pour le contexte avec user authentifié et DB
type Variables = {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  }
  db: DatabaseService;
}

// ==========================================
// IN-MEMORY DATABASE (pour développement)
// ==========================================
// ✅ MIGRATION D1: inMemoryDB supprimé - Toutes les données sont maintenant dans D1
// Les données de test sont créées via les scripts de migration SQL

// Liste d'aéroports populaires France ↔ Maroc
const AIRPORTS = [
  { id: 1, iata_code: 'CDG', name: 'Aéroport Charles de Gaulle', city: 'Paris', country: 'France', latitude: 49.0097, longitude: 2.5479, active: 1 },
  { id: 2, iata_code: 'ORY', name: 'Aéroport d\'Orly', city: 'Paris', country: 'France', latitude: 48.7233, longitude: 2.3794, active: 1 },
  { id: 3, iata_code: 'CMN', name: 'Aéroport Mohammed V', city: 'Casablanca', country: 'Maroc', latitude: 33.3675, longitude: -7.5898, active: 1 },
  { id: 4, iata_code: 'RAK', name: 'Aéroport Marrakech Menara', city: 'Marrakech', country: 'Maroc', latitude: 31.6069, longitude: -8.0363, active: 1 },
  { id: 5, iata_code: 'FEZ', name: 'Aéroport Fès-Saïss', city: 'Fès', country: 'Maroc', latitude: 33.9273, longitude: -4.9780, active: 1 },
  { id: 6, iata_code: 'TNG', name: 'Aéroport Tanger Ibn Battouta', city: 'Tanger', country: 'Maroc', latitude: 35.7269, longitude: -5.9169, active: 1 },
  { id: 7, iata_code: 'AGA', name: 'Aéroport Agadir Al Massira', city: 'Agadir', country: 'Maroc', latitude: 30.3250, longitude: -9.4131, active: 1 },
  { id: 8, iata_code: 'MRS', name: 'Aéroport Marseille Provence', city: 'Marseille', country: 'France', latitude: 43.4394, longitude: 5.2214, active: 1 },
  { id: 9, iata_code: 'LYS', name: 'Aéroport Lyon-Saint Exupéry', city: 'Lyon', country: 'France', latitude: 45.7256, longitude: 5.0811, active: 1 },
  { id: 10, iata_code: 'NCE', name: 'Aéroport Nice Côte d\'Azur', city: 'Nice', country: 'France', latitude: 43.6584, longitude: 7.2159, active: 1 },
  { id: 11, iata_code: 'TLS', name: 'Aéroport Toulouse-Blagnac', city: 'Toulouse', country: 'France', latitude: 43.6291, longitude: 1.3638, active: 1 },
  { id: 12, iata_code: 'NTE', name: 'Aéroport Nantes Atlantique', city: 'Nantes', country: 'France', latitude: 47.1532, longitude: -1.6108, active: 1 },
  { id: 13, iata_code: 'BOD', name: 'Aéroport Bordeaux-Mérignac', city: 'Bordeaux', country: 'France', latitude: 44.8283, longitude: -0.7156, active: 1 }
]

const app = new Hono<{ Variables: Variables }>()

// Middleware: Initialize DB for all requests
app.use('*', async (c, next) => {
  if (c.env?.DB) {
    c.set('db', new DatabaseService(c.env.DB))
  }
  await next()
})

// Initialisation Stripe
let stripe: Stripe | null = null
// Mode MOCK pour Stripe (dev sans vraie clé)
const STRIPE_MOCK_MODE = false// Activer pour tester sans vraie clé Stripe

function getStripe(c: any): Stripe | null {
  if (STRIPE_MOCK_MODE) {
    console.log('⚠️  STRIPE MOCK MODE ENABLED - Using simulated Stripe responses')
    return null // Retourne null pour déclencher les mocks dans les routes
  }
  
  if (!stripe) {
    // En dev, utiliser une clé de test par défaut si env non disponible
    const stripeKey = c.env?.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY
    if (!stripeKey) {
      console.warn('STRIPE_SECRET_KEY is not configured - Stripe features will be disabled')
      return null
    }
    stripe = new Stripe(stripeKey, {
      apiVersion: '2025-12-15.clover',
    })
    console.log('✅ Stripe initialized with key:', stripeKey.substring(0, 15) + '...')
  }
  return stripe
}

// ==========================================
// CLOUDFLARE AI - Helpers
// ==========================================

/**
 * Calcule la similarité cosine entre deux vecteurs (embeddings)
 * Retourne une valeur entre 0 (différent) et 1 (identique)
 */
function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) {
    return 0
  }
  
  if (vecA.length !== vecB.length) {
    console.error('⚠️ Vecteurs de tailles différentes:', vecA.length, 'vs', vecB.length)
    return 0
  }
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }
  
  const magnitude = Math.sqrt(normA) * Math.sqrt(normB)
  
  if (magnitude === 0) {
    return 0
  }
  
  const similarity = dotProduct / magnitude
  
  // Normaliser entre 0 et 1
  return Math.max(0, Math.min(1, similarity))
}

// ==========================================
// EMAIL TEMPLATES
// ==========================================

const EmailTemplates = {
  baseTemplate: (content: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 Amanah GO</h1>
          <p>Transport Collaboratif France ↔ Maroc</p>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>© 2025 Amanah GO</p>
        </div>
      </div>
    </body>
    </html>
  `,

  welcome: (userName: string) => EmailTemplates.baseTemplate(`
    <h2>👋 Bienvenue ${userName} !</h2>
    <p>Merci de rejoindre <strong>Amanah GO</strong> !</p>
    <h3>🎯 Prochaines étapes :</h3>
    <ol>
      <li>✅ Compte créé</li>
      <li>🔐 Vérifiez votre identité (KYC)</li>
      <li>📦 Publiez votre premier trajet</li>
    </ol>
  `),

  kycVerified: (userName: string) => EmailTemplates.baseTemplate(`
    <h2>✅ Identité vérifiée !</h2>
    <p>Bonjour ${userName},</p>
    <p>Votre identité a été <strong>vérifiée avec succès</strong> !</p>
    <div style="background: #10b981; color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
      <div style="font-size: 48px;">✓</div>
      <h3>Compte Vérifié</h3>
    </div>
    <p>Vous êtes maintenant prêt à voyager en toute confiance ! 🚀</p>
  `),

  kycApproved: (userName: string) => EmailTemplates.baseTemplate(`
    <h2>✅ Votre profil est vérifié !</h2>
    <p>Bonjour ${userName},</p>
    <p>Excellente nouvelle ! Votre vérification d'identité (KYC) a été <strong>approuvée par notre équipe</strong>.</p>
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 25px; border-radius: 12px; text-align: center; margin: 25px 0;">
      <div style="font-size: 60px; margin-bottom: 10px;">✓</div>
      <h3 style="margin: 0; font-size: 24px;">Profil Vérifié</h3>
      <p style="margin: 10px 0 0; opacity: 0.9;">Vous pouvez maintenant utiliser toutes les fonctionnalités</p>
    </div>
    <h3>🎉 Ce que vous pouvez faire maintenant :</h3>
    <ul>
      <li>✈️ <strong>Publier des trajets</strong> et transporter des colis</li>
      <li>📦 <strong>Publier des colis</strong> et trouver des voyageurs</li>
      <li>💰 <strong>Recevoir des paiements</strong> sécurisés via Stripe</li>
      <li>💬 <strong>Communiquer</strong> avec les autres utilisateurs</li>
      <li>⭐ <strong>Recevoir des avis</strong> et construire votre réputation</li>
    </ul>
    <div style="text-align: center; margin-top: 30px;">
      <a href="https://amanah-go.com/voyageur" class="button" style="display: inline-block; padding: 14px 32px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
        Accéder à mon dashboard
      </a>
    </div>
    <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
      Merci de votre confiance ! L'équipe Amanah GO
    </p>
  `),

  kycRejected: (userName: string, reason: string) => EmailTemplates.baseTemplate(`
    <h2>⚠️ Vérification d'identité refusée</h2>
    <p>Bonjour ${userName},</p>
    <p>Nous avons examiné votre demande de vérification d'identité, mais nous ne pouvons pas l'approuver pour le moment.</p>
    <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #dc2626; margin: 0 0 10px;">❌ Raison du refus :</h3>
      <p style="margin: 0; color: #991b1b;">${reason || 'Documents non conformes'}</p>
    </div>
    <h3>📝 Comment procéder ?</h3>
    <ol>
      <li>Vérifiez que vos documents sont <strong>lisibles et à jour</strong></li>
      <li>Assurez-vous que votre <strong>selfie est net</strong> et montre clairement votre visage</li>
      <li>Votre photo d'identité doit correspondre à votre selfie</li>
      <li>Soumettez à nouveau vos documents depuis votre profil</li>
    </ol>
    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #1e40af;">
        <strong>💡 Astuce :</strong> Prenez vos photos dans un endroit bien éclairé et assurez-vous qu'il n'y a pas de reflets.
      </p>
    </div>
    <div style="text-align: center; margin-top: 30px;">
      <a href="https://amanah-go.com/verify-profile" class="button" style="display: inline-block; padding: 14px 32px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
        Soumettre à nouveau
      </a>
    </div>
    <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
      Besoin d'aide ? Contactez-nous à <a href="mailto:support@amanah-go.com" style="color: #667eea;">support@amanah-go.com</a>
    </p>
  `),

  emailVerification: (userName: string, code: string) => EmailTemplates.baseTemplate(`
    <h2>📧 Vérification de votre email</h2>
    <p>Bonjour ${userName},</p>
    <p>Votre code de vérification pour <strong>Amanah GO</strong> est :</p>
    <div style="background: #667eea; color: white; padding: 30px; border-radius: 10px; text-align: center; margin: 30px 0; font-size: 32px; font-weight: bold; letter-spacing: 8px;">
      ${code}
    </div>
    <p><strong>⏱️ Ce code expire dans 10 minutes.</strong></p>
    <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
  `)
}

// ==========================================
// EMAIL SENDING - Resend API
// ==========================================

/**
 * Envoyer un email via Resend
 * @param to - Email destinataire
 * @param subject - Sujet de l'email
 * @param html - Contenu HTML de l'email
 * @param resendApiKey - Clé API Resend (optionnel)
 */
async function sendEmail(to: string, subject: string, html: string, resendApiKey?: string): Promise<boolean> {
  try {
    // Mode DEV sans Resend (simulation)
    if (!resendApiKey) {
      console.log('📧 [MOCK] Email envoyé à:', to)
      console.log('📧 [MOCK] Sujet:', subject)
      console.log('📧 [MOCK] Contenu:', html.substring(0, 100) + '...')
      return true
    }
    
    // Mode production avec Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Amanah GO <noreply@amanah-go.com>',
        to: [to],
        subject: subject,
        html: html
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Erreur Resend:', error)
      return false
    }
    
    const data = await response.json()
    console.log('✅ Email envoyé:', data.id)
    return true
    
  } catch (error) {
    console.error('❌ Erreur envoi email:', error)
    return false
  }
}

// JWT Secret - DOIT être configuré via variable d'environnement en production
const JWT_SECRET_DEFAULT = 'amanah-go-secret-key-change-in-production'
const JWT_EXPIRATION = '7d' // 7 jours

// Helper pour obtenir le JWT secret de manière sécurisée
function getJWTSecret(env: any): string {
  const secret = env?.JWT_SECRET || JWT_SECRET_DEFAULT
  
  // 🚨 SÉCURITÉ : Avertir si la clé par défaut est utilisée
  if (secret === JWT_SECRET_DEFAULT) {
    console.warn('⚠️  SECURITY WARNING: Using default JWT_SECRET! Set JWT_SECRET environment variable in production.')
  }
  
  // Valider que la clé est suffisamment forte (minimum 32 caractères)
  if (secret.length < 32) {
    console.error('🔴 CRITICAL: JWT_SECRET is too short! Minimum 32 characters required.')
  }
  
  return secret
}

// Middleware JWT pour routes protégées
const authMiddleware = async (c: any, next: any) => {
  try {
    const authHeader = c.req.header('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const { response, status } = unauthorizedError('Token manquant')
      return c.json(response, status)
    }
    
    const token = authHeader.substring(7)
    const secret = getJWTSecret(c.env)
    
    const payload: any = await verify(token, secret)
    
    if (!payload || !payload.id) {
      const { response, status } = createErrorResponse(
        'Token invalide',
        ErrorCodes.AUTH_TOKEN_INVALID,
        null,
        401
      )
      return c.json(response, status)
    }
    
    // ✅ MIGRATION D1: Charger les infos user depuis D1
    const db = c.get('db') as DatabaseService
    // Normaliser l'ID: enlever les tirets si présents (JWT peut avoir tirets, D1 non)
    const normalizedId = payload.id.replace(/-/g, '')
    const userResult = await db.getUserById(normalizedId)
    
    if (!userResult) {
      const { response, status } = createErrorResponse(
        'Utilisateur non trouvé',
        ErrorCodes.AUTH_USER_NOT_FOUND,
        null,
        401
      )
      return c.json(response, status)
    }
    
    // Stocker user dans le contexte
    c.set('user', {
      id: userResult.id,
      email: userResult.email,
      name: userResult.name,
      phone: userResult.phone,
      kyc_status: userResult.kyc_status,
      role: 'user'
    })
    
    await next()
  } catch (error: any) {
    return handleError(error, 'AuthMiddleware', c)
  }
}

// ==========================================
// 🔥 FIREBASE AUTH MIDDLEWARE
// ==========================================
const firebaseAuthMiddleware = async (c: any, next: any) => {
  try {
    const authHeader = c.req.header('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Token manquant' }, 401)
    }
    
    const idToken = authHeader.substring(7)
    
    // Vérifier le token Firebase avec l'API REST (pas besoin de firebase-admin en Workers)
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyCtz79Y0HLOuTibmaoeJm-w0dzkpY18aiQ`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      }
    )
    
    if (!response.ok) {
      console.error('Firebase token verification failed')
      return c.json({ error: 'Token Firebase invalide' }, 401)
    }
    
    const data: any = await response.json()
    const firebaseUser = data.users?.[0]
    
    if (!firebaseUser) {
      return c.json({ error: 'Utilisateur Firebase non trouvé' }, 401)
    }
    
    console.log('✅ Firebase token verified:', firebaseUser.email)
    
    // Récupérer l'utilisateur dans notre DB par Firebase UID
    const db = c.get('db') as DatabaseService
    const userResult = await db.getUserByFirebaseUid(firebaseUser.localId)
    
    if (!userResult) {
      return c.json({ error: 'Utilisateur non trouvé dans la base de données' }, 401)
    }
    
    // Stocker user dans le contexte
    c.set('user', {
      id: userResult.id,
      firebaseUid: firebaseUser.localId,
      email: userResult.email,
      name: userResult.name,
      phone: userResult.phone,
      kyc_status: userResult.kyc_status,
      emailVerified: firebaseUser.emailVerified === 'true',
      role: 'user'
    })
    
    await next()
  } catch (error: any) {
    console.error('Firebase auth middleware error:', error)
    return c.json({ error: 'Token Firebase invalide ou expiré' }, 401)
  }
}

// 🔥 FIREBASE TOKEN VERIFICATION ONLY (pour signup)
// Ne vérifie QUE le token Firebase, sans chercher l'user dans D1
const firebaseTokenOnly = async (c: any, next: any) => {
  try {
    const authHeader = c.req.header('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Token manquant' }, 401)
    }
    
    const idToken = authHeader.substring(7)
    
    // Vérifier le token Firebase
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyCtz79Y0HLOuTibmaoeJm-w0dzkpY18aiQ`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      }
    )
    
    if (!response.ok) {
      console.error('Firebase token verification failed')
      return c.json({ error: 'Token Firebase invalide' }, 401)
    }
    
    const data: any = await response.json()
    const firebaseUser = data.users?.[0]
    
    if (!firebaseUser) {
      return c.json({ error: 'Utilisateur Firebase non trouvé' }, 401)
    }
    
    console.log('✅ Firebase token verified (token only):', firebaseUser.email)
    
    // Stocker les infos Firebase dans le contexte (SANS chercher dans D1)
    c.set('firebaseUser', {
      uid: firebaseUser.localId,
      email: firebaseUser.email,
      emailVerified: firebaseUser.emailVerified === 'true'
    })
    
    await next()
  } catch (error: any) {
    console.error('Firebase token verification error:', error)
    return c.json({ error: 'Token Firebase invalide' }, 401)
  }
}

// Enable CORS pour API
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Serve PWA manifest
app.get('/manifest.json', (c) => {
  return c.json({
    name: "Amanah GO - Transport Collaboratif France ↔ Maroc",
    short_name: "Amanah GO",
    description: "Plateforme de transport collaboratif de colis entre la France et le Maroc. Voyagez malin, envoyez futé !",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    orientation: "portrait-primary",
    scope: "/",
    icons: [
      { src: "/static/icons/icon-72x72.png", sizes: "72x72", type: "image/png", purpose: "any maskable" },
      { src: "/static/icons/icon-96x96.png", sizes: "96x96", type: "image/png", purpose: "any maskable" },
      { src: "/static/icons/icon-128x128.png", sizes: "128x128", type: "image/png", purpose: "any maskable" },
      { src: "/static/icons/icon-144x144.png", sizes: "144x144", type: "image/png", purpose: "any maskable" },
      { src: "/static/icons/icon-152x152.png", sizes: "152x152", type: "image/png", purpose: "any maskable" },
      { src: "/static/icons/icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
      { src: "/static/icons/icon-384x384.png", sizes: "384x384", type: "image/png", purpose: "any maskable" },
      { src: "/static/icons/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
    ],
    categories: ["travel", "business", "logistics"],
    lang: "fr",
    dir: "auto",
    prefer_related_applications: false,
    shortcuts: [
      { name: "Publier un trajet", short_name: "Trajet", description: "Publier un nouveau trajet", url: "/voyageur/publier-trajet", icons: [{ src: "/static/icons/icon-192x192.png", sizes: "192x192" }] },
      { name: "Publier un colis", short_name: "Colis", description: "Publier un nouveau colis", url: "/expediteur/publier-colis", icons: [{ src: "/static/icons/icon-192x192.png", sizes: "192x192" }] },
      { name: "Rechercher", short_name: "Recherche", description: "Rechercher un trajet ou colis", url: "/search", icons: [{ src: "/static/icons/icon-192x192.png", sizes: "192x192" }] }
    ]
  })
})

// Serve Service Worker
app.get('/sw.js', (c) => {
  const swContent = `// Service Worker pour Amanah GO PWA
const CACHE_NAME = 'amanah-go-v1';
const RUNTIME_CACHE = 'amanah-go-runtime';

const PRECACHE_URLS = [
  '/',
  '/voyageur',
  '/expediteur',
  '/search',
  '/static/i18n.js',
  '/static/lang-switcher.js',
  '/static/locales/fr.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});`;
  
  return c.text(swContent, 200, {
    'Content-Type': 'application/javascript',
    'Service-Worker-Allowed': '/'
  })
})

// ==========================================
// SEO ROUTES - robots.txt & sitemap.xml
// ==========================================

// Serve robots.txt
app.get('/robots.txt', (c) => {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /verify-profile
Disallow: /voyageur/stripe-connect

Sitemap: https://amanah-go.com/sitemap.xml

# Crawl-delay
Crawl-delay: 10

# Specific bots
User-agent: Googlebot
Allow: /

User-agent: bingbot
Allow: /

User-agent: Slurp
Allow: /`
  
  return c.text(robotsTxt, 200, {
    'Content-Type': 'text/plain'
  })
})

// Serve sitemap.xml
app.get('/sitemap.xml', (c) => {
  const baseUrl = 'https://amanah-go.com'
  const currentDate = new Date().toISOString().split('T')[0]
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  
  <!-- Page d'accueil -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Connexion / Inscription -->
  <url>
    <loc>${baseUrl}/login</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/signup</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Dashboards -->
  <url>
    <loc>${baseUrl}/voyageur</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/expediteur</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Publication -->
  <url>
    <loc>${baseUrl}/voyageur/publier-trajet</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/expediteur/publier-colis</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Liste -->
  <url>
    <loc>${baseUrl}/voyageur/mes-trajets</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/expediteur/mes-colis</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- Recherche & Matching -->
  <url>
    <loc>${baseUrl}/search</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Produits interdits -->
  <url>
    <loc>${baseUrl}/prohibited-items</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

</urlset>`
  
  return c.text(sitemap, 200, {
    'Content-Type': 'application/xml'
  })
})

// ==========================================
// TEST I18N
// ==========================================
app.get('/test-i18n', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test i18n - Amanah GO</title>
        <link href="/static/tailwind.css" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/i18n.css?v=3" rel="stylesheet">
    </head>
    <body class="bg-gray-50 min-h-screen">
        <!-- Header -->
        <nav class="bg-white shadow-sm border-b sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-16 w-auto">
                    <span class="text-2xl font-bold text-gray-900">Amanah GO</span>
                </div>
                <div class="flex items-center space-x-4">
                    <div id="langSwitcher"></div>
                    <a href="/" class="text-blue-600 hover:text-blue-700">
                        <i class="fas fa-home mr-2"></i><span data-i18n="common.home">Accueil</span>
                    </a>
                </div>
            </div>
        </nav>

        <div class="max-w-4xl mx-auto px-4 py-12">
            <!-- Test Section -->
            <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-4">
                    <i class="fas fa-language text-blue-600 mr-3"></i>
                    Test Multi-langue (i18n)
                </h1>
                <p class="text-gray-600 mb-6">
                    Testez le système de traduction en changeant la langue via le menu en haut à droite.
                </p>

                <!-- Common translations -->
                <div class="space-y-4">
                    <div class="border-b pb-4">
                        <h3 class="font-semibold text-lg mb-3">Common</h3>
                        <div class="grid grid-cols-2 gap-3">
                            <div><span class="font-medium">Login:</span> <span data-i18n="common.login"></span></div>
                            <div><span class="font-medium">Signup:</span> <span data-i18n="common.signup"></span></div>
                            <div><span class="font-medium">Loading:</span> <span data-i18n="common.loading"></span></div>
                            <div><span class="font-medium">Search:</span> <span data-i18n="common.search"></span></div>
                        </div>
                    </div>

                    <!-- Nav translations -->
                    <div class="border-b pb-4">
                        <h3 class="font-semibold text-lg mb-3">Navigation</h3>
                        <div class="grid grid-cols-2 gap-3">
                            <div><span class="font-medium">How it works:</span> <span data-i18n="nav.how_it_works"></span></div>
                            <div><span class="font-medium">Security:</span> <span data-i18n="nav.security"></span></div>
                            <div><span class="font-medium">Pricing:</span> <span data-i18n="nav.pricing"></span></div>
                            <div><span class="font-medium">Traveler Space:</span> <span data-i18n="nav.traveler_space"></span></div>
                        </div>
                    </div>

                    <!-- Traveler translations -->
                    <div class="border-b pb-4">
                        <h3 class="font-semibold text-lg mb-3">Traveler Space</h3>
                        <div class="space-y-2">
                            <div><span class="font-medium">Welcome:</span> <span data-i18n="traveler.welcome"></span></div>
                            <div><span class="font-medium">Subtitle:</span> <span data-i18n="traveler.welcome_subtitle"></span></div>
                            <div><span class="font-medium">Publish Trip:</span> <span data-i18n="traveler.publish_trip"></span></div>
                            <div><span class="font-medium">My Trips:</span> <span data-i18n="traveler.my_trips"></span></div>
                        </div>
                    </div>

                    <!-- Sender translations -->
                    <div>
                        <h3 class="font-semibold text-lg mb-3">Sender Space</h3>
                        <div class="space-y-2">
                            <div><span class="font-medium">Welcome:</span> <span data-i18n="sender.welcome"></span></div>
                            <div><span class="font-medium">Subtitle:</span> <span data-i18n="sender.welcome_subtitle"></span></div>
                            <div><span class="font-medium">Publish Package:</span> <span data-i18n="sender.publish_package"></span></div>
                            <div><span class="font-medium">Search Trip:</span> <span data-i18n="sender.search_trip"></span></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Direction Test -->
            <div class="bg-white rounded-xl shadow-lg p-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">
                    <i class="fas fa-arrows-alt-h text-green-600 mr-3"></i>
                    Test RTL (Arabic)
                </h2>
                <p class="text-gray-600 mb-4">
                    Passez en arabe pour voir le layout s'inverser automatiquement (direction RTL).
                </p>
                <div class="flex items-center gap-4">
                    <div class="flex-1 p-4 bg-blue-50 rounded-lg">
                        <i class="fas fa-arrow-right mr-2"></i>
                        <span>LTR (Français/English)</span>
                    </div>
                    <div class="flex-1 p-4 bg-green-50 rounded-lg">
                        <i class="fas fa-arrow-left ml-2"></i>
                        <span>RTL (العربية)</span>
                    </div>
                </div>
            </div>
        </div>

        <script src="/static/auth.js"></script>
        <script src="/static/auth-ui.js"></script>
        <script src="/static/i18n.js?v=3"></script>
        <script>
          // Language Switcher Component (inline for immediate availability)
          function createLanguageSwitcher() {
            const currentLang = window.i18n?.getCurrentLang() || 'fr'
            const languages = [
              { code: 'fr', name: 'Français', flag: '🇫🇷' },
              { code: 'ar', name: 'العربية', flag: '🇲🇦' },
              { code: 'en', name: 'English', flag: '🇬🇧' }
            ]
            
            const current = languages.find(l => l.code === currentLang) || languages[0]
            
            return \`
              <div class="lang-switcher">
                <button class="lang-switcher-minimal" id="langSwitcherBtn" title="\${current.name}">
                  <span class="lang-flag-only">\${current.flag}</span>
                </button>
                
                <div class="lang-switcher-dropdown" id="langDropdown">
                  \${languages.map(lang => \`
                    <div class="lang-option \${lang.code === currentLang ? 'active' : ''}" 
                         data-lang="\${lang.code}">
                      <span class="lang-flag">\${lang.flag}</span>
                      <span>\${lang.name}</span>
                      \${lang.code === currentLang ? '<i class="fas fa-check ml-auto text-blue-600"></i>' : ''}
                    </div>
                  \`).join('')}
                </div>
              </div>
            \`
          }
          
          function attachLanguageSwitcherEvents(container) {
            // Attach click event to the button
            const btn = container.querySelector('#langSwitcherBtn')
            if (btn) {
              btn.addEventListener('click', (e) => {
                e.stopPropagation()
                toggleLangDropdown()
              })
            }
            
            // Attach click events to language options
            const options = container.querySelectorAll('.lang-option')
            options.forEach(option => {
              option.addEventListener('click', () => {
                const lang = option.getAttribute('data-lang')
                if (lang) switchLanguage(lang)
              })
            })
          }
          
          function toggleLangDropdown() {
            const dropdowns = document.querySelectorAll('#langDropdown')
            dropdowns.forEach(dropdown => {
              dropdown.classList.toggle('show')
            })
          }
          
          function switchLanguage(lang) {
            if (window.i18n) {
              window.i18n.setLanguage(lang)
            }
          }
          
          // Close dropdown when clicking outside
          document.addEventListener('click', function(event) {
            const switcher = document.querySelector('.lang-switcher')
            const dropdown = document.getElementById('langDropdown')
            
            if (switcher && dropdown && !switcher.contains(event.target)) {
              dropdown.classList.remove('show')
            }
          })
        </script>
        <script>
          // Wait for i18n to load
          window.addEventListener('DOMContentLoaded', async () => {
            // Initialize i18n first
            await window.i18n.init()
            
            // Inject language switcher for both desktop and mobile
            const switcher = createLanguageSwitcher()
            const desktopSwitcher = document.getElementById('langSwitcher')
            const mobileSwitcher = document.getElementById('langSwitcherMobile')
            
            if (desktopSwitcher) {
              desktopSwitcher.innerHTML = switcher
              attachLanguageSwitcherEvents(desktopSwitcher)
            }
            if (mobileSwitcher) {
              mobileSwitcher.innerHTML = switcher
              attachLanguageSwitcherEvents(mobileSwitcher)
            }
            
            // Apply translations to all elements with data-i18n attribute
            applyTranslations()
          })

          function applyTranslations() {
            document.querySelectorAll('[data-i18n]').forEach(el => {
              const key = el.getAttribute('data-i18n')
              el.textContent = window.t(key)
            })
          }
        </script>
    </body>
    </html>
  `)
})

// ==========================================
// LANDING PAGE
// ==========================================
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Amanah GO - Transport Collaboratif France ↔ Maroc | Envoi Colis Pas Cher</title>
        
        <!-- SEO Meta Tags -->
        <meta name="description" content="🚀 Transportez vos colis entre la France et le Maroc avec Amanah GO. Économisez jusqu'à 70% sur l'envoi de colis. Plateforme sécurisée de transport collaboratif peer-to-peer.">
        <meta name="keywords" content="transport colis france maroc, envoi colis maroc, transport collaboratif, amanah go, colis pas cher maroc, voyageur transporteur, expédition france maroc, MRE, diaspora marocaine">
        <meta name="author" content="Amanah GO">
        <meta name="robots" content="index, follow">
        <link rel="canonical" href="https://amanah-go.com/">
        
        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="https://amanah-go.com/">
        <meta property="og:title" content="Amanah GO - Transport Collaboratif France ↔ Maroc">
        <meta property="og:description" content="Économisez jusqu'à 70% sur vos envois de colis entre la France et le Maroc. Plateforme sécurisée de transport collaboratif.">
        <meta property="og:image" content="https://amanah-go.com/static/logo-amanah-go.png">
        <meta property="og:locale" content="fr_FR">
        <meta property="og:site_name" content="Amanah GO">
        
        <!-- Twitter Card -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:url" content="https://amanah-go.com/">
        <meta name="twitter:title" content="Amanah GO - Transport Collaboratif France ↔ Maroc">
        <meta name="twitter:description" content="Économisez jusqu'à 70% sur vos envois de colis entre la France et le Maroc">
        <meta name="twitter:image" content="https://amanah-go.com/static/logo-amanah-go.png">
        
        <!-- PWA Meta Tags -->
        <meta name="theme-color" content="#2563eb">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="Amanah GO">
        
        <!-- Manifest -->
        <link rel="manifest" href="/manifest.json">
        
        <!-- Icons -->
        <link rel="icon" type="image/svg+xml" href="/static/icons/icon.svg">
        <link rel="apple-touch-icon" href="/static/icons/icon-180x180.png">
        <link rel="icon" sizes="192x192" href="/static/icons/icon-192x192.png">
        <link rel="icon" sizes="512x512" href="/static/icons/icon-512x512.png">
        
        <!-- Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-XXXXXXXXXX', {
            'page_title': 'Home - Amanah GO',
            'page_location': window.location.href
          });
        </script>
        
        <!-- Structured Data / Schema.org -->
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Amanah GO",
          "description": "Plateforme de transport collaboratif de colis entre la France et le Maroc",
          "url": "https://amanah-go.com",
          "logo": "https://amanah-go.com/static/logo-amanah-go.png",
          "foundingDate": "2025",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "FR"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+33-XXX-XXX-XXX",
            "contactType": "customer service",
            "email": "contact@amanah-go.com",
            "availableLanguage": ["French", "Arabic", "English"]
          },
          "sameAs": [
            "https://facebook.com/amanahgo",
            "https://twitter.com/amanahgo",
            "https://instagram.com/amanahgo"
          ]
        }
        </script>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Amanah GO",
          "applicationCategory": "TravelApplication",
          "operatingSystem": "Web, iOS, Android",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "EUR"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "150"
          }
        }
        </script>
        
        <!-- Styles -->
        <link href="/static/tailwind.css" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/i18n.css?v=3" rel="stylesheet">
        <style>
          .gradient-bg {
            background: linear-gradient(135deg, #1E40AF 0%, #10B981 100%);
          }
          .card-hover {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .card-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <nav class="bg-white shadow-sm sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center py-3">
                    <!-- Logo -->
                    <div class="flex items-center space-x-2">
                        <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-10 sm:h-12 w-auto">
                        <span class="text-lg sm:text-xl font-bold text-gray-900">Amanah GO</span>
                    </div>
                    
                    <!-- Desktop Navigation -->
                    <div class="hidden lg:flex items-center space-x-6">
                        <a href="#comment-ca-marche" class="text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium" data-i18n="nav.how_it_works">Comment ça marche</a>
                        <a href="#securite" class="text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium" data-i18n="nav.security">Sécurité</a>
                        <a href="#tarifs" class="text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium" data-i18n="nav.pricing">Tarifs</a>
                        <a href="/prohibited-items" class="text-red-600 hover:text-red-700 transition-colors text-sm font-bold flex items-center" data-i18n="nav.prohibited_items">
                            <i class="fas fa-ban mr-1 text-xs"></i>Liste Noire
                        </a>
                    </div>
                    
                    <!-- Right Section: Language + Buttons -->
                    <div class="hidden sm:flex items-center space-x-2 sm:space-x-3">
                        <div id="langSwitcher" class="px-2"></div>
                        <button data-auth="login" onclick="window.location.href='/login'" class="text-blue-600 hover:text-blue-800 font-medium px-2 sm:px-3 py-1.5 text-sm rounded-lg hover:bg-blue-50 transition-colors">
                            <span data-i18n="common.login">Connexion</span>
                        </button>
                        <button data-auth="signup" onclick="window.location.href='/signup'" class="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-1.5 text-sm rounded-lg font-medium transition-colors shadow-sm">
                            <span data-i18n="common.signup">Inscription</span>
                        </button>
                        <div data-auth="user-menu" class="hidden items-center space-x-2">
                            <span class="text-gray-700">
                                <i class="fas fa-user-circle mr-1"></i>
                                <span data-auth="user-name"></span>
                            </span>
                            <button data-auth="logout" class="text-red-600 hover:text-red-700 font-medium px-2 py-1.5 text-sm rounded-lg hover:bg-red-50 transition-colors">
                                <i class="fas fa-sign-out-alt mr-1"></i>
                                <span data-i18n="common.logout">Déconnexion</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Mobile Menu Button -->
                    <button id="mobile-menu-btn" class="sm:hidden p-2 rounded-lg hover:bg-gray-100">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>
                
                <!-- Mobile Menu -->
                <div id="mobile-menu" class="hidden sm:hidden pb-4 border-t mt-2 pt-3">
                    <div class="flex flex-col space-y-3">
                        <div id="langSwitcherMobile" class="pb-2 border-b"></div>
                        <a href="#comment-ca-marche" class="text-gray-700 hover:text-blue-600 font-medium py-2" data-i18n="nav.how_it_works">Comment ça marche</a>
                        <a href="#securite" class="text-gray-700 hover:text-blue-600 font-medium py-2" data-i18n="nav.security">Sécurité</a>
                        <a href="#tarifs" class="text-gray-700 hover:text-blue-600 font-medium py-2" data-i18n="nav.pricing">Tarifs</a>
                        <a href="/prohibited-items" class="text-red-600 hover:text-red-700 font-bold py-2 flex items-center" data-i18n="nav.prohibited_items">
                            <i class="fas fa-ban mr-2"></i>Liste Noire
                        </a>
                        <div class="flex flex-col space-y-2 pt-2 border-t">
                            <button onclick="window.location.href='/login'" class="text-blue-600 hover:bg-blue-50 font-medium px-4 py-2 rounded-lg text-left">
                                <span data-i18n="common.login">Connexion</span>
                            </button>
                            <button onclick="window.location.href='/signup'" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
                                <span data-i18n="common.signup">Inscription</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
        
        <script>
            // Mobile menu toggle
            document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
                const menu = document.getElementById('mobile-menu');
                menu?.classList.toggle('hidden');
            });
        </script>

        <!-- Hero Section -->
        <section class="gradient-bg text-white py-20">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 class="text-5xl font-bold mb-6" data-i18n="landing.hero_title">
                    Voyagez Malin, Envoyez Futé
                </h1>
                <p class="text-xl mb-8 text-blue-100" data-i18n="landing.hero_subtitle">
                    La plateforme de confiance pour transporter vos colis entre la France et le Maroc
                </p>
                
                <!-- Double CTA -->
                <div class="flex flex-col md:flex-row justify-center gap-6 mb-12">
                    <div class="bg-white text-gray-900 rounded-xl p-8 card-hover cursor-pointer flex-1 max-w-md" onclick="window.location.href='/voyageur'">
                        <i class="fas fa-plane-departure text-blue-600 text-5xl mb-4"></i>
                        <h3 class="text-2xl font-bold mb-2" data-i18n="landing.cta_traveler_title">Je voyage</h3>
                        <p class="text-gray-600 mb-4" data-i18n="landing.cta_traveler_desc">Rentabilisez votre voyage en transportant des colis</p>
                        <button class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium w-full hover:bg-blue-700" data-i18n="landing.cta_traveler_button">
                            Publier mon voyage →
                        </button>
                    </div>
                    
                    <div class="bg-white text-gray-900 rounded-xl p-8 card-hover cursor-pointer flex-1 max-w-md" onclick="window.location.href='/expediteur'">
                        <i class="fas fa-box text-green-600 text-5xl mb-4"></i>
                        <h3 class="text-2xl font-bold mb-2" data-i18n="landing.cta_sender_title">J'envoie un colis</h3>
                        <p class="text-gray-600 mb-4" data-i18n="landing.cta_sender_desc">Économisez jusqu'à 70% sur vos envois</p>
                        <button class="bg-green-600 text-white px-6 py-3 rounded-lg font-medium w-full hover:bg-green-700" data-i18n="landing.cta_sender_button">
                            Publier mon colis →
                        </button>
                    </div>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    <div>
                        <div class="text-4xl font-bold">3.5M+</div>
                        <div class="text-blue-100" data-i18n="landing.stats_travelers">voyageurs/an</div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold">70%</div>
                        <div class="text-blue-100" data-i18n="landing.stats_savings">D'économies vs DHL</div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold">100%</div>
                        <div class="text-blue-100" data-i18n="landing.stats_security">Paiement sécurisé</div>
                    </div>
                </div>
                
                <!-- Quick OAuth Login Section -->
                <div class="mt-16 max-w-md mx-auto">
                    <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                        <h3 class="text-2xl font-bold text-white text-center mb-2">
                            Connexion rapide
                        </h3>
                        <p class="text-blue-100 text-center mb-6 text-sm">
                            Commencez en quelques secondes
                        </p>
                        
                        <div class="space-y-3">
                            <!-- Apple Sign In -->
                            <a href="/api/auth/apple"
                               class="w-full flex items-center justify-center px-6 py-3.5 bg-black hover:bg-gray-900 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg">
                                <i class="fab fa-apple text-white mr-3 text-2xl"></i>
                                <span class="font-semibold text-lg">Sign in with Apple</span>
                            </a>
                            
                            <!-- Google Sign In -->
                            <a href="/api/auth/google"
                               class="w-full flex items-center justify-center px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-800 rounded-xl transition-all transform hover:scale-105 shadow-lg">
                                <i class="fab fa-google text-red-500 mr-3 text-xl"></i>
                                <span class="font-semibold">Continuer avec Google</span>
                            </a>
                            
                            <!-- Facebook Sign In -->
                            <a href="/api/auth/facebook"
                               class="w-full flex items-center justify-center px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-800 rounded-xl transition-all transform hover:scale-105 shadow-lg">
                                <i class="fab fa-facebook text-blue-600 mr-3 text-xl"></i>
                                <span class="font-semibold">Continuer avec Facebook</span>
                            </a>
                        </div>
                        
                        <!-- Divider -->
                        <div class="relative my-6">
                            <div class="absolute inset-0 flex items-center">
                                <div class="w-full border-t border-white/30"></div>
                            </div>
                            <div class="relative flex justify-center text-sm">
                                <span class="px-3 bg-transparent text-blue-100">ou</span>
                            </div>
                        </div>
                        
                        <!-- Email/Password Login Link -->
                        <div class="text-center">
                            <a href="/login" class="text-white hover:text-blue-100 font-medium text-sm underline decoration-2 underline-offset-4">
                                Se connecter avec email / mot de passe
                            </a>
                        </div>
                        
                        <!-- Signup Link -->
                        <p class="mt-4 text-center text-sm text-blue-100">
                            Pas encore de compte ?
                            <a href="/signup" class="text-white hover:text-blue-100 font-bold underline decoration-2 underline-offset-4">
                                Créer un compte
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Calculateur de Prix -->
        <section class="py-16 bg-white">
            <div class="max-w-4xl mx-auto px-4">
                <h2 class="text-3xl font-bold text-center mb-8" data-i18n="landing.calculator_title">Calculez votre économie</h2>
                <div class="bg-gray-50 rounded-xl p-8 shadow-lg">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2" data-i18n="landing.calculator_weight_label">Poids du colis (kg)</label>
                            <input type="number" id="weight" value="10" min="1" max="50" 
                                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                   onchange="calculatePrice()">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2" data-i18n="landing.calculator_price_label">Prix par kg (€)</label>
                            <input type="number" id="pricePerKg" value="8" min="5" max="15" 
                                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                   onchange="calculatePrice()">
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg p-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="text-center border-r border-gray-200">
                                <div class="text-sm text-gray-600 mb-2" data-i18n="landing.calculator_amanah">Avec Amanah GO</div>
                                <div class="text-3xl font-bold text-green-600" id="amanahPrice">80 €</div>
                            </div>
                            <div class="text-center">
                                <div class="text-sm text-gray-600 mb-2" data-i18n="landing.calculator_dhl">DHL/Chronopost</div>
                                <div class="text-3xl font-bold text-gray-400" id="dhlPrice">280 €</div>
                                <div class="text-sm text-red-600 font-medium mt-2" id="savings">Vous économisez 200 € !</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Comment ça marche -->
        <section id="comment-ca-marche" class="py-16 bg-gray-50">
            <div class="max-w-7xl mx-auto px-4">
                <h2 class="text-3xl font-bold text-center mb-12" data-i18n="landing.how_it_works_title">Comment ça marche ?</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="text-center">
                        <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span class="text-2xl font-bold text-blue-600">1</span>
                        </div>
                        <h3 class="text-xl font-bold mb-2" data-i18n="landing.how_step1_title">Créez votre annonce</h3>
                        <p class="text-gray-600" data-i18n="landing.how_step1_desc">Voyageur : Publiez votre trajet. Expéditeur : Décrivez votre colis</p>
                    </div>
                    
                    <div class="text-center">
                        <div class="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span class="text-2xl font-bold text-green-600">2</span>
                        </div>
                        <h3 class="text-xl font-bold mb-2" data-i18n="landing.how_step2_title">Trouvez un match</h3>
                        <p class="text-gray-600" data-i18n="landing.how_step2_desc">Notre système intelligent vous connecte avec des profils vérifiés</p>
                    </div>
                    
                    <div class="text-center">
                        <div class="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span class="text-2xl font-bold text-orange-600">3</span>
                        </div>
                        <h3 class="text-xl font-bold mb-2" data-i18n="landing.how_step3_title">Livraison sécurisée</h3>
                        <p class="text-gray-600" data-i18n="landing.how_step3_desc">Paiement bloqué jusqu'à confirmation de livraison</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Sécurité -->
        <section id="securite" class="py-16 bg-white">
            <div class="max-w-7xl mx-auto px-4">
                <h2 class="text-3xl font-bold text-center mb-12" data-i18n="landing.security_title">Votre sécurité, notre priorité</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="text-center p-6">
                        <i class="fas fa-shield-alt text-blue-600 text-4xl mb-4"></i>
                        <h3 class="font-bold mb-2" data-i18n="landing.security_kyc_title">Vérification KYC</h3>
                        <p class="text-sm text-gray-600" data-i18n="landing.security_kyc_desc">Tous les utilisateurs vérifient leur identité</p>
                    </div>
                    
                    <div class="text-center p-6">
                        <i class="fas fa-lock text-green-600 text-4xl mb-4"></i>
                        <h3 class="font-bold mb-2" data-i18n="landing.security_escrow_title">Paiement Escrow</h3>
                        <p class="text-sm text-gray-600" data-i18n="landing.security_escrow_desc">Fonds sécurisés jusqu'à livraison</p>
                    </div>
                    
                    <div class="text-center p-6">
                        <i class="fas fa-star text-orange-600 text-4xl mb-4"></i>
                        <h3 class="font-bold mb-2" data-i18n="landing.security_rating_title">Système de notes</h3>
                        <p class="text-sm text-gray-600" data-i18n="landing.security_rating_desc">Avis vérifiés après chaque transaction</p>
                    </div>
                    
                    <div class="text-center p-6">
                        <i class="fas fa-ban text-red-600 text-4xl mb-4"></i>
                        <h3 class="font-bold mb-2" data-i18n="landing.security_blacklist_title">Liste noire</h3>
                        <p class="text-sm text-gray-600" data-i18n="landing.security_blacklist_desc">Produits interdits clairement affichés</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Final -->
        <section class="gradient-bg text-white py-16">
            <div class="max-w-4xl mx-auto px-4 text-center">
                <h2 class="text-3xl font-bold mb-4" data-i18n="landing.cta_final_title">Prêt à commencer ?</h2>
                <p class="text-xl mb-8 text-blue-100" data-i18n="landing.cta_final_subtitle">Rejoignez des milliers d'utilisateurs qui font confiance à Amanah GO</p>
                <button onclick="window.location.href='/signup'" class="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100" data-i18n="landing.cta_final_button">
                    Créer mon compte gratuitement
                </button>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-gray-900 text-white py-8">
            <div class="max-w-7xl mx-auto px-4 text-center">
                <div class="flex justify-center space-x-6 mb-4">
                    <a href="/mentions-legales" class="hover:text-blue-400" data-i18n="landing.footer_about">À propos</a>
                    <a href="/cgu" class="hover:text-blue-400" data-i18n="landing.footer_toc">CGU</a>
                    <a href="/confidentialite" class="hover:text-blue-400" data-i18n="landing.footer_privacy">Confidentialité</a>
                    <a href="mailto:contact@amanahgo.app" class="hover:text-blue-400" data-i18n="landing.footer_contact">Contact</a>
                </div>
                <p class="text-gray-400" data-i18n="landing.footer_copyright">© 2025 Amanah GO. Tous droits réservés.</p>
            </div>
        </footer>

        <script>
          function calculatePrice() {
            const weight = parseFloat(document.getElementById('weight').value) || 10;
            const pricePerKg = parseFloat(document.getElementById('pricePerKg').value) || 8;
            
            const amanahTotal = weight * pricePerKg;
            const dhlTotal = weight * 28; // Estimation DHL ~28€/kg
            const savings = dhlTotal - amanahTotal;
            
            document.getElementById('amanahPrice').textContent = Math.round(amanahTotal) + ' €';
            document.getElementById('dhlPrice').textContent = Math.round(dhlTotal) + ' €';
            
            // Use i18n for savings text
            const savingsText = window.t ? window.t('landing.calculator_savings').replace('{amount}', Math.round(savings)) : 'Vous économisez ' + Math.round(savings) + ' € !';
            document.getElementById('savings').textContent = savingsText;
          }
          
          // Initial calculation
          calculatePrice();
        </script>

        <script src="/static/auth.js"></script>
        <script src="/static/auth-ui.js"></script>
        <script src="/static/i18n.js?v=3"></script>
        <script>
          // Language Switcher Component (inline for immediate availability)
          function createLanguageSwitcher() {
            const currentLang = window.i18n?.getCurrentLang() || 'fr'
            const languages = [
              { code: 'fr', name: 'Français', flag: '🇫🇷' },
              { code: 'ar', name: 'العربية', flag: '🇲🇦' },
              { code: 'en', name: 'English', flag: '🇬🇧' }
            ]
            
            const current = languages.find(l => l.code === currentLang) || languages[0]
            
            return \`
              <div class="lang-switcher">
                <button class="lang-switcher-minimal" id="langSwitcherBtn" title="\${current.name}">
                  <span class="lang-flag-only">\${current.flag}</span>
                </button>
                
                <div class="lang-switcher-dropdown" id="langDropdown">
                  \${languages.map(lang => \`
                    <div class="lang-option \${lang.code === currentLang ? 'active' : ''}" 
                         data-lang="\${lang.code}">
                      <span class="lang-flag">\${lang.flag}</span>
                      <span>\${lang.name}</span>
                      \${lang.code === currentLang ? '<i class="fas fa-check ml-auto text-blue-600"></i>' : ''}
                    </div>
                  \`).join('')}
                </div>
              </div>
            \`
          }
          
          function attachLanguageSwitcherEvents(container) {
            // Attach click event to the button
            const btn = container.querySelector('#langSwitcherBtn')
            if (btn) {
              btn.addEventListener('click', (e) => {
                e.stopPropagation()
                toggleLangDropdown()
              })
            }
            
            // Attach click events to language options
            const options = container.querySelectorAll('.lang-option')
            options.forEach(option => {
              option.addEventListener('click', () => {
                const lang = option.getAttribute('data-lang')
                if (lang) switchLanguage(lang)
              })
            })
          }
          
          function toggleLangDropdown() {
            const dropdowns = document.querySelectorAll('#langDropdown')
            dropdowns.forEach(dropdown => {
              dropdown.classList.toggle('show')
            })
          }
          
          function switchLanguage(lang) {
            if (window.i18n) {
              window.i18n.setLanguage(lang)
            }
          }
          
          // Close dropdown when clicking outside
          document.addEventListener('click', function(event) {
            const switcher = document.querySelector('.lang-switcher')
            const dropdown = document.getElementById('langDropdown')
            
            if (switcher && dropdown && !switcher.contains(event.target)) {
              dropdown.classList.remove('show')
            }
          })
        </script>
        <script>
          // Initialize i18n and inject language switcher
          window.addEventListener('DOMContentLoaded', async () => {
            await window.i18n.init()
            
            // Inject language switcher for both desktop and mobile
            const switcher = createLanguageSwitcher()
            const desktopSwitcher = document.getElementById('langSwitcher')
            const mobileSwitcher = document.getElementById('langSwitcherMobile')
            
            if (desktopSwitcher) {
              desktopSwitcher.innerHTML = switcher
              attachLanguageSwitcherEvents(desktopSwitcher)
            }
            if (mobileSwitcher) {
              mobileSwitcher.innerHTML = switcher
              attachLanguageSwitcherEvents(mobileSwitcher)
            }
            
            // Apply translations
            document.querySelectorAll('[data-i18n]').forEach(el => {
              const key = el.getAttribute('data-i18n')
              el.textContent = window.t(key)
            })
            
            // Recalculate price after translations loaded (Landing page only)
            if (typeof calculatePrice === 'function') {
              calculatePrice()
            }
          })
        </script>
    </body>
    </html>
  `)
})

// ==========================================
// ADMIN DASHBOARD - Validation KYC
// ==========================================

app.get('/admin', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Dashboard - Amanah GO</title>
        <link href="/static/tailwind.css" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <nav class="bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-shield-alt text-3xl"></i>
                    <div>
                        <h1 class="text-xl font-bold">Admin Dashboard</h1>
                        <p class="text-sm text-purple-200">Validation KYC & Modération</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <span id="adminName" class="text-sm"></span>
                    <a href="/" class="hover:text-purple-200">
                        <i class="fas fa-home mr-1"></i> Accueil
                    </a>
                </div>
            </div>
        </nav>

        <!-- Stats Dashboard -->
        <div class="max-w-7xl mx-auto px-4 py-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <!-- Total Users -->
                <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-600 text-sm mb-1">Total Utilisateurs</p>
                            <p id="totalUsers" class="text-3xl font-bold text-gray-800">0</p>
                        </div>
                        <i class="fas fa-users text-4xl text-blue-500"></i>
                    </div>
                </div>

                <!-- Pending KYC -->
                <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-600 text-sm mb-1">KYC En Attente</p>
                            <p id="pendingKYC" class="text-3xl font-bold text-gray-800">0</p>
                        </div>
                        <i class="fas fa-clock text-4xl text-yellow-500"></i>
                    </div>
                </div>

                <!-- Verified Users -->
                <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-600 text-sm mb-1">Utilisateurs Vérifiés</p>
                            <p id="verifiedUsers" class="text-3xl font-bold text-gray-800">0</p>
                        </div>
                        <i class="fas fa-check-circle text-4xl text-green-500"></i>
                    </div>
                </div>

                <!-- Rejected KYC -->
                <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-600 text-sm mb-1">KYC Rejetés</p>
                            <p id="rejectedKYC" class="text-3xl font-bold text-gray-800">0</p>
                        </div>
                        <i class="fas fa-times-circle text-4xl text-red-500"></i>
                    </div>
                </div>
            </div>

            <!-- Tabs -->
            <div class="bg-white rounded-lg shadow-md mb-6">
                <div class="border-b border-gray-200">
                    <nav class="flex space-x-4 px-6">
                        <button onclick="switchTab('pending')" 
                                id="tab-pending"
                                class="tab-btn py-4 px-6 font-medium border-b-2 border-yellow-500 text-yellow-600">
                            <i class="fas fa-clock mr-2"></i>
                            KYC En Attente
                        </button>
                        <button onclick="switchTab('verified')" 
                                id="tab-verified"
                                class="tab-btn py-4 px-6 font-medium border-b-2 border-transparent text-gray-600 hover:text-gray-800">
                            <i class="fas fa-check-circle mr-2"></i>
                            Vérifiés
                        </button>
                        <button onclick="switchTab('rejected')" 
                                id="tab-rejected"
                                class="tab-btn py-4 px-6 font-medium border-b-2 border-transparent text-gray-600 hover:text-gray-800">
                            <i class="fas fa-times-circle mr-2"></i>
                            Rejetés
                        </button>
                        <button onclick="switchTab('all')" 
                                id="tab-all"
                                class="tab-btn py-4 px-6 font-medium border-b-2 border-transparent text-gray-600 hover:text-gray-800">
                            <i class="fas fa-list mr-2"></i>
                            Tous
                        </button>
                    </nav>
                </div>
            </div>

            <!-- Users List -->
            <div id="usersList" class="space-y-4">
                <!-- Users will be loaded here -->
            </div>
        </div>

        <!-- Modal KYC Validation -->
        <div id="kycModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
            <div class="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-id-card mr-2 text-purple-600"></i>
                        Validation KYC
                    </h2>
                    <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700 text-2xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div id="modalContent" class="p-6">
                    <!-- Content loaded dynamically -->
                </div>
            </div>
        </div>

        <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
        <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js"></script>
        <script src="/static/firebase-compat.js?v=3"></script>
        <script src="/static/admin-dashboard.js?v=4"></script>
    </body>
    </html>
  `)
})

// ==========================================
// API ROUTES
// ==========================================

// Health check
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    message: 'Amanah GO API is running',
    timestamp: new Date().toISOString()
  })
})

// Get users (test)
app.get('/api/users', async (c) => {
  const { DB } = c.env
  
  try {
    const { results } = await DB.prepare('SELECT id, email, name, kyc_status, rating, reviews_count FROM users').all()
    return c.json({ success: true, users: results })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get trips
app.get('/api/trips', async (c) => {
  const { DB } = c.env
  
  try {
    const { results } = await DB.prepare(`
      SELECT 
        t.*,
        u.name as traveler_name,
        u.rating as traveler_rating,
        u.kyc_status
      FROM trips t
      JOIN users u ON t.user_id = u.id
      WHERE t.status = 'ACTIVE'
      ORDER BY t.departure_date ASC
    `).all()
    
    return c.json({ success: true, trips: results })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get packages
app.get('/api/packages', async (c) => {
  const { DB } = c.env
  
  try {
    const { results } = await DB.prepare(`
      SELECT 
        p.*,
        u.name as shipper_name,
        u.rating as shipper_rating,
        u.kyc_status
      FROM packages p
      JOIN users u ON p.user_id = u.id
      WHERE p.status = 'PUBLISHED'
      ORDER BY p.created_at DESC
    `).all()
    
    return c.json({ success: true, packages: results })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ==========================================
// CHAT / MESSAGES API ROUTES
// ==========================================

// Envoyer un message
app.post('/api/messages', authMiddleware, async (c) => {
  try {
    const { DB } = c.env
    const user = c.get('user')
    const { receiver_id, exchange_id, message, message_type = 'TEXT' } = await c.req.json()
    
    if (!receiver_id || !message) {
      return c.json({ 
        success: false, 
        error: 'receiver_id et message sont requis' 
      }, 400)
    }
    
    // ✅ MIGRATION D1: Utiliser DatabaseService
    const db = c.get('db') as DatabaseService
    
    // Créer le message dans D1
    const newMessage = await db.createMessage({
      transaction_id: exchange_id || null,
      sender_id: user.id,
      receiver_id: Number(receiver_id),
      content: message,
      is_read: 0,
      created_at: new Date().toISOString()
    })
    
    console.log('💬 Message envoyé (D1):', newMessage.id)
    
    return c.json({
      success: true,
      message_data: newMessage
    })
    
  } catch (error) {
    console.error('Erreur envoi message:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Récupérer les messages d'une conversation
app.get('/api/messages/:userId', authMiddleware, async (c) => {
  try {
    const db = c.get('db') as DatabaseService
    const user = c.get('user')
    const otherUserId = c.req.param('userId')
    
    // ✅ MIGRATION D1: Utiliser DatabaseService
    const messages = await db.getConversationsBetween(user.id, otherUserId)
    
    return c.json({
      success: true,
      messages: messages
    })
    
  } catch (error) {
    console.error('Erreur récupération messages:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Marquer un message comme lu
app.put('/api/messages/:messageId/read', authMiddleware, async (c) => {
  try {
    const db = c.get('db') as DatabaseService
    const user = c.get('user')
    const messageId = c.req.param('messageId')
    
    // ✅ MIGRATION D1: Utiliser DatabaseService
    await db.markMessageAsRead(messageId)
    
    return c.json({ success: true })
    
  } catch (error) {
    console.error('Erreur marquage message lu:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Récupérer les conversations actives (liste des utilisateurs avec qui on a discuté)
app.get('/api/conversations', authMiddleware, async (c) => {
  try {
    const { DB } = c.env
    const user = c.get('user')
    
    // ✅ MIGRATION D1: Utiliser DB obligatoire
    if (!DB) {
      return c.json({ success: false, error: 'Database not available' }, 500)
    }
    
    // Récupérer les conversations depuis D1
    const conversations = await DB.prepare(`
      SELECT 
        CASE WHEN em.sender_id = ? THEN em.receiver_id ELSE em.sender_id END as user_id,
        u.name as user_name,
        u.avatar_url as user_avatar,
        em.message as last_message,
        em.created_at as last_message_at,
        (SELECT COUNT(*) FROM exchange_messages 
         WHERE receiver_id = ? AND sender_id = user_id AND read_at IS NULL) as unread_count
      FROM exchange_messages em
      INNER JOIN users u ON u.id = user_id
      WHERE em.sender_id = ? OR em.receiver_id = ?
      GROUP BY user_id
      ORDER BY em.created_at DESC
    `).bind(user.id, user.id, user.id, user.id).all()
    
    return c.json({
      success: true,
      conversations: conversations.results || []
    })
    
  } catch (error) {
    console.error('Erreur récupération conversations:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ==========================================
// REVIEWS / AVIS API ROUTES
// ==========================================

// Créer un avis (après une transaction)
app.post('/api/reviews', authMiddleware, async (c) => {
  try {
    const { DB } = c.env
    const user = c.get('user')
    const { reviewee_id, booking_id, rating, comment = '' } = await c.req.json()
    
    // Validation
    if (!reviewee_id || !rating) {
      return c.json({ 
        success: false, 
        error: 'reviewee_id et rating sont requis' 
      }, 400)
    }
    
    if (rating < 1 || rating > 5) {
      return c.json({ 
        success: false, 
        error: 'La note doit être entre 1 et 5' 
      }, 400)
    }
    
    // Vérifier qu'on ne s'auto-note pas
    if (user.id === Number(reviewee_id)) {
      return c.json({ 
        success: false, 
        error: 'Vous ne pouvez pas vous noter vous-même' 
      }, 400)
    }
    
    // ✅ MIGRATION D1: Utiliser DatabaseService
    const db = c.get('db') as DatabaseService
    
    // Créer la review dans D1 (elle gère automatiquement la mise à jour du rating)
    const newReview = await db.createReview({
      transaction_id: booking_id || null,
      reviewer_id: user.id,
      reviewed_id: Number(reviewee_id),
      rating: Number(rating),
      comment: comment,
      punctuality_rating: Number(rating),
      communication_rating: Number(rating),
      care_rating: Number(rating),
      created_at: new Date().toISOString()
    })
    
    console.log('⭐ Avis créé (D1):', newReview.id)
    
    return c.json({
      success: true,
      review: newReview
    })
    
  } catch (error) {
    console.error('Erreur création avis:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Récupérer les avis d'un utilisateur
app.get('/api/reviews/:userId', async (c) => {
  try {
    const db = c.get('db') as DatabaseService
    const userId = c.req.param('userId')
    
    // ✅ MIGRATION D1: Utiliser DatabaseService
    const reviews = await db.getReviewsByUserId(userId)
    
    // Enrichir avec les noms des reviewers
    const enrichedReviews = await Promise.all(
      reviews.map(async (review: any) => {
        const reviewer = await db.getUserById(review.reviewer_id)
        return {
          ...review,
          reviewer_name: reviewer?.name || 'Utilisateur',
          reviewer_avatar: reviewer?.avatar_url || null
        }
      })
    )
    
    return c.json({
      success: true,
      reviews: enrichedReviews
    })
    
  } catch (error) {
    console.error('Erreur récupération avis:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ✅ MIGRATION D1: Fonction updateUserRating supprimée - Gérée par DatabaseService.createReview()
// La mise à jour du rating est automatique lors de la création d'un avis

// ==========================================
// AIRPORTS API ROUTES
// ==========================================

// Search airports (autocomplete)
app.get('/api/airports/search', async (c) => {
  const query = (c.req.query('q') || '').toLowerCase()
  
  if (query.length < 2) {
    return c.json({ success: true, airports: [] })
  }
  
  try {
    // Filtrer les aéroports selon la requête
    const results = AIRPORTS.filter(airport => {
      return (
        airport.city.toLowerCase().includes(query) ||
        airport.name.toLowerCase().includes(query) ||
        airport.iata_code.toLowerCase().includes(query) ||
        airport.country.toLowerCase().includes(query)
      )
    })
    .sort((a, b) => {
      // Priorité : ville commence par query > code commence par query > autres
      const aStartsCity = a.city.toLowerCase().startsWith(query)
      const bStartsCity = b.city.toLowerCase().startsWith(query)
      const aStartsCode = a.iata_code.toLowerCase().startsWith(query)
      const bStartsCode = b.iata_code.toLowerCase().startsWith(query)
      
      if (aStartsCity && !bStartsCity) return -1
      if (!aStartsCity && bStartsCity) return 1
      if (aStartsCode && !bStartsCode) return -1
      if (!aStartsCode && bStartsCode) return 1
      
      return a.city.localeCompare(b.city)
    })
    .slice(0, 10) // Limiter à 10 résultats
    
    return c.json({ success: true, airports: results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get airport by IATA code
app.get('/api/airports/:iata', async (c) => {
  const { DB } = c.env
  const iata = c.req.param('iata').toUpperCase()
  
  try {
    const airport = await DB.prepare(`
      SELECT *
      FROM airports
      WHERE iata_code = ? AND active = 1
    `).bind(iata).first()
    
    if (!airport) {
      return c.json({ success: false, error: 'Aéroport non trouvé' }, 404)
    }
    
    return c.json({ success: true, airport })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get all airports (pour populate les dropdowns)
app.get('/api/airports', async (c) => {
  const { DB } = c.env
  const country = c.req.query('country') // 'France' ou 'Maroc'
  
  try {
    let query = 'SELECT id, iata_code, name, city, country FROM airports WHERE active = 1'
    let params = []
    
    if (country) {
      query += ' AND country = ?'
      params.push(country)
    }
    
    query += ' ORDER BY city ASC'
    
    const { results } = await DB.prepare(query).bind(...params).all()
    return c.json({ success: true, airports: results })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ==========================================
// FLIGHTS API ROUTES
// ==========================================

// Search flights (mock pour MVP - à remplacer par AviationStack)
app.get('/api/flights/search', async (c) => {
  const from = c.req.query('from')
  const to = c.req.query('to')
  const date = c.req.query('date')
  
  if (!from || !to || !date) {
    return c.json({ 
      success: false, 
      error: 'Paramètres requis: from, to, date (YYYY-MM-DD)' 
    }, 400)
  }
  
  // TODO: Intégrer AviationStack API ici
  // Pour le MVP, on retourne des données mockées
  const mockFlights = [
    {
      flight_number: 'AT789',
      airline: 'Air Arabia',
      airline_iata: 'AT',
      departure: {
        airport: from,
        time: `${date}T08:30:00`,
        terminal: '2'
      },
      arrival: {
        airport: to,
        time: `${date}T11:45:00`,
        terminal: '1'
      },
      duration: '3h15',
      aircraft: 'A320',
      status: 'scheduled'
    },
    {
      flight_number: 'RAM456',
      airline: 'Royal Air Maroc',
      airline_iata: 'AT',
      departure: {
        airport: from,
        time: `${date}T14:20:00`,
        terminal: '2'
      },
      arrival: {
        airport: to,
        time: `${date}T17:35:00`,
        terminal: '1'
      },
      duration: '3h15',
      aircraft: 'B737',
      status: 'scheduled'
    },
    {
      flight_number: 'FR1234',
      airline: 'Ryanair',
      airline_iata: 'FR',
      departure: {
        airport: from,
        time: `${date}T19:10:00`,
        terminal: '3'
      },
      arrival: {
        airport: to,
        time: `${date}T22:25:00`,
        terminal: '1'
      },
      duration: '3h15',
      aircraft: 'B737',
      status: 'scheduled'
    }
  ]
  
  return c.json({ 
    success: true, 
    flights: mockFlights,
    note: 'Données simulées - AviationStack sera intégré en Phase 4'
  })
})

// Get flight by number (mock)
app.get('/api/flights/:flightNumber', async (c) => {
  const flightNumber = c.req.param('flightNumber').toUpperCase()
  
  // TODO: Intégrer AviationStack API ici
  const mockFlight = {
    flight_number: flightNumber,
    airline: 'Royal Air Maroc',
    airline_iata: 'AT',
    departure: {
      airport: 'CDG',
      city: 'Paris',
      time: '2025-12-25T14:20:00',
      terminal: '2'
    },
    arrival: {
      airport: 'CMN',
      city: 'Casablanca',
      time: '2025-12-25T17:35:00',
      terminal: '1'
    },
    duration: '3h15',
    aircraft: 'B737',
    status: 'scheduled'
  }
  
  return c.json({ 
    success: true, 
    flight: mockFlight,
    note: 'Données simulées - AviationStack sera intégré en Phase 4'
  })
})

// ==========================================
// PUSH NOTIFICATIONS API ROUTES
// ==========================================

// Stocker les subscriptions (en production, utiliser D1 ou KV)
const pushSubscriptions = new Map<string, any>()

// S'abonner aux push notifications
app.post('/api/push/subscribe', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const { subscription } = await c.req.json()
    
    if (!subscription || !subscription.endpoint) {
      return c.json({ 
        success: false, 
        error: 'Subscription invalide' 
      }, 400)
    }
    
    // Stocker la subscription
    pushSubscriptions.set(`user_${user.id}`, {
      userId: user.id,
      subscription,
      createdAt: new Date().toISOString()
    })
    
    console.log(`✅ Push subscription enregistrée pour user ${user.id}`)
    
    return c.json({ 
      success: true, 
      message: 'Abonnement aux notifications enregistré' 
    })
    
  } catch (error: any) {
    console.error('Erreur abonnement push:', error)
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// Se désabonner des push notifications
app.post('/api/push/unsubscribe', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    
    pushSubscriptions.delete(`user_${user.id}`)
    
    console.log(`✅ Push subscription supprimée pour user ${user.id}`)
    
    return c.json({ 
      success: true, 
      message: 'Désabonnement réussi' 
    })
    
  } catch (error: any) {
    console.error('Erreur désabonnement push:', error)
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// Envoyer une notification push (admin ou automatique)
app.post('/api/push/send', authMiddleware, async (c) => {
  try {
    const { user_id, title, body, url } = await c.req.json()
    
    if (!user_id || !title || !body) {
      return c.json({ 
        success: false, 
        error: 'user_id, title et body requis' 
      }, 400)
    }
    
    // Récupérer la subscription de l'utilisateur
    const subData = pushSubscriptions.get(`user_${user_id}`)
    
    if (!subData) {
      return c.json({ 
        success: false, 
        error: 'Utilisateur non abonné aux notifications' 
      }, 404)
    }
    
    // En production, utiliser web-push library
    // Pour le moment, simuler l'envoi
    console.log(`📤 Notification envoyée à user ${user_id}:`, { title, body, url })
    
    // TODO: Implémenter l'envoi réel avec web-push
    // const webpush = require('web-push')
    // webpush.setVapidDetails(
    //   'mailto:contact@amanah-go.com',
    //   VAPID_PUBLIC_KEY,
    //   VAPID_PRIVATE_KEY
    // )
    // await webpush.sendNotification(
    //   subData.subscription,
    //   JSON.stringify({ title, body, url })
    // )
    
    return c.json({ 
      success: true, 
      message: 'Notification envoyée' 
    })
    
  } catch (error: any) {
    console.error('Erreur envoi notification:', error)
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// Helpers pour envoyer des notifications automatiques
async function sendPushNotification(userId: number, title: string, body: string, url?: string) {
  try {
    const subData = pushSubscriptions.get(`user_${userId}`)
    if (!subData) {
      console.log(`⚠️ User ${userId} pas abonné aux notifications`)
      return false
    }
    
    console.log(`📤 Notification: ${title} → User ${userId}`)
    
    // TODO: Implémenter l'envoi réel avec web-push
    
    return true
  } catch (error) {
    console.error('Erreur envoi push notification:', error)
    return false
  }
}

// Exemples d'utilisation des notifications automatiques:

// Nouveau message reçu
async function notifyNewMessage(recipientId: number, senderName: string) {
  await sendPushNotification(
    recipientId,
    '💬 Nouveau message',
    `${senderName} vous a envoyé un message`,
    '/messages'
  )
}

// Colis réservé
async function notifyPackageBooked(shipperId: number, travelerName: string) {
  await sendPushNotification(
    shipperId,
    '📦 Colis réservé !',
    `${travelerName} a réservé votre colis`,
    '/expediteur/mes-colis'
  )
}

// Trajet bientôt (24h avant)
async function notifyUpcomingTrip(travelerId: number, destination: string) {
  await sendPushNotification(
    travelerId,
    '✈️ Départ dans 24h',
    `Votre trajet vers ${destination} est demain`,
    '/voyageur/mes-trajets'
  )
}

// Paiement reçu
async function notifyPaymentReceived(travelerId: number, amount: number) {
  await sendPushNotification(
    travelerId,
    '💰 Paiement reçu',
    `Vous avez reçu ${amount}€ pour votre trajet`,
    '/voyageur/stripe-connect'
  )
}

// ==========================================
// ADMIN API ROUTES
// ==========================================

// Middleware admin (simplif ié pour dev)
const adminMiddleware = async (c: any, next: any) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ success: false, error: 'Token manquant' }, 401)
    }
    const token = authHeader.substring(7)
    const db = c.get('db') as DatabaseService
    
    // Essayer Firebase d'abord
    try {
      const firebaseRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${c.env?.FIREBASE_API_KEY}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: token }) }
      )
      if (firebaseRes.ok) {
        const data: any = await firebaseRes.json()
        const firebaseUser = data.users?.[0]
        if (firebaseUser) {
          const dbUser = await db.getUserByFirebaseUid(firebaseUser.localId)
          if (!dbUser || dbUser.role !== 'admin') {
            return c.json({ success: false, error: 'Accès non autorisé' }, 403)
          }
          c.set('user', { id: dbUser.id, email: dbUser.email, name: dbUser.name, role: dbUser.role })
          return await next()
        }
      }
    } catch(e) {}
    
    // Sinon essayer JWT
    await authMiddleware(c, async () => {
      const user = c.get('user')
      const dbUser = await db.getUserById(user.id)
      if (!dbUser || dbUser.role !== 'admin') {
        return c.json({ success: false, error: 'Accès non autorisé' }, 403)
      }
      await next()
    })
  } catch(error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
}

// Get admin stats
app.get('/api/admin/stats', adminMiddleware, async (c) => {
  try {
    const db = c.get('db') as DatabaseService
    
    // ✅ MIGRATION D1: Récupérer depuis D1 uniquement
    const users = await db.getAllUsers()
    
    const stats = {
      total: users.length,
      pending: users.filter(u => u.kyc_status === 'PENDING' || u.kyc_status === 'SUBMITTED').length,
      verified: users.filter(u => u.kyc_status === 'VERIFIED').length,
      rejected: users.filter(u => u.kyc_status === 'REJECTED').length
    }
    
    return c.json(stats)
    
  } catch (error: any) {
    console.error('Erreur stats admin:', error)
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// Get all users for admin
app.get('/api/admin/users', adminMiddleware, async (c) => {
  try {
    const db = c.get('db') as DatabaseService
    
    // ✅ MIGRATION D1: Récupérer depuis D1 uniquement
    const usersData = await db.getAllUsers()
    
    const users = usersData.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      kyc_status: u.kyc_status,
      kyc_selfie_url: u.kyc_selfie_url,
      kyc_document_url: u.kyc_document_url,
      kyc_rejection_reason: u.kyc_rejection_reason,
      rating: u.rating,
      reviews_count: u.reviews_count,
      created_at: u.created_at
    }))
    
    return c.json({ 
      success: true, 
      users 
    })
    
  } catch (error: any) {
    console.error('Erreur liste users admin:', error)
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// Validate KYC
app.post('/api/admin/validate-kyc', adminMiddleware, async (c) => {
  try {
    const { user_id, status, notes } = await c.req.json()
    const db = c.get('db') as DatabaseService
    
    if (!user_id || !status) {
      return c.json({ 
        success: false, 
        error: 'user_id et status requis' 
      }, 400)
    }
    
    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      return c.json({ 
        success: false, 
        error: 'Status invalide (VERIFIED ou REJECTED)' 
      }, 400)
    }
    
    // ✅ MIGRATION D1: Récupérer depuis D1 uniquement
    const user = await db.getUserById(user_id)
    
    if (!user) {
      return c.json({ 
        success: false, 
        error: 'Utilisateur introuvable' 
      }, 404)
    }
    
    // Préparer les updates
    const updates: any = {
      kyc_status: status,
      kyc_verified_at: new Date().toISOString()
    }
    
    if (status === 'REJECTED') {
      updates.kyc_rejection_reason = notes || 'Non spécifié'
    }
    
    // ✅ MIGRATION D1: Mettre à jour dans D1 uniquement
    await db.updateUser(user_id, updates)
    console.log('✅ KYC updated in D1:', user_id, status)
    
    console.log(`✅ KYC ${status} pour user ${user_id}`)
    
    // 📧 Envoyer email de notification
    try {
      const resendKey = c.env?.RESEND_API_KEY
      const emailHtml = status === 'VERIFIED' 
        ? EmailTemplates.kycApproved(user.name)
        : EmailTemplates.kycRejected(user.name, notes)
      
      await sendEmail(
        user.email, 
        status === 'VERIFIED' ? '✅ Votre profil est vérifié !' : '❌ Vérification refusée',
        emailHtml, 
        resendKey
      )
    } catch (emailError) {
      console.error('Erreur envoi email KYC:', emailError)
    }
    
    // 🔔 Envoyer notification push
    await sendPushNotification(
      user.id,
      status === 'VERIFIED' ? '✅ Profil vérifié !' : '❌ Vérification refusée',
      status === 'VERIFIED' 
        ? 'Votre profil a été vérifié avec succès'
        : `Raison: ${notes}`,
      '/verify-profile'
    )
    
    return c.json({ 
      success: true, 
      message: `KYC ${status}`,
      user: {
        id: user.id,
        kyc_status: user.kyc_status
      }
    })
    
  } catch (error: any) {
    console.error('Erreur validation KYC:', error)
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// Get user KYC details
app.get('/api/admin/kyc/:userId', adminMiddleware, async (c) => {
  try {
    const userId = c.req.param('userId')
    
    // ✅ MIGRATION D1: Utiliser DatabaseService
    const db = c.get('db') as DatabaseService
    const user = await db.getUserById(userId)
    
    if (!user) {
      return c.json({ 
        success: false, 
        error: 'Utilisateur introuvable' 
      }, 404)
    }
    
    return c.json({ 
      success: true, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        kyc_status: user.kyc_status,
        kyc_selfie_url: user.kyc_selfie_url,
        kyc_document_url: user.kyc_document_url,
        kyc_rejection_reason: user.kyc_rejection_reason,
        kyc_validated_at: user.kyc_validated_at,
        created_at: user.created_at
      }
    })
    
  } catch (error: any) {
    console.error('Erreur détails KYC:', error)
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// Servir les photos KYC depuis R2 (admin seulement)
app.get('/api/admin/kyc-photo/:userId/:type', adminMiddleware, async (c) => {
  const { R2 } = c.env
  const userId = c.req.param('userId')
  const type = c.req.param('type') // 'selfie' ou 'document'

  if (!['selfie', 'document'].includes(type)) {
    return c.json({ error: 'Type invalide (selfie ou document)' }, 400)
  }

  try {
    if (!R2) {
      return c.redirect(`https://via.placeholder.com/400x500?text=${type === 'selfie' ? 'Selfie' : 'ID+Document'}`)
    }

    const db = c.get('db') as DatabaseService
    const user = await db.getUserById(userId)
    if (!user) {
      return c.json({ error: 'Utilisateur introuvable' }, 404)
    }

    const storedUrl = type === 'selfie' ? user.kyc_selfie_url : user.kyc_document_url
    if (!storedUrl) {
      return c.redirect(`https://via.placeholder.com/400x500?text=Aucune+photo`)
    }

    // Si c'est déjà une URL complète, rediriger directement
    if (storedUrl.startsWith('http')) {
      return c.redirect(storedUrl)
    }

    // C'est une clé R2 — la récupérer directement
    // Essayer avec la clé telle quelle d'abord
    let r2Key = storedUrl.startsWith('/') ? storedUrl.substring(1) : storedUrl
    let object = await R2.get(r2Key)

    // Fallback: chercher dans le répertoire selfies avec extensions
    if (!object) {
      const extensions = ['jpg', 'jpeg', 'png', 'webp']
      const prefix = type === 'selfie' ? `kyc/selfies/${userId}/` : `kyc/${userId}/id-`
      for (const ext of extensions) {
        const altKey = `${prefix}${r2Key.split('/').pop()}.${ext}`
        object = await R2.get(altKey)
        if (object) break
      }
    }

    if (!object) {
      return c.redirect(`https://via.placeholder.com/400x500?text=Photo+introuvable`)
    }

    return new Response(object.body as ReadableStream, {
      headers: {
        'Content-Type': (object as any).httpMetadata?.contentType || 'image/jpeg',
        'Cache-Control': 'private, max-age=3600'
      }
    })
  } catch (error: any) {
    console.error('❌ Erreur lecture photo KYC:', error)
    return c.json({ error: error.message }, 500)
  }
})

// ==========================================
// STRIPE CONNECT API ROUTES
// ==========================================

// Route 1: Créer un compte Stripe Connect (onboarding voyageur)
app.post('/api/stripe/connect/onboard', authMiddleware, async (c) => {
  try {
    const stripe = getStripe(c)
    if (!stripe) {
      return c.json({ success: false, error: 'Stripe is not configured' }, 500)
    }
    const user = c.get('user')

    // ✅ MIGRATION D1: Vérifier si l'utilisateur a déjà un compte Connect
    const db = c.get('db') as DatabaseService
    const existingUser = await db.getUserById(user.id)
    if (existingUser?.stripe_account_id) {
      return c.json({ 
        success: false, 
        error: 'Vous avez déjà un compte Stripe Connect' 
      }, 400)
    }

    // Créer un compte Stripe Connect
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'FR', // France par défaut (adapter selon le pays de l'utilisateur)
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        user_id: user.id.toString(),
        user_email: user.email,
        platform: 'amanah-go'
      }
    })

    // ✅ MIGRATION D1: Sauvegarder l'account_id dans la DB
    await db.updateUser(user.id, {
      stripe_account_id: account.id
    })

    // Créer un lien d'onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${c.req.header('origin') || 'http://localhost:3000'}/voyageur/stripe-connect?refresh=true`,
      return_url: `${c.req.header('origin') || 'http://localhost:3000'}/voyageur/stripe-connect?success=true`,
      type: 'account_onboarding',
    })

    return c.json({
      success: true,
      account_id: account.id,
      onboarding_url: accountLink.url
    })
  } catch (error: any) {
    console.error('Stripe Connect onboarding error:', error)
    return c.json({ 
      success: false, 
      error: error.message || 'Erreur lors de la création du compte Stripe' 
    }, 500)
  }
})

// Route 2: Obtenir le lien vers le dashboard Stripe
app.get('/api/stripe/connect/dashboard', authMiddleware, async (c) => {
  try {
    const stripe = getStripe(c)
    if (!stripe) {
      return c.json({ success: false, error: 'Stripe is not configured' }, 500)
    }
    const user = c.get('user')

    // ✅ MIGRATION D1: Utiliser DatabaseService
    const db = c.get('db') as DatabaseService
    const existingUser = await db.getUserByEmail(user.email)
    if (!existingUser?.stripe_account_id) {
      return c.json({ 
        success: false, 
        error: 'Vous devez d\'abord créer un compte Stripe Connect' 
      }, 400)
    }

    // Créer un lien vers le dashboard Express
    const loginLink = await stripe.accounts.createLoginLink(existingUser.stripe_account_id)

    return c.json({
      success: true,
      dashboard_url: loginLink.url
    })
  } catch (error: any) {
    console.error('Stripe dashboard link error:', error)
    return c.json({ 
      success: false, 
      error: error.message || 'Erreur lors de la création du lien dashboard' 
    }, 500)
  }
})

// Route 3: Vérifier le statut du compte Connect
app.get('/api/stripe/connect/status', authMiddleware, async (c) => {
  try {
    const stripe = getStripe(c)
    const user = c.get('user')

    // ✅ MIGRATION D1: Utiliser DatabaseService
    const db = c.get('db') as DatabaseService
    const existingUser = await db.getUserByEmail(user.email)
    if (!existingUser?.stripe_account_id) {
      return c.json({ 
        success: true,
        connected: false,
        charges_enabled: false,
        payouts_enabled: false
      })
    }

    // Récupérer le compte
    const account = await stripe.accounts.retrieve(existingUser.stripe_account_id)

    return c.json({
      success: true,
      connected: true,
      account_id: account.id,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      requirements: account.requirements
    })
  } catch (error: any) {
    console.error('Stripe status error:', error)
    return c.json({ 
      success: false, 
      error: error.message || 'Erreur lors de la vérification du statut' 
    }, 500)
  }
})

// ==========================================
// STRIPE PAYMENT API ROUTES
// ==========================================

// Route 1: Créer un Payment Intent pour un expéditeur
app.post('/api/stripe/payment/create', authMiddleware, async (c) => {
  try {
    const stripe = getStripe(c)
    const user = c.get('user')
    const db = c.get('db') as DatabaseService
    const { booking_id, amount, currency = 'eur' } = await c.req.json()

    // Validation
    if (!booking_id || !amount || amount <= 0) {
      return c.json({ 
        success: false, 
        error: 'booking_id et amount sont requis' 
      }, 400)
    }

    // Calculer la commission (12%)
    const amountCents = Math.round(amount * 100)
    const applicationFee = Math.round(amountCents * 0.12)

    // 🧪 MODE MOCK: Simuler Stripe si pas de vraie clé
    if (!stripe || STRIPE_MOCK_MODE) {
      console.log('🎭 MOCK MODE: Simulating Stripe Payment Intent creation')
      const mockPaymentIntent = {
        id: 'pi_mock_' + Date.now(),
        client_secret: 'pi_mock_secret_' + Date.now()
      }
      
      // ✅ MIGRATION D1: Utiliser transactions au lieu de bookings
      const transaction = await db.getTransactionById(booking_id)
      if (transaction) {
        await db.updateTransaction(booking_id, {
          stripe_payment_intent_id: mockPaymentIntent.id,
          status: 'PENDING'
        })
      }
      
      return c.json({
        success: true,
        mock_mode: true,
        client_secret: mockPaymentIntent.client_secret,
        payment_intent_id: mockPaymentIntent.id,
        amount: amount,
        application_fee: applicationFee / 100,
        traveler_amount: (amountCents - applicationFee) / 100
      })
    }

    // ✅ MIGRATION D1: Récupérer la transaction
    const transaction = await db.getTransactionById(booking_id)
    if (!transaction) {
      return c.json({ 
        success: false, 
        error: 'Réservation introuvable' 
      }, 404)
    }

    // ✅ MIGRATION D1: Récupérer le trajet depuis D1
    const trip = await db.getTripById(transaction.trip_id)
    if (!trip) {
      return c.json({ 
        success: false, 
        error: 'Trajet introuvable' 
      }, 404)
    }

    // ✅ MIGRATION D1: Récupérer le voyageur depuis D1
    const traveler = await db.getUserById(trip.user_id)
    if (!traveler) {
      return c.json({ 
        success: false, 
        error: 'Voyageur introuvable' 
      }, 404)
    }

    if (!traveler?.stripe_account_id) {
      return c.json({ 
        success: false, 
        error: 'Le voyageur n\'a pas configuré son compte Stripe' 
      }, 400)
    }

    // Créer le Payment Intent avec Stripe Connect + ESCROW
    // capture_method: 'manual' = Les fonds sont bloqués mais pas encore capturés
    // On ne capture qu'après confirmation de livraison
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: currency,
      capture_method: 'manual', // 🔐 ESCROW: Blocage des fonds sans capture immédiate
      application_fee_amount: applicationFee,
      // On ne met PAS transfer_data ici pour éviter le transfert automatique
      // Le transfert sera fait manuellement après confirmation livraison
      on_behalf_of: traveler.stripe_account_id, // Pour les frais de traitement
      metadata: {
        booking_id: booking_id,
        trip_id: trip.id,
        sender_id: user.id.toString(),
        traveler_id: traveler.id.toString(),
        traveler_stripe_account: traveler.stripe_account_id,
        platform: 'amanah-go'
      },
      description: `Paiement Escrow pour trajet ${trip.departure_city} → ${trip.arrival_city}`
    })

    // ✅ MIGRATION D1: Sauvegarder le payment_intent_id dans la transaction
    await db.updateTransaction(booking_id, {
      stripe_payment_intent_id: paymentIntent.id,
      status: 'PENDING'
    })

    return c.json({
      success: true,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      amount: amount,
      application_fee: applicationFee / 100, // Retourner en euros
      traveler_amount: (amountCents - applicationFee) / 100 // Montant pour le voyageur
    })
  } catch (error: any) {
    console.error('Payment Intent creation error:', error)
    return c.json({ 
      success: false, 
      error: error.message || 'Erreur lors de la création du paiement' 
    }, 500)
  }
})

// Route 2: Confirmer un paiement (après que le client ait validé avec sa carte)
app.post('/api/stripe/payment/confirm', authMiddleware, async (c) => {
  try {
    const stripe = getStripe(c)
    const db = c.get('db') as DatabaseService
    const { payment_intent_id } = await c.req.json()

    if (!payment_intent_id) {
      return c.json({ 
        success: false, 
        error: 'payment_intent_id requis' 
      }, 400)
    }

    // 🧪 MODE MOCK: Simuler la confirmation
    if (!stripe || STRIPE_MOCK_MODE || payment_intent_id.startsWith('pi_mock_')) {
      console.log('🎭 MOCK MODE: Simulating payment confirmation')
      
      // ✅ MIGRATION D1: Trouver la transaction associée
      // Note: Il faudrait ajouter une méthode getTransactionByPaymentIntent dans db.service.ts
      // Pour l'instant, on simule avec le booking_id direct
      const transaction = await db.getTransactionById(payment_intent_id.replace('pi_mock_', ''))
      
      if (transaction) {
        await db.updateTransaction(transaction.id, {
          status: 'HELD' // Simuler Escrow (fonds bloqués)
        })
      }
      
      return c.json({
        success: true,
        mock_mode: true,
        status: 'requires_capture',
        amount: transaction ? transaction.agreed_price : 0,
        currency: 'eur',
        escrow_status: 'held'
      })
    }

    // Récupérer le Payment Intent depuis Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id)

    // ✅ MIGRATION D1: Mettre à jour le statut de la transaction
    const booking_id = paymentIntent.metadata.booking_id
    if (booking_id) {
      const transaction = await db.getTransactionById(booking_id)
      if (transaction) {
        // Le Payment Intent est "requires_capture" = fonds bloqués en Escrow
        let newStatus = 'PENDING'
        if (paymentIntent.status === 'requires_capture') {
          newStatus = 'HELD' // 🔐 Fonds bloqués en Escrow
        } else if (paymentIntent.status === 'succeeded') {
          newStatus = 'PAID'
        } else {
          newStatus = 'FAILED'
        }
        
        await db.updateTransaction(booking_id, {
          stripe_payment_intent_id: payment_intent_id,
          status: newStatus
        })
      }
    }

    return c.json({
      success: true,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      escrow_status: paymentIntent.status === 'requires_capture' ? 'held' : 'released'
    })
  } catch (error: any) {
    console.error('Payment confirmation error:', error)
    return c.json({ 
      success: false, 
      error: error.message || 'Erreur lors de la confirmation du paiement' 
    }, 500)
  }
})

// Route 3: Obtenir la clé publique Stripe (pour le frontend)
app.get('/api/stripe/config', (c) => {
  const publishableKey = c.env?.STRIPE_PUBLISHABLE_KEY || 'pk_test_51Six5P8I2rvObHIX4ofMRLVkfDmb2tzQkzqxOJIPcp1c4s2CR9lBbkZPEAcfDLW5P3rVYspbpCBVeNanTr8lz6s800t7NEw7EZ'
  
  return c.json({
    success: true,
    publishableKey: publishableKey
  })
})

// ==========================================
// STRIPE TRANSFER & ESCROW API ROUTES
// ==========================================

// Route 1: Confirmer la livraison et déclencher la capture + transfert (ESCROW RELEASE)
app.post('/api/bookings/:id/confirm-delivery', authMiddleware, async (c) => {
  try {
    const stripe = getStripe(c)
    const db = c.get('db') as DatabaseService
    const bookingId = c.req.param('id')
    const user = c.get('user')

    // ✅ MIGRATION D1: Récupérer la transaction
    const transaction = await db.getTransactionById(bookingId)
    if (!transaction) {
      return c.json({ 
        success: false, 
        error: 'Réservation introuvable' 
      }, 404)
    }

    // Vérifier que c'est l'expéditeur qui confirme
    if (transaction.shipper_id !== user.id) {
      return c.json({ 
        success: false, 
        error: 'Seul l\'expéditeur peut confirmer la livraison' 
      }, 403)
    }

    // Vérifier que le paiement est en Escrow (held)
    if (transaction.status !== 'HELD' && transaction.status !== 'PAID') {
      return c.json({ 
        success: false, 
        error: `Le paiement n'est pas en attente (statut: ${transaction.status})` 
      }, 400)
    }

    // Vérifier que la livraison n'est pas déjà confirmée
    if (transaction.status === 'COMPLETED') {
      return c.json({ 
        success: false, 
        error: 'La livraison a déjà été confirmée' 
      }, 400)
    }

    // 🔐 ÉTAPE 1: CAPTURER les fonds bloqués (Escrow Release)
    if (transaction.status === 'HELD') {
      // 🧪 MODE MOCK: Simuler la capture
      if (!stripe || STRIPE_MOCK_MODE || transaction.stripe_payment_intent_id?.startsWith('pi_mock_')) {
        console.log('🎭 MOCK MODE: Simulating payment capture')
        await db.updateTransaction(bookingId, { status: 'CAPTURED' })
        console.log(`✅ Escrow released (MOCK): Payment ${transaction.stripe_payment_intent_id} captured`)
      } else {
        try {
          const paymentIntent = await stripe.paymentIntents.capture(transaction.stripe_payment_intent_id!)
          
          if (paymentIntent.status !== 'succeeded') {
            return c.json({
              success: false,
              error: 'Impossible de capturer le paiement: ' + paymentIntent.status
            }, 400)
          }
          
          await db.updateTransaction(bookingId, { status: 'CAPTURED' })
          console.log(`✅ Escrow released: Payment ${transaction.stripe_payment_intent_id} captured`)
        } catch (captureError: any) {
          console.error('❌ Capture error:', captureError)
          return c.json({
            success: false,
            error: 'Erreur lors de la capture du paiement: ' + captureError.message
          }, 500)
        }
      }
    }

    // Marquer la livraison comme confirmée
    await db.updateTransaction(bookingId, {
      status: 'COMPLETED',
      updated_at: new Date().toISOString()
    })

    // 🔐 ÉTAPE 2: TRANSFÉRER au voyageur
    try {
      const transferResult = await createTransfer(bookingId, db)
      
      if (transferResult.success) {
        await db.updateTransaction(bookingId, {
          status: 'TRANSFERRED' // Paiement transféré au voyageur
        })

        return c.json({
          success: true,
          message: '🎉 Livraison confirmée ! Fonds capturés et transférés au voyageur.',
          escrow_released: true,
          transfer_id: transferResult.transfer_id,
          amount_transferred: transferResult.amount
        })
      } else {
        return c.json({
          success: false,
          error: 'Livraison confirmée et fonds capturés, mais erreur lors du transfert: ' + transferResult.error
        }, 500)
      }
    } catch (transferError: any) {
      console.error('Transfer error:', transferError)
      return c.json({
        success: false,
        error: 'Livraison confirmée et fonds capturés, mais erreur lors du transfert'
      }, 500)
    }
  } catch (error: any) {
    console.error('Confirm delivery error:', error)
    return c.json({ 
      success: false, 
      error: error.message || 'Erreur lors de la confirmation de livraison' 
    }, 500)
  }
})

// Route 2: Créer un transfert manuellement (admin/debug)
app.post('/api/stripe/transfer/create', authMiddleware, async (c) => {
  try {
    const db = c.get('db') as DatabaseService
    const { booking_id } = await c.req.json()

    if (!booking_id) {
      return c.json({ 
        success: false, 
        error: 'booking_id requis' 
      }, 400)
    }

    const result = await createTransfer(booking_id, db)
    
    if (result.success) {
      return c.json(result)
    } else {
      return c.json(result, 400)
    }
  } catch (error: any) {
    console.error('Transfer creation error:', error)
    return c.json({ 
      success: false, 
      error: error.message || 'Erreur lors de la création du transfert' 
    }, 500)
  }
})

// ✅ MIGRATION D1: Fonction helper pour créer un transfert
async function createTransfer(bookingId: string, db: DatabaseService): Promise<any> {
  try {
    const transaction = await db.getTransactionById(bookingId)
    if (!transaction) {
      return { success: false, error: 'Réservation introuvable' }
    }

    if (!transaction.stripe_payment_intent_id) {
      return { success: false, error: 'Aucun paiement associé à cette réservation' }
    }

    if (transaction.status === 'TRANSFERRED' || transaction.status === 'COMPLETED') {
      return { success: false, error: 'Le transfert a déjà été effectué' }
    }

    // Le transfert est automatique avec Stripe Connect !
    // Quand on crée un Payment Intent avec transfer_data.destination,
    // l'argent est automatiquement transféré après capture.
    
    // On marque juste le transfert comme effectué
    await db.updateTransaction(bookingId, {
      status: 'TRANSFERRED',
      updated_at: new Date().toISOString()
    })

    return {
      success: true,
      message: 'Transfert effectué automatiquement par Stripe Connect',
      transfer_id: transaction.stripe_payment_intent_id,
      amount: transaction.agreed_price,
      booking_id: bookingId
    }
  } catch (error: any) {
    console.error('Transfer helper error:', error)
    return { success: false, error: error.message }
  }
}

// Route 3: Webhooks Stripe (notifications automatiques)
app.post('/api/stripe/webhooks', async (c) => {
  try {
    const stripe = getStripe(c)
    const signature = c.req.header('stripe-signature')
    
    if (!signature) {
      return c.json({ error: 'Missing stripe-signature header' }, 400)
    }

    const rawBody = await c.req.text()
    const webhookSecret = c.env?.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret'

    // Vérifier la signature du webhook
    let event
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return c.json({ error: 'Webhook signature verification failed' }, 400)
    }

    console.log('✅ Webhook reçu:', event.type)

    // Traiter les différents types d'événements
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object
        console.log('💰 Paiement réussi:', paymentIntent.id)
        
        // ✅ MIGRATION D1: Mettre à jour la transaction
        const bookingId = paymentIntent.metadata?.booking_id
        if (bookingId) {
          const db = c.get('db') as DatabaseService
          const transaction = await db.getTransactionById(bookingId)
          if (transaction) {
            await db.updateTransaction(bookingId, {
              status: 'PAID',
              updated_at: new Date().toISOString()
            })
            console.log('✅ Transaction mise à jour:', bookingId)
          }
        }
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object
        console.log('❌ Paiement échoué:', failedPayment.id)
        
        const failedBookingId = failedPayment.metadata?.booking_id
        if (failedBookingId) {
          const db = c.get('db') as DatabaseService
          const transaction = await db.getTransactionById(failedBookingId)
          if (transaction) {
            await db.updateTransaction(failedBookingId, {
              status: 'FAILED'
            })
          }
        }
        break

      case 'transfer.created':
        console.log('🚀 Transfert créé:', event.data.object.id)
        break

      case 'transfer.paid':
        console.log('✅ Transfert payé:', event.data.object.id)
        break

      case 'account.updated':
        console.log('👤 Compte Stripe mis à jour:', event.data.object.id)
        break

      default:
        console.log('ℹ️ Événement non géré:', event.type)
    }

    return c.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return c.json({ error: 'Webhook processing failed' }, 500)
  }
})

// ==========================================
// 🔥 FIREBASE AUTH API ROUTES
// ==========================================

// Firebase Signup - Créer utilisateur dans notre DB après création Firebase
app.post('/api/auth/firebase-signup', firebaseTokenOnly, async (c) => {
  try {
    const body = await c.req.json()
    // Accepter firebase_uid ou firebaseUid (compatibilité frontend)
    const firebaseUid = body.firebase_uid || body.firebaseUid || ''
    const email = body.email || ''
    const name = body.name || ''
    const phone = body.phone || ''
    const db = c.get('db') as DatabaseService
    
    console.log('🔥 Firebase signup - Creating user in DB:', email, 'uid:', firebaseUid)
    
    if (!firebaseUid) {
      return c.json({ success: false, error: 'firebase_uid manquant' }, 400)
    }
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.getUserByFirebaseUid(firebaseUid)
    
    if (existingUser) {
      console.log('✅ User already exists in DB:', existingUser.id)
      return c.json({
        success: true,
        user: existingUser,
        message: 'Utilisateur déjà existant'
      })
    }
    
    // Créer l'utilisateur dans notre DB
    const userId = generateId()
    const userData = {
      id: userId,
      firebase_uid: firebaseUid,
      email,
      name,
      phone,
      password_hash: '',
      kyc_status: 'PENDING',
      rating: 0,
      reviews_count: 0,
      created_at: new Date().toISOString()
    }
    
    await db.createUser(userData)
    console.log('✅ User created in D1:', userId)
    
    return c.json({
      success: true,
      user: {
        id: userId,
        firebase_uid: firebaseUid,
        email,
        name,
        phone,
        kyc_status: 'PENDING'
      },
      message: 'Compte créé avec succès'
    })
    
  } catch (error: any) {
    console.error('❌ Firebase signup error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Firebase OAuth - Créer/Récupérer utilisateur OAuth
app.post('/api/auth/firebase-oauth', firebaseTokenOnly, async (c) => {
  try {
    const { provider, firebaseUid, email, name, avatar_url } = await c.req.json()
    const db = c.get('db') as DatabaseService
    
    console.log(`🔥 Firebase ${provider} OAuth:`, email)
    
    // Vérifier si l'utilisateur existe
    let user = await db.getUserByFirebaseUid(firebaseUid)
    
    if (!user) {
      // Créer nouvel utilisateur OAuth
      const userId = generateId()
      const userData = {
        id: userId,
        firebase_uid: firebaseUid,
        email,
        name,
        phone: '',
        password_hash: '',
        avatar_url: avatar_url || '',
        kyc_status: 'PENDING',
        rating: 0,
        reviews_count: 0,
        created_at: new Date().toISOString()
      }
      
      user = await db.createUser(userData)
      console.log('✅ OAuth user created:', userId)
    } else {
      console.log('✅ OAuth user exists:', user.id)
    }
    
    return c.json({
      success: true,
      user: {
        id: user.id,
        firebase_uid: firebaseUid,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar_url: user.avatar_url,
        kyc_status: user.kyc_status
      }
    })
    
  } catch (error: any) {
    console.error('❌ Firebase OAuth error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get user profile (avec Firebase token)
app.get('/api/auth/me', firebaseAuthMiddleware, async (c) => {
  const user = c.get('user')
  
  return c.json({
    success: true,
    user: {
      id: user.id,
      firebase_uid: user.firebaseUid,
      email: user.email,
      name: user.name,
      phone: user.phone,
      kyc_status: user.kyc_status,
      emailVerified: user.emailVerified
    }
  })
})

// Update phone number
app.post('/api/auth/update-phone', firebaseAuthMiddleware, async (c) => {
  try {
    const { phone } = await c.req.json()
    const user = c.get('user')
    const db = c.get('db') as DatabaseService
    
    await db.updateUser(user.id, { phone })
    
    console.log('✅ Phone updated for user:', user.id)
    
    return c.json({
      success: true,
      message: 'Téléphone mis à jour'
    })
    
  } catch (error: any) {
    console.error('❌ Update phone error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ==========================================
// AUTH API ROUTES (Legacy JWT - à garder pour compatibilité)
// ==========================================

// Signup
app.post('/api/auth/signup', async (c) => {
  try {
    const { name, email, phone, password } = await c.req.json()
    const db = c.get('db') as DatabaseService
    
    // Validation
    if (!name || !email || !phone || !password) {
      return c.json({ success: false, error: 'Tous les champs sont requis' }, 400)
    }
    
    if (password.length < 8) {
      return c.json({ success: false, error: 'Le mot de passe doit contenir au moins 8 caractères' }, 400)
    }
    
    // ✅ MIGRATION D1: Vérifier si l'email existe déjà
    const existingUser = await db.getUserByEmail(email)
    
    if (existingUser) {
      return c.json({ success: false, error: 'Cet email est déjà utilisé' }, 400)
    }
    
    // Hash le mot de passe avec bcrypt
    const passwordHash = await bcrypt.hash(password, 10)
    
    // Créer l'utilisateur avec UUID SANS TIRETS pour D1 (format hex)
    const userId = crypto.randomUUID().replace(/-/g, '') // Enlève tirets pour D1
    const userData = {
      id: userId,
      email,
      name,
      phone,
      password_hash: passwordHash,
      kyc_status: 'PENDING', // ✅ KYC activé : les utilisateurs doivent compléter la vérification
      rating: 0,
      reviews_count: 0,
      oauth_provider: null,
      oauth_id: null,
      created_at: new Date().toISOString()
    }
    
    // ✅ MIGRATION D1: Sauvegarder dans D1 uniquement
    await db.createUser(userData)
    console.log('✅ User created in D1:', userId)
    
    // 📧 Envoyer email de bienvenue
    try {
      const resendKey = c.env?.RESEND_API_KEY
      const emailHtml = EmailTemplates.welcome(name)
      await sendEmail(email, '👋 Bienvenue sur Amanah GO !', emailHtml, resendKey)
    } catch (emailError) {
      console.error('Erreur envoi email bienvenue:', emailError)
      // Continue même si l'email échoue
    }
    
    // Générer JWT token
    const secret = getJWTSecret(c.env)
    const token = await sign(
      {
        id: userId,
        email,
        name,
        exp: Math.floor(Date.now() / 1000) + JWT_EXPIRATION_SECONDS
      },
      secret
    )
    
    return c.json({ 
      success: true, 
      user: {
        id: userId,
        email,
        name,
        phone,
        kyc_status: 'PENDING' // ✅ KYC activé
      },
      token,
      message: 'Compte créé avec succès'
    })
    
  } catch (error: any) {
    console.error('Signup error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ==========================================
// OAUTH GOOGLE - Authentification
// ==========================================

// Rediriger vers Google OAuth
app.get('/api/auth/google', (c) => {
  const googleClientId = c.env?.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'
  const redirectUri = `${c.req.url.split('/api')[0]}/api/auth/google/callback`
  
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${googleClientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=email profile` +
    `&access_type=offline` +
    `&prompt=consent`
  
  return c.redirect(googleAuthUrl)
})

// Callback Google OAuth
app.get('/api/auth/google/callback', async (c) => {
  try {
    const code = c.req.query('code')
    if (!code) {
      return c.redirect('/login?error=oauth_failed')
    }
    
    const googleClientId = c.env?.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'
    const googleClientSecret = c.env?.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET'
    const redirectUri = `${c.req.url.split('/api')[0]}/api/auth/google/callback`
    
    // Échanger le code contre un access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    })
    
    const tokenData = await tokenResponse.json()
    if (!tokenData.access_token) {
      return c.redirect('/login?error=oauth_failed')
    }
    
    // Récupérer les infos utilisateur
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    })
    
    const googleUser = await userResponse.json()
    
    const db = c.get('db') as DatabaseService
    
    // ✅ MIGRATION D1: Vérifier si l'utilisateur existe déjà
    let user = await db.getUserByEmail(googleUser.email)
    if (!user) {
      user = await db.getUserByGoogleId(googleUser.id)
    }
    
    if (!user) {
      // Créer un nouvel utilisateur
      const userId = crypto.randomUUID().replace(/-/g, '') // Format D1 (sans tirets)
      const userData = {
        id: userId,
        email: googleUser.email,
        name: googleUser.name,
        phone: '', // À remplir plus tard
        avatar_url: googleUser.picture,
        google_id: googleUser.id,
        kyc_status: 'VERIFIED', // 🚀 BETA MODE: Auto-approve
        rating: 0,
        reviews_count: 0,
        created_at: new Date().toISOString()
      }
      
      // ✅ MIGRATION D1: Sauvegarder dans D1 uniquement
      user = await db.createUser(userData)
      console.log('✅ Google user created in D1:', userId)
      
      // 📧 Envoyer email de bienvenue
      try {
        const resendKey = c.env?.RESEND_API_KEY
        const emailHtml = EmailTemplates.welcome(user.name)
        await sendEmail(user.email, '👋 Bienvenue sur Amanah GO !', emailHtml, resendKey)
      } catch (emailError) {
        console.error('Erreur envoi email bienvenue:', emailError)
      }
    }
    
    // Générer JWT token
    const secret = getJWTSecret(c.env)
    const token = await sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        exp: Math.floor(Date.now() / 1000) + JWT_EXPIRATION_SECONDS
      },
      secret
    )
    
    // Rediriger vers le dashboard avec le token
    return c.redirect(`/voyageur?token=${token}`)
    
  } catch (error: any) {
    console.error('Erreur OAuth Google:', error)
    return c.redirect('/login?error=oauth_failed')
  }
})

// ==========================================
// OAUTH APPLE - Sign in with Apple
// ==========================================

// Rediriger vers Apple OAuth
app.get('/api/auth/apple', (c) => {
  const appleClientId = c.env?.APPLE_CLIENT_ID || 'YOUR_APPLE_CLIENT_ID'
  const redirectUri = `${c.req.url.split('/api')[0]}/api/auth/apple/callback`
  
  // Apple utilise OpenID Connect
  const appleAuthUrl = `https://appleid.apple.com/auth/authorize?` +
    `client_id=${appleClientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&response_mode=form_post` +
    `&scope=name email`
  
  return c.redirect(appleAuthUrl)
})

// Callback Apple OAuth (POST car Apple utilise form_post)
app.post('/api/auth/apple/callback', async (c) => {
  try {
    const formData = await c.req.formData()
    const code = formData.get('code')
    const user = formData.get('user') // Apple envoie les infos user seulement la première fois
    
    if (!code) {
      return c.redirect('/login?error=oauth_failed')
    }
    
    const appleClientId = c.env?.APPLE_CLIENT_ID || 'YOUR_APPLE_CLIENT_ID'
    const appleTeamId = c.env?.APPLE_TEAM_ID || 'YOUR_APPLE_TEAM_ID'
    const appleKeyId = c.env?.APPLE_KEY_ID || 'YOUR_APPLE_KEY_ID'
    const applePrivateKey = c.env?.APPLE_PRIVATE_KEY || 'YOUR_APPLE_PRIVATE_KEY'
    const redirectUri = `${c.req.url.split('/api')[0]}/api/auth/apple/callback`
    
    // Créer client secret JWT pour Apple (valide 6 mois)
    const clientSecret = await sign(
      {
        iss: appleTeamId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 180), // 6 mois
        aud: 'https://appleid.apple.com',
        sub: appleClientId
      },
      applePrivateKey,
      { algorithm: 'ES256', kid: appleKeyId }
    )
    
    // Échanger le code contre un access token
    const tokenResponse = await fetch('https://appleid.apple.com/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: appleClientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    })
    
    const tokenData = await tokenResponse.json()
    if (!tokenData.id_token) {
      return c.redirect('/login?error=oauth_failed')
    }
    
    // Décoder l'id_token (JWT) pour récupérer les infos utilisateur
    const [, payloadBase64] = tokenData.id_token.split('.')
    const payload = JSON.parse(atob(payloadBase64))
    
    // Parser les infos user si disponibles (première connexion uniquement)
    let userName = 'Utilisateur Apple'
    if (user) {
      try {
        const userObj = typeof user === 'string' ? JSON.parse(user) : user
        userName = userObj.name ? `${userObj.name.firstName || ''} ${userObj.name.lastName || ''}`.trim() : userName
      } catch (e) {
        console.error('Erreur parsing user Apple:', e)
      }
    }
    
    const db = c.get('db') as DatabaseService
    
    // ✅ MIGRATION D1: Vérifier si l'utilisateur existe déjà
    let dbUser = await db.getUserByEmail(payload.email)
    // Note: apple_id field doesn't exist in schema, will add later
    
    if (!dbUser) {
      // Créer un nouvel utilisateur
      const userId = crypto.randomUUID().replace(/-/g, '') // Format D1 (sans tirets)
      const userData = {
        id: userId,
        email: payload.email,
        name: userName,
        phone: '', // À remplir plus tard
        avatar_url: null,
        kyc_status: 'VERIFIED', // 🚀 BETA MODE: Auto-approve
        rating: 0,
        reviews_count: 0,
        created_at: new Date().toISOString()
      }
      
      // ✅ MIGRATION D1: Sauvegarder dans D1 uniquement
      dbUser = await db.createUser(userData)
      console.log('✅ Apple user created in D1:', userId)
      
      // 📧 Envoyer email de bienvenue
      try {
        const resendKey = c.env?.RESEND_API_KEY
        const emailHtml = EmailTemplates.welcome(dbUser.name)
        await sendEmail(dbUser.email, '👋 Bienvenue sur Amanah GO !', emailHtml, resendKey)
      } catch (emailError) {
        console.error('Erreur envoi email bienvenue:', emailError)
      }
    }
    
    // Générer JWT token
    const secret = getJWTSecret(c.env)
    const token = await sign(
      {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        exp: Math.floor(Date.now() / 1000) + JWT_EXPIRATION_SECONDS
      },
      secret
    )
    
    // Rediriger vers le dashboard avec le token
    return c.redirect(`/voyageur?token=${token}`)
    
  } catch (error: any) {
    console.error('Erreur OAuth Apple:', error)
    return c.redirect('/login?error=oauth_failed')
  }
})

// ==========================================
// OAUTH FACEBOOK - Authentification
// ==========================================

// Rediriger vers Facebook OAuth
app.get('/api/auth/facebook', (c) => {
  const facebookAppId = c.env?.FACEBOOK_APP_ID || 'YOUR_FACEBOOK_APP_ID'
  const redirectUri = `${c.req.url.split('/api')[0]}/api/auth/facebook/callback`
  
  const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
    `client_id=${facebookAppId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=email,public_profile` +
    `&response_type=code`
  
  return c.redirect(facebookAuthUrl)
})

// Callback Facebook OAuth
app.get('/api/auth/facebook/callback', async (c) => {
  try {
    const code = c.req.query('code')
    if (!code) {
      return c.redirect('/login?error=oauth_failed')
    }
    
    const facebookAppId = c.env?.FACEBOOK_APP_ID || 'YOUR_FACEBOOK_APP_ID'
    const facebookAppSecret = c.env?.FACEBOOK_APP_SECRET || 'YOUR_FACEBOOK_APP_SECRET'
    const redirectUri = `${c.req.url.split('/api')[0]}/api/auth/facebook/callback`
    
    // Échanger le code contre un access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${facebookAppId}` +
      `&client_secret=${facebookAppSecret}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&code=${code}`
    )
    
    const tokenData = await tokenResponse.json()
    if (!tokenData.access_token) {
      return c.redirect('/login?error=oauth_failed')
    }
    
    // Récupérer les infos utilisateur
    const userResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tokenData.access_token}`
    )
    
    const facebookUser = await userResponse.json()
    
    if (!facebookUser.email) {
      return c.redirect('/login?error=email_required')
    }
    
    const db = c.get('db') as DatabaseService
    
    // ✅ MIGRATION D1: Vérifier si l'utilisateur existe déjà
    let user = await db.getUserByEmail(facebookUser.email)
    if (!user) {
      user = await db.getUserByFacebookId(facebookUser.id)
    }
    
    if (!user) {
      // Créer un nouvel utilisateur
      const userId = crypto.randomUUID().replace(/-/g, '') // Format D1 (sans tirets)
      const userData = {
        id: userId,
        email: facebookUser.email,
        name: facebookUser.name,
        phone: '', // À remplir plus tard
        avatar_url: facebookUser.picture?.data?.url,
        facebook_id: facebookUser.id,
        kyc_status: 'VERIFIED', // 🚀 BETA MODE: Auto-approve
        rating: 0,
        reviews_count: 0,
        created_at: new Date().toISOString()
      }
      
      // ✅ MIGRATION D1: Sauvegarder dans D1 uniquement
      user = await db.createUser(userData)
      console.log('✅ Facebook user created in D1:', userId)
      
      // 📧 Envoyer email de bienvenue
      try {
        const resendKey = c.env?.RESEND_API_KEY
        const emailHtml = EmailTemplates.welcome(user.name)
        await sendEmail(user.email, '👋 Bienvenue sur Amanah GO !', emailHtml, resendKey)
      } catch (emailError) {
        console.error('Erreur envoi email bienvenue:', emailError)
      }
    }
    
    // Générer JWT token
    const secret = getJWTSecret(c.env)
    const token = await sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        exp: Math.floor(Date.now() / 1000) + JWT_EXPIRATION_SECONDS
      },
      secret
    )
    
    // Rediriger vers le dashboard avec le token
    return c.redirect(`/voyageur?token=${token}`)
    
  } catch (error: any) {
    console.error('Erreur OAuth Facebook:', error)
    return c.redirect('/login?error=oauth_failed')
  }
})

// Envoyer email de vérification
app.post('/api/auth/send-verification-email', async (c) => {
  const { DB } = c.env
  
  try {
    const { email, userId } = await c.req.json()
    
    // Validation
    if (!email || !userId) {
      return c.json({ 
        success: false, 
        error: 'Email et userId requis' 
      }, 400)
    }
    
    // Récupérer l'utilisateur
    const user = await DB.prepare('SELECT * FROM users WHERE id = ? AND email = ?')
      .bind(userId, email)
      .first()
    
    if (!user) {
      return c.json({ 
        success: false, 
        error: 'Utilisateur introuvable' 
      }, 404)
    }
    
    // Générer code à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // TODO: Stocker le code en DB avec expiration 10 minutes
    // Pour l'instant, on le log juste
    console.log(`📧 Code de vérification email pour ${email}: ${code}`)
    
    // Envoyer l'email
    const resendKey = c.env?.RESEND_API_KEY
    const emailHtml = EmailTemplates.emailVerification(user.name, code)
    const emailSent = await sendEmail(
      email, 
      '📧 Vérification de votre email - Amanah GO', 
      emailHtml, 
      resendKey
    )
    
    if (!emailSent && resendKey) {
      return c.json({ 
        success: false, 
        error: 'Échec de l\'envoi de l\'email' 
      }, 500)
    }
    
    return c.json({ 
      success: true, 
      message: 'Email de vérification envoyé',
      code: resendKey ? undefined : code, // DEV ONLY: renvoie le code si Resend n'est pas configuré
      dev_mode: !resendKey
    })
    
  } catch (error: any) {
    console.error('❌ Erreur send-verification-email:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Envoyer SMS de vérification
// Upload photo KYC (selfie ou document)
app.post('/api/auth/upload-kyc', async (c) => {
  const { R2 } = c.env
  
  try {
    // DEPRECATED - Use /api/auth/verify-kyc instead
    return c.json({ success: false, error: 'Utilisez /api/auth/verify-kyc' }, 400)
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Vérification KYC complète (selfie + ID + comparaison faciale)
app.post('/api/auth/verify-kyc', async (c) => {
  const { DB, R2, AI } = c.env
  
  try {
    const formData = await c.req.formData()
    const selfie = formData.get('selfie')
    const idDocument = formData.get('id_document')
    const userId = formData.get('user_id')
    
    if (!selfie || !idDocument || !userId) {
      return c.json({ 
        success: false, 
        error: 'Selfie, pièce d\'identité et user_id requis' 
      }, 400)
    }
    
    // ✅ MIGRATION D1: Vérifier que l'utilisateur existe
    if (!DB) {
      return c.json({ success: false, error: 'Database not available' }, 500)
    }
    // Chercher par firebase_uid d'abord, puis par id
    let user = await DB.prepare('SELECT * FROM users WHERE firebase_uid = ?').bind(userId).first()
    if (!user) {
      user = await DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first()
    }
    
    if (!user) {
      return c.json({ success: false, error: 'Utilisateur introuvable' }, 404)
    }
    
    // 1. Upload du selfie vers R2 (ou simulation en dev)
    const selfieKey = `kyc/${userId}/selfie-${Date.now()}.jpg`
    const selfieBuffer = await selfie.arrayBuffer()
    
    if (R2) {
      await R2.put(selfieKey, selfieBuffer, {
        httpMetadata: { contentType: 'image/jpeg' }
      })
      console.log('✅ Selfie uploadé vers R2:', selfieKey)
    } else {
      console.log('⚠️ R2 non disponible - Selfie simulé:', selfieKey)
    }
    
    // 2. Upload de la pièce d'identité vers R2 (ou simulation en dev)
    const idKey = `kyc/${userId}/id-${Date.now()}.jpg`
    const idBuffer = await idDocument.arrayBuffer()
    
    if (R2) {
      await R2.put(idKey, idBuffer, {
        httpMetadata: { contentType: 'image/jpeg' }
      })
      console.log('✅ ID uploadé vers R2:', idKey)
    } else {
      console.log('⚠️ R2 non disponible - ID simulé:', idKey)
    }
    
    // 3. Comparaison faciale avec Cloudflare AI
    let faceMatch = false
    let similarity = 0
    let aiError = null
    
    try {
      if (AI) {
        console.log('🤖 Lancement comparaison faciale Cloudflare AI...')
        
        // Convertir les images en base64 pour l'AI
        const selfieArray = new Uint8Array(selfieBuffer)
        const idArray = new Uint8Array(idBuffer)
        
        // Utiliser le modèle de détection de visages
        // @cf/microsoft/resnet-50 pour extraction de features
        const selfieAnalysis = await AI.run('@cf/microsoft/resnet-50', {
          image: Array.from(selfieArray)
        })
        
        const idAnalysis = await AI.run('@cf/microsoft/resnet-50', {
          image: Array.from(idArray)
        })
        
        // Calculer la similarité cosine entre les embeddings
        similarity = calculateCosineSimilarity(
          selfieAnalysis.data,
          idAnalysis.data
        )
        
        console.log(`📊 Similarité calculée: ${similarity}`)
        
        // Seuil de validation : 0.75 (75% de similarité)
        faceMatch = similarity >= 0.75
        
        if (faceMatch) {
          console.log('✅ Visages correspondent ! KYC validé automatiquement')
        } else {
          console.log('⚠️ Visages ne correspondent pas assez - Vérification manuelle requise')
        }
      } else {
        // Mode DEV sans Cloudflare AI - Simulation
        console.log('⚠️ Cloudflare AI non disponible - Mode MOCK')
        faceMatch = true
        similarity = 0.85 // Simulé pour dev
      }
      
    } catch (aiErrorCaught) {
      console.error('❌ Erreur AI:', aiErrorCaught)
      aiError = aiErrorCaught.message
      // Mode fallback : validation manuelle
      console.log('⚠️ Fallback: Vérification manuelle sera nécessaire')
      faceMatch = false
      similarity = 0
    }
    
    // 4. Mettre à jour le statut KYC de l'utilisateur
    // faceMatch=true means auto-VERIFIED, otherwise SUBMITTED (pending manual admin review)
    const kycStatus = faceMatch ? 'VERIFIED' : 'SUBMITTED'

    if (DB) {
      // Use user.id (D1 primary key), NOT userId (which may be a firebase_uid)
      await DB.prepare(`
        UPDATE users
        SET kyc_status = ?,
            kyc_selfie_url = ?,
            kyc_document_url = ?,
            kyc_verified_at = datetime('now'),
            updated_at = datetime('now')
        WHERE id = ?
      `).bind(kycStatus, selfieKey, idKey, (user as any).id).run()
    }
    
    // 📧 Envoyer email si KYC vérifié
    if (faceMatch && kycStatus === 'VERIFIED') {
      try {
        const resendKey = c.env?.RESEND_API_KEY
        const userEmail = user.email
        const emailHtml = EmailTemplates.kycVerified(user.name)
        await sendEmail(userEmail, '✅ Votre identité a été vérifiée !', emailHtml, resendKey)
      } catch (emailError) {
        console.error('Erreur envoi email KYC:', emailError)
      }
    }
    
    return c.json({ 
      success: true, 
      message: faceMatch 
        ? 'Vérification KYC réussie ! Votre compte est maintenant vérifié.' 
        : 'Documents reçus. Vérification manuelle en cours.',
      kyc_status: kycStatus,
      face_match: faceMatch,
      similarity: similarity
    })
    
  } catch (error) {
    console.error('Erreur KYC:', error)
    return c.json({ 
      success: false, 
      error: error.message || 'Erreur lors de la vérification KYC' 
    }, 500)
  }
})

// 🔧 DEBUG USER ENDPOINT (temporary - remove in production!)
app.get('/api/debug/user/:email', async (c) => {
  try {
    const email = c.req.param('email')
    const db = c.get('db') as DatabaseService
    const user = await db.getUserByEmail(email)
    
    if (!user) {
      return c.json({
        success: false,
        message: 'User not found',
        email_searched: email
      }, 404)
    }
    
    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        has_password_hash: !!user.password_hash,
        password_hash_length: user.password_hash?.length || 0,
        password_hash_preview: user.password_hash?.substring(0, 20) + '...',
        kyc_status: user.kyc_status,
        created_at: user.created_at
      }
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

// 🔧 DEBUG LOGIN ENDPOINT (temporary)
app.post('/api/auth/login/debug', async (c) => {
  try {
    const { email, password } = await c.req.json()
    const db = c.get('db') as DatabaseService
    
    // 1) Chercher l'utilisateur
    const user = await db.getUserByEmail(email)
    
    if (!user) {
      return c.json({
        success: false,
        debug: {
          step: 'user_lookup',
          email_searched: email,
          user_found: false,
          message: 'Utilisateur introuvable dans D1'
        }
      }, 404)
    }
    
    // 2) Vérifier le hash
    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    
    return c.json({
      success: passwordMatch,
      debug: {
        step: 'password_verification',
        user_found: true,
        user_id: user.id,
        user_email: user.email,
        has_password_hash: !!user.password_hash,
        password_hash_length: user.password_hash?.length || 0,
        password_hash_starts_with: user.password_hash?.substring(0, 7),
        password_match: passwordMatch,
        message: passwordMatch ? '✅ Mot de passe correct' : '❌ Mot de passe incorrect'
      }
    })
  } catch (error: any) {
    return c.json({
      success: false,
      debug: {
        step: 'error',
        error: error.message
      }
    }, 500)
  }
})

// Login
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    console.log('🔍 Login attempt:', { email, passwordLength: password?.length })
    
    // Validation
    if (!email || !password) {
      return c.json({ success: false, error: 'Email et mot de passe requis' }, 400)
    }
    
    // ✅ MIGRATION D1: Trouver l'utilisateur
    const db = c.get('db') as DatabaseService
    const user = await db.getUserByEmail(email)
    
    console.log('🔍 User found in DB:', user ? { id: user.id, email: user.email, has_password: !!user.password_hash } : 'NOT FOUND')
    
    if (!user) {
      console.error('❌ User not found for email:', email)
      return c.json({ success: false, error: 'Email ou mot de passe incorrect' }, 401)
    }
    
    // Vérifier le mot de passe avec bcrypt
    console.log('🔍 Comparing password...')
    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    console.log('🔍 Password match:', passwordMatch)
    
    if (!passwordMatch) {
      console.error('❌ Password mismatch for user:', user.email)
      return c.json({ success: false, error: 'Email ou mot de passe incorrect' }, 401)
    }
    
    // Générer JWT token
    const secret = getJWTSecret(c.env)
    const token = await sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        exp: Math.floor(Date.now() / 1000) + JWT_EXPIRATION_SECONDS
      },
      secret
    )
    
    console.log('✅ Login successful for:', user.email)
    
    return c.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        kyc_status: user.kyc_status,
        rating: user.rating
      },
      token,
      message: 'Connexion réussie'
    })
    
  } catch (error: any) {
    console.error('❌ Login error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

/**
 * API: GET /api/auth/me
 * Récupérer le profil de l'utilisateur connecté (route protégée)
 */
app.get('/api/auth/me', authMiddleware, async (c) => {
  const user = c.get('user')
  
  return c.json({
    success: true,
    user
  })
})

/**
 * API: POST /api/auth/verify-token
 * Vérifier la validité d'un token
 */
app.post('/api/auth/verify-token', async (c) => {
  try {
    const { token } = await c.req.json()
    
    if (!token) {
      return c.json({ valid: false, error: 'Token manquant' }, 400)
    }
    
    const secret = getJWTSecret(c.env)
    const payload = await verify(token, secret)
    
    if (!payload || !payload.id) {
      return c.json({ valid: false, error: 'Token invalide' }, 401)
    }
    
    return c.json({ 
      valid: true,
      user: {
        id: payload.id,
        email: payload.email,
        name: payload.name
      }
    })
    
  } catch (error: any) {
    return c.json({ valid: false, error: 'Token invalide ou expiré' }, 401)
  }
})

// ==========================================
// AIRPORTS & FLIGHTS API
// ==========================================

// Search airports (autocomplete)
app.get('/api/airports/search', async (c) => {
  const { DB } = c.env
  const query = c.req.query('q') || ''
  const country = c.req.query('country')
  
  try {
    let sql = `
      SELECT iata_code, name, city, country, latitude, longitude
      FROM airports
      WHERE active = 1
        AND (
          name LIKE ? OR 
          city LIKE ? OR 
          iata_code LIKE ?
        )
    `
    const searchTerm = `%${query}%`
    const params = [searchTerm, searchTerm, searchTerm]
    
    if (country) {
      sql += ' AND country = ?'
      params.push(country)
    }
    
    sql += ' ORDER BY city ASC LIMIT 10'
    
    const { results } = await DB.prepare(sql).bind(...params).all()
    
    return c.json({ 
      success: true, 
      airports: results 
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get all airports by country
app.get('/api/airports/country/:country', async (c) => {
  const { DB } = c.env
  const country = c.req.param('country')
  
  try {
    const { results } = await DB.prepare(`
      SELECT iata_code, name, city, country, latitude, longitude
      FROM airports
      WHERE active = 1 AND country = ?
      ORDER BY city ASC
    `).bind(country).all()
    
    return c.json({ 
      success: true, 
      airports: results 
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get airport details
app.get('/api/airports/:iata', async (c) => {
  const { DB } = c.env
  const iata = c.req.param('iata').toUpperCase()
  
  try {
    const airport = await DB.prepare(`
      SELECT *
      FROM airports
      WHERE iata_code = ?
    `).bind(iata).first()
    
    if (!airport) {
      return c.json({ success: false, error: 'Aéroport non trouvé' }, 404)
    }
    
    return c.json({ 
      success: true, 
      airport 
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Search flights (mock/cache - real API to be implemented)
app.get('/api/flights/search', async (c) => {
  const { DB } = c.env
  const from = c.req.query('from')
  const to = c.req.query('to')
  const date = c.req.query('date')
  
  try {
    // TODO: Call real flight API (AviationStack, FlightAware, etc.)
    // For now, return mock data or cached flights
    
    const { results } = await DB.prepare(`
      SELECT *
      FROM flight_cache
      WHERE departure_airport = ? 
        AND arrival_airport = ?
        AND date(departure_time) = date(?)
        AND expires_at > datetime('now')
      ORDER BY departure_time ASC
      LIMIT 20
    `).bind(from, to, date).all()
    
    // Si aucun résultat en cache, retourner des données simulées
    if (results.length === 0) {
      return c.json({
        success: true,
        flights: generateMockFlights(from, to, date),
        source: 'mock'
      })
    }
    
    return c.json({ 
      success: true, 
      flights: results,
      source: 'cache'
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Import flight by number
app.get('/api/flights/:flightNumber', async (c) => {
  const flightNumber = c.req.param('flightNumber')
  
  try {
    // TODO: Call real flight tracking API
    // For now, return mock data
    
    const mockFlight = {
      flight_number: flightNumber,
      airline_name: 'Royal Air Maroc',
      airline_iata: 'AT',
      departure_airport: 'CDG',
      departure_city: 'Paris',
      arrival_airport: 'CMN',
      arrival_city: 'Casablanca',
      departure_time: new Date(Date.now() + 24*60*60*1000).toISOString(),
      arrival_time: new Date(Date.now() + 27*60*60*1000).toISOString(),
      flight_status: 'scheduled',
      aircraft_type: 'Boeing 737'
    }
    
    return c.json({
      success: true,
      flight: mockFlight,
      source: 'mock'
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Helper function to generate mock flights
function generateMockFlights(from: string, to: string, date: string) {
  const airlines = [
    { iata: 'AT', name: 'Royal Air Maroc' },
    { iata: 'AF', name: 'Air France' },
    { iata: 'TO', name: 'Transavia' },
    { iata: 'FR', name: 'Ryanair' }
  ]
  
  const flights = []
  const baseDate = new Date(date + 'T00:00:00')
  
  for (let i = 0; i < 5; i++) {
    const airline = airlines[i % airlines.length]
    const departureHour = 8 + (i * 3)
    const flightDuration = 3.5 // hours
    
    const departureTime = new Date(baseDate)
    departureTime.setHours(departureHour)
    
    const arrivalTime = new Date(departureTime)
    arrivalTime.setHours(arrivalTime.getHours() + flightDuration)
    
    flights.push({
      flight_number: `${airline.iata}${1000 + i}`,
      airline_name: airline.name,
      airline_iata: airline.iata,
      departure_airport: from,
      arrival_airport: to,
      departure_time: departureTime.toISOString(),
      arrival_time: arrivalTime.toISOString(),
      flight_status: 'scheduled',
      aircraft_type: 'Boeing 737'
    })
  }
  
  return flights
}

// ==========================================
// PAGES PLACEHOLDER
// ==========================================

// ==========================================
// PAGES LÉGALES
// ==========================================

app.get('/cgu', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Conditions Générales d'Utilisation — Amanah GO</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-50 text-gray-800">
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
      <a href="/" class="flex items-center space-x-2">
        <span class="text-2xl font-bold text-blue-600">Amanah GO</span>
      </a>
      <a href="/" class="text-gray-600 hover:text-blue-600 text-sm"><i class="fas fa-arrow-left mr-1"></i>Retour</a>
    </div>
  </header>
  <main class="max-w-4xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold mb-2">Conditions Générales d'Utilisation</h1>
    <p class="text-gray-500 text-sm mb-8">Dernière mise à jour : 1er avril 2025</p>

    <div class="prose max-w-none space-y-8">
      <section>
        <h2 class="text-xl font-semibold mb-3">1. Objet</h2>
        <p>Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent l'accès et l'utilisation de la plateforme Amanah GO (ci-après « la Plateforme »), accessible à l'adresse <strong>amanahgo.app</strong>, exploitée par Amanah GO SAS (ci-après « la Société »).</p>
        <p class="mt-2">Amanah GO est une plateforme de mise en relation entre des <strong>voyageurs</strong> effectuant des trajets entre la France et le Maroc et des <strong>expéditeurs</strong> souhaitant faire transporter des colis.</p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">2. Acceptation des CGU</h2>
        <p>L'utilisation de la Plateforme implique l'acceptation pleine et entière des présentes CGU. Si vous n'acceptez pas ces conditions, vous devez cesser immédiatement d'utiliser la Plateforme.</p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">3. Inscription et compte utilisateur</h2>
        <p>Pour accéder aux services de la Plateforme, l'utilisateur doit créer un compte en fournissant des informations exactes, complètes et à jour. L'utilisateur est responsable de la confidentialité de ses identifiants.</p>
        <p class="mt-2">Amanah GO se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU, de fraude, ou d'utilisation abusive de la Plateforme.</p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">4. Vérification d'identité (KYC)</h2>
        <p>Pour des raisons légales et de sécurité, tout utilisateur souhaitant publier un trajet ou expédier un colis doit compléter une procédure de vérification d'identité (Know Your Customer). Cette procédure implique la fourniture d'une pièce d'identité valide et d'un selfie.</p>
        <p class="mt-2">Les documents fournis sont traités conformément à notre <a href="/confidentialite" class="text-blue-600 hover:underline">Politique de Confidentialité</a>.</p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">5. Services proposés</h2>
        <p>La Plateforme permet :</p>
        <ul class="list-disc list-inside mt-2 space-y-1 text-gray-700">
          <li>Aux <strong>voyageurs</strong> de publier leurs trajets et d'accepter des colis contre rémunération</li>
          <li>Aux <strong>expéditeurs</strong> de publier des colis et de trouver un voyageur pour les transporter</li>
          <li>La gestion des paiements sécurisés via Stripe</li>
          <li>Un système de messagerie entre les parties</li>
          <li>Un système de notation et d'avis</li>
        </ul>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">6. Obligations des utilisateurs</h2>
        <p>L'utilisateur s'engage à :</p>
        <ul class="list-disc list-inside mt-2 space-y-1 text-gray-700">
          <li>Ne transporter aucun objet illicite, dangereux ou interdit à l'importation/exportation</li>
          <li>Respecter les réglementations douanières en vigueur entre la France et le Maroc</li>
          <li>Fournir des informations exactes sur les colis (nature, poids, valeur déclarée)</li>
          <li>Ne pas utiliser la Plateforme à des fins frauduleuses</li>
        </ul>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">7. Responsabilités</h2>
        <p>Amanah GO agit en qualité d'intermédiaire technique et ne peut être tenu responsable :</p>
        <ul class="list-disc list-inside mt-2 space-y-1 text-gray-700">
          <li>Des dommages subis par les colis durant le transport</li>
          <li>De tout litige entre voyageurs et expéditeurs</li>
          <li>Des infractions douanières commises par les utilisateurs</li>
        </ul>
        <p class="mt-2">Chaque utilisateur est personnellement responsable du respect des lois applicables.</p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">8. Tarifs et paiements</h2>
        <p>Les paiements sont traités par <strong>Stripe</strong>, prestataire de services de paiement agréé. Amanah GO prélève une commission de service sur chaque transaction. Les tarifs en vigueur sont affichés sur la Plateforme avant toute confirmation.</p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">9. Propriété intellectuelle</h2>
        <p>Tous les éléments de la Plateforme (logo, textes, design, code source) sont la propriété exclusive de Amanah GO SAS et sont protégés par les lois sur la propriété intellectuelle. Toute reproduction sans autorisation est interdite.</p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">10. Modification des CGU</h2>
        <p>Amanah GO se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des modifications par email ou notification dans l'application. L'utilisation continue de la Plateforme après modification vaut acceptation des nouvelles CGU.</p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">11. Droit applicable et juridiction</h2>
        <p>Les présentes CGU sont régies par le droit français. Tout litige relatif à leur interprétation ou exécution sera soumis aux tribunaux compétents de Paris.</p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">12. Contact</h2>
        <p>Pour toute question relative aux présentes CGU : <a href="mailto:contact@amanahgo.app" class="text-blue-600 hover:underline">contact@amanahgo.app</a></p>
      </section>
    </div>
  </main>
  <footer class="bg-gray-900 text-white py-6 mt-16">
    <div class="max-w-4xl mx-auto px-4 text-center">
      <div class="flex justify-center space-x-6 mb-3 text-sm">
        <a href="/cgu" class="text-blue-400 font-medium">CGU</a>
        <a href="/confidentialite" class="hover:text-blue-400">Confidentialité</a>
        <a href="/mentions-legales" class="hover:text-blue-400">Mentions légales</a>
      </div>
      <p class="text-gray-400 text-sm">© 2025 Amanah GO. Tous droits réservés.</p>
    </div>
  </footer>
</body>
</html>`)
})

app.get('/confidentialite', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Politique de Confidentialité — Amanah GO</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-50 text-gray-800">
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
      <a href="/" class="flex items-center space-x-2">
        <span class="text-2xl font-bold text-blue-600">Amanah GO</span>
      </a>
      <a href="/" class="text-gray-600 hover:text-blue-600 text-sm"><i class="fas fa-arrow-left mr-1"></i>Retour</a>
    </div>
  </header>
  <main class="max-w-4xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold mb-2">Politique de Confidentialité</h1>
    <p class="text-gray-500 text-sm mb-8">Dernière mise à jour : 1er avril 2025 — Conforme au RGPD (Règlement UE 2016/679)</p>

    <div class="prose max-w-none space-y-8">
      <section>
        <h2 class="text-xl font-semibold mb-3">1. Responsable du traitement</h2>
        <p><strong>Amanah GO SAS</strong><br>
        Email : <a href="mailto:privacy@amanahgo.app" class="text-blue-600 hover:underline">privacy@amanahgo.app</a></p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">2. Données collectées</h2>
        <p>Nous collectons les données suivantes :</p>
        <ul class="list-disc list-inside mt-2 space-y-1 text-gray-700">
          <li><strong>Données d'identité :</strong> nom, prénom, date de naissance (pour la vérification KYC)</li>
          <li><strong>Données de contact :</strong> adresse email, numéro de téléphone</li>
          <li><strong>Documents d'identité :</strong> photo de pièce d'identité, selfie (pour la vérification KYC uniquement)</li>
          <li><strong>Données de transaction :</strong> historique des trajets, colis, paiements</li>
          <li><strong>Données de connexion :</strong> adresse IP, type de navigateur, logs de connexion</li>
          <li><strong>Données de localisation :</strong> villes de départ et d'arrivée des trajets</li>
        </ul>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">3. Finalités du traitement</h2>
        <div class="overflow-x-auto mt-2">
          <table class="w-full text-sm border-collapse border border-gray-200">
            <thead class="bg-gray-100">
              <tr>
                <th class="border border-gray-200 px-3 py-2 text-left">Finalité</th>
                <th class="border border-gray-200 px-3 py-2 text-left">Base légale</th>
                <th class="border border-gray-200 px-3 py-2 text-left">Durée de conservation</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="border border-gray-200 px-3 py-2">Création et gestion de compte</td><td class="border border-gray-200 px-3 py-2">Exécution du contrat</td><td class="border border-gray-200 px-3 py-2">Durée du compte + 3 ans</td></tr>
              <tr class="bg-gray-50"><td class="border border-gray-200 px-3 py-2">Vérification d'identité (KYC)</td><td class="border border-gray-200 px-3 py-2">Obligation légale</td><td class="border border-gray-200 px-3 py-2">5 ans après clôture du compte</td></tr>
              <tr><td class="border border-gray-200 px-3 py-2">Traitement des paiements</td><td class="border border-gray-200 px-3 py-2">Exécution du contrat</td><td class="border border-gray-200 px-3 py-2">10 ans (obligations comptables)</td></tr>
              <tr class="bg-gray-50"><td class="border border-gray-200 px-3 py-2">Sécurité et prévention des fraudes</td><td class="border border-gray-200 px-3 py-2">Intérêt légitime</td><td class="border border-gray-200 px-3 py-2">12 mois</td></tr>
              <tr><td class="border border-gray-200 px-3 py-2">Amélioration du service</td><td class="border border-gray-200 px-3 py-2">Consentement</td><td class="border border-gray-200 px-3 py-2">Jusqu'au retrait du consentement</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">4. Destinataires des données</h2>
        <p>Vos données peuvent être partagées avec :</p>
        <ul class="list-disc list-inside mt-2 space-y-1 text-gray-700">
          <li><strong>Stripe Inc.</strong> — traitement des paiements (États-Unis, clauses contractuelles types)</li>
          <li><strong>Google Firebase</strong> — authentification (États-Unis, clauses contractuelles types)</li>
          <li><strong>Cloudflare Inc.</strong> — hébergement, stockage des documents (États-Unis, clauses contractuelles types)</li>
          <li><strong>Autorités compétentes</strong> — sur requête légale obligatoire</li>
        </ul>
        <p class="mt-2">Nous ne vendons jamais vos données à des tiers à des fins commerciales.</p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">5. Vos droits (RGPD)</h2>
        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
        <ul class="list-disc list-inside mt-2 space-y-1 text-gray-700">
          <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
          <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
          <li><strong>Droit à l'effacement :</strong> supprimer vos données (sous conditions légales)</li>
          <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
          <li><strong>Droit d'opposition :</strong> vous opposer à certains traitements</li>
          <li><strong>Droit à la limitation :</strong> suspendre temporairement un traitement</li>
        </ul>
        <p class="mt-3">Pour exercer ces droits : <a href="mailto:privacy@amanahgo.app" class="text-blue-600 hover:underline">privacy@amanahgo.app</a></p>
        <p class="mt-2">Vous pouvez également introduire une réclamation auprès de la <strong>CNIL</strong> : <a href="https://www.cnil.fr" class="text-blue-600 hover:underline" target="_blank">www.cnil.fr</a></p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">6. Sécurité des données</h2>
        <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement des communications (HTTPS/TLS), stockage sécurisé sur Cloudflare R2 avec accès restreint, authentification à deux facteurs disponible.</p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">7. Cookies</h2>
        <p>Amanah GO utilise des cookies techniques nécessaires au fonctionnement du service (sessions, authentification). Aucun cookie publicitaire n'est utilisé.</p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">8. Contact</h2>
        <p>Délégué à la Protection des Données (DPO) : <a href="mailto:privacy@amanahgo.app" class="text-blue-600 hover:underline">privacy@amanahgo.app</a></p>
      </section>
    </div>
  </main>
  <footer class="bg-gray-900 text-white py-6 mt-16">
    <div class="max-w-4xl mx-auto px-4 text-center">
      <div class="flex justify-center space-x-6 mb-3 text-sm">
        <a href="/cgu" class="hover:text-blue-400">CGU</a>
        <a href="/confidentialite" class="text-blue-400 font-medium">Confidentialité</a>
        <a href="/mentions-legales" class="hover:text-blue-400">Mentions légales</a>
      </div>
      <p class="text-gray-400 text-sm">© 2025 Amanah GO. Tous droits réservés.</p>
    </div>
  </footer>
</body>
</html>`)
})

app.get('/mentions-legales', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mentions Légales — Amanah GO</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-50 text-gray-800">
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
      <a href="/" class="flex items-center space-x-2">
        <span class="text-2xl font-bold text-blue-600">Amanah GO</span>
      </a>
      <a href="/" class="text-gray-600 hover:text-blue-600 text-sm"><i class="fas fa-arrow-left mr-1"></i>Retour</a>
    </div>
  </header>
  <main class="max-w-4xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold mb-2">Mentions Légales</h1>
    <p class="text-gray-500 text-sm mb-8">Conformément aux articles 6-III et 19 de la Loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN)</p>

    <div class="prose max-w-none space-y-8">
      <section>
        <h2 class="text-xl font-semibold mb-3">1. Éditeur du site</h2>
        <div class="bg-white rounded-lg border border-gray-200 p-4 text-sm space-y-1">
          <p><strong>Raison sociale :</strong> Amanah GO SAS</p>
          <p><strong>Forme juridique :</strong> Société par Actions Simplifiée (SAS)</p>
          <p><strong>Capital social :</strong> En cours de constitution</p>
          <p><strong>Email :</strong> <a href="mailto:contact@amanahgo.app" class="text-blue-600 hover:underline">contact@amanahgo.app</a></p>
          <p><strong>Directeur de la publication :</strong> Gérant de Amanah GO SAS</p>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">2. Hébergement</h2>
        <div class="bg-white rounded-lg border border-gray-200 p-4 text-sm space-y-1">
          <p><strong>Hébergeur :</strong> Cloudflare, Inc.</p>
          <p><strong>Adresse :</strong> 101 Townsend St, San Francisco, CA 94107, États-Unis</p>
          <p><strong>Site :</strong> <a href="https://www.cloudflare.com" class="text-blue-600 hover:underline" target="_blank">www.cloudflare.com</a></p>
          <p><strong>Services utilisés :</strong> Cloudflare Workers, Cloudflare Pages, Cloudflare D1, Cloudflare R2</p>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">3. Propriété intellectuelle</h2>
        <p>L'ensemble du contenu du site Amanah GO (textes, images, logos, icônes, code source, architecture) est protégé par le droit d'auteur et appartient à Amanah GO SAS ou à ses partenaires. Toute reproduction, représentation, modification ou exploitation sans autorisation expresse est strictement interdite.</p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">4. Données personnelles</h2>
        <p>Le traitement des données personnelles des utilisateurs est décrit dans notre <a href="/confidentialite" class="text-blue-600 hover:underline">Politique de Confidentialité</a>.</p>
        <p class="mt-2">Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données en contactant : <a href="mailto:privacy@amanahgo.app" class="text-blue-600 hover:underline">privacy@amanahgo.app</a></p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">5. Cookies</h2>
        <p>Ce site utilise des cookies techniques nécessaires à son fonctionnement. Pour en savoir plus, consultez notre <a href="/confidentialite" class="text-blue-600 hover:underline">Politique de Confidentialité</a>.</p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">6. Liens hypertextes</h2>
        <p>Amanah GO ne peut être tenu responsable du contenu des sites tiers vers lesquels des liens sont établis depuis la Plateforme.</p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">7. Droit applicable</h2>
        <p>Les présentes mentions légales sont soumises au droit français. Tout litige relatif à l'utilisation du site sera de la compétence exclusive des tribunaux de Paris.</p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">8. Contact</h2>
        <p>Pour toute question : <a href="mailto:contact@amanahgo.app" class="text-blue-600 hover:underline">contact@amanahgo.app</a></p>
      </section>
    </div>
  </main>
  <footer class="bg-gray-900 text-white py-6 mt-16">
    <div class="max-w-4xl mx-auto px-4 text-center">
      <div class="flex justify-center space-x-6 mb-3 text-sm">
        <a href="/cgu" class="hover:text-blue-400">CGU</a>
        <a href="/confidentialite" class="hover:text-blue-400">Confidentialité</a>
        <a href="/mentions-legales" class="text-blue-400 font-medium">Mentions légales</a>
      </div>
      <p class="text-gray-400 text-sm">© 2025 Amanah GO. Tous droits réservés.</p>
    </div>
  </footer>
</body>
</html>`)
})

/**
 * PAGE: Mot de passe oublié
 */
app.get('/forgot-password', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mot de passe oublié - Amanah GO</title>
        <link href="/static/tailwind.css" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <nav class="bg-white shadow-sm">
            <div class="max-w-7xl mx-auto px-4 py-4">
                <a href="/" class="flex items-center space-x-2">
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-16 w-auto">
                    <span class="text-2xl font-bold text-gray-900">Amanah GO</span>
                </a>
            </div>
        </nav>

        <div class="max-w-md mx-auto px-4 py-12">
            <div class="bg-white rounded-xl shadow-lg p-8">
                <div class="text-center mb-8">
                    <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <i class="fas fa-key text-blue-600 text-2xl"></i>
                    </div>
                    <h1 class="text-3xl font-bold text-gray-900 mb-2">Mot de passe oublié ?</h1>
                    <p class="text-gray-600">Entrez votre email pour recevoir un lien de réinitialisation</p>
                </div>

                <form id="resetForm" class="space-y-6">
                    <!-- Email -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Adresse email
                        </label>
                        <input type="email" id="email" required
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                               placeholder="exemple@email.com">
                    </div>

                    <!-- Messages -->
                    <div id="errorMessage" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        <i class="fas fa-exclamation-circle mr-2"></i>
                        <span id="errorText"></span>
                    </div>

                    <div id="successMessage" class="hidden bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                        <i class="fas fa-check-circle mr-2"></i>
                        <span id="successText"></span>
                    </div>

                    <!-- Bouton -->
                    <button type="submit" id="submitBtn"
                            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition">
                        <i class="fas fa-paper-plane mr-2"></i>
                        Envoyer le lien de réinitialisation
                    </button>
                </form>

                <!-- Retour connexion -->
                <div class="mt-6 text-center">
                    <a href="/login" class="text-blue-600 hover:underline text-sm">
                        <i class="fas fa-arrow-left mr-1"></i>
                        Retour à la connexion
                    </a>
                </div>
            </div>
        </div>

        <!-- Firebase COMPAT SDK -->
        <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
        <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js"></script>
        <script src="/static/firebase-compat.js?v=3"></script>

        <script>
          const form = document.getElementById('resetForm');
          const submitBtn = document.getElementById('submitBtn');
          const emailInput = document.getElementById('email');
          const errorMessage = document.getElementById('errorMessage');
          const errorText = document.getElementById('errorText');
          const successMessage = document.getElementById('successMessage');
          const successText = document.getElementById('successText');

          // Masquer les messages
          function hideMessages() {
            errorMessage.classList.add('hidden');
            successMessage.classList.add('hidden');
          }

          // Afficher erreur
          function showError(message) {
            hideMessages();
            errorText.textContent = message;
            errorMessage.classList.remove('hidden');
          }

          // Afficher succès
          function showSuccess(message) {
            hideMessages();
            successText.textContent = message;
            successMessage.classList.remove('hidden');
          }

          // Validation email
          function isValidEmail(email) {
            const re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
            return re.test(email);
          }

          // Soumission du formulaire
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideMessages();

            const email = emailInput.value.trim();

            // Validation
            if (!email) {
              showError('Veuillez entrer votre adresse email');
              return;
            }

            if (!isValidEmail(email)) {
              showError('Format d\\'email invalide');
              return;
            }

            // Désactiver le bouton
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Envoi en cours...';

            try {
              console.log('🔐 Sending password reset email to:', email);

              // Appeler Firebase pour envoyer l'email
              await window.firebaseAuth.sendPasswordResetEmail(email);

              console.log('✅ Password reset email sent');

              // Message de succès (ne pas révéler si le compte existe)
              showSuccess('Si un compte existe pour cet email, un lien de réinitialisation a été envoyé. Vérifiez votre boîte de réception.');

              // Vider le champ
              emailInput.value = '';

              // Rediriger vers login après 5 secondes
              setTimeout(() => {
                window.location.href = '/login';
              }, 5000);

            } catch (error) {
              console.error('❌ Password reset error:', error);

              let errorMessage = 'Une erreur est survenue. Veuillez réessayer.';

              // Gestion des erreurs spécifiques
              if (error.code === 'auth/invalid-email') {
                errorMessage = 'Format d\\'email invalide';
              } else if (error.code === 'auth/user-not-found') {
                // Ne pas révéler que le compte n'existe pas (sécurité)
                errorMessage = 'Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.';
                showSuccess(errorMessage);
                setTimeout(() => {
                  window.location.href = '/login';
                }, 5000);
                return;
              } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Trop de tentatives. Veuillez réessayer dans quelques minutes.';
              } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.';
              }

              showError(errorMessage);

              // Réactiver le bouton
              submitBtn.disabled = false;
              submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i> Envoyer le lien de réinitialisation';
            }
          });
        </script>
    </body>
    </html>
  `)
})

app.get('/login', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Connexion - Amanah GO</title>
        <link href="/static/tailwind.css" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <nav class="bg-white shadow-sm">
            <div class="max-w-7xl mx-auto px-4 py-4">
                <a href="/" class="flex items-center space-x-2">
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-16 w-auto">
                    <span class="text-2xl font-bold text-gray-900">Amanah GO</span>
                </a>
            </div>
        </nav>

        <!-- Firebase COMPAT SDK -->
        <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
        <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js"></script>
        <script src="/static/firebase-compat.js?v=3"></script>

        <div class="max-w-md mx-auto px-4 py-12">
            <div class="bg-white rounded-xl shadow-lg p-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Connexion</h1>
                <p class="text-gray-600 mb-8">Bienvenue sur Amanah GO</p>

                <form id="loginForm" class="space-y-6">
                    <!-- Email -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input type="email" id="email" required
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                               placeholder="exemple@email.com">
                    </div>

                    <!-- Mot de passe -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
                            <span>Mot de passe</span>
                            <a href="/forgot-password" class="text-blue-600 hover:underline text-sm">Mot de passe oublié ?</a>
                        </label>
                        <input type="password" id="password" required
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                               placeholder="Votre mot de passe">
                    </div>

                    <!-- Message d'erreur -->
                    <div id="errorMessage" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        <i class="fas fa-exclamation-circle mr-2"></i>
                        <span id="errorText"></span>
                    </div>

                    <!-- Bouton connexion -->
                    <button type="submit"
                            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition">
                        <i class="fas fa-sign-in-alt mr-2"></i>
                        Se connecter
                    </button>
                </form>

                <!-- Séparateur -->
                <div class="relative my-6">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-gray-300"></div>
                    </div>
                    <div class="relative flex justify-center text-sm">
                        <span class="px-2 bg-white text-gray-500">Ou continuer avec</span>
                    </div>
                </div>

                <!-- OAuth Buttons -->
                <div class="space-y-3">
                    <!-- Apple Sign In -->
                    <a href="/api/auth/apple"
                       class="w-full flex items-center justify-center px-4 py-3 bg-black hover:bg-gray-900 text-white rounded-lg transition cursor-pointer">
                        <i class="fab fa-apple text-white mr-2 text-xl"></i>
                        <span class="font-medium">Sign in with Apple</span>
                    </a>
                    
                    <!-- Google Sign In -->
                    <button onclick="signInWithGoogle()" type="button"
                       class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                        <i class="fab fa-google text-red-500 mr-2"></i>
                        <span class="font-medium text-gray-700">Continuer avec Google</span>
                    </button>
                    
                    <!-- Facebook Sign In -->
                    <button onclick="signInWithFacebook()" type="button"
                       class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                        <i class="fab fa-facebook text-blue-600 mr-2"></i>
                        <span class="font-medium text-gray-700">Continuer avec Facebook</span>
                    </button>
                </div>

                <!-- Lien inscription -->
                <p class="mt-6 text-center text-sm text-gray-600">
                    Vous n'avez pas de compte ?
                    <a href="/signup" class="text-blue-600 hover:underline font-medium">Créer un compte</a>
                </p>
            </div>
        </div>

        <script src="/static/auth.js"></script>
        <script src="/static/auth-ui.js"></script>
        <script>
          // Rediriger si déjà connecté
          auth.redirectIfAuthenticated();
          
          document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const submitBtn = e.target.querySelector('button[type="submit"]');
            
            // Désactiver le bouton pendant la requête
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Connexion...';
            
            console.log('🔍 Login attempt:', email);
            
            const result = await auth.login(email, password);
            
            console.log('🔍 Login result:', result);
            
            if (result && result.success) {
              console.log('✅ Login success! Token:', result.token?.substring(0, 20) + '...');
              console.log('✅ User:', result.user);
              
              // Récupérer le paramètre redirect
              const params = new URLSearchParams(window.location.search);
              const redirect = params.get('redirect') || '/voyageur';
              
              console.log('🔀 Redirecting to:', redirect);
              window.location.href = redirect;
            } else {
              console.error('❌ Login failed:', result?.error || 'Unknown error');
              showError(result?.error || 'Erreur de connexion');
              submitBtn.disabled = false;
              submitBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i> Se connecter';
            }
          });
          
          function showError(message) {
            document.getElementById('errorMessage').classList.remove('hidden');
            document.getElementById('errorText').textContent = message;
          }
          
          // ==========================================
          // OAUTH HANDLERS
          // ==========================================
          
          async function signInWithGoogle() {
            try {
              console.log('🔥 Google Sign In clicked')
              
              if (!window.loginWithGoogle) {
                throw new Error('Firebase Google Auth non disponible')
              }
              
              const result = await window.loginWithGoogle()
              
              if (result.success) {
                console.log('✅ Google login successful:', result.user)
                alert('✅ Connexion Google réussie !')
                window.location.href = '/verify-profile'
              } else {
                throw new Error(result.error || 'Échec de la connexion Google')
              }
            } catch (error) {
              console.error('❌ Google Sign In error:', error)
              alert('❌ Erreur Google Sign In: ' + error.message)
            }
          }
          
          async function signInWithFacebook() {
            try {
              console.log('🔥 Facebook Sign In clicked')
              alert('Facebook Sign In sera disponible prochainement !')
              // TODO: Implémenter Firebase OAuth Facebook
            } catch (error) {
              console.error('❌ Facebook Sign In error:', error)
              alert('❌ Erreur Facebook Sign In: ' + error.message)
            }
          }
        </script>
    </body>
    </html>
  `)
})

app.get('/signup', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Inscription - Amanah GO</title>
        <link href="/static/tailwind.css" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <nav class="bg-white shadow-sm">
            <div class="max-w-7xl mx-auto px-4 py-4">
                <a href="/" class="flex items-center space-x-2">
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-16 w-auto">
                    <span class="text-2xl font-bold text-gray-900">Amanah GO</span>
                </a>
            </div>
        </nav>

        <div class="max-w-md mx-auto px-4 py-12">
            <div class="bg-white rounded-xl shadow-lg p-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Créer un compte</h1>
                <p class="text-gray-600 mb-8">Rejoignez la communauté Amanah GO</p>

                <form id="signupForm" class="space-y-6">
                    <!-- Nom complet -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Nom complet <span class="text-red-500">*</span>
                        </label>
                        <input type="text" id="name" required
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                               placeholder="Ex: Mohammed Alami">
                    </div>

                    <!-- Email -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Email <span class="text-red-500">*</span>
                        </label>
                        <input type="email" id="email" required
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                               placeholder="exemple@email.com">
                    </div>

                    <!-- Téléphone avec sélecteur pays -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Téléphone <span class="text-red-500">*</span>
                        </label>
                        <div id="phone-input-container"></div>
                    </div>

                    <!-- Mot de passe -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Mot de passe <span class="text-red-500">*</span>
                        </label>
                        <input type="password" id="password" required
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                               placeholder="Minimum 8 caractères">
                    </div>

                    <!-- Confirmer mot de passe -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Confirmer le mot de passe <span class="text-red-500">*</span>
                        </label>
                        <input type="password" id="confirmPassword" required
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                               placeholder="Retapez votre mot de passe">
                    </div>

                    <!-- CGU -->
                    <div class="flex items-start">
                        <input type="checkbox" id="terms" required
                               class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                        <label for="terms" class="ml-2 text-sm text-gray-600">
                            J'accepte les <a href="/cgu" target="_blank" class="text-blue-600 hover:underline">Conditions Générales d'Utilisation</a>
                            et la <a href="/confidentialite" target="_blank" class="text-blue-600 hover:underline">Politique de Confidentialité</a>
                        </label>
                    </div>

                    <!-- Message d'erreur -->
                    <div id="errorMessage" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        <i class="fas fa-exclamation-circle mr-2"></i>
                        <span id="errorText"></span>
                    </div>

                    <!-- Bouton inscription -->
                    <button type="submit"
                            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition">
                        <i class="fas fa-user-plus mr-2"></i>
                        Créer mon compte
                    </button>
                </form>

                <!-- Séparateur -->
                <div class="relative my-6">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-gray-300"></div>
                    </div>
                    <div class="relative flex justify-center text-sm">
                        <span class="px-2 bg-white text-gray-500">Ou continuer avec</span>
                    </div>
                </div>

                <!-- OAuth Buttons -->
                <div class="space-y-3">
                    <!-- Apple Sign In -->
                    <a href="/api/auth/apple"
                       class="w-full flex items-center justify-center px-4 py-3 bg-black hover:bg-gray-900 text-white rounded-lg transition cursor-pointer">
                        <i class="fab fa-apple text-white mr-2 text-xl"></i>
                        <span class="font-medium">Sign in with Apple</span>
                    </a>
                    
                    <!-- Google Sign In -->
                    <button onclick="signInWithGoogle()" type="button"
                       class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                        <i class="fab fa-google text-red-500 mr-2"></i>
                        <span class="font-medium text-gray-700">Continuer avec Google</span>
                    </button>
                    
                    <!-- Facebook Sign In -->
                    <button onclick="signInWithFacebook()" type="button"
                       class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                        <i class="fab fa-facebook text-blue-600 mr-2"></i>
                        <span class="font-medium text-gray-700">Continuer avec Facebook</span>
                    </button>
                </div>

                <!-- Lien connexion -->
                <p class="mt-6 text-center text-sm text-gray-600">
                    Vous avez déjà un compte ?
                    <a href="/login" class="text-blue-600 hover:underline font-medium">Se connecter</a>
                </p>
            </div>
        </div>

        <!-- 📞 PHONE INPUT MODULE -->
        <script src="/static/phone-input.js"></script>

        <!-- 🔥 FIREBASE COMPAT SDK -->
        <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
        <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js"></script>
        <script src="/static/firebase-compat.js?v=3"></script>

        <script>
          // Nettoyer toute session Firebase au chargement de /signup
          console.log('📝 Signup page loaded - Checking Firebase state...');
          
          window.firebaseAuth.onAuthStateChanged((user) => {
            if (user) {
              console.log('⚠️ Firebase user detected:', user.email);
              console.log('⚠️ User will stay on signup page to allow account creation');
              // Ne PAS rediriger automatiquement - l'utilisateur veut créer un compte
            } else {
              console.log('✅ No Firebase user - Ready for signup');
            }
          });
          
          // ==========================================
          // INITIALISER LE PHONE INPUT
          // ==========================================
          let phoneInputWidget = null;
          
          window.addEventListener('DOMContentLoaded', () => {
            phoneInputWidget = new PhoneInputWithCountry('phone-input-container', {
              defaultCountry: 'FR',
              placeholder: '6 12 34 56 78',
              required: true
            });
            console.log('✅ Phone input widget initialized');
          });
          
          // ==========================================
          // OAUTH FUNCTIONS (Google & Facebook)
          // ==========================================
          async function signInWithGoogle() {
            try {
              console.log('🔥 Google Sign In clicked');
              const result = await window.loginWithGoogle();
              
              if (result.success) {
                console.log('✅ Google login successful:', result.user);
                alert('✅ Connexion Google réussie !');
                window.location.href = '/verify-profile';
              } else {
                throw new Error(result.error || 'Erreur Google Sign In');
              }
            } catch (error) {
              console.error('❌ Google Sign In error:', error);
              alert('❌ ' + error.message);
            }
          }

          async function signInWithFacebook() {
            try {
              console.log('🔥 Facebook Sign In clicked');
              alert('Facebook Sign In sera disponible prochainement !');
              // TODO: Implémenter Facebook OAuth avec Firebase
            } catch (error) {
              console.error('❌ Facebook Sign In error:', error);
              alert('❌ ' + error.message);
            }
          }

          document.getElementById('signupForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('🔥 FIREBASE SIGNUP: Form submitted');
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            
            // Récupérer le téléphone depuis le widget
            const phone = phoneInputWidget ? phoneInputWidget.getPhoneE164() : null;
            
            if (!phone) {
              alert('❌ Veuillez entrer un numéro de téléphone valide');
              return;
            }
            
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const submitBtn = e.target.querySelector('button[type="submit"]');
            
            console.log('📝 SIGNUP: Form data:', { name, email, phone, passwordLength: password.length });
            
            // Validation
            if (password !== confirmPassword) {
              console.error('❌ SIGNUP: Passwords do not match');
              showError('Les mots de passe ne correspondent pas');
              return;
            }
            
            if (password.length < 8) {
              console.error('❌ SIGNUP: Password too short');
              showError('Le mot de passe doit contenir au moins 8 caractères');
              return;
            }
            
            // Désactiver le bouton
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Création du compte...';
            
            try {
              console.log('🔥 Step 1: Creating Firebase user...');
              
              // 1. Créer utilisateur Firebase avec COMPAT
              const userCredential = await window.firebaseAuth.createUserWithEmailAndPassword(email, password);
              const firebaseUser = userCredential.user;
              
              console.log('✅ Firebase user created:', firebaseUser.uid);
              
              // 2. Envoyer email de vérification
              await firebaseUser.sendEmailVerification();
              console.log('✅ Verification email sent');
              
              // 3. Récupérer le token
              const idToken = await firebaseUser.getIdToken();
              
              // 4. Créer l'utilisateur dans notre DB
              console.log('🔥 Step 2: Creating user in our DB...');
              
              const response = await fetch('/api/auth/firebase-signup', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + idToken
                },
                body: JSON.stringify({
                  firebaseUid: firebaseUser.uid,
                  email,
                  name,
                  phone
                })
              });
              
              const data = await response.json();
              
              if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la création du compte');
              }
              
              console.log('✅ User created in DB:', data.user);
              
              // 5. Sauvegarder localement (TOKEN + USER au format Firebase)
              localStorage.setItem('amanah_token', idToken);
              
              // Sauvegarder l'utilisateur au format Firebase pour compatibilité
              const firebaseUserData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || name,
                photoURL: firebaseUser.photoURL || null,
                emailVerified: firebaseUser.emailVerified,
                phoneNumber: firebaseUser.phoneNumber || phone
              };
              localStorage.setItem('amanah_user', JSON.stringify(firebaseUserData));
              console.log('✅ Token and user saved to localStorage');
              
              // Success
              alert('✅ Compte créé avec succès!\\n\\nUn email de vérification a été envoyé à ' + email);
              
              await new Promise(resolve => setTimeout(resolve, 500));
              
              window.location.href = '/verify-profile';
              
            } catch (error) {
              console.error('❌ FIREBASE SIGNUP Error:', error);
              let errorMessage = error.message;
              
              // Messages d'erreur en français
              if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Cet email est déjà utilisé';
              } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Email invalide';
              } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Mot de passe trop faible (min 6 caractères)';
              }
              
              showError(errorMessage);
              submitBtn.disabled = false;
              submitBtn.innerHTML = '<i class="fas fa-user-plus mr-2"></i> Créer mon compte';
            }
          });
          
          function showError(message) {
            document.getElementById('errorMessage').classList.remove('hidden');
            document.getElementById('errorText').textContent = message;
          }
        </script>
    </body>
    </html>
  `)
})

// Espace Voyageur - Dashboard principal
app.get('/voyageur', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Espace Voyageur - Amanah GO</title>
        <link href="/static/tailwind.css" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/i18n.css?v=3" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen">
        <!-- Header -->
        <nav class="bg-white shadow-sm border-b sticky top-0 z-10">
            <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-16 w-auto">
                    <span class="text-2xl font-bold text-gray-900">Amanah GO</span>
                </div>
                <div class="flex items-center space-x-4">
                    <div id="langSwitcher"></div>
                    <span class="text-gray-600">
                        <i class="fas fa-user-circle mr-2"></i>
                        <span id="userName">Utilisateur</span>
                    </span>
                    <button data-auth="logout" class="text-red-600 hover:text-red-700 transition-colors" title="Se déconnecter">
                        <i class="fas fa-sign-out-alt mr-2"></i><span data-i18n="common.logout">Déconnexion</span>
                    </button>
                    <a href="/prohibited-items" class="text-red-600 hover:text-red-700 transition-colors font-bold" title="Produits interdits">
                        <i class="fas fa-ban mr-2"></i><span data-i18n="nav.prohibited_items">Liste Noire</span>
                    </a>
                    <a href="/" class="text-blue-600 hover:text-blue-700 transition-colors">
                        <i class="fas fa-home mr-2"></i><span data-i18n="common.home">Accueil</span>
                    </a>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 py-8">
            <!-- Welcome Banner -->
            <div class="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-xl p-8 mb-8 text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold mb-2">
                            <i class="fas fa-plane-departure mr-3"></i>
                            <span data-i18n="traveler.welcome">Bienvenue dans votre Espace Voyageur</span>
                        </h1>
                        <p class="text-blue-100 text-lg" data-i18n="traveler.welcome_subtitle">Monétisez vos trajets France ↔ Maroc en transportant des colis</p>
                    </div>
                    <div class="hidden md:block">
                        <i class="fas fa-suitcase-rolling text-6xl opacity-20"></i>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="grid md:grid-cols-4 gap-6 mb-8">
                <a href="/voyageur/publier-trajet" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer group">
                    <div class="flex items-center justify-between mb-4">
                        <div class="bg-blue-100 rounded-full p-4 group-hover:bg-blue-600 transition-colors">
                            <i class="fas fa-plus text-2xl text-blue-600 group-hover:text-white"></i>
                        </div>
                        <i class="fas fa-arrow-right text-gray-400 group-hover:text-blue-600 transition-colors"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2" data-i18n="traveler.publish_trip">Publier un Trajet</h3>
                    <p class="text-gray-600" data-i18n="traveler.publish_trip_desc">Ajoutez un nouveau trajet et commencez à gagner de l'argent</p>
                </a>

                <a href="/voyageur/mes-trajets" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer group">
                    <div class="flex items-center justify-between mb-4">
                        <div class="bg-green-100 rounded-full p-4 group-hover:bg-green-600 transition-colors">
                            <i class="fas fa-list text-2xl text-green-600 group-hover:text-white"></i>
                        </div>
                        <i class="fas fa-arrow-right text-gray-400 group-hover:text-green-600 transition-colors"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2" data-i18n="traveler.my_trips">Mes Trajets</h3>
                    <p class="text-gray-600" data-i18n="traveler.my_trips_desc">Consultez et gérez tous vos trajets publiés</p>
                </a>

                <a href="/messages" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer group">
                    <div class="flex items-center justify-between mb-4">
                        <div class="bg-blue-100 rounded-full p-4 group-hover:bg-blue-600 transition-colors">
                            <i class="fas fa-comments text-2xl text-blue-600 group-hover:text-white"></i>
                        </div>
                        <i class="fas fa-arrow-right text-gray-400 group-hover:text-blue-600 transition-colors"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">Messages</h3>
                    <p class="text-gray-600">Discutez avec les expéditeurs</p>
                </a>

                <a href="/messages" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer group">
                    <div class="flex items-center justify-between mb-4">
                        <div class="bg-blue-100 rounded-full p-4 group-hover:bg-blue-600 transition-colors">
                            <i class="fas fa-comments text-2xl text-blue-600 group-hover:text-white"></i>
                        </div>
                        <i class="fas fa-arrow-right text-gray-400 group-hover:text-blue-600 transition-colors"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">Messages</h3>
                    <p class="text-gray-600">Discutez avec les expéditeurs</p>
                </a>

                <a href="/voyageur/stripe-connect" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer group">
                    <div class="flex items-center justify-between mb-4">
                        <div class="bg-orange-100 rounded-full p-4 group-hover:bg-orange-600 transition-colors">
                            <i class="fas fa-credit-card text-2xl text-orange-600 group-hover:text-white"></i>
                        </div>
                        <i class="fas fa-arrow-right text-gray-400 group-hover:text-orange-600 transition-colors"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">Stripe Connect</h3>
                    <p class="text-gray-600">Configurez votre compte pour recevoir des paiements</p>
                </a>

                <a href="/verify-profile" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer group">
                    <div class="flex items-center justify-between mb-4">
                        <div class="bg-purple-100 rounded-full p-4 group-hover:bg-purple-600 transition-colors">
                            <i class="fas fa-shield-alt text-2xl text-purple-600 group-hover:text-white"></i>
                        </div>
                        <i class="fas fa-arrow-right text-gray-400 group-hover:text-purple-600 transition-colors"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2" data-i18n="nav.verify_profile">Vérifier mon Profil</h3>
                    <p class="text-gray-600" data-i18n="traveler.verify_profile_desc">Complétez votre KYC pour débloquer toutes les fonctionnalités</p>
                </a>
            </div>

            <!-- Stats Overview -->
            <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">
                    <i class="fas fa-chart-line text-blue-600 mr-2"></i>
                    <span data-i18n="traveler.quick_overview">Aperçu Rapide</span>
                </h2>
                <div class="grid md:grid-cols-4 gap-6">
                    <div class="text-center">
                        <div class="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-route text-2xl text-blue-600"></i>
                        </div>
                        <p class="text-3xl font-bold text-gray-900" id="statTrips">0</p>
                        <p class="text-sm text-gray-600" data-i18n="traveler.stats_trips">Trajets publiés</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-check-circle text-2xl text-green-600"></i>
                        </div>
                        <p class="text-3xl font-bold text-gray-900" id="statActive">0</p>
                        <p class="text-sm text-gray-600" data-i18n="traveler.stats_active">Trajets actifs</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-purple-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-weight-hanging text-2xl text-purple-600"></i>
                        </div>
                        <p class="text-3xl font-bold text-gray-900" id="statWeight">0</p>
                        <p class="text-sm text-gray-600" data-i18n="traveler.stats_weight">kg disponibles</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-yellow-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-euro-sign text-2xl text-yellow-600"></i>
                        </div>
                        <p class="text-3xl font-bold text-green-600" id="statEarnings">0</p>
                        <p class="text-sm text-gray-600" data-i18n="traveler.stats_earnings">Gains potentiels</p>
                    </div>
                </div>
            </div>

            <!-- How It Works -->
            <div class="bg-white rounded-xl shadow-lg p-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">
                    <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
                    <span data-i18n="landing.how_it_works_title">Comment ça marche ?</span>
                </h2>
                <div class="grid md:grid-cols-3 gap-6">
                    <div class="text-center">
                        <div class="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                        <h3 class="font-semibold text-gray-900 mb-2" data-i18n="traveler.how_step1">Publiez votre trajet</h3>
                        <p class="text-gray-600 text-sm" data-i18n="traveler.how_step1_desc">Indiquez votre itinéraire, dates et poids disponible</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                        <h3 class="font-semibold text-gray-900 mb-2" data-i18n="traveler.how_step2">Recevez des propositions</h3>
                        <p class="text-gray-600 text-sm" data-i18n="traveler.how_step2_desc">Les expéditeurs vous contactent avec leurs demandes</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                        <h3 class="font-semibold text-gray-900 mb-2" data-i18n="traveler.how_step3">Gagnez de l'argent</h3>
                        <p class="text-gray-600 text-sm" data-i18n="traveler.how_step3_desc">Transportez et recevez votre paiement sécurisé</p>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
          // Load user stats
          async function loadStats() {
            try {
              // TODO: Replace with real user ID from session/JWT
              const userId = localStorage.getItem('userId') || 1
              
              const response = await axios.get(\`/api/trips?user_id=\${userId}\`)
              
              if (response.data.success) {
                const trips = response.data.trips || []
                const activeTrips = trips.filter(t => t.status === 'ACTIVE')
                const totalWeight = activeTrips.reduce((sum, t) => sum + (t.available_weight || 0), 0)
                const totalEarnings = activeTrips.reduce((sum, t) => sum + (t.estimated_earnings || 0), 0)
                
                document.getElementById('statTrips').textContent = trips.length
                document.getElementById('statActive').textContent = activeTrips.length
                document.getElementById('statWeight').textContent = totalWeight
                document.getElementById('statEarnings').textContent = totalEarnings.toFixed(2) + '€'
              }
            } catch (error) {
              console.error('Erreur chargement stats:', error)
            }
          }
          
          // Load user name
          const userName = localStorage.getItem('userName')
          if (userName) {
            document.getElementById('userName').textContent = userName
          }
          
          loadStats()
        </script>

        <!-- i18n MUST be loaded FIRST for translations to work -->
        <script src="/static/i18n.js?v=4"></script>
        <script src="/static/auth.js"></script>
        <script src="/static/auth-ui.js"></script>
        <script src="/static/protected-page.js"></script>
        <script>
          // Language Switcher Component (inline for immediate availability)
          function createLanguageSwitcher() {
            const currentLang = window.i18n?.getCurrentLang() || 'fr'
            const languages = [
              { code: 'fr', name: 'Français', flag: '🇫🇷' },
              { code: 'ar', name: 'العربية', flag: '🇲🇦' },
              { code: 'en', name: 'English', flag: '🇬🇧' }
            ]
            
            const current = languages.find(l => l.code === currentLang) || languages[0]
            
            return \`
              <div class="lang-switcher">
                <button class="lang-switcher-minimal" id="langSwitcherBtn" title="\${current.name}">
                  <span class="lang-flag-only">\${current.flag}</span>
                </button>
                
                <div class="lang-switcher-dropdown" id="langDropdown">
                  \${languages.map(lang => \`
                    <div class="lang-option \${lang.code === currentLang ? 'active' : ''}" 
                         data-lang="\${lang.code}">
                      <span class="lang-flag">\${lang.flag}</span>
                      <span>\${lang.name}</span>
                      \${lang.code === currentLang ? '<i class="fas fa-check ml-auto text-blue-600"></i>' : ''}
                    </div>
                  \`).join('')}
                </div>
              </div>
            \`
          }
          
          function attachLanguageSwitcherEvents(container) {
            // Attach click event to the button
            const btn = container.querySelector('#langSwitcherBtn')
            if (btn) {
              btn.addEventListener('click', (e) => {
                e.stopPropagation()
                toggleLangDropdown()
              })
            }
            
            // Attach click events to language options
            const options = container.querySelectorAll('.lang-option')
            options.forEach(option => {
              option.addEventListener('click', () => {
                const lang = option.getAttribute('data-lang')
                if (lang) switchLanguage(lang)
              })
            })
          }
          
          function toggleLangDropdown() {
            const dropdowns = document.querySelectorAll('#langDropdown')
            dropdowns.forEach(dropdown => {
              dropdown.classList.toggle('show')
            })
          }
          
          function switchLanguage(lang) {
            if (window.i18n) {
              window.i18n.setLanguage(lang)
            }
          }
          
          // Close dropdown when clicking outside
          document.addEventListener('click', function(event) {
            const switcher = document.querySelector('.lang-switcher')
            const dropdown = document.getElementById('langDropdown')
            
            if (switcher && dropdown && !switcher.contains(event.target)) {
              dropdown.classList.remove('show')
            }
          })
        </script>
        <script>
          // Initialize i18n and inject language switcher
          window.addEventListener('DOMContentLoaded', async () => {
            await window.i18n.init()
            
            // Inject language switcher for both desktop and mobile
            const switcher = createLanguageSwitcher()
            const desktopSwitcher = document.getElementById('langSwitcher')
            const mobileSwitcher = document.getElementById('langSwitcherMobile')
            
            if (desktopSwitcher) {
              desktopSwitcher.innerHTML = switcher
              attachLanguageSwitcherEvents(desktopSwitcher)
            }
            if (mobileSwitcher) {
              mobileSwitcher.innerHTML = switcher
              attachLanguageSwitcherEvents(mobileSwitcher)
            }
            
            // Apply translations
            document.querySelectorAll('[data-i18n]').forEach(el => {
              const key = el.getAttribute('data-i18n')
              el.textContent = window.t(key)
            })
            
            // Recalculate price after translations loaded (Landing page only)
            if (typeof calculatePrice === 'function') {
              calculatePrice()
            }
          })
        </script>
    </body>
    </html>
  `)
})

// Page Stripe Connect - Configuration du compte voyageur
app.get('/voyageur/stripe-connect', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Configuration Stripe - Amanah GO</title>
        <link href="/static/tailwind.css" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/i18n.css?v=3" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <header class="bg-white shadow-sm sticky top-0 z-50">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-10">
                        <h1 class="text-xl font-bold text-gray-900">Configuration Stripe</h1>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-gray-700" id="userName"></span>
                        <a href="/voyageur" class="text-blue-600 hover:text-blue-700">
                            <i class="fas fa-arrow-left mr-2"></i>Retour
                        </a>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="container mx-auto px-4 py-8 max-w-4xl">
            <!-- Explication Stripe Connect -->
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">
                    <i class="fas fa-credit-card text-blue-600 mr-3"></i>
                    Stripe Connect - Recevez vos paiements
                </h2>
                <p class="text-gray-700 mb-4">
                    Pour recevoir des paiements de la part des expéditeurs, vous devez créer un compte Stripe Connect.
                </p>
                
                <div class="grid md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-blue-50 rounded-lg p-4">
                        <i class="fas fa-shield-alt text-blue-600 text-2xl mb-2"></i>
                        <h3 class="font-semibold text-gray-900 mb-1">Sécurisé</h3>
                        <p class="text-sm text-gray-600">Stripe est utilisé par des millions d'entreprises dans le monde</p>
                    </div>
                    <div class="bg-green-50 rounded-lg p-4">
                        <i class="fas fa-bolt text-green-600 text-2xl mb-2"></i>
                        <h3 class="font-semibold text-gray-900 mb-1">Rapide</h3>
                        <p class="text-sm text-gray-600">Configuration en 5 minutes avec votre pièce d'identité</p>
                    </div>
                    <div class="bg-purple-50 rounded-lg p-4">
                        <i class="fas fa-university text-purple-600 text-2xl mb-2"></i>
                        <h3 class="font-semibold text-gray-900 mb-1">Virements auto</h3>
                        <p class="text-sm text-gray-600">Recevez l'argent directement sur votre compte bancaire</p>
                    </div>
                </div>

                <div class="bg-gray-50 rounded-lg p-4">
                    <h3 class="font-semibold text-gray-900 mb-2">Comment ça marche ?</h3>
                    <ol class="space-y-2 text-gray-700">
                        <li class="flex items-start">
                            <span class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm">1</span>
                            <span>Vous publiez un trajet avec le poids disponible et le prix par kg</span>
                        </li>
                        <li class="flex items-start">
                            <span class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm">2</span>
                            <span>Un expéditeur réserve et paie (ex: 50€ pour 10kg)</span>
                        </li>
                        <li class="flex items-start">
                            <span class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm">3</span>
                            <span>Amanah GO retient 12% de commission (6€)</span>
                        </li>
                        <li class="flex items-start">
                            <span class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm">4</span>
                            <span>Après livraison confirmée, vous recevez 44€ (88%) sur votre compte Stripe</span>
                        </li>
                        <li class="flex items-start">
                            <span class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm">5</span>
                            <span>Stripe vire l'argent automatiquement sur votre compte bancaire</span>
                        </li>
                    </ol>
                </div>
            </div>

            <!-- Statut du compte Stripe -->
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 class="text-xl font-bold text-gray-900 mb-4">Statut de votre compte</h2>
                <div id="stripe-status">
                    <div class="text-center py-8">
                        <i class="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
                        <p class="text-gray-600">Chargement du statut...</p>
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-4">
                <button 
                    id="onboard-btn"
                    onclick="startOnboarding()"
                    style="display: none;"
                    class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors">
                    <i class="fas fa-plus mr-2"></i>Créer mon compte Stripe
                </button>
                
                <button 
                    id="dashboard-btn"
                    onclick="openDashboard()"
                    style="display: none;"
                    class="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-colors">
                    <i class="fas fa-external-link-alt mr-2"></i>Voir mon dashboard Stripe
                </button>
            </div>

            <!-- Note importante -->
            <div class="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p class="text-sm text-gray-700">
                    <i class="fas fa-info-circle text-yellow-600 mr-2"></i>
                    <strong>Note :</strong> Vous devrez fournir une pièce d'identité valide et un RIB pour finaliser votre inscription Stripe. 
                    C'est une exigence légale pour lutter contre la fraude et le blanchiment d'argent.
                </p>
            </div>
        </main>

        <script src="/static/auth.js"></script>
        <script src="/static/auth-ui.js"></script>
        <script src="/static/stripe-connect.js"></script>
        <script src="/static/i18n.js?v=3"></script>
    </body>
    </html>
  `)
})

// Page de vérification KYC
app.get('/verify-profile', (c) => {
  return c.html(renderVerifyProfilePage())
})

// Espace Expéditeur - Dashboard principal
app.get('/expediteur', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Espace Expéditeur - Amanah GO</title>
        <link href="/static/tailwind.css" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/i18n.css?v=3" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-green-50 to-green-100 min-h-screen">
        <!-- Header -->
        <nav class="bg-white shadow-sm border-b sticky top-0 z-10">
            <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-16 w-auto">
                    <span class="text-2xl font-bold text-gray-900">Amanah GO</span>
                </div>
                <div class="flex items-center space-x-4">
                    <div id="langSwitcher"></div>
                    <span class="text-gray-600">
                        <i class="fas fa-user-circle mr-2"></i>
                        <span id="userName">Utilisateur</span>
                    </span>
                    <a href="/prohibited-items" class="text-red-600 hover:text-red-700 transition-colors font-bold" title="Produits interdits">
                        <i class="fas fa-ban mr-2"></i><span data-i18n="nav.prohibited_items">Liste Noire</span>
                    </a>
                    <a href="/" class="text-green-600 hover:text-green-700 transition-colors">
                        <i class="fas fa-home mr-2"></i><span data-i18n="common.home">Accueil</span>
                    </a>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 py-8">
            <!-- Welcome Banner -->
            <div class="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl shadow-xl p-8 mb-8 text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold mb-2">
                            <i class="fas fa-box mr-3"></i>
                            <span data-i18n="sender.welcome">Bienvenue dans votre Espace Expéditeur</span>
                        </h1>
                        <p class="text-green-100 text-lg" data-i18n="sender.welcome_subtitle">Économisez jusqu'à 70% sur vos envois France ↔ Maroc</p>
                    </div>
                    <div class="hidden md:block">
                        <i class="fas fa-shipping-fast text-6xl opacity-20"></i>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="grid md:grid-cols-3 gap-6 mb-8">
                <a href="/expediteur/publier-colis" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer group">
                    <div class="flex items-center justify-between mb-4">
                        <div class="bg-green-100 rounded-full p-4 group-hover:bg-green-600 transition-colors">
                            <i class="fas fa-plus text-2xl text-green-600 group-hover:text-white"></i>
                        </div>
                        <i class="fas fa-arrow-right text-gray-400 group-hover:text-green-600 transition-colors"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2" data-i18n="sender.publish_package">Publier un Colis</h3>
                    <p class="text-gray-600" data-i18n="sender.publish_package_desc">Créez une nouvelle demande d'envoi de colis</p>
                </a>

                <a href="/expediteur/mes-colis" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer group">
                    <div class="flex items-center justify-between mb-4">
                        <div class="bg-blue-100 rounded-full p-4 group-hover:bg-blue-600 transition-colors">
                            <i class="fas fa-list text-2xl text-blue-600 group-hover:text-white"></i>
                        </div>
                        <i class="fas fa-arrow-right text-gray-400 group-hover:text-blue-600 transition-colors"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2" data-i18n="sender.my_packages">Mes Colis</h3>
                    <p class="text-gray-600" data-i18n="sender.my_packages_desc">Suivez tous vos envois en cours et passés</p>
                </a>

                <a href="/messages" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer group">
                    <div class="flex items-center justify-between mb-4">
                        <div class="bg-blue-100 rounded-full p-4 group-hover:bg-blue-600 transition-colors">
                            <i class="fas fa-comments text-2xl text-blue-600 group-hover:text-white"></i>
                        </div>
                        <i class="fas fa-arrow-right text-gray-400 group-hover:text-blue-600 transition-colors"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">Messages</h3>
                    <p class="text-gray-600">Discutez avec les voyageurs</p>
                </a>

                <div onclick="searchTrips()" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer group">
                    <div class="flex items-center justify-between mb-4">
                        <div class="bg-purple-100 rounded-full p-4 group-hover:bg-purple-600 transition-colors">
                            <i class="fas fa-search text-2xl text-purple-600 group-hover:text-white"></i>
                        </div>
                        <i class="fas fa-arrow-right text-gray-400 group-hover:text-purple-600 transition-colors"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2" data-i18n="sender.search_trip">Rechercher un Trajet</h3>
                    <p class="text-gray-600" data-i18n="sender.search_trip_desc">Trouvez un voyageur pour transporter votre colis</p>
                </div>
            </div>

            <!-- Search Section -->
            <div id="searchSection" class="bg-white rounded-xl shadow-lg p-8 mb-8 hidden">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">
                    <i class="fas fa-search text-green-600 mr-2"></i>
                    <span data-i18n="sender.search_title">Rechercher un Trajet Disponible</span>
                </h2>
                <div class="grid md:grid-cols-3 gap-4 mb-6">
                    <input type="text" id="searchOrigin" placeholder="Ville de départ" data-i18n-placeholder="sender.search_origin" class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <input type="text" id="searchDestination" placeholder="Ville d'arrivée" data-i18n-placeholder="sender.search_destination" class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <button onclick="performSearch()" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold">
                        <i class="fas fa-search mr-2"></i><span data-i18n="sender.search_button">Rechercher</span>
                    </button>
                </div>
                <div id="searchResults" class="space-y-4">
                    <!-- Results will be displayed here -->
                </div>
            </div>

            <!-- Stats Overview -->
            <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">
                    <i class="fas fa-chart-line text-green-600 mr-2"></i>
                    <span data-i18n="traveler.quick_overview">Aperçu Rapide</span>
                </h2>
                <div class="grid md:grid-cols-4 gap-6">
                    <div class="text-center">
                        <div class="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-box text-2xl text-green-600"></i>
                        </div>
                        <p class="text-3xl font-bold text-gray-900" id="statPackages">0</p>
                        <p class="text-sm text-gray-600" data-i18n="sender.stats_packages">Colis publiés</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-clock text-2xl text-blue-600"></i>
                        </div>
                        <p class="text-3xl font-bold text-gray-900" id="statPending">0</p>
                        <p class="text-sm text-gray-600" data-i18n="sender.stats_pending">En attente</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-yellow-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-shipping-fast text-2xl text-yellow-600"></i>
                        </div>
                        <p class="text-3xl font-bold text-gray-900" id="statInTransit">0</p>
                        <p class="text-sm text-gray-600" data-i18n="sender.stats_in_transit">En transit</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-purple-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-check-circle text-2xl text-purple-600"></i>
                        </div>
                        <p class="text-3xl font-bold text-gray-900" id="statDelivered">0</p>
                        <p class="text-sm text-gray-600" data-i18n="sender.stats_delivered">Livrés</p>
                    </div>
                </div>
            </div>

            <!-- How It Works -->
            <div class="bg-white rounded-xl shadow-lg p-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">
                    <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
                    <span data-i18n="landing.how_it_works_title">Comment ça marche ?</span>
                </h2>
                <div class="grid md:grid-cols-3 gap-6">
                    <div class="text-center">
                        <div class="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                        <h3 class="font-semibold text-gray-900 mb-2" data-i18n="sender.how_step1">Publiez votre colis</h3>
                        <p class="text-gray-600 text-sm" data-i18n="sender.how_step1_desc">Décrivez votre envoi, destination et budget</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                        <h3 class="font-semibold text-gray-900 mb-2" data-i18n="sender.how_step2">Trouvez un voyageur</h3>
                        <p class="text-gray-600 text-sm" data-i18n="sender.how_step2_desc">Des voyageurs vous contactent ou recherchez-en un</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                        <h3 class="font-semibold text-gray-900 mb-2" data-i18n="sender.how_step3">Économisez de l'argent</h3>
                        <p class="text-gray-600 text-sm" data-i18n="sender.how_step3_desc">Recevez votre colis jusqu'à 70% moins cher</p>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
          // Toggle search section
          function searchTrips() {
            const section = document.getElementById('searchSection')
            section.classList.toggle('hidden')
            if (!section.classList.contains('hidden')) {
              document.getElementById('searchOrigin').focus()
            }
          }

          // Perform trip search
          async function performSearch() {
            const origin = document.getElementById('searchOrigin').value.trim()
            const destination = document.getElementById('searchDestination').value.trim()
            
            if (!origin || !destination) {
              alert("Veuillez remplir les villes de départ et d'arrivée")
              return
            }
            
            try {
              const response = await axios.get(\`/api/trips?origin=\${encodeURIComponent(origin)}&destination=\${encodeURIComponent(destination)}&status=ACTIVE\`)
              
              const resultsDiv = document.getElementById('searchResults')
              
              if (response.data.success && response.data.trips.length > 0) {
                resultsDiv.innerHTML = response.data.trips.map(trip => \`
                  <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div class="flex justify-between items-start mb-2">
                      <div>
                        <h3 class="font-semibold text-gray-900">\${trip.origin_city} → \${trip.destination_city}</h3>
                        <p class="text-sm text-gray-600">Départ: \${new Date(trip.departure_date).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">\${trip.available_weight}kg</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <p class="text-lg font-bold text-green-600">\${trip.price_per_kg}€/kg</p>
                      <button onclick="contactTraveler(\${trip.id})" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                        <i class="fas fa-envelope mr-1"></i>Contacter
                      </button>
                    </div>
                  </div>
                \`).join('')
              } else {
                resultsDiv.innerHTML = \`
                  <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-search text-4xl mb-4"></i>
                    <p>Aucun trajet disponible pour cette recherche</p>
                  </div>
                \`
              }
            } catch (error) {
              console.error('Erreur recherche:', error)
              alert('Erreur lors de la recherche')
            }
          }

          // Contact traveler (placeholder)
          function contactTraveler(tripId) {
            alert("Fonctionnalité de contact en cours de développement (Trajet #" + tripId + ")")
            // TODO: Implement real-time chat or messaging system
          }

          // Load user stats
          async function loadStats() {
            try {
              // TODO: Replace with real user ID from session/JWT
              const userId = localStorage.getItem('userId') || 1
              
              const response = await axios.get(\`/api/packages?user_id=\${userId}\`)
              
              if (response.data.success) {
                const packages = response.data.packages || []
                document.getElementById('statPackages').textContent = packages.length
                document.getElementById('statPending').textContent = packages.filter(p => p.status === 'PUBLISHED').length
                document.getElementById('statInTransit').textContent = packages.filter(p => p.status === 'IN_TRANSIT').length
                document.getElementById('statDelivered').textContent = packages.filter(p => p.status === 'DELIVERED').length
              }
            } catch (error) {
              console.error('Erreur chargement stats:', error)
            }
          }
          
          // Load user name
          const userName = localStorage.getItem('userName')
          if (userName) {
            document.getElementById('userName').textContent = userName
          }
          
          loadStats()
        </script>

        <!-- i18n MUST be loaded FIRST for translations to work -->
        <script src="/static/i18n.js?v=4"></script>
        <script src="/static/auth.js"></script>
        <script src="/static/auth-ui.js"></script>
        <script src="/static/protected-page.js"></script>
        <script>
          // Language Switcher Component (inline for immediate availability)
          function createLanguageSwitcher() {
            const currentLang = window.i18n?.getCurrentLang() || 'fr'
            const languages = [
              { code: 'fr', name: 'Français', flag: '🇫🇷' },
              { code: 'ar', name: 'العربية', flag: '🇲🇦' },
              { code: 'en', name: 'English', flag: '🇬🇧' }
            ]
            
            const current = languages.find(l => l.code === currentLang) || languages[0]
            
            return \`
              <div class="lang-switcher">
                <button class="lang-switcher-minimal" id="langSwitcherBtn" title="\${current.name}">
                  <span class="lang-flag-only">\${current.flag}</span>
                </button>
                
                <div class="lang-switcher-dropdown" id="langDropdown">
                  \${languages.map(lang => \`
                    <div class="lang-option \${lang.code === currentLang ? 'active' : ''}" 
                         data-lang="\${lang.code}">
                      <span class="lang-flag">\${lang.flag}</span>
                      <span>\${lang.name}</span>
                      \${lang.code === currentLang ? '<i class="fas fa-check ml-auto text-blue-600"></i>' : ''}
                    </div>
                  \`).join('')}
                </div>
              </div>
            \`
          }
          
          function attachLanguageSwitcherEvents(container) {
            // Attach click event to the button
            const btn = container.querySelector('#langSwitcherBtn')
            if (btn) {
              btn.addEventListener('click', (e) => {
                e.stopPropagation()
                toggleLangDropdown()
              })
            }
            
            // Attach click events to language options
            const options = container.querySelectorAll('.lang-option')
            options.forEach(option => {
              option.addEventListener('click', () => {
                const lang = option.getAttribute('data-lang')
                if (lang) switchLanguage(lang)
              })
            })
          }
          
          function toggleLangDropdown() {
            const dropdowns = document.querySelectorAll('#langDropdown')
            dropdowns.forEach(dropdown => {
              dropdown.classList.toggle('show')
            })
          }
          
          function switchLanguage(lang) {
            if (window.i18n) {
              window.i18n.setLanguage(lang)
            }
          }
          
          // Close dropdown when clicking outside
          document.addEventListener('click', function(event) {
            const switcher = document.querySelector('.lang-switcher')
            const dropdown = document.getElementById('langDropdown')
            
            if (switcher && dropdown && !switcher.contains(event.target)) {
              dropdown.classList.remove('show')
            }
          })
        </script>
        <script>
          // Initialize i18n and inject language switcher
          window.addEventListener('DOMContentLoaded', async () => {
            await window.i18n.init()
            
            // Inject language switcher for both desktop and mobile
            const switcher = createLanguageSwitcher()
            const desktopSwitcher = document.getElementById('langSwitcher')
            const mobileSwitcher = document.getElementById('langSwitcherMobile')
            
            if (desktopSwitcher) {
              desktopSwitcher.innerHTML = switcher
              attachLanguageSwitcherEvents(desktopSwitcher)
            }
            if (mobileSwitcher) {
              mobileSwitcher.innerHTML = switcher
              attachLanguageSwitcherEvents(mobileSwitcher)
            }
            
            // Apply translations
            document.querySelectorAll('[data-i18n]').forEach(el => {
              const key = el.getAttribute('data-i18n')
              el.textContent = window.t(key)
            })
            
            // Recalculate price after translations loaded (Landing page only)
            if (typeof calculatePrice === 'function') {
              calculatePrice()
            }
          })
        </script>
    </body>
    </html>
  `)
})

// Publier un trajet (Voyageur)
app.get('/voyageur/publier-trajet', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Publier un Trajet - Amanah GO</title>
        <link href="/static/tailwind.css" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <nav class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-16 w-auto">
                    <span class="text-2xl font-bold text-gray-900">Amanah GO</span>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="text-gray-600">
                        <i class="fas fa-user-circle mr-2"></i>
                        <span id="userName"></span>
                    </span>
                    <a href="/voyageur" class="text-blue-600 hover:text-blue-700">
                        <i class="fas fa-arrow-left mr-2"></i>
                        Retour
                    </a>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="max-w-4xl mx-auto px-4 py-8">
            <div class="bg-white rounded-xl shadow-lg p-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">
                    <i class="fas fa-suitcase-rolling text-blue-600 mr-3"></i>
                    Publier un Trajet
                </h1>
                <p class="text-gray-600 mb-8">Partagez votre espace bagage et gagnez de l'argent</p>

                <form onsubmit="submitTrip(event)" id="tripForm">
                    <!-- Itinéraire -->
                    <div class="mb-8">
                        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-route text-blue-600 mr-2"></i>
                            Itinéraire
                        </h2>

                        <div class="grid md:grid-cols-2 gap-6">
                            <!-- Départ -->
                            <div class="airport-autocomplete relative">
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Ville de départ <span class="text-red-500">*</span>
                                </label>
                                <div class="relative">
                                    <i class="fas fa-plane-departure absolute left-3 top-3.5 text-gray-400"></i>
                                    <input 
                                        type="text" 
                                        id="departureCity"
                                        placeholder="Ex: Paris"
                                        class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                    <input type="hidden" id="departureAirportCode" />
                                </div>
                                <div id="departureSuggestions" class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"></div>
                            </div>

                            <!-- Arrivée -->
                            <div class="airport-autocomplete relative">
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Ville d'arrivée <span class="text-red-500">*</span>
                                </label>
                                <div class="relative">
                                    <i class="fas fa-plane-arrival absolute left-3 top-3.5 text-gray-400"></i>
                                    <input 
                                        type="text" 
                                        id="arrivalCity"
                                        placeholder="Ex: Casablanca"
                                        class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                    <input type="hidden" id="arrivalAirportCode" />
                                </div>
                                <div id="arrivalSuggestions" class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"></div>
                            </div>
                        </div>

                        <!-- Date de départ -->
                        <div class="mt-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Date et heure de départ <span class="text-red-500">*</span>
                            </label>
                            <input 
                                type="datetime-local" 
                                id="departureDate"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <!-- Flight Number (Optional) -->
                        <div id="flightNumberSection" class="mt-6 hidden">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Numéro de vol (optionnel)
                            </label>
                            <div class="flex gap-2">
                                <input 
                                    type="text" 
                                    id="flightNumber"
                                    placeholder="Ex: AT800"
                                    class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                />
                                <button 
                                    type="button"
                                    id="importFlight"
                                    class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                                >
                                    <i class="fas fa-plane mr-2"></i>Importer
                                </button>
                            </div>
                            <p class="text-sm text-gray-500 mt-1">Importez automatiquement les détails du vol</p>
                        </div>

                        <!-- Dates flexibles -->
                        <div class="mt-4">
                            <label class="flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    id="flexibleDates"
                                    class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span class="ml-3 text-gray-700">Dates flexibles (±2 jours)</span>
                            </label>
                        </div>
                    </div>

                    <!-- Capacité & Prix -->
                    <div class="mb-8 border-t pt-8">
                        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-box text-blue-600 mr-2"></i>
                            Capacité & Tarifs
                        </h2>

                        <div class="grid md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Poids disponible (kg) <span class="text-red-500">*</span>
                                </label>
                                <input 
                                    type="number" 
                                    id="availableWeight"
                                    placeholder="Ex: 15"
                                    min="1"
                                    max="30"
                                    step="0.5"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                                <p class="text-sm text-gray-500 mt-1">Maximum 30 kg</p>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Prix par kg (€) <span class="text-red-500">*</span>
                                </label>
                                <input 
                                    type="number" 
                                    id="pricePerKg"
                                    placeholder="Ex: 8"
                                    min="5"
                                    max="20"
                                    step="0.5"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                                <p class="text-sm text-gray-500 mt-1">Prix recommandé: 7-10€/kg</p>
                            </div>
                        </div>

                        <!-- Earnings Calculator -->
                        <div class="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-gray-600">Gains estimés (après commission 12%)</p>
                                    <p class="text-3xl font-bold text-green-600">
                                        <span id="totalEarnings">0.00</span> €
                                    </p>
                                    <p class="text-xs text-gray-500 mt-1">Commission plateforme: <span id="commission">0.00</span> €</p>
                                </div>
                                <i class="fas fa-euro-sign text-4xl text-green-300"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Description -->
                    <div class="mb-8 border-t pt-8">
                        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-info-circle text-blue-600 mr-2"></i>
                            Informations complémentaires
                        </h2>

                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Description (optionnel)
                        </label>
                        <textarea 
                            id="description"
                            rows="4"
                            placeholder="Ajoutez des détails sur votre trajet, vos conditions de transport..."
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        ></textarea>
                    </div>

                    <!-- Submit -->
                    <div class="flex justify-end gap-4">
                        <a href="/voyageur" class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                            Annuler
                        </a>
                        <button 
                            type="submit"
                            id="submitBtn"
                            class="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                            <i class="fas fa-paper-plane mr-2"></i>
                            Publier mon trajet
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/auth.js"></script>
        <script src="/static/publish-trip.js"></script>
    </body>
    </html>
  `)
})

// Publier un colis (Expéditeur)
app.get('/expediteur/publier-colis', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Publier un Colis - Amanah GO</title>
        <link href="/static/tailwind.css" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <nav class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-16 w-auto">
                    <span class="text-2xl font-bold text-gray-900">Amanah GO</span>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="text-gray-600">
                        <i class="fas fa-user-circle mr-2"></i>
                        <span id="userName"></span>
                    </span>
                    <a href="/expediteur" class="text-blue-600 hover:text-blue-700">
                        <i class="fas fa-arrow-left mr-2"></i>
                        Retour
                    </a>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="max-w-4xl mx-auto px-4 py-8">
            <div class="bg-white rounded-xl shadow-lg p-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">
                    <i class="fas fa-box text-blue-600 mr-3"></i>
                    Publier un Colis
                </h1>
                <p class="text-gray-600 mb-8">Trouvez un voyageur pour transporter votre colis</p>

                <form onsubmit="submitPackage(event)" id="packageForm">
                    <!-- Titre & Description -->
                    <div class="mb-8">
                        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-tag text-blue-600 mr-2"></i>
                            Description du colis
                        </h2>

                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Titre <span class="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                id="title"
                                placeholder="Ex: Cadeaux pour famille"
                                maxlength="100"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Description (optionnel)
                            </label>
                            <textarea 
                                id="description"
                                rows="3"
                                placeholder="Détails sur le contenu..."
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            ></textarea>
                        </div>
                    </div>

                    <!-- Contenu -->
                    <div class="mb-8 border-t pt-8">
                        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-clipboard-list text-blue-600 mr-2"></i>
                            Déclaration du contenu
                        </h2>

                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Déclaration précise du contenu <span class="text-red-500">*</span>
                        </label>
                        <textarea 
                            id="contentDeclaration"
                            rows="3"
                            placeholder="Ex: Vêtements, jouets, produits alimentaires non périssables"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        ></textarea>
                        <p class="text-sm text-red-600 mt-2">
                            <i class="fas fa-exclamation-triangle mr-1"></i>
                            Important: Déclarez précisément le contenu. Les produits interdits (alcool, médicaments, contrefaçons) sont strictement prohibés.
                        </p>
                    </div>

                    <!-- Photos -->
                    <div class="mb-8 border-t pt-8">
                        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-camera text-blue-600 mr-2"></i>
                            Photos du colis (recommandé)
                        </h2>

                        <div class="grid grid-cols-3 md:grid-cols-5 gap-4 mb-4" id="photosPreview">
                            <!-- Photos will be inserted here -->
                        </div>

                        <button 
                            type="button"
                            id="uploadPhotoBtn"
                            class="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                        >
                            <i class="fas fa-plus-circle mr-2"></i>
                            Ajouter des photos (max 5)
                        </button>
                        <input type="file" id="photoInput" accept="image/*" multiple class="hidden" />
                    </div>

                    <!-- Dimensions & Poids -->
                    <div class="mb-8 border-t pt-8">
                        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-weight-hanging text-blue-600 mr-2"></i>
                            Dimensions & Poids
                        </h2>

                        <div class="grid md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Poids (kg) <span class="text-red-500">*</span>
                                </label>
                                <input 
                                    type="number" 
                                    id="weight"
                                    placeholder="Ex: 8"
                                    min="0.1"
                                    max="30"
                                    step="0.1"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Dimensions (optionnel)
                                </label>
                                <input 
                                    type="text" 
                                    id="dimensions"
                                    placeholder="Ex: 40x30x20 cm"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Itinéraire -->
                    <div class="mb-8 border-t pt-8">
                        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-map-marker-alt text-blue-600 mr-2"></i>
                            Itinéraire souhaité
                        </h2>

                        <div class="grid md:grid-cols-2 gap-6">
                            <!-- Départ -->
                            <div class="city-autocomplete relative">
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Ville de départ <span class="text-red-500">*</span>
                                </label>
                                <div class="relative">
                                    <i class="fas fa-map-pin absolute left-3 top-3.5 text-gray-400"></i>
                                    <input 
                                        type="text" 
                                        id="departureCity"
                                        placeholder="Ex: Paris"
                                        class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div id="departureSuggestions" class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"></div>
                            </div>

                            <!-- Arrivée -->
                            <div class="city-autocomplete relative">
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Ville d'arrivée <span class="text-red-500">*</span>
                                </label>
                                <div class="relative">
                                    <i class="fas fa-map-pin absolute left-3 top-3.5 text-gray-400"></i>
                                    <input 
                                        type="text" 
                                        id="arrivalCity"
                                        placeholder="Ex: Casablanca"
                                        class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div id="arrivalSuggestions" class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"></div>
                            </div>
                        </div>

                        <!-- Date préférée -->
                        <div class="mt-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Date préférée (optionnel)
                            </label>
                            <input 
                                type="date" 
                                id="preferredDate"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <!-- Dates flexibles -->
                        <div class="mt-4">
                            <label class="flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    id="flexibleDates"
                                    checked
                                    class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span class="ml-3 text-gray-700">Dates flexibles</span>
                            </label>
                        </div>
                    </div>

                    <!-- Budget -->
                    <div class="mb-8 border-t pt-8">
                        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-euro-sign text-blue-600 mr-2"></i>
                            Budget
                        </h2>

                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Budget maximum (€) <span class="text-red-500">*</span>
                        </label>
                        <input 
                            type="number" 
                            id="budget"
                            placeholder="Ex: 70"
                            min="10"
                            step="1"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />

                        <!-- Cost Estimate -->
                        <div class="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-gray-600">Coût estimé</p>
                                    <p class="text-2xl font-bold text-blue-600">
                                        <span id="estimatedCost">0.00</span> €
                                    </p>
                                    <p class="text-xs text-gray-500 mt-1">Basé sur le poids et le prix moyen</p>
                                </div>
                                <i class="fas fa-calculator text-3xl text-blue-300"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Submit -->
                    <div class="flex justify-end gap-4">
                        <a href="/expediteur" class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                            Annuler
                        </a>
                        <button 
                            type="submit"
                            id="submitBtn"
                            class="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                            <i class="fas fa-paper-plane mr-2"></i>
                            Publier mon colis
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/auth.js"></script>
        <script src="/static/publish-package.js"></script>
    </body>
    </html>
  `)
})

// ==========================================
// TRIPS CRUD APIs
// ==========================================

// Create new trip
app.post('/api/trips', authMiddleware, async (c) => {
  const { DB } = c.env
  
  try {
    const body = await c.req.json()
    const {
      user_id,
      departure_city,
      departure_country = 'France',
      arrival_city,
      arrival_country = 'Maroc',
      departure_date,
      departure_airport,
      arrival_airport,
      flight_number,
      available_weight,
      price_per_kg,
      description,
      flexible_dates = 0
    } = body
    
    // Validation
    if (!user_id || !departure_city || !arrival_city || !departure_date || !available_weight || !price_per_kg) {
      return c.json({
        success: false,
        error: 'Missing required fields'
      }, 400)
    }
    
    // Check if user exists and is verified
    const user = await DB.prepare(`
      SELECT id, name, kyc_status FROM users WHERE id = ?
    `).bind(user_id).first()
    
    if (!user) {
      return c.json({
        success: false,
        error: 'User not found'
      }, 404)
    }
    
    // ✅ KYC VERIFICATION ACTIVÉE
    if (user.kyc_status !== 'VERIFIED') {
      return c.json({
        success: false,
        error: 'Veuillez compléter la vérification de votre profil avant de publier un trajet',
        requiresKYC: true,
        redirectUrl: '/verify-profile'
      }, 403)
    }
    
    // Create trip
    const tripId = crypto.randomUUID()
    
    await DB.prepare(`
      INSERT INTO trips (
        id, user_id, departure_city, departure_country, arrival_city, arrival_country,
        departure_date, departure_airport, arrival_airport, flight_number,
        available_weight, price_per_kg, description, flexible_dates, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
    `).bind(
      tripId, user_id, departure_city, departure_country, arrival_city, arrival_country,
      departure_date, departure_airport || null, arrival_airport || null, flight_number || null,
      available_weight, price_per_kg, description || null, flexible_dates
    ).run()
    
    // Update user trip count
    await DB.prepare(`
      UPDATE users SET total_trips = total_trips + 1 WHERE id = ?
    `).bind(user_id).run()
    
    // Fetch created trip with user info
    const trip = await DB.prepare(`
      SELECT 
        t.*,
        u.name as traveler_name,
        u.avatar_url as traveler_avatar,
        u.rating as traveler_rating,
        u.reviews_count as traveler_reviews
      FROM trips t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `).bind(tripId).first()
    
    return c.json({
      success: true,
      trip: trip
    }, 201)
    
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// Update trip
app.put('/api/trips/:id', async (c) => {
  const { DB } = c.env
  const tripId = c.req.param('id')
  
  try {
    const body = await c.req.json()
    const {
      user_id,
      departure_city,
      departure_country,
      arrival_city,
      arrival_country,
      departure_date,
      departure_airport,
      arrival_airport,
      flight_number,
      available_weight,
      price_per_kg,
      description,
      flexible_dates,
      status
    } = body
    
    // Check if trip exists and belongs to user
    const trip = await DB.prepare(`
      SELECT * FROM trips WHERE id = ?
    `).bind(tripId).first()
    
    if (!trip) {
      return c.json({
        success: false,
        error: 'Trip not found'
      }, 404)
    }
    
    if (trip.user_id !== user_id) {
      return c.json({
        success: false,
        error: 'Unauthorized'
      }, 403)
    }
    
    // Update trip
    await DB.prepare(`
      UPDATE trips SET
        departure_city = COALESCE(?, departure_city),
        departure_country = COALESCE(?, departure_country),
        arrival_city = COALESCE(?, arrival_city),
        arrival_country = COALESCE(?, arrival_country),
        departure_date = COALESCE(?, departure_date),
        departure_airport = COALESCE(?, departure_airport),
        arrival_airport = COALESCE(?, arrival_airport),
        flight_number = COALESCE(?, flight_number),
        available_weight = COALESCE(?, available_weight),
        price_per_kg = COALESCE(?, price_per_kg),
        description = COALESCE(?, description),
        flexible_dates = COALESCE(?, flexible_dates),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      departure_city, departure_country, arrival_city, arrival_country,
      departure_date, departure_airport, arrival_airport, flight_number,
      available_weight, price_per_kg, description, flexible_dates, status,
      tripId
    ).run()
    
    // Fetch updated trip
    const updatedTrip = await DB.prepare(`
      SELECT 
        t.*,
        u.name as traveler_name,
        u.avatar_url as traveler_avatar,
        u.rating as traveler_rating,
        u.reviews_count as traveler_reviews
      FROM trips t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `).bind(tripId).first()
    
    return c.json({
      success: true,
      trip: updatedTrip
    })
    
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// Delete trip
app.delete('/api/trips/:id', async (c) => {
  const { DB } = c.env
  const tripId = c.req.param('id')
  const user_id = c.req.query('user_id')
  
  try {
    // Check if trip exists and belongs to user
    const trip = await DB.prepare(`
      SELECT * FROM trips WHERE id = ?
    `).bind(tripId).first()
    
    if (!trip) {
      return c.json({
        success: false,
        error: 'Trip not found'
      }, 404)
    }
    
    if (trip.user_id !== user_id) {
      return c.json({
        success: false,
        error: 'Unauthorized'
      }, 403)
    }
    
    // Delete trip
    await DB.prepare(`DELETE FROM trips WHERE id = ?`).bind(tripId).run()
    
    // Update user trip count
    await DB.prepare(`
      UPDATE users SET total_trips = total_trips - 1 WHERE id = ?
    `).bind(user_id).run()
    
    return c.json({
      success: true,
      message: 'Trip deleted successfully'
    })
    
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// Rechercher un utilisateur par email (pour la notation)
app.get('/api/users/by-email', authMiddleware, async (c) => {
  const email = c.req.query('email')
  if (!email) {
    return c.json({ success: false, error: 'email requis' }, 400)
  }
  try {
    const db = c.get('db') as DatabaseService
    const user = await db.getUserByEmail(email)
    if (!user) {
      return c.json({ success: false, error: 'Utilisateur introuvable' }, 404)
    }
    return c.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email }
    })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get user's trips
app.get('/api/users/:user_id/trips', async (c) => {
  const { DB } = c.env
  const userId = c.req.param('user_id')
  const status = c.req.query('status')
  
  try {
    let sql = `
      SELECT 
        t.*,
        u.name as traveler_name,
        u.avatar_url as traveler_avatar,
        u.rating as traveler_rating,
        u.reviews_count as traveler_reviews
      FROM trips t
      JOIN users u ON t.user_id = u.id
      WHERE t.user_id = ?
    `
    
    const params = [userId]
    
    if (status) {
      sql += ` AND t.status = ?`
      params.push(status)
    }
    
    sql += ` ORDER BY t.departure_date DESC`
    
    const result = await DB.prepare(sql).bind(...params).all()
    
    return c.json({
      success: true,
      trips: result.results || []
    })
    
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// ==========================================
// PACKAGES CRUD APIs
// ==========================================

// Upload photos de colis vers R2
app.post('/api/packages/upload-photos', authMiddleware, async (c) => {
  const { R2 } = c.env
  
  try {
    const formData = await c.req.formData()
    const userId = formData.get('user_id')
    const packageId = formData.get('package_id') || crypto.randomUUID()
    
    if (!userId) {
      return c.json({ 
        success: false, 
        error: 'user_id requis' 
      }, 400)
    }
    
    // Récupérer toutes les photos (max 5)
    const photos: string[] = []
    const maxPhotos = 5
    
    for (let i = 0; i < maxPhotos; i++) {
      const photo = formData.get(`photo_${i}`)
      if (!photo || !(photo instanceof File)) continue
      
      // Valider la taille (max 5MB)
      if (photo.size > 5 * 1024 * 1024) {
        return c.json({ 
          success: false, 
          error: `Photo ${i + 1} trop volumineuse (max 5MB)` 
        }, 400)
      }
      
      // Valider le type
      if (!photo.type.startsWith('image/')) {
        return c.json({ 
          success: false, 
          error: `Photo ${i + 1} n'est pas une image valide` 
        }, 400)
      }
      
      // Générer clé unique pour R2
      const fileExt = photo.name.split('.').pop() || 'jpg'
      const photoKey = `packages/${userId}/${packageId}/photo-${i}-${Date.now()}.${fileExt}`
      const photoBuffer = await photo.arrayBuffer()
      
      // Upload vers R2
      if (R2) {
        await R2.put(photoKey, photoBuffer, {
          httpMetadata: { 
            contentType: photo.type 
          },
          customMetadata: {
            userId: String(userId),
            packageId: String(packageId),
            originalName: photo.name
          }
        })
        console.log(`✅ Photo ${i + 1} uploadée vers R2:`, photoKey)
        photos.push(photoKey)
      } else {
        console.log(`⚠️ R2 non disponible - Photo ${i + 1} simulée:`, photoKey)
        photos.push(photoKey) // Simuler en dev
      }
    }
    
    return c.json({ 
      success: true, 
      photos,
      package_id: packageId,
      message: `${photos.length} photo(s) uploadée(s) avec succès` 
    })
    
  } catch (error: any) {
    console.error('Erreur upload photos:', error)
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// Récupérer une photo de colis depuis R2
app.get('/api/packages/photos/:photoKey', async (c) => {
  const { R2 } = c.env
  const photoKey = c.req.param('photoKey')
  
  try {
    if (!R2) {
      // En dev, retourner image placeholder
      return c.redirect('https://via.placeholder.com/400x300?text=Photo+Colis')
    }
    
    // Récupérer depuis R2
    const object = await R2.get(photoKey)
    
    if (!object) {
      return c.json({ 
        success: false, 
        error: 'Photo introuvable' 
      }, 404)
    }
    
    // Retourner l'image
    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000' // Cache 1 an
      }
    })
    
  } catch (error: any) {
    console.error('Erreur récupération photo:', error)
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// Create new package
app.post('/api/packages', authMiddleware, async (c) => {
  const { DB } = c.env
  
  try {
    const body = await c.req.json()
    const {
      user_id,
      title,
      description,
      content_declaration,
      weight,
      dimensions,
      budget,
      departure_city,
      departure_country = 'France',
      arrival_city,
      arrival_country = 'Maroc',
      preferred_date,
      flexible_dates = 1,
      photos = []
    } = body
    
    // Validation
    if (!user_id || !title || !content_declaration || !weight || !budget || !departure_city || !arrival_city) {
      return c.json({
        success: false,
        error: 'Missing required fields'
      }, 400)
    }
    
    // Check if user exists and is verified
    const user = await DB.prepare(`
      SELECT id, name, kyc_status FROM users WHERE id = ?
    `).bind(user_id).first()
    
    if (!user) {
      return c.json({
        success: false,
        error: 'User not found'
      }, 404)
    }
    
    // ✅ KYC VERIFICATION ACTIVÉE
    if (user.kyc_status !== 'VERIFIED') {
      return c.json({
        success: false,
        error: 'Veuillez compléter la vérification de votre profil avant de publier un colis',
        requiresKYC: true,
        redirectUrl: '/verify-profile'
      }, 403)
    }
    
    // Create package
    const packageId = crypto.randomUUID()
    
    await DB.prepare(`
      INSERT INTO packages (
        id, user_id, title, description, content_declaration, weight, dimensions,
        budget, departure_city, departure_country, arrival_city, arrival_country,
        preferred_date, flexible_dates, photos, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED')
    `).bind(
      packageId, user_id, title, description, content_declaration, weight, dimensions || null,
      budget, departure_city, departure_country, arrival_city, arrival_country,
      preferred_date || null, flexible_dates, JSON.stringify(photos)
    ).run()
    
    // Update user package count
    await DB.prepare(`
      UPDATE users SET total_packages = total_packages + 1 WHERE id = ?
    `).bind(user_id).run()
    
    // Fetch created package with user info
    const pkg = await DB.prepare(`
      SELECT 
        p.*,
        u.name as shipper_name,
        u.avatar_url as shipper_avatar,
        u.rating as shipper_rating,
        u.reviews_count as shipper_reviews
      FROM packages p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).bind(packageId).first()
    
    return c.json({
      success: true,
      package: pkg
    }, 201)
    
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// Update package
app.put('/api/packages/:id', async (c) => {
  const { DB } = c.env
  const packageId = c.req.param('id')
  
  try {
    const body = await c.req.json()
    const {
      user_id,
      title,
      description,
      content_declaration,
      weight,
      dimensions,
      budget,
      departure_city,
      departure_country,
      arrival_city,
      arrival_country,
      preferred_date,
      flexible_dates,
      photos,
      status
    } = body
    
    // Check if package exists and belongs to user
    const pkg = await DB.prepare(`
      SELECT * FROM packages WHERE id = ?
    `).bind(packageId).first()
    
    if (!pkg) {
      return c.json({
        success: false,
        error: 'Package not found'
      }, 404)
    }
    
    if (pkg.user_id !== user_id) {
      return c.json({
        success: false,
        error: 'Unauthorized'
      }, 403)
    }
    
    // Update package
    await DB.prepare(`
      UPDATE packages SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        content_declaration = COALESCE(?, content_declaration),
        weight = COALESCE(?, weight),
        dimensions = COALESCE(?, dimensions),
        budget = COALESCE(?, budget),
        departure_city = COALESCE(?, departure_city),
        departure_country = COALESCE(?, departure_country),
        arrival_city = COALESCE(?, arrival_city),
        arrival_country = COALESCE(?, arrival_country),
        preferred_date = COALESCE(?, preferred_date),
        flexible_dates = COALESCE(?, flexible_dates),
        photos = COALESCE(?, photos),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      title, description, content_declaration, weight, dimensions, budget,
      departure_city, departure_country, arrival_city, arrival_country,
      preferred_date, flexible_dates, photos ? JSON.stringify(photos) : null, status,
      packageId
    ).run()
    
    // Fetch updated package
    const updatedPkg = await DB.prepare(`
      SELECT 
        p.*,
        u.name as shipper_name,
        u.avatar_url as shipper_avatar,
        u.rating as shipper_rating,
        u.reviews_count as shipper_reviews
      FROM packages p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).bind(packageId).first()
    
    return c.json({
      success: true,
      package: updatedPkg
    })
    
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// Delete package
app.delete('/api/packages/:id', async (c) => {
  const { DB } = c.env
  const packageId = c.req.param('id')
  const user_id = c.req.query('user_id')
  
  try {
    // Check if package exists and belongs to user
    const pkg = await DB.prepare(`
      SELECT * FROM packages WHERE id = ?
    `).bind(packageId).first()
    
    if (!pkg) {
      return c.json({
        success: false,
        error: 'Package not found'
      }, 404)
    }
    
    if (pkg.user_id !== user_id) {
      return c.json({
        success: false,
        error: 'Unauthorized'
      }, 403)
    }
    
    // Delete package
    await DB.prepare(`DELETE FROM packages WHERE id = ?`).bind(packageId).run()
    
    // Update user package count
    await DB.prepare(`
      UPDATE users SET total_packages = total_packages - 1 WHERE id = ?
    `).bind(user_id).run()
    
    return c.json({
      success: true,
      message: 'Package deleted successfully'
    })
    
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// Get user's packages
app.get('/api/users/:user_id/packages', async (c) => {
  const { DB } = c.env
  const userId = c.req.param('user_id')
  const status = c.req.query('status')
  
  try {
    let sql = `
      SELECT 
        p.*,
        u.name as shipper_name,
        u.avatar_url as shipper_avatar,
        u.rating as shipper_rating,
        u.reviews_count as shipper_reviews
      FROM packages p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
    `
    
    const params = [userId]
    
    if (status) {
      sql += ` AND p.status = ?`
      params.push(status)
    }
    
    sql += ` ORDER BY p.created_at DESC`
    
    const result = await DB.prepare(sql).bind(...params).all()
    
    return c.json({
      success: true,
      packages: result.results || []
    })
    
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// ==========================================
// KYC SELFIE API
// ==========================================

// Upload selfie KYC vers R2
app.post('/api/kyc/upload-selfie', authMiddleware, async (c) => {
  const { R2 } = c.env
  const user = c.get('user')
  
  try {
    const formData = await c.req.formData()
    const selfie = formData.get('selfie')
    
    if (!selfie || !(selfie instanceof File)) {
      return c.json({ 
        success: false, 
        error: 'Aucun fichier selfie fourni' 
      }, 400)
    }
    
    // Validation type
    if (!selfie.type.startsWith('image/')) {
      return c.json({ 
        success: false, 
        error: 'Le fichier doit être une image' 
      }, 400)
    }
    
    // Validation taille (max 10MB)
    if (selfie.size > 10 * 1024 * 1024) {
      return c.json({ 
        success: false, 
        error: 'Image trop volumineuse (max 10MB)' 
      }, 400)
    }
    
    console.log('📤 Uploading selfie for user:', user.id, 'Size:', (selfie.size / 1024).toFixed(2) + ' KB')
    
    if (!R2) {
      // Mode dev : retourner URL placeholder
      return c.json({
        success: true,
        selfieUrl: 'https://via.placeholder.com/400x500?text=Selfie+KYC',
        fileId: 'dev-' + Date.now(),
        message: 'Mode développement (R2 non configuré)'
      })
    }
    
    // Générer clé unique
    const ext = selfie.name.split('.').pop() || 'jpg'
    const fileId = crypto.randomUUID()
    const key = `kyc/selfies/${user.id}/${fileId}.${ext}`
    
    // Upload vers R2
    const buffer = await selfie.arrayBuffer()
    await R2.put(key, buffer, {
      httpMetadata: {
        contentType: selfie.type
      }
    })
    
    console.log('✅ Selfie uploaded successfully:', key)
    
    // Retourner URL et fileId
    return c.json({
      success: true,
      selfieUrl: `/api/kyc/selfie/${fileId}`,
      fileId: fileId,
      message: 'Selfie uploadé avec succès'
    })
    
  } catch (error: any) {
    console.error('❌ Upload selfie error:', error)
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// Récupérer une photo selfie depuis R2
app.get('/api/kyc/selfie/:fileId', async (c) => {
  const { R2 } = c.env
  const fileId = c.req.param('fileId')
  
  try {
    if (!R2) {
      // En dev, retourner image placeholder
      return c.redirect('https://via.placeholder.com/400x500?text=Selfie+KYC')
    }
    
    // Chercher dans R2
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
    
    return c.json({ error: 'Selfie introuvable' }, 404)
    
  } catch (error: any) {
    console.error('❌ Get selfie error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// 
// ==========================================
// VERIFF KYC INTEGRATION
// ==========================================

/**
 * Créer une session de vérification Veriff
 */
app.post('/api/kyc/veriff-session', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    
    if (!user?.id || !user?.email) {
      return c.json({ success: false, error: 'Utilisateur non authentifié' }, 401)
    }
    
    const VERIFF_API_KEY = c.env.VERIFF_API_KEY || ''
    const VERIFF_API_SECRET = c.env.VERIFF_API_SECRET || ''
    
    if (!VERIFF_API_KEY || !VERIFF_API_SECRET) {
      console.error('❌ Veriff API keys not configured')
      return c.json({ success: false, error: 'Service KYC non configuré' }, 500)
    }
    
    console.log('📝 Creating Veriff session for user:', user.id)
    
    const sessionData = {
      verification: {
        callback: `https://amanahgo.app/api/kyc/veriff-webhook`,
        person: {
          firstName: user.name?.split(' ')[0] || 'User',
          lastName: user.name?.split(' ').slice(1).join(' ') || 'Amanah',
        },
        vendorData: user.id
      }
    }
    
    const response = await fetch('https://stationapi.veriff.com/v1/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AUTH-CLIENT': VERIFF_API_KEY
      },
      body: JSON.stringify(sessionData)
    })
    
    const result = await response.json() as any
    
    if (!response.ok) {
      console.error('❌ Veriff API error:', result)
      return c.json({ 
        success: false, 
        error: result.message || 'Erreur lors de la création de la session Veriff' 
      }, response.status)
    }
    
    console.log('✅ Veriff session created:', result.verification.id)
    
    return c.json({
      success: true,
      sessionUrl: result.verification.url,
      sessionId: result.verification.id
    })
    
  } catch (error: any) {
    console.error('❌ Error creating Veriff session:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

app.post('/api/kyc/veriff-webhook', async (c) => {
  try {
    const body = await c.req.json()
    console.log('📥 Veriff webhook received:', JSON.stringify(body, null, 2))
    
    const { status, verification } = body
    const userId = verification?.vendorData
    
    if (!userId) {
      console.error('❌ No user ID in webhook data')
      return c.json({ success: false }, 400)
    }
    
    let kycStatus = 'PENDING_REVIEW'
    
    if (status === 'approved') {
      kycStatus = 'VERIFIED'
    } else if (status === 'declined' || status === 'resubmission_requested') {
      kycStatus = 'REJECTED'
    }
    
    console.log(`📝 Updating KYC status for user ${userId}: ${kycStatus}`)
    
    const db = c.env.DB
    
    await db.prepare(`
      UPDATE users 
      SET 
        kyc_status = ?,
        kyc_verified_at = ?,
        kyc_veriff_session_id = ?
      WHERE id = ?
    `).bind(
      kycStatus,
      kycStatus === 'VERIFIED' ? new Date().toISOString() : null,
      verification?.id || null,
      userId
    ).run()
    
    console.log(`✅ KYC status updated for user ${userId}`)
    
    return c.json({ success: true })
    
  } catch (error: any) {
    console.error('❌ Webhook error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})
// ==========================================
// VERIFF KYC ENDPOINTS (ISOLATED)
// ==========================================

// Endpoint: Create Veriff session
app.post('/api/kyc/veriff-session', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    if (!user || !user.id || !user.email) {
      return c.json({ success: false, error: 'User not authenticated' }, 401)
    }

    // Get Veriff API credentials from environment
    const VERIFF_API_KEY = c.env?.VERIFF_API_KEY
    const VERIFF_API_SECRET = c.env?.VERIFF_API_SECRET

    if (!VERIFF_API_KEY || !VERIFF_API_SECRET) {
      console.error('❌ Veriff credentials missing')
      return c.json({ 
        success: false, 
        error: 'Veriff configuration missing' 
      }, 500)
    }

    // Create Veriff session
    const sessionData = {
      verification: {
        callback: 'https://amanahgo.app/api/kyc/veriff-webhook',
        person: {
          firstName: user.name?.split(' ')[0] || 'User',
          lastName: user.name?.split(' ').slice(1).join(' ') || user.email.split('@')[0]
        },
        vendorData: user.id // Store user ID for webhook
      }
    }

    console.log('🔐 Creating Veriff session for user:', user.id)

    const response = await fetch('https://stationapi.veriff.com/v1/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AUTH-CLIENT': VERIFF_API_KEY
      },
      body: JSON.stringify(sessionData)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Veriff API error:', data)
      return c.json({ 
        success: false, 
        error: data.message || 'Failed to create Veriff session' 
      }, 500)
    }

    console.log('✅ Veriff session created:', data.verification.id)

    return c.json({
      success: true,
      sessionUrl: data.verification.url,
      sessionId: data.verification.id
    })

  } catch (error: any) {
    console.error('❌ Veriff session error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Endpoint: Veriff webhook (receives verification results)
app.post('/api/kyc/veriff-webhook', async (c) => {
  try {
    const payload = await c.req.json()
    console.log('📨 Veriff webhook received:', JSON.stringify(payload, null, 2))

    const { status, verification } = payload

    if (!verification || !verification.vendorData) {
      console.error('❌ Missing vendorData in webhook')
      return c.json({ success: false, error: 'Invalid webhook payload' }, 400)
    }

    const userId = verification.vendorData
    const sessionId = verification.id

    console.log(`🔍 Processing webhook for user ${userId}, session ${sessionId}, status: ${status}`)

    // Update user KYC status in database
    const DB = c.env.DB
    
    let kycStatus = 'PENDING'
    if (status === 'approved') {
      kycStatus = 'VERIFIED'
    } else if (status === 'declined' || status === 'resubmission_requested') {
      kycStatus = 'REJECTED'
    }

    const now = new Date().toISOString()

    await DB.prepare(`
      UPDATE users 
      SET kyc_status = ?, 
          kyc_verified_at = ?,
          kyc_veriff_session_id = ?
      WHERE id = ?
    `).bind(kycStatus, now, sessionId, userId).run()

    console.log(`✅ User ${userId} KYC updated to ${kycStatus}`)

    return c.json({ success: true })

  } catch (error: any) {
    console.error('❌ Webhook error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// DASHBOARD PAGES
// ==========================================
// Dashboard Voyageur - Mes trajets
app.get('/voyageur/mes-trajets', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mes Trajets - Amanah GO</title>
        <link href="/static/tailwind.css" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          .filter-btn.active {
            background-color: #2563eb;
            color: white;
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <nav class="bg-white shadow-sm border-b sticky top-0 z-10">
            <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-16 w-auto">
                    <span class="text-2xl font-bold text-gray-900">Amanah GO</span>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="text-gray-600"><i class="fas fa-user-circle mr-2"></i><span id="userName"></span></span>
                    <a href="/" class="text-blue-600 hover:text-blue-700"><i class="fas fa-home mr-2"></i>Accueil</a>
                </div>
            </div>
        </nav>
        <div id="loader" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
            <div class="bg-white rounded-lg p-8 flex flex-col items-center">
                <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
                <p class="text-gray-600">Chargement...</p>
            </div>
        </div>
        <div id="mainContent" class="max-w-7xl mx-auto px-4 py-8">
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2"><i class="fas fa-suitcase-rolling text-blue-600 mr-3"></i>Mes Trajets</h1>
                <p class="text-gray-600">Gérez vos trajets et suivez vos gains</p>
            </div>
            <div class="grid md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-sm text-gray-600">Total trajets</p>
                        <i class="fas fa-route text-2xl text-blue-600"></i>
                    </div>
                    <p class="text-3xl font-bold text-gray-900" id="statTotalTrips">0</p>
                </div>
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-sm text-gray-600">Trajets actifs</p>
                        <i class="fas fa-check-circle text-2xl text-green-600"></i>
                    </div>
                    <p class="text-3xl font-bold text-gray-900" id="statActiveTrips">0</p>
                </div>
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-sm text-gray-600">Poids total (kg)</p>
                        <i class="fas fa-weight-hanging text-2xl text-purple-600"></i>
                    </div>
                    <p class="text-3xl font-bold text-gray-900" id="statTotalWeight">0</p>
                </div>
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-sm text-gray-600">Gains potentiels</p>
                        <i class="fas fa-euro-sign text-2xl text-green-600"></i>
                    </div>
                    <p class="text-3xl font-bold text-green-600" id="statTotalEarnings">0</p>
                </div>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div class="flex gap-2">
                    <button class="filter-btn active px-4 py-2 rounded-lg border border-gray-300 transition-colors" data-filter="ALL">Tous</button>
                    <button class="filter-btn px-4 py-2 rounded-lg border border-gray-300 transition-colors" data-filter="ACTIVE">Actifs</button>
                    <button class="filter-btn px-4 py-2 rounded-lg border border-gray-300 transition-colors" data-filter="COMPLETED">Terminés</button>
                    <button class="filter-btn px-4 py-2 rounded-lg border border-gray-300 transition-colors" data-filter="CANCELLED">Annulés</button>
                </div>
                <a href="/voyageur/publier-trajet" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                    <i class="fas fa-plus mr-2"></i>Nouveau trajet
                </a>
            </div>
            <div id="tripsContainer" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/traveler-dashboard.js"></script>
    </body>
    </html>
  `)
})

// Dashboard Expéditeur - Mes colis
app.get('/expediteur/mes-colis', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mes Colis - Amanah GO</title>
        <link href="/static/tailwind.css" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          .filter-btn.active {
            background-color: #2563eb;
            color: white;
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <nav class="bg-white shadow-sm border-b sticky top-0 z-10">
            <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-16 w-auto">
                    <span class="text-2xl font-bold text-gray-900">Amanah GO</span>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="text-gray-600"><i class="fas fa-user-circle mr-2"></i><span id="userName"></span></span>
                    <a href="/" class="text-blue-600 hover:text-blue-700"><i class="fas fa-home mr-2"></i>Accueil</a>
                </div>
            </div>
        </nav>
        <div id="loader" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
            <div class="bg-white rounded-lg p-8 flex flex-col items-center">
                <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
                <p class="text-gray-600">Chargement...</p>
            </div>
        </div>
        <div id="mainContent" class="max-w-7xl mx-auto px-4 py-8">
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2"><i class="fas fa-box text-blue-600 mr-3"></i>Mes Colis</h1>
                <p class="text-gray-600">Gérez vos colis et suivez vos envois</p>
            </div>
            <div class="grid md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-sm text-gray-600">Total colis</p>
                        <i class="fas fa-boxes text-2xl text-blue-600"></i>
                    </div>
                    <p class="text-3xl font-bold text-gray-900" id="statTotalPackages">0</p>
                </div>
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-sm text-gray-600">Colis publiés</p>
                        <i class="fas fa-check-circle text-2xl text-green-600"></i>
                    </div>
                    <p class="text-3xl font-bold text-gray-900" id="statPublishedPackages">0</p>
                </div>
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-sm text-gray-600">Poids total (kg)</p>
                        <i class="fas fa-weight-hanging text-2xl text-purple-600"></i>
                    </div>
                    <p class="text-3xl font-bold text-gray-900" id="statTotalWeight">0</p>
                </div>
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-sm text-gray-600">Budget moyen</p>
                        <i class="fas fa-euro-sign text-2xl text-green-600"></i>
                    </div>
                    <p class="text-3xl font-bold text-green-600" id="statAvgBudget">0</p>
                </div>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div class="flex gap-2">
                    <button class="filter-btn active px-4 py-2 rounded-lg border border-gray-300 transition-colors" data-filter="ALL">Tous</button>
                    <button class="filter-btn px-4 py-2 rounded-lg border border-gray-300 transition-colors" data-filter="PUBLISHED">Publiés</button>
                    <button class="filter-btn px-4 py-2 rounded-lg border border-gray-300 transition-colors" data-filter="RESERVED">Réservés</button>
                    <button class="filter-btn px-4 py-2 rounded-lg border border-gray-300 transition-colors" data-filter="DELIVERED">Livrés</button>
                </div>
                <a href="/expediteur/publier-colis" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                    <i class="fas fa-plus mr-2"></i>Nouveau colis
                </a>
            </div>
            <div id="packagesContainer" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/shipper-dashboard.js"></script>
    </body>
    </html>
  `)
})

// ==========================================
// MATCHING SYSTEM - Intelligent Algorithm
// ==========================================

/**
 * API: GET /api/matches/trips-for-package
 * Find compatible trips for a package (Expéditeur use case)
 * Smart matching with compatibility score
 */
app.get('/api/matches/trips-for-package', async (c) => {
  const { DB } = c.env
  
  try {
    const origin = c.req.query('origin')
    const destination = c.req.query('destination')
    const weight = parseFloat(c.req.query('weight') || '0')
    const departureDate = c.req.query('departure_date')
    const maxPrice = parseFloat(c.req.query('max_price') || '999')
    const flexibleDates = c.req.query('flexible_dates') === 'true'
    
    if (!origin || !destination || !weight) {
      return c.json({ 
        success: false, 
        error: 'origin, destination et weight sont requis' 
      }, 400)
    }
    
    // Build SQL query
    let sql = `
      SELECT 
        t.*,
        u.name as traveler_name,
        u.email as traveler_email,
        u.avatar_url as traveler_avatar,
        u.rating as traveler_rating,
        u.total_trips as traveler_total_trips,
        u.kyc_status as traveler_kyc
      FROM trips t
      INNER JOIN users u ON t.user_id = u.id
      WHERE t.status = 'ACTIVE'
        AND t.available_weight >= ?
        AND t.price_per_kg <= ?
        AND LOWER(t.departure_city) LIKE ?
        AND LOWER(t.arrival_city) LIKE ?
    `
    
    const params = [
      weight,
      maxPrice,
      `%${origin.toLowerCase()}%`,
      `%${destination.toLowerCase()}%`
    ]
    
    // Date filtering
    if (departureDate && !flexibleDates) {
      sql += ` AND DATE(t.departure_date) = DATE(?)`
      params.push(departureDate)
    } else if (departureDate && flexibleDates) {
      sql += ` AND DATE(t.departure_date) BETWEEN DATE(?, '-2 days') AND DATE(?, '+2 days')`
      params.push(departureDate, departureDate)
    }
    
    sql += ` ORDER BY t.departure_date ASC, t.price_per_kg ASC LIMIT 50`
    
    const { results } = await DB.prepare(sql).bind(...params).all()
    
    // Calculate match score for each trip (Algorithm Score 0-100)
    const tripsWithScore = results.map(trip => {
      let score = 100
      let details = []
      
      // 1. Score based on available weight (prefer trips with just enough space)
      const weightDiff = trip.available_weight - weight
      const weightRatio = weight / trip.available_weight
      if (weightDiff === 0) {
        score += 20 // Perfect match
        details.push('Poids parfait: +20')
      } else if (weightDiff < 5) {
        score += 10 // Close match
        details.push('Poids proche: +10')
      } else if (weightRatio > 0.7) {
        score += 15 // Good capacity use
        details.push('Bonne capacité: +15')
      } else if (weightRatio > 0.5) {
        score += 10
        details.push('Capacité OK: +10')
      } else if (weightRatio < 0.2) {
        score -= 5 // Package too small for capacity
        details.push('Colis trop petit: -5')
      }
      
      // 2. Score based on price (lower is better)
      const priceRatio = trip.price_per_kg / maxPrice
      if (priceRatio < 0.5) {
        score += 15 // Great price (< 50% of max)
        details.push('Prix excellent: +15')
      } else if (priceRatio < 0.7) {
        score += 10 // Good price
        details.push('Bon prix: +10')
      } else if (priceRatio < 0.9) {
        score += 5 // Fair price
        details.push('Prix correct: +5')
      } else if (priceRatio > 0.95) {
        score -= 5 // Almost at max budget
        details.push('Prix limite: -5')
      }
      
      // 3. Score based on traveler reputation (Trust & Safety)
      if (trip.traveler_kyc === 'VERIFIED') {
        score += 15
        details.push('KYC vérifié: +15')
      } else {
        score -= 10
        details.push('KYC non vérifié: -10')
      }
      
      if (trip.traveler_rating >= 4.8) {
        score += 15 // Excellent rating
        details.push('Rating excellent: +15')
      } else if (trip.traveler_rating >= 4.5) {
        score += 10
        details.push('Bon rating: +10')
      } else if (trip.traveler_rating >= 4.0) {
        score += 5
        details.push('Rating OK: +5')
      } else if (trip.traveler_rating < 3.5) {
        score -= 10 // Low rating
        details.push('Rating faible: -10')
      }
      
      if (trip.traveler_total_trips > 20) {
        score += 10 // Very experienced
        details.push('Très expérimenté: +10')
      } else if (trip.traveler_total_trips > 10) {
        score += 5
        details.push('Expérimenté: +5')
      } else if (trip.traveler_total_trips < 2) {
        score -= 5 // New traveler
        details.push('Nouveau: -5')
      }
      
      // 4. Score based on date proximity
      if (departureDate) {
        const tripDate = new Date(trip.departure_date)
        const targetDate = new Date(departureDate)
        const daysDiff = Math.abs((tripDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff === 0) {
          score += 15 // Same day
          details.push('Même jour: +15')
        } else if (daysDiff === 1) {
          score += 10 // 1 day diff
          details.push('1 jour écart: +10')
        } else if (daysDiff <= 2) {
          score += 5 // 2 days diff
          details.push('2 jours écart: +5')
        } else if (daysDiff > 7) {
          score -= 5 // Too far in future
          details.push('Date éloignée: -5')
        }
        
        // Bonus for flexible dates
        if (trip.flexible_dates) {
          score += 5
          details.push('Dates flexibles: +5')
        }
      }
      
      // 5. Bonus for quick response (trip created recently)
      const createdAt = new Date(trip.created_at)
      const now = new Date()
      const hoursSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
      if (hoursSinceCreated < 24) {
        score += 5 // Recently posted
        details.push('Trajet récent: +5')
      }
      
      // 6. Bonus for complete profile
      if (trip.traveler_avatar) {
        score += 3
        details.push('Profil photo: +3')
      }
      if (trip.flight_number) {
        score += 3
        details.push('N° vol fourni: +3')
      }
      
      // Calculate estimated cost
      const estimatedCost = (weight * trip.price_per_kg).toFixed(2)
      const platformFee = (estimatedCost * 0.12).toFixed(2)
      const totalCost = (parseFloat(estimatedCost) + parseFloat(platformFee)).toFixed(2)
      const savings = maxPrice > trip.price_per_kg 
        ? ((maxPrice - trip.price_per_kg) * weight).toFixed(2)
        : '0.00'
      
      return {
        ...trip,
        match_score: Math.min(Math.max(score, 0), 100), // Cap between 0-100
        score_details: details,
        estimated_cost: estimatedCost,
        platform_fee: platformFee,
        total_cost: totalCost,
        potential_savings: savings,
        match_quality: score >= 90 ? 'excellent' : score >= 75 ? 'good' : score >= 60 ? 'fair' : 'low',
        recommendation: score >= 90 ? 'Fortement recommandé' : score >= 75 ? 'Bon choix' : score >= 60 ? 'À considérer' : 'Vérifier alternatives'
      }
    })
    
    // Sort by match score (highest first)
    tripsWithScore.sort((a, b) => b.match_score - a.match_score)
    
    return c.json({
      success: true,
      matches: tripsWithScore,
      total: tripsWithScore.length,
      search_params: { origin, destination, weight, departureDate, maxPrice, flexibleDates }
    })
    
  } catch (error) {
    console.error('Erreur matching:', error)
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

/**
 * API: GET /api/matches/packages-for-trip
 * Find compatible packages for a trip (Voyageur use case)
 * Smart matching with compatibility score
 */
app.get('/api/matches/packages-for-trip', async (c) => {
  const { DB } = c.env
  
  try {
    const origin = c.req.query('origin')
    const destination = c.req.query('destination')
    const availableWeight = parseFloat(c.req.query('available_weight') || '0')
    const pricePerKg = parseFloat(c.req.query('price_per_kg') || '0')
    const departureDate = c.req.query('departure_date')
    const flexibleDates = c.req.query('flexible_dates') === 'true'
    
    if (!origin || !destination || !availableWeight) {
      return c.json({ 
        success: false, 
        error: 'origin, destination et available_weight sont requis' 
      }, 400)
    }
    
    // Build SQL query
    let sql = `
      SELECT 
        p.*,
        u.name as shipper_name,
        u.email as shipper_email,
        u.avatar_url as shipper_avatar,
        u.rating as shipper_rating,
        u.total_packages as shipper_total_packages,
        u.kyc_status as shipper_kyc
      FROM packages p
      INNER JOIN users u ON p.user_id = u.id
      WHERE p.status = 'PUBLISHED'
        AND p.weight <= ?
        AND LOWER(p.departure_city) LIKE ?
        AND LOWER(p.arrival_city) LIKE ?
    `
    
    const params = [
      availableWeight,
      `%${origin.toLowerCase()}%`,
      `%${destination.toLowerCase()}%`
    ]
    
    // Date filtering
    if (departureDate && !flexibleDates) {
      sql += ` AND DATE(p.preferred_date) = DATE(?)`
      params.push(departureDate)
    } else if (departureDate && flexibleDates) {
      sql += ` AND (
        p.flexible_dates = 1 
        OR DATE(p.preferred_date) BETWEEN DATE(?, '-2 days') AND DATE(?, '+2 days')
      )`
      params.push(departureDate, departureDate)
    }
    
    sql += ` ORDER BY p.created_at DESC LIMIT 50`
    
    const { results } = await DB.prepare(sql).bind(...params).all()
    
    // Calculate match score for each package (Algorithm Score 0-100)
    const packagesWithScore = results.map(pkg => {
      let score = 100
      let details = []
      
      // 1. Score based on weight (prefer packages that use more capacity)
      const weightRatio = pkg.weight / availableWeight
      if (weightRatio > 0.8) {
        score += 20 // Great use of capacity (80%+)
        details.push('Excellente capacité: +20')
      } else if (weightRatio > 0.6) {
        score += 15 // Good capacity use
        details.push('Bonne capacité: +15')
      } else if (weightRatio > 0.4) {
        score += 10 // Fair capacity use
        details.push('Capacité OK: +10')
      } else if (weightRatio > 0.2) {
        score += 5 // Low capacity use
        details.push('Faible capacité: +5')
      } else {
        score -= 5 // Too small, not worth it
        details.push('Trop petit: -5')
      }
      
      // 2. Score based on budget vs price
      if (pricePerKg > 0) {
        const estimatedPrice = pkg.weight * pricePerKg
        const budgetRatio = pkg.budget / estimatedPrice
        if (budgetRatio >= 1.3) {
          score += 20 // Excellent margin (30%+ above cost)
          details.push('Marge excellente: +20')
        } else if (budgetRatio >= 1.15) {
          score += 15 // Good margin
          details.push('Bonne marge: +15')
        } else if (budgetRatio >= 1.0) {
          score += 10 // Fair margin
          details.push('Marge OK: +10')
        } else if (budgetRatio >= 0.9) {
          score += 5 // Tight budget
          details.push('Budget serré: +5')
        } else {
          score -= 10 // Budget too low
          details.push('Budget insuffisant: -10')
        }
      }
      
      // 3. Score based on shipper reputation (Trust & Safety)
      if (pkg.shipper_kyc === 'VERIFIED') {
        score += 15
        details.push('KYC vérifié: +15')
      } else {
        score -= 10
        details.push('KYC non vérifié: -10')
      }
      
      if (pkg.shipper_rating >= 4.8) {
        score += 15 // Excellent rating
        details.push('Rating excellent: +15')
      } else if (pkg.shipper_rating >= 4.5) {
        score += 10
        details.push('Bon rating: +10')
      } else if (pkg.shipper_rating >= 4.0) {
        score += 5
        details.push('Rating OK: +5')
      } else if (pkg.shipper_rating < 3.5) {
        score -= 10 // Low rating
        details.push('Rating faible: -10')
      }
      
      if (pkg.shipper_total_packages > 10) {
        score += 10 // Experienced shipper
        details.push('Expéditeur expérimenté: +10')
      } else if (pkg.shipper_total_packages > 5) {
        score += 5
        details.push('Expérience OK: +5')
      } else if (pkg.shipper_total_packages < 2) {
        score -= 3 // New shipper
        details.push('Nouveau: -3')
      }
      
      // 4. Score based on date compatibility
      if (departureDate && pkg.preferred_date) {
        const pkgDate = new Date(pkg.preferred_date)
        const tripDate = new Date(departureDate)
        const daysDiff = Math.abs((pkgDate.getTime() - tripDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff === 0) {
          score += 15 // Same day
          details.push('Même jour: +15')
        } else if (daysDiff === 1) {
          score += 10 // 1 day diff
          details.push('1 jour écart: +10')
        } else if (daysDiff <= 2) {
          score += 5 // 2 days diff
          details.push('2 jours écart: +5')
        } else if (daysDiff > 7) {
          score -= 3 // Date too far
          details.push('Date éloignée: -3')
        }
        
        // Bonus for flexible dates
        if (pkg.flexible_dates) {
          score += 5
          details.push('Dates flexibles: +5')
        }
      }
      
      // 5. Bonus for package with photos (transparency)
      if (pkg.photos && pkg.photos.length > 0) {
        score += 5
        details.push(`${pkg.photos.length} photo(s): +5`)
      }
      
      // 6. Bonus for detailed content declaration
      if (pkg.content_declaration && pkg.content_declaration.length > 50) {
        score += 3
        details.push('Description détaillée: +3')
      }
      
      // 7. Bonus for recently posted
      const createdAt = new Date(pkg.created_at)
      const now = new Date()
      const hoursSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
      if (hoursSinceCreated < 24) {
        score += 5
        details.push('Colis récent: +5')
      } else if (hoursSinceCreated > 168) { // 7 days
        score -= 3
        details.push('Colis ancien: -3')
      }
      
      // Calculate potential earnings
      const potentialEarnings = pricePerKg > 0 
        ? (pkg.weight * pricePerKg * 0.88).toFixed(2) // After 12% commission
        : null
      const platformCommission = pricePerKg > 0 
        ? (pkg.weight * pricePerKg * 0.12).toFixed(2)
        : null
      
      return {
        ...pkg,
        match_score: Math.min(Math.max(score, 0), 100), // Cap between 0-100
        score_details: details,
        potential_earnings: potentialEarnings,
        platform_commission: platformCommission,
        match_quality: score >= 90 ? 'excellent' : score >= 75 ? 'good' : score >= 60 ? 'fair' : 'low',
        recommendation: score >= 90 ? 'Fortement recommandé' : score >= 75 ? 'Bon choix' : score >= 60 ? 'À considérer' : 'Vérifier alternatives'
      }
    })
    
    // Sort by match score (highest first)
    packagesWithScore.sort((a, b) => b.match_score - a.match_score)
    
    return c.json({
      success: true,
      matches: packagesWithScore,
      total: packagesWithScore.length,
      search_params: { origin, destination, availableWeight, pricePerKg, departureDate, flexibleDates }
    })
    
  } catch (error) {
    console.error('Erreur matching:', error)
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// ==========================================
// EXCHANGE SYSTEM - Gestion des échanges de colis (RDV Public)
// ==========================================

/**
 * Helper: Init tables if not exist (dev mode)
 */
async function initExchangeTables(DB: D1Database) {
  // Create exchanges table
  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS exchanges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      package_id INTEGER NOT NULL,
      trip_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      traveler_id INTEGER NOT NULL,
      receiver_id INTEGER,
      pickup_location TEXT NOT NULL,
      pickup_latitude REAL,
      pickup_longitude REAL,
      pickup_date DATETIME,
      pickup_code TEXT NOT NULL,
      pickup_confirmed BOOLEAN DEFAULT 0,
      pickup_photo_url TEXT,
      pickup_notes TEXT,
      pickup_attempts INTEGER DEFAULT 0,
      delivery_location TEXT NOT NULL,
      delivery_latitude REAL,
      delivery_longitude REAL,
      delivery_date DATETIME,
      delivery_code TEXT NOT NULL,
      delivery_confirmed BOOLEAN DEFAULT 0,
      delivery_photo_url TEXT,
      delivery_notes TEXT,
      delivery_attempts INTEGER DEFAULT 0,
      status TEXT DEFAULT 'PENDING',
      transaction_code TEXT NOT NULL,
      amount REAL NOT NULL,
      commission REAL NOT NULL,
      traveler_earnings REAL NOT NULL,
      payment_status TEXT DEFAULT 'PENDING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      accepted_at DATETIME,
      pickup_confirmed_at DATETIME,
      delivery_confirmed_at DATETIME,
      completed_at DATETIME,
      cancelled_at DATETIME
    )
  `).run()

  // Create exchange_messages table
  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS exchange_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exchange_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      message_type TEXT DEFAULT 'TEXT',
      read_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run()

  // Create public_meeting_places table
  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS public_meeting_places (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      description TEXT,
      hours TEXT,
      safety_rating REAL DEFAULT 5.0,
      is_recommended BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run()
  
  // Insert default meeting places if table is empty
  const count = await DB.prepare('SELECT COUNT(*) as count FROM public_meeting_places').first()
  if (count.count === 0) {
    // FRANCE - Paris
    await DB.prepare(`
      INSERT INTO public_meeting_places (name, type, address, city, country, latitude, longitude, description, hours, safety_rating) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind('Gare de Lyon', 'TRAIN_STATION', 'Place Louis-Armand, 75012', 'Paris', 'France', 48.8443, 2.3736, 'Grande gare SNCF avec de nombreux commerces', '{"all": "24/7"}', 5.0).run()
    
    await DB.prepare(`
      INSERT INTO public_meeting_places (name, type, address, city, country, latitude, longitude, description, hours, safety_rating) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind('Gare du Nord', 'TRAIN_STATION', 'Rue de Dunkerque, 75010', 'Paris', 'France', 48.8809, 2.3553, 'Gare internationale Eurostar et Thalys', '{"all": "24/7"}', 5.0).run()
    
    await DB.prepare(`
      INSERT INTO public_meeting_places (name, type, address, city, country, latitude, longitude, description, hours, safety_rating) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind('Aéroport Charles de Gaulle', 'AIRPORT', 'Terminal 2, 95700 Roissy', 'Paris', 'France', 49.0097, 2.5479, 'Terminal 2 - Zone publique', '{"all": "24/7"}', 5.0).run()

    // MAROC - Casablanca
    await DB.prepare(`
      INSERT INTO public_meeting_places (name, type, address, city, country, latitude, longitude, description, hours, safety_rating) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind('Gare Casa-Voyageurs', 'TRAIN_STATION', 'Boulevard Mohammed V', 'Casablanca', 'Maroc', 33.5925, -7.6187, 'Gare ONCF principale de Casablanca', '{"all": "24/7"}', 5.0).run()
    
    await DB.prepare(`
      INSERT INTO public_meeting_places (name, type, address, city, country, latitude, longitude, description, hours, safety_rating) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind('Aéroport Mohammed V', 'AIRPORT', 'Nouasseur, 27000', 'Casablanca', 'Maroc', 33.3675, -7.5898, 'Terminal 1 - Zone publique', '{"all": "24/7"}', 5.0).run()
    
    await DB.prepare(`
      INSERT INTO public_meeting_places (name, type, address, city, country, latitude, longitude, description, hours, safety_rating) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind('Morocco Mall', 'MALL', 'Boulevard de la Corniche', 'Casablanca', 'Maroc', 33.5699, -7.6771, 'Plus grand centre commercial du Maroc', '{"all": "10h-22h"}', 5.0).run()
  }
}

/**
 * Helper: Generate unique 6-digit code
 */
/**
 * Generate secure 6-digit code
 * @returns {string} 6-digit code
 */
function generateCode(): string {
  // Secure random 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Validate security code format
 */
function isValidCode(code: string): boolean {
  return /^\d{6}$/.test(code)
}

/**
 * Check if code is expired (24h)
 */
function isCodeExpired(createdAt: string): boolean {
  const created = new Date(createdAt)
  const now = new Date()
  const hoursDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60)
  return hoursDiff > 24
}

/**
 * Send security codes via SMS/Email
 */
async function sendSecurityCodes(
  userPhone: string,
  userEmail: string,
  userName: string,
  pickupCode: string,
  deliveryCode: string,
  packageTitle: string,
  env: any
) {
  try {
    // SMS notifications removed - using Firebase Phone Auth instead
    console.log('📱 Codes de sécurité générés pour:', userPhone)
    
    // Send Email with Resend
    if (env.RESEND_API_KEY) {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .code-box { background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
            .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .label { font-size: 14px; color: #666; margin-bottom: 10px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Codes de Sécurité</h1>
              <p>Amanah GO - Transport Collaboratif</p>
            </div>
            <div class="content">
              <p>Bonjour <strong>${userName}</strong>,</p>
              <p>Voici vos codes de sécurité pour le colis <strong>"${packageTitle}"</strong> :</p>
              
              <div class="code-box">
                <div class="label">🟢 CODE REMISE (Pickup)</div>
                <div class="code">${pickupCode}</div>
                <p style="font-size: 12px; color: #666; margin-top: 10px;">À communiquer lors de la remise du colis</p>
              </div>
              
              <div class="code-box">
                <div class="label">🔵 CODE LIVRAISON (Delivery)</div>
                <div class="code">${deliveryCode}</div>
                <p style="font-size: 12px; color: #666; margin-top: 10px;">À communiquer lors de la réception du colis</p>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important :</strong>
                <ul style="margin: 10px 0;">
                  <li>Ces codes sont valides pendant <strong>24 heures</strong></li>
                  <li>Ne partagez ces codes qu'avec les personnes concernées</li>
                  <li>3 tentatives maximum par code</li>
                  <li>Une photo de preuve sera demandée à chaque étape</li>
                </ul>
              </div>
              
              <p style="text-align: center; margin-top: 30px;">
                <a href="https://amanahgo.app/" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Suivre mon colis</a>
              </p>
            </div>
            <div class="footer">
              <p>Amanah GO - Plateforme de transport collaboratif France ↔ Maroc</p>
              <p>En cas de problème, contactez-nous : support@amanah-go.com</p>
            </div>
          </div>
        </body>
        </html>
      `
      
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Amanah GO <noreply@amanah-go.com>',
          to: userEmail,
          subject: `🔐 Codes de sécurité - ${packageTitle}`,
          html: emailHtml
        })
      })
      console.log('✅ Email envoyé:', userEmail)
    } else {
      console.log('⚠️ Resend non configuré - Email simulé:', userEmail)
    }
    
    return true
  } catch (error) {
    console.error('❌ Erreur envoi codes:', error)
    return false
  }
}

// ============================================================================
// MATCHING APIs - Algorithme Intelligent
// ============================================================================

/**
 * Calculer le score de compatibilité entre un colis et un trajet (0-100)
 */
function calculateMatchScore(packageData: any, tripData: any): number {
  let score = 0
  
  // 1. Compatibilité dates (30 points max)
  const packageDate = new Date(packageData.preferred_date)
  const tripDate = new Date(tripData.departure_date)
  const daysDiff = Math.abs((packageDate.getTime() - tripDate.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysDiff === 0) {
    score += 30 // Même jour = parfait
  } else if (daysDiff <= 2 && packageData.flexible_dates) {
    score += 25 // ±2 jours avec flexibilité
  } else if (daysDiff <= 2) {
    score += 20 // ±2 jours sans flexibilité
  } else if (daysDiff <= 7) {
    score += 10 // Même semaine
  }
  
  // 2. Compatibilité aéroports origine/destination (25 points max)
  const originMatch = packageData.origin_city === tripData.departure_city || packageData.origin_city === tripData.origin_city
  const destMatch = packageData.destination_city === tripData.arrival_city || packageData.destination_city === tripData.destination_city
  
  if (originMatch && destMatch) {
    score += 25 // Trajet exact
  } else if (originMatch || destMatch) {
    score += 15 // Au moins une ville correspond
  }
  
  // 3. Compatibilité poids (20 points max)
  const availableWeight = tripData.available_weight - (tripData.reserved_weight || 0)
  const packageWeight = packageData.weight
  
  if (packageWeight <= availableWeight) {
    const ratio = packageWeight / availableWeight
    if (ratio <= 0.5) {
      score += 20 // Largement suffisant
    } else if (ratio <= 0.8) {
      score += 15 // Bon ratio
    } else {
      score += 10 // Juste suffisant
    }
  } else {
    score += 0 // Poids insuffisant
  }
  
  // 4. Compatibilité prix (15 points max)
  const proposedPricePerKg = packageData.budget / packageData.weight
  const requestedPricePerKg = tripData.price_per_kg
  
  if (proposedPricePerKg >= requestedPricePerKg) {
    const ratio = proposedPricePerKg / requestedPricePerKg
    if (ratio >= 1.2) {
      score += 15 // Paie plus que demandé
    } else if (ratio >= 1.0) {
      score += 12 // Paie exactement
    } else {
      score += 8 // Paie un peu moins
    }
  }
  
  // 5. Rating utilisateur (10 points max)
  const travelerRating = tripData.traveler_rating || 0
  if (travelerRating >= 4.5) {
    score += 10
  } else if (travelerRating >= 4.0) {
    score += 8
  } else if (travelerRating >= 3.5) {
    score += 5
  } else if (travelerRating > 0) {
    score += 3
  }
  
  return Math.min(Math.round(score), 100)
}

/**
 * API: POST /api/matches/trips-for-package
 * Trouver les trajets compatibles pour un colis donné
 */
app.post('/api/matches/trips-for-package', async (c) => {
  const { DB } = c.env
  
  try {
    await initExchangeTables(DB)
    
    const body = await c.req.json()
    const {
      origin_city,
      destination_city,
      weight,
      budget,
      preferred_date,
      flexible_dates = false,
      min_rating = 0,
      kyc_verified_only = false
    } = body
    
    // Validation
    if (!origin_city || !destination_city || !weight || !budget || !preferred_date) {
      return c.json({ error: 'Champs obligatoires manquants' }, 400)
    }
    
    // Récupérer tous les trajets actifs
    const tripsResult = await DB.prepare(`
      SELECT 
        t.*,
        u.name as traveler_name,
        u.email as traveler_email,
        u.kyc_status,
        u.rating as traveler_rating
      FROM trips t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.status = 'active'
        AND t.departure_city = ?
        AND t.arrival_city = ?
        AND (t.available_weight - COALESCE(t.reserved_weight, 0)) >= ?
      ORDER BY t.departure_date ASC
    `).bind(origin_city, destination_city, weight).all()
    
    if (!tripsResult.results || tripsResult.results.length === 0) {
      return c.json({ 
        matches: [],
        total: 0,
        message: 'Aucun trajet trouvé pour ces critères'
      })
    }
    
    // Préparer les données du colis pour le scoring
    const packageData = {
      origin_city,
      destination_city,
      weight,
      budget,
      preferred_date,
      flexible_dates
    }
    
    // Calculer le score pour chaque trajet
    const matches = tripsResult.results
      .map((trip: any) => {
        const score = calculateMatchScore(packageData, trip)
        
        // Appliquer les filtres
        if (kyc_verified_only && trip.kyc_status !== 'VERIFIED') {
          return null
        }
        if (trip.traveler_rating < min_rating) {
          return null
        }
        
        // Calculer les détails financiers
        const pricePerKg = trip.price_per_kg
        const totalPrice = pricePerKg * weight
        const commission = totalPrice * 0.12
        const travelerEarns = totalPrice - commission
        const savings = (28 * weight) - totalPrice // vs DHL
        
        return {
          trip_id: trip.id,
          score,
          traveler: {
            id: trip.user_id,
            name: trip.traveler_name,
            rating: trip.traveler_rating || 0,
            kyc_status: trip.kyc_status
          },
          trip: {
            origin_city: trip.departure_city,
            destination_city: trip.arrival_city,
            departure_date: trip.departure_date,
            arrival_date: trip.arrival_date,
            available_weight: trip.available_weight - (trip.reserved_weight || 0),
            price_per_kg: trip.price_per_kg,
            flexible_dates: trip.flexible_dates,
            flight_number: trip.flight_number
          },
          pricing: {
            price_per_kg: pricePerKg,
            total_price: Math.round(totalPrice * 100) / 100,
            commission: Math.round(commission * 100) / 100,
            traveler_earns: Math.round(travelerEarns * 100) / 100,
            savings: Math.round(savings * 100) / 100,
            savings_percent: Math.round((savings / (28 * weight)) * 100)
          },
          compatibility: {
            date_match: score >= 20,
            route_match: score >= 40,
            weight_ok: score >= 50,
            price_ok: score >= 60
          }
        }
      })
      .filter((match: any) => match !== null)
      .sort((a: any, b: any) => b.score - a.score) // Trier par score décroissant
    
    return c.json({
      matches,
      total: matches.length,
      package_details: packageData,
      filters: {
        min_rating,
        kyc_verified_only
      }
    })
    
  } catch (error: any) {
    console.error('Error finding trips for package:', error)
    return c.json({ error: error.message }, 500)
  }
})

/**
 * API: POST /api/matches/packages-for-trip
 * Trouver les colis compatibles pour un trajet donné
 */
app.post('/api/matches/packages-for-trip', async (c) => {
  const { DB } = c.env
  
  try {
    await initExchangeTables(DB)
    
    const body = await c.req.json()
    const {
      origin_city,
      destination_city,
      available_weight,
      price_per_kg,
      departure_date,
      flexible_dates = false,
      min_budget = 0
    } = body
    
    // Validation
    if (!origin_city || !destination_city || !available_weight || !price_per_kg || !departure_date) {
      return c.json({ error: 'Champs obligatoires manquants' }, 400)
    }
    
    // Récupérer tous les colis publiés
    const packagesResult = await DB.prepare(`
      SELECT 
        p.*,
        u.name as sender_name,
        u.email as sender_email,
        u.kyc_status,
        u.rating as sender_rating
      FROM packages p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.status = 'published'
        AND p.departure_city = ?
        AND p.arrival_city = ?
        AND p.weight <= ?
      ORDER BY p.created_at DESC
    `).bind(origin_city, destination_city, available_weight).all()
    
    if (!packagesResult.results || packagesResult.results.length === 0) {
      return c.json({ 
        matches: [],
        total: 0,
        message: 'Aucun colis trouvé pour ce trajet'
      })
    }
    
    // Préparer les données du trajet pour le scoring
    const tripData = {
      origin_city,
      destination_city,
      available_weight,
      price_per_kg,
      departure_date,
      flexible_dates,
      traveler_rating: 5.0 // Valeur par défaut
    }
    
    // Calculer le score pour chaque colis
    const matches = packagesResult.results
      .map((pkg: any) => {
        const score = calculateMatchScore(pkg, tripData)
        
        // Appliquer filtres
        if (pkg.budget < min_budget) {
          return null
        }
        
        // Calculer les détails financiers
        const totalPrice = price_per_kg * pkg.weight
        const commission = totalPrice * 0.12
        const travelerEarns = totalPrice - commission
        const senderPays = totalPrice
        const savings = (28 * pkg.weight) - senderPays
        
        return {
          package_id: pkg.id,
          score,
          sender: {
            id: pkg.user_id,
            name: pkg.sender_name,
            rating: pkg.sender_rating || 0,
            kyc_status: pkg.kyc_status
          },
          package: {
            title: pkg.title,
            content: pkg.content,
            weight: pkg.weight,
            dimensions: pkg.dimensions,
            budget: pkg.budget,
            preferred_date: pkg.preferred_date,
            flexible_dates: pkg.flexible_dates,
            photo_url: pkg.photo_url
          },
          pricing: {
            sender_pays: Math.round(senderPays * 100) / 100,
            traveler_earns: Math.round(travelerEarns * 100) / 100,
            commission: Math.round(commission * 100) / 100,
            savings: Math.round(savings * 100) / 100,
            savings_percent: Math.round((savings / (28 * pkg.weight)) * 100)
          },
          compatibility: {
            date_match: score >= 20,
            route_match: score >= 40,
            weight_ok: true,
            budget_ok: pkg.budget >= (price_per_kg * pkg.weight)
          }
        }
      })
      .filter((match: any) => match !== null)
      .sort((a: any, b: any) => b.score - a.score)
    
    return c.json({
      matches,
      total: matches.length,
      trip_details: {
        origin_city,
        destination_city,
        available_weight,
        price_per_kg,
        departure_date,
        flexible_dates
      },
      filters: {
        min_budget
      }
    })
    
  } catch (error: any) {
    console.error('Error finding packages for trip:', error)
    return c.json({ error: error.message }, 500)
  }
})

/**
 * API: POST /api/exchanges/request
 * Créer une demande d'échange de colis (Expéditeur → Voyageur)
 */
app.post('/api/exchanges/request', authMiddleware, async (c) => {
  const { DB } = c.env
  
  try {
    // Init tables (dev mode)
    await initExchangeTables(DB)
    
    const body = await c.req.json()
    const {
      package_id,
      trip_id,
      sender_id,
      traveler_id,
      receiver_id,
      pickup_location,
      pickup_latitude,
      pickup_longitude,
      pickup_date,
      pickup_notes,
      delivery_location,
      delivery_latitude,
      delivery_longitude,
      delivery_date,
      delivery_notes
    } = body
    
    // Validation
    if (!package_id || !trip_id || !sender_id || !traveler_id || !pickup_location || !delivery_location) {
      return c.json({ 
        success: false, 
        error: 'package_id, trip_id, sender_id, traveler_id, pickup_location, delivery_location sont requis' 
      }, 400)
    }
    
    // Get package and trip info for pricing
    const pkg = await DB.prepare('SELECT * FROM packages WHERE id = ?').bind(package_id).first()
    const trip = await DB.prepare('SELECT * FROM trips WHERE id = ?').bind(trip_id).first()
    
    if (!pkg || !trip) {
      return c.json({ success: false, error: 'Package ou Trip introuvable' }, 404)
    }
    
    // Calculate pricing
    const amount = pkg.weight * trip.price_per_kg
    const commission = amount * 0.12
    const traveler_earnings = amount - commission
    
    // Generate unique codes
    const pickup_code = generateCode()
    const delivery_code = generateCode()
    const transaction_code = generateCode()
    
    // Get sender and traveler info for sending codes
    const sender = await DB.prepare('SELECT * FROM users WHERE id = ?').bind(sender_id).first()
    const traveler = await DB.prepare('SELECT * FROM users WHERE id = ?').bind(traveler_id).first()
    
    if (!sender || !traveler) {
      return c.json({ success: false, error: 'Utilisateur introuvable' }, 404)
    }
    
    // Create exchange
    const result = await DB.prepare(`
      INSERT INTO exchanges (
        package_id, trip_id, sender_id, traveler_id, receiver_id,
        pickup_location, pickup_latitude, pickup_longitude, pickup_date, pickup_code, pickup_notes,
        delivery_location, delivery_latitude, delivery_longitude, delivery_date, delivery_code, delivery_notes,
        status, transaction_code, amount, commission, traveler_earnings, payment_status,
        pickup_attempts, delivery_attempts
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, 'PENDING', 0, 0)
    `).bind(
      package_id, trip_id, sender_id, traveler_id, receiver_id || null,
      pickup_location, pickup_latitude || null, pickup_longitude || null, pickup_date || null, pickup_code, pickup_notes || null,
      delivery_location, delivery_latitude || null, delivery_longitude || null, delivery_date || null, delivery_code, delivery_notes || null,
      transaction_code, amount, commission, traveler_earnings
    ).run()
    
    // Send security codes to sender (via SMS/Email)
    await sendSecurityCodes(
      sender.phone,
      sender.email,
      sender.name,
      pickup_code,
      delivery_code,
      pkg.title,
      c.env
    )
    
    // Send security codes to traveler (via SMS/Email)
    await sendSecurityCodes(
      traveler.phone,
      traveler.email,
      traveler.name,
      pickup_code,
      delivery_code,
      pkg.title,
      c.env
    )
    
    console.log(`✅ Codes sécurité envoyés - Échange #${result.meta.last_row_id}`)
    
    return c.json({
      success: true,
      exchange_id: result.meta.last_row_id,
      pickup_code,  // Pour affichage immédiat dans l'UI
      delivery_code, // Pour affichage immédiat dans l'UI
      transaction_code,
      amount,
      commission,
      traveler_earnings,
      message: 'Demande d\'échange créée avec succès. Codes de sécurité envoyés par SMS et Email.'
    })
    
  } catch (error) {
    console.error('Erreur création échange:', error)
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

/**
 * API: GET /api/exchanges/:id
 * Obtenir les détails d'un échange
 */
app.get('/api/exchanges/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  try {
    const exchange = await DB.prepare(`
      SELECT 
        e.*,
        p.title as package_title,
        p.weight as package_weight,
        p.departure_city as package_departure,
        p.arrival_city as package_arrival,
        t.departure_city as trip_departure,
        t.arrival_city as trip_arrival,
        t.departure_date as trip_date,
        sender.name as sender_name,
        sender.email as sender_email,
        sender.phone as sender_phone,
        sender.avatar_url as sender_avatar,
        traveler.name as traveler_name,
        traveler.email as traveler_email,
        traveler.phone as traveler_phone,
        traveler.avatar_url as traveler_avatar,
        traveler.rating as traveler_rating,
        traveler.kyc_status as traveler_kyc
      FROM exchanges e
      INNER JOIN packages p ON e.package_id = p.id
      INNER JOIN trips t ON e.trip_id = t.id
      INNER JOIN users sender ON e.sender_id = sender.id
      INNER JOIN users traveler ON e.traveler_id = traveler.id
      WHERE e.id = ?
    `).bind(id).first()
    
    if (!exchange) {
      return c.json({ success: false, error: 'Échange introuvable' }, 404)
    }
    
    return c.json({ success: true, exchange })
    
  } catch (error) {
    console.error('Erreur récupération échange:', error)
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

/**
 * API: PUT /api/exchanges/:id/accept
 * Voyageur accepte la demande d'échange
 */
app.put('/api/exchanges/:id/accept', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  try {
    const result = await DB.prepare(`
      UPDATE exchanges 
      SET status = 'ACCEPTED', accepted_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status = 'PENDING'
    `).bind(id).run()
    
    if (result.meta.changes === 0) {
      return c.json({ success: false, error: 'Échange introuvable ou déjà accepté' }, 404)
    }
    
    return c.json({ success: true, message: 'Échange accepté avec succès' })
    
  } catch (error) {
    console.error('Erreur acceptation échange:', error)
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

/**
 * API: PUT /api/exchanges/:id/confirm-pickup
 * Voyageur confirme avoir récupéré le colis
 */
app.put('/api/exchanges/:id/confirm-pickup', authMiddleware, async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const body = await c.req.json()
  const { pickup_code, pickup_photo_url } = body
  const user = c.get('user')
  
  try {
    // Vérifications
    if (!pickup_code || !pickup_photo_url) {
      return c.json({ success: false, error: 'Code de collecte et photo obligatoires' }, 400)
    }
    
    if (!isValidCode(pickup_code)) {
      return c.json({ success: false, error: 'Format du code invalide (6 chiffres)' }, 400)
    }
    
    const exchange = await DB.prepare('SELECT * FROM exchanges WHERE id = ?').bind(id).first()
    
    if (!exchange) {
      return c.json({ success: false, error: 'Échange introuvable' }, 404)
    }
    
    if (exchange.traveler_id !== user.id) {
      return c.json({ success: false, error: 'Non autorisé' }, 403)
    }
    
    if (exchange.pickup_confirmed) {
      return c.json({ success: false, error: 'Collecte déjà confirmée' }, 400)
    }
    
    if (isCodeExpired(exchange.created_at)) {
      return c.json({ success: false, error: 'Code expiré (24h)' }, 400)
    }
    
    const currentAttempts = exchange.pickup_attempts || 0
    if (currentAttempts >= 3) {
      return c.json({ success: false, error: 'Max tentatives atteint (3)' }, 429)
    }
    
    if (exchange.pickup_code !== pickup_code) {
      await DB.prepare('UPDATE exchanges SET pickup_attempts = pickup_attempts + 1 WHERE id = ?').bind(id).run()
      const remaining = 2 - currentAttempts
      return c.json({ success: false, error: `Code invalide. ${remaining} tentative(s) restante(s).` }, 400)
    }
    
    await DB.prepare(`
      UPDATE exchanges 
      SET pickup_confirmed = 1, pickup_confirmed_at = CURRENT_TIMESTAMP, pickup_photo_url = ?, status = 'IN_TRANSIT'
      WHERE id = ?
    `).bind(pickup_photo_url, id).run()
    
    console.log(`✅ Pickup confirmé - Échange #${id}`)
    
    return c.json({ success: true, message: '✅ Collecte confirmée !' })
    
  } catch (error) {
    console.error('Erreur confirmation collecte:', error)
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

/**
 * API: PUT /api/exchanges/:id/confirm-delivery
 * Voyageur confirme avoir livré le colis
 */
app.put('/api/exchanges/:id/confirm-delivery', authMiddleware, async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const body = await c.req.json()
  const { delivery_code, delivery_photo_url } = body
  const user = c.get('user')
  
  try {
    if (!delivery_code || !delivery_photo_url) {
      return c.json({ success: false, error: 'Code de livraison et photo obligatoires' }, 400)
    }
    
    if (!isValidCode(delivery_code)) {
      return c.json({ success: false, error: 'Format du code invalide (6 chiffres)' }, 400)
    }
    
    const exchange = await DB.prepare('SELECT * FROM exchanges WHERE id = ?').bind(id).first()
    
    if (!exchange) {
      return c.json({ success: false, error: 'Échange introuvable' }, 404)
    }
    
    if (exchange.traveler_id !== user.id && exchange.receiver_id !== user.id && exchange.sender_id !== user.id) {
      return c.json({ success: false, error: 'Non autorisé' }, 403)
    }
    
    if (!exchange.pickup_confirmed) {
      return c.json({ success: false, error: 'La collecte doit être confirmée avant la livraison' }, 400)
    }
    
    if (exchange.delivery_confirmed) {
      return c.json({ success: false, error: 'Livraison déjà confirmée' }, 400)
    }
    
    if (isCodeExpired(exchange.created_at)) {
      return c.json({ success: false, error: 'Code expiré (24h)' }, 400)
    }
    
    const currentAttempts = exchange.delivery_attempts || 0
    if (currentAttempts >= 3) {
      return c.json({ success: false, error: 'Max tentatives atteint (3)' }, 429)
    }
    
    if (exchange.delivery_code !== delivery_code) {
      await DB.prepare('UPDATE exchanges SET delivery_attempts = delivery_attempts + 1 WHERE id = ?').bind(id).run()
      const remaining = 2 - currentAttempts
      return c.json({ success: false, error: `Code invalide. ${remaining} tentative(s) restante(s).` }, 400)
    }
    
    await DB.prepare(`
      UPDATE exchanges 
      SET delivery_confirmed = 1, delivery_confirmed_at = CURRENT_TIMESTAMP, delivery_photo_url = ?,
          status = 'DELIVERED', completed_at = CURRENT_TIMESTAMP, payment_status = 'RELEASED'
      WHERE id = ?
    `).bind(delivery_photo_url, id).run()
    
    console.log(`✅ Delivery confirmé - Échange #${id} - Paiement releasé`)
    
    return c.json({ success: true, message: '✅ Livraison confirmée ! Le paiement a été libéré au voyageur.' })
    
  } catch (error) {
    console.error('Erreur confirmation livraison:', error)
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

/**
 * API: GET /api/meeting-places
 * Obtenir la liste des lieux publics recommandés
 */
app.get('/api/meeting-places', async (c) => {
  const { DB } = c.env
  const { city, country, type } = c.req.query()
  
  try {
    // Init tables (dev mode)
    await initExchangeTables(DB)
    
    let sql = 'SELECT * FROM public_meeting_places WHERE is_recommended = 1'
    const params = []
    
    if (city) {
      sql += ' AND LOWER(city) LIKE ?'
      params.push(`%${city.toLowerCase()}%`)
    }
    
    if (country) {
      sql += ' AND LOWER(country) = ?'
      params.push(country.toLowerCase())
    }
    
    if (type) {
      sql += ' AND type = ?'
      params.push(type)
    }
    
    sql += ' ORDER BY safety_rating DESC, name ASC'
    
    const { results } = await DB.prepare(sql).bind(...params).all()
    
    return c.json({ success: true, meeting_places: results || [] })
    
  } catch (error) {
    console.error('Erreur récupération lieux:', error)
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// ==========================================
// PAGE: PAIEMENT STRIPE
// ==========================================

app.get('/expediteur/payer', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Paiement Sécurisé - Amanah GO</title>
        <link href="/static/tailwind.css" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://js.stripe.com/v3/"></script>
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <header class="bg-white shadow-sm">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-10">
                        <h1 class="text-xl font-bold text-gray-900">Paiement Sécurisé</h1>
                    </div>
                    <a href="/expediteur" class="text-gray-600 hover:text-gray-800">
                        <i class="fas fa-times text-xl"></i>
                    </a>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="container mx-auto px-4 py-8 max-w-2xl">
            <!-- Formulaire de paiement -->
            <div id="payment-form-container" class="bg-white rounded-lg shadow-lg p-8">
                <!-- Sécurité Stripe -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div class="flex items-start">
                        <i class="fas fa-shield-alt text-blue-600 text-2xl mr-3"></i>
                        <div>
                            <h3 class="font-semibold text-gray-900 mb-1">Paiement 100% sécurisé</h3>
                            <p class="text-sm text-gray-700">
                                Vos informations bancaires sont protégées par Stripe, 
                                leader mondial des paiements en ligne.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Détails du paiement -->
                <div class="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 class="font-semibold text-gray-900 mb-4">Détail du paiement</h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Montant total</span>
                            <span class="font-semibold" id="amount-total">--</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Commission plateforme (12%)</span>
                            <span class="text-gray-600" id="amount-fee">--</span>
                        </div>
                        <div class="border-t border-gray-300 pt-2 mt-2"></div>
                        <div class="flex justify-between">
                            <span class="text-gray-900 font-semibold">Le voyageur reçoit (88%)</span>
                            <span class="text-green-600 font-bold" id="amount-traveler">--</span>
                        </div>
                    </div>
                </div>

                <!-- Formulaire -->
                <form id="payment-form" class="space-y-6">
                    <!-- Nom sur la carte -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Nom sur la carte *
                        </label>
                        <input 
                            type="text" 
                            id="cardholder-name"
                            required
                            placeholder="JEAN DUPONT"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <!-- Carte bancaire (Stripe Element) -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Informations de carte *
                        </label>
                        <div id="card-element" class="p-4 border border-gray-300 rounded-lg bg-white"></div>
                        <div id="card-errors" class="hidden text-red-600 text-sm mt-2"></div>
                    </div>

                    <!-- Bouton de paiement -->
                    <button 
                        type="submit"
                        id="submit-payment"
                        class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors">
                        <i class="fas fa-lock mr-2"></i>Payer maintenant
                    </button>

                    <!-- Note de sécurité -->
                    <p class="text-xs text-center text-gray-500">
                        <i class="fas fa-lock mr-1"></i>
                        Connexion sécurisée SSL. Vos informations sont cryptées.
                    </p>
                </form>
            </div>

            <!-- Message de succès (caché par défaut) -->
            <div id="payment-success" class="hidden bg-white rounded-lg shadow-lg p-8 text-center">
                <div class="mb-6">
                    <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-check text-green-600 text-4xl"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Paiement réussi !</h2>
                    <p class="text-gray-600">
                        Votre paiement a été traité avec succès. 
                        Le voyageur recevra les fonds après livraison confirmée.
                    </p>
                </div>
                <div class="bg-blue-50 rounded-lg p-4">
                    <p class="text-sm text-gray-700">
                        <i class="fas fa-info-circle text-blue-600 mr-2"></i>
                        Redirection automatique dans 3 secondes...
                    </p>
                </div>
            </div>
        </main>

        <script src="/static/auth.js"></script>
        <script src="/static/auth-ui.js"></script>
        <script src="/static/stripe-payment.js"></script>
    </body>
    </html>
  `)
})

// ==========================================
// PAGE: RECHERCHE AVANCÉE DE MATCHING
// ==========================================

app.get('/search', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recherche Avancée - Amanah GO</title>
        <link href="/static/tailwind.css" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/i18n.css?v=3" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <!-- Header -->
        <header class="bg-white shadow-md border-b-2 border-blue-500">
            <div class="container mx-auto px-4 py-4 flex justify-between items-center">
                <div class="flex items-center space-x-3">
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-10 w-auto">
                    <h1 class="text-xl font-bold text-gray-800">Amanah GO</h1>
                </div>
                <div class="flex items-center space-x-4">
                    <div id="langSwitcherContainer"></div>
                    <a href="/" class="px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors" data-i18n="nav.home">Accueil</a>
                    <a href="/login" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" data-i18n="nav.login">Connexion</a>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <div class="container mx-auto px-4 py-8 max-w-4xl">
            <!-- Title Section -->
            <div class="text-center mb-8">
                <h2 class="text-3xl font-bold text-gray-800 mb-2">
                    <i class="fas fa-search text-blue-600 mr-3"></i>
                    <span data-i18n="search.title">Recherche Avancée</span>
                </h2>
                <p class="text-gray-600" data-i18n="search.subtitle">Trouvez le trajet ou colis parfait pour vous</p>
            </div>

            <!-- User Type Selection -->
            <div class="grid md:grid-cols-2 gap-4 mb-8">
                <button id="btnSearchTrips" class="p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all border-2 border-blue-500">
                    <div class="text-center">
                        <i class="fas fa-plane-departure text-4xl text-blue-600 mb-3"></i>
                        <h3 class="text-xl font-bold text-gray-800 mb-2" data-i18n="search.search_trips">Je cherche un trajet</h3>
                        <p class="text-sm text-gray-600" data-i18n="search.search_trips_desc">Pour envoyer un colis</p>
                    </div>
                </button>
                <button id="btnSearchPackages" class="p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-green-500">
                    <div class="text-center">
                        <i class="fas fa-box text-4xl text-green-600 mb-3"></i>
                        <h3 class="text-xl font-bold text-gray-800 mb-2" data-i18n="search.search_packages">Je cherche des colis</h3>
                        <p class="text-sm text-gray-600" data-i18n="search.search_packages_desc">Pour optimiser mon voyage</p>
                    </div>
                </button>
            </div>

            <!-- Search Form for Trips (Expéditeur) -->
            <div id="formSearchTrips" class="bg-white rounded-xl shadow-lg p-6 hidden">
                <h3 class="text-2xl font-bold text-blue-600 mb-6">
                    <i class="fas fa-plane mr-2"></i>
                    <span data-i18n="search.form_trips_title">Trouver un trajet</span>
                </h3>
                <form id="searchTripsForm" class="space-y-4">
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="search.origin">Origine</label>
                            <input type="text" name="origin" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Paris, Marseille...">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="search.destination">Destination</label>
                            <input type="text" name="destination" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Casablanca, Marrakech...">
                        </div>
                    </div>
                    <div class="grid md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="search.weight">Poids (kg)</label>
                            <input type="number" name="weight" required min="0.1" max="30" step="0.1" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="5">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="search.departure_date">Date départ</label>
                            <input type="date" name="departure_date" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="search.max_price">Prix max (€/kg)</label>
                            <input type="number" name="max_price" min="0" step="0.1" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="15">
                        </div>
                    </div>
                    <div class="flex items-center">
                        <input type="checkbox" name="flexible_dates" id="flexibleDatesTrips" class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500">
                        <label for="flexibleDatesTrips" class="ml-3 text-sm text-gray-700" data-i18n="search.flexible_dates">Dates flexibles (±2 jours)</label>
                    </div>
                    <button type="submit" class="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg">
                        <i class="fas fa-search mr-2"></i>
                        <span data-i18n="search.search_button">Rechercher</span>
                    </button>
                </form>
            </div>

            <!-- Search Form for Packages (Voyageur) -->
            <div id="formSearchPackages" class="bg-white rounded-xl shadow-lg p-6 hidden">
                <h3 class="text-2xl font-bold text-green-600 mb-6">
                    <i class="fas fa-box mr-2"></i>
                    <span data-i18n="search.form_packages_title">Trouver des colis</span>
                </h3>
                <form id="searchPackagesForm" class="space-y-4">
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="search.origin">Origine</label>
                            <input type="text" name="origin" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Paris, Marseille...">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="search.destination">Destination</label>
                            <input type="text" name="destination" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Casablanca, Marrakech...">
                        </div>
                    </div>
                    <div class="grid md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="search.available_weight">Poids disponible (kg)</label>
                            <input type="number" name="available_weight" required min="1" max="30" step="0.1" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="15">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="search.price_per_kg">Prix proposé (€/kg)</label>
                            <input type="number" name="price_per_kg" min="0" step="0.1" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="8">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="search.departure_date">Date départ</label>
                            <input type="date" name="departure_date" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        </div>
                    </div>
                    <div class="flex items-center">
                        <input type="checkbox" name="flexible_dates" id="flexibleDatesPackages" class="w-5 h-5 text-green-600 rounded focus:ring-green-500">
                        <label for="flexibleDatesPackages" class="ml-3 text-sm text-gray-700" data-i18n="search.flexible_dates">Dates flexibles (±2 jours)</label>
                    </div>
                    <button type="submit" class="w-full py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-lg">
                        <i class="fas fa-search mr-2"></i>
                        <span data-i18n="search.search_button">Rechercher</span>
                    </button>
                </form>
            </div>
        </div>

        <!-- JavaScript -->
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/auth.js"></script>
        <script src="/static/auth-ui.js"></script>
        <script src="/static/i18n.js?v=3"></script>
        <script>
          // Language Switcher Component (inline for immediate availability)
          function createLanguageSwitcher() {
            const currentLang = window.i18n?.getCurrentLang() || 'fr'
            const languages = [
              { code: 'fr', name: 'Français', flag: '🇫🇷' },
              { code: 'ar', name: 'العربية', flag: '🇲🇦' },
              { code: 'en', name: 'English', flag: '🇬🇧' }
            ]
            
            const current = languages.find(l => l.code === currentLang) || languages[0]
            
            return \`
              <div class="lang-switcher">
                <button class="lang-switcher-minimal" id="langSwitcherBtn" title="\${current.name}">
                  <span class="lang-flag-only">\${current.flag}</span>
                </button>
                
                <div class="lang-switcher-dropdown" id="langDropdown">
                  \${languages.map(lang => \`
                    <div class="lang-option \${lang.code === currentLang ? 'active' : ''}" 
                         data-lang="\${lang.code}">
                      <span class="lang-flag">\${lang.flag}</span>
                      <span>\${lang.name}</span>
                      \${lang.code === currentLang ? '<i class="fas fa-check ml-auto text-blue-600"></i>' : ''}
                    </div>
                  \`).join('')}
                </div>
              </div>
            \`
          }
          
          function attachLanguageSwitcherEvents(container) {
            // Attach click event to the button
            const btn = container.querySelector('#langSwitcherBtn')
            if (btn) {
              btn.addEventListener('click', (e) => {
                e.stopPropagation()
                toggleLangDropdown()
              })
            }
            
            // Attach click events to language options
            const options = container.querySelectorAll('.lang-option')
            options.forEach(option => {
              option.addEventListener('click', () => {
                const lang = option.getAttribute('data-lang')
                if (lang) switchLanguage(lang)
              })
            })
          }
          
          function toggleLangDropdown() {
            const dropdowns = document.querySelectorAll('#langDropdown')
            dropdowns.forEach(dropdown => {
              dropdown.classList.toggle('show')
            })
          }
          
          function switchLanguage(lang) {
            if (window.i18n) {
              window.i18n.setLanguage(lang)
            }
          }
          
          // Close dropdown when clicking outside
          document.addEventListener('click', function(event) {
            const switcher = document.querySelector('.lang-switcher')
            const dropdown = document.getElementById('langDropdown')
            
            if (switcher && dropdown && !switcher.contains(event.target)) {
              dropdown.classList.remove('show')
            }
          })
        </script>
        <script>
            // Toggle between search types
            const btnSearchTrips = document.getElementById('btnSearchTrips')
            const btnSearchPackages = document.getElementById('btnSearchPackages')
            const formSearchTrips = document.getElementById('formSearchTrips')
            const formSearchPackages = document.getElementById('formSearchPackages')

            btnSearchTrips.addEventListener('click', () => {
                btnSearchTrips.classList.add('border-blue-500')
                btnSearchTrips.classList.remove('border-transparent')
                btnSearchPackages.classList.remove('border-green-500')
                btnSearchPackages.classList.add('border-transparent')
                formSearchTrips.classList.remove('hidden')
                formSearchPackages.classList.add('hidden')
            })

            btnSearchPackages.addEventListener('click', () => {
                btnSearchPackages.classList.add('border-green-500')
                btnSearchPackages.classList.remove('border-transparent')
                btnSearchTrips.classList.remove('border-blue-500')
                btnSearchTrips.classList.add('border-transparent')
                formSearchPackages.classList.remove('hidden')
                formSearchTrips.classList.add('hidden')
            })

            // Handle Trips Search
            document.getElementById('searchTripsForm').addEventListener('submit', async (e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const params = new URLSearchParams({
                    origin: formData.get('origin'),
                    destination: formData.get('destination'),
                    weight: formData.get('weight'),
                    departure_date: formData.get('departure_date') || '',
                    max_price: formData.get('max_price') || '999',
                    flexible_dates: formData.get('flexible_dates') ? 'true' : 'false',
                    search_type: 'trips'
                })
                window.location.href = \`/results?\${params.toString()}\`
            })

            // Handle Packages Search
            document.getElementById('searchPackagesForm').addEventListener('submit', async (e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const params = new URLSearchParams({
                    origin: formData.get('origin'),
                    destination: formData.get('destination'),
                    available_weight: formData.get('available_weight'),
                    price_per_kg: formData.get('price_per_kg') || '0',
                    departure_date: formData.get('departure_date') || '',
                    flexible_dates: formData.get('flexible_dates') ? 'true' : 'false',
                    search_type: 'packages'
                })
                window.location.href = \`/results?\${params.toString()}\`
            })

            // Auto-select based on URL param
            const urlParams = new URLSearchParams(window.location.search)
            const searchType = urlParams.get('type')
            if (searchType === 'packages') {
                btnSearchPackages.click()
            } else {
                btnSearchTrips.click()
            }
        </script>
    </body>
    </html>
  `)
})

// ==========================================
// PAGE: RÉSULTATS DE MATCHING
// ==========================================

app.get('/results', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Résultats de recherche - Amanah GO</title>
        <link href="/static/tailwind.css" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/i18n.css?v=3" rel="stylesheet">
        <style>
            .match-card {
                transition: all 0.3s ease;
            }
            .match-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            }
            .score-badge {
                position: absolute;
                top: -10px;
                right: -10px;
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.8; }
            }
            .skeleton {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: loading 1.5s infinite;
            }
            @keyframes loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
        </style>
    </head>
    <body class="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <!-- Header -->
        <header class="bg-white shadow-md border-b-2 border-blue-500 sticky top-0 z-50">
            <div class="container mx-auto px-4 py-4 flex justify-between items-center">
                <div class="flex items-center space-x-3">
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-10 w-auto">
                    <h1 class="text-xl font-bold text-gray-800">Amanah GO</h1>
                </div>
                <div class="flex items-center space-x-4">
                    <div id="langSwitcherContainer"></div>
                    <a href="/search" class="px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors">
                        <i class="fas fa-arrow-left mr-2"></i><span data-i18n="common.back">Retour</span>
                    </a>
                    <a href="/" class="px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors" data-i18n="nav.home">Accueil</a>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <div class="container mx-auto px-4 py-8">
            <!-- Search Summary -->
            <div id="searchSummary" class="bg-white rounded-xl shadow-md p-6 mb-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800 mb-2">
                            <i id="summaryIcon" class="fas fa-search mr-2"></i>
                            <span id="summaryTitle">Résultats de recherche</span>
                        </h2>
                        <p id="summaryRoute" class="text-gray-600"></p>
                    </div>
                    <div class="text-right">
                        <p class="text-3xl font-bold text-blue-600" id="resultsCount">0</p>
                        <p class="text-sm text-gray-500" data-i18n="search.results_found">résultats trouvés</p>
                    </div>
                </div>
            </div>

            <!-- Filters & Sorting -->
            <div class="grid md:grid-cols-4 gap-4 mb-6">
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-sort mr-2"></i><span data-i18n="search.sort_by">Trier par</span>
                    </label>
                    <select id="sortBy" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="score" data-i18n="search.sort_score">Score (meilleur)</option>
                        <option value="price_asc" data-i18n="search.sort_price_asc">Prix (croissant)</option>
                        <option value="price_desc" data-i18n="search.sort_price_desc">Prix (décroissant)</option>
                        <option value="date" data-i18n="search.sort_date">Date (proche)</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-star mr-2"></i><span data-i18n="search.filter_rating">Rating min</span>
                    </label>
                    <select id="filterRating" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="0" data-i18n="search.filter_rating_all">Tous</option>
                        <option value="3">3+ ⭐</option>
                        <option value="4">4+ ⭐⭐⭐⭐</option>
                        <option value="4.5">4.5+ ⭐⭐⭐⭐⭐</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-shield-alt mr-2"></i><span data-i18n="search.filter_kyc">KYC</span>
                    </label>
                    <select id="filterKYC" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="all" data-i18n="search.filter_kyc_all">Tous</option>
                        <option value="VERIFIED" data-i18n="search.filter_kyc_verified">Vérifiés uniquement</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-chart-line mr-2"></i><span data-i18n="search.filter_score">Score min</span>
                    </label>
                    <select id="filterScore" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="0" data-i18n="search.filter_score_all">Tous</option>
                        <option value="60">60+ (Fair)</option>
                        <option value="75">75+ (Good)</option>
                        <option value="90">90+ (Excellent)</option>
                    </select>
                </div>
            </div>

            <!-- Loading State -->
            <div id="loadingState" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="bg-white rounded-xl p-6 skeleton h-64"></div>
                <div class="bg-white rounded-xl p-6 skeleton h-64"></div>
                <div class="bg-white rounded-xl p-6 skeleton h-64"></div>
            </div>

            <!-- Results Container -->
            <div id="resultsContainer" class="hidden grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Results will be injected here -->
            </div>

            <!-- No Results State -->
            <div id="noResults" class="hidden text-center py-16">
                <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-2xl font-bold text-gray-600 mb-2" data-i18n="search.no_results">Àucun résultat trouvé</h3>
                <p class="text-gray-500 mb-6" data-i18n="search.no_results_desc">Essayez de modifier vos critères de recherche</p>
                <a href="/search" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block">
                    <i class="fas fa-redo mr-2"></i><span data-i18n="search.new_search">Nouvelle recherche</span>
                </a>
            </div>
        </div>

        <!-- Contact Modal -->
        <div id="contactModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-envelope mr-2 text-blue-600"></i><span data-i18n="search.contact">Contacter</span>
                    </h3>
                    <button id="closeModal" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                <div id="modalContent"></div>
            </div>
        </div>

        <!-- JavaScript -->
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/auth.js"></script>
        <script src="/static/auth-ui.js"></script>
        <script src="/static/i18n.js?v=3"></script>
        <script>
          // Language Switcher Component (inline for immediate availability)
          function createLanguageSwitcher() {
            const currentLang = window.i18n?.getCurrentLang() || 'fr'
            const languages = [
              { code: 'fr', name: 'Français', flag: '🇫🇷' },
              { code: 'ar', name: 'العربية', flag: '🇲🇦' },
              { code: 'en', name: 'English', flag: '🇬🇧' }
            ]
            
            const current = languages.find(l => l.code === currentLang) || languages[0]
            
            return \`
              <div class="lang-switcher">
                <button class="lang-switcher-minimal" id="langSwitcherBtn" title="\${current.name}">
                  <span class="lang-flag-only">\${current.flag}</span>
                </button>
                
                <div class="lang-switcher-dropdown" id="langDropdown">
                  \${languages.map(lang => \`
                    <div class="lang-option \${lang.code === currentLang ? 'active' : ''}" 
                         data-lang="\${lang.code}">
                      <span class="lang-flag">\${lang.flag}</span>
                      <span>\${lang.name}</span>
                      \${lang.code === currentLang ? '<i class="fas fa-check ml-auto text-blue-600"></i>' : ''}
                    </div>
                  \`).join('')}
                </div>
              </div>
            \`
          }
          
          function attachLanguageSwitcherEvents(container) {
            // Attach click event to the button
            const btn = container.querySelector('#langSwitcherBtn')
            if (btn) {
              btn.addEventListener('click', (e) => {
                e.stopPropagation()
                toggleLangDropdown()
              })
            }
            
            // Attach click events to language options
            const options = container.querySelectorAll('.lang-option')
            options.forEach(option => {
              option.addEventListener('click', () => {
                const lang = option.getAttribute('data-lang')
                if (lang) switchLanguage(lang)
              })
            })
          }
          
          function toggleLangDropdown() {
            const dropdowns = document.querySelectorAll('#langDropdown')
            dropdowns.forEach(dropdown => {
              dropdown.classList.toggle('show')
            })
          }
          
          function switchLanguage(lang) {
            if (window.i18n) {
              window.i18n.setLanguage(lang)
            }
          }
          
          // Close dropdown when clicking outside
          document.addEventListener('click', function(event) {
            const switcher = document.querySelector('.lang-switcher')
            const dropdown = document.getElementById('langDropdown')
            
            if (switcher && dropdown && !switcher.contains(event.target)) {
              dropdown.classList.remove('show')
            }
          })
        </script>
        <script>
            let allResults = []
            let searchType = ''

            // Parse URL parameters
            const urlParams = new URLSearchParams(window.location.search)
            searchType = urlParams.get('search_type')

            // Fetch results on page load
            async function fetchResults() {
                try {
                    let apiUrl = ''
                    
                    if (searchType === 'trips') {
                        // Expéditeur cherche des trajets
                        apiUrl = '/api/matches/trips-for-package?' + urlParams.toString()
                        document.getElementById('summaryIcon').className = 'fas fa-plane-departure mr-2 text-blue-600'
                        document.getElementById('summaryTitle').textContent = window.t ? window.t('search.trips_available') : 'Trajets disponibles'
                    } else if (searchType === 'packages') {
                        // Voyageur cherche des colis
                        apiUrl = '/api/matches/packages-for-trip?' + urlParams.toString()
                        document.getElementById('summaryIcon').className = 'fas fa-box mr-2 text-green-600'
                        document.getElementById('summaryTitle').textContent = window.t ? window.t('search.packages_available') : 'Colis disponibles'
                    } else {
                        showNoResults()
                        return
                    }

                    const response = await axios.get(apiUrl)
                    
                    if (response.data.success) {
                        allResults = response.data.matches
                        updateSummary(response.data.search_params)
                        displayResults(allResults)
                    } else {
                        showNoResults()
                    }
                } catch (error) {
                    console.error('Erreur:', error)
                    showNoResults()
                }
            }

            function updateSummary(params) {
                const origin = params.origin || '?'
                const destination = params.destination || '?'
                document.getElementById('summaryRoute').innerHTML = 
                    \`<i class="fas fa-map-marker-alt text-blue-600 mr-2"></i>\${origin} <i class="fas fa-arrow-right mx-2"></i> \${destination}\`
            }

            function displayResults(results) {
                document.getElementById('loadingState').classList.add('hidden')
                document.getElementById('resultsCount').textContent = results.length

                if (results.length === 0) {
                    showNoResults()
                    return
                }

                document.getElementById('resultsContainer').classList.remove('hidden')
                const container = document.getElementById('resultsContainer')
                container.innerHTML = ''

                results.forEach(result => {
                    const card = createResultCard(result)
                    container.appendChild(card)
                })
            }

            function createResultCard(result) {
                const div = document.createElement('div')
                div.className = 'match-card bg-white rounded-xl shadow-md p-6 relative cursor-pointer'
                
                const isTrip = searchType === 'trips'
                const themeColor = isTrip ? 'blue' : 'green'
                
                // Score badge
                const scoreColor = result.match_score >= 90 ? 'green' : result.match_score >= 75 ? 'blue' : result.match_score >= 60 ? 'yellow' : 'gray'
                const scoreLabel = result.match_quality === 'excellent' ? 'Excellent' : 
                                   result.match_quality === 'good' ? 'Good' : 
                                   result.match_quality === 'fair' ? 'Fair' : 'Low'

                // User info
                const userName = isTrip ? result.traveler_name : result.shipper_name
                const userAvatar = isTrip ? result.traveler_avatar : result.shipper_avatar
                const userRating = isTrip ? result.traveler_rating : result.shipper_rating
                const userKYC = isTrip ? result.traveler_kyc : result.shipper_kyc
                const userTrips = isTrip ? result.traveler_total_trips : result.shipper_total_packages

                div.innerHTML = \`
                    <div class="score-badge">
                        <div class="bg-\${scoreColor}-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            \${result.match_score}% <i class="fas fa-star ml-1"></i>
                        </div>
                    </div>

                    <!-- User Info -->
                    <div class="flex items-center mb-4">
                        <img src="\${userAvatar || '/static/default-avatar.png'}" alt="\${userName}" class="w-12 h-12 rounded-full mr-3 border-2 border-\${themeColor}-500">
                        <div class="flex-1">
                            <h3 class="font-bold text-gray-800">\${userName}</h3>
                            <div class="flex items-center text-sm text-gray-600">
                                <span class="text-yellow-500 mr-1">\${'⭐'.repeat(Math.floor(userRating || 0))}</span>
                                <span>(\${userRating || 'N/A'})</span>
                                \${userKYC === 'VERIFIED' ? '<i class="fas fa-check-circle text-green-600 ml-2" title="Vérifié"></i>' : ''}
                            </div>
                        </div>
                    </div>

                    <!-- Trip/Package Info -->
                    <div class="space-y-2 mb-4">
                        <div class="flex items-center text-gray-700">
                            <i class="fas fa-map-marker-alt text-\${themeColor}-600 w-5"></i>
                            <span class="text-sm">\${result.departure_city} → \${result.arrival_city}</span>
                        </div>
                        <div class="flex items-center text-gray-700">
                            <i class="fas fa-calendar text-\${themeColor}-600 w-5"></i>
                            <span class="text-sm">\${new Date(result.departure_date || result.preferred_date).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div class="flex items-center text-gray-700">
                            <i class="fas fa-weight text-\${themeColor}-600 w-5"></i>
                            <span class="text-sm">\${isTrip ? result.available_weight : result.weight} kg</span>
                        </div>
                    </div>

                    <!-- Price Info -->
                    <div class="border-t pt-4 mb-4">
                        \${isTrip ? \`
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600">Prix total estimé:</span>
                                <span class="text-2xl font-bold text-\${themeColor}-600">\${result.estimated_cost}€</span>
                            </div>
                            <div class="text-xs text-gray-500 mt-1">
                                Commission: \${result.platform_fee}€
                            </div>
                        \` : \`
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600">Gain potentiel:</span>
                                <span class="text-2xl font-bold text-\${themeColor}-600">\${result.potential_earnings || 'N/A'}€</span>
                            </div>
                            <div class="text-xs text-gray-500 mt-1">
                                Prix: \${result.price_per_kg || 'N/A'}€/kg
                            </div>
                        \`}
                    </div>

                    <!-- CTA Button -->
                    <button onclick="contactUser(\${result.id}, '\${userName}')" class="w-full py-3 bg-\${themeColor}-600 text-white rounded-lg hover:bg-\${themeColor}-700 transition-colors font-bold">
                        <i class="fas fa-envelope mr-2"></i>Contacter
                    </button>
                \`

                return div
            }

            function showNoResults() {
                document.getElementById('loadingState').classList.add('hidden')
                document.getElementById('resultsContainer').classList.add('hidden')
                document.getElementById('noResults').classList.remove('hidden')
            }

            // Contact Modal
            function contactUser(id, name) {
                const modal = document.getElementById('contactModal')
                const content = document.getElementById('modalContent')
                
                content.innerHTML = \`
                    <div class="text-center py-4">
                        <p class="text-gray-700 mb-4">Contacter <strong>\${name}</strong></p>
                        <p class="text-sm text-gray-500 mb-6">
                            Pour contacter ce voyageur, envoyez un email à
                            <a href="mailto:contact@amanahgo.app" class="text-blue-600 hover:underline">contact@amanahgo.app</a>
                            en précisant le nom du trajet.
                        </p>
                        <button onclick="closeContactModal()" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Compris
                        </button>
                    </div>
                \`
                
                modal.classList.remove('hidden')
            }

            function closeContactModal() {
                document.getElementById('contactModal').classList.add('hidden')
            }

            document.getElementById('closeModal').addEventListener('click', closeContactModal)

            // Filters & Sorting
            document.getElementById('sortBy').addEventListener('change', applyFilters)
            document.getElementById('filterRating').addEventListener('change', applyFilters)
            document.getElementById('filterKYC').addEventListener('change', applyFilters)
            document.getElementById('filterScore').addEventListener('change', applyFilters)

            function applyFilters() {
                let filtered = [...allResults]

                // Filter by rating
                const minRating = parseFloat(document.getElementById('filterRating').value)
                if (minRating > 0) {
                    filtered = filtered.filter(r => {
                        const rating = searchType === 'trips' ? r.traveler_rating : r.shipper_rating
                        return rating >= minRating
                    })
                }

                // Filter by KYC
                const kycFilter = document.getElementById('filterKYC').value
                if (kycFilter === 'VERIFIED') {
                    filtered = filtered.filter(r => {
                        const kyc = searchType === 'trips' ? r.traveler_kyc : r.shipper_kyc
                        return kyc === 'VERIFIED'
                    })
                }

                // Filter by score
                const minScore = parseInt(document.getElementById('filterScore').value)
                if (minScore > 0) {
                    filtered = filtered.filter(r => r.match_score >= minScore)
                }

                // Sort
                const sortBy = document.getElementById('sortBy').value
                if (sortBy === 'score') {
                    filtered.sort((a, b) => b.match_score - a.match_score)
                } else if (sortBy === 'price_asc') {
                    filtered.sort((a, b) => {
                        const priceA = parseFloat(a.estimated_cost || a.potential_earnings || 0)
                        const priceB = parseFloat(b.estimated_cost || b.potential_earnings || 0)
                        return priceA - priceB
                    })
                } else if (sortBy === 'price_desc') {
                    filtered.sort((a, b) => {
                        const priceA = parseFloat(a.estimated_cost || a.potential_earnings || 0)
                        const priceB = parseFloat(b.estimated_cost || b.potential_earnings || 0)
                        return priceB - priceA
                    })
                } else if (sortBy === 'date') {
                    filtered.sort((a, b) => {
                        const dateA = new Date(a.departure_date || a.preferred_date)
                        const dateB = new Date(b.departure_date || b.preferred_date)
                        return dateA - dateB
                    })
                }

                displayResults(filtered)
            }

            // Initialize
            fetchResults()
        </script>
    </body>
    </html>
  `)
})

// ==========================================
// PAGE: PRODUITS INTERDITS
// ==========================================

app.get('/prohibited-items', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Produits Interdits - Amanah GO</title>
        <link href="/static/tailwind.css" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/i18n.css?v=3" rel="stylesheet">
    </head>
    <body class="bg-gray-50 min-h-screen">
        <!-- Header -->
        <header class="bg-white shadow-md border-b-2 border-red-500 sticky top-0 z-50">
            <div class="container mx-auto px-4 py-4 flex justify-between items-center">
                <div class="flex items-center space-x-3">
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-10 w-auto">
                    <h1 class="text-xl font-bold text-gray-800">Amanah GO</h1>
                </div>
                <div class="flex items-center space-x-4">
                    <div id="langSwitcherContainer"></div>
                    <a href="/" class="px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors">
                        <i class="fas fa-home mr-2"></i>Accueil
                    </a>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <div class="container mx-auto px-4 py-8 max-w-5xl">
            <!-- Title Section -->
            <div class="text-center mb-8">
                <div class="inline-block p-4 bg-red-100 rounded-full mb-4">
                    <i class="fas fa-ban text-5xl text-red-600"></i>
                </div>
                <h1 class="text-4xl font-bold text-gray-800 mb-2">Liste Noire</h1>
                <p class="text-xl text-gray-600">Produits interdits clairement affichés</p>
                <p class="text-sm text-gray-500 mt-2">Conforme aux réglementations IATA + Douanes France & Maroc</p>
            </div>

            <!-- Warning Banner -->
            <div class="bg-red-50 border-l-4 border-red-600 p-6 mb-8 rounded-r-lg">
                <div class="flex items-start">
                    <i class="fas fa-exclamation-triangle text-3xl text-red-600 mr-4 mt-1"></i>
                    <div>
                        <h3 class="text-xl font-bold text-red-800 mb-2">⚠️ AVERTISSEMENT IMPORTANT</h3>
                        <p class="text-gray-700 mb-2">
                            Le transport de produits interdits est <strong>STRICTEMENT INTERDIT</strong> et constitue une infraction pénale grave.
                        </p>
                        <p class="text-gray-700 mb-2">
                            <strong>Sanctions encourues :</strong>
                        </p>
                        <ul class="list-disc ml-6 text-gray-700 space-y-1">
                            <li>Amendes jusqu'à <strong>750 000€</strong></li>
                            <li>Peine de prison jusqu'à <strong>10 ans</strong></li>
                            <li>Confiscation des biens</li>
                            <li>Interdiction de territoire</li>
                            <li>Bannissement définitif de la plateforme</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Categories -->
            <div class="space-y-6">
                
                <!-- Category 1: Stupéfiants & Drogues -->
                <div class="bg-white rounded-xl shadow-md overflow-hidden">
                    <div class="bg-red-600 text-white p-4">
                        <h2 class="text-2xl font-bold flex items-center">
                            <i class="fas fa-pills mr-3"></i>
                            1. Stupéfiants & Drogues
                        </h2>
                    </div>
                    <div class="p-6">
                        <ul class="grid md:grid-cols-2 gap-3">
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Cannabis (haschisch, marijuana, huile, résine)</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Cocaïne et dérivés</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Héroïne et opiacés</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Amphétamines et méthamphétamines</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>LSD et substances hallucinogènes</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Drogues de synthèse (MDMA, ecstasy)</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Médicaments psychotropes sans ordonnance</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Précurseurs chimiques</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Category 2: Armes & Explosifs -->
                <div class="bg-white rounded-xl shadow-md overflow-hidden">
                    <div class="bg-red-600 text-white p-4">
                        <h2 class="text-2xl font-bold flex items-center">
                            <i class="fas fa-bomb mr-3"></i>
                            2. Armes, Munitions & Explosifs
                        </h2>
                    </div>
                    <div class="p-6">
                        <ul class="grid md:grid-cols-2 gap-3">
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Armes à feu (pistolets, fusils, revolvers)</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Munitions et cartouches</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Armes blanches (couteaux, épées, poignards)</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Explosifs et détonateurs</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Feux d'artifice et pétards</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Tasers et paralysants électriques</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Gaz lacrymogènes et bombes au poivre</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Répliques d'armes (même jouets réalistes)</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Category 3: Produits Dangereux (IATA) -->
                <div class="bg-white rounded-xl shadow-md overflow-hidden">
                    <div class="bg-orange-600 text-white p-4">
                        <h2 class="text-2xl font-bold flex items-center">
                            <i class="fas fa-radiation-alt mr-3"></i>
                            3. Matières Dangereuses (IATA)
                        </h2>
                    </div>
                    <div class="p-6">
                        <ul class="grid md:grid-cols-2 gap-3">
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-orange-600 mr-2 mt-1"></i>
                                <span>Liquides inflammables (essence, alcool pur >70°)</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-orange-600 mr-2 mt-1"></i>
                                <span>Gaz comprimés (bonbonnes, aérosols)</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-orange-600 mr-2 mt-1"></i>
                                <span>Batteries lithium en vrac (>100Wh)</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-orange-600 mr-2 mt-1"></i>
                                <span>Produits corrosifs (acides, bases fortes)</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-orange-600 mr-2 mt-1"></i>
                                <span>Matières radioactives</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-orange-600 mr-2 mt-1"></i>
                                <span>Mercure et thermomètres au mercure</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-orange-600 mr-2 mt-1"></i>
                                <span>Peroxydes organiques</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-orange-600 mr-2 mt-1"></i>
                                <span>Phosphore blanc ou jaune</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Category 4: Contrefaçons & Propriété Intellectuelle -->
                <div class="bg-white rounded-xl shadow-md overflow-hidden">
                    <div class="bg-purple-600 text-white p-4">
                        <h2 class="text-2xl font-bold flex items-center">
                            <i class="fas fa-copyright mr-3"></i>
                            4. Contrefaçons & Propriété Intellectuelle
                        </h2>
                    </div>
                    <div class="p-6">
                        <ul class="grid md:grid-cols-2 gap-3">
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-purple-600 mr-2 mt-1"></i>
                                <span>Vêtements et accessoires contrefaits</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-purple-600 mr-2 mt-1"></i>
                                <span>Montres et bijoux de luxe contrefaits</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-purple-600 mr-2 mt-1"></i>
                                <span>Sacs à main et maroquinerie contrefaits</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-purple-600 mr-2 mt-1"></i>
                                <span>Médicaments contrefaits ou non autorisés</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-purple-600 mr-2 mt-1"></i>
                                <span>DVD et CD piratés</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-purple-600 mr-2 mt-1"></i>
                                <span>Logiciels piratés</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-purple-600 mr-2 mt-1"></i>
                                <span>Produits cosmétiques contrefaits</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-purple-600 mr-2 mt-1"></i>
                                <span>Électronique contrefaite (smartphones, etc.)</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Category 5: Produits Alimentaires Réglementés -->
                <div class="bg-white rounded-xl shadow-md overflow-hidden">
                    <div class="bg-green-600 text-white p-4">
                        <h2 class="text-2xl font-bold flex items-center">
                            <i class="fas fa-apple-alt mr-3"></i>
                            5. Produits Alimentaires Réglementés
                        </h2>
                    </div>
                    <div class="p-6">
                        <ul class="grid md:grid-cols-2 gap-3">
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-green-600 mr-2 mt-1"></i>
                                <span>Viandes fraîches ou congelées</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-green-600 mr-2 mt-1"></i>
                                <span>Produits laitiers non pasteurisés</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-green-600 mr-2 mt-1"></i>
                                <span>Fruits et légumes frais (contrôle phytosanitaire)</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-green-600 mr-2 mt-1"></i>
                                <span>Graines et plants (sans autorisation)</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-green-600 mr-2 mt-1"></i>
                                <span>Miel et produits de la ruche non certifiés</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-green-600 mr-2 mt-1"></i>
                                <span>Alcool >5L ou >18° sans déclaration</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-green-600 mr-2 mt-1"></i>
                                <span>Tabac >200 cigarettes sans déclaration</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-green-600 mr-2 mt-1"></i>
                                <span>Compléments alimentaires non autorisés UE/Maroc</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Category 6: Produits Culturels & Religieux Sensibles -->
                <div class="bg-white rounded-xl shadow-md overflow-hidden">
                    <div class="bg-indigo-600 text-white p-4">
                        <h2 class="text-2xl font-bold flex items-center">
                            <i class="fas fa-book-open mr-3"></i>
                            6. Contenu Culturel & Religieux Sensible
                        </h2>
                    </div>
                    <div class="p-6">
                        <ul class="grid md:grid-cols-2 gap-3">
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-indigo-600 mr-2 mt-1"></i>
                                <span>Matériel pornographique</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-indigo-600 mr-2 mt-1"></i>
                                <span>Publications incitant à la haine ou terrorisme</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-indigo-600 mr-2 mt-1"></i>
                                <span>Livres interdits par les autorités</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-indigo-600 mr-2 mt-1"></i>
                                <span>Propagande politique extrémiste</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-indigo-600 mr-2 mt-1"></i>
                                <span>Matériel de prosélytisme offensant</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-indigo-600 mr-2 mt-1"></i>
                                <span>Symboles nazis ou de haine</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-indigo-600 mr-2 mt-1"></i>
                                <span>Films ou jeux vidéo interdits aux mineurs</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-indigo-600 mr-2 mt-1"></i>
                                <span>Matériel pédophile (crime grave)</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Category 7: Argent & Valeurs -->
                <div class="bg-white rounded-xl shadow-md overflow-hidden">
                    <div class="bg-yellow-600 text-white p-4">
                        <h2 class="text-2xl font-bold flex items-center">
                            <i class="fas fa-money-bill-wave mr-3"></i>
                            7. Argent, Devises & Objets de Valeur
                        </h2>
                    </div>
                    <div class="p-6">
                        <ul class="grid md:grid-cols-2 gap-3">
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-yellow-600 mr-2 mt-1"></i>
                                <span>Espèces >10 000€ sans déclaration</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-yellow-600 mr-2 mt-1"></i>
                                <span>Fausse monnaie</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-yellow-600 mr-2 mt-1"></i>
                                <span>Chèques de banque au porteur non déclarés</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-yellow-600 mr-2 mt-1"></i>
                                <span>Lingots d'or ou d'argent non déclarés</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-yellow-600 mr-2 mt-1"></i>
                                <span>Bijoux de grande valeur non déclarés</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-yellow-600 mr-2 mt-1"></i>
                                <span>Œuvres d'art protégées ou volées</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-yellow-600 mr-2 mt-1"></i>
                                <span>Antiquités historiques sans certificat</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-yellow-600 mr-2 mt-1"></i>
                                <span>Cryptomonnaies physiques (hardware wallets avec fonds)</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Category 8: Produits Animaux & Végétaux -->
                <div class="bg-white rounded-xl shadow-md overflow-hidden">
                    <div class="bg-teal-600 text-white p-4">
                        <h2 class="text-2xl font-bold flex items-center">
                            <i class="fas fa-paw mr-3"></i>
                            8. Faune, Flore & Produits Dérivés
                        </h2>
                    </div>
                    <div class="p-6">
                        <ul class="grid md:grid-cols-2 gap-3">
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-teal-600 mr-2 mt-1"></i>
                                <span>Animaux vivants (sans certificat vétérinaire)</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-teal-600 mr-2 mt-1"></i>
                                <span>Ivoire d'éléphant</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-teal-600 mr-2 mt-1"></i>
                                <span>Cornes de rhinocéros</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-teal-600 mr-2 mt-1"></i>
                                <span>Peaux d'animaux protégés (CITES)</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-teal-600 mr-2 mt-1"></i>
                                <span>Corail et coquillages protégés</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-teal-600 mr-2 mt-1"></i>
                                <span>Fourrures d'espèces menacées</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-teal-600 mr-2 mt-1"></i>
                                <span>Bois exotiques protégés (ébène, teck)</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-teal-600 mr-2 mt-1"></i>
                                <span>Plantes rares (orchidées, cactus) sans CITES</span>
                            </li>
                        </ul>
                    </div>
                </div>

            </div>

            <!-- Footer Info -->
            <div class="mt-12 bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
                <h3 class="text-xl font-bold text-blue-800 mb-3">
                    <i class="fas fa-info-circle mr-2"></i>
                    Informations Importantes
                </h3>
                <ul class="space-y-2 text-gray-700">
                    <li class="flex items-start">
                        <i class="fas fa-check-circle text-blue-600 mr-2 mt-1"></i>
                        <span><strong>Doute ?</strong> En cas de doute, NE TRANSPORTEZ PAS le colis. Contactez nos équipes.</span>
                    </li>
                    <li class="flex items-start">
                        <i class="fas fa-check-circle text-blue-600 mr-2 mt-1"></i>
                        <span><strong>Déclaration obligatoire :</strong> Vous devez déclarer honnêtement le contenu de chaque colis.</span>
                    </li>
                    <li class="flex items-start">
                        <i class="fas fa-check-circle text-blue-600 mr-2 mt-1"></i>
                        <span><strong>Inspection possible :</strong> Les autorités peuvent inspecter les colis à tout moment.</span>
                    </li>
                    <li class="flex items-start">
                        <i class="fas fa-check-circle text-blue-600 mr-2 mt-1"></i>
                        <span><strong>Responsabilité :</strong> Le voyageur ET l'expéditeur sont responsables du contenu.</span>
                    </li>
                    <li class="flex items-start">
                        <i class="fas fa-check-circle text-blue-600 mr-2 mt-1"></i>
                        <span><strong>Signalement :</strong> Signalez tout colis suspect via notre plateforme.</span>
                    </li>
                </ul>
            </div>

            <!-- CTA Button -->
            <div class="mt-8 text-center">
                <a href="/" class="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg shadow-lg">
                    <i class="fas fa-arrow-left mr-2"></i>
                    Retour à l'accueil
                </a>
            </div>
        </div>

        <!-- JavaScript -->
        <script src="/static/auth.js"></script>
        <script src="/static/auth-ui.js"></script>
        <script src="/static/i18n.js?v=3"></script>
        <script src="/static/lang-switcher.js?v=3"></script>
        
        <!-- PWA Script -->
        <script src="/static/pwa.js"></script>
    </body>
    </html>
  `)
})

export default app

// ==========================================
// PAGE: CHAT / MESSAGERIE
// ==========================================
app.get('/messages', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Messages - Amanah GO</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          #messages-container { height: calc(100vh - 280px); overflow-y: auto; }
          #conversations-list { height: calc(100vh - 140px); overflow-y: auto; }
        </style>
    </head>
    <body class="bg-gray-50 h-screen">
        <nav class="bg-white shadow-sm border-b sticky top-0 z-10">
            <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <a href="/voyageur" class="text-blue-600 hover:text-blue-700">
                        <i class="fas fa-arrow-left mr-2"></i>Retour
                    </a>
                    <span class="text-xl font-bold text-gray-900">
                        <i class="fas fa-comments text-blue-600 mr-2"></i>Messages
                    </span>
                </div>
                <span class="text-gray-600"><i class="fas fa-user-circle mr-2"></i><span id="userName"></span></span>
            </div>
        </nav>

        <div id="chat-app" class="max-w-7xl mx-auto flex h-full">
            <!-- Liste conversations -->
            <div class="w-1/3 bg-white border-r">
                <div class="p-4 border-b">
                    <h2 class="font-bold text-gray-800">Conversations</h2>
                </div>
                <div id="conversations-list"></div>
            </div>

            <!-- Panel chat vide par défaut -->
            <div class="flex-1 flex items-center justify-center bg-gray-50" id="empty-state">
                <div class="text-center text-gray-400">
                    <i class="fas fa-comments text-6xl mb-4"></i>
                    <p class="text-xl">Sélectionnez une conversation</p>
                </div>
            </div>

            <!-- Panel chat actif (caché par défaut) -->
            <div class="flex-1 flex flex-col hidden" id="chat-panel">
                <!-- Header conversation -->
                <div class="p-4 border-b bg-white flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold" id="chat-header-avatar">?</div>
                        <span class="font-semibold" id="chat-header-name"></span>
                    </div>
                    <button id="close-chat-btn" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>

                <!-- Messages -->
                <div id="messages-container" class="flex-1 p-4 overflow-y-auto bg-gray-50"></div>

                <!-- Input message -->
                <div class="p-4 bg-white border-t flex items-center space-x-3">
                    <input type="text" id="message-input"
                           placeholder="Tapez votre message..."
                           class="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <button id="send-message-btn"
                            class="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>

        <script src="/static/auth.js"></script>
        <script src="/static/chat.js"></script>
        <script>
          const user = auth.getUser()
          if (user) document.getElementById('userName').textContent = user.name || user.email

          // Sync empty state avec chat panel
          const origOpen = ChatApp.openConversation.bind(ChatApp)
          ChatApp.openConversation = async function(userId, userName) {
            document.getElementById('empty-state').classList.add('hidden')
            document.getElementById('chat-panel').classList.remove('hidden')
            document.getElementById('chat-header-avatar').textContent = userName.charAt(0).toUpperCase()
            await origOpen(userId, userName)
          }
        </script>
    </body>
    </html>
  `)
})
