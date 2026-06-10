#!/usr/bin/env bash
# Decode APK with apktool (optional — regenerates analysis/apktool/)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APK="${1:-$ROOT/artifacts/reelsaga.apk}"
OUT="$ROOT/analysis/apktool"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

command -v apktool >/dev/null || { echo "Install apktool first"; exit 1; }
unzip -q -o "$APK" -d "$TMP"
BASE="$TMP/in.reelsaga.android.apk"
[[ -f "$BASE" ]] || BASE="$APK"
rm -rf "$OUT"
apktool d -f -o "$OUT" "$BASE"
echo "Decoded to $OUT"
