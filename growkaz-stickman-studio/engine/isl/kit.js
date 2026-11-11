// engine/isl/kit.js — Islamic story kit (faceless silhouettes with a sun/moon of light for the face, night scenes,
// map journeys, split-screen cards, Arabic calligraphy, captions). Everything draws in logical 1080x1920 units.
import { E, rr, circle, ring, seg, poly, text, measure, ease, prog, clamp, lerp, alpha, mix, glow, linGrad, radGrad, rng, noise, layer } from '/engine/core.js';

// ---------- palette / fonts ----------
export const P = {
  ink: '#05070d', night0: '#03050d', night1: '#0a1530', night2: '#12385a', gold: '#ffd36e', goldD: '#c8902e', cream: '#fff3d0',
  sand: '#d9a35a', teal: '#1fb59a', deep: '#071a22', moon: '#e8f1ff', red: '#ff5a4d',
};
export const FONT = 'Fredoka", "Amiri';        // Latin from Fredoka, Arabic glyphs fall back to Amiri (also covers the honorific signs)
export const AR = 'Amiri';
for (const [w, f] of [['400', 'amiri-arabic-400-normal.woff2'], ['700', 'amiri-arabic-700-normal.woff2']]) {
  try { const ff = new FontFace('Amiri', `url(/node_modules/@fontsource/amiri/files/${f})`, { weight: w }); await ff.load(); document.fonts.add(ff); } catch (e) { console.log('amiri missing', f); }
}

// ---------- tiny helpers ----------
export const spring = (t, t0, f = 7.5, d = 0.5) => { const x = t - t0; if (x <= 0) return 0; const w = f * Math.sqrt(1 - d * d); return 1 - Math.exp(-d * f * x) * (Math.cos(w * x) + (d / Math.sqrt(1 - d * d)) * Math.sin(w * x)); };
export const at = (info, gt) => gt - info.shot.start;                    // global time -> shot-local time
export const shakeXY = (t, t0, amp = 16, dur = 0.35) => { const k = t > t0 ? clamp(1 - (t - t0) / dur) : 0; return [Math.sin(t * 95) * amp * k, Math.cos(t * 77) * amp * k]; };
export const cam = (t, dur, a, b, e = ease.inOut) => { const k = e(clamp(t / dur)); return { x: lerp(a.x || 0, b.x || 0, k), y: lerp(a.y || 0, b.y || 0, k), z: lerp(a.z || 1, b.z || 1, k), r: lerp(a.r || 0, b.r || 0, k) }; };
const BIG = (g) => { g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); };

// ---------- sky, stars, land ----------
export function skyNight(g, t, o = {}) {
  const { top = '#02040b', mid = '#0a1838', bot = '#1d4f78', horizon = 0.66, stars = 150, seed = 7, shooting = null } = o;
  g.fillStyle = linGrad(g, 0, -E.H * 0.2, 0, E.H * horizon, [top, mid, bot]); BIG(g);
  const r = rng(seed);
  for (let i = 0; i < stars; i++) {
    const x = r() * E.W * 1.9 - E.W * 0.45, y = r() * E.H * horizon * 0.95, s = 1 + r() * 3.2, ph = r() * 6.28, f = 0.8 + r() * 2.4;
    const a = 0.35 + 0.65 * Math.abs(Math.sin(t * f + ph)); circle(g, x, y, s, alpha('#ffffff', a * 0.9));
    if (s > 3.1) glow(g, x, y, s * 5, '#cfe0ff', a * 0.5);
  }
  if (shooting != null) { const k = prog(t, shooting, shooting + 0.7); if (k > 0 && k < 1) { const x = lerp(E.W * 0.9, E.W * 0.1, k), y = lerp(E.H * 0.05, E.H * 0.3, k); seg(g, [[x, y], [x + 190, y - 100]], 5, alpha('#ffffff', 0.9 * (1 - k))); glow(g, x, y, 40, '#fff', 0.8 * (1 - k)); } }
}
export function skyDay(g, t, o = {}) { g.fillStyle = linGrad(g, 0, 0, 0, E.H * 0.7, o.cols || ['#1b3a66', '#e8a35f', '#ffd9a0']); BIG(g); }
// silhouette ridge (mountains / dunes). baseY = lowest point of the ridge top line, amp = height of peaks
export function ridge(g, baseY, amp, col, seed = 1, o = {}) {
  const { x0 = -400, x1 = E.W + 400, step = 22, f = 0.0042, rough = 0.55, scroll = 0, bottom = E.H * 1.7, rim = null } = o;
  g.beginPath(); g.moveTo(x0, bottom);
  const pts = [];
  for (let x = x0; x <= x1; x += step) { const xs = x + scroll; const n = noise(xs * f, seed) * 0.62 + noise(xs * f * 2.9, seed + 3) * 0.28 * rough + noise(xs * f * 7, seed + 8) * 0.1 * rough; const y = baseY - amp * (0.5 + 0.5 * n); pts.push([x, y]); g.lineTo(x, y); }
  g.lineTo(x1, bottom); g.closePath(); g.fillStyle = col; g.fill();
  if (rim) { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.strokeStyle = rim; g.lineWidth = 3; g.stroke(); }
  return pts;
}
export function palm(g, x, y, s = 1, t = 0, col = '#04060c') {
  g.save(); g.translate(x, y); g.scale(s, s); const sway = Math.sin(t * 0.9 + x) * 0.04;
  seg(g, [[0, 0], [10, -120], [4 + 20 * sway * 10, -250]], 16, col);
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.5 + sway; const L = 130 + (i % 2) * 20; g.beginPath(); g.moveTo(8, -250); g.quadraticCurveTo(8 + Math.cos(a) * L * 0.6, -250 + Math.sin(a) * L * 0.6 - 30, 8 + Math.cos(a) * L, -250 + Math.sin(a) * L + 40); g.quadraticCurveTo(8 + Math.cos(a) * L * 0.5, -250 + Math.sin(a) * L * 0.5 + 6, 8, -246); g.fillStyle = col; g.fill(); }
  g.restore();
}

// ---------- the light-orb face: sun (Prophet) / moon (Sahaba) ----------
export function orb(g, x, y, r, kind, t, talk = 0) {
  const k = 1 + 0.07 * talk;
  if (kind === 'sun') {
    glow(g, x, y, r * (4.6 + talk), '#ffcf6a', 0.6 + 0.2 * talk);
    g.save(); g.translate(x, y); g.rotate(t * 0.28); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, L = r * (i % 2 ? 2.0 : 2.5); poly(g, [[Math.cos(a - 0.07) * r * 1.1, Math.sin(a - 0.07) * r * 1.1], [Math.cos(a) * L, Math.sin(a) * L], [Math.cos(a + 0.07) * r * 1.1, Math.sin(a + 0.07) * r * 1.1]], alpha('#ffd36e', 0.5)); }
    g.restore();
    circle(g, x, y, r * k, radGrad(g, x - r * 0.25, y - r * 0.25, 0, r * 1.05 * k, ['#fffdf0', '#ffe9a0', '#ffb73a']));
  } else if (kind === 'moon') {
    glow(g, x, y, r * (3.8 + talk * 0.8), '#bcd4ff', 0.55 + 0.2 * talk);
    circle(g, x, y, r * k, radGrad(g, x - r * 0.3, y - r * 0.3, 0, r * 1.1 * k, ['#ffffff', '#e9f1ff', '#aebfe0']));
    for (const [dx, dy, rr2] of [[-0.35, -0.2, 0.2], [0.3, 0.1, 0.26], [-0.1, 0.45, 0.14], [0.35, -0.45, 0.1]]) circle(g, x + dx * r, y + dy * r, rr2 * r, 'rgba(110,130,170,.16)');
    circle(g, x, y, r * k, radGrad(g, x + r * 0.5, y + r * 0.5, r * 0.2, r * 1.3, ['rgba(20,30,60,0)', 'rgba(20,30,60,.28)']));
  } else circle(g, x, y, r, '#0a0c14');
}

// faceless silhouette person. (x, y) = feet. s = scale (1 = about 440 px tall). kind: 'sun' | 'moon' | 'plain'
export function figure(g, t, o) {
  const { x, y, s = 1, kind = 'moon', face = 1, walk = 0, talk = 0, arm = 0, tilt = 0, robe = '#070a12', turban = '#0e1424', lookUp = 0 } = o;
  const rimCol = kind === 'sun' ? '#ffd36e' : kind === 'moon' ? '#cfe0ff' : '#6a7aa0';
  const ph = t * 7.2, wk = Math.min(1, walk), bob = wk ? -Math.abs(Math.sin(ph)) * 9 : Math.sin(t * 1.7) * -2;
  g.save(); g.translate(x, y); g.scale(face * s, s); if (tilt) g.rotate(tilt); g.translate(0, bob);
  const lf = Math.sin(ph) * 36 * wk, lift = (v) => (wk ? Math.max(0, v) * 18 : 0);
  seg(g, [[-17, -200], [-17 + lf * 0.6, -100], [-17 + lf, -16 - lift(Math.cos(ph))]], 27, robe);
  seg(g, [[17, -200], [17 - lf * 0.6, -100], [17 - lf, -16 - lift(-Math.cos(ph))]], 27, robe);
  // robe body
  const sw = Math.sin(ph) * 6 * wk + Math.sin(t * 1.3) * 2;
  g.beginPath(); g.moveTo(-58, -318); g.quadraticCurveTo(-72, -230, -82 + sw, -52); g.quadraticCurveTo(0, -30, 82 - sw, -52); g.quadraticCurveTo(72, -230, 58, -318); g.quadraticCurveTo(0, -336, -58, -318); g.closePath();
  g.fillStyle = linGrad(g, 0, -330, 0, -40, [mix(robe, rimCol, 0.34), [0.5, robe], robe]); g.fill();
  seg(g, [[-58, -318], [-71, -230], [-81 + sw, -56]], 3.5, alpha(rimCol, 0.55)); seg(g, [[58, -318], [71, -230], [81 - sw, -56]], 3.5, alpha(rimCol, 0.3));
  // arms
  const sA = Math.sin(ph) * 28 * wk;
  seg(g, [[-52, -300], [-70 + sA * 0.4, -230], [-66 + sA, -150]], 25, robe);
  const hx = lerp(62, 118, arm), hy = lerp(-150, -392, arm), ex = lerp(72, 112, arm), ey = lerp(-230, -300, arm);
  seg(g, [[52, -300], [ex - sA * 0.3 * (1 - arm), ey], [hx - sA * (1 - arm), hy]], 25, robe); circle(g, hx - sA * (1 - arm), hy, 13, robe);
  // head: light orb as the face, cloth wrapped over the top
  const hxx = 0, hyy = -374 - lookUp * 6;
  orb(g, hxx, hyy, 45, kind, t, talk);
  g.beginPath(); g.ellipse(0, hyy - 8, 56, 47, 0, Math.PI * 1.02, Math.PI * 1.98); g.closePath(); g.fillStyle = turban; g.fill();
  g.beginPath(); g.ellipse(0, hyy - 14, 58, 12, 0, 0, Math.PI * 2); g.fillStyle = turban; g.fill();
  seg(g, [[-52, hyy - 14], [0, hyy - 4], [52, hyy - 14]], 3, alpha(rimCol, 0.35));
  poly(g, [[34, hyy - 6], [66, hyy + 40], [48, hyy + 70], [40, hyy + 30]], robe);
  if (kind !== 'plain') glow(g, 0, hyy, 100, rimCol, 0.18 + 0.08 * talk);
  g.restore();
}

// pursuer's legs seen from below the knees (only feet, for the "look down at his feet" moment)
export function legs(g, t, x, y, s = 1, o = {}) {
  const { face = 1, sway = 0, col = '#04060b', rim = 'rgba(255,170,90,.6)' } = o; const b = Math.sin(t * 1.4 + x) * 4 * sway;
  g.save(); g.translate(x, y); g.scale(face * s, s);
  g.beginPath(); g.moveTo(-46, -560); g.quadraticCurveTo(-52 - b, -300, -66, -96); g.lineTo(66, -96); g.quadraticCurveTo(52 + b, -300, 46, -560); g.closePath(); g.fillStyle = col; g.fill();
  seg(g, [[46, -560], [52 + b, -300], [66, -98]], 4, rim);
  for (const fx of [-26, 30]) { seg(g, [[fx, -98], [fx + 2, -30]], 22, col); g.beginPath(); g.ellipse(fx + 14, -14, 42, 15, 0, 0, Math.PI * 2); g.fillStyle = col; g.fill(); seg(g, [[fx - 22, -22], [fx + 50, -22]], 3, rim); }
  g.restore();
}

export function cave(g, t, x, y, w, h, o = {}) {
  const { inner = 0, rim = 'rgba(160,190,255,.18)' } = o; g.save(); g.translate(x, y);
  g.beginPath(); g.moveTo(-w * 1.15, 40); g.lineTo(-w * 1.15, -h * 0.9); g.bezierCurveTo(-w * 0.8, -h * 1.7, w * 0.8, -h * 1.7, w * 1.15, -h * 0.9); g.lineTo(w * 1.15, 40); g.closePath(); g.fillStyle = '#080b13'; g.fill();
  seg(g, [[-w * 1.15, -h * 0.9], [-w * 0.8, -h * 1.45], [0, -h * 1.55], [w * 0.8, -h * 1.45], [w * 1.15, -h * 0.9]], 4, rim);
  g.beginPath(); g.moveTo(-w * 0.5, 0); g.quadraticCurveTo(-w * 0.55, -h * 1.05, 0, -h * 1.05); g.quadraticCurveTo(w * 0.55, -h * 1.05, w * 0.5, 0); g.closePath();
  g.fillStyle = linGrad(g, 0, -h, 0, 0, ['#010204', '#04060c', '#0a1020']); g.fill();
  if (inner > 0) { g.save(); g.clip(); glow(g, 0, -h * 0.35, w * 0.9, '#ffd9a0', 0.22 * inner); g.restore(); }
  seg(g, [[-w * 0.5, 0], [-w * 0.55, -h * 1.0], [0, -h * 1.05]], 3, rim);
  g.restore();
}

// ---------- map journey ----------
function catmull(pts, n = 22) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < n; k++) { const u = k / n, u2 = u * u, u3 = u2 * u; out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * u3))); }
  }
  out.push(pts[pts.length - 1]); return out;
}
export function pathAt(pts, p) { const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); const target = L[L.length - 1] * clamp(p); let i = 1; while (i < pts.length - 1 && L[i] < target) i++; const k = (target - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]); return { i, x: lerp(pts[i - 1][0], pts[i][0], k), y: lerp(pts[i - 1][1], pts[i][1], k), total: L[L.length - 1] }; }
export function drawRoute(g, t, ctrl, p, o = {}) {
  const pts = catmull(ctrl), cur = pathAt(pts, p), seg2 = pts.slice(0, cur.i).concat([[cur.x, cur.y]]);
  if (seg2.length > 1) {
    g.save(); g.lineJoin = 'round'; g.lineCap = 'round'; g.beginPath(); seg2.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.strokeStyle = alpha(o.col || P.gold, 0.22); g.lineWidth = 26; g.stroke(); g.setLineDash([26, 18]); g.lineDashOffset = -t * 70; g.strokeStyle = o.col || P.gold; g.lineWidth = 9; g.stroke(); g.restore();
  }
  return cur;
}
export function pin(g, t, t0, x, y, label, o = {}) {
  const k = spring(t, t0, 9, 0.55); if (k <= 0.01) return; const col = o.col || P.gold;
  g.save(); g.translate(x, y); const pr = ease.out(prog(t, t0, t0 + 1.2)); ring(g, 0, 0, 20 + 70 * pr, 5, alpha(col, 0.6 * (1 - pr)));
  g.scale(k, k); circle(g, 0, 0, 22, '#05070d'); circle(g, 0, 0, 14, col); ring(g, 0, 0, 22, 4, '#fff');
  const w = measure(g, label, 46, FONT, 700) + 56; const side = o.side || 1; g.translate(side * (w / 2 + 34), -6);
  rr(g, -w / 2, -36, w, 72, 36); g.fillStyle = 'rgba(5,7,13,.88)'; g.fill(); g.lineWidth = 3; g.strokeStyle = alpha(col, 0.85); g.stroke();
  text(g, label, 0, 3, { size: 46, font: FONT, weight: 700, color: '#fff' }); g.restore();
}
export function mapBase(g, t, o = {}) {
  const W = E.W, H = E.H; g.fillStyle = linGrad(g, 0, 0, 0, H, ['#0b1220', '#13202c', '#1b2a30']); BIG(g);
  // sea (left) with moving wave lines
  g.beginPath(); g.moveTo(-200, -200); g.lineTo(W * 0.34, -200);
  for (let y = -200; y <= H + 200; y += 40) g.lineTo(W * 0.3 + Math.sin(y * 0.006 + 1) * 120 + Math.sin(y * 0.017) * 36 + (y * 0.05), y);
  g.lineTo(-200, H + 200); g.closePath(); g.fillStyle = '#0b3a5a'; g.fill();
  g.save(); g.clip(); for (let i = 0; i < 26; i++) { const yy = ((i * 97 + t * 14) % (H + 400)) - 200; seg(g, [[40 + (i * 53) % 400, yy], [120 + (i * 53) % 400, yy + 6]], 3, 'rgba(160,220,255,.16)'); } g.restore();
  // land texture: contour lines + mountain marks
  g.save(); g.globalAlpha = 0.5; for (let k = 0; k < 9; k++) { g.beginPath(); for (let x = W * 0.3; x <= W + 100; x += 30) { const y = H * (0.1 + k * 0.105) + noise(x * 0.004 + k, 5) * 70; x === W * 0.3 ? g.moveTo(x, y) : g.lineTo(x, y); } g.strokeStyle = 'rgba(255,214,150,.08)'; g.lineWidth = 3; g.stroke(); } g.restore();
  const r = rng(11); for (let i = 0; i < 46; i++) { const x = W * 0.36 + r() * W * 0.7, y = r() * H, s = 14 + r() * 22; poly(g, [[x - s, y + s * 0.6], [x, y - s * 0.7], [x + s, y + s * 0.6]], 'rgba(255,214,150,.13)'); }
  for (let gx = 0; gx < W; gx += 120) seg(g, [[gx, 0], [gx, H]], 1.5, 'rgba(255,255,255,.04)'); for (let gy = 0; gy < H; gy += 120) seg(g, [[0, gy], [W, gy]], 1.5, 'rgba(255,255,255,.04)');
  // compass
  g.save(); g.translate(W - 130, 330); ring(g, 0, 0, 52, 3, alpha(P.gold, 0.6)); poly(g, [[0, -50], [10, 0], [0, 50], [-10, 0]], alpha(P.gold, 0.5)); text(g, 'N', 0, -78, { size: 34, font: FONT, color: P.gold, weight: 700 }); g.restore();
}

// space map (Earth + Moon orbit), used by the science sample
export function stars(g, t, seed = 5, n = 120, a = 1) { const r = rng(seed); for (let i = 0; i < n; i++) { const x = r() * E.W, y = r() * E.H, s = 1 + r() * 2.8, ph = r() * 6, f = 0.7 + r() * 2; circle(g, x, y, s, alpha('#fff', a * (0.3 + 0.7 * Math.abs(Math.sin(t * f + ph))))); } }
export function earth(g, t, x, y, r) {
  glow(g, x, y, r * 2.2, '#4fa3ff', 0.35);
  g.save(); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.clip();
  g.fillStyle = radGrad(g, x - r * 0.35, y - r * 0.35, r * 0.1, r * 1.15, ['#5db2ff', '#1f66b8', '#0a2c63']); g.fillRect(x - r, y - r, r * 2, r * 2);
  const off = (t * 22) % (r * 2.6); for (const [bx, by, br] of [[-0.2, -0.2, 0.42], [0.5, 0.25, 0.34], [-0.6, 0.45, 0.28], [0.1, 0.65, 0.2]]) for (const sh of [-r * 2.6, 0]) circle(g, x + bx * r + off + sh - r * 0.3, y + by * r, br * r, 'rgba(70,170,110,.82)');
  g.fillStyle = radGrad(g, x + r * 0.55, y + r * 0.4, r * 0.2, r * 1.3, ['rgba(0,10,40,0)', 'rgba(0,10,40,.55)']); g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
  ring(g, x, y, r + 2, 3, 'rgba(150,210,255,.55)');
}
export function galaxy(g, t, x, y, R, o = {}) {
  const { sunAng = t * 0.9, arms = 2, n = 420 } = o; const r = rng(3);
  glow(g, x, y, R * 0.9, '#b48cff', 0.28); glow(g, x, y, R * 0.35, '#ffe9b0', 0.55);
  g.save(); g.translate(x, y); g.rotate(t * 0.05); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) { const arm = i % arms, u = Math.pow(r(), 0.8), a = arm * (Math.PI * 2 / arms) + u * 5.2 + (r() - 0.5) * 0.45, rad = u * R, s = 1.5 + r() * 3; circle(g, Math.cos(a) * rad, Math.sin(a) * rad * 0.62, s, alpha(r() > 0.5 ? '#bcd0ff' : '#ffd9a8', 0.5 * (1 - u * 0.55))); }
  g.restore();
  g.save(); g.translate(x, y); g.scale(1, 0.62); g.setLineDash([14, 14]); ring(g, 0, 0, R * 0.62, 3, 'rgba(255,211,110,.7)'); g.setLineDash([]); g.restore();
  const sx = x + Math.cos(sunAng) * R * 0.62, sy = y + Math.sin(sunAng) * R * 0.62 * 0.62; glow(g, sx, sy, 60, '#ffcf6a', 0.9); circle(g, sx, sy, 15, '#fff2b0');
  return [sx, sy];
}

// ---------- panels / cards ----------
export function panel(g, x, y, w, h, fn, o = {}) {
  g.save(); rr(g, x, y, w, h, o.r ?? 40); g.clip(); g.translate(x, y); fn(g, w, h); g.restore();
  g.save(); rr(g, x, y, w, h, o.r ?? 40); g.lineWidth = 5; g.strokeStyle = alpha(o.col || P.gold, 0.75); g.stroke(); g.restore();
}
function star8(g, x, y, r, rot, col, lw = 2) { g.save(); g.translate(x, y); g.rotate(rot); g.strokeStyle = col; g.lineWidth = lw; for (let k = 0; k < 2; k++) { g.beginPath(); for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + k * Math.PI / 4; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.stroke(); } g.restore(); }
export function geoBackdrop(g, w, h, t, a = 0.07, col = P.gold) { for (let gx = 0; gx <= w + 120; gx += 120) for (let gy = 0; gy <= h + 120; gy += 120) star8(g, gx, gy, 46, Math.PI / 8 + t * 0.02, alpha(col, a), 2); }
// Arabic lines revealed right-to-left. lines: [string]; reveal 0..1
export function arabicBlock(g, lines, cx, cy, maxW, o = {}) {
  let size = o.size || 84; g.save(); g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const wOf = (s, sz) => { g.font = `700 ${sz}px "Amiri"`; return g.measureText(s).width; };
  const widest = Math.max(...lines.map((s) => wOf(s, size))); if (widest > maxW) size *= maxW / widest;
  const lh = size * 1.75, y0 = cy - ((lines.length - 1) * lh) / 2, rv = clamp(o.reveal ?? 1);
  lines.forEach((s, i) => {
    const w = wOf(s, size), segK = clamp(rv * lines.length - i); if (segK <= 0) return;
    g.save(); g.beginPath(); g.rect(cx + w / 2 + 20 - (w + 40) * segK, y0 + i * lh - lh, (w + 40) * segK, lh * 2); g.clip();
    g.font = `700 ${size}px "Amiri"`; g.fillStyle = o.color || P.cream; g.shadowColor = o.glow || 'rgba(255,211,110,.7)'; g.shadowBlur = o.blur ?? 26; g.fillText(s, cx, y0 + i * lh); g.restore();
  });
  g.restore(); return size;
}
export function refChip(g, label, cx, cy, k = 1, col = P.gold) {
  if (k <= 0.01) return; g.save(); g.translate(cx, cy); g.scale(k, k); const w = measure(g, label, 38, FONT, 700) + 64;
  rr(g, -w / 2, -34, w, 68, 34); g.fillStyle = alpha(col, 0.95); g.fill(); text(g, label, 0, 3, { size: 38, font: FONT, weight: 700, color: '#1a1205' }); g.restore();
}
export function wrap(g, str, maxW, size, font = FONT, weight = 700) { const out = []; let line = ''; for (const w of str.split(' ')) { const tryL = line ? line + ' ' + w : w; if (measure(g, tryL, size, font, weight) > maxW && line) { out.push(line); line = w; } else line = tryL; } if (line) out.push(line); return out; }
export function textBlock(g, str, cx, cy, maxW, size, o = {}) { const ls = wrap(g, str, maxW, size, o.font || FONT, o.weight || 700), lh = size * 1.3, y0 = cy - ((ls.length - 1) * lh) / 2; ls.forEach((l, i) => text(g, l, cx, y0 + i * lh, { size, font: o.font || FONT, weight: o.weight || 700, color: o.color || '#fff', alpha: o.alpha ?? 1 })); }
export function card(g, t, w, h, o = {}) {   // dark teal card background for ayat / hadith panels
  g.fillStyle = linGrad(g, 0, 0, w, h, ['#06222a', '#0a3a3c', '#061a22']); g.fillRect(0, 0, w, h); geoBackdrop(g, w, h, t, 0.06);
  g.strokeStyle = alpha(P.gold, 0.45); g.lineWidth = 3; rr(g, 22, 22, w - 44, h - 44, 28); g.stroke();
  if (o.title) { rr(g, 40, 38, measure(g, o.title, 34, FONT, 700) + 50, 52, 26); g.fillStyle = alpha(P.gold, 0.95); g.fill(); text(g, o.title, 65, 66, { size: 34, font: FONT, weight: 700, color: '#1a1205', align: 'left' }); }
}

// ---------- text effects ----------
// words slam in one by one. instant: everything already fully shown at t0 (for frame 1)
export function kinetic(g, t, t0, str, x, y, o = {}) {
  const words = str.split(' '), size0 = o.size || 96, font = o.font || FONT, weight = o.weight || 700, gap = size0 * 0.3, stag = o.stagger ?? 0.1;
  let ws = words.map((w) => measure(g, w, size0, font, weight)), total = ws.reduce((a, b) => a + b, 0) + gap * (words.length - 1);
  const sc = o.maxW ? Math.min(1, o.maxW / total) : 1, size = size0 * sc; ws = ws.map((w) => w * sc); total *= sc; let xx = x - total / 2;
  words.forEach((w, i) => {
    const k = o.instant ? 1 : spring(t, t0 + i * stag, 9, 0.5), a = o.instant ? 1 : clamp((t - t0 - i * stag) * 7); if (a <= 0) { xx += ws[i] + gap * sc; return; }
    g.save(); g.translate(xx + ws[i] / 2, y + (1 - Math.min(1, k)) * size * 0.5); g.scale(Math.max(0.01, k), Math.max(0.01, k));
    text(g, w, 0, 0, { size, font, weight, color: (o.hi && o.hi[i]) || o.color || '#fff', alpha: a, stroke: o.stroke ?? 12, strokeColor: o.strokeColor || 'rgba(3,5,12,.95)', glow: o.glow || 0, glowColor: o.glowColor }); g.restore(); xx += ws[i] + gap * sc;
  });
  return total;
}

// ---------- captions (burned in, up to 3 words, current word highlighted) ----------
let CAP = null;
function capWords() {
  if (CAP) return CAP; const norm = (w) => w.toLowerCase().replace(/[^a-z]/g, ''); const src = E.words, out = [];
  for (let i = 0; i < src.length; i++) {
    const w = src[i], n = norm(w.word);
    if (n === 'sallallahu' && norm(src[i + 1]?.word || '') === 'alaihi' && norm(src[i + 2]?.word || '') === 'wasallam') { out.push({ word: 'ﷺ', start: w.start, end: src[i + 2].end, spk: w.spk }); i += 2; continue; }
    if (n === 'radiyallahu' && norm(src[i + 1]?.word || '') === 'anhu') { out.push({ word: 'رضي الله عنه', start: w.start, end: src[i + 1].end, spk: w.spk }); i += 1; continue; }
    out.push({ ...w });
  }
  const groups = []; let cur = [];
  for (const w of out) { cur.push(w); if (cur.length >= 3 || /[.?!:,…]$/.test(w.word)) { groups.push(cur); cur = []; } }
  if (cur.length) groups.push(cur); CAP = groups; return CAP;
}
export function captions(g, gt, o = {}) {
  const gs = capWords(); const idx = gs.findIndex((gp, i) => gt >= gp[0].start - 0.05 && gt < (gs[i + 1] ? Math.min(gs[i + 1][0].start - 0.05, gp[gp.length - 1].end + 0.4) : gp[gp.length - 1].end + 0.5));
  if (idx < 0) return; const grp = gs[idx], y = o.y ?? 1330, size = o.size || 84; const spk = grp[0].spk, names = (E.cfg.speakers || {}), chip = spk && spk !== 'narrator' ? names[spk] || spk : null;
  const ws = grp.map((w) => measure(g, w.word, size, FONT, 700)), gap = 26, total = ws.reduce((a, b) => a + b, 0) + gap * (grp.length - 1), sc = Math.min(1, (E.W * 0.9) / (total + 80)), k = ease.outBack(clamp((gt - grp[0].start + 0.05) / 0.18));
  g.save(); g.translate(E.W / 2, y); g.scale(sc * (0.9 + 0.1 * k), sc * (0.9 + 0.1 * k));
  if (chip) { const cw = measure(g, chip, 36, FONT, 700) + 56; rr(g, -cw / 2, -size - 40, cw, 56, 28); g.fillStyle = P.teal; g.fill(); text(g, chip, 0, -size - 12, { size: 36, font: FONT, weight: 700, color: '#04120f' }); }
  rr(g, -total / 2 - 44, -size * 0.8, total + 88, size * 1.6, size * 0.5); g.fillStyle = 'rgba(4,8,16,.82)'; g.fill(); g.lineWidth = 4; g.strokeStyle = alpha(P.gold, 0.8); g.stroke();
  let x = -total / 2; grp.forEach((w, i) => { const on = gt >= w.start - 0.03, cur = on && (i === grp.length - 1 || gt < grp[i + 1].start - 0.03);
    if (cur) { rr(g, x - 14, -size * 0.64, ws[i] + 28, size * 1.28, 20); g.fillStyle = P.gold; g.fill(); }
    text(g, w.word, x + ws[i] / 2, 4, { size, font: FONT, weight: 700, color: cur ? '#1a1205' : on ? '#fff' : 'rgba(255,255,255,.35)' }); x += ws[i] + gap; });
  g.restore();
}

// comment-question card for the last seconds
export function questionCard(g, t, t0, str, cx = E.W / 2, cy = 1210) {
  const k = spring(t, t0, 8, 0.6); if (k <= 0.01) return; g.save(); g.translate(cx, cy); g.scale(k, k);
  const w = 900, h = 330; rr(g, -w / 2, -h / 2, w, h, 48); g.fillStyle = 'rgba(4,8,16,.9)'; g.fill(); g.lineWidth = 6; g.strokeStyle = P.gold; g.stroke();
  rr(g, -200, -h / 2 - 34, 400, 68, 34); g.fillStyle = P.gold; g.fill(); text(g, 'COMMENT ME LIKHO', 0, -h / 2 + 2, { size: 34, font: FONT, weight: 700, color: '#1a1205' });
  textBlock(g, str, 0, 10, w - 100, 58, { color: '#fff' });
  const bob = Math.sin(t * 6) * 10; poly(g, [[-30, h / 2 + 24 + bob], [30, h / 2 + 24 + bob], [0, h / 2 + 62 + bob]], P.gold); g.restore();
}
// calligraphy with glow + rotating geometry
export function calligraphy(g, t, lines, cx, cy, maxW, o = {}) {
  star8(g, cx, cy, o.R || 420, t * 0.12, alpha(P.gold, 0.18), 3); star8(g, cx, cy, (o.R || 420) * 0.8, -t * 0.1, alpha(P.gold, 0.14), 2);
  glow(g, cx, cy, 420, P.gold, 0.18 + 0.06 * Math.sin(t * 2)); return arabicBlock(g, lines, cx, cy, maxW, o);
}

export function withCam(g, c, fn) { g.save(); g.translate(E.W / 2, E.H / 2); if (c.r) g.rotate(c.r); g.scale(c.z || 1, c.z || 1); g.translate(-E.W / 2 - (c.x || 0), -E.H / 2 - (c.y || 0)); fn(g); g.restore(); }
export function tag(g, label, cx, cy, k = 1, col = P.gold) { if (k <= 0.01) return; g.save(); g.translate(cx, cy); g.scale(k, k); const w = measure(g, label, 40, FONT, 700) + 70; rr(g, -w / 2, -36, w, 72, 36); g.fillStyle = 'rgba(4,8,16,.85)'; g.fill(); g.lineWidth = 4; g.strokeStyle = col; g.stroke(); text(g, label, 0, 3, { size: 40, font: FONT, weight: 700, color: col }); g.restore(); }
// torch flame glow for pursuers
export function torch(g, t, x, y, s = 1) { const f = 0.8 + 0.2 * Math.sin(t * 23 + x) + 0.1 * Math.sin(t * 41); glow(g, x, y, 260 * s * f, '#ff8a2a', 0.55); glow(g, x, y, 90 * s * f, '#ffd08a', 0.8); }
