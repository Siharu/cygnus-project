// ===== DRIFTER — "???" CITY: LAYOUT DATA =====
// Local coordinates (city.js adds the world offset). On this camera +x runs down-right and +z down-left, so
// anything with a larger x+z is nearer the viewer: tall buildings go on the far (-x / -z) side of each street.
//
//   x -46..46, z -52..52 is walkable. Avenue along x=0, cross street along z=9.5, square at the north end.
//   SW shop row · SE fuel stop and market · NW supermarket, clinic and homes · NE industrial yard

export const BOUNDS = { x0: -46, x1: 46, z0: -52, z1: 52 };
export const SPAWN = { x: 0, z: 44 };
export const EXIT = { x: 0, z: 50.5 };

// world height of each sprite (the width follows the art)
export const HEIGHT = {
  p1: 14, p2: 14, p3: 13.5, p4: 11.5, p5: 11.5, p6: 14, p7: 13.5, p8: 13, p9: 13, p10: 10, p11: 10.5, p12: 10,
  p13: 10.5, p14: 10.5, p15: 9.5, p16: 10.5, p17: 9, p18: 15, p19: 13, p20: 10.5, p21: 10, p22: 12, p23: 14,
  p24: 12, p25: 6, p26: 7.5, p27: 6, p28: 3.8, p29: 4.5, p30: 3.8, p31: 3.8, p32: 5, p33: 6.4, p34: 3.8,
  p35: 1.9, p36: 1.4, p37: 11.5, p38: 3.8, p39: 3.6, p40: 6, p41: 7.5, p42: 6.5, p43: 5.5, p44: 5, p45: 6.5,
  p46: 2.8, p47: 2, p48: 2.1, p49: 2.5, p50: 2.1, p51: 1.5, p52: 1.2, p53: 1.8, p54: 3.6, p55: 2.2, p56: 1,
  p57: 8, p58: 1.3, p59: 7.5, p60: 2.9, p61: 9.5, p62: 2.3, p63: 2.5, p64: 2.4, p65: 1.5, p66: 2.2, p67: 4.4,
  p68: 2.9, p69: 2, p70: 4, p71: 1.7, p72: 2, p73: 2.2, p74: 1.2, p75: 1.5, p76: 1.8, p77: .8, p78: .8,
};
// collision radius of a prop as a fraction of its width (0 = walk through)
export const SOLID = {
  p46: .34, p47: .36, p48: .34, p49: .32, p50: .36, p51: .34, p52: .34, p53: .34, p55: .32, p56: 0, p57: .08,
  p58: .34, p59: .08, p60: .32, p61: .1, p62: .32, p63: .34, p64: .32, p65: .34, p66: .34, p67: .12,
  p68: .34, p69: .34, p70: .12, p71: .3, p72: .32, p73: .26, p74: .18, p77: 0, p78: 0,
};

// buildings: [sprite, x, z, mirrored, lit windows]
// x and z are either the centre, or a lot line the building is pushed against, so that a row shares one frontage:
//   'e-9.6' its +x side sits at -9.6   'w29' its -x side   's2.4' its +z side   'n18.5' its -z side
// Fronts face the viewer's side of a street: the +z face is drawn on the left, the +x face on the right.
// Mirroring swaps the two (sprites with lettering are never mirrored).
export const BUILDINGS = [
  // SW: shop row, fronts on the avenue
  ['p11', 'e-9.6', 'n18.5'], ['p14', 'e-9.6', 'n24.6', 1], ['p13', 'e-9.6', 'n30.2'], ['p17', 'e-9.6', 'n35'], ['p15', 'e-9.6', 'n39.8'],
  // SW: two rows of homes behind it
  ['p26', 'e-20', 'n19', 0, [[.22, .60]]], ['p7', 'e-20', 'n26.4', 1], ['p8', 'e-20', 'n34', 1], ['p12', 'e-20', 'n41.8', 1, [[.34, .56]]],
  ['p5', 'e-34', 'n18.5'], ['p1', 'e-34', 'n27', 1], ['p3', 'e-34', 'n37.5', 1],
  // north side of the cross street: supermarket, yakitori shop, clinic, a collapsed block
  ['p9', 'e-9.8', 's2.4'], ['p16', 'e-18.8', 's2.4'], ['p6', 'e-24.4', 's2.4', 0, [[.36, .78]]], ['p2', 'e-36', 's2.4'],
  // NW: residential lane, one side facing it
  ['p4', 'w-29.5', 's-15'], ['p7', 'w-29.5', 's-28'], ['p12', 'w-29.5', 's-40', 0, [[.34, .56]]],
  ['p5', 'e-36.5', 's-16'], ['p26', 'e-36.5', 's-28'], ['p17', 'e-36.5', 's-40'],
  ['p25', -43.5, -9], ['p27', -22.5, -25],
  // SE: near side of both streets, so it stays low
  ['p10', 'w12.5', 'n18'], ['p20', 'w32', 'n18.5'], ['p54', 'w13', 's37'], ['p43', 'w20', 's37'], ['p44', 'w13', 's45.5'], ['p54', 'w21', 's45.5', 1],
  ['p26', 'w29', 's45.5'], ['p17', 'w37.5', 's45.5'], ['p40', 'w37.5', 's36'], ['p26', 'w29', 's36', 1],
  // NE: industrial yard, workshop fronts toward the street in straight rows
  ['p41', 'w13.5', 's-1.6'], ['p21', 'w21.6', 's-1.6'], ['p22', 'w33.5', 's-1.6'],
  ['p24', 'w14.5', 's-18'], ['p19', 'w26', 's-18'], ['p18', 'w36.5', 's-18'],
  ['p42', 23.5, -13.5],
  ['p37', 'w19.5', 's-33'], ['p20', 'w28', 's-33'], ['p41', 'w38', 's-33'],
  ['p45', 29.5, -46.5], ['p26', 'w39', 's-42'],
  // the second mast, at the head of the square
  ['p23', 0, -43],
];

// ruined blocks outside the walk bounds: tall to the north and west, low to the south and east
export const BACKDROP = [
  ...[-54, -43, -32, -20, -9, 9, 20, 32, 43, 54].map((x, i) => [['p1', 'p6', 'p8', 'p2', 'p3', 'p7', 'p18', 'p6', 'p1', 'p8'][i], x, -60 - (i % 3), i % 2]),
  ...[-50, -39, -28, -17, -6, 23, 34, 45, 56].map((z, i) => [['p8', 'p3', 'p6', 'p1', 'p2', 'p7', 'p6', 'p8', 'p3'][i], -55 - (i % 2) * 2, z, i % 2]),
  ...[-48, -37, -26, -15, -4, 24, 35, 46].map((z, i) => [['p25', 'p27', 'p39', 'p25', 'p27', 'p25', 'p39', 'p27'][i], 54 + (i % 2) * 3, z]),
  ...[-52, -40, -28, -16, 16, 28, 40, 52].map((x, i) => [['p27', 'p25', 'p32', 'p27', 'p25', 'p32', 'p27', 'p25'][i], x, 59 + (i % 2) * 3]),
];

// fences and walls, drawn as upright planes and joined end to end: [sprite, x, z, axis, pieces]
// (x, z) is where the run starts; it goes toward +x or +z. A sprite drawn for the other axis is mirrored.
export const FENCES = [
  ['p28', 10.6, 2.2, 'x', 3], ['p31', 28.8, 2.2, 'x', 5],        // south edge of the yard, gate gap at x 20..29
  ['p30', 10.6, -5.8, 'z', 3], ['p38', 10.6, -27, 'z', 5], ['p34', 10.6, -48, 'z', 4],   // west edge, two ways in
  ['p28', 11, 49.6, 'x', 6], ['p29', 37.4, 49.6, 'x', 2], ['p34', 45.6, 31, 'z', 6],     // back of the market
  ['p29', -46, 15.9, 'x', 2], ['p39', -23, -37.5, 'x', 1], ['p32', -21.5, -14.9, 'z', 1],
  // road ends sealed
  ['p35', -46.5, 6, 'z', 2], ['p75', -46.5, 10.7, 'z', 2], ['p36', 46.4, 6.4, 'z', 3],
  ['p76', -4.7, 52.8, 'x', 2], ['p35', -.4, 52.8, 'x', 2],
];
export const SIGN = { x: -9.4, z: 48.6 };         // the city-limits billboard

// street lamps [x, z, dead]; lit ones dim as you come close
export const LAMPS = [
  [-7.4, 24.5], [7.4, 31.5], [-7.4, 38.5, 1], [7.4, 46], [-7.4, -8.5], [7.4, -8.5, 1],
  [-20, 4.4], [-35, 14.6, 1], [20, 14.6], [36, 4.4],
  [-12.5, -17], [12.5, -17], [-14, -30, 1], [14, -30], [-12.5, -44], [12.5, -44, 1],
];

export const PROPS = [
  // arrival
  ['p67', 7, 47.5], ['p70', 7, 28], ['p74', 3.8, 39], ['p74', 4.6, 36.6], ['p74', -4.2, 34], ['p73', -6.8, 53],
  ['p60', 8.5, 53.5], ['p55', -11, 53],
  // shop row
  ['p68', -8.9, 17.2], ['p71', -9.2, 24.4], ['p66', -17.5, 28.5], ['p69', -8.8, 32], ['p65', -17, 35.5],
  ['p62', -8.9, 38.4], ['p72', -17.8, 41], ['p63', -31, 17.5], ['p71', -16.5, 18], ['p52', -30, 39.5],
  // fuel stop and market
  ['p65', 10.2, 17.8], ['p65', 11.4, 18.4], ['p64', 24.5, 18.2], ['p66', 24.5, 27.5], ['p74', 9.8, 27], ['p74', 11.5, 28],
  ['p69', 18.8, 38.8], ['p51', 11, 38], ['p52', 27.5, 38.5], ['p49', 11.2, 46.5], ['p71', 27, 29], ['p68', 27.5, 46.8],
  ['p63', 44, 17.8], ['p53', 43.4, 40.5],
  // cross street
  ['p61', -35.8, 15.2], ['p61', -17, 3.6], ['p61', 17, 3.6], ['p61', 41, 15.4], ['p67', -10.8, 15.2],
  // supermarket, clinic, homes
  ['p69', -8.9, -1], ['p63', -22, -8.5], ['p71', -9.4, -9], ['p58', -34.4, 3.9], ['p58', -23.4, 3.9],
  ['p58', -33, -14], ['p56', -33, -25], ['p58', -33, -37], ['p47', -43.5, -38], ['p62', -22.5, -35.5], ['p71', -33.5, -47],
  ['p57', -33, -19.5], ['p57', -33, -31], ['p57', -33, -43], ['p50', -21.5, -49], ['p73', -44, -26],
  // yard
  ['p48', 14.5, -14.5], ['p51', 15, -17.5], ['p46', 14, -31.5], ['p53', 26, -29.5], ['p64', 37.5, -14],
  ['p65', 36, -29.5], ['p65', 37.3, -30.2], ['p52', 26.5, -15.5], ['p49', 44.5, -15.5], ['p50', 15.5, -45],
  ['p47', 36, -45], ['p48', 20, -48.5], ['p55', 26.5, -41], ['p51', 27.5, 0], ['p69', 36, 0], ['p66', 45, 0],
  // the square: one lit machine, cones set around it, planters at the corners
  ['p68', 0, -29],
  ...Array.from({ length: 10 }, (_, i) => ['p74', +(Math.cos(i * Math.PI / 5) * 5.4).toFixed(2), +(-29 + Math.sin(i * Math.PI / 5) * 5.4).toFixed(2)]),
  ['p58', -15.5, -16], ['p58', 8.6, -16.5], ['p58', -15.5, -47.5], ['p57', -16.5, -22], ['p57', -16.5, -39],
  ['p57', 9, -48], ['p60', -9, -49], ['p73', 9, -37],
  // the sealed ends of the cross street
  ['p73', -47.5, 5], ['p55', -47.5, 14], ['p60', 47.5, 5.5], ['p73', 47.5, 9.5], ['p55', 47.5, 13.5],
  // weeds
  ...[[-6, 20], [6.3, 17], [-6.5, 45], [6, 54], [-13, 4.6], [27, 4.8], [-29, 14], [4, -12], [-7, -20], [7, -41], [-25, -14], [29, -29], [13, 31], [-44, 24]].map(([x, z], i) => [i % 2 ? 'p78' : 'p77', x, z]),
];

// reclaiming greenery from the station's own foliage and rock libraries: [key, x, z, height]
export const GREEN = [
  ['fol_banyan_tree', -44, -49, 13], ['fol_round_canopy_tree', -44.5, 51, 11], ['fol_wide_branching_tree', 45, 51.5, 10],
  ['fol_slim_canopy_tree', -45, -34, 12], ['fol_young_tree', -19.5, 51, 7], ['fol_banyan_tree', -50, 4, 13],
  ['fol_round_canopy_tree', -51, 17, 11], ['fol_young_tree', 50, -2, 8], ['fol_sapling', 12.5, -49.5, 5],
  ['fol_dense_bush', -44, 15.5, 3.2], ['fol_thorny_shrub', -17, 47.5, 2.8], ['fol_flowering_bush', -33.5, -9.5, 3],
  ['fol_low_wide_bush', -20, -20, 2.8], ['fol_fern_clump', -34, -26, 2.4], ['fol_tall_wild_grass', -34, -34, 3],
  ['fol_creeping_groundcover', -22, 14.8, 2], ['fol_broadleaf_plant', -43.5, 2.5, 2.4], ['fol_fern_clump', 44.5, 49.5, 2.4],
  ['fol_dense_bush', 36.5, 50, 3.4], ['fol_creeping_groundcover', 28, 22, 2], ['fol_thorny_shrub', 45, -37, 2.8],
  ['fol_tall_wild_grass', 12.5, -38.5, 3], ['fol_fallen_leafy_branch', -3, -17, 1.5], ['fol_white_wildflower_patch', -17.5, -33, 1.6],
  ['fol_yellow_flower_patch', -20.5, 49, 1.6], ['fol_tropical_banana_plant', -45, -45, 3.6],
];
export const RUBBLE = [   // [rock key, x, z, scale]
  ['rok_43', -45, -2, .022], ['rok_41', -44, -16, .02], ['rok_47', -21, -30, .02], ['rok_45', 9.3, 0.8, .018],
  ['rok_42', 45.5, -34, .022], ['rok_35', -46, 37, .022], ['rok_40', 43.5, 47.6, .022], ['rok_44', -9.5, -34, .016],
  ['rok_37', 8.8, 51, .016],
];

export const SUPPLIES = [   // [id from props.js, x, z]
  ['water_bottle', -8.4, 22.6], ['instant_noodles', -8.6, -4.5], ['soda_can', 12.2, 29.6],
  ['tinned_food', 18.5, 31.2], ['energy_drink', 1.7, -27.6], ['snack_bar', -21, 17.5],
];

export const NOTES = [   // [name, x, z, note]
  ['City-limits sign', -6.2, 49.2, 'The name has been scraped down to bare metal. Someone has painted three question marks over it, carefully, more than once.'],
  ['Yakitori counter', -20.6, 3.9, 'The grill is cold. Eight skewers are laid out, evenly spaced, as if somebody counted them.'],
  ['Fuel stop', 14, 28.4, 'Every pump stopped on the same reading: 88.7.'],
  ['Supermarket', -13.4, 3.9, 'Behind the glass every shelf is faced and full. Every price card is blank.'],
  ['Clinic', -27.2, 3.9, 'The waiting-room light is on. Every line of the sign-in sheet is in the same handwriting. Every line is crossed out.'],
  ['Residential lane', -33, -22.5, 'Doors shut, none locked. A kettle clicks off somewhere inside. Nobody comes to pour it.'],
  ['Storage tank', 18, -16.4, 'You knock once. It knocks back twice, from the top.'],
  ['Water tower', 21.6, -31.4, 'The ladder rungs are polished bright. The lowest three are missing.'],
  ['Vending machine', 0, -26.6, 'The only one still lit. Every button reads SOLD OUT. Something drops into the tray anyway.'],
  ['Second mast', 0, -37.2, 'Its beacon blinks half a beat behind the one you left. Your radio finds 88.7 and plays footsteps. They stop when you do.'],
];
