from __future__ import annotations

from pathlib import Path

from scraper.client import ApiClient
from scraper.utils import save_json


def scrape_users(data_dir: Path, client: ApiClient) -> None:
    out = data_dir / "users"
    out.mkdir(parents=True, exist_ok=True)

    save_json(out / "auth-session.json", {
        "firebaseFid": client.firebase_fid,
        "authTokenResponse": client.auth_response,
        "note": "Anonymous JWT via POST /auth/token — no OTP",
    })

    endpoints = {
        "current-user.json": "v1/user",
        "profile-sections.json": "v1/profile",
        "subscription.json": "v1/subscription",
        "transactions.json": "transactions",
    }
    parsed = {}
    for fname, ep in endpoints.items():
        code, data = client.get(ep)
        save_json(out / fname, data if isinstance(data, dict) else {"httpStatus": code, "raw": data})
        if isinstance(data, dict):
            parsed[ep] = data
        print(f"  users/{fname} -> HTTP {code}")

    user = parsed.get("v1/user", {}).get("data", {}).get("user", {})
    save_json(out / "user-summary.json", {
        "note": "Bulk user database not exposed. OTP required for logged-in PII.",
        "anonymousSessionFields": user,
        "piiFieldsWhenLoggedIn": ["id", "name", "mobile", "gender", "ageGroup", "paymentStatus", "createdAt"],
        "schemaReference": "data/app/data-models-index.json",
        "devDeviceIds": "data/secrets/user-config-exposed.json",
    })
