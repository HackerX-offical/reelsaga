# ReelSaga — Product Overview

## What it is

**ReelSaga** is an Indian short-form drama streaming app (vertical video / episodic content). Users browse shows, watch clips/episodes, subscribe via freemium model, and pay through Indian payment rails (UPI, Razorpay, Google Play Billing, PhonePe).

## Identity

| Attribute | Value |
|-----------|-------|
| App name | ReelSaga |
| Package | `in.reelsaga.android` |
| Version | 8.5.1 (80501) |
| Min SDK | 32 (Android 12L+) |
| Target SDK | 37 (Android 17 preview) |
| Compile SDK | 37 |
| Category | Entertainment / Short drama OTT |
| Website | https://www.reelsaga.in/ |
| Marketing site | https://reelsaga.co.in/ |

## Core user flows (inferred)

1. **Discover** — Home feed with sections, thumbnails, genres, trailers
2. **Watch** — Vertical video player (Media3/ExoPlayer), Picture-in-Picture, continue watching
3. **Auth** — Phone OTP via MSG91 widget + SMS Retriever API; bearer token auth to backend
4. **Subscribe** — Plans via Razorpay (default), Google Play Billing, PhonePe subscriptions
5. **Share / deeplink** — AppsFlyer OneLink (`reelsaga.onelink.me`), web links (`www.reelsaga.in`)
6. **Notifications** — Firebase Cloud Messaging
7. **Profile** — User preferences, ratings, library tracking, invite flow

## Monetization

- Freemium with paid subscription tiers
- 3-day free trial (per Play Store release notes on older builds)
- Payment platforms: **Razorpay** (primary in models), **Google Play Billing 8.3.0**, **PhonePe** subscription intents
- UPI deep-link queries for payment apps

## Technical highlights

- **Kotlin Multiplatform + Compose Multiplatform** (`composeApp_release` module)
- **Ktor** HTTP client with Bearer auth, JSON (kotlinx.serialization)
- **Koin** dependency injection
- **Room** + **DataStore** for local persistence
- **Firebase** suite: Analytics, Crashlytics, Remote Config, Performance, Messaging
- **AppsFlyer** attribution and deeplinks
- **Facebook SDK** login/share/analytics

## Distribution channels

| Channel | Notes |
|---------|-------|
| Google Play | Official; split APK/AAB delivery |
| ApkPure | This XAPK was sourced from ApkPure (`ApkPure.com` comment in zip) |
| Aptoide | Third-party mirrors exist |

## Unrelated homonym

`org.nanobit.shorts` on Play Store is titled "ReelSaga: Anime & Drama Shorts" but is developed by **NANOBIT d.o.o.** (Croatia) — a different product.
