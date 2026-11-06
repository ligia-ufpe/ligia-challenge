// TV display: ASCII artwork from the campaign posts dissolving in and out,
// one piece at a time, in the centre of the screen.
//
// URL options (all optional, listed for the team at /tv/help/, so add new ones there too):
//   ?hold=25    seconds each scene stays fully visible
//   ?fade=3.5   seconds each dissolve (in, and out) takes
//   ?pause=-1   seconds between one piece fully gone and the next starting;
//               negative overlaps the dissolves (default: the next piece starts
//               dissolving in a second before the previous one is gone)
//   ?scene=3    start from the third scene
//   ?captions=1 show a small caption (number and name) in the corner
//   ?at=20      jump this many seconds into the loop (handy for previews)
//   ?agenda=0   turn off the clock and schedule overlay (on by default)
//   ?now=2026-11-08T12:45  simulate the current time in Recife, ticking from there
import '@fontsource-variable/geist-mono';
import './tv.css';

import {
  Batch,
  dissolveDots,
  dissolveField,
  dissolveGlyphs,
  drawDots,
  drawGlyphs,
  measureStage,
} from './stage.js';
import { createAgenda } from './agenda.js';
import { createMesh } from './mesh.js';
import hands from './scenes/hands.js';
import network from './scenes/network.js';
import flow from './scenes/flow.js';
import orb from './scenes/orb.js';
import torus from './scenes/torus.js';

const params = new URLSearchParams(window.location.search);
const number = (key, fallback) => {
  const v = params.get(key);
  return v === null || v === '' || !Number.isFinite(Number(v)) ? fallback : Number(v);
};
const HOLD = Math.max(2, number('hold', 25));
const FADE_IN = Math.max(0.5, number('fade', 3.5));
const FADE_OUT = FADE_IN;
// Overlap at most one dissolve, so two pieces never share the screen at full strength.
const PAUSE = Math.max(-FADE_IN, number('pause', -1));
const LIFE = FADE_IN + HOLD + FADE_OUT;
const STEP = LIFE + PAUSE;
const FPS = 30;
const MESH_FPS = 15;
const EDGE_FADE = 0.12; // share of the art area that fades out next to the overlay

const SCENES = [hands, network, flow, orb, torus].map((make, i) => ({
  scene: make(),
  seed: 101 + i * 37,
  field: null,
}));
const CYCLE = SCENES.length * STEP;

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const showCaptions = params.get('captions') === '1';
const startScene = Math.min(SCENES.length, Math.max(1, Number(params.get('scene')) || 1)) - 1;

const artCanvas = document.querySelector('.tv__art');
const art = artCanvas.getContext('2d');
const mesh = createMesh(document.querySelector('.tv__mesh'));
const caption = document.querySelector('.tv__caption');
const captionIndex = caption.querySelector('.tv__index');
const captionWord = caption.querySelector('.tv__word');
caption.hidden = !showCaptions;
const agenda =
  params.get('agenda') === '0'
    ? null
    : createAgenda(document.querySelector('.tv__agenda'), {
        now: params.get('now'),
        onVisibility: resize,
      });

const glyphs = new Batch(16384);
const dots = new Batch(16384);
let stage = null;
let dpr = 1;
let last = -Infinity; // last art frame
let lastMesh = -Infinity; // last mesh frame
let edgeFade = null; // gradient that dissolves the art next to the overlay

function frameFor(W, H) {
  // Next to the overlay the art area is close to square, so pieces can fill more of it.
  const share = agenda?.visible ? 0.62 : 0.5;
  return { cx: W / 2, cy: H / 2, size: Math.min(H * 0.8, W * share) };
}

// With the overlay on, the whole stage shrinks to the art canvas (narrowed in
// tv.css), not just the frame: the ribbon and the hands size themselves from the
// stage and would otherwise run under the overlay.
function resize() {
  const W = agenda?.visible ? artCanvas.clientWidth : window.innerWidth;
  const H = window.innerHeight;
  dpr = Math.min(2, window.devicePixelRatio || 1);
  artCanvas.width = Math.round(W * dpr);
  artCanvas.height = Math.round(H * dpr);
  stage = measureStage(art, W, H);
  mesh.resize(window.innerWidth, H, dpr);
  edgeFade = null;
  if (agenda?.visible) {
    edgeFade = art.createLinearGradient(W * (1 - EDGE_FADE), 0, W, 0);
    edgeFade.addColorStop(0, 'rgba(0, 0, 0, 0)');
    edgeFade.addColorStop(1, 'rgb(0, 0, 0)');
  }
  for (const s of SCENES) {
    s.field = dissolveField(stage, s.seed);
    s.scene.layout(stage, frameFor(W, H));
  }
  lastMesh = -Infinity;
}

// Quarter sine: gentle next to the hold, brisk near empty, so the overlap between
// two pieces never leaves the screen blank.
function visibility(local) {
  if (local < FADE_IN) return Math.sin((local / FADE_IN) * (Math.PI / 2));
  if (local < FADE_IN + HOLD) return 1;
  return Math.cos((Math.min(1, (local - FADE_IN - HOLD) / FADE_OUT) * Math.PI) / 2);
}

// Caption follows whichever scene is most visible; it fades out, swaps, fades in.
let captionScene = -1;
let captionTimer = 0;
function setCaption(i) {
  if (!showCaptions || i === captionScene) return;
  captionScene = i;
  caption.classList.remove('is-in');
  clearTimeout(captionTimer);
  captionTimer = setTimeout(() => {
    captionIndex.textContent = String(i + 1).padStart(2, '0');
    captionWord.textContent = SCENES[i].scene.name;
    caption.classList.add('is-in');
  }, 1100);
}

const startAt = Math.max(0, Number(params.get('at')) || 0);
const t0 = performance.now() - (startScene * STEP + startAt) * 1000;

// At most one job per animation frame: the art (30 fps) or the mesh (15 fps),
// whichever is more overdue, so the two never pile up in one frame.
function tick(now) {
  requestAnimationFrame(tick);
  if (agenda?.covers) return;
  const artLate = (now - last) * (FPS / 1000);
  const meshLate = (now - lastMesh) * (MESH_FPS / 1000);
  if (Math.max(artLate, meshLate) < 0.94) return;
  const T = (now - t0) / 1000;
  if (artLate >= meshLate) {
    last = now;
    drawArt(T);
  } else {
    lastMesh = now;
    mesh.draw(reduced ? 0 : T);
  }
}

function drawArt(T) {
  art.setTransform(dpr, 0, 0, dpr, 0, 0);
  art.clearRect(0, 0, stage.W, stage.H);
  glyphs.clear();
  dots.clear();

  let lead = -1;
  let leadP = 0;
  for (let i = 0; i < SCENES.length; i++) {
    const since = T - i * STEP;
    if (since < 0) continue;
    const local = since % CYCLE;
    if (local >= LIFE) continue;
    const p = visibility(local);
    if (p >= leadP) {
      lead = i;
      leadP = p;
    }
    const { scene, field } = SCENES[i];
    const at = reduced ? 6 : local;
    scene.underlay?.(art, at, p);
    const g0 = glyphs.n;
    const d0 = dots.n;
    scene.render(at, glyphs, dots);
    dissolveGlyphs(glyphs, g0, field, stage, p);
    dissolveDots(dots, d0, field, stage, p);
  }

  drawDots(art, dots);
  art.font = stage.font;
  art.textBaseline = 'top';
  drawGlyphs(art, glyphs);
  if (edgeFade) {
    art.globalCompositeOperation = 'destination-out';
    art.fillStyle = edgeFade;
    art.fillRect(stage.W * (1 - EDGE_FADE), 0, stage.W * EDGE_FADE, stage.H);
    art.globalCompositeOperation = 'source-over';
  }
  if (lead >= 0) setCaption(lead);
}

// ---- TV conveniences: fullscreen, hidden cursor, keep the screen awake ----

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen?.();
  else document.documentElement.requestFullscreen?.().catch(() => {});
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'f' || e.key === 'F') toggleFullscreen();
});
window.addEventListener('dblclick', toggleFullscreen);

let idleTimer = 0;
function wake() {
  document.body.classList.remove('is-idle');
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => document.body.classList.add('is-idle'), 2500);
}
window.addEventListener('pointermove', wake, { passive: true });
wake();

async function keepAwake() {
  try {
    if (document.visibilityState === 'visible') await navigator.wakeLock?.request('screen');
  } catch {
    // not supported or not allowed; the TV's own settings will have to do
  }
}
document.addEventListener('visibilitychange', keepAwake);
keepAwake();

let resizeTimer = 0;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resize, 150);
});

// Start once the font and any scene artwork (the fresco crop) are in.
Promise.allSettled([
  document.fonts.load(`500 16px 'Geist Mono Variable'`),
  ...SCENES.map((s) => s.scene.load?.()),
]).then(() => {
  resize();
  requestAnimationFrame(tick);
});
