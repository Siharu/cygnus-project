// ===== DRIFTER — BIMO SCOUT DOG ASSETS =====
// Individual transparent PNGs from the extracted Bimo pack. The original 8-row atlas
// is kept intact under previous_atlas/original_atlas.png; every extracted pose is loaded
// as a separate frame so its own feet and silhouette can be anchored precisely.

export const DIRS = ['up', 'up_right', 'right', 'down_right', 'down', 'down_left', 'left', 'up_left'];
export const ROW_COUNTS = [6, 6, 6, 4, 5, 5, 5, 5];

const ROOT = new URL('../../assets/companion/SHU_BIMO_sprite_pack/bimo/', import.meta.url).href;
const pad = (n, w) => String(n).padStart(w, '0');
const movePath = (kind, dir, i) => kind + '/' + dir + '/frame_' + pad(i, 2) + '.png';
const rowPath = (r, i) => 'previous_atlas/frames/row_' + pad(r, 2) + '/frame_' + pad(i, 2) + '.png';

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Missing Bimo frame: ' + url));
    image.src = url;
  });
}

function alphaBounds(canvas) {
  const width = canvas.width, height = canvas.height;
  const pixels = canvas.getContext('2d').getImageData(0, 0, width, height).data;
  let x0 = width, y0 = height, x1 = -1, y1 = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4 + 3] <= 12) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  if (x1 < 0) return { cx: width / 2, top: 0, bottom: height, width, height };
  return {
    cx: (x0 + x1 + 1) / 2,
    top: y0,
    bottom: y1 + 1,
    width: x1 - x0 + 1,
    height: y1 - y0 + 1
  };
}

function makeFrame(T, source) {
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  const context = canvas.getContext('2d');
  context.imageSmoothingEnabled = false;
  context.drawImage(source, 0, 0);
  const texture = new T.CanvasTexture(canvas);
  texture.magFilter = texture.minFilter = T.NearestFilter;
  texture.generateMipmaps = false;
  const bounds = alphaBounds(canvas);
  return {
    tex: texture,
    w: canvas.width,
    h: canvas.height,
    bx: bounds.cx,
    by: bounds.bottom,
    top: bounds.top,
    boxW: bounds.width,
    boxH: bounds.height
  };
}

export async function loadBimoFrames(T, onProgress = () => {}) {
  const jobs = [];
  for (const kind of ['walk', 'run']) {
    DIRS.forEach((dir, di) => {
      for (let i = 0; i < 8; i++) jobs.push({ kind, group: di, index: i, path: movePath(kind, dir, i) });
    });
  }
  ROW_COUNTS.forEach((count, ri) => {
    for (let i = 0; i < count; i++) jobs.push({ kind: 'row', group: ri + 1, index: i, path: rowPath(ri + 1, i + 1) });
  });

  const frames = {
    walk: DIRS.map(() => []),
    run: DIRS.map(() => []),
    row: [null, ...ROW_COUNTS.map(() => [])]
  };
  let completed = 0;
  const CHUNK = 16;
  onProgress(0, 'Bimo: loading scout-dog frames…');

  for (let start = 0; start < jobs.length; start += CHUNK) {
    await Promise.all(jobs.slice(start, start + CHUNK).map(async job => {
      const source = await loadImage(ROOT + job.path);
      const frame = makeFrame(T, source);
      if (job.kind === 'row') frames.row[job.group].push(frame);
      else frames[job.kind][job.group].push(frame);
      completed++;
    }));
    onProgress(completed / jobs.length, 'Bimo: ' + completed + '/' + jobs.length);
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  // Image loading is concurrent, so sort each row back into the exact numeric order.
  for (const kind of ['walk', 'run']) for (const group of frames[kind]) group.sort((a, b) => a.index - b.index);
  return frames;
}
