#!/usr/bin/env python3
"""Extract the complete Shu + Bimo source pack into individual repository files.

Input:  assets/companion/SHU_BIMO_8D_animation_asset_pack.zip
Output: assets/companion/SHU_BIMO_sprite_pack/

Preserves every original archive path below SHU_BIMO_sprite_pack/, including
both characters, all animation frames, previous atlases, manifests, previews,
and the README. No image is resized, recompressed, or renamed.
"""
from collections import Counter
from pathlib import Path, PurePosixPath
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = ROOT / "assets/companion/SHU_BIMO_8D_animation_asset_pack.zip"
DEST = ROOT / "assets/companion"
PREFIX = "SHU_BIMO_sprite_pack/"
EXPECTED_FILES = 359


def main():
    if not ARCHIVE.is_file():
        raise SystemExit(f"Missing source archive: {ARCHIVE}")

    with ZipFile(ARCHIVE) as zf:
        members = [
            info for info in zf.infolist()
            if not info.is_dir() and info.filename.startswith(PREFIX)
        ]
        names = [info.filename for info in members]
        if len(members) != EXPECTED_FILES:
            raise SystemExit(f"Expected {EXPECTED_FILES} files below {PREFIX}; found {len(members)}")
        if len(names) != len(set(names)):
            raise SystemExit("Duplicate archive paths found; refusing ambiguous extraction")

        for info in members:
            rel = PurePosixPath(info.filename)
            if rel.is_absolute() or any(part in ("", ".", "..") for part in rel.parts):
                raise SystemExit(f"Unsafe archive path: {info.filename}")
            if rel.parts[0] != "SHU_BIMO_sprite_pack":
                raise SystemExit(f"Unexpected archive root: {info.filename}")

            target = DEST.joinpath(*rel.parts)
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(zf.read(info))

    counts = Counter(Path(name).suffix.lower() for name in names)
    print(f"Extracted {len(members)} files into assets/companion/SHU_BIMO_sprite_pack/")
    print("Types: " + ", ".join(f"{ext or '[none]'}={count}" for ext, count in sorted(counts.items())))
    print("Included shu/, bimo/, previous atlases, previews, manifests, and README.")


if __name__ == "__main__":
    main()
