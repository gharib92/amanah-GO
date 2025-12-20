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
// PAGES PLACEHOLDER
// ==========================================

app.get('/login', (c) => {
  return c.html('<h1>Page Login (à implémenter)</h1><a href="/">Retour accueil</a>')
})

app.get('/signup', (c) => {
  return c.html('<h1>Page Inscription (à implémenter)</h1><a href="/">Retour accueil</a>')
})

app.get('/voyageur', (c) => {
  return c.html('<h1>Espace Voyageur (à implémenter)</h1><a href="/">Retour accueil</a>')
})

app.get('/expediteur', (c) => {
  return c.html('<h1>Espace Expéditeur (à implémenter)</h1><a href="/">Retour accueil</a>')
})

// ==========================================
// DATABASE INITIALIZATION (DEV ONLY)
// ==========================================
app.post('/api/db/init', async (c) => {
  const { DB } = c.env
  
  try {
    // Create tables
    await DB.prepare(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  kyc_status TEXT DEFAULT 'PENDING',
  kyc_document_url TEXT,
  kyc_selfie_url TEXT,
  kyc_verified_at DATETIME,
  total_trips INTEGER DEFAULT 0,
  total_packages INTEGER DEFAULT 0,
  rating REAL DEFAULT 0.0,
  reviews_count INTEGER DEFAULT 0,
  google_id TEXT UNIQUE,
  facebook_id TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
)`).run()

    await DB.prepare(`
CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  departure_city TEXT NOT NULL,
  departure_country TEXT DEFAULT 'France',
  arrival_city TEXT NOT NULL,
  arrival_country TEXT DEFAULT 'Maroc',
  departure_date DATETIME NOT NULL,
  available_weight REAL NOT NULL,
  price_per_kg REAL NOT NULL,
  status TEXT DEFAULT 'ACTIVE',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
)`).run()

    await DB.prepare(`
CREATE TABLE IF NOT EXISTS packages (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_declaration TEXT NOT NULL,
  weight REAL NOT NULL,
  length REAL,
  width REAL,
  height REAL,
  budget REAL NOT NULL,
  photos TEXT DEFAULT '[]',
  departure_city TEXT NOT NULL,
  arrival_city TEXT NOT NULL,
  preferred_date DATETIME,
  status TEXT DEFAULT 'PUBLISHED',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
)`).run()

    // Create indexes
    await DB.prepare('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)').run()
    await DB.prepare('CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status)').run()
    await DB.prepare('CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status)').run()
    
    // Seed data - Users
    await DB.prepare(`
INSERT OR IGNORE INTO users (id, email, name, phone, kyc_status, rating, reviews_count) VALUES 
  ('user001', 'mohammed@example.com', 'Mohammed Alami', '+33612345678', 'VERIFIED', 4.8, 12),
  ('user002', 'fatima@example.com', 'Fatima Benali', '+33623456789', 'VERIFIED', 4.9, 8),
  ('user003', 'youssef@example.com', 'Youssef Idrissi', '+33634567890', 'VERIFIED', 4.5, 5)
`).run()

    // Seed data - Trips
    await DB.prepare(`
INSERT OR IGNORE INTO trips (id, user_id, departure_city, arrival_city, departure_date, available_weight, price_per_kg, status) VALUES 
  ('trip001', 'user001', 'Paris', 'Casablanca', datetime('now', '+5 days'), 15.0, 8.0, 'ACTIVE'),
  ('trip002', 'user003', 'Lyon', 'Marrakech', datetime('now', '+10 days'), 20.0, 7.5, 'ACTIVE')
`).run()

    // Seed data - Packages
    await DB.prepare(`
INSERT OR IGNORE INTO packages (id, user_id, title, description, content_declaration, weight, budget, departure_city, arrival_city, status) VALUES 
  ('pkg001', 'user002', 'Cadeaux pour famille', 'Vêtements et jouets', 'Vêtements, jouets', 8.0, 70.0, 'Paris', 'Casablanca', 'PUBLISHED')
`).run()
    
    return c.json({ 
      success: true, 
      message: 'Database initialized successfully with tables and seed data'
    })
    
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

export default app
