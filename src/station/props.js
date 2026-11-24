// DRIFTER — interactable supplies (assets/game/props/*.png, from DRIFTER_Isometric_Interactables_v2)
// Coordinates are room-local (same space as interior_layout.js items). y = surface height (0 = floor).
// food / water restore 0..1 of the meter. Each supply can be used once (finite, scarcity is the point).
export const PROPS = [
  [ // 0 control room
    { id: 'water_bottle',     x: 1.2,  z: -5.0, y: 1.0,  water: .45, n: 'water bottle',  msg: 'Flat, a little warm. Still wet.' },
    { id: 'instant_noodles',  x: 3.6,  z: 0.1,  y: .85,  food: .4, water: .1, n: 'instant noodles', msg: 'Eaten dry out of the cup. Salt, mostly.' },
    { id: 'soda_can',         x: 2.6,  z: 1.8,  y: 0,    water: .2, food: .05, n: 'soda can', msg: 'Warm cola. Somebody was saving it.' },
  ],
  [ // 1 equipment room
    { id: 'energy_drink',     x: 0.5,  z: 1.1,  y: 1.0,  water: .25, food: .1, n: 'energy drink', msg: 'Neon and sweet. Your hands stop shaking.' },
    { id: 'tinned_food',      x: 2.4,  z: -2.2, y: 0,    food: .5, n: 'tinned food', msg: 'Peaches. The syrup is the best part.' },
    { id: 'snack_bar',        x: -2.6, z: 3.4,  y: 0,    food: .25, n: 'snack bar', msg: 'Stale, but it is calories.' },
  ],
  [ // 2 briefing office
    { id: 'sandwich',         x: -0.5, z: -0.6, y: 1.0,  food: .45, n: 'packaged sandwich', msg: 'Sealed. Date on the label is a guess. You eat it anyway.' },
    { id: 'juice_carton',     x: 1.5,  z: -1.2, y: 1.0,  water: .4, food: .05, n: 'juice carton', msg: 'Apple. Cold from the cellar air up here.' },
    { id: 'milk_carton',      x: -3.2, z: -4.2, y: 0,    water: .2, food: .2, n: 'milk carton', msg: 'Shelf-stable. Chalky, filling.' },
    { id: 'chips_packet',     x: -4.0, z: 3.0,  y: 0,    food: .2, n: 'chips packet', msg: 'Crumbs and salt. Gone in four handfuls.' },
  ],
];
export const PROP_SIZE = 192 * .0068; // sprite cell in world units (art bottom sits at ~95% of the cell)
