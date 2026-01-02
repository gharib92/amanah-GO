# ⚡ Quick Start - Apple Sign In Config (10 min)

## 🎯 Résumé rapide pour demain matin

### 📋 Tu as besoin de :
1. **Apple Developer Account** (99$/an)
2. **4 informations** à récupérer
3. **Les ajouter dans Cloudflare**
4. **Déployer**

---

## ⏱️ TIMELINE (30 minutes total)

### 🕐 Étape 1 : Compte Apple Developer (10 min)
1. Va sur : https://developer.apple.com/programs/
2. Inscris-toi avec `ggharibel@gmail.com`
3. Paye 99$ (Apple Pay ou CB)
4. Note ton **Team ID** (10 caractères) → dans Membership

---

### 🕑 Étape 2 : Configuration Apple (15 min)

#### A) Créer App ID (2 min)
- https://developer.apple.com/account/resources/identifiers/list
- "+" → App IDs → App
- Description : `Amanah GO`
- Bundle ID : `app.amanahgo.web`
- Capabilities : ✅ Sign in with Apple
- Register

#### B) Créer Service ID (3 min) → **CLIENT_ID**
- "+" → Services IDs
- Description : `Amanah GO Web`
- Identifier : `app.amanahgo.signin` ← **C'EST TON CLIENT_ID**
- Configure Sign in with Apple :
  - App ID : `app.amanahgo.web`
  - Domains : `amanahgo.app`
  - Return URLs :
    - `https://amanahgo.app/api/auth/apple/callback`
    - `https://www.amanahgo.app/api/auth/apple/callback`
- Save

#### C) Créer Private Key (5 min)
- https://developer.apple.com/account/resources/authkeys/list
- "+" → Key Name : `Amanah GO Sign in`
- ✅ Sign in with Apple → Configure → `app.amanahgo.web`
- Register
- **DOWNLOAD** le fichier `.p8` (une seule fois !)
- Note le **Key ID** (10 caractères)
- Ouvre le `.p8` et copie tout le contenu

---

### 🕒 Étape 3 : Cloudflare Variables (5 min)

Va sur : https://dash.cloudflare.com/78b8347ee2e203271798afac3bba9276/pages/view/amanah-go/settings

Ajoute ces 4 variables :

| Variable | Ta valeur |
|----------|-----------|
| `APPLE_CLIENT_ID` | `app.amanahgo.signin` (ton Service ID) |
| `APPLE_TEAM_ID` | ABC123XYZ (ton Team ID) |
| `APPLE_KEY_ID` | DEF456UVW (Key ID) |
| `APPLE_PRIVATE_KEY` | -----BEGIN PRIVATE KEY-----<br>MIG...<br>-----END PRIVATE KEY----- |

Save après chaque variable.

---

### 🕓 Étape 4 : Déployer (5 min)

Dans Terminal sur ton Mac :

```bash
cd ~/Desktop/amanah-GO
git pull origin genspark_ai_developer
npm run build
npx wrangler pages deploy dist --project-name=amanah-go
```

---

### 🕔 Étape 5 : Tester (2 min)

1. Va sur : https://amanahgo.app/login
2. Clique sur le bouton noir 🍎 **"Sign in with Apple"**
3. Connecte-toi avec ton Apple ID
4. ✅ Tu es redirigé vers `/voyageur` !

---

## 📊 Checklist

- [ ] Compte Apple Developer (99$)
- [ ] Team ID noté
- [ ] App ID créée
- [ ] Service ID créé (CLIENT_ID)
- [ ] Private Key téléchargée (KEY_ID + .p8 content)
- [ ] 4 variables ajoutées dans Cloudflare
- [ ] Déployé sur production
- [ ] Test réussi

---

## 🐛 Problèmes courants

**"invalid_client"** → Vérifie APPLE_CLIENT_ID = Service ID Identifier

**"invalid_grant"** → Vérifie les Return URLs dans le Service ID

**Bouton n'apparaît pas** → Vide cache (Cmd+Shift+R) et redéploie

---

## 📖 Guide Complet

Pour plus de détails et screenshots : **APPLE_SIGNIN_SETUP.md**

---

**Bonne chance ! Tu vas cartonner ! 🚀**
