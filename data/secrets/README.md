# Production Secrets — Firebase Remote Config

Anyone with the APK's Google API key can fetch live Remote Config.

| File | Content |
|------|---------|
| [remote-config/live-remote-config.json](remote-config/live-remote-config.json) | Raw 31-key production config |
| [remote-config/parsed/credentials-exposed.json](remote-config/parsed/credentials-exposed.json) | Razorpay live key, MSG91 token |
| [remote-config/parsed/user-config-exposed.json](remote-config/parsed/user-config-exposed.json) | `dev_device_id` fingerprints |
| [remote-config/parsed/all-entries-parsed.json](remote-config/parsed/all-entries-parsed.json) | All keys parsed |

**Re-scrape:** `../../scripts/scrape-secrets.sh`

**Fix:** Remove all secrets from Remote Config. Rotate Razorpay + MSG91 immediately. Enable Firebase App Check.
