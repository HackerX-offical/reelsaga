#!/usr/bin/env bash
# Verify Facebook client token from APK
set -euo pipefail

TOKEN="${FACEBOOK_CLIENT_TOKEN:-}"
APP_ID="${FACEBOOK_APP_ID:-}"
OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/proofs"
mkdir -p "$OUT_DIR"

if [[ -z "$TOKEN" || -z "$APP_ID" ]]; then
  STRINGS="$(cd "$(dirname "$0")/.." && pwd)/data/app/strings.xml"
  if [[ -f "$STRINGS" ]]; then
    APP_ID=$(rg -o 'facebook_app_id">[0-9]+' "$STRINGS" | head -1 | rg -o '[0-9]+' || true)
    TOKEN=$(rg -o 'facebook_client_token">[^<]+' "$STRINGS" | head -1 | sed 's/facebook_client_token">//' || true)
  fi
fi

HTTP_CODE=$(curl -sS -w "%{http_code}" -o "$OUT_DIR/facebook-graph-api-metadata.json" \
  "https://graph.facebook.com/v18.0/${APP_ID}?fields=name,id&access_token=${APP_ID}|${TOKEN}")

echo "HTTP $HTTP_CODE — saved to $OUT_DIR/facebook-graph-api-metadata.json"
[[ "$HTTP_CODE" == "200" ]] && exit 0 || exit 1
