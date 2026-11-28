// ===== DRIFTER — STATION BASE FENCES =====
// Chain-link encloses the station compound only. The south entrance stays open at the checkpoint;
// the main road, Silvan trail, and unmarked city road remain outside the fenced base.
//
// API:  await createStationFences({ T, sc, SPR, circ, SH, FP })    call after the scatter has been planted
//   fencePieces() is the pure layout maths (no DOM, no THREE).

import { CAT } from './city_catalog.js';
import { retouch, straighten } from './city_shade.js';

// Fence line runs in world coordinates [x0, z0, x1, z1].
// The west / north / east sides wrap the buildings and service yard. The south edge is split
// around the checkpoint opening; the two short angled returns guide the entrance without
// continuing a fence across the road or around the rest of the map.
export const BASE_FENCE_RUNS = [
  [-40.5, -35.5,  40.0, -35.5],  // north / rear boundary
  [ 40.0, -35.5,  40.0,   8.9],  // east boundary
  [-40.5, -35.5, -40.5,  11.8],  // west boundary
  [-40.5,  11.8, -14.2,  11.8],  // checkpoint's west approach
  [ -0.1,   8.9,  40.0,   8.9],  // checkpoint's east approach
  [-13.4,   9.6, -14.2,  11.8], // short west return beside the booth
  [ -2.55,  9.35, -3.35, 13.15]  // short east return beside the barrier
];

export const RUNS = BASE_FENCE_RUNS;

const TALL = 3;                       // world height of the sprite as drawn (the city uses 3.8)
const ISO = Math.tan(Math.PI / 6);

// -> one entry per fence piece: { k, corners: [[x, y, z, u, v] x4] (top-left, top-right, bottom-left, bottom-right), a, b }
export function fencePieces(runs = RUNS) {
  const out = [];
  for (const [x0, z0, x1, z1] of runs) {
    let a = [x0, z0], b = [x1, z1];
    let dx = b[0] - a[0], dz = b[1] - a[1];
    const length = Math.hypot(dx, dz);
    if (length < 1e-4) continue;

    // Orient every run left-to-right in the isometric projection. This chooses the
    // matching fence artwork and lets every panel use one consistent UV direction.
    let dirX = dx / length, dirZ = dz / length;
    let screenPerUnit = .7071 * (dirX - dirZ);
    if (screenPerUnit < 0) {
      [a, b] = [b, a];
      dx = -dx; dz = -dz;
      dirX = -dirX; dirZ = -dirZ;
      screenPerUnit = -screenPerUnit;
    }

    // p28 runs toward the far side of the isometric projection; p30 runs toward
    // the near side. Angled checkpoint returns use the same projection math.
    const k = dirX + dirZ >= 0 ? 'p28' : 'p30';
    const m = CAT[k], unit = TALL / m.h;
    const nativeRun = m.run * unit / screenPerUnit;
    const count = Math.max(1, Math.round(length / nativeRun));
    const pieceLength = length / count;
    const stretch = pieceLength / nativeRun;

    for (let i = 0; i < count; i++) {
      const alongCentre = (i + .5) * pieceLength;
      const cx = a[0] + dirX * alongCentre, cz = a[1] + dirZ * alongCentre;
      const corners = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([u, v]) => {
        // Match city.js's fence-plane transform. Scale the actual ground run to fit
        // this section, then derive the vertical correction from that scaled run.
        const sx = (u * m.W - m.px) * unit;
        const sy = (m.py - v * m.H) * unit;
        const along = sx / screenPerUnit * stretch;
        const y = (sy + .4082 * (dirX + dirZ) * along) / .8165;
        return [cx + dirX * along, y, cz + dirZ * along, u, v];
      });
      const p = [a[0] + dirX * i * pieceLength, a[1] + dirZ * i * pieceLength];
      const q = [a[0] + dirX * (i + 1) * pieceLength, a[1] + dirZ * (i + 1) * pieceLength];
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
    if (/^rok_/.test(u.key) && Math.abs(u.x) > 30 && u.z > 11.9 && u.z < 21.5) continue;   // the rubble blockading both ends of the main road stays
    if (fenceDist(u.x, u.z) > (/tree|sapling|banana/.test(u.key) ? 2.6 : .6 + u.w * .25)) continue;
    sc.remove(SPR[i]); SPR.splice(i, 1);
    for (const list of [circ, SH]) { const j = list.findIndex(c => c.x === u.x && c.z === u.z); if (j >= 0) list.splice(j, 1); }
  }

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
