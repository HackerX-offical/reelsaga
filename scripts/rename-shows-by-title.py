#!/usr/bin/env python3
"""One-time: rename show/{id}.json → {id}-{slug}.json"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SHOWS = ROOT / "data" / "content" / "shows"


def slugify(name: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", (name or "show").lower()).strip("-")
    return s[:60] or "show"


def main() -> None:
    for path in list(SHOWS.glob("*.json")):
        if path.name in ("index.json", "all-show-ids.json"):
            continue
        m = re.fullmatch(r"(\d+)\.json", path.name)
        if not m:
            continue
        data = json.loads(path.read_text())
        show = data.get("data", {}).get("show") or {}
        sid = int(m.group(1))
        new_name = f"{sid}-{slugify(show.get('name', 'show'))}.json"
        path.rename(SHOWS / new_name)
        print(f"  {path.name} -> {new_name}")


if __name__ == "__main__":
    main()
