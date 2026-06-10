#!/usr/bin/env bash
# Extract embedded secrets from reelsaga.apk
# Usage: ./01-extract-secrets-from-apk.sh [path/to/reelsaga.apk]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APK="${1:-$ROOT/artifacts/reelsaga.apk}"
OUT_DIR="${2:-$ROOT/security-poc/extraction/output}"
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

mkdir -p "$OUT_DIR"

echo "[1/4] Unzipping XAPK/APK..."
unzip -q -o "$APK" -d "$TMP_DIR"
BASE_APK="$TMP_DIR/in.reelsaga.android.apk"
[[ -f "$BASE_APK" ]] || BASE_APK="$APK"

echo "[2/4] Grep strings for known secret patterns..."
strings "$BASE_APK" | rg -i 'AIza[0-9A-Za-z_-]{35}|apps_flyer|facebook_app_id|facebook_client_token|gcm_defaultSenderId|google_app_id' \
  | sort -u > "$OUT_DIR/strings-grep-hits.txt" || true

echo "[3/4] Decode strings.xml with apktool..."
if command -v apktool &>/dev/null; then
  apktool d -f -o "$TMP_DIR/decoded" "$BASE_APK" >/dev/null 2>&1
  if [[ -f "$TMP_DIR/decoded/res/values/strings.xml" ]]; then
    cp "$TMP_DIR/decoded/res/values/strings.xml" "$OUT_DIR/strings.xml"
    rg 'google_api_key|facebook_app_id|facebook_client_token|apps_flyer_key|google_app_id|gcm_defaultSenderId|google_storage_bucket' \
      "$OUT_DIR/strings.xml" > "$OUT_DIR/secrets-snippet.xml" || true
  fi
else
  echo "WARN: apktool not installed"
fi

echo "[4/4] Summary..."
{
  echo "# APK secret extraction"
  echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "Source: $APK"
  echo ""
  cat "$OUT_DIR/strings-grep-hits.txt" 2>/dev/null || echo "(none)"
} > "$OUT_DIR/README.md"

echo "Done. Output: $OUT_DIR"
