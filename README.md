# 🚀 AMANAH GO

**Plateforme de transport collaboratif peer-to-peer France ↔ Maroc**

*La plateforme de confiance pour connecter voyageurs et expéditeurs*

---

## 📋 Vue d'ensemble du projet

### Vision
Devenir la plateforme de référence pour la mise en relation sécurisée entre voyageurs et expéditeurs sur le corridor France ↔ Maroc.

### Mission
Connecter les voyageurs effectuant le trajet France ↔ Maroc avec des expéditeurs pour transporter des colis de manière économique, écologique et basée sur la confiance (Amanah).

### Marché cible
- **1.5M** de diaspora marocaine en France
- **4M** de voyageurs MRE/an (Marocains Résidents à l'Étranger)
- Marché mondial du crowdshipping estimé à **21.7 Mds$** en 2033

---

## 🎯 Objectifs MVP (90 jours)

- ✅ **Landing Page fonctionnelle** avec calculateur de prix
- ✅ **Base de données D1** initialisée avec schéma complet
- ✅ **API REST** pour users, trips, packages
- 🔄 Réaliser **50 transactions** complètes
- 🔄 Acquérir **200+ utilisateurs** qualifiés
- 🔄 Valider le modèle économique (commission 12%)

---

## 🌐 URLs du projet

### **Production (Sandbox)**
- **Application**: https://3000-issx87j5mnvkvdy3o3xsd-8f57ffe2.sandbox.novita.ai
- **API Health**: https://3000-issx87j5mnvkvdy3o3xsd-8f57ffe2.sandbox.novita.ai/api/health
- **API Users**: https://3000-issx87j5mnvkvdy3o3xsd-8f57ffe2.sandbox.novita.ai/api/users
- **API Trips**: https://3000-issx87j5mnvkvdy3o3xsd-8f57ffe2.sandbox.novita.ai/api/trips
- **API Packages**: https://3000-issx87j5mnvkvdy3o3xsd-8f57ffe2.sandbox.novita.ai/api/packages

---

## 🛠️ Stack Technique

### **Frontend**
- HTML5 / CSS3 / JavaScript (Vanilla)
- **TailwindCSS** (via CDN) - Framework CSS utility-first
- **Font Awesome** - Icônes
- Architecture **Mobile-First**

### **Backend**
- **Hono** v4.11.1 - Framework web ultra-rapide pour edge computing
- **TypeScript** - Typage statique
- **Cloudflare Workers** - Runtime edge serverless

### **Base de données**
- **Cloudflare D1** - Base SQLite distribuée globalement
- Tables: `users`, `trips`, `packages`, `transactions`, `reviews`, `messages`, `notifications`

### **Stockage**
- **Cloudflare R2** - Stockage objet S3-compatible (photos KYC, colis)

### **Déploiement**
- **Cloudflare Pages** - Plateforme de déploiement edge
- **Wrangler** - CLI Cloudflare pour gestion et déploiement

---

## 📊 Architecture de la base de données

### **Tables principales**

#### `users` - Utilisateurs
- Profils double-rôle (Voyageur + Expéditeur)
- KYC (vérification d'identité)
- Stats: rating, reviews_count, total_trips, total_packages
- OAuth: Google, Facebook

#### `trips` - Trajets des voyageurs
- Itinéraire: departure_city → arrival_city
- Capacité: available_weight, price_per_kg
- Statuts: ACTIVE, FULL, COMPLETED, CANCELLED

#### `packages` - Colis des expéditeurs
- Description: title, content_declaration
- Dimensions: weight, length, width, height
- Budget et photos
- Statuts: PUBLISHED, RESERVED, IN_TRANSIT, DELIVERED

#### `transactions` - Transactions
- Liens: package_id, trip_id, shipper_id, traveler_id
- Paiement: agreed_price, platform_fee, traveler_payout
- Stripe: payment_intent_id, transfer_id
- Livraison: delivery_code, pickup_photo, delivery_photo
- Statuts: PENDING, PAID, PICKED_UP, IN_TRANSIT, DELIVERED, COMPLETED

#### `reviews` - Avis et notations
- Rating /5 étoiles
- Critères: punctuality, communication, care
- Commentaires

---

## 🚀 Fonctionnalités actuelles

### ✅ **Implémentées**

#### 1. Landing Page
- Hero section avec double CTA (Je voyage / J'envoie un colis)
- **Calculateur de prix** interactif
- Section "Comment ça marche" (3 étapes)
- Section Sécurité (KYC, Escrow, Reviews, Liste noire)
- Stats du marché (4M+ voyageurs, 70% économies, 100% sécurisé)
- Design responsive mobile-first

#### 2. Base de données D1
- Schéma complet avec 7 tables
- Indexes optimisés pour performance
- Foreign keys et contraintes
- Données de test (seed data)

#### 3. API REST
- `GET /api/health` - Health check
- `GET /api/users` - Liste des utilisateurs
- `GET /api/trips` - Liste des trajets actifs (avec profil voyageur)
- `GET /api/packages` - Liste des colis publiés (avec profil expéditeur)
- `POST /api/db/init` - Initialisation DB (dev only)

#### 3. Authentification & KYC ✅ **NOUVEAU**
- `POST /api/auth/signup` - Inscription utilisateur
- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/send-verification-email` - Envoyer email de vérification
- `POST /api/auth/send-sms-verification` - Envoyer SMS de vérification
- `POST /api/auth/upload-kyc` - Upload photo KYC (selfie/document)

#### 4. Pages Frontend
- `GET /` - Landing page complète
- `GET /signup` - Page d'inscription ✅ **NOUVEAU**
- `GET /login` - Page de connexion ✅ **NOUVEAU**
- `GET /verify-profile` - Page de vérification KYC ✅ **NOUVEAU**

### 🔄 **En développement**

- ~~Système d'authentification (Email, Google, Facebook)~~ ✅ **COMPLÉTÉ**
- CRUD complet Trajets (création, édition, suppression)
- CRUD complet Colis
- Système de matching intelligent
- Intégration Stripe Connect
- Chat temps réel
- Système de notation et avis

---

## 📂 Structure du projet

```
amanah-go/
├── src/
│   ├── index.tsx              # Application Hono principale
│   └── renderer.tsx           # Renderer JSX
├── migrations/
│   └── 0001_initial_schema.sql # Schéma DB initial
├── public/
│   └── static/               # Assets statiques (future)
├── dist/                     # Build output (généré)
│   ├── _worker.js           # Worker Cloudflare compilé
│   └── _routes.json         # Configuration des routes
├── seed.sql                  # Données de test
├── ecosystem.config.cjs      # Configuration PM2 (dev)
├── package.json              # Dépendances et scripts
├── wrangler.jsonc           # Configuration Cloudflare
├── tsconfig.json            # Configuration TypeScript
├── vite.config.ts           # Configuration Vite
└── README.md                # Documentation (ce fichier)
```

---

## 🔧 Installation et développement

### **Prérequis**
- Node.js 18+ et npm
- Compte Cloudflare (pour déploiement production)

### **Installation**

```bash
# Cloner le projet
git clone <votre-repo>
cd amanah-go

# Installer les dépendances
npm install --legacy-peer-deps
```

### **Développement local**

```bash
# 1. Builder le projet
npm run build

# 2. Démarrer le serveur de dev avec PM2
pm2 start ecosystem.config.cjs

# 3. Initialiser la base de données (première fois seulement)
curl -X POST http://localhost:3000/api/db/init

# 4. Tester l'application
curl http://localhost:3000/api/health

# 5. Voir les logs
pm2 logs amanah-go --nostream
```

### **Scripts disponibles**

```bash
# Développement
npm run dev                    # Vite dev server
npm run dev:sandbox           # Wrangler dev avec D1 local
npm run build                 # Build pour production

# Base de données
npm run db:migrate:local      # Appliquer migrations en local
npm run db:migrate:prod       # Appliquer migrations en prod
npm run db:seed               # Charger données de test
npm run db:reset              # Réinitialiser DB locale
npm run db:console:local      # Console SQL locale

# Déploiement
npm run deploy                # Déployer sur Cloudflare Pages
npm run deploy:prod           # Déployer en production

# Utilitaires
npm run clean-port            # Nettoyer le port 3000
npm run test                  # Tester l'API
npm run git:commit            # Git commit rapide
```

---

## 🎨 Charte graphique

### **Couleurs principales**
- **Bleu primaire** (#1E40AF) - Confiance, Professionnalisme
- **Vert secondaire** (#10B981) - Croissance, Validation, Sécurité
- **Orange accent** (#F59E0B) - Action, Alertes

### **Typographie**
- Font principale: **System UI** / **Inter** (web-safe)

### **Design principles**
- Mobile-first responsive
- Cards avec hover effects
- Gradient backgrounds
- Icons Font Awesome

---

## 🔐 Sécurité

### **Système de vérification KYC en 3 étapes** ✅ **NOUVEAU**

Amanah GO implémente un système de vérification multi-niveaux pour garantir la sécurité et la confiance :

#### **Étape 1 : Vérification de l'E-mail** ✉️
- Envoi d'un email de confirmation
- Lien de vérification unique
- Statut: `email_verified`

#### **Étape 2 : Vérification du Téléphone** 📱
- Envoi d'un code SMS à 6 chiffres
- Validation du code
- Statut: `phone_verified`

#### **Étape 3 : Vérification d'Identité & Faciale** 🪪 + 🤳
Cette étape se décompose en 2 sous-étapes :

**Sous-étape 1 : Prendre un selfie**
- Capture photo via webcam ou upload
- Détection de visage avec Cloudflare AI
- Stockage sécurisé sur Cloudflare R2

**Sous-étape 2 : Upload pièce d'identité**
- CIN, Passeport ou Permis de conduire
- Extraction des données (OCR)
- Comparaison faciale selfie ↔ photo ID

**Validation finale :**
- Analyse par l'équipe admin
- Badge "Vérifié" attribué
- Statut KYC: `VERIFIED`

### **Mesures de sécurité implémentées**
- ✅ HTTPS obligatoire (Cloudflare)
- ✅ Validation des inputs (SQL injection protection)
- ✅ CORS configuré pour API

### **À implémenter**
- 🔄 KYC Level 1: Photo CIN/Passeport + Selfie
- 🔄 Système d'Escrow avec Stripe Connect
- 🔄 Liste noire produits interdits (affichée systématiquement)
- 🔄 Encryption des documents sensibles
- 🔄 Rate limiting API

---

## 💰 Modèle économique

### **Commission plateforme: 12%**
- Expéditeur paie: **Prix négocié + 12%**
- Voyageur reçoit: **88% du prix**
- Plateforme garde: **12%**

### **Exemple**
- Colis 10kg × 8€/kg = **80€**
- Expéditeur paie: **89.60€** (80 + 12%)
- Voyageur reçoit: **70.40€** (88% de 80€)
- Commission: **9.60€**

---

## 📈 Roadmap développement

### **✅ Phase 1: MVP Core (Semaines 1-2)** - ✅ **COMPLÉTÉ**
- [x] Setup projet Hono + Cloudflare
- [x] Landing page avec calculateur
- [x] Base de données D1 + schéma
- [x] API REST basiques
- [x] Documentation README

### **✅ Phase 2: Authentification (Semaines 3-4)** - ✅ **COMPLÉTÉ**
- [x] Page d'inscription avec validation
- [x] Page de connexion
- [x] Page de vérification KYC (3 étapes)
- [x] API signup/login
- [x] Système de vérification Email
- [x] Système de vérification SMS
- [x] Upload KYC (selfie + document)
- [ ] OAuth Google + Facebook (à finaliser)
- [ ] Sessions JWT sécurisées
- [ ] Hash bcrypt pour mots de passe

### **⏳ Phase 3: Fonctionnalités Core (Semaines 5-6)**
- [ ] CRUD Trajets complet
- [ ] CRUD Colis complet
- [ ] Système de recherche et filtres
- [ ] Matching automatique
- [ ] Dashboard utilisateur

### **⏳ Phase 4: Transactions (Semaine 7)**
- [ ] Réservation et négociation
- [ ] Intégration Stripe Connect
- [ ] Système Escrow
- [ ] Code de livraison
- [ ] Upload preuves (photos)

### **⏳ Phase 5: Communication (Semaine 8)**
- [ ] Chat temps réel (D1 + polling)
- [ ] Notifications SMS (Twilio)
- [ ] Emails transactionnels (Resend)
- [ ] Timeline de transaction

### **⏳ Phase 6: Sécurité & Reviews (Semaine 9)**
- [ ] Validation KYC admin
- [ ] Liste noire produits
- [ ] Système de notation /5
- [ ] Gestion litiges
- [ ] Badges vérification

### **⏳ Phase 7: Polish & Launch (Semaine 10)**
- [ ] Tests end-to-end
- [ ] SEO optimization
- [ ] Analytics
- [ ] CGU et mentions légales
- [ ] Déploiement production
- [ ] 🚀 **LAUNCH PUBLIC**

---

## 🧪 Tests et validation

### **Données de test disponibles**

**Utilisateurs:**
- `user001` - Mohammed Alami (Voyageur vérifié, 4.8★)
- `user002` - Fatima Benali (Expéditrice vérifiée, 4.9★)
- `user003` - Youssef Idrissi (Voyageur vérifié, 4.5★)

**Trajets actifs:**
- Paris → Casablanca (15kg, 8€/kg, départ dans 5 jours)
- Lyon → Marrakech (20kg, 7.5€/kg, départ dans 10 jours)

**Colis publiés:**
- Cadeaux pour famille (8kg, 70€, Paris → Casablanca)

---

## 📞 Support et contribution

### **Contact**
- Email: contact@amanah-go.com (à créer)
- GitHub: (lien du repo)

### **Contribution**
Les contributions sont les bienvenues ! Merci de :
1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 Licence

Ce projet est en cours de développement. Licence à définir.

---

## 🙏 Remerciements

- **Hono** - Framework web ultra-rapide
- **Cloudflare** - Infrastructure edge mondiale
- **TailwindCSS** - Framework CSS utility-first
- **Font Awesome** - Bibliothèque d'icônes

---

**🚀 Amanah GO - Connectons les voyageurs et les expéditeurs France ↔ Maroc en toute confiance !**

---

*Dernière mise à jour: 20 décembre 2025*
*Statut: ✅ Phase 2 (Authentification + KYC) complétée - Phase 3 prête à démarrer*
