// "conectar": rings joined by noisy strokes, like the molecule/graph in the
// posts, turning slowly in 3D. Small orange packets travel along the links,
// agents passing messages to each other.
import { ACCENT, code } from '../stage.js';
import { hash2 } from '../noise.js';

// [x, y, z, radius] in a unit-ish space.
const NODES = [
  [0.02, -0.58, 0.05, 0.2],
  [-0.38, -0.08, 0.22, 0.15],
  [0.16, 0.04, -0.12, 0.24],
  [0.62, -0.2, 0.22, 0.13],
  [-0.74, 0.22, -0.18, 0.2],
  [0.58, 0.46, -0.32, 0.17],
  [-0.2, 0.58, 0.36, 0.15],
  [0.12, -0.22, 0.66, 0.09],
  [-0.56, -0.5, -0.42, 0.12],
  [0.34, 0.66, 0.42, 0.08],
];
const EDGES = [
  [0, 2], [0, 1], [1, 2], [2, 3], [1, 4], [2, 5], [2, 6], [4, 6],
  [3, 5], [0, 8], [4, 8], [3, 7], [1, 7], [6, 9], [5, 9], [0, 3],
];
const RING_NEAR = '@0@0%'.split('').map(code);
const RING_MID = '0%#0*'.split('').map(code);
const RING_FAR = 'o*+o:'.split('').map(code);
const LINK = '+*=%#:-+*=:.'.split('').map(code);
const PACKET = [code('@'), code('*'), code('+'), code('.')];
const CAMERA = 3.3;

export default function network() {
  let stage;
  let frame;
  let gx0 = 0;
  let gy0 = 0;
  let gw = 0;
  let gh = 0;
  let zbuf;
  let chars;
  let alpha;
  const proj = NODES.map(() => ({ x: 0, y: 0, r: 0, ooz: 0, near: 0 }));
  const packets = [];

  function put(x, y, ooz, ch, a) {
    const i = Math.floor(x / stage.cellW) - gx0;
    const j = Math.floor(y / stage.cellH) - gy0;
    if (i < 0 || j < 0 || i >= gw || j >= gh) return;
    const k = j * gw + i;
    if (ooz > zbuf[k]) {
      zbuf[k] = ooz;
      chars[k] = ch;
      alpha[k] = a;
    }
  }

  // Each link starts and ends at the rim of its rings.
  function linkEnds(e) {
    const a = proj[EDGES[e][0]];
    const b = proj[EDGES[e][1]];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    return {
      a,
      b,
      x0: a.x + ux * a.r * 1.08,
      y0: a.y + uy * a.r * 1.08,
      x1: b.x - ux * b.r * 1.08,
      y1: b.y - uy * b.r * 1.08,
      len: len - (a.r + b.r) * 1.08,
    };
  }

  return {
    name: 'conectar',

    layout(s, f) {
      stage = s;
      frame = f;
      gx0 = Math.floor((f.cx - f.size * 0.78) / s.cellW);
      gy0 = Math.floor((f.cy - f.size * 0.6) / s.cellH);
      gw = Math.ceil((f.size * 1.56) / s.cellW);
      gh = Math.ceil((f.size * 1.2) / s.cellH);
      zbuf = new Float32Array(gw * gh);
      chars = new Uint16Array(gw * gh);
      alpha = new Float32Array(gw * gh);
    },

    render(t, glyphs) {
      const { cellW, cellH } = stage;
      const yaw = 0.4 + t * 0.1;
      const pitch = 0.25 + 0.12 * Math.sin(t * 0.07);
      const cy = Math.cos(yaw);
      const sy = Math.sin(yaw);
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      const focal = frame.size * 1.85;

      for (let n = 0; n < NODES.length; n++) {
        const [x, y, z, r] = NODES[n];
        const x1 = x * cy - z * sy;
        const z1 = x * sy + z * cy;
        const y2 = y * cp - z1 * sp;
        const z2 = y * sp + z1 * cp;
        const zc = z2 + CAMERA;
        const p = proj[n];
        p.x = frame.cx + (x1 * focal) / zc;
        p.y = frame.cy + (y2 * focal) / zc;
        p.r = (r * focal) / zc;
        p.ooz = 1 / zc;
        p.near = Math.min(1, Math.max(0, (CAMERA + 0.85 - zc) / 1.7));
      }

      zbuf.fill(0);
      chars.fill(0);

      // links
      for (let e = 0; e < EDGES.length; e++) {
        const L = linkEnds(e);
        if (L.len <= cellW) continue;
        const steps = Math.ceil(L.len / (cellW * 0.5));
        for (let s = 0; s <= steps; s++) {
          const f = s / steps;
          const x = L.x0 + (L.x1 - L.x0) * f;
          const y = L.y0 + (L.y1 - L.y0) * f;
          const near = L.a.near + (L.b.near - L.a.near) * f;
          const ooz = L.a.ooz + (L.b.ooz - L.a.ooz) * f;
          const ci = Math.floor(x / cellW);
          const cj = Math.floor(y / cellH);
          const h = hash2(ci, cj, e + 101);
          if (h < 0.1 + 0.25 * (1 - near)) continue; // far links break up
          const ch = LINK[(h * 7919) % LINK.length | 0];
          put(x, y, ooz, ch, 0.3 + 0.55 * near);
          if (h > 0.78) put(x, y + (h > 0.89 ? cellH : -cellH), ooz - 1e-4, LINK[(h * 104729) % LINK.length | 0], 0.25 + 0.4 * near);
        }
      }

      // rings, always facing the viewer
      for (let n = 0; n < NODES.length; n++) {
        const p = proj[n];
        const half = Math.max(cellW * 0.7, p.r * 0.1);
        const set = p.near > 0.62 ? RING_NEAR : p.near > 0.3 ? RING_MID : RING_FAR;
        const i0 = Math.floor((p.x - p.r - half) / cellW);
        const i1 = Math.ceil((p.x + p.r + half) / cellW);
        const j0 = Math.floor((p.y - p.r - half) / cellH);
        const j1 = Math.ceil((p.y + p.r + half) / cellH);
        for (let j = j0; j <= j1; j++) {
          for (let i = i0; i <= i1; i++) {
            const px = (i + 0.5) * cellW;
            const py = (j + 0.5) * cellH;
            const band = Math.abs(Math.hypot(px - p.x, py - p.y) - p.r) / half;
            if (band >= 1) continue;
            const h = hash2(i, j, n + 211);
            const a = (0.38 + 0.62 * p.near) * (1 - 0.45 * band * band);
            put(px, py, p.ooz + 0.02, set[(h * set.length) | 0], a);
          }
        }
      }

      // packets: a bright head with a short fading tail; they take over
      // their cells so two glyphs never overlap
      packets.length = 0;
      for (let q = 0; q < 5; q++) {
        const dur = 3.2 + q * 0.45;
        const phase = t / dur + q * 0.37;
        const round = Math.floor(phase);
        const s = phase - round;
        const e = (round * 7 + q * 5) % EDGES.length;
        const L = linkEnds(e);
        if (L.len <= cellW * 2) continue;
        const forward = (round + q) % 2 === 0;
        const ease = s * s * (3 - 2 * s);
        const env = Math.sin(Math.PI * s);
        const near = (L.a.near + L.b.near) / 2;
        let prev = -1;
        for (let k = 0; k < PACKET.length; k++) {
          let f = ease - (k * cellW * 1.1) / L.len;
          if (f < 0) break;
          if (!forward) f = 1 - f;
          const x = L.x0 + (L.x1 - L.x0) * f;
          const y = L.y0 + (L.y1 - L.y0) * f;
          const i = Math.floor(x / cellW);
          const j = Math.floor(y / cellH);
          if (i * 7919 + j === prev) continue; // steep link: tail still in the head's cell
          prev = i * 7919 + j;
          const li = i - gx0;
          const lj = j - gy0;
          if (li >= 0 && lj >= 0 && li < gw && lj < gh) chars[lj * gw + li] = 0;
          packets.push(i * cellW, j * cellH, PACKET[k], env * (0.55 + 0.45 * near) * (1 - k * 0.22));
        }
      }

      for (let j = 0; j < gh; j++) {
        for (let i = 0; i < gw; i++) {
          const k = j * gw + i;
          if (chars[k]) glyphs.push((gx0 + i) * cellW, (gy0 + j) * cellH, chars[k], alpha[k]);
        }
      }
      for (let k = 0; k < packets.length; k += 4) {
        glyphs.push(packets[k], packets[k + 1], packets[k + 2], packets[k + 3], ACCENT);
      }
    },
  };
}
