// engine/sf2/ui.js — v2 UI kit: motion helpers, big readable cards, icons, captions, confetti, camera.
import { E, rr, seg, circle, ring, linGrad, radGrad, glow, alpha, shade, text, measure, FONTS, ease, prog, clamp, lerp, rng, talkAmount } from '/engine/core.js';

export const C = { cream: '#fff3e2', coral: '#ff5a5f', red: '#ff4757', orange: '#ff8a1f', yellow: '#ffc93c', teal: '#21a99a', mint: '#bff0dc', blue: '#3a7bf2', purple: '#8b6cff', pink: '#ff8fc2', green: '#25c26e', ink: '#1f1f2b', gray: '#c9ccd3', gray2: '#8d93a0', white: '#fff' };
export const SPK = { O: { name: 'NARRATOR', col: C.orange }, C: { name: 'GUEST', col: C.teal } };

// ---------- motion ----------
// damped spring from 0 -> 1 starting at t0 (overshoots, settles in ~0.5 s)
export const spring = (t, t0, f = 7.5, d = 0.5) => { const x = t - t0; if (x <= 0) return 0; return 1 - Math.exp(-d * f * x) * (Math.cos(f * Math.sqrt(1 - d * d) * x) + (d / Math.sqrt(1 - d * d)) * Math.sin(f * Math.sqrt(1 - d * d) * x)); };
export const smooth = (t, a, b) => ease.inOut(prog(t, a, b));
export const wobble = (t, amp = 1, f = 3, ph = 0) => Math.sin(t * f + ph) * amp;
export const shakeXY = (t, t0, amp = 16, dur = 0.35) => { const k = t > t0 ? clamp(1 - (t - t0) / dur) : 0; return [Math.sin(t * 95) * amp * k, Math.cos(t * 77) * amp * k]; };
// camera: apply around the centre. from/to = {z, x, y, r}
export function withCam(g, t, dur, from, to, fn, e = ease.inOut) {
  const k = e(clamp(t / dur)), z = lerp(from.z ?? 1, to.z ?? 1, k), x = lerp(from.x ?? 0, to.x ?? 0, k), y = lerp(from.y ?? 0, to.y ?? 0, k), r = lerp(from.r ?? 0, to.r ?? 0, k);
  g.save(); g.translate(E.W / 2 + x, E.H / 2 + y); g.rotate(r); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2); fn(g); g.restore();
}
// is the given speaker talking at global time gt? (uses real word timings)
export function talking(gt, spk) { const w = E.words || []; for (const x of w) { if (gt >= x.start - 0.05 && gt <= x.end + 0.12 && (!spk || x.spk === spk)) return true; } return false; }
export const wordAt = (needle, after = 0) => { const w = (E.words || []).find((x) => x.start >= after && x.word.toLowerCase().includes(needle.toLowerCase())); return w ? w.start : null; };

// ---------- shapes ----------
export function shadowed(g, fn, blur = 36, oy = 14, col = 'rgba(80,40,10,.22)') { g.save(); g.shadowColor = col; g.shadowBlur = blur; g.shadowOffsetY = oy; fn(); g.restore(); }
export function card(g, cx, cy, w, h, k, fn, o = {}) {
  if (k <= 0.01) return; g.save(); g.translate(cx, cy); g.rotate(o.rot || 0); g.scale(k, k);
  shadowed(g, () => { rr(g, -w / 2, -h / 2, w, h, o.r || 40); g.fillStyle = o.fill || '#fff'; g.fill(); });
  if (o.border) { rr(g, -w / 2, -h / 2, w, h, o.r || 40); g.lineWidth = 6; g.strokeStyle = o.border; g.stroke(); }
  g.save(); rr(g, -w / 2, -h / 2, w, h, o.r || 40); g.clip(); fn(g, -w / 2, -h / 2, w, h); g.restore(); g.restore();
}
export function pill(g, cx, cy, str, col, k = 1, o = {}) {
  if (k <= 0.01) return; const size = o.size || 54; g.save(); g.translate(cx, cy); g.scale(k, k);
  g.font = `900 ${size}px "${FONTS.ui}"`; const w = Math.min(E.W * 0.92, g.measureText(str).width + size * 1.6), sc = Math.min(1, (E.W * 0.92) / (g.measureText(str).width + size * 1.6));
  g.scale(sc, sc); shadowed(g, () => { rr(g, -w / 2, -size * 0.85, w, size * 1.7, size * 0.85); g.fillStyle = col; g.fill(); }, 28, 10, 'rgba(0,0,0,.2)');
  text(g, str, 0, 3, { size, font: FONTS.ui, weight: 900, color: o.color || '#fff', spacing: 1 }); g.restore();
}
export function numBadge(g, x, y, n, col, k = 1, r = 64) {
  if (k <= 0.01) return; g.save(); g.translate(x, y); g.scale(k, k); shadowed(g, () => circle(g, 0, 0, r, col), 24, 8);
  ring(g, 0, 0, r - 8, 4, 'rgba(255,255,255,.55)'); text(g, String(n), 0, 4, { size: r * 1.15, font: FONTS.ui, weight: 900, color: '#fff' }); g.restore();
}

// ---------- icons (drawn at centre x,y with half-size s) ----------
export const ICONS = {
  globe(g, x, y, s, c) { ring(g, x, y, s, s * 0.12, c); g.strokeStyle = c; g.lineWidth = s * 0.1; g.beginPath(); g.ellipse(x, y, s * 0.42, s, 0, 0, 7); g.stroke(); seg(g, [[x - s, y], [x + s, y]], s * 0.1, c); seg(g, [[x - s * 0.85, y - s * 0.5], [x + s * 0.85, y - s * 0.5]], s * 0.08, c); seg(g, [[x - s * 0.85, y + s * 0.5], [x + s * 0.85, y + s * 0.5]], s * 0.08, c); },
  server(g, x, y, s, c) { for (let i = 0; i < 3; i++) { const yy = y - s + i * s * 0.72; rr(g, x - s, yy, s * 2, s * 0.58, s * 0.14); g.fillStyle = c; g.fill(); circle(g, x - s * 0.6, yy + s * 0.29, s * 0.09, '#fff'); circle(g, x - s * 0.3, yy + s * 0.29, s * 0.09, alpha('#fff', 0.6)); seg(g, [[x + s * 0.1, yy + s * 0.29], [x + s * 0.8, yy + s * 0.29]], s * 0.07, alpha('#fff', 0.7)); } },
  user(g, x, y, s, c) { circle(g, x, y - s * 0.38, s * 0.42, c); g.fillStyle = c; g.beginPath(); g.moveTo(x - s * 0.9, y + s * 0.95); g.quadraticCurveTo(x, y - s * 0.35, x + s * 0.9, y + s * 0.95); g.closePath(); g.fill(); },
  crown(g, x, y, s, c) { g.fillStyle = c; g.beginPath(); g.moveTo(x - s, y + s * 0.6); g.lineTo(x - s * 0.9, y - s * 0.4); g.lineTo(x - s * 0.4, y + s * 0.1); g.lineTo(x, y - s * 0.7); g.lineTo(x + s * 0.4, y + s * 0.1); g.lineTo(x + s * 0.9, y - s * 0.4); g.lineTo(x + s, y + s * 0.6); g.closePath(); g.fill(); },
  mail(g, x, y, s, c) { rr(g, x - s, y - s * 0.7, s * 2, s * 1.4, s * 0.16); g.fillStyle = c; g.fill(); g.strokeStyle = '#fff'; g.lineWidth = s * 0.11; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x - s * 0.9, y - s * 0.5); g.lineTo(x, y + s * 0.15); g.lineTo(x + s * 0.9, y - s * 0.5); g.stroke(); },
  zip(g, x, y, s, c) { rr(g, x - s * 0.8, y - s, s * 1.6, s * 2, s * 0.16); g.fillStyle = c; g.fill(); for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#fff' : alpha('#fff', 0.4); g.fillRect(x - s * 0.1 + (i % 2) * s * 0.12, y - s * 0.9 + i * s * 0.2, s * 0.14, s * 0.14); } rr(g, x - s * 0.2, y + s * 0.15, s * 0.4, s * 0.5, s * 0.08); g.fillStyle = '#fff'; g.fill(); },
  gear(g, x, y, s, c) { g.fillStyle = c; for (let i = 0; i < 8; i++) { g.save(); g.translate(x, y); g.rotate(i * Math.PI / 4); g.fillRect(-s * 0.16, -s * 1.0, s * 0.32, s * 0.45); g.restore(); } circle(g, x, y, s * 0.7, c); circle(g, x, y, s * 0.3, '#fff'); },
  check(g, x, y, s, c, w = 0.2) { g.strokeStyle = c; g.lineWidth = s * w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x - s * 0.7, y + s * 0.05); g.lineTo(x - s * 0.2, y + s * 0.55); g.lineTo(x + s * 0.75, y - s * 0.5); g.stroke(); },
  cross(g, x, y, s, c, w = 0.2) { g.strokeStyle = c; g.lineWidth = s * w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - s * 0.6, y - s * 0.6); g.lineTo(x + s * 0.6, y + s * 0.6); g.moveTo(x + s * 0.6, y - s * 0.6); g.lineTo(x - s * 0.6, y + s * 0.6); g.stroke(); },
  bookmark(g, x, y, s, c) { g.fillStyle = c; g.beginPath(); g.moveTo(x - s * 0.6, y - s); g.lineTo(x + s * 0.6, y - s); g.lineTo(x + s * 0.6, y + s); g.lineTo(x, y + s * 0.55); g.lineTo(x - s * 0.6, y + s); g.closePath(); g.fill(); },
  coin(g, x, y, s, c) { circle(g, x, y, s, c); ring(g, x, y, s * 0.72, s * 0.09, 'rgba(255,255,255,.7)'); text(g, '₹', x, y + s * 0.04, { size: s * 1.15, font: FONTS.ui, weight: 900, color: '#fff' }); },
  lock(g, x, y, s, c) { g.strokeStyle = c; g.lineWidth = s * 0.2; g.beginPath(); g.arc(x, y - s * 0.2, s * 0.5, Math.PI, 0); g.stroke(); rr(g, x - s * 0.8, y - s * 0.1, s * 1.6, s * 1.1, s * 0.18); g.fillStyle = c; g.fill(); circle(g, x, y + s * 0.4, s * 0.16, '#fff'); },
  chart(g, x, y, s, c) { for (let i = 0; i < 4; i++) { const h = (0.5 + i * 0.4) * s; rr(g, x - s + i * s * 0.55, y + s - h, s * 0.4, h, s * 0.08); g.fillStyle = c; g.fill(); } },
  card(g, x, y, s, c) { rr(g, x - s, y - s * 0.65, s * 2, s * 1.3, s * 0.18); g.fillStyle = c; g.fill(); g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(x - s, y - s * 0.3, s * 2, s * 0.28); rr(g, x - s * 0.8, y + s * 0.2, s * 0.6, s * 0.2, s * 0.06); g.fillStyle = '#fff'; g.fill(); },
  cart(g, x, y, s, c) { g.strokeStyle = c; g.lineWidth = s * 0.16; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x - s, y - s * 0.7); g.lineTo(x - s * 0.7, y - s * 0.7); g.lineTo(x - s * 0.4, y + s * 0.3); g.lineTo(x + s * 0.7, y + s * 0.3); g.lineTo(x + s * 0.9, y - s * 0.35); g.lineTo(x - s * 0.6, y - s * 0.35); g.stroke(); circle(g, x - s * 0.2, y + s * 0.75, s * 0.14, c); circle(g, x + s * 0.55, y + s * 0.75, s * 0.14, c); },
};
export function iconBubble(g, x, y, r, name, col, k = 1, ic = '#fff') { if (k <= 0.01) return; g.save(); g.translate(x, y); g.scale(k, k); shadowed(g, () => circle(g, 0, 0, r, col), 26, 10); (ICONS[name] || ICONS.check)(g, 0, 0, r * 0.52, ic); g.restore(); }

// ---------- confetti / sparkle ----------
export function confetti(g, t, t0, x, y, o = {}) {
  if (t < t0) return; const r = rng(o.seed || 3), n = o.n || 70, dt = t - t0, cols = [C.coral, C.yellow, C.teal, C.blue, C.purple, C.pink, C.orange];
  for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, sp = 500 + r() * 900, px = x + Math.cos(a) * sp * dt, py = y + Math.sin(a) * sp * dt - 500 * dt + 1300 * dt * dt;
    g.save(); g.translate(px, py); g.rotate(dt * (4 + r() * 8)); g.globalAlpha = clamp(1.7 - dt * 0.75); g.fillStyle = cols[i % cols.length]; g.fillRect(-9, -5, 18, 10); g.restore(); }
}
export function sparkle(g, x, y, s, col = '#fff', a = 0.95) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, x, y, s * 0.9, col, a * 0.55); seg(g, [[x - s, y], [x + s, y]], s * 0.07, alpha(col, a)); seg(g, [[x, y - s], [x, y + s]], s * 0.07, alpha(col, a)); g.restore(); }

// ---------- logo ----------
export const logo = new Image(); logo.src = '/project/input/logo.png'; await new Promise((r) => { logo.onload = r; logo.onerror = r; });
export function logoCard(g, cx, cy, w, a = 1) {
  if (!logo.naturalWidth) return; g.save(); g.globalAlpha *= a; g.translate(cx, cy);
  g.shadowColor = 'rgba(80,40,0,.25)'; g.shadowBlur = 40; g.shadowOffsetY = 16; rr(g, -w / 2, -w / 2, w, w, w * 0.08); g.fillStyle = '#fffaf1'; g.fill(); g.shadowColor = 'transparent';
  rr(g, -w / 2, -w / 2, w, w, w * 0.08); g.clip(); g.drawImage(logo, -w / 2, -w / 2, w, w); g.restore();
}

// ---------- captions: speaker chip + up to 3 words, current word highlighted (needs E.words with spk) ----------
let GROUPS = null;
function groups() {
  if (GROUPS) return GROUPS; GROUPS = []; let cur = [];
  (E.words || []).forEach((w, i, arr) => { const prev = arr[i - 1];
    if (cur.length && (cur.length >= 3 || w.start - prev.end > 0.25 || /[.?!,:—]$/.test(prev.word) || w.spk !== prev.spk)) { GROUPS.push(cur); cur = []; }
    cur.push(w); });
  if (cur.length) GROUPS.push(cur); return GROUPS;
}
export function caps(g, gt, o = {}) {
  const gs = groups(); const idx = gs.findIndex((gp, i) => gt >= gp[0].start - 0.06 && gt < (gs[i + 1] ? Math.min(gs[i + 1][0].start - 0.06, gp[gp.length - 1].end + 0.45) : gp[gp.length - 1].end + 0.5));
  if (idx < 0) return; const grp = gs[idx], sp = SPK[grp[0].spk] || SPK.O, y = o.y || E.H * 0.8, size = 80;
  const strs = grp.map((w) => w.word.replace(/\.\.\.$/, '…').replace(/[—]/g, '-')), ws = strs.map((s) => measure(g, s, size, FONTS.title, 700)), gap = 24;
  const total = ws.reduce((a, b) => a + b, 0) + gap * (strs.length - 1), sc = Math.min(1, (E.W * 0.9) / (total + 90)), k = ease.outBack(clamp((gt - grp[0].start + 0.06) / 0.2));
  g.save(); g.translate(E.W / 2, y); g.scale(sc * (0.88 + 0.12 * k), sc * (0.88 + 0.12 * k));
  g.font = `900 32px "${FONTS.ui}"`; const cw = g.measureText(sp.name).width + 50; rr(g, -cw / 2, -size - 44, cw, 50, 25); g.fillStyle = sp.col; g.fill(); text(g, sp.name, 0, -size - 18, { size: 32, font: FONTS.ui, weight: 900, color: '#fff', spacing: 3 });
  shadowed(g, () => { rr(g, -total / 2 - 44, -size * 0.78, total + 88, size * 1.56, size * 0.52); g.fillStyle = 'rgba(255,255,255,.98)'; g.fill(); }, 24, 8, 'rgba(0,0,0,.18)');
  rr(g, -total / 2 - 44, -size * 0.78, total + 88, size * 1.56, size * 0.52); g.lineWidth = 5; g.strokeStyle = alpha(sp.col, 0.9); g.stroke();
  let x = -total / 2; grp.forEach((w, i) => { const on = gt >= w.start - 0.03, cur = on && (i === grp.length - 1 || gt < grp[i + 1].start - 0.03);
    if (cur) { rr(g, x - 14, -size * 0.62, ws[i] + 28, size * 1.24, 20); g.fillStyle = sp.col; g.fill(); }
    text(g, strs[i], x + ws[i] / 2, 4, { size, weight: 700, color: cur ? '#fff' : on ? C.ink : alpha(C.ink, 0.4) }); x += ws[i] + gap; });
  g.restore();
}
