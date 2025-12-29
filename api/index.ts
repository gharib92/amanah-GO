import { serve } from '@hono/node-server'

// Créer l'app Hono
import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// CORS
app.use('/api/*', cors())

// Variables d'environnement pour Vercel
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY
const JWT_SECRET = process.env.JWT_SECRET || 'amanah-go-secret-key-change-in-production'

// Route de test
app.get('/', (c) => {
  return c.json({ 
    message: 'Amanah GO API',
    status: 'running',
    timestamp: new Date().toISOString()
  })
})

// Route test Stripe
app.get('/api/test', (c) => {
  return c.json({
    stripe_configured: !!STRIPE_SECRET_KEY,
    jwt_configured: !!JWT_SECRET,
    env: process.env.NODE_ENV
  })
})

// Login page
app.get('/login', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Amanah GO - Connexion</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100">
      <div class="min-h-screen flex items-center justify-center">
        <div class="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h1 class="text-2xl font-bold mb-6">Connexion - Amanah GO</h1>
          <p class="text-gray-600">Site en cours de déploiement...</p>
          <p class="text-sm text-gray-500 mt-4">Version Vercel - Node.js</p>
        </div>
      </div>
    </body>
    </html>
  `)
})

// Export pour Vercel
export default app

// Pour Node.js local
if (process.env.NODE_ENV !== 'production') {
  const port = 3000
  console.log(`Server running on http://localhost:${port}`)
  serve({
    fetch: app.fetch,
    port,
  })
}
