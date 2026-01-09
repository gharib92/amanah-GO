# 🚨 Résolution Erreur 522 - Connection Timed Out

## 📋 Diagnostic

**Erreur** : Connection timed out (Error 522)
**Site** : https://amanah-go.pages.dev et https://amanalgo.app

**Cause** : Le serveur backend (Cloudflare Pages) ne répond pas aux requêtes de Cloudflare.

## 🔍 Étapes de vérification

### 1. Vérifier le statut du déploiement

1. Aller sur https://dash.cloudflare.com/pages
2. Cliquer sur le projet "amanah-go"
3. Vérifier le statut du dernier déploiement

**Statuts possibles** :
- ✅ **Success (vert)** : Déploiement réussi → Passer à l'étape 2
- ⏳ **Building (jaune)** : En cours → Attendre 2-3 minutes
- ❌ **Failed (rouge)** : Échec → Lire les logs et passer à l'étape 3

### 2. Si Success mais site inaccessible

**Problème** : Configuration du domaine ou du Worker

**Solutions** :
1. Vérifier la configuration du domaine personnalisé :
   - Dashboard → Pages → amanah-go → Custom domains
   - S'assurer que `amanalgo.app` est bien configuré
   
2. Vérifier que le Worker est démarré :
   - Dashboard → Workers & Pages → amanah-go
   - Vérifier que le Worker est "Active"

3. Purger le cache Cloudflare :
   - Dashboard → Caching → Configuration
   - Cliquer "Purge Everything"

### 3. Si Failed (build échoué)

**Problème** : Le build npm a échoué sur Cloudflare

**Solutions** :

#### Option A : Déploiement manuel (RAPIDE)

1. Le build local est déjà prêt dans `/home/user/webapp/dist/`
2. Aller sur https://dash.cloudflare.com/pages
3. Projet "amanah-go" → "Create deployment"
4. Glisser-déposer le dossier `dist/`
5. Cliquer "Save and Deploy"

#### Option B : Corriger la configuration du build

1. Aller sur https://dash.cloudflare.com/pages
2. Projet "amanah-go" → Settings → Builds & deployments
3. Vérifier la configuration :
   ```
   Build command: npm run build
   Build output directory: dist
   Root directory: (vide)
   Node version: 18 ou 20
   ```
4. Sauvegarder
5. Retourner à l'onglet "Deployments"
6. Cliquer "Retry deployment"

#### Option C : Déploiement via Wrangler (CLI)

```bash
cd /home/user/webapp

# S'assurer que dist/ est à jour
npm run build

# Créer un nouveau token API sur https://dash.cloudflare.com/profile/api-tokens
# Template: "Edit Cloudflare Workers"

# Sauvegarder le token
echo "VOTRE_TOKEN" > .cloudflare-token.txt

# Déployer
export CLOUDFLARE_API_TOKEN=$(cat .cloudflare-token.txt)
npx wrangler pages deploy dist --project-name=amanah-go
```

## 🆘 Solutions alternatives

### Solution 1 : Recréer le projet Cloudflare Pages

Si tout échoue, recréer le projet depuis zéro :

1. Dashboard → Pages → Créer un nouveau projet
2. Connecter à GitHub
3. Sélectionner le repo `amanah-GO`
4. Configuration :
   - Build command : `npm run build`
   - Build output : `dist`
   - Environment variables : (vides pour le moment)
5. Deploy

### Solution 2 : Déployer sur un autre service

**Vercel** (alternative à Cloudflare) :
```bash
npm install -g vercel
vercel --prod
```

**Netlify** :
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

## 📝 Checklist de dépannage

- [ ] Vérifier le statut du déploiement sur Cloudflare Dashboard
- [ ] Essayer https://amanah-go.pages.dev (URL directe)
- [ ] Vider le cache du navigateur (Ctrl+Shift+R)
- [ ] Tester en navigation privée
- [ ] Vérifier les logs de build sur Cloudflare
- [ ] Vérifier la configuration du domaine personnalisé
- [ ] Purger le cache Cloudflare
- [ ] Redéployer manuellement avec dist/
- [ ] Créer un nouveau token API et redéployer via Wrangler

## 🔧 Commandes utiles

```bash
# Rebuild local
cd /home/user/webapp
npm run build

# Vérifier que dist/ existe
ls -la dist/

# Créer une archive pour upload manuel
tar -czf dist-deploy.tar.gz dist/

# Tester localement (pour debug)
cd dist
python3 -m http.server 8000
# Ouvrir http://localhost:8000
```

## 📞 Informations pour le support

Si vous contactez le support Cloudflare, fournissez :

- **Project name** : amanah-go
- **Error** : 522 Connection Timed Out
- **Last deployment** : (date/heure du dernier déploiement)
- **Build logs** : (copier les logs d'erreur)
- **Ray ID** : (visible sur la page d'erreur 522)

---

**Créé le** : 9 janvier 2026
**Statut** : En cours de résolution
