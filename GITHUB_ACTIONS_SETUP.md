# 🔐 CONFIGURATION GITHUB ACTIONS - DÉPLOIEMENT AUTO

## 🎯 OBJECTIF

Déployer automatiquement sur Cloudflare Pages à chaque push sur `main` via GitHub Actions.

---

## 📋 PRÉREQUIS

1. Compte Cloudflare (gratuit)
2. Repo GitHub `amanah-GO`
3. 5 minutes de config

---

## 🚀 CONFIGURATION (5 ÉTAPES)

### ÉTAPE 1: Obtenir Cloudflare API Token (2 min)

1. Aller sur: https://dash.cloudflare.com/profile/api-tokens
2. Cliquer **"Create Token"**
3. Template: **"Edit Cloudflare Workers"** (ou créer custom)
4. Permissions:
   - Account > **Cloudflare Pages** > **Edit**
   - Account > **D1** > **Edit**
   - Zone > **Workers Routes** > **Edit**
5. Cliquer **"Continue to summary"**
6. Cliquer **"Create Token"**
7. **COPIER LE TOKEN** (tu ne le reverras plus !)

**Exemple**: `Y9m8v7X6w5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0`

---

### ÉTAPE 2: Obtenir Cloudflare Account ID (1 min)

1. Aller sur: https://dash.cloudflare.com/
2. Cliquer sur n'importe quel domaine/site
3. Dans la sidebar droite, sous **"API"** > copier **"Account ID"**

**Exemple**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

---

### ÉTAPE 3: Créer Database D1 (1 min)

**Via Dashboard**:
1. https://dash.cloudflare.com/
2. **Workers & Pages** > **D1**
3. **Create database**
4. Nom: `amanah-go-db`
5. **Create**

**OU via CLI en local** (sur ta machine):
```bash
wrangler login
wrangler d1 create amanah-go-db
```

Copier le **database_id** affiché.

---

### ÉTAPE 4: Ajouter Secrets GitHub (2 min)

1. Aller sur: https://github.com/gharib92/amanah-GO/settings/secrets/actions
2. Cliquer **"New repository secret"**

#### Secret 1: CLOUDFLARE_API_TOKEN
- **Name**: `CLOUDFLARE_API_TOKEN`
- **Value**: `<ton-token-step-1>`
- Cliquer **"Add secret"**

#### Secret 2: CLOUDFLARE_ACCOUNT_ID
- **Name**: `CLOUDFLARE_ACCOUNT_ID`
- **Value**: `<ton-account-id-step-2>`
- Cliquer **"Add secret"**

---

### ÉTAPE 5: Mettre à jour wrangler.jsonc (1 min)

Editer `/home/user/webapp/wrangler.jsonc` et ajouter le `database_id`:

```json
{
  "name": "amanah-go",
  "compatibility_date": "2024-12-27",
  "pages_build_output_dir": "dist",
  "compatibility_flags": ["nodejs_compat"],
  "vars": {
    "ENVIRONMENT": "production"
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "amanah-go-db",
      "database_id": "TON_DATABASE_ID_ICI"
    }
  ],
  "r2_buckets": [
    {
      "binding": "R2",
      "bucket_name": "amanah-go-storage"
    }
  ]
}
```

Commit et push ce changement.

---

## 🎯 DÉPLOIEMENT AUTOMATIQUE

### Workflow Automatique (deploy.yml)

**Déclenché automatiquement** quand tu push sur `main`:

```bash
git checkout main
git merge genspark_ai_developer
git push origin main
```

GitHub Actions va:
1. ✅ Installer dépendances
2. ✅ Build production
3. ✅ Déployer sur Cloudflare Pages
4. ✅ Afficher URL: `https://amanah-go.pages.dev`

**Voir le déploiement**:
- https://github.com/gharib92/amanah-GO/actions

---

### Workflow Migrations (migrate.yml)

**Déclenchement manuel** pour appliquer migrations:

1. Aller sur: https://github.com/gharib92/amanah-GO/actions
2. Sélectionner **"🗄️ D1 Database Migrations"**
3. Cliquer **"Run workflow"**
4. Choisir **"production"**
5. Cliquer **"Run workflow"**

Migrations appliquées automatiquement !

---

## 🔧 CONFIGURATION POST-DÉPLOIEMENT

### Bindings (via Dashboard Cloudflare)

**Après premier déploiement**:

1. https://dash.cloudflare.com/
2. **Workers & Pages** > **amanah-go**
3. **Settings** > **Bindings**

#### Bind D1 Database:
- Cliquer **"Add"** > **"D1 database"**
- Variable name: `DB`
- D1 database: `amanah-go-db`
- **Save**

#### Bind R2 Bucket:
- Cliquer **"Add"** > **"R2 bucket"**
- Variable name: `R2`
- R2 bucket: `amanah-go-storage` (créer si n'existe pas)
- **Save**

---

### Variables d'Environnement

**Settings > Environment variables**:

```bash
# REQUIRED
ENVIRONMENT=production
JWT_SECRET=<générer: openssl rand -base64 32>

# OPTIONNEL (APIs externes)
STRIPE_SECRET_KEY=sk_live_xxxxx
RESEND_API_KEY=re_xxxxx
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
GOOGLE_CLIENT_ID=xxxxx
FACEBOOK_APP_ID=xxxxx
VAPID_PUBLIC_KEY=xxxxx
```

---

## ✅ VALIDATION

### Check Déploiement:

```bash
# Health check
curl https://amanah-go.pages.dev/api/health

# Résultat attendu:
# {"status":"ok","message":"Amanah GO API is running","timestamp":"..."}
```

### Check Database:

Sur Dashboard Cloudflare:
1. **Workers & Pages** > **D1** > **amanah-go-db**
2. **Console** > Run query:
```sql
SELECT name FROM sqlite_master WHERE type='table';
```

Tu dois voir: `users`, `trips`, `packages`, `exchanges`, etc.

---

## 🎉 C'EST TOUT !

Maintenant:
- ✅ Chaque push sur `main` = déploiement auto
- ✅ Migrations via workflow manuel
- ✅ URL production: https://amanah-go.pages.dev
- ✅ Database D1 persistante
- ✅ R2 bucket configuré

---

## 🆘 TROUBLESHOOTING

### Erreur: "Invalid API token"
- Vérifier secret `CLOUDFLARE_API_TOKEN` dans GitHub
- Regénérer token si expiré

### Erreur: "Database not found"
- Créer database D1: `wrangler d1 create amanah-go-db`
- Mettre à jour `database_id` dans `wrangler.jsonc`

### Erreur: "Account ID invalid"
- Vérifier `CLOUDFLARE_ACCOUNT_ID` dans secrets GitHub
- Copier depuis Dashboard Cloudflare

### Workflow ne se déclenche pas
- Vérifier que tu push sur `main` (pas sur autre branch)
- Check: https://github.com/gharib92/amanah-GO/actions

---

## 📚 RESSOURCES

- **GitHub Actions Logs**: https://github.com/gharib92/amanah-GO/actions
- **Cloudflare Dashboard**: https://dash.cloudflare.com/
- **Pages Docs**: https://developers.cloudflare.com/pages/
- **D1 Docs**: https://developers.cloudflare.com/d1/

---

**Status**: ✅ PRÊT POUR DÉPLOIEMENT AUTO  
**Temps Total**: ~5 minutes de configuration  
**Déploiements suivants**: AUTOMATIQUES (0 min !)
