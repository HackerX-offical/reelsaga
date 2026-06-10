# API Endpoint Coverage

Probed on every full scrape. See [coverage.json](coverage.json) for the status matrix.

| Status | Meaning |
|--------|---------|
| `ok` | HTTP 200 with `success: true` |
| `partial` | Reachable but expected failure (e.g. no subscription to cancel) |
| `not_routed` | 404 — path in APK strings but not mounted on server |
| `external` | Third-party host (MSG91, Razorpay) |

Individual responses: [responses/](responses/)
