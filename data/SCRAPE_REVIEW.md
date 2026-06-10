# Scrape Coverage Review

**Last full scrape:** see [scrape-manifest.json](scrape-manifest.json)  
**Command:** `./scripts/scrape-all.sh`

This document answers: *did we get what we actually wanted?*

---

## Goals vs results

| Goal | Status | Evidence |
|------|--------|----------|
| All public show catalog + episodes | **Done** | 133 show files in [content/shows/](content/shows/), HLS `.m3u8` per episode |
| Home feed, lists, search | **Done** | [content/home/](content/home/), [content/lists/](content/lists/), [content/search/](content/search/) |
| Trailers & reels/clips | **Done** | 10 trailers, 20 clips — [content/SUMMARY.json](content/SUMMARY.json) |
| Anonymous user session | **Done** | JWT via `POST /auth/token` — [users/auth-session.json](users/auth-session.json) |
| User profile shape (no OTP PII) | **Done** | [users/current-user.json](users/current-user.json), [users/user-schema-reference.json](users/user-schema-reference.json) |
| Subscription pricing | **Done** | ₹1 trial · ₹599 / 3 months — [business/pricing-summary.json](business/pricing-summary.json) |
| Payment / OTP secrets | **Done** | Live Razorpay + MSG91 — [secrets/remote-config/parsed/credentials-exposed.json](secrets/remote-config/parsed/credentials-exposed.json) |
| Company legal & contact | **Done** | [company/profile.json](company/profile.json) |
| Play Store metadata | **Done** | [company/play-store.json](company/play-store.json) |
| Website scrape | **Done** | [company/website-scrape.json](company/website-scrape.json) |
| Engagement signals | **Done** | Watch/share aggregates — [business/engagement-metrics.json](business/engagement-metrics.json) |
| APK app intelligence | **Done** | [app/embedded/](app/embedded/), [app/models/](app/models/), [app/network/](app/network/) |
| Full user database | **Blocked** | Requires admin / internal access |
| Logged-in mobile numbers | **Blocked** | `user/verify` needs phone OTP |
| Actual company revenue | **Blocked** | Server-side only; not in public APIs |

---

## Content summary (latest run)

| Metric | Value |
|--------|-------|
| Shows indexed | 133 |
| Show detail files | 133 (`{id}-{slug}.json`) |
| Unique IDs discovered | 144 (from home + lists) |
| Trailers | 10 |
| Reels / clips | 20 |
| Home sections | 9 |
| Search queries sampled | 6 |

---

## What this repo is (and is not)

| | |
|---|---|
| **Is** | Security assessment, live API scraper, scraped production intelligence, APK metadata |
| **Is not** | Compilable Kotlin/Java Android source (use `./scripts/decode-apk.sh` for smali only) |

---

## Regenerate

```bash
./scripts/scrape-all.sh
```

Partial runs: `--only secrets|content|users|company|business`
