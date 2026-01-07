#!/bin/bash

# 🤖 TEST VÉRIFICATION KYC AVEC CLOUDFLARE AI
# =============================================

API_URL="http://localhost:5173/api"
EMAIL="test@amanah.com"
PASSWORD="test123"

echo "🤖 TEST KYC + CLOUDFLARE AI - Amanah GO"
echo "========================================"
echo ""

# Étape 1: Login
echo "1️⃣ Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
USER_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.user.id')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login échoué"
  exit 1
fi

echo "✅ Token obtenu: ${TOKEN:0:20}..."
echo "✅ User ID: $USER_ID"
echo ""

# Étape 2: Créer des images de test (simulées)
echo "2️⃣ Préparation des images de test..."

# Créer un fichier selfie de test (1x1 pixel JPEG)
echo -n -e '\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xFF\xDB\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0C\x14\r\x0C\x0B\x0B\x0C\x19\x12\x13\x0F\x14\x1D\x1A\x1F\x1E\x1D\x1A\x1C\x1C $.\x27 \x0C\x0C,),01444\x1F\'\'\x13\x0F\x1F\x1D\x1F\xFF\xC0\x00\x0B\x08\x00\x01\x00\x01\x01\x01\x11\x00\xFF\xC4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xFF\xC4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xFF\xDA\x00\x08\x01\x01\x00\x00?\x00\x7F\x00\xFF\xD9' > /tmp/selfie_test.jpg

# Créer un fichier ID de test (1x1 pixel JPEG)
cp /tmp/selfie_test.jpg /tmp/id_test.jpg

echo "✅ Images de test créées"
echo "   - Selfie: /tmp/selfie_test.jpg"
echo "   - ID: /tmp/id_test.jpg"
echo ""

# Étape 3: Upload KYC avec vérification faciale
echo "3️⃣ Upload documents KYC + Vérification faciale AI..."

KYC_RESPONSE=$(curl -s -X POST "$API_URL/auth/verify-kyc" \
  -H "Authorization: Bearer $TOKEN" \
  -F "user_id=$USER_ID" \
  -F "selfie=@/tmp/selfie_test.jpg" \
  -F "id_document=@/tmp/id_test.jpg")

echo "Response:"
echo "$KYC_RESPONSE" | jq '.'
echo ""

# Extraire les résultats
SUCCESS=$(echo "$KYC_RESPONSE" | jq -r '.success')
KYC_STATUS=$(echo "$KYC_RESPONSE" | jq -r '.kyc_status')
FACE_MATCH=$(echo "$KYC_RESPONSE" | jq -r '.face_match')
SIMILARITY=$(echo "$KYC_RESPONSE" | jq -r '.similarity')

# Résumé
echo "========================================"
echo "📊 RÉSUMÉ VÉRIFICATION KYC"
echo "========================================"

if [ "$SUCCESS" = "true" ]; then
  echo "✅ Upload réussi"
  echo "📋 Statut KYC: $KYC_STATUS"
  
  if [ "$FACE_MATCH" = "true" ]; then
    echo "✅ Visages correspondent ! (Similarité: ${SIMILARITY})"
    echo "🎉 KYC VALIDÉ AUTOMATIQUEMENT PAR L'IA !"
  else
    echo "⚠️  Visages ne correspondent pas assez"
    echo "📋 Vérification manuelle requise"
  fi
else
  echo "❌ Échec de la vérification KYC"
  ERROR=$(echo "$KYC_RESPONSE" | jq -r '.error')
  echo "Erreur: $ERROR"
fi

echo ""
echo "========================================"

# Nettoyage
rm -f /tmp/selfie_test.jpg /tmp/id_test.jpg
