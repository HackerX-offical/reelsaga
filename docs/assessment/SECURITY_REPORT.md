# Security Assessment Report — ReelSaga Android

| Field | Value |
|-------|-------|
| **Application** | ReelSaga (`in.reelsaga.android`) |
| **Version analyzed** | 8.5.1 (versionCode 80501) |
| **Artifact** | `reelsaga.apk` (XAPK bundle, ApkPure-sourced split APKs) |
| **Assessment type** | Static APK analysis + authorized proof-of-abuse |
| **Date** | 2026-06-10 |
| **Classification** | Internal — for AppSec + Engineering remediation |
| **License** | REELSAGA INNOVATIONS PRIVATE LIMITED — see [LICENSE](../LICENSE) |
| **Live data scraped** | [data/content/](../data/content/) · [data/secrets/](../data/secrets/) |
| **Credential abuse PoC** | [proofs/](../proofs/) |

---

## 1. Executive summary

ReelSaga is a Kotlin Multiplatform short-drama streaming app with subscription payments (Razorpay, Google Play, PhonePe), phone OTP auth (MSG91), and heavy third-party SDK usage (Firebase, AppsFlyer, Facebook).

**Static analysis identified 12 actionable security issues**, including **hardcoded third-party credentials**, **cleartext traffic enabled globally**, **backup enabled without strong exclusion of auth material**, and **absence of TLS certificate pinning** on the primary API (`api.reelsaga.in`).

R8 obfuscation protects business logic readability but **does not protect secrets** embedded in `res/values/strings.xml`. Any attacker with the APK can extract Firebase, Facebook, and AppsFlyer keys in minutes.

**Recommendation:** Treat this report as a **pre-release / hardening backlog**. Prioritize key rotation + network hardening before next production release.

---

## 2. Scope

### In scope
- `reelsaga.apk` outer bundle and inner `in.reelsaga.android.apk`
- Split modules: `config.arm64_v8a`, `config.en`, `config.hdpi`
- AndroidManifest, resources, DEX bytecode, embedded assets
- Decompilation via apktool 3.0.2 + jadx 1.5.5

### Out of scope
- Dynamic/runtime testing (no device instrumentation, no Frida, no Burp proxy)
- Backend `api.reelsaga.in` server-side pentest
- iOS binary analysis (build metadata shows iOS target exists)
- Social engineering / phishing of developer accounts

---

## 3. Methodology

1. Unzip XAPK → extract base + split APKs  
2. Decode manifest, permissions, exported components (apktool)  
3. Decompile DEX → search for secrets, network config, crypto, WebView usage  
4. String extraction (`strings` + ripgrep) for URLs, API paths, keys  
5. Map auth flow: Bearer tokens, refresh, OTP, payment callbacks  
6. Cross-reference Play Store developer metadata (public)

---

## 4. Application profile (context for dev team)

| Item | Detail |
|------|--------|
| Package | `in.reelsaga.android` |
| Developer | REELSAGA INNOVATIONS PRIVATE LIMITED |
| Min SDK | 32 (Android 12L+) |
| Target SDK | 37 |
| Stack | Kotlin 2.3.21, KMP, Compose, Ktor, Koin, Room, DataStore |
| Main API | `https://api.reelsaga.in/` |
| CDN | `https://dsmjhykc753wb.cloudfront.net/` |
| Obfuscation | R8 — app code in `defpackage/*` |

Full architecture: [02_ARCHITECTURE.md](02_ARCHITECTURE.md)

---

## 5. Findings summary

| ID | Severity | Title | Dev priority |
|----|----------|-------|--------------|
| RS-00 | **Critical** | Firebase Remote Config leaks **live Razorpay key**, MSG91 token, dev device IDs | P0 |
| RS-01 | **Critical** | Hardcoded Firebase / Google API keys in APK | P0 |
| RS-02 | **High** | Hardcoded Facebook client token + App ID | P0 |
| RS-03 | **High** | Hardcoded AppsFlyer dev key | P0 |
| RS-04 | **High** | `usesCleartextTraffic=true` (no Network Security Config) | P0 |
| RS-05 | **High** | `allowBackup=true` — token/data exfiltration risk | P1 |
| RS-06 | **Medium** | No TLS certificate pinning on API | P1 |
| RS-07 | **Medium** | Extensive device fingerprint sent at token generation | P1 |
| RS-08 | **Medium** | Legacy storage + phone state permissions | P2 |
| RS-09 | **Medium** | Exported payment/deeplink surfaces | P2 |
| RS-10 | **Medium** | WebView used for payments (Razorpay) | P2 |
| RS-11 | **Low** | Git commit hash leaked via Crashlytics metadata | P3 |
| RS-12 | **Low** | `printStackTrace()` in production paths | P3 |
| RS-13 | **Info** | Firebase Performance logcat enabled | P3 |

---

## 6. Detailed findings

### RS-00 — Firebase Remote Config exposes production secrets `[Critical]`

**Live proof:** `data/secrets/remote-config/live-remote-config.json`

Anyone with the APK's Google API key can fetch Remote Config and obtain:

| Key | Exposed value type |
|-----|-------------------|
| `razorpay_key` | **rzp_live_RK655BZcEkgNCJ** (live payment processing) |
| `msg91_token` | SMS OTP provider token |
| `msg91_widget_id` | OTP widget ID |
| `dev_device_id` | Internal developer device fingerprints (5 IDs) |
| `razorpay_key_dev` | Test payment key |

**Additionally:** `GET api.reelsaga.in/config` returns **HTTP 200 without auth** — languages, invite deep links, CDN asset URLs.

**Remediation:** Remove ALL secrets from Remote Config. Rotate Razorpay + MSG91 immediately. Enable App Check. Move secrets server-side only.

---

### RS-01 — Hardcoded Firebase / Google API keys `[Critical]`

**Live abuse proof:** [proofs/firebase/PROOF.md](../proofs/firebase/PROOF.md) — `curl` from any laptop returned **HTTP 200** and created a Firebase Installation with `refreshToken` + JWT.

**Evidence:** `data/app/embedded/strings/strings.xml`

```xml
<string name="google_api_key">AIzaSyBwKRNfSG-VXWiWVkD0pFG7PW6dcY8MMzM</string>
<string name="google_app_id">1:544458187694:android:d8ae8c1fbdcf21fc571e3f</string>
<string name="gcm_defaultSenderId">544458187694</string>
<string name="google_storage_bucket">reel-saga-app.firebasestorage.app</string>
```

**Risk:** Quota abuse, unauthorized Firebase API calls, project mapping for targeted attacks. Keys are **public to anyone** who downloads the APK.

**Remediation (dev team):**
1. Rotate keys in [Google Cloud Console](https://console.cloud.google.com/) immediately if this report is shared externally.
2. Restrict `google_api_key` by Android app package + signing certificate SHA-256.
3. Enable Firebase App Check (Play Integrity) for backend-adjacent Firebase services.
4. Never assume client-side Firebase config is secret — enforce authorization server-side.

---

### RS-02 — Hardcoded Facebook credentials `[High]`

**Live abuse proof:** [proofs/facebook/PROOF.md](../proofs/facebook/PROOF.md) — Graph API returned **HTTP 200** with app name `ReelSaga New`.

**Evidence:** `data/app/embedded/strings/strings.xml`

```xml
<string name="facebook_app_id">1060709268800467</string>
<string name="facebook_client_token">4d9333669ce4c9660134ca7ab8415840</string>
```

Manifest: `AutoLogAppEventsEnabled=true`

**Risk:** Client token abuse, event spam, Graph API probing.

**Remediation:**
1. Rotate client token in Meta Developer Console.
2. Enable **Advanced Access** restrictions and app secret proof where applicable.
3. Review auto-logged events for PII leakage (DPDP compliance).

---

### RS-03 — Hardcoded AppsFlyer dev key `[High]`

**Evidence:** `strings.xml`

```xml
<string name="apps_flyer_key">LBms5WSdbCq4Sn7Zfr2jbV</string>
```

**Risk:** Attribution fraud, fake install/postback injection, competitive intelligence.

**Remediation:**
1. Rotate AppsFlyer dev key.
2. Enable AppsFlyer Protect360 / validation if not already active.
3. Validate server-side postbacks; do not trust client events alone.

---

### RS-04 — Cleartext HTTP permitted globally `[High]`

**Evidence:** `AndroidManifest.xml`

```xml
<application android:usesCleartextTraffic="true" ...>
```

No `network_security_config.xml` found in APK.

**Risk:** MITM can intercept or modify **any** HTTP traffic on hostile networks. Even if production only uses HTTPS today, a single misconfigured endpoint or SDK fallback over HTTP is exposed.

**Remediation:**
```xml
<!-- AndroidManifest.xml -->
<application
    android:usesCleartextTraffic="false"
    android:networkSecurityConfig="@xml/network_security_config" ...>
```

```xml
<!-- res/xml/network_security_config.xml -->
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>
```

Only add domain exceptions if a vendor **requires** HTTP (document each exception).

---

### RS-05 — Application backup enabled `[High]`

**Evidence:**

```xml
android:allowBackup="true"
android:fullBackupContent="@xml/appsflyer_backup_rules"
android:dataExtractionRules="@xml/appsflyer_data_extraction_rules"
```

Auth uses Bearer tokens stored via DataStore (migrated from SharedPreferences per androidx imports). Backup can include preferences/databases on supported Android versions.

**Risk:** Extraction of refresh tokens, user IDs, AppsFlyer IDs via `adb backup` (debug builds) or device transfer paths.

**Remediation:**
- Set `android:allowBackup="false"` **OR**
- Explicitly exclude auth DataStore / Room DB / `appsflyer-data` in `dataExtractionRules` and `fullBackupContent`.
- Verify with: `adb backup` test on internal QA build.

---

### RS-06 — No certificate pinning `[Medium]`

**Evidence:** Full jadx scan — no `CertificatePinner`, no OkHttp `CertificatePinner.Builder`, no custom pin sets for `api.reelsaga.in`.

**Risk:** Corporate SSL inspection or compromised CA → full API traffic readable/modifiable including Bearer tokens.

**Remediation (OkHttp / Ktor engine config):**
- Pin SPKI hash of `api.reelsaga.in` production cert.
- Maintain backup pin for rotation.
- Consider pinning only for auth/payment calls if full-app pinning breaks CDN.

---

### RS-07 — Extensive device fingerprint in auth requests `[Medium]`

**Evidence:** `GenerateNewTokenRequest` sends 25+ fields including:

`deviceId`, `fAId` (Firebase Analytics ID), `appsFlyerId`, `aid`, `fid`, model, manufacturer, carrier, screen metrics, storage sizes, locale, timezone, `accessToken` (Facebook), etc.

**Risk:** Privacy regulatory exposure (India DPDP Act). Excessive collection increases breach impact. Correlation across vendors without clear consent UX.

**Remediation:**
1. Data minimization — send only fields required for fraud detection.
2. Document in Privacy Policy; obtain consent.
3. Avoid sending Facebook `accessToken` to own backend unless strictly necessary.

---

### RS-08 — Sensitive / legacy permissions `[Medium]`

**Declared:**
- `READ_PHONE_STATE` + `READ_BASIC_PHONE_STATE`
- `READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE`
- `AD_ID` + Privacy Sandbox ad permissions

**Risk:** Play policy scrutiny, user trust, unnecessary attack surface on older behavior.

**Remediation:**
1. Remove `READ_PHONE_STATE` if only used for deprecated device ID — use Play Services Advertising ID APIs with consent.
2. Remove storage permissions if targeting API 33+ with scoped storage only.
3. Complete Data Safety form accurately on Play Console.

---

### RS-09 — Exported components (attack surface) `[Medium]`

| Component | exported | Notes |
|-----------|----------|-------|
| `MainActivity` | yes | App links — validate intents |
| `ReelSagaSMSBroadcastReceiver` | yes | GMS SMS permission gated ✓ |
| `com.razorpay.DeeplinkActivity` | yes | Payment return URI |
| `com.facebook.CustomTabActivity` | yes | OAuth |
| `FirebaseInstanceIdReceiver` | yes | C2DM permission gated ✓ |

**Risk:** Deeplink intent injection, open redirect, unauthorized deep link handling if `MainActivity` does not validate hosts/paths.

**Remediation:**
1. Audit `MainActivity` intent handling — whitelist hosts (`www.reelsaga.in`, `reelsaga.onelink.me` only).
2. Use `android:autoVerify="true"` correctly; monitor Digital Asset Links file on domain.
3. Set `android:exported="false"` wherever possible.

---

### RS-10 — WebView payment surface `[Medium]`

**Evidence:** `MainActivity` contains `WebView` + Razorpay SDK (`com.razorpay.DeeplinkActivity`).

**Risk:** WebView misconfiguration (JS bridges, file access, mixed content) can affect payment security.

**Remediation:**
1. Restrict WebView to Razorpay/checkout domains only.
2. Disable file/content access unless required.
3. Do not override `onReceivedSslError` to proceed.
4. Keep Razorpay SDK updated.

---

### RS-11 — Git commit embedded in APK `[Low]`

**Evidence:** Crashlytics string:

```
revision: "dfe1b0f1ecf7e78eddfeb8a613aff3712639604c"
```

**Risk:** Aids targeted attacks if private repo is partially exposed.

**Remediation:** Disable VCS info upload in Crashlytics Gradle config for release builds.

---

### RS-12 — Stack traces in production `[Low]`

**Evidence:** `printStackTrace()` in `MainActivity`, `ReelSagaAndroidApp`, `ReelSagaSMSBroadcastReceiver`.

**Risk:** Sensitive error details in logcat on shared/debug devices.

**Remediation:** Use structured logging; strip verbose traces in release; rely on Crashlytics.

---

### RS-13 — Firebase Performance logcat enabled `[Info]`

```xml
<meta-data android:name="firebase_performance_logcat_enabled" android:value="true"/>
```

**Remediation:** Set `false` for release builds.

---

## 7. Authentication & session (for backend coordination)

| Mechanism | Implementation |
|-----------|----------------|
| API auth | Ktor Bearer token + refresh (`auth/token`, refresh flow) |
| OTP | MSG91 widget API (`control.msg91.com/api/v5/widget/*`) |
| SMS auto-read | Google SMS Retriever (good — no `READ_SMS` permission) |
| Token storage | DataStore Preferences (migrated from SharedPreferences) |
| Social login | Facebook SDK tokens forwarded in `GenerateNewTokenRequest` |

**Backend team should verify:**
- Refresh token rotation and revocation
- Rate limiting on `auth/token`, `user/verify`
- Device binding / anomaly detection (client sends rich fingerprint)

---

## 8. API surface exposed in client (attack reconnaissance)

Base URL: `https://api.reelsaga.in/`

| Path | Likely function |
|------|-----------------|
| `auth/token` | Login / token exchange |
| `user/verify` | OTP verification |
| `v1/user`, `v1/profile` | User profile |
| `v1/subscription`, `subscription/cancel` | Billing |
| `v1/home/config` | App config |
| `clips`, `trailer`, `v1/trailers` | Content |
| `session`, `fcm-token` | Engagement |
| `transactions` | Payment history |
| `appsflyer-deeplink` | Attribution |

Full list: [data/app/network/urls/api-paths.txt](../data/app/network/urls/api-paths.txt)

---

## 9. Positive security controls observed

| Control | Status |
|---------|--------|
| SMS Retriever (no READ_SMS) | ✓ |
| `minSdk=32` | ✓ Reduces legacy attack surface |
| R8 obfuscation on business logic | ✓ (not a secret control) |
| Play License Check (`pairip.licensecheck`) | ✓ |
| Play Integrity API dependency present | ✓ (verify server-side use) |
| FileProvider limited to cache | ✓ (`file_paths.xml` → cache only) |
| `extractNativeLibs=false` | ✓ |
| No `android:debuggable` in release manifest | ✓ |
| Signature-level custom permission for dynamic receivers | ✓ |

---

## 10. Dev team remediation checklist

### P0 — Before next release
- [ ] Rotate Firebase API key; add Android app restrictions
- [ ] Rotate Facebook client token; review Meta app settings
- [ ] Rotate AppsFlyer dev key
- [ ] Set `usesCleartextTraffic="false"` + add `network_security_config.xml`
- [ ] Security review: confirm no secrets added to `strings.xml` going forward

### P1 — Within 2 sprints
- [ ] Fix backup policy (`allowBackup=false` or strict exclusions)
- [ ] Implement TLS pinning for `api.reelsaga.in`
- [ ] Minimize `GenerateNewTokenRequest` fields; legal/privacy review
- [ ] Audit deeplink intent validation in `MainActivity`
- [ ] Enable Firebase App Check

### P2 — Hardening backlog
- [ ] Remove unnecessary permissions (phone state, storage)
- [ ] WebView security review for Razorpay flow
- [ ] Dependency audit (Razorpay, Facebook, AppsFlyer versions)

### P3 — Hygiene
- [ ] Remove Crashlytics VCS metadata from release builds
- [ ] Replace `printStackTrace` with Crashlytics logging
- [ ] Disable Firebase Performance logcat in release

---

## 11. Evidence & artifacts (for your ticket system)

| Artifact | Path |
|----------|------|
| Decoded manifest | `data/app/embedded/manifests/android-manifest.xml` |
| APK strings / keys | `data/app/embedded/strings/strings.xml` |
| All URLs | `data/app/network/urls/all-urls.txt` |
| API paths | `data/app/network/urls/api-paths.txt` |
| Live content scrape | `data/content/` |
| Production secrets | `data/secrets/remote-config/` |
| Smali / resources | `data/app/decoded/` (optional, gitignored) |

---

## 12. Suggested Jira / ticket titles (copy-paste)

1. `[SEC] Rotate and restrict Firebase/Google API keys — RS-01`
2. `[SEC] Disable cleartext traffic + add network security config — RS-04`
3. `[SEC] Harden Android backup rules for auth DataStore — RS-05`
4. `[SEC] Implement TLS pinning for api.reelsaga.in — RS-06`
5. `[PRIV] Minimize device fingerprint in GenerateNewTokenRequest — RS-07`
6. `[SEC] Rotate Facebook + AppsFlyer embedded credentials — RS-02, RS-03`

---

## 13. Disclaimer

This assessment is **static analysis only**. It does not confirm exploitability in production without dynamic testing. Backend vulnerabilities, cloud misconfigurations (S3/CloudFront), and admin panel security are **not covered**.

Recommend follow-up: **DAST** with authenticated API proxy, **MobSF** pipeline in CI, and **dependency scanning** (Gradle lockfile).

---

*Prepared for internal AppSec → Engineering handoff. Questions: reference finding IDs RS-01 through RS-13.*
