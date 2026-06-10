from __future__ import annotations

import re
import urllib.request
from pathlib import Path

from reelsaga_scraper.client import ApiClient, fetch_url
from reelsaga_scraper.utils import save_json, show_filename, slugify

WEB = "https://www.reelsaga.in"


def scrape_content(data_dir: Path, client: ApiClient) -> None:
    content = data_dir / "content"
    shows_dir = content / "shows"
    shows_dir.mkdir(parents=True, exist_ok=True)
    for sub in ("home", "trailers", "reels", "lists", "search"):
        (content / sub).mkdir(parents=True, exist_ok=True)
    media = data_dir / "media"
    (media / "thumbnails").mkdir(parents=True, exist_ok=True)
    (media / "website").mkdir(parents=True, exist_ok=True)

    endpoints = [
        ("config", content / "home" / "config.json"),
        ("v1/home/config", content / "home" / "tabs.json"),
        ("v1/home", content / "home" / "feed.json"),
        ("v1/trailers", content / "trailers" / "all-trailers.json"),
        ("clips", content / "reels" / "all-clips.json"),
        ("shows?type=trending", content / "lists" / "trending.json"),
        ("shows?type=popular", content / "lists" / "popular.json"),
        ("shows?type=new", content / "lists" / "new.json"),
        ("shows?type=recommended", content / "lists" / "recommended.json"),
        ("shows?type=all", content / "lists" / "all-shows.json"),
    ]

    parsed: dict = {}
    for ep, dest in endpoints:
        code, data = client.get(ep)
        save_json(dest, data if isinstance(data, dict) else {"httpStatus": code, "raw": data})
        if isinstance(data, dict):
            parsed[ep] = data
        print(f"  content/{dest.relative_to(data_dir)} -> HTTP {code}")

    searches = {}
    for q in ["warrior", "love", "revenge", "teacher", "ceo", "billionaire"]:
        code, data = client.get(f"search?q={q}")
        searches[q] = data
        print(f"  search?q={q} -> HTTP {code}")
    save_json(content / "search" / "queries.json", searches)

    show_ids = _collect_ids(parsed, searches)
    save_json(shows_dir / "all-show-ids.json", {"count": len(show_ids), "ids": show_ids})

    # Remove old numeric-only filenames
    for old in shows_dir.glob("[0-9]*.json"):
        if old.name in ("index.json", "all-show-ids.json"):
            continue
        if re.fullmatch(r"\d+\.json", old.name):
            old.unlink()

    show_details = []
    thumb_urls: set[str] = set()
    for sid in show_ids:
        code, data = client.get(f"show/{sid}")
        if not isinstance(data, dict) or not data.get("success"):
            continue
        show = data.get("data", {}).get("show") or {}
        name = show.get("name") or "show"
        dest = shows_dir / show_filename(sid, name)
        save_json(dest, data)
        show_details.append(data)
        pic = show.get("pic") or show.get("thumbnail")
        if pic:
            thumb_urls.add(pic)
        for vid in show.get("videos") or show.get("episodes") or []:
            if vid.get("thumbnail"):
                thumb_urls.add(vid["thumbnail"])
        print(f"  show/{sid} -> {dest.name}")

    index = _build_index(show_details)
    save_json(shows_dir / "index.json", {"count": len(index), "shows": index})

    for key in ("v1/trailers", "clips"):
        d = parsed.get(key, {}).get("data", {})
        for item in d.get("trailers") or d.get("shows") or []:
            if item.get("thumbnail"):
                thumb_urls.add(item["thumbnail"])

    downloaded = []
    for i, url in enumerate(sorted(thumb_urls)[:150]):
        name = url.split("/")[-1] or f"thumb-{i}.webp"
        dest = media / "thumbnails" / name
        if _download(url, dest):
            downloaded.append({"url": url, "file": str(dest.relative_to(data_dir))})
    save_json(media / "thumbnails-index.json", {
        "attempted": min(len(thumb_urls), 150),
        "totalUrls": len(thumb_urls),
        "downloaded": downloaded,
    })

    _, html = fetch_url(WEB)
    website_shows = []
    for m in re.finditer(r'"src":"/assets/show-(\d+)\.webp"', html):
        website_shows.append({"id": int(m.group(1)), "banner": f"{WEB}/assets/show-{m.group(1)}.webp"})
        _download(website_shows[-1]["banner"], media / "website" / f"show-{m.group(1)}.webp")
    save_json(media / "website" / "recommended-shows.json", {"source": WEB, "shows": website_shows})

    trailers = parsed.get("v1/trailers", {}).get("data", {}).get("trailers") or []
    clips = parsed.get("clips", {}).get("data", {}).get("shows") or []
    save_json(content / "SUMMARY.json", {
        "uniqueShowsScraped": len(show_ids),
        "showDetailsFetched": len(show_details),
        "trailers": len(trailers),
        "reelsClips": len(clips),
        "showFilesNamedAs": "{id}-{slug}.json",
    })
    print(f"  content: {len(show_details)} shows saved by name")


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


def _download(url: str, dest: Path) -> bool:
    if dest.exists() and dest.stat().st_size > 0:
        return True
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "ReelSaga-Security-Assessment/1.0"})
        with urllib.request.urlopen(req, timeout=60) as resp:
            dest.write_bytes(resp.read())
        return True
    except Exception:
        return False
