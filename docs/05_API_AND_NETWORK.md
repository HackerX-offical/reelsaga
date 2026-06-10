# ReelSaga — API, Network & Integrations

## Primary backends

| Service | Base URL | Purpose |
|---------|----------|---------|
| **ReelSaga API** | `https://api.reelsaga.in/` | Main REST backend |
| **CDN / Media** | `https://dsmjhykc753wb.cloudfront.net/` | Video/assets delivery (AWS CloudFront) |
| **MSG91 OTP** | `https://control.msg91.com/` | Phone OTP widget |
| **Website / App Links** | `https://www.reelsaga.in/` | Universal links |
| **AppsFlyer OneLink** | `https://reelsaga.onelink.me` | Attribution deeplinks |

Connectivity pre-checks at startup (`ReelSagaAndroidApp`) probe reachability of API, CDN, MSG91, and OneLink hosts.

## HTTP client configuration

- **Library**: Ktor + OkHttp
- **Base URL**: `https://api.reelsaga.in/`
- **Auth**: Bearer token with refresh flow
- **Default headers**:
  - `Platform: android`
  - `Version-Code: 80501`
  - `Version-Name: 8.5.1`
  - `Content-Type: application/json`

## Discovered API paths (ReelSaga backend)

Paths extracted from decompiled Ktor `URLBuilderKt.path` calls and string literals:

| Path | Likely purpose |
|------|----------------|
| `v1/home/config` | Home screen configuration |
| `v1/user` | User CRUD / profile |
| `v1/profile` | Profile details |
| `v1/subscription` | Subscription management |
| `subscription/cancel` | Cancel subscription |
| `v1/trailers` | Trailer listings |
| `clips` | Clip content |
| `trailer` | Single trailer |
| `config` | App config |
| `auth/token` | Token exchange / login |
| `user/verify` | User verification (OTP) |
| `user/preferences` | User preferences |
| `session` | Watch session tracking |
| `fcm-token` | Push token registration |
| `review` | App/content ratings |
| `transactions` | Payment history |
| `vendor-trace-log` | Vendor/payment trace logging |
| `appsflyer-deeplink` | Deeplink resolution backend |

## MSG91 OTP endpoints

| Endpoint |
|----------|
| `https://control.msg91.com/api/v5/widget/sendOtpMobile` |
| `https://control.msg91.com/api/v5/widget/verifyOtp` |
| `https://control.msg91.com/api/v5/widget/retryOtp` |

## Payment provider endpoints

### Razorpay
| URL |
|-----|
| `https://api.razorpay.com/v1/` |
| `https://api.razorpay.com/v1/payments/` |
| `https://api.razorpay.com/v1/payments/create/checkout/json?key_id=` |
| `https://cdn.razorpay.com/static/` |
| `https://lumberjack.razorpay.com/v1/track` |
| `https://lumberjack-metrics.razorpay.com/v1/frontend-metrics` |

App deeplink: `razorpay://in.reelsaga.android`

### Google Play Billing
- Billing Library **8.3.0**
- Server validation URLs via AppsFlyer/Google Play billing validation APIs in SDK

### PhonePe
- `PhonePeSubscription` model with `orderId`, `intentUrl` for UPI intent flow
- Manifest queries `upi://pay` intents

## Firebase / Google endpoints

| Service | Endpoint pattern |
|---------|------------------|
| FCM Installations | `firebaseinstallations.googleapis.com/v1/` |
| Remote Config | `firebaseremoteconfig.googleapis.com/v1/projects/...` |
| Crashlytics settings | `firebase-settings.crashlytics.com/spi/v2/platforms/android/gmp/` |
| Analytics | `app-measurement.com` |

## AppsFlyer endpoints (templated)

Examples from strings:
- `https://%sregister.%s/api/v`
- `https://%sgcdsdk.%s/install_data/v5.0/`
- `https://%sonelink.%s/shortlink-sdk/v2`
- `https://%svalidate.%s/api/v`

## Deep linking

| Type | Configuration |
|------|---------------|
| HTTPS App Link | `https://www.reelsaga.in` (`autoVerify=true`) |
| OneLink | `https://reelsaga.onelink.me` |
| Razorpay return | `razorpay://in.reelsaga.android` |
| Facebook | `fbconnect://cct.in.reelsaga.android` |

## Data models → API mapping (repository layer)

Readable DTOs in `in.reelsaga.app.repository`:

**Auth / user**: `GenerateNewTokenRequest`, `RefreshTokenRequest`, `ExchangeTokenResponse`, `UserResponse`, `UpdateUserRequest`

**Content**: `HomeResponse`, `ShowDetailResponse`, `ClipDetailResponse`, `TrailersItem`, `EpisodeItem`

**Commerce**: `CreateOrderRequest`, `CreateOrderResponse`, `VerifyPaymentResponseData`, `SubscriptionPlanResponse`, `CancelSubscriptionRequest`, `TransactionResponse`

**Engagement**: `RatingRequest`, `ShareRequest`, `LibraryTrackerRequest`, `FCMTokenRequest`, `NotificationPermissionRequest`

## Network security

- `android:usesCleartextTraffic="true"` — **HTTP allowed globally** (see security doc)
- **No certificate pinning** detected (no `CertificatePinner` in decompiled code)
- OkHttp default TLS stack

## Full URL dump

See `data/app/all-urls.txt` (135 unique URLs).
