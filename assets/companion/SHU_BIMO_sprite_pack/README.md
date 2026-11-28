# SHU + BIMO animation asset pack

This pack contains the supplied original atlases, the extracted individual poses, and organized 8-direction movement folders. Runtime code is expected to use the full individual-frame library rather than treating the previous atlases as unused backups.

## Folder layout

- `shu/walk/<direction>/frame_00.png ... frame_07.png` — 64 directional walk frames.
- `shu/run/<direction>/frame_00.png ... frame_07.png` — 64 directional run frames. The non-profile directions are provisional walk-derived poses, as noted below.
- `shu/walk/source/generated_8x8_walk_atlas.png` — preserved source sheet for the extracted Shu walk set.
- `shu/previous_atlas/frames/row_XX/frame_YY.png` — all 48 individually extracted original Shu poses, in source row order.
- `shu/previous_atlas/original_atlas.png` — untouched original Shu atlas.
- `bimo/walk/<direction>/frame_00.png ... frame_07.png` — 64 directional walk frames.
- `bimo/run/<direction>/frame_00.png ... frame_07.png` — 64 directional run frames. The non-profile directions are provisional walk-derived poses, as noted below.
- `bimo/previous_atlas/frames/row_XX/frame_YY.png` — all 42 individually extracted original Bimo poses, in source row order.
- `bimo/previous_atlas/original_atlas.png` — untouched original Bimo atlas.

## Direction order

`up`, `up_right`, `right`, `down_right`, `down`, `down_left`, `left`, `up_left`.

Each directional folder contains eight numbered frames. Shu uses 144×160 transparent movement canvases; Bimo uses 224×176 transparent movement canvases. Runtime frame anchors are calculated from the actual visible alpha bounds.

## Runtime frame-use map

### Shu — 176 individual animation frames

All 128 directional PNGs are used by the 8-direction walk/run selector. All 48 previous-atlas poses are assigned to behaviours:

| Previous-atlas row | Frames | Runtime behaviour |
|---|---:|---|
| 1 | 6 | Standing turn / look-around, first variation |
| 2 | 6 | Standing turn / look-around, second variation |
| 3 | 6 | Stretch sequence |
| 4 | 5 | Sitting pose / facing variation |
| 5 | 5 | Grooming |
| 6 | 5 | Sleep and wake transition |
| 7 | 5 | Sitting pose variation |
| 8 | 5 | Sitting pose variation |
| 9 | 5 | Crouch, pounce and startled reaction |

Rows 1 and 2 alternate as separate six-frame look sequences. Sitting uses only actual seated rows 4, 7 and 8. Crouch uses the first three row-9 poses; pounce and startle traverse all five row-9 poses.

### Bimo — 170 individual animation frames

All 128 directional PNGs are used by the 8-direction walk/run selector. All 42 previous-atlas poses are assigned to behaviours:

| Previous-atlas row | Frames | Runtime behaviour |
|---|---:|---|
| 1 | 6 | Standing look / turn-around |
| 2 | 6 | Trot and profile walk transition |
| 3 | 6 | Short scout burst / profile run |
| 4 | 4 | Alert / excited bound |
| 5 | 5 | Settle-down and wake-up transition |
| 6 | 5 | Sniff / scent investigation |
| 7 | 5 | Sitting |
| 8 | 5 | Lying down / resting |

Bimo's directional movement uses the individual walk/run folders in all eight directions. The original profile rows are used for separate trot and burst behaviours, so they are not discarded when the directional folders are active.

## Fidelity notes

The previous-atlas frames are exact crops of the supplied models. The new Shu walk sheet is a generated approximation matching the tuxedo-cat design and palette. The original source atlas does not contain a fully authored eight-frame gait for every direction for either character. To preserve character identity, missing non-profile run views are assembled from the closest directional poses and should be treated as provisional until a dedicated gait redraw pass is made.
