#!/usr/bin/env python3
"""Build release metadata and immutable assets, retaining recent deployed versions."""
import hashlib
import json
import os
import re
import subprocess
from pathlib import Path
from urllib.parse import urlsplit

root = Path.cwd()
commit = os.environ["GITHUB_SHA"]
release = f"{commit}-{os.environ['GITHUB_RUN_NUMBER']}-{os.environ['GITHUB_RUN_ATTEMPT']}"
if not re.fullmatch(r"[0-9a-f]{40}-[0-9]+-[0-9]+", release):
    raise ValueError("Invalid release identifier")
manifest = dict(version=release, run=int(os.environ["GITHUB_RUN_NUMBER"]), attempt=int(os.environ["GITHUB_RUN_ATTEMPT"]))
tag = re.compile(r'<(?:script|link)\b[^>]*>', re.I)
attr = re.compile(r'\b(src|href)=(["\'])([^"\']+)\2', re.I)

def read(revision, path):
    return subprocess.check_output(["git", "show", f"{revision}:{path}"])

def build_html(revision, name, stamp=False):
    content = read(revision, name).decode("utf-8")
    def rewrite(match):
        def replace(m):
            url = urlsplit(m[3])
            if url.scheme or url.netloc or url.path.startswith("/") or url.path.startswith("#"):
                return m[0]
            source = (root / url.path).resolve()
            if not source.is_relative_to(root) or source.suffix.lower() not in (".js", ".css"):
                return m[0]
            rel = source.relative_to(root).as_posix()
            raw = read(revision, rel)
            digest = hashlib.sha256(raw).hexdigest()[:24]
            dest = source.with_name(source.stem + "." + digest + source.suffix)
            dest.parent.mkdir(parents=True, exist_ok=True)
            if not dest.exists():
                dest.write_bytes(raw)
            elif dest.read_bytes() != raw:
                raise ValueError("Asset hash collision: " + str(dest))
            return f"{m[1]}={m[2]}{dest.relative_to(root).as_posix()}{m[2]}"
        return attr.sub(replace, match[0])
    content = tag.sub(rewrite, content)
    if stamp:
        if content.count("<head>") != 1:
            raise ValueError(f"Cannot stamp {name}")
        meta = f'<meta name="studio-release" content="{release}">'
        content = content.replace("<head>", "<head>" + meta, 1)
    return content

# Preserve assets referenced by recent main revisions. Deduplicated by content hash.
revisions = subprocess.check_output(["git", "rev-list", "--first-parent", "-n", "12", commit], text=True).splitlines()
for revision in revisions:
    if revision == commit:
        continue
    try:
        build_html(revision, "index.html")
        historical_login = build_html(revision, "login.html")
        (root / f"login.{revision}.html").write_text(historical_login, encoding="utf-8")
    except subprocess.CalledProcessError:
        print("Historical revision incomplete; skipped", revision)
for name in ("index.html", "login.html"):
    (root / name).write_text(build_html(commit, name, stamp=True), encoding="utf-8")
(root / f"login.{commit}.html").write_text(build_html(commit, "login.html"), encoding="utf-8")
(root / "version.json").write_text(json.dumps(manifest) + "\n", encoding="utf-8")
print("Prepared release", release)
