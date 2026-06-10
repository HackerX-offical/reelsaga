# ReelSaga — Permissions & Manifest

Full decoded manifest: `data/app/android-manifest.xml`

## Package identity

```xml
package="in.reelsaga.android"
android:compileSdkVersion="37"
platformBuildVersionCode="37"
```

## SDK levels

| Attribute | Value |
|-----------|-------|
| minSdkVersion | 32 |
| targetSdkVersion | 37 |
| versionCode | 80501 |
| versionName | 8.5.1 |

## Declared permissions

| Permission | Category |
|------------|----------|
| `android.permission.INTERNET` | Network |
| `android.permission.ACCESS_NETWORK_STATE` | Network |
| `android.permission.POST_NOTIFICATIONS` | Notifications (Android 13+) |
| `android.permission.WAKE_LOCK` | FCM / background |
| `com.google.android.gms.permission.AD_ID` | Advertising ID |
| `android.permission.READ_BASIC_PHONE_STATE` | Device identity |
| `android.permission.READ_PHONE_STATE` | Device identity (legacy) |
| `android.permission.READ_EXTERNAL_STORAGE` | Storage (legacy) |
| `android.permission.WRITE_EXTERNAL_STORAGE` | Storage (legacy) |
| `com.google.android.c2dm.permission.RECEIVE` | FCM |
| `com.android.vending.BILLING` | In-app purchases |
| `com.android.vending.CHECK_LICENSE` | Play licensing |
| `com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE` | Install referrer |
| `com.samsung.android.mapsagent.permission.READ_APP_INFO` | Samsung preinstall analytics |
| `com.huawei.appmarket.service.commondata.permission.GET_COMMON_DATA` | Huawei AppGallery |
| `android.permission.ACCESS_ADSERVICES_ATTRIBUTION` | Privacy Sandbox ads |
| `android.permission.ACCESS_ADSERVICES_AD_ID` | Privacy Sandbox ads |
| `android.permission.ACCESS_ADSERVICES_CUSTOM_AUDIENCE` | Privacy Sandbox ads |
| `android.permission.ACCESS_ADSERVICES_TOPICS` | Privacy Sandbox ads |
| `in.reelsaga.android.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION` | Signature-level custom |

## Package queries (`<queries>`)

Declared visible packages/intents for Android 11+:

| Target | Purpose |
|--------|---------|
| `com.facebook.katana` | Facebook app integration |
| `com.facebook.lite` | Facebook Lite |
| `com.instagram.android` | Instagram sharing |
| `my.com.tngdigital.ewallet` | Touch 'n Go eWallet |
| `com.samsung.android.mapsagent` | Samsung maps agent |
| UPI `upi://pay` VIEW intents | UPI payment apps |
| `InAppBillingService.BIND` | Play Billing |
| `BillingOverrideService.BIND` | Play Billing test companion |
| `INSTALL_PROVIDER` (AppsFlyer) | Install referrer |
| Generic VIEW/SEND intents | Sharing |

## Application attributes

| Attribute | Value | Security note |
|-----------|-------|---------------|
| `android:name` | `in.reelsaga.app.ReelSagaAndroidApp` | Custom Application |
| `allowBackup` | **true** | See security doc |
| `usesCleartextTraffic` | **true** | See security doc |
| `extractNativeLibs` | false | Modern native loading |
| `largeHeap` | true | Video memory |
| `supportsRtl` | true | RTL layouts |
| `theme` | `Theme.App.Starting` | Splash theme |

## Activities

| Activity | exported | Notable flags |
|----------|----------|---------------|
| `in.reelsaga.app.ui.activity.MainActivity` | **true** | `singleInstance`, PiP, app links |
| `com.facebook.FacebookActivity` | false | Facebook login |
| `com.facebook.CustomTabActivity` | **true** | OAuth browser tab |
| `com.razorpay.DeeplinkActivity` | **true** | Payment return |
| `ProxyBillingActivity` / `V2` | false | Play Billing |
| `LicenseActivity` (pairip) | false | Play license |
| `SignInHubActivity` (GMS) | false | Google Sign-In |

### MainActivity intent filters

1. **LAUNCHER** — main entry
2. **https://www.reelsaga.in** — verified app link
3. **https://reelsaga.onelink.me** — AppsFlyer OneLink

## Services

| Service | Purpose |
|---------|---------|
| `RSMessagingService` | FCM handler (app-specific) |
| `FirebaseMessagingService` | Firebase default |
| `ComponentDiscoveryService` | Firebase component loading |
| `AppMeasurementService` | Google Analytics |
| `SessionLifecycleService` | Firebase sessions (disabled) |
| `TransportBackendDiscovery` | Firebase data transport |
| `MultiInstanceInvalidationService` | Room DB sync |

## Receivers

| Receiver | exported | Purpose |
|----------|----------|---------|
| `ReelSagaSMSBroadcastReceiver` | true (GMS perm) | SMS OTP auto-read |
| `FirebaseInstanceIdReceiver` | true (C2DM perm) | FCM token |
| `AppMeasurementReceiver` | false | Analytics |
| Facebook token receivers | false | Session management |
| `ProfileInstallReceiver` | true (DUMP) | ART profile install |

## Content providers

| Authority | Class |
|-----------|-------|
| `in.reelsaga.android.provider` | FileProvider (sharing files) |
| `in.reelsaga.android.firebaseinitprovider` | Firebase init |
| `in.reelsaga.android.FacebookInitProvider` | Facebook init |
| `in.reelsaga.android.androidx-startup` | AndroidX App Startup |
| `in.reelsaga.android.resources.AndroidContextProvider` | Compose resources |
| `in.reelsaga.android.com.pairip.licensecheck.LicenseContentProvider` | Play license |

## Meta-data (selected)

| Key | Value |
|-----|-------|
| `com.facebook.sdk.ApplicationId` | @string/facebook_app_id |
| `com.facebook.sdk.ClientToken` | @string/facebook_client_token |
| `com.facebook.sdk.AutoLogAppEventsEnabled` | true |
| `firebase_performance_logcat_enabled` | true |
| `com.google.android.play.billingclient.version` | 8.3.0 |
| `com.android.vending.splits.required` | true |
| `com.android.stamp.source` | https://play.google.com/store |

## Hardware features

```xml
<uses-feature android:glEsVersion="0x20000" android:required="true"/>
```

OpenGL ES 2.0 required (video/graphics).

## Custom permission

```xml
<permission android:name="in.reelsaga.android.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION"
            android:protectionLevel="signature"/>
```

Used for AndroidX internal dynamic broadcast receivers.
