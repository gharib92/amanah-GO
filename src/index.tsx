import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

// Types pour Cloudflare Bindings
type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS pour API
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

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
        <title>Amanah GO - Transport Collaboratif France ↔ Maroc</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
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
        <nav class="bg-white shadow-sm">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16 items-center">
                    <div class="flex items-center space-x-2">
                        <i class="fas fa-plane text-blue-600 text-2xl"></i>
                        <span class="text-2xl font-bold text-gray-900">Amanah GO</span>
                    </div>
                    <div class="hidden md:flex space-x-6">
                        <a href="#comment-ca-marche" class="text-gray-700 hover:text-blue-600">Comment ça marche</a>
                        <a href="#securite" class="text-gray-700 hover:text-blue-600">Sécurité</a>
                        <a href="#tarifs" class="text-gray-700 hover:text-blue-600">Tarifs</a>
                    </div>
                    <div class="flex space-x-4">
                        <button onclick="window.location.href='/login'" class="text-blue-600 hover:text-blue-800 font-medium">
                            Connexion
                        </button>
                        <button onclick="window.location.href='/signup'" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
                            Inscription
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <section class="gradient-bg text-white py-20">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 class="text-5xl font-bold mb-6">
                    Voyagez Malin, Envoyez Futé
                </h1>
                <p class="text-xl mb-8 text-blue-100">
                    La plateforme de confiance pour transporter vos colis entre la France et le Maroc
                </p>
                
                <!-- Double CTA -->
                <div class="flex flex-col md:flex-row justify-center gap-6 mb-12">
                    <div class="bg-white text-gray-900 rounded-xl p-8 card-hover cursor-pointer flex-1 max-w-md" onclick="window.location.href='/voyageur'">
                        <i class="fas fa-plane-departure text-blue-600 text-5xl mb-4"></i>
                        <h3 class="text-2xl font-bold mb-2">Je voyage</h3>
                        <p class="text-gray-600 mb-4">Rentabilisez votre voyage en transportant des colis</p>
                        <button class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium w-full hover:bg-blue-700">
                            Publier mon voyage →
                        </button>
                    </div>
                    
                    <div class="bg-white text-gray-900 rounded-xl p-8 card-hover cursor-pointer flex-1 max-w-md" onclick="window.location.href='/expediteur'">
                        <i class="fas fa-box text-green-600 text-5xl mb-4"></i>
                        <h3 class="text-2xl font-bold mb-2">J'envoie un colis</h3>
                        <p class="text-gray-600 mb-4">Économisez jusqu'à 70% sur vos envois</p>
                        <button class="bg-green-600 text-white px-6 py-3 rounded-lg font-medium w-full hover:bg-green-700">
                            Publier mon colis →
                        </button>
                    </div>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    <div>
                        <div class="text-4xl font-bold">4M+</div>
                        <div class="text-blue-100">Voyageurs MRE/an</div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold">70%</div>
                        <div class="text-blue-100">D'économies vs DHL</div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold">100%</div>
                        <div class="text-blue-100">Paiement sécurisé</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Calculateur de Prix -->
        <section class="py-16 bg-white">
            <div class="max-w-4xl mx-auto px-4">
                <h2 class="text-3xl font-bold text-center mb-8">Calculez votre économie</h2>
                <div class="bg-gray-50 rounded-xl p-8 shadow-lg">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Poids du colis (kg)</label>
                            <input type="number" id="weight" value="10" min="1" max="50" 
                                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                   onchange="calculatePrice()">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Prix par kg (€)</label>
                            <input type="number" id="pricePerKg" value="8" min="5" max="15" 
                                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                   onchange="calculatePrice()">
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg p-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="text-center border-r border-gray-200">
                                <div class="text-sm text-gray-600 mb-2">Avec Amanah GO</div>
                                <div class="text-3xl font-bold text-green-600" id="amanahPrice">80 €</div>
                            </div>
                            <div class="text-center">
                                <div class="text-sm text-gray-600 mb-2">DHL/Chronopost</div>
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
                <h2 class="text-3xl font-bold text-center mb-12">Comment ça marche ?</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="text-center">
                        <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span class="text-2xl font-bold text-blue-600">1</span>
                        </div>
                        <h3 class="text-xl font-bold mb-2">Créez votre annonce</h3>
                        <p class="text-gray-600">Voyageur : Publiez votre trajet. Expéditeur : Décrivez votre colis</p>
                    </div>
                    
                    <div class="text-center">
                        <div class="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span class="text-2xl font-bold text-green-600">2</span>
                        </div>
                        <h3 class="text-xl font-bold mb-2">Trouvez un match</h3>
                        <p class="text-gray-600">Notre système intelligent vous connecte avec des profils vérifiés</p>
                    </div>
                    
                    <div class="text-center">
                        <div class="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span class="text-2xl font-bold text-orange-600">3</span>
                        </div>
                        <h3 class="text-xl font-bold mb-2">Livraison sécurisée</h3>
                        <p class="text-gray-600">Paiement bloqué jusqu'à confirmation de livraison</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Sécurité -->
        <section id="securite" class="py-16 bg-white">
            <div class="max-w-7xl mx-auto px-4">
                <h2 class="text-3xl font-bold text-center mb-12">Votre sécurité, notre priorité</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="text-center p-6">
                        <i class="fas fa-shield-alt text-blue-600 text-4xl mb-4"></i>
                        <h3 class="font-bold mb-2">Vérification KYC</h3>
                        <p class="text-sm text-gray-600">Tous les utilisateurs vérifient leur identité</p>
                    </div>
                    
                    <div class="text-center p-6">
                        <i class="fas fa-lock text-green-600 text-4xl mb-4"></i>
                        <h3 class="font-bold mb-2">Paiement Escrow</h3>
                        <p class="text-sm text-gray-600">Fonds sécurisés jusqu'à livraison</p>
                    </div>
                    
                    <div class="text-center p-6">
                        <i class="fas fa-star text-orange-600 text-4xl mb-4"></i>
                        <h3 class="font-bold mb-2">Système de notes</h3>
                        <p class="text-sm text-gray-600">Avis vérifiés après chaque transaction</p>
                    </div>
                    
                    <div class="text-center p-6">
                        <i class="fas fa-ban text-red-600 text-4xl mb-4"></i>
                        <h3 class="font-bold mb-2">Liste noire</h3>
                        <p class="text-sm text-gray-600">Produits interdits clairement affichés</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Final -->
        <section class="gradient-bg text-white py-16">
            <div class="max-w-4xl mx-auto px-4 text-center">
                <h2 class="text-3xl font-bold mb-4">Prêt à commencer ?</h2>
                <p class="text-xl mb-8 text-blue-100">Rejoignez des milliers d'utilisateurs qui font confiance à Amanah GO</p>
                <button onclick="window.location.href='/signup'" class="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100">
                    Créer mon compte gratuitement
                </button>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-gray-900 text-white py-8">
            <div class="max-w-7xl mx-auto px-4 text-center">
                <div class="flex justify-center space-x-6 mb-4">
                    <a href="#" class="hover:text-blue-400">À propos</a>
                    <a href="#" class="hover:text-blue-400">CGU</a>
                    <a href="#" class="hover:text-blue-400">Confidentialité</a>
                    <a href="#" class="hover:text-blue-400">Contact</a>
                </div>
                <p class="text-gray-400">© 2025 Amanah GO. Tous droits réservés.</p>
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
            document.getElementById('savings').textContent = 'Vous économisez ' + Math.round(savings) + ' € !';
          }
          
          // Initial calculation
          calculatePrice();
        </script>
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
// AIRPORTS API ROUTES
// ==========================================

// Search airports (autocomplete)
app.get('/api/airports/search', async (c) => {
  const { DB } = c.env
  const query = c.req.query('q') || ''
  
  if (query.length < 2) {
    return c.json({ success: true, airports: [] })
  }
  
  try {
    const { results } = await DB.prepare(`
      SELECT id, iata_code, name, city, country, latitude, longitude
      FROM airports
      WHERE active = 1
      AND (
        city LIKE ? 
        OR name LIKE ? 
        OR iata_code LIKE ?
      )
      ORDER BY 
        CASE 
          WHEN city LIKE ? THEN 1
          WHEN iata_code LIKE ? THEN 2
          ELSE 3
        END,
        city ASC
      LIMIT 10
    `).bind(
      `%${query}%`,
      `%${query}%`,
      `${query.toUpperCase()}%`,
      `${query}%`,
      `${query.toUpperCase()}%`
    ).all()
    
    return c.json({ success: true, airports: results })
  } catch (error) {
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
// AUTH API ROUTES
// ==========================================

// Signup
app.post('/api/auth/signup', async (c) => {
  const { DB } = c.env
  
  try {
    const { name, email, phone, password } = await c.req.json()
    
    // Validation
    if (!name || !email || !phone || !password) {
      return c.json({ success: false, error: 'Tous les champs sont requis' }, 400)
    }
    
    if (password.length < 8) {
      return c.json({ success: false, error: 'Le mot de passe doit contenir au moins 8 caractères' }, 400)
    }
    
    // Vérifier si l'email existe déjà
    const existing = await DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
    if (existing) {
      return c.json({ success: false, error: 'Cet email est déjà utilisé' }, 400)
    }
    
    // TODO: Hasher le mot de passe avec bcrypt
    // Pour l'instant, on stocke en clair (à ne JAMAIS faire en production)
    const passwordHash = password // UNSAFE - À remplacer par bcrypt.hash()
    
    // Créer l'utilisateur
    const userId = crypto.randomUUID()
    await DB.prepare(`
      INSERT INTO users (id, email, name, phone, password_hash, kyc_status, created_at)
      VALUES (?, ?, ?, ?, ?, 'PENDING', datetime('now'))
    `).bind(userId, email, name, phone, passwordHash).run()
    
    return c.json({ 
      success: true, 
      user_id: userId,
      message: 'Compte créé avec succès. Veuillez vérifier votre profil.'
    })
    
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Envoyer email de vérification
app.post('/api/auth/send-verification-email', async (c) => {
  // TODO: Intégrer avec Resend ou SendGrid
  try {
    // Simuler envoi email
    console.log('Envoi email de vérification...')
    return c.json({ success: true, message: 'Email de vérification envoyé' })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Envoyer SMS de vérification
app.post('/api/auth/send-sms-verification', async (c) => {
  const { DB } = c.env
  
  try {
    const { phone, method = 'sms' } = await c.req.json()
    
    // Validation du numéro
    if (!phone || phone.length < 10) {
      return c.json({ 
        success: false, 
        error: 'Numéro de téléphone invalide' 
      }, 400)
    }
    
    // Validation de la méthode
    if (!['sms', 'whatsapp'].includes(method)) {
      return c.json({ 
        success: false, 
        error: 'Méthode invalide. Utilisez "sms" ou "whatsapp"' 
      }, 400)
    }
    
    // Générer code à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Get Twilio credentials from environment variables
    const TWILIO_ACCOUNT_SID = c.env.TWILIO_ACCOUNT_SID
    const TWILIO_AUTH_TOKEN = c.env.TWILIO_AUTH_TOKEN
    const TWILIO_PHONE_NUMBER = c.env.TWILIO_PHONE_NUMBER
    const TWILIO_WHATSAPP_NUMBER = c.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886' // Twilio Sandbox default
    
    // Check if Twilio is configured
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.log(`⚠️ Twilio non configuré. Code de vérification ${method.toUpperCase()} (DEV ONLY):`, code)
      
      // In development, return code for testing (REMOVE IN PRODUCTION!)
      return c.json({ 
        success: true, 
        message: `${method === 'whatsapp' ? 'WhatsApp' : 'SMS'} simulé - Twilio non configuré`,
        code: code, // DEV ONLY: Remove in production!
        dev_mode: true,
        method: method
      })
    }
    
    // Prepare message content
    const messageBody = `Amanah GO - Votre code de vérification est : ${code}. Il expire dans 10 minutes.`
    
    // Determine sender and recipient based on method
    let fromNumber, toNumber
    
    if (method === 'whatsapp') {
      fromNumber = TWILIO_WHATSAPP_NUMBER
      toNumber = `whatsapp:${phone}`
    } else {
      fromNumber = TWILIO_PHONE_NUMBER
      toNumber = phone
    }
    
    // Send message via Twilio
    try {
      const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
      
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            To: toNumber,
            From: fromNumber,
            Body: messageBody
          })
        }
      )
      
      if (!response.ok) {
        const error = await response.json()
        console.error(`Erreur Twilio ${method.toUpperCase()}:`, error)
        throw new Error(`Échec envoi ${method === 'whatsapp' ? 'WhatsApp' : 'SMS'}`)
      }
      
      console.log(`✅ ${method === 'whatsapp' ? 'WhatsApp' : 'SMS'} envoyé avec succès à:`, phone)
      
      // TODO: Store code in DB or KV with expiration (10 minutes)
      // Example: await DB.prepare('INSERT INTO verification_codes (phone, code, expires_at, method) VALUES (?, ?, datetime("now", "+10 minutes"), ?)').bind(phone, code, method).run()
      
      return c.json({ 
        success: true, 
        message: `${method === 'whatsapp' ? 'Message WhatsApp' : 'SMS'} envoyé avec succès`,
        method: method
        // Don't return code in production!
      })
      
    } catch (twilioError) {
      console.error(`Erreur Twilio ${method.toUpperCase()}:`, twilioError)
      return c.json({ 
        success: false, 
        error: `Erreur lors de l'envoi du ${method === 'whatsapp' ? 'message WhatsApp' : 'SMS'}` 
      }, 500)
    }
    
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Upload photo KYC (selfie ou document)
app.post('/api/auth/upload-kyc', async (c) => {
  const { R2 } = c.env
  
  try {
    // TODO: Gérer l'upload vers R2
    // TODO: Analyser l'image avec Cloudflare AI pour détecter visage
    // TODO: Comparer selfie avec photo d'identité
    
    return c.json({ success: true, message: 'Photo uploadée avec succès' })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Login
app.post('/api/auth/login', async (c) => {
  const { DB } = c.env
  
  try {
    const { email, password } = await c.req.json()
    
    // Validation
    if (!email || !password) {
      return c.json({ success: false, error: 'Email et mot de passe requis' }, 400)
    }
    
    // Trouver l'utilisateur
    const user = await DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first()
    
    if (!user) {
      return c.json({ success: false, error: 'Email ou mot de passe incorrect' }, 401)
    }
    
    // TODO: Vérifier avec bcrypt.compare()
    if (user.password_hash !== password) { // UNSAFE - À remplacer
      return c.json({ success: false, error: 'Email ou mot de passe incorrect' }, 401)
    }
    
    // TODO: Créer un token JWT
    
    return c.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        kyc_status: user.kyc_status
      },
      message: 'Connexion réussie'
    })
    
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
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

app.get('/login', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Connexion - Amanah GO</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <nav class="bg-white shadow-sm">
            <div class="max-w-7xl mx-auto px-4 py-4">
                <a href="/" class="flex items-center space-x-2">
                    <i class="fas fa-plane text-blue-600 text-2xl"></i>
                    <span class="text-2xl font-bold text-gray-900">Amanah GO</span>
                </a>
            </div>
        </nav>

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
                            <a href="#" class="text-blue-600 hover:underline text-sm">Mot de passe oublié ?</a>
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
                    <button onclick="alert('OAuth Google à implémenter')"
                            class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                        <i class="fab fa-google text-red-500 mr-2"></i>
                        <span class="font-medium text-gray-700">Continuer avec Google</span>
                    </button>
                    
                    <button onclick="alert('OAuth Facebook à implémenter')"
                            class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
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

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
          document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
              const response = await axios.post('/api/auth/login', {
                email, password
              });
              
              if (response.data.success) {
                // Rediriger selon le statut KYC
                if (response.data.user.kyc_status === 'VERIFIED') {
                  window.location.href = '/dashboard';
                } else {
                  window.location.href = '/verify-profile?user_id=' + response.data.user.id;
                }
              }
            } catch (error) {
              showError(error.response?.data?.error || 'Email ou mot de passe incorrect');
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

app.get('/signup', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Inscription - Amanah GO</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <nav class="bg-white shadow-sm">
            <div class="max-w-7xl mx-auto px-4 py-4">
                <a href="/" class="flex items-center space-x-2">
                    <i class="fas fa-plane text-blue-600 text-2xl"></i>
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

                    <!-- Téléphone -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Téléphone <span class="text-red-500">*</span>
                        </label>
                        <input type="tel" id="phone" required
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                               placeholder="+33 6 12 34 56 78">
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
                            J'accepte les <a href="#" class="text-blue-600 hover:underline">Conditions Générales d'Utilisation</a>
                            et la <a href="#" class="text-blue-600 hover:underline">Politique de Confidentialité</a>
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
                    <button onclick="alert('OAuth Google à implémenter')"
                            class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                        <i class="fab fa-google text-red-500 mr-2"></i>
                        <span class="font-medium text-gray-700">Continuer avec Google</span>
                    </button>
                    
                    <button onclick="alert('OAuth Facebook à implémenter')"
                            class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
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

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
          document.getElementById('signupForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validation
            if (password !== confirmPassword) {
              showError('Les mots de passe ne correspondent pas');
              return;
            }
            
            if (password.length < 8) {
              showError('Le mot de passe doit contenir au moins 8 caractères');
              return;
            }
            
            try {
              const response = await axios.post('/api/auth/signup', {
                name, email, phone, password
              });
              
              if (response.data.success) {
                // Rediriger vers la page de vérification
                window.location.href = '/verify-profile?user_id=' + response.data.user_id;
              }
            } catch (error) {
              showError(error.response?.data?.error || 'Erreur lors de l\\'inscription');
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

app.get('/voyageur', (c) => {
  return c.html('<h1>Espace Voyageur (à implémenter)</h1><a href="/">Retour accueil</a>')
})

// Page de vérification KYC
app.get('/verify-profile', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vérification du Profil - Amanah GO</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          .verification-card {
            transition: all 0.3s ease;
          }
          .verification-card.completed {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            border-color: #10B981;
          }
          .verification-card.completed * {
            color: white !important;
          }
        </style>
    </head>
    <body class="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 min-h-screen">
        <!-- Header -->
        <nav class="bg-blue-900/50 backdrop-blur-sm border-b border-blue-700">
            <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div class="flex items-center space-x-2">
                    <i class="fas fa-plane text-white text-2xl"></i>
                    <span class="text-2xl font-bold text-white">Amanah GO</span>
                </div>
                <a href="/" class="text-white hover:text-blue-200">
                    <i class="fas fa-arrow-left mr-2"></i>
                    Retour à l'accueil
                </a>
            </div>
        </nav>

        <div class="max-w-4xl mx-auto px-4 py-12">
            <!-- Titre -->
            <div class="text-center mb-12">
                <h1 class="text-4xl font-bold text-white mb-4">Vérification du Profil</h1>
                <p class="text-blue-200 text-lg">
                    Complétez ces étapes pour débloquer toutes les fonctionnalités et renforcer la confiance au sein de la communauté.
                </p>
            </div>

            <!-- Statut de la vérification -->
            <div class="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20">
                <h2 class="text-2xl font-bold text-white mb-6">Statut de la vérification</h2>
                
                <div class="space-y-4">
                    <!-- Vérifier l'E-mail -->
                    <div id="emailCard" class="verification-card bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <div class="bg-blue-500/20 p-4 rounded-full">
                                <i class="fas fa-envelope text-blue-300 text-2xl"></i>
                            </div>
                            <div>
                                <h3 class="text-lg font-bold text-white">Vérifier l'E-mail</h3>
                                <p class="text-blue-200 text-sm">Confirmez votre adresse e-mail pour sécuriser votre compte.</p>
                            </div>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="verifyEmail()" 
                                    class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition">
                                Vérifier maintenant
                            </button>
                        </div>
                    </div>

                    <!-- Vérifier le Téléphone -->
                    <div id="phoneCard" class="verification-card bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 flex items-center justify-between opacity-50">
                        <div class="flex items-center space-x-4">
                            <div class="bg-blue-500/20 p-4 rounded-full">
                                <i class="fas fa-phone text-blue-300 text-2xl"></i>
                            </div>
                            <div>
                                <h3 class="text-lg font-bold text-white">Vérifier le Téléphone</h3>
                                <p class="text-blue-200 text-sm">Validez par SMS ou WhatsApp pour sécuriser votre compte.</p>
                            </div>
                        </div>
                        <div class="flex space-x-2">
                            <span class="bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-lg font-medium text-sm">
                                Requis
                            </span>
                            <button onclick="openPhoneModal()" disabled
                                    class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed">
                                Vérifier maintenant
                            </button>
                        </div>
                    </div>

                    <!-- Pièce d'Identité & Vérification Faciale -->
                    <div id="kycCard" class="verification-card bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 opacity-50">
                        <div class="flex items-center justify-between mb-6">
                            <div class="flex items-center space-x-4">
                                <div class="bg-blue-500/20 p-4 rounded-full">
                                    <i class="fas fa-id-card text-blue-300 text-2xl"></i>
                                </div>
                                <div>
                                    <h3 class="text-lg font-bold text-white">Pièce d'Identité & Vérification Faciale</h3>
                                    <p class="text-blue-200 text-sm">Confirmez votre identité pour augmenter la confiance.</p>
                                </div>
                            </div>
                            <span class="bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-lg font-medium text-sm">
                                Requis
                            </span>
                        </div>

                        <!-- Étapes KYC -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <!-- Étape 1: Selfie -->
                            <div class="bg-white/5 border border-white/10 rounded-lg p-6">
                                <h4 class="text-white font-bold mb-3">Étape 1: Prendre un Selfie</h4>
                                <div class="border-2 border-dashed border-white/20 rounded-lg p-8 text-center mb-4">
                                    <i class="fas fa-camera text-blue-300 text-4xl mb-3"></i>
                                    <p class="text-blue-200 text-sm">Prenez une photo de votre visage</p>
                                </div>
                                <button onclick="startSelfieCapture()" disabled
                                        class="w-full bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg font-medium transition cursor-not-allowed">
                                    <i class="fas fa-camera mr-2"></i>
                                    Démarrer la caméra
                                </button>
                            </div>

                            <!-- Étape 2: Pièce d'identité -->
                            <div class="bg-white/5 border border-white/10 rounded-lg p-6">
                                <h4 class="text-white font-bold mb-3">Étape 2: Télécharger la Pièce d'Identité</h4>
                                <div class="border-2 border-dashed border-white/20 rounded-lg p-8 text-center mb-4">
                                    <i class="fas fa-upload text-blue-300 text-4xl mb-3"></i>
                                    <p class="text-blue-200 text-sm">CIN, Passeport ou Permis</p>
                                </div>
                                <button onclick="uploadIDDocument()" disabled
                                        class="w-full bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg font-medium transition cursor-not-allowed">
                                    <i class="fas fa-file-upload mr-2"></i>
                                    Cliquez pour télécharger
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bénéfices de la vérification -->
            <div class="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <h3 class="text-xl font-bold text-white mb-4">
                    <i class="fas fa-shield-alt text-green-400 mr-2"></i>
                    Pourquoi vérifier mon profil ?
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="text-center">
                        <i class="fas fa-check-circle text-green-400 text-3xl mb-2"></i>
                        <p class="text-white font-medium">Badge vérifié</p>
                        <p class="text-blue-200 text-sm">Augmentez votre crédibilité</p>
                    </div>
                    <div class="text-center">
                        <i class="fas fa-lock text-green-400 text-3xl mb-2"></i>
                        <p class="text-white font-medium">Transactions sécurisées</p>
                        <p class="text-blue-200 text-sm">Protection renforcée</p>
                    </div>
                    <div class="text-center">
                        <i class="fas fa-star text-green-400 text-3xl mb-2"></i>
                        <p class="text-white font-medium">Priorité de matching</p>
                        <p class="text-blue-200 text-sm">Plus de propositions</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal de vérification téléphone -->
        <div id="phoneModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-2xl font-bold text-gray-900">Vérification du téléphone</h3>
                    <button onclick="closePhoneModal()" class="text-gray-400 hover:text-gray-600 text-2xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <!-- Étape 1: Entrer le numéro -->
                <div id="phoneStep1" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Numéro de téléphone <span class="text-red-500">*</span>
                        </label>
                        <input type="tel" id="phoneInput" 
                               placeholder="+33 6 12 34 56 78"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <p class="text-sm text-gray-500 mt-1">Format international (ex: +33612345678)</p>
                    </div>

                    <div>
                        <p class="text-sm font-medium text-gray-700 mb-3">Choisissez votre méthode de vérification:</p>
                        <div class="grid grid-cols-2 gap-3">
                            <button onclick="sendVerificationCode('sms')" 
                                    class="flex flex-col items-center justify-center p-6 border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition group">
                                <i class="fas fa-sms text-3xl text-gray-400 group-hover:text-blue-600 mb-2"></i>
                                <span class="font-semibold text-gray-700 group-hover:text-blue-600">SMS</span>
                                <span class="text-xs text-gray-500 mt-1">Classique</span>
                            </button>
                            
                            <button onclick="sendVerificationCode('whatsapp')" 
                                    class="flex flex-col items-center justify-center p-6 border-2 border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition group">
                                <i class="fab fa-whatsapp text-3xl text-gray-400 group-hover:text-green-600 mb-2"></i>
                                <span class="font-semibold text-gray-700 group-hover:text-green-600">WhatsApp</span>
                                <span class="text-xs text-gray-500 mt-1">Rapide</span>
                            </button>
                        </div>
                    </div>

                    <div id="phoneError" class="hidden bg-red-50 border border-red-200 rounded-lg p-3">
                        <p class="text-red-600 text-sm"></p>
                    </div>
                </div>

                <!-- Étape 2: Entrer le code -->
                <div id="phoneStep2" class="hidden space-y-6">
                    <div class="text-center mb-4">
                        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-3">
                            <i id="methodIcon" class="fas fa-sms text-2xl text-blue-600"></i>
                        </div>
                        <p class="text-gray-600">
                            Code envoyé par <span id="methodText" class="font-semibold">SMS</span> au
                            <br><span id="phoneDisplay" class="font-mono text-lg"></span>
                        </p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2 text-center">
                            Entrez le code à 6 chiffres
                        </label>
                        <input type="text" id="codeInput" 
                               maxlength="6"
                               placeholder="000000"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>

                    <!-- Affichage du code en mode dev -->
                    <div id="devCodeDisplay" class="hidden bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p class="text-yellow-800 text-sm">
                            <i class="fas fa-code mr-2"></i>
                            <strong>Mode DEV:</strong> Votre code est <span id="devCode" class="font-mono text-lg"></span>
                        </p>
                    </div>

                    <div class="flex space-x-3">
                        <button onclick="showStep1()" 
                                class="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition">
                            <i class="fas fa-arrow-left mr-2"></i>Retour
                        </button>
                        <button onclick="verifyCode()" 
                                class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition">
                            Vérifier<i class="fas fa-check ml-2"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
          let verificationState = {
            email: false,
            phone: false,
            kyc: false
          };

          let currentPhone = '';
          let currentMethod = '';

          async function verifyEmail() {
            // Simuler envoi email de vérification
            const confirmed = confirm('Un email de vérification va être envoyé. Continuer ?');
            if (confirmed) {
              try {
                await axios.post('/api/auth/send-verification-email');
                alert('Email de vérification envoyé ! Vérifiez votre boîte de réception.');
                
                // Marquer comme vérifié (simulation)
                verificationState.email = true;
                updateUI();
              } catch (error) {
                alert('Erreur lors de l\\'envoi de l\\'email');
              }
            }
          }

          function openPhoneModal() {
            document.getElementById('phoneModal').classList.remove('hidden');
            document.getElementById('phoneModal').classList.add('flex');
          }

          function closePhoneModal() {
            document.getElementById('phoneModal').classList.add('hidden');
            document.getElementById('phoneModal').classList.remove('flex');
            showStep1();
          }

          function showStep1() {
            document.getElementById('phoneStep1').classList.remove('hidden');
            document.getElementById('phoneStep2').classList.add('hidden');
            document.getElementById('phoneError').classList.add('hidden');
          }

          function showStep2() {
            document.getElementById('phoneStep1').classList.add('hidden');
            document.getElementById('phoneStep2').classList.remove('hidden');
          }

          function showError(message) {
            const errorDiv = document.getElementById('phoneError');
            errorDiv.querySelector('p').textContent = message;
            errorDiv.classList.remove('hidden');
          }

          async function sendVerificationCode(method) {
            const phoneInput = document.getElementById('phoneInput');
            const phone = phoneInput.value.trim();

            if (!phone || phone.length < 10) {
              showError('Veuillez entrer un numéro de téléphone valide (format international)');
              return;
            }

            currentPhone = phone;
            currentMethod = method;

            try {
              const response = await axios.post('/api/auth/send-sms-verification', { 
                phone: phone,
                method: method 
              });

              // Afficher le code en mode dev
              if (response.data.dev_mode && response.data.code) {
                document.getElementById('devCode').textContent = response.data.code;
                document.getElementById('devCodeDisplay').classList.remove('hidden');
              }

              // Mettre à jour l'affichage
              document.getElementById('phoneDisplay').textContent = phone;
              document.getElementById('methodText').textContent = method === 'whatsapp' ? 'WhatsApp' : 'SMS';
              document.getElementById('methodIcon').className = method === 'whatsapp' 
                ? 'fab fa-whatsapp text-2xl text-green-600'
                : 'fas fa-sms text-2xl text-blue-600';

              showStep2();

            } catch (error) {
              const errorMsg = error.response?.data?.error || error.message;
              showError('Erreur: ' + errorMsg);
            }
          }

          async function verifyCode() {
            const code = document.getElementById('codeInput').value.trim();
            
            if (!code || code.length !== 6) {
              alert('Veuillez entrer un code à 6 chiffres');
              return;
            }

            // TODO: Appeler l'API pour vérifier le code
            // Pour l'instant, simulation
            verificationState.phone = true;
            updateUI();
            closePhoneModal();
            alert('✅ Téléphone vérifié avec succès !');
          }

          function startSelfieCapture() {
            alert('Fonction caméra selfie à implémenter avec Web Camera API');
          }

          function uploadIDDocument() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (e) => {
              const file = e.target.files[0];
              if (file) {
                alert('Upload de ' + file.name + ' (à implémenter avec Cloudflare R2)');
                // TODO: Upload vers R2 et analyse avec AI
              }
            };
            input.click();
          }

          function updateUI() {
            // Email vérifié
            if (verificationState.email) {
              const emailCard = document.getElementById('emailCard');
              emailCard.classList.add('completed');
              emailCard.querySelector('button').textContent = 'Vérifié ✓';
              emailCard.querySelector('button').disabled = true;
              
              // Déverrouiller téléphone
              const phoneCard = document.getElementById('phoneCard');
              phoneCard.classList.remove('opacity-50');
              phoneCard.querySelector('button').disabled = false;
            }

            // Téléphone vérifié
            if (verificationState.phone) {
              const phoneCard = document.getElementById('phoneCard');
              phoneCard.classList.add('completed');
              phoneCard.querySelector('button').textContent = 'Vérifié ✓';
              phoneCard.querySelector('button').disabled = true;
              
              // Déverrouiller KYC
              const kycCard = document.getElementById('kycCard');
              kycCard.classList.remove('opacity-50');
              kycCard.querySelectorAll('button').forEach(btn => btn.disabled = false);
              kycCard.querySelectorAll('button').forEach(btn => {
                btn.classList.remove('bg-blue-500/20', 'text-blue-300', 'cursor-not-allowed');
                btn.classList.add('bg-blue-500', 'hover:bg-blue-600', 'text-white');
              });
            }
          }
        </script>
    </body>
    </html>
  `)
})

app.get('/expediteur', (c) => {
  return c.html('<h1>Espace Expéditeur (à implémenter)</h1><a href="/">Retour accueil</a>')
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
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <nav class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-plane text-blue-600 text-2xl"></i>
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
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <nav class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-plane text-blue-600 text-2xl"></i>
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
        <script src="/static/publish-package.js"></script>
    </body>
    </html>
  `)
})

// ==========================================
// TRIPS CRUD APIs
// ==========================================

// Create new trip
app.post('/api/trips', async (c) => {
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
    
    if (user.kyc_status !== 'VERIFIED') {
      return c.json({
        success: false,
        error: 'User must complete KYC verification before publishing trips'
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

// Create new package
app.post('/api/packages', async (c) => {
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
    
    if (user.kyc_status !== 'VERIFIED') {
      return c.json({
        success: false,
        error: 'User must complete KYC verification before publishing packages'
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
                    <i class="fas fa-plane text-blue-600 text-2xl"></i>
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
                    <i class="fas fa-plane text-blue-600 text-2xl"></i>
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

export default app
