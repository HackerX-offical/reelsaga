from __future__ import annotations

import re
from pathlib import Path

from scraper.client import ApiClient
from scraper.utils import save_json, show_filename


def scrape_content(data_dir: Path, client: ApiClient) -> None:
    shows_dir = data_dir / "shows"
    shows_dir.mkdir(parents=True, exist_ok=True)
    for sub in ("home", "trailers", "reels", "lists", "search"):
        (data_dir / sub).mkdir(parents=True, exist_ok=True)

    endpoints = [
        ("config", data_dir / "home" / "config.json"),
        ("v1/home/config", data_dir / "home" / "tabs.json"),
        ("v1/home", data_dir / "home" / "feed.json"),
        ("v1/trailers", data_dir / "trailers" / "all-trailers.json"),
        ("clips", data_dir / "reels" / "all-clips.json"),
        ("shows?type=trending", data_dir / "lists" / "trending.json"),
        ("shows?type=popular", data_dir / "lists" / "popular.json"),
        ("shows?type=new", data_dir / "lists" / "new.json"),
        ("shows?type=recommended", data_dir / "lists" / "recommended.json"),
        ("shows?type=all", data_dir / "lists" / "all-shows.json"),
    ]

    parsed: dict = {}
    for ep, dest in endpoints:
        code, data = client.get(ep)
        save_json(dest, data if isinstance(data, dict) else {"httpStatus": code, "raw": data})
        if isinstance(data, dict):
            parsed[ep] = data
        print(f"  {dest.relative_to(data_dir)} -> HTTP {code}")

    searches = {}
    for q in ["warrior", "love", "revenge", "teacher", "ceo", "billionaire"]:
        code, data = client.get(f"search?q={q}")
        searches[q] = data
        print(f"  search?q={q} -> HTTP {code}")
    save_json(data_dir / "search" / "queries.json", searches)

    show_ids = _collect_ids(parsed, searches)
    save_json(shows_dir / "all-show-ids.json", {"count": len(show_ids), "ids": show_ids})

    for old in shows_dir.glob("[0-9]*.json"):
        if re.fullmatch(r"\d+\.json", old.name):
            old.unlink()

    show_details = []
    failed_ids = []
    for sid in show_ids:
        code, data = client.get(f"show/{sid}")
        if not isinstance(data, dict) or not data.get("success"):
            failed_ids.append({"id": sid, "httpStatus": code, "message": data})
            continue
        show = data.get("data", {}).get("show") or {}
        name = show.get("name") or "show"
        dest = shows_dir / show_filename(sid, name)
        save_json(dest, data)
        show_details.append(data)
        print(f"  show/{sid} -> {dest.name}")

    if failed_ids:
        save_json(shows_dir / "failed-ids.json", {"count": len(failed_ids), "failures": failed_ids})

    index = _build_index(show_details)
    save_json(shows_dir / "index.json", {"count": len(index), "shows": index})

    trailers = parsed.get("v1/trailers", {}).get("data", {}).get("trailers") or []
    clips = parsed.get("clips", {}).get("data", {}).get("shows") or []
    print(
        f"  content: {len(show_details)}/{len(show_ids)} shows, "
        f"{len(trailers)} trailers, {len(clips)} clips"
    )


def _collect_ids(parsed: dict, searches: dict) -> list[int]:
    ids: set[int] = set()

    def walk(obj):
        if isinstance(obj, dict):
            if isinstance(obj.get("id"), int) and obj.get("name"):
                ids.add(obj["id"])
            if isinstance(obj.get("showId"), int):
                ids.add(obj["showId"])
            for v in obj.values():
                walk(v)
        elif isinstance(obj, list):
            for i in obj:
                walk(i)

    for v in parsed.values():
        walk(v)
    for v in searches.values():
        walk(v)
    return sorted(ids)


def _build_index(show_details: list[dict]) -> list[dict]:
    index = []
    for detail in show_details:
        show = detail.get("data", {}).get("show") or {}
        if not show.get("id"):
            continue
        sid = show["id"]
        name = show.get("name") or "show"
        videos = show.get("videos") or show.get("episodes") or []
        index.append({
            "id": sid,
            "name": name,
            "file": show_filename(sid, name),
            "description": (show.get("description") or "")[:300],
            "episodeCount": len(videos),
            "freeEpisodesCount": show.get("freeEpisodesCount"),
            "watchCount": show.get("watchCount"),
            "shareCount": show.get("shareCount"),
            "thumbnail": show.get("pic") or show.get("thumbnail"),
            "languageId": show.get("languageId"),
        })
    return sorted(index, key=lambda x: x["id"])
