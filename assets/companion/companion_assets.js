// ===== DRIFTER — COMPANION ASSETS (Shu) =====
// Loads Shu's individual PNG frames from the extracted companion sprite pack.
// The complete source pack is preserved at assets/companion/SHU_BIMO_sprite_pack/.
// Runtime frames are loaded directly from its shu/ folder; no ZIP fetch or JSZip CDN.
//
//   walk/<dir>/frame_00..07.png   8-direction walk cycle   (144x160 canvas, feet on y=152)
//   run/<dir>/frame_00..07.png    8-direction run cycle    (same canvas)
//   previous_atlas/frames/row_01..09/frame_01..N.png   hand-drawn poses, cropped individually
//
// Returns  { walk[dir][0..7], run[dir][0..7], row[1..9][0..n-1] } where each frame is
//   { tex, w, h, bx, by }   tex = THREE texture, w/h = source px, (bx,by) = foot anchor in source px

export const DIRS = ['up', 'up_right', 'right', 'down_right', 'down', 'down_left', 'left', 'up_left'];
export const ROW_COUNTS = [6, 6, 6, 5, 5, 5, 5, 5, 5]; // frames in previous_atlas rows 1..9

const u = p => new URL('../../assets/companion/' + p, import.meta.url).href;
const SHU_ROOT = u('SHU_BIMO_sprite_pack/shu/');

const pad = (n, w) => String(n).padStart(w, '0');
const walkPath = (kind, d, i) => `${kind}/${d}/frame_${pad(i, 2)}.png`;
const rowPath = (r, i) => `previous_atlas/frames/row_${pad(r, 2)}/frame_${pad(i, 2)}.png`;

function imgFromUrl(url) {
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => rej(new Error('missing companion frame: ' + url));
    im.src = url;
  });
}

function opaqueBox(cv) {
  const w = cv.width, h = cv.height, d = cv.getContext('2d').getImageData(0, 0, w, h).data;
  let x0 = w, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 12) {
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y > y1) y1 = y;
  }
  return x1 < 0 ? { cx: w / 2, by: h } : { cx: (x0 + x1 + 1) / 2, by: y1 + 1 };
}

function makeFrame(T, source) {
  const w = source.width, h = source.height, cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const g = cv.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.drawImage(source, 0, 0);
  const tex = new T.CanvasTexture(cv);
  // Preserve the crisp pixel-art edges of the supplied sprites.\n  tex.magFilter = tex.minFilter = T.NearestFilter;
  tex.generateMipmaps = false;
  // Each pose has slightly different transparent margins. Anchor to its actual
  // opaque feet line and silhouette centre rather than a fixed canvas coordinate.
  const b = opaqueBox(cv);
  return { tex, w, h, bx: b.cx, by: b.by };
}

export async function loadShuFrames(T, onProgress = () => {}) {
  const jobs = [];
  for (const kind of ['walk', 'run']) {
    DIRS.forEach((d, di) => {
      for (let i = 0; i < 8; i++) jobs.push({ kind, a: di, i, path: walkPath(kind, d, i) });
    });
  }
  ROW_COUNTS.forEach((n, ri) => {
    for (let i = 1; i <= n; i++) jobs.push({ kind: 'row', a: ri + 1, i: i - 1, path: rowPath(ri + 1, i) });
  });

  const getSource = path => imgFromUrl(SHU_ROOT + path);
  const out = { walk: DIRS.map(() => []), run: DIRS.map(() => []), row: [null, ...ROW_COUNTS.map(() => [])] };
  let done = 0;
  const CHUNK = 16;
  onProgress(0, 'Shu: loading extracted frames…');
  for (let k = 0; k < jobs.length; k += CHUNK) {
    await Promise.all(jobs.slice(k, k + CHUNK).map(async j => {
      const f = makeFrame(T, await getSource(j.path));
      if (j.kind === 'row') out.row[j.a][j.i] = f;
      else out[j.kind][j.a][j.i] = f;
      done++;
    }));
    onProgress(done / jobs.length, 'Shu: ' + done + '/' + jobs.length);
    await new Promise(r => setTimeout(r, 0));
  }
  return out;
}
