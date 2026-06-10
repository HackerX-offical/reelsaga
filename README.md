# ReelSaga — Security Assessment & Intelligence Toolkit

**[HackerX Official](https://github.com/HackerX-offical)** · MIT License · APK v8.5.1

Security assessment of ReelSaga Android: live API scraping, endpoint coverage, APK intelligence, documented findings.

> Not compilable app source. Optional smali: `./scripts/decode-apk.sh` (~200MB, gitignored).

---

## Quick start

```bash
./scripts/scrape-all.sh
./scripts/scrape-all.sh --only api
python3 -m scraper --help
```

---

## Repository layout

```
reelsaga/
├── artifacts/reelsaga.apk       # Source APK (v8.5.1)
├── scraper/                     # Python scraper (flat modules)
│   ├── cli.py                   # Entry: python -m scraper
│   ├── client.py                # API auth + HTTP
│   ├── content.py · users.py · business.py · company.py
│   ├── secrets.py · endpoints.py
│   └── utils.py
├── data/                        # Scraped intelligence
│   ├── api/                     # Endpoint coverage matrix
│   ├── content/ · users/ · company/ · business/ · secrets/
│   └── app/                     # APK embedded, models, network
├── docs/assessment/             # Security report
├── proofs/                      # Credential PoC scripts output
└── scripts/                     # Shell wrappers
```

---

## Documentation

| Doc | Purpose |
|-----|---------|
| [data/SCRAPE_REVIEW.md](data/SCRAPE_REVIEW.md) | Coverage checklist |
| [data/api/coverage.json](data/api/coverage.json) | API probe results |
| [docs/assessment/SECURITY_REPORT.md](docs/assessment/SECURITY_REPORT.md) | Security assessment |
| [docs/00-INDEX.md](docs/00-INDEX.md) | Doc hub |
| [scraper/README.md](scraper/README.md) | Scraper module reference |

---

## Warning

Contains live production credentials. Authorized security research only.
