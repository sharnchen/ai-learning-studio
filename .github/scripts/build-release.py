#!/usr/bin/env python3
"""Stamp deployed HTML and immutable entry-point assets, without modifying sources in git."""
import json
import os
import re
import shutil
from pathlib import Path
from urllib.parse import urlsplit

root = Path.cwd()
release = f"{os.environ['GITHUB_SHA']}-{os.environ['GITHUB_RUN_NUMBER']}-{os.environ['GITHUB_RUN_ATTEMPT']}"
if not re.fullmatch(r"[0-9a-f]{40}-[0-9]+-[0-9]+", release):
    raise ValueError("Invalid release identifier")
manifest = dict(version=release, run=int(os.environ["GITHUB_RUN_NUMBER"]), attempt=int(os.environ["GITHUB_RUN_ATTEMPT"]))
tag = re.compile(r'<(?:script|link)\b[^>]*>', re.I)
attr = re.compile(r'\b(src|href)=(["\'])([^"\']+)\2', re.I)
def rewrite(match):
    def replace(m):
        url = urlsplit(m[3])
        if url.scheme or url.netloc or url.path.startswith("/") or url.path.startswith("#"):
            return m[0]
        source = (root / url.path).resolve()
        if not source.is_relative_to(root) or source.suffix.lower() not in (".js", ".css"):
            return m[0]
        if not source.is_file():
            raise FileNotFoundError(source)
        dest = source.with_name(source.stem + "." + release + source.suffix)
        shutil.copyfile(source, dest)
        return f"{m[1]}={m[2]}{dest.relative_to(root).as_posix()}{m[2]}"
    return attr.sub(replace, match[0])
for name in ("index.html", "login.html"):
    page = root / name
    content = page.read_text(encoding="utf-8")
    if content.count("<head>") != 1:
        raise ValueError(f"Cannot stamp {name}")
    meta = f'<meta name="studio-release" content="{release}">'
    content = content.replace("<head>", "<head>" + meta, 1)
    content = tag.sub(rewrite, content)
    page.write_text(content, encoding="utf-8")
    if name == "login.html":
        shutil.copyfile(page, root / f"login.{release}.html")
(root / "version.json").write_text(json.dumps(manifest) + "\n", encoding="utf-8")
print("Prepared release", release)
