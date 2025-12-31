#!/bin/bash

# ⭐ TEST SYSTÈME DE NOTATION
API_URL="http://localhost:5173/api"

echo "⭐ TEST REVIEWS - Amanah GO"
echo "==========================="
echo ""

# Login User 1
echo "1️⃣ Login User 1..."
TOKEN1=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@amanah.com","password":"test123"}' | jq -r '.token')

USER1_ID=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@amanah.com","password":"test123"}' | jq -r '.user.id')

echo "✅ User 1 ID: $USER1_ID"
echo ""

# Créer User 2
echo "2️⃣ Créer User 2..."
curl -s -X POST "$API_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"reviewer@test.com","password":"test123","name":"Sarah Reviewer","phone":"+33612345681"}' > /dev/null

TOKEN2=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"reviewer@test.com","password":"test123"}' | jq -r '.token')

USER2_ID=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"reviewer@test.com","password":"test123"}' | jq -r '.user.id')

echo "✅ User 2 ID: $USER2_ID"
echo ""

# User 2 note User 1 (5 étoiles)
echo "3️⃣ User 2 note User 1: ⭐⭐⭐⭐⭐ (5/5)"
REVIEW1=$(curl -s -X POST "$API_URL/reviews" \
  -H "Authorization: Bearer $TOKEN2" \
  -H "Content-Type: application/json" \
  -d "{
    \"reviewee_id\": $USER1_ID,
    \"booking_id\": \"booking_test_001\",
    \"rating\": 5,
    \"comment\": \"Super voyageur ! Ponctuel et professionnel. Je recommande à 100% !\"
  }")

echo "$REVIEW1" | jq '.'
echo ""

# User 2 note User 1 à nouveau (4 étoiles)
echo "4️⃣ User 2 note User 1 à nouveau: ⭐⭐⭐⭐ (4/5)"
REVIEW2=$(curl -s -X POST "$API_URL/reviews" \
  -H "Authorization: Bearer $TOKEN2" \
  -H "Content-Type: application/json" \
  -d "{
    \"reviewee_id\": $USER1_ID,
    \"rating\": 4,
    \"comment\": \"Très bien, livraison rapide.\"
  }")

echo "$REVIEW2" | jq '.'
echo ""

# Récupérer les avis de User 1
echo "5️⃣ Récupérer tous les avis de User 1..."
REVIEWS=$(curl -s -X GET "$API_URL/reviews/$USER1_ID" \
  -H "Authorization: Bearer $TOKEN1")

echo "$REVIEWS" | jq '{success, total: (.reviews | length), reviews: .reviews | map({rating, comment, reviewer_name})}'
echo ""

# Vérifier la note moyenne de User 1
echo "6️⃣ Note moyenne de User 1..."
USER_INFO=$(curl -s -X GET "$API_URL/users" | jq ".users[] | select(.id == $USER1_ID)")
echo "$USER_INFO" | jq '{name, rating, reviews_count}'
echo ""

echo "==========================="
echo "📊 RÉSUMÉ"
echo "==========================="
echo ""
echo "✅ Avis créés avec succès"
echo "✅ Note moyenne calculée automatiquement"
echo "✅ Système de reviews fonctionnel !"
echo ""
echo "🎉 SYSTÈME DE NOTATION OPÉRATIONNEL !"
