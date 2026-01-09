# 🚀 Instructions de Déploiement Cloudflare Pages

**Date**: 7 janvier 2026  
**Problème**: Le code corrigé est mergé sur `main` mais Cloudflare ne déploie pas automatiquement

---

## 📋 SITUATION ACTUELLE

### ✅ Ce qui est fait
- PR #2 **mergé sur main** : https://github.com/gharib92/amanah-GO/pull/2
- Commit `d13168a` : fix UUID/D1 format
- Build local **réussi** : 542.98 kB
- Code **correct** vérifié localement

### ❌ Problème
- **Cloudflare Pages n'a pas déployé** automatiquement (>10 minutes d'attente)
- **Ancien code toujours en production** (IDs avec tirets)
- **Site non fonctionnel** : login échoue toujours

---

## 🔧 SOLUTION 1 : Vérifier Cloudflare Dashboard (5 min)

### Étapes à suivre sur ton Mac :

1. **Ouvrir Cloudflare Dashboard**
   - URL : https://dash.cloudflare.com
   - Login avec ton compte

2. **Aller sur Pages**
   - Cliquer sur `Workers & Pages` dans le menu gauche
   - Chercher le projet `amanah-go`
   - Cliquer dessus

3. **Vérifier les Déploiements**
   - Section `Deployments` en haut
   - Chercher un déploiement récent (dernières 10 min)
   
4. **Scénarios possibles** :

   **Scénario A : Déploiement en cours** 🔄
   - Status: `Building` ou `Deploying`
   - **Action** : Attendre 5-10 minutes de plus
   
   **Scénario B : Aucun déploiement** ❌
   - Dernier déploiement : plus de 30 min
   - **Action** : Déclencher un déploiement manuel (voir Solution 2)
   
   **Scénario C : Déploiement échoué** 🔴
   - Status: `Failed`
   - **Action** : Cliquer sur le déploiement → voir les logs d'erreur
   - Me partager les logs pour debug

---

## 🚀 SOLUTION 2 : Déploiement Manuel (10 min)

### Option A : Via Cloudflare Dashboard (plus simple)

1. **Dans le projet amanah-go**
   - Section `Settings`
   - Cliquer sur `Builds & deployments`

2. **Déclencher un Build**
   - Bouton `Create deployment` ou `Retry deployment`
   - Sélectionner branche : `main`
   - Commit : `d13168a` (latest)
   - Cliquer sur `Deploy`

3. **Attendre le déploiement**
   - 2-5 minutes
   - Vérifier status : `Success`

### Option B : Via Wrangler CLI (ligne de commande)

**Prérequis** : Token Cloudflare API

1. **Obtenir le token Cloudflare** (si pas déjà fait)
   - Dashboard Cloudflare
   - Mon Profil → API Tokens
   - Create Token → Use template "Edit Cloudflare Workers"
   - Permissions : Account.Cloudflare Pages (Edit)
   - Copier le token

2. **Configurer Wrangler**
   ```bash
   cd ~/Desktop/amanah-GO
   export CLOUDFLARE_API_TOKEN="ton_token_ici"
   ```

3. **Déployer manuellement**
   ```bash
   # Sur ton Mac (Terminal)
   cd ~/Desktop/amanah-GO
   
   # S'assurer d'être sur main
   git checkout main
   git pull origin main
   
   # Build
   npm run build
   
   # Deploy
   npx wrangler pages deploy dist --project-name=amanah-go
   
   # Attendre 2-3 minutes
   ```

4. **Vérifier le déploiement**
   ```bash
   # Test signup
   curl -X POST https://amanahgo.app/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test123456","name":"Test","phone":"+33600000000"}'
   
   # L'ID doit être 32 caractères SANS tirets
   ```

---

## 🔍 SOLUTION 3 : Debug Cloudflare Configuration

### Vérifier les Hooks GitHub

1. **Sur GitHub**
   - Repo : https://github.com/gharib92/amanah-GO
   - Settings → Webhooks

2. **Chercher le webhook Cloudflare**
   - URL doit contenir : `cloudflare.com`
   - Status : ✅ Recent deliveries successful

3. **Si webhook absent ou en erreur**
   - Reconnect Cloudflare Pages à GitHub
   - Dashboard Cloudflare → amanah-go → Settings → Source
   - Reconnect GitHub repository

### Vérifier Build Settings Cloudflare

1. **Dans amanah-go Settings**
   - Build command : `npm run build`
   - Build output directory : `dist`
   - Root directory : `/` (vide)
   - Node version : `18` ou `20`

2. **Vérifier variables d'environnement**
   - Section `Environment variables`
   - **Production** doit avoir :
     - `DATABASE_NAME=amanah-go-db`
     - `JWT_SECRET=(ton secret)`
     - `GOOGLE_CLIENT_ID=(ton client ID)`
     - `GOOGLE_CLIENT_SECRET=(ton secret)`
     - Etc.

---

## ⚡ SOLUTION RAPIDE (Recommandée)

**Sur ton Mac, dans Terminal :**

```bash
# 1. Aller dans le dossier
cd ~/Desktop/amanah-GO

# 2. S'assurer d'être sur main
git checkout main
git pull origin main

# 3. Vérifier le dernier commit
git log -1 --oneline
# Doit afficher: d13168a fix: Critical login bug...

# 4. Aller sur Cloudflare Dashboard
open https://dash.cloudflare.com
# → Workers & Pages → amanah-go → Deployments
# → Cliquer "Retry deployment" ou "Create deployment"
```

**Attendre 3-5 minutes** puis tester :

```bash
curl -X POST https://amanahgo.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"final@test.com","password":"Test123456","name":"Final","phone":"+33600000000"}' \
  | grep -o '"id":"[^"]*"'

# Si ID = 32 caractères sans tirets → ✅ DÉPLOYÉ
# Si ID = 36 caractères avec tirets → ❌ ENCORE ANCIEN CODE
```

---

## 📊 Checklist de Vérification

- [ ] Dashboard Cloudflare ouvert
- [ ] Projet amanah-go trouvé
- [ ] Section Deployments vérifiée
- [ ] Dernier déploiement : date/heure
- [ ] Status du déploiement : Success/Building/Failed
- [ ] Si Failed : logs lus et compris
- [ ] Si Success mais ancien code : cache Cloudflare à vider
- [ ] Si Building : attendre 5-10 min
- [ ] Si aucun déploiement : déclencher manuellement

---

## 🆘 Si Rien ne Marche

**Me donner ces informations :**

1. **Screenshot du Dashboard Cloudflare**
   - Section Deployments
   - Dernier déploiement (date + status)

2. **Logs si échec**
   - Copier/coller les logs d'erreur

3. **Webhook GitHub status**
   - Recent deliveries : success/failed

4. **Build settings**
   - Build command
   - Output directory
   - Node version

---

## 🎯 Résultat Attendu

**Après déploiement réussi :**

✅ Signup : IDs de 32 caractères sans tirets  
✅ Login : fonctionne avec l'utilisateur créé  
✅ Routes protégées : accessibles avec JWT  
✅ Site : 100% fonctionnel

**Test final :**
```bash
# Signup
USER_TOKEN=$(curl -s -X POST https://amanahgo.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"success@test.com","password":"Success123","name":"Success","phone":"+33600000000"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Login
curl -s -X POST https://amanahgo.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"success@test.com","password":"Success123"}' \
  | grep "success"

# Should return: "success":true
```

---

**Bonne chance ! 🚀**
