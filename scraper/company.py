from __future__ import annotations

import re
from pathlib import Path

from scraper.client import fetch_url
from scraper.utils import save_json

PLAY_STORE = "https://play.google.com/store/apps/details?id=in.reelsaga.android&hl=en"


def scrape_company(data_dir: Path) -> None:
    out = data_dir / "company"
    out.mkdir(parents=True, exist_ok=True)

    profile = {
        "legalName": "REELSAGA INNOVATIONS PRIVATE LIMITED",
        "brand": "ReelSaga",
        "cin": "U9000MH2024PTC434093",
        "gst": "27AAOCR0431P1ZX",
        "incorporation": "Maharashtra, India (2024)",
        "addresses": {
            "playStore": "905 Yarrow Chs Ltd, Nahar, Amrit Shakti, Chandivali, Mumbai, Maharashtra 400072, India",
            "website": "Boomerang Business Park B2/507, 5th Floor, Chandivali Road, Powai, Mumbai 400072, India",
        },
        "contacts": {
            "email": "contact@reelsaga.in",
            "supportEmail": "shanu.vivek@reelsaga.in",
            "phone": "+91 8655 354804",
            "website": "https://www.reelsaga.in/",
            "marketingSite": "https://reelsaga.co.in/",
        },
        "social": {
            "instagram": "https://www.instagram.com/reelsagaapp",
            "facebook": "https://www.facebook.com/share/1ATiQmXesD/",
            "linkedin": "https://www.linkedin.com/company/reelsaga",
            "twitter": "https://x.com/reelsaga_app",
        },
        "firebaseProject": "reel-saga-app",
        "packageName": "in.reelsaga.android",
    }
    save_json(out / "profile.json", profile)

    code, www_html = fetch_url("https://www.reelsaga.in/")
    save_json(out / "website-scrape.json", {
        "url": "https://www.reelsaga.in/",
        "httpStatus": code,
        "title": _meta(www_html, r"<title>([^<]+)</title>"),
        "phones": list(set(re.findall(r"tel:(\+?[0-9\s]+)", www_html))),
        "emails": list(set(re.findall(r"[\w.+-]+@reelsaga\.in", www_html))),
        "cinMentioned": "U9000MH2024PTC434093" in www_html,
    })

    code, ps_html = fetch_url(PLAY_STORE)
    installs = re.search(r"([\d,]+)\+?\s*Downloads", ps_html)
    rating = re.search(r'"[\d.]+"\s*stars', ps_html) or re.search(r"([\d.]+)\s*star", ps_html, re.I)
    save_json(out / "play-store.json", {
        "url": PLAY_STORE,
        "httpStatus": code,
        "appName": _meta(ps_html, r'"([^"]*ReelSaga[^"]*)"') or "ReelSaga",
        "developer": "ReelSaga Innovations",
        "downloadsHint": installs.group(1) if installs else None,
        "ratingHint": rating.group(1) if rating and rating.lastindex else None,
        "note": "Parsed from public Play Store HTML — exact metrics change over time",
    })
    print("  company: profile + website + play store")


def _meta(html: str, pattern: str) -> str | None:
    m = re.search(pattern, html, re.I)
    return m.group(1).strip() if m else None
