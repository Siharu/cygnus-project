// ===== DRIFTER — GRASSLAND (wind-animated grass) =====
// Four species from assets/DRIFTER_Terrain_Asset_Library_Animated_Grass_v2, halved to
// assets/game/grass_*.png (4 frames in a row, 192x128 each). One InstancedMesh per species,
// so a thousand tufts cost four draw calls. A meadow south of the road, plus loose tufts
// across the open ground.

export const MEADOW = { x0: -15, x1: 28, z0: 23.5, z1: 35.5 };

const FRAME = 0.6;                     // seconds per frame (pack's suggested timing)
const SPECIES = {                      // h = world height of one frame cell
  tuft:   { key: 'grass_tuft', h: 1.45 },
  reeds:  { key: 'grass_reeds', h: 1.9 },
  broad:  { key: 'grass_broadleaf', h: 1.35 },
  flower: { key: 'grass_flowering', h: 1.55 },
};
const TINT = [1.22, 1.16, 0.98];       // lifts the grass a little out of the night tint, warmed to sit with the foliage

// ctx = { T, sc, IM, LT, AMB, OFF, rnd, noise, clear(x,z) }
export function createGrass({ T, sc, IM, LT, AMB, OFF, rnd, noise, clear }) {
  const list = { tuft: [], reeds: [], broad: [], flower: [] };
  const add = (sp, x, z, s) => list[sp].push({ x, z, s });
  const M = MEADOW;

  // meadow: jittered grid, patches by noise, thinning toward the edges
  const step = 0.8;
  for (let gz = M.z0; gz < M.z1; gz += step) for (let gx = M.x0; gx < M.x1; gx += step) {
    const x = gx + (rnd() - .5) * step, z = gz + (rnd() - .5) * step;
    const edge = Math.min(x - M.x0, M.x1 - x, z - M.z0, M.z1 - z) + (noise(x * .4, z * .4) - .5) * 3;
    if (rnd() > Math.min(1, .25 + edge * .35)) continue;
    const tall = noise(x * .16 + 5, z * .16 + 2), bloom = noise(x * .22 + 31, z * .22 + 17), r = rnd();
    const sp = tall > .62 && r < .75 ? 'reeds' : bloom > .66 && r < .6 ? 'flower' : r < .1 ? 'broad' : 'tuft';
    add(sp, x, z, .8 + rnd() * .4);
  }
  // loose tufts across the rest of the open ground
  for (let k = 0, n = 0; k < 5000 && n < 240; k++) {
    const x = rnd() * 88 - 44, z = rnd() * 88 - 44;
    if (!clear(x, z)) continue;
    const r = rnd();
    add(r < .08 ? 'flower' : r < .16 ? 'broad' : 'tuft', x, z, .6 + rnd() * .35); n++;
  }

  const time = { value: 0 }, walker = { value: new T.Vector2(1e4, 1e4) };
  const face = new T.Quaternion().setFromRotationMatrix(new T.Matrix4().lookAt(OFF, new T.Vector3(), new T.Vector3(0, 1, 0)));
  const meshes = Object.keys(list).map(sp => {
    const { key, h } = SPECIES[sp], items = list[sp];
    const tex = new T.Texture(IM[key]); tex.magFilter = T.LinearFilter; tex.minFilter = T.LinearMipmapLinearFilter; tex.needsUpdate = true;
    const geo = new T.PlaneGeometry(h * 1.5, h); geo.translate(0, h * (.5 - 8 / 256), 0);   // roots sit on the ground point
    const phase = new Float32Array(items.length), speed = new Float32Array(items.length), flipA = new Float32Array(items.length);
    const mat = new T.MeshBasicMaterial({ map: tex, alphaTest: .45, side: T.DoubleSide, fog: true });
    mat.onBeforeCompile = sh => {
      sh.uniforms.uT = time; sh.uniforms.uP = walker; sh.uniforms.uH = { value: h };
      sh.vertexShader = 'attribute float aPhase;\nattribute float aSpeed;\nattribute float aFlip;\nuniform float uT;\nuniform vec2 uP;\nuniform float uH;\n' + sh.vertexShader.replace('#include <uv_vertex>',
        `#include <uv_vertex>\n vUv.x = (vUv.x + mod(floor(uT * aSpeed / ${FRAME} + aPhase), 4.0)) * 0.25;`)
        // grass flattens around the player so the character stays readable
        .replace('#include <begin_vertex>', `#include <begin_vertex>
 vec2 wp = instanceMatrix[3].xz;
 float gust = 0.55 + 0.45 * sin(uT * 0.21 + dot(wp, vec2(0.045, 0.03)));
 float sway = sin(uT * 0.85 - dot(wp, vec2(0.16, 0.09))) * 0.6
            + sin(uT * 1.9 - dot(wp, vec2(0.31, 0.2)) + aPhase * 1.57) * 0.2;
 float lean = 0.35 + sway * gust;
 float bend = clamp(transformed.y / uH, 0.0, 1.0); bend *= bend;
 transformed.x += lean * 0.18 * uH * bend * aFlip;
 transformed.y *= mix(0.35, 1.0, smoothstep(0.6, 2.2, distance(instanceMatrix[3].xz - 0.3, uP)));`);
    };
    const mesh = new T.InstancedMesh(geo, mat, items.length);
    const m = new T.Matrix4(), pos = new T.Vector3(), scl = new T.Vector3(), col = new T.Color();
    items.forEach((g, i) => {
      // +.3 on every axis keeps the screen position (isometric view) and lets grass just in front hide the player's feet
      const fl = rnd() < .5; pos.set(g.x + .3, .3, g.z + .3); scl.set(fl ? -g.s : g.s, g.s, g.s); flipA[i] = fl ? -1 : 1;
      mesh.setMatrixAt(i, m.compose(pos, face, scl));
      let r = AMB[0], gr = AMB[1], b = AMB[2];
      for (const L of LT) { if (L.dyn) continue; const d = Math.hypot(g.x - L.x, g.z - L.z); if (d < L.R) { const f = 1 - d / L.R, k = f * f * L.I * .6; r += L.cc[0] * k; gr += L.cc[1] * k; b += L.cc[2] * k; } }
      const v = .88 + rnd() * .24;
      mesh.setColorAt(i, col.setRGB(Math.min(1.5, r) * TINT[0] * v, Math.min(1.5, gr) * TINT[1] * v, Math.min(1.5, b) * TINT[2] * v));
      // a slow wave across the field, with a little per-plant jitter
      phase[i] = ((g.x + g.z * .5) * .28 + rnd() * 1.2 + 400) % 4; speed[i] = .94 + rnd() * .12;
    });
    geo.setAttribute('aPhase', new T.InstancedBufferAttribute(phase, 1));
    geo.setAttribute('aSpeed', new T.InstancedBufferAttribute(speed, 1));
    geo.setAttribute('aFlip', new T.InstancedBufferAttribute(flipA, 1));
    mesh.frustumCulled = false; sc.add(mesh);
    return mesh;
  });

  return {
    count: meshes.reduce((n, m) => n + m.count, 0),
    update(t, visible, P) { time.value = t; walker.value.set(P.x, P.z); for (const m of meshes) m.visible = visible; },
  };
}
