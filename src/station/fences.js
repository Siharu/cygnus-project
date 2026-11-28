// ===== DRIFTER — STATION BASE FENCES =====
// The fence encloses the station compound, not the whole map. The south side stops
// either side of the checkpoint apron, leaving the booth, barrier and road approach clear.
//
// Layout is fitted to the actual BLD footprints in main.js and the checkpoint projection
// in checkpoint.js. Keep these runs axis-aligned: p28 is the city's +X fence plane and
// p30 is its +Z fence plane. This deliberately avoids diagonal panels through the gate.

import { CAT } from './city_catalog.js';
import { retouch, straighten } from './city_shade.js';

// [x0, z0, x1, z1]. The checkpoint opening is x=-22.8..1.25 at z=12.8.
// Nearest building clearances: depot 3.5u (west), water tower 4.1u (north),
// ruined building 4.5u (east), checkpoint booth 1.1u (south).
export const BASE_FENCE_RUNS = [
  [-42.5, -36.5,  40.5, -36.5],  // north / rear boundary
  [ 40.5, -36.5,  40.5,  12.8],  // east boundary
  [-42.5, -36.5, -42.5,  12.8],  // west boundary
  [-42.5,  12.8, -22.8,  12.8],  // south-west, ending before the checkpoint booth
  [  1.25, 12.8,  40.5,  12.8]   // south-east, starting beyond the barrier jersey
];

export const RUNS = BASE_FENCE_RUNS;

const FENCE_HEIGHT = 3.8;           // same world height as city.js fence pieces
const SCREEN_X = .7071;
const SCREEN_Y = .4082;
const SCREEN_UP = .8165;

// -> one entry per fence piece: { k, corners, a, b, w, h }
export function fencePieces(runs = RUNS) {
  const out = [];
  for (const [x0, z0, x1, z1] of runs) {
    const dx = x1 - x0, dz = z1 - z0;
    const axis = Math.abs(dx) >= Math.abs(dz) ? 'x' : 'z';
    if ((axis === 'x' && Math.abs(dz) > 1e-4) || (axis === 'z' && Math.abs(dx) > 1e-4)) {
      throw new Error('Station fence runs must be axis-aligned');
    }

    const start = axis === 'x' ? Math.min(x0, x1) : Math.min(z0, z1);
    const end = axis === 'x' ? Math.max(x0, x1) : Math.max(z0, z1);
    const length = end - start;
    if (length < 1e-4) continue;

    const k = axis === 'x' ? 'p28' : 'p30';
    const m = CAT[k], unit = FENCE_HEIGHT / m.h;
    const nativeRun = m.run * unit / SCREEN_X;
    const count = Math.max(1, Math.round(length / nativeRun));
    const pieceLength = length / count;
    const stretch = pieceLength / nativeRun;

    for (let i = 0; i < count; i++) {
      const alongCentre = start + (i + .5) * pieceLength;
      const cx = axis === 'x' ? alongCentre : x0;
      const cz = axis === 'z' ? alongCentre : z0;

      // This is the same plane transform used by city.js for p28/p30:
      // p28 lies on world X; p30 lies on world Z. Scaling is only the small
      // adjustment needed to make the final panel land exactly on the run endpoint.
      const corners = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([u, v]) => {
        const sx = (u * m.W - m.px) * unit;
        const sy = (m.py - v * m.H) * unit;
        const along = (axis === 'x' ? sx : -sx) / SCREEN_X * stretch;
        const y = (sy + SCREEN_Y * along) / SCREEN_UP;
        return [
          cx + (axis === 'x' ? along : 0),
          y,
          cz + (axis === 'z' ? along : 0),
          u, v
        ];
      });

      const a = axis === 'x'
        ? [start + i * pieceLength, z0]
        : [x0, start + i * pieceLength];
      const b = axis === 'x'
        ? [start + (i + 1) * pieceLength, z0]
        : [x0, start + (i + 1) * pieceLength];
      out.push({ k, corners, a, b, w: m.W * unit, h: m.H * unit });
    }
  }
  return out;
}

// distance from (x, z) to the nearest fence run
export function fenceDist(x, z, runs = RUNS) {
  let best = Infinity;
  for (const [x0, z0, x1, z1] of runs) {
    const dx = x1 - x0, dz = z1 - z0;
    const d2 = dx * dx + dz * dz;
    if (d2 < 1e-8) continue;
    const t = Math.max(0, Math.min(1, ((x - x0) * dx + (z - z0) * dz) / d2));
    best = Math.min(best, Math.hypot(x - x0 - dx * t, z - z0 - dz * t));
  }
  return best;
}

const load = src => new Promise((res, rej) => {
  const i = new Image();
  i.onload = () => res(i);
  i.onerror = () => rej(new Error('fence asset ' + src.split('/').pop()));
  i.src = src;
});

export async function createStationFences({ T, sc, SPR, circ, SH, FP }) {
  const TX = {};
  await Promise.all(['p28', 'p30'].map(async k => {
    const file = 'DRIFTER_POI_Asset_Library_v2/Individual_PNGs/SRC-' + k.slice(1).padStart(3, '0') + '_MasterSheetA_Extract.png';
    const img = await load(new URL('../../assets/' + file, import.meta.url).href);
    const t = new T.Texture(straighten(retouch(img, k), k));
    t.magFilter = T.LinearFilter;
    t.minFilter = T.LinearMipmapLinearFilter;
    t.needsUpdate = true;
    TX[k] = t;
  }));

  // Clear plants and loose rocks only along the new, building-safe fence lines.
  for (let i = SPR.length - 1; i >= 0; i--) {
    const s = SPR[i], u = s.userData || {};
    if (!/^(fol_|rok_)/.test(u.key || '')) continue;
    if (/^rok_/.test(u.key) && Math.abs(u.x) > 30 && u.z > 11.9 && u.z < 21.5) continue;
    const clearance = /tree|sapling|banana/.test(u.key) ? 2.6 : .6 + (u.w || 0) * .25;
    if (fenceDist(u.x, u.z) > clearance) continue;
    sc.remove(s);
    SPR.splice(i, 1);
    for (const list of [circ, SH]) {
      const j = list.findIndex(c => c.x === u.x && c.z === u.z);
      if (j >= 0) list.splice(j, 1);
    }
  }

  for (const { k, corners, a, b, w, h } of fencePieces()) {
    const x = (a[0] + b[0]) / 2, z = (a[1] + b[1]) / 2;
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(
      corners.flatMap(c => [c[0] - x, c[1], c[2] - z]), 3
    ));
    g.setAttribute('uv', new T.Float32BufferAttribute(
      corners.flatMap(c => [c[3], 1 - c[4]]), 2
    ));
    g.setIndex([0, 2, 1, 1, 2, 3]);

    const mat = new T.MeshBasicMaterial({
      map: TX[k], alphaTest: .4, side: T.DoubleSide, fog: true
    });
    mat.onBeforeCompile = sh => {
      sh.uniforms.fade = mat.userData.fu = { value: 1 };
      sh.fragmentShader = sh.fragmentShader
        .replace('void main() {', 'uniform float fade;\nvoid main() {')
        .replace(
          '#include <alphatest_fragment>',
          '#include <alphatest_fragment>\n if (fade < .999 && fract(52.9829189 * fract(dot(floor(gl_FragCoord.xy), vec2(.06711056, .00583715)))) > fade) discard;'
        );
    };

    const mesh = new T.Mesh(g, mat);
    mesh.position.set(x, 0, z);
    mesh.frustumCulled = false;
    mesh.userData = { x, z, w, h, c: .2, ax: .5, f: 1, mat, key: 'fence_' + k };
    sc.add(mesh);
    SPR.push(mesh);

    // Continuous collision and clear-ground strips along each piece.
    const dx = b[0] - a[0], dz = b[1] - a[1];
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / .45));
    for (let i = 0; i <= steps; i++) {
      const cx = a[0] + dx * i / steps, cz = a[1] + dz * i / steps;
      circ.push({ x: cx, z: cz, r: .32 });
      FP.push({ x0: cx - .35, z0: cz - .35, x1: cx + .35, z1: cz + .35 });
    }
    SH.push({
      x, z,
      rx: Math.abs(dx) / 2 + .15,
      rz: Math.abs(dz) / 2 + .15,
      a: .4, ht: 1.8, rect: 1
    });
  }
}
