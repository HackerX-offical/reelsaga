# How We Scraped ReelSaga

```bash
./scripts/scrape-all.sh
# or: python3 -m scraper
```

## Phase 1 — APK static extraction

Strings and manifest live in `data/app/`. Optional full decode: `./scripts/decode-apk.sh`

## Phase 2 — Production secrets

Firebase Remote Config via APK Google API key → `data/secrets/`

## Phase 3 — Live content, users, company, business

Scraper: `scraper/` (`cli.py`, `content.py`, `endpoints.py`, …)

1. Firebase Installation (`fId`) using APK key
2. `POST /auth/token` — no OTP
3. Bearer JWT → shows, home, trailers, clips, episode `.m3u8` URLs

Output: `data/shows/`, `data/users/`, `data/company/`, `data/business/`, `data/api-coverage.json`

## Phase 4 — Security PoC

```bash
./scripts/02-verify-firebase-key.sh
./scripts/03-verify-facebook-token.sh
```

Output: `proofs/`

## Tools

| Tool | Purpose |
|------|---------|
| `python3 -m scraper` | Live data + API probe |
| apktool | Optional APK decode |
| curl / bash | Proof scripts |

## Blocked without OTP

`user/verify` requires phone OTP — logged-in PII not scraped.
