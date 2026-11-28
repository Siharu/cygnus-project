// ===== DRIFTER — COMPANION: SHU (tuxedo cat that follows the Drifter) =====
// Shu trails the player through every map (station, Silvan, the city) and every interior.
//
//  moving    walk / run cycles in all 8 directions (shu/walk, shu/run). She breaks into a run when the
//            player runs or when she has fallen behind, and walks when she is keeping pace.
//  settling  when you stop she sits, and turns on the spot to keep facing you (sitting rows 4, 1, 7, 8, 2).
//  idle      every few seconds she picks something to do:
//              groom (row 5) · stretch (row 3) · crouch and pounce (row 9) · change how she sits
//            and when you stand still for long enough (or rest with R) she curls up and sleeps (row 6).
//            Move away and she wakes (row 6 played backwards) and follows.
//  startled  swing near her (Space) and she arches her back and hops away (row 9).
//  stuck     if scenery boxes her in, she tries to sidestep; if that fails or you are far away she
//            reappears next to you. She also reappears next to you after any map / interior change.
//
// API:  const C = await createCompanion({ T, sc, pmat })          loads the frames in the background
//       C.update(t, dt, ctx)       once per frame, after the player's position is final
//       C.state                    { mode, act, x, z, dir }  (debugging)
//
// ctx = { P, mv, swing, resting, zone, col(o,r), clamp(o), elev(x,z), scale, shade, quat }
//   P         player {x,z,...}            mv     player speed
//   swing     true while the player swings, resting: player pressed R
//   zone      string that changes whenever the player changes map or interior (Shu then joins them)
//   col       the game's collision push-out for {x,z}     clamp   keeps {x,z} inside the current map
//   elev      ground height at x,z (forest hills)         scale   1, or 1.4 inside rooms
//   shade     0..1 daylight on the ground shadow          quat    camera quaternion (billboard)
//   the game's own player material is passed as `pmat` so Shu gets the same night / interior tint

import { loadShuFrames } from './companion_assets.js';

const PPU = 120;          // source pixels per world unit: raise it and Shu gets smaller
const RADIUS = 0.28;      // collision radius
const FOLLOW_GAP = 1.5;   // she aims to stop about this far from you
const START_GAP = 2.9;    // you are this far away and standing still: she comes over
const TRAIL_GAP = 2.2;    // you are walking and she is this far behind: she follows
const MAX_SPEED = 8.2;    // a touch faster than the player's run (7.2) so she can catch up
const RUN_ON = 5.7, RUN_OFF = 4.9; // speed thresholds for the run cycle (hysteresis)

const SIT_ROWS = [4, 1, 7, 8, 2];            // the sitting variants
const ROW_FACES_RIGHT = { 3: true, 5: false, 6: true, 9: true }; // which way the stand-alone rows look
// direction -> [frame index in a sitting row (-1 = last frame, facing us), mirrored]
const SIT_VIEW = [[0, 0], [1, 0], [2, 0], [3, 0], [-1, 0], [3, 1], [2, 1], [1, 1]];

const dirOf = (dx, dz) => { // same screen-space direction maths the player uses: 0 = up, 2 = right, 4 = down ...
  const sx = dx - dz, sy = -(dx + dz) * 0.577;
  return (Math.round(Math.atan2(sx, sy) / (Math.PI / 4)) + 8) % 8;
};

export async function createCompanion(opts) {
  const frames = await loadShuFrames(opts.T, opts.onProgress);
  return createShu({ ...opts, frames });
}

// split out from createCompanion so the behaviour can be driven without loading any images
export function createShu({ T, sc, pmat, frames, rnd = Math.random }) {
  // start with a blank texture (like the player) so the material compiles with a map slot
  const blank = document.createElement('canvas'); blank.width = blank.height = 1;
  const blankTex = new T.CanvasTexture(blank); blankTex.magFilter = blankTex.minFilter = T.NearestFilter;
  const mat = new T.MeshLambertMaterial({ map: blankTex, color: 0xffffff, emissive: 0x1c1814, emissiveIntensity: 0.55, alphaTest: 0.5, transparent: false, depthWrite: true, side: T.DoubleSide, fog: false });
  const mesh = new T.Mesh(new T.PlaneGeometry(1, 1), mat);
  mesh.frustumCulled = false; mesh.renderOrder = 2; mesh.visible = false;

  const sh = makeShadow(T);
  sh.rotation.x = -Math.PI / 2; sh.renderOrder = 1; sh.visible = false;
  sc.add(sh, mesh);

  const c = { x: 0, z: 0 };            // position
  const tmp = { x: 0, z: 0 };
  const right = new T.Vector3();
  let mode = 'act', act = 'sit', actT = 0, actDur = 3, lastAct = 'sit';
  let variant = SIT_ROWS[0], dir = 4, viewDir = 4, turnAcc = 0;
  let sp = 0, running = false, phase = 0, hx = 0, hz = 1;
  let idleT = 0, placed = false, zone = null, appear = 0;
  let blockedT = 0, stuckT = 0, detour = null, detourSign = 1;
  let faceRight = true, swingSeen = false, startleX = 0, startleZ = 0, pounceX = 0, pounceZ = 0;
  let curFrame = null;

  const row = r => frames.row[r];
  const playerRight = P => (P.x - c.x) - (P.z - c.z) > 0;

  function place(ctx) {
    const P = ctx.P;
    const offs = [[1.2, -1.2], [-1.2, 1.2], [1.8, 0.5], [-0.5, -1.8], [2.4, -2.4], [-2.4, 2.4], [0, -2.6], [2.6, 0]];
    let best = null;
    for (const o of offs) {
      tmp.x = P.x + o[0]; tmp.z = P.z + o[1];
      const bx = tmp.x, bz = tmp.z;
      ctx.col(tmp, RADIUS); ctx.clamp(tmp);
      if (Math.hypot(tmp.x - bx, tmp.z - bz) < 0.05) { best = { x: tmp.x, z: tmp.z }; break; }
    }
    if (!best) { tmp.x = P.x + 1.2; tmp.z = P.z - 1.2; ctx.col(tmp, RADIUS); ctx.clamp(tmp); best = { x: tmp.x, z: tmp.z }; }
    c.x = best.x; c.z = best.z; sp = 0; detour = null; blockedT = stuckT = 0;
    dir = viewDir = dirOf(P.x - c.x, P.z - c.z);
    setAct('sit'); idleT = 0; appear = 0; placed = true;
  }

  function setAct(a) {
    mode = 'act'; act = a; actT = 0;
    if (a === 'sit') { variant = pickVariant(); actDur = 2.6 + rnd() * 4; }
    else if (a === 'groom') actDur = 3.4 + rnd() * 2;
    else if (a === 'stretch') actDur = 1.9;
    else if (a === 'crouch') actDur = 0.9 + rnd() * 0.7;
    else if (a === 'pounce') actDur = 0.42;
    else if (a === 'startle') actDur = 1.3;
    else if (a === 'wake') actDur = 0.95;
    else if (a === 'sleep') actDur = 1e9;
    if (a !== 'sit') lastAct = a;
  }

  function pickVariant() {
    let v; do { v = SIT_ROWS[(rnd() * SIT_ROWS.length) | 0]; } while (v === variant && SIT_ROWS.length > 1);
    return v;
  }

  function startMove() { mode = 'move'; act = ''; actT = 0; phase = 0; idleT = 0; }

  function nextIdle(ctx) {
    if (idleT > 24 || (ctx.resting && idleT > 5)) return setAct('sleep');
    const r = rnd();
    let a = r < 0.3 ? 'groom' : r < 0.52 ? 'stretch' : r < 0.7 ? 'crouch' : 'sit';
    if (a === lastAct && a !== 'sit') a = 'sit';
    faceRight = playerRight(ctx.P);
    setAct(a);
  }

  function beginStartle(ctx) {
    const dx = c.x - ctx.P.x, dz = c.z - ctx.P.z, d = Math.hypot(dx, dz) || 1;
    startleX = dx / d; startleZ = dz / d;
    faceRight = playerRight(ctx.P);
    setAct('startle');
  }

  // one collision-aware step; returns how far we actually got along (ux,uz)
  function step(ctx, ux, uz, speed, dt) {
    tmp.x = c.x + ux * speed * dt; tmp.z = c.z + uz * speed * dt;
    ctx.col(tmp, RADIUS); ctx.clamp(tmp);
    const mx = tmp.x - c.x, mz = tmp.z - c.z;
    c.x = tmp.x; c.z = tmp.z;
    return mx * ux + mz * uz;
  }

  // when blocked, find which sidestep gets us furthest
  function chooseDetour(ctx, ux, uz) {
    let best = null, bestScore = -1;
    for (const deg of [50, -50, 95, -95, 140, -140]) {
      const a = deg * Math.PI / 180, cs = Math.cos(a), sn = Math.sin(a);
      const vx = ux * cs - uz * sn, vz = ux * sn + uz * cs;
      tmp.x = c.x + vx * 1.1; tmp.z = c.z + vz * 1.1;
      ctx.col(tmp, RADIUS); ctx.clamp(tmp);
      const got = (tmp.x - c.x) * vx + (tmp.z - c.z) * vz + (Math.sign(deg) === detourSign ? 0.05 : 0);
      if (got > bestScore) { bestScore = got; best = a; }
    }
    detourSign = best >= 0 ? 1 : -1;
    return { a: best, t: 0.55 };
  }

  function update(t, dt, ctx) {
    dt = Math.min(dt, 0.05);
    if (!(dt > 0)) return;
    const P = ctx.P;
    if (!placed || ctx.zone !== zone) { zone = ctx.zone; place(ctx); }
    let dx = P.x - c.x, dz = P.z - c.z, d = Math.hypot(dx, dz);
    if (d > 22) { place(ctx); dx = P.x - c.x; dz = P.z - c.z; d = Math.hypot(dx, dz); }
    const pMoving = ctx.mv > 0.5;
    appear = Math.min(1, appear + dt / 0.45);

    // the player swings: Shu arches and hops away (if she is close enough to be scared)
    if (ctx.swing && !swingSeen) { swingSeen = true; if (d < 4.5 && act !== 'startle' && act !== 'pounce' && act !== 'wake') beginStartle(ctx); }
    if (!ctx.swing) swingSeen = false;

    // idle -> move
    if (mode === 'act' && act !== 'startle' && act !== 'pounce' && act !== 'wake') {
      const wantsMove = d > START_GAP || (pMoving && d > TRAIL_GAP);
      if (wantsMove) { if (act === 'sleep') setAct('wake'); else startMove(); }
    }

    let hop = 0, breathe = 1;
    let pick = null; // { f, mirror }

    if (mode === 'move') {
      idleT = 0;
      const ux0 = d > 1e-4 ? dx / d : 0, uz0 = d > 1e-4 ? dz / d : 0;
      const want = Math.max(0, Math.min(MAX_SPEED, (d - FOLLOW_GAP) * 2.5));
      sp += (want - sp) * Math.min(1, dt * 7);
      let ux = ux0, uz = uz0;
      if (detour) { const cs = Math.cos(detour.a), sn = Math.sin(detour.a); ux = ux0 * cs - uz0 * sn; uz = ux0 * sn + uz0 * cs; detour.t -= dt; if (detour.t <= 0) detour = null; }
      const got = step(ctx, ux, uz, sp, dt);
      const wanted = sp * dt;
      if (sp > 1.5 && got < wanted * 0.45) blockedT += dt; else blockedT = Math.max(0, blockedT - dt * 2);
      if (blockedT > 0.12 && !detour) { detour = chooseDetour(ctx, ux0, uz0); blockedT = 0.06; }
      stuckT = (blockedT > 0.05 && d > 5.5) ? stuckT + dt : Math.max(0, stuckT - dt);
      if (stuckT > 2.5) { place(ctx); return finish(ctx, t, dt, 0, 1, null); }
      // keep a little room round the player
      if (d < 0.95 && d > 1e-4) { const k = (0.95 - d) * 4 * dt; c.x -= dx / d * k; c.z -= dz / d * k; }

      if (sp > 0.4) { hx += (ux - hx) * Math.min(1, dt * 10); hz += (uz - hz) * Math.min(1, dt * 10); dir = dirOf(hx, hz); }
      if (!running && sp > RUN_ON) running = true; else if (running && sp < RUN_OFF) running = false;
      phase += dt * (2.6 + sp * 1.35);
      pick = { f: (running ? frames.run : frames.walk)[dir][Math.floor(phase) % 8], mirror: false };

      if (!pMoving && d < TRAIL_GAP + 0.1 && sp < 0.5) { viewDir = dir; turnAcc = 0; setAct('sit'); actDur = 3 + rnd() * 2; }
    } else {
      actT += dt; idleT += dt; sp = 0;
      // gentle push-off if the player walks right into her
      if (d < 0.8 && d > 1e-4) { const k = (0.8 - d) * 3 * dt; tmp.x = c.x - dx / d * k; tmp.z = c.z - dz / d * k; ctx.col(tmp, RADIUS); ctx.clamp(tmp); c.x = tmp.x; c.z = tmp.z; }
      const lookingRight = faceRight;

      if (act === 'sit') {
        const gaze = d > 0.3 ? dirOf(dx, dz) : viewDir;
        turnAcc += dt * 10;
        while (turnAcc >= 1) { turnAcc -= 1; if (viewDir !== gaze) { const diff = (gaze - viewDir + 8) % 8; viewDir = (viewDir + (diff <= 4 ? 1 : 7)) % 8; } }
        const R = row(variant), v = SIT_VIEW[viewDir];
        pick = { f: R[v[0] < 0 ? R.length - 1 : Math.min(v[0], R.length - 1)], mirror: !!v[1] };
        if (actT > actDur) nextIdle(ctx);
      } else if (act === 'groom') {
        const R = row(5), i = actT < 0.35 ? 0 : 1 + (Math.floor((actT - 0.35) * 5) % 4);
        pick = { f: R[i], mirror: lookingRight !== ROW_FACES_RIGHT[5] };
        if (actT > actDur) { viewDir = dir = dirOf(dx, dz); setAct('sit'); }
      } else if (act === 'stretch') {
        const R = row(3), i = Math.min(R.length - 1, Math.floor(actT * 5.2));
        pick = { f: R[i], mirror: lookingRight !== ROW_FACES_RIGHT[3] };
        if (actT > actDur) { viewDir = dirOf(dx, dz); setAct('sit'); }
      } else if (act === 'crouch') {
        const R = row(9), i = 3 + (Math.floor(actT * 6) % 2);
        pick = { f: R[i], mirror: lookingRight !== ROW_FACES_RIGHT[9] };
        if (actT > actDur) { // pick where to pounce: somewhere near the player, never straight into them
          const a = rnd() * Math.PI * 2; pounceX = Math.cos(a); pounceZ = Math.sin(a);
          if (pounceX * dx + pounceZ * dz > 0 && d < 1.8) { pounceX = -pounceX; pounceZ = -pounceZ; }
          dir = dirOf(pounceX, pounceZ); setAct('pounce');
        }
      } else if (act === 'pounce') {
        const k = Math.max(0, 1 - actT / actDur);
        step(ctx, pounceX, pounceZ, 9 * k, dt);
        hop = Math.sin(Math.min(1, actT / actDur) * Math.PI) * 0.18;
        pick = { f: frames.run[dir][Math.floor(actT * 22) % 8], mirror: false };
        if (actT > actDur) { viewDir = dir; setAct('sit'); actDur = 2.5 + rnd() * 2; }
      } else if (act === 'startle') {
        const R = row(9), k = Math.exp(-5 * actT);
        step(ctx, startleX, startleZ, 3.2 * k, dt);
        const i = actT < 0.12 ? 0 : actT < 0.35 ? 1 : actT < 0.7 ? 2 : 3 + (Math.floor((actT - 0.7) * 3) % 2);
        hop = actT < 0.5 ? Math.sin(actT / 0.5 * Math.PI) * 0.22 : 0;
        pick = { f: R[i], mirror: lookingRight !== ROW_FACES_RIGHT[9] };
        if (actT > actDur) { viewDir = dirOf(dx, dz); setAct('sit'); actDur = 2 + rnd() * 2; }
      } else if (act === 'sleep') {
        const R = row(6), i = Math.min(R.length - 1, Math.floor(actT * 2.8));
        breathe = 1 + 0.018 * Math.sin(actT * 2.3);
        pick = { f: R[i], mirror: lookingRight !== ROW_FACES_RIGHT[6] };
      } else if (act === 'wake') {
        const R = row(6), i = Math.max(0, R.length - 1 - Math.floor(actT * 5.5));
        pick = { f: R[i], mirror: lookingRight !== ROW_FACES_RIGHT[6] };
        if (actT > actDur) { viewDir = dirOf(dx, dz); setAct('sit'); actDur = 0.3; }
      }
    }
    finish(ctx, t, dt, hop, breathe, pick);
  }

  function finish(ctx, t, dt, hop, breathe, pick) {
    if (!pick) return;
    const f = pick.f;
    if (!f) return;
    mesh.visible = sh.visible = true;
    if (curFrame !== f) { curFrame = f; mat.map = f.tex; }
    if (pmat) { mat.emissive.copy(pmat.emissive); mat.emissiveIntensity = pmat.emissiveIntensity; mat.color.copy(pmat.color); }
    const K = (ctx.scale || 1) * (0.55 + 0.45 * (1 - Math.pow(1 - appear, 3)));
    const w = f.w / PPU * K, h = f.h / PPU * K * breathe;
    mesh.scale.set(pick.mirror ? -w : w, h, 1);
    mesh.quaternion.copy(ctx.quat);
    right.set(1, 0, 0).applyQuaternion(ctx.quat);
    const bx = pick.mirror ? f.w - f.bx : f.bx;
    const off = (f.w / 2 - bx) / PPU * K;
    const EL = ctx.elev ? ctx.elev(c.x, c.z) : 0;
    mesh.position.set(c.x + right.x * off, (f.by - f.h / 2) / PPU * K * breathe + EL + hop * K, c.z + right.z * off);
    const sleeping = act === 'sleep' || act === 'wake';
    sh.position.set(c.x, 0.035 + EL, c.z);
    sh.scale.set((sleeping ? 1.5 : 1.15) * K, 0.62 * K, 1);
    sh.material.opacity = 0.82 * (ctx.shade == null ? 1 : ctx.shade) * appear * Math.max(0.35, 1 - hop * 2.5);
  }

  return {
    update,
    mesh,
    get state() { return { mode, act, x: c.x, z: c.z, dir, running, sp }; },
  };
}

// soft round shadow under her paws (same look as the player's)
function makeShadow(T) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 64;
  const g = cv.getContext('2d'), gr = g.createRadialGradient(32, 32, 2, 32, 32, 32);
  gr.addColorStop(0, 'rgba(1,3,7,.52)'); gr.addColorStop(0.38, 'rgba(1,3,7,.34)'); gr.addColorStop(0.72, 'rgba(1,3,7,.12)'); gr.addColorStop(1, 'rgba(1,3,7,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new T.Mesh(new T.PlaneGeometry(1.6, 1), new T.MeshBasicMaterial({ map: new T.CanvasTexture(cv), transparent: true, opacity: 0.82, depthWrite: false, fog: true }));
}
