# Users — Session, Profile, Subscription

| File | Source | Data |
|------|--------|------|
| [auth-session.json](auth-session.json) | `POST auth/token` | Anonymous JWT flow |
| [current-user.json](current-user.json) | `GET v1/user` | User record |
| [profile-sections.json](profile-sections.json) | `GET v1/profile` | Profile + recommendations |
| [subscription.json](subscription.json) | `GET v1/subscription` | Billing state |
| [transactions.json](transactions.json) | `GET transactions` | Payment history |
| [user-summary.json](user-summary.json) | — | PII fields + scrape limits |
| [user-schema-reference.json](user-schema-reference.json) | APK schema | All user API fields |
| [internal-dev-device-ids.json](internal-dev-device-ids.json) | Remote Config | Team device fingerprints |

Bulk user database is **not** exposed via API. Logged-in mobile numbers require OTP.
