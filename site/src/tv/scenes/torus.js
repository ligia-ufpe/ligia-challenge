// "iterar": the ASCII torus from the site hero (donut.c), turning slowly.
import { code } from '../stage.js';

const RAMP = '.,:-=+*#%@'.split('').map(code);
const TAU = Math.PI * 2;
const R1 = 1; // tube radius
const R2 = 2.1; // ring radius
const K2 = 6.5; // viewer distance

export default function torus() {
  let stage;
  let frame;
  let gx0 = 0;
  let gy0 = 0;
  let gw = 0;
  let gh = 0;
  let zbuf;
  let lum;
  let cosP;
  let sinP;
  let cosT;
  let sinT;
  let scale = 1;

  return {
    name: 'iterar',

    layout(s, f) {
      stage = s;
      frame = f;
      const half = f.size * 0.56;
      gx0 = Math.floor((f.cx - half) / s.cellW);
      gy0 = Math.floor((f.cy - half) / s.cellH);
      gw = Math.ceil((half * 2) / s.cellW);
      gh = Math.ceil((half * 2) / s.cellH);
      zbuf = new Float32Array(gw * gh);
      lum = new Float32Array(gw * gh);
      scale = (f.size * 0.42 * K2) / (R1 + R2);
      // Sample finely enough that the near side has no holes.
      const reach = (scale / (K2 - R1 - R2)) * (R1 + R2);
      const nPhi = Math.min(900, Math.max(400, Math.ceil((TAU * reach) / s.cellW)));
      const nTheta = Math.min(260, Math.max(120, Math.ceil((TAU * reach * R1) / (R1 + R2) / s.cellW)));
      cosP = new Float32Array(nPhi);
      sinP = new Float32Array(nPhi);
      cosT = new Float32Array(nTheta);
      sinT = new Float32Array(nTheta);
      for (let i = 0; i < nPhi; i++) {
        cosP[i] = Math.cos((i / nPhi) * TAU);
        sinP[i] = Math.sin((i / nPhi) * TAU);
      }
      for (let j = 0; j < nTheta; j++) {
        cosT[j] = Math.cos((j / nTheta) * TAU);
        sinT[j] = Math.sin((j / nTheta) * TAU);
      }
    },

    render(t, glyphs) {
      const { cellW, cellH } = stage;
      const A = 0.9 + t * 0.15;
      const B = 0.35 + t * 0.085;
      const cA = Math.cos(A);
      const sA = Math.sin(A);
      const cB = Math.cos(B);
      const sB = Math.sin(B);
      const sAsB = sA * sB;
      const sAcB = sA * cB;
      const ox = frame.cx - gx0 * cellW;
      const oy = frame.cy - gy0 * cellH;
      zbuf.fill(0);
      lum.fill(-1);

      for (let j = 0; j < cosT.length; j++) {
        const ct = cosT[j];
        const st = sinT[j];
        const rx = R2 + R1 * ct;
        const ry = R1 * st;
        const x0 = -ry * cA * sB;
        const y0 = ry * cA * cB;
        const z0 = K2 + ry * sA;
        const l0 = -sA * st + cB * cA * st;
        for (let i = 0; i < cosP.length; i++) {
          const cp = cosP[i];
          const sp = sinP[i];
          const x = rx * (cB * cp + sAsB * sp) + x0;
          const y = rx * (sB * cp - sAcB * sp) + y0;
          const ooz = 1 / (z0 + cA * rx * sp);
          const col = ((ox + scale * ooz * x) / cellW) | 0;
          const row = ((oy - scale * ooz * y) / cellH) | 0;
          if (col < 0 || col >= gw || row < 0 || row >= gh) continue;
          const k = row * gw + col;
          if (ooz > zbuf[k]) {
            zbuf[k] = ooz;
            lum[k] = cp * ct * sB - cA * ct * sp + l0 - sAcB * ct * sp;
          }
        }
      }

      for (let k = 0; k < lum.length; k++) {
        const L = lum[k];
        if (L < 0) continue;
        const b = Math.min(RAMP.length - 1, ((L / 1.42) * RAMP.length) | 0);
        const a = 0.18 + 0.7 * (b / (RAMP.length - 1));
        glyphs.push((gx0 + (k % gw)) * cellW, (gy0 + ((k / gw) | 0)) * cellH, RAMP[b], a);
      }
    },
  };
}
