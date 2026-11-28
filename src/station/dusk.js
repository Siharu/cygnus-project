// ===== DRIFTER — AEGIS DUSK PRESET =====
// A time-of-day layer that sits under the weather system. NIGHT is the original cold moonlit look; DUSK is a
// warm low sun with plum / indigo shadows. One number blends them (k: 0 = night, 1 = dusk), and it only applies
// outdoors on the station map. Interiors, Silvan and the city keep their own look.
//
//   ?tod=night | ?tod=dusk | ?dusk=0.6    starting blend (default: dusk)
//   ?tune                                  shows a NIGHT <-> DUSK slider, bottom-left
//   __W.DK.target = 0..1                   change it at runtime from the console
//
// To tune the look, edit the NIGHT and DUSK tables below. NIGHT matches the values that were hard-coded in
// main.js, so ?tod=night is the old look (apart from the light shafts, which now follow the light).

const lerp = (a, b, k) => a + (b - a) * k;

export const NIGHT = {
  fog: 0x182836, fogD: .0165,                 // haze colour and FogExp2 density
  sky: 0x5a78a0, gnd: 0x0c1014, hemiI: .5,    // hemisphere light: sky, ground bounce, intensity
  key: 0x7090c0, keyI: .4,                    // directional light: colour, intensity
  amb: [.56, .64, .82],                       // sprite tint
  shaft: 0xaac8e0, mote: 0xd8ff90,            // light shafts, floating motes (fireflies at night)
  shadow: [3, 6, 10]                          // cast-shadow colour (r,g,b 0-255)
};
export const DUSK = {
  fog: 0x7a5a76, fogD: .011,
  sky: 0xf0b090, gnd: 0x3a3f6a, hemiI: .55,
  key: 0xffb070, keyI: .85,
  amb: [.92, .74, .78],
  shaft: 0xffc58a, mote: 0xffd7a0,
  shadow: [38, 24, 64]
};

export function createDusk({ T, hemi, dl }) {
  const q = new URLSearchParams(location.search), tod = q.get('tod');
  const start = tod === 'night' ? 0 : q.has('dusk') ? Math.max(0, Math.min(1, parseFloat(q.get('dusk')) || 0)) : 1;
  const c2 = new T.Color(), c3 = new T.Color(), dfog = new T.Color(DUSK.fog), dfa = [dfog.r, dfog.g, dfog.b];
  const mix = (a, b, k, out) => out.setHex(a).lerp(c2.setHex(b), k);
  const amb = [0, 0, 0], ft = [0, 0, 0];
  // uniforms shared by every patched material
  const U = { kd: { value: 0 }, rimK: { value: 0 }, sunUV: { value: new T.Vector2(.6, .5) }, rimCol: { value: new T.Color(0xffb878) } };
  const D = {
    target: start, cur: 0,
    hemiI: NIGHT.hemiI, keyI: NIGHT.keyI, fogHex: NIGHT.fog, fogD: NIGHT.fogD,
    shaftC: new T.Color(NIGHT.shaft), moteC: new T.Color(NIGHT.mote), shaftMul: 1, shaftRot: -.5,
    ratio: [1, 1, 1],                               // dusk sprite tint / night sprite tint, for things tinted by weather only (grass)
    shRGB: NIGHT.shadow.map(v => v / 255),          // player contact-shadow colour
    sunUV: U.sunUV.value                            // screen direction towards the light
  };

  // call once per frame after the weather update. on = outdoors on the station map
  D.update = (on, WX) => {
    const k = D.cur = on ? D.target : 0;
    mix(NIGHT.sky, DUSK.sky, k, hemi.color); mix(NIGHT.gnd, DUSK.gnd, k, hemi.groundColor); mix(NIGHT.key, DUSK.key, k, dl.color);
    D.hemiI = lerp(NIGHT.hemiI, DUSK.hemiI, k); D.keyI = lerp(NIGHT.keyI, DUSK.keyI, k);
    D.fogHex = mix(NIGHT.fog, DUSK.fog, k, c3).getHex(); D.fogD = lerp(NIGHT.fogD, DUSK.fogD, k);
    mix(NIGHT.shaft, DUSK.shaft, k, D.shaftC); mix(NIGHT.mote, DUSK.mote, k, D.moteC); D.shaftMul = 1 + k;
    for (let i = 0; i < 3; i++) {
      D.ratio[i] = lerp(NIGHT.amb[i], DUSK.amb[i], k) / NIGHT.amb[i];
      D.shRGB[i] = lerp(NIGHT.shadow[i], DUSK.shadow[i], k) / 255;
    }
    U.kd.value = k; U.rimK.value = k * (.3 + .7 * Math.min(1, WX.sun));
  };

  // sprite tint: returns `a` untouched at night, otherwise a blended array (do not keep a reference)
  D.mixAmb = a => { const k = D.cur; if (!k) return a; for (let i = 0; i < 3; i++) amb[i] = a[i] + (DUSK.amb[i] - a[i]) * k; return amb; };

  // weather fog target: keeps mist / rain / storm in the dusk palette instead of pulling the haze back to teal
  D.fogT = f => {
    const k = D.cur; if (!k) return f;
    const m = Math.min(1.25, .5 + .5 * f[1] / .157);     // .157 = the clear-weather green channel
    for (let i = 0; i < 3; i++) ft[i] = lerp(f[i], dfa[i] * m, k);
    return ft;
  };

  // p = directional light position (relative to the origin). Works out where the light sits on screen, so rim light
  // and light shafts lean towards it. Same projection as the game camera: screen x = (x - z) * .7071, up = -(x + z) * .4082 + y * .8165
  D.light = p => {
    const vr = (p.x - p.z) * .7071, vu = -(p.x + p.z) * .4082 + p.y * .8165, m = Math.hypot(vr, vu) || 1;
    U.sunUV.value.set(vr / m, vu / m);
    D.shaftRot = Math.max(-1, Math.min(1, Math.atan2(-vr, vu)));   // sprite.rotation is counter-clockwise
  };

  const COMMON = 'uniform float kd,rimK;\nuniform vec2 sunUV,texel;\nuniform vec3 rimCol;\n';

  // world sprites: top-lit vertical gradient plus a rim of light on the edge that faces the sun (found from the alpha channel)
  D.spriteShader = (flip, img) => {
    const texel = { value: new T.Vector2(1 / ((img && img.width) || 256), 1 / ((img && img.height) || 256)) }, fx = { value: flip ? -1 : 1 };
    return sh => {
      Object.assign(sh.uniforms, { kd: U.kd, rimK: U.rimK, sunUV: U.sunUV, rimCol: U.rimCol, texel, fx });
      sh.fragmentShader = sh.fragmentShader
        .replace('void main() {', COMMON + 'uniform float fx;\nvoid main() {')
        .replace('#include <map_fragment>', `#include <map_fragment>
      if (kd > .001) {
        float a1 = texture2D(map, vUv + vec2(sunUV.x * fx, sunUV.y) * texel * 3.).a;
        float rim = clamp(diffuseColor.a - a1, 0., 1.) * 1.4 * rimK;
        diffuseColor.rgb = diffuseColor.rgb * mix(1., mix(.78, 1.12, vUv.y), kd) + rimCol * rim;
      }`);
    };
  };

  // the player is a lit plane (64x96 frames); the rim goes in as emissive so the lighting doesn't swallow it
  D.playerShader = () => {
    const texel = { value: new T.Vector2(1 / 64, 1 / 96) };
    return sh => {
      Object.assign(sh.uniforms, { kd: U.kd, rimK: U.rimK, sunUV: U.sunUV, rimCol: U.rimCol, texel });
      sh.fragmentShader = sh.fragmentShader
        .replace('void main() {', COMMON + 'void main() {')
        .replace('#include <map_fragment>', `#include <map_fragment>
      float rimV = 0.;
      if (kd > .001) {
        float a1 = texture2D(map, vUv + sunUV * texel * 3.).a;
        rimV = clamp(diffuseColor.a - a1, 0., 1.) * 1.4 * rimK;
        diffuseColor.rgb *= mix(1., mix(.8, 1.1, vUv.y), kd);
      }`)
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n      totalEmissiveRadiance += rimCol * rimV;');
    };
  };

  // ?tune: a NIGHT <-> DUSK slider
  if (/[?&]tune/.test(location.search)) {
    const w = document.createElement('div'); w.id = 'tune';
    w.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:9;display:flex;gap:8px;align-items:center;padding:6px 10px;border-radius:6px;background:rgba(10,8,16,.72);color:#d9c9a8;font:18px VT323,monospace';
    w.innerHTML = '<span>NIGHT</span><input type="range" min="0" max="1" step=".01" style="width:42vw;max-width:260px"><span>DUSK</span>';
    const r = w.querySelector('input'); r.value = D.target; r.oninput = () => { D.target = +r.value; };
    document.body.appendChild(w);
  }
  return D;
}
