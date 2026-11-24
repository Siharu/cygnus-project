#!/usr/bin/env python3
"""
Split src/WNCORE_Station_01.html (one 7.9 MB file) into small editable pieces.

Run from anywhere inside the repo:

    python3 scripts/modularize.py            # build src/station/ + assets/game/
    python3 scripts/modularize.py --force    # overwrite a previous run

What it makes (your original file is NOT touched, it stays as a fallback):

    src/station/index.html   page shell (markup, loads three.js, then main.js)
    src/station/style.css    all the CSS
    src/station/main.js      the game code (the old  async function boot(A,META){...} )
    src/station/assets.js    one line per image -> real file path
    src/station/meta.js      sprite metadata (sizes, anchors, glows), one asset per line
    assets/game/*.png|jpg    every base64 image, decoded into a real image file

Because it is now a real module, open it through a web server, not by double-clicking:
    python3 -m http.server 8000      then visit  /src/station/index.html
(Vercel / GitHub Pages already do this.)
"""
import argparse
import base64
import json
import re
import sys
from pathlib import Path

SRC_NAME = "WNCORE_Station_01.html"
EXT = {"png": "png", "jpeg": "jpg", "jpg": "jpg", "gif": "gif", "webp": "webp"}


def repo_root() -> Path:
    for p in [Path.cwd(), *Path.cwd().parents]:
        if (p / "src" / SRC_NAME).exists():
            return p
    sys.exit(f"Could not find src/{SRC_NAME}. Run this from inside the repo.")


def between(text: str, start_pat: str, end_pat: str, start_at: int = 0):
    """Return (inner_text, index_after_end) for the first start..end pair at/after start_at."""
    m1 = re.compile(start_pat).search(text, start_at)
    if not m1:
        sys.exit(f"Could not find: {start_pat}")
    m2 = re.compile(end_pat).search(text, m1.end())
    if not m2:
        sys.exit(f"Could not find: {end_pat}")
    return text[m1.end():m2.start()], m2.end(), m1.start()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true", help="overwrite previous output")
    args = ap.parse_args()

    root = repo_root()
    src = root / "src" / SRC_NAME
    out = root / "src" / "station"
    img_dir = root / "assets" / "game"

    if out.exists() and not args.force:
        sys.exit(f"{out.relative_to(root)} already exists. Use --force to rebuild it.")
    out.mkdir(parents=True, exist_ok=True)
    img_dir.mkdir(parents=True, exist_ok=True)

    html = src.read_text(encoding="utf-8")
    print(f"read {src.relative_to(root)}  ({len(html)/1e6:.1f} MB)")

    # ---- 1. CSS -------------------------------------------------------------
    css, _, style_start = between(html, r"<style>", r"</style>")

    # ---- 2. the two <script> blocks (the first <script src=...three.js> is skipped) ----
    code_js, after_code, code_start = between(html, r"<script>", r"</script>")
    blob_js, _, _ = between(html, r"<script>", r"</script>", after_code)

    # ---- 3. markup between </style></head><body> and the first script tag --------
    head_end = html.index("</style>") + len("</style>")
    body_start = html.index("<body>") + len("<body>")
    three_tag = re.search(r'<script src="[^"]*three[^"]*"></script>', html)
    if not three_tag:
        sys.exit("Could not find the three.js <script src=...> tag.")
    markup = html[body_start:three_tag.start()].strip()
    head_inner = html[html.index("<head>") + len("<head>"):style_start]
    head_inner = head_inner.strip()

    # ---- 4. split the asset blob: META line, A[...] lines, leftover (boot call) ------
    a_re = re.compile(r"^A\['([^']+)'\]='data:image/([a-z]+);base64,([A-Za-z0-9+/=]+)';?\s*$")
    meta_json = None
    leftovers = []
    assets = {}  # key -> filename
    for line in blob_js.splitlines():
        s = line.strip()
        if not s or s.startswith("/* ===== ASSET BLOB") or s == "const A={};":
            continue
        if s.startswith("const META="):
            meta_json = s[len("const META="):].rstrip(";")
            continue
        m = a_re.match(s)
        if m:
            key, mime, b64 = m.groups()
            ext = EXT.get(mime, mime)
            fname = f"{key}.{ext}"
            (img_dir / fname).write_bytes(base64.b64decode(b64))
            assets[key] = fname
            continue
        leftovers.append(line)

    if meta_json is None:
        sys.exit("Could not find the 'const META=' line.")
    if not assets:
        sys.exit("No A['...']='data:image/...' lines found.")
    meta = json.loads(meta_json)

    # ---- 5. write files -------------------------------------------------------
    (out / "style.css").write_text(css.strip() + "\n", encoding="utf-8")

    lines = [
        "// Image paths. Each key is what the game loads as  IM[key].",
        "// To swap an image, replace the file in assets/game/ (keep the name).",
        "const u = f => new URL('../../assets/game/' + f, import.meta.url).href;",
        "export const A = {",
    ]
    for key, fname in assets.items():
        lines.append(f"  '{key}': u('{fname}'),")
    lines.append("};")
    (out / "assets.js").write_text("\n".join(lines) + "\n", encoding="utf-8")

    mlines = ["// Sprite metadata: w/h = source px, ax = anchor x, glows/top = light + beacon points.", "export const META = {"]
    items = list(meta.items())
    for i, (k, v) in enumerate(items):
        mlines.append(f"  {json.dumps(k)}: {json.dumps(v, separators=(',', ':'))}{',' if i < len(items) - 1 else ''}")
    mlines.append("};")
    (out / "meta.js").write_text("\n".join(mlines) + "\n", encoding="utf-8")

    boot_call = "\n".join(leftovers).strip()
    main_js = (
        "import { A } from './assets.js';\n"
        "import { META } from './meta.js';\n"
        "// THREE comes from the <script> tag in index.html (global).\n"
        + code_js.strip("\n") + "\n\n"
        + boot_call + "\n"
    )
    (out / "main.js").write_text(main_js, encoding="utf-8")

    index = (
        "<!DOCTYPE html><html lang=\"en\"><head>"
        + head_inner
        + "\n<link rel=\"stylesheet\" href=\"style.css\">\n</head><body>\n"
        + markup
        + "\n"
        + three_tag.group(0)
        + "\n<script type=\"module\" src=\"main.js\"></script>\n</body></html>\n"
    )
    (out / "index.html").write_text(index, encoding="utf-8")

    # ---- 6. report ------------------------------------------------------------
    print()
    for p in sorted(out.iterdir()):
        print(f"  src/station/{p.name:<12} {p.stat().st_size/1024:>8.1f} KB")
    total = sum(p.stat().st_size for p in img_dir.iterdir())
    print(f"  assets/game/    {len(assets)} images, {total/1e6:.1f} MB")
    if leftovers == [] or "boot(" not in boot_call:
        print("\nWARNING: did not find the boot(A,META) call, check main.js ending.")
    print("\nDone. Test it:  python3 -m http.server 8000   ->   /src/station/index.html")


if __name__ == "__main__":
    main()
