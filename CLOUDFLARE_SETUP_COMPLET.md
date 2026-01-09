# 🚀 Guide Complet : Création et Déploiement Cloudflare Pages pour Amanah GO

**Date**: 9 janvier 2026  
**Projet**: Amanah GO  
**Sites cibles**: 
- https://amanah-go.pages.dev (Cloudflare)
- https://amanalgo.app (domaine personnalisé)

---

## 📋 SITUATION ACTUELLE

### ✅ Ce qui fonctionne
- ✅ Build local réussi (`npm run build`)
- ✅ Archive de déploiement créée : `amanah-go-deploy-20260109.tar.gz` (6.3 MB)
- ✅ Dossier `dist/` prêt avec tous les fichiers
- ✅ Code corrigé (Tailwind CDN ajouté)
- ✅ Pull Request #3 créée et mergée

### ❌ Le problème
- ❌ Le projet "amanah-go" n'existe pas encore sur Cloudflare Pages
- ❌ Erreur 522 / 404 car aucun déploiement actif
- ❌ Le domaine `amanalgo.app` n'est pas encore configuré

---

## 🎯 SOLUTION : 3 MÉTHODES DE DÉPLOIEMENT

---

## 📦 MÉTHODE 1 : Upload Direct (⚡ LA PLUS RAPIDE - 5 MINUTES)

### Avantages
- ✅ Déploiement immédiat (30 secondes)
- ✅ Pas besoin de configuration GitHub
- ✅ Parfait pour tester rapidement

### Étapes détaillées

#### 1️⃣ Accéder au Dashboard Cloudflare
```
https://dash.cloudflare.com
```
- Connectez-vous avec votre compte Cloudflare
- Dans le menu latéral, cliquez sur **"Workers & Pages"**

#### 2️⃣ Créer un nouveau projet
- Cliquez sur **"Create application"** (bouton bleu en haut à droite)
- Choisissez l'onglet **"Pages"**
- Cliquez sur **"Upload assets"**

#### 3️⃣ Configuration du projet
```
Project name: amanah-go
```
⚠️ **Important** : Le nom doit être exactement `amanah-go` (sans majuscules, avec le tiret)

#### 4️⃣ Upload des fichiers

**Option A** : Upload du dossier `dist/`
1. Téléchargez le dossier `dist/` depuis votre projet local
2. Glissez-déposez tout le contenu du dossier `dist/` dans la zone de upload
3. ✅ Vérifiez que les fichiers suivants sont présents :
   - `_worker.js` (531 KB)
   - `_routes.json`
   - `manifest.json`
   - `maquettes-amanah-go.html`
   - Dossier `static/`
   - `sw.js`

**Option B** : Upload de l'archive (recommandé)
1. Téléchargez l'archive : `/home/user/webapp/amanah-go-deploy-20260109.tar.gz`
2. Glissez-déposez l'archive dans la zone de upload
3. Cloudflare extraira automatiquement le contenu

#### 5️⃣ Déployer
- Cliquez sur **"Deploy site"** (bouton bleu)
- ⏳ Attendre 30 secondes à 1 minute

#### 6️⃣ Vérification
Une fois le déploiement terminé :
```
✅ Votre site est en ligne : https://amanah-go.pages.dev
```

**Tests à effectuer** :
1. Ouvrir https://amanah-go.pages.dev
2. Vérifier :
   - ✅ Logo Amanah GO visible en haut
   - ✅ Navigation fonctionnelle
   - ✅ Hero avec gradient bleu-vert
   - ✅ Titre "Voyagez Malin, Envoyez Futé"
   - ✅ Deux boutons CTA : "Je voyage" et "J'envoie un colis"
   - ✅ Statistiques : 3.5M+ voyageurs, 70% économies, 100% sécurisé
   - ✅ Boutons OAuth (Apple, Google, Facebook)

---

## 🔗 MÉTHODE 2 : Connexion GitHub (🤖 AUTOMATIQUE - 10 MINUTES)

### Avantages
- ✅ Déploiements automatiques à chaque push
- ✅ Historique complet des déploiements
- ✅ Rollback facile en cas de problème
- ✅ Build automatique par Cloudflare

### Étapes détaillées

#### 1️⃣ Accéder au Dashboard
```
https://dash.cloudflare.com
```
- Workers & Pages → **"Create application"** → **"Pages"**

#### 2️⃣ Connecter GitHub
- Cliquez sur **"Connect to Git"**
- Choisissez **"GitHub"**
- Autorisez Cloudflare à accéder à votre compte GitHub
- Sélectionnez le repository : **`gharib92/amanah-GO`**

#### 3️⃣ Configuration du build

```json
{
  "Project name": "amanah-go",
  "Production branch": "main",
  "Framework preset": "None",
  "Build command": "npm run build",
  "Build output directory": "dist",
  "Root directory": "" (laisser vide)
}
```

#### 4️⃣ Variables d'environnement (optionnel pour l'instant)
Vous configurerez les secrets Stripe plus tard. Pour l'instant, laissez vide.

#### 5️⃣ Déployer
- Cliquez sur **"Save and Deploy"**
- ⏳ Cloudflare va :
  1. Cloner le repository depuis GitHub
  2. Installer les dépendances (`npm install`)
  3. Builder le projet (`npm run build`)
  4. Déployer sur le CDN mondial
- **Temps estimé** : 2-3 minutes

#### 6️⃣ Vérification
```
✅ Site en ligne : https://amanah-go.pages.dev
```

#### 7️⃣ Déploiements futurs automatiques
Maintenant, à chaque fois que vous pushez sur la branche `main` :
- Cloudflare détecte le push
- Build automatiquement
- Déploie la nouvelle version
- **Temps** : 2-3 minutes par déploiement

---

## 🌐 CONFIGURATION DU DOMAINE PERSONNALISÉ `amanalgo.app`

Une fois le projet déployé (Méthode 1 ou 2), configurez votre domaine :

### Étapes

#### 1️⃣ Accéder aux Custom Domains
```
Dashboard Cloudflare Pages → Projet "amanah-go" → Custom domains
```

#### 2️⃣ Ajouter le domaine
- Cliquez sur **"Set up a custom domain"**
- Entrez : `amanalgo.app`
- Cliquez sur **"Continue"**

#### 3️⃣ Vérifier la configuration DNS
Cloudflare vous proposera automatiquement de configurer le DNS si le domaine est déjà sur Cloudflare.

**Option A** : Domaine déjà sur Cloudflare
- Cloudflare créera automatiquement les enregistrements DNS
- ✅ Aucune action nécessaire

**Option B** : Domaine sur un autre registrar
Ajoutez un enregistrement CNAME chez votre registrar :
```
Type: CNAME
Name: @ (ou amanalgo.app)
Value: amanah-go.pages.dev
TTL: Auto ou 3600
```

#### 4️⃣ Activer le HTTPS automatique
- ✅ Cloudflare génère automatiquement un certificat SSL
- ⏳ Attendre 5-10 minutes pour la propagation DNS

#### 5️⃣ Vérification
```
✅ https://amanalgo.app → Redirige vers votre site
✅ Certificat SSL actif (cadenas vert dans le navigateur)
```

---

## 🔧 MÉTHODE 3 : Wrangler CLI (👨‍💻 POUR DÉVELOPPEURS)

### Prérequis
- Token API Cloudflare avec les permissions :
  - `Cloudflare Pages:Edit`
  - `Zone:Read`
  - `User Details:Read`

### Étapes

#### 1️⃣ Créer un token API
```
https://dash.cloudflare.com/profile/api-tokens
```
- Cliquez sur **"Create Token"**
- Choisissez **"Create Custom Token"**
- Permissions :
  - `Account` → `Cloudflare Pages` → `Edit`
  - `Zone` → `Zone` → `Read`
  - `User` → `User Details` → `Read`
- Cliquez sur **"Continue to summary"** puis **"Create Token"**
- **Copiez le token** (vous ne pourrez plus le voir après)

#### 2️⃣ Sauvegarder le token
```bash
cd /home/user/webapp
echo "VOTRE_TOKEN_ICI" > .cloudflare-token.txt
```

#### 3️⃣ Déployer avec Wrangler
```bash
cd /home/user/webapp
export CLOUDFLARE_API_TOKEN=$(cat .cloudflare-token.txt)
npx wrangler pages deploy dist --project-name=amanah-go
```

#### 4️⃣ Vérification
```
✅ Déploiement réussi : https://amanah-go.pages.dev
```

---

## 🧪 TESTS APRÈS DÉPLOIEMENT

### Checklist complète

#### ✅ Design et Navigation
- [ ] Logo Amanah GO visible en haut à gauche
- [ ] Navigation desktop : "Comment ça marche", "Sécurité", "Tarifs", "Liste Noire"
- [ ] Navigation mobile : menu hamburger fonctionnel
- [ ] Gradient bleu-vert dans le hero
- [ ] Design responsive (mobile, tablette, desktop)

#### ✅ Contenu du Hero
- [ ] Titre : "Voyagez Malin, Envoyez Futé"
- [ ] Sous-titre : "Économisez jusqu'à 70% sur vos envois..."
- [ ] Bouton "Je voyage" → redirige vers `/signup?role=traveler`
- [ ] Bouton "J'envoie un colis" → redirige vers `/signup?role=shipper`

#### ✅ Statistiques
- [ ] "3.5M+ voyageurs/an"
- [ ] "70% économies vs DHL"
- [ ] "100% paiement sécurisé"

#### ✅ Authentification
- [ ] Bouton "Connexion" → `/login`
- [ ] Bouton "Inscription" → `/signup`
- [ ] Boutons OAuth : Apple, Google, Facebook visibles

#### ✅ Pages supplémentaires
- [ ] `/login` fonctionne
- [ ] `/signup` fonctionne
- [ ] `/prohibited-items` (Liste Noire) fonctionne

---

## 🐛 DÉPANNAGE

### Erreur 522 - Connection Timed Out
**Cause** : Le projet n'existe pas ou le build a échoué

**Solution** :
1. Vérifier le statut du déploiement dans le dashboard
2. Si "Failed", consulter les logs de build
3. Redéployer avec la Méthode 1 (Upload Direct)

### Erreur 404 - Project Not Found
**Cause** : Le projet "amanah-go" n'existe pas sur Cloudflare

**Solution** :
- Créer le projet avec la Méthode 1 ou 2 ci-dessus

### Le CSS ne se charge pas
**Cause** : Tailwind CDN non présent dans le HTML

**Solution** :
✅ **DÉJÀ CORRIGÉ** : Le CDN Tailwind a été ajouté dans `src/index.tsx`
- Vérifier que le build inclut bien : `<script src="https://cdn.tailwindcss.com"></script>`

### Le site affiche l'ancienne version
**Solution** :
1. Vider le cache du navigateur : `Ctrl + Shift + R` (Windows/Linux) ou `Cmd + Shift + R` (Mac)
2. Essayer en navigation privée
3. Purger le cache Cloudflare :
```
Dashboard → Caching → Purge Everything
```

### Le domaine personnalisé ne fonctionne pas
**Solution** :
1. Vérifier les enregistrements DNS :
```
Type: CNAME
Name: @
Value: amanah-go.pages.dev
```
2. Attendre 5-10 minutes pour la propagation DNS
3. Vérifier avec : `nslookup amanalgo.app`

---

## 📊 RÉCAPITULATIF FINAL

### Ce qui est prêt
✅ Build local réussi  
✅ Archive de déploiement créée  
✅ Code corrigé (Tailwind CDN)  
✅ Pull Request mergée  
✅ Documentation complète  

### Ce qu'il reste à faire
1. **Créer le projet Cloudflare Pages** (Méthode 1 ou 2)
2. **Déployer** (5 minutes avec Méthode 1)
3. **Configurer le domaine** `amanalgo.app` (5 minutes)
4. **Tester** le site en production

### Prochaines étapes (après déploiement)
1. Configurer les secrets Stripe en production
2. Implémenter les endpoints API Stripe
3. Tester les paiements en mode Test
4. Passer en mode Live pour la production

---

## 🎯 ACTION IMMÉDIATE

**Je recommande la MÉTHODE 1 (Upload Direct) :**
1. Allez sur : https://dash.cloudflare.com
2. Workers & Pages → Create application → Pages → **Upload assets**
3. Project name : `amanah-go`
4. Glissez-déposez le dossier `dist/` ou l'archive `amanah-go-deploy-20260109.tar.gz`
5. Cliquez sur **"Deploy site"**
6. ⏳ Attendre 30 secondes
7. ✅ Site en ligne : https://amanah-go.pages.dev

**Temps total estimé : 5 minutes**

---

## 📞 SUPPORT

Si vous rencontrez un problème :
1. Partagez une capture d'écran du dashboard Cloudflare
2. Copiez les logs de build (si build échoué)
3. Indiquez le Ray ID si erreur 522

Je vous aiderai à résoudre le problème rapidement.

---

**Date de création** : 9 janvier 2026  
**Dernière mise à jour** : 9 janvier 2026  
**Statut** : En attente de déploiement sur Cloudflare Pages
