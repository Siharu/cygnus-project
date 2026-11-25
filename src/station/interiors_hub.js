// ===== DRIFTER - BUILDING INTERIORS (shed, depot, water tower, watchtower, booth, collapsed building) =====
// Single cutaway rooms dressed with the HUB sprite packs (assets/game/interior_hub/*.png), same approach as
// interior.js: camera-facing billboards on the game's true-isometric camera. Layout: interiors_hub_layout.js.
//
// API:  const BI = createBuildingInterior(T, sc, IX, IZ, sol)
//   BI.layout(id)  BI.preload(id)  BI.ready(id)  BI.show(id)  BI.hide()  BI.update(t)

import { HUB } from './interiors_hub_layout.js';
const url = k => new URL('../../assets/game/interior_hub/' + k + '.png', import.meta.url).href;

export function createBuildingInterior(T, sc, IX, IZ, sol) {
  const { DEFS, ROOMS } = HUB;
  const loader = new T.TextureLoader();

  // ---------- textures (lazy; a sprite stays hidden until its image has loaded) ----------
  const TX = {};
  const tex = (k, flip, onReady) => {
    const id = k + (flip ? '|f' : '');
    let e = TX[id];
    if (!e) {
      e = TX[id] = { ready: false, cbs: [] };
      e.t = loader.load(url(k), () => { e.ready = true; e.cbs.forEach(f => f()); e.cbs.length = 0; }, undefined,
        () => console.error('interiors_hub: failed to load', k));
      e.t.magFilter = T.LinearFilter; e.t.minFilter = T.LinearMipmapLinearFilter;
      if (flip) { e.t.wrapS = T.RepeatWrapping; e.t.repeat.x = -1; e.t.offset.x = 1; }
    }
    if (onReady) (e.ready ? onReady() : e.cbs.push(onReady));
    return e.t;
  };
  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.35, 'rgba(255,255,255,.35)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new T.CanvasTexture(c);
  })();

  // ---------- rooms (built on first entry) ----------
  const R = {};
  const room = id => R[id] || (R[id] = { g: null, fx: [], sol: [] });
  const key = new T.PointLight(0xffc880, 0, 20, 1.2), acc = new T.PointLight(0x66ff99, 0, 9, 1.2);
  key.position.set(IX, 4.6, IZ); acc.position.set(IX, 2, IZ); sc.add(key, acc);
  let cur = null;

  const mkSprite = (g, it, tint) => {
    const d = DEFS[it.k], W = d.W, H = W * d.h / d.w, flip = !!it.flip;
    const m = new T.SpriteMaterial({ map: tex(it.k, flip), alphaTest: .4, transparent: false, fog: false, color: tint });
    const s = new T.Sprite(m);
    s.scale.set(W, H, 1); s.center.set(flip ? 1 - d.ax : d.ax, d.c);
    s.position.set(it.x, it.y || 0, it.z); s.frustumCulled = false; s.visible = false;
    if (it.layer == 'floor') { m.depthTest = false; m.depthWrite = false; s.renderOrder = -10; }
    tex(it.k, flip, () => { s.visible = true; });
    g.add(s); return s;
  };
  const mkGlow = (g, q) => {
    const [kind, x, z, y, size, c, op] = q;
    const m = new T.SpriteMaterial({ map: glowTex, color: new T.Color(c[0], c[1], c[2]), blending: T.AdditiveBlending, transparent: true, depthWrite: false, opacity: op, fog: false });
    const s = new T.Sprite(m); s.scale.set(size, size, 1); s.position.set(x, y, z); s.frustumCulled = false; g.add(s);
    return { s, m, kind, op, ph: Math.random() * 9 };
  };
  const build = id => {
    const r = ROOMS[id], e = room(id), g = new T.Group();
    g.position.set(IX, 0, IZ); g.visible = false; sc.add(g); e.g = g;
    for (const it of r.items) {
      mkSprite(g, it, r.tint);
      if (it.solid) e.sol.push({ x: IX + it.x, z: IZ + it.z, rx: it.solid[0], rz: it.solid[1] });
    }
    for (const q of r.glows || []) e.fx.push(mkGlow(g, q));
  };
  const setSolids = id => {
    for (let k = sol.length - 1; k >= 0; k--) if (sol[k].interior) sol.splice(k, 1);
    if (id) for (const s of room(id).sol) { s.interior = true; sol.push(s); }
  };

  return {
    layout: id => ROOMS[id],
    preload(id) { for (const it of ROOMS[id].items) tex(it.k, !!it.flip); },
    ready(id) { return ROOMS[id].items.every(it => { const e = TX[it.k + (it.flip ? '|f' : '')]; return e && e.ready; }); },
    show(id) {
      cur = id; if (!room(id).g) build(id);
      for (const k in R) if (R[k].g) R[k].g.visible = k == id;
      const r = ROOMS[id];
      key.color.setHex(r.key[0]); key.intensity = r.key[1]; key.position.set(IX + r.key[2], r.key[3], IZ + r.key[4]);
      acc.color.setHex(r.acc[0]); acc.intensity = r.acc[1]; acc.position.set(IX + r.acc[2], r.acc[3], IZ + r.acc[4]);
      setSolids(id);
    },
    hide() {
      cur = null; for (const k in R) if (R[k].g) R[k].g.visible = false;
      key.intensity = acc.intensity = 0; setSolids(null);
    },
    update(t) {
      if (!cur) return;
      for (const f of room(cur).fx) {
        const k = f.kind;
        f.m.opacity = f.op * (k == 'lantern' ? .82 + .18 * Math.sin(t * 9 + f.ph) * Math.sin(t * 3.7 + f.ph)
          : k == 'mon' ? .8 + .2 * Math.sin(t * 5 + f.ph) * (Math.sin(t * 23 + f.ph) > .94 ? .6 : 1)
          : Math.sin(t * 2.3 + f.ph) > -.2 ? 1 : .35);
      }
    },
  };
}
