# 🚨 GUIDE DE DÉPLOIEMENT D'URGENCE

## ✅ Statut actuel

- ✅ Code corrigé (Tailwind CDN ajouté)
- ✅ Build réussi (`dist/` prêt)
- ✅ Archive créée : `amanah-go-deploy-20260109.tar.gz`

## 🔧 Pourquoi le site ne marche pas ?

Le code est **corrigé et prêt** mais pas encore **déployé en production**.

Le site que vous consultez (`https://amanalgo.app`) affiche l'**ancienne version** du code (sans Tailwind CDN).

## 🚀 SOLUTIONS DE DÉPLOIEMENT (3 options)

---

### ✅ Option 1 : Déploiement via GitHub (RECOMMANDÉ)

**Avantage** : Automatique, pas besoin de token

**Étapes** :
1. Aller sur https://github.com/gharib92/amanah-GO/pull/3
2. Cliquer sur **"Merge pull request"**
3. Cliquer sur **"Confirm merge"**
4. ⏳ Cloudflare déploiera automatiquement (si connecté à GitHub)
5. ✅ Attendre 2-3 minutes
6. Vérifier : https://amanalgo.app

**Si Cloudflare n'est PAS connecté à GitHub** :
- Aller sur https://dash.cloudflare.com
- Pages → amanah-go → Settings → Builds & deployments
- Cliquer "Connect to Git" → Sélectionner votre repo
- Branch de production : `main`
- Build command : `npm run build`
- Build output : `dist`

---

### ✅ Option 2 : Déploiement manuel via Dashboard Cloudflare

**Avantage** : Pas besoin de token API, interface visuelle

**Étapes** :
1. Aller sur https://dash.cloudflare.com
2. Cliquer sur **"Pages"** dans le menu de gauche
3. Sélectionner le projet **"amanah-go"**
4. Cliquer sur **"Create deployment"** (bouton en haut à droite)
5. **Glisser-déposer** le dossier `dist/` OU l'archive `amanah-go-deploy-20260109.tar.gz`
6. Cliquer sur **"Save and Deploy"**
7. ⏳ Attendre la fin du déploiement (1-2 minutes)
8. ✅ Le site sera mis à jour automatiquement

---

### ✅ Option 3 : Déploiement via Wrangler CLI

**Avantage** : Ligne de commande, rapide

**Prérequis** : Token Cloudflare API valide

#### 3.1 Créer un nouveau token API

1. Aller sur https://dash.cloudflare.com/profile/api-tokens
2. Cliquer **"Create Token"**
3. Utiliser le template **"Edit Cloudflare Workers"** OU créer un custom token avec :
   - **Account** : Cloudflare Pages:Edit
   - **Zone** : Zone:Read
   - **User** : User Details:Read
4. Copier le token (commence par `xxx...`)

#### 3.2 Déployer

```bash
cd /home/user/webapp

# Sauvegarder le token
echo "VOTRE_NOUVEAU_TOKEN_ICI" > .cloudflare-token.txt

# Déployer
export CLOUDFLARE_API_TOKEN=$(cat .cloudflare-token.txt)
npx wrangler pages deploy dist --project-name=amanah-go
```

---

## 📊 Vérification après déploiement

Une fois déployé, votre site devrait afficher :

✅ **Navigation propre** avec logo bien positionné
✅ **Hero section** avec fond gradient bleu-vert
✅ **2 CTAs** : "Je voyage" et "J'envoie un colis"
✅ **Statistiques** : 3.5M+ voyageurs, 70% économies
✅ **Boutons OAuth** : Apple, Google, Facebook
✅ **Design responsive** et moderne

## 🌐 URLs du site

- **Cloudflare Pages** : https://amanah-go.pages.dev
- **Domaine personnalisé** : https://amanalgo.app

## 🆘 Dépannage

### Le site affiche toujours l'ancienne version

**Solution** :
1. Vider le cache du navigateur (Ctrl+Shift+R ou Cmd+Shift+R)
2. Ouvrir en navigation privée
3. Attendre 2-3 minutes (propagation DNS)

### Cloudflare ne déploie pas automatiquement

**Solution** :
1. Vérifier que le repo GitHub est connecté (Dashboard → Pages → amanah-go → Settings)
2. Si pas connecté, utiliser l'Option 2 (déploiement manuel)

### "Authentication error" avec Wrangler

**Solution** :
1. Le token est expiré ou invalide
2. Créer un nouveau token (voir Option 3.1)
3. Vérifier les permissions du token

---

## 📝 Résumé

**Situation actuelle** :
- ✅ Code corrigé dans le repo GitHub (branche `genspark_ai_developer`)
- ✅ Pull Request créée (#3)
- ✅ Build prêt dans `dist/`
- ❌ **Pas encore déployé en production**

**Action à faire** :
1. **Choisir une option de déploiement** (1, 2 ou 3)
2. **Déployer**
3. **Vérifier le site**
4. ✅ **TERMINÉ !**

---

## 🚀 Commande rapide pour rebuild + deploy

```bash
cd /home/user/webapp

# Build
npm run build

# Option 1 : Merge PR sur GitHub (recommandé)
# Aller sur https://github.com/gharib92/amanah-GO/pull/3

# Option 2 : Deploy manuel
# Télécharger dist/ et uploader sur Cloudflare Dashboard

# Option 3 : Deploy via Wrangler
export CLOUDFLARE_API_TOKEN=$(cat .cloudflare-token.txt)
npx wrangler pages deploy dist --project-name=amanah-go
```

---

**✅ Le code est prêt, il ne reste plus qu'à déployer !**

*Guide créé le 9 janvier 2026*
