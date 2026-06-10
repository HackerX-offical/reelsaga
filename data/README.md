# Intelligence Data Index

Regenerate everything: `../scripts/scrape-all.sh`

| Path | Contents |
|------|----------|
| [content/](content/) | Shows (`{id}-{slug}.json`), home feed, trailers, reels, lists, search |
| [users/](users/) | Anonymous session, profile, subscription, transactions, schema ref |
| [company/](company/) | Legal entity (CIN), addresses, Play Store, website scrape |
| [business/](business/) | Subscription pricing, plans, engagement aggregates |
| [secrets/](secrets/) | Firebase Remote Config — live payment/OTP keys |
| [media/](media/) | Downloaded thumbnails, website banners, privacy policy HTML |
| [app/](app/) | APK-derived: embedded strings/manifest, API models, network URLs |
| [scrape-manifest.json](scrape-manifest.json) | Last run timestamp and steps |
| [SCRAPE_REVIEW.md](SCRAPE_REVIEW.md) | Goals vs actual coverage |
