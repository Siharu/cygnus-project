#!/usr/bin/env python3
"""
city_catalog.py -- measure the city art and (re)write src/station/city_catalog.js.

  python3 scripts/city_catalog.py            (needs: pip install pillow numpy scipy)

For every sprite: pixel size. For buildings: the ground footprint read from the alpha (so colliders and depth
sorting match the art). For fences/walls: the base line (they are drawn as upright world planes). For the six
unused Building Asset Library sprites: a cleaned copy in assets/city/ and the positions of their lit windows.
It also paints the city-limits sign (assets/city/sign_unknown.png).
"""
import json, random
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets/city'
POI = ROOT / 'assets/DRIFTER_POI_Asset_Library_v2/Individual_PNGs'
LIB = {'apartment': '02_two_story_apartment', 'shop': '03_roadside_shop', 'garage': '04_workshop_garage',
       'shed': '05_warehouse_shed', 'clinic': '06_rural_clinic', 'fuel': '07_fuel_station'}
BUILDINGS = list(range(1, 28)) + [37, 40, 41, 42, 43, 44, 45, 54]
PLANES = {28: 'x', 29: 'x', 30: 'z', 31: 'x', 32: 'z', 33: 'x', 34: 'z', 35: 'x', 36: 'x', 38: 'z', 39: 'x', 75: 'x', 76: 'z'}


def footprint(a):
    """Footprint of an isometric sprite: sides a (world x) and b (world z) as a fraction of the sprite width."""
    ys, xs = np.nonzero(a > 128)
    y1 = ys.max()
    low = ys > y1 - (y1 - ys.min()) * .42
    left, right = np.percentile(xs[low], .6), np.percentile(xs[low], 99.4)
    bottom_x = np.median(xs[ys >= y1 - 4])
    W = a.shape[1]
    fr = min(.66, max(.34, (bottom_x - left) / (right - left)))   # share of the screen width on the x side
    span = (right - left) * .9                                     # base art overhangs the walls a little
    return dict(ax=round(float((left + right) / 2 / W), 3), a=round(float(span * fr * 2 ** .5 / W), 3),
                b=round(float(span * (1 - fr) * 2 ** .5 / W), 3), gap=round(float((a.shape[0] - 1 - y1) / a.shape[0]), 3))


def base_line(a):
    cols = np.nonzero((a > 128).any(axis=0))[0]
    bottom = [np.nonzero(a[:, c] > 128)[0].max() for c in cols]
    n = len(cols)
    slope, icpt = np.polyfit(cols[n // 8:-n // 8], bottom[n // 8:-n // 8], 1)
    return int(round(slope * a.shape[1] / 2 + icpt))              # image row of the ground at mid-width


def main_silhouette(im):
    """Drop the stray specks left over from the atlas cut."""
    arr = np.array(im)
    solid = arr[..., 3] > 40
    lab, n = ndimage.label(ndimage.binary_dilation(solid, iterations=2))
    arr[lab != np.argmax(ndimage.sum(solid, lab, range(1, n + 1))) + 1] = 0
    ys, xs = np.nonzero(arr[..., 3] > 8)
    return Image.fromarray(arr[ys.min():ys.max() + 1, xs.min():xs.max() + 1])


def lit_windows(im):
    r, g, b, al = (np.array(im)[..., i].astype(int) for i in range(4))
    warm = (al > 200) & (r > 200) & (g > 120) & (b < 130)
    lab, n = ndimage.label(ndimage.binary_dilation(warm, iterations=3))
    found = sorted(((ndimage.sum(warm, lab, i), i) for i in range(1, n + 1)), reverse=True)[:3]
    out = []
    for area, i in found:
        if area < 12:
            continue
        y, x = ndimage.center_of_mass(lab == i)
        out.append([round(x / im.width, 3), round(y / im.height, 3)])
    return out


def paint_sign():
    """Three question marks, repainted by hand on the rusted billboard (skewed to lie on its face)."""
    im = Image.open(POI / 'SRC-033_MasterSheetA_Extract.png').convert('RGBA')
    glyph = ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..']
    rnd = random.Random(33)
    d = ImageDraw.Draw(im)
    S, x0, y0, slope = 4, 18, 28, .31
    d.polygon([(x0 - 4, y0 - 5), (x0 + 76, y0 + 20), (x0 + 76, y0 + 53), (x0 - 4, y0 + 28)], fill=(34, 26, 30, 255))   # scraped, then primed
    for n in range(3):
        for gy, row in enumerate(glyph):
            for gx, ch in enumerate(row):
                if ch != '#':
                    continue
                for px in range(S):
                    x = x0 + n * 26 + gx * S + px
                    y = y0 + gy * S + int(round((x - x0) * slope))
                    for py in range(S):
                        if rnd.random() > .05:
                            k = rnd.randint(-14, 10)
                            d.point((x, y + py), fill=(226 + k, 214 + k, 182 + k, 255))
    im.save(OUT / 'sign_unknown.png', optimize=True)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    cat = {}
    for i in range(1, 79):
        im = Image.open(POI / ('SRC-%03d_MasterSheetA_Extract.png' % i)).convert('RGBA')
        a = np.array(im)[..., 3]
        e = dict(w=im.width, h=im.height)
        if i in BUILDINGS:
            e.update(footprint(a))
        if i in PLANES:
            e.update(axis=PLANES[i], base=base_line(a))
        cat['p%d' % i] = e
    for key, name in LIB.items():
        im = main_silhouette(Image.open(ROOT / ('assets/DRIFTER_Building_Asset_Library/%s.png' % name)).convert('RGBA'))
        im.save(OUT / (key + '.png'), optimize=True)
        cat[key] = dict(w=im.width, h=im.height, **footprint(np.array(im)[..., 3]), lit=lit_windows(im))
    paint_sign()
    body = ',\n'.join('  %s: %s' % (k, json.dumps(v, separators=(',', ':'))) for k, v in cat.items())
    (ROOT / 'src/station/city_catalog.js').write_text(
        '// GENERATED by scripts/city_catalog.py -- do not edit by hand.\nexport const CAT = {\n' + body + '\n};\n')
    print('wrote', len(cat), 'entries')


if __name__ == '__main__':
    main()
