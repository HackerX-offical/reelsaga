# Intelligence Data

Regenerate: `../scripts/scrape-all.sh`

## Layout

| Path | Contents |
|------|----------|
| `shows/` | `{id}-{slug}.json` per show + `index.json` |
| `home/` | Feed, config, tabs |
| `lists/` | Trending, popular, new, recommended, all |
| `trailers/` · `reels/` · `search/` | Clips and search samples |
| `users/` | Auth session, profile, subscription, transactions |
| `company/` | Legal profile, Play Store, website |
| `business/` | Pricing, plans, engagement |
| `secrets/` | Remote Config (live keys) |
| `app/` | APK strings, manifest, API models, URL lists |
| `api-coverage.json` | All endpoint probe results |
| `scrape-manifest.json` | Last run metadata |

## Coverage

| Goal | Status |
|------|--------|
| 133 shows + HLS episodes | Done — `shows/` |
| All API paths probed | Done — `api-coverage.json` |
| Live Razorpay + MSG91 keys | Done — `secrets/credentials-exposed.json` |
| Company legal data | Done — `company/profile.json` |
| Bulk user DB / revenue | Not public |
