#!/usr/bin/env bash
# Verify Firebase API key from APK works outside the app
set -euo pipefail

API_KEY="${GOOGLE_API_KEY:-AIzaSyBwKRNfSG-VXWiWVkD0pFG7PW6dcY8MMzM}"
APP_ID="${GOOGLE_APP_ID:-1:544458187694:android:d8ae8c1fbdcf21fc571e3f}"
PROJECT_ID="${FIREBASE_PROJECT:-reel-saga-app}"
OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/security-poc/firebase"
mkdir -p "$OUT_DIR"

FID="proof-$(date +%s)-$$"
HTTP_CODE=$(curl -sS -w "%{http_code}" -o "$OUT_DIR/live-installations-response.json" \
  -X POST "https://firebaseinstallations.googleapis.com/v1/projects/${PROJECT_ID}/installations" \
  -H "Content-Type: application/json" \
  -H "x-goog-api-key: ${API_KEY}" \
  -d "{\"fid\":\"${FID}\",\"authVersion\":\"FIS_v2\",\"appId\":\"${APP_ID}\",\"sdkVersion\":\"o:android security-assessment\"}")

echo "HTTP $HTTP_CODE — saved to $OUT_DIR/live-installations-response.json"
[[ "$HTTP_CODE" == "200" ]] && exit 0 || exit 1
