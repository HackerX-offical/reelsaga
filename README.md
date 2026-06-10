# ReelSaga — Security Assessment & Data Scraper

**REELSAGA INNOVATIONS PRIVATE LIMITED** · [LICENSE](LICENSE)

Production-grade toolkit to scrape live ReelSaga data and document security exposure from `reelsaga.apk` v8.5.1.

> This repo is **not** the Android app source code. It is a security assessment + scraper.  
> To decode the APK: `./scripts/decode-apk.sh` (optional, ~200MB output).

---

## Quick start

```bash
./scripts/scrape-all.sh              # full scrape
./scripts/scrape-all.sh --only content   # shows, trailers, reels only
python3 -m reelsaga_scraper --help   # requires PYTHONPATH=scraper or pip install -e .
```

---

## Repository layout

```
reelsaga/
├── pyproject.toml              # Installable Python package
├── scraper/reelsaga_scraper/   # Scraper source (compile/run)
│   ├── cli.py
│   ├── client.py               # API auth (Firebase fId → JWT)
│   └── scrapers/
│       ├── content.py          # Shows named {id}-{title}.json
│       ├── users.py
│       ├── company.py
│       ├── business.py         # Pricing ₹599/3mo, subscription plans
│       └── secrets.py
│
├── data/                       # All scraped output
│   ├── content/shows/          # 3202-warrior-reborn.json …
│   ├── users/
│   ├── company/                # Legal entity, Play Store, website
│   ├── business/               # Pricing, plans, engagement metrics
│   ├── secrets/                # Remote Config (Razorpay, MSG91)
│   ├── media/
│   ├── apk/
│   └── schemas/
│
├── artifacts/reelsaga.apk
├── docs/ · reports/
├── scripts/
└── security-poc/
```

---

## What gets scraped

| Category | Source | Output |
|----------|--------|--------|
| **Shows / episodes** | `GET /show/{id}` | `data/content/shows/{id}-{name}.json` + HLS URLs |
| **Users** | `GET v1/user`, profile | `data/users/` (anonymous session; no bulk user DB) |
| **Company** | Website, Play Store, docs | `data/company/profile.json` |
| **Business / pricing** | `GET v1/subscription-plan` | ₹1 trial, ₹599/3 months |
| **Secrets** | Firebase Remote Config | Live Razorpay + MSG91 keys |
| **Engagement** | Show metadata | Watch/share counts in `data/business/engagement-metrics.json` |

**Not available without admin/OTP:** actual revenue, full user database, logged-in mobile numbers.

---

## Find show by name

```bash
ls data/content/shows/ | rg -i warrior
# 3202-warrior-reborn.json
```

Or open [data/content/shows/index.json](data/content/shows/index.json) — each entry has a `file` field.

---

## Reports & remediation

- [reports/SECURITY_ASSESSMENT_REPORT.md](reports/SECURITY_ASSESSMENT_REPORT.md)
- [docs/remediation/DEV_TEAM_FIX_GUIDE.md](docs/remediation/DEV_TEAM_FIX_GUIDE.md)
