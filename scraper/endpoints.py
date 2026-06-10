from __future__ import annotations

import json
import re
import time
import urllib.error
import urllib.request
from pathlib import Path

from scraper.client import ApiClient, fetch_url
from scraper.utils import load_json, save_json

MSG91_BASE = "https://control.msg91.com"
RAZORPAY_BASE = "https://api.razorpay.com"


def scrape_endpoints(data_dir: Path, client: ApiClient) -> None:
    out = data_dir / "api"
    resp_dir = out / "responses"
    resp_dir.mkdir(parents=True, exist_ok=True)

    sample_show_id = 3202
    trailers_path = data_dir / "content" / "trailers" / "all-trailers.json"
    trailer_id = 137974
    if trailers_path.exists():
        trailers = load_json(trailers_path).get("data", {}).get("trailers") or []
        if trailers:
            trailer_id = trailers[0].get("id", trailer_id)
            sample_show_id = trailers[0].get("showId", sample_show_id)

    probes: list[tuple[str, str, dict | None, str]] = [
        ("GET", "config", None, "api"),
        ("GET", "v1/home/config", None, "api"),
        ("GET", "v1/home", None, "api"),
        ("GET", "v1/user", None, "api"),
        ("GET", "v1/profile", None, "api"),
        ("GET", "v1/subscription", None, "api"),
        ("GET", "v1/subscription-plan", None, "api"),
        ("GET", "v1/trailers", None, "api"),
        ("GET", "clips", None, "api"),
        ("GET", "transactions", None, "api"),
        ("GET", f"show/{sample_show_id}", None, "api"),
        ("GET", "search?q=warrior", None, "api"),
        ("GET", "user/preferences", None, "api"),
        ("POST", "user/preferences", {"languageId": 1}, "api"),
        ("GET", "trailer", None, "api"),
        ("GET", f"trailer?id={trailer_id}", None, "api"),
        ("POST", "trailer", {"id": trailer_id}, "api"),
        ("POST", "fcm-token", {"token": "security-assessment-probe"}, "api"),
        ("POST", "review", {"rating": 5, "feedback": "security assessment probe"}, "api"),
        ("POST", "subscription/cancel", {"reason": "security-assessment-probe"}, "api"),
        ("PUT", "session", {"deeplink": f"https://www.reelsaga.in/show/{sample_show_id}"}, "api"),
        ("POST", "vendor-trace-log", {
            "vendorName": "okhttp",
            "methodName": "security-probe",
            "startTime": str(int(time.time() * 1000) - 1000),
            "endTime": str(int(time.time() * 1000)),
        }, "api"),
        ("POST", "appsflyer-deeplink", {"af_adset": str(sample_show_id)}, "api"),
        ("POST", "user/verify", {"mobile": "9999999999", "otp": "000000"}, "api"),
    ]

    coverage: list[dict] = []

    save_json(resp_dir / "auth-token.json", client.auth_response)
    coverage.append(_record("POST", "auth/token", 200, client.auth_response, "api", "obtained at session create"))

    for method, path, body, host in probes:
        if method == "GET":
            code, data = client.get(path)
        elif method == "POST":
            code, data = client.post(path, body or {})
        else:
            code, data = client.put(path, body or {})

        slug = _slug(method, path)
        save_json(resp_dir / f"{slug}.json", _wrap(code, data))
        entry = _record(method, path, code, data, host, None)
        coverage.append(entry)
        print(f"  api {method} {path} -> HTTP {code} [{entry['status']}]")

    third_party = [
        ("MSG91", f"{MSG91_BASE}/api/v5/widget/sendOtpMobile", "POST"),
        ("MSG91", f"{MSG91_BASE}/api/v5/widget/verifyOtp", "POST"),
        ("MSG91", f"{MSG91_BASE}/api/v5/widget/retryOtp", "POST"),
        ("Razorpay", f"{RAZORPAY_BASE}/v1/payments/", "GET"),
        ("Razorpay", f"{RAZORPAY_BASE}/v1/payments/create/checkout/json", "POST"),
        ("Razorpay", f"{RAZORPAY_BASE}/v1/track", "POST"),
    ]
    for name, url, method in third_party:
        code, raw = fetch_url(url) if method == "GET" else _probe_post(url)
        slug = _slug(method, url.split("//", 1)[-1])
        save_json(resp_dir / f"external-{slug}.json", {"httpStatus": code, "body": raw[:2000] if isinstance(raw, str) else raw})
        coverage.append({
            "host": name,
            "method": method,
            "path": url,
            "httpStatus": code,
            "status": "external" if code < 500 else "error",
            "note": "Third-party; requires widget token or Razorpay key from Remote Config",
        })
        print(f"  {name} {method} {url.split('/')[-1]} -> HTTP {code}")

    ok = sum(1 for c in coverage if c["status"] in ("ok", "partial", "external"))
    save_json(out / "coverage.json", {
        "probedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "total": len(coverage),
        "reachable": ok,
        "endpoints": coverage,
    })
    print(f"  api: {ok}/{len(coverage)} endpoints documented")


def _wrap(code: int, data: dict | str) -> dict:
    if isinstance(data, dict):
        return {"httpStatus": code, **data}
    return {"httpStatus": code, "raw": str(data)[:4000]}


def _record(method: str, path: str, code: int, data: dict | str, host: str, note: str | None) -> dict:
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
        note = note or "No route on api.reelsaga.in (may be deprecated or client-internal name)"

    return {
        "host": host,
        "method": method,
        "path": path,
        "httpStatus": code,
        "status": status,
        "success": data.get("success") if isinstance(data, dict) else None,
        "message": message,
        "note": note,
    }


def _slug(method: str, path: str) -> str:
    s = re.sub(r"https?://[^/]+/", "", path)
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return f"{method.lower()}-{s}"[:80]


def _probe_post(url: str) -> tuple[int, str]:
    req = urllib.request.Request(
        url,
        data=json.dumps({}).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace")[:2000]
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace")[:2000]
