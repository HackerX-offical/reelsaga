# Artifact Map

## `artifacts/`

| File | Description |
|------|-------------|
| `reelsaga.apk` | Source XAPK under assessment |

## `data/apk/`

| Path | Description |
|------|-------------|
| `strings/strings.xml` | Embedded SDK keys (Firebase, Facebook, AppsFlyer) |
| `manifests/` | AndroidManifest.xml, XAPK bundle JSON |
| `assets/` | Compose resources, Lottie animations |

## `data/content/`

| Path | Description |
|------|-------------|
| `home/feed.json` | Full home screen sections |
| `shows/{id}.json` | Show detail + episode HLS URLs |
| `trailers/` | Trailer feed |
| `reels/` | Clips feed |
| `lists/` | Trending, popular, new, recommended |

## `data/secrets/`

| Path | Description |
|------|-------------|
| `remote-config/` | Live Firebase Remote Config (payment/OTP keys) |

## `data/users/`

Session, profile, subscription API responses.

## `data/schemas/`

80 decompiled API model schemas + source Java copies.

## `data/infrastructure/urls/`

`api-paths.txt`, `all-urls.txt`

## `analysis/apktool/`

Full apktool decode — smali + resources.

## `security-poc/`

Credential abuse curl demonstrations.
