# 🍎 Guide de Configuration Apple Sign In pour Amanah GO

## 📋 Prérequis

- Compte Apple ID (ggharibel@gmail.com)
- 99$/an pour Apple Developer Program (nécessaire pour OAuth)
- Accès au domaine amanahgo.app
- Accès au Cloudflare Dashboard

---

## 🎯 ÉTAPE 1 : Rejoindre Apple Developer Program

### 1.1 Inscription
1. Va sur : **https://developer.apple.com/programs/**
2. Clique sur **"Enroll"** ou **"S'inscrire"**
3. Connecte-toi avec ton Apple ID : `ggharibel@gmail.com`
4. Choisis le type de compte :
   - **Individual** (Particulier) : 99$/an - Nom personnel
   - **Organization** (Entreprise) : 99$/an - Nécessite SIRET/DUNS
   
   → **Recommandation** : Choisis **Individual** pour démarrer rapidement

5. Accepte les conditions
6. Paye les 99$ (Apple Pay, CB, PayPal)
7. Attends la confirmation par email (généralement instantané)

### 1.2 Récupérer ton Team ID
1. Une fois inscrit, va sur : **https://developer.apple.com/account**
2. Dans le menu, clique sur **"Membership"** ou **"Adhésion"**
3. Tu verras ton **Team ID** (10 caractères alphanumériques, ex: `ABC123XYZ`)
4. **NOTE CE TEAM ID** → Tu en auras besoin pour Cloudflare ✅

---

## 🎯 ÉTAPE 2 : Créer une App ID

### 2.1 Accéder aux Identifiers
1. Va sur : **https://developer.apple.com/account/resources/identifiers/list**
2. Ou : Developer Console → **Certificates, Identifiers & Profiles** → **Identifiers**

### 2.2 Créer l'App ID
1. Clique sur le bouton **"+"** (en haut à gauche)
2. Sélectionne **"App IDs"**
3. Clique sur **"Continue"**
4. Sélectionne **"App"** (pas App Clip)
5. Clique sur **"Continue"**

6. **Remplis le formulaire** :
   - **Description** : `Amanah GO`
   - **Bundle ID** : Choisis **"Explicit"**
   - **Bundle ID** : `app.amanahgo.web`
     
     ⚠️ Note : Ce Bundle ID doit être unique. Si déjà pris, utilise :
     - `app.amanahgo.production`
     - `com.amanahgo.web`
     - `io.amanahgo.app`

7. Dans **Capabilities**, coche :
   - ✅ **Sign in with Apple**

8. Clique sur **"Continue"**
9. Vérifie les informations
10. Clique sur **"Register"**

✅ **App ID créée !** Note le Bundle ID quelque part.

---

## 🎯 ÉTAPE 3 : Créer un Service ID (OAuth Client ID)

### 3.1 Créer le Service ID
1. Retourne sur : **https://developer.apple.com/account/resources/identifiers/list**
2. Clique sur le bouton **"+"**
3. Sélectionne **"Services IDs"**
4. Clique sur **"Continue"**

5. **Remplis le formulaire** :
   - **Description** : `Amanah GO Web Authentication`
   - **Identifier** : `app.amanahgo.signin`
     
     ⚠️ Note : Cet Identifier sera ton **APPLE_CLIENT_ID** !
     Si déjà pris, utilise :
     - `app.amanahgo.oauth`
     - `com.amanahgo.signin`

6. Coche **"Sign in with Apple"**
7. Clique sur **"Continue"**
8. Clique sur **"Register"**

### 3.2 Configurer Sign in with Apple
1. Dans la liste des Services IDs, clique sur celui que tu viens de créer (`app.amanahgo.signin`)
2. Coche la case **"Sign in with Apple"**
3. Clique sur **"Configure"** à côté

4. Dans la fenêtre de configuration :
   - **Primary App ID** : Sélectionne `app.amanahgo.web` (créé à l'étape 2)
   
   - **Domains and Subdomains** : Ajoute les domaines (clique sur + pour chaque) :
     ```
     amanahgo.app
     ```
   
   - **Return URLs** : Ajoute les URLs de callback (clique sur + pour chaque) :
     ```
     https://amanahgo.app/api/auth/apple/callback
     https://www.amanahgo.app/api/auth/apple/callback
     ```

5. Clique sur **"Next"** puis **"Done"**
6. Clique sur **"Continue"**
7. Clique sur **"Save"**

✅ **Service ID configuré !** 

**NOTE IMPORTANT** : Ton **APPLE_CLIENT_ID** = `app.amanahgo.signin` (l'Identifier du Service ID)

---

## 🎯 ÉTAPE 4 : Créer une Private Key (.p8)

### 4.1 Créer la Key
1. Va sur : **https://developer.apple.com/account/resources/authkeys/list**
2. Ou : Developer Console → **Certificates, Identifiers & Profiles** → **Keys**

3. Clique sur le bouton **"+"**
4. **Key Name** : `Amanah GO Sign in with Apple Key`
5. Coche **"Sign in with Apple"**
6. Clique sur **"Configure"** à côté

7. Dans la fenêtre :
   - **Primary App ID** : Sélectionne `app.amanahgo.web`
   - Clique sur **"Save"**

8. Clique sur **"Continue"**
9. Clique sur **"Register"**

### 4.2 Télécharger la Key
1. Tu verras une page de confirmation avec :
   - **Key ID** (10 caractères, ex: `DEF456UVW`) ← **NOTE CE KEY ID** ✅
   - Bouton **"Download"**

2. **IMPORTANT** : Clique sur **"Download"** pour télécharger le fichier `.p8`
   
   ⚠️ **TU NE POURRAS LE TÉLÉCHARGER QU'UNE SEULE FOIS !**
   
   Si tu le perds, tu devras créer une nouvelle clé.

3. Le fichier téléchargé s'appelle : `AuthKey_DEF456UVW.p8` (avec ton Key ID)

4. Ouvre ce fichier avec TextEdit ou un éditeur de texte
5. Le contenu ressemble à :
   ```
   -----BEGIN PRIVATE KEY-----
   MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
   ... (plusieurs lignes de caractères) ...
   -----END PRIVATE KEY-----
   ```

6. **COPIE TOUT LE CONTENU** (y compris BEGIN et END) ← Tu en auras besoin pour Cloudflare

✅ **Private Key créée et téléchargée !**

---

## 🎯 ÉTAPE 5 : Récapitulatif des Informations

Tu dois maintenant avoir ces 4 informations :

| Variable | Valeur Exemple | Où trouver |
|----------|----------------|------------|
| **APPLE_CLIENT_ID** | `app.amanahgo.signin` | Service ID Identifier (Étape 3) |
| **APPLE_TEAM_ID** | `ABC123XYZ` | Developer Account → Membership (Étape 1.2) |
| **APPLE_KEY_ID** | `DEF456UVW` | Key ID de la clé .p8 (Étape 4.2) |
| **APPLE_PRIVATE_KEY** | `-----BEGIN PRIVATE KEY-----\nMIG...` | Contenu du fichier `.p8` (Étape 4.2) |

---

## 🎯 ÉTAPE 6 : Configurer Cloudflare Pages

### 6.1 Accéder aux Variables d'Environnement
1. Va sur : **https://dash.cloudflare.com/78b8347ee2e203271798afac3bba9276/pages/view/amanah-go/settings**
2. Scroll jusqu'à **"Variables d'environnement"** ou **"Environment Variables"**

### 6.2 Ajouter les Variables
Clique sur **"Add variable"** pour chaque variable :

#### Variable 1 : APPLE_CLIENT_ID
- **Variable name** : `APPLE_CLIENT_ID`
- **Value** : `app.amanahgo.signin` (ton Service ID Identifier)
- **Environment** : Production + Preview
- Clique sur **"Save"**

#### Variable 2 : APPLE_TEAM_ID
- **Variable name** : `APPLE_TEAM_ID`
- **Value** : `ABC123XYZ` (ton Team ID)
- **Environment** : Production + Preview
- Clique sur **"Save"**

#### Variable 3 : APPLE_KEY_ID
- **Variable name** : `APPLE_KEY_ID`
- **Value** : `DEF456UVW` (le Key ID de ta clé .p8)
- **Environment** : Production + Preview
- Clique sur **"Save"**

#### Variable 4 : APPLE_PRIVATE_KEY
- **Variable name** : `APPLE_PRIVATE_KEY`
- **Value** : Colle le contenu complet du fichier `.p8` :
  ```
  -----BEGIN PRIVATE KEY-----
  MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
  ... (plusieurs lignes) ...
  -----END PRIVATE KEY-----
  ```
- **Environment** : Production + Preview
- Clique sur **"Save"**

✅ **Variables Cloudflare configurées !**

---

## 🎯 ÉTAPE 7 : Déployer sur Cloudflare Pages

### 7.1 Sur ton Mac (Terminal)

```bash
# 1. Aller dans le projet
cd ~/Desktop/amanah-GO

# 2. Pull les derniers changements du code (Apple Sign In)
git pull origin genspark_ai_developer

# 3. Build production
npm run build

# 4. Déployer sur Cloudflare Pages
npx wrangler pages deploy dist --project-name=amanah-go
```

### 7.2 Attendre le déploiement
- Le déploiement prend 30-60 secondes
- Tu verras : ✅ `Deployment complete!`
- URL : `https://amanahgo.app`

---

## 🎯 ÉTAPE 8 : Tester Apple Sign In

### 8.1 Test sur la page de login
1. Va sur : **https://amanahgo.app/login**
2. Tu devrais voir 3 boutons OAuth :
   - 🍎 **Sign in with Apple** (bouton noir)
   - 🔴 **Continuer avec Google**
   - 🔵 **Continuer avec Facebook**

### 8.2 Test de connexion
1. Clique sur **"Sign in with Apple"** 🍎
2. Tu seras redirigé vers **appleid.apple.com**
3. Connecte-toi avec ton Apple ID (`ggharibel@gmail.com`)
4. Apple te demandera :
   - **Partager ton email ?** → Oui (ou masque ton email)
   - **Partager ton nom ?** → Oui
5. Autorise l'accès à Amanah GO
6. Tu seras redirigé vers **https://amanahgo.app/voyageur**
7. Tu es connecté ! 🎉

### 8.3 Vérifications
✅ Tu es connecté avec ton Apple ID
✅ Ton profil a été créé automatiquement
✅ Email de bienvenue reçu (si Resend configuré)
✅ Token JWT stocké dans localStorage
✅ Tu as accès au dashboard `/voyageur`

---

## 🎯 ÉTAPE 9 : Test sur la page d'inscription

1. Va sur : **https://amanahgo.app/signup**
2. Clique sur **"Sign in with Apple"** 🍎
3. Même processus que pour le login
4. Si c'est la première fois, ton compte sera créé
5. Sinon, tu seras connecté avec ton compte existant

---

## 🐛 Dépannage (Troubleshooting)

### Erreur : "invalid_client"
➡️ **Solution** : Vérifie que `APPLE_CLIENT_ID` correspond au Service ID Identifier

### Erreur : "invalid_grant"
➡️ **Solution** : 
- Vérifie que les Return URLs dans le Service ID incluent bien :
  - `https://amanahgo.app/api/auth/apple/callback`
  - `https://www.amanahgo.app/api/auth/apple/callback`

### Erreur : "invalid_request" (JWT signature)
➡️ **Solution** :
- Vérifie que `APPLE_PRIVATE_KEY` contient bien tout le fichier `.p8` (BEGIN et END inclus)
- Vérifie que `APPLE_KEY_ID` correspond au Key ID de la clé .p8
- Vérifie que `APPLE_TEAM_ID` est correct

### Le bouton Apple n'apparaît pas
➡️ **Solution** :
- Vide le cache du navigateur (Cmd+Shift+R sur Mac)
- Vérifie que le déploiement Cloudflare a bien réussi
- Check les logs Cloudflare : https://dash.cloudflare.com/.../amanah-go/deployments

### Redirection en boucle
➡️ **Solution** :
- Vérifie que le domaine `amanahgo.app` est bien dans la liste des "Domains" du Service ID
- Vérifie que les certificats SSL sont actifs sur Cloudflare

---

## 📱 Notes Importantes

### 📧 Email Masqué (Hide My Email)
Apple permet aux utilisateurs de masquer leur email. Dans ce cas :
- L'utilisateur reçoit un email temporaire comme : `xyz123@privaterelay.appleid.com`
- Les emails envoyés à cette adresse sont transférés vers l'email réel de l'utilisateur
- Tu dois supporter ces emails dans ton système

### 🔄 Connexions Futures
- **Première connexion** : Apple envoie le nom et l'email
- **Connexions suivantes** : Apple n'envoie que le `sub` (user ID)
- Le code Amanah GO gère ça automatiquement en cherchant l'utilisateur par `oauth_id`

### 🔐 Sécurité
- La clé privée `.p8` est **ultra-sensible** : ne la partage JAMAIS
- Elle est stockée dans les variables Cloudflare (chiffrées)
- Rotation de la clé : Tu peux créer une nouvelle clé tous les 6 mois si besoin

---

## ✅ Checklist Finale

Avant de dire "C'est fini" :

- [ ] Compte Apple Developer créé et payé (99$/an)
- [ ] Team ID récupéré
- [ ] App ID créée avec Sign in with Apple activé
- [ ] Service ID créé et configuré avec les domaines et Return URLs
- [ ] Private Key (.p8) créée et téléchargée
- [ ] Key ID récupéré
- [ ] 4 variables ajoutées dans Cloudflare Pages
- [ ] Code déployé sur production
- [ ] Test de connexion réussi sur `/login`
- [ ] Test de connexion réussi sur `/signup`
- [ ] Profil créé automatiquement
- [ ] Email de bienvenue reçu

---

## 🎉 Félicitations !

Tu as maintenant **Apple Sign In** opérationnel sur Amanah GO ! 🚀

Les utilisateurs peuvent se connecter avec :
- 🍎 **Apple**
- 🔴 **Google**
- 🔵 **Facebook**
- 📧 **Email/Password**

---

## 📞 Support

Si tu as des questions ou des problèmes :
1. Vérifie les logs Cloudflare : https://dash.cloudflare.com/.../pages/view/amanah-go
2. Vérifie les logs Apple Developer Console
3. Check la documentation officielle : https://developer.apple.com/sign-in-with-apple/

---

**Bon courage ! Tu vas assurer ! 💪**
