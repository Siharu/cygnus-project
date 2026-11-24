// ===== DRIFTER — RELAY TOWER INTERIOR (PSX-style 3D placeholder) =====
// Three cutaway rooms built from low-poly primitives. Everything here is a PLACEHOLDER:
// flat-shaded boxes/cylinders with tiny nearest-neighbour textures generated in code.
//
// TO WRAP REAL ART LATER
//   1. Drop a PNG in  assets/game/interior/  (power-of-two sizes look best, 32-128 px).
//   2. Add its texture name to PNG below, e.g.  floor_lino: 'floor_lino.png'
//   Every surface asks for a texture by name (see TEXDEF); a name listed in PNG loads
//   the file instead of the generated placeholder. Nothing else needs to change.
//
// Room layout: local coords, +-7 around (IX,IZ). Camera looks from +x,+z, so the two far
// walls (-z "back", -x "left") are built and the two near sides are left open (cutaway).

export const PNG = {
  // floor_lino: 'floor_lino.png',
};

const WH = 5.6; // wall height

export function createInterior(T, sc, IX, IZ, sol) {
  // ---------- tiny seeded RNG so placeholder textures are stable ----------
  const seeded = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const rnd = seeded(1337);

  // ---------- placeholder texture painters ----------
  const cv = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; draw(g, w, h); return c; };
  const noise = (g, w, h, b, amt) => { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = (rnd() - .5) * amt; g.fillStyle = `rgb(${b[0] + n | 0},${b[1] + n | 0},${b[2] + n | 0})`; g.fillRect(x, y, 1, 1); } };
  const rect = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const speck = (g, w, h, n, c) => { g.fillStyle = c; for (let i = 0; i < n; i++) g.fillRect(rnd() * w | 0, rnd() * h | 0, 1, 1); };
  const TEXDEF = {
    concrete: { w: 32, h: 32, d: (g, w, h) => { noise(g, w, h, [100, 102, 98], 26); speck(g, w, h, 40, 'rgba(0,0,0,.3)'); } },
    concrete_dark: { w: 32, h: 32, d: (g, w, h) => { noise(g, w, h, [60, 64, 66], 22); speck(g, w, h, 30, 'rgba(0,0,0,.35)'); rect(g, 'rgba(0,0,0,.25)', 0, 15, w, 1); } },
    floor_lino: { w: 32, h: 32, d: (g, w, h) => { noise(g, w, h, [54, 70, 66], 12); rect(g, 'rgba(0,0,0,.4)', 0, 0, w, 1); rect(g, 'rgba(0,0,0,.4)', 0, 0, 1, h); rect(g, 'rgba(0,0,0,.4)', 16, 0, 1, h); rect(g, 'rgba(0,0,0,.4)', 0, 16, w, 1); rect(g, 'rgba(255,255,255,.07)', 1, 1, 15, 15); rect(g, 'rgba(255,255,255,.07)', 17, 17, 15, 15); } },
    floor_conc: { w: 32, h: 32, d: (g, w, h) => { noise(g, w, h, [78, 80, 78], 24); speck(g, w, h, 30, 'rgba(0,0,0,.35)'); rect(g, 'rgba(0,0,0,.35)', 0, 0, w, 1); rect(g, 'rgba(0,0,0,.35)', 0, 0, 1, h); } },
    carpet: { w: 32, h: 32, d: (g, w, h) => { noise(g, w, h, [74, 38, 38], 34); speck(g, w, h, 50, 'rgba(0,0,0,.3)'); } },
    panel_green: { w: 32, h: 32, d: (g, w, h) => { noise(g, w, h, [46, 84, 70], 12); for (let x = 0; x < w; x += 8) { rect(g, 'rgba(0,0,0,.4)', x, 0, 1, h); rect(g, 'rgba(255,255,255,.08)', x + 1, 0, 1, h); } rect(g, 'rgba(0,0,0,.35)', 0, 0, w, 2); } },
    plaster: { w: 32, h: 32, d: (g, w, h) => { noise(g, w, h, [148, 146, 128], 18); speck(g, w, h, 30, 'rgba(70,60,40,.3)'); } },
    plaster_warm: { w: 32, h: 32, d: (g, w, h) => { noise(g, w, h, [166, 146, 116], 18); speck(g, w, h, 30, 'rgba(70,50,30,.3)'); } },
    wood: { w: 32, h: 32, d: (g, w, h) => { noise(g, w, h, [112, 78, 50], 16); for (let y = 0; y < h; y += 8) rect(g, 'rgba(0,0,0,.45)', 0, y, w, 1); speck(g, w, h, 24, 'rgba(0,0,0,.3)'); } },
    wood_dark: { w: 32, h: 32, d: (g, w, h) => { noise(g, w, h, [66, 44, 30], 14); for (let y = 0; y < h; y += 8) rect(g, 'rgba(0,0,0,.5)', 0, y, w, 1); } },
    wood_panel: { w: 32, h: 32, d: (g, w, h) => { noise(g, w, h, [96, 64, 42], 14); for (let x = 0; x < w; x += 8) { rect(g, 'rgba(0,0,0,.5)', x, 0, 1, h); rect(g, 'rgba(255,220,170,.08)', x + 1, 0, 1, h); } } },
    metal: { w: 32, h: 32, d: (g, w, h) => { noise(g, w, h, [96, 104, 104], 14); rect(g, 'rgba(0,0,0,.4)', 0, 0, w, 1); rect(g, 'rgba(0,0,0,.4)', 0, 0, 1, h); rect(g, 'rgba(255,255,255,.18)', 2, 2, 1, 1); rect(g, 'rgba(255,255,255,.18)', w - 3, 2, 1, 1); rect(g, 'rgba(255,255,255,.18)', 2, h - 3, 1, 1); rect(g, 'rgba(255,255,255,.18)', w - 3, h - 3, 1, 1); } },
    cabinet: { w: 32, h: 32, d: (g, w, h) => { noise(g, w, h, [100, 108, 100], 10); for (let i = 0; i < 3; i++) { rect(g, 'rgba(0,0,0,.5)', 2, 2 + i * 10, 28, 9); rect(g, 'rgba(255,255,255,.1)', 3, 3 + i * 10, 26, 1); rect(g, '#222', 12, 5 + i * 10, 8, 2); } } },
    hazard: { w: 32, h: 16, d: (g, w, h) => { rect(g, '#d8b020', 0, 0, w, h); g.fillStyle = '#16140e'; for (let i = -h; i < w; i += 8) { g.beginPath(); g.moveTo(i, h); g.lineTo(i + 4, h); g.lineTo(i + 4 + h, 0); g.lineTo(i + h, 0); g.fill(); } } },
    rack_front: { w: 32, h: 64, d: (g, w, h) => { rect(g, '#15191b', 0, 0, w, h); for (let i = 0; i < 8; i++) { const y = 2 + i * 7.5 | 0; rect(g, '#2a3034', 2, y, 28, 6); rect(g, '#0b0d0e', 4, y + 1, 18, 4); for (let k = 0; k < 4; k++) rect(g, '#050607', 5 + k * 4, y + 2, 2, 2); rect(g, '#3a4146', 24, y + 1, 4, 1); } } },
    cork: { w: 32, h: 32, d: (g, w, h) => { noise(g, w, h, [150, 112, 72], 36); speck(g, w, h, 60, 'rgba(60,30,10,.4)'); } },
    cardboard: { w: 32, h: 32, d: (g, w, h) => { noise(g, w, h, [140, 108, 70], 16); rect(g, 'rgba(210,190,150,.6)', 0, 14, w, 4); rect(g, 'rgba(0,0,0,.3)', 0, 0, w, 1); } },
    paper: { w: 32, h: 32, d: (g, w, h) => { rect(g, '#d8d4c0', 0, 0, w, h); for (let y = 4; y < h; y += 4) rect(g, 'rgba(60,70,100,.45)', 2, y, 28, 1); speck(g, w, h, 20, 'rgba(0,0,0,.15)'); } },
    mat: { w: 16, h: 16, d: (g, w, h) => { noise(g, w, h, [38, 34, 30], 24); rect(g, 'rgba(0,0,0,.4)', 0, 0, w, 1); } },
    grille: { w: 16, h: 16, d: (g, w, h) => { rect(g, '#16181a', 0, 0, w, h); for (let y = 1; y < h; y += 3) for (let x = 1; x < w; x += 3) rect(g, '#050607', x, y, 1, 1); } },
    books: { w: 32, h: 16, d: (g, w, h) => { const c = ['#7a2f2a', '#2f4f6a', '#6a5a2a', '#3a5a3a', '#5a3a5a', '#8a7a58']; let x = 0; while (x < w) { const bw = 2 + rnd() * 3 | 0; rect(g, c[rnd() * c.length | 0], x, 1 + (rnd() * 3 | 0), bw, h - 2); rect(g, 'rgba(0,0,0,.5)', x, 0, 1, h); x += bw; } } },
    map: { w: 64, h: 48, d: (g, w, h) => { noise(g, w, h, [196, 180, 140], 18); g.strokeStyle = '#6a5a3a'; g.lineWidth = 1; g.beginPath(); g.moveTo(4, 40); g.lineTo(20, 30); g.lineTo(34, 32); g.lineTo(48, 14); g.lineTo(60, 8); g.stroke(); g.strokeStyle = '#4a6a8a'; g.beginPath(); g.moveTo(0, 14); g.lineTo(16, 18); g.lineTo(30, 10); g.lineTo(44, 24); g.lineTo(64, 28); g.stroke(); speck(g, w, h, 40, 'rgba(60,40,20,.5)'); g.strokeStyle = '#c01818'; g.lineWidth = 2; for (const [x, y] of [[8, 38], [56, 10]]) { g.beginPath(); g.moveTo(x - 3, y - 3); g.lineTo(x + 3, y + 3); g.moveTo(x + 3, y - 3); g.lineTo(x - 3, y + 3); g.stroke(); } } },
    chalk: { w: 128, h: 48, d: (g, w, h) => { noise(g, w, h, [26, 38, 32], 10); g.fillStyle = '#d8dcd0'; g.font = 'bold 9px monospace'; g.textBaseline = 'middle'; g.fillText('WAIT FOR THE', 8, 14); g.fillText('SIGNAL', 8, 28); g.fillStyle = 'rgba(216,220,208,.5)'; g.fillRect(8, 36, 60, 1); g.fillRect(8, 40, 38, 1); } },
    sky: { w: 32, h: 32, d: (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0a1424'); gr.addColorStop(1, '#2a3c52'); g.fillStyle = gr; g.fillRect(0, 0, w, h); speck(g, w, h, 14, '#cfe0ff'); rect(g, '#e8f0ff', 22, 6, 3, 3); rect(g, 'rgba(232,240,255,.25)', 21, 5, 5, 5); } },
    dial: { w: 64, h: 24, d: (g, w, h) => { rect(g, '#1a1608', 0, 0, w, h); rect(g, '#c8a450', 3, 5, 58, 9); for (let x = 5; x < 60; x += 4) rect(g, '#2a2008', x, 6, 1, x % 12 == 5 ? 6 : 3); rect(g, '#d02a20', 36, 4, 2, 11); rect(g, '#8a7a50', 4, 17, 20, 3); rect(g, '#8a7a50', 40, 17, 20, 3); } },
    clock: { w: 32, h: 32, d: (g, w, h) => { rect(g, '#2a2a2a', 0, 0, w, h); g.fillStyle = '#d8d4c0'; g.beginPath(); g.arc(16, 16, 14, 0, 7); g.fill(); g.fillStyle = '#222'; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; g.fillRect(16 + Math.sin(a) * 11 | 0, 16 - Math.cos(a) * 11 | 0, 1, 1); } g.fillRect(16, 9, 1, 8); g.fillRect(16, 16, 6, 1); } },
    label_wn: { w: 64, h: 16, d: (g, w, h) => { rect(g, '#1a0e04', 0, 0, w, h); g.fillStyle = '#ffb040'; g.font = 'bold 9px monospace'; g.textBaseline = 'middle'; g.fillText('WNCORE 88.7', 3, 8); } },
    sign_up: { w: 32, h: 16, d: (g, w, h) => { rect(g, '#10240f', 0, 0, w, h); g.fillStyle = '#7ae070'; g.font = 'bold 9px monospace'; g.textBaseline = 'middle'; g.fillText('UP', 11, 8); } },
    sign_down: { w: 32, h: 16, d: (g, w, h) => { rect(g, '#10240f', 0, 0, w, h); g.fillStyle = '#7ae070'; g.font = 'bold 8px monospace'; g.textBaseline = 'middle'; g.fillText('DOWN', 4, 8); } },
    sign_exit: { w: 32, h: 16, d: (g, w, h) => { rect(g, '#10240f', 0, 0, w, h); g.fillStyle = '#7ae070'; g.font = 'bold 8px monospace'; g.textBaseline = 'middle'; g.fillText('EXIT', 5, 8); } },
  };
  const TX = {}, loader = new T.TextureLoader();
  const pngUrl = f => new URL('../../assets/game/interior/' + f, import.meta.url).href;
  const tex = name => {
    if (TX[name]) return TX[name];
    let t;
    if (PNG[name]) t = loader.load(pngUrl(PNG[name]), undefined, undefined, () => console.error('interior: failed to load', PNG[name]));
    else { const d = TEXDEF[name]; if (!d) throw new Error('interior: unknown texture ' + name); t = new T.CanvasTexture(cv(d.w, d.h, d.d)); }
    t.magFilter = t.minFilter = T.NearestFilter; t.generateMipmaps = false; t.wrapS = t.wrapT = T.RepeatWrapping;
    return TX[name] = t;
  };

  // ---------- PSX materials: vertex-lit (Gouraud), nearest textures, vertex snapping ----------
  const SNAP = 'const vec2 SNAP=vec2(420.,236.);\nvoid main() {';
  const psx = m => { m.onBeforeCompile = s => { s.vertexShader = s.vertexShader.replace('void main() {', SNAP).replace('#include <project_vertex>', '#include <project_vertex>\n gl_Position.xy=floor(gl_Position.xy/gl_Position.w*SNAP+.5)/SNAP*gl_Position.w;'); }; return m; };
  const mats = {};
  const L = (name, color = 0xffffff) => { const k = name + '|' + color; return mats[k] || (mats[k] = psx(new T.MeshLambertMaterial({ map: name ? tex(name) : null, color, fog: false }))); };
  const E = (name, color = 0xffffff) => { const k = 'E' + name + '|' + color; return mats[k] || (mats[k] = psx(new T.MeshBasicMaterial({ map: name ? tex(name) : null, color, fog: false }))); };

  // ---------- geometry helpers (UVs scaled to world units so texel density is uniform) ----------
  const boxUV = (w, h, d, tile) => { const g = new T.BoxGeometry(w, h, d), uv = g.attributes.uv, s = 1 / tile, D = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]]; for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) { const i = f * 4 + v; uv.setXY(i, uv.getX(i) * D[f][0] * s, uv.getY(i) * D[f][1] * s); } return g; };
  const planeUV = (w, h, tile) => { const g = new T.PlaneGeometry(w, h), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / tile, uv.getY(i) * h / tile); return g; };
  const flat = g => { g = g.toNonIndexed(); g.computeVertexNormals(); return g; };
  const place = (R, o, x, y, z, ry = 0, rx = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); R.add(o); return o; };
  // y is the BASE of the object. B = box, Pl = flat decal (faces +z unless rotated), C = low-poly cylinder/cone
  const B = (R, w, h, d, x, y, z, m, tile = 2, ry = 0) => place(R, new T.Mesh(boxUV(w, h, d, tile), m), x, y + h / 2, z, ry);
  const Pl = (R, w, h, x, y, z, m, ry = 0, rx = 0) => place(R, new T.Mesh(new T.PlaneGeometry(w, h), m), x, y + h / 2, z, ry, rx);
  const C = (R, r, h, x, y, z, m, seg = 8, rt = r) => place(R, new T.Mesh(flat(new T.CylinderGeometry(rt, r, h, seg)), m), x, y + h / 2, z);
  const Pipe = (R, r, len, x, y, z, axis, m, seg = 6) => place(R, new T.Mesh(flat(new T.CylinderGeometry(r, r, len, seg)), m), x, y, z, 0, axis == 'z' ? Math.PI / 2 : 0, axis == 'x' ? Math.PI / 2 : 0);
  const Fl = (R, w, h, x, z, m, tile, y = .012) => place(R, new T.Mesh(planeUV(w, h, tile), m), x, y, z, 0, -Math.PI / 2);

  // ---------- rooms, lights, solids ----------
  const rooms = [0, 1, 2].map(() => { const g = new T.Group(); g.position.set(IX, 0, IZ); g.visible = false; sc.add(g); return g; });
  const S = [[], [], []];
  const solid = (i, x, z, rx, rz) => S[i].push({ x: IX + x, z: IZ + z, rx, rz });
  const key = new T.PointLight(0xffc880, 0, 20, 1.2), acc = new T.PointLight(0x66ff99, 0, 9, 1.2);
  key.position.set(IX, 4.6, IZ); acc.position.set(IX, 2, IZ); sc.add(key, acc);
  const LIGHT = [
    { k: [0xffc880, 2.0, 0, 5, 0.5], a: [0x66ff99, 1.3, -1.5, 2.1, -4.6] },
    { k: [0xa8c8ff, 2.1, 0, 5, 0], a: [0x7fffd0, 1.2, -1.5, 2.6, -4.6] },
    { k: [0xffb870, 2.0, 0, 5, -.5], a: [0xffd890, .35, 1.8, 2.6, -1.5] },
  ];
  let cur = -1;

  // wall group: local +x runs along the wall, +y up, +z into the room. c = world coord along that wall.
  const wg = (R, wall, c, y, depth = 0) => { const g = new T.Group(); if (wall == 'z') { g.position.set(c, y, -7 + depth); } else { g.position.set(-7 + depth, y, c); g.rotation.y = Math.PI / 2; } R.add(g); return g; };

  const shell = (i, floor, low, up, tile = 3) => {
    const R = rooms[i];
    B(R, 14.8, .9, 14.8, 0, -.9, 0, L('concrete_dark', 0x9a9a9a), 3);            // cut-away floor slab
    Fl(R, 14, 14, 0, 0, L(floor), tile);                                            // floor
    B(R, 14.6, WH, .5, -.2, 0, -7.25, L(up), 3);                                    // back wall (-z)
    B(R, .5, WH, 14, -7.25, 0, 0, L(up), 3);                                        // left wall (-x)
    B(R, 14, 1.7, .16, 0, 0, -6.92, L(low), 1.7);                                   // wainscot
    B(R, .16, 1.7, 14, -6.92, 0, 0, L(low), 1.7);
    B(R, 14, .26, .22, 0, 0, -6.84, L('wood_dark'), 2);                             // skirting
    B(R, .22, .26, 14, -6.84, 0, 0, L('wood_dark'), 2);
    B(R, 14.8, .3, .75, -.1, WH, -7.15, L('metal', 0x555a58), 2);                   // wall caps
    B(R, .75, .3, 14.6, -7.15, WH, 0, L('metal', 0x555a58), 2);
    B(R, .7, WH + .3, .7, 7.05, 0, -7.05, L('metal', 0x5d6361), 2);                 // corner columns
    B(R, .7, WH + .3, .7, -7.05, 0, 7.05, L('metal', 0x5d6361), 2);
    return R;
  };
  const win = (R, wall, c, y, w, h, blinds) => {
    const g = wg(R, wall, c, y, .03);
    Pl(g, w, h, 0, 0, 0, E('sky', 0xc0c8d8));
    const f = L('metal', 0x4a504c);
    B(g, w + .5, .22, .22, 0, -.22, .08, f); B(g, w + .5, .22, .22, 0, h, .08, f);
    B(g, .22, h + .4, .22, -w / 2 - .14, -.2, .08, f); B(g, .22, h + .4, .22, w / 2 + .14, -.2, .08, f);
    B(g, .1, h, .1, 0, 0, .06, f); B(g, w, .1, .1, 0, h / 2, .06, f);
    if (blinds) for (let k = 0; k < 9; k++) B(g, w, .1, .14, 0, h - .1 - k * (h / 9.5), .1, L('plaster_warm', 0xc8b890), 1);
  };
  const wallLight = (R, x, y, z) => { B(R, .35, .3, .2, x, y, z, L('metal', 0x444a48)); Pl(R, .24, .18, x, y + .06, z + .11, E(null, 0xffe0a0)); };

  const stairsUp = i => {
    const R = rooms[i], n = 7, run = .54, rise = .5, wood = L('wood_dark');
    for (let k = 0; k < n; k++) B(R, 2.0, rise * (k + 1), run, 5.9, 0, -3.1 - run / 2 - k * run, k % 2 ? wood : L('wood'));
    const len = Math.hypot(run * n, rise * n), ang = Math.atan2(rise * n, run * n);
    const rail = B(R, .1, .1, len, 4.88, 1.05 + rise * n / 2 - .05, -3.1 - run * n / 2, L('metal', 0x7a7a6a), 1);
    rail.position.y = 1.05 + rise * n / 2; rail.rotation.x = ang;
    for (let k = 0; k < n; k += 2) B(R, .09, 1.0, .09, 4.88, rise * (k + 1), -3.1 - run / 2 - k * run, L('metal', 0x6a6a5a), 1);
    B(R, 2.0, .15, 1.2, 5.9, rise * n, -6.9 + .6 - .1, L('wood_dark'));                      // landing
    const d = wg(R, 'z', 5.9, rise * n + .15, .04);                                         // doorway at the top
    Pl(d, 1.6, 1.6, 0, 0, 0, E(null, 0x030405));
    B(d, .2, 1.8, .2, -.9, 0, .05, L('metal', 0x555a58)); B(d, .2, 1.8, .2, .9, 0, .05, L('metal', 0x555a58)); B(d, 2.0, .2, .2, 0, 1.6, .05, L('metal', 0x555a58));
    Pl(d, .8, .4, -1.5, .9, .06, E('sign_up'));
    solid(i, 5.9, -5.9, 1.0, 1.0);
  };
  const stairsDown = i => {
    const R = rooms[i];
    B(R, 2.5, .08, 2.5, 5.7, 0, 5.7, L('hazard'), 1.2);                                     // hazard border
    Pl(R, 1.9, 1.9, 5.7, .09, 5.7, E(null, 0x050709), 0, -Math.PI / 2).position.y = .1;     // the dark stairwell
    for (let k = 0; k < 3; k++) { const s = Pl(R, 1.9 - k * .45, .2, 5.7, 0, 5.7 - .8 + k * .3, E(null, 0x14191d + k * 0x040404), 0, -Math.PI / 2); s.position.y = .11 + k * .002; }
    const y = L('hazard');
    for (const [x, z] of [[4.4, 4.4], [4.4, 7], [7, 4.4]]) B(R, .1, 1.0, .1, x, 0, z, L('metal', 0xb89a20), 1);
    B(R, .08, .08, 2.6, 4.4, .95, 5.7, L('metal', 0xb89a20), 1); B(R, 2.6, .08, .08, 5.7, .95, 4.4, L('metal', 0xb89a20), 1);
    Pl(R, .9, .45, 5.7, 1.0, 4.34, E('sign_down'));
    B(R, 1.2, .01, .1, 5.7, 0, 4.2, y, 1);
  };
  const exitDoor = i => {
    const R = rooms[i], f = L('metal', 0x555a58);
    B(R, .25, 3.6, .25, 4.85, 0, 6.9, f); B(R, .25, 3.6, .25, 7.0, 0, 6.9, f); B(R, 2.4, .3, .25, 5.92, 3.45, 6.9, f);
    B(R, .12, 3.3, 1.9, 4.9, 0, 5.9, L('wood_dark', 0x9a8a7a), 1.5);                      // door leaf, swung open
    Pl(R, .9, .4, 5.9, 3.5, 7.04, E('sign_exit'));
    Pl(R, 2.0, 1.2, 5.9, 0, 5.2, L('mat'), 0, -Math.PI / 2).position.y = .05;
  };
  const mkScreen = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new T.CanvasTexture(c); t.magFilter = t.minFilter = T.NearestFilter; t.generateMipmaps = false; return { c, g: c.getContext('2d'), t, w, h }; };
  const screens = [], leds = [], fans = [], flick = [];

  // =========================================================== ROOM 0 — CONTROL ROOM
  {
    const i = 0, R = shell(0, 'floor_lino', 'panel_green', 'plaster');
    win(R, 'z', 3.0, 2.0, 2.6, 1.9); win(R, 'x', 0, 2.0, 3.4, 1.9);
    stairsUp(i); exitDoor(i);
    Fl(R, 5.6, 3.6, 0, 0.8, L('carpet', 0xb0a0a0), 2, .05);                                   // rug
    // radio console
    const m = L('metal', 0x3d4a44);
    B(R, 4.6, 1.0, 1.8, -1.5, 0, -6.0, m); solid(i, -1.5, -6.0, 2.3, .9);
    const pan = B(R, 4.4, .14, .8, -1.5, 1.0, -5.45, L('metal', 0x2c3430)); pan.position.y = 1.1; pan.rotation.x = .25;
    for (let k = 0; k < 8; k++) C(R, .1, .12, -3.1 + k * .52, 1.17, -5.55 + (k % 2) * .16, L(null, k % 3 ? 0xd8d0b8 : 0xc02a20), 6);
    B(R, 1.7, 1.0, .75, -2.9, 1.0, -6.4, L('metal', 0x2a2e2c));                              // receiver
    Pl(R, 1.4, .5, -2.75, 1.4, -6.0, E('dial'));
    Pl(R, .55, .7, -3.55, 1.1, -6.0, L('grille'));
    for (const [x, sx] of [[-1.35, 0], [-.1, 1]]) {                                          // two CRTs
      B(R, 1.15, .95, .9, x, 1.0, -6.3, L('metal', 0x8a8a78), 1.5);
      const s = mkScreen(64, 48); screens.push({ ...s, mode: sx }); Pl(R, .85, .65, x, 1.15, -5.84, E(null, 0xffffff)).material = psx(new T.MeshBasicMaterial({ map: s.t, fog: false }));
    }
    C(R, .22, .06, .45, 1.0, -5.3, L('metal', 0x333836), 8); C(R, .03, .85, .45, 1.06, -5.3, L('metal', 0x333836), 6);   // microphone
    place(R, new T.Mesh(flat(new T.SphereGeometry(.13, 6, 5)), L('metal', 0x222625)), .45, 1.98, -5.3);
    const hp = place(R, new T.Mesh(flat(new T.TorusGeometry(.24, .04, 5, 8, Math.PI)), L('metal', 0x1c1e1d)), -3.55, 1.15, -5.3); hp.rotation.z = 0;
    C(R, .09, .1, -3.79, 1.02, -5.3, L('metal', 0x1c1e1d), 6); C(R, .09, .1, -3.31, 1.02, -5.3, L('metal', 0x1c1e1d), 6);
    C(R, .08, WH - 1.1, -3.95, 1.0, -6.8, L('metal', 0x2a2e2c), 6);                          // antenna conduit
    Pl(R, 2.0, .5, -1.5, 3.4, -6.88, E('label_wn'));
    // control desk on the left wall
    const w = L('wood');
    B(R, 1.8, .12, 4.2, -6.0, .95, 0, w); B(R, 1.6, .95, .12, -6.0, 0, -2.0, w); B(R, 1.6, .95, 1.1, -6.0, 0, 1.5, L('wood_dark')); solid(i, -6.0, 0, .95, 2.1);
    B(R, 1.1, .03, .76, -5.8, 1.07, .3, L(null, 0x6a2020), 1, .15);                          // logbook, open
    B(R, .5, .05, .68, -5.98, 1.1, .3, L('paper'), 1, .15); B(R, .5, .05, .68, -5.58, 1.1, .3, L('paper'), 1, .15);
    C(R, .22, .05, -6.45, 1.07, -1.4, L('metal', 0x333836), 8); C(R, .03, .7, -6.45, 1.1, -1.4, L('metal', 0x333836), 5);
    C(R, .3, .3, -6.45, 1.78, -1.4, L('metal', 0x4a6a48), 7, .06);
    Pl(R, .16, .16, -6.45, 1.78, -1.3, E(null, 0xffe8a8));
    B(R, .9, .12, .9, -4.3, .55, .2, L('wood_dark')); B(R, .12, .9, .9, -3.85, .6, .2, L('wood_dark')); C(R, .08, .55, -4.3, 0, .2, L('metal', 0x333836), 6);
    // cabinets, pinboard, clock, pipes, bin, boxes
    for (const z of [-4.7, -3.5]) { B(R, 1.0, 1.6, 1.1, -6.3, 0, z, L('cabinet', 0xa0a89c), 1.6); }
    solid(i, -6.3, -4.1, .6, 1.2);
    const pb = wg(R, 'z', -5.6, 1.9, .02); B(pb, 2.1, 1.7, .1, 0, 0, 0, L('cork'), 1.5); for (const [x, y, c] of [[-.6, 1.0, 0xe8e4d0], [.1, .5, 0xd8d4c0], [.5, 1.1, 0xe8d8a0], [-.3, .3, 0xe8e4d0]]) Pl(pb, .4, .5, x, y - .25, .07, L('paper', c));
    const ck = wg(R, 'z', 1.0, 3.2, .02); Pl(ck, .9, .9, 0, 0, 0, L('clock'));
    Pipe(R, .12, 13.6, 0, 4.95, -6.75, 'x', L('metal', 0x3a4440));
    C(R, .12, 5.0, -6.6, 0, -6.6, L('metal', 0x3a4440), 6);
    C(R, .25, .5, -3.6, 0, -2.2, L('metal', 0x2a2e2c), 6, .2);
    B(R, .8, .7, .8, 2.6, 0, -6.4, L('cardboard')); B(R, .7, .6, .7, 3.5, 0, -6.4, L('cardboard'), 2, .3); B(R, .6, .5, .6, 2.9, .7, -6.3, L('cardboard'), 2, .6);
    solid(i, 3.0, -6.4, 1.3, .6);
    for (const [x, y, z] of [[-4.2, 3.8, -6.84], [5.2, 4.2, -6.84]]) wallLight(R, x, y, z);
    B(R, 3.4, .03, .05, -3.8, .03, -4.7, L(null, 0x0a0a0a), 1, .3); B(R, 2.4, .03, .05, -4.4, .03, -4.3, L(null, 0x0a0a0a), 1, .1);   // floor cables
  }

  // =========================================================== ROOM 1 — EQUIPMENT ROOM
  {
    const i = 1, R = shell(1, 'floor_conc', 'concrete_dark', 'concrete', 3);
    stairsUp(i); stairsDown(i);
    B(R, 14, .01, .5, 0, 0, -4.3, L('hazard'), 1).position.y = .05;                          // hazard line
    const rk = L('metal', 0x2a2f33), cols = [0x30ff60, 0xffb030, 0xff3030];
    for (let k = 0; k < 6; k++) {
      const x = -5.4 + k * 1.55;
      B(R, 1.35, 3.7, 1.3, x, 0, -6.3, rk, 1.5);
      Pl(R, 1.25, 3.5, x, .1, -5.64, E('rack_front'));
      for (let b = 0; b < 8; b++) for (let q = 0; q < 2; q++) { if (rnd() < .3) continue; const led = Pl(R, .07, .07, x - .5 + q * .09, .1 + 3.5 * (1 - (2 + b * 7.5 + 2) / 64) , -5.63, E(null, cols[rnd() * 3 | 0])); leds.push({ m: led, rate: 2 + rnd() * 7, ph: rnd() * 6.3, th: -.5 + rnd() * .9 }); }
      for (let c = 0; c < 2; c++) C(R, .05, 1.0, x - .3 + c * .6, 3.7, -6.2, L(null, 0x0c0d0e), 5);
    }
    solid(i, -1.55, -6.3, 4.6, .7);
    B(R, 9.6, .1, .55, -1.5, 4.55, -6.55, L('metal', 0x555a58), 1);                          // cable tray
    B(R, 3.0, .03, .05, -4.6, .03, -5.2, L(null, 0x0a0a0a), 1, .35); B(R, 2.0, .03, .05, -5.6, .03, -3.6, L(null, 0x0a0a0a), 1, .1);
    // generator on the left
    B(R, 1.6, 1.6, 3.0, -6.0, 0, 2.2, L('metal', 0x4a5a40), 2); solid(i, -6.0, 2.2, .85, 1.55);
    for (let k = 0; k < 6; k++) B(R, .12, 1.3, .12, -5.15, .15, 1.0 + k * .45, L('metal', 0x3a4636), 1);
    C(R, .28, 3.9, -6.2, 1.6, 3.2, L('metal', 0x3c3f3a), 7); B(R, .95, .06, 2.9, -6.0, 1.62, 2.2, L('hazard'), 1.2);
    Pl(R, 1.3, .45, -5.18, .55, 2.2, L('hazard'), Math.PI / 2);
    for (const z of [-2.6, -1.3]) B(R, 1.0, 1.9, 1.0, -6.3, 0, z, L('cabinet', 0x98a090), 1.8);
    solid(i, -6.3, -1.95, .6, 1.35);
    // wall fan
    const fg = wg(R, 'x', -.1, 3.3, .05); C(fg, .8, .12, 0, -.0, 0, L('metal', 0x3a403c), 10).rotation.x = Math.PI / 2;
    const bl = new T.Group(); bl.position.set(0, 0, .14); fg.add(bl); for (let k = 0; k < 4; k++) { const b = B(bl, .22, .66, .04, 0, 0, 0, L('metal', 0x888e8a), 1); b.position.set(Math.sin(k * 1.5708) * .38, Math.cos(k * 1.5708) * .38, 0); b.rotation.z = -k * 1.5708; }
    fans.push(bl);
    C(R, .55, .9, 4.0, 0, -5.4, L('metal', 0x4a2a22), 8); C(R, .55, .9, 3.9, 0, -6.4, L('metal', 0x2a3a4a), 8);   // drums
    C(R, .1, 5.0, 6.6, 0, -6.6, L('metal', 0x4a5a58), 6); C(R, .1, 5.0, -6.6, 0, -6.6, L('metal', 0x4a5a58), 6);
    Pipe(R, .12, 13.6, 0, 4.95, -6.75, 'x', L('metal', 0x3a4440));
    Pipe(R, .12, 13.6, -6.75, 4.5, 0, 'z', L('metal', 0x3a4440));
    for (const z of [-3, 3]) C(R, .25, .12, -6.7, 4.1, z, L(null, 0xb02a20), 8).rotation.z = Math.PI / 2;
    wallLight(R, 4.4, 3.6, -6.84); wallLight(R, -4.6, 4.2, -6.84);
  }

  // =========================================================== ROOM 2 — BRIEFING OFFICE
  {
    const i = 2, R = shell(2, 'carpet', 'wood_panel', 'plaster_warm', 3);
    stairsDown(i);
    win(R, 'z', 4.3, 2.0, 1.8, 2.0, true);
    const wd = L('wood_dark'), wk = L('wood');
    // briefing table
    B(R, 5.0, .14, 2.4, 0, .95, -1.5, wd); for (const [x, z] of [[-2.3, -2.5], [2.3, -2.5], [-2.3, -.5], [2.3, -.5]]) B(R, .22, .95, .22, x, 0, z, wd, 1);
    solid(i, 0, -1.5, 2.6, 1.3);
    Pl(R, 3.0, 1.9, 0, 1.1, -1.5, L('map', 0xa8a088), 0, -Math.PI / 2).position.y = 1.11;
    for (const [x, z, r] of [[1.7, -.9, .4], [-1.9, -2.1, -.2], [2.0, -2.0, .8]]) Pl(R, .6, .8, x, 1.09, z, L('paper', 0xa8a498), r, -Math.PI / 2).position.y = 1.13;
    C(R, .1, .18, -.2, 1.09, -.7, L(null, 0xc8c4b0), 6); C(R, .1, .18, .1, 1.09, -2.3, L(null, 0xc8c4b0), 6);
    C(R, .2, .05, 1.8, 1.09, -2.0, L('metal', 0x333836), 8); C(R, .03, .6, 1.8, 1.1, -2.0, L('metal', 0x333836), 5); C(R, .26, .22, 1.8, 1.7, -2.0, L('plaster_warm', 0x7a8a52), 7, .08); Pl(R, .14, .14, 1.8, 1.72, -1.9, E(null, 0xffe0a0));
    const chair = (x, z, back) => { B(R, .8, .1, .8, x, .5, z, L('wood_dark', 0x806a5a)); B(R, .8, .9, .1, x, .55, z + back * .4, L('wood_dark', 0x806a5a)); for (const [dx, dz] of [[-.33, -.33], [.33, -.33], [-.33, .33], [.33, .33]]) B(R, .08, .5, .08, x + dx, 0, z + dz, L('metal', 0x333836), 1); };
    chair(-1.3, -3.45, -1); chair(1.3, -3.45, -1); chair(-1.3, .45, 1); chair(1.3, .45, 1);
    // map board on the back wall
    const mb = wg(R, 'z', 0, 1.9, .02); B(mb, 4.3, 2.6, .1, 0, 0, 0, L('cork'), 1.5); Pl(mb, 3.6, 2.0, 0, .3, .07, L('map', 0xa8a088));
    for (const [x, y] of [[-1.5, .5], [1.5, 2.0]]) Pl(mb, .3, .3, x, y, .09, E(null, 0xc01818));
    const st = B(mb, 3.4, .03, .03, 0, 1.2, .1, L(null, 0xb01818), 1); st.rotation.z = .33;
    // chalkboard (left wall) + shelves
    const cb = wg(R, 'x', -3.5, 2.0, .02); B(cb, 3.3, 2.4, .1, 0, 0, 0, L('wood_dark'), 1.5); Pl(cb, 3.1, 2.2, 0, .1, .07, L('chalk'));
    B(R, .9, 3.6, 3.0, -6.5, 0, 3.8, wd); solid(i, -6.5, 3.8, .5, 1.55);
    for (let k = 0; k < 4; k++) { Pl(R, 2.7, .55, -6.04, .3 + k * .85, 3.8, L('books'), Math.PI / 2); }
    B(R, 1.0, 1.6, 1.1, -6.3, 0, -6.2, L('cabinet', 0xa09a8c), 1.6); solid(i, -6.3, -6.2, .6, .6);
    const ck = wg(R, 'z', -4.4, 3.6, .02); Pl(ck, .9, .9, 0, 0, 0, L('clock'));
    // water cooler, dead plant, crate
    B(R, .7, .9, .7, 4.5, 0, -6.4, L('metal', 0xb8c0c0), 1.5); C(R, .3, .7, 4.5, .9, -6.4, L(null, 0x5a90b0), 7); solid(i, 4.5, -6.4, .4, .4);
    C(R, .35, .5, 6.3, 0, -6.0, L('wood', 0x8a6a5a), 6, .28); for (let k = 0; k < 5; k++) { const s = C(R, .02, 1.0 + k * .12, 6.3 + (k - 2) * .1, .5, -6.0 + (k % 2) * .1, L(null, 0x4a3a2a), 4); s.rotation.z = (k - 2) * .18; }
    wallLight(R, -2.9, 4.1, -6.84); wallLight(R, 2.9, 4.1, -6.84);
    B(R, .6, .5, .6, -4.5, 0, 5.8, L('cardboard'), 2, .5);
  }

  // ---------- runtime ----------
  const draw = (s, t) => {
    const g = s.g, w = s.w, h = s.h;
    g.fillStyle = '#031208'; g.fillRect(0, 0, w, h);
    if (s.mode == 0) { g.fillStyle = '#4aff7a'; for (let x = 0; x < w; x += 2) { const a = Math.abs(Math.sin(x * .35 + t * 7)) * Math.sin(x * .07 + t * 2) * 14; g.fillRect(x, h / 2 - a, 1, a * 2 + 1); } g.fillStyle = '#1c8a3a'; g.fillRect(0, h - 6, w, 1); g.fillStyle = '#4aff7a'; g.fillRect(2, h - 4, 14, 2); g.fillRect(20, h - 4, (t * 8) % 30, 2); }
    else { g.fillStyle = '#4aff7a'; for (let r = 0; r < 7; r++) { const o = ((t * 6) % 6) | 0, len = 10 + ((r * 7 + o * 3) % 40); g.fillRect(3, 3 + r * 6, len, 2); } if ((t * 2 | 0) % 2) g.fillRect(3, h - 6, 4, 3); }
    g.fillStyle = 'rgba(0,0,0,.35)'; for (let y = 0; y < h; y += 2) g.fillRect(0, y, w, 1);
    s.t.needsUpdate = true;
  };
  let lastDraw = -1;
  const lightFor = i => { const L = LIGHT[i]; key.color.setHex(L.k[0]); key.intensity = L.k[1]; key.position.set(IX + L.k[2], L.k[3], IZ + L.k[4]); acc.color.setHex(L.a[0]); acc.intensity = L.a[1]; acc.position.set(IX + L.a[2], L.a[3], IZ + L.a[4]); };
  const setSolids = i => { for (let k = sol.length - 1; k >= 0; k--) if (sol[k].interior) sol.splice(k, 1); if (i >= 0) for (const s of S[i]) { s.interior = true; sol.push(s); } };

  return {
    show(i) { cur = i; rooms.forEach((g, k) => g.visible = k == i); lightFor(i); setSolids(i); },
    hide() { cur = -1; rooms.forEach(g => g.visible = false); key.intensity = acc.intensity = 0; setSolids(-1); },
    update(t) {
      if (cur < 0) return;
      if (cur == 0 && t - lastDraw > .08) { lastDraw = t; for (const s of screens) draw(s, t); }
      if (cur == 1) {
        for (const l of leds) l.m.visible = Math.sin(t * l.rate + l.ph) > l.th;
        for (const f of fans) f.rotation.z = -t * 9;
        acc.intensity = 1.2 + .2 * Math.sin(t * 17) * Math.sin(t * 3.1);
      }
      if (cur == 2) acc.intensity = .4 + (Math.sin(t * 23) > .96 ? -.2 : 0);
    },
  };
}
