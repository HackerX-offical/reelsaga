#!/usr/bin/env python3
"""ReelSaga scraper CLI — run full or partial scrapes."""
from __future__ import annotations

import argparse
import time
from pathlib import Path

from reelsaga_scraper.client import ApiClient
from reelsaga_scraper.scrapers import (
    scrape_business,
    scrape_company,
    scrape_content,
    scrape_secrets,
    scrape_users,
)
from reelsaga_scraper.utils import load_json, save_json

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data"


def main() -> None:
    parser = argparse.ArgumentParser(description="ReelSaga security assessment scraper")
    parser.add_argument("--data-dir", type=Path, default=DATA, help="Output directory")
    parser.add_argument(
        "--only",
        choices=["secrets", "content", "users", "company", "business", "all"],
        default="all",
    )
    args = parser.parse_args()
    data_dir: Path = args.data_dir
    data_dir.mkdir(parents=True, exist_ok=True)

    manifest = {"scrapedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "steps": []}
    print(f"ReelSaga scraper → {data_dir}\n")

    if args.only in ("all", "secrets"):
        print("[secrets]")
        scrape_secrets(data_dir)
        manifest["steps"].append("secrets")

    client = None
    session_meta = None
    if args.only in ("all", "content", "users", "business"):
        print("[auth] Creating anonymous API session...")
        client = ApiClient.create()
        session_meta = {"note": "Anonymous JWT via POST /auth/token + Firebase fId"}

    if args.only in ("all", "content"):
        print("[content]")
        scrape_content(data_dir, client)
        manifest["steps"].append("content")

    if args.only in ("all", "users"):
        print("[users]")
        scrape_users(data_dir, client, session_meta)
        manifest["steps"].append("users")

    if args.only in ("all", "company"):
        print("[company]")
        scrape_company(data_dir)
        manifest["steps"].append("company")

    if args.only in ("all", "business"):
        print("[business]")
        scrape_business(data_dir, client)
        manifest["steps"].append("business")

    # Post-run summary for coverage review
    summary: dict = {}
    summary_path = data_dir / "content" / "SUMMARY.json"
    if summary_path.exists():
        summary["content"] = load_json(summary_path)
    shows_index = data_dir / "content" / "shows" / "index.json"
    if shows_index.exists():
        summary["showCount"] = len(load_json(shows_index).get("shows", []))
    manifest["summary"] = summary
    save_json(data_dir / "scrape-manifest.json", manifest)
    print(f"\nDone. Data: {data_dir}")
    if summary:
        c = summary.get("content", {})
        print(
            f"  shows: {summary.get('showCount', '?')} indexed, "
            f"{c.get('showDetailsFetched', '?')} detail files, "
            f"{c.get('trailers', '?')} trailers, {c.get('reelsClips', '?')} clips"
        )


if __name__ == "__main__":
    main()
