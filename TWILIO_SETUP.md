# 📱 Configuration Twilio pour SMS et WhatsApp

## 🎯 Objectif
Envoyer de vrais SMS et messages WhatsApp de vérification aux utilisateurs lors de l'inscription.

---

## 🔄 Nouvelles fonctionnalités WhatsApp

L'application supporte désormais deux méthodes de vérification :
- ✅ **SMS classique** - Code envoyé par SMS
- ✅ **WhatsApp** - Code envoyé via WhatsApp (plus rapide, gratuit pour l'utilisateur)

L'utilisateur peut choisir sa méthode préférée directement dans l'interface.

---

## ✅ Étape 1 : Créer un compte Twilio

1. **Va sur** : https://www.twilio.com/try-twilio
2. **Inscris-toi** avec ton email
3. **Vérifie ton email** et ton numéro de téléphone
4. **Obtiens $15 de crédits gratuits** pour tester

---

## ✅ Étape 2 : Récupérer les credentials

1. **Connecte-toi** à la console Twilio : https://console.twilio.com
2. **Copie** ces informations depuis le Dashboard :

   ```
   Account SID     : ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   Auth Token      : clique sur "Show" pour le voir
   ```

3. **Obtiens un numéro de téléphone** :
   - Va dans **Phone Numbers** > **Manage** > **Buy a number**
   - Sélectionne un pays (France recommandé : +33)
   - Cherche un numéro avec capacité **SMS**
   - Achète le numéro (gratuit avec les crédits)

---

## ✅ Étape 3 : Configurer localement

### **Pour le développement local (Sandbox)**

Crée le fichier `.dev.vars` à la racine du projet :

```bash
cd /home/user/webapp
nano .dev.vars
```

Copie-colle tes credentials :

```env
TWILIO_ACCOUNT_SID=AC12345678901234567890123456789012
TWILIO_AUTH_TOKEN=your_real_auth_token_here
TWILIO_PHONE_NUMBER=+33612345678

# WhatsApp (optionnel mais recommandé)
# Pour tester gratuitement, utilise le Twilio Sandbox
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

**Note** : Le numéro WhatsApp par défaut est le Twilio Sandbox. Les utilisateurs devront d'abord rejoindre le sandbox en envoyant "join <code>" au numéro +1 415 523 8886 sur WhatsApp.

Sauvegarde et redémarre l'application :

```bash
pm2 restart amanah-go
```

---

## ✅ Étape 4 : Tester

### **Test via l'interface web**

1. Va sur `/signup`
2. Remplis le formulaire et clique "S'inscrire"
3. Sur la page de vérification KYC (`/verify-profile`), clique sur "Vérifier le téléphone"
4. **Choisis ta méthode** : SMS ou WhatsApp
5. **Tu devrais recevoir un message** avec le code de vérification

### **Test SMS via API**

```bash
curl -X POST http://localhost:3000/api/auth/send-sms-verification \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33612345678", "method": "sms"}'
```

### **Test WhatsApp via API**

```bash
curl -X POST http://localhost:3000/api/auth/send-sms-verification \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33612345678", "method": "whatsapp"}'
```

**Résultat attendu** (avec Twilio configuré) :
```json
{
  "success": true,
  "message": "SMS envoyé avec succès"
}
```
ou
```json
{
  "success": true,
  "message": "Message WhatsApp envoyé avec succès",
  "method": "whatsapp"
}
```

**Résultat attendu** (sans Twilio - mode dev) :
```json
{
  "success": true,
  "message": "SMS simulé - Twilio non configuré",
  "code": "123456",
  "dev_mode": true,
  "method": "sms"
}
```

---

## ✅ Étape 5 : Déployer en production

### **Pour Cloudflare Pages**

Utilise `wrangler` pour définir les secrets en production :

```bash
# Set Account SID
npx wrangler pages secret put TWILIO_ACCOUNT_SID --project-name amanah-go
# Paste: AC12345678901234567890123456789012

# Set Auth Token
npx wrangler pages secret put TWILIO_AUTH_TOKEN --project-name amanah-go
# Paste: your_auth_token

# Set Phone Number (pour SMS)
npx wrangler pages secret put TWILIO_PHONE_NUMBER --project-name amanah-go
# Paste: +33612345678

# Set WhatsApp Number (optionnel)
npx wrangler pages secret put TWILIO_WHATSAPP_NUMBER --project-name amanah-go
# Paste: whatsapp:+14155238886 (Sandbox) ou whatsapp:+33612345678 (Production)
```

Vérifie que les secrets sont bien définis :

```bash
npx wrangler pages secret list --project-name amanah-go
```

---

## 📊 Vérifier les logs Twilio

1. Va dans **Monitor** > **Logs** > **Messaging**
2. Tu verras tous les SMS et messages WhatsApp envoyés avec leur statut :
   - ✅ **Delivered** : Message bien reçu
   - ⏳ **Queued** : En attente d'envoi
   - ❌ **Failed** : Échec (vérifier le numéro ou sandbox)

---

## 📲 Configuration WhatsApp spécifique

### **Option 1 : Twilio Sandbox (Gratuit pour tests)**

1. Va sur https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
2. **Rejoins le Sandbox** :
   - Envoie sur WhatsApp : `join <code-shown>` au numéro `+1 415 523 8886`
   - Tu recevras un message de confirmation
3. **Utilise dans `.dev.vars`** :
   ```env
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```

**⚠️ Limitations du Sandbox** :
- Les utilisateurs doivent d'abord rejoindre le sandbox (envoyer "join <code>")
- Maximum 20 utilisateurs
- Parfait pour développement et tests
- Messages expirent après 24h d'inactivité

### **Option 2 : WhatsApp Business Profile (Production)**

Pour utiliser WhatsApp en production sans limitations :

1. **Configure un WhatsApp Business Profile** : https://www.twilio.com/docs/whatsapp/tutorial/connect-number-business-profile
2. **Demande l'approbation Meta** (peut prendre 3-5 jours)
3. **Utilise ton propre numéro** :
   ```env
   TWILIO_WHATSAPP_NUMBER=whatsapp:+33612345678
   ```

**Avantages Production** :
- ✅ Aucune limitation d'utilisateurs
- ✅ Pas besoin de "join" préalable
- ✅ Messages persistants
- ✅ Branding professionnel

---

## 💰 Coûts Twilio

### **Crédits gratuits**
- **$15 offerts** à l'inscription
- Parfait pour tester SMS et WhatsApp

### **Tarifs SMS**
- **France → France** : ~$0.08/SMS
- **France → Maroc** : ~$0.20/SMS
- **Réception SMS** : Gratuit

### **Tarifs WhatsApp**
- **Messages WhatsApp** : ~$0.005-$0.01/message (beaucoup moins cher que SMS !)
- **Sandbox WhatsApp** : **GRATUIT** pour tests
- **Réception WhatsApp** : Gratuit

### **Numéro de téléphone**
- **Location mensuelle** : ~$1.15/mois (pour SMS)
- **WhatsApp Sandbox** : Gratuit
- **WhatsApp Business Number** : Inclus avec le numéro Twilio

💡 **Astuce** : WhatsApp est ~10x moins cher que les SMS et plus populaire en France/Maroc !

---

## 🔒 Sécurité

### ⚠️ **Important**

1. **JAMAIS commiter** le fichier `.dev.vars` sur Git
2. **Ne partage JAMAIS** ton Auth Token
3. **En production**, retire le `code` de la réponse API (ligne 638 de `index.tsx`)

### 🛡️ **Bonnes pratiques**

1. **Rate limiting** : Limiter à 3 SMS par numéro/heure
2. **Validation numéro** : Vérifier format international (+33...)
3. **Expiration code** : 10 minutes maximum
4. **Stocker le code** en base ou KV avec expiration

---

## 🐛 Dépannage

### **Problème : "Twilio non configuré"**

✅ Vérifie que `.dev.vars` existe et contient les bonnes valeurs  
✅ Redémarre l'application : `pm2 restart amanah-go`

### **Problème : "Échec envoi SMS"**

✅ Vérifie que le numéro est au format international (+33...)  
✅ Vérifie que ton compte Twilio a des crédits  
✅ Vérifie les logs dans Console Twilio

### **Problème : "SMS non reçu"**

✅ Attends 1-2 minutes (parfois lent)  
✅ Vérifie que le numéro est correct  
✅ Vérifie les logs Twilio (Monitor > Logs)

### **Problème : "WhatsApp non reçu"**

✅ **Sandbox** : L'utilisateur doit d'abord rejoindre le sandbox (envoyer "join <code>")  
✅ Vérifie que le numéro WhatsApp est actif  
✅ Le numéro doit être au format international avec prefix `whatsapp:` (ex: `whatsapp:+33612345678`)  
✅ Vérifie les logs Twilio pour voir les erreurs

### **Problème : "Invalid 'To' Phone Number"**

✅ Pour WhatsApp Sandbox : Le destinataire doit avoir rejoint le sandbox  
✅ Pour Production : Vérifie que ton WhatsApp Business Profile est approuvé  
✅ Format du numéro : `whatsapp:+33612345678` (avec prefix "whatsapp:")

---

## 📚 Ressources

- **Documentation Twilio SMS** : https://www.twilio.com/docs/sms
- **Documentation Twilio WhatsApp** : https://www.twilio.com/docs/whatsapp
- **WhatsApp Sandbox** : https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
- **API Reference** : https://www.twilio.com/docs/sms/api
- **Console Twilio** : https://console.twilio.com
- **Support** : https://support.twilio.com

---

**Voilà ! Tu peux maintenant envoyer de vrais SMS et messages WhatsApp via Twilio. 🎉**
