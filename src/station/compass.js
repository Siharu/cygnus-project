// ===== DRIFTER — FIELD COMPASS + WAYPOINT =====
// A compass button (top left, or N) picks a destination; the needle and an on-screen marker lead there.
// N/E/S/W are true world directions: on the isometric camera, north is up and to the right.
//
// API:  const NAV = createCompass({ T, cam, ctx })
//   ctx.list()        -> [{ id, group, name }] destinations
//   ctx.route(id)     -> { x, z, label, final } next point to walk to (final = the destination itself)
//   ctx.panel(html)   opens the shared panel;  ctx.close()  closes it
//   ctx.isOpen()      true while the compass panel is open
//   ctx.toast(text)
//   NAV.toggle()   NAV.update(P, visible)   NAV.id (current destination or null)

const DIRS = [['N', .866, -.5], ['E', .866, .5], ['S', -.866, .5], ['W', -.866, -.5]];

export function createCompass({ T, cam, ctx }) {
  let id = null, name = '', lastAng = null;
  const hud = document.createElement('div'); hud.id = 'nav-hud'; hud.className = 'hide';
  hud.innerHTML = '<button id="nav-compass" type="button" aria-label="Choose waypoint"><canvas width="48" height="48"></canvas><span>WAYFINDER</span></button>';
  const mark = document.createElement('div'); mark.id = 'wp-mark'; mark.className = 'hide';
  mark.innerHTML = '<b></b><span></span><small></small>';
  document.body.append(hud, mark);
  const btn = hud.firstChild, g = btn.querySelector('canvas').getContext('2d');
  const glyph = mark.querySelector('b'), label = mark.querySelector('span'), distEl = mark.querySelector('small');

  function draw(dx, dy) {                       // dx, dy: screen direction of the needle (y down)
    const ang = Math.round(Math.atan2(dy, dx) * 40) / 40; if (ang === lastAng) return; lastAng = ang;
    g.fillStyle = '#080c10'; g.fillRect(0, 0, 48, 48); g.fillStyle = '#0e151a'; g.fillRect(4, 4, 40, 40);
    g.strokeStyle = '#8b754e'; g.lineWidth = 2; g.strokeRect(2, 2, 44, 44);
    g.font = 'bold 8px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const [c, x, y] of DIRS) { g.fillStyle = c == 'N' ? '#e3b15e' : '#a8997a'; g.fillText(c, 24 + x * 18, 24 + y * 18); }
    g.save(); g.translate(24, 24); g.rotate(ang + Math.PI / 2);
    g.fillStyle = '#d7a24f'; g.beginPath(); g.moveTo(0, -14); g.lineTo(-5, 0); g.lineTo(0, -3); g.lineTo(5, 0); g.closePath(); g.fill();
    g.fillStyle = '#c5d2c5'; g.beginPath(); g.moveTo(-4, 2); g.lineTo(0, 12); g.lineTo(4, 2); g.lineTo(0, 4); g.closePath(); g.fill();
    g.restore(); g.fillStyle = '#111'; g.fillRect(23, 23, 2, 2);
  }
  const north = () => draw(DIRS[0][1], DIRS[0][2]);
  north();

  function toggle() {
    if (ctx.isOpen()) { ctx.close(); return; }
    const items = ctx.list(), groups = [...new Set(items.map(q => q.group))];
    const options = groups.map(gr => '<optgroup label="' + gr + '">' + items.filter(q => q.group == gr).map(q => '<option value="' + q.id + '">' + q.name + '</option>').join('') + '</optgroup>').join('');
    if (!ctx.panel('<div class="hd"><span>FIELD COMPASS</span><button id="wp-close" type="button">×</button></div><div class="wp-panel"><label for="wp-to">WHERE TO, DRIFTER?</label><select id="wp-to">' + options + '</select><div class="wp-actions"><button id="wp-set" type="button">SET WAYPOINT</button><button id="wp-clear" type="button">CLEAR</button></div></div>')) return;
    const $ = k => document.getElementById(k), sel = $('wp-to');
    if (items.some(q => q.id == id)) sel.value = id;
    $('wp-close').onclick = ctx.close;
    $('wp-set').onclick = () => { const q = items.find(q => q.id == sel.value); if (!q) return; id = q.id; name = q.name; ctx.close(); ctx.toast('Waypoint set · ' + name); };
    $('wp-clear').onclick = () => { id = null; ctx.close(); ctx.toast('Waypoint cleared.'); };
  }
  btn.onclick = () => { btn.blur(); toggle(); };

  const a = new T.Vector3(), b = new T.Vector3();
  const clamp = (v, half, size) => Math.max(half + 8, Math.min(size - half - 8, v));
  return {
    toggle,
    get id() { return id; },
    update(P, visible) {
      hud.classList.toggle('hide', !visible.hud);
      const t = id && visible.hud && ctx.route(id);
      if (!t || !visible.mark) { mark.classList.add('hide'); if (!id) north(); return; }
      const d = Math.hypot(t.x - P.x, t.z - P.z);
      if (t.final && d < 2.6) { id = null; mark.classList.add('hide'); north(); ctx.toast('Arrived · ' + name); return; }
      a.set(P.x, .08, P.z).project(cam); b.set(t.x, .08, t.z).project(cam);
      let dx = (b.x - a.x) * innerWidth / 2, dy = (a.y - b.y) * innerHeight / 2;
      if (Math.hypot(dx, dy) < .5) { dx = 0; dy = -1; }
      draw(dx, dy);
      mark.classList.remove('hide');
      label.textContent = t.final ? name : t.label; distEl.textContent = Math.round(d) + 'm';
      const on = Math.abs(b.x) < .85 && Math.abs(b.y) < .8;
      mark.classList.toggle('at', on);
      const hw = mark.offsetWidth / 2, hh = mark.offsetHeight / 2;
      let x, y;
      if (on) { x = (b.x + 1) * innerWidth / 2; y = (1 - b.y) * innerHeight / 2 - hh - 14; glyph.style.transform = 'rotate(180deg)'; }
      else {   // slide along the screen edge, pointing the way; only the arrow turns, the text stays upright
        const ox = (a.x + 1) * innerWidth / 2, oy = (1 - a.y) * innerHeight / 2;
        const k = Math.min((innerWidth / 2 - 40) / Math.abs(dx || 1e-6), (innerHeight / 2 - 60) / Math.abs(dy || 1e-6));
        x = ox + dx * k; y = oy + dy * k; glyph.style.transform = 'rotate(' + (Math.atan2(dy, dx) * 180 / Math.PI + 90) + 'deg)';
      }
      x = clamp(x, hw, innerWidth); y = clamp(y, hh, innerHeight);
      for (const k of ['dc', 'nav-hud', 'st']) {          // keep clear of the HUD text and the compass button
        const r = document.getElementById(k).getBoundingClientRect();
        if (r.width && x + hw > r.left && x - hw < r.right && y + hh > r.top && y - hh < r.bottom) y = r.top < innerHeight / 2 ? r.bottom + hh + 6 : r.top - hh - 6;
      }
      mark.style.left = x + 'px'; mark.style.top = y + 'px';
    },
  };
}
