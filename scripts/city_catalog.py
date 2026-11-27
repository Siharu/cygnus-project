#!/usr/bin/env python3
"""
city_catalog.py -- measure the city art and (re)write src/station/city_catalog.js.

  python3 scripts/city_catalog.py            (needs: pip install pillow numpy scipy)

The city's ground axes run at 30 degrees on screen; the POI sheet is drawn at about 24, so as it stands fences
stair-step and buildings sit crooked on their lots. For every sprite this works out the 2D correction that brings
its ground lines to exactly 30 degrees while upright lines stay upright:
  buildings, props, corner walls   both ground directions at once (a mild stretch plus shear)
  fences, barriers, the sign       a vertical shear along the one direction they run
city.js applies the correction when it loads the art. The footprints (colliders, lot placement, depth order) and
the fence joints are measured here on the corrected shapes. It also paints the city-limits sign.
"""
import json, math, random
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets/city'
POI = ROOT / 'assets/DRIFTER_POI_Asset_Library_v2/Individual_PNGs'
BUILDINGS = list(range(1, 28)) + [37, 40, 41, 42, 43, 44, 45, 54]
PLANES = {28: 'x', 29: 'x', 30: 'z', 31: 'x', 32: 'z', 33: 'x', 34: 'z', 35: 'x', 36: 'x', 38: 'z', 39: 'x', 75: 'x', 76: 'z'}
POSTS = [28, 29, 30, 31, 34, 38]        # runs that end in a post at each side: joined post to post
CORNERS = [32, 39]                      # walls with a visible depth: corrected like buildings
CUT = {38: .757}                        # loose bracket cut off by city_shade.js (fraction of the width)
ISO = math.tan(math.radians(30))
SHEET = (23.5, 25.5)                    # the sheet's usual ground angles: down-right, up-right


def ground_angles(arr):
    """Angles of the straight edges running down-right and up-right (degrees), from the gradient directions."""
    a = arr.astype(float)
    g = ndimage.gaussian_filter((a[..., 0] * .3 + a[..., 1] * .59 + a[..., 2] * .11) * a[..., 3] / 255, .8)
    gx, gy = ndimage.sobel(g, 1), ndimage.sobel(g, 0)
    th = (np.degrees(np.arctan2(gy, gx)) + 180) % 180 - 90
    j11, j22, j12 = (ndimage.gaussian_filter(v, 2) for v in (gx * gx, gy * gy, gx * gy))
    coh = np.sqrt((j11 - j22) ** 2 + 4 * j12 ** 2) / (j11 + j22 + 1e-6)
    h, _ = np.histogram(th.ravel(), bins=180, range=(-90, 90), weights=(np.hypot(gx, gy) * np.clip(coh - .5, 0, None) ** 2).ravel())
    h = ndimage.gaussian_filter1d(h, 2.0, mode='wrap')

    def peak(lo, hi):
        i = int(np.argmax(h[lo + 90:hi + 90])) + lo + 90
        y0, y1, y2 = h[i - 1], h[i], h[i + 1]
        return i + .5 - 90 + (.5 * (y0 - y2) / (y0 - 2 * y1 + y2) if y0 - 2 * y1 + y2 else 0)
    return peak(6, 52), -peak(-52, -6)


def both_ways(a1, a2):
    """x' = s*x, y' = c*x + k*y: takes ground lines at +a1 / -a2 degrees to +30 / -30."""
    m1, m2 = math.tan(math.radians(a1)), -math.tan(math.radians(a2))
    r = 2 * ISO / (m1 - m2)
    s, k = r ** -.5, r ** .5
    return s, -k * (m1 + m2) / 2, k


def posts(a):
    """Feet of the two end posts of a fence."""
    cols = np.nonzero((a > 128).sum(axis=0) > 3)[0]
    x0, x1 = cols.min(), cols.max()
    feet = []
    for lo, hi in ((x0, x0 + (x1 - x0) * .14), (x1 - (x1 - x0) * .14, x1)):
        band = [c for c in cols if lo <= c <= hi]
        tall = np.array([(a[:, c] > 128).sum() for c in band])
        post = [c for c, t in zip(band, tall) if t >= tall.max() * .85]      # the post itself, not the grass
        feet.append((float(np.mean(post)), float(np.percentile([np.nonzero(a[:, c] > 128)[0].max() for c in post], 60))))
    return feet


def warp(im, s, c, k):
    """Apply the correction and trim. Returns the image and the canvas transform [a, b, d, e, f] city.js uses."""
    w, h = im.size
    f = -min(0.0, c * w)
    big = (int(math.ceil(s * w)) + 1, int(math.ceil(abs(c) * w + k * h)) + 1)
    out = im.transform(big, Image.AFFINE, (1 / s, 0, 0, -c / (k * s), 1 / k, -f / k), Image.BILINEAR)
    x0, y0, x1, y1 = out.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
    return out.crop((x0, y0, x1, y1)), [round(s, 5), round(c, 5), round(k, 5), -x0, round(f - y0, 3)]


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
    paint_sign()
    cat = {}
    for i in range(1, 79):
        im = Image.open(OUT / 'sign_unknown.png' if i == 33 else POI / ('SRC-%03d_MasterSheetA_Extract.png' % i)).convert('RGBA')
        w, h = im.size
        if i in CUT:
            im.paste((0, 0, 0, 0), (int(CUT[i] * w), 0, w, h))
        arr = np.array(im)
        a1, a2 = ground_angles(arr)
        feet = None
        if i in PLANES and i not in CORNERS:
            along_x = PLANES[i] == 'x'
            if i in POSTS:
                feet = posts(arr[..., 3])
                m = (feet[1][1] - feet[0][1]) / (feet[1][0] - feet[0][0])
            else:
                deg = a1 if along_x else a2
                deg = deg if 15 <= deg <= 30 else SHEET[0 if along_x else 1]
                m = math.tan(math.radians(deg)) * (1 if along_x else -1)
            s, c, k = 1.0, (ISO if along_x else -ISO) - m, 1.0
        else:
            if i in BUILDINGS or i in CORNERS:
                a1 = a1 if 19 <= a1 <= 30 else SHEET[0]
                a2 = a2 if 19 <= a2 <= 30 else SHEET[1]
            else:
                a1, a2 = SHEET
            s, c, k = both_ways(a1, a2)
        out, t = warp(im, s, c, k)
        e = dict(w=w, h=h, W=out.width, H=out.height, t=t)
        if i in BUILDINGS:
            e.update(footprint(np.array(out)[..., 3]))
        if i in PLANES:
            sign = 1 if PLANES[i] == 'x' else -1
            if feet:                                                       # post feet, after the correction
                p = [(s * x + t[3], c * x + k * y + t[4]) for x, y in feet]
                mid = ((p[0][0] + p[1][0]) / 2, (p[0][1] + p[1][1]) / 2)
                run = p[1][0] - p[0][0]
            else:                                                          # ground line under the whole piece
                al = np.array(out)[..., 3]
                cols = np.nonzero((al > 128).any(axis=0))[0]
                inner = cols[len(cols) // 10:-len(cols) // 10]
                low = np.array([np.nonzero(al[:, x] > 128)[0].max() for x in inner])
                x = out.width / 2
                mid = (x, float(np.percentile(low - sign * ISO * (inner - x), 70)))
                run = (cols.max() - cols.min()) * .94
            e.update(axis=PLANES[i], px=round(float(mid[0]), 2), py=round(float(mid[1]), 2), run=round(float(run), 2))
        cat['p%d' % i] = e
    body = ',\n'.join('  %s: %s' % (k, json.dumps(v, separators=(',', ':'))) for k, v in cat.items())
    (ROOT / 'src/station/city_catalog.js').write_text(
        '// GENERATED by scripts/city_catalog.py -- do not edit by hand.\nexport const CAT = {\n' + body + '\n};\n')
    print('wrote', len(cat), 'entries')


if __name__ == '__main__':
    main()
