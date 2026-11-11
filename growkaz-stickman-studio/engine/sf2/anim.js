// engine/sf2/anim.js — v2 animation helpers: kinetic text, emphasis marks, counters, depth, trails.
//   import { kineticText, marker, underline, scribble, countUp, floatY, foreground, trail, drift } from '/engine/sf2/anim.js';
import { E, rr, circle, alpha, text, measure, FONTS, ease, prog, clamp, lerp, rng } from '/engine/core.js';
import { spring } from '/engine/sf2/ui.js';

// Words pop in one by one (slide up + spring scale + settle rotation). Returns the total width.
// o: { size, font, weight, color, hi: {index: color}, stagger, align: 'center'|'left', maxW, stroke }
export function kineticText(g, t, t0, str, x, y, o = {}) {
  const words = str.split(' '), size0 = o.size || 70, font = o.font || FONTS.title, weight = o.weight || 700, gap = size0 * 0.36, stag = o.stagger ?? 0.09;
  let ws = words.map((w) => measure(g, w, size0, font, weight)), total = ws.reduce((a, b) => a + b, 0) + gap * (words.length - 1);
  const sc = o.maxW ? Math.min(1, o.maxW / total) : 1, size = size0 * sc; ws = ws.map((w) => w * sc); total *= sc;
  let xx = (o.align === 'left' ? x : x - total / 2);
  words.forEach((w, i) => {
    const k = spring(t, t0 + i * stag, 9, 0.5), a = clamp((t - t0 - i * stag) * 6);
    if (a > 0) {
      g.save(); g.translate(xx + ws[i] / 2, y + (1 - Math.min(1, k)) * size * 0.6); g.rotate((1 - Math.min(1, k)) * 0.12); g.scale(Math.max(0.01, k), Math.max(0.01, k));
      text(g, w, 0, 0, { size, font, weight, color: (o.hi && o.hi[i]) || o.color || '#1f1f2b', alpha: a, stroke: o.stroke || 0, strokeColor: o.strokeColor || '#fff' });
      g.restore();
    }
    xx += ws[i] + gap;
  });
  return total;
}
// Highlighter sweep behind text (draw BEFORE the text)
export function marker(g, t, t0, x, y, w, h, col, dur = 0.35) {
  const p = ease.out(prog(t, t0, t0 + dur)); if (p <= 0) return;
  g.save(); g.globalAlpha *= 0.85; rr(g, x, y - h / 2, w * p, h, h * 0.3); g.fillStyle = col; g.fill(); g.restore();
}
// Hand-drawn underline that draws itself
export function underline(g, t, t0, x, y, w, col, thick = 10, dur = 0.35) {
  const p = ease.out(prog(t, t0, t0 + dur)); if (p <= 0) return;
  g.save(); g.strokeStyle = col; g.lineWidth = thick; g.lineCap = 'round'; g.beginPath();
  const n = 16; for (let i = 0; i <= n * p; i++) { const u = i / n, px = x + u * w, py = y + Math.sin(u * 7) * thick * 0.3 + u * thick * 0.4; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); g.restore();
}
// Hand-drawn circle around something
export function scribble(g, t, t0, cx, cy, rx, ry, col, thick = 9, dur = 0.45) {
  const p = ease.out(prog(t, t0, t0 + dur)); if (p <= 0) return;
  g.save(); g.strokeStyle = col; g.lineWidth = thick; g.lineCap = 'round'; g.beginPath();
  const n = 48, turns = 1.12; for (let i = 0; i <= n * p; i++) { const a = -2.2 + (i / n) * Math.PI * 2 * turns, wob = 1 + Math.sin(i * 0.9) * 0.03; const px = cx + Math.cos(a) * rx * wob, py = cy + Math.sin(a) * ry * wob; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); g.restore();
}
// number that counts up (ease-out)
export const countUp = (t, t0, dur, to, from = 0) => Math.round(lerp(from, to, ease.out(prog(t, t0, t0 + dur))));
// gentle float for cards / props
export const floatY = (t, amp = 10, f = 1.6, seed = 0) => Math.sin(t * f + seed) * amp;
// slow camera drift for parallax (pass as cam to SETS.*)
export const drift = (t, dur, amt = 40, z = 1) => ({ z, x: lerp(-amt / 2, amt / 2, ease.inOut(clamp(t / dur))) });
// draw something with a short motion trail (fake motion blur) along (dx, dy)
export function trail(g, fn, speed, dx = 1, dy = 0, steps = 4) {
  if (speed < 0.02) { fn(); return; }
  for (let i = steps; i >= 1; i--) { g.save(); g.globalAlpha *= 0.18; g.translate(-dx * speed * i * 18, -dy * speed * i * 18); fn(); g.restore(); }
  fn();
}
// blurred foreground objects at the frame edges for depth (draw LAST, before captions)
export function foreground(g, t, kind = 'plant', o = {}) {
  const sway = Math.sin(t * 0.9) * 6, px = (o.x ?? 0) + Math.sin(t * 0.35) * 18;
  g.save(); g.filter = `blur(${o.blur ?? 14}px)`;
  if (kind === 'plant') { for (const [dx, dy, r, c] of [[-90, 1900, 150, '#2fae5f'], [10, 1840, 110, '#3fbf6f'], [-60, 1760, 90, '#4ccf7c'], [1150, 1910, 140, '#2fae5f'], [1100, 1830, 95, '#4ccf7c']]) circle(g, dx + px + sway, dy, r, alpha(c, 0.55)); }
  else if (kind === 'cups') { rr(g, -120 + px, 1760, 200, 260, 40); g.fillStyle = 'rgba(255,201,60,.5)'; g.fill(); rr(g, 1020 + px, 1800, 180, 240, 40); g.fillStyle = 'rgba(255,140,90,.45)'; g.fill(); }
  else if (kind === 'bokeh') { const r = rng(o.seed || 4); for (let i = 0; i < 8; i++) circle(g, r() * E.W + px, E.H * (0.75 + r() * 0.3), 60 + r() * 80, alpha(['#ffc93c', '#ff8fc2', '#8fd3ff'][i % 3], 0.35)); }
  g.restore();
}
