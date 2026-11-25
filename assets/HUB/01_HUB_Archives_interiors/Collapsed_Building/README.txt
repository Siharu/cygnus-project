DRIFTER — COLLAPSED BUILDING ASSET PACK

Contents
- Shell atlas: 1536x1024 RGBA, 4 columns x 2 rows; cell size 384x512.
- Props atlas: 1536x1024 RGBA, 3 columns x 2 rows; cell size 512x512.
- Combined atlas: 1536x2048 RGBA; shell atlas above props atlas.
- 14 individual transparent RGBA PNG sprites.
- manifest.json with source cell/crop, asset pixel size, and pivot hints.

Original generated sprite scale is preserved; sprites are not enlarged just to fill cells.
The render is a visual approximation of the stated metre dimensions; final in-engine scale should be calibrated against your DRIFTER tile scale.

Integrated HUB folder layout:
  Shell/              — 8 individual shell pieces
  Props/              — 6 individual props
  Atlases_Optional/   — shell, props, and combined atlases
  manifest.json       — asset dimensions, pivots, and atlas metadata
