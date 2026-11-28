# SHU + BIMO animation asset pack

This pack contains the supplied original atlases, their individually extracted frames, and organized 8-direction animation folders.

## Folder layout

- `shu/walk/<direction>/frame_00.png ... frame_07.png` — 64-frame, eight-direction cat walk set split from the generated 8x8 SHU-style walk atlas.
- `shu/run/<direction>/...` — SHU run folders. Right/left use the elongated locomotion poses from the original SHU atlas (left is mirrored); the other directions use their matching directional walk poses with subtle bob/scale timing to keep the original cat model intact. These non-side views are provisional, not newly authored run poses.
- `bimo/walk/<direction>/...` — BIMO walk folders. Right/left use the original shepherd gait frames; other directions use the closest directional poses from the original BIMO atlas with subtle timing offsets.
- `bimo/run/<direction>/...` — BIMO run folders. Right/left use the original faster profile poses; other directions use the closest original directional poses with subtle timing offsets.
- `shu/previous_atlas/frames/row_XX/frame_YY.png` and `bimo/previous_atlas/frames/...` — every source sprite separated from the previous atlas, with row order preserved.
- `previous_atlas/original_atlas.png` — untouched source image in each character folder.

## Direction order

`up`, `up_right`, `right`, `down_right`, `down`, `down_left`, `left`, `up_left`.

Each animation direction folder contains eight numbered frames and uses a consistent transparent canvas per character (SHU 144x160; BIMO 224x176).

## Fidelity notes

The previous-atlas frames are exact crops of the supplied models. The new SHU walk sheet is a generated approximation matching the black/white tuxedo-cat design and palette. The original source atlas does not contain a fully authored 8-frame gait for every direction for either character. To avoid changing the character identity, missing non-profile movement views are assembled from the closest original directional poses, mirrored where appropriate, and given subtle timing offsets. Those directions should be treated as provisional and may need a dedicated animation redraw pass before final in-game use.
