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

    shows_dir = data_dir / "content" / "shows"
    index_path = shows_dir / "index.json"
    if index_path.exists():
        shows = load_json(index_path).get("shows", [])
        total_watch = sum(s.get("watchCount") or 0 for s in shows)
        total_share = sum(s.get("shareCount") or 0 for s in shows)
        top = sorted(shows, key=lambda s: s.get("watchCount") or 0, reverse=True)[:20]
        save_json(out / "engagement-metrics.json", {
            "showCount": len(shows),
            "totalWatchCount": total_watch,
            "totalShareCount": total_share,
            "topShowsByWatchCount": top,
            "note": "Aggregated from show metadata — not company revenue",
        })

    pricing = plans.get("v1/subscription-plan", {}).get("data", {})
    if pricing:
        save_json(out / "pricing-summary.json", {
            "freeTrialDays": pricing.get("freeTrialDays"),
            "freeTrialAmountINR": pricing.get("freeTrialAmount"),
            "subscriptionAmountINR": pricing.get("subscriptionAmount"),
            "billingCycleMonths": pricing.get("billingCycleInMonths"),
            "currency": "INR",
            "paymentConfig": "data/secrets/remote-config/parsed/payment-config-exposed.json",
            "subscriptionStatus": "data/users/subscription.json",
            "note": "Live pricing from GET /v1/subscription-plan",
        })

    print("  business: subscription plans, pricing, engagement metrics")
