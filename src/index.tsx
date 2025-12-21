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
  // TODO: Intégrer avec Twilio
  try {
    const { phone } = await c.req.json()
    console.log('Envoi SMS de vérification à:', phone)
    
    // Générer code à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000)
    
    // TODO: Envoyer via Twilio et stocker le code en DB ou KV
    
    return c.json({ success: true, message: 'SMS envoyé', code: code }) // Ne pas renvoyer le code en prod !
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
                                <p class="text-blue-200 text-sm">Ajoutez votre numéro pour recevoir des notifications importantes.</p>
                            </div>
                        </div>
                        <div class="flex space-x-2">
                            <span class="bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-lg font-medium text-sm">
                                Requis
                            </span>
                            <button onclick="verifyPhone()" disabled
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

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
          let verificationState = {
            email: false,
            phone: false,
            kyc: false
          };

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

          async function verifyPhone() {
            const phone = prompt('Entrez votre numéro de téléphone:');
            if (phone) {
              try {
                await axios.post('/api/auth/send-sms-verification', { phone });
                const code = prompt('Entrez le code reçu par SMS:');
                if (code) {
                  // Vérifier le code
                  verificationState.phone = true;
                  updateUI();
                  alert('Téléphone vérifié avec succès !');
                }
              } catch (error) {
                alert('Erreur lors de la vérification du téléphone');
              }
            }
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
