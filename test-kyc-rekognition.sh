#!/usr/bin/env bash
# test-kyc-rekognition.sh
# Script d'intégration pour tester le flow KYC + Rekognition (mode mock ou réel)
# Usage:
#   API_URL="http://localhost:3000" BEARER_TOKEN="<JWT>" \
#     SELFIE_PATH="./selfie.jpg" DOCUMENT_PATH="./id.jpg" ./test-kyc-rekognition.sh
#
# Ce script réalise:
# 1) GET /api/kyc/diagnostic (vérifie si le serveur a aws_configured)
# 2) POST /api/kyc/create-session (protégé par JWT)
# 3) (optionnel) POST /api/kyc/upload-selfie (multipart)
# 4) (optionnel) POST /api/kyc/upload-document (multipart)
# 5) Poll GET /api/kyc/status/:id jusqu'à avoir un statut final (APPROVED/REJECTED)

set -euo pipefail

API_URL="${API_URL:-http://localhost:3000}"
TOKEN="${BEARER_TOKEN:-}"
SELFIE="${SELFIE_PATH:-}"
DOCUMENT="${DOCUMENT_PATH:-}"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-10}"
SLEEP_SECONDS="${SLEEP_SECONDS:-2}"

if [ -z "$TOKEN" ]; then
  echo "✋ ERREUR: définissez BEARER_TOKEN avec un JWT valide."
  echo "Ex: BEARER_TOKEN=eyJ... API_URL=http://localhost:3000 ./test-kyc-rekognition.sh"
  exit 1
fi

command -v jq >/dev/null 2>&1 || { echo "⚠️ jq non trouvé. Installez jq (brew install jq) pour une sortie JSON lisible."; }

echo "🔍 1) Diagnostic du serveur (vérification si Rekognition est configuré sur le serveur)"
DIAG=$(curl -s -X GET "$API_URL/api/kyc/diagnostic" -H "Authorization: Bearer $TOKEN")
if echo "$DIAG" | jq -e '.success? // true' >/dev/null 2>&1; then
  echo "$DIAG" | jq '.' || echo "$DIAG"
else
  echo "Réponse diagnostic (raw): $DIAG"
fi

AWS_CONFIGURED=$(echo "$DIAG" | jq -r '.environment.aws_configured // empty') || AWS_CONFIGURED=""
if [ "$AWS_CONFIGURED" = "true" ]; then
  echo "✅ Server indicates Rekognition / AWS keys are configured. The script will attempt real Rekognition calls if endpoint triggers them."
else
  echo "ℹ️ Server not configured for AWS Rekognition (server will use mock behavior)."
fi

# 2) create-session
echo "\n🔐 2) Création de la session KYC..."
CREATE_RESP=$(curl -s -X POST "$API_URL/api/kyc/create-session" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{}')
echo "Réponse create-session:"
echo "$CREATE_RESP" | jq '.' || echo "$CREATE_RESP"

SESSION_ID=$(echo "$CREATE_RESP" | jq -r '.session.id // empty')
if [ -z "$SESSION_ID" ]; then
  echo "❌ Impossible de récupérer session.id. Vérifiez la réponse ci‑dessus."
  exit 2
fi

echo "✅ Session créée: $SESSION_ID"

# 3) upload selfie (si fourni)
if [ -n "$SELFIE" ]; then
  if [ ! -f "$SELFIE" ]; then
    echo "⚠️ Selfie file not found: $SELFIE (skipping upload)"
  else
    echo "\n📤 3) Upload selfie: $SELFIE"
    UP_RESP=$(curl -s -X POST "$API_URL/api/kyc/upload-selfie" \
      -H "Authorization: Bearer $TOKEN" \
      -F "session_id=$SESSION_ID" \
      -F "selfie=@$SELFIE")
    echo "$UP_RESP" | jq '.' || echo "$UP_RESP"
  fi
else
  echo "ℹ️ No SELFIE_PATH provided; using existing/mock selfie_url if available."
fi

# 4) upload document (si fourni)
if [ -n "$DOCUMENT" ]; then
  if [ ! -f "$DOCUMENT" ]; then
    echo "⚠️ Document file not found: $DOCUMENT (skipping upload)"
  else
    echo "\n📤 4) Upload document: $DOCUMENT"
    UP_RESP=$(curl -s -X POST "$API_URL/api/kyc/upload-document" \
      -H "Authorization: Bearer $TOKEN" \
      -F "session_id=$SESSION_ID" \
      -F "document=@$DOCUMENT")
    echo "$UP_RESP" | jq '.' || echo "$UP_RESP"
  fi
else
  echo "ℹ️ No DOCUMENT_PATH provided; using existing/mock document_url if available."
fi

# 5) Poll status
echo "\n⏳ 5) Polling status for session $SESSION_ID (max $MAX_ATTEMPTS attempts, $SLEEP_SECONDS s delay)"
ATTEMPTS=0
while [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
  STATUS_RESP=$(curl -s "$API_URL/api/kyc/status/$SESSION_ID")
  echo "$STATUS_RESP" | jq '.' || echo "$STATUS_RESP"

  STATUS=$(echo "$STATUS_RESP" | jq -r '.status // empty')
  SCORE=$(echo "$STATUS_RESP" | jq -r '.score // empty')

  if [ -n "$STATUS" ] && [ "$STATUS" != "PENDING" ]; then
    echo "\n✅ Statut final: $STATUS (score: ${SCORE:-n/a})"
    exit 0
  fi

  ATTEMPTS=$((ATTEMPTS+1))
  sleep $SLEEP_SECONDS
done

echo "⌛ Statut toujours PENDING après $MAX_ATTEMPTS tentatives. Vous pouvez retenter plus tard ou vérifier le serveur." 
exit 0
