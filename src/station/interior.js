// ===== DRIFTER — RELAY TOWER INTERIOR (isometric sprite kit) =====
// Three cutaway rooms dressed with the DRIFTER_COMPLETE_ASSET_PACK sprites
// (assets/game/interior/*.png). Replaces the old PSX-style 3D placeholder rooms.
// All sprites are camera-facing billboards on the same true-isometric camera as the overworld,
// so floor/wall/prop art lines up exactly. Layout lives in interior_layout.js (data only).
//
// API (unchanged):  const INT = createInterior(T, sc, IX, IZ, sol)
//   INT.show(i)  INT.hide()  INT.update(t)      i = 0 control room, 1 equipment room, 2 briefing office

import { LAYOUT } from './interior_layout.js';

const url = k => new URL('../../assets/game/interior/' + k + '.png', import.meta.url).href;

export function createInterior(T, sc, IX, IZ, sol) {
  const { DEFS, ROOMS } = LAYOUT;
  const loader = new T.TextureLoader();

  // ---------- textures (lazy; sprites stay hidden until their image has loaded) ----------
  const TX = {};
  const tex = (k, flip, onReady) => {
    const id = k + (flip ? '|f' : '');
    let e = TX[id];
    if (!e) {
      e = TX[id] = { ready: false, cbs: [] };
      e.t = loader.load(url(k), () => { e.ready = true; e.cbs.forEach(f => f()); e.cbs.length = 0; }, undefined,
        () => console.error('interior: failed to load', k));
      e.t.magFilter = T.LinearFilter; e.t.minFilter = T.LinearMipmapLinearFilter;
      if (flip) { e.t.wrapS = T.RepeatWrapping; e.t.repeat.x = -1; e.t.offset.x = 1; }
    }
    if (onReady) (e.ready ? onReady() : e.cbs.push(onReady));
    return e.t;
  };

  // soft round glow used for lantern / monitor / LED light pools
  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.35, 'rgba(255,255,255,.35)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new T.CanvasTexture(c);
  })();

  // ---------- rooms ----------
  const rooms = [0, 1, 2].map(() => { const g = new T.Group(); g.position.set(IX, 0, IZ); g.visible = false; sc.add(g); return g; });
  const built = [false, false, false], S = [[], [], []], FX = [[], [], []];
  const solid = (i, x, z, rx, rz) => S[i].push({ x: IX + x, z: IZ + z, rx, rz });
  const key = new T.PointLight(0xffc880, 0, 20, 1.2), acc = new T.PointLight(0x66ff99, 0, 9, 1.2);
  key.position.set(IX, 4.6, IZ); acc.position.set(IX, 2, IZ); sc.add(key, acc);
  let cur = -1;

  const mkSprite = (R, it, tint) => {
    const d = DEFS[it.k], W = d.W, H = W * d.h / d.w, flip = !!it.flip;
    const m = new T.SpriteMaterial({ map: tex(it.k, flip), alphaTest: .4, transparent: false, fog: false, color: tint });
    const s = new T.Sprite(m);
    s.scale.set(W, H, 1); s.center.set(flip ? 1 - d.ax : d.ax, d.c);
    s.position.set(it.x, it.y || 0, it.z); s.frustumCulled = false; s.visible = false;
    if (it.layer == 'floor') { m.depthTest = false; m.depthWrite = false; s.renderOrder = -10; }
    else if (it.layer == 'decal') { m.depthTest = false; m.depthWrite = false; s.renderOrder = -9; }
    tex(it.k, flip, () => { s.visible = true; });
    R.add(s); return s;
  };
  const mkGlow = (R, g) => {
    const [kind, x, z, y, size, c, op] = g;
    const m = new T.SpriteMaterial({ map: glowTex, color: new T.Color(c[0], c[1], c[2]), blending: T.AdditiveBlending, transparent: true, depthWrite: false, opacity: op, fog: false });
    const s = new T.Sprite(m); s.scale.set(size, size, 1); s.position.set(x, y, z); s.frustumCulled = false; R.add(s);
    return { s, m, kind, op, ph: Math.random() * 9 };
  };
  const build = i => {
    built[i] = true; const r = ROOMS[i], R = rooms[i];
    for (const it of r.items) { mkSprite(R, it, r.tint); if (it.solid) solid(i, it.x, it.z, it.solid[0], it.solid[1]); }
    for (const g of r.glows || []) FX[i].push(mkGlow(R, g));
  };

  // preload every interior image shortly after start so the first entry never pops in
  setTimeout(() => { for (const r of ROOMS) for (const it of r.items) tex(it.k, !!it.flip); }, 4000);

  const lightFor = i => {
    const r = ROOMS[i];
    key.color.setHex(r.key[0]); key.intensity = r.key[1]; key.position.set(IX + r.key[2], r.key[3], IZ + r.key[4]);
    acc.color.setHex(r.acc[0]); acc.intensity = r.acc[1]; acc.position.set(IX + r.acc[2], r.acc[3], IZ + r.acc[4]);
  };
  const setSolids = i => {
    for (let k = sol.length - 1; k >= 0; k--) if (sol[k].interior) sol.splice(k, 1);
    if (i >= 0) for (const s of S[i]) { s.interior = true; sol.push(s); }
  };

  return {
    show(i) { cur = i; if (!built[i]) build(i); rooms.forEach((g, k) => g.visible = k == i); lightFor(i); setSolids(i); },
    hide() { cur = -1; rooms.forEach(g => g.visible = false); key.intensity = acc.intensity = 0; setSolids(-1); },
    update(t) {
      if (cur < 0) return;
      for (const f of FX[cur]) {
        const k = f.kind;
        f.m.opacity = f.op * (k == 'lantern' ? .82 + .18 * Math.sin(t * 9 + f.ph) * Math.sin(t * 3.7 + f.ph)
          : k == 'mon' ? .8 + .2 * Math.sin(t * 5 + f.ph) * (Math.sin(t * 23 + f.ph) > .94 ? .6 : 1)
          : Math.sin(t * 2.3 + f.ph) > -.2 ? 1 : .35);
      }
      if (cur == 1) acc.intensity = 1.2 + .2 * Math.sin(t * 17) * Math.sin(t * 3.1);
      if (cur == 2) acc.intensity = .4 + (Math.sin(t * 23) > .96 ? -.2 : 0);
    },
  };
}
