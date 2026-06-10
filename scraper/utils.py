from __future__ import annotations

import json
import re
from pathlib import Path


def slugify(name: str, max_len: int = 60) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", (name or "show").lower()).strip("-")
    return s[:max_len] if s else "show"


def show_filename(show_id: int, name: str) -> str:
    return f"{show_id}-{slugify(name)}.json"


def save_json(path: Path, data: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))
