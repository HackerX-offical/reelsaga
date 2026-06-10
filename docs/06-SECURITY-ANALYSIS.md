# ReelSaga — Security Analysis

> Static analysis only. Severity ratings are indicative for prioritization, not a formal pentest.

## Executive summary

ReelSaga is a production consumer app with standard mobile SDK integrations, but several **configuration weaknesses** increase risk: cleartext traffic allowed, backup enabled, secrets embedded in the APK, no TLS pinning, and sensitive permissions. Obfuscation protects business logic but **does not protect** embedded API keys.

---

## Critical / High findings

### 1. Hardcoded secrets in APK resources (HIGH)

Firebase, Facebook, and AppsFlyer credentials are in `res/values/strings.xml` and recoverable by anyone who unpacks the APK.

| Secret | Location | Risk |
|--------|----------|------|
| Google API Key | `google_api_key` | Firebase/API abuse, quota exhaustion |
| Facebook Client Token | `facebook_client_token` | Graph API misuse |
| AppsFlyer Dev Key | `apps_flyer_key` | Attribution fraud, event injection |
| FCM Sender ID / App ID | strings.xml | Targeted push infra mapping |

**Impact**: Key abuse, billing charges, analytics poisoning, impersonation of app to third-party SDKs.

**Remediation**: Use Play App Signing + restricted API keys (Android app restriction, SHA-256), rotate exposed keys, move sensitive ops server-side.

---

### 2. Cleartext HTTP traffic enabled (HIGH)

```xml
android:usesCleartextTraffic="true"
```

No `networkSecurityConfig` pinning domain exceptions found.

**Impact**: MITM on any HTTP endpoint; credential/session leakage on hostile networks.

**Remediation**: Set `usesCleartextTraffic="false"`; use Network Security Config with explicit exceptions only if required.

---

### 3. Android backup enabled (MEDIUM-HIGH)

```xml
android:allowBackup="true"
android:fullBackupContent="@xml/appsflyer_backup_rules"
android:dataExtractionRules="@xml/appsflyer_data_extraction_rules"
```

**Impact**: Auth tokens, preferences, AppsFlyer data, databases may be extractable via ADB backup on rooted/debuggable devices or device migration paths.

**Remediation**: `allowBackup="false"` for auth-heavy apps, or strict backup rules excluding tokens/DataStore.

---

### 4. No TLS certificate pinning (MEDIUM)

Searched decompiled sources: **no** `CertificatePinner`, public key pins, or custom `TrustManager` for API domain.

**Impact**: Corporate MITM proxies or compromised CAs can intercept `api.reelsaga.in` traffic even over HTTPS.

**Remediation**: Pin api.reelsaga.in SPKI in OkHttp/Ktor; combine with backup pin rotation strategy.

---

### 5. Sensitive permissions (MEDIUM)

| Permission | Concern |
|------------|---------|
| `READ_PHONE_STATE` / `READ_BASIC_PHONE_STATE` | Device identifiers; privacy regulations |
| `READ/WRITE_EXTERNAL_STORAGE` | Legacy storage access |
| `AD_ID` + adservices permissions | Tracking surface |
| `POST_NOTIFICATIONS` | Expected for FCM |

**Note**: `minSdk=32` reduces some legacy attack surface; storage permissions may be legacy manifest entries.

---

### 6. Exported components (MEDIUM)

| Component | exported | Notes |
|-----------|----------|-------|
| `MainActivity` | true | Required for launcher + links |
| `ReelSagaSMSBroadcastReceiver` | true | Protected by `com.google.android.gms.auth.api.phone.permission.SEND` |
| `FirebaseInstanceIdReceiver` | true | GMS permission protected |
| `CustomTabActivity` (Facebook) | true | OAuth flow |
| `DeeplinkActivity` (Razorpay) | true | Payment return |
| `ProfileInstallReceiver` | true | `DUMP` permission — profile installer |

Review intent handling in `MainActivity` for deeplink injection / intent redirection bugs (not dynamically tested).

---

### 7. WebView attack surface (MEDIUM)

`MainActivity` holds a `WebView` (Razorpay checkout / payment flows).

**Risks**: JS bridge misconfig, URL loading, file access if misconfigured.

**Remediation**: Restrict WebView to Razorpay domains; disable file access; validate SSL errors.

---

### 8. Git commit hash leaked (LOW-MEDIUM)

Crashlytics embeds: `dfe1b0f1ecf7e78eddfeb8a613aff3712639604c`

**Impact**: Aids correlation if source repo is private but partially leaked.

---

### 9. Obfuscation limitations (INFO)

- R8 obfuscates `defpackage/*` but DTOs, manifest, strings, and SDK configs remain readable.
- **Security through obscurity is not present** for keys and API shapes.

---

### 10. Third-party APK source (MEDIUM for this file)

Analyzed artifact is **ApkPure XAPK**, not Play-signed direct install.

**Risks**: Supply-chain tampering, outdated build, unknown signature vs Play version.

**Remediation**: Compare hash with Play Store `in.reelsaga.android` via [APKMirror/APKCheck] or internal release registry.

---

### 11. Play License Check present (POSITIVE)

`com.pairip.licensecheck` + `CHECK_LICENSE` permission indicates Google Play licensing enforcement on legitimate builds.

---

### 12. Play Integrity API dependency (POSITIVE)

`integrity:1.3.0` suggests capability for device attestation (implementation in obfuscated code).

---

### 13. SMS Retriever for OTP (POSITIVE)

Uses Google SMS Retriever API instead of `READ_SMS` permission — better privacy pattern for OTP.

---

## Attack scenarios

| Scenario | Feasibility | Notes |
|----------|-------------|-------|
| Extract API keys from APK | **Easy** | strings.xml |
| Replay bearer token from backup | Medium | If backup extracts DataStore |
| MITM API on public WiFi | Medium | No pinning; cleartext allowed |
| Modify sideloaded APK | Easy | Repack XAPK; license check may block |
| Frida hook payment flow | Medium | No strong anti-tamper observed statically |
| Scrape API with discovered paths | Medium | Needs valid auth tokens |

---

## Compliance considerations (India)

- **DPDP Act 2023**: Phone number, viewing history, payment data — privacy policy and consent required
- **GST billing**: GSTIN published on website
- **RBI / payment norms**: Razorpay/PhonePe/Play handle PCI scope; app must not log card data (verify Razorpay WebView)

---

## Recommended priority fixes

1. Rotate and restrict all embedded API keys
2. Disable cleartext traffic
3. Implement certificate pinning for `api.reelsaga.in`
4. Harden backup rules or disable backup
5. Audit exported activities for intent validation
6. Distribute only via Play or verified update channel

---

See also: [credentials-exposed.json](../../data/secrets/credentials-exposed.json)
