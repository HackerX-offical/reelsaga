# Artifact Map

## `artifacts/`

| File | Description |
|------|-------------|
| `reelsaga.apk` | Source XAPK under assessment (v8.5.1) |

## `data/app/embedded/`

| Path | Description |
|------|-------------|
| `strings/strings.xml` | Embedded SDK keys (Firebase, Facebook, AppsFlyer) |
| `manifests/` | AndroidManifest.xml, XAPK bundle JSON |
| `assets/` | Compose resources, Lottie animations |

## `data/app/models/`

API request/response field index (`data-models-index.json`, `user-data-models.json`).

## `data/app/network/urls/`

`api-paths.txt`, `all-urls.txt` — endpoints extracted from APK.

## `data/app/decoded/`

Optional full apktool decode — run `./scripts/decode-apk.sh` (gitignored, ~200MB).

## `data/content/`

| Path | Description |
|------|-------------|
| `home/feed.json` | Full home screen sections |
| `shows/{id}-{slug}.json` | Show detail + episode HLS URLs |
| `trailers/` | Trailer feed |
| `reels/` | Clips feed |
| `lists/` | Trending, popular, new, recommended |

## `data/secrets/`

| Path | Description |
|------|-------------|
| `remote-config/` | Live Firebase Remote Config (payment/OTP keys) |

## `data/users/`

Session, profile, subscription, transactions API responses.

## `data/api/`

Endpoint coverage matrix (`coverage.json`) and per-path responses (`responses/`).

## `data/company/` · `data/business/`

Company legal profile, pricing/engagement aggregates.

## `proofs/`

Credential abuse curl demonstrations (Firebase, Facebook).
