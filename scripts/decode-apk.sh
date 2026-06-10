#!/usr/bin/env bash
# Decode APK with apktool (optional — ~200MB; gitignored)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APK="${1:-$ROOT/artifacts/reelsaga.apk}"
OUT="$ROOT/data/app/decoded"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

command -v apktool >/dev/null || { echo "Install apktool first"; exit 1; }
unzip -q -o "$APK" -d "$TMP"
BASE="$TMP/in.reelsaga.android.apk"
[[ -f "$BASE" ]] || BASE="$APK"
rm -rf "$OUT"
apktool d -f -o "$OUT" "$BASE"
echo "Decoded to $OUT (gitignored)"
