// "fluir": a twisting ribbon of #, + and - sweeping across the whole screen,
// like the band in the "O futuro não espera comandos" post. The front face
// reads as #, the back as - and ., and the twist slowly travels along it.
import { code } from '../stage.js';
import { smoothstep } from '../noise.js';

const HASH = code('#');
const PLUS = code('+');
const DASH = code('-');
const DOT = code('.');
const TAU = Math.PI * 2;

export default function flow() {
  let stage;
  let zbuf;
  let face;
  let edge;
  let along;

  function center(u, t) {
    const { W, H } = stage;
    const x = W * (-0.1 + 1.2 * u);
    const y = H * (0.27 + 0.44 * u + 0.1 * Math.sin(TAU * 0.85 * u - 0.3 * t + 0.8));
    return [x, y];
  }

  return {
    name: 'fluir',

    layout(s) {
      stage = s;
      const cells = s.cols * s.rows;
      zbuf = new Float32Array(cells);
      face = new Float32Array(cells);
      edge = new Float32Array(cells);
      along = new Float32Array(cells);
    },

    render(t, glyphs) {
      const { W, H, cellW, cellH, cols, rows } = stage;
      zbuf.fill(-Infinity);
      const U = Math.ceil((W * 1.5) / (cellW * 0.45));
      const V = Math.ceil((H * 0.26) / (cellH * 0.35));

      for (let iu = 0; iu <= U; iu++) {
        const u = iu / U;
        const [x, y] = center(u, t);
        const [x2, y2] = center(u + 0.001, t);
        const tl = Math.hypot(x2 - x, y2 - y) || 1;
        const nx = -(y2 - y) / tl;
        const ny = (x2 - x) / tl;
        const twist = TAU * 0.95 * u - 0.26 * t + 0.4 * Math.sin(TAU * 0.5 * u + 0.12 * t);
        const ct = Math.cos(twist);
        const st = Math.sin(twist);
        const w = H * (0.105 + 0.025 * Math.sin(TAU * 0.7 * u + 0.2 * t));
        for (let iv = 0; iv <= V; iv++) {
          const v = (iv / V) * 2 - 1;
          const px = x + nx * v * w * ct;
          const py = y + ny * v * w * ct;
          const i = Math.floor(px / cellW);
          const j = Math.floor(py / cellH);
          if (i < 0 || j < 0 || i >= cols || j >= rows) continue;
          const k = j * cols + i;
          const z = v * w * st;
          if (z > zbuf[k]) {
            zbuf[k] = z;
            face[k] = ct;
            edge[k] = Math.abs(v);
            along[k] = u;
          }
        }
      }

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i;
          if (zbuf[k] === -Infinity) continue;
          const f = face[k];
          const af = Math.abs(f);
          const rim = edge[k] > 0.88;
          let ch;
          let a;
          if (f > 0) {
            ch = rim ? PLUS : af > 0.5 ? HASH : af > 0.22 ? PLUS : DASH;
            a = 0.5 + 0.45 * af;
          } else {
            ch = rim || af < 0.4 ? DOT : DASH;
            a = 0.3 + 0.3 * af;
          }
          // the tail on the far left thins out into dots, as in the post
          const u = along[k];
          a *= 0.25 + 0.75 * smoothstep(0.02, 0.3, u);
          if (u < 0.16 && ch === HASH) ch = PLUS;
          glyphs.push(i * cellW, j * cellH, ch, a);
        }
      }
    },
  };
}
