# ReelSaga — Application Architecture

## High-level diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     MainActivity (Android shell)                 │
│  Compose UI host · PiP · Razorpay WebView · Deep links          │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│              reelsaga.composeapp (KMP shared module)             │
│  Compose Multiplatform UI · Navigation · ViewModels (obfuscated)   │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────────┐
│ Ktor Client   │   │ Koin DI       │   │ Local storage      │
│ OkHttp engine │   │ rx3/gh2       │   │ Room · DataStore   │
│ Bearer auth   │   │               │   │                    │
└───────┬───────┘   └───────────────┘   └───────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│ api.reelsaga.in  │  dsmjhykc753wb.cloudfront.net (CDN/media)   │
│ control.msg91.com (OTP)  │  Razorpay / Play Billing / PhonePe │
└───────────────────────────────────────────────────────────────┘
```

## Layer breakdown

### 1. Android application layer (`in.reelsaga.app`)

| Component | Class | Role |
|-----------|-------|------|
| Application | `ReelSagaAndroidApp` | Koin init, AppsFlyer, connectivity checks to API/CDN/MSG91/OneLink |
| Entry Activity | `MainActivity` | Single-activity Compose host, PiP, payment WebView, intent handling |
| FCM | `RSMessagingService` | Push notification handling |
| SMS OTP | `ReelSagaSMSBroadcastReceiver` | Google SMS Retriever for auto-read OTP |

### 2. Shared Compose module (`reelsaga.composeapp`)

Evidence:
- Module tag: `composeApp_release` in `@Metadata`
- Assets: `assets/composeResources/reelsaga.composeapp.generated.resources/`
- Lottie animations: loading, like, success tick, confetti, gift
- Drawables: splash, app background, icons (webp)

UI logic is **heavily obfuscated** into `defpackage/*` (~9k+ classes). Readable `in.reelsaga.*` code is mostly **DTOs** under `repository/request` and `repository/response`.

### 3. Data / API layer

- **HTTP**: Ktor Client + OkHttp engine
- **Serialization**: kotlinx.serialization (JSON)
- **Auth**: Bearer tokens with refresh (`io.ktor.client.plugins.auth`)
- **Default headers** (from `xh2.java`):
  - `Platform: android`
  - `Version-Code: 80501`
  - `Version-Name: 8.5.1`
  - `Content-Type: application/json`
  - Base URL: `https://api.reelsaga.in/`

### 4. Domain models (`in.reelsaga.app.repository`)

**Request types** (examples):
- `CreateOrderRequest`, `CancelSubscriptionRequest`, `FCMTokenRequest`
- `RefreshTokenRequest`, `GenerateNewTokenRequest`, `UpdateUserRequest`
- `RatingRequest`, `ShareRequest`, `LibraryTrackerRequest`
- `NotificationPermissionRequest`, `DumbDataRequest`

**Response types** (examples):
- `HomeResponse`, `HomeStructureResponse`, `ShowDetailResponse`, `ClipDetailResponse`
- `SubscriptionPlanResponse`, `CreateOrderResponse`, `VerifyPaymentResponseData`
- `UserResponse`, `SessionResponse`, `AppConfigResponse`
- `TrailersResponseData`, `TransactionResponse`, `ExchangeTokenResponse`

### 5. Media playback

- **AndroidX Media3 / ExoPlayer** (exo_* string resources, `androidx.media3` components in dex)
- HLS/DASH style streaming from **CloudFront CDN**
- Picture-in-Picture enabled on `MainActivity`
- `largeHeap="true"` for video memory

### 6. Payments architecture

```
User selects plan
    → POST api.reelsaga.in (subscription/order endpoints)
    → CreateOrderResponse { razorpay Order | PhonePeSubscription | Play SKU }
    → Razorpay SDK / UPI intent / Play Billing flow
    → Backend verify (Google Play validate, Razorpay callbacks)
```

Default `paymentPlatform` in models: `"razorpay"`.

### 7. Analytics & attribution

| SDK | Purpose |
|-----|---------|
| Firebase Analytics | Product analytics |
| Firebase Crashlytics | Crash reporting (mapping ID embedded) |
| Firebase Performance | APM (`firebase_performance_logcat_enabled=true`) |
| Firebase Remote Config | Feature flags / remote settings |
| AppsFlyer | Attribution, deeplinks, install referrer |
| Facebook SDK | Login, auto app events, sharing |

### 8. Obfuscation strategy

| Observation | Implication |
|-------------|-------------|
| `defpackage` with short class names (`fp0`, `xh2`, `lc`) | R8 full mode obfuscation |
| 3 DEX files (~17.5 MB total dex) | Large dependency + app surface |
| Kotlin metadata preserved on models | `@Serializable` DTOs kept for reflection |
| Git commit in Crashlytics string | Build leak: `dfe1b0f1ecf7e78eddfeb8a613aff3712639604c` |

### 9. Native code

**arm64-v8a** (split APK):
- `libandroidx.graphics.path.so` — Compose graphics path
- `libdatastore_shared_counter.so` — DataStore
- `libsqliteJni.so` — SQLite/Room bundled driver

`extractNativeLibs="false"` — libs loaded directly from APK (modern packaging).

### 10. Play integrity

- `com.pairip.licensecheck.*` — Google Play License Check library (pairip)
- `com.android.vending.CHECK_LICENSE` permission
- Play Integrity API dependency (`integrity:1.3.0`)

### 11. Multi-platform targets (build metadata)

From `kotlin-tooling-metadata.json`:
- Android (JVM 11 bytecode compat)
- iOS: `ios_arm64`, `ios_simulator_arm64`, `ios_x64`
- JVM target (21)
- Kotlin **2.3.21**, Gradle **9.5.0**, KMP enabled

The same product likely ships an iOS app sharing the Compose UI layer.
