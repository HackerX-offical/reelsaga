#!/usr/bin/env bash
# Extract embedded keys from APK strings into proofs/
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APK="${1:-$ROOT/artifacts/reelsaga.apk}"
OUT_DIR="${2:-$ROOT/proofs/extraction}"
STRINGS="$ROOT/data/app/embedded/strings/strings.xml"
mkdir -p "$OUT_DIR"

if [[ ! -f "$STRINGS" ]]; then
  echo "Missing $STRINGS — run APK string extraction first or use decode-apk.sh"
  exit 1
fi

rg -o 'AIza[0-9A-Za-z_-]{35}' "$STRINGS" | sort -u > "$OUT_DIR/google-api-keys.txt" || true
rg -o '[0-9]{15,16}' "$STRINGS" | sort -u > "$OUT_DIR/facebook-app-ids.txt" || true
echo "Extracted to $OUT_DIR"
