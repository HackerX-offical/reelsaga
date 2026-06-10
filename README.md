# ReelSaga — Security Assessment

**[HackerX Official](https://github.com/HackerX-offical)** · MIT · APK v8.5.1

Live API scraping, endpoint coverage, APK intelligence, security findings.

```bash
./scripts/scrape-all.sh          # full scrape
python3 -m scraper --only api    # endpoint probe only
```

## Layout

```
reelsaga/
├── artifacts/reelsaga.apk    # Source APK
├── scraper/                  # Python scraper (flat modules)
│   ├── cli.py · client.py · utils.py
│   └── secrets · content · users · business · company · endpoints
├── data/                     # Scraped intelligence (flat)
│   ├── shows/ · home/ · lists/ · trailers/ · reels/ · search/
│   ├── users/ · company/ · business/ · secrets/
│   ├── app/                  # strings.xml, manifest, API models
│   ├── api-coverage.json
│   └── scrape-manifest.json
├── docs/                     # All documentation (flat)
├── proofs/                   # Credential PoC outputs (flat)
└── scripts/                  # scrape-all, decode-apk, verify
```

## Docs

| File | Purpose |
|------|---------|
| [data/README.md](data/README.md) | Data index |
| [data/api-coverage.json](data/api-coverage.json) | API probe matrix |
| [docs/SECURITY-REPORT.md](docs/SECURITY-REPORT.md) | Security assessment |
| [docs/00-INDEX.md](docs/00-INDEX.md) | Full doc index |

Contains live production credentials — authorized security research only.
