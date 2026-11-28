#!/usr/bin/env python3
"""install_dusk.py: adds the "Aegis Dusk" preset to DRIFTER.

Run from the repo root:   python install_dusk.py
Undo:                     git checkout src/station/main.js src/station/lighting.js && rm src/station/dusk.js

What it does
  * adds src/station/dusk.js (night <-> dusk blend, sprite/player rim light, ?tune slider)
  * patches src/station/main.js and src/station/lighting.js (exact-text edits; nothing is written unless every anchor matches once)
  * skips the post-shader blur where it is not needed, and removes the dead `*0+0` / `*.0+` code
"""
import pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent
ST = ROOT / 'src' / 'station'

DUSK_JS = r'''// ===== DRIFTER — AEGIS DUSK PRESET =====
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
'''

def E(old, new):
    return (old, new)

MAIN = [
  # --- imports / setup
  E(r'''import { createLighting } from './lighting.js';''',
    r'''import { createLighting } from './lighting.js';
import { createDusk } from './dusk.js';'''),
  E(r'''const dl=new T.DirectionalLight(0x7090c0,.4);dl.position.set(-14,24,10);sc.add(dl);''',
    r'''const dl=new T.DirectionalLight(0x7090c0,.4);dl.position.set(-14,24,10);sc.add(dl);
const DK=createDusk({T,hemi,dl}); // src/station/dusk.js: night <-> dusk blend. ?tod=night|dusk, ?tune adds a slider'''),
  # --- post shader: dusk grade + cheaper blur
  E(r'''kt:{value:FXK.kt}}''', r'''kt:{value:FXK.kt},kd:{value:0}}'''),
  E(r'''uniform float time,wrong,kb,kg,kn,kt;varying vec2 u;''', r'''uniform float time,wrong,kb,kg,kn,kt,kd;varying vec2 u;'''),
  E(r'''for(int i=-2;i<=2;i++)for(int j=-2;j<=2;j++){vec2 o=vec2(float(i),float(j));c+=texture2D(t,uv+o*px*b).rgb;l+=max(texture2D(t,uv+o*px*4.).rgb-.42,0.);}''',
    r'''float bt=.42-.12*kd;
if(b>.03){for(int i=-2;i<=2;i++)for(int j=-2;j<=2;j++){c+=texture2D(t,uv+vec2(float(i),float(j))*px*b).rgb;}}else{c=texture2D(t,uv).rgb*25.;}
for(int i=-2;i<=2;i++)for(int j=-2;j<=2;j++){l+=max(texture2D(t,uv+vec2(float(i),float(j))*px*4.).rgb-bt,0.);}'''),
  E(r'''float lu=dot(c,vec3(.3,.59,.11));c=mix(vec3(lu),c,.92-wrong*.4);c+=vec3(-.012,.014,.026)*(1.-lu)*2.;c+=vec3(.03,.012,-.01)*smoothstep(.45,1.,lu);c=c*.93+vec3(.028,.042,.052);''',
    r'''float lu=dot(c,vec3(.3,.59,.11));c=mix(vec3(lu),c,.92+.22*kd-wrong*.4);c+=mix(vec3(-.012,.014,.026),vec3(.03,-.006,.05),kd)*(1.-lu)*2.;c+=mix(vec3(.03,.012,-.01),vec3(.075,.034,-.022),kd)*smoothstep(.45-.12*kd,1.,lu);c=c*.93+mix(vec3(.028,.042,.052),vec3(.045,.026,.065),kd);
c+=vec3(1.,.6,.3)*pow(max(0.,1.-length((u-vec2(.9,.92))*vec2(1.,.75))*1.1),2.2)*.2*kd;'''),
  # --- sprites + player get the gradient / rim-light shader
  E(r'''const mat=new T.SpriteMaterial({map:o.flip?ftex(key):stex(key),alphaTest:.4,transparent:false,fog:true});''',
    r'''const mat=new T.SpriteMaterial({map:o.flip?ftex(key):stex(key),alphaTest:.4,transparent:false,fog:true});mat.onBeforeCompile=DK.spriteShader(!!o.flip,IM[key]);'''),
  E(r'''const PH=2.215,PW=PH*64/96;''', r'''pmat.onBeforeCompile=DK.playerShader();
const PH=2.215,PW=PH*64/96;'''),
  # --- player contact shadow: white gradient tinted by material colour, so it can go plum at dusk
  E(r'''gr.addColorStop(0,'rgba(1,3,7,.52)');gr.addColorStop(.38,'rgba(1,3,7,.34)');gr.addColorStop(.72,'rgba(1,3,7,.12)');gr.addColorStop(1,'rgba(1,3,7,0)')''',
    r'''gr.addColorStop(0,'rgba(255,255,255,.52)');gr.addColorStop(.38,'rgba(255,255,255,.34)');gr.addColorStop(.72,'rgba(255,255,255,.12)');gr.addColorStop(1,'rgba(255,255,255,0)')'''),
  E(r'''new T.MeshBasicMaterial({map:new T.CanvasTexture(psc),transparent:true,opacity:.82,depthWrite:false,fog:true})''',
    r'''new T.MeshBasicMaterial({map:new T.CanvasTexture(psc),color:0x010307,transparent:true,opacity:.82,depthWrite:false,fog:true})'''),
  # --- the ?tune slider must not start the touch stick
  E(r'''closest('#pn,#ov,#nav-hud'))''', r'''closest('#pn,#ov,#nav-hud,#tune'))'''),
  # --- shafts made here are tinted / rotated by the blend (forest shafts are left alone)
  E(r'''SHAFT.push({s,ph:r()*9,b:.045+r()*.05})''', r'''SHAFT.push({s,ph:r()*9,b:.045+r()*.05,m:1})'''),
  # --- per-frame
  E(r'''WX.update(dt,t,{cx:cp.x,cz:cp.z,hw:VH*asp0,hh:VH,ppu:innerHeight*ren.getPixelRatio()/(2*VH),out:outd});''',
    r'''WX.update(dt,t,{cx:cp.x,cz:cp.z,hw:VH*asp0,hh:VH,ppu:innerHeight*ren.getPixelRatio()/(2*VH),out:outd});
 DK.update(outd&&MAP==0,WX);pu.kd.value=DK.cur;'''),
  E(r'''base=Z?Z.fog:FOG,fd=Z?Z.fogD:FOGD0,w=WX.fogW;wxc.set(base);''',
    r'''base=Z?Z.fog:DK.fogHex,fd=Z?Z.fogD:DK.fogD,w=WX.fogW,ft=DK.fogT(WX.fogT);wxc.set(base);'''),
  E(r'''wxc.r+=(WX.fogT[0]-wxc.r)*w+WX.flash*.22;wxc.g+=(WX.fogT[1]-wxc.g)*w+WX.flash*.25;wxc.b+=(WX.fogT[2]-wxc.b)*w+WX.flash*.3;''',
    r'''wxc.r+=(ft[0]-wxc.r)*w+WX.flash*.22;wxc.g+=(ft[1]-wxc.g)*w+WX.flash*.25;wxc.b+=(ft[2]-wxc.b)*w+WX.flash*.3;'''),
  E(r'''hemi.intensity=.5*WX.hemi+WX.flash*1.1;dl.intensity=.4*WX.sun+WX.flash*.6''',
    r'''hemi.intensity=DK.hemiI*WX.hemi+WX.flash*1.1;dl.intensity=DK.keyI*WX.sun+WX.flash*.6'''),
  E(r'''const wild=[AMB[0]*WX.amb[0]+WX.flash*.3,AMB[1]*WX.amb[1]+WX.flash*.3,AMB[2]*WX.amb[2]+WX.flash*.3];''',
    r'''const AM=DK.mixAmb(AMB),wild=[AM[0]*WX.amb[0]+WX.flash*.3,AM[1]*WX.amb[1]+WX.flash*.3,AM[2]*WX.amb[2]+WX.flash*.3];'''),
  E(r'''WX.amb[0]*(1-.12*WX.wet),WX.amb[1]*(1-.12*WX.wet),WX.amb[2]*(1-.12*WX.wet))''',
    r'''WX.amb[0]*(1-.12*WX.wet)*DK.ratio[0],WX.amb[1]*(1-.12*WX.wet)*DK.ratio[1],WX.amb[2]*(1-.12*WX.wet)*DK.ratio[2])'''),
  E(r'''LGT.update(t,dt,{vis:outd&&MAP==0,WX,bOn:on,''', r'''LGT.update(t,dt,{vis:outd&&MAP==0,k:DK.cur,WX,bOn:on,'''),
  E(r'''psh.material.opacity=.82*LGT.shade;''',
    r'''psh.material.opacity=.82*LGT.shade;psh.material.color.setRGB(DK.shRGB[0],DK.shRGB[1],DK.shRGB[2]);DK.light(dl.position);'''),
  E(r'''let r=AMB[0]*wam[0]+fl,g=AMB[1]*wam[1]+fl,b=AMB[2]*wam[2]+fl;''', r'''let r=AM[0]*wam[0]+fl,g=AM[1]*wam[1]+fl,b=AM[2]*wam[2]+fl;'''),
  E(r'''for(const q of SHAFT)q.s.material.opacity=q.b*(.65+.35*Math.sin(t*.5+q.ph))*WX.shaft;ff.material.opacity=1-Math.min(1,WX.rain*1.6);''',
    r'''for(const q of SHAFT){const m=q.s.material;m.opacity=q.b*(.65+.35*Math.sin(t*.5+q.ph))*WX.shaft*(q.m?DK.shaftMul:1);if(q.m){m.color.copy(DK.shaftC);m.rotation=DK.shaftRot}}
 ff.material.color.copy(DK.moteC);ff.material.opacity=(1-Math.min(1,WX.rain*1.6))*(1-.3*DK.cur);'''),
  # --- dead code
  E(r'''const dep=sm(-30,24,-(dx+dz)*.5)*0+0;u.mat.color.setRGB(''', r'''u.mat.color.setRGB('''),
  E(r'''const nz=sm(.6,.72,fbm(x*.07+40,z*.07+11))*sm(20,32,Math.hypot(x+10,z+8))*.0+sm(.64,.74,''', r'''const nz=sm(.64,.74,'''),
  # --- console access
  E(r'''window.__W={get CITY(){return CITY},''', r'''window.__W={DK,get CITY(){return CITY},'''),
]

LIGHTING = [
  E(r'''const U = 6, WORLD = 98, HALF = 49;''',
    r'''import { NIGHT as SN, DUSK as SD } from './dusk.js';

const U = 6, WORLD = 98, HALF = 49;'''),
  E(r'''const SHADOW = '3,6,10';''',
    r'''const A0D = 2.66, AMPD = .18;             // dusk: low sun in the upper right of the screen, barely drifting
let SHADOW = SN.shadow.join(','), LK = 1; // shadow colour (follows the dusk blend) and shadow-length factor'''),
  E(r'''let baked = 9;''', r'''let baked = 9, bakedK = 0;'''),
  E(r'''function bake(a) {''', r'''function bake(a, k = 0) {'''),
  E(r'''baked = a; g.clearRect(0, 0, SZ, SZ);''',
    r'''baked = a; bakedK = k; g.clearRect(0, 0, SZ, SZ);
    SHADOW = SN.shadow.map((v, i) => Math.round(v + (SD.shadow[i] - v) * k)).join(','); LK = 1 + .55 * k;'''),
  E(r'''const len = Math.min(11, ht * .34), steps = 9;''', r'''const len = Math.min(11 * LK, ht * .34 * LK), steps = 9;'''),
  E(r'''const len = Math.min(10, ht * .3), along =''', r'''const len = Math.min(10 * LK, ht * .3 * LK), along ='''),
  E(r'''bake(A0);''', r'''bake(A0, 0);'''),
  E(r'''const a = A0 + AMP * Math.sin(t * 2 * Math.PI / PERIOD);''',
    r'''const k = e.k || 0, a = A0 + (A0D - A0) * k + (AMP + (AMPD - AMP) * k) * Math.sin(t * 2 * Math.PI / PERIOD);'''),
  E(r'''dl.position.set(-L.dir.x * 26, 24, -L.dir.z * 26);''', r'''dl.position.set(-L.dir.x * 26, 24 - 8 * k, -L.dir.z * 26);'''),
  E(r'''if (e.vis && Math.abs(a - baked) > .045) bake(a);''',
    r'''if (e.vis && (Math.abs(a - baked) > .045 || Math.abs(k - bakedK) > .03)) bake(a, k);'''),
]

def patch(name, edits):
    p = ST / name
    if not p.exists():
        sys.exit(f'{p} not found. Run this from the repo root.')
    s = p.read_text(encoding='utf-8')
    bad = []
    for i, (old, new) in enumerate(edits, 1):
        n = s.count(old)
        if n != 1:
            bad.append(f'  {name} edit {i}: anchor found {n}x (need exactly 1): {old[:70]!r}')
        else:
            s = s.replace(old, new)
    return s, bad

def main():
    if (ST / 'dusk.js').exists() and 'createDusk' in (ST / 'main.js').read_text(encoding='utf-8'):
        sys.exit('Dusk is already installed (src/station/dusk.js exists and main.js imports it).')
    main_s, bad1 = patch('main.js', MAIN)
    light_s, bad2 = patch('lighting.js', LIGHTING)
    if bad1 or bad2:
        print('Nothing was written. These anchors did not match (the file has probably changed):')
        print('\n'.join(bad1 + bad2))
        sys.exit(1)
    (ST / 'dusk.js').write_text(DUSK_JS, encoding='utf-8')
    (ST / 'main.js').write_text(main_s, encoding='utf-8')
    (ST / 'lighting.js').write_text(light_s, encoding='utf-8')
    print(f'Installed: dusk.js (new), main.js ({len(MAIN)} edits), lighting.js ({len(LIGHTING)} edits).')
    print('Try it:  ?tune (slider) | ?tod=night (old look) | ?tod=dusk | ?dusk=0.5')

if __name__ == '__main__':
    main()
