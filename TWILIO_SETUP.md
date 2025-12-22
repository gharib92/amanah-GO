# 📱 Configuration Twilio pour les SMS

## 🎯 Objectif
Envoyer de vrais SMS de vérification aux utilisateurs lors de l'inscription.

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
```

Sauvegarde et redémarre l'application :

```bash
pm2 restart amanah-go
```

---

## ✅ Étape 4 : Tester

### **Test via l'interface web**

1. Va sur `/signup`
2. Remplis le formulaire et clique "S'inscrire"
3. Sur la page de vérification KYC, clique sur "Envoyer le code"
4. **Tu devrais recevoir un SMS** sur le numéro saisi

### **Test via API**

```bash
curl -X POST http://localhost:3000/api/auth/send-sms-verification \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33612345678"}'
```

**Résultat attendu** (avec Twilio configuré) :
```json
{
  "success": true,
  "message": "SMS envoyé avec succès"
}
```

**Résultat attendu** (sans Twilio - mode dev) :
```json
{
  "success": true,
  "message": "SMS simulé - Twilio non configuré",
  "code": "123456",
  "dev_mode": true
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

# Set Phone Number
npx wrangler pages secret put TWILIO_PHONE_NUMBER --project-name amanah-go
# Paste: +33612345678
```

Vérifie que les secrets sont bien définis :

```bash
npx wrangler pages secret list --project-name amanah-go
```

---

## 📊 Vérifier les logs Twilio

1. Va dans **Monitor** > **Logs** > **Messaging**
2. Tu verras tous les SMS envoyés avec leur statut :
   - ✅ **Delivered** : SMS bien reçu
   - ⏳ **Queued** : En attente d'envoi
   - ❌ **Failed** : Échec (vérifier le numéro)

---

## 💰 Coûts Twilio

### **Crédits gratuits**
- **$15 offerts** à l'inscription
- Parfait pour tester

### **Tarifs SMS**
- **France → France** : ~$0.08/SMS
- **France → Maroc** : ~$0.20/SMS
- **Réception SMS** : Gratuit

### **Numéro de téléphone**
- **Location mensuelle** : ~$1.15/mois

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

---

## 📚 Ressources

- **Documentation Twilio SMS** : https://www.twilio.com/docs/sms
- **API Reference** : https://www.twilio.com/docs/sms/api
- **Console Twilio** : https://console.twilio.com
- **Support** : https://support.twilio.com

---

**Voilà ! Tu peux maintenant envoyer de vrais SMS via Twilio. 🎉**
