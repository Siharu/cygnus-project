// ===== DRIFTER — LIGHTING & SHADOWS =====
// 1. Soft cast shadows, drawn into their own layer (not baked into the ground) so they can follow a slowly
//    moving moon and fade with the weather. Buildings throw swept footprints, trees and rocks throw stretched
//    blobs, and every object keeps a tight contact shadow underneath.
// 2. Volumetric light: a scatter halo around every lamp and window light and a light cone under the trailhead
//    lamp, all of which swell in mist and rain; a large pulsing halo around the beacon.
// 3. Wet-weather lighting: lamp flicker (stronger in wind), reflections of lamps on wet ground, ground that
//    darkens and gets glossier as it gets wet.
//
// ctx = { T, sc, SH, LT, glowTex, beaconPos, dl }   SH entries: { x, z, rx, rz, a, ht, rect }

import { NIGHT as SN, DUSK as SD } from './dusk.js';

const U = 6, WORLD = 98, HALF = 49;       // shadow layer: pixels per world unit, ground size
const A0 = .12, AMP = .5, PERIOD = 720;   // moon azimuth: centre, swing (radians) and period (seconds)
const A0D = 2.66, AMPD = .18;             // dusk: low sun in the upper right of the screen, barely drifting
let SHADOW = SN.shadow.join(','), LK = 1; // shadow colour (follows the dusk blend) and shadow-length factor

export function createLighting({ T, sc, SH, LT, glowTex, beaconPos, dl }) {
  const L = { dir: { x: 1, z: 0 }, ang2: 0, shade: 1 };

  // ---- shadow layer ----
  const SZ = WORLD * U, cv = document.createElement('canvas'); cv.width = cv.height = SZ;
  const g = cv.getContext('2d');
  const tex = new T.CanvasTexture(cv); tex.minFilter = tex.magFilter = T.LinearFilter; tex.generateMipmaps = false;
  const shMesh = new T.Mesh(new T.PlaneGeometry(WORLD, WORLD).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: false }));
  shMesh.position.y = .02; shMesh.renderOrder = -99; sc.add(shMesh);
  const px = v => (v + HALF) * U;
  let baked = 9, bakedK = 0;
  function blob(x, z, along, across, ang, a0, a1) {   // soft ellipse: a0 at the centre, a1 at the rim
    g.save(); g.translate(px(x), px(z)); g.rotate(ang); g.scale(along * U, across * U);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1);
    gr.addColorStop(0, `rgba(${SHADOW},${a0})`); gr.addColorStop(.55, `rgba(${SHADOW},${a0 * .5})`); gr.addColorStop(1, `rgba(${SHADOW},${a1})`);
    g.fillStyle = gr; g.fillRect(-1, -1, 2, 2); g.restore();
  }
  function bake(a, k = 0) {
    baked = a; bakedK = k; g.clearRect(0, 0, SZ, SZ);
    SHADOW = SN.shadow.map((v, i) => Math.round(v + (SD.shadow[i] - v) * k)).join(','); LK = 1 + .55 * k;
    const dx = Math.cos(a), dz = Math.sin(a);
    for (const s of SH) {
      const ht = s.ht || 3;
      if (s.rect) {                                    // building: footprint swept along the shadow direction
        const len = Math.min(11 * LK, ht * .34 * LK), steps = 9;
        for (let i = 0; i <= steps; i++) {
          const f = i / steps, taper = 1 - .35 * f, al = s.a * .15 * (1 - f * .8);
          for (const kk of [1.18, 1, .82]) {
            g.fillStyle = `rgba(${SHADOW},${al / 2})`;
            const hx = s.rx * taper * kk, hz = s.rz * taper * kk;
            g.fillRect(px(s.x + dx * len * f - hx), px(s.z + dz * len * f - hz), hx * 2 * U, hz * 2 * U);
          }
        }
      } else {                                         // tree / bush / rock: stretched blob + contact shadow
        const len = Math.min(10 * LK, ht * .3 * LK), along = Math.max(s.rx * 1.3, len * .75), across = Math.max(s.rx * .8, .45);
        blob(s.x + dx * len * .55, s.z + dz * len * .55, along, across, a, s.a * .8, 0);
        blob(s.x, s.z, Math.max(s.rx * .75, .5), Math.max(s.rz * .6, .4), 0, s.a * .55, 0);
      }
    }
    tex.needsUpdate = true;
  }
  bake(A0, 0);

  // ---- volumetric light: halos, cone, wet reflections, beacon halo ----
  const grp = new T.Group(); sc.add(grp);
  const mkSprite = (map, color, op) => {
    const s = new T.Sprite(new T.SpriteMaterial({ map, color, blending: T.AdditiveBlending, transparent: true, depthWrite: false, opacity: op, fog: false }));
    s.frustumCulled = false; grp.add(s); return s;
  };
  const coneTex = (() => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 128; const q = c.getContext('2d');
    const v = q.createLinearGradient(0, 0, 0, 128); v.addColorStop(0, 'rgba(255,255,255,.9)'); v.addColorStop(1, 'rgba(255,255,255,0)');
    q.fillStyle = v; q.beginPath(); q.moveTo(28, 0); q.lineTo(36, 0); q.lineTo(62, 128); q.lineTo(2, 128); q.closePath(); q.fill();
    const h = q.createLinearGradient(0, 0, 64, 0); h.addColorStop(0, 'rgba(0,0,0,0)'); h.addColorStop(.5, 'rgba(0,0,0,1)'); h.addColorStop(1, 'rgba(0,0,0,0)');
    q.globalCompositeOperation = 'destination-in'; q.fillStyle = h; q.fillRect(0, 0, 64, 128);
    return new T.CanvasTexture(c);
  })();
  const lamps = [];
  for (const l of LT) {
    if (l.dyn) continue;
    const y = l.y || 2.4, I = l.I || 1, halo = mkSprite(glowTex, l.c, 0), refl = mkSprite(glowTex, l.c, 0);
    const size = 3 + I * 1.8;
    halo.position.set(l.x, y, l.z); halo.scale.set(size, size, 1);
    refl.position.set(l.x, .05, l.z); refl.center.set(.5, .85); refl.scale.set(1.5, 3.6, 1);
    let cone = null;
    if (l.cone) { cone = mkSprite(coneTex, l.c, 0); cone.center.set(.5, 1); cone.position.set(l.x, y, l.z); cone.scale.set(4.4, 5.6, 1); }
    lamps.push({ l, halo, refl, cone, size, I });
  }
  const bHalo = mkSprite(glowTex, 0xff3320, 0); bHalo.position.copy(beaconPos);

  // e = { vis, WX, bOn, ground, outer }   (vis: outdoors on the station map)
  L.update = (t, dt, e) => {
    const W = e.WX;
    // moon azimuth swings slowly; shadows re-bake only when it has moved a few degrees
    const k = e.k || 0, a = A0 + (A0D - A0) * k + (AMP + (AMPD - AMP) * k) * Math.sin(t * 2 * Math.PI / PERIOD);
    L.dir.x = Math.cos(a); L.dir.z = Math.sin(a); L.ang2 = Math.atan2(-L.dir.z, L.dir.x);
    dl.position.set(-L.dir.x * 26, 24 - 8 * k, -L.dir.z * 26);
    if (e.vis && (Math.abs(a - baked) > .045 || Math.abs(k - bakedK) > .03)) bake(a, k);
    const shade = Math.min(1, .12 + .88 * W.sun + W.flash * .5);
    shMesh.visible = e.vis; shMesh.material.opacity = shade; L.shade = e.vis ? shade : 1;
    grp.visible = e.vis;

    // lamp flicker (wind makes it worse) — runs for every light, including the forest's
    const wf = 1 + .25 * (W.windNow - 1);
    for (let i = 0; i < LT.length; i++) {
      const l = LT[i], fk = 1 + (.05 * Math.sin(t * 6.1 + i * 1.7) + .035 * Math.sin(t * 15.3 + i * 2.9)) * wf + (Math.random() < .003 ? -.22 : 0);
      l.fm = (l.fm || 1) + (fk - (l.fm || 1)) * .5;
      if (l.pl && !l.dyn) l.pl.intensity = (l.i0 || 1) * l.fm * (1 + .3 * W.wet);
    }
    if (e.ground) { const k = 1 - .3 * W.wet; e.ground.material.roughness = 1 - .55 * W.wet; e.ground.material.color.setRGB(k * .98, k, k * 1.04); }
    if (e.outer) { const k = 1 - .3 * W.wet; e.outer.material.color.setRGB(.502 * k, .533 * k, .549 * k); }

    if (!e.vis) return;
    const sc2 = W.scatter, calm = 1 - W.flash * .6;
    for (const q of lamps) {
      const f = q.l.fm || 1;
      q.halo.material.opacity = .12 * Math.sqrt(q.I) * (.45 + 1.7 * sc2) * f;
      q.halo.scale.setScalar(q.size * (1 + .4 * sc2));
      q.refl.material.opacity = .5 * Math.min(1, q.I) * W.wet * W.wet * f * calm;
      if (q.cone) q.cone.material.opacity = .06 * (.5 + 1.9 * sc2) * f;
    }
    bHalo.material.opacity = (e.bOn ? .15 : .012) * (.35 + 1.4 * sc2);
    bHalo.scale.setScalar(13 * (1 + .35 * sc2) * (e.bOn ? 1 : .6));
  };
  return L;
}
