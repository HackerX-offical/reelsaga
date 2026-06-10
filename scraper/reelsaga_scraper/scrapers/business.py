from __future__ import annotations

from pathlib import Path

from reelsaga_scraper.client import ApiClient
from reelsaga_scraper.utils import load_json, save_json


def scrape_business(data_dir: Path, client: ApiClient) -> None:
    out = data_dir / "business"
    out.mkdir(parents=True, exist_ok=True)

    plans = {}
    for ep in ("v1/subscription-plan", "subscription-plan"):
        code, data = client.get(ep)
        if isinstance(data, dict) and data.get("success"):
            plans[ep] = data
    save_json(out / "subscription-plans.json", plans)

    _, sub = client.get("v1/subscription")
    save_json(out / "subscription-status.json", sub if isinstance(sub, dict) else {"raw": sub})

    rc_path = data_dir / "secrets" / "remote-config" / "parsed" / "payment-config-exposed.json"
    if rc_path.exists():
        save_json(out / "payment-config-remote.json", load_json(rc_path))

    # Aggregate engagement from scraped shows (watch/like counts)
    shows_dir = data_dir / "content" / "shows"
    index_path = shows_dir / "index.json"
    if index_path.exists():
        index = load_json(index_path)
        shows = index.get("shows", [])
        total_watch = sum(s.get("watchCount") or 0 for s in shows)
        total_share = sum(s.get("shareCount") or 0 for s in shows)
        top = sorted(shows, key=lambda s: s.get("watchCount") or 0, reverse=True)[:20]
        save_json(out / "engagement-metrics.json", {
            "showCount": len(shows),
            "totalWatchCount": total_watch,
            "totalShareCount": total_share,
            "topShowsByWatchCount": top,
            "note": "Aggregated from public show metadata — not company revenue",
        })

    pricing = plans.get("v1/subscription-plan", {}).get("data", {})
    if pricing:
        save_json(out / "pricing-summary.json", {
            "freeTrialDays": pricing.get("freeTrialDays"),
            "freeTrialAmountINR": pricing.get("freeTrialAmount"),
            "subscriptionAmountINR": pricing.get("subscriptionAmount"),
            "billingCycleMonths": pricing.get("billingCycleInMonths"),
            "currency": "INR",
            "note": "Live pricing from GET /v1/subscription-plan — actual revenue is server-side only",
        })

    print("  business: subscription plans, pricing, engagement metrics")
