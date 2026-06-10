# Dev Team Fix Guide — Quick Reference

**ReelSaga Innovations Pvt Ltd — Internal Security Remediation**  
Proof that issues are real: [../../data/secrets/credentials-exposed.json](../../data/secrets/credentials-exposed.json) · [../../data/api-coverage.json](../../data/api-coverage.json)

One-page actionable fixes mapped to ReelSaga security findings.

---

## 0. URGENT — Remove secrets from Firebase Remote Config

**Proof:** `data/secrets/credentials-exposed.json`

Remote Config currently exposes to anyone with the APK:
- `razorpay_key`: **rzp_live_RK655BZcEkgNCJ** (live payments)
- `msg91_token` + `msg91_widget_id` (OTP)
- `dev_device_id` (internal device IDs)

**Fix:**
1. Rotate Razorpay live key and MSG91 token **today**
2. Move payment/OTP secrets to **your backend only** — never Remote Config
3. Enable Firebase App Check on Remote Config fetch
4. Use Remote Config only for non-sensitive feature flags

## 1. Stop putting secrets in `strings.xml`

**Problem:** Firebase, Facebook, AppsFlyer keys are in `res/values/strings.xml` — trivial to extract.

**Fix:**
- Firebase keys in `google-services.json` are expected, but **must** be restricted in Google Cloud Console (Android app + SHA-256 cert).
- **Rotate** any key in `data/app/strings.xml` or `data/secrets/` if report leaked.
- Do not add MSG91 auth keys, Razorpay secret keys, or backend API keys to the client — ever.

---

## 2. Disable cleartext HTTP

**File:** `AndroidManifest.xml`

```xml
<!-- REMOVE -->
android:usesCleartextTraffic="true"

<!-- ADD -->
android:usesCleartextTraffic="false"
android:networkSecurityConfig="@xml/network_security_config"
```

**New file:** `res/xml/network_security_config.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false" />
</network-security-config>
```

---

## 3. Fix backup

**Option A (simplest for auth-heavy apps):**

```xml
android:allowBackup="false"
```

**Option B:** Keep backup but exclude tokens:

```xml
<!-- res/xml/data_extraction_rules.xml -->
<data-extraction-rules>
    <cloud-backup>
        <exclude domain="sharedpref" path="." />
        <exclude domain="database" path="." />
    </cloud-backup>
    <device-transfer>
        <exclude domain="sharedpref" path="." />
        <exclude domain="database" path="." />
    </device-transfer>
</data-extraction-rules>
```

Test: `adb backup -f backup.ab in.reelsaga.android` on QA build — verify no auth files inside.

---

## 4. Add certificate pinning (Ktor + OkHttp)

In your Ktor `HttpClient` OkHttp engine config:

```kotlin
val certificatePinner = CertificatePinner.Builder()
    .add("api.reelsaga.in", "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=") // replace with real pin
    .build()

// Pass to OkHttpClient.Builder().certificatePinner(certificatePinner)
```

Get pin: `openssl s_client -connect api.reelsaga.in:443 | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64`

Always ship a **backup pin** for cert rotation.

---

## 5. Trim `GenerateNewTokenRequest`

Currently sends ~25 device fields including Facebook access token, AppsFlyer ID, Firebase AID.

**Action:**
- List fields actually used server-side for fraud detection.
- Remove the rest.
- Update privacy policy + consent flows (DPDP).

---

## 6. Deeplink validation (`MainActivity`)

Ensure intent handlers verify:

```kotlin
// Pseudocode — enforce host allowlist
val allowedHosts = setOf("www.reelsaga.in", "reelsaga.onelink.me")
val host = intent.data?.host ?: return finish()
if (host !in allowedHosts) return finish()
```

---

## 7. Release build hygiene

| Item | Action |
|------|--------|
| Crashlytics VCS info | Disable in `build.gradle` for release |
| `firebase_performance_logcat_enabled` | `false` in release manifest |
| `printStackTrace()` | Remove; use Crashlytics.recordException |
| ProGuard | Keep rules for serialization models only |

---

## 8. Permissions cleanup

Review and remove if unused:
- `READ_PHONE_STATE`
- `WRITE_EXTERNAL_STORAGE` / `READ_EXTERNAL_STORAGE`

---

## 9. CI recommendation

Add to pipeline:
```bash
# MobSF or custom script
apktool d app-release.apk -o /tmp/apk
grep -r "AIzaSy" /tmp/apk && echo "FAIL: Google API key in APK" && exit 1
grep "usesCleartextTraffic=\"true\"" /tmp/apk/AndroidManifest.xml && exit 1
```

---

Full report: [SECURITY_ASSESSMENT_REPORT.md](SECURITY_ASSESSMENT_REPORT.md)
