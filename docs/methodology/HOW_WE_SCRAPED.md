# How We Scraped ReelSaga

## One command

```bash
./scripts/scrape-all.sh
# or: PYTHONPATH=scraper python3 -m reelsaga_scraper
```

## Phase 1 — APK static extraction

```bash
./scripts/decode-apk.sh artifacts/reelsaga.apk   # optional (~200MB)
./scripts/01-extract-secrets-from-apk.sh
```

Output: `data/app/embedded/` (strings, manifests, assets)

## Phase 2 — Production secrets

Firebase Remote Config via APK Google API key → `data/secrets/remote-config/`

## Phase 3 — Live content, users, company, business

Scraper package: `scraper/reelsaga_scraper/`

1. Create Firebase Installation (`fId`) using APK key
2. `POST /auth/token` with `fId` + `aId` — no OTP
3. Bearer JWT → home, trailers, clips, show details, episode `.m3u8` URLs

Output: `data/content/shows/{id}-{slug}.json`, `data/users/`, `data/company/`, `data/business/`, `data/media/`

## Phase 4 — Security PoC

```bash
./scripts/02-verify-firebase-key.sh
./scripts/03-verify-facebook-token.sh
```

Output: `proofs/`

## Blocked without OTP

`user/verify` requires phone OTP — logged-in user PII and bulk user database not scraped.
