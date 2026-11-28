// ===== DRIFTER — COMPANION ASSETS (Shu) =====
// Loads every frame of the Shu pack and turns each one into a texture + anchor.
//
// Source: assets/companion/SHU_BIMO_8D_animation_asset_pack.zip  (folder inside: SHU_BIMO_sprite_pack/shu/)
//   walk/<dir>/frame_00..07.png   8-direction walk cycle   (144x160 canvas, feet on y=152)
//   run/<dir>/frame_00..07.png    8-direction run cycle    (same canvas)
//   previous_atlas/frames/row_01..09/frame_01..N.png   the hand-drawn poses, cropped individually
//        row 1,2,4,7,8  sitting, turning from back view to front view (5-6 frames)
//        row 3          stretch (6)          row 5  grooming (5)      row 6  curling up to sleep (5)
//        row 9          startled arch (1-3) then crouch (4-5)
//
// Two ways to read it, tried in this order, so nobody has to unzip anything by hand:
//   1. loose PNGs at assets/companion/shu/  or  assets/companion/SHU_BIMO_sprite_pack/shu/
//      (unzip the pack there, or just its shu/ folder, and the game skips the 10 MB zip entirely)
//   2. the zip itself, opened in the browser with JSZip (loaded from cdnjs on demand)
//
// Returns  { walk[dir][0..7], run[dir][0..7], row[1..9][0..n-1] }  where each frame is
//   { tex, w, h, bx, by }   tex = THREE texture, w/h = source px, (bx,by) = foot anchor in source px

export const DIRS = ['up', 'up_right', 'right', 'down_right', 'down', 'down_left', 'left', 'up_left'];
export const ROW_COUNTS = [6, 6, 6, 5, 5, 5, 5, 5, 5]; // frames in previous_atlas rows 1..9
const FOOT_Y = 152;                                      // walk/run canvases: the paws sit on this pixel row

const u = p => new URL('../../assets/companion/' + p, import.meta.url).href;
const LOOSE_BASES = [u('shu/'), u('SHU_BIMO_sprite_pack/shu/')];
const ZIP_URL = u('SHU_BIMO_8D_animation_asset_pack.zip');
const JSZIP_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';

const pad = (n, w) => String(n).padStart(w, '0');
const walkPath = (kind, d, i) => `${kind}/${d}/frame_${pad(i, 2)}.png`;
const rowPath = (r, i) => `previous_atlas/frames/row_${pad(r, 2)}/frame_${pad(i, 2)}.png`;

function imgFromUrl(url) {
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => rej(new Error('missing ' + url));
    im.src = url;
  });
}

function loadScript(src) {
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = () => rej(new Error('could not load ' + src));
    document.head.appendChild(s);
  });
}

// foot anchor for a hand-drawn pose: bottom edge of the opaque pixels, centred on them
function opaqueBox(cv) {
  const w = cv.width, h = cv.height, d = cv.getContext('2d').getImageData(0, 0, w, h).data;
  let x0 = w, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 12) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y > y1) y1 = y; }
  return x1 < 0 ? { cx: w / 2, by: h } : { cx: (x0 + x1 + 1) / 2, by: y1 + 1 };
}

function makeFrame(T, source, fitFeet) {
  const w = source.width, h = source.height, cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(source, 0, 0);
  const tex = new T.CanvasTexture(cv);
  tex.magFilter = tex.minFilter = T.LinearFilter; tex.generateMipmaps = false;
  if (fitFeet) { const b = opaqueBox(cv); return { tex, w, h, bx: b.cx, by: b.by }; }
  return { tex, w, h, bx: w / 2, by: FOOT_Y };
}

export async function loadShuFrames(T, onProgress = () => {}) {
  // every file we need, as [kind, dir/row, index, relative path]
  const jobs = [];
  for (const kind of ['walk', 'run']) DIRS.forEach((d, di) => { for (let i = 0; i < 8; i++) jobs.push({ kind, a: di, i, path: walkPath(kind, d, i) }); });
  ROW_COUNTS.forEach((n, ri) => { for (let i = 1; i <= n; i++) jobs.push({ kind: 'row', a: ri + 1, i: i - 1, path: rowPath(ri + 1, i) }); });

  // pick a source: loose files if they exist, otherwise the zip
  let getSource = null;
  for (const base of LOOSE_BASES) {
    try { await imgFromUrl(base + walkPath('walk', 'down', 0)); getSource = p => imgFromUrl(base + p); break; } catch (e) { /* try next */ }
  }
  if (!getSource) {
    onProgress(0.02, 'Shu: opening the asset pack…');
    if (!window.JSZip) await loadScript(JSZIP_URL);
    const res = await fetch(ZIP_URL);
    if (!res.ok) throw new Error('companion pack not found at ' + ZIP_URL + ' (' + res.status + ')');
    const zip = await window.JSZip.loadAsync(await res.arrayBuffer());
    const hit = Object.keys(zip.files).find(n => n.endsWith('shu/' + walkPath('walk', 'down', 0)));
    if (!hit) throw new Error('companion pack has no shu/walk/down/frame_00.png');
    const root = hit.slice(0, hit.length - walkPath('walk', 'down', 0).length);
    getSource = async p => {
      const f = zip.file(root + p);
      if (!f) throw new Error('missing in pack: ' + root + p);
      return createImageBitmap(await f.async('blob'));
    };
  }

  const out = { walk: DIRS.map(() => []), run: DIRS.map(() => []), row: [null, ...ROW_COUNTS.map(() => [])] };
  let done = 0;
  const CHUNK = 16; // decode a few at a time so the page stays responsive
  for (let k = 0; k < jobs.length; k += CHUNK) {
    await Promise.all(jobs.slice(k, k + CHUNK).map(async j => {
      const f = makeFrame(T, await getSource(j.path), j.kind === 'row');
      if (j.kind === 'row') out.row[j.a][j.i] = f; else out[j.kind][j.a][j.i] = f;
      done++;
    }));
    onProgress(done / jobs.length, 'Shu: ' + done + '/' + jobs.length);
    await new Promise(r => setTimeout(r, 0));
  }
  return out;
}
