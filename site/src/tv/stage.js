// Shared plumbing for the TV artwork: the character grid, glyph/dot batches,
// the noise dissolve that fades scenes in and out, and bucketed drawing.
import { clamp01, fbm2, hash2, smoothstep } from './noise.js';

export const INK = 0;
export const ACCENT = 1;
const COLORS = ['rgb(204, 213, 250)', 'rgb(255, 112, 60)'];
const LEVELS = 24;
const BUCKETS = COLORS.length * LEVELS;
const SOFT = 0.3; // width of the dissolve front, in threshold units
const MIDDOT = 0xb7; // '·', what a cell shows while its glyph materialises
const FONT_FAMILY = `'Geist Mono Variable', ui-monospace, Menlo, monospace`;

// Character grid sized from the screen height (~64 rows), so a 1080p TV
// gets glyphs about as dense as the ASCII in the Instagram posts.
export function measureStage(ctx, W, H) {
  const cellH = Math.max(11, H / 64);
  const fontSize = cellH / 1.18;
  const font = `500 ${fontSize.toFixed(2)}px ${FONT_FAMILY}`;
  ctx.font = font;
  const cellW = ctx.measureText('M').width || fontSize * 0.6;
  return {
    W,
    H,
    cellW,
    cellH,
    fontSize,
    font,
    cols: Math.ceil(W / cellW) + 1,
    rows: Math.ceil(H / cellH) + 1,
  };
}

// Growable struct-of-arrays: x, y (px), k (char code for glyphs, side for
// dots), a (alpha) and c (colour index).
export class Batch {
  constructor(cap = 8192) {
    this.n = 0;
    this.cap = 0;
    this.grow(cap);
  }

  grow(cap) {
    const keep = (Arr, src) => {
      const arr = new Arr(cap);
      if (src) arr.set(src.subarray(0, this.n));
      return arr;
    };
    this.x = keep(Float32Array, this.x);
    this.y = keep(Float32Array, this.y);
    this.k = keep(Float32Array, this.k);
    this.a = keep(Float32Array, this.a);
    this.c = keep(Uint8Array, this.c);
    this.cap = cap;
  }

  push(x, y, k, a, c = INK) {
    if (a <= 0.01) return;
    if (this.n === this.cap) this.grow(this.cap * 2);
    const i = this.n++;
    this.x[i] = x;
    this.y[i] = y;
    this.k[i] = k;
    this.a[i] = a;
    this.c[i] = c;
  }

  clear() {
    this.n = 0;
  }
}

// Per-cell thresholds for the dissolve: low-frequency noise so the reveal
// flows across the art in soft fronts, plus a little grain at the edge.
export function dissolveField(stage, seed) {
  const { cols, rows, cellW, cellH } = stage;
  const field = new Float32Array(cols * rows);
  const sx = 0.05 * (cellW / 10);
  const sy = 0.05 * (cellH / 10);
  let lo = Infinity;
  let hi = -Infinity;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const v = fbm2(x * sx, y * sy, seed, 3);
      field[y * cols + x] = v;
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
  }
  const span = hi - lo || 1;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      field[i] = 0.82 * ((field[i] - lo) / span) + 0.18 * hash2(x, y, seed + 7);
    }
  }
  return field;
}

function cellIndex(stage, x, y) {
  const { cols, rows, cellW, cellH } = stage;
  let gx = Math.floor(x / cellW + 0.25);
  let gy = Math.floor(y / cellH + 0.25);
  if (gx < 0) gx = 0;
  else if (gx >= cols) gx = cols - 1;
  if (gy < 0) gy = 0;
  else if (gy >= rows) gy = rows - 1;
  return gy * cols + gx;
}

// p runs 0 (hidden) → 1 (fully shown). Cells whose threshold is under p
// appear first; each shows a faint middle dot before its glyph resolves.
export function dissolveGlyphs(batch, from, field, stage, p) {
  if (p >= 1) return;
  const reach = p * (1 + SOFT);
  const end = batch.n;
  for (let i = from; i < end; i++) {
    const m = clamp01((reach - field[cellIndex(stage, batch.x[i], batch.y[i])]) / SOFT);
    const a = batch.a[i];
    const glyph = smoothstep(0.45, 1, m);
    const dot = (1 - glyph) * smoothstep(0, 0.4, m) * 0.7;
    batch.a[i] = a * glyph;
    if (dot * a > 0.02) batch.push(batch.x[i], batch.y[i], MIDDOT, a * dot, batch.c[i]);
  }
}

// Halftone dots grow from nothing as the front passes.
export function dissolveDots(batch, from, field, stage, p) {
  if (p >= 1) return;
  const reach = p * (1 + SOFT);
  for (let i = from; i < batch.n; i++) {
    const m = clamp01((reach - field[cellIndex(stage, batch.x[i], batch.y[i])]) / SOFT);
    batch.k[i] *= smoothstep(0, 1, m);
    batch.a[i] *= smoothstep(0, 0.5, m);
  }
}

// Counting sort by (colour, alpha level) so a frame needs ~50 state changes
// instead of one per glyph.
const starts = new Int32Array(BUCKETS + 1);
const cursor = new Int32Array(BUCKETS + 1);
let order = new Int32Array(0);
let keys = new Int16Array(0);

function sortBuckets(batch) {
  const n = batch.n;
  if (order.length < n) {
    order = new Int32Array(n * 2);
    keys = new Int16Array(n * 2);
  }
  starts.fill(0);
  for (let i = 0; i < n; i++) {
    const a = batch.a[i];
    if (a < 0.012 || batch.k[i] <= 0) {
      keys[i] = -1;
      continue;
    }
    const key = batch.c[i] * LEVELS + Math.min(LEVELS - 1, (a * LEVELS) | 0);
    keys[i] = key;
    starts[key + 1]++;
  }
  for (let b = 1; b <= BUCKETS; b++) starts[b] += starts[b - 1];
  cursor.set(starts);
  for (let i = 0; i < n; i++) {
    const key = keys[i];
    if (key >= 0) order[cursor[key]++] = i;
  }
}

const STR = [];
const str = (k) => STR[k] || (STR[k] = String.fromCharCode(k));

export function drawGlyphs(ctx, batch) {
  sortBuckets(batch);
  for (let b = 0; b < BUCKETS; b++) {
    const s = starts[b];
    const e = starts[b + 1];
    if (s === e) continue;
    ctx.globalAlpha = ((b % LEVELS) + 0.6) / LEVELS;
    ctx.fillStyle = COLORS[(b / LEVELS) | 0];
    for (let j = s; j < e; j++) {
      const i = order[j];
      ctx.fillText(str(batch.k[i]), batch.x[i], batch.y[i]);
    }
  }
  ctx.globalAlpha = 1;
}

// Dots are centred squares of side k.
export function drawDots(ctx, batch) {
  sortBuckets(batch);
  for (let b = 0; b < BUCKETS; b++) {
    const s = starts[b];
    const e = starts[b + 1];
    if (s === e) continue;
    ctx.globalAlpha = ((b % LEVELS) + 0.6) / LEVELS;
    ctx.fillStyle = COLORS[(b / LEVELS) | 0];
    ctx.beginPath();
    for (let j = s; j < e; j++) {
      const i = order[j];
      const k = batch.k[i];
      ctx.rect(batch.x[i] - k / 2, batch.y[i] - k / 2, k, k);
    }
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export const code = (ch) => ch.charCodeAt(0);
