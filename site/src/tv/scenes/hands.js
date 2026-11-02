// "criar": the hands from Michelangelo's Creation of Adam (Sistine Chapel,
// public domain), drawn in heavy ASCII from a masked greyscale crop of the
// fresco (assets/creation-hands.png, made by scripts/tv-hands.py). The hands
// ease a little closer, a soft wave of light runs from God's arm across the gap
// into Adam's, and the gap glows orange.
import handsUrl from '../assets/creation-hands.png';
import { ACCENT, code } from '../stage.js';
import { hash2, smoothstep } from '../noise.js';

const RAMP = '.,:-=+*#%@'.split('').map(code);
const EDGE = [code('.'), code(':')];
const STAR = code('*');
const DOT = code('·');
// Where the fingertips nearly meet, in asset pixels.
const GAP_X = 476;
const GAP_Y = 170;

export default function hands() {
  let img = null;
  let stage;
  let frame;
  let n = 0;
  let X;
  let Y;
  let L;
  let C;
  let U;
  let F;
  let side;
  let gapU = 0.5;

  return {
    name: 'criar',

    load() {
      return new Promise((resolve) => {
        const im = new Image();
        im.onload = () => {
          img = im;
          resolve();
        };
        im.onerror = () => resolve(); // the scene just stays empty
        im.src = handsUrl;
      });
    },

    layout(s, f) {
      stage = s;
      frame = f;
      n = 0;
      if (!img) return;
      const W0 = img.naturalWidth;
      const H0 = img.naturalHeight;
      gapU = GAP_X / W0;
      // Close on the hands; both arms run off the screen edges.
      const k = Math.min((s.W * 0.72) / GAP_X, (s.H * 0.95) / H0);
      const ox = f.cx - GAP_X * k;
      const oy = f.cy - GAP_Y * k;
      const { cellW, cellH, cols, rows } = s;
      const i0 = Math.max(0, Math.floor(ox / cellW));
      const i1 = Math.min(cols, Math.ceil((ox + W0 * k) / cellW));
      const j0 = Math.max(0, Math.floor(oy / cellH));
      const j1 = Math.min(rows, Math.ceil((oy + H0 * k) / cellH));
      const gw = i1 - i0;
      const gh = j1 - j0;
      if (gw <= 0 || gh <= 0) return;

      // Average the picture over each character cell (3×3 samples): brightness and coverage.
      const ss = 3;
      const canvas = document.createElement('canvas');
      canvas.width = gw * ss;
      canvas.height = gh * ss;
      const c = canvas.getContext('2d', { willReadFrequently: true });
      c.setTransform(
        (ss * k) / cellW,
        0,
        0,
        (ss * k) / cellH,
        ((ox - i0 * cellW) * ss) / cellW,
        ((oy - j0 * cellH) * ss) / cellH,
      );
      c.drawImage(img, 0, 0);
      const data = c.getImageData(0, 0, gw * ss, gh * ss).data;

      const cap = gw * gh;
      X = new Float32Array(cap);
      Y = new Float32Array(cap);
      L = new Float32Array(cap);
      C = new Float32Array(cap);
      U = new Float32Array(cap);
      F = new Float32Array(cap);
      side = new Int8Array(cap);
      for (let j = 0; j < gh; j++) {
        for (let i = 0; i < gw; i++) {
          let lum = 0;
          let cov = 0;
          for (let y = 0; y < ss; y++) {
            let p = ((j * ss + y) * gw * ss + i * ss) * 4;
            for (let x = 0; x < ss; x++, p += 4) {
              const a = data[p + 3] / 255;
              lum += (data[p] / 255) * a;
              cov += a;
            }
          }
          if (cov / (ss * ss) < 0.2) continue;
          const sx = (i0 + i + 0.5) * cellW;
          const ax = (sx - ox) / k; // asset x of the cell centre
          // both arms thin out toward their cut ends and the screen edges
          const fade =
            smoothstep(0, s.W * 0.16, sx) *
            smoothstep(0, s.W * 0.16, s.W - sx) *
            smoothstep(0, 110, ax) *
            (1 - smoothstep(W0 - 170, W0 - 15, ax));
          if (fade < 0.02) continue;
          X[n] = (i0 + i) * cellW;
          Y[n] = (j0 + j) * cellH;
          L[n] = lum / cov;
          C[n] = cov / (ss * ss);
          U[n] = ax / W0;
          F[n] = fade;
          side[n] = ax < GAP_X ? -1 : 1;
          n++;
        }
      }
    },

    underlay(ctx, t, p) {
      const glow = p * (0.45 + 0.55 * smoothstep(0, 16, t));
      const r = stage.cellW * 10;
      const g = ctx.createRadialGradient(frame.cx, frame.cy, 0, frame.cx, frame.cy, r);
      g.addColorStop(0, `rgba(255, 120, 70, ${(0.2 * glow).toFixed(3)})`);
      g.addColorStop(1, 'rgba(255, 90, 31, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(frame.cx - r, frame.cy - r, r * 2, r * 2);
    },

    render(t, glyphs) {
      const { cellW, cellH } = stage;
      const close = smoothstep(0, 16, t);
      const shift = (1 - close) * cellW * 3.5; // each hand starts a few cells further out
      // a wave of light every 9 s, from God's shoulder (right) to Adam's (left)
      const wave = 1.2 - (((t + 3) % 9) / 9) * 1.4;
      for (let q = 0; q < n; q++) {
        const fade = F[q];
        if (fade < 1 && hash2(X[q], Y[q], 3) > fade) continue; // ends break into specks
        const d = (U[q] - wave) / 0.07;
        const lum = Math.min(1, smoothstep(0.04, 0.96, L[q]) * 0.92 + 0.04 + 0.3 * Math.exp(-d * d));
        const edge = C[q] < 0.55;
        const ch = edge ? EDGE[lum > 0.5 ? 1 : 0] : RAMP[Math.min(RAMP.length - 1, (lum * RAMP.length) | 0)];
        const a = (0.25 + 0.75 * lum) * (edge ? 0.6 : 1) * Math.max(0.35, fade);
        glyphs.push(X[q] + side[q] * shift, Y[q], ch, a);
      }

      // the spark between the fingertips, brightest as the wave crosses it
      const crossing = Math.exp(-(((wave - gapU) / 0.05) ** 2));
      const spark = (0.35 + 0.45 * close) * (0.7 + 0.3 * Math.sin(t * 3.1)) + 0.4 * crossing;
      const ci = Math.round(frame.cx / cellW - 0.5);
      const cj = Math.round(frame.cy / cellH - 0.5);
      glyphs.push(ci * cellW, cj * cellH, STAR, Math.min(1, spark), ACCENT);
      if (crossing > 0.2) {
        glyphs.push(ci * cellW, (cj - 1) * cellH, DOT, crossing * 0.7, ACCENT);
        glyphs.push(ci * cellW, (cj + 1) * cellH, DOT, crossing * 0.7, ACCENT);
      }
    },
  };
}
