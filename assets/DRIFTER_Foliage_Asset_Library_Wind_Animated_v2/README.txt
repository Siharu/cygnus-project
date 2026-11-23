DRIFTER — Wind-Animated Foliage Library

This add-on preserves the complete uploaded foliage library and adds four-frame wind animation variants for every individual foliage asset.

Folder structure:
- Original_Foliage_Library/: unchanged original ZIP contents.
- Wind_Animated_Foliage/<asset_name>/: four individual RGBA PNG frames plus a horizontal 4-frame atlas for that asset.
- animation_manifest.json: exact frame paths, source mapping, dimensions and suggested playback timing.

Animation:
- 4 frames per asset, looping.
- Suggested frame duration: 220 ms (about 4.55 FPS).
- Frames retain the original image dimensions and transparent background.
- Wind displacement is height-weighted: roots and lower trunks remain comparatively stable; upper foliage moves more.
- Use randomized phase offsets and small per-instance timing variations in-game to prevent synchronized motion.

Important:
- These are lightweight sprite-warp animation frames generated from the supplied source sprites, not hand-redrawn skeletal animation.
- Check each asset in-game at its final display scale. Tree canopies may benefit from stronger layered branch sway in a later pass.
