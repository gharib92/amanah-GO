# 🚀 GUIDE DÉPLOIEMENT CLOUDFLARE PAGES - AMANAH GO

**Date**: 31 Décembre 2024  
**Mode**: EXPERT - Efficace et Sans Erreurs  
**Durée Estimée**: 30 minutes

---

## 📋 PRÉ-REQUIS

- [x] Compte Cloudflare (gratuit)
- [x] Repo GitHub connecté
- [x] Wrangler CLI installé (`npm install -g wrangler`)
- [x] Build fonctionnel (`npm run build`)

---

## 🎯 OPTION 1: DÉPLOIEMENT AUTOMATIQUE (RECOMMANDÉ)

### Commande Unique:
```bash
chmod +x deploy-cloudflare.sh
./deploy-cloudflare.sh
```

Le script fait **TOUT automatiquement** :
- ✅ Build production
- ✅ Créer DB D1
- ✅ Run migrations
- ✅ Créer R2 Bucket
- ✅ Déployer Pages
- ✅ Instructions bindings

---

## 🎯 OPTION 2: DÉPLOIEMENT MANUEL (ÉTAPE PAR ÉTAPE)

### STEP 1: Authentification Wrangler (2 min)

```bash
cd /home/user/webapp

# Login Cloudflare
wrangler login

# Vérifier auth
wrangler whoami
```

**Résultat attendu**: Affiche votre email Cloudflare

---

### STEP 2: Build Production (1 min)

```bash
npm run build
```

**Résultat attendu**: `dist/_worker.js` créé (~530 KB)

---

### STEP 3: Créer Database D1 (3 min)

```bash
# Créer la database
wrangler d1 create amanah-go-db

# IMPORTANT: Copier l'ID de la database affichée
# database_id = "xxxx-xxxx-xxxx-xxxx"
```

**Mettre à jour `wrangler.jsonc`**:
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
      "database_id": "VOTRE_DATABASE_ID_ICI"
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

---

### STEP 4: Run Migrations D1 (2 min)

```bash
# Appliquer toutes les migrations
wrangler d1 migrations apply amanah-go-db --remote

# Vérifier les tables créées
wrangler d1 execute amanah-go-db --remote --command="SELECT name FROM sqlite_master WHERE type='table';"
```

**Résultat attendu**: Liste des tables (users, trips, packages, exchanges, etc.)

---

### STEP 5: Seed Data (OPTIONNEL) (2 min)

```bash
# Si vous voulez des données de test
wrangler d1 execute amanah-go-db --remote --file=./seed.sql
```

---

### STEP 6: Créer R2 Bucket (2 min)

```bash
# Créer le bucket R2
wrangler r2 bucket create amanah-go-storage

# Vérifier création
wrangler r2 bucket list
```

**Résultat attendu**: `amanah-go-storage` dans la liste

---

### STEP 7: Déployer sur Pages (3 min)

```bash
# Déploiement initial
wrangler pages deploy dist --project-name=amanah-go

# Ou via npm script
npm run deploy:prod
```

**Résultat attendu**: URL du projet  
`https://amanah-go.pages.dev`

---

### STEP 8: Bind D1 Database (5 min)

**Via Dashboard Cloudflare**:

1. Aller sur: https://dash.cloudflare.com/
2. **Workers & Pages** > **amanah-go**
3. **Settings** > **Bindings**
4. **Add** > **D1 Database**
   - Variable name: `DB`
   - D1 Database: `amanah-go-db`
5. **Save**

---

### STEP 9: Bind R2 Bucket (2 min)

**Même page Bindings**:

1. **Add** > **R2 Bucket**
   - Variable name: `R2`
   - R2 Bucket: `amanah-go-storage`
2. **Save**

---

### STEP 10: Variables d'Environnement (5 min)

**Dashboard > Settings > Environment variables**

#### Production (REQUIRED):
```bash
ENVIRONMENT=production
JWT_SECRET=<générer-avec-openssl-rand-base64-32>
```

#### Production (RECOMMANDÉ):
```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Emails (Resend)
RESEND_API_KEY=re_xxxxx

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+33757591098

# OAuth Google
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# OAuth Facebook
FACEBOOK_APP_ID=xxxxx
FACEBOOK_APP_SECRET=xxxxx

# Push Notifications (VAPID)
VAPID_PUBLIC_KEY=xxxxx
VAPID_PRIVATE_KEY=xxxxx
```

**Générer JWT_SECRET**:
```bash
openssl rand -base64 32
```

**Générer VAPID Keys**:
```bash
npx web-push generate-vapid-keys
```

---

### STEP 11: Redéployer (1 min)

Après avoir configuré bindings + variables:

```bash
npm run deploy:prod
```

Ou trigger redéploiement via Dashboard

---

### STEP 12: Tester l'Application (5 min)

```bash
# Health check
curl https://amanah-go.pages.dev/api/health

# Expected result:
# {"status":"ok","message":"Amanah GO API is running","timestamp":"..."}
```

**Tests manuels**:
1. Ouvrir https://amanah-go.pages.dev
2. Tester signup
3. Tester login
4. Vérifier KYC
5. Publier un trajet

---

## 🔧 TROUBLESHOOTING

### Erreur: "Database not bound"
**Solution**: Vérifier bindings D1 dans Dashboard

### Erreur: "R2 bucket not found"
**Solution**: Vérifier bindings R2 dans Dashboard

### Erreur: "JWT_SECRET not defined"
**Solution**: Ajouter `JWT_SECRET` dans variables d'env

### Erreur: Build failed
**Solution**: 
```bash
rm -rf dist node_modules
npm install
npm run build
```

### Pages ne se met pas à jour
**Solution**: Clear cache Cloudflare
1. Dashboard > Pages > amanah-go
2. Deployments > Latest > Clear cache
3. Redeploy

---

## 📊 CHECKLIST DÉPLOIEMENT

### Phase 1: Setup
- [ ] Wrangler authentifié
- [ ] Build production réussi
- [ ] D1 Database créée
- [ ] Migrations appliquées
- [ ] R2 Bucket créé

### Phase 2: Déploiement
- [ ] Pages déployé
- [ ] URL accessible
- [ ] Health check OK

### Phase 3: Configuration
- [ ] D1 binding configuré
- [ ] R2 binding configuré
- [ ] JWT_SECRET défini
- [ ] Variables optionnelles ajoutées

### Phase 4: Validation
- [ ] Signup fonctionne
- [ ] Login fonctionne
- [ ] KYC accessible
- [ ] Trajets publiables
- [ ] Colis publiables

---

## 🚀 RÉSULTAT ATTENDU

Après déploiement complet:

- ✅ **URL Production**: https://amanah-go.pages.dev
- ✅ **Database D1**: Persistante avec toutes les tables
- ✅ **R2 Storage**: Prêt pour uploads KYC/photos
- ✅ **Auth**: Signup/Login opérationnels
- ✅ **APIs**: Tous les endpoints fonctionnels

---

## 📈 PROCHAINES ÉTAPES

### 1. Domaine Personnalisé (Optionnel)
- Dashboard > Pages > amanah-go > Custom domains
- Ajouter: `amanah-go.com`
- Configurer DNS (CNAME automatique)

### 2. Configuration Services Externes
- Twilio (SMS réels)
- Resend (Emails transactionnels)
- Stripe Live Keys
- OAuth Google/Facebook
- VAPID Keys (Push notifications)

### 3. Monitoring
- Cloudflare Analytics (inclus)
- Sentry (erreurs) - optionnel
- Google Analytics (déjà intégré frontend)

### 4. Tests Production
- Relancer `test-e2e-full-flow.sh` sur prod
- Valider flow complet utilisateur
- Vérifier performances

---

## 🎯 COMMANDES UTILES

```bash
# Déployer
npm run deploy:prod

# Logs en temps réel
wrangler pages deployment tail

# Rollback deployment
wrangler pages deployment list
wrangler pages deployment rollback <deployment-id>

# DB Console production
wrangler d1 execute amanah-go-db --remote --command="SELECT COUNT(*) FROM users;"

# R2 Liste fichiers
wrangler r2 object list amanah-go-storage

# Purge cache
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

---

## 💡 CONSEILS EXPERT

1. **Staging Environment**: Créer `amanah-go-staging` pour tester avant prod
2. **CI/CD**: Configurer GitHub Actions pour déploiement auto sur push
3. **Preview Deployments**: Chaque PR crée une preview URL automatiquement
4. **Environment-specific vars**: Séparer production/preview variables
5. **Wrangler.jsonc**: Versionner pour reproductibilité
6. **Migrations**: Toujours tester en local avant remote
7. **Rollback Plan**: Toujours avoir un plan de rollback
8. **Monitoring**: Activer alertes Cloudflare pour erreurs 5xx

---

## 📞 SUPPORT

**Cloudflare Discord**: https://discord.gg/cloudflaredev  
**Docs Pages**: https://developers.cloudflare.com/pages/  
**Docs D1**: https://developers.cloudflare.com/d1/  
**Docs R2**: https://developers.cloudflare.com/r2/

---

**Status**: ✅ PRÊT POUR DÉPLOIEMENT  
**Dernière MAJ**: 31 Décembre 2024
