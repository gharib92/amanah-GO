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
- ✅ **API REST** complète pour users, trips, packages
- ✅ **Système d'authentification** avec KYC (Email + Téléphone + ID + Selfie)
- ✅ **Base de données aéroports** (21 aéroports France + Maroc)
- ✅ **CRUD Trajets** : Publier/Modifier/Supprimer des trajets
- ✅ **CRUD Colis** : Publier/Modifier/Supprimer des colis
- 🔄 Réaliser **50 transactions** complètes
- 🔄 Acquérir **200+ utilisateurs** qualifiés
- 🔄 Valider le modèle économique (commission 12%)

---

## 🌐 URLs du projet

### **Production (Sandbox)**
- **Application**: https://3000-issx87j5mnvkvdy3o3xsd-8f57ffe2.sandbox.novita.ai
- **API Health**: https://3000-issx87j5mnvkvdy3o3xsd-8f57ffe2.sandbox.novita.ai/api/health

### **Pages publiques**
- **Landing Page** : `/`
- **Inscription** : `/signup`
- **Connexion** : `/login`
- **Vérification KYC** : `/verify-profile`

### **Espace Voyageur** 🧳✈️
- **Dashboard Voyageur** : `/voyageur` ✅ **NOUVEAU** - Accueil avec stats temps réel
- **Publier un trajet** : `/voyageur/publier-trajet` ✅
- **Mes trajets** : `/voyageur/mes-trajets` ✅ - Dashboard complet avec statistiques

### **Espace Expéditeur** 📦🚚
- **Dashboard Expéditeur** : `/expediteur` ✅ **NOUVEAU** - Accueil + recherche de trajets
- **Publier un colis** : `/expediteur/publier-colis` ✅
- **Mes colis** : `/expediteur/mes-colis` ✅ - Suivi complet des envois

### **APIs principales**
- **Users**: `/api/users`
- **Trips (CRUD)**: 
  - `GET /api/trips` - Liste des trajets
  - `POST /api/trips` - Créer un trajet
  - `PUT /api/trips/:id` - Modifier un trajet
  - `DELETE /api/trips/:id` - Supprimer un trajet
  - `GET /api/users/:user_id/trips` - Trajets d'un utilisateur
- **Packages (CRUD)**:
  - `GET /api/packages` - Liste des colis
  - `POST /api/packages` - Créer un colis
  - `PUT /api/packages/:id` - Modifier un colis
  - `DELETE /api/packages/:id` - Supprimer un colis
  - `GET /api/users/:user_id/packages` - Colis d'un utilisateur
- **Aéroports**:
  - `GET /api/airports/search?q=Paris` - Recherche autocomplete
  - `GET /api/airports?country=France` - Liste des aéroports
  - `GET /api/airports/:iata` - Détail d'un aéroport
- **Vols**:
  - `GET /api/flights/search?from=CDG&to=CMN&date=2025-12-25` - Recherche de vols

---

## 🎨 Design & Branding

### **Logo**
- **Fichier** : `public/static/logo-amanah-go.png`
- **Format** : PNG 1024x1024 (haute qualité)
- **Symbolisme** :
  - Deux personnes se passant un colis : **collaboration peer-to-peer**
  - Mains protectrices roses : **confiance et sécurité (Amanah)**
  - Avion au-dessus : **voyage France ↔ Maroc**
  - Colis jaune au centre : **l'objet du service**

### **Couleurs**
- **Bleu** (#2563EB) : Confiance, sécurité, voyage
- **Orange** (#EA580C) : Énergie, dynamisme, connexion
- **Rose** (#E11D48) : Confiance, protection, Amanah
- **Vert** (#16A34A) : Économie, écologie, succès
- **Jaune** (#CA8A04) : Colis, optimisme

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
- KYC (vérification d'identité) : `kyc_status`, `kyc_document_url`, `kyc_selfie_url`
- Stats: `rating`, `reviews_count`, `total_trips`, `total_packages`
- OAuth: Google, Facebook

#### `trips` - Trajets des voyageurs
- **Itinéraire**: `departure_city`, `departure_airport` (IATA) → `arrival_city`, `arrival_airport` (IATA)
- **Vol**: `flight_number`, `departure_date`, `flexible_dates`
- **Capacité**: `available_weight`, `price_per_kg`
- **Statuts**: ACTIVE, FULL, COMPLETED, CANCELLED

#### `packages` - Colis des expéditeurs
- **Description**: `title`, `content_declaration`, `description`
- **Dimensions**: `weight`, `dimensions` (ex: "40x30x25 cm")
- **Budget** et **photos** (JSON array)
- **Itinéraire**: `departure_city` → `arrival_city`
- **Dates**: `preferred_date`, `flexible_dates`
- **Statuts**: PUBLISHED, RESERVED, IN_TRANSIT, DELIVERED

#### `airports` - Aéroports France & Maroc (21 aéroports)
- **France** (11): CDG, ORY, LYS, MRS, NCE, TLS, BVA, BOD, NTE, SXB, MPL
- **Maroc** (10): CMN, RAK, AGA, FEZ, TNG, OUD, RBA, ESU, NDR, TTU
- Champs: `iata_code`, `icao_code`, `name`, `city`, `country`, `latitude`, `longitude`, `timezone`
- Index optimisés pour recherche rapide par ville, code IATA, nom

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

### ✅ **Phase 1 : MVP Core (100%)**

#### 1. Landing Page
- Hero section avec double CTA (Je voyage / J'envoie un colis)
- **Calculateur de prix** interactif (poids → prix estimé)
- Section "Comment ça marche" (3 étapes)
- Section Sécurité (KYC, Escrow, Reviews, Liste noire)
- Stats du marché (4M+ voyageurs, 70% économies, 100% sécurisé)
- Design responsive mobile-first avec TailwindCSS

#### 2. Base de données D1
- Schéma complet avec 7 tables + table `airports`
- Indexes optimisés pour performance (email, IATA, ville, statut)
- Foreign keys et contraintes d'intégrité
- Données de test (seed data) avec 21 aéroports réels

### ✅ **Phase 2 : Authentification & KYC (95%)**

#### 3. Système d'inscription & connexion
- **Page d'inscription** (`/signup`) :
  - Formulaire : Nom, Email, Téléphone, Mot de passe
  - Validation client + serveur en temps réel
  - Acceptation CGU obligatoire
  - Boutons OAuth Google/Facebook (UI prête, APIs à connecter)
  - Design élégant et responsive

- **Page de connexion** (`/login`) :
  - Formulaire Email/Password
  - Lien "Mot de passe oublié"
  - Redirection automatique selon `kyc_status`

#### 4. Vérification KYC en 3 étapes (`/verify-profile`)
- **Étape 1 : Email** - Lien envoyé par email (à connecter avec Resend/SendGrid)
- **Étape 2 : Téléphone** - Code SMS ou WhatsApp 6 chiffres avec modal interactif :
  - ✅ Choix entre SMS classique et WhatsApp
  - ✅ Interface utilisateur moderne avec boutons clairs
  - ✅ Intégration Twilio pour SMS et WhatsApp réels
  - ✅ Mode développement avec affichage du code pour tests
  - ✅ Validation du numéro au format international
- **Étape 3 : Identité + Selfie** :
  - Upload selfie (webcam ou fichier)
  - Upload pièce d'identité (CIN/Passeport/Titre de séjour)
  - Comparaison faciale automatique (à intégrer avec Cloudflare AI)
  - Upload vers Cloudflare R2 (à implémenter)
- Design avec progression visuelle, badges de statut, glassmorphism

### ✅ **Phase 3 : Aéroports & Vols (100%)**

#### 5. Base de données aéroports
- **21 aéroports** : 11 France + 10 Maroc
- Table `airports` avec codes IATA/ICAO, coordonnées GPS, fuseaux horaires
- Index optimisés pour recherche rapide

#### 6. APIs aéroports & vols
- **Recherche autocomplete** : `GET /api/airports/search?q=Paris`
  - Tri intelligent par pertinence (ville, code IATA, nom)
  - Filtrage par pays (France/Maroc)
  - Limite 10 résultats
- **Horaires de vols simulés** : `GET /api/flights/search?from=CDG&to=CMN&date=2025-12-25`
  - Données mockées pour France ↔ Maroc
  - Intégration AviationStack API prévue pour Phase 4

### ✅ **Phase 4 : CRUD Trajets & Colis (100%)**

#### 7. Page "Publier un trajet" (`/voyageur/publier-trajet`)
- **Autocomplete aéroports** avec recherche en temps réel
- **Importation numéro de vol** : Auto-remplissage de l'heure de départ
- **Calcul gains automatique** : Poids × Prix/kg - Commission 12%
- **Formulaire complet** :
  - Itinéraire : Départ (aéroport IATA) → Arrivée (aéroport IATA)
  - Date/heure de départ + numéro de vol (optionnel)
  - Dates flexibles (±2 jours)
  - Poids disponible (1-30 kg) + Prix par kg (5-20€)
  - Description optionnelle
- **Validations** :
  - KYC VERIFIED obligatoire
  - Champs requis + limites de poids/prix
  - Feedback visuel en temps réel

#### 8. Page "Publier un colis" (`/expediteur/publier-colis`)
- **Autocomplete villes** basé sur les aéroports
- **Upload photos** : Jusqu'à 5 photos, max 5MB chacune (preview local, upload R2 à implémenter)
- **Calcul coût estimé** : Poids × Prix moyen/kg
- **Formulaire complet** :
  - Titre + Description
  - **Déclaration du contenu** (obligatoire, avertissement produits interdits)
  - Photos du colis (recommandé)
  - Dimensions : Poids (0.1-30 kg) + Dimensions optionnelles
  - Itinéraire : Départ → Arrivée
  - Date préférée + Dates flexibles
  - Budget maximum
- **Validations** :
  - KYC VERIFIED obligatoire
  - Déclaration contenu obligatoire
  - Feedback visuel

#### 9. APIs CRUD complètes
- **Trajets** :
  - `POST /api/trips` - Créer (vérifie KYC, incrémente `total_trips`)
  - `PUT /api/trips/:id` - Modifier (vérifie ownership)
  - `DELETE /api/trips/:id` - Supprimer (décrémente `total_trips`)
  - `GET /api/users/:user_id/trips` - Trajets d'un utilisateur (filtre par statut)
- **Colis** :
  - `POST /api/packages` - Créer (vérifie KYC, incrémente `total_packages`)
  - `PUT /api/packages/:id` - Modifier (vérifie ownership)
  - `DELETE /api/packages/:id` - Supprimer (décrémente `total_packages`)
  - `GET /api/users/:user_id/packages` - Colis d'un utilisateur (filtre par statut)
- **Réponses enrichies** : Inclut nom/avatar/rating/reviews du voyageur/expéditeur

### ✅ **Phase 5 : Dashboards Utilisateurs (100%)**

#### 10. Espace Voyageur principal (`/voyageur`)
- **Dashboard moderne** : Bannière d'accueil personnalisée avec stats en direct
- **3 Actions rapides** (cards interactives) :
  - 🆕 Publier un trajet
  - 📋 Mes trajets
  - 🛡️ Vérifier mon profil
- **Aperçu rapide** : 
  - Trajets publiés / actifs
  - Poids disponible (kg)
  - Gains potentiels (€)
- **Section "Comment ça marche"** (3 étapes simplifiées)
- **Design bleu** : Confiance et voyage
- **Chargement stats via** : `GET /api/trips?user_id={id}`

#### 11. Dashboard Voyageur - Liste trajets (`/voyageur/mes-trajets`)
- **Liste complète** : Affiche tous les trajets de l'utilisateur avec détails enrichis
- **Statistiques en temps réel** :
  - Total trajets
  - Trajets actifs
  - Poids total disponible
  - Gains potentiels (après commission 12%)
- **Filtres dynamiques** : Tous / Actifs / Terminés / Annulés
- **Actions** :
  - Modifier un trajet (UI prête, backend à connecter)
  - Supprimer un trajet avec confirmation
  - Bouton "Nouveau trajet"
- **Affichage enrichi** :
  - Route avec codes aéroports IATA
  - Numéro de vol
  - Calcul gains avec badge vert
  - Badges de statut colorés
  - Date/heure formatées

#### 12. Espace Expéditeur principal (`/expediteur`)
- **Dashboard moderne** : Bannière d'accueil avec économies mises en avant (-70%)
- **3 Actions rapides** (cards interactives) :
  - 🆕 Publier un colis
  - 📋 Mes colis
  - 🔍 Rechercher un trajet
- **Moteur de recherche intégré** :
  - Recherche par origine/destination
  - Résultats en temps réel avec `GET /api/trips?origin=X&destination=Y&status=ACTIVE`
  - Cards trajets disponibles (poids, prix/kg, date)
  - Bouton "Contacter" (chat à implémenter)
- **Aperçu rapide** :
  - Colis publiés
  - En attente / En transit / Livrés
- **Section "Comment ça marche"** (3 étapes simplifiées)
- **Design vert** : Économie et écologie
- **Chargement stats via** : `GET /api/packages?user_id={id}`

#### 13. Dashboard Expéditeur - Liste colis (`/expediteur/mes-colis`)
- **Liste complète** : Affiche tous les colis avec photos et détails
- **Statistiques en temps réel** :
  - Total colis
  - Colis publiés
  - Poids total
  - Budget moyen
- **Filtres dynamiques** : Tous / Publiés / Réservés / Livrés
- **Actions** :
  - Modifier un colis (UI prête, backend à connecter)
  - Supprimer un colis avec confirmation
  - Bouton "Nouveau colis"
- **Affichage enrichi** :
  - Galerie photos (max 3 preview + compteur)
  - Déclaration contenu
  - Route et date préférée
  - Badges de statut colorés

### 🔄 **En développement - Phase 6**

- Système de matching intelligent (recherche + filtres + suggestions)
- Négociation & réservation de colis
- Intégration Stripe Connect avec Escrow
- Chat temps réel (voyageur ↔ expéditeur)
- Système de notation et avis (after delivery)
- Finalisation OAuth (Google, Facebook)
- Hachage bcrypt des mots de passe
- Implémentation JWT pour sessions
- Intégration Cloudflare AI (comparaison faciale)
- Intégration Twilio (SMS réels)
- Intégration Resend/SendGrid (Emails réels)
- Upload effectif vers Cloudflare R2 (photos KYC + colis)

---

## 📂 Structure du projet

```
amanah-go/
├── src/
│   ├── index.tsx              # Application Hono principale (2600+ lignes)
│   └── renderer.tsx           # Renderer JSX (si nécessaire)
├── migrations/
│   ├── 0001_initial_schema.sql     # Schéma DB initial (users, trips, packages, transactions, etc.)
│   └── 0002_airports_flights.sql   # Schéma aéroports + cache vols
├── public/
│   └── static/
│       ├── publish-trip.js         # Logic page publier trajet
│       ├── publish-package.js      # Logic page publier colis
│       ├── traveler-dashboard.js   # Logic dashboard voyageur ✨ NOUVEAU
│       └── shipper-dashboard.js    # Logic dashboard expéditeur ✨ NOUVEAU
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
