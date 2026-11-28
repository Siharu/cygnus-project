// ===== DRIFTER — "???" CITY (section 03) =====
// A city with its name scraped off. Built from the POI sprite library, the station's foliage, rocks and terrain tiles, and the supply props. Layout data is in city_layout.js,
// sprite measurements and the angle corrections in city_catalog.js (scripts/city_catalog.py),
// repainting of the POI art's faults in city_shade.js.
//
// API:  const CITY = await buildCity(ctx, progress)
//   ctx = { T, sc, IM, META, spr, SPR, sol, circ, LT, viewPt, glowTex, ren }
//   CITY.objects (examine points)  .notes  .exit  .sign  .spawn  .bounds  .amb  .fog  .fogD  .ground  .habitat
//   CITY.update(t, dt, P)   CITY.setVisible(bool)   CITY.wrong(P) -> 0..1 screen wrongness
import { CAT } from './city_catalog.js';
import * as L from './city_layout.js';
import { PROPS, PROP_SIZE } from './props.js';
import { retouch, straighten, GLARE } from './city_shade.js';

const OX = 0, OZ = 1000;            // far from the station (0,0) and Silvan (1000,0)
const HALF = 75, PPU = 20;          // painted ground: 150 x 150 units

// size of a corrected sprite in the world: L.HEIGHT is the height of the art as drawn, in units
function dims(k) { const m = CAT[k], unit = L.HEIGHT[k] / m.h; return { m, unit, w: m.W * unit, h: m.H * unit }; }
// a point on the art as drawn (fractions across, down) -> the same point on the corrected sprite
function warped(k, u, v) { const m = CAT[k], [s, c, kk, e, f] = m.t; return [(s * u * m.w + e) / m.W, (c * u * m.w + kk * v * m.h + f) / m.H]; }
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const url = p => new URL('../../assets/' + p, import.meta.url).href;
const load = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('city asset ' + src.split('/').pop())); i.src = src; });

export async function buildCity(ctx, progress = () => {}) {
  const { T, sc, IM, META, spr, SPR, sol, circ, LT, viewPt, glowTex, ren } = ctx;
  const R = mulberry(0x3C17), rr = (a, b) => a + R() * (b - a);
  const frame = () => new Promise(r => requestAnimationFrame(r));
  progress(.03, 'No name on file…');

  // ---------- art ----------
  const files = {};
  for (const k in CAT) files[k] = 'DRIFTER_POI_Asset_Library_v2/Individual_PNGs/SRC-' + k.slice(1).padStart(3, '0') + '_MasterSheetA_Extract.png';
  files.p33 = 'city/sign_unknown.png';
  for (const [id] of L.SUPPLIES) files[id] = 'game/props/' + id + '.png';
  const img = {}; let done = 0; const keys = Object.keys(files);
  await Promise.all(keys.map(async k => { img[k] = await load(url(files[k])); progress(.05 + .55 * ++done / keys.length, 'Reading the streets…'); }));
  // everything that can fail has loaded: only now is anything added to the world
  for (const k in CAT) { img[k] = straighten(retouch(img[k], k), k); if (++done % 12 === 0) await frame(); }
  progress(.64, 'Drawing the shadows in…');
  const TX = {};
  const tex = (k, flip) => {
    const id = k + (flip ? '~' : ''); if (TX[id]) return TX[id];
    const t = new T.Texture(img[k]); t.magFilter = T.LinearFilter; t.minFilter = T.LinearMipmapLinearFilter;
    if (flip) { t.wrapS = T.RepeatWrapping; t.repeat.x = -1; t.offset.x = 1; }
    t.needsUpdate = true; return TX[id] = t;
  };

  // ---------- registries ----------
  const grp = new T.Group(); grp.visible = false; sc.add(grp);   // ground and light effects
  const shadows = [], windows = [];
  const fadeable = s => {           // tall things dither out when they cover the player (same trick as forest.js)
    const m = s.material; s.userData.f = 1;
    m.onBeforeCompile = sh => {
      sh.uniforms.fade = m.userData.fu = { value: 1 };
      sh.fragmentShader = sh.fragmentShader.replace('void main() {', 'uniform float fade;\nvoid main() {')
        .replace('#include <alphatest_fragment>', '#include <alphatest_fragment>\n if (fade < .999 && fract(52.9829189 * fract(dot(floor(gl_FragCoord.xy), vec2(.06711056, .00583715)))) > fade) discard;');
    };
  };
  function sprite(k, x, z, h, w, ax, c, depth, flip) {
    const mat = new T.SpriteMaterial({ map: tex(k, flip), alphaTest: .4, transparent: false, fog: true });
    const s = new T.Sprite(mat); s.scale.set(w, h, 1); s.center.set(ax, c); s.frustumCulled = false;
    // sliding along the view axis changes only the depth order, never where the sprite lands on screen
    s.position.set(OX + x - depth / 3, -depth / 3, OZ + z - depth / 3);
    s.userData = { x: OX + x, z: OZ + z, w, h, c, ax, mat, key: 'city_' + k };
    sc.add(s); SPR.push(s); return s;
  }
  const lightAt = (x, z, color, I, Rr, y = 2.4) => { const c = new T.Color(color), l = { x: OX + x, z: OZ + z, y, c: color, I, R: Rr, cc: [c.r, c.g, c.b] }; LT.push(l); return l; };
  function flare(pos, size, color, opacity) {
    const s = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color, blending: T.AdditiveBlending, transparent: true, depthWrite: false, opacity, fog: false }));
    s.position.copy(pos); s.scale.set(size, size, 1); s.frustumCulled = false; grp.add(s); return s;
  }
  const poolGeo = new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  function pool(x, z, size, color, opacity) {     // light lying on the ground
    const m = new T.Mesh(poolGeo, new T.MeshBasicMaterial({ map: glowTex, color, blending: T.AdditiveBlending, transparent: true, depthWrite: false, depthTest: false, opacity, fog: false }));
    m.scale.set(size, 1, size); m.position.set(OX + x, .04, OZ + z); m.renderOrder = -98; m.frustumCulled = false; grp.add(m); return m;
  }

  function glare(s, k, c, flip) {                   // city_shade.js: a light beside whatever should not be looked at
    const { x, z, w, h } = s.userData;
    for (const [u0, v0, size, color, o, fl] of GLARE[k] || []) {
      const [u, v] = warped(k, u0, v0), p = viewPt(new T.Vector3(x, 0, z), ((flip ? 1 - u : u) - s.center.x) * w, (1 - v - c) * h, 12);
      windows.push({ glow: flare(p, size, color, o), base: o, ph: R() * 9, fl });
    }
  }

  // ---------- buildings ----------
  const lots = [];
  function building(k, x, z, flip, lit) {
    const { m, w, h } = dims(k);
    let a = m.a * w, b = m.b * w; if (flip) [a, b] = [b, a];
    // lot lines (see city_layout.js): push that side of the footprint against the line
    if (typeof x === 'string') x = +x.slice(1) + (x[0] === 'e' ? -a / 2 : a / 2);
    if (typeof z === 'string') z = +z.slice(1) + (z[0] === 's' ? -b / 2 : b / 2);
    const c = (a + b) / 2 * .4082 / h + m.gap;
    const s = sprite(k, x, z, h, w, flip ? 1 - m.ax : m.ax, c, Math.abs(a - b) / 2, flip);
    fadeable(s);
    sol.push({ x: OX + x, z: OZ + z, rx: a * .47, rz: b * .47 });
    shadows.push({ x, z, rx: a * .5, rz: b * .5, ht: h, rect: 1 });
    if (Math.abs(x) < 50 && Math.abs(z) < 54) lots.push({ x, z, a, b });
    for (const [u0, v0] of lit || []) {           // somebody left these windows on
      const [u, v] = warped(k, u0, v0);
      const p = viewPt(new T.Vector3(OX + x, 0, OZ + z), ((flip ? 1 - u : u) - s.center.x) * w, (1 - v - c) * h, 12);
      windows.push({ glow: flare(p, 2.4, 0xffb060, .4), base: .4, ph: R() * 9 });
    }
    glare(s, k, c, flip);
    if (lit) { const fx = x + a * .5 + 1, fz = z + b * .5 + 1; lightAt(fx, fz, 0xffb060, .8, 10); pool(fx, fz, 9, 0xffa050, .16); }
  }
  for (const [k, x, z, f, lit] of L.BUILDINGS) building(k, x, z, !!f, lit);
  for (const [k, x, z, f] of L.BACKDROP) { if (CAT[k].axis) plane(k, x, z); else building(k, x, z, !!f); }
  progress(.68, 'Counting windows…'); await frame();

  // ---------- fences, walls, the sign: upright planes in the world, so they sort correctly along their length ----------
  function plane(k, x, z, axis) {                  // centred on (x, z), which is where the middle of its foot goes
    const { m, unit, w, h } = dims(k), flip = !!axis && axis !== m.axis, alongX = (m.axis === 'x') !== flip;
    const pos = [], uv = [];
    for (const [u, v] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {     // top-left, top-right, bottom-left, bottom-right
      const sx = (u * m.W - m.px) * unit * (flip ? -1 : 1), sy = (m.py - v * m.H) * unit;   // screen offset from that point
      const t = (alongX ? sx : -sx) / .7071, y = (sy + .4082 * t) / .8165;
      pos.push(alongX ? t : 0, y, alongX ? 0 : t); uv.push(u, 1 - v);
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
    g.setIndex([0, 2, 1, 1, 2, 3]);
    const mat = new T.MeshBasicMaterial({ map: tex(k), alphaTest: .4, side: T.DoubleSide, fog: true });
    const s = new T.Mesh(g, mat); s.position.set(OX + x, 0, OZ + z); s.frustumCulled = false;
    s.userData = { x: OX + x, z: OZ + z, w, h, c: .2, ax: .5, mat, key: 'city_' + k };
    sc.add(s); SPR.push(s);
  }
  const length = k => { const { m, unit } = dims(k); return m.run * unit / .7071; };   // of one piece, along its axis
  for (const [k, x, z, axis, n] of L.FENCES) {
    const len = length(k), dx = axis === 'x' ? 1 : 0, dz = 1 - dx;
    for (let i = 0; i < n; i++) {                  // post to post; alternate pieces a hair apart so shared posts do not shimmer
      const o = (i + .5) * len, nudge = (i % 2) * .006;
      plane(k, x + dx * o + dz * nudge, z + dz * o + dx * nudge, axis);
    }
    const half = n * len / 2, cx = x + dx * half, cz = z + dz * half;
    sol.push({ x: OX + cx, z: OZ + cz, rx: dx ? half : .35, rz: dz ? half : .35 });
    shadows.push({ x: cx, z: cz, rx: dx ? half : .3, rz: dz ? half : .3, ht: L.HEIGHT[k] * .6, rect: 1 });
  }
  { plane('p33', L.SIGN.x, L.SIGN.z);
    const len = length('p33'); for (const o of [-len * .36, len * .36]) circ.push({ x: OX + L.SIGN.x + o, z: OZ + L.SIGN.z, r: .45 }); }

  // ---------- street furniture ----------
  for (const [k, x, z] of L.PROPS) {
    const { w, h } = dims(k), r = (L.SOLID[k] || 0) * w;
    const c = Math.min(.2, w * .16 / h), s = sprite(k, x, z, h, w, .5, c, 0, false);
    if (h >= 3.5) fadeable(s);
    glare(s, k, c, false);
    if (r) { circ.push({ x: OX + x, z: OZ + z, r }); shadows.push({ x, z, rx: r * 1.2, rz: r, ht: h }); }
  }
  // greenery and rubble from the station's libraries
  const green = (k, x, z, h) => {
    const s = spr(k, OX + x, OZ + z, h, { flip: R() < .5 });
    if (h >= 3.5) fadeable(s);
    shadows.push({ x, z, rx: s.userData.w * .2, rz: s.userData.w * .16, ht: h });
  };
  for (const [k, x, z, h] of L.GREEN) { green(k, x, z, h); if (h >= 5) circ.push({ x: OX + x, z: OZ + z, r: .6 }); }
  for (const [k, x, z, s] of L.RUBBLE) { const m = META[k]; if (!m) continue; green(k, x, z, m.h * s); circ.push({ x: OX + x, z: OZ + z, r: m.w * s * .28 }); }
  const blocked = (x, z, pad) => sol.some(s => Math.abs(OX + x - s.x) < s.rx + pad && Math.abs(OZ + z - s.z) < s.rz + pad) || circ.some(c => Math.hypot(OX + x - c.x, OZ + z - c.z) < c.r + pad);
  const onRoad = (x, z) => Math.abs(x) < 8.8 && z > -15 || z > 3 && z < 16 || Math.abs(x) < 19 && z > -49 && z < -13;
  for (let i = 0, n = 0; i < 1400 && n < 90; i++) {   // weeds in the lots
    const x = rr(-52, 52), z = rr(-56, 57); if (onRoad(x, z) || blocked(x, z, .7)) continue;
    const k = ['fol_fern_clump', 'fol_tall_wild_grass', 'fol_creeping_groundcover', 'fol_fallen_leafy_branch', 'fol_broadleaf_plant'][R() * 5 | 0];
    green(k, x, z, rr(.9, 1.9)); n++;
  }

  // ---------- lamps ----------
  const lamps = [];
  for (const [x, z, dead] of L.LAMPS) {
    const { w, h } = dims('p59'), flip = x > 0, foot = warped('p59', .76, .96), top = warped('p59', .26, .1);
    // the art has its post on the right and its head on the left; the post stands on (x, z)
    const s = sprite('p59', x, z, h, w, flip ? 1 - foot[0] : foot[0], 1 - foot[1], 0, flip);
    const out = (foot[0] - top[0]) * w, up = (foot[1] - top[1]) * h;   // from the foot to the lamp head
    fadeable(s); circ.push({ x: OX + x, z: OZ + z, r: .32 });
    if (dead) continue;
    const head = viewPt(new T.Vector3(OX + x, 0, OZ + z), (flip ? out : -out), up, 1.2);
    // ground point under the head (for the light it throws)
    const side = (flip ? out : -out) * .7071, lx = x + side, lz = z - side;
    lamps.push({ x: OX + x, z: OZ + z, head, glow: flare(head, 2.6, 0xffc27a, .6), pool: pool(lx, lz, 11, 0xffae60, .2), light: lightAt(lx, lz, 0xffbd78, .95, 12), k: 1, ph: R() * 9 });
  }
  // the one lit machine, and the mast's beacon
  const vendGlow = flare(viewPt(new T.Vector3(OX, 0, OZ - 29), 0, 1.7, 1.2), 3.4, 0xff8a70, .45);
  pool(0, -27.8, 7, 0xff7a60, .22); lightAt(0, -28.4, 0xff8a70, .9, 8);
  const mast = flare(viewPt(new T.Vector3(OX, 0, OZ - 43), 0, L.HEIGHT.p23 * .8, 12), 3.2, 0xff2a1a, 0);
  const mastLight = lightAt(0, -38, 0xff2a20, 0, 20);

  // ---------- examine points and supplies ----------
  const objects = [], notes = [];
  for (const [name, x, z, note] of L.NOTES) { const q = { x: OX + x, z: OZ + z, n: name, note }; objects.push(q); notes.push(q); }
  const exit = { x: OX + L.EXIT.x, z: OZ + L.EXIT.z };
  objects.push({ x: exit.x, z: exit.z, n: 'Road back to WNCORE Station', t: 'f', to: 0 });
  const supplies = PROPS.flat();
  for (const [id, x, z] of L.SUPPLIES) {
    const p = supplies.find(q => q.id === id);
    const s = sprite(id, x, z, PROP_SIZE, PROP_SIZE, .5, .05, 0, false);
    const glint = flare(new T.Vector3(OX + x, .5, OZ + z), 1.1, 0xfff0c0, .22);
    const q = { x: OX + x, z: OZ + z, n: p.n, t: 'c', p, take() { s.userData.hide = true; glint.visible = false; objects.splice(objects.indexOf(q), 1); } };
    objects.push(q);
  }

  // ---------- ground ----------
  progress(.78, 'Painting the avenue…'); await frame();
  const size = HALF * 2 * PPU, cv = document.createElement('canvas'); cv.width = cv.height = size;
  const g = cv.getContext('2d'), px = v => (v + HALF) * PPU;
  const CELL = 7;
  function tiles(m, x0, z0, x1, z1) {              // 7-unit tiles on one shared grid, clipped to the rectangle
    g.save(); g.beginPath(); g.rect(px(x0), px(z0), (x1 - x0) * PPU, (z1 - z0) * PPU); g.clip();
    for (let z = Math.floor((z0 + HALF) / CELL); z * CELL - HALF < z1; z++) for (let x = Math.floor((x0 + HALF) / CELL); x * CELL - HALF < x1; x++) {
      const v = (x * 7 + z * 13 + (x * z & 3)) & 3;
      g.drawImage(IM['tile_' + m + v], x * CELL * PPU, z * CELL * PPU, CELL * PPU + 1, CELL * PPU + 1);
    }
    g.restore();
  }
  const fill = (x0, z0, x1, z1, c) => { g.fillStyle = c; g.fillRect(px(x0), px(z0), (x1 - x0) * PPU, (z1 - z0) * PPU); };
  tiles('soil', -HALF, -HALF, HALF, HALF);
  tiles('pave', -44, -48, -8.5, 2.5); tiles('pave', -44, 19.5, -8.5, 51);
  for (const [x0, z0, x1, z1] of [[-35.5, -46, -30.5, 2], [-46, -26.5, -35.5, -24.5], [-30.5, -15, -20, -12]]) tiles('soil', x0, z0, x1, z1);
  tiles('asphalt', 11, -50, 48, 1.5);                              // industrial yard
  tiles('asphalt', 8.5, 15.5, 29, 29); tiles('pave', 9, 31, 29, 48);
  tiles('pave', -HALF, 3.5, HALF, 15.5); tiles('pave', -8.5, -15, 8.5, HALF); tiles('pave', -19, -49, 19, -13);
  tiles('asphalt', -HALF, 6, HALF, 13); tiles('asphalt', -5, -14, 5, HALF);
  for (const z of [5.85, 13]) fill(-HALF, z, HALF, z + .16, 'rgba(196,188,166,.34)');
  for (const x of [-5.16, 5]) { fill(x, -14, x + .16, 6, 'rgba(196,188,166,.34)'); fill(x, 13.1, x + .16, HALF, 'rgba(196,188,166,.34)'); }
  g.fillStyle = 'rgba(205,192,150,.4)';
  for (let z = -12; z < HALF; z += 4.6) if (z < 1 || z > 16.5) g.fillRect(px(-.12), px(z), .24 * PPU, 2.2 * PPU);
  for (let x = -HALF; x < HALF; x += 4.6) if (Math.abs(x + 1.1) > 9) g.fillRect(px(x), px(9.4), 2.2 * PPU, .22 * PPU);
  for (let i = -4; i <= 4; i++) { fill(i * 1.05 - .26, 2.6, i * 1.05 + .26, 5.6, 'rgba(200,194,175,.38)'); fill(i * 1.05 - .26, 13.4, i * 1.05 + .26, 16.4, 'rgba(200,194,175,.38)'); }
  // the square: a circle where the paving was lifted and laid again, slightly wrong
  g.save(); g.beginPath(); g.arc(px(0), px(-29), 5.4 * PPU, 0, 7); g.clip(); g.translate(px(0), px(-29)); g.rotate(.4); g.translate(-px(0), -px(-29)); tiles('pave', -9, -38, 9, -20); g.restore();
  g.strokeStyle = 'rgba(8,10,14,.6)'; g.lineWidth = .18 * PPU; g.beginPath(); g.arc(px(0), px(-29), 5.4 * PPU, 0, 7); g.stroke();
  // every building stands on a slab laid square to the streets
  for (const { x, z, a, b } of lots) {
    const x0 = x - a / 2 - .45, z0 = z - b / 2 - .45, x1 = x + a / 2 + .45, z1 = z + b / 2 + .45;
    tiles('pave', x0, z0, x1, z1); fill(x0, z0, x1, z1, 'rgba(24,26,38,.22)');
    g.strokeStyle = 'rgba(170,164,150,.32)'; g.lineWidth = .14 * PPU; g.strokeRect(px(x0), px(z0), (x1 - x0) * PPU, (z1 - z0) * PPU);
  }
  // moss, grime and cracks
  const blot = (x, z, r, c) => { const gr = g.createRadialGradient(px(x), px(z), 0, px(x), px(z), r * PPU); gr.addColorStop(0, c); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(px(x - r), px(z - r), 2 * r * PPU, 2 * r * PPU); };
  for (let i = 0; i < 520; i++) blot(rr(-HALF, HALF), rr(-HALF, HALF), rr(1, 4.5), i % 3 ? 'rgba(10,12,18,.34)' : 'rgba(52,74,42,.34)');
  for (let i = 0; i < 90; i++) {                     // grass pushing through, along cracks
    let x = rr(-50, 50), z = rr(-54, 56);
    for (let j = 0; j < 7; j++) { blot(x, z, rr(.25, .7), 'rgba(74,104,50,.5)'); x += rr(-.7, .9); z += rr(-.7, .9); }
  }
  g.lineWidth = 1.3;
  for (let i = 0; i < 700; i++) {
    let x = rr(-55, 55), z = rr(-58, 60); g.strokeStyle = 'rgba(5,7,10,' + rr(.25, .55).toFixed(2) + ')'; g.beginPath(); g.moveTo(px(x), px(z));
    for (let j = 0; j < 4; j++) { x += rr(-.8, .8); z += rr(-.8, .8); g.lineTo(px(x), px(z)); } g.stroke();
  }
  for (const [x, z] of [[-2.6, 22], [2.8, -4], [-24, 9], [30, 10], [-2, 40]]) { g.fillStyle = 'rgba(6,8,11,.75)'; g.beginPath(); g.arc(px(x), px(z), .75 * PPU, 0, 7); g.fill(); g.strokeStyle = 'rgba(150,146,132,.4)'; g.stroke(); }
  // cool night wash, darker beyond the walk limit
  fill(-HALF, -HALF, HALF, HALF, 'rgba(14,18,34,.28)');
  const edge = (x0, z0, x1, z1, ax, az, bx, bz) => { const gr = g.createLinearGradient(px(ax), px(az), px(bx), px(bz)); gr.addColorStop(0, 'rgba(6,8,14,0)'); gr.addColorStop(1, 'rgba(6,8,14,.78)'); g.fillStyle = gr; g.fillRect(px(x0), px(z0), (x1 - x0) * PPU, (z1 - z0) * PPU); };
  edge(-HALF, -HALF, -44, HALF, -44, 0, -68, 0); edge(44, -HALF, HALF, HALF, 44, 0, 68, 0);
  edge(-HALF, -HALF, HALF, -50, 0, -50, 0, -72); edge(-HALF, 50, HALF, HALF, 0, 50, 0, 72);
  // cast and contact shadows
  for (const s of shadows) {
    if (s.rect) {
      const len = Math.min(8, s.ht * .34);
      for (let i = 0; i <= 8; i++) { const f = i / 8, k = 1 - .3 * f; fill(s.x + len * f - s.rx * k, s.z + len * .12 * f - s.rz * k, s.x + len * f + s.rx * k, s.z + len * .12 * f + s.rz * k, 'rgba(2,4,8,' + (.085 * (1 - f * .75)).toFixed(3) + ')'); }
      blot(s.x, s.z, Math.max(s.rx, s.rz) * 1.5, 'rgba(2,4,8,.4)');
    } else blot(s.x + Math.min(3, s.ht * .12), s.z, Math.max(.7, s.rx * 1.9), 'rgba(2,4,8,.6)');
  }
  const gtex = new T.CanvasTexture(cv); gtex.anisotropy = Math.min(8, ren.capabilities.getMaxAnisotropy()); gtex.minFilter = T.LinearMipmapLinearFilter;
  const ground = new T.Mesh(new T.PlaneGeometry(HALF * 2, HALF * 2).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ map: gtex, depthWrite: false, depthTest: false, fog: true }));
  ground.position.set(OX, 0, OZ); ground.renderOrder = -100; grp.add(ground);
  { const t = new T.Texture(IM.tile_soil0); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(60, 60); t.needsUpdate = true;
    const o = new T.Mesh(new T.PlaneGeometry(420, 420).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ map: t, color: 0x1c2029, depthWrite: false, depthTest: false }));
    o.position.set(OX, -.05, OZ); o.renderOrder = -101; grp.add(o); }
  progress(.96, 'Switching on what still works…'); await frame();

  // ---------- wildlife: birds on the street, moths at the lamps, eyes in the unlit lots ----------
  const habitat = {
    birds: [[-3, 30], [5, 10], [-18, 8], [-4, -22], [33, -12], [18, 33]].map(([x, z]) => ({ x: OX + x, z: OZ + z, n: 3 + (R() * 3 | 0) })),
    moths: lamps.filter((_, i) => i % 2 === 0).map(l => ({ x: l.head.x - .7, y: l.head.y - .7, z: l.head.z - .7 })),
    eyes: [[-45, -26], [-21, -37], [-44, 9], [-17, 38], [45, -18], [13, -50], [-45, -50], [45, 38], [-18, -14]].map(([x, z]) => ({ x: OX + x, y: rr(.8, 1.7), z: OZ + z })),
  };
  progress(1, '???');

  const near = (a, b, d) => Math.max(0, Math.min(1, 1 - Math.hypot(a.x - b.x, a.z - b.z) / d));
  return {
    objects, notes, habitat, ground, exit,
    sign: { x: OX + L.SIGN.x + 3.2, z: OZ + L.SIGN.z + .6 },
    spawn: { x: OX + L.SPAWN.x, z: OZ + L.SPAWN.z },
    bounds: { x0: OX + L.BOUNDS.x0, x1: OX + L.BOUNDS.x1, z0: OZ + L.BOUNDS.z0, z1: OZ + L.BOUNDS.z1 },
    amb: [.66, .64, .8], fog: 0x1d1d2e, fogD: .0128,
    setVisible(v) { grp.visible = v; },
    wrong(P) { return .04 + .3 * near(P, { x: OX, z: OZ - 33 }, 22); },
    update(t, dt, P) {
      for (const l of lamps) {                      // the lamps sink low as you walk under them
        const target = 1 - .82 * near(P, l, 7.5), flicker = Math.sin(t * 11 + l.ph * 7) > .985 ? .35 : 1;
        l.k += (target - l.k) * Math.min(1, dt * 2.5);
        const k = l.k * flicker;
        l.glow.material.opacity = .6 * k; l.pool.material.opacity = .2 * k; l.light.I = .95 * k;
      }
      for (const w of windows) {
        const dip = w.fl && Math.sin(t * 7.3 + w.ph * 5) * Math.sin(t * 2.9 + w.ph) > .72 ? .15 : 1;   // a tube on its way out
        w.glow.material.opacity = w.base * (.88 + .12 * Math.sin(t * 2.3 + w.ph)) * dip;
      }
      vendGlow.material.opacity = .4 + .08 * Math.sin(t * 17) * (Math.sin(t * .7) > .6 ? 1 : .15);
      const on = Math.sin(t * 2.4 - 2.2) > -.1;     // the station beacon's rhythm, half a beat late
      mast.material.opacity = on ? .85 : .05; mastLight.I = on ? .8 : .04;
    },
  };
}
