// ===== DRIFTER — THE GREENWAY (forest section) =====
// A separate map, built lazily behind the loading screen the first time the player enters it.
// Everything is made from the existing game assets: foliage / rock sprites (assets/game/fol_*, rok_*)
// and the grass + soil ground tiles, plus a long animated three.js river and a few 3D wooden bridges.
//
// Layout (local coords, world = local + (OX,OZ)): the forest is ~250 units long, west -> east.
// A river winds the whole length (flows west -> east), with a wide pool near x=34 and three bridges.
// A dirt trail follows the banks and crosses at each bridge. Dense woods outside, glades inside.
//
// Tweakables are at the top of buildForest(): river shape (zc/hw), bridge x targets, densities.

export const OX = 1000, OZ = 0;

export async function buildForest(ctx, progress) {
  const { T, sc, IM, META, spr, glow, LT, circ, SHAFT, shaftTex, ren } = ctx;
  const tick = () => new Promise(r => requestAnimationFrame(r));
  let tLast = performance.now();
  const slice = async () => { if (performance.now() - tLast > 14) { await tick(); tLast = performance.now(); } };
  const report = async (p, m) => { progress(Math.min(1, p), m); await tick(); tLast = performance.now(); };
  await report(.03, 'Charting the river…');

  // ---------- helpers ----------
  const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const RN = mulberry(0xF0AE57), rr = (a, b) => a + RN() * (b - a), pick = a => a[RN() * a.length | 0];
  const sm = (a, b, x) => { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
  const hash2 = (x, y) => { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263); h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; };
  const vnoise = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
  const fbm = (x, y) => vnoise(x, y) * .6 + vnoise(x * 2.1 + 7, y * 2.1 + 3) * .3 + vnoise(x * 4.3 + 1, y * 4.3 + 9) * .1;

  // ---------- map size ----------
  const HX = 128, HZ = 52;      // baked ground half-extent
  const PX = 116, PZ = 40;      // player walk bounds
  const FX = 150, FZ = 68;      // sprites are scattered out to here (beyond the ground bake)

  // ---------- river (flows west -> east; edit these three functions to reshape it) ----------
  const zc = x => 9 * Math.sin(x * .034 + .6) + 5 * Math.sin(x * .071 + 2.1) + 2.2 * Math.sin(x * .15 + .4);
  const dzc = x => 9 * .034 * Math.cos(x * .034 + .6) + 5 * .071 * Math.cos(x * .071 + 2.1) + 2.2 * .15 * Math.cos(x * .15 + .4);
  const hw = x => 3.2 + .75 * Math.sin(x * .05 + 1) + 2.8 * Math.exp(-(((x - 34) / 15) ** 2)) + .35 * Math.sin(x * .31);
  const cs = x => 1 / Math.sqrt(1 + dzc(x) ** 2);
  const riverD = (x, z) => Math.abs(z - zc(x)) * cs(x) - hw(x);   // signed distance to the water edge (<0 = in water)

  // ---------- bridges: pick the flattest spot near each target ----------
  const BR = [-62, 2, 64].map(t => {
    let bx = t, best = 9; for (let x = t - 9; x <= t + 9; x += .5) { const s = Math.abs(dzc(x)); if (s < best) { best = s; bx = x; } }
    const l = Math.hypot(1, dzc(bx)), h = hw(bx);
    return { bx, cx: bx, cz: zc(bx), tx: 1 / l, tz: dzc(bx) / l, nx: -dzc(bx) / l, nz: 1 / l, hw: h, half: h + 2.6 };
  });
  const bridgeFrame = (b, x, z) => { const dx = x - b.cx, dz = z - b.cz; return [dx * b.tx + dz * b.tz, dx * b.nx + dz * b.nz]; }; // [u across deck width, v along crossing]
  const onDeck = (x, z, pad = 0) => { for (const b of BR) { const [u, v] = bridgeFrame(b, x, z); if (Math.abs(u) < 1.5 + pad && Math.abs(v) < b.half + 1.2 + pad) return b; } return null; };

  // ---------- trail: follows alternating banks, crossing at each bridge ----------
  const sides = [-1, 1, -1, 1];   // -1 = north bank (smaller z), +1 = south bank
  const trailSide = (x, s) => [x + Math.sin(x * .2) * 1.6, zc(x) + s * (hw(x) + 6.5 + 2.2 * Math.sin(x * .11 + s))];
  const trail = [];
  {
    let a = -124;
    for (let k = 0; k < 4; k++) {
      const b = k < 3 ? BR[k].bx - 11 : 124;
      for (let x = a; x <= b; x += 5) trail.push(trailSide(x, sides[k]));
      if (k < 3) {
        const B = BR[k], e = B.half + 1.8;
        trail.push([B.cx + B.nx * sides[k] * e, B.cz + B.nz * sides[k] * e], [B.cx, B.cz], [B.cx + B.nx * sides[k + 1] * e, B.cz + B.nz * sides[k + 1] * e]);
        a = B.bx + 11;
      }
    }
  }
  const trailD = (x, z) => { let m = 1e9; for (let i = 0; i < trail.length - 1; i++) { const [ax, az] = trail[i], [bx, bz] = trail[i + 1], dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1; const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2)); m = Math.min(m, Math.hypot(x - ax - dx * t, z - az - dz * t)); } return m; };
  const trailAtX = (x, off = 0) => { let bi = 0, bd = 1e9; trail.forEach((p, i) => { const d = Math.abs(p[0] - x); if (d < bd) { bd = d; bi = i; } }); const p = trail[bi], q = trail[Math.min(trail.length - 1, bi + 1)]; return [p[0], p[1]]; };

  await report(.07, 'Finding the old trail…');

  // ---------- placement ----------
  const placed = new Map(), CELL = 10, SHL = [];
  const addPlaced = (x, z, r) => { const k = (Math.floor(x / CELL)) + ',' + (Math.floor(z / CELL)); (placed.get(k) || placed.set(k, []).get(k)).push({ x, z, r }); };
  const free = (x, z, r) => { const cx = Math.floor(x / CELL), cz = Math.floor(z / CELL); for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { const a = placed.get((cx + i) + ',' + (cz + j)); if (a) for (const p of a) if (Math.hypot(x - p.x, z - p.z) < (r + p.r) * .9) return false; } return true; };
  const fadeable = s => {
    const m = s.material; s.userData.f = 1;
    m.onBeforeCompile = sh => {
      sh.uniforms.fade = m.userData.fu = { value: 1 };
      sh.fragmentShader = sh.fragmentShader.replace('void main() {', 'uniform float fade;\nvoid main() {')
        .replace('#include <alphatest_fragment>', '#include <alphatest_fragment>\n if (fade < .999 && fract(52.9829189 * fract(dot(floor(gl_FragCoord.xy), vec2(.06711056, .00583715)))) > fade) discard;');
    };
  };
  function put(key, x, z, h, o = {}) {
    const s = spr(key, OX + x, OZ + z, h, { flip: RN() < .5 });
    const w = s.userData.w;
    if (h >= 2.8) fadeable(s);   // canopies + bushes dither out when they cover the player (see main.js)
    if (o.r) circ.push({ x: OX + x, z: OZ + z, r: o.r });
    addPlaced(x, z, o.sp || w * .2);
    if (o.sh) SHL.push({ x, z, rx: w * o.sh, rz: w * o.sh * .8, a: o.sa || .45 });
    return s;
  }
  const rock = (k, x, z, s, o = {}) => { const m = META[k]; return put(k, x, z, m.h * s, Object.assign({ sh: .3, sa: .4, sp: m.w * s * .3 }, o)); };

  const TREES = [['fol_banyan_tree', 15.5, .22], ['fol_round_canopy_tree', 13, .2], ['fol_round_canopy_tree', 13, .2], ['fol_slim_canopy_tree', 14.5, .14], ['fol_slim_canopy_tree', 14.5, .14], ['fol_wide_branching_tree', 13, .2], ['fol_wide_branching_tree', 13, .2], ['fol_young_tree', 8.5, .12], ['fol_sapling', 5.4, .1]];
  const BUSH = [['fol_dense_bush', 3.6], ['fol_low_wide_bush', 3], ['fol_thorny_shrub', 2.9], ['fol_flowering_bush', 3.4], ['fol_tropical_banana_plant', 3.6]];
  const PLANT = [['fol_fern_clump', 2.4], ['fol_fern_clump', 2.4], ['fol_tall_wild_grass', 3.4], ['fol_broadleaf_plant', 2.6], ['fol_creeping_groundcover', 2], ['fol_fallen_leafy_branch', 1.5]];
  const FLOWER = [['fol_yellow_flower_patch', 1.7], ['fol_white_wildflower_patch', 1.8]];
  const ROCKB = ['rok_01', 'rok_02', 'rok_03', 'rok_04', 'rok_05'];
  const ROCKC = ['rok_08', 'rok_09', 'rok_10', 'rok_12', 'rok_14', 'rok_16', 'rok_17', 'rok_18', 'rok_20', 'rok_22'];
  const ROCKS = ['rok_35', 'rok_37', 'rok_45', 'rok_47', 'rok_44', 'rok_43', 'rok_41', 'rok_40'];
  const dens = (x, z) => fbm(x * .022 + 13, z * .026 + 5);

  // fixed spots: arrival cairn (west end) and spawn just up the trail from it
  const T0 = trailAtX(-112), CAIRN = { x: T0[0], z: T0[1] }, T1 = trailAtX(-106), SPAWN = { x: T1[0], z: T1[1] };
  addPlaced(CAIRN.x, CAIRN.z, 5);

  // trees (dense woods, thinner glades, tight wall outside the walk bounds)
  { let n = 0;
    for (let k = 0; k < 40000 && n < 820; k++) {
      const x = rr(-FX, FX), z = rr(-FZ, FZ), play = Math.abs(x) < PX + 8 && Math.abs(z) < PZ + 6;
      if (RN() > (play ? .08 + .92 * sm(.4, .58, dens(x, z)) : .95)) continue;
      if (riverD(x, z) < 3.4 || trailD(x, z) < 3.2 || Math.hypot(x - CAIRN.x, z - CAIRN.z) < 8 || !free(x, z, 3.1)) continue;
      const t = pick(TREES); put(t[0], x, z, t[1] * rr(.74, .98), { r: .55, sp: 3.1, sh: t[2], sa: .5 }); n++;
      if (k % 400 == 0) await slice();
    } }
  await report(.2, 'Planting the woods…');

  // bushes
  { let n = 0;
    for (let k = 0; k < 30000 && n < 620; k++) {
      const x = rr(-FX, FX), z = rr(-FZ, FZ), d = dens(x, z);
      if (RN() > .18 + .6 * sm(.36, .55, d)) continue;
      if (riverD(x, z) < 1.4 || trailD(x, z) < 2.8 || !free(x, z, 1.4)) continue;
      const b = pick(BUSH); put(b[0], x, z, b[1] * rr(.85, 1.2), { r: .7, sp: 1.4, sh: .22, sa: .35 }); n++;
      if (k % 400 == 0) await slice();
    } }
  await report(.27, 'Scattering ferns and wildflowers…');

  // ground cover; flowers favour the glades
  { let n = 0;
    for (let k = 0; k < 30000 && n < 1000; k++) {
      const x = rr(-FX + 4, FX - 4), z = rr(-FZ + 4, FZ - 4), d = dens(x, z);
      if (riverD(x, z) < .9 || trailD(x, z) < 1.7 || !free(x, z, .9)) continue;
      const g = d < .42 && RN() < .5 ? pick(FLOWER) : pick(PLANT);
      put(g[0], x, z, g[1] * rr(.8, 1.25), { sp: 1.0 }); n++;
      if (k % 500 == 0) await slice();
    } }
  await report(.33, 'Wetting the river banks…');

  // reeds + cattails hugging both banks, stones in the shallows
  for (let x = -FX; x < FX; x += rr(1.3, 2.6)) {
    const c = zc(x), h = hw(x), l = Math.hypot(1, dzc(x)), nx = -dzc(x) / l, nz = 1 / l;
    for (const s of [-1, 1]) {
      if (RN() < .22) continue;
      const off = h + rr(-.4, 1.7), px = x + nx * s * off, pz = c + nz * s * off;
      if (trailD(px, pz) < 1.7 || onDeck(px, pz, 1.5)) continue;
      put(pick(['fol_marsh_reeds', 'fol_cattails', 'fol_cattails', 'fol_tall_wild_grass']), px, pz, rr(3.2, 4.8), { sp: 1.0 });
    }
    if (x % 3 < 1.4 && RN() < .5) {   // a stone sitting in the shallows
      const s = RN() < .5 ? -1 : 1, off = h * rr(.55, .92), px = x + nx * s * off, pz = c + nz * s * off;
      if (!onDeck(px, pz, 2)) { const k = pick(ROCKC.slice(0, 5)); rock(k, px, pz, rr(.017, .024), { sh: 0 }); }
    }
    if (((x * 7) | 0) % 40 == 0) await slice();
  }
  await report(.4, 'Rolling in boulders…');

  // rocks, logs
  { let n = 0;
    for (let k = 0; k < 8000 && n < 40; k++) {
      const x = rr(-FX + 8, FX - 8), z = rr(-FZ + 8, FZ - 8);
      if (riverD(x, z) < 2.5 || trailD(x, z) < 2.4 || !free(x, z, 2)) continue;
      const b = pick(ROCKB); rock(b, x, z, rr(.021, .03), { r: META[b].w * .022 * .3 }); n++;
    }
    n = 0;
    for (let k = 0; k < 8000 && n < 150; k++) {
      const x = rr(-FX + 4, FX - 4), z = rr(-FZ + 4, FZ - 4);
      if (riverD(x, z) < .8 || trailD(x, z) < 1.2 || !free(x, z, .8)) continue;
      rock(pick(ROCKS.concat(ROCKC.slice(5))), x, z, rr(.014, .022)); n++;
    } }

  // ---------- landmarks (examinable) ----------
  const FOB = [];
  const near = (x, off, s) => { const p = trailAtX(x); return [p[0], p[1] + s * off]; };
  const landmark = (x, side, off, o) => { const p = near(x, off, side); const w = { x: OX + p[0], z: OZ + p[1] }; Object.assign(w, o); FOB.push(w); return p; };

  // cairn at the west end: back to the station
  rock('rok_41', CAIRN.x - .5, CAIRN.z + .4, .022, { sh: .3 }); rock('rok_43', CAIRN.x + .6, CAIRN.z - .2, .02, { sh: .3 }); rock('rok_42', CAIRN.x, CAIRN.z - .9, .02, { sh: .3 });
  rock('rok_08', CAIRN.x + .1, CAIRN.z + .1, .016, { sh: 0 });
  FOB.push({ x: OX + CAIRN.x, z: OZ + CAIRN.z, n: 'Trail marker', t: 'f', to: 0 });

  const SIDE = x => x < BR[0].bx ? -1 : x < BR[1].bx ? 1 : x < BR[2].bx ? -1 : 1;
  { const p = landmark(-84, -SIDE(-84), 3.4, { n: 'Fishing line', note: 'A line runs from the bank into the current, still taut. Whatever bit never let go.' }); put('fol_fallen_leafy_branch', p[0], p[1], 1.6, { sp: .6 }); }
  { const x = -30, s = -SIDE(x), p = landmark(x, s, 4.2, { n: 'Mossy boulder', note: 'A frequency is scratched into the moss: 88.7. The cuts are fresh.' }); rock('rok_05', p[0], p[1], .034, { r: META.rok_05.w * .034 * .3, sh: .35 }); }
  { const x = 34, s = -SIDE(x); const p = landmark(x, s, 3.6, { n: 'Still water', note: 'The current slows here. Something large turned in the dark, and the reeds are still swaying.' }); rock('rok_09', p[0], p[1], .02, { sh: .2 }); }
  { const x = 94, s = SIDE(x), p = landmark(x, s, 5.2, { n: 'Hollow banyan', note: 'Cassette tape is wound through the roots. The label says: 88.7, side B.' }); put('fol_banyan_tree', p[0], p[1], 19, { r: .9, sp: 3, sh: .24, sa: .55 }); }
  { const p = landmark(112, SIDE(112), 3.0, { n: 'Sealed trail', note: 'The roots are knotted shut across the path. Beyond them the signal thins to nothing.' }); rock('rok_02', p[0] - 1.5, p[1], .028, { r: META.rok_02.w * .028 * .3 }); rock('rok_03', p[0] + 1.5, p[1] + .5, .026, { r: META.rok_03.w * .026 * .3 }); }
  BR.forEach((b, i) => FOB.push({ x: OX + b.cx, z: OZ + b.cz, n: ['Plank bridge', 'Rope bridge', 'Old crossing'][i], note: ['The planks were mended recently. The nails are still bright.', 'The rail is worn smooth on one side only. Someone crosses here every day.', 'It holds. It should not hold. You decide not to look down.'][i] }));

  await report(.46, 'Laying the ground…');

  // ---------- ground bake ----------
  const GPX = Math.max(8, Math.min(14, Math.floor(Math.min(ren.capabilities.maxTextureSize, 4096) / (HX * 2))));
  const W = HX * 2 * GPX, H = HZ * 2 * GPX, CPT = 7 * GPX;
  const px = x => (x + HX) * GPX, pz = z => (z + HZ) * GPX;
  const tileData = nm => { const o = []; for (let v = 0; v < 4; v++) { const cv = document.createElement('canvas'); cv.width = cv.height = CPT; const g = cv.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(IM['tile_' + nm + v], 0, 0, CPT, CPT); o.push(g.getImageData(0, 0, CPT, CPT).data); } return o; };
  const TG = tileData('grass'), TS = tileData('soil');
  const NCX = Math.ceil(W / CPT), NCZ = Math.ceil(H / CPT), rv = mulberry(77);
  const mkVar = () => { const a = new Uint8Array(NCX * NCZ); for (let z = 0; z < NCZ; z++) for (let x = 0; x < NCX; x++) { let v, t = 0; do { v = rv() * 4 | 0; t++; } while (t < 20 && ((x > 0 && a[z * NCX + x - 1] == v) || (z > 0 && a[(z - 1) * NCX + x] == v))); a[z * NCX + x] = v; } return a; };
  const VGg = mkVar(), VGs = mkVar();

  // trail mask (soft edges via stacked strokes)
  const mk = document.createElement('canvas'); mk.width = W; mk.height = H; const mg = mk.getContext('2d');
  mg.lineJoin = mg.lineCap = 'round';
  for (const [w, a] of [[4.4, .16], [3.6, .26], [2.9, .4], [2.2, .6], [1.6, .8]]) {
    mg.strokeStyle = `rgba(255,255,255,${a})`; mg.lineWidth = w * GPX; mg.beginPath();
    trail.forEach((p, i) => { const X = px(p[0]), Z = pz(p[1]); if (!i) mg.moveTo(X, Z); else { const q = trail[i - 1]; mg.quadraticCurveTo(px(q[0]), pz(q[1]), (px(q[0]) + X) / 2, (pz(q[1]) + Z) / 2); } });
    mg.stroke();
  }
  const TM = mg.getImageData(0, 0, W, H).data;

  // low-res noise fields (4 samples/unit)
  const NW = HX * 8 + 3, NH = HZ * 8 + 3, FP = new Float32Array(NW * NH), FT = new Float32Array(NW * NH);
  for (let j = 0; j < NH; j++) for (let i = 0; i < NW; i++) { const x = i / 4 - HX, z = j / 4 - HZ; FP[j * NW + i] = fbm(x * .09 + 3, z * .09 + 8); FT[j * NW + i] = fbm(x * .05 + 40, z * .05 + 11); }
  await report(.5, 'Laying the ground…');

  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  const out = g.createImageData(W, H), od = out.data, F = Math.round(CPT * .11);
  const colZ = new Float32Array(W), colH = new Float32Array(W), colC = new Float32Array(W), xi = new Int32Array(W), xf = new Float32Array(W);
  for (let X = 0; X < W; X++) { const lx = (X + .5) / GPX - HX; colZ[X] = zc(lx); colH[X] = hw(lx); colC[X] = cs(lx); const f = (X + .5) / GPX * 4; xi[X] = Math.floor(f); xf[X] = f - xi[X]; }
  let sr = 0, sg = 0, sb = 0;
  const samp = (T4, VG, cx, cz, tx, tz, hn, ha, vn, va) => {
    const i = (tz * CPT + tx) * 4; let o = T4[VG[cz * NCX + cx]]; let r = o[i], gg = o[i + 1], b = o[i + 2];
    if (hn) { const n = T4[VG[cz * NCX + cx + hn]]; r += (n[i] - r) * ha; gg += (n[i + 1] - gg) * ha; b += (n[i + 2] - b) * ha; }
    if (vn) { const n = T4[VG[(cz + vn) * NCX + cx]]; r += (n[i] - r) * va; gg += (n[i + 1] - gg) * va; b += (n[i + 2] - b) * va; }
    sr = r; sg = gg; sb = b;
  };
  for (let Y = 0; Y < H; Y++) {
    const lz = (Y + .5) / GPX - HZ, fy = (Y + .5) / GPX * 4, yi = Math.floor(fy), yf = fy - yi;
    const cz = Math.min(NCZ - 1, Y / CPT | 0), tz = Y - cz * CPT;
    let vn = 0, va = 0; if (tz < F && cz > 0) { vn = -1; va = .5 * (1 - sm(0, F, tz)); } else if (tz >= CPT - F && cz < NCZ - 1) { vn = 1; va = .5 * (1 - sm(0, F, CPT - 1 - tz)); }
    for (let X = 0; X < W; X++) {
      const cx = Math.min(NCX - 1, X / CPT | 0), tx = X - cx * CPT;
      let hn = 0, ha = 0; if (tx < F && cx > 0) { hn = -1; ha = .5 * (1 - sm(0, F, tx)); } else if (tx >= CPT - F && cx < NCX - 1) { hn = 1; ha = .5 * (1 - sm(0, F, CPT - 1 - tx)); }
      const a0 = xi[X], fx = xf[X], k0 = yi * NW + a0, k1 = k0 + NW, w00 = (1 - fx) * (1 - yf), w10 = fx * (1 - yf), w01 = (1 - fx) * yf, w11 = fx * yf;
      const pn = FP[k0] * w00 + FP[k0 + 1] * w10 + FP[k1] * w01 + FP[k1 + 1] * w11, tn = FT[k0] * w00 + FT[k0 + 1] * w10 + FT[k1] * w01 + FT[k1 + 1] * w11;
      const d = Math.abs(lz - colZ[X]) * colC[X] - colH[X];
      const wb = d < 8 ? 1 - sm(.1, 3.2 + (pn - .5) * 3.4, d) : 0;
      const wt = TM[(Y * W + X) * 4 + 3] / 255 * .94;
      const wp = sm(.64, .76, pn) * .6;
      const ws = Math.max(wb, wt, wp);
      samp(TG, VGg, cx, cz, tx, tz, hn, ha, vn, va); let R = sr, G = sg, B = sb;
      if (ws > .004) { samp(TS, VGs, cx, cz, tx, tz, hn, ha, vn, va); R += (sr - R) * ws; G += (sg - G) * ws; B += (sb - B) * ws; }
      let m = .84 + .3 * tn; if (d < 1.4) m *= .7 + .3 * sm(-.6, 1.4, d);
      const o = (Y * W + X) * 4; od[o] = R * m; od[o + 1] = G * m; od[o + 2] = B * m; od[o + 3] = 255;
    }
    if (Y % 8 == 0) { await slice(); if (Y % 96 == 0) progress(.5 + .33 * Y / H, 'Laying the ground…'); }
  }
  g.putImageData(out, 0, 0);
  for (const s of SHL) {
    g.save(); g.translate(px(s.x), pz(s.z)); g.scale(s.rx * GPX, s.rz * GPX);
    const gr = g.createRadialGradient(0, 0, .05, 0, 0, 1); gr.addColorStop(0, `rgba(3,8,6,${s.a})`); gr.addColorStop(.6, `rgba(3,8,6,${s.a * .45})`); gr.addColorStop(1, 'rgba(3,8,6,0)');
    g.fillStyle = gr; g.fillRect(-1, -1, 2, 2); g.restore();
  }
  await report(.86, 'Filling the river…');

  // ---------- scene objects ----------
  const grp = new T.Group(); sc.add(grp);
  const gtex = new T.CanvasTexture(cv); gtex.anisotropy = Math.min(8, ren.capabilities.getMaxAnisotropy()); gtex.minFilter = T.LinearMipmapLinearFilter; gtex.magFilter = T.LinearFilter;
  const ground = new T.Mesh(new T.PlaneGeometry(HX * 2, HZ * 2).rotateX(-Math.PI / 2), new T.MeshStandardMaterial({ map: gtex, roughness: 1, depthWrite: false, depthTest: false }));
  ground.position.set(OX, 0, OZ); ground.renderOrder = -100; grp.add(ground);
  { const t = new T.Texture(IM.tile_grass0); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(52, 26); t.anisotropy = 4; t.needsUpdate = true;
    const o = new T.Mesh(new T.PlaneGeometry(364, 182).rotateX(-Math.PI / 2), new T.MeshStandardMaterial({ map: t, roughness: 1, color: 0x5c6a62, depthWrite: false, depthTest: false }));
    o.position.set(OX, -.05, OZ); o.renderOrder = -101; grp.add(o); }

  // river ribbon
  const X0 = -FX - 10, X1 = FX + 10, N = Math.round((X1 - X0) / 1) + 1, pos = new Float32Array(N * 6), uvs = new Float32Array(N * 4), idx = [];
  { let arc = 0, px0 = 0, pz0 = 0;
    for (let i = 0; i < N; i++) {
      const x = X0 + i, c = zc(x), l = Math.hypot(1, dzc(x)), nx = -dzc(x) / l, nz = 1 / l, h = hw(x) * 1.12 * (1 + .07 * Math.sin(x * .9 + 2));
      if (i) arc += Math.hypot(x - px0, c - pz0); px0 = x; pz0 = c;
      pos.set([x - nx * h, 0, c - nz * h, x + nx * h, 0, c + nz * h], i * 6);
      uvs.set([arc, -1, arc, 1], i * 4);
      if (i < N - 1) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    } }
  const wg = new T.BufferGeometry(); wg.setAttribute('position', new T.BufferAttribute(pos, 3)); wg.setAttribute('uv', new T.BufferAttribute(uvs, 2)); wg.setIndex(idx);
  const wu = T.UniformsUtils.merge([T.UniformsLib.fog, { time: { value: 0 } }]);
  const water = new T.Mesh(wg, new T.ShaderMaterial({
    uniforms: wu, transparent: true, depthTest: true, depthWrite: false, fog: true, side: T.DoubleSide,   // transparent pass runs after opaque: depth test keeps bridges/sprites/player above the water
    vertexShader: `varying vec2 vUv;\n#include <fog_pars_vertex>\nvoid main(){vUv=uv;vec4 mvPosition=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}`,
    fragmentShader: `uniform float time;varying vec2 vUv;\n#include <fog_pars_fragment>
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){return vn(p)*.55+vn(p*2.07+3.1)*.3+vn(p*4.3+7.7)*.15;}
void main(){
 float a=abs(vUv.y),u=vUv.x;
 vec2 q=vec2(u*.42-time*.55,vUv.y*2.4);
 float n1=fbm(q*vec2(1.,1.6)),n2=fbm(q*vec2(2.3,3.4)+vec2(-time*.35,11.)),n3=fbm(vec2(u*.14-time*.9,vUv.y*7.)+5.);
 float depth=1.-smoothstep(.15,.95,a);
 vec3 col=mix(vec3(.11,.25,.22),vec3(.03,.10,.12),clamp(depth*.9+(n1-.5)*.35,0.,1.));
 col+=smoothstep(.66,.86,n2*.65+n1*.45)*vec3(.2,.3,.34);
 col+=smoothstep(.72,.95,n3)*vec3(.14,.2,.22)*(.5+.5*depth);
 float foam=smoothstep(.7,.9,a+(n2-.5)*.22)*(1.-smoothstep(.9,1.,a));
 col=mix(col,vec3(.62,.72,.7),foam*.5*(.45+n1));
 float alpha=(1.-smoothstep(.86,1.,a+(n1-.5)*.12))*.94;
 gl_FragColor=vec4(col,alpha);
#include <fog_fragment>
}`
  }));
  water.position.set(OX, .03, OZ); water.renderOrder = -99; water.frustumCulled = false; grp.add(water);

  // ---------- 3D wooden bridges + lanterns ----------
  const wtex = (() => { const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'); x.fillStyle = '#6e4e32'; x.fillRect(0, 0, 32, 32); const r = mulberry(5); for (let i = 0; i < 90; i++) { const v = 60 + r() * 50 | 0; x.fillStyle = `rgba(${v + 20},${v},${v - 20},.35)`; x.fillRect(r() * 32 | 0, r() * 32 | 0, 1 + (r() * 6 | 0), 1); } x.fillStyle = 'rgba(0,0,0,.45)'; for (let y = 0; y < 32; y += 8) x.fillRect(0, y, 32, 1); const t = new T.CanvasTexture(c); t.magFilter = t.minFilter = T.NearestFilter; t.generateMipmaps = false; t.wrapS = t.wrapT = T.RepeatWrapping; return t; })();
  const mWood = new T.MeshLambertMaterial({ map: wtex, color: 0xd8c4a8, emissive: 0x2a2218 }), mDark = new T.MeshLambertMaterial({ map: wtex, color: 0x8a7458, emissive: 0x1a140e });
  const box = (G, w, h, d, x, y, z, m, rx = 0, ry = 0, rz = 0) => { const o = new T.Mesh(new T.BoxGeometry(w, h, d), m); o.position.set(x, y + h / 2, z); o.rotation.set(rx, ry, rz); G.add(o); return o; };
  const lanterns = [];
  const lantern = (G, x, z, wx, wz) => {
    box(G, .16, 2.3, .16, x, 0, z, mDark);
    box(G, .42, .4, .42, x, 2.3, z, new T.MeshBasicMaterial({ color: 0xffd890 }));
    box(G, .55, .1, .55, x, 2.7, z, mDark);
    const c = new T.Color(0xffb868); LT.push({ x: wx, z: wz, c: 0xffb868, I: 1.1, R: 11, cc: [c.r, c.g, c.b] });
    glow(new T.Vector3(wx, 2.5, wz), 2.8, 0xffb868, .85, rr(0, 9));
  };
  for (const b of BR) {
    const G = new T.Group(); G.position.set(OX + b.cx, 0, OZ + b.cz); G.rotation.y = -Math.atan2(b.tz, b.tx); grp.add(G);
    const L = b.half * 2;
    for (let z = -L / 2 + .2; z < L / 2; z += .44) box(G, 3.0, .1, .4, rr(-.03, .03), .27, z + rr(-.02, .02), mWood, 0, rr(-.02, .02));
    for (const x of [-1.2, 0, 1.2]) box(G, .22, .2, L, x, .02, 0, mDark);
    for (const s of [-1, 1]) {
      box(G, .1, .1, L, s * 1.5, 1.0, 0, mDark);
      box(G, .08, .08, L, s * 1.5, .62, 0, mDark);
      for (let z = -L / 2 + .3; z <= L / 2; z += 1.6) box(G, .12, 1.05, .12, s * 1.5, .3, z, mDark);
    }
    for (const sx of [-1.25, 1.25]) for (const sz of [-1, 1]) box(G, .26, 1.3, .26, sx, -.9, sz * (L / 2 - .9), mDark);
    for (const e of [-1, 1]) { box(G, 3.0, .08, 1.28, 0, .15, e * (L / 2 + .55), mWood, e * Math.atan2(.3, 1.2), 0, 0); }
    for (const e of [-1, 1]) { const lx = 1.75, lz = e * (L / 2 - .3); const wx = OX + b.cx + b.tx * lx + b.nx * lz, wz = OZ + b.cz + b.tz * lx + b.nz * lz; lantern(G, lx, lz, wx, wz); }
  }
  { const lx = CAIRN.x + 1.6, lz = CAIRN.z + .3; lantern(grp, OX + lx, OZ + lz, OX + lx, OZ + lz); }

  // sunlight shafts in the glades
  { let n = 0; const r = mulberry(31337);
    for (let k = 0; k < 4000 && n < 18; k++) {
      const x = r() * 2 * PX - PX, z = r() * 2 * PZ - PZ;
      if (dens(x, z) > .42 || riverD(x, z) < 5) continue;
      const m = new T.SpriteMaterial({ map: shaftTex, color: 0xb8e0c0, blending: T.AdditiveBlending, transparent: true, depthWrite: false, opacity: .05, fog: false }); m.rotation = -.5;
      const s = new T.Sprite(m), w = 2 + r() * 4; s.scale.set(w, 22 + r() * 8, 1); s.center.set(.5, .2); s.position.set(OX + x, 0, OZ + z); s.frustumCulled = false; sc.add(s); SHAFT.push({ s, ph: r() * 9, b: .045 + r() * .05 }); n++;
    } }

  await report(.97, 'Listening for the signal…');

  // ---------- runtime API ----------
  const prev = { x: SPAWN.x, z: SPAWN.z };
  const blockedAt = (x, z) => riverD(x, z) < -.2 && !onDeck(x, z);
  const api = {
    objects: FOB,
    spawn: { x: OX + SPAWN.x, z: OZ + SPAWN.z },
    cairn: { x: OX + CAIRN.x, z: OZ + CAIRN.z },
    bounds: { x0: OX - PX, x1: OX + PX, z0: OZ - PZ, z1: OZ + PZ },
    amb: [.6, .76, .72], fog: 0x0e211d, fogD: .0135,
    reset(x, z) { prev.x = x - OX; prev.z = z - OZ; },
    setVisible(b) { grp.visible = b; for (const q of SHAFT) if (q.s.position.x > OX - 400) q.s.visible = b; },
    col(o) {   // river blocks the player except on bridges; slide along the bank
      let lx = o.x - OX, lz = o.z - OZ;
      if (blockedAt(lx, lz)) { if (!blockedAt(lx, prev.z)) lz = prev.z; else if (!blockedAt(prev.x, lz)) lx = prev.x; else { lx = prev.x; lz = prev.z; } }
      o.x = OX + lx; o.z = OZ + lz; prev.x = lx; prev.z = lz;
    },
    elev(x, z) { const b = onDeck(x - OX, z - OZ); if (!b) return 0; const [, v] = bridgeFrame(b, x - OX, z - OZ); return .3 * Math.min(1, Math.max(0, (b.half + 1.2 - Math.abs(v)) / 1.2)); },
    riverDist: (x, z) => Math.max(0, riverD(x - OX, z - OZ)),
    update(t) { wu.time.value = t; },
    stats: { sprites: null, ground: [W, H], bridges: BR.map(b => +b.bx.toFixed(1)) },
    _debug: { zc, hw, riverD, trail, BR }
  };
  await report(1, 'Ready.');
  return api;
}
