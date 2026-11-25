#!/usr/bin/env python3
"""DRIFTER building-interiors installer.  Run from the repo root:  python3 install_interiors.py

Adds walk-in interiors for the utility shed, maintenance depot, water tower, watchtower, checkpoint
booth and collapsed building, built from the sprite packs in assets/HUB/01_HUB_Archives_interiors/.

  * copies the sprites it uses to assets/game/interior_hub/
  * measures every PNG (size, alpha box, wall direction) and writes src/station/interiors_hub_layout.js
  * writes src/station/interiors_hub.js (the renderer, same sprite-kit approach as interior.js)
  * patches src/station/main.js (idempotent, asserts every edit)

Re-running is safe: layout + renderer are regenerated, the main.js patch is skipped if already applied.
After it runs, nudge anything you like in src/station/interiors_hub_layout.js (x / z / y per item)."""
import sys, re, json, math, shutil, pathlib, subprocess

root = pathlib.Path('.')
MAIN = root / 'src/station/main.js'
if not MAIN.exists():
    sys.exit('run this from the repo root (src/station/main.js not found)')

try:
    from PIL import Image
except ImportError:
    print('installing pillow ...')
    for extra in ([], ['--break-system-packages']):
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', '--quiet', 'pillow'] + extra)
            break
        except subprocess.CalledProcessError:
            pass
    try:
        from PIL import Image
    except ImportError:
        sys.exit('could not import Pillow; run:  pip install pillow')

OUT = root / 'assets/game/interior_hub'
LAY = root / 'src/station/interiors_hub_layout.js'
MOD = root / 'src/station/interiors_hub.js'
T_ = 14 / 3                      # floor tile pitch, same as the relay-tower rooms
FLOOR_W = T_ * math.sqrt(2)      # on-screen width of one floor diamond
MAX_PROP_W = 5.4                 # biggest prop allowed on screen (relay briefing table is 5.4)
VK = .816                        # world-y -> screen-up factor of the game camera


def r2(v): return round(v, 2)


# ----------------------------------------------------------------------------- locating + measuring
def bases(pack):
    return [root / 'assets/HUB/01_HUB_Archives_interiors' / pack,
            root / 'assets/HUB/02_Standalone_Location_Packs' / pack]


def find(pack, group, tok):
    seen = []
    for b in bases(pack):
        d = b / group
        if not d.is_dir():
            continue
        files = sorted(d.glob('*.png'))
        hits = [p for p in files if tok in p.stem.lower()]
        if len(hits) == 1:
            return hits[0]
        if len(hits) > 1:
            sys.exit('ambiguous "%s" in %s: %s' % (tok, d, [p.name for p in hits]))
        seen.append((d, [p.name for p in files]))
    sys.exit('no PNG matching "%s" in %s/%s. looked in: %s' % (tok, pack, group, seen))


def measure(p):
    im = Image.open(p).convert('RGBA')
    w, h = im.size
    a = im.getchannel('A')
    px = a.load()
    TH = 40
    bb = a.point(lambda v: 255 if v > TH else 0).getbbox()
    if not bb:
        sys.exit('empty image: %s' % p)
    x0, y0, x1, y1 = bb
    cw, ch = x1 - x0, y1 - y0
    cx = (x0 + x1) // 2
    ylow = y1 - 1
    for y in range(h - 1, -1, -1):
        if any(px[x, y] > TH for x in range(max(0, cx - 4), min(w, cx + 5))):
            ylow = y
            break
    xs = [x for y in range(y0, min(h, y0 + 8)) for x in range(x0, x1) if px[x, y] > TH]
    o = None
    if xs:
        mean = sum(xs) / len(xs)
        mid = x0 + cw / 2
        if mean > mid + cw * .12:
            o = 'L'      # top edge rises to the right  -> runs along z (left wall)
        elif mean < mid - cw * .12:
            o = 'B'      # top edge falls to the right  -> runs along x (back wall)
    return dict(w=w, h=h, x0=x0, y0=y0, x1=x1, y1=y1, cw=cw, ch=ch, ylow=ylow, orient=o)


# ----------------------------------------------------------------------------- layouts
def P(tok, zone, **kw):
    return dict(tok=tok, zone=zone, **kw)


# zones:  ('BK',xf) stands against the back wall   ('LF',zf) stands against the left wall
#         ('FR',x,z) free-standing                 ('WB',xf,hb) / ('WL',zf,hb) hung on back / left wall, hb = height
#         ('HG',xf,top) hangs from the top at that height
# xf / zf run -1 .. 1 along the wall.  Room origin is the centre; back wall z = -hz, left wall x = -hx.
LOCS = {
    'booth': dict(
        pack='Checkpoint_Booth', name='Checkpoint booth', nx=2, nz=2,
        tint=0xf0e6d2, key=[0xffc880, 1.8, 0, 5, 0], acc=[0xff9a50, 1.0, -2.5, 1.6, 1.5],
        floor='floor_panel',
        back=['right_wall_bulletin', 'right_wall_ajar'], left=['left_wall_service', 'left_wall_service'],
        exit=('back', 1), exit_label='Step outside',
        props=[
            P('guard_desk', ('LF', -0.3), n='Guard desk',
              note='The ledger lists every crossing for six weeks. Today\'s line is in different handwriting.'),
            P('swivel_stool', ('FR', 0.0, -0.4)),
            P('barrier_control', ('BK', -0.05), n='Barrier control',
              note='The lever is stiff. Someone oiled it this week.',
              glow=dict(kind='led', dy=3.0, size=1.6, col=[1.0, 0.25, 0.2], op=.5)),
            P('key_cabinet', ('WB', -0.85, 1.6), n='Key cabinet',
              note='Eight hooks, seven keys. The empty hook\'s tag is still swinging.'),
            P('electric_heater', ('LF', 0.75), n='Electric heater',
              note='The coils are orange. Nobody is here to need it.',
              glow=dict(kind='lantern', dy=.8, size=2.4, col=[1.0, 0.5, 0.2], op=.5)),
            P('field_telephone', ('WL', 0.85, 1.5), n='Field telephone',
              note='The line is open. Static, then a voice counting frequencies.',
              glow=dict(kind='lantern', dy=2.4, size=1.8, col=[1.0, 0.7, 0.35], op=.5)),
        ]),
    'wtower': dict(
        pack='Water_Tower_Pump_Room', name='Pump room', nx=2, nz=2,
        tint=0xdfe6ea, key=[0xaacfff, 1.8, 0, 5, 0], acc=[0x66ccff, 0.9, -1, 2, -3],
        floor='floor_grating',
        back=['arched_hatch', 'right_wall_plate'], left=['left_wall_pipe', 'left_wall_pipe'],
        exit=('back', 0), exit_label='Climb out through the hatch',
        props=[
            P('pump_station', ('BK', 0.6), n='Pump station',
              note='Dry, but the gauge needle trembles as if water were moving somewhere above you.'),
            P('vertical_ladder', ('LF', -0.2), n='Vertical ladder',
              note='The rungs are polished by hands. Recent hands.'),
            P('pipe_manifold', ('BK', 0.05)),
            P('inspection_hatch', ('WL', 0.8, 1.8), n='Tank hatch',
              note='Something taps inside the tank. Slow. Even.'),
            P('electrical_panel', ('WB', 0.95, 1.4), n='Electrical panel',
              note='Every breaker is off except one, labelled in marker: RADIO.',
              glow=dict(kind='led', dy=2.6, size=1.4, col=[0.4, 1.0, 0.5], op=.35)),
            P('bucket_and_mop', ('FR', 1.5, 1.4), n='Bucket and mop', note='The mop is wet.'),
        ]),
    'shed': dict(
        pack='Utility_Shed', name='Utility shed', nx=2, nz=2,
        tint=0xf0e4cc, key=[0xffb868, 2.0, 0, 5, 0], acc=[0x88ff99, 0.5, -3, 2, -3],
        floor='floor_panel',
        back=['door_wall', 'right_corrugated'], left=['left_corrugated', 'left_corrugated'],
        exit=('back', 0), exit_label='Step outside',
        props=[
            P('diesel_generator', ('BK', 0.65), n='Diesel generator',
              note='Warm. The tank is nearly full. Someone refuelled it this week.'),
            P('battery_charger', ('BK', 0.05), n='Charger box',
              note='A green light. The radio batteries are on charge.',
              glow=dict(kind='led', dy=1.8, size=1.4, col=[0.4, 1.0, 0.5], op=.4)),
            P('workbench', ('LF', -0.45), n='Workbench',
              note='A thermos, still warm. A lantern turned low.',
              glow=dict(kind='lantern', dy=1.7, size=2.2, col=[1.0, 0.62, 0.25], op=.5)),
            P('tool_board', ('WL', -0.45, 3.2), n='Tool board',
              note='Every tool has an outline. One outline is empty.'),
            P('jerry_can', ('LF', 0.7), n='Jerry cans', note='Two full, three empty. A tally of marks on the rack.'),
            P('cable_drum', ('FR', 1.8, 1.2)),
        ]),
    'depot': dict(
        pack='Maintenance_Depot', name='Maintenance depot', nx=3, nz=2,
        tint=0xe6e6e0, key=[0xffc890, 2.0, 0, 5, 0], acc=[0x9ad0ff, 0.8, 4, 2, -3],
        floor='floor_panel',
        back=['closed_roller', 'raised_roller', 'frosted_cold_corner'], left=['left_wall', 'open_personnel'],
        pillar='hazard_striped',
        exit=('back', 1), exit_label='Leave through the shutter',
        props=[
            P('relay_parts', ('BK', -0.85), n='Relay parts',
              note='Spare tubes, still boxed. Every box is stamped with the same date.'),
            P('frosted_cold_locker', ('BK', 0.75), n='Cold locker', note='Frost on the door. From the inside.'),
            P('tool_chest', ('LF', 0.3), n='Tool chest', note='Drawers labelled in two different hands.'),
            P('tyre_rack', ('LF', -0.5), n='Tyre rack', note='Sized for a vehicle that is not here.'),
            P('engine_on_rolling', ('FR', 1.0, 0.9), n='Engine on stand',
              note='Half rebuilt, parts laid out in order. Whoever worked here meant to come back.'),
            P('engine_hoist', ('FR', -2.6, 1.4), n='Engine hoist',
              note='The chain is wet with oil. The drum beside it is full.'),
        ]),
    'wtch': dict(
        pack='Watchtower', name='Watchtower', nx=2, nz=2,
        tint=0xe8e4da, key=[0xffc070, 1.7, 0, 5, 0], acc=[0x7fa8ff, 0.8, 0, 3, -3],
        floor='floor_panel', floor_at={(1, 0): ('ladder_hatch', None)},
        back=['right_wall_window', 'right_wall_window'], left=['left_wall_slit', 'left_wall_slit'],
        exit=('floor', 1, 0), exit_label='Climb down the ladder',
        props=[
            P('watchers_stool', ('FR', -1.0, 0.6), n='Watcher\'s stool', note='Worn smooth. The seat faces the tree line.'),
            P('tripod_binoculars', ('FR', 0.4, 1.9), n='Binoculars',
              note='Focused on the forest. A note on the lens cap, one word: WAIT.'),
            P('pinned_map', ('WB', -0.6, 1.3), n='Pinned map', note='The same trail is marked in three colours of pencil.'),
            P('searchlight', ('LF', 0.4), n='Searchlight', note='The lens is clean. The bulb is warm.'),
            P('thermos', ('WL', -0.5, 1.4), n='Logbook shelf',
              note='A thermos, a cup, a logbook. The last line: nothing came tonight.',
              glow=dict(kind='lantern', dy=2.4, size=1.6, col=[1.0, 0.65, 0.3], op=.4)),
            P('alarm_bell', ('WB', 0.15, 1.8), n='Alarm bell', note='The rope is frayed. It has been pulled before.'),
        ]),
    'ruin': dict(
        pack='Collapsed_Building', name='Collapsed building', nx=2, nz=2,
        tint=0xe0e6d4, key=[0xcfe0ff, 1.9, 0, 5, 0], acc=[0x99ff99, 0.7, -2, 2, 2],
        floor='floor_cracked', floor_at={(0, 1): ('floor_collapsed', (1.4, 1.4))},
        back=['right_wall_wide', 'left_wall_doorway'], left=['left_wall_broken', 'left_wall_empty_window'],
        pillar='corner_column',
        exit=('back', 1), exit_label='Step outside',
        props=[
            P('overturned_desk', ('BK', -0.55), n='Overturned desk', note='Papers rotted to pulp. One drawer is shut and locked.'),
            P('rusted_bed', ('LF', -0.45), n='Bed frame', note='Vines have woven through the springs.'),
            P('rubble_pile', ('FR', 1.4, 0.9), n='Rubble', note='Concrete, brick, and a slab tilted like a door.'),
            P('dead_tree', ('FR', -0.4, -0.3), n='Dead stump', note='It grew through the floor after the roof fell. The roots point at the mast.'),
            P('cracked_sink', ('WL', 0.3, 0.8), n='Cracked sink', note='The tap drips. The moss beneath it is wet.'),
            P('hanging_vine', ('HG', 0.2, 5.5)),
            P('fallen_roof_beam', ('FR', 2.4, -2.0), grp='Shell'),
        ]),
}

# ----------------------------------------------------------------------------- build
DEFS, HUB, COPY, WARN = {}, {}, {}, []


def build(lid, L):
    pack = L['pack']
    nx, nz = L['nx'], L['nz']
    hx, hz = nx * T_ / 2, nz * T_ / 2
    xs = [-hx + T_ / 2 + i * T_ for i in range(nx)]
    zs = [-hz + T_ / 2 + j * T_ for j in range(nz)]
    A = {}

    def asset(group, tok):
        k = (group, tok)
        if k not in A:
            p = find(pack, group, tok)
            A[k] = dict(path=p, key='%s_%s_%s' % (lid, group[0].lower(), tok), m=measure(p))
        return A[k]

    S = FLOOR_W / asset('Shell', L['floor'])['m']['cw']
    prop_specs = L['props']
    widest = max(asset(sp.get('grp', 'Props'), sp['tok'])['m']['w'] * S for sp in prop_specs)
    pk = min(1.0, MAX_PROP_W / widest)

    def add_def(a, kind, scale):
        m = a['m']; w, h = m['w'], m['h']
        ax = (m['x0'] + m['x1']) / 2 / w
        if kind == 'floor':
            c = 1 - (m['y0'] + .46 * m['ch']) / h
        elif kind == 'wall':
            c = (h - m['ylow'] + .03 * m['ch']) / h
        elif kind == 'top':
            c = 1.0
        else:
            c = (h - m['ylow'] + .2 * m['cw']) / h
        DEFS[a['key']] = dict(w=w, h=h, ax=round(ax, 4), c=round(c, 4), W=round(w * scale, 3))
        COPY[a['key']] = a['path']

    items, solids = [], []

    for j, z in enumerate(zs):
        for i, x in enumerate(xs):
            tok, extra = L['floor'], None
            if (i, j) in L.get('floor_at', {}):
                tok, extra = L['floor_at'][(i, j)]
            a = asset('Shell', tok); add_def(a, 'floor', S)
            it = dict(k=a['key'], x=r2(x), z=r2(z), layer='floor')
            if extra:
                it['solid'] = list(extra); solids.append((x, z, extra[0], extra[1], 'hole'))
            items.append(it)

    def hint(tok, m):
        t = tok.lower()
        if 'left' in t: return 'L'
        if 'right' in t: return 'B'
        return m['orient']

    def wall(tok, slot, x, z):
        a = asset('Shell', tok); add_def(a, 'wall', S)
        o = hint(tok, a['m'])
        it = dict(k=a['key'], x=r2(x), z=r2(z), layer='wall')
        if o and o != slot:
            it['flip'] = True
        items.append(it)

    for i, x in enumerate(xs): wall(L['back'][i], 'B', x, -hz)
    for j, z in enumerate(zs): wall(L['left'][j], 'L', -hx, z)
    if L.get('pillar'):
        a = asset('Shell', L['pillar']); add_def(a, 'prop', S)
        for (x, z) in ((hx, -hz), (-hx, hz)):
            items.append(dict(k=a['key'], x=r2(x), z=r2(z), layer='wall'))

    io, glows = [], []
    for sp in prop_specs:
        grp = sp.get('grp', 'Props'); a = asset(grp, sp['tok']); zn = sp['zone']; kind0 = zn[0]
        kind = {'WB': 'wallart', 'WL': 'wallart', 'HG': 'top'}.get(kind0, 'prop')
        add_def(a, kind, S if grp == 'Shell' else S * pk)
        d = DEFS[a['key']]; W = d['W']; H = W * d['h'] / d['w']
        hs = max(.35, .26 * W)
        it = dict(k=a['key'])
        flip = sp.get('flip')
        if kind0 == 'BK':
            x, z = zn[1] * (hx - 1.2), -hz + hs + .35
        elif kind0 == 'LF':
            x, z = -hx + hs + .35, zn[1] * (hz - 1.2)
            flip = True if flip is None else flip
        elif kind0 == 'FR':
            x, z = zn[1], zn[2]
        elif kind0 in ('WB', 'WL', 'HG'):
            if kind0 == 'WL':
                x, z, slot = -hx + .35, zn[1] * (hz - 1.2), 'L'
            else:
                x, z, slot = zn[1] * (hx - 1.2), -hz + .35, 'B'
            it['y'] = r2((zn[2] if kind0 == 'HG' else zn[2] + d['c'] * H) / VK)
            o = a['m']['orient']
            if flip is None and o and kind0 != 'HG':
                flip = (o != slot)
        else:
            sys.exit('bad zone %r' % (zn,))
        it['x'] = r2(x); it['z'] = r2(z)
        if flip: it['flip'] = True
        if kind0 in ('BK', 'LF', 'FR') and sp.get('solid', True):
            sv = sp.get('solid') if isinstance(sp.get('solid'), tuple) else (r2(hs), r2(hs))
            it['solid'] = list(sv); solids.append((x, z, sv[0], sv[1], sp['tok']))
        items.append(it)
        if sp.get('note'):
            if kind0 in ('WB', 'WL'):
                ix, iz = (x, -hz + 2.0) if kind0 == 'WB' else (-hx + 2.0, z)
            else:
                ix, iz = x + hs * .8, z + hs * .8
            io.append(dict(dx=r2(max(-hx + .8, min(hx - .7, ix))), dz=r2(max(-hz + .8, min(hz - .7, iz))),
                           n=sp['n'], t='n', note=sp['note']))
        g = sp.get('glow')
        if g:
            glows.append([g['kind'], r2(x), r2(z), g['dy'], g['size'], g['col'], g['op']])

    ex = L['exit']
    if ex[0] == 'back': exit_pt = (xs[ex[1]], -hz + 1.5)
    elif ex[0] == 'left': exit_pt = (-hx + 1.5, zs[ex[1]])
    else: exit_pt = (xs[ex[1]], zs[ex[2]])
    spawn = (hx - 1.6, hz - 1.6)

    # sanity: warn about overlapping solids / blocked spawn or exit
    for n_, s in enumerate(solids):
        for t in solids[n_ + 1:]:
            if abs(s[0] - t[0]) < s[2] + t[2] - .3 and abs(s[1] - t[1]) < s[3] + t[3] - .3:
                WARN.append('%s: "%s" and "%s" overlap - nudge one in interiors_hub_layout.js' % (lid, s[4], t[4]))
        for nm, pt in (('spawn', spawn), ('exit', exit_pt)):
            if abs(pt[0] - s[0]) < s[2] and abs(pt[1] - s[1]) < s[3]:
                WARN.append('%s: %s point is inside "%s"' % (lid, nm, s[4]))

    zm = round(max(.5, min(.62, .62 * max(hx, hz) / 7 + .1)), 2)
    HUB[lid] = dict(name=L['name'], icx=r2(.53 * hx), icz=r2(.53 * hz), irx=r2(hx - .1), irz=r2(hz - .1), zm=zm,
                    spawn=[r2(spawn[0]), r2(spawn[1])], exit=[r2(exit_pt[0]), r2(exit_pt[1])], exitLabel=L['exit_label'],
                    tint=L['tint'], key=L['key'], acc=L['acc'], items=items, io=io, glows=glows)
    print('  %-7s %s  %dx%d tiles  scale %.4f  prop scale %.2f  (%d sprites)' % (lid, pack, nx, nz, S, pk, len(items)))


print('building interiors from the HUB packs ...')
for lid, L in LOCS.items():
    build(lid, L)

# ----------------------------------------------------------------------------- write assets + layout
OUT.mkdir(parents=True, exist_ok=True)
for key, src in COPY.items():
    shutil.copyfile(src, OUT / (key + '.png'))


def js(v): return json.dumps(v, separators=(',', ':'))


lines = ['// ===== DRIFTER - BUILDING INTERIOR LAYOUTS (generated by install_interiors.py) =====',
         '// Data only. Safe to hand-edit; re-running the installer regenerates it.',
         '// Coordinates are LOCAL to the interior origin: x runs toward the camera\'s right-down, z toward left-down, y is height.',
         '// item   k = sprite (assets/game/interior_hub/<k>.png)  x,z[,y]  flip = mirror  layer = floor|wall  solid = [rx, rz] collision',
         '// glows  [kind, x, z, y, size, [r,g,b], opacity]   kind: lantern | mon | led',
         'export const HUB = {', ' DEFS: {']
lines += ['  %s: %s,' % (js(k), js(v)) for k, v in DEFS.items()]
lines += [' },', ' ROOMS: {']
for lid, r in HUB.items():
    lines.append('  %s: {' % js(lid))
    for f in ('name', 'icx', 'icz', 'irx', 'irz', 'zm', 'spawn', 'exit', 'exitLabel', 'tint', 'key', 'acc'):
        lines.append('   %s: %s,' % (f, js(r[f])))
    lines.append('   items: [')
    lines += ['    %s,' % js(i) for i in r['items']]
    lines += ['   ],', '   io: [']
    lines += ['    %s,' % js(i) for i in r['io']]
    lines += ['   ],', '   glows: [']
    lines += ['    %s,' % js(i) for i in r['glows']]
    lines += ['   ],', '  },']
lines += [' },', '};', '']
LAY.write_text('\n'.join(lines))

# ----------------------------------------------------------------------------- renderer module
MOD.write_text(r'''// ===== DRIFTER - BUILDING INTERIORS (shed, depot, water tower, watchtower, booth, collapsed building) =====
// Single cutaway rooms dressed with the HUB sprite packs (assets/game/interior_hub/*.png), same approach as
// interior.js: camera-facing billboards on the game's true-isometric camera. Layout: interiors_hub_layout.js.
//
// API:  const BI = createBuildingInterior(T, sc, IX, IZ, sol)
//   BI.layout(id)  BI.preload(id)  BI.ready(id)  BI.show(id)  BI.hide()  BI.update(t)

import { HUB } from './interiors_hub_layout.js';
const url = k => new URL('../../assets/game/interior_hub/' + k + '.png', import.meta.url).href;

export function createBuildingInterior(T, sc, IX, IZ, sol) {
  const { DEFS, ROOMS } = HUB;
  const loader = new T.TextureLoader();

  // ---------- textures (lazy; a sprite stays hidden until its image has loaded) ----------
  const TX = {};
  const tex = (k, flip, onReady) => {
    const id = k + (flip ? '|f' : '');
    let e = TX[id];
    if (!e) {
      e = TX[id] = { ready: false, cbs: [] };
      e.t = loader.load(url(k), () => { e.ready = true; e.cbs.forEach(f => f()); e.cbs.length = 0; }, undefined,
        () => console.error('interiors_hub: failed to load', k));
      e.t.magFilter = T.LinearFilter; e.t.minFilter = T.LinearMipmapLinearFilter;
      if (flip) { e.t.wrapS = T.RepeatWrapping; e.t.repeat.x = -1; e.t.offset.x = 1; }
    }
    if (onReady) (e.ready ? onReady() : e.cbs.push(onReady));
    return e.t;
  };
  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.35, 'rgba(255,255,255,.35)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new T.CanvasTexture(c);
  })();

  // ---------- rooms (built on first entry) ----------
  const R = {};
  const room = id => R[id] || (R[id] = { g: null, fx: [], sol: [] });
  const key = new T.PointLight(0xffc880, 0, 20, 1.2), acc = new T.PointLight(0x66ff99, 0, 9, 1.2);
  key.position.set(IX, 4.6, IZ); acc.position.set(IX, 2, IZ); sc.add(key, acc);
  let cur = null;

  const mkSprite = (g, it, tint) => {
    const d = DEFS[it.k], W = d.W, H = W * d.h / d.w, flip = !!it.flip;
    const m = new T.SpriteMaterial({ map: tex(it.k, flip), alphaTest: .4, transparent: false, fog: false, color: tint });
    const s = new T.Sprite(m);
    s.scale.set(W, H, 1); s.center.set(flip ? 1 - d.ax : d.ax, d.c);
    s.position.set(it.x, it.y || 0, it.z); s.frustumCulled = false; s.visible = false;
    if (it.layer == 'floor') { m.depthTest = false; m.depthWrite = false; s.renderOrder = -10; }
    tex(it.k, flip, () => { s.visible = true; });
    g.add(s); return s;
  };
  const mkGlow = (g, q) => {
    const [kind, x, z, y, size, c, op] = q;
    const m = new T.SpriteMaterial({ map: glowTex, color: new T.Color(c[0], c[1], c[2]), blending: T.AdditiveBlending, transparent: true, depthWrite: false, opacity: op, fog: false });
    const s = new T.Sprite(m); s.scale.set(size, size, 1); s.position.set(x, y, z); s.frustumCulled = false; g.add(s);
    return { s, m, kind, op, ph: Math.random() * 9 };
  };
  const build = id => {
    const r = ROOMS[id], e = room(id), g = new T.Group();
    g.position.set(IX, 0, IZ); g.visible = false; sc.add(g); e.g = g;
    for (const it of r.items) {
      mkSprite(g, it, r.tint);
      if (it.solid) e.sol.push({ x: IX + it.x, z: IZ + it.z, rx: it.solid[0], rz: it.solid[1] });
    }
    for (const q of r.glows || []) e.fx.push(mkGlow(g, q));
  };
  const setSolids = id => {
    for (let k = sol.length - 1; k >= 0; k--) if (sol[k].interior) sol.splice(k, 1);
    if (id) for (const s of room(id).sol) { s.interior = true; sol.push(s); }
  };

  return {
    layout: id => ROOMS[id],
    preload(id) { for (const it of ROOMS[id].items) tex(it.k, !!it.flip); },
    ready(id) { return ROOMS[id].items.every(it => { const e = TX[it.k + (it.flip ? '|f' : '')]; return e && e.ready; }); },
    show(id) {
      cur = id; if (!room(id).g) build(id);
      for (const k in R) if (R[k].g) R[k].g.visible = k == id;
      const r = ROOMS[id];
      key.color.setHex(r.key[0]); key.intensity = r.key[1]; key.position.set(IX + r.key[2], r.key[3], IZ + r.key[4]);
      acc.color.setHex(r.acc[0]); acc.intensity = r.acc[1]; acc.position.set(IX + r.acc[2], r.acc[3], IZ + r.acc[4]);
      setSolids(id);
    },
    hide() {
      cur = null; for (const k in R) if (R[k].g) R[k].g.visible = false;
      key.intensity = acc.intensity = 0; setSolids(null);
    },
    update(t) {
      if (!cur) return;
      for (const f of room(cur).fx) {
        const k = f.kind;
        f.m.opacity = f.op * (k == 'lantern' ? .82 + .18 * Math.sin(t * 9 + f.ph) * Math.sin(t * 3.7 + f.ph)
          : k == 'mon' ? .8 + .2 * Math.sin(t * 5 + f.ph) * (Math.sin(t * 23 + f.ph) > .94 ? .6 : 1)
          : Math.sin(t * 2.3 + f.ph) > -.2 ? 1 : .35);
      }
    },
  };
}
''')

# ----------------------------------------------------------------------------- patch main.js
GOB = r'''// ---- building interiors (install_interiors.py): shed / depot / water tower / watchtower / booth / ruin
const BDOOR={},BSEEN={};
async function goB(id,q){if(busy)return;busy=true;fd.style.opacity=1;
 if(id)BI.preload(id);
 await sleep(380);
 if(id){const t0=performance.now();while(!BI.ready(id)&&performance.now()-t0<2500)await sleep(60)}
 const out=!id;
 if(out){const b0=BQ,bd=BDOOR[b0]||{x:BLD[b0].x,z:BLD[b0].z+BLD[b0].rz+1.6};
  BI.hide();BQ=null;IN=-1;ICX=ICZ=3.7;IRX=IRZ=6.9;ZM=1;rs();pmat.emissive.setHex(0x1c1814);pmat.emissiveIntensity=.55;pmat.color.setHex(0xffffff);iL.intensity=0;
  P.x=bd.x;P.z=bd.z;cp.x=P.x-BIAS;cp.z=P.z-BIAS;toast('Back outside.')}
 else{const L=BI.layout(id);INT.hide();BI.show(id);BQ=id;IN=9;ICX=L.icx;ICZ=L.icz;IRX=L.irx;IRZ=L.irz;ZM=L.zm;rs();
  pmat.emissive.setHex(0x28221c);pmat.emissiveIntensity=.6;pmat.color.setHex(0xffffff);iL.intensity=.35;
  IOB=L.io.map(e=>Object.assign({x:IX+e.dx,z:IZ+e.dz},e)).concat([{x:IX+L.exit[0],z:IZ+L.exit[1],n:L.exitLabel,t:'x',fn:()=>goB(null)}]);
  P.x=IX+L.spawn[0];P.z=IZ+L.spawn[1];cp.x=IX-ICX;cp.z=IZ-ICZ;
  const first=!BSEEN[id];BSEEN[id]=1;toast(first&&q&&q.note?q.note:L.name)}
 P.vx=P.vz=0;const inn=!out;sc.background.set(inn?0x05070a:FOG);sc.fog.color.set(inn?0x05070a:FOG);
 ff.visible=!inn;for(const m of MIST)m.s.visible=!inn;for(const s of SHAFT)s.s.visible=!inn;
 fd.style.opacity=0;setTimeout(()=>busy=false,350)}
window.__goB=goB;'''

DOORS = r'''// building interiors (install_interiors.py): each building's examine point becomes a door into its interior
{const DR={'Utility shed':['shed','Enter the utility shed'],'Maintenance depot':['depot','Enter the maintenance depot'],'Watchtower':['wtch','Climb into the watchtower'],'Water tower':['wtower','Enter the pump room'],'Collapsed building':['ruin','Step into the collapsed building'],'Checkpoint booth':['booth','Enter the checkpoint booth']};
 for(const q of OB){const d=DR[q.n];if(d){q.t='b';q.b=d[0];q.n=d[1]}}}'''

m = MAIN.read_text()
if 'createBuildingInterior' in m:
    print('main.js already patched')
else:
    def R(a, b):
        global m
        assert m.count(a) == 1, ('edit target not found exactly once', a[:70], m.count(a))
        m = m.replace(a, b)
    R("import { createCheckpoint } from './checkpoint.js';",
      "import { createCheckpoint } from './checkpoint.js';\nimport { createBuildingInterior } from './interiors_hub.js';")
    R("let IN=-1,busy=false,IOB=[];", "let IN=-1,busy=false,IOB=[],ICX=3.7,ICZ=3.7,IRX=6.9,IRZ=6.9,BQ=null;")
    R("const INT=createInterior(T,sc,IX,IZ,sol);",
      "const INT=createInterior(T,sc,IX,IZ,sol);\nconst BI=createBuildingInterior(T,sc,IX,IZ,sol); // src/station/interiors_hub.js")
    R("window.__go=go;", "window.__go=go;\n" + GOB)
    R("if(IN>=0){P.x=Math.max(IX-6.9,Math.min(IX+6.9,P.x));P.z=Math.max(IZ-6.9,Math.min(IZ+6.9,P.z))}",
      "if(IN>=0){P.x=Math.max(IX-IRX,Math.min(IX+IRX,P.x));P.z=Math.max(IZ-IRZ,Math.min(IZ+IRZ,P.z))}")
    R("const tx=IN>=0?IX-3.7:P.x-fz,tz=IN>=0?IZ-3.7:P.z-fz;", "const tx=IN>=0?IX-ICX:P.x-fz,tz=IN>=0?IZ-ICZ:P.z-fz;")
    R("if(near.t=='x'){near.fn();return}",
      "if(near.t=='x'){near.fn();return}if(near.t=='b'){BDOOR[near.b]={x:near.x+.8,z:near.z+.8};goB(near.b,near);return}")
    R("(near.t=='d'||near.t=='g'||near.t=='f'||near.t=='x')?near.n:",
      "(near.t=='d'||near.t=='g'||near.t=='f'||near.t=='x'||near.t=='b')?near.n:")
    R("INT.update(t);if(MAP==1&&FST)FST.update(t);", "INT.update(t);BI.update(t);if(MAP==1&&FST)FST.update(t);")
    R("OB.push({x:TH.x,z:TH.z,n:'Forest trail',t:'f',to:1});",
      "OB.push({x:TH.x,z:TH.z,n:'Forest trail',t:'f',to:1});\n" + DOORS)
    MAIN.write_text(m)
    print('patched src/station/main.js')

print('\nok: %d sprites -> assets/game/interior_hub/, wrote src/station/interiors_hub.js + interiors_hub_layout.js' % len(COPY))
if WARN:
    print('\nlayout notes (cosmetic, nudge x/z in interiors_hub_layout.js):')
    for w in WARN: print('  -', w)
print('\nrun the game, walk up to a building and press E.  (Operator\'s cottage has no per-piece PNGs yet, so it stays outside-only.)')