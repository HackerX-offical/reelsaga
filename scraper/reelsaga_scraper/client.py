from __future__ import annotations

import json
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field

API = "https://api.reelsaga.in"
FIS_URL = "https://firebaseinstallations.googleapis.com/v1/projects/reel-saga-app/installations"
API_KEY = "AIzaSyBwKRNfSG-VXWiWVkD0pFG7PW6dcY8MMzM"
APP_ID = "1:544458187694:android:d8ae8c1fbdcf21fc571e3f"


@dataclass
class ApiClient:
    headers: dict
    auth_response: dict = field(default_factory=dict)
    firebase_fid: str = ""

    @classmethod
    def create(cls, device_id: str = "security-scrape-001") -> ApiClient:
        fid = f"scrape{int(time.time())}"
        _, fis = http(
            "POST",
            FIS_URL,
            {"fid": fid, "authVersion": "FIS_v2", "appId": APP_ID, "sdkVersion": "o:android security-assessment"},
            {"Content-Type": "application/json", "x-goog-api-key": API_KEY},
        )
        real_fid = json.loads(fis)["fid"]
        base = {
            "Platform": "android",
            "Version-Code": "80501",
            "Version-Name": "8.5.1",
            "Content-Type": "application/json",
        }
        body = {
            "fId": real_fid,
            "aId": "00000000-0000-0000-0000-000000000000",
            "deviceId": device_id,
            "model": "Pixel 7",
            "manufacturer": "Google",
            "device": "panther",
            "brand": "google",
            "shortVersion": "8.5.1",
            "longVersion": "80501",
            "osVersion": "14",
            "locale": "en_IN",
        }
        code, tok = http("POST", f"{API}/auth/token", body, base)
        auth = json.loads(tok) if tok else {"httpStatus": code, "raw": tok}
        access = auth.get("data", {}).get("accessToken", "")
        return cls(
            headers={**base, "Authorization": f"Bearer {access}"},
            auth_response=auth,
            firebase_fid=real_fid,
        )

    def request(self, method: str, path: str, body: dict | None = None) -> tuple[int, dict | str]:
        url = path if path.startswith("http") else f"{API}/{path.lstrip('/')}"
        code, raw = http(method, url, body, self.headers)
        try:
            return code, json.loads(raw)
        except json.JSONDecodeError:
            return code, raw

    def get(self, path: str) -> tuple[int, dict | str]:
        return self.request("GET", path)

    def post(self, path: str, body: dict) -> tuple[int, dict | str]:
        return self.request("POST", path, body)

    def put(self, path: str, body: dict) -> tuple[int, dict | str]:
        return self.request("PUT", path, body)


def http(method: str, url: str, body: dict | None = None, headers: dict | None = None) -> tuple[int, str]:
    hdrs = headers or {}
    payload = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=payload, headers=hdrs, method=method)
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace")


def fetch_url(url: str) -> tuple[int, str]:
    req = urllib.request.Request(url, headers={"User-Agent": "ReelSaga-Security-Assessment/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace")
