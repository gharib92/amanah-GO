#!/usr/bin/env bash
# test-kyc.sh - Script simple pour tester le flow KYC (create-session + get status)
# Usage:
#   API_URL="http://localhost:3000" BEARER_TOKEN="<JWT>" ./test-kyc.sh
# Notes pour débutant:
# - Le script utilise "curl" et "jq" (jq facilite la lecture du JSON). Si vous n'avez pas jq,
#   installez-le (macOS: brew install jq).
# - Vous devez fournir un JWT valide via la variable d'environnement BEARER_TOKEN
#   (ou modifier le script pour insérer directement le token, pas recommandé).

set -euo pipefail

API_URL="${API_URL:-http://localhost:3000}"
TOKEN="${BEARER_TOKEN:-}"

if [ -z "$TOKEN" ]; then
  echo "✋ ERREUR: définissez la variable d'environnement BEARER_TOKEN avec un JWT valide."
  echo "Ex: BEARER_TOKEN=eyJ... API_URL=http://localhost:3000 ./test-kyc.sh"
  exit 1
fi

echo "🔍 Tester create-session sur $API_URL"

# 1) Créer une session KYC
CREATE_RESP=$(curl -s -X POST "$API_URL/api/kyc/create-session" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}')

# Afficher la réponse brute (utile pour debug)
echo "Réponse create-session:"
echo "$CREATE_RESP" | jq '.' || echo "$CREATE_RESP"

# Extraire l'id de session
SESSION_ID=$(echo "$CREATE_RESP" | jq -r '.session.id // empty')

if [ -z "$SESSION_ID" ]; then
  echo "❌ Impossible de récupérer session.id. Vérifiez la réponse ci‑dessus."
  exit 2
fi

echo "✅ Session créée: $SESSION_ID"

# 2) Poller le statut (max 10 attempts, 2s entre chaque)
ATTEMPTS=0
MAX=10
while [ $ATTEMPTS -lt $MAX ]; do
  echo "🔁 Vérification du statut (tentative $((ATTEMPTS+1))/$MAX)..."
  STATUS_RESP=$(curl -s "$API_URL/api/kyc/status/$SESSION_ID")
  echo "$STATUS_RESP" | jq '.' || echo "$STATUS_RESP"

  STATUS=$(echo "$STATUS_RESP" | jq -r '.status // empty')
  SCORE=$(echo "$STATUS_RESP" | jq -r '.score // empty')

  if [ -n "$STATUS" ] && [ "$STATUS" != "PENDING" ]; then
    echo "✅ Statut final: $STATUS (score: ${SCORE:-n/a})"
    exit 0
  fi

  ATTEMPTS=$((ATTEMPTS+1))
  sleep 2
done

echo "⌛ Statut toujours PENDING après $MAX tentatives. Vous pouvez retenter plus tard ou forcer une vérification côté serveur."
exit 0
