// ===== DRIFTER — "???" CITY: RETOUCHING THE GENERATED ART =====
// The POI sheet has the usual generated-art faults: gibberish lettering, melted geometry under roofs, pale cut-out
// fringes and loose specks. The source PNGs are left alone; this repaints a copy of each one when the city loads.
// All positions are fractions of the sprite (u across, v down), so mirrored copies follow automatically.
import { CAT } from './city_catalog.js';

// shadow patches: [u, v, radius u, radius v, strength]
export const SHADE = {
  // gibberish lettering
  p9: [[.82, .23, .08, .06, .8], [.27, .62, .15, .04, .75]],
  p10: [[.16, .29, .09, .07, .85], [.27, .35, .09, .07, .85], [.38, .40, .09, .07, .85], [.47, .45, .08, .07, .85],
    [.31, .62, .24, .2, .55]],
  p11: [[.10, .39, .12, .09, .75], [.21, .44, .12, .09, .82], [.32, .485, .12, .11, .9], [.43, .53, .11, .08, .8],
    [.56, .52, .11, .08, .75], [.69, .47, .12, .08, .7], [.83, .42, .12, .08, .7], [.43, .62, .13, .04, .6]],
  p13: [[.16, .41, .09, .11, .72], [.37, .47, .12, .11, .72], [.15, .56, .12, .08, .85], [.27, .60, .12, .08, .85],
    [.39, .645, .11, .08, .85], [.75, .57, .16, .07, .75]],
  p16: [[.14, .50, .11, .08, .78], [.24, .545, .11, .08, .82], [.34, .585, .11, .08, .78]],
  p63: [[.21, .58, .15, .15, .75], [.68, .55, .17, .11, .75]],
  p66: [[.36, .50, .2, .17, .8]],
  p67: [[.48, .36, .44, .32, .45], [.46, .39, .24, .22, .5]],
  p68: [[.70, .55, .24, .3, .65]],
  // melted or floating geometry, mostly in places that would be in shadow anyway
  p18: [[.22, .66, .22, .22, .65]],
  p20: [[.20, .20, .18, .24, .65]],
  p23: [[.62, .63, .3, .25, .65], [.32, .66, .2, .22, .35]],
  p27: [[.34, .62, .11, .28, .8]],
  p42: [[.56, .68, .34, .2, .72]],
  p43: [[.35, .59, .24, .2, .82], [.62, .69, .26, .18, .7]],
  p44: [[.50, .62, .44, .19, .6]],
  p45: [[.70, .62, .28, .18, .72]],
  p46: [[.18, .45, .24, .38, .65]],
  p53: [[.20, .62, .24, .3, .75], [.55, .76, .34, .17, .5]],
  p54: [[.50, .65, .36, .2, .75]],
  p64: [[.45, .64, .34, .22, .62], [.60, .82, .34, .15, .5]],
};
// parts that are cut off outright (loose brackets that join nothing): [u0, v0, u1, v1]
export const CUT = { p34: [[0, 0, .263, 1]], p38: [[.757, 0, 1, 1]] };   // p34: a second, free-standing gate post

// lights that pull the eye off what is wrong: [u, v, size, colour, opacity, flickers]
export const GLARE = {
  p10: [[.30, .52, 3.2, 0xbfd8ff, .35, 1]],
  p11: [[.33, .68, 3.6, 0x9fe8d0, .54, 1], [.74, .66, 2.8, 0x9fe8d0, .35]],
  p13: [[.26, .74, 3, 0xffb060, .61]],
  p16: [[.22, .68, 3.2, 0xff8a50, .64, 1]],
  p43: [[.46, .65, 2.2, 0xffc080, .38]],
  p54: [[.52, .66, 2.4, 0xffb868, .48, 1]],
};

// the correction itself: brings the art's ground lines to the 30 degrees the streets run at
export function straighten(src, k) {
  const m = CAT[k], [s, c, kk, e, f] = m.t, cv = document.createElement('canvas'); cv.width = m.W; cv.height = m.H;
  const g = cv.getContext('2d'); g.imageSmoothingQuality = 'high'; g.setTransform(s, c, 0, kk, e, f); g.drawImage(src, 0, 0); return cv;
}

const INK = '10,10,24';
export function retouch(img, key) {
  const w = img.width, h = img.height, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d'); g.drawImage(img, 0, 0);
  for (const [u0, v0, u1, v1] of CUT[key] || []) g.clearRect(u0 * w, v0 * h, (u1 - u0) * w, (v1 - v0) * h);

  // hard edges, loose specks removed, a dark rim where the pale fringe was
  const d = g.getImageData(0, 0, w, h), a = d.data, n = w * h, solid = new Uint8Array(n);
  for (let i = 0; i < n; i++) solid[i] = a[i * 4 + 3] >= 100 ? 1 : 0;
  const part = new Int32Array(n), size = [0], stack = [];
  for (let i = 0; i < n; i++) {
    if (!solid[i] || part[i]) continue;
    const id = size.length; let count = 0; part[i] = id; stack.push(i);
    while (stack.length) {
      const p = stack.pop(), x = p % w, y = p / w | 0; count++;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {   // bridges one-pixel gaps in thin rails
        const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= w || Y >= h) continue;
        const q = Y * w + X; if (solid[q] && !part[q]) { part[q] = id; stack.push(q); }
      }
    }
    size.push(count);
  }
  const keep = Math.max(...size) * .02;
  for (let i = 0; i < n; i++) if (solid[i] && size[part[i]] < keep) solid[i] = 0;
  for (let i = 0; i < n; i++) {
    const x = i % w, y = i / w | 0;
    if (!solid[i]) { a[i * 4 + 3] = 0; continue; }
    const rim = x === 0 || y === 0 || x === w - 1 || y === h - 1 || !solid[i - 1] || !solid[i + 1] || !solid[i - w] || !solid[i + w];
    if (rim) { a[i * 4] *= .5; a[i * 4 + 1] *= .5; a[i * 4 + 2] *= .58; }
    a[i * 4 + 3] = 255;
  }
  g.putImageData(d, 0, 0);

  // paint only where the sprite already is
  g.globalCompositeOperation = 'source-atop';
  const foot = g.createLinearGradient(0, h * .68, 0, h);          // every foot sinks into its own shadow
  foot.addColorStop(0, 'rgba(' + INK + ',0)'); foot.addColorStop(1, 'rgba(' + INK + ',.52)');
  g.fillStyle = foot; g.fillRect(0, h * .68, w, h * .32);
  for (const [u, v, ru, rv, s] of SHADE[key] || []) {
    g.save(); g.translate(u * w, v * h); g.scale(ru * w, rv * h);
    const r = g.createRadialGradient(0, 0, 0, 0, 0, 1.25);
    r.addColorStop(0, 'rgba(' + INK + ',' + s + ')'); r.addColorStop(.55, 'rgba(' + INK + ',' + (s * .85).toFixed(3) + ')'); r.addColorStop(1, 'rgba(' + INK + ',0)');
    g.fillStyle = r; g.fillRect(-1.25, -1.25, 2.5, 2.5); g.restore();
  }
  return cv;
}
