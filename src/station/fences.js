// ===== DRIFTER — STATION FENCES =====
// Chain-link round the whole WNCORE station and along the approach to the checkpoint. Uses the city's two chain-link sprites,
// but each piece is fitted to the ground line it is given: the post feet land exactly on both ends and the posts
// stay upright, so a run can follow any angle (the checkpoint road is not quite square to the grid).
//
// API:  await createStationFences({ T, sc, SPR, circ, SH, FP })    call after the scatter has been planted
//   fencePieces() is the pure layout maths (no DOM, no THREE).

import { CAT } from './city_catalog.js';
import { retouch, straighten } from './city_shade.js';

// [x0, z0, x1, z1]. One perimeter round every building; the checkpoint is the only way in. The walk limit is
// +-36, so the west, north and east sides mostly stand just beyond it, behind the outer buildings.
export const RUNS = [
  // south front, west: down the road verge from the booth, then along past the watchtower's ladder
  [-13.4, 9.6, -14.2, 11.8], [-14.2, 11.8, -40.5, 11.8],
  // south front, east of the barrier
  [-.1, 8.9, 40, 8.9],
  // east (behind the collapsed building), north (behind the water tower), west (behind the depot)
  [40, 8.9, 40, -35.5], [40, -35.5, -40.5, -35.5], [-40.5, -35.5, -40.5, 11.8],
  // approach road: the far verge, from the main road up to the barrier post
  [-2.55, 9.35, -3.35, 13.15],
];
// nobody squeezes between the booth and the barrier post: the barrier is the only way through the front
export const PLUG = { x: -9.25, z: 9.35, r: .45 };

const TALL = 3;                       // world height of the sprite as drawn (the city uses 3.8)
const ISO = Math.tan(Math.PI / 6);

// -> one entry per fence piece: { k, corners: [[x, y, z, u, v] x4] (top-left, top-right, bottom-left, bottom-right), a, b }
export function fencePieces(runs = RUNS) {
  const out = [];
  for (const [x0, z0, x1, z1] of runs) {
    let a = [x0, z0], b = [x1, z1];
    if (a[0] - a[1] > b[0] - b[1]) [a, b] = [b, a];           // a is the end further left on screen
    const k = b[0] + b[1] > a[0] + a[1] ? 'p28' : 'p30';      // art running down-right or up-right
    const m = CAT[k], unit = TALL / m.h, slope = m.axis === 'x' ? ISO : -ISO;
    const across = .7071 * ((b[0] - b[1]) - (a[0] - a[1]));   // width of the run on screen
    const n = Math.max(1, Math.round(across / (m.run * unit)));
    const uL = m.px - m.run / 2, vL = m.py - slope * m.run / 2;
    for (let i = 0; i < n; i++) {
      const at = f => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
      const p = at(i / n), q = at((i + 1) / n), nudge = (i % 2) * .006;   // so shared posts do not shimmer
      const corners = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([u, v]) => {
        const t = (u * m.W - uL) / m.run, foot = vL + t * slope * m.run;
        return [p[0] + (q[0] - p[0]) * t + nudge, (foot - v * m.H) * unit / .8165, p[1] + (q[1] - p[1]) * t + nudge, u, v];
      });
      out.push({ k, corners, a: p, b: q, w: m.W * unit, h: m.H * unit });
    }
  }
  return out;
}

// distance from (x, z) to the nearest run
export function fenceDist(x, z, runs = RUNS) {
  let best = Infinity;
  for (const [x0, z0, x1, z1] of runs) {
    const dx = x1 - x0, dz = z1 - z0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (z - z0) * dz) / (dx * dx + dz * dz)));
    best = Math.min(best, Math.hypot(x - x0 - dx * t, z - z0 - dz * t));
  }
  return best;
}

const load = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('fence asset ' + src.split('/').pop())); i.src = src; });

export async function createStationFences({ T, sc, SPR, circ, SH, FP }) {
  const TX = {};
  await Promise.all(['p28', 'p30'].map(async k => {
    const file = 'DRIFTER_POI_Asset_Library_v2/Individual_PNGs/SRC-' + k.slice(1).padStart(3, '0') + '_MasterSheetA_Extract.png';
    const img = await load(new URL('../../assets/' + file, import.meta.url).href);
    const t = new T.Texture(straighten(retouch(img, k), k));
    t.magFilter = T.LinearFilter; t.minFilter = T.LinearMipmapLinearFilter; t.needsUpdate = true; TX[k] = t;
  }));

  // clear plants and rocks off the fence lines (done afterwards, so the rest of the station stays as it was)
  for (let i = SPR.length - 1; i >= 0; i--) {
    const u = SPR[i].userData; if (!/^(fol_|rok_)/.test(u.key)) continue;
    if (Math.abs(u.x) > 30 && u.z > 11.9) continue;      // the rubble blockading both ends of the main road stays
    if (fenceDist(u.x, u.z) > (/tree|sapling|banana/.test(u.key) ? 2.6 : .6 + u.w * .25)) continue;
    sc.remove(SPR[i]); SPR.splice(i, 1);
    for (const list of [circ, SH]) { const j = list.findIndex(c => c.x === u.x && c.z === u.z); if (j >= 0) list.splice(j, 1); }
  }

  circ.push({ ...PLUG });
  for (const { k, corners, a, b, w, h } of fencePieces()) {
    const x = (a[0] + b[0]) / 2, z = (a[1] + b[1]) / 2;
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(corners.flatMap(c => [c[0] - x, c[1], c[2] - z]), 3));
    g.setAttribute('uv', new T.Float32BufferAttribute(corners.flatMap(c => [c[3], 1 - c[4]]), 2));
    g.setIndex([0, 2, 1, 1, 2, 3]);
    const mat = new T.MeshBasicMaterial({ map: TX[k], alphaTest: .4, side: T.DoubleSide, fog: true });
    mat.onBeforeCompile = sh => {     // dithers out when it covers the player (same trick as the city and forest)
      sh.uniforms.fade = mat.userData.fu = { value: 1 };
      sh.fragmentShader = sh.fragmentShader.replace('void main() {', 'uniform float fade;\nvoid main() {')
        .replace('#include <alphatest_fragment>', '#include <alphatest_fragment>\n if (fade < .999 && fract(52.9829189 * fract(dot(floor(gl_FragCoord.xy), vec2(.06711056, .00583715)))) > fade) discard;');
    };
    const s = new T.Mesh(g, mat); s.position.set(x, 0, z); s.frustumCulled = false;
    s.userData = { x, z, w, h, c: .2, ax: .5, f: 1, mat, key: 'fence_' + k };
    sc.add(s); SPR.push(s);

    // colliders (a chain of circles, so slanted runs block properly), shadows, and no grass underneath
    const dx = b[0] - a[0], dz = b[1] - a[1], steps = Math.ceil(Math.hypot(dx, dz) / .45);
    for (let i = 0; i <= steps; i++) {
      const cx = a[0] + dx * i / steps, cz = a[1] + dz * i / steps;
      circ.push({ x: cx, z: cz, r: .32 }); FP.push({ x0: cx - .35, z0: cz - .35, x1: cx + .35, z1: cz + .35 });
    }
    SH.push({ x, z, rx: Math.abs(dx) / 2 + .15, rz: Math.abs(dz) / 2 + .15, a: .4, ht: 1.8, rect: 1 });
  }
}
