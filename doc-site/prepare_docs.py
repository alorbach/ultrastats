#!/usr/bin/env python3
"""Copy bundled docs from src/doc/en into doc-site/docs/ with links rewritten to the GitHub UI."""
from __future__ import annotations

import os
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = Path(__file__).resolve().parent / "docs"
REPO_URL = os.environ.get("GHP_REPO_URL", "https://github.com/alorbach/ultrastats").rstrip("/")

SOURCES: list[tuple[str, str]] = [
    ("src/doc/en/install.md", "install.md"),
    ("src/doc/en/changelog.md", "changelog.md"),
]


def _link_replacement(href: str, base: Path) -> str | None:
    if href.startswith(("http://", "https://", "mailto:", "#")):
        return None
    if not (href.startswith("../") or href.startswith("./")):
        return None
    combined = (base / href).resolve()
    try:
        rel = combined.relative_to(REPO_ROOT.resolve())
    except ValueError:
        return None
    target = REPO_ROOT / rel
    if not target.is_file():
        alt = REPO_ROOT / rel.name
        if alt.is_file():
            rel = Path(alt.name)
    return f"{REPO_URL}/blob/main/{rel.as_posix()}"


def rewrite_markdown_links(content: str, source_path: Path) -> str:
    base = source_path.parent

    def repl(m: re.Match[str]) -> str:
        href = m.group(1)
        new = _link_replacement(href, base)
        if new is None:
            return m.group(0)
        return f"]({new})"

    return re.sub(r"\]\(([^)]+)\)", repl, content)


def main() -> int:
    missing = [s for s, _ in SOURCES if not (REPO_ROOT / s).is_file()]
    if missing:
        print("Missing source files:", missing, file=sys.stderr)
        return 1
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for rel_src, out_name in SOURCES:
        src = REPO_ROOT / rel_src
        text = src.read_text(encoding="utf-8", errors="replace")
        out = rewrite_markdown_links(text, src)
        (OUT_DIR / out_name).write_text(out, encoding="utf-8", newline="\n")
        print(f"Wrote {OUT_DIR / out_name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
