DRIFTER — Terrain Library: Wind-Animated Grass Add-on

CONTENTS
- Original_Terrain_Library/: unchanged contents of the supplied terrain ZIP.
- Animated_Grass/: four new 4-frame vegetation animations:
  1) grass_tuft
  2) tall_reeds
  3) broadleaf_clump
  4) flowering_grass
- Each species folder contains:
  - four separate transparent PNG frames
  - one horizontal 4-frame atlas
- DRIFTER_Animated_Grass_4x4_Atlas.png: combined atlas, 4 columns x 4 rows.
- animation_manifest.json: frame paths, frame dimensions and suggested timing.

ANIMATION NOTES
- All frames use equal 384x256 px cells.
- Frames are bottom-centered to keep the plant base/root anchored.
- Suggested looping playback: 180 ms per frame (~5.6 fps).
- Use per-instance phase offsets and slight speed variation to avoid synchronized movement.
- Keep ground/soil/asphalt/pavement textures static; animate only the separate grass sprites.

TRANSPARENCY
- Generated magenta key background has been removed to RGBA transparency.
- Inspect edges before final shipping; this is a chroma-key extraction from a generated sprite sheet.
