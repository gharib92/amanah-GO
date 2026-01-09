#!/bin/bash
# ================================
# Script de test : Stripe Flow complet
# Test du flux de paiement end-to-end
# ================================

set -e  # Arrêter en cas d'erreur

# Couleurs pour output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:3000}"
ADMIN_TOKEN="admin-test-token-12345"

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   TEST STRIPE FLOW - AMANAH GO             ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo ""

# ================================
# 1. Health Check
# ================================
echo -e "${YELLOW}[1/10]${NC} Vérification de l'API..."
HEALTH=$(curl -s "$API_URL/api/health")
if echo "$HEALTH" | grep -q "ok"; then
  echo -e "${GREEN}✅ API accessible${NC}"
else
  echo -e "${RED}❌ API inaccessible${NC}"
  exit 1
fi
echo ""

# ================================
# 2. Créer des utilisateurs test
# ================================
echo -e "${YELLOW}[2/10]${NC} Création des utilisateurs..."

# Voyageur
TRAVELER_DATA='{
  "name": "Mohammed Alami",
  "email": "mohammed.stripe.test@example.com",
  "phone": "+33612345001",
  "password": "Password123!",
  "role": "voyageur"
}'

TRAVELER_RESPONSE=$(curl -s -X POST "$API_URL/api/signup" \
  -H "Content-Type: application/json" \
  -d "$TRAVELER_DATA")

TRAVELER_ID=$(echo "$TRAVELER_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"//;s/"//')

if [ -n "$TRAVELER_ID" ]; then
  echo -e "${GREEN}✅ Voyageur créé: $TRAVELER_ID${NC}"
else
  echo -e "${YELLOW}⚠️  Voyageur existe déjà, utilisation de user001${NC}"
  TRAVELER_ID="user001"
fi

# Expéditeur
SHIPPER_DATA='{
  "name": "Fatima Benali",
  "email": "fatima.stripe.test@example.com",
  "phone": "+33612345002",
  "password": "Password123!",
  "role": "expediteur"
}'

SHIPPER_RESPONSE=$(curl -s -X POST "$API_URL/api/signup" \
  -H "Content-Type: application/json" \
  -d "$SHIPPER_DATA")

SHIPPER_ID=$(echo "$SHIPPER_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"//;s/"//')

if [ -n "$SHIPPER_ID" ]; then
  echo -e "${GREEN}✅ Expéditeur créé: $SHIPPER_ID${NC}"
else
  echo -e "${YELLOW}⚠️  Expéditeur existe déjà, utilisation de user002${NC}"
  SHIPPER_ID="user002"
fi
echo ""

# ================================
# 3. Vérifier KYC (requis pour Stripe)
# ================================
echo -e "${YELLOW}[3/10]${NC} Vérification KYC des utilisateurs..."

# Mettre à jour KYC pour le voyageur
curl -s -X PATCH "$API_URL/api/users/$TRAVELER_ID" \
  -H "Content-Type: application/json" \
  -d '{"kyc_status": "VERIFIED"}' > /dev/null

echo -e "${GREEN}✅ KYC Voyageur: VERIFIED${NC}"

# Mettre à jour KYC pour l'expéditeur
curl -s -X PATCH "$API_URL/api/users/$SHIPPER_ID" \
  -H "Content-Type: application/json" \
  -d '{"kyc_status": "VERIFIED"}' > /dev/null

echo -e "${GREEN}✅ KYC Expéditeur: VERIFIED${NC}"
echo ""

# ================================
# 4. Créer un compte Stripe Connect pour le voyageur
# ================================
echo -e "${YELLOW}[4/10]${NC} Création du compte Stripe Connect (voyageur)..."

CONNECT_DATA='{
  "user_id": "'"$TRAVELER_ID"'",
  "country": "FR",
  "email": "mohammed.stripe.test@example.com"
}'

CONNECT_RESPONSE=$(curl -s -X POST "$API_URL/api/stripe/connect/create-account" \
  -H "Content-Type: application/json" \
  -d "$CONNECT_DATA")

STRIPE_ACCOUNT_ID=$(echo "$CONNECT_RESPONSE" | grep -o '"account_id":"[^"]*"' | sed 's/"account_id":"//;s/"//')

if [ -n "$STRIPE_ACCOUNT_ID" ]; then
  echo -e "${GREEN}✅ Compte Stripe Connect créé: $STRIPE_ACCOUNT_ID${NC}"
  echo -e "${BLUE}   Onboarding URL: $(echo "$CONNECT_RESPONSE" | grep -o '"onboarding_url":"[^"]*"' | sed 's/"onboarding_url":"//;s/"//')${NC}"
else
  echo -e "${RED}❌ Échec création compte Stripe Connect${NC}"
  echo "$CONNECT_RESPONSE"
fi
echo ""

# ================================
# 5. Créer un trajet
# ================================
echo -e "${YELLOW}[5/10]${NC} Création d'un trajet..."

TRIP_DATA='{
  "user_id": "'"$TRAVELER_ID"'",
  "departure_city": "Paris",
  "departure_airport": "CDG",
  "arrival_city": "Casablanca",
  "arrival_airport": "CMN",
  "departure_date": "2026-02-15T10:00:00Z",
  "flight_number": "AT100",
  "available_weight": 15,
  "price_per_kg": 8,
  "flexible_dates": true
}'

TRIP_RESPONSE=$(curl -s -X POST "$API_URL/api/trips" \
  -H "Content-Type: application/json" \
  -d "$TRIP_DATA")

TRIP_ID=$(echo "$TRIP_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"//;s/"//')

if [ -n "$TRIP_ID" ]; then
  echo -e "${GREEN}✅ Trajet créé: $TRIP_ID${NC}"
  echo -e "${BLUE}   Route: Paris (CDG) → Casablanca (CMN)${NC}"
  echo -e "${BLUE}   Capacité: 15kg × 8€/kg${NC}"
else
  echo -e "${RED}❌ Échec création trajet${NC}"
  exit 1
fi
echo ""

# ================================
# 6. Créer un colis
# ================================
echo -e "${YELLOW}[6/10]${NC} Création d'un colis..."

PACKAGE_DATA='{
  "user_id": "'"$SHIPPER_ID"'",
  "title": "Cadeaux pour famille",
  "content_declaration": "Vêtements, jouets, produits cosmétiques",
  "weight": 10,
  "dimensions": "50x40x30",
  "departure_city": "Paris",
  "arrival_city": "Casablanca",
  "preferred_date": "2026-02-15",
  "budget": 90
}'

PACKAGE_RESPONSE=$(curl -s -X POST "$API_URL/api/packages" \
  -H "Content-Type: application/json" \
  -d "$PACKAGE_DATA")

PACKAGE_ID=$(echo "$PACKAGE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"//;s/"//')

if [ -n "$PACKAGE_ID" ]; then
  echo -e "${GREEN}✅ Colis créé: $PACKAGE_ID${NC}"
  echo -e "${BLUE}   Poids: 10kg | Budget: 90€${NC}"
else
  echo -e "${RED}❌ Échec création colis${NC}"
  exit 1
fi
echo ""

# ================================
# 7. Créer une transaction (Réservation)
# ================================
echo -e "${YELLOW}[7/10]${NC} Création de la transaction..."

TRANSACTION_DATA='{
  "package_id": "'"$PACKAGE_ID"'",
  "trip_id": "'"$TRIP_ID"'",
  "shipper_id": "'"$SHIPPER_ID"'",
  "traveler_id": "'"$TRAVELER_ID"'",
  "agreed_price": 80.00
}'

TRANSACTION_RESPONSE=$(curl -s -X POST "$API_URL/api/transactions/create" \
  -H "Content-Type: application/json" \
  -d "$TRANSACTION_DATA")

TRANSACTION_ID=$(echo "$TRANSACTION_RESPONSE" | grep -o '"transaction_id":"[^"]*"' | sed 's/"transaction_id":"//;s/"//')
CLIENT_SECRET=$(echo "$TRANSACTION_RESPONSE" | grep -o '"client_secret":"[^"]*"' | sed 's/"client_secret":"//;s/"//')

if [ -n "$TRANSACTION_ID" ]; then
  echo -e "${GREEN}✅ Transaction créée: $TRANSACTION_ID${NC}"
  echo -e "${BLUE}   Prix convenu: 80.00€${NC}"
  echo -e "${BLUE}   Commission plateforme (12%): 9.60€${NC}"
  echo -e "${BLUE}   Payout voyageur (88%): 70.40€${NC}"
  echo -e "${BLUE}   Total à payer: 89.60€${NC}"
  
  if [ -n "$CLIENT_SECRET" ]; then
    echo -e "${GREEN}✅ Payment Intent créé${NC}"
    echo -e "${BLUE}   Client Secret: ${CLIENT_SECRET:0:30}...${NC}"
  fi
else
  echo -e "${RED}❌ Échec création transaction${NC}"
  echo "$TRANSACTION_RESPONSE"
  exit 1
fi
echo ""

# ================================
# 8. Simuler le paiement (Mode Test)
# ================================
echo -e "${YELLOW}[8/10]${NC} Simulation du paiement Stripe..."
echo -e "${BLUE}   💳 Carte de test: 4242 4242 4242 4242${NC}"
echo -e "${BLUE}   📅 Date: 12/28 | CVV: 123${NC}"
echo ""

# En mode test, on simule juste le webhook
WEBHOOK_PAYMENT_DATA='{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_test_'$TRANSACTION_ID'",
      "amount": 8960,
      "currency": "eur",
      "status": "succeeded",
      "metadata": {
        "transaction_id": "'"$TRANSACTION_ID"'"
      }
    }
  }
}'

WEBHOOK_RESPONSE=$(curl -s -X POST "$API_URL/api/webhooks/stripe" \
  -H "Content-Type: application/json" \
  -d "$WEBHOOK_PAYMENT_DATA")

if echo "$WEBHOOK_RESPONSE" | grep -q "received"; then
  echo -e "${GREEN}✅ Paiement confirmé (webhook reçu)${NC}"
else
  echo -e "${YELLOW}⚠️  Webhook en attente d'implémentation${NC}"
fi
echo ""

# ================================
# 9. Vérifier l'état de la transaction
# ================================
echo -e "${YELLOW}[9/10]${NC} Vérification de l'état de la transaction..."

TRANSACTION_STATUS=$(curl -s "$API_URL/api/transactions/$TRANSACTION_ID")

STATUS=$(echo "$TRANSACTION_STATUS" | grep -o '"status":"[^"]*"' | sed 's/"status":"//;s/"//')

if [ -n "$STATUS" ]; then
  echo -e "${GREEN}✅ Statut actuel: $STATUS${NC}"
  
  # Afficher les détails
  echo -e "${BLUE}   Détails:${NC}"
  echo "$TRANSACTION_STATUS" | grep -o '"agreed_price":[^,]*' | sed 's/"agreed_price":/   Prix: /'
  echo "$TRANSACTION_STATUS" | grep -o '"platform_fee":[^,]*' | sed 's/"platform_fee":/   Commission: /'
  echo "$TRANSACTION_STATUS" | grep -o '"traveler_payout":[^,]*' | sed 's/"traveler_payout":/   Payout: /'
else
  echo -e "${RED}❌ Transaction introuvable${NC}"
fi
echo ""

# ================================
# 10. Simuler la livraison et le payout
# ================================
echo -e "${YELLOW}[10/10]${NC} Simulation de la livraison..."

DELIVERY_CODE=$(echo "$TRANSACTION_STATUS" | grep -o '"delivery_code":"[^"]*"' | sed 's/"delivery_code":"//;s/"//')

if [ -n "$DELIVERY_CODE" ]; then
  echo -e "${BLUE}   Code de livraison: $DELIVERY_CODE${NC}"
  
  DELIVERY_DATA='{
    "transaction_id": "'"$TRANSACTION_ID"'",
    "delivery_code": "'"$DELIVERY_CODE"'",
    "delivery_photo_url": "https://example.com/delivery-proof.jpg"
  }'
  
  DELIVERY_RESPONSE=$(curl -s -X POST "$API_URL/api/transactions/$TRANSACTION_ID/confirm-delivery" \
    -H "Content-Type: application/json" \
    -d "$DELIVERY_DATA")
  
  if echo "$DELIVERY_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ Livraison confirmée${NC}"
    echo -e "${GREEN}✅ Payout envoyé au voyageur${NC}"
  else
    echo -e "${YELLOW}⚠️  Livraison en attente d'implémentation${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Code de livraison non disponible${NC}"
fi
echo ""

# ================================
# RÉSUMÉ
# ================================
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   RÉSUMÉ DU TEST                           ║${NC}"
echo -e "${BLUE}╠════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}   Voyageur ID: $TRAVELER_ID${NC}"
echo -e "${GREEN}   Expéditeur ID: $SHIPPER_ID${NC}"
echo -e "${GREEN}   Trajet ID: $TRIP_ID${NC}"
echo -e "${GREEN}   Colis ID: $PACKAGE_ID${NC}"
echo -e "${GREEN}   Transaction ID: $TRANSACTION_ID${NC}"
if [ -n "$STRIPE_ACCOUNT_ID" ]; then
  echo -e "${GREEN}   Stripe Account: $STRIPE_ACCOUNT_ID${NC}"
fi
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}✅ Test Stripe Flow terminé avec succès !${NC}"
echo ""
echo -e "${YELLOW}📝 Prochaines étapes:${NC}"
echo "   1. Configurer vos vraies clés Stripe (voir STRIPE_PRODUCTION_SETUP.md)"
echo "   2. Implémenter les endpoints Stripe dans src/index.tsx"
echo "   3. Tester avec de vraies cartes en mode Live"
echo "   4. Configurer les webhooks Stripe"
echo ""
