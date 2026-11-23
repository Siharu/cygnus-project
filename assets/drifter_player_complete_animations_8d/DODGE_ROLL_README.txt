# drifter_player — 8-direction dodge roll

- Animation: `dodge_roll`
- Frame size: 64 × 96 px
- Directions: N, NE, E, SE, S, SW, W, NW
- Frames: 8 per direction (64 total)
- Atlas: `drifter_player_dodge_roll_8d.png` (8 columns × 8 rows)
- Animated preview: `dodge_roll_preview.gif`
- Enlarged sheet: `dodge_roll_preview.png`
- Individual frames: `dodge_roll/{direction}_{frame:02d}.png`
- Format: transparent RGBA PNG

The frames are built from the supplied original directional walking sprites.
The existing character pixels, palette and equipment are retained; the body is
transformed around a waist pivot through anticipation, tuck, roll and recovery.
No weapon or new prop is added.

This is a sprite-transformed roll prototype, not hand-redrawn skeletal animation.
Review the preview and test timing/collision/root motion in-engine.
