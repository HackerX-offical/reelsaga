# ReelSaga — Security Assessment & Intelligence Toolkit

**Maintained by [HackerX Official](https://github.com/HackerX-offical)** · MIT License · APK v8.5.1 (`in.reelsaga.android`)

End-to-end security assessment of the ReelSaga Android app: live API scraping, APK-derived app intelligence, company/business data, and documented findings with proof-of-exposure scripts.

> **This is not compilable Android app source.** It is an assessment repo with a Python scraper, scraped production data, and APK metadata (strings, manifest, API models). Optional full smali decode: `./scripts/decode-apk.sh` (~200MB, gitignored).

---

## Quick start

```bash
./scripts/scrape-all.sh                    # full scrape → data/
./scripts/scrape-all.sh --only content       # shows, trailers, reels only
PYTHONPATH=scraper python3 -m reelsaga_scraper --help
```

---

## Repository layout

```
reelsaga/
├── LICENSE                         # MIT — HackerX Official
├── pyproject.toml                  # reelsaga-scraper package
├── artifacts/reelsaga.apk          # Source APK (v8.5.1)
│
├── scraper/reelsaga_scraper/       # Python scraper (compile & run)
│   ├── cli.py · client.py
│   └── scrapers/                   # content, users, company, business, secrets
│
├── data/                           # All scraped & static intelligence
│   ├── content/                    # Shows, home, trailers, reels, lists
│   ├── users/                      # Anonymous session, profile, transactions
│   ├── company/                    # Legal entity, Play Store, website
│   ├── business/                   # Pricing, plans, engagement metrics
│   ├── secrets/                    # Firebase Remote Config (live keys)
│   ├── media/                      # Thumbnails, website assets
│   ├── app/                        # APK-derived app intelligence
│   │   ├── embedded/               # strings.xml, manifest, assets
│   │   ├── models/                 # API request/response field index
│   │   └── network/                # API paths, URLs from APK
│   ├── scrape-manifest.json
│   └── SCRAPE_REVIEW.md            # Coverage checklist vs goals
│
├── docs/                           # Architecture, methodology, remediation
│   └── assessment/SECURITY_REPORT.md
├── proofs/                         # Live credential abuse PoCs (curl demos)
└── scripts/                        # scrape-all, decode-apk, verify scripts
```

---

## What gets scraped

| Category | API / source | Output |
|----------|--------------|--------|
| **Content** | Home, shows, episodes, trailers, reels | `data/content/shows/{id}-{slug}.json` + HLS `.m3u8` |
| **Users** | `v1/user`, profile, subscription, transactions | `data/users/` (anonymous JWT; no bulk user DB) |
| **Company** | reelsaga.in, Play Store, legal docs | `data/company/profile.json` |
| **Business** | `v1/subscription-plan`, remote config | ₹1 trial · ₹599 / 3 months |
| **Secrets** | Firebase Remote Config (APK API key) | Live Razorpay + MSG91 keys |
| **App intel** | APK static analysis | `data/app/` (embedded, models, network) |

**Not publicly available:** actual revenue, full user database, logged-in PII (requires OTP/admin).

See [data/SCRAPE_REVIEW.md](data/SCRAPE_REVIEW.md) for the full coverage matrix.

---

## Find a show

```bash
ls data/content/shows/ | rg -i warrior
# → 3202-warrior-reborn.json
```

Or use [data/content/shows/index.json](data/content/shows/index.json) (`file` field per show).

---

## Documentation

| Doc | Purpose |
|-----|---------|
| [docs/00-INDEX.md](docs/00-INDEX.md) | Doc hub |
| [docs/assessment/SECURITY_REPORT.md](docs/assessment/SECURITY_REPORT.md) | Formal security assessment |
| [docs/remediation/DEV_TEAM_FIX_GUIDE.md](docs/remediation/DEV_TEAM_FIX_GUIDE.md) | Developer remediation |
| [data/SCRAPE_REVIEW.md](data/SCRAPE_REVIEW.md) | Scrape completeness review |

---

## Warning

This repository contains **live production credentials** extracted from Remote Config and the APK. Use only for authorized security research. Rotate exposed keys after review.
