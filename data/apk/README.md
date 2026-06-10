# APK Embedded Data

Everything physically inside `reelsaga.apk` without network calls.

| Path | Content |
|------|---------|
| [strings/strings.xml](strings/strings.xml) | All UI strings + Firebase/Facebook/AppsFlyer keys |
| [manifests/](manifests/) | AndroidManifest.xml, XAPK bundle JSON |
| [assets/](assets/) | 50+ Compose drawables, Lottie animations, AppsFlyer hashes |

Extract with:

```bash
./scripts/01-extract-secrets-from-apk.sh artifacts/reelsaga.apk
```
