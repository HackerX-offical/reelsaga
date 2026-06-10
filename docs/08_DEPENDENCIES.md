# ReelSaga — Dependencies & SDKs

## Core framework

| Library | Evidence |
|---------|----------|
| Kotlin 2.3.21 | kotlin-tooling-metadata.json |
| Kotlin Coroutines | kotlinx.coroutines in META-INF |
| Kotlin Serialization | ktor-serialization-kotlinx-json |
| Compose Multiplatform | composeResources, org.jetbrains.compose.ui |
| AndroidX Compose Material3 | material3 version files |
| Navigation Compose | navigation-compose |
| Lifecycle + ViewModel Compose | lifecycle-*-compose |
| Koin DI | `rx3`, `gh2`, KoinApplicationAlreadyStartedException |
| Room | room-runtime, MultiInstanceInvalidationService |
| DataStore | datastore-preferences |
| SplashScreen | core-splashscreen |

## Networking

| Library | Modules |
|---------|---------|
| Ktor 2.x | client-core, okhttp, auth, logging, content-negotiation, encoding, websockets |
| OkHttp | okhttp3 PlatformInitializer, native-image config |

## Media

| Library | Evidence |
|---------|----------|
| AndroidX Media3 / ExoPlayer | exo_controls_* strings, media3 components |
| Picture-in-Picture | MainActivity manifest flags |

## Google Play Services

| Client | Version |
|--------|---------|
| play-services-base | 18.5.0 |
| play-services-basement | 18.9.0 |
| play-services-tasks | 18.4.0 |
| play-services-auth | 21.5.1 |
| play-services-auth-api-phone | 18.0.2 |
| play-services-measurement | 23.2.0 |
| play-services-cloud-messaging | 17.2.0 |
| play-services-ads-identifier | 18.0.0 |
| play-services-wallet | 18.1.3 |
| play-services-location | 19.0.0 |
| play-services-maps | 17.0.0 |

## Firebase

| Product | Evidence |
|---------|----------|
| Firebase Common | ComponentDiscoveryService registrars |
| Firebase Analytics | AppMeasurement* |
| Firebase Crashlytics | CrashlyticsRegistrar, mapping_file_id |
| Firebase Performance | FirebasePerfRegistrar, logcat enabled |
| Firebase Remote Config | RemoteConfigRegistrar |
| Firebase Cloud Messaging | FirebaseMessagingService, RSMessagingService |
| Firebase Installations | InstallationsRegistrar |
| Firebase Sessions | SessionsRegistrar |
| Firebase ABT | AbtRegistrar |

## Payments

| SDK | Version / evidence |
|-----|-------------------|
| Google Play Billing | **8.3.0** (billing-ktx) |
| Razorpay Checkout | DeeplinkActivity, rzp_* resources |
| PhonePe | PhonePeSubscription model, UPI intents |
| Google Play Integrity | integrity 1.3.0 |
| Play App Update | app-update 2.1.0 |

## Analytics & marketing

| SDK | Evidence |
|-----|----------|
| AppsFlyer | apps_flyer_key, internal asset hashes, deeplink subscribe |
| Facebook SDK | FacebookActivity, AutoLogAppEvents, share/login |
| Google Analytics for Firebase | measurement SDK |

## Auth & identity

| Mechanism | Evidence |
|-----------|----------|
| Bearer token (Ktor Auth) | xh2.java BearerAuthProvider |
| MSG91 OTP widget | control.msg91.com paths |
| Google SMS Retriever | ReelSagaSMSBroadcastReceiver |
| Facebook Login | Facebook SDK |
| Google Sign-In | SignInHubActivity |

## Security / licensing

| Component | Purpose |
|-----------|---------|
| com.pairip.licensecheck | Google Play license verification |
| Play Integrity API | Device attestation (dependency present) |

## UI / utilities

| Library | Evidence |
|---------|----------|
| Lottie (Compose) | *.json animations in assets |
| Coil (likely) | image loading in Compose (obfuscated) |
| Accompanist / Material3 | m3c_* strings |
| Emoji2 | EmojiCompatInitializer |
| Browser (Custom Tabs) | androidx.browser, Facebook CustomTab |

## Database

| Component | Evidence |
|-----------|---------|
| Room | room-runtime, invalidation service |
| SQLite bundled | sqlite-bundled, libsqliteJni.so |
| DataStore Preferences | protobuf schemas in META-INF |

## Protobuf / wire formats

- Firebase encoders proto
- Datastore preferences proto
- Firebase messaging proto (`messaging_event_extension.proto`)

## Dependency count

~102 `META-INF/*.version` files for AndroidX/Google libraries alone.

## Notable absences (not found in static analysis)

- No Retrofit (uses Ktor instead)
- No certificate pinning library
- No obvious root detection framework (beyond emulator timing in `bd1.java`)
