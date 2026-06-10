from __future__ import annotations

import json
import time
import urllib.error
import urllib.request
from pathlib import Path

from scraper.client import ApiClient, fetch_url
from scraper.utils import load_json, save_json

MSG91_BASE = "https://control.msg91.com"
RAZORPAY_BASE = "https://api.razorpay.com"


def scrape_endpoints(data_dir: Path, client: ApiClient) -> None:
    sample_show_id = 3202
    trailers_path = data_dir / "trailers" / "all-trailers.json"
    trailer_id = 137974
    if trailers_path.exists():
        trailers = load_json(trailers_path).get("data", {}).get("trailers") or []
        if trailers:
            trailer_id = trailers[0].get("id", trailer_id)
            sample_show_id = trailers[0].get("showId", sample_show_id)

    probes: list[tuple[str, str, dict | None]] = [
        ("GET", "config", None),
        ("GET", "v1/home/config", None),
        ("GET", "v1/home", None),
        ("GET", "v1/user", None),
        ("GET", "v1/profile", None),
        ("GET", "v1/subscription", None),
        ("GET", "v1/subscription-plan", None),
        ("GET", "v1/trailers", None),
        ("GET", "clips", None),
        ("GET", "transactions", None),
        ("GET", f"show/{sample_show_id}", None),
        ("GET", "search?q=warrior", None),
        ("GET", "user/preferences", None),
        ("POST", "user/preferences", {"languageId": 1}),
        ("GET", "trailer", None),
        ("GET", f"trailer?id={trailer_id}", None),
        ("POST", "trailer", {"id": trailer_id}),
        ("POST", "fcm-token", {"token": "security-assessment-probe"}),
        ("POST", "review", {"rating": 5, "feedback": "security assessment probe"}),
        ("POST", "subscription/cancel", {"reason": "security-assessment-probe"}),
        ("PUT", "session", {"deeplink": f"https://www.reelsaga.in/show/{sample_show_id}"}),
        ("POST", "vendor-trace-log", {
            "vendorName": "okhttp",
            "methodName": "security-probe",
            "startTime": str(int(time.time() * 1000) - 1000),
            "endTime": str(int(time.time() * 1000)),
        }),
        ("POST", "appsflyer-deeplink", {"af_adset": str(sample_show_id)}),
        ("POST", "user/verify", {"mobile": "9999999999", "otp": "000000"}),
    ]

    coverage: list[dict] = []
    coverage.append(_record("POST", "auth/token", 200, client.auth_response, "obtained at session create"))

    for method, path, body in probes:
        if method == "GET":
            code, data = client.get(path)
        elif method == "POST":
            code, data = client.post(path, body or {})
        else:
            code, data = client.put(path, body or {})

        entry = _record(method, path, code, data, None)
        coverage.append(entry)
        print(f"  api {method} {path} -> HTTP {code} [{entry['status']}]")

    for name, url, method in [
        ("MSG91", f"{MSG91_BASE}/api/v5/widget/sendOtpMobile", "POST"),
        ("MSG91", f"{MSG91_BASE}/api/v5/widget/verifyOtp", "POST"),
        ("MSG91", f"{MSG91_BASE}/api/v5/widget/retryOtp", "POST"),
        ("Razorpay", f"{RAZORPAY_BASE}/v1/payments/", "GET"),
        ("Razorpay", f"{RAZORPAY_BASE}/v1/payments/create/checkout/json", "POST"),
        ("Razorpay", f"{RAZORPAY_BASE}/v1/track", "POST"),
    ]:
        code, raw = fetch_url(url) if method == "GET" else _probe_post(url)
        coverage.append({
            "host": name,
            "method": method,
            "path": url,
            "httpStatus": code,
            "status": "external" if code < 500 else "error",
            "note": "Third-party; requires widget token or Razorpay key",
        })
        print(f"  {name} {method} -> HTTP {code}")

    ok = sum(1 for c in coverage if c["status"] in ("ok", "partial", "external"))
    save_json(data_dir / "api-coverage.json", {
        "probedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "total": len(coverage),
        "reachable": ok,
        "endpoints": coverage,
    })
    print(f"  api: {ok}/{len(coverage)} endpoints in api-coverage.json")


def _record(method: str, path: str, code: int, data: dict | str, note: str | None) -> dict:
    status = "error"
    message = None
    if isinstance(data, dict):
        message = data.get("message")
        if isinstance(message, dict):
            message = message.get("message", message)
        if data.get("success") is True or code == 200:
            status = "ok"
        elif code in (400, 401, 403) and data.get("success") is False:
            status = "partial"
    elif code == 200:
        status = "ok"

    if code == 404:
        status = "not_routed"
        note = note or "No route on api.reelsaga.in"

    return {
        "host": "api.reelsaga.in",
        "method": method,
        "path": path,
        "httpStatus": code,
        "status": status,
        "success": data.get("success") if isinstance(data, dict) else None,
        "message": message,
        "note": note,
    }


def _probe_post(url: str) -> tuple[int, str]:
    req = urllib.request.Request(
        url,
        data=json.dumps({}).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace")[:500]
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace")[:500]
