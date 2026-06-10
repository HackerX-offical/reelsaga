from __future__ import annotations

from pathlib import Path

from reelsaga_scraper.client import ApiClient
from reelsaga_scraper.utils import load_json, save_json


def scrape_users(data_dir: Path, client: ApiClient, session_meta: dict | None = None) -> None:
    out = data_dir / "users"
    out.mkdir(parents=True, exist_ok=True)

    if session_meta:
        save_json(out / "auth-session.json", session_meta)

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

    # User schema reference (PII fields the API can return)
    schema_path = data_dir / "schemas" / "user-data-models.json"
    if schema_path.exists():
        save_json(out / "user-schema-reference.json", load_json(schema_path))

    # Internal dev device fingerprints from remote config
    dev_path = data_dir / "secrets" / "remote-config" / "parsed" / "user-config-exposed.json"
    if dev_path.exists():
        save_json(out / "internal-dev-device-ids.json", load_json(dev_path))

    user = parsed.get("v1/user", {}).get("data", {}).get("user", {})
    save_json(out / "user-summary.json", {
        "note": "Bulk user database not exposed via API. OTP required for logged-in PII.",
        "anonymousSessionFields": user,
        "piiFieldsWhenLoggedIn": ["id", "name", "mobile", "gender", "ageGroup", "paymentStatus", "createdAt"],
        "internalDevDevicesExposed": dev_path.exists(),
    })
