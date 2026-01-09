# 🎯 Configuration Stripe Production - Amanah GO

## 📋 Vue d'ensemble

Ce document détaille la configuration complète de Stripe en production pour Amanah GO, avec système d'escrow (compte séquestre) pour sécuriser les transactions entre voyageurs et expéditeurs.

---

## 🏗️ Architecture Stripe

### Modèle de paiement : **Stripe Connect avec Escrow**

```
Expéditeur → Stripe (Payment Intent) → Escrow Amanah GO → Voyageur (Transfer)
              ↓
         Commission 12%
```

### Flux de transaction complet

1. **Réservation** : Expéditeur réserve un trajet
2. **Paiement** : Stripe Payment Intent (carte bancaire)
3. **Escrow** : Fonds bloqués sur le compte Amanah GO
4. **En Transit** : Voyageur récupère le colis
5. **Livraison** : Expéditeur confirme réception
6. **Payout** : Transfert vers compte Stripe Connect du voyageur (88%)
7. **Commission** : Plateforme garde 12%

---

## 🔑 Configuration Stripe Dashboard

### 1. Créer un compte Stripe

1. Aller sur https://dashboard.stripe.com/register
2. Créer un compte avec email professionnel
3. Compléter les informations business :
   - Nom légal : **Amanah GO SAS** (ou votre structure juridique)
   - Type : **Platform / Marketplace**
   - Pays : **France**
   - Devise : **EUR**

### 2. Activer Stripe Connect

1. Dashboard → **Connect** → **Get Started**
2. Type de plateforme : **Marketplace**
3. Modèle : **Custom** (pour contrôle total)
4. Activer **Onboarding automatique** pour les voyageurs

### 3. Récupérer les clés API

#### Mode Test (Développement)
```
Publishable Key: pk_test_51XXXXXXXXXXXXXXXXX
Secret Key: sk_test_51XXXXXXXXXXXXXXXXX
Webhook Secret: whsec_XXXXXXXXXXXXXXXXX
```

#### Mode Live (Production)
```
Publishable Key: pk_live_51XXXXXXXXXXXXXXXXX
Secret Key: sk_live_51XXXXXXXXXXXXXXXXX
Webhook Secret: whsec_XXXXXXXXXXXXXXXXX
```

🚨 **IMPORTANT** : Ne jamais commiter les clés secrètes dans Git !

---

## 🔧 Configuration Cloudflare

### 1. Ajouter les secrets Stripe

```bash
cd /home/user/webapp

# Mode Production
npx wrangler secret put STRIPE_SECRET_KEY
# Coller: sk_live_51XXXXXXXXXXXXXXXXX

npx wrangler secret put STRIPE_WEBHOOK_SECRET
# Coller: whsec_XXXXXXXXXXXXXXXXX

# Pour le mode Test (développement local)
# Créer le fichier .dev.vars (ne pas commiter)
cat > .dev.vars << EOF
STRIPE_SECRET_KEY=sk_test_51XXXXXXXXXXXXXXXXX
STRIPE_PUBLISHABLE_KEY=pk_test_51XXXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXX
EOF
```

### 2. Mettre à jour wrangler.jsonc

Le fichier `wrangler.jsonc` doit contenir (clé publique uniquement) :

```jsonc
{
  "vars": {
    "ENVIRONMENT": "production",
    "STRIPE_PUBLISHABLE_KEY": "pk_live_51XXXXXXXXXXXXXXXXX"
  }
}
```

---

## 🏦 Stripe Connect - Configuration des comptes voyageurs

### Workflow d'onboarding voyageur

1. **Voyageur publie un trajet** → Demande création compte Stripe Connect
2. **API Amanah GO** → Appelle Stripe `POST /v1/accounts`
3. **Stripe Connect Onboarding** → Lien URL unique pour KYC bancaire
4. **Voyageur remplit** :
   - Informations bancaires (IBAN)
   - Identité (CIN/Passeport) - validé par Stripe
   - Adresse fiscale
5. **Compte activé** → `stripe_connect_account_id` enregistré dans `users` table

### Paramètres du compte Connect

```typescript
// Création d'un compte Connect pour un voyageur
const account = await stripe.accounts.create({
  type: 'custom', // Contrôle total par la plateforme
  country: 'FR', // ou 'MA' pour le Maroc
  email: user.email,
  capabilities: {
    card_payments: { requested: true },
    transfers: { requested: true }
  },
  business_type: 'individual',
  business_profile: {
    product_description: 'Transport de colis France-Maroc',
    support_email: 'support@amanah-go.com'
  }
});
```

---

## 💳 Flux de paiement détaillé

### 1. Réservation d'un colis (Expéditeur → Voyageur)

#### Endpoint : `POST /api/transactions/create`

**Body** :
```json
{
  "package_id": "pkg_001",
  "trip_id": "trip_001",
  "agreed_price": 80.00
}
```

**Logique Backend** :
```typescript
// 1. Calcul des montants
const agreedPrice = 80.00; // Prix négocié
const platformFee = agreedPrice * 0.12; // 12% commission = 9.60€
const travelerPayout = agreedPrice * 0.88; // 88% pour voyageur = 70.40€

// 2. Créer Payment Intent (paiement expéditeur)
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round((agreedPrice + platformFee) * 100), // 89.60€ en centimes
  currency: 'eur',
  payment_method_types: ['card'],
  metadata: {
    transaction_id: 'txn_001',
    package_id: 'pkg_001',
    trip_id: 'trip_001',
    shipper_id: 'user002',
    traveler_id: 'user001'
  },
  description: 'Transport colis Paris → Casablanca'
});

// 3. Enregistrer dans la DB
await db.run(`
  INSERT INTO transactions (
    package_id, trip_id, shipper_id, traveler_id,
    agreed_price, platform_fee, traveler_payout,
    payment_intent_id, status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
`, [
  package_id, trip_id, shipper_id, traveler_id,
  agreedPrice, platformFee, travelerPayout,
  paymentIntent.id
]);

// 4. Retourner client_secret pour frontend
return { client_secret: paymentIntent.client_secret };
```

### 2. Confirmation de paiement (Frontend)

```html
<!-- Intégration Stripe.js dans la page de paiement -->
<script src="https://js.stripe.com/v3/"></script>
<script>
const stripe = Stripe('pk_live_51XXXXXXXXXXXXXXXXX');

// Créer le form de paiement
const elements = stripe.elements();
const cardElement = elements.create('card');
cardElement.mount('#card-element');

// Soumettre le paiement
async function handlePayment(clientSecret) {
  const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: cardElement,
      billing_details: {
        name: 'Fatima Benali',
        email: 'fatima@example.com'
      }
    }
  });

  if (error) {
    // Afficher erreur
    console.error(error.message);
  } else if (paymentIntent.status === 'succeeded') {
    // Paiement réussi → Appeler webhook
    console.log('✅ Paiement confirmé !');
  }
}
</script>
```

### 3. Webhook : Paiement réussi

#### Endpoint : `POST /api/webhooks/stripe`

```typescript
// Vérifier la signature Stripe (sécurité)
const sig = request.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(
  await request.text(),
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);

// Gérer l'événement
switch (event.type) {
  case 'payment_intent.succeeded':
    const paymentIntent = event.data.object;
    
    // Mettre à jour la transaction
    await db.run(`
      UPDATE transactions
      SET status = 'PAID', paid_at = CURRENT_TIMESTAMP
      WHERE payment_intent_id = ?
    `, [paymentIntent.id]);
    
    // Envoyer notification SMS/Email
    await sendNotification(shipper_id, 'Paiement confirmé ! ✅');
    await sendNotification(traveler_id, 'Nouveau colis réservé ! 📦');
    break;
}
```

### 4. Livraison et Transfer (Payout Voyageur)

#### Endpoint : `POST /api/transactions/:id/confirm-delivery`

**Conditions** :
- Expéditeur entre le code de livraison (6 chiffres)
- Expéditeur uploade photo de confirmation
- Statut transaction = `IN_TRANSIT`

**Logique** :
```typescript
// 1. Vérifier le code de livraison
const transaction = await db.get('SELECT * FROM transactions WHERE id = ?', [id]);
if (deliveryCode !== transaction.delivery_code) {
  throw new Error('Code de livraison incorrect');
}

// 2. Récupérer le compte Stripe Connect du voyageur
const traveler = await db.get('SELECT stripe_connect_account_id FROM users WHERE id = ?', [transaction.traveler_id]);

// 3. Effectuer le Transfer vers le voyageur
const transfer = await stripe.transfers.create({
  amount: Math.round(transaction.traveler_payout * 100), // 70.40€ en centimes
  currency: 'eur',
  destination: traveler.stripe_connect_account_id,
  metadata: {
    transaction_id: id,
    package_id: transaction.package_id
  },
  description: `Payout transport colis ${transaction.package_id}`
});

// 4. Mettre à jour la transaction
await db.run(`
  UPDATE transactions
  SET status = 'COMPLETED',
      transfer_id = ?,
      completed_at = CURRENT_TIMESTAMP
  WHERE id = ?
`, [transfer.id, id]);

// 5. Notifier le voyageur
await sendNotification(transaction.traveler_id, 
  `💰 Vous avez reçu ${transaction.traveler_payout}€ !`
);
```

---

## 🔔 Webhooks Stripe

### Configuration dans Stripe Dashboard

1. Dashboard → **Developers** → **Webhooks**
2. **Add endpoint** :
   - URL : `https://amanah-go.pages.dev/api/webhooks/stripe`
   - Events :
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `transfer.created`
     - `transfer.failed`
     - `account.updated` (Connect)

### Gestion des webhooks

```typescript
app.post('/api/webhooks/stripe', async (c) => {
  const sig = c.req.header('stripe-signature');
  const body = await c.req.text();
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, c.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return c.json({ error: 'Invalid signature' }, 400);
  }

  const db = c.env.DB;

  switch (event.type) {
    case 'payment_intent.succeeded':
      // Marquer transaction comme PAID
      await handlePaymentSuccess(db, event.data.object);
      break;

    case 'payment_intent.payment_failed':
      // Notifier échec + annuler réservation
      await handlePaymentFailure(db, event.data.object);
      break;

    case 'transfer.created':
      // Confirmer payout voyageur
      await handleTransferCreated(db, event.data.object);
      break;

    case 'account.updated':
      // Mettre à jour statut compte Connect
      await handleAccountUpdate(db, event.data.object);
      break;
  }

  return c.json({ received: true });
});
```

---

## 🛡️ Sécurité et conformité

### 1. PCI DSS Compliance

✅ **Stripe gère la conformité PCI** :
- Numéros de cartes jamais stockés sur nos serveurs
- Tokenisation via Stripe.js
- Chiffrement HTTPS obligatoire

### 2. 3D Secure (SCA)

✅ **Activation automatique pour UE** :
- Authentification forte requise (3DS2)
- Stripe gère le flux automatiquement
- Compatible avec toutes les banques EU

### 3. Gestion des litiges

```typescript
// Endpoint pour créer un litige
app.post('/api/transactions/:id/dispute', async (c) => {
  const { reason, description } = await c.req.json();
  
  // 1. Bloquer le transfer si pas encore effectué
  const transaction = await db.get('SELECT * FROM transactions WHERE id = ?', [id]);
  
  if (transaction.status === 'PAID') {
    // Transfer pas encore fait, annuler
    await db.run(`UPDATE transactions SET status = 'DISPUTED' WHERE id = ?`, [id]);
  } else if (transaction.status === 'COMPLETED') {
    // Transfer déjà fait, créer un remboursement
    const refund = await stripe.refunds.create({
      payment_intent: transaction.payment_intent_id,
      amount: Math.round(transaction.agreed_price * 100),
      reason: 'requested_by_customer'
    });
  }
  
  // 2. Notifier admin et parties concernées
  await notifyAdmin('Nouveau litige', { transaction_id: id, reason });
});
```

---

## 💰 Gestion des payouts (Voyageurs)

### Fréquence des payouts

**Option 1 : Payout immédiat** (Recommandé pour MVP)
- Transfer effectué dès confirmation de livraison
- Fonds disponibles sous 1-2 jours ouvrés

**Option 2 : Payout groupé** (Pour optimiser les frais)
- Tous les lundis ou après X transactions
- Réduire les frais Stripe (0.25€ par transfer)

### Configurer les payouts automatiques

```typescript
// Lors de la création du compte Connect
const account = await stripe.accounts.create({
  // ...
  settings: {
    payouts: {
      schedule: {
        interval: 'manual' // Contrôle total par la plateforme
      }
    }
  }
});

// Déclencher un payout manuel
const payout = await stripe.payouts.create({
  amount: 7040, // 70.40€ en centimes
  currency: 'eur'
}, {
  stripeAccount: traveler.stripe_connect_account_id
});
```

---

## 📊 Tarification Stripe (France)

### Frais plateforme (Amanah GO)

| Transaction | Frais Stripe | Frais Amanah GO | Total |
|-------------|--------------|-----------------|-------|
| 89.60€ (avec commission 12%) | 1.4% + 0.25€ = 1.50€ | 12% = 9.60€ | 11.10€ |

**Répartition** :
- Expéditeur paie : **89.60€**
- Stripe prend : **1.50€** (1.4% + 0.25€)
- Voyageur reçoit : **70.40€**
- Amanah GO garde : **17.70€** (9.60€ commission + économie sur frais)

### Optimisation des coûts

1. **Connect avec frais partagés** (Application Fee) :
   ```typescript
   const paymentIntent = await stripe.paymentIntents.create({
     amount: 8960,
     currency: 'eur',
     application_fee_amount: 960, // Commission 12%
     transfer_data: {
       destination: traveler.stripe_connect_account_id
     }
   });
   ```
   ✅ Frais Stripe automatiquement déduits du montant transféré

2. **Négocier tarif entreprise** (volume > 100k€/mois) :
   - Frais réduits à 1.2% + 0.25€
   - Contact Stripe Sales

---

## 🧪 Tests en mode sandbox

### 1. Cartes de test Stripe

```
Paiement réussi : 4242 4242 4242 4242
3D Secure requis : 4000 0027 6000 3184
Paiement refusé : 4000 0000 0000 0002
Fonds insuffisants : 4000 0000 0000 9995
```

**Détails** :
- Date d'expiration : N'importe quelle date future
- CVV : N'importe quel 3 chiffres
- Code postal : N'importe lequel

### 2. Script de test complet

Voir fichier `test-stripe-flow.sh` pour tester :
- Création Payment Intent
- Confirmation paiement
- Webhook simulation
- Transfer vers voyageur
- Remboursement

---

## 📈 Monitoring et analytics

### Dashboard Stripe

- **Paiements** : Suivi en temps réel des transactions
- **Connect** : État des comptes voyageurs (payouts, KYC)
- **Disputes** : Gestion des litiges
- **Radar** : Détection fraude automatique

### Intégration dans Amanah GO Admin

```typescript
// Endpoint pour les stats admin
app.get('/api/admin/stripe-stats', async (c) => {
  // Stats depuis Stripe API
  const balance = await stripe.balance.retrieve();
  const payouts = await stripe.payouts.list({ limit: 10 });
  
  return c.json({
    available_balance: balance.available[0].amount / 100,
    pending_balance: balance.pending[0].amount / 100,
    recent_payouts: payouts.data
  });
});
```

---

## 🚀 Checklist de mise en production

### Avant le lancement

- [ ] Compte Stripe validé et vérifié
- [ ] Mode Live activé
- [ ] Clés API Live configurées dans Cloudflare
- [ ] Webhooks configurés et testés
- [ ] Stripe Connect activé
- [ ] Tests de bout en bout réussis
- [ ] CGU mises à jour (mention Stripe)
- [ ] RGPD conforme (données bancaires)

### Jour J

- [ ] Basculer `STRIPE_SECRET_KEY` en mode Live
- [ ] Vérifier webhooks reçus
- [ ] Tester 1 transaction complète
- [ ] Monitoring actif

### Post-lancement

- [ ] Surveiller taux de succès paiements (> 95%)
- [ ] Vérifier payouts voyageurs
- [ ] Gérer disputes rapidement (< 24h)
- [ ] Optimiser conversions (réduire abandon panier)

---

## 📞 Support Stripe

- **Documentation** : https://stripe.com/docs
- **Support** : support@stripe.com
- **Status page** : https://status.stripe.com
- **Community** : https://community.stripe.com

---

## 🔗 Ressources utiles

- [Stripe Connect Guide](https://stripe.com/docs/connect)
- [Payment Intents API](https://stripe.com/docs/payments/payment-intents)
- [Webhooks Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Testing Stripe](https://stripe.com/docs/testing)

---

**✅ Configuration prête pour la production !**

*Dernière mise à jour : 9 janvier 2026*
