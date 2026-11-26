#!/usr/bin/env python3
"""
process_city_assets.py  --  normalise DRIFTER city sprites to one scale.

  python3 process_city_assets.py INPUT_DIR [-o assets/city] [-c city_sizes.json]

Input names:  {class}_{name}[_{facing}].png      class = bld | veh | prop | dec | tile
              facing = sw | se | nw | ne         e.g. bld_foursquare_se.png

For every PNG it:
  1. keys out flat magenta (#FF00FF) if the image has no real transparency
  2. trims to the visible pixels
  3. scales so 1 metre = PPM pixels under the game's true-isometric camera
  4. writes the PNG + city_assets.json (size, pivot = bottom centre, warnings)

Scale uses footprint width, which is identical for all four facings of a building,
so rotated views of one asset always come out the same scale.
Needs:  pip install pillow numpy
"""
import argparse, json, math, re, sys
from pathlib import Path
import numpy as np
from PIL import Image

ELEV = math.radians(35.264)          # camera elevation for offset (22,22,22)
SIN_E, COS_E = math.sin(ELEV), math.cos(ELEV)
NAME_RE = re.compile(r'^(bld|veh|prop|dec|tile)_(.+?)(?:_(sw|se|nw|ne))?$', re.I)


def norm(s):
    return re.sub(r'[^a-z0-9]', '', s.lower())


def key_out_magenta(im, tol=70):
    """Make flat magenta transparent when the image has no real alpha."""
    rgba = np.array(im.convert('RGBA'))
    if rgba[..., 3].min() < 250:      # already has transparency
        return Image.fromarray(rgba), False
    r, g, b = (rgba[..., i].astype(int) for i in range(3))
    dist = np.sqrt((r - 255) ** 2 + g ** 2 + (b - 255) ** 2)
    bg = dist < tol
    if bg.mean() < 0.02:              # no magenta found, leave as is
        return Image.fromarray(rgba), False
    rgba[bg, 3] = 0
    # despill: pull magenta tint off edge pixels
    edge = (~bg) & (dist < tol * 2.2)
    rgba[edge, 0] = np.minimum(rgba[edge, 0], rgba[edge, 1] + 40)
    rgba[edge, 2] = np.minimum(rgba[edge, 2], rgba[edge, 1] + 40)
    # shave 1px halo
    a = Image.fromarray(rgba[..., 3]).filter(__import__('PIL.ImageFilter', fromlist=['x']).MinFilter(3))
    rgba[..., 3] = np.array(a)
    return Image.fromarray(rgba), True


def lookup(table, name):
    n = norm(name)
    best = None
    for k, v in table.items():
        kn = norm(k)
        if n == kn:
            return k, v
        if n.startswith(kn) and (best is None or len(kn) > len(norm(best[0]))):
            best = (k, v)
    return best if best else (None, None)


def expected_px(dims, ppm):
    w, h, d = dims
    wpx = (w + d) / math.sqrt(2) * ppm                 # footprint diamond width
    hpx = COS_E * h * ppm + SIN_E * wpx                # vertical edges + diamond height
    return wpx, hpx


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('input')
    ap.add_argument('-o', '--out', default='assets/city')
    ap.add_argument('-c', '--config', default=str(Path(__file__).with_name('city_sizes.json')))
    ap.add_argument('--tol', type=int, default=70, help='magenta key tolerance')
    ap.add_argument('--ppm', type=float, help='pixels per metre (default from config, 50). Lower = smaller files, softer upscales')
    a = ap.parse_args()

    cfg = json.load(open(a.config))
    ppm = a.ppm or cfg.get('ppm', 50)
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    files = sorted(Path(a.input).rglob('*.png'))
    if not files:
        sys.exit('no PNGs found in ' + a.input)

    manifest, warns = {}, []
    for f in files:
        m = NAME_RE.match(f.stem)
        if not m:
            warns.append(f'{f.name}: name does not match class_name[_facing], skipped'); continue
        cls, name, facing = m.group(1).lower(), m.group(2), (m.group(3) or '').lower()
        im, keyed = key_out_magenta(Image.open(f), a.tol)
        bbox = im.getchannel('A').getbbox()
        if not bbox:
            warns.append(f'{f.name}: fully transparent, skipped'); continue
        im = im.crop(bbox)
        sw, sh = im.size
        notes = ['keyed magenta'] if keyed else []

        if cls in cfg['fixed']:                           # tiles and decals
            t = cfg['fixed'][cls]
            im = Image.open(f).convert('RGBA').resize((t, t), Image.LANCZOS) if cls == 'tile' else im.resize((t, t), Image.LANCZOS)
            scale = None
        else:
            key, dims = lookup(cfg.get(cls, {}), name)
            if not dims:
                warns.append(f'{f.name}: "{name}" not in city_sizes.json [{cls}], copied unscaled')
                im.save(out / f.name); continue
            ewpx, ehpx = expected_px(dims, ppm)
            if ewpx >= 0.5 * ehpx:
                scale, fit = ewpx / sw, 'w'                # fit footprint width
            else:
                scale, fit = ehpx / sh, 'h'                # thin things (poles, signs): fit height
            tw, th = max(1, round(sw * scale)), max(1, round(sh * scale))
            if scale > 1.0:
                notes.append(f'UPSCALED x{scale:.2f} (source too small, will look soft)')
            # proportion check: does the drawing match the real-world proportions + camera?
            drift = (th / tw) / (ehpx / ewpx) - 1
            if fit == 'w' and abs(drift) > 0.18:
                notes.append(f'proportions off {drift:+.0%} vs real size (check camera angle or shape)')
            im = im.resize((tw, th), Image.LANCZOS)

        im.save(out / f'{f.stem}.png')
        manifest[f.stem] = {
            'file': f'{f.stem}.png', 'class': cls, 'name': name, 'facing': facing or None,
            'w': im.size[0], 'h': im.size[1], 'pivot': [im.size[0] // 2, im.size[1]],
            'src': [sw, sh], 'notes': notes,
        }
        flag = '  <-- ' + '; '.join(notes) if any(n.startswith(('UP', 'prop')) for n in notes) else ''
        print(f'{f.name:42s} {sw}x{sh} -> {im.size[0]}x{im.size[1]}{flag}')

    # facing coverage report for buildings and vehicles
    groups = {}
    for k, v in manifest.items():
        if v['class'] in ('bld', 'veh'):
            groups.setdefault((v['class'], v['name']), set()).add(v['facing'])
    for (cls, name), fs in sorted(groups.items()):
        missing = {'sw', 'se', 'nw', 'ne'} - fs
        if missing:
            warns.append(f'{cls}_{name}: missing facings {sorted(missing)}')

    json.dump(manifest, open(out / 'city_assets.json', 'w'), indent=1)
    print(f'\n{len(manifest)} assets -> {out}/   manifest: city_assets.json')
    for w in warns:
        print('WARN', w)


if __name__ == '__main__':
    main()
