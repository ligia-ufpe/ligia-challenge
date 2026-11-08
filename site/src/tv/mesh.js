// The faint white dotted mesh behind the posts: vertical lines of dots over a
// slowly rolling surface. Lines sway sideways and dots slide along them; where
// they bunch together the mesh brightens, which draws the ridges.
import { clamp01, fbm2, smoothstep } from './noise.js';

const LEVELS = 12;
const MAX_ALPHA = 0.4;

// Plane waves [amplitude, ku, kv, speed, phase]. Sideways sway and lift use
// separate sets so the ridges don't line up with the folds.
const SWAY = [
  [0.5, 3.1, 5.3, 0.15, 0],
  [0.3, -6.7, 4.9, -0.11, 1.3],
  [0.2, 13.9, 9.1, 0.08, 2.1],
  [0.08, 23.7, -17.3, 0.06, 0.4],
];
const LIFT = [
  [0.55, 2.3, 4.1, -0.1, 0.7],
  [0.3, -4.7, 8.6, 0.13, 2.4],
  [0.15, 9.3, 15.2, -0.07, 4.2],
];

// Sum of waves and its derivative along u (sway) or v (lift).
function waves(set, u, v, t, alongU) {
  let value = 0;
  let slope = 0;
  for (const [a, ku, kv, w, ph] of set) {
    const arg = ku * u + kv * v + w * t + ph;
    value += a * Math.sin(arg);
    slope += a * (alongU ? ku : kv) * Math.cos(arg);
  }
  return [value, slope];
}

export function createMesh(canvas) {
  const ctx = canvas.getContext('2d');
  let W = 0;
  let H = 0;
  // Dot positions per alpha level, as x, y pairs, reused every frame. Not a fresh
  // Path2D per level per frame: their geometry lives outside the JS heap, so the
  // garbage collector never felt the pressure and a TV tab grew by ~55 MB/s until
  // Chrome ran out of memory.
  const xy = Array.from({ length: LEVELS }, () => new Float32Array(8192));
  const count = new Int32Array(LEVELS);

  return {
    resize(w, h, dpr) {
      W = w;
      H = h;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },

    draw(t) {
      ctx.clearRect(0, 0, W, H);
      count.fill(0);
      const gap = Math.max(9, H / 86);
      const step = Math.max(3, H / 320);
      const sway = H * 0.045;
      const lift = H * 0.04;
      const dot = Math.max(1, H / 900);

      for (let x0 = -gap * 4; x0 < W + gap * 4; x0 += gap) {
        const u = x0 / H;
        for (let y0 = -lift * 2; y0 < H + lift * 2; y0 += step) {
          const v = y0 / H;
          const [sx, dsx] = waves(SWAY, u, v, t, true);
          const [ly, dly] = waves(LIFT, u, v, t, false);
          // >1 where neighbouring lines / neighbouring dots crowd together
          const crowd = 1 / Math.max(0.3, (1 + (sway / H) * dsx) * (1 - (lift / H) * dly));
          const y = y0 - ly * lift;
          const patch = 0.2 + 0.8 * smoothstep(0.4, 0.7, fbm2(u * 1.1 + t * 0.005, v * 1.1, 29, 2));
          const edge = smoothstep(-0.02, 0.14, y / H) * smoothstep(-0.02, 0.14, 1 - y / H);
          const a = patch * edge * (0.05 + 0.32 * clamp01((crowd - 0.85) * 1.6));
          if (a < 0.004) continue;
          const l = Math.min(LEVELS - 1, ((a / MAX_ALPHA) * LEVELS) | 0);
          let buf = xy[l];
          const i = count[l];
          if (i + 2 > buf.length) {
            buf = new Float32Array(buf.length * 2);
            buf.set(xy[l]);
            xy[l] = buf;
          }
          buf[i] = x0 + sx * sway;
          buf[i + 1] = y;
          count[l] = i + 2;
        }
      }

      ctx.fillStyle = 'rgb(214, 224, 255)';
      for (let l = 0; l < LEVELS; l++) {
        const buf = xy[l];
        const n = count[l];
        if (!n) continue;
        ctx.globalAlpha = ((l + 0.6) / LEVELS) * MAX_ALPHA;
        ctx.beginPath();
        for (let i = 0; i < n; i += 2) ctx.rect(buf[i], buf[i + 1], dot, dot);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
  };
}
