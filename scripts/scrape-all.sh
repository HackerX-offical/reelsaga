#!/usr/bin/env bash
# ReelSaga — full production scrape
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PYTHONPATH="$ROOT/scraper${PYTHONPATH:+:$PYTHONPATH}"
python3 -m reelsaga_scraper "$@"
