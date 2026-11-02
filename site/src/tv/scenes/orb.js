// "convergir": the glowing halftone sphere from the prizes post, slowly
// turning, while specks of light drift in and converge on it.
import { fbm3, hash2, smoothstep } from '../noise.js';

const LIGHT = (() => {
  const v = [-0.55, -0.62, 0.56];
  const m = Math.hypot(...v);
  return v.map((c) => c / m);
})();
const COUNT = 1100;

export default function orb() {
  let frame;
  let R = 0;
  let pitch = 4; // halftone grid, px
  let glow = 0;
  const parts = [];

  return {
    name: 'convergir',

    layout(stage, f) {
      frame = f;
      R = f.size * 0.3;
      pitch = Math.max(4, stage.cellW * 0.62);
      glow = R * 1.9;
      parts.length = 0;
      for (let n = 0; n < COUNT; n++) {
        const h1 = hash2(n, 1, 71);
        const h2 = hash2(n, 2, 71);
        const h3 = hash2(n, 3, 71);
        // Two streams (upper right, lower left) plus a sparse halo all round.
        const lobe = h1 < 0.5 ? -0.75 : h1 < 0.82 ? 2.5 : null;
        const angle = lobe === null ? h2 * Math.PI * 2 : lobe + (h2 - 0.5) * (lobe < 0 ? 1.1 : 0.9);
        parts.push({
          angle,
          from: 1.35 + h3 * (lobe === null ? 1.1 : 2.1),
          life: 6 + hash2(n, 4, 71) * 6,
          phase: hash2(n, 5, 71) * 12,
          swirl: (hash2(n, 6, 71) - 0.35) * 0.9,
          size: 0.32 + hash2(n, 7, 71) * 0.28,
        });
      }
    },

    // Soft bloom behind the sphere, faded with the scene.
    underlay(ctx, t, p) {
      const x = frame.cx - R * 0.2;
      const y = frame.cy - R * 0.25;
      const g = ctx.createRadialGradient(x, y, 0, x, y, glow);
      g.addColorStop(0, `rgba(196, 210, 255, ${(0.2 * p).toFixed(3)})`);
      g.addColorStop(0.45, `rgba(120, 146, 230, ${(0.07 * p).toFixed(3)})`);
      g.addColorStop(1, 'rgba(60, 90, 200, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - glow, y - glow, glow * 2, glow * 2);
    },

    render(t, glyphs, dots) {
      const { cx, cy } = frame;
      const spin = t * 0.07;
      const cs = Math.cos(spin);
      const sn = Math.sin(spin);
      const [lx, ly, lz] = LIGHT;

      const x0 = Math.floor((cx - R) / pitch) * pitch;
      const y0 = Math.floor((cy - R) / pitch) * pitch;
      for (let y = y0; y <= cy + R; y += pitch) {
        const dy = (y - cy) / R;
        for (let x = x0; x <= cx + R; x += pitch) {
          const dx = (x - cx) / R;
          const r2 = dx * dx + dy * dy;
          if (r2 > 1) continue;
          const dz = Math.sqrt(1 - r2);
          const lambert = Math.max(0, dx * lx + dy * ly + dz * lz);
          // texture turns with the sphere: rotate the normal before sampling
          const nx = dx * cs + dz * sn;
          const nz = -dx * sn + dz * cs;
          const tex = fbm3(nx * 3 + 4, dy * 3, nz * 3, 5, 2);
          let I = 0.1 + 0.9 * Math.pow(lambert, 1.15);
          I *= 0.4 + 0.6 * smoothstep(0.36, 0.5, tex);
          const rim = smoothstep(1, 0.9, Math.sqrt(r2));
          dots.push(x, y, pitch * (0.12 + 0.62 * Math.sqrt(I)), (0.4 + 0.6 * I) * rim);
        }
      }

      // converging specks, snapped to the same halftone grid
      for (const p of parts) {
        const s = ((t + p.phase) / p.life) % 1;
        const remain = 1 - s;
        const dist = R * (1 + (p.from - 1) * Math.pow(remain, 1.4));
        const ang = p.angle + p.swirl * remain * remain;
        const x = Math.round((cx + Math.cos(ang) * dist) / pitch) * pitch;
        const y = Math.round((cy + Math.sin(ang) * dist) / pitch) * pitch;
        const a = 0.8 * Math.pow(Math.sin(Math.PI * s), 0.8);
        dots.push(x, y, pitch * p.size, a);
      }
    },
  };
}
