# Scrape Coverage Review

**Last full scrape:** [scrape-manifest.json](scrape-manifest.json)  
**API matrix:** [api/coverage.json](api/coverage.json)

---

## Goals vs results

| Goal | Status | Evidence |
|------|--------|----------|
| All public shows + episodes + HLS | **Done** | [content/shows/](content/shows/) |
| Home, lists, search | **Done** | [content/home/](content/home/), [content/lists/](content/lists/) |
| Trailers & reels | **Done** | [content/trailers/](content/trailers/), [content/reels/](content/reels/) |
| Every APK API path probed | **Done** | [api/coverage.json](api/coverage.json) |
| Anonymous user session | **Done** | [users/auth-session.json](users/auth-session.json) |
| Subscription pricing | **Done** | [business/pricing-summary.json](business/pricing-summary.json) |
| Live payment/OTP secrets | **Done** | [secrets/remote-config/parsed/credentials-exposed.json](secrets/remote-config/parsed/credentials-exposed.json) |
| Company legal profile | **Done** | [company/profile.json](company/profile.json) |
| APK app intelligence | **Done** | [app/](app/) |
| Bulk user database | **Blocked** | No public endpoint |
| Logged-in PII (mobile) | **Blocked** | `user/verify` requires OTP |
| Actual revenue | **Blocked** | Server-side only |

---

## API path results (api.reelsaga.in)

| Path | Method | Result |
|------|--------|--------|
| `config` | GET | OK |
| `v1/home/config` | GET | OK |
| `v1/home` | GET | OK |
| `v1/user` | GET | OK |
| `v1/profile` | GET | OK |
| `v1/subscription` | GET | OK |
| `v1/subscription-plan` | GET | OK |
| `v1/trailers` | GET | OK |
| `clips` | GET | OK |
| `transactions` | GET | OK (empty for anonymous) |
| `auth/token` | POST | OK |
| `fcm-token` | POST | OK |
| `review` | POST | OK |
| `session` | PUT | OK (deeplink update) |
| `vendor-trace-log` | POST | OK |
| `appsflyer-deeplink` | POST | OK |
| `subscription/cancel` | POST | Partial (no active subscription) |
| `user/verify` | POST | Partial (needs OTP access token) |
| `trailer` | GET/POST | Not routed (404) |
| `user/preferences` | GET/POST | Not routed (404) |

MSG91 and Razorpay paths are third-party — documented under `api/responses/external-*`.

---

## Regenerate

```bash
./scripts/scrape-all.sh
./scripts/scrape-all.sh --only api   # endpoint probe only
```
