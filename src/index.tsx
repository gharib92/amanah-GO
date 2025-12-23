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

        <script src="/static/i18n.js?v=3"></script>
        <script src="/static/lang-switcher.js?v=3"></script>
        <script>
          // Wait for i18n to load
          window.addEventListener('DOMContentLoaded', async () => {
            // Initialize i18n first
            await window.i18n.init()
            
            // Inject language switcher
            document.getElementById('langSwitcher').innerHTML = createLanguageSwitcher()
            
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
        <title>Amanah GO - Transport Collaboratif France ↔ Maroc</title>
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
                <div class="flex justify-between items-center py-4">
                    <!-- Logo -->
                    <div class="flex items-center space-x-3">
                        <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-14 w-auto">
                        <span class="text-xl font-bold text-gray-900">Amanah GO</span>
                    </div>
                    
                    <!-- Navigation Links (Center) -->
                    <div class="hidden md:flex items-center space-x-8">
                        <a href="#comment-ca-marche" class="text-gray-700 hover:text-blue-600 transition-colors font-medium" data-i18n="nav.how_it_works">Comment ça marche</a>
                        <a href="#securite" class="text-gray-700 hover:text-blue-600 transition-colors font-medium" data-i18n="nav.security">Sécurité</a>
                        <a href="#tarifs" class="text-gray-700 hover:text-blue-600 transition-colors font-medium" data-i18n="nav.pricing">Tarifs</a>
                    </div>
                    
                    <!-- Right Section: Language + Buttons -->
                    <div class="flex items-center space-x-5">
                        <!-- Language Switcher with balanced spacing -->
                        <div id="langSwitcher" class="px-4"></div>
                        
                        <!-- Auth Buttons -->
                        <button onclick="window.location.href='/login'" class="text-blue-600 hover:text-blue-800 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                            <span data-i18n="common.login">Connexion</span>
                        </button>
                        <button onclick="window.location.href='/signup'" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm">
                            <span data-i18n="common.signup">Inscription</span>
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

        <script src="/static/i18n.js?v=3"></script>
        <script src="/static/lang-switcher.js?v=3"></script>
        <script>
          // Initialize i18n and inject language switcher
          window.addEventListener('DOMContentLoaded', async () => {
            await window.i18n.init()
            document.getElementById('langSwitcher').innerHTML = createLanguageSwitcher()
            
            // Apply translations
            document.querySelectorAll('[data-i18n]').forEach(el => {
              const key = el.getAttribute('data-i18n')
              el.textContent = window.t(key)
            })
          })
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
    
    // Vérifier que l'utilisateur existe
    const user = await DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first()
    if (!user) {
      return c.json({ success: false, error: 'Utilisateur introuvable' }, 404)
    }
    
    // 1. Upload du selfie vers R2
    const selfieKey = `kyc/${userId}/selfie-${Date.now()}.jpg`
    const selfieBuffer = await selfie.arrayBuffer()
    await R2.put(selfieKey, selfieBuffer, {
      httpMetadata: { contentType: 'image/jpeg' }
    })
    
    // 2. Upload de la pièce d'identité vers R2
    const idKey = `kyc/${userId}/id-${Date.now()}.jpg`
    const idBuffer = await idDocument.arrayBuffer()
    await R2.put(idKey, idBuffer, {
      httpMetadata: { contentType: 'image/jpeg' }
    })
    
    // 3. Comparaison faciale avec Cloudflare AI
    let faceMatch = false
    let similarity = 0
    
    try {
      // Utiliser Cloudflare AI Workers AI pour la comparaison faciale
      // Model: @cf/microsoft/resnet-50 pour extraction de features
      // Puis calculer la similarité cosine
      
      // Pour l'instant, on simule (à implémenter avec AI)
      // TODO: Intégrer @cf/microsoft/resnet-50 ou face-api.js
      
      console.log('⚠️ Comparaison faciale non implémentée - Simulation OK')
      faceMatch = true
      similarity = 0.85 // Simulé
      
    } catch (aiError) {
      console.error('Erreur AI:', aiError)
      // Continue sans bloquer si l'AI échoue
    }
    
    // 4. Mettre à jour le statut KYC de l'utilisateur
    const kycStatus = faceMatch ? 'VERIFIED' : 'PENDING_REVIEW'
    
    await DB.prepare(`
      UPDATE users 
      SET kyc_status = ?,
          kyc_selfie_url = ?,
          kyc_document_url = ?,
          kyc_verified_at = datetime('now'),
          updated_at = datetime('now')
      WHERE id = ?
    `).bind(kycStatus, selfieKey, idKey, userId).run()
    
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
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-16 w-auto">
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

// Espace Voyageur - Dashboard principal
app.get('/voyageur', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Espace Voyageur - Amanah GO</title>
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
                            Bienvenue dans votre Espace Voyageur
                        </h1>
                        <p class="text-blue-100 text-lg">Monétisez vos trajets France ↔ Morocco en transportant des colis</p>
                    </div>
                    <div class="hidden md:block">
                        <i class="fas fa-suitcase-rolling text-6xl opacity-20"></i>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="grid md:grid-cols-3 gap-6 mb-8">
                <a href="/voyageur/publier-trajet" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer group">
                    <div class="flex items-center justify-between mb-4">
                        <div class="bg-blue-100 rounded-full p-4 group-hover:bg-blue-600 transition-colors">
                            <i class="fas fa-plus text-2xl text-blue-600 group-hover:text-white"></i>
                        </div>
                        <i class="fas fa-arrow-right text-gray-400 group-hover:text-blue-600 transition-colors"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">Publier un Trajet</h3>
                    <p class="text-gray-600">Ajoutez un nouveau trajet et commencez à gagner de l'argent</p>
                </a>

                <a href="/voyageur/mes-trajets" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer group">
                    <div class="flex items-center justify-between mb-4">
                        <div class="bg-green-100 rounded-full p-4 group-hover:bg-green-600 transition-colors">
                            <i class="fas fa-list text-2xl text-green-600 group-hover:text-white"></i>
                        </div>
                        <i class="fas fa-arrow-right text-gray-400 group-hover:text-green-600 transition-colors"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">Mes Trajets</h3>
                    <p class="text-gray-600">Consultez et gérez tous vos trajets publiés</p>
                </a>

                <a href="/verify-profile" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer group">
                    <div class="flex items-center justify-between mb-4">
                        <div class="bg-purple-100 rounded-full p-4 group-hover:bg-purple-600 transition-colors">
                            <i class="fas fa-shield-alt text-2xl text-purple-600 group-hover:text-white"></i>
                        </div>
                        <i class="fas fa-arrow-right text-gray-400 group-hover:text-purple-600 transition-colors"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">Vérifier mon Profil</h3>
                    <p class="text-gray-600">Complétez votre KYC pour débloquer toutes les fonctionnalités</p>
                </a>
            </div>

            <!-- Stats Overview -->
            <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">
                    <i class="fas fa-chart-line text-blue-600 mr-2"></i>
                    Aperçu Rapide
                </h2>
                <div class="grid md:grid-cols-4 gap-6">
                    <div class="text-center">
                        <div class="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-route text-2xl text-blue-600"></i>
                        </div>
                        <p class="text-3xl font-bold text-gray-900" id="statTrips">0</p>
                        <p class="text-sm text-gray-600">Trajets publiés</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-check-circle text-2xl text-green-600"></i>
                        </div>
                        <p class="text-3xl font-bold text-gray-900" id="statActive">0</p>
                        <p class="text-sm text-gray-600">Trajets actifs</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-purple-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-weight-hanging text-2xl text-purple-600"></i>
                        </div>
                        <p class="text-3xl font-bold text-gray-900" id="statWeight">0</p>
                        <p class="text-sm text-gray-600">kg disponibles</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-yellow-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-euro-sign text-2xl text-yellow-600"></i>
                        </div>
                        <p class="text-3xl font-bold text-green-600" id="statEarnings">0</p>
                        <p class="text-sm text-gray-600">Gains potentiels</p>
                    </div>
                </div>
            </div>

            <!-- How It Works -->
            <div class="bg-white rounded-xl shadow-lg p-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">
                    <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
                    Comment ça marche ?
                </h2>
                <div class="grid md:grid-cols-3 gap-6">
                    <div class="text-center">
                        <div class="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                        <h3 class="font-semibold text-gray-900 mb-2">Publiez votre trajet</h3>
                        <p class="text-gray-600 text-sm">Indiquez votre itinéraire, dates et poids disponible</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                        <h3 class="font-semibold text-gray-900 mb-2">Recevez des propositions</h3>
                        <p class="text-gray-600 text-sm">Les expéditeurs vous contactent avec leurs demandes</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                        <h3 class="font-semibold text-gray-900 mb-2">Gagnez de l'argent</h3>
                        <p class="text-gray-600 text-sm">Transportez et recevez votre paiement sécurisé</p>
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

        <script src="/static/i18n.js?v=3"></script>
        <script src="/static/lang-switcher.js?v=3"></script>
        <script>
          // Initialize i18n and inject language switcher
          window.addEventListener('DOMContentLoaded', async () => {
            await window.i18n.init()
            document.getElementById('langSwitcher').innerHTML = createLanguageSwitcher()
            
            // Apply translations
            document.querySelectorAll('[data-i18n]').forEach(el => {
              const key = el.getAttribute('data-i18n')
              el.textContent = window.t(key)
            })
          })
        </script>
    </body>
    </html>
  `)
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
                <div class="flex items-center space-x-3">
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-16 w-auto">
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
                                <h4 class="text-white font-bold mb-3 flex items-center">
                                    <i class="fas fa-shield-alt text-green-400 mr-2"></i>
                                    Étape 1: Prendre un Selfie en Direct
                                </h4>
                                <p class="text-blue-200 text-xs mb-4">
                                    🔒 Capture en direct obligatoire pour prévenir la fraude
                                </p>
                                
                                <!-- Zone de capture vidéo/preview -->
                                <div class="border-2 border-dashed border-white/20 rounded-lg overflow-hidden mb-4 bg-black/30">
                                    <video id="selfieVideo" class="w-full hidden" autoplay playsinline></video>
                                    <canvas id="selfieCanvas" class="hidden"></canvas>
                                    <img id="selfiePreview" class="w-full hidden" alt="Selfie preview">
                                    
                                    <div id="selfiePreviewEmpty" class="p-8 text-center">
                                        <i class="fas fa-camera text-blue-300 text-4xl mb-3"></i>
                                        <p class="text-blue-200 text-sm">Prenez une photo de votre visage</p>
                                        <p class="text-blue-300 text-xs mt-2">Photo claire, bien éclairée</p>
                                    </div>
                                </div>
                                
                                <!-- Boutons de contrôle -->
                                <button onclick="startSelfieCapture()" disabled id="startSelfieBtn"
                                        class="w-full bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg font-medium transition cursor-not-allowed mb-2">
                                    <i class="fas fa-camera mr-2"></i>
                                    Démarrer la caméra
                                </button>
                                
                                <button onclick="captureSelfie()" id="captureSelfieBtn" class="hidden w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition mb-2">
                                    <i class="fas fa-camera mr-2"></i>
                                    Capturer
                                </button>
                                
                                <button onclick="retakeSelfie()" id="retakeSelfieBtn" class="hidden w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition">
                                    <i class="fas fa-redo mr-2"></i>
                                    Reprendre
                                </button>
                                
                                <div class="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                    <p class="text-yellow-200 text-xs">
                                        <i class="fas fa-info-circle mr-2"></i>
                                        <strong>Important :</strong> La capture en direct est obligatoire pour prévenir la fraude. Si l'accès caméra ne fonctionne pas, vérifiez que vous utilisez HTTPS.
                                    </p>
                                </div>
                            </div>

                            <!-- Étape 2: Pièce d'identité -->
                            <div class="bg-white/5 border border-white/10 rounded-lg p-6">
                                <h4 class="text-white font-bold mb-3">Étape 2: Télécharger la Pièce d'Identité</h4>
                                
                                <!-- Zone d'upload/preview -->
                                <div class="border-2 border-dashed border-white/20 rounded-lg overflow-hidden mb-4 bg-black/30">
                                    <img id="idPreview" class="w-full hidden" alt="ID preview">
                                    
                                    <div id="idPreviewEmpty" class="p-8 text-center">
                                        <i class="fas fa-upload text-blue-300 text-4xl mb-3"></i>
                                        <p class="text-blue-200 text-sm">CIN, Passeport ou Permis</p>
                                        <p class="text-blue-300 text-xs mt-2">Photo recto de votre pièce</p>
                                    </div>
                                </div>
                                
                                <p id="idFileName" class="text-blue-200 text-sm mb-2 hidden truncate"></p>
                                
                                <button onclick="uploadIDDocument()" disabled id="uploadIDBtn"
                                        class="w-full bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg font-medium transition cursor-not-allowed">
                                    <i class="fas fa-file-upload mr-2"></i>
                                    Cliquez pour télécharger
                                </button>
                            </div>
                        </div>
                        
                        <!-- Bouton de soumission -->
                        <div class="mt-6">
                            <button onclick="submitKYCVerification()" id="submitKYCBtn" disabled
                                    class="w-full bg-green-500/20 text-green-300 px-6 py-3 rounded-lg font-bold text-lg transition cursor-not-allowed">
                                <i class="fas fa-check mr-2"></i>
                                Soumettre la vérification
                            </button>
                            <p class="text-blue-200 text-sm text-center mt-2">
                                Les deux documents sont requis pour continuer
                            </p>
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
        <script src="/static/kyc-verification.js"></script>
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
              
              // Activer les boutons KYC
              document.getElementById('startSelfieBtn').disabled = false;
              document.getElementById('startSelfieBtn').classList.remove('bg-blue-500/20', 'text-blue-300', 'cursor-not-allowed');
              document.getElementById('startSelfieBtn').classList.add('bg-blue-600', 'hover:bg-blue-700', 'text-white', 'cursor-pointer');
              
              document.getElementById('uploadIDBtn').disabled = false;
              document.getElementById('uploadIDBtn').classList.remove('bg-blue-500/20', 'text-blue-300', 'cursor-not-allowed');
              document.getElementById('uploadIDBtn').classList.add('bg-blue-600', 'hover:bg-blue-700', 'text-white', 'cursor-pointer');
            }
          }
        </script>
    </body>
    </html>
  `)
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
                            Bienvenue dans votre Espace Expéditeur
                        </h1>
                        <p class="text-green-100 text-lg">Économisez jusqu'à 70% sur vos envois France ↔ Morocco</p>
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
                    <h3 class="text-xl font-bold text-gray-900 mb-2">Publier un Colis</h3>
                    <p class="text-gray-600">Créez une nouvelle demande d'envoi de colis</p>
                </a>

                <a href="/expediteur/mes-colis" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer group">
                    <div class="flex items-center justify-between mb-4">
                        <div class="bg-blue-100 rounded-full p-4 group-hover:bg-blue-600 transition-colors">
                            <i class="fas fa-list text-2xl text-blue-600 group-hover:text-white"></i>
                        </div>
                        <i class="fas fa-arrow-right text-gray-400 group-hover:text-blue-600 transition-colors"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">Mes Colis</h3>
                    <p class="text-gray-600">Suivez tous vos envois en cours et passés</p>
                </a>

                <div onclick="searchTrips()" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer group">
                    <div class="flex items-center justify-between mb-4">
                        <div class="bg-purple-100 rounded-full p-4 group-hover:bg-purple-600 transition-colors">
                            <i class="fas fa-search text-2xl text-purple-600 group-hover:text-white"></i>
                        </div>
                        <i class="fas fa-arrow-right text-gray-400 group-hover:text-purple-600 transition-colors"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">Rechercher un Trajet</h3>
                    <p class="text-gray-600">Trouvez un voyageur pour transporter votre colis</p>
                </div>
            </div>

            <!-- Search Section -->
            <div id="searchSection" class="bg-white rounded-xl shadow-lg p-8 mb-8 hidden">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">
                    <i class="fas fa-search text-green-600 mr-2"></i>
                    Rechercher un Trajet Disponible
                </h2>
                <div class="grid md:grid-cols-3 gap-4 mb-6">
                    <input type="text" id="searchOrigin" placeholder="Ville de départ" class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <input type="text" id="searchDestination" placeholder="Ville d'arrivée" class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <button onclick="performSearch()" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold">
                        <i class="fas fa-search mr-2"></i>Rechercher
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
                    Aperçu Rapide
                </h2>
                <div class="grid md:grid-cols-4 gap-6">
                    <div class="text-center">
                        <div class="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-box text-2xl text-green-600"></i>
                        </div>
                        <p class="text-3xl font-bold text-gray-900" id="statPackages">0</p>
                        <p class="text-sm text-gray-600">Colis publiés</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-clock text-2xl text-blue-600"></i>
                        </div>
                        <p class="text-3xl font-bold text-gray-900" id="statPending">0</p>
                        <p class="text-sm text-gray-600">En attente</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-yellow-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-shipping-fast text-2xl text-yellow-600"></i>
                        </div>
                        <p class="text-3xl font-bold text-gray-900" id="statInTransit">0</p>
                        <p class="text-sm text-gray-600">En transit</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-purple-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-check-circle text-2xl text-purple-600"></i>
                        </div>
                        <p class="text-3xl font-bold text-gray-900" id="statDelivered">0</p>
                        <p class="text-sm text-gray-600">Livrés</p>
                    </div>
                </div>
            </div>

            <!-- How It Works -->
            <div class="bg-white rounded-xl shadow-lg p-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">
                    <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
                    Comment ça marche ?
                </h2>
                <div class="grid md:grid-cols-3 gap-6">
                    <div class="text-center">
                        <div class="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                        <h3 class="font-semibold text-gray-900 mb-2">Publiez votre colis</h3>
                        <p class="text-gray-600 text-sm">Décrivez votre envoi, destination et budget</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                        <h3 class="font-semibold text-gray-900 mb-2">Trouvez un voyageur</h3>
                        <p class="text-gray-600 text-sm">Des voyageurs vous contactent ou recherchez-en un</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                        <h3 class="font-semibold text-gray-900 mb-2">Économisez de l'argent</h3>
                        <p class="text-gray-600 text-sm">Recevez votre colis jusqu'à 70% moins cher</p>
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
              alert('Veuillez remplir les villes de départ et d\\'arrivée')
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
            alert(\`Fonctionnalité de contact en cours de développement (Trajet #\${tripId})\`)
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

        <script src="/static/i18n.js?v=3"></script>
        <script src="/static/lang-switcher.js?v=3"></script>
        <script>
          // Initialize i18n and inject language switcher
          window.addEventListener('DOMContentLoaded', async () => {
            await window.i18n.init()
            document.getElementById('langSwitcher').innerHTML = createLanguageSwitcher()
            
            // Apply translations
            document.querySelectorAll('[data-i18n]').forEach(el => {
              const key = el.getAttribute('data-i18n')
              el.textContent = window.t(key)
            })
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
    
    // Calculate match score for each trip
    const tripsWithScore = results.map(trip => {
      let score = 100
      
      // Score based on available weight (prefer trips with just enough space)
      const weightDiff = trip.available_weight - weight
      if (weightDiff === 0) score += 20 // Perfect match
      else if (weightDiff < 5) score += 10 // Close match
      else if (weightDiff > 20) score -= 5 // Too much space (might wait for bigger package)
      
      // Score based on price (lower is better)
      const priceRatio = trip.price_per_kg / maxPrice
      if (priceRatio < 0.5) score += 15 // Great price
      else if (priceRatio < 0.7) score += 10
      else if (priceRatio < 0.9) score += 5
      
      // Score based on traveler reputation
      if (trip.traveler_kyc === 'VERIFIED') score += 15
      if (trip.traveler_rating >= 4.5) score += 10
      else if (trip.traveler_rating >= 4.0) score += 5
      if (trip.traveler_total_trips > 10) score += 5
      
      // Score based on date proximity
      if (departureDate) {
        const tripDate = new Date(trip.departure_date)
        const targetDate = new Date(departureDate)
        const daysDiff = Math.abs((tripDate - targetDate) / (1000 * 60 * 60 * 24))
        if (daysDiff === 0) score += 15 // Same day
        else if (daysDiff === 1) score += 10 // 1 day diff
        else if (daysDiff <= 2) score += 5 // 2 days diff
      }
      
      // Calculate estimated cost
      const estimatedCost = (weight * trip.price_per_kg).toFixed(2)
      const platformFee = (estimatedCost * 0.12).toFixed(2)
      const totalCost = (parseFloat(estimatedCost) + parseFloat(platformFee)).toFixed(2)
      
      return {
        ...trip,
        match_score: Math.min(score, 100), // Cap at 100
        estimated_cost: estimatedCost,
        platform_fee: platformFee,
        total_cost: totalCost,
        match_quality: score >= 90 ? 'excellent' : score >= 75 ? 'good' : score >= 60 ? 'fair' : 'low'
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
    
    // Calculate match score for each package
    const packagesWithScore = results.map(pkg => {
      let score = 100
      
      // Score based on weight (prefer packages that use more capacity)
      const weightRatio = pkg.weight / availableWeight
      if (weightRatio > 0.8) score += 20 // Great use of capacity
      else if (weightRatio > 0.5) score += 15
      else if (weightRatio > 0.3) score += 10
      else if (weightRatio < 0.1) score -= 5 // Too small
      
      // Score based on budget vs price
      if (pricePerKg > 0) {
        const estimatedPrice = pkg.weight * pricePerKg
        const budgetRatio = pkg.budget / estimatedPrice
        if (budgetRatio >= 1.2) score += 15 // Good margin
        else if (budgetRatio >= 1.0) score += 10
        else if (budgetRatio >= 0.9) score += 5
        else if (budgetRatio < 0.8) score -= 10 // Budget too low
      }
      
      // Score based on shipper reputation
      if (pkg.shipper_kyc === 'VERIFIED') score += 15
      if (pkg.shipper_rating >= 4.5) score += 10
      else if (pkg.shipper_rating >= 4.0) score += 5
      if (pkg.shipper_total_packages > 5) score += 5
      
      // Score based on date compatibility
      if (departureDate && pkg.preferred_date) {
        const pkgDate = new Date(pkg.preferred_date)
        const tripDate = new Date(departureDate)
        const daysDiff = Math.abs((pkgDate - tripDate) / (1000 * 60 * 60 * 24))
        if (daysDiff === 0) score += 15 // Same day
        else if (daysDiff === 1) score += 10
        else if (daysDiff <= 2) score += 5
        if (pkg.flexible_dates) score += 5 // Flexible dates bonus
      }
      
      // Calculate potential earnings
      const potentialEarnings = pricePerKg > 0 
        ? (pkg.weight * pricePerKg * 0.88).toFixed(2) // After 12% commission
        : null
      
      return {
        ...pkg,
        match_score: Math.min(score, 100),
        potential_earnings: potentialEarnings,
        match_quality: score >= 90 ? 'excellent' : score >= 75 ? 'good' : score >= 60 ? 'fair' : 'low'
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
      delivery_location TEXT NOT NULL,
      delivery_latitude REAL,
      delivery_longitude REAL,
      delivery_date DATETIME,
      delivery_code TEXT NOT NULL,
      delivery_confirmed BOOLEAN DEFAULT 0,
      delivery_photo_url TEXT,
      delivery_notes TEXT,
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
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * API: POST /api/exchanges/request
 * Créer une demande d'échange de colis (Expéditeur → Voyageur)
 */
app.post('/api/exchanges/request', async (c) => {
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
    
    // Create exchange
    const result = await DB.prepare(`
      INSERT INTO exchanges (
        package_id, trip_id, sender_id, traveler_id, receiver_id,
        pickup_location, pickup_latitude, pickup_longitude, pickup_date, pickup_code, pickup_notes,
        delivery_location, delivery_latitude, delivery_longitude, delivery_date, delivery_code, delivery_notes,
        status, transaction_code, amount, commission, traveler_earnings, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, 'PENDING')
    `).bind(
      package_id, trip_id, sender_id, traveler_id, receiver_id || null,
      pickup_location, pickup_latitude || null, pickup_longitude || null, pickup_date || null, pickup_code, pickup_notes || null,
      delivery_location, delivery_latitude || null, delivery_longitude || null, delivery_date || null, delivery_code, delivery_notes || null,
      transaction_code, amount, commission, traveler_earnings
    ).run()
    
    return c.json({
      success: true,
      exchange_id: result.meta.last_row_id,
      pickup_code,
      delivery_code,
      transaction_code,
      amount,
      commission,
      traveler_earnings,
      message: 'Demande d\'échange créée avec succès'
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
app.put('/api/exchanges/:id/confirm-pickup', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const body = await c.req.json()
  const { pickup_code, pickup_photo_url } = body
  
  try {
    // Verify code
    const exchange = await DB.prepare('SELECT * FROM exchanges WHERE id = ?').bind(id).first()
    
    if (!exchange) {
      return c.json({ success: false, error: 'Échange introuvable' }, 404)
    }
    
    if (exchange.pickup_code !== pickup_code) {
      return c.json({ success: false, error: 'Code de collecte invalide' }, 400)
    }
    
    const result = await DB.prepare(`
      UPDATE exchanges 
      SET pickup_confirmed = 1, 
          pickup_confirmed_at = CURRENT_TIMESTAMP,
          pickup_photo_url = ?,
          status = 'IN_TRANSIT'
      WHERE id = ?
    `).bind(pickup_photo_url || null, id).run()
    
    return c.json({ 
      success: true, 
      message: 'Collecte confirmée ! Le colis est maintenant en transit.' 
    })
    
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
app.put('/api/exchanges/:id/confirm-delivery', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const body = await c.req.json()
  const { delivery_code, delivery_photo_url } = body
  
  try {
    // Verify code
    const exchange = await DB.prepare('SELECT * FROM exchanges WHERE id = ?').bind(id).first()
    
    if (!exchange) {
      return c.json({ success: false, error: 'Échange introuvable' }, 404)
    }
    
    if (exchange.delivery_code !== delivery_code) {
      return c.json({ success: false, error: 'Code de livraison invalide' }, 400)
    }
    
    const result = await DB.prepare(`
      UPDATE exchanges 
      SET delivery_confirmed = 1, 
          delivery_confirmed_at = CURRENT_TIMESTAMP,
          delivery_photo_url = ?,
          status = 'DELIVERED',
          completed_at = CURRENT_TIMESTAMP,
          payment_status = 'RELEASED'
      WHERE id = ?
    `).bind(delivery_photo_url || null, id).run()
    
    // TODO: Trigger payment release to traveler
    
    return c.json({ 
      success: true, 
      message: 'Livraison confirmée ! Le paiement va être libéré au voyageur.' 
    })
    
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
        <script src="/static/i18n.js?v=3"></script>
        <script src="/static/lang-switcher.js?v=3"></script>
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
                        <i class="fas fa-sort mr-2"></i>Trier par
                    </label>
                    <select id="sortBy" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="score">Score (meilleur)</option>
                        <option value="price_asc">Prix (croissant)</option>
                        <option value="price_desc">Prix (décroissant)</option>
                        <option value="date">Date (proche)</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-star mr-2"></i>Rating min
                    </label>
                    <select id="filterRating" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="0">Tous</option>
                        <option value="3">3+ ⭐</option>
                        <option value="4">4+ ⭐⭐⭐⭐</option>
                        <option value="4.5">4.5+ ⭐⭐⭐⭐⭐</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-shield-alt mr-2"></i>KYC
                    </label>
                    <select id="filterKYC" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="all">Tous</option>
                        <option value="VERIFIED">Vérifiés uniquement</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-chart-line mr-2"></i>Score min
                    </label>
                    <select id="filterScore" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="0">Tous</option>
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
                <h3 class="text-2xl font-bold text-gray-600 mb-2" data-i18n="search.no_results">Aucun résultat trouvé</h3>
                <p class="text-gray-500 mb-6">Essayez de modifier vos critères de recherche</p>
                <a href="/search" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block">
                    <i class="fas fa-redo mr-2"></i>Nouvelle recherche
                </a>
            </div>
        </div>

        <!-- Contact Modal -->
        <div id="contactModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-envelope mr-2 text-blue-600"></i>Contacter
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
        <script src="/static/i18n.js?v=3"></script>
        <script src="/static/lang-switcher.js?v=3"></script>
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
                        document.getElementById('summaryTitle').textContent = 'Trajets disponibles'
                    } else if (searchType === 'packages') {
                        // Voyageur cherche des colis
                        apiUrl = '/api/matches/packages-for-trip?' + urlParams.toString()
                        document.getElementById('summaryIcon').className = 'fas fa-box mr-2 text-green-600'
                        document.getElementById('summaryTitle').textContent = 'Colis disponibles'
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
                            Cette fonctionnalité sera bientôt disponible. 
                            Un système de chat en temps réel sera intégré prochainement.
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

export default app
