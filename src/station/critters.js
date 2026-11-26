// ===== DRIFTER — CRITTERS (small wildlife for Silvan and the station treeline) =====
// frogs      sit and croak on the banks; leap into the water (or hop away) when you get close
// birds      peck in small flocks; the whole flock lifts off when disturbed, or when rain sets in
// squirrels  dart back and forth across the trail; bolt for cover and stay hidden for a while
// moths      circle the lamps (they leave in heavy rain)
// fish       shadows drifting in the river, with the occasional jump
// eyes       pairs of eyes in the dark brush that close for good as you approach
// All art is drawn here from small pixel maps, so there are no image files to load.
// During a signal burst at the station ("hush"), every creature holds perfectly still.
//
// API:  const C = createCritters({ T, sc, habitat, sfx })
//   C.update(t, dt, { P, rain, hush, tint })   C.setVisible(bool)   C.counts   C.list (for testing)
// habitat: { frogs:[{x,z,wx?,wz?}], birds:[{x,z,n}], squirrels:[{ax,az,bx,bz}], moths:[{x,y,z}],
//            eyes:[{x,y,z}], fish:[{x,off}], river?:{zc(x),hw(x),ox}, elev?(x,z) }

const PAL = {
  k: '#0b120f', g: '#6f9a4a', G: '#466b34', y: '#c9c27a', w: '#f1ead2', b: '#8a6a48', B: '#5b4430',
  c: '#d8c3a0', o: '#d9903f', r: '#a9633a', R: '#74412a', m: '#d9d3bd', M: '#9c9782', s: '#a9c0bc', S: '#5f7c7e', e: '#ffd980',
};
const ART = {
  frog: [
    ['............', '......kk.kk.', '.....kwgkwg.', '...kkgggggk.', '..kgggGggggk', '.kgGggggyyk.', 'kGGgGgyyyk..', 'kGkkGkkkGk..'],
    ['............', '......kk.kk.', '.....kwgkwg.', '...kkgggggk.', '..kgggGgyyyk', '.kgGggyyyyyk', 'kGGgGgyyyyk.', 'kGkkGkkkGk..'],
    ['.........kk.', '.......kkgwk', '.....kkggggk', '...kkggGyyk.', '..kgGGyyyk..', '.kGGkkGk....', 'kGk...kG....', 'kk..........'],
  ],
  bird: [
    ['...........', '......kk...', '.....kbbk..', '.....bwbboo', '.kkkbbbbk..', 'kBBBBbbcck.', '..kkBbcck..', '.....o.o...'],
    ['...........', '...........', '...kk......', 'kkkbbbkkk..', 'kBBBbbbbbk.', '..kBbbcbwbk', '....kcck.oo', '.....oo....'],
    ['.kk........', '.kBBk......', '..kBBk.kk..', '...kBBkbbk.', 'kkkkbbbbwbo', 'kBBbbbcck..', '..kkkkk....', '...........'],
    ['...........', '.......kk..', 'kk....kbbk.', 'kBkkkbbbwbo', '.kBbbBBcck.', '....kBBk...', '...kBBk....', '...kk......'],
  ],
  squirrel: [
    ['..kk..........', '.krrk....k.k..', 'krrrrk..krkrk.', 'krRrrk..krrrrk', 'krRrk...krrwrk', 'krRrk..krrrrk.', '.krRrkkrrrcck.', '..krrrrrrcck..', '...kkRRkkRRk..'],
    ['..............', '..............', '.kkk.....k.k..', 'krrrkk..krkrk.', 'krRRrrkkrrrwrk', '.kkkrrrrrrrrk.', '....krrcccrrk.', '...kRk.....kRk', '..kk........kk'],
    ['..............', 'kkk...........', 'krrkk....k.k..', '.krRrk..krkrk.', '..krRrkkrrrwrk', '...krrrrrrrrk.', '....krrcccrk..', '.....kRRkRRk..', '......kk..kk..'],
  ],
  moth: [['mm.mm', 'mmkmm', '.MkM.', '..k..'], ['.....', '.mkm.', '.mkm.', '..M..']],
  fish: [['.....kkk....', 'kk.kkSSSkk..', 'kSkSssssswk.', 'kSSssssssssk', 'kk.kksssskk.', '.....kkkk...']],
  eyes: [['ee.....ee', 'ee.....ee']],
};
const PX = { frog: .08, bird: .085, squirrel: .09, moth: .064, fish: .1, eyes: .066 }; // world units per art pixel

export function createCritters({ T, sc, habitat: H, sfx = () => {} }) {
  const grp = new T.Group(); sc.add(grp);
  const elev = H.elev || (() => 0);
  const rand = (a, b) => a + Math.random() * (b - a);
  const dist = (a, x, z) => Math.hypot(a.x - x, a.z - z);

  // ---------- art -> textures (sprites cannot be mirrored by scale, so both facings are drawn) ----------
  const draw = (rows, flip) => {
    const w = rows[0].length, h = rows.length, c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d');
    rows.forEach((row, y) => { for (let x = 0; x < w; x++) { const p = PAL[row[x]]; if (p) { g.fillStyle = p; g.fillRect(flip ? w - 1 - x : x, y, 1, 1); } } });
    const t = new T.CanvasTexture(c); t.magFilter = t.minFilter = T.NearestFilter; t.generateMipmaps = false; return t;
  };
  const TEX = {};
  for (const k in ART) TEX[k] = [false, true].map(f => ART[k].map(rows => draw(rows, f)));

  const make = (kind, opts = {}) => {
    const rows = ART[kind][0], m = new T.SpriteMaterial(Object.assign({ map: TEX[kind][0][0], alphaTest: .35, transparent: false, fog: true }, opts));
    const s = new T.Sprite(m); s.scale.set(rows[0].length * PX[kind], rows.length * PX[kind], 1); s.center.set(.5, 0); s.frustumCulled = false; s.visible = false; grp.add(s);
    return s;
  };
  const frame = (c, f, left) => { const t = TEX[c.kind][left ? 1 : 0][f]; if (c.s.material.map !== t) c.s.material.map = t; };
  // which way is screen-left for a world direction on the isometric camera
  const faces = (dx, dz) => (dx - dz) < 0;

  const list = [];
  const add = (kind, o, opts) => { const c = Object.assign({ kind, s: make(kind, opts), t: Math.random() * 6, gone: 0, y: 0 }, o); list.push(c); return c; };

  for (const f of H.frogs || []) add('frog', { x: f.x, z: f.z, hx: f.x, hz: f.z, w: f.wx === undefined ? null : [f.wx, f.wz], state: 'sit', left: Math.random() < .5, next: rand(1, 8), croak: 0, k: 0 });
  (H.birds || []).forEach((b, flock) => { for (let i = 0; i < b.n; i++) { const x = b.x + rand(-1.8, 1.8), z = b.z + rand(-1.2, 1.2); add('bird', { x, z, hx: x, hz: z, flock, state: 'peck', left: Math.random() < .5, next: rand(.4, 2), k: 0 }); } });
  for (const q of H.squirrels || []) add('squirrel', { x: q.ax, z: q.az, ends: [[q.ax, q.az], [q.bx, q.bz]], at: 0, state: 'sit', left: false, next: rand(2, 9), k: 0 });
  for (const l of H.moths || []) for (let i = 0; i < 3; i++) add('moth', { x: l.x, z: l.z, lamp: l, a: Math.random() * 9, sp: rand(1.3, 2.6), r: rand(.5, 1.5) }, { fog: false });
  for (const e of H.eyes || []) add('eyes', { x: e.x, z: e.z, y: e.y, next: rand(0, 6), open: false }, { fog: false, depthTest: false, transparent: true });
  for (const c of list) if (c.kind == 'eyes') c.s.renderOrder = 5;

  // ---------- river life: shadows under the water, jumping fish, ripple rings ----------
  const flat = (tex, w, h, color, order) => {
    const m = new T.Mesh(new T.PlaneGeometry(w, h).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ map: tex, color, transparent: true, depthWrite: false, fog: false }));
    m.renderOrder = order; m.frustumCulled = false; m.visible = false; grp.add(m); return m;
  };
  const canvasTex = (w, h, paint) => { const c = document.createElement('canvas'); c.width = w; c.height = h; paint(c.getContext('2d')); return new T.CanvasTexture(c); };
  const shadowTex = canvasTex(64, 24, g => {
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(38, 12, 22, 7, 0, 0, 7); g.fill();
    g.beginPath(); g.moveTo(20, 12); g.lineTo(2, 3); g.lineTo(7, 12); g.lineTo(2, 21); g.closePath(); g.fill();
  });
  const ringTex = canvasTex(64, 64, g => { g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.arc(32, 32, 28, 0, 7); g.stroke(); });
  const rings = [...Array(14)].map(() => ({ m: flat(ringTex, 1, 1, 0xb8d8d0, -97), age: 9, size: 1 }));
  const ripple = (x, z, size = 2.2) => { const r = rings.reduce((a, b) => a.age > b.age ? a : b); r.age = 0; r.size = size; r.m.position.set(x, .05, z); };
  const R = H.river, fish = [];
  if (R) for (const f of H.fish || []) {
    const m = flat(shadowTex, rand(.9, 1.7), rand(.34, .55), 0x010807, -98); m.material.opacity = .55;
    fish.push({ m, lx: f.x, home: f.x, off: f.off, v: rand(.35, .9) * (Math.random() < .5 ? -1 : 1), ph: rand(0, 9), dart: 0, x: R.ox + f.x, z: R.zc(f.x) + f.off * R.hw(f.x) });
  }
  const jump = { s: R ? make('fish') : null, t: 9, next: 3, x: 0, z: 0, dir: 1 };
  if (jump.s) jump.s.center.set(.5, .5);

  const vol = (c, P, reach = 20) => Math.max(0, 1 - dist(c, P.x, P.z) / reach);

  // ---------- behaviours ----------
  const STEP = {
    frog(c, dt, e, d) {
      if (c.state == 'gone') { c.gone -= dt; if (c.gone <= 0 && dist({ x: c.hx, z: c.hz }, e.P.x, e.P.z) > 24) { c.x = c.hx; c.z = c.hz; c.y = 0; c.state = 'sit'; } return false; }
      if (c.state == 'leap') {
        c.k = Math.min(1, c.k + dt / c.dur);
        c.x = c.from[0] + (c.to[0] - c.from[0]) * c.k; c.z = c.from[1] + (c.to[1] - c.from[1]) * c.k; c.y = Math.sin(c.k * Math.PI) * c.high;
        frame(c, 2, c.left);
        if (c.k >= 1) { c.y = 0; if (c.dive) { c.state = 'gone'; c.gone = rand(18, 35); ripple(c.x, c.z); sfx('splash', vol(c, e.P)); return false; } c.state = 'sit'; c.next = rand(.15, .5); }
        return true;
      }
      const leap = (x, z, high, dur, dive) => { c.state = 'leap'; c.k = 0; c.from = [c.x, c.z]; c.to = [x, z]; c.high = high; c.dur = dur; c.dive = dive; c.left = faces(x - c.x, z - c.z); };
      if (d < 3.4) {
        if (c.w) leap(c.w[0], c.w[1], 1.3, .6, true);
        else { const a = Math.atan2(c.z - e.P.z, c.x - e.P.x) + rand(-.6, .6); leap(c.x + Math.cos(a) * 1.4, c.z + Math.sin(a) * 1.4, .6, .38, false); }
        return true;
      }
      c.next -= dt; c.croak = Math.max(0, c.croak - dt);
      if (c.next <= 0) {
        c.next = rand(2.5, 9) / (1 + e.rain);                          // livelier in the rain
        if (Math.random() < .65) { c.croak = .9; sfx('croak', vol(c, e.P, 16)); }
        else leap(c.hx + rand(-.7, .7), c.hz + rand(-.35, .35), .35, .32, false);
      }
      frame(c, c.croak > 0 && Math.sin(c.croak * 22) > 0 ? 1 : 0, c.left);
      return true;
    },
    bird(c, dt, e, d) {
      if (c.state == 'gone') { c.gone -= dt; if (c.gone <= 0 && e.rain < .35 && dist({ x: c.hx, z: c.hz }, e.P.x, e.P.z) > 24) { c.x = c.hx; c.z = c.hz; c.y = 0; c.state = 'peck'; } return false; }
      if (c.state == 'ready') { c.next -= dt; if (c.next <= 0) c.state = 'fly'; return true; }
      if (c.state == 'fly') {
        c.k += dt; c.x += c.vx * dt; c.z += c.vz * dt; c.y += (2.2 + c.k * 3.5) * dt;
        frame(c, 2 + (Math.floor(c.k * 11) & 1), c.left);
        if (c.k > 3) { c.state = 'gone'; c.gone = rand(22, 45); }
        return true;
      }
      if (d < 5.5 || e.rain > .45) {                                   // one startles, the whole flock goes
        for (const o of list) if (o.kind == 'bird' && o.flock == c.flock && o.state == 'peck') {
          const a = Math.atan2(o.z - e.P.z, o.x - e.P.x) + rand(-.7, .7), v = rand(3.5, 6);
          o.state = 'ready'; o.next = rand(0, .3); o.k = 0; o.vx = Math.cos(a) * v; o.vz = Math.sin(a) * v; o.left = faces(o.vx, o.vz);
        }
        sfx('flutter', vol(c, e.P));
        return true;
      }
      c.next -= dt;
      if (c.next <= 0) {
        c.next = rand(.25, 1.6); c.k = Math.random();
        if (c.k < .3) { const nx = c.hx + rand(-1.2, 1.2), nz = c.hz + rand(-.8, .8); c.left = faces(nx - c.x, nz - c.z); c.x = nx; c.z = nz; }
      }
      frame(c, c.k > .55 && c.next > .12 ? 1 : 0, c.left); c.y = c.k < .3 && c.next > .15 ? Math.abs(Math.sin(c.next * 14)) * .12 : 0;
      return true;
    },
    squirrel(c, dt, e, d) {
      if (c.state == 'gone') { c.gone -= dt; const h = c.ends[c.at]; if (c.gone <= 0 && Math.hypot(h[0] - e.P.x, h[1] - e.P.z) > 24) { c.x = h[0]; c.z = h[1]; c.state = 'sit'; c.next = rand(2, 8); } return false; }
      const run = (to, flee) => { c.state = 'run'; c.at = to; c.flee = flee; c.left = faces(c.ends[to][0] - c.x, c.ends[to][1] - c.z); };
      if (d < 5 && !(c.state == 'run' && c.flee)) {                    // bolt for whichever side is farther from you
        const far = Math.hypot(c.ends[0][0] - e.P.x, c.ends[0][1] - e.P.z) > Math.hypot(c.ends[1][0] - e.P.x, c.ends[1][1] - e.P.z) ? 0 : 1;
        run(far, true); sfx('rustle', vol(c, e.P));
      }
      if (c.state == 'run') {
        const to = c.ends[c.at], dx = to[0] - c.x, dz = to[1] - c.z, l = Math.hypot(dx, dz), v = (c.flee ? 9 : 5.5) * dt;
        c.k += dt;
        if (l <= v) { c.x = to[0]; c.z = to[1]; c.y = 0; if (c.flee) { c.state = 'gone'; c.gone = rand(15, 30); return false; } c.state = 'sit'; c.next = rand(3, 11); }
        else { c.x += dx / l * v; c.z += dz / l * v; c.y = Math.abs(Math.sin(c.k * 13)) * .28; frame(c, 1 + (Math.floor(c.k * 12) & 1), c.left); }
        return true;
      }
      c.next -= dt; if (c.next <= 0) run(1 - c.at, false);
      c.y = c.next % 2.3 < .1 ? .07 : 0; frame(c, 0, c.left);
      return true;
    },
    moth(c, dt, e) {
      if (e.rain > .5) return false;
      c.a += dt * c.sp;
      const r = c.r * (.75 + .25 * Math.sin(c.a * 2.3));
      c.x = c.lamp.x + Math.cos(c.a) * r + Math.sin(c.a * 5.1) * .16; c.z = c.lamp.z + Math.sin(c.a * 1.31) * r;
      c.y = c.lamp.y + Math.sin(c.a * 1.9) * .55 + Math.sin(c.a * 7.3) * .09;
      frame(c, Math.floor(c.a * 12) & 1, false);
      return true;
    },
    eyes(c, dt, e, d) {
      if (d < 8) { c.open = false; c.next = rand(10, 24); return false; }
      c.next -= dt;
      if (c.next <= 0) { c.open = !c.open; c.next = c.open ? rand(1.8, 5) : rand(4, 16); }
      if (!c.open || d > 24) return false;
      c.s.material.opacity = (c.next % 1.9 < .14 ? 0 : .9) * Math.min(1, (d - 8) / 3);   // blink; fade as you close in
      return true;
    },
  };

  let shown = true;
  return {
    list, fish,
    counts: list.reduce((n, c) => (n[c.kind] = (n[c.kind] || 0) + 1, n), R ? { fish: fish.length } : {}),
    setVisible(v) { shown = v; grp.visible = v; },
    update(t, dt, e) {
      if (!shown) return;
      const P = e.P, tint = e.tint, step = e.hush ? 0 : dt;
      for (const c of list) {
        const d = dist(c, P.x, P.z);
        if (d > 40 && c.state != 'gone') { c.s.visible = false; continue; }   // far off screen: asleep
        const vis = e.hush ? c.s.visible : STEP[c.kind](c, step, e, d);
        c.s.visible = vis; if (!vis) continue;
        c.s.position.set(c.x, c.y + (c.kind == 'moth' || c.kind == 'eyes' ? 0 : elev(c.x, c.z) + .02), c.z);
        if (c.kind != 'eyes') { if (c.kind == 'moth') c.s.material.color.setRGB(1.15, 1, .75);          // lit by the lamp they circle
          else c.s.material.color.setRGB(Math.min(1.4, tint[0] * 1.35), Math.min(1.4, tint[1] * 1.3), Math.min(1.4, tint[2] * 1.2)); }
      }
      for (const f of fish) {
        const near = Math.abs(f.x - P.x) < 40; f.m.visible = near; if (!near) continue;
        if (Math.hypot(f.x - P.x, f.z - P.z) < 4.5 && f.dart <= 0 && !e.hush) { f.dart = 1.2; f.v = Math.abs(f.v) * (f.x < P.x ? -1 : 1); ripple(f.x, f.z, 1.4); }
        f.dart = Math.max(0, f.dart - step);
        f.lx += f.v * (1 + f.dart * 4) * step;
        if (Math.abs(f.lx - f.home) > 7) { f.v = Math.abs(f.v) * Math.sign(f.home - f.lx); }
        const wig = Math.sin(f.lx * 1.7 + f.ph) * .12, off = f.off + wig * .5, z = R.zc(f.lx) + off * R.hw(f.lx);
        const ahead = f.lx + Math.sign(f.v) * .4, za = R.zc(ahead) + off * R.hw(ahead);
        f.x = R.ox + f.lx; f.z = z; f.m.position.set(f.x, .045, z);
        f.m.rotation.y = -Math.atan2(za - z, ahead - f.lx) + Math.sin(t * 6 + f.ph) * .12;
      }
      if (jump.s) {
        jump.next -= step;
        if (jump.next <= 0) {
          const near = fish.filter(f => { const d = Math.hypot(f.x - P.x, f.z - P.z); return d > 3 && d < 17; });
          if (near.length) { const f = near[Math.random() * near.length | 0]; jump.t = 0; jump.x = f.x; jump.z = f.z; jump.dir = Math.sign(f.v) || 1; ripple(f.x, f.z, 1.8); sfx('splash', vol(jump, P) * .6); }
          jump.next = rand(3, 9);
        }
        const dur = .85; jump.s.visible = jump.t < dur;
        if (jump.s.visible) {
          jump.t += step; const k = Math.min(1, jump.t / dur), x = jump.x + jump.dir * 1.8 * k;
          const left = faces(jump.dir, 0), tx = TEX.fish[left ? 1 : 0][0]; if (jump.s.material.map !== tx) jump.s.material.map = tx;
          jump.s.material.rotation = (left ? -1 : 1) * (.9 - 1.8 * k);
          jump.s.position.set(x, .1 + Math.sin(k * Math.PI) * 1.5, jump.z); jump.s.material.color.setRGB(tint[0] * 1.4, tint[1] * 1.4, tint[2] * 1.4);
          if (k >= 1) { ripple(x, jump.z, 2.6); sfx('splash', vol(jump, P)); jump.t = 9; jump.s.visible = false; }
        }
      }
      for (const r of rings) {
        r.age += step; const k = r.age / 1.3; r.m.visible = k < 1; if (!r.m.visible) continue;
        r.m.scale.setScalar(.3 + r.size * k); r.m.material.opacity = .65 * (1 - k);
      }
    },
  };
}
