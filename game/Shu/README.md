# SHU sprite assets

This directory is reserved for SHU's in-game companion sprites.

## Extracted source package

The accompanying `SHU_sprite_assets.zip` contains:
- One transparent 96x96 PNG per extracted frame, grouped by animation and direction.
- One 8-direction atlas per animation.
- The generated composite source sheet for reference.
- `manifest.json` with per-direction frame counts.

## Folder layout

```
game/Shu/
  Idle/   N, NE, E, SE, S, SW, W, NW frame PNGs + idle_8dir_atlas.png
  Walk/   N, NE, E, SE, S, SW, W, NW frame PNGs + walk_8dir_atlas.png
  Run/    N, NE, E, SE, S, SW, W, NW frame PNGs + run_8dir_atlas.png
  Sit/
  Groom/
  Sleep/
  Alert/
  Source/
  manifest.json
```

## Important source limitations

These are cleanly isolated crops from the generated composite, not repaired/redrawn animation frames. The source image does not contain a consistent frame count for every direction: RUN has 4–6 extracted frames depending on direction; IDLE and WALK have 5; SIT/GROOM/ALERT have 4; SLEEP has 3. Do not assume every cycle is a complete production animation until the missing frames are authored and each sequence is reviewed in-engine.

All frame PNGs use transparent backgrounds and a common 96x96 canvas. Pixel art was not rescaled.
