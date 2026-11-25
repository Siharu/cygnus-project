// ===== DRIFTER — CHECKPOINT (booth + road apron + up/down barrier) =====
// Built at load from the two renders in assets/HUB/03_Checkpoint_Gate/Corrected_Crosswise/
// (Raised / Lowered). Nothing is pre-cut: the magenta background is keyed out here, the two
// renders are diffed to separate the barrier arm from the scene, and the scene is split into
//   ground    flat apron (road + verge), drawn under everything
//   upright   booth, barrier post, far post, jersey block, sign  (billboards, so the player
//             can walk in front of / behind them)
//   arm       raised pose and lowered pose (+ a short swing between them)
// All coordinates below are pixels of the 1536x1024 source renders.
//
// API:  const CHK = await createCheckpoint(ctx)
//   ctx = { T, IM, META, spr, viewPt, sol, circ, FP, LT, toast, x, z }
//   CHK.lights(glow) must be called once glow() exists (section 4c of main.js)
//   CHK.objects   -> entries for the OB (interaction) list
//   CHK.isUp()    -> barrier state (true = raised / open)

const DIR = '../../assets/HUB/03_Checkpoint_Gate/Corrected_Crosswise/';
const SRC_UP = new URL(DIR + 'DRIFTER_Checkpoint_Gate_Raised_Crosswise.png', import.meta.url).href;
const SRC_DN = new URL(DIR + 'DRIFTER_Checkpoint_Gate_Lowered_Crosswise.png', import.meta.url).href;

export const GEO = {
  K: 0.019,            // view units per source pixel (booth ~5 world units wide)
  SC: 0.7,             // source px -> texture px
  U0: 540, V0: 490,    // booth base centre (source px) -> ctx.x, ctx.z
  booth:   [[340,10],[735,10],[735,482],[548,570],[350,498]],
  post:    [[722,398],[812,398],[812,560],[808,600],[705,600],[705,560],[722,545]],
  farpost: [[1060,626],[1078,610],[1104,600],[1126,612],[1126,725],[1100,742],[1060,728]],
  jersey:  [[1084,742],[1124,730],[1190,704],[1226,686],[1250,692],[1252,756],[1262,775],[1240,790],[1130,818],[1086,815]],
  sign:    [[1262,590],[1283,560],[1310,555],[1338,560],[1340,610],[1318,640],[1300,655],[1298,742],[1282,742],[1280,655],[1262,630]],
  win: [672, 278, 712, 392],          // right window pane (the render left a magenta reflection in it)
  base: { post: [770, 585], pivotG: [790, 585], pivot: [790, 465], farpost: [1100, 735], jersey: [1170, 785], sign: [1290, 742] },
  bands: [[767, 880], [880, 990], [990, 1082]],    // lowered arm is sliced along its length for depth
  armLine: [[770, 585], [1100, 735]],               // ground line of the lowered arm
  cutZ: 13.6, cutBand: 1.6,   // the apron stops at the main road's north edge (world z), dithered over cutBand
};

// ---------------------------------------------------------------- pure pixel work (no DOM)
const SX = 0.7071, SY = 0.4082;

function keyPx(r, g, b, o, i) {
  const m = Math.min(r, b) - g; let a = 255;
  if (m > 30) a = Math.max(0, Math.min(255, 255 * (1 - (m - 30) / 90)));
  if (m > 10) { const ex = (Math.min(r, b) - g - 10) * 0.8; r -= ex; b -= ex; }
  o[i] = r < 0 ? 0 : r; o[i + 1] = g; o[i + 2] = b < 0 ? 0 : b; o[i + 3] = a;
}
const armness = (r, g, b) => {
  if (Math.min(r, b) - g > 80 && r > 180 && b > 180) return -100;     // background magenta
  return Math.max(Math.min(r, g, b) - 120, (r - Math.max(g, b)) - 40, 0); // white / red stripe
};
function dilate(m, W, H, r) {
  const t = new Uint8Array(m.length), o = new Uint8Array(m.length);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (m[y * W + x]) {
    for (let k = Math.max(0, x - r); k <= Math.min(W - 1, x + r); k++) t[y * W + k] = 1; }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (t[y * W + x]) {
    for (let k = Math.max(0, y - r); k <= Math.min(H - 1, y + r); k++) o[k * W + x] = 1; }
  return o;
}

// A, B = raw RGBA (Uint8ClampedArray / Uint8Array) of the Raised / Lowered render, W x H.
// -> { ground, up, dn } keyed RGBA arrays. ground has no arm; up / dn hold only the arm pixels.
export function processGate(A, B, W, H) {
  const n = W * H, ground = new Uint8ClampedArray(n * 4), up = new Uint8ClampedArray(n * 4), dn = new Uint8ClampedArray(n * 4);
  const [wx0, wy0, wx1, wy1] = GEO.win;
  const raw = (S, i, x, y) => {            // raw pixel with the pink window reflection recoloured to warm glass
    let r = S[i], g = S[i + 1], b = S[i + 2];
    if (x >= wx0 && x <= wx1 && y >= wy0 && y <= wy1) {
      const m = Math.min(r, b) - g;
      if (m > 20 && m < 215) { const q = g; r = Math.min(255, 105 + q * 0.7); g = Math.min(255, 70 + q * 0.5); b = Math.min(255, 38 + q * 0.25); }
    }
    return [r, g, b];
  };
  const d0 = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const j = i * 4;
    if (Math.abs(A[j] - B[j]) + Math.abs(A[j + 1] - B[j + 1]) + Math.abs(A[j + 2] - B[j + 2]) > 24) d0[i] = 1;
  }
  const d1 = dilate(d0, W, H, 1);
  for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) {
    const j = i * 4, a = raw(A, j, x, y);
    if (!d1[i]) { keyPx(a[0], a[1], a[2], ground, j); continue; }
    const b = raw(B, j, x, y), sA = armness(a[0], a[1], a[2]), sB = armness(b[0], b[1], b[2]);
    const lA = a[0] + a[1] + a[2], lB = b[0] + b[1] + b[2];
    const pickB = sA > sB || (sA === sB && lA < lB);      // true: A is the arm side here
    if (pickB) { keyPx(b[0], b[1], b[2], ground, j); keyPx(a[0], a[1], a[2], up, j); }
    else { keyPx(a[0], a[1], a[2], ground, j); keyPx(b[0], b[1], b[2], dn, j); }
  }
  return { ground, up, dn };
}

// ---------------------------------------------------------------- DOM + scene
const loadImg = u => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('checkpoint asset ' + u)); i.src = u; });
const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const rawPixels = (img, W, H) => { const c = mkCanvas(W, H), g = c.getContext('2d'); g.drawImage(img, 0, 0); return g.getImageData(0, 0, W, H).data; };
const fromArr = (arr, W, H) => { const c = mkCanvas(W, H); c.getContext('2d').putImageData(new ImageData(arr, W, H), 0, 0); return c; };
function bboxA(arr, W, H, pad) {
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (arr[(y * W + x) * 4 + 3] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return x1 < 0 ? null : [Math.max(0, x0 - pad), Math.max(0, y0 - pad), Math.min(W, x1 + 1 + pad), Math.min(H, y1 + 1 + pad)];
}
// cut a (scaled) piece of a source canvas, optionally clipped to a polygon
function cut(src, x0, y0, x1, y1, SC, poly) {
  const cw = Math.max(1, Math.ceil((x1 - x0) * SC)), ch = Math.max(1, Math.ceil((y1 - y0) * SC)), c = mkCanvas(cw, ch), g = c.getContext('2d');
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  if (poly) { g.beginPath(); poly.forEach(([x, y], i) => { const px = (x - x0) * SC, py = (y - y0) * SC; i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.closePath(); g.clip(); }
  g.drawImage(src, x0, y0, x1 - x0, y1 - y0, 0, 0, cw, ch);
  return { c, x0, y0, cw, ch };
}
const polyBox = p => { const xs = p.map(q => q[0]), ys = p.map(q => q[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; };

export async function createCheckpoint(ctx) {
  const { T, IM, META, spr, viewPt, sol, circ, FP, LT, toast } = ctx;
  const { K, SC, U0, V0 } = GEO;
  const [imA, imB] = await Promise.all([loadImg(SRC_UP), loadImg(SRC_DN)]);
  const W = imA.naturalWidth, H = imA.naturalHeight;
  if (imB.naturalWidth !== W || imB.naturalHeight !== H) throw new Error('checkpoint: gate renders differ in size');
  const L = processGate(rawPixels(imA, W, H), rawPixels(imB, W, H), W, H);
  { // trim the apron where it meets the main E-W road, dithered so it blends into the baked asphalt
    const zc = GEO.cutZ - ctx.z, band = GEO.cutBand, g = L.ground;
    for (let v = 0, i = 0; v < H; v++) for (let u = 0; u < W; u++, i++) {
      const zr = K / 2 * ((v - V0) / SY - (u - U0) / SX); if (zr <= zc - band) continue;
      const a = i * 4 + 3; if (!g[a]) continue;
      if (zr >= zc) { g[a] = 0; continue; }
      const p = (zc - zr) / band, h = ((u * 73856093) ^ (v * 19349663)) >>> 0;
      if ((h % 1000) / 1000 >= p * p * (3 - 2 * p)) g[a] = 0;
    }
  }
  const gC = fromArr(L.ground, W, H), upC = fromArr(L.up, W, H), dnC = fromArr(L.dn, W, H);

  // pixel <-> world (true-iso projection of the game camera; anchor = booth base centre)
  const toWorld = (u, v) => { const a = (u - U0) * K / SX, b = (v - V0) * K / SY; return [ctx.x + (a + b) / 2, ctx.z + (b - a) / 2]; };
  const toPx = (wx, wz) => { const dx = wx - ctx.x, dz = wz - ctx.z; return [U0 + (dx - dz) * SX / K, V0 + (dx + dz) * SY / K]; };

  // a billboard cut from a source canvas, anchored at source pixel (au,av) <-> its ground point
  let n = 0;
  const piece = (name, src, p, au, av) => {
    const key = 'bld_chk_' + name + (n++);
    IM[key] = p.c;
    META[key] = { w: p.cw, h: p.ch, ax: (au - p.x0) * SC / p.cw, glows: [], top: [.5, 0] };
    const c = (p.ch - (av - p.y0) * SC) / p.ch, [wx, wz] = toWorld(au, av);
    const s = spr(key, wx, wz, p.ch / SC * K, { c });
    return s;
  };
  const polyPiece = (name, poly, au, av) => { const [x0, y0, x1, y1] = polyBox(poly); return piece(name, gC, cut(gC, x0, y0, x1, y1, SC, poly), au, av); };

  // ---- ground apron
  const gb = bboxA(L.ground, W, H, 2);
  const gs = piece('ground', gC, cut(gC, gb[0], gb[1], gb[2], gb[3], SC), U0, V0);
  gs.material.depthTest = false; gs.material.depthWrite = false; gs.renderOrder = -90; gs.userData.flat = 1;

  // ---- uprights
  const B = GEO.base;
  polyPiece('booth', GEO.booth, U0, V0);
  polyPiece('post', GEO.post, B.post[0], B.post[1]);
  polyPiece('farpost', GEO.farpost, B.farpost[0], B.farpost[1]);
  polyPiece('jersey', GEO.jersey, B.jersey[0], B.jersey[1]);
  polyPiece('sign', GEO.sign, B.sign[0], B.sign[1]);

  // ---- barrier arm: raised pose (one piece) + lowered pose (sliced along its length)
  const ab = bboxA(L.up, W, H, 3), up = piece('armup', upC, cut(upC, ab[0], ab[1], ab[2], ab[3], SC), B.pivotG[0], B.pivotG[1]);
  const lowered = GEO.bands.map(([bx0, bx1]) => {
    const db = bboxA(L.dn, W, H, 3), x0 = Math.max(bx0, db[0]), x1 = Math.min(bx1, db[2]);
    const [l0, l1] = GEO.armLine, t = ((x0 + x1) / 2 - l0[0]) / (l1[0] - l0[0]);
    return piece('armdn', dnC, cut(dnC, x0, db[1], x1, db[3], SC), (x0 + x1) / 2, l0[1] + t * (l1[1] - l0[1]));
  });

  // swing piece: the raised arm rotated about the hinge between the two poses
  const sw = piece('armsw', upC, cut(upC, ab[0], ab[1], ab[2], ab[3], SC), B.pivotG[0], B.pivotG[1]);
  { const cw = Math.ceil((ab[2] - ab[0]) * SC), ch = Math.ceil((ab[3] - ab[1]) * SC);
    sw.center.set((B.pivot[0] - ab[0]) * SC / cw, 1 - (B.pivot[1] - ab[1]) * SC / ch); }
  sw.position.y = (B.pivotG[1] - B.pivot[1]) * K / 0.8165;        // lift the hinge point up to its real height
  sw.userData.hide = true; sw.userData.swing = 1;
  const A_UP = Math.atan2(260, 115), A_DN = Math.atan2(-181, 287), ROT = A_DN - A_UP, LEN = Math.hypot(287, 181) / Math.hypot(115, 260);

  // ---- colliders
  const bw = toWorld(U0, V0);
  sol.push({ x: bw[0], z: bw[1], rx: 2.4, rz: 2.4 });
  const pw = toWorld(B.post[0], B.post[1]); sol.push({ x: pw[0], z: pw[1], rx: .9, rz: .9 });
  const fw = toWorld(B.farpost[0], B.farpost[1]); sol.push({ x: fw[0], z: fw[1], rx: .9, rz: .9 });
  const jw = toWorld(B.jersey[0], B.jersey[1]); sol.push({ x: jw[0], z: jw[1], rx: 1.9, rz: .9 });
  const sg = toWorld(B.sign[0], B.sign[1]); circ.push({ x: sg[0], z: sg[1], r: .4 });
  const [la, lb] = GEO.armLine.map(q => toWorld(q[0], q[1]));
  const armSolid = { x: (la[0] + lb[0]) / 2, z: (la[1] + lb[1]) / 2, rx: Math.abs(lb[0] - la[0]) / 2 + .3, rz: Math.abs(lb[1] - la[1]) / 2 + .6 };

  // ---- keep scatter (trees, plants, rocks) off the apron
  const cell = 2, ga = L.ground;
  const corners = [[gb[0], gb[1]], [gb[2], gb[1]], [gb[0], gb[3]], [gb[2], gb[3]]].map(q => toWorld(q[0], q[1]));
  const wx0 = Math.floor(Math.min(...corners.map(q => q[0]))), wx1 = Math.ceil(Math.max(...corners.map(q => q[0])));
  const wz0 = Math.floor(Math.min(...corners.map(q => q[1]))), wz1 = Math.ceil(Math.max(...corners.map(q => q[1])));
  for (let x = wx0; x < wx1; x += cell) for (let z = wz0; z < wz1; z += cell) {
    const [u, v] = toPx(x + cell / 2, z + cell / 2), iu = Math.round(u), iv = Math.round(v);
    if (iu >= 0 && iv >= 0 && iu < W && iv < H && ga[(iv * W + iu) * 4 + 3] > 40) FP.push({ x0: x, z0: z, x1: x + cell, z1: z + cell });
  }

  // ---- lights (point light now, window glows once main.js can make glow sprites)
  LT.push({ x: bw[0] + 3, z: bw[1] + 3, y: 2.4, c: 0xffb868, I: 1.6 });
  const lights = glow => {
    const S3 = new T.Vector3(bw[0], 0, bw[1]);
    for (const [u, v, size, col] of [[455, 345, 3.4, 0xffa850], [625, 385, 1.8, 0xffb060], [768, 497, 1.2, 0xff7a30]])
      glow(viewPt(S3, (u - U0) * K, -(v - V0) * K, .6), size, new T.Color(col), .5, Math.random() * 9);
  };

  // ---- state
  let isUp = true, busy = false;
  const show = (s, on) => { s.userData.hide = !on; };
  const apply = () => { show(up, isUp); lowered.forEach(s => show(s, !isUp)); show(sw, false);
    const k = sol.indexOf(armSolid); if (isUp && k >= 0) sol.splice(k, 1); if (!isUp && k < 0) sol.push(armSolid); };
  apply();
  function toggle() {
    if (busy) return; busy = true; isUp = !isUp;
    up.userData.hide = true; lowered.forEach(s => show(s, false)); show(sw, true);
    const from = isUp ? 1 : 0, to = isUp ? 0 : 1, t0 = performance.now(), dur = 520;
    if (!isUp && sol.indexOf(armSolid) < 0) sol.push(armSolid);
    const step = now => {
      let p = Math.min(1, (now - t0) / dur); const e = p * p * (3 - 2 * p), q = from + (to - from) * e;
      sw.material.rotation = ROT * q; const sc = 1 + (LEN - 1) * q, w0 = sw.userData.w, h0 = sw.userData.h; sw.scale.set(w0 * sc, h0 * sc, 1);
      if (p < 1) requestAnimationFrame(step); else { sw.scale.set(w0, h0, 1); sw.material.rotation = 0; busy = false; apply(); }
    };
    requestAnimationFrame(step);
    toast(isUp ? 'The barrier groans upward and locks open.' : 'The barrier drops across the road. Something latches on the far side.');
  }

  const bp = toWorld(620, 610), gp = toWorld(800, 650);
  const objects = [
    { x: bp[0], z: bp[1], n: 'Checkpoint booth', get note() { return (isUp ? 'The barrier is raised.' : 'The barrier is down.') + ' The log inside ends with today\'s date and no name.'; } },
    { x: gp[0], z: gp[1], t: 'x', get n() { return isUp ? 'Lower the barrier' : 'Raise the barrier'; }, fn: toggle },
  ];
  return { objects, toggle, lights, isUp: () => isUp, world: toWorld };
}
