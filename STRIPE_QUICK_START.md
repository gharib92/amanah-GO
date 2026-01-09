# 🚀 Stripe - Guide de démarrage rapide

## 🎯 Configuration en 5 minutes

### 1️⃣ Créer un compte Stripe

```bash
# Ouvrir dans le navigateur
https://dashboard.stripe.com/register
```

**Informations à fournir :**
- Email professionnel
- Pays : **France**
- Type de business : **Marketplace / Platform**
- Nom légal de l'entreprise

---

### 2️⃣ Activer Stripe Connect

1. Dashboard → **Connect** → **Get Started**
2. Choisir **Custom** (contrôle total)
3. Activer **Standard account onboarding**

---

### 3️⃣ Récupérer les clés API

#### En mode TEST (pour développement)

Dashboard → **Developers** → **API Keys**

```bash
# Copier ces clés :
Publishable key: pk_test_YOUR_KEY_HERE
Secret key: sk_test_YOUR_KEY_HERE
```

#### En mode LIVE (pour production)

Basculer en mode **Live** (toggle en haut à droite)

```bash
# Copier ces clés :
Publishable key: pk_live_YOUR_KEY_HERE
Secret key: sk_live_YOUR_KEY_HERE
```

---

### 4️⃣ Installer dans le projet

```bash
cd /home/user/webapp

# Créer le fichier .dev.vars (mode TEST)
cat > .dev.vars << 'EOF'
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
EOF

# IMPORTANT : Ne jamais commiter ce fichier !
echo ".dev.vars" >> .gitignore
```

---

### 5️⃣ Configurer pour production (Cloudflare)

```bash
# Ajouter les secrets Stripe (mode LIVE)
npx wrangler secret put STRIPE_SECRET_KEY
# Coller: sk_live_YOUR_LIVE_SECRET_KEY_HERE

npx wrangler secret put STRIPE_WEBHOOK_SECRET
# Coller: whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Mettre à jour `wrangler.jsonc` (clé publique uniquement) :

```jsonc
{
  "vars": {
    "STRIPE_PUBLISHABLE_KEY": "pk_live_YOUR_LIVE_PUBLISHABLE_KEY_HERE"
  }
}
```

---

### 6️⃣ Configurer les webhooks

Dashboard → **Developers** → **Webhooks** → **Add endpoint**

**URL du endpoint :**
```
https://amanah-go.pages.dev/api/webhooks/stripe
```

**Événements à écouter :**
- ✅ `payment_intent.succeeded`
- ✅ `payment_intent.payment_failed`
- ✅ `transfer.created`
- ✅ `transfer.failed`
- ✅ `account.updated`

**Copier le Webhook Secret** (commence par `whsec_...`)

---

## 🧪 Tester l'intégration

### Appliquer la migration SQL

```bash
cd /home/user/webapp

# En local
npx wrangler d1 execute amanah-go-db --local --file=migrations/0007_stripe_integration.sql

# En production
npx wrangler d1 execute amanah-go-db --remote --file=migrations/0007_stripe_integration.sql
```

### Lancer le test automatique

```bash
cd /home/user/webapp
./test-stripe-flow.sh
```

Ce script teste :
- ✅ Création d'utilisateurs
- ✅ KYC vérifié
- ✅ Création compte Stripe Connect
- ✅ Publication trajet + colis
- ✅ Création transaction
- ✅ Payment Intent
- ✅ Webhook simulation
- ✅ Payout voyageur

---

## 💳 Cartes de test Stripe

```
✅ Paiement réussi
Numéro: 4242 4242 4242 4242
Date: 12/28 | CVV: 123

✅ 3D Secure requis
Numéro: 4000 0027 6000 3184
Date: 12/28 | CVV: 123

❌ Paiement refusé
Numéro: 4000 0000 0000 0002
Date: 12/28 | CVV: 123

❌ Fonds insuffisants
Numéro: 4000 0000 0000 9995
Date: 12/28 | CVV: 123
```

---

## 📊 Calcul des montants

**Exemple : Colis 10kg × 8€/kg = 80€**

| Montant | Calcul | Résultat |
|---------|--------|----------|
| Prix convenu | 80€ | **80.00€** |
| Commission plateforme (12%) | 80 × 0.12 | **9.60€** |
| Payout voyageur (88%) | 80 × 0.88 | **70.40€** |
| **Total expéditeur** | 80 + 9.60 | **89.60€** |
| Frais Stripe (1.4% + 0.25€) | 89.60 × 0.014 + 0.25 | **1.50€** |
| **Net plateforme** | 9.60 - 1.50 | **8.10€** |

---

## 🔧 Endpoints API à implémenter

### 1. Créer compte Stripe Connect

```
POST /api/stripe/connect/create-account
Body: { user_id, country, email }
Response: { account_id, onboarding_url }
```

### 2. Créer Payment Intent

```
POST /api/transactions/create
Body: { package_id, trip_id, agreed_price }
Response: { transaction_id, client_secret, amount }
```

### 3. Webhook Stripe

```
POST /api/webhooks/stripe
Header: stripe-signature
Body: Stripe Event JSON
Response: { received: true }
```

### 4. Confirmer livraison & Payout

```
POST /api/transactions/:id/confirm-delivery
Body: { delivery_code, delivery_photo_url }
Response: { success: true, transfer_id, payout_amount }
```

---

## 🛡️ Sécurité

### ✅ Bonnes pratiques

1. **Ne jamais** exposer la Secret Key dans le frontend
2. **Toujours** vérifier la signature des webhooks
3. **Utiliser** HTTPS pour tous les endpoints
4. **Logger** tous les événements Stripe (table `stripe_events`)
5. **Valider** les montants côté serveur (jamais côté client)

### ✅ Validation webhook

```typescript
const sig = request.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(
  body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

---

## 📈 Mode Production - Checklist

Avant de passer en LIVE :

- [ ] Compte Stripe vérifié et approuvé
- [ ] Informations bancaires ajoutées
- [ ] Mode Live activé dans le dashboard
- [ ] Clés Live configurées dans Cloudflare (`wrangler secret put`)
- [ ] Webhooks configurés avec URL production
- [ ] Migration SQL appliquée en production
- [ ] Tests end-to-end réussis en mode Test
- [ ] CGU mises à jour (mention Stripe)
- [ ] Première transaction test en mode Live

---

## 🔗 Liens utiles

- **Dashboard Stripe** : https://dashboard.stripe.com
- **Documentation** : https://stripe.com/docs
- **API Reference** : https://stripe.com/docs/api
- **Connect Guide** : https://stripe.com/docs/connect
- **Testing** : https://stripe.com/docs/testing
- **Status** : https://status.stripe.com
- **Support** : support@stripe.com

---

## 💡 Aide rapide

### Problème : "Invalid API Key"

```bash
# Vérifier que la clé est bien configurée
npx wrangler secret list

# Reconfigurer si nécessaire
npx wrangler secret put STRIPE_SECRET_KEY
```

### Problème : "Webhook signature verification failed"

```bash
# Vérifier que le webhook secret est correct
# Dashboard → Developers → Webhooks → [Votre endpoint] → Signing secret
npx wrangler secret put STRIPE_WEBHOOK_SECRET
```

### Problème : "Account not found"

```bash
# Vérifier que le compte Connect existe
curl https://api.stripe.com/v1/accounts/acct_xxx \
  -u sk_test_YOUR_KEY_HERE:
```

---

## 📞 Support Amanah GO

Pour toute question sur l'intégration Stripe :
1. Consulter `STRIPE_PRODUCTION_SETUP.md` (guide complet)
2. Vérifier les logs : `pm2 logs amanah-go --nostream`
3. Tester avec `./test-stripe-flow.sh`
4. Consulter la documentation Stripe : https://stripe.com/docs

---

**✅ Configuration Stripe prête !**

*Guide mis à jour : 9 janvier 2026*
