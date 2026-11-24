# Tower interior sprite kit

Source: DRIFTER_COMPLETE_ASSET_PACK_FINAL.zip (style references, Style Lock, Sheets A-E).
Each sheet was cut on its #FF00FF background into one transparent PNG per prop, with the magenta
spill removed and edge colour bled into transparent pixels so mipmaps stay clean.
The rack door glass (equipment room) had magenta showing through; it is now an opaque cool grey-blue.

| file | sheet / cell |
|---|---|
| floor_tile, wall_back, wall_left, door_back, door_left, window_back, window_left, pillar | A - room shell |
| desk_monitors, desk_corner, desk_radio, shelf_binders, crate_blanket, cable_bundle | B - control room |
| rack_closed, rack_open, transmitter_cabinet, battery_rack, workbench, shelf_toolboxes | C - equipment room |
| briefing_table, folding_chair, wall_map, whiteboard, shelf_archive, desk_phone | D - briefing office |
| stairs_up, stairwell_hole, rug, trash_can, lantern, paper_stack, power_strip, wall_clock | E - shared props |
| filing_cabinet, office_chair, tabletop_radio | Style Lock |

Placement, scale, anchors, collision and glows are all data in `src/station/interior_layout.js`.
`wall_map`, `whiteboard`, `wall_clock` are drawn on the LEFT-wall plane; `*_back` pieces on the back wall,
`*_left` on the left wall. `flip: true` mirrors a sprite so a back-wall prop can sit against the left wall.
