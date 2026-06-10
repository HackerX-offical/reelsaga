# ReelSaga — Security Assessment & Intelligence Toolkit

**[HackerX Official](https://github.com/HackerX-offical)** · MIT License · APK v8.5.1

Security assessment of ReelSaga Android: live API scraping, full endpoint coverage, APK intelligence, and documented findings.

> Not compilable app source. Optional smali decode: `./scripts/decode-apk.sh` (~200MB, gitignored).

---

## Quick start

```bash
./scripts/scrape-all.sh
./scripts/scrape-all.sh --only api      # probe all API paths only
PYTHONPATH=scraper python3 -m reelsaga_scraper --help
```

---

## Repository layout

```
reelsaga/
├── artifacts/reelsaga.apk
├── scraper/reelsaga_scraper/     # Python scraper
├── data/
│   ├── api/                      # Endpoint coverage + responses
│   ├── content/                  # Shows, home, trailers, reels
│   ├── users/                    # Session, profile, subscription
│   ├── company/                  # Legal entity, Play Store
│   ├── business/                 # Pricing, engagement
│   ├── secrets/                  # Remote Config keys
│   └── app/                      # APK embedded, models, network URLs
├── docs/assessment/SECURITY_REPORT.md
├── proofs/                       # Credential abuse PoCs
└── scripts/
```

---

## API endpoints

All paths from the APK are probed on each scrape. See [data/api/coverage.json](data/api/coverage.json).

| Category | Paths |
|----------|-------|
| Content | `config`, `v1/home`, `v1/trailers`, `clips`, `show/{id}`, `search` |
| Users | `v1/user`, `v1/profile`, `v1/subscription`, `transactions`, `auth/token` |
| Actions | `fcm-token`, `review`, `session` (PUT), `vendor-trace-log`, `appsflyer-deeplink` |
| Blocked / N/A | `user/verify` (OTP), `trailer`, `user/preferences` (404) |
| Third-party | MSG91 OTP widget, Razorpay payments |

---

## Documentation

| Doc | Purpose |
|-----|---------|
| [data/SCRAPE_REVIEW.md](data/SCRAPE_REVIEW.md) | Coverage checklist |
| [docs/assessment/SECURITY_REPORT.md](docs/assessment/SECURITY_REPORT.md) | Security assessment |
| [docs/00-INDEX.md](docs/00-INDEX.md) | Doc hub |

---

## Warning

Contains live production credentials. Authorized security research only.
