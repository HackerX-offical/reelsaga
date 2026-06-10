#!/usr/bin/env bash
# Extract embedded keys from APK strings
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STRINGS="$ROOT/data/app/strings.xml"
OUT_DIR="${1:-$ROOT/proofs}"
mkdir -p "$OUT_DIR"

if [[ ! -f "$STRINGS" ]]; then
  echo "Missing $STRINGS"
  exit 1
fi

rg -o 'AIza[0-9A-Za-z_-]{35}' "$STRINGS" | sort -u > "$OUT_DIR/extracted-google-api-keys.txt" || true
rg -o '[0-9]{15,16}' "$STRINGS" | sort -u > "$OUT_DIR/extracted-facebook-app-ids.txt" || true
echo "Extracted to $OUT_DIR"
