# ReelSaga — Build System & Tooling

## Build stack summary

| Tool | Version |
|------|---------|
| Gradle | 9.5.0 |
| Android Gradle Plugin (AGP) | 9.2.0 |
| Kotlin | 2.3.21 |
| Kotlin Multiplatform Plugin | 2.3.21 (HMPP enabled) |
| Java compatibility (Android) | 11 (source/target) |
| JVM target (KMP JVM) | 21 |
| Compile SDK | 37 |
| Min SDK | 32 |
| Target SDK | 37 |

Source: `kotlin-tooling-metadata.json`, `apktool.yml`, `META-INF/com/android/build/gradle/app-metadata.properties`

## Project structure (inferred)

```
reelsaga/                          # Monorepo root ($PROJECT_DIR)
├── composeApp/                    # KMP module (composeApp_release artifact)
│   ├── commonMain/                # Shared Compose UI + business logic
│   ├── androidMain/               # Android-specific (in.reelsaga.app)
│   └── iosMain/                   # iOS targets
├── androidApp/ or embedded        # Android application packaging
└── gradle/                        # Gradle 9.x wrapper
```

Module artifact name in bytecode: **`composeApp_release`**

## Kotlin Multiplatform targets

| Target | Platform | Konan / JVM |
|--------|----------|-------------|
| `KotlinAndroidTarget` | androidJvm | Java 11 |
| `KotlinNativeTarget` | ios_arm64 | Konan 2.3.21 |
| `KotlinNativeTargetWithSimulatorTests` | ios_simulator_arm64, ios_x64 | Konan 2.3.21 |
| `KotlinJvmTarget` | JVM | jvmTarget 21 |
| `KotlinMetadataTarget` | common metadata | — |

## Android packaging

| Feature | Value |
|---------|-------|
| App Bundle splits | Yes (`com.android.vending.splits.required=true`) |
| Split types | `base__abi`, `base__density` |
| ABI split | `config.arm64_v8a` |
| Density split | `config.hdpi` |
| Language split | `config.en` |
| Derived APK id | 4 |
| Play stamp | `https://play.google.com/store` |

## DEX layout

| File | Approx size |
|------|-------------|
| classes.dex | ~8.4 MB |
| classes2.dex | ~244 KB |
| classes3.dex | ~8.1 MB |
| **Total** | ~16.8 MB (3 multidex) |

## Code shrinking / obfuscation

- **R8** enabled (evidenced by `defpackage` obfuscated names, minimal readable app logic)
- Kotlin serialization keeps model class names for JSON
- Baseline profiles included: `assets/dexopt/baseline.prof`, `baseline.profm`

## Version control leak

Embedded in Crashlytics build metadata:

```
revision: dfe1b0f1ecf7e78eddfeb8a613aff3712639604c
system: GIT
local_root_path: $PROJECT_DIR
```

This can help correlate APK builds to internal git history if repo is ever exposed.

## Key Gradle dependencies (from META-INF version files)

### AndroidX / Compose
- Compose BOM components: UI, Material3, Animation, Foundation, Runtime
- Navigation Compose
- Lifecycle 2.x (runtime-compose, viewmodel-compose)
- Room, DataStore, SplashScreen, Browser, Media3

### Networking
- Ktor client: core, okhttp, auth, logging, content-negotiation, serialization-json, encoding

### Google / Firebase
- play-services-measurement 23.2.0
- play-services-auth 21.5.1
- play-services-auth-api-phone 18.0.2 (SMS Retriever)
- firebase-messaging, crashlytics, perf, remote-config, installations
- billing-ktx **8.3.0**
- integrity **1.3.0**
- app-update **2.1.0**

### Third-party SDKs
- Facebook SDK (core, gaming services)
- AppsFlyer (internal assets under `assets/com/appsflyer/internal/`)
- Razorpay Checkout SDK
- Dagger (version file present)
- OkHttp (native-image config)

## Build outputs in this analysis

| Directory | Tool | Size |
|-----------|------|------|
| `analysis/apktool/` | apktool | ~203 MB |

## How to reproduce analysis

```bash
# Extract XAPK
unzip artifacts/reelsaga.apk -d /tmp/reelsaga-extract/

# Decode base APK
apktool d -o analysis/apktool artifacts/in.reelsaga.android.apk

# Decompile
jadx -d analysis/jadx artifacts/in.reelsaga.android.apk
```
