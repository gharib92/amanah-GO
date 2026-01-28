# 🚀 AMANAH GO - Plateforme de Transport Collaboratif

**Version** : 1.0.0  
**Stack** : Cloudflare Workers + D1 + R2 | Hono | React/TSX  
**Région** : France ↔️ Maroc

---

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture](#architecture)
- [Installation](#installation)
- [Déploiement](#déploiement)
- [Configuration](#configuration)
- [Documentation](#documentation)
- [Contribution](#contribution)

---

## 🎯 Vue d'ensemble

Amanah GO est une plateforme qui met en relation :
- **Voyageurs** : proposent de transporter des colis lors de leurs trajets
- **Expéditeurs** : publient des colis à transporter

### Fonctionnalités principales

✅ Authentification (Email/Password + OAuth Google/Facebook)  
✅ KYC avec vérification faciale (AWS Rekognition)  
✅ Publication trajets/colis  
✅ Système de réservation  
✅ Paiements sécurisés (Stripe Connect)  
✅ Messagerie temps réel  
✅ Système de notation  
✅ Multi-langue (FR, AR, EN)  
✅ PWA (Progressive Web App)

---

## 🏗️ Architecture

### Stack technique

```
┌─────────────────────────────────────────┐
│          Cloudflare Workers             │
│  (Edge Functions - Hono Framework)      │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼─────┐  ┌──────▼─────┐  ┌──────────┐
│ D1 Database│  │ R2 Storage │  │   KV     │
│  (SQLite)  │  │  (Photos)  │  │ (Cache)  │
└────────────┘  └────────────┘  └──────────┘

External Services:
├── AWS Rekognition (Face comparison)
├── Stripe Connect (Payments)
├── Firebase Auth (OAuth)
├── Resend (Emails)
└── Twilio (SMS - optionnel)
```

### Structure du projet

```
amanah-GO/
├── src/
│   ├── index.tsx              # Main application (⚠️ à découper)
│   ├── db.service.ts          # Database service
│   ├── aws-rekognition.service.ts
│   └── styles.css
├── public/
│   └── static/
│       ├── auth.js
│       ├── auth-helper.js     # ✅ NEW - Auth utilities
│       ├── kyc-selfie-verification.js
│       ├── stripe-connect.js
│       └── ...
├── migrations/
│   ├── 0001_initial_schema.sql
│   ├── ...
│   └── 0010_add_firebase_uid.sql
├── wrangler.jsonc             # Cloudflare config
├── package.json
└── README.md
```

---

## 🚀 Installation

### Prérequis

- Node.js >= 18
- npm >= 9
- Compte Cloudflare (Workers + D1 + R2)
- Compte AWS (Rekognition)
- Compte Stripe Connect

### 1. Cloner le projet

```bash
git clone https://github.com/gharib92/amanah-GO.git
cd amanah-GO
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créer `.dev.vars` (non commité) :

```bash
cp .dev.vars.example .dev.vars
```

Remplir avec vos credentials :

```env
# JWT
JWT_SECRET=your_jwt_secret_here

# AWS Rekognition
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=eu-north-1

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Firebase
GOOGLE_CLIENT_SECRET=your_google_secret
FACEBOOK_APP_SECRET=your_facebook_secret

# Email
RESEND_API_KEY=re_...

# SMS (optionnel)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=your_token
```

### 4. Créer la base de données D1

```bash
npx wrangler d1 create amanah-go-db
# Copier le database_id dans wrangler.jsonc
```

### 5. Appliquer les migrations

```bash
npx wrangler d1 migrations apply amanah-go-db --remote
```

### 6. Créer le bucket R2

```bash
npx wrangler r2 bucket create amanah-go-storage
```

---

## 🔧 Développement local

### Lancer le serveur de développement

```bash
npm run dev
```

L'app est accessible sur : `http://localhost:8787`

### Build pour production

```bash
npm run build
```

Les fichiers sont générés dans `dist/`.

---

## 🚢 Déploiement

### Option 1 : Via Wrangler CLI (recommandé)

```bash
# Build
npm run build

# Déployer
cd dist
npx wrangler pages deploy . --project-name=amanah-go
```

### Option 2 : Via Dashboard Cloudflare

1. Build local : `npm run build`
2. Zipper `dist/` : `cd dist && zip -r deploy.zip .`
3. Upload sur https://dash.cloudflare.com

### Configurer les secrets en production

```bash
npx wrangler pages secret put AWS_ACCESS_KEY_ID
npx wrangler pages secret put AWS_SECRET_ACCESS_KEY
npx wrangler pages secret put JWT_SECRET
npx wrangler pages secret put STRIPE_SECRET_KEY
npx wrangler pages secret put RESEND_API_KEY
```

---

## 📚 Documentation

- [AWS Rekognition Setup](./AWS_REKOGNITION_SETUP.md)
- [KYC Selfie Implementation](./KYC_SELFIE_IMPLEMENTATION.md)
- [API Documentation](./API.md) (TODO)

---

## 🐛 Problèmes connus

### Authentification

⚠️ **Token expiration** : JWT expire après 7 jours sans refresh token.  
**Workaround** : Se reconnecter manuellement.  
**Fix prévu** : Refresh tokens (Semaine 1)

### KYC

⚠️ **AWS credentials requis** : Mode MOCK si credentials absents.  
**Solution** : Suivre [AWS_REKOGNITION_SETUP.md](./AWS_REKOGNITION_SETUP.md)

---

## 🤝 Contribution

### Workflow Git

1. Fork le projet
2. Créer une branche : `git checkout -b feature/ma-feature`
3. Commit : `git commit -m "feat: Ajout de ma feature"`
4. Push : `git push origin feature/ma-feature`
5. Créer une Pull Request

### Conventions

- **Commits** : Format [Conventional Commits](https://www.conventionalcommits.org/)
  - `feat:` Nouvelle fonctionnalité
  - `fix:` Correction de bug
  - `docs:` Documentation
  - `refactor:` Refactoring
  - `test:` Tests

- **Code** : 
  - Prettier (auto-format)
  - ESLint (linting)
  - TypeScript strict mode

---

## 📞 Support

- **Email** : support@amanahgo.app
- **GitHub Issues** : https://github.com/gharib92/amanah-GO/issues

---

## 📄 Licence

Proprietary - Tous droits réservés

---

## 🎯 Roadmap

### Phase 1 : Stabilisation (En cours)
- [x] AWS Rekognition intégré
- [ ] Corriger authentification
- [ ] Ajouter monitoring (Sentry)
- [ ] Tests unitaires

### Phase 2 : Fonctionnalités (Mois 2)
- [ ] Système de réservation complet
- [ ] Notifications push
- [ ] Assurance colis
- [ ] Admin dashboard avancé

### Phase 3 : Scale (Mois 3+)
- [ ] Mobile app (React Native)
- [ ] Système de parrainage
- [ ] Expansion multi-pays

---

**Développé avec ❤️ par l'équipe Amanah GO**
