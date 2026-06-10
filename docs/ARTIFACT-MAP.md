# Artifact Map

## `artifacts/reelsaga.apk`

Source XAPK under assessment (v8.5.1).

## `data/app/`

| File | Description |
|------|-------------|
| `strings.xml` | Embedded SDK keys (Firebase, Facebook, AppsFlyer) |
| `android-manifest.xml` | Decoded AndroidManifest |
| `xapk-bundle.json` | XAPK bundle metadata |
| `data-models-index.json` | API request/response field index |
| `api-paths.txt` · `all-urls.txt` | Endpoints extracted from APK |
| `decoded/` | Optional apktool output (`./scripts/decode-apk.sh`, gitignored) |

## `data/shows/` · `data/home/` · `data/lists/`

Show details with HLS URLs, home feed, curated lists, trailers, reels, search.

## `data/secrets/`

Live Firebase Remote Config — payment and OTP keys.

## `data/users/` · `data/company/` · `data/business/`

User session, company legal profile, pricing and engagement.

## `data/api-coverage.json`

Full API endpoint probe matrix.

## `proofs/`

Credential abuse curl demonstrations.
