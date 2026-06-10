# Scraper

Flat Python package — no nested sub-packages.

| Module | Role |
|--------|------|
| `cli.py` | Entry point (`python -m scraper`) |
| `client.py` | API auth + HTTP helpers |
| `utils.py` | JSON I/O, show filename helpers |
| `secrets.py` | Firebase Remote Config |
| `content.py` | Shows, home, trailers, reels |
| `users.py` | User session + profile |
| `business.py` | Pricing + engagement |
| `company.py` | Company + Play Store |
| `endpoints.py` | Full API path probe matrix |

```bash
python3 -m scraper              # from repo root
python3 -m scraper --only api
```
