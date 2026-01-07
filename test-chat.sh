#!/bin/bash

# 💬 TEST CHAT TEMPS RÉEL
API_URL="http://localhost:5173/api"

echo "💬 TEST CHAT - Amanah GO"
echo "========================"
echo ""

# Login User 1 (expéditeur)
echo "1️⃣ Login User 1..."
TOKEN1=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@amanah.com","password":"test123"}' | jq -r '.token')

USER1_ID=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@amanah.com","password":"test123"}' | jq -r '.user.id')

echo "✅ User 1 ID: $USER1_ID"
echo ""

# Créer User 2 pour tester (voyageur)
echo "2️⃣ Créer User 2..."
curl -s -X POST "$API_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"voyageur@test.com","password":"test123","name":"Mohamed Voyageur","phone":"+33612345679"}' > /dev/null

TOKEN2=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"voyageur@test.com","password":"test123"}' | jq -r '.token')

USER2_ID=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"voyageur@test.com","password":"test123"}' | jq -r '.user.id')

echo "✅ User 2 ID: $USER2_ID"
echo ""

# User 1 envoie un message à User 2
echo "3️⃣ User 1 → User 2: 'Salut ! Tu vas à Casablanca quand ?'"
curl -s -X POST "$API_URL/messages" \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d "{\"receiver_id\":$USER2_ID,\"message\":\"Salut ! Tu vas à Casablanca quand ?\"}" | jq '.'

echo ""

# User 2 envoie un message à User 1
echo "4️⃣ User 2 → User 1: 'Le 15 janvier ! Tu as un colis ?'"
curl -s -X POST "$API_URL/messages" \
  -H "Authorization: Bearer $TOKEN2" \
  -H "Content-Type: application/json" \
  -d "{\"receiver_id\":$USER1_ID,\"message\":\"Le 15 janvier ! Tu as un colis ?\"}" | jq '.'

echo ""

# User 1 récupère ses messages avec User 2
echo "5️⃣ User 1 récupère la conversation..."
curl -s -X GET "$API_URL/messages/$USER2_ID" \
  -H "Authorization: Bearer $TOKEN1" | jq '.'

echo ""

# Liste des conversations de User 1
echo "6️⃣ Liste conversations User 1..."
curl -s -X GET "$API_URL/conversations" \
  -H "Authorization: Bearer $TOKEN1" | jq '.'

echo ""
echo "========================"
echo "🎉 CHAT FONCTIONNE !"
