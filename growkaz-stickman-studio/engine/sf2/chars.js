// engine/sf2/chars.js — v2 characters: illustrated 2D people with arms, hands and gestures.
// Usage in a shot:  import { drawPerson, gestAt, LOOKS } from '/engine/sf2/chars.js';
//   drawPerson(g, t, 'client', { x, y, R: 165, flip: false, gest: gestAt(t, [[0,'rest'],[0.6,'explain'],[2,'point']]), mt: info.globalT, talking: true, expr: {...} })
// Head centre is (x, y); R is head radius (150-200 for 9:16). Hands/arms can be hidden behind a desk by drawing the desk after.
import { E, rr, seg, circle, ring, linGrad, radGrad, alpha, shade, lerp, clamp, ease } from '/engine/core.js';

// ---------- lip-sync (visemes built from ElevenLabs character timestamps: input/visemes.json) ----------
let VIS = [];
try { VIS = await fetch('/project/input/visemes.json').then((r) => (r.ok ? r.json() : [])); } catch (e) { VIS = []; }
export function getViseme(t) {
  const v = VIS.find((x) => t >= x.s && t < x.e);
  if (!v) return 'rest';
  const c = v.c.toLowerCase();
  if ('a'.includes(c)) return 'A'; if ('ei'.includes(c)) return 'E'; if ('ou'.includes(c)) return 'O';
  if ('mbp'.includes(c)) return 'M'; if ('fv'.includes(c)) return 'F'; if (/[a-z0-9]/.test(c)) return 'C';
  return 'rest';
}
const MOUTH = { rest: [0.5, 0.02, 0.1], A: [0.42, 0.26, 0], E: [0.5, 0.14, 0.05], O: [0.26, 0.24, 0], M: [0.44, 0.0, 0], F: [0.42, 0.07, 0], C: [0.38, 0.13, 0.02] };
// fallback motion when no viseme data exists for the project (mouth still moves while "talking")
const talkFallback = (t) => { const k = Math.abs(Math.sin(t * 17)) * (0.6 + 0.4 * Math.sin(t * 5.3)); return k > 0.55 ? 'A' : k > 0.35 ? 'E' : k > 0.2 ? 'O' : 'C'; };

function mouth(g, x, y, R, t, talking, smile, openO = 0) {
  let name = talking ? (VIS.length ? getViseme(t) : talkFallback(t)) : 'rest';
  let prevName = talking ? (VIS.length ? getViseme(t - 0.04) : talkFallback(t - 0.04)) : 'rest';
  if (!talking && openO > 0.05) { name = prevName = 'O'; }
  let [w, h, sm] = MOUTH[name].map((v, i) => lerp(MOUTH[prevName][i], v, 0.65));
  if (!talking && openO > 0.05) { h *= 0.9 + 0.6 * openO; w *= 0.9 + 0.25 * openO; }
  if (talking && smile > 0.4) w *= 1 + (smile - 0.4) * 0.5;
  const W = w * R, Hh = h * R;
  if (Hh < 0.03 * R) {
    const sw = smile > 0.45 ? 1 + (smile - 0.45) : 1;
    g.strokeStyle = '#6b2e22'; g.lineWidth = 0.045 * R; g.lineCap = 'round'; g.beginPath();
    g.moveTo(x - (W / 2) * sw, y - smile * 0.1 * R); g.quadraticCurveTo(x, y + (0.04 + sm + smile * 0.32) * R, x + (W / 2) * sw, y - smile * 0.1 * R); g.stroke();
    if (smile > 0.5) { g.fillStyle = '#4a1712'; g.beginPath(); g.moveTo(x - (W / 2) * sw * 0.9, y - smile * 0.08 * R); g.quadraticCurveTo(x, y + (sm + smile * 0.36) * R, x + (W / 2) * sw * 0.9, y - smile * 0.08 * R); g.quadraticCurveTo(x, y + smile * 0.02 * R, x - (W / 2) * sw * 0.9, y - smile * 0.08 * R); g.fill(); g.save(); g.clip(); g.fillStyle = '#fff'; g.fillRect(x - W, y - smile * 0.1 * R, W * 2, smile * 0.09 * R); g.restore(); }
    return;
  }
  const cu = Math.max(0, smile - 0.3) * 0.12 * R, cd = Math.max(0, -smile - 0.1) * 0.08 * R;
  g.fillStyle = '#4a1712'; g.beginPath(); g.moveTo(x - W / 2, y - cu + cd); g.quadraticCurveTo(x, y - Hh * 0.35, x + W / 2, y - cu + cd); g.quadraticCurveTo(x, y + Hh * 1.3, x - W / 2, y - cu + cd); g.fill();
  g.save(); g.clip(); g.fillStyle = '#f6f1ea'; g.fillRect(x - W / 2, y - Hh * 0.4, W, Hh * 0.38); circle(g, x, y + Hh * 1.0, W * 0.32, '#c4544a'); g.restore();
  g.strokeStyle = '#8e3f30'; g.lineWidth = 0.03 * R; g.beginPath(); g.moveTo(x - W / 2, y); g.quadraticCurveTo(x, y + Hh * 1.3, x + W / 2, y); g.stroke();
}

function eye(g, x, y, R, look, blink, wide, sk, lash = false, squint = 0) {
  const rx = 0.2 * R * (1 + 0.08 * wide), ry = (0.13 + 0.065 * wide) * R;
  g.save(); g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fillStyle = '#fff'; g.fill(); g.clip();
  const ix = x + look[0] * 0.07 * R, iy = y + look[1] * 0.04 * R;
  circle(g, ix, iy, 0.105 * R, '#3b2314'); circle(g, ix, iy, 0.055 * R, '#120a06'); circle(g, ix + 0.035 * R, iy - 0.035 * R, 0.028 * R, '#fff');
  g.fillStyle = alpha('#000', 0.08); g.fillRect(x - rx, y - ry, rx * 2, ry * 0.45);                       // upper-lid shadow
  if (blink > 0) { g.fillStyle = sk; g.fillRect(x - rx, y - ry, rx * 2, ry * 2 * blink); }
  if (squint > 0.02) { g.fillStyle = sk; g.beginPath(); g.ellipse(x, y + ry * (1.9 - squint * 1.05), rx * 1.3, ry * 1.1, 0, 0, 7); g.fill(); }
  g.restore();
  g.strokeStyle = alpha('#3a2216', 0.75); g.lineWidth = 0.03 * R; g.lineCap = 'round'; g.beginPath(); g.ellipse(x, y, rx, ry, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
  if (lash) { seg(g, [[x + rx * 0.9, y - ry * 0.4], [x + rx * 1.25, y - ry * 0.9]], 0.03 * R, '#2a1810'); }
}


// ---------- emotions ----------
// brow: [left,right] raise · tilt: + inner ends up (worried/sad), - inner ends down (angry) · wide · squint (happy eyes)
// smile: -0.6 (frown) .. 0.9 (big grin) · openO: surprised open mouth when silent · blush · headTilt
export const EMO = {
  neutral:   { brow: [0, 0], tilt: 0, wide: 0, squint: 0, smile: 0.15, openO: 0, blush: 0, headTilt: 0 },
  happy:     { brow: [0.35, 0.35], tilt: 0.1, wide: 0.1, squint: 0.28, smile: 0.7, openO: 0, blush: 0.7, headTilt: 0.03 },
  excited:   { brow: [0.9, 0.9], tilt: 0.1, wide: 0.7, squint: 0.15, smile: 0.85, openO: 0, blush: 0.6, headTilt: -0.02 },
  surprised: { brow: [1, 1], tilt: 0.2, wide: 1, squint: 0, smile: 0, openO: 1, blush: 0.2, headTilt: -0.03 },
  shocked:   { brow: [1.1, 1.1], tilt: 0.4, wide: 1.2, squint: 0, smile: -0.1, openO: 1, blush: 0, headTilt: -0.05 },
  worried:   { brow: [0.35, 0.35], tilt: 0.75, wide: 0.3, squint: 0, smile: -0.35, openO: 0, blush: 0, headTilt: 0.04 },
  confused:  { brow: [0.9, -0.3], tilt: 0.2, wide: 0.2, squint: 0.1, smile: -0.1, openO: 0, blush: 0, headTilt: 0.08 },
  thinking:  { brow: [0.65, 0.05], tilt: 0.15, wide: 0, squint: 0.2, smile: 0.0, openO: 0, blush: 0, headTilt: 0.05 },
  proud:     { brow: [0.25, 0.25], tilt: -0.1, wide: 0, squint: 0.18, smile: 0.55, openO: 0, blush: 0.3, headTilt: -0.05 },
  angry:     { brow: [-0.2, -0.2], tilt: -0.8, wide: 0.2, squint: 0.2, smile: -0.4, openO: 0, blush: 0.4, headTilt: 0 },
  sad:       { brow: [0.2, 0.2], tilt: 0.9, wide: 0, squint: 0.15, smile: -0.5, openO: 0, blush: 0, headTilt: 0.06 },
  smirk:     { brow: [0.1, 0.5], tilt: -0.1, wide: 0, squint: 0.25, smile: 0.4, openO: 0, blush: 0, headTilt: 0.04 },
};
const mixEmo = (a, b, k) => { const o = {}; for (const key of Object.keys(EMO.neutral)) o[key] = Array.isArray(a[key]) ? [lerp(a[key][0], b[key][0], k), lerp(a[key][1], b[key][1], k)] : lerp(a[key], b[key], k); return o; };
// keys: [[time, 'emotion'], ...] -> blended emotion (0.3 s ease)
export function emoAt(t, keys, blend = 0.3) {
  let i = 0; while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
  const cur = EMO[keys[i][1]] || EMO.neutral, prev = i > 0 ? EMO[keys[i - 1][1]] || EMO.neutral : cur;
  return mixEmo(prev, cur, i > 0 ? ease.inOut(clamp((t - keys[i][0]) / blend)) : 1);
}
// number keys (head turn, nod, x position...): [[time, value], ...] eased
export function keyAt(t, keys, blend = 0.35) {
  let i = 0; while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
  const cur = keys[i][1], prev = i > 0 ? keys[i - 1][1] : cur;
  return lerp(prev, cur, i > 0 ? ease.inOut(clamp((t - keys[i][0]) / blend)) : 1);
}

// ---------- character looks ----------
export const LOOKS = {
  client: { skin: '#c98b62', skinD: '#a86d48', hair: '#1d1712', top: '#1f9e8f', topD: '#167a6e', cuff: '#f7f4ee', glasses: true, moustache: true, collar: 'shirt', hairStyle: 'short' },
  owner: { skin: '#dca074', skinD: '#b87c54', hair: '#221915', top: '#ff6b3d', topD: '#d94d20', cuff: '#c9461a', glasses: false, moustache: false, collar: 'hoodie', hairStyle: 'quiff' },
  customer: { skin: '#e0a982', skinD: '#bf8960', hair: '#16100d', top: '#8b6cff', topD: '#6b4fd6', cuff: '#6b4fd6', glasses: false, moustache: false, collar: 'kurta', hairStyle: 'long', lash: true },
  visitor: { skin: '#d9a07a', skinD: '#b47c58', hair: '#2a1d14', top: '#3a7bf2', topD: '#2a5fc4', cuff: '#2a5fc4', glasses: false, moustache: false, collar: 'tee', hairStyle: 'cap' },
};

// ---------- gestures ----------
// Each hand: p = target relative to head centre in R units (x is "outward" for that hand), hand = shape, n = fingers (count), rot = radians (0 = fingers up)
const REST = { p: [1.75, 3.7], hand: 'fist', rot: 0, n: 0 };
export const GEST = {
  rest: { r: REST, l: { ...REST }, sh: 0 },
  explain: { r: { p: [2.05, 2.05], hand: 'open', rot: -0.25 }, l: REST, sh: 0 },
  explainBoth: { r: { p: [2.1, 2.0], hand: 'open', rot: -0.3 }, l: { p: [2.1, 2.0], hand: 'open', rot: -0.3 }, sh: 0 },
  point: { r: { p: [2.2, 1.35], hand: 'point', rot: -1.05 }, l: REST, sh: 0 },
  pointUp: { r: { p: [1.9, 0.5], hand: 'point', rot: -0.15 }, l: REST, sh: 0 },
  pointDown: { r: { p: [1.55, 2.55], hand: 'point', rot: 2.6 }, l: REST, sh: 0 },
  count1: { r: { p: [1.75, 1.55], hand: 'count', n: 1, rot: -0.1 }, l: REST, sh: 0 },
  count2: { r: { p: [1.75, 1.55], hand: 'count', n: 2, rot: -0.1 }, l: REST, sh: 0 },
  count3: { r: { p: [1.75, 1.55], hand: 'count', n: 3, rot: -0.1 }, l: REST, sh: 0 },
  count4: { r: { p: [1.75, 1.55], hand: 'count', n: 4, rot: -0.1 }, l: REST, sh: 0 },
  count5: { r: { p: [1.75, 1.55], hand: 'count', n: 5, rot: -0.1 }, l: REST, sh: 0 },
  thumbs: { r: { p: [1.6, 1.6], hand: 'thumb', rot: 0 }, l: REST, sh: 0 },
  shrug: { r: { p: [2.15, 2.05], hand: 'open', rot: 0.35 }, l: { p: [2.15, 2.05], hand: 'open', rot: 0.35 }, sh: -0.12 },
  think: { r: { p: [0.55, 1.18], hand: 'fist', rot: 0.3 }, l: REST, sh: 0 },
  headHold: { r: { p: [1.0, -0.15], hand: 'open', rot: 0.6 }, l: REST, sh: 0 },
  facepalm: { r: { p: [0.35, 0.05], hand: 'open', rot: 0 }, l: REST, sh: -0.05 },
  stop: { r: { p: [1.75, 1.0], hand: 'open', rot: 0.05, big: 1.25 }, l: REST, sh: 0 },
  wave: { r: { p: [1.95, 0.95], hand: 'open', rot: 0, wob: 0.4 }, l: REST, sh: 0 },
  phone: { r: { p: [1.15, 1.7], hand: 'phone', rot: 0.1 }, l: REST, sh: 0 },
  cheer: { r: { p: [1.7, -0.7], hand: 'fist', rot: 0 }, l: { p: [1.7, -0.7], hand: 'fist', rot: 0 }, sh: -0.1 },
};
const mixHand = (a, b, k) => ({ p: [lerp(a.p[0], b.p[0], k), lerp(a.p[1], b.p[1], k)], rot: lerp(a.rot || 0, b.rot || 0, k), n: Math.round(lerp(a.n || 0, b.n || 0, k)), hand: k < 0.5 ? a.hand : b.hand, big: lerp(a.big || 1, b.big || 1, k), wob: lerp(a.wob || 0, b.wob || 0, k) });
// keys: [[time, 'name'], ...] -> blended gesture (0.28 s ease between keys)
export function gestAt(t, keys, blend = 0.28) {
  let i = 0; while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
  const cur = GEST[keys[i][1]] || GEST.rest, prev = i > 0 ? GEST[keys[i - 1][1]] || GEST.rest : cur;
  const k = i > 0 ? ease.inOut(clamp((t - keys[i][0]) / blend)) : 1;
  return { r: mixHand(prev.r, cur.r, k), l: mixHand(prev.l, cur.l, k), sh: lerp(prev.sh, cur.sh, k) };
}

// ---------- hands ----------
function finger(g, x, y, ang, len, w, col) { seg(g, [[x, y], [x + Math.sin(ang) * len, y - Math.cos(ang) * len]], w, col); }
function hand(g, x, y, R, o, look, side, t) {
  const sk = look.skin, big = o.big || 1, wob = o.wob ? Math.sin(t * 9) * o.wob : 0, rot = (o.rot || 0) + wob;
  g.save(); g.translate(x, y); g.rotate(rot * side); g.scale(side, 1); g.scale(big, big);
  const r = 0.28 * R, fw = 0.125 * R;
  if (o.hand === 'open') {
    for (let i = 0; i < 4; i++) { const a = (-0.32 + i * 0.2); finger(g, (-0.15 + i * 0.1) * R, -0.15 * R, a, (0.5 - Math.abs(i - 1.5) * 0.04) * R, fw, sk); }
    finger(g, -0.2 * R, 0.0, -1.0, 0.36 * R, fw * 1.05, sk);
    g.fillStyle = sk; g.beginPath(); g.ellipse(0, 0.02 * R, r * 1.05, r * 1.12, 0, 0, 7); g.fill();
    g.strokeStyle = alpha(look.skinD, 0.5); g.lineWidth = 0.03 * R; g.beginPath(); g.arc(0, 0.06 * R, 0.14 * R, 0.3, 2.5); g.stroke();
  } else if (o.hand === 'point') {
    circle(g, 0, 0.02 * R, r, sk); finger(g, 0.05 * R, -0.1 * R, 0.0, 0.62 * R, fw * 1.05, sk);
    for (let i = 0; i < 3; i++) circle(g, (0.08 + i * 0.07) * R, (-0.1 - i * 0.0) * R, 0.07 * R, shade(sk, -0.08));
    seg(g, [[-0.2 * R, 0.0], [-0.05 * R, -0.18 * R]], fw, sk);
  } else if (o.hand === 'count') {
    const n = o.n || 1; circle(g, 0, 0.02 * R, r, sk);
    const base = [0.05, 0.13, 0.21, 0.29];
    for (let i = 0; i < Math.min(n, 4); i++) finger(g, (-0.12 + i * 0.1) * R, -0.1 * R, -0.12 + i * 0.1, (0.58 - Math.abs(i - 1) * 0.03) * R, fw, sk);
    if (n >= 5) finger(g, -0.22 * R, -0.02 * R, -0.95, 0.4 * R, fw * 1.05, sk);
    else seg(g, [[-0.2 * R, 0.0], [-0.05 * R, -0.12 * R]], fw, sk);
    for (let i = n; i < 4; i++) circle(g, (-0.12 + i * 0.1) * R, -0.08 * R, 0.06 * R, shade(sk, -0.1));
  } else if (o.hand === 'thumb') {
    circle(g, 0, 0.04 * R, r, sk); finger(g, -0.04 * R, -0.12 * R, 0, 0.66 * R, fw * 1.6, sk);
    for (let i = 0; i < 3; i++) circle(g, (0.06 + i * 0.07) * R, (0.0) * R, 0.06 * R, shade(sk, -0.1));
  } else if (o.hand === 'phone') {
    circle(g, 0, 0.02 * R, r, sk);
    rr(g, -0.22 * R, -0.75 * R, 0.5 * R, 0.9 * R, 0.08 * R); g.fillStyle = '#16161c'; g.fill();
    rr(g, -0.18 * R, -0.7 * R, 0.42 * R, 0.78 * R, 0.05 * R); g.fillStyle = '#7fd0ff'; g.fill();
    circle(g, 0.05 * R, 0.0, r * 0.7, sk);
  } else { // fist
    circle(g, 0, 0.0, r, sk);
    for (let i = 0; i < 4; i++) circle(g, (-0.15 + i * 0.1) * R, -0.1 * R, 0.065 * R, shade(sk, -0.1));
    seg(g, [[-0.15 * R, 0.1 * R], [0.1 * R, 0.14 * R]], 0.1 * R, shade(sk, -0.05));
  }
  g.restore();
}

// 2-bone IK: returns elbow point. bendDir = +1/-1 selects which side the elbow falls on.
function elbow(sx, sy, hx, hy, a, b, bendDir) {
  let dx = hx - sx, dy = hy - sy, d = Math.hypot(dx, dy); const maxD = (a + b) * 0.999;
  if (d > maxD) { hx = sx + (dx / d) * maxD; hy = sy + (dy / d) * maxD; dx = hx - sx; dy = hy - sy; d = maxD; }
  const base = Math.atan2(dy, dx), cosA = clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1), ang = Math.acos(cosA);
  const c1 = [sx + Math.cos(base + ang) * a, sy + Math.sin(base + ang) * a], c2 = [sx + Math.cos(base - ang) * a, sy + Math.sin(base - ang) * a];
  const e = Math.abs(c1[1] - c2[1]) > 6 ? (c1[1] > c2[1] ? c1 : c2) : (Math.abs(c1[0] - sx) > Math.abs(c2[0] - sx) ? c1 : c2);   // elbow hangs down; if level, goes outward
  return { e, h: [hx, hy] };
}

function arm(g, side, hx, hy, R, spec, look, t, flip) {
  // side: +1 = character's right (screen right when not flipped)
  const dir = side * (flip ? -1 : 1);
  const lift = spec.sh || 0;
  const sx = hx + dir * 1.45 * R, sy = hy + (1.62 + lift) * R;
  const tx = hx + dir * spec.p[0] * R, ty = hy + spec.p[1] * R;
  const a = 1.3 * R, b = 1.2 * R;
  const { e, h } = elbow(sx, sy, tx, ty, a, b, -dir);
  g.lineCap = 'round'; g.lineJoin = 'round';
  seg(g, [[sx, sy], e], 0.56 * R, look.topD); seg(g, [[sx, sy], e], 0.46 * R, look.top);
  seg(g, [e, h], 0.46 * R, look.topD); seg(g, [e, h], 0.38 * R, look.top);
  // cuff
  const fa = Math.atan2(h[1] - e[1], h[0] - e[0]);
  seg(g, [[h[0] - Math.cos(fa) * 0.22 * R, h[1] - Math.sin(fa) * 0.22 * R], [h[0] - Math.cos(fa) * 0.08 * R, h[1] - Math.sin(fa) * 0.08 * R]], 0.4 * R, look.cuff);
  hand(g, h[0] + Math.cos(fa) * 0.05 * R, h[1] + Math.sin(fa) * 0.05 * R, R, spec, look, dir, t);
  return h;
}

// ---------- head + body ----------
function head(g, t, hx, hy, R, L, o) {
  const E2 = o.emo || EMO.neutral, ex = o.expr || {};
  const em = { ...E2, ...(ex.brow ? { brow: ex.brow } : {}), ...(ex.smile !== undefined ? { smile: ex.smile } : {}), ...(ex.wide !== undefined ? { wide: ex.wide } : {}) };
  const turn = clamp(o.turn || 0, -1, 1), nod = o.nod || 0, tilt = (o.tilt || 0) + (em.headTilt || 0);
  const fx = turn * 0.24 * R, fy = nod * 0.12 * R, hxh = hx + fx * 0.3;
  g.save(); g.translate(hx, hy); g.rotate(tilt); g.translate(-hx, -hy);
  for (const s of [-1, 1]) { const vis = clamp(1 - Math.max(0, s * turn) * 1.4); if (vis > 0.05) { g.fillStyle = L.skinD; g.beginPath(); g.ellipse(hx + s * 0.98 * R - fx * 0.35, hy + 0.05 * R + fy * 0.3, 0.16 * R * vis, 0.24 * R, 0, 0, 7); g.fill(); } }
  g.save(); g.beginPath(); g.ellipse(hx, hy, R * (1 - Math.abs(turn) * 0.04), 1.15 * R, 0, 0, 7); g.fillStyle = L.skin; g.fill(); g.clip();
  g.fillStyle = linGrad(g, hx - R + fx, 0, hx + R + fx, 0, [alpha('#fff', 0.1), alpha('#fff', 0), alpha(L.skinD, 0.45)]); g.fillRect(hx - R, hy - 1.2 * R, 2 * R, 2.4 * R);
  g.fillStyle = radGrad(g, hx, hy + 1.05 * R, 0, 0.8 * R, [alpha(L.skinD, 0.3), alpha(L.skinD, 0)]); g.fillRect(hx - R, hy, 2 * R, 1.3 * R);
  if (L.moustache) { g.fillStyle = alpha(L.hair, 0.1); g.beginPath(); g.ellipse(hx + fx, hy + 0.45 * R + fy, 0.85 * R, 0.65 * R, 0, 0, 7); g.fill(); }
  for (const s of [-1, 1]) circle(g, hx + s * 0.58 * R + fx * 0.8, hy + 0.32 * R + fy, 0.19 * R, alpha('#e8645a', 0.12 + 0.16 * (em.blush || 0)));
  g.restore();
  const cx = hx + fx, cy = hy + fy;
  const look = ex.look || o.lookV || [0, 0], blink = o.blink ? 1 : 0, ey = cy - 0.02 * R, sp = (L.glasses ? 0.38 : 0.36) * (1 - Math.abs(turn) * 0.12);
  const near = (s) => 1 - Math.max(0, -s * turn) * 0.18;
  for (const s of [-1, 1]) eye(g, cx + s * sp * R, ey, R * near(s), look, blink, em.wide, L.skin, L.lash, em.squint);
  g.strokeStyle = L.hair; g.lineWidth = 0.075 * R; g.lineCap = 'round';
  for (const [s, b] of [[-1, em.brow[0]], [1, em.brow[1]]]) {
    const outerY = cy - (0.28 + b * 0.13 - em.tilt * 0.07) * R, innerY = cy - (0.26 + b * 0.13 + em.tilt * 0.14) * R, midY = cy - (0.36 + b * 0.15) * R;
    g.beginPath(); g.moveTo(cx + s * 0.62 * R, outerY); g.quadraticCurveTo(cx + s * 0.38 * R, midY, cx + s * 0.18 * R, innerY); g.stroke();
  }
  if (L.glasses) { g.strokeStyle = '#1b1b22'; g.lineWidth = 0.045 * R; rr(g, cx - 0.62 * R, cy - 0.18 * R, 0.48 * R, 0.36 * R, 0.08 * R); g.stroke(); rr(g, cx + 0.14 * R, cy - 0.18 * R, 0.48 * R, 0.36 * R, 0.08 * R); g.stroke(); g.beginPath(); g.moveTo(cx - 0.14 * R, cy - 0.02 * R); g.lineTo(cx + 0.14 * R, cy - 0.02 * R); g.stroke(); g.fillStyle = alpha('#fff', 0.12); g.fillRect(cx - 0.58 * R, cy - 0.15 * R, 0.14 * R, 0.3 * R); }
  g.strokeStyle = L.skinD; g.lineWidth = 0.045 * R; g.beginPath(); g.moveTo(cx + fx * 0.15, cy - 0.05 * R); g.quadraticCurveTo(cx + 0.08 * R + fx * 0.25, cy + 0.22 * R, cx - 0.04 * R + fx * 0.2, cy + 0.26 * R); g.stroke();
  if (L.moustache) { g.fillStyle = L.hair; g.beginPath(); g.moveTo(cx - 0.42 * R, cy + 0.42 * R); g.quadraticCurveTo(cx, cy + 0.32 * R, cx + 0.42 * R, cy + 0.42 * R); g.quadraticCurveTo(cx, cy + 0.52 * R, cx - 0.42 * R, cy + 0.42 * R); g.fill(); }
  mouth(g, cx + fx * 0.1, cy + (L.moustache ? 0.55 : 0.47) * R, R, o.mt !== undefined ? o.mt : t, !!o.talking, em.smile, em.openO);
  // hair
  g.fillStyle = L.hair; g.beginPath();
  if (L.hairStyle === 'quiff') { g.moveTo(hxh - 1.02 * R, hy - 0.15 * R); g.bezierCurveTo(hxh - 1.15 * R, hy - 1.25 * R, hxh - 0.3 * R, hy - 1.5 * R, hxh + 0.3 * R, hy - 1.45 * R); g.bezierCurveTo(hxh + 0.95 * R, hy - 1.4 * R, hxh + 1.15 * R, hy - 0.85 * R, hxh + 1.02 * R, hy - 0.05 * R); g.quadraticCurveTo(hxh + 0.8 * R, hy - 0.75 * R, hxh + 0.35 * R, hy - 0.9 * R); g.quadraticCurveTo(hxh - 0.3 * R, hy - 0.95 * R, hxh - 1.02 * R, hy - 0.15 * R); }
  else if (L.hairStyle === 'long') { g.moveTo(hxh - 1.08 * R, hy - 0.05 * R); g.bezierCurveTo(hxh - 1.2 * R, hy - 1.15 * R, hxh - 0.3 * R, hy - 1.4 * R, hxh + 0.2 * R, hy - 1.38 * R); g.bezierCurveTo(hxh + 0.9 * R, hy - 1.36 * R, hxh + 1.2 * R, hy - 0.95 * R, hxh + 1.08 * R, hy - 0.05 * R); g.quadraticCurveTo(hxh + 0.6 * R, hy - 0.9 * R, hxh + 0.0 * R, hy - 0.85 * R); g.quadraticCurveTo(hxh - 0.6 * R, hy - 0.9 * R, hxh - 1.08 * R, hy - 0.05 * R); }
  else if (L.hairStyle === 'cap') { g.moveTo(hxh - 1.05 * R, hy - 0.2 * R); g.bezierCurveTo(hxh - 1.1 * R, hy - 1.2 * R, hxh + 0.9 * R, hy - 1.4 * R, hxh + 1.05 * R, hy - 0.2 * R); g.quadraticCurveTo(hxh, hy - 0.62 * R, hxh - 1.05 * R, hy - 0.2 * R); }
  else { g.moveTo(hxh - 1.05 * R, hy - 0.1 * R); g.bezierCurveTo(hxh - 1.15 * R, hy - 1.05 * R, hxh - 0.4 * R, hy - 1.35 * R, hxh + 0.2 * R, hy - 1.35 * R); g.bezierCurveTo(hxh + 0.85 * R, hy - 1.35 * R, hxh + 1.15 * R, hy - 0.95 * R, hxh + 1.05 * R, hy - 0.1 * R); g.quadraticCurveTo(hxh + 0.85 * R, hy - 0.75 * R, hxh + 0.4 * R, hy - 0.85 * R); g.quadraticCurveTo(hxh - 0.2 * R, hy - 0.85 * R, hxh - 1.05 * R, hy - 0.1 * R); }
  g.closePath(); g.fill();
  g.strokeStyle = alpha('#fff', 0.14); g.lineWidth = 0.05 * R; g.beginPath(); g.moveTo(hxh - 0.35 * R, hy - 1.02 * R); g.quadraticCurveTo(hxh + 0.1 * R, hy - 1.18 * R, hxh + 0.5 * R, hy - 1.05 * R); g.stroke();   // hair highlight
  if (L.hairStyle === 'cap') { g.fillStyle = '#ffc93c'; g.beginPath(); g.moveTo(hxh - 1.08 * R, hy - 0.2 * R); g.bezierCurveTo(hxh - 1.1 * R, hy - 1.25 * R, hxh + 0.9 * R, hy - 1.45 * R, hxh + 1.08 * R, hy - 0.2 * R); g.lineTo(hxh + 1.7 * R, hy - 0.12 * R); g.lineTo(hxh + 1.05 * R, hy - 0.35 * R); g.quadraticCurveTo(hxh, hy - 0.62 * R, hxh - 1.08 * R, hy - 0.2 * R); g.closePath(); g.fill(); }
  if (o.sweat) { const sx = hx + 0.8 * R, sy = hy - 0.25 * R + ((t * 40) % 60); circle(g, sx, sy, 0.09 * R, '#40c4ff'); g.fillStyle = '#40c4ff'; g.beginPath(); g.moveTo(sx - 0.09 * R, sy); g.lineTo(sx, sy - 0.16 * R); g.lineTo(sx + 0.09 * R, sy); g.closePath(); g.fill(); }
  g.restore();
}

function torso(g, hx, hy, R, L, o) {
  const k = 1 + 0.012 * Math.sin((o.t || 0) * 1.9);
  g.fillStyle = linGrad(g, hx - 2 * R, 0, hx + 2 * R, 0, [L.top, shade(L.top, -0.14)]);
  g.beginPath(); g.moveTo(hx - 0.5 * R, hy + 1.0 * R); g.bezierCurveTo(hx - 1.2 * R * k, hy + 1.1 * R, hx - 1.85 * R * k, hy + 1.3 * R, hx - 1.8 * R * k, hy + 1.95 * R);
  g.lineTo(hx - 1.9 * R, E.H + 80); g.lineTo(hx + 1.9 * R, E.H + 80); g.lineTo(hx + 1.8 * R * k, hy + 1.95 * R); g.bezierCurveTo(hx + 1.85 * R * k, hy + 1.3 * R, hx + 1.2 * R * k, hy + 1.1 * R, hx + 0.5 * R, hy + 1.0 * R); g.closePath(); g.fill();
  if (L.collar === 'shirt') {
    g.fillStyle = '#f7f4ee'; g.beginPath(); g.moveTo(hx - 0.48 * R, hy + 1.0 * R); g.lineTo(hx + 0.48 * R, hy + 1.0 * R); g.lineTo(hx, hy + 2.5 * R); g.closePath(); g.fill();
    g.fillStyle = L.topD; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(hx + s * 0.5 * R, hy + 1.0 * R); g.lineTo(hx + s * 0.1 * R, hy + 2.6 * R); g.lineTo(hx + s * 0.55 * R, hy + 2.0 * R); g.lineTo(hx + s * 0.85 * R, hy + 1.3 * R); g.closePath(); g.fill(); }
  } else if (L.collar === 'hoodie') {
    g.fillStyle = L.topD; circle(g, hx, hy + 1.2 * R, 0.45 * R, L.topD); g.fillStyle = '#fff'; rr(g, hx - 0.15 * R, hy + 1.3 * R, 0.04 * R, 0.45 * R, 0.02 * R); g.fill(); rr(g, hx + 0.11 * R, hy + 1.3 * R, 0.04 * R, 0.45 * R, 0.02 * R); g.fill();
    g.strokeStyle = alpha(L.topD, 0.55); g.lineWidth = 0.05 * R; g.beginPath(); g.moveTo(hx, hy + 1.65 * R); g.lineTo(hx, hy + 3.2 * R); g.stroke();
  } else if (L.collar === 'kurta') {
    g.fillStyle = L.topD; g.beginPath(); g.moveTo(hx - 0.5 * R, hy + 1.0 * R); g.quadraticCurveTo(hx, hy + 1.55 * R, hx + 0.5 * R, hy + 1.0 * R); g.closePath(); g.fill();
    for (let i = 0; i < 5; i++) circle(g, hx, hy + (1.5 + i * 0.3) * R, 0.045 * R, '#fff');
  } else if (L.collar === 'tee') { g.fillStyle = L.topD; g.beginPath(); g.ellipse(hx, hy + 1.05 * R, 0.55 * R, 0.28 * R, 0, 0, Math.PI); g.fill(); }
  g.fillStyle = L.skinD; rr(g, hx - 0.42 * R, hy + 0.5 * R, 0.84 * R, 0.65 * R, 0.2 * R); g.fill();
  g.fillStyle = alpha('#000', 0.12); g.beginPath(); g.ellipse(hx, hy + 0.98 * R, 0.5 * R, 0.16 * R, 0, 0, 7); g.fill();            // chin shadow on neck
}

// Main entry. Returns { head:[x,y], handR:[x,y], handL:[x,y] } for attaching props / pointing at cards.
export function drawPerson(g, t, who, o = {}) {
  const L = typeof who === 'string' ? LOOKS[who] : who;
  const R = o.R || 165, flip = !!o.flip, lean = (o.lean || 0) * R, walk = clamp(o.walk || 0);
  const sway = Math.sin(t * 1.6 + (o.seed || 0)) * 0.012 * R, bob = o.talking ? Math.abs(Math.sin(t * 9)) * 0.012 * R : 0;
  const step = walk > 0 ? Math.abs(Math.sin(t * 9)) * 0.07 * R * walk : 0;
  const ox = o.x, oy = o.y - step;
  const hx = ox + lean + sway + walk * 0.12 * R, hy = oy + Math.sin(t * 1.9 + (o.seed || 0)) * 0.012 * R - bob;
  const gs = o.gest || GEST.rest;
  const emo = typeof o.emo === 'string' ? EMO[o.emo] || EMO.neutral : o.emo || EMO.neutral;
  let lookV = null, turn = o.turn || 0;
  if (o.lookAt) { const tx = flip ? ox * 2 - o.lookAt[0] : o.lookAt[0]; const dx = (tx - hx) / (R * 5), dy = (o.lookAt[1] - hy) / (R * 6); lookV = [clamp(dx * 1.6, -1, 1), clamp(dy * 1.6, -1, 1)]; if (o.turn === undefined) turn = clamp(dx * 0.6, -0.5, 0.5); }
  const nod = (o.nod || 0) + (o.talking ? Math.sin(t * 4.6) * 0.18 : 0);
  g.save();
  if (flip) { g.translate(ox * 2, 0); g.scale(-1, 1); }
  if (L.hairStyle === 'long') { g.fillStyle = L.hair; g.beginPath(); g.moveTo(hx - 1.1 * R, hy - 0.3 * R); g.bezierCurveTo(hx - 1.5 * R, hy + 0.9 * R, hx - 1.3 * R, hy + 1.7 * R, hx - 0.9 * R, hy + 1.95 * R); g.lineTo(hx + 0.9 * R, hy + 1.95 * R); g.bezierCurveTo(hx + 1.3 * R, hy + 1.7 * R, hx + 1.5 * R, hy + 0.9 * R, hx + 1.1 * R, hy - 0.3 * R); g.closePath(); g.fill(); }
  torso(g, ox, oy, R, L, { t });
  head(g, t, hx, hy, R, L, { ...o, emo, turn, nod, lookV, tilt: (o.tilt || 0) + walk * 0.03 * Math.sin(t * 4.5) });
  const gsW = walk > 0.2 ? { ...gs, r: { ...gs.r, p: [gs.r.p[0], gs.r.p[1] + Math.sin(t * 9) * 0.15 * walk] }, l: { ...gs.l, p: [gs.l.p[0], gs.l.p[1] - Math.sin(t * 9) * 0.15 * walk] } } : gs;
  const hr = arm(g, 1, ox, oy, R, gsW.r, L, t, false), hl = arm(g, -1, ox, oy, R, gsW.l, L, t, false);
  g.restore();
  const fxx = (x) => (flip ? ox * 2 - x : x);
  return { head: [fxx(hx), hy], handR: [fxx(hr[0]), hr[1]], handL: [fxx(hl[0]), hl[1]] };
}

// natural idle blink (period seconds, offset)
export const blinkAt = (t, period = 3.1, off = 0) => ((t + off) % period) > period - 0.14;
