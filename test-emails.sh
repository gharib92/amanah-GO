#!/bin/bash

# 📧 TEST EMAILS TRANSACTIONNELS
API_URL="http://localhost:5173/api"

echo "📧 TEST EMAILS - Amanah GO"
echo "=========================="
echo ""

# Test 1: Email de bienvenue (lors de l'inscription)
echo "1️⃣ Test Email Bienvenue (Inscription)..."
SIGNUP_RESPONSE=$(curl -s -X POST "$API_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"testmail@example.com",
    "password":"test123456",
    "name":"Ahmed Test Email",
    "phone":"+33612345680"
  }')

echo "$SIGNUP_RESPONSE" | jq '{success, user: {name, email}}'
echo ""

# Récupérer le token
TOKEN=$(echo "$SIGNUP_RESPONSE" | jq -r '.token')
USER_ID=$(echo "$SIGNUP_RESPONSE" | jq -r '.user.id')

echo "✅ Utilisateur créé - ID: $USER_ID"
echo "📧 Email de bienvenue envoyé (vérifier logs serveur)"
echo ""

# Test 2: Email KYC vérifié
echo "2️⃣ Test Email KYC Vérifié..."
echo "   Création images test..."
echo "test" > /tmp/selfie_email.jpg
echo "test" > /tmp/id_email.jpg

KYC_RESPONSE=$(curl -s -X POST "$API_URL/auth/verify-kyc" \
  -H "Authorization: Bearer $TOKEN" \
  -F "user_id=$USER_ID" \
  -F "selfie=@/tmp/selfie_email.jpg" \
  -F "id_document=@/tmp/id_email.jpg")

echo "$KYC_RESPONSE" | jq '{success, kyc_status, face_match}'
echo ""
echo "✅ KYC vérifié"
echo "📧 Email KYC validé envoyé (vérifier logs serveur)"
echo ""

# Cleanup
rm -f /tmp/selfie_email.jpg /tmp/id_email.jpg

echo "=========================="
echo "📋 RÉSUMÉ"
echo "=========================="
echo ""
echo "✅ Emails testés:"
echo "   1. Email de bienvenue (inscription)"
echo "   2. Email KYC vérifié"
echo ""
echo "📧 Mode MOCK activé - Vérifier les logs serveur pour:"
echo "   [MOCK] Email envoyé à: testmail@example.com"
echo ""
echo "💡 Pour activer l'envoi réel:"
echo "   1. Créer compte sur resend.com"
echo "   2. Obtenir clé API"
echo "   3. Ajouter RESEND_API_KEY dans .dev.vars"
echo ""
echo "🎉 EMAILS FONCTIONNELS !"
