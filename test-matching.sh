#!/bin/bash

# Test API Matching Intelligent - Amanah GO
# Score 0-100 pour connexion voyageurs/expéditeurs

BASE_URL="http://localhost:3000"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  # Remplacer par vrai token

echo "🔍 TEST API MATCHING INTELLIGENT"
echo "================================"
echo ""

# Test 1: Matching Trips for Package (Expéditeur cherche voyageur)
echo "📦 TEST 1: Trouver trajets compatibles pour un colis"
echo "Paramètres: Paris → Casablanca, 8kg, date 2025-01-15, max 10€/kg"
echo ""

curl -X GET "$BASE_URL/api/matches/trips-for-package?\
origin=Paris&\
destination=Casablanca&\
weight=8&\
departure_date=2025-01-15&\
max_price=10&\
flexible_dates=true" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -s | jq '.'

echo ""
echo "----------------------------------------"
echo ""

# Test 2: Matching Packages for Trip (Voyageur cherche colis)
echo "✈️ TEST 2: Trouver colis compatibles pour un trajet"
echo "Paramètres: Paris → Casablanca, 15kg dispo, 8€/kg, date 2025-01-15"
echo ""

curl -X GET "$BASE_URL/api/matches/packages-for-trip?\
origin=Paris&\
destination=Casablanca&\
available_weight=15&\
price_per_kg=8&\
departure_date=2025-01-15&\
flexible_dates=true" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -s | jq '.'

echo ""
echo "----------------------------------------"
echo ""

# Test 3: Matching avec dates strictes (pas flexible)
echo "📅 TEST 3: Matching avec date stricte (non flexible)"
echo "Paramètres: Lyon → Marrakech, 10kg, date exacte 2025-01-20"
echo ""

curl -X GET "$BASE_URL/api/matches/trips-for-package?\
origin=Lyon&\
destination=Marrakech&\
weight=10&\
departure_date=2025-01-20&\
max_price=12&\
flexible_dates=false" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -s | jq '.'

echo ""
echo "----------------------------------------"
echo ""

# Test 4: Analyse des scores de matching
echo "📊 TEST 4: Analyse détaillée des scores de matching"
echo ""

RESPONSE=$(curl -X GET "$BASE_URL/api/matches/trips-for-package?\
origin=Paris&\
destination=Casablanca&\
weight=8&\
departure_date=2025-01-15&\
max_price=10&\
flexible_dates=true" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -s)

echo "$RESPONSE" | jq '.matches[] | {
  trip_id: .id,
  traveler: .traveler_name,
  score: .match_score,
  quality: .match_quality,
  price_per_kg: .price_per_kg,
  available_weight: .available_weight,
  total_cost: .total_cost,
  kyc_verified: .traveler_kyc,
  rating: .traveler_rating
}'

echo ""
echo "----------------------------------------"
echo ""

# Test 5: Matching avec budget limité
echo "💰 TEST 5: Matching avec budget limité (max 5€/kg)"
echo ""

curl -X GET "$BASE_URL/api/matches/trips-for-package?\
origin=Paris&\
destination=Casablanca&\
weight=5&\
departure_date=2025-01-15&\
max_price=5&\
flexible_dates=true" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -s | jq '.matches | length as $count | {
  total_matches: $count,
  best_match: (.[0] | {
    score: .match_score,
    quality: .match_quality,
    price: .price_per_kg,
    total_cost: .total_cost
  })
}'

echo ""
echo "✅ Tests de matching terminés !"
echo ""
echo "📋 Critères de scoring (0-100):"
echo "  - Poids disponible optimal: +20 points"
echo "  - Prix compétitif: +15 points"
echo "  - KYC vérifié: +15 points"
echo "  - Date exacte: +15 points"
echo "  - Rating élevé (4.5+): +10 points"
echo "  - Expérience (10+ trajets): +5 points"
echo ""
echo "📈 Qualité du match:"
echo "  - Excellent: score >= 90"
echo "  - Good: score >= 75"
echo "  - Fair: score >= 60"
echo "  - Low: score < 60"
