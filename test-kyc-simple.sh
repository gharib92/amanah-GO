#!/bin/bash

# 🤖 TEST KYC SIMPLE
API_URL="http://localhost:5173/api"

echo "🤖 TEST KYC + CLOUDFLARE AI"
echo "============================"
echo ""

# Login
echo "1️⃣ Login..."
TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@amanah.com","password":"test123"}' | jq -r '.token')

USER_ID=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@amanah.com","password":"test123"}' | jq -r '.user.id')

echo "✅ Token: ${TOKEN:0:20}..."
echo "✅ User ID: $USER_ID"
echo ""

# Créer images de test simples
echo "2️⃣ Création images de test..."
echo "test" > /tmp/selfie.jpg
echo "test" > /tmp/id.jpg
echo "✅ Images créées"
echo ""

# Upload KYC
echo "3️⃣ Upload KYC..."
curl -X POST "$API_URL/auth/verify-kyc" \
  -H "Authorization: Bearer $TOKEN" \
  -F "user_id=$USER_ID" \
  -F "selfie=@/tmp/selfie.jpg" \
  -F "id_document=@/tmp/id.jpg" | jq '.'

# Cleanup
rm -f /tmp/selfie.jpg /tmp/id.jpg
