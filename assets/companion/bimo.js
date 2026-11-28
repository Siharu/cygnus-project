// ===== DRIFTER — BIMO, THE SCOUT DOG =====
// Bimo ranges a little ahead of the player, checks back, and investigates the ground.
// He uses all eight directional movement sets plus the original eight-row pose atlas:
//   row 1 look/turn · row 2 side walk · row 3 side run · row 4 excited alert/bound
//   row 5 lie-down / stand-up transition · row 6 sniff · row 7 sit · row 8 lie down
//
// API: const BIMO = await createBimo({ T, sc, pmat })
//      BIMO.update(t, dt, ctx) once per frame after player movement
//      BIMO.pet(P) when the player interacts nearby
//
// Scale is derived from visible alpha bounds, not transparent 224x176 canvases. The
// directional frames are normalized per direction to the standing reference height,
// so Bimo stays the same size when turning, running, sniffing, sitting or lying down.

import { loadBimoFrames } from './bimo_assets.js';

const BODY_HEIGHT = 1.18;       // target visible body height in world units; larger than Shu
const COLLISION_RADIUS = 0.42;
const SCOUT_LEAD = 2.0;
const IDLE_GAP = 1.55;
const MAX_SPEED = 7.8;
const RUN_ON = 5.0, RUN_OFF = 4.2;

const directions = ['up', 'up_right', 'right', 'down_right', 'down', 'down_left', 'left', 'up_left'];
const dirOf = (dx, dz) => {
  const sx = dx - dz, sy = -(dx + dz) * 0.577;
  return (Math.round(Math.atan2(sx, sy) / (Math.PI / 4)) + 8) % 8;
};
const median = values => {
  const a = values.filter(Number.isFinite).sort((x, y) => x - y);
  return a.length ? a[Math.floor(a.length / 2)] : 1;
};

export async function createBimo(opts) {
  const frames = await loadBimoFrames(opts.T, opts.onProgress);
  return createBimoActor({ ...opts, frames });
}

export function createBimoActor({ T, sc, pmat, frames, rnd = Math.random }) {
  const blank = document.createElement('canvas');
  blank.width = blank.height = 1;
  const blankTexture = new T.CanvasTexture(blank);
  blankTexture.magFilter = blankTexture.minFilter = T.NearestFilter;

  const material = new T.MeshLambertMaterial({
    map: blankTexture,
    color: 0xffffff,
    emissive: 0x1c1814,
    emissiveIntensity: 0.55,
    alphaTest: 0.48,
    transparent: false,
    depthWrite: true,
    side: T.DoubleSide,
    fog: false
  });
  const mesh = new T.Mesh(new T.PlaneGeometry(1, 1), material);
  mesh.frustumCulled = false;
  mesh.renderOrder = 2;
  mesh.visible = false;

  const shadow = makeShadow(T);
  shadow.rotation.x = -Math.PI / 2;
  shadow.renderOrder = 1;
  shadow.visible = false;
  sc.add(shadow, mesh);

  // Use an upright front-facing source pose as the atlas reference. For the generated
  // directional sheets, compute one scale per direction from the median walk silhouette
  // and reuse it for run, preventing zoom/popping on direction or gait changes.
  const reference = frames.row[1][5] || frames.row[1][0] || frames.walk[4][0];
  const rowUnit = BODY_HEIGHT / Math.max(1, reference.boxH);
  const moveUnits = directions.map((_, di) =>
    BODY_HEIGHT / Math.max(1, median(frames.walk[di].map(f => f.boxH)))
  );

  const c = { x: 0, z: 0 };
  const tmp = { x: 0, z: 0 };
  const right = new T.Vector3();
  let mode = 'idle', act = 'look', actT = 0, actDur = 2.1;
  let dir = 4, phase = 0, speed = 0, running = false;
  let headingX = 0, headingZ = 1;
  let placed = false, zone = null, appear = 0;
  let blockedT = 0, stuckT = 0, detour = null, detourSign = 1;
  let swingSeen = false, lastAct = 'look', currentFrame = null;
  let idleClock = 0;
  let targetX = 0, targetZ = 0, burstX = 1, burstZ = -1;

  function setAct(next, duration) {
    mode = 'idle';
    act = next;
    actT = 0;
    if (duration != null) actDur = duration;
    else if (next === 'look') actDur = 1.8 + rnd() * 1.2;
    else if (next === 'sniff') actDur = 2.4 + rnd() * 1.4;
    else if (next === 'sit') actDur = 3.0 + rnd() * 2.5;
    else if (next === 'down') actDur = 1e9;
    else if (next === 'settle' || next === 'wake') actDur = 0.9;
    else if (next === 'alert') actDur = 0.72;
    else if (next === 'trot') actDur = 1.35 + rnd() * 0.45;
    else if (next === 'burst') actDur = 1.25;
    if (next === 'burst') { const sign = rnd() < .5 ? -1 : 1; burstX = sign; burstZ = -sign; dir = sign > 0 ? 2 : 6; }
    if (next !== 'look') lastAct = next;
  }

  function place(ctx) {
    const P = ctx.P;
    const candidates = [
      [-2.2, 1.7], [2.4, 1.8], [-2.5, -1.8], [2.7, -1.6],
      [-3.2, 0.4], [3.1, 0.2], [-1.0, 2.8], [1.0, -2.8]
    ];
    let best = null;
    for (const [ox, oz] of candidates) {
      tmp.x = P.x + ox;
      tmp.z = P.z + oz;
      const bx = tmp.x, bz = tmp.z;
      ctx.col(tmp, COLLISION_RADIUS);
      ctx.clamp(tmp);
      if (Math.hypot(tmp.x - bx, tmp.z - bz) < 0.08) {
        best = { x: tmp.x, z: tmp.z };
        break;
      }
    }
    if (!best) {
      tmp.x = P.x - 2.2;
      tmp.z = P.z + 1.7;
      ctx.col(tmp, COLLISION_RADIUS);
      ctx.clamp(tmp);
      best = { x: tmp.x, z: tmp.z };
    }
    c.x = best.x;
    c.z = best.z;
    speed = 0;
    detour = null;
    blockedT = stuckT = 0;
    headingX = 0;
    headingZ = 1;
    dir = dirOf(headingX, headingZ);
    setAct('look', 1.2);
    appear = 0;
    placed = true;
  }

  function step(ctx, ux, uz, dt) {
    tmp.x = c.x + ux * speed * dt;
    tmp.z = c.z + uz * speed * dt;
    ctx.col(tmp, COLLISION_RADIUS);
    ctx.clamp(tmp);
    const mx = tmp.x - c.x, mz = tmp.z - c.z;
    c.x = tmp.x;
    c.z = tmp.z;
    return mx * ux + mz * uz;
  }

  function chooseDetour(ctx, ux, uz) {
    let best = null, score = -1;
    for (const degrees of [50, -50, 95, -95, 140, -140]) {
      const a = degrees * Math.PI / 180, cs = Math.cos(a), sn = Math.sin(a);
      const vx = ux * cs - uz * sn, vz = ux * sn + uz * cs;
      tmp.x = c.x + vx * 1.1;
      tmp.z = c.z + vz * 1.1;
      ctx.col(tmp, COLLISION_RADIUS);
      ctx.clamp(tmp);
      const s = (tmp.x - c.x) * vx + (tmp.z - c.z) * vz + (Math.sign(degrees) === detourSign ? 0.04 : 0);
      if (s > score) { score = s; best = a; }
    }
    detourSign = best >= 0 ? 1 : -1;
    return { a: best, t: 0.62 };
  }

  function pet(P) {
    const dx = P.x - c.x, dz = P.z - c.z;
    if (Math.hypot(dx, dz) > 2.5) return false;
    dir = dirOf(dx, dz);
    setAct('sit', 4.2);
    idleClock = 0;
    detour = null;
    speed = 0;
    running = false;
    return true;
  }

  function nextIdle(ctx) {
    idleClock = 0;
    const r = rnd();
    let next = r < 0.34 ? 'sniff' : r < 0.55 ? 'look' : r < 0.73 ? 'sit' : r < 0.9 ? 'trot' : 'burst';
    if (next === lastAct && next !== 'look') next = 'look';
    setAct(next);
  }

  function update(t, dt, ctx) {
    dt = Math.min(dt, 0.05);
    if (!(dt > 0)) return;
    const P = ctx.P;
    if (!placed || ctx.zone !== zone) {
      zone = ctx.zone;
      place(ctx);
    }

    const playerSpeed = Math.hypot(P.vx || 0, P.vz || 0);
    const playerMoving = ctx.mv > 0.45;
    if (playerSpeed > 0.25) {
      headingX = P.vx / playerSpeed;
      headingZ = P.vz / playerSpeed;
    }
    const perpX = -headingZ, perpZ = headingX;

    // Scout slightly ahead and to one side while the player travels. When the player
    // stops, Bimo circles back to a nearby side position and checks the ground.
    const lead = playerMoving ? (ctx.playerRun ? SCOUT_LEAD + 0.7 : SCOUT_LEAD) : -0.75;
    const side = playerMoving ? 0.85 : 1.35;
    targetX = P.x + headingX * lead + perpX * side;
    targetZ = P.z + headingZ * lead + perpZ * side;
    tmp.x = targetX;
    tmp.z = targetZ;
    ctx.col(tmp, COLLISION_RADIUS);
    ctx.clamp(tmp);
    targetX = tmp.x;
    targetZ = tmp.z;

    let dx = targetX - c.x, dz = targetZ - c.z;
    let d = Math.hypot(dx, dz);
    const playerDistance = Math.hypot(P.x - c.x, P.z - c.z);
    if (!playerMoving && playerDistance > 0.3) dir = dirOf(P.x - c.x, P.z - c.z);
    const sideMirror = dir === 5 || dir === 6 || dir === 7;
    if (playerDistance > 20 || d > 18) {
      place(ctx);
      dx = targetX - c.x;
      dz = targetZ - c.z;
      d = Math.hypot(dx, dz);
    }

    appear = Math.min(1, appear + dt / 0.4);
    idleClock += dt;
    if (ctx.swing && !swingSeen) {
      swingSeen = true;
      if (playerDistance < 5 && act !== 'alert') setAct('alert');
    }
    if (!ctx.swing) swingSeen = false;

    // Resting means settle through the lowering sequence and lie down; moving again
    // plays that sequence backwards before Bimo resumes scouting.
    if (ctx.resting && act !== 'down' && act !== 'settle') setAct('settle');
    if (!ctx.resting && (act === 'down' || act === 'settle') && playerMoving) setAct('wake');

    const wantsMove = playerMoving
      ? d > 1.05
      : d > IDLE_GAP;

    let hop = 0, breathe = 1, pick = null;
    if (wantsMove && (!ctx.resting) && act !== 'alert' && act !== 'wake' && act !== 'settle' && act !== 'burst') {
      mode = 'move';
      idleClock = 0;
      const ux0 = d > 1e-4 ? dx / d : 0;
      const uz0 = d > 1e-4 ? dz / d : 0;
      const wantedSpeed = Math.max(0, Math.min(MAX_SPEED, (d - 0.72) * 2.25));
      speed += (wantedSpeed - speed) * Math.min(1, dt * 6.5);

      let ux = ux0, uz = uz0;
      if (detour) {
        const cs = Math.cos(detour.a), sn = Math.sin(detour.a);
        ux = ux0 * cs - uz0 * sn;
        uz = ux0 * sn + uz0 * cs;
        detour.t -= dt;
        if (detour.t <= 0) detour = null;
      }
      const got = step(ctx, ux, uz, dt);
      if (speed > 1.4 && got < speed * dt * 0.42) blockedT += dt;
      else blockedT = Math.max(0, blockedT - dt * 2);
      if (blockedT > 0.14 && !detour) {
        detour = chooseDetour(ctx, ux0, uz0);
        blockedT = 0.05;
      }
      stuckT = blockedT > 0.05 && playerDistance > 5 ? stuckT + dt : Math.max(0, stuckT - dt);
      if (stuckT > 2.6) {
        place(ctx);
        return finish(ctx, t, dt, 0, 1, null);
      }

      if (speed > 0.35) {
        headingX += (ux - headingX) * Math.min(1, dt * 9);
        headingZ += (uz - headingZ) * Math.min(1, dt * 9);
        dir = dirOf(headingX, headingZ);
      }
      if (!running && (ctx.playerRun || speed > RUN_ON)) running = true;
      else if (running && !ctx.playerRun && speed < RUN_OFF) running = false;
      phase += dt * (running ? 14 : 10);

      // All eight direction folders are used for both gaits, including left/right.
      // The original profile atlas rows are preserved for their separate trot/burst behaviours.
      const set = running ? frames.run : frames.walk;
      pick = { f: set[dir][Math.floor(phase) % 8], mirror: false, unit: moveUnits[dir] };
      hop = Math.abs(Math.sin(phase * Math.PI / 4)) * (running ? 0.035 : 0.018);
    } else {
      mode = 'idle';
      speed = 0;
      if (act !== 'alert') {
        if (ctx.resting) {
          if (act === 'settle' && actT > actDur) setAct('down');
          else if (act === 'down') {
            actT += dt;
            const down = frames.row[8];
            pick = { f: down[Math.floor(actT * 1.4) % down.length], mirror: sideMirror, unit: rowUnit };
            breathe = 1 + 0.012 * Math.sin(actT * 2.1);
          } else if (act === 'settle') {
            actT += dt;
            const R = frames.row[5];
            pick = { f: R[Math.min(R.length - 1, Math.floor(actT / actDur * R.length))], mirror: dir === 5 || dir === 6 || dir === 7, unit: rowUnit };
          }
        } else if (act === 'wake') {
          actT += dt;
          const R = frames.row[5];
          pick = { f: R[Math.max(0, R.length - 1 - Math.floor(actT / actDur * R.length))], mirror: sideMirror, unit: rowUnit };
          if (actT > actDur) { setAct('look', 0.4); }
        } else if (act === 'alert') {
          actT += dt;
          const R = frames.row[4];
          pick = { f: R[Math.min(R.length - 1, Math.floor(actT / actDur * R.length))], mirror: false, unit: rowUnit };
          if (actT > actDur) nextIdle(ctx);
        } else if (act === 'look') {
          actT += dt;
          const R = frames.row[1];
          pick = { f: R[Math.min(R.length - 1, Math.floor(actT / actDur * R.length))], mirror: false, unit: rowUnit };
          if (actT > actDur) nextIdle(ctx);
        } else if (act === 'sniff') {
          actT += dt;
          const R = frames.row[6];
          pick = { f: R[Math.min(R.length - 1, Math.floor(actT * 2.1))], mirror: dir === 5 || dir === 6 || dir === 7, unit: rowUnit };
          if (actT > actDur) nextIdle(ctx);
        } else if (act === 'sit') {
          actT += dt;
          const R = frames.row[7];
          pick = { f: R[Math.floor(actT * 1.5) % R.length], mirror: dir === 5 || dir === 6 || dir === 7, unit: rowUnit };
          if (actT > actDur) nextIdle(ctx);
        } else if (act === 'trot') {
          actT += dt;
          // Use all six original side-walk poses, including the final front-facing check-in.
          const R = frames.row[2];
          const i = Math.min(R.length - 1, Math.floor(actT / actDur * R.length));
          pick = { f: R[i], mirror: sideMirror, unit: rowUnit };
          if (actT > actDur) nextIdle(ctx);
        } else if (act === 'burst') {
          actT += dt;
          // Short playful scout dash using all six original profile-run poses.
          speed = 2.1 * Math.max(0, 1 - actT / actDur);
          dir = burstX > 0 ? 2 : 6;
          step(ctx, burstX, burstZ, dt);
          const R = frames.row[3];
          const i = Math.min(R.length - 1, Math.floor(actT / actDur * R.length));
          pick = { f: R[i], mirror: burstX < 0, unit: rowUnit };
          hop = Math.sin(Math.min(1, actT / actDur) * Math.PI) * .055;
          if (actT > actDur) nextIdle(ctx);
        }
      }
      if (!pick && !ctx.resting && act !== 'alert') {
        if (act === 'down') setAct('wake');
        else if (act === 'settle') setAct('look', 0.35);
        else if (!['wake','look','sniff','sit','trot'].includes(act)) setAct('look');
      }
    }

    if (act === 'alert' && !pick) {
      actT += dt;
      const R = frames.row[4];
      pick = { f: R[Math.min(R.length - 1, Math.floor(actT / actDur * R.length))], mirror: sideMirror, unit: rowUnit };
      if (actT > actDur) nextIdle(ctx);
    }

    finish(ctx, t, dt, hop, breathe, pick);
  }

  function finish(ctx, t, dt, hop, breathe, pick) {
    if (!pick || !pick.f) return;
    const f = pick.f;
    if (!mesh.visible) mesh.visible = shadow.visible = true;
    if (currentFrame !== f) {
      currentFrame = f;
      material.map = f.tex;
    }
    if (pmat) {
      material.emissive.copy(pmat.emissive);
      material.emissiveIntensity = pmat.emissiveIntensity;
      material.color.copy(pmat.color);
    }

    const K = (ctx.scale || 1) * (0.55 + 0.45 * (1 - Math.pow(1 - appear, 3)));
    const unit = (pick.unit || rowUnit) * K;
    const width = f.w * unit, height = f.h * unit * breathe;
    mesh.scale.set(pick.mirror ? -width : width, height, 1);
    mesh.quaternion.copy(ctx.quat);
    right.set(1, 0, 0).applyQuaternion(ctx.quat);
    const bx = pick.mirror ? f.w - f.bx : f.bx;
    const offset = (f.w / 2 - bx) * unit;
    const elevation = ctx.elev ? ctx.elev(c.x, c.z) : 0;
    mesh.position.set(
      c.x + right.x * offset,
      (f.by - f.h / 2) * unit + elevation + (hop + 0.015) * K,
      c.z + right.z * offset
    );

    shadow.position.set(c.x, 0.035 + elevation, c.z);
    shadow.scale.set(1.55 * K, 0.88 * K, 1);
    shadow.material.opacity = 0.78 * (ctx.shade == null ? 1 : ctx.shade) * appear * Math.max(0.35, 1 - hop * 2);
  }

  return {
    update,
    mesh,
    pet,
    get state() {
      return { mode, act, x: c.x, z: c.z, dir, running, speed, scouting: mode === 'move' };
    }
  };
}

function makeShadow(T) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const g = canvas.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 2, 32, 32, 32);
  grad.addColorStop(0, 'rgba(1,3,7,.54)');
  grad.addColorStop(0.38, 'rgba(1,3,7,.34)');
  grad.addColorStop(0.72, 'rgba(1,3,7,.12)');
  grad.addColorStop(1, 'rgba(1,3,7,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new T.Mesh(
    new T.PlaneGeometry(1, 1),
    new T.MeshBasicMaterial({ map: new T.CanvasTexture(canvas), transparent: true, opacity: 0.78, depthWrite: false, fog: true })
  );
}
