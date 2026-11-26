// ===== DRIFTER — WEATHER =====
// Dynamic weather for the station and Silvan: clear -> overcast -> mist -> drizzle -> rain -> storm.
// The state machine drifts between conditions on its own; every value main.js reads is smoothed,
// so the sky, fog, light, wind, rain and sound all fade between states over about 15 seconds.
//
//   main.js reads (WX = createWeather(...)):
//     WX.fogT/fogW/fogM   fog colour target / blend / density multiplier
//     WX.amb              sprite tint multiplier [r,g,b]
//     WX.hemi, WX.sun     hemisphere / directional light multipliers
//     WX.windNow          gusting wind strength (1 = the original grass sway)
//     WX.mist, WX.shaft   mist sprite / moonbeam opacity multipliers
//     WX.rain, WX.wet     rain intensity 0..1 / how wet the ground is 0..1
//     WX.scatter          0..1.2 how much the air scatters light (fog, rain)
//     WX.flash            lightning flash 0..1
//     WX.wa               wind sound multiplier
//     WX.label            HUD name
//
//   Debug / testing:  ?weather=clear|cloudy|mist|drizzle|rain|storm  holds one condition
//                     __W.WX.set('storm')  switches at runtime (add true to hold it)
//   Rain streak and splash counts follow ?fx= (see FXT in main.js).

const S = {
  clear:   { label: 'CLEAR',    rain: 0,   fogM: 1,    fogW: 0,   fogT: [.094, .157, .212], amb: [1, 1, 1],       hemi: 1,   sun: 1,   wind: 1,   mist: 1,    shaft: 1,   wet: 0,  bolt: 0 },
  cloudy:  { label: 'OVERCAST', rain: 0,   fogM: 1.08, fogW: .4,  fogT: [.075, .125, .17],  amb: [.9, .93, .97],  hemi: .85, sun: .5,  wind: 1.3, mist: 1.15, shaft: .35, wet: 0,  bolt: 0 },
  mist:    { label: 'MIST',     rain: 0,   fogM: 1.6,  fogW: .65, fogT: [.2, .27, .31],     amb: [.86, .92, .97], hemi: .9,  sun: .45, wind: .35, mist: 1.8,  shaft: .9,  wet: .3, bolt: 0 },
  drizzle: { label: 'DRIZZLE',  rain: .3,  fogM: 1.18, fogW: .5,  fogT: [.13, .19, .24],   amb: [.84, .89, .95], hemi: .8,  sun: .35, wind: 1.2, mist: 1.4,  shaft: .25, wet: .7, bolt: 0 },
  rain:    { label: 'RAIN',     rain: .75, fogM: 1.3,  fogW: .6,  fogT: [.115, .165, .215], amb: [.74, .8, .9],   hemi: .7,  sun: .2,  wind: 2,   mist: 1.6,  shaft: .05, wet: 1,  bolt: 0 },
  storm:   { label: 'STORM',    rain: 1,   fogM: 1.5,  fogW: .72, fogT: [.065, .095, .135], amb: [.6, .66, .8],   hemi: .55, sun: .1,  wind: 3.2, mist: 1.7,  shaft: 0,   wet: 1,  bolt: 1 }
};
// where each condition can go next (weights) and how long it lasts (seconds)
const NEXT = {
  clear:   { cloudy: .6, mist: .4 },
  cloudy:  { clear: .35, drizzle: .3, mist: .1, rain: .25 },
  mist:    { clear: .4, cloudy: .4, drizzle: .2 },
  drizzle: { cloudy: .3, rain: .5, mist: .2 },
  rain:    { drizzle: .4, storm: .3, cloudy: .3 },
  storm:   { rain: .8, drizzle: .2 }
};
const HOLD = { clear: [70, 130], cloudy: [40, 90], mist: [50, 100], drizzle: [40, 80], rain: [60, 120], storm: [35, 70] };
const NUM = ['rain', 'fogM', 'fogW', 'hemi', 'sun', 'wind', 'mist', 'shaft'];
const rand = ([a, b]) => a + Math.random() * (b - a);
function weighted(tab) { let r = Math.random() * Object.values(tab).reduce((a, b) => a + b, 0); for (const k in tab) { r -= tab[k]; if (r <= 0) return k; } return Object.keys(tab)[0]; }

const DROP_V = `
attribute vec4 aSeed; attribute float aEnd;
uniform float uT,uFall,uLen,uH,uDens;
uniform vec2 uWind,uC,uW;
varying float vA;
void main(){
  float vary=.82+.36*fract(aSeed.w*37.17);
  float ph=fract(aSeed.y-uT*uFall*vary/uH);
  float y=ph*uH;
  vec2 f=vec2(aSeed.x,aSeed.z)*uW;
  vec2 v=mod(f-uC+uW*.5,uW)-uW*.5+uC;
  vec2 xz=vec2((v.x/.7071-v.y/.4082)*.5,(-v.x/.7071-v.y/.4082)*.5)+uWind*y;
  vec3 p=vec3(xz.x,y,xz.y);
  p+=normalize(vec3(uWind.x,1.,uWind.y))*uLen*vary*aEnd;
  vA=(1.-aEnd*.9)*smoothstep(0.,.05,ph)*(1.-smoothstep(.9,1.,ph));
  if(aSeed.w>uDens){gl_Position=vec4(2.,2.,2.,1.);vA=0.;return;}
  gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);
}`;
const DROP_F = `
uniform vec3 uColor; uniform float uAlpha; varying float vA;
void main(){gl_FragColor=vec4(uColor,vA*uAlpha);}`;
const SPL_V = `
attribute vec4 aSeed;
uniform float uT,uPPU,uDens,uAlpha,uSize;
uniform vec2 uC,uW;
varying float vPh,vA;
void main(){
  float rate=.9+.8*fract(aSeed.w*31.7);
  float t=aSeed.z+uT*rate;
  float ph=fract(t);
  float cyc=floor(t);
  vec2 j=vec2(fract(sin((cyc+aSeed.w*91.)*12.9898)*43758.5453),fract(sin((cyc+aSeed.w*57.)*78.233)*24634.6345));
  vec2 f=fract(aSeed.xy+j)*uW;
  vec2 v=mod(f-uC+uW*.5,uW)-uW*.5+uC;
  float x=(v.x/.7071-v.y/.4082)*.5;
  float z=(-v.x/.7071-v.y/.4082)*.5;
  vPh=ph; vA=uAlpha*(1.-ph)*(1.-ph);
  if(aSeed.w>uDens){gl_Position=vec4(2.,2.,2.,1.);gl_PointSize=0.;return;}
  gl_Position=projectionMatrix*viewMatrix*vec4(x,.04,z,1.);
  gl_PointSize=min(64.,uSize*uPPU*(.25+.75*ph));
}`;
const SPL_F = `
uniform vec3 uColor; varying float vPh,vA;
void main(){
  vec2 c=(gl_PointCoord-.5)*2.;
  float d=length(vec2(c.x,c.y/.577));
  if(d>1.) discard;
  float ring=smoothstep(.24,0.,abs(d-vPh));
  gl_FragColor=vec4(uColor,ring*vA);
}`;

// ctx: { T, sc, FXK }
export function createWeather({ T, sc, FXK }) {
  const H = 22, UPH = .8165;                       // height of the rain volume, and screen-up per world unit of height
  const forced = (location.search.match(/[?&]weather=(\w+)/) || [])[1];
  let name = S[forced] ? forced : (Math.random() < .6 ? 'clear' : 'cloudy');
  let hold = !!S[forced], timer = rand(HOLD[name]);
  const s0 = S[name];
  const W = {
    name, label: s0.label, fogT: s0.fogT.slice(), amb: s0.amb.slice(),
    wet: hold ? s0.wet : 0, windNow: s0.wind, wdx: 1, wdz: 0, scatter: 0, flash: 0, wa: 1,
    set(n, h) { if (!S[n]) return false; name = n; W.name = n; W.label = S[n].label; hold = !!h; timer = rand(HOLD[n]); return true; }
  };
  for (const k of NUM) W[k] = s0[k];

  // ---- lightning ----
  let nextBolt = 6 + Math.random() * 8, boltAt = -99, pulses = [];
  function strike(t) {
    boltAt = t; pulses = [];
    const n = 1 + (Math.random() * 3 | 0); let at = 0;
    for (let i = 0; i < n; i++) { pulses.push({ at, a: .55 + Math.random() * .45 }); at += .07 + Math.random() * .12; }
    thunder(.3 + Math.random() * 2.8, .35 + Math.random() * .35);
  }

  // ---- rain streaks + ground splashes (screen-aligned volumes; see DROP_V) ----
  const drops = FXK.rn > 0 ? (() => {
    const n = FXK.rn, pos = new Float32Array(n * 6), seed = new Float32Array(n * 8), end = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      const x = Math.random(), y = Math.random(), z = Math.random(), w = Math.random();
      for (let k = 0; k < 2; k++) { const o = (i * 2 + k) * 4; seed[o] = x; seed[o + 1] = y; seed[o + 2] = z; seed[o + 3] = w; end[i * 2 + k] = k; }
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new T.BufferAttribute(seed, 4));
    g.setAttribute('aEnd', new T.BufferAttribute(end, 1));
    const u = { uT: { value: 0 }, uFall: { value: 26 }, uLen: { value: 1.5 }, uH: { value: H }, uDens: { value: 0 }, uAlpha: { value: .5 },
      uWind: { value: new T.Vector2() }, uC: { value: new T.Vector2() }, uW: { value: new T.Vector2(60, 60) }, uColor: { value: new T.Color(0xa9bdd0) } };
    const m = new T.LineSegments(g, new T.ShaderMaterial({ uniforms: u, vertexShader: DROP_V, fragmentShader: DROP_F, transparent: true, depthWrite: false }));
    m.frustumCulled = false; m.visible = false; sc.add(m);
    return { m, u };
  })() : null;
  const splash = FXK.sp > 0 ? (() => {
    const n = FXK.sp, pos = new Float32Array(n * 3), seed = new Float32Array(n * 4);
    for (let i = 0; i < n * 4; i++) seed[i] = Math.random();
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new T.BufferAttribute(seed, 4));
    const u = { uT: { value: 0 }, uPPU: { value: 40 }, uDens: { value: 0 }, uAlpha: { value: .5 }, uSize: { value: 1.3 },
      uC: { value: new T.Vector2() }, uW: { value: new T.Vector2(60, 40) }, uColor: { value: new T.Color(0xb4c8da) } };
    const m = new T.Points(g, new T.ShaderMaterial({ uniforms: u, vertexShader: SPL_V, fragmentShader: SPL_F, transparent: true, depthWrite: false }));
    m.frustumCulled = false; m.visible = false; sc.add(m);
    return { m, u };
  })() : null;

  // ---- sound: rain hiss / patter / low roar, and thunder ----
  let A = null;
  W.audio = (AC, dest) => {
    try {
      const nb = AC.createBuffer(1, AC.sampleRate * 3, AC.sampleRate), d = nb.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const mk = (type, f, Q) => {
        const s = AC.createBufferSource(); s.buffer = nb; s.loop = true;
        const fl = AC.createBiquadFilter(); fl.type = type; fl.frequency.value = f; if (Q) fl.Q.value = Q;
        const g = AC.createGain(); g.gain.value = 0; s.connect(fl); fl.connect(g); g.connect(dest); s.start(0, Math.random() * 2);
        return { g, fl };
      };
      A = { AC, dest, nb, hiss: mk('highpass', 2600), body: mk('bandpass', 900, .6), low: mk('lowpass', 260) };
    } catch (e) { console.warn('weather audio', e); }
  };
  function thunder(delay, power) {
    if (!A) return;
    try {
      const AC = A.AC, t0 = AC.currentTime + delay;
      const s = AC.createBufferSource(); s.buffer = A.nb; s.loop = true;
      const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(900, t0); lp.frequency.exponentialRampToValueAtTime(70, t0 + 3.5);
      const g = AC.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(power, t0 + .07); g.gain.exponentialRampToValueAtTime(.001, t0 + 3.8 + power * 2.5);
      s.connect(lp); lp.connect(g); g.connect(A.dest); s.start(t0, Math.random() * 2); s.stop(t0 + 7);
    } catch (e) { /* audio is optional */ }
  }

  // ctx: { cx, cz (camera focus), hw, hh (half view size in world-screen units), ppu (pixels per unit), out (not in an interior) }
  W.update = (dt, t, ctx) => {
    // state machine
    if (!hold) {
      timer -= dt;
      if (timer <= 0) { const n = weighted(NEXT[name]); name = n; W.name = n; W.label = S[n].label; timer = rand(HOLD[n]); }
    }
    const T0 = S[name], k = 1 - Math.exp(-dt / 5);
    for (const p of NUM) W[p] += (T0[p] - W[p]) * k;
    for (let i = 0; i < 3; i++) { W.fogT[i] += (T0.fogT[i] - W.fogT[i]) * k; W.amb[i] += (T0.amb[i] - W.amb[i]) * k; }
    W.wet += (T0.wet - W.wet) * (1 - Math.exp(-dt * (T0.wet > W.wet ? 1 / 45 : 1 / 150)));
    // wind: slow gusts, drifting direction
    W.windNow = Math.max(.15, W.wind * (.78 + .22 * Math.sin(t * .37) + .14 * Math.sin(t * .91 + 1.3) + .08 * Math.sin(t * 2.3)));
    const wa = -.6 + .45 * Math.sin(t * .043); W.wdx = Math.cos(wa); W.wdz = Math.sin(wa);
    W.wa = .55 + .45 * Math.min(2, W.windNow);
    W.scatter = Math.max(0, Math.min(1.2, (W.fogM - 1) * 1.3 + W.rain * .55));
    // lightning (only once the storm has built)
    if (T0.bolt && W.rain > .8) { nextBolt -= dt; if (nextBolt <= 0) { strike(t); nextBolt = 6 + Math.random() * 14; } }
    let fl = 0; const age = t - boltAt;
    if (age < 1.5) for (const p of pulses) if (age >= p.at) fl += p.a * Math.exp(-(age - p.at) / .07);
    W.flash = Math.min(1, fl) * (ctx.out ? 1 : .25);

    // rain + splashes
    const rn = ctx.out ? W.rain : 0, on = rn > .03;
    const csx = (ctx.cx - ctx.cz) * .7071, csy = -(ctx.cx + ctx.cz) * .4082;
    if (drops) {
      drops.m.visible = on;
      if (on) {
        const u = drops.u, sl = .05 + .07 * W.windNow;
        u.uT.value = t % 997; u.uDens.value = Math.min(1, rn * 1.15); u.uAlpha.value = .62 * (.45 + .55 * rn);
        u.uWind.value.set(-W.wdx * sl, -W.wdz * sl); u.uLen.value = 1.2 + .5 * rn;
        u.uC.value.set(csx, csy - H * UPH * .5); u.uW.value.set(2 * ctx.hw + 6, 2 * ctx.hh + H * UPH + 6);
      }
    }
    if (splash) {
      splash.m.visible = on && W.wet > .2;
      if (splash.m.visible) {
        const u = splash.u;
        u.uT.value = t % 997; u.uDens.value = Math.min(1, rn * 1.1); u.uAlpha.value = .5 * Math.min(1, W.wet);
        u.uPPU.value = ctx.ppu; u.uC.value.set(csx, csy); u.uW.value.set(2 * ctx.hw + 4, 2 * ctx.hh + 4);
      }
    }

    // sound (master mute is handled by the master gain)
    if (A) {
      const room = ctx.out ? 1 : .22, r = W.rain * room;
      A.hiss.g.gain.value = .045 * r; A.body.g.gain.value = .05 * r; A.low.g.gain.value = .07 * r * r;
      A.hiss.fl.frequency.value = ctx.out ? 2600 : 700;
    }
  };
  return W;
}
