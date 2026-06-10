# Intelligence Data Index

Regenerate: `../scripts/scrape-all.sh`

| Path | Contents |
|------|----------|
| [api/](api/) | All backend endpoint probe results + coverage matrix |
| [content/](content/) | Shows (`{id}-{slug}.json`), home, trailers, reels, lists, search |
| [users/](users/) | Auth session, profile, subscription, transactions |
| [company/](company/) | Legal entity, Play Store, website scrape |
| [business/](business/) | Subscription plans, pricing, engagement aggregates |
| [secrets/](secrets/) | Firebase Remote Config — live payment/OTP keys |
| [app/](app/) | APK-derived: embedded strings/manifest, API models, network URLs |
| [scrape-manifest.json](scrape-manifest.json) | Last run timestamp and steps |
| [SCRAPE_REVIEW.md](SCRAPE_REVIEW.md) | Goals vs actual coverage |
