# 🍎 APPLE DEVELOPER - GUIDE COMPLET

## ✅ ÉTAPE 1 : CRÉER TON COMPTE (15 MIN)

### 1. Va sur le site Apple Developer
```
https://developer.apple.com/programs/enroll/
```

### 2. Clique sur "Start Your Enrollment"

### 3. Connecte-toi avec ton Apple ID

### 4. Choisis "Individual"
- Plus rapide
- Validation immédiate
- 99$/an

### 5. Remplis tes informations
- Nom complet
- Adresse complète
- Téléphone
- Date de naissance

### 6. Paye 99$
- Carte bancaire
- Paiement sécurisé Apple

### 7. Attends la confirmation (email)
- Validation immédiate (la plupart du temps)
- Ou dans les 2 heures

---

## ✅ ÉTAPE 2 : CONFIGURER APPLE SIGN IN (30 MIN)

### Une fois le compte validé...

### A. Créer un App ID

1. Va dans **Certificates, Identifiers & Profiles**
2. Clique sur **Identifiers** → **+**
3. Choisis **App IDs**
4. Configure :
   - Description : `Amanah GO Web`
   - Bundle ID : `app.amanahgo.web`
   - Capabilities : Coche **Sign in with Apple**
5. **Register**

### B. Créer un Service ID

1. Clique sur **Identifiers** → **+**
2. Choisis **Services IDs**
3. Configure :
   - Description : `Amanah GO Sign In`
   - Identifier : `app.amanahgo.signin`
4. Coche **Sign in with Apple**
5. Clique sur **Configure**
6. Configure les domaines :
   - **Domains** : `amanahgo.app`
   - **Return URLs** : `https://amanahgo.app/api/auth/apple/callback`
7. **Save** → **Continue** → **Register**

### C. Créer une Private Key

1. Va dans **Keys** → **+**
2. Nom : `Amanah GO Apple Sign In Key`
3. Coche **Sign in with Apple**
4. Clique sur **Configure**
5. Choisis ton App ID : `app.amanahgo.web`
6. **Save** → **Continue** → **Register**
7. **Download** la clé `.p8`
   - ⚠️ **ATTENTION** : Tu ne pourras la télécharger qu'UNE SEULE FOIS !
   - Sauvegarde-la dans un endroit sûr !
8. Note le **Key ID** (10 caractères, ex: `ABC123XYZ9`)

### D. Récupérer le Team ID

1. Va sur https://developer.apple.com/account
2. Clique sur **Membership**
3. Note ton **Team ID** (10 caractères, ex: `XYZ9876ABC`)

---

## ✅ ÉTAPE 3 : VARIABLES D'ENVIRONNEMENT CLOUDFLARE

### Tu auras besoin de ces 4 valeurs :

```bash
APPLE_CLIENT_ID=app.amanahgo.signin
APPLE_TEAM_ID=XYZ9876ABC
APPLE_KEY_ID=ABC123XYZ9
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMG...
(contenu du fichier .p8)
...
-----END PRIVATE KEY-----
```

### Ajouter dans Cloudflare :

1. Va sur https://dash.cloudflare.com
2. **Workers & Pages** → `amanah-go`
3. **Settings** → **Environment variables**
4. Ajoute les 4 variables :
   - `APPLE_CLIENT_ID`
   - `APPLE_TEAM_ID`
   - `APPLE_KEY_ID`
   - `APPLE_PRIVATE_KEY`
5. **Save**

---

## 📋 CHECKLIST

### Compte Apple Developer
- [ ] Compte créé et payé (99$)
- [ ] Email de confirmation reçu
- [ ] Accès au portail Developer

### Configuration Apple Sign In
- [ ] App ID créé (`app.amanahgo.web`)
- [ ] Service ID créé (`app.amanahgo.signin`)
- [ ] Domaine configuré (`amanahgo.app`)
- [ ] Return URL configurée
- [ ] Private Key téléchargée (`.p8`)
- [ ] Key ID noté
- [ ] Team ID noté

### Variables Cloudflare
- [ ] `APPLE_CLIENT_ID` ajouté
- [ ] `APPLE_TEAM_ID` ajouté
- [ ] `APPLE_KEY_ID` ajouté
- [ ] `APPLE_PRIVATE_KEY` ajouté

### Test
- [ ] Déploiement Cloudflare
- [ ] Bouton "Sign in with Apple" visible
- [ ] Test de connexion
- [ ] Utilisateur créé dans DB
- [ ] Redirection OK

---

## 🚨 PROBLÈMES COURANTS

### "Invalid client"
→ Vérifie que `APPLE_CLIENT_ID` = Service ID (`app.amanahgo.signin`)

### "Invalid redirect_uri"
→ Vérifie que l'URL dans Service ID = `https://amanahgo.app/api/auth/apple/callback`

### "Invalid key"
→ Vérifie que `APPLE_PRIVATE_KEY` contient tout le contenu du fichier `.p8` (avec BEGIN et END)

### "Invalid team_id"
→ Vérifie ton Team ID dans Membership

---

## 📞 BESOIN D'AIDE ?

Reviens me voir quand tu as :
1. ✅ Créé ton compte Developer
2. ✅ Reçu l'email de confirmation

Et je t'aiderai pour la configuration technique !

---

**BON COURAGE SOLDAT !** 🍎💪
