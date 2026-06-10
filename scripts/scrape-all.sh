#!/usr/bin/env bash
# ReelSaga — full production scrape
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
python3 -m scraper "$@"
