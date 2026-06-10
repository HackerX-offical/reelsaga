#!/usr/bin/env python3
"""ReelSaga scraper CLI."""
from __future__ import annotations

import argparse
import time
from pathlib import Path

from scraper import (
    scrape_business,
    scrape_company,
    scrape_content,
    scrape_endpoints,
    scrape_secrets,
    scrape_users,
)
from scraper.client import ApiClient
from scraper.utils import load_json, save_json

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"


def main() -> None:
    parser = argparse.ArgumentParser(description="ReelSaga security assessment scraper")
    parser.add_argument("--data-dir", type=Path, default=DATA, help="Output directory")
    parser.add_argument(
        "--only",
        choices=["secrets", "content", "users", "api", "company", "business", "all"],
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
    needs_auth = args.only in ("all", "content", "users", "business", "api")
    if needs_auth:
        print("[auth] Creating anonymous API session...")
        client = ApiClient.create()

    if args.only in ("all", "content"):
        print("[content]")
        scrape_content(data_dir, client)
        manifest["steps"].append("content")

    if args.only in ("all", "users"):
        print("[users]")
        scrape_users(data_dir, client)
        manifest["steps"].append("users")

    if args.only in ("all", "api"):
        print("[api]")
        scrape_endpoints(data_dir, client)
        manifest["steps"].append("api")

    if args.only in ("all", "business"):
        print("[business]")
        scrape_business(data_dir, client)
        manifest["steps"].append("business")

    if args.only in ("all", "company"):
        print("[company]")
        scrape_company(data_dir)
        manifest["steps"].append("company")

    summary: dict = {}
    shows_index = data_dir / "shows" / "index.json"
    if shows_index.exists():
        summary["showCount"] = len(load_json(shows_index).get("shows", []))
    coverage_path = data_dir / "api-coverage.json"
    if coverage_path.exists():
        cov = load_json(coverage_path)
        summary["apiEndpoints"] = {"total": cov.get("total"), "reachable": cov.get("reachable")}
    manifest["summary"] = summary
    save_json(data_dir / "scrape-manifest.json", manifest)

    print(f"\nDone. Data: {data_dir}")
    if summary.get("showCount"):
        print(f"  shows: {summary['showCount']} indexed")
    if summary.get("apiEndpoints"):
        ae = summary["apiEndpoints"]
        print(f"  api: {ae.get('reachable')}/{ae.get('total')} endpoints documented")


if __name__ == "__main__":
    main()
