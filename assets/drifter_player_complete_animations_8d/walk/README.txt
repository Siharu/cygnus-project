# drifter_player — walking 8D

- Sprite ID: `drifter_player`
- Animation: `walk`
- Frame size: **64 × 96 px**
- Directions: **N, NE, E, SE, S, SW, W, NW**
- Frames: **4 per direction (32 total)**
- Atlas layout: **4 columns × 8 rows**; directions top-to-bottom, frames left-to-right
- Format: transparent RGBA PNG

Files:
- `drifter_player_walk_8d.png` — engine atlas (256 × 768 px)
- `drifter_player_walk_8d_preview.png` — enlarged visual preview
- `N_01.png` … `NW_04.png` — individual 64 × 96 frame PNGs
- `manifest.json` — frame coordinates and metadata

## Important
This is a cleaned prototype extraction from a generated concept sheet, not a hand-pixelled final animation. The background checker pattern has been keyed out and each frame normalized to a common height/baseline. Please test it in-engine and review the loop timing; generated poses may still have small inconsistencies between frames.
