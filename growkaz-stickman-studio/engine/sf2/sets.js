// engine/sf2/sets.js — v2 light, colourful locations with parallax. Each returns { GY, CX }.
//   import { SETS, desk } from '/engine/sf2/sets.js';   SETS.cafe(g, t, cam);  (draw characters after, then desk() in front if needed)
import { E, rr, seg, circle, ring, linGrad, radGrad, glow, alpha, shade, text, FONTS, rng, layer, lerp, clamp } from '/engine/core.js';

const P = {
  cream: '#fff3e2', peach: '#ffe0c2', sand: '#f2d3ac', wood: '#c98a5a', woodL: '#e3a670', coral: '#ff6b6b', orange: '#ff8a1f', yellow: '#ffc93c',
  teal: '#21a99a', mint: '#bff0dc', blue: '#3a7bf2', sky: '#8fd3ff', sky2: '#d6f1ff', purple: '#8b6cff', pink: '#ff8fc2', green: '#3fbf6f', greenD: '#2a9a55', white: '#fff', ink: '#1f1f2b',
};
export const GYV = () => E.H * 0.68;

const cloud = (g, x, y, s, a = 0.95) => { g.fillStyle = alpha('#fff', a); for (const [dx, dy, r] of [[0, 0, 46], [46, 8, 36], [-46, 10, 34], [18, -22, 32]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, 7); g.fill(); } };
const plant = (g, x, y, s, pot = P.coral) => { rr(g, x - 46 * s, y - 100 * s, 92 * s, 100 * s, 14 * s); g.fillStyle = pot; g.fill(); for (const [dx, dy, r, c] of [[0, -190, 60, P.green], [-52, -150, 46, P.greenD], [52, -155, 48, '#4ccf7c'], [0, -240, 44, P.greenD], [-30, -215, 36, '#4ccf7c']]) circle(g, x + dx * s, y + dy * s, r * s, c); };
function bokeh(g, t, seed, n = 14, col = '#fff') { const r = rng(seed); for (let i = 0; i < n; i++) { const x = r() * E.W, y = r() * E.H * 0.7, rad = 24 + r() * 60, ph = r() * 6; circle(g, x + Math.sin(t * 0.3 + ph) * 22, y + Math.cos(t * 0.25 + ph) * 16, rad, alpha(col, 0.07 + 0.05 * Math.sin(t * 0.8 + ph))); } }
function dust(g, t, seed = 5, n = 26) { const r = rng(seed); for (let i = 0; i < n; i++) { const x = (r() * E.W + t * (8 + r() * 14)) % E.W, y = (r() * E.H * 0.8 + Math.sin(t * 0.6 + i) * 18), s = 2 + r() * 3; circle(g, x, y, s, alpha('#fff', 0.35 + 0.3 * Math.sin(t * 1.4 + i))); } }
const floor = (g, gy, c1, c2, planks = true) => { g.fillStyle = linGrad(g, 0, gy - 30, 0, gy + 800, [c1, c2]); g.fillRect(-E.W, gy - 30, E.W * 3, E.H * 2); if (planks) { g.strokeStyle = 'rgba(120,70,30,.14)'; g.lineWidth = 3; for (let i = -10; i < 18; i++) { g.beginPath(); g.moveTo(E.W / 2 + i * 110, gy - 30); g.lineTo(E.W / 2 + i * 250 - 640, gy + 800); g.stroke(); } } };
const winFrame = (g, x, y, w, h, fn, frame = '#fff') => { rr(g, x - 20, y - 20, w + 40, h + 40, 26); g.fillStyle = frame; g.fill(); g.save(); rr(g, x, y, w, h, 10); g.clip(); fn(g, x, y, w, h); g.restore(); };
const skyFill = (g, x, y, w, h, a = P.sky, b = P.sky2) => { g.fillStyle = linGrad(g, 0, y, 0, y + h, [a, b]); g.fillRect(x, y, w, h); };
const skyline = (g, x, y, w, h, seed, cols = ['#b9d9f5', '#a8c8ef', '#c6e0f7']) => { const r = rng(seed); for (let xx = x - 20; xx < x + w; xx += 70 + r() * 40) { const bh = 120 + r() * 220, bw = 60 + r() * 50; g.fillStyle = cols[Math.floor(r() * cols.length)]; g.fillRect(xx, y + h - bh, bw, bh); g.fillStyle = 'rgba(255,255,255,.7)'; for (let yy = y + h - bh + 18; yy < y + h - 20; yy += 34) for (let xx2 = xx + 12; xx2 < xx + bw - 14; xx2 += 22) g.fillRect(xx2, yy, 10, 14); } };

export const SETS = {
  office(g, t, cam, o = {}) {
    const gy = GYV(), CX = E.W / 2;
    layer(g, cam, 0.45, (g) => {
      g.fillStyle = linGrad(g, 0, -E.H, 0, gy, [P.cream, P.peach]); g.fillRect(-E.W, -E.H, E.W * 3, gy + E.H);
      const wx = CX - 340, wy = gy - 1040, ww = 680, wh = 620;
      winFrame(g, wx, wy, ww, wh, (g, x, y, w, h) => { skyFill(g, x, y, w, h); glow(g, x + w * 0.78, y + 120, 240, '#fff7c2', 0.9); circle(g, x + w * 0.78, y + 120, 54, '#fff3a8'); for (let i = 0; i < 3; i++) cloud(g, x + ((i * 260 + t * 22) % (w + 300)) - 120, y + 120 + i * 70, 1); skyline(g, x, y, w, h, 7); });
      seg(g, [[CX, wy], [CX, wy + wh]], 14, '#fff'); seg(g, [[wx, wy + wh * 0.45], [wx + ww, wy + wh * 0.45]], 14, '#fff');
      g.save(); g.globalAlpha = 0.22; g.fillStyle = '#fff6c8'; g.beginPath(); g.moveTo(wx, wy + wh); g.lineTo(wx + ww, wy + wh); g.lineTo(wx + ww + 260, gy); g.lineTo(wx - 160, gy); g.fill(); g.restore();
      const sx = CX + 390, sy = gy - 780; rr(g, sx - 20, sy, 270, 18, 6); g.fillStyle = P.wood; g.fill();
      [P.coral, P.yellow, P.teal, P.blue, P.purple, P.pink].forEach((c, i) => { rr(g, sx + i * 33, sy - 92 + (i % 2) * 14, 27, 92 - (i % 2) * 14, 4); g.fillStyle = c; g.fill(); });
      rr(g, CX - 520, gy - 900, 150, 190, 14); g.fillStyle = '#fff'; g.fill(); rr(g, CX - 505, gy - 885, 120, 160, 8); g.fillStyle = P.mint; g.fill(); circle(g, CX - 445, gy - 825, 30, P.yellow);
    });
    layer(g, cam, 0.85, (g) => { floor(g, gy, P.sand, '#e6bf92'); plant(g, CX + 470, gy, 1); });
    bokeh(g, t, 3, 8); dust(g, t, 2); return { GY: gy, CX };
  },
  cafe(g, t, cam, o = {}) {
    const gy = GYV(), CX = E.W / 2;
    layer(g, cam, 0.4, (g) => {
      g.fillStyle = linGrad(g, 0, -E.H, 0, gy, ['#ffd9bd', '#ffc9a0']); g.fillRect(-E.W, -E.H, E.W * 3, gy + E.H);
      // arched window with street view
      const wx = CX - 380, wy = gy - 1000, ww = 760, wh = 620;
      g.save(); g.beginPath(); g.moveTo(wx, wy + wh); g.lineTo(wx, wy + 220); g.arc(wx + ww / 2, wy + 220, ww / 2, Math.PI, 0); g.lineTo(wx + ww, wy + wh); g.closePath(); g.fillStyle = '#fff'; g.fill(); g.clip();
      g.fillStyle = linGrad(g, 0, wy, 0, wy + wh, ['#9fdcff', '#e8f7ff']); g.fillRect(wx + 18, wy + 18, ww - 36, wh); skyline(g, wx, wy, ww, wh, 11, ['#ffd1a8', '#ffc08a', '#ffe0c4']); for (let i = 0; i < 2; i++) cloud(g, wx + ((i * 380 + t * 18) % (ww + 200)) - 60, wy + 150 + i * 90, 0.9);
      g.restore(); seg(g, [[CX, wy + 20], [CX, wy + wh]], 12, '#fff');
      // pendant lamps
      for (const [dx, h] of [[-420, 330], [0, 260], [420, 330]]) { seg(g, [[CX + dx, -40], [CX + dx, gy - 1000 - 60 + h * 0.2]], 5, '#6b4a34'); const ly = gy - 1000 - 60 + h * 0.2; g.fillStyle = P.yellow; g.beginPath(); g.moveTo(CX + dx - 70, ly + 70); g.quadraticCurveTo(CX + dx, ly - 30, CX + dx + 70, ly + 70); g.closePath(); g.fill(); glow(g, CX + dx, ly + 90, 220, '#ffe08a', 0.55); }
      // chalkboard menu
      rr(g, CX + 420, gy - 880, 250, 330, 14); g.fillStyle = '#2c3a38'; g.fill(); rr(g, CX + 432, gy - 868, 226, 306, 8); g.strokeStyle = '#fff'; g.lineWidth = 3; g.setLineDash([8, 6]); g.stroke(); g.setLineDash([]);
      text(g, 'MENU', CX + 545, gy - 830, { size: 44, font: FONTS.title, weight: 700, color: '#fff' }); for (let i = 0; i < 4; i++) seg(g, [[CX + 462, gy - 770 + i * 52], [CX + 562 - (i % 2) * 24, gy - 770 + i * 52]], 6, alpha('#fff', 0.7));
    });
    layer(g, cam, 0.7, (g) => { // back counter with espresso machine
      g.fillStyle = '#c47a4a'; g.fillRect(-E.W, gy - 300, E.W * 3, 300); g.fillStyle = '#e3a670'; g.fillRect(-E.W, gy - 316, E.W * 3, 18);
      rr(g, CX - 520, gy - 470, 260, 170, 18); g.fillStyle = '#d7dbe3'; g.fill(); rr(g, CX - 500, gy - 440, 220, 60, 10); g.fillStyle = P.coral; g.fill(); circle(g, CX - 390, gy - 395, 18, '#fff');
      for (let i = 0; i < 4; i++) { rr(g, CX + 150 + i * 70, gy - 390, 52, 74, 8); g.fillStyle = [P.coral, P.teal, P.yellow, P.blue][i]; g.fill(); }
    });
    layer(g, cam, 0.9, (g) => { floor(g, gy + 30, '#e6b98c', '#cf9a68'); plant(g, CX - 470, gy + 30, 1.1, P.teal); });
    bokeh(g, t, 8, 9, '#ffe9b8'); dust(g, t, 4); return { GY: gy, CX };
  },
  shop(g, t, cam, o = {}) {
    const gy = GYV(), CX = E.W / 2;
    layer(g, cam, 0.45, (g) => {
      g.fillStyle = linGrad(g, 0, -E.H, 0, gy, ['#d9f5ea', '#bff0dc']); g.fillRect(-E.W, -E.H, E.W * 3, gy + E.H);
      // shelves of colourful products
      for (let r = 0; r < 3; r++) { const sy = gy - 820 + r * 230; rr(g, CX - 520, sy + 170, 1040, 16, 6); g.fillStyle = P.wood; g.fill();
        const rn = rng(20 + r); for (let i = 0; i < 12; i++) { const w = 54 + rn() * 30, h = 70 + rn() * 80, x = CX - 500 + i * 85; rr(g, x, sy + 170 - h, w, h, 8); g.fillStyle = [P.coral, P.yellow, P.teal, P.blue, P.purple, P.pink, P.orange][Math.floor(rn() * 7)]; g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x + 8, sy + 170 - h + 12, 12, h - 24); } }
      // hanging OPEN sign
      seg(g, [[CX - 120, -40], [CX - 120, gy - 1010]], 5, '#6b4a34'); seg(g, [[CX + 120, -40], [CX + 120, gy - 1010]], 5, '#6b4a34'); rr(g, CX - 190, gy - 1010, 380, 120, 24); g.fillStyle = P.coral; g.fill(); text(g, 'OPEN', CX, gy - 948, { size: 70, font: FONTS.title, weight: 700, color: '#fff', spacing: 6 });
    });
    layer(g, cam, 0.85, (g) => { // checker floor + counter
      const f = gy - 20; g.fillStyle = '#f7f1e6'; g.fillRect(-E.W, f, E.W * 3, E.H); for (let r = 0; r < 12; r++) for (let c = -8; c < 14; c++) if ((r + c) % 2 === 0) { g.fillStyle = 'rgba(33,169,154,.13)'; g.fillRect(CX + c * 140 - 70, f + r * 70, 140, 70); }
      rr(g, CX - 160, gy - 190, 640, 210, 18); g.fillStyle = P.teal; g.fill(); rr(g, CX - 175, gy - 215, 670, 36, 12); g.fillStyle = '#fff'; g.fill(); rr(g, CX + 300, gy - 330, 150, 118, 14); g.fillStyle = '#e8ecf3'; g.fill(); rr(g, CX + 320, gy - 312, 110, 54, 8); g.fillStyle = P.blue; g.fill(); });
    bokeh(g, t, 5, 7); dust(g, t, 9, 18); return { GY: gy, CX };
  },
  home(g, t, cam, o = {}) {
    const gy = GYV(), CX = E.W / 2;
    layer(g, cam, 0.4, (g) => {
      g.fillStyle = linGrad(g, 0, -E.H, 0, gy, ['#efe6ff', '#dccfff']); g.fillRect(-E.W, -E.H, E.W * 3, gy + E.H);
      const wx = CX - 330, wy = gy - 980, ww = 660, wh = 600;
      winFrame(g, wx, wy, ww, wh, (g, x, y, w, h) => { g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#ffb88a', '#ff8fa8', '#8b6cff']); g.fillRect(x, y, w, h); glow(g, x + w * 0.3, y + h * 0.72, 260, '#ffe9a8', 0.9); circle(g, x + w * 0.3, y + h * 0.72, 62, '#fff1b8'); skyline(g, x, y, w, h, 5, ['#a07cc9', '#8e6ab8', '#b793d6']); }, '#fff');
      for (const s of [-1, 1]) { g.fillStyle = s < 0 ? P.coral : P.pink; g.beginPath(); g.moveTo(CX + s * 330, wy - 40); g.quadraticCurveTo(CX + s * 440, wy + 300, CX + s * 380, wy + wh + 60); g.lineTo(CX + s * 250, wy + wh + 60); g.quadraticCurveTo(CX + s * 300, wy + 300, CX + s * 250, wy - 40); g.closePath(); g.fill(); }
      for (const [dx, dy, c] of [[-520, -760, P.yellow], [-520, -560, P.teal]]) { rr(g, CX + dx - 60, gy + dy, 130, 160, 10); g.fillStyle = '#fff'; g.fill(); rr(g, CX + dx - 46, gy + dy + 14, 102, 132, 6); g.fillStyle = c; g.fill(); }
      // lamp
      seg(g, [[CX + 480, gy], [CX + 480, gy - 560]], 10, '#8a6a4a'); g.fillStyle = P.yellow; g.beginPath(); g.moveTo(CX + 410, gy - 520); g.lineTo(CX + 550, gy - 520); g.lineTo(CX + 520, gy - 640); g.lineTo(CX + 440, gy - 640); g.closePath(); g.fill(); glow(g, CX + 480, gy - 560, 380, '#ffd98a', 0.5);
    });
    layer(g, cam, 0.85, (g) => { floor(g, gy, '#e9d8c4', '#d6bfa4'); rr(g, CX - 540, gy - 250, 520, 250, 40); g.fillStyle = P.teal; g.fill(); rr(g, CX - 560, gy - 330, 150, 150, 40); g.fillStyle = shade(P.teal, 0.1); g.fill(); });
    bokeh(g, t, 12, 8, '#ffe6c8'); dust(g, t, 6); return { GY: gy, CX };
  },
  street(g, t, cam, o = {}) {
    const gy = GYV(), CX = E.W / 2;
    layer(g, cam, 0.15, (g) => { skyFill(g, -E.W, -E.H, E.W * 3, gy + E.H, '#7cc8ff', '#e0f4ff'); glow(g, CX + 380, gy - 900, 300, '#fff7c2', 0.9); circle(g, CX + 380, gy - 900, 64, '#fff3a8'); for (let i = 0; i < 4; i++) cloud(g, ((i * 330 + t * 14) % (E.W + 500)) - 150, gy - 1000 + (i % 2) * 120, 1.1); });
    layer(g, cam, 0.35, (g) => skyline(g, -80, gy - 760, E.W + 160, 560, 3, ['#c6dcf7', '#b3cdf0', '#d2e4fa']));
    layer(g, cam, 0.6, (g) => { // pastel shopfronts with awnings
      const cols = [P.coral, P.teal, P.yellow, P.purple]; for (let i = 0; i < 3; i++) { const x = -60 + i * 400, w = 380; g.fillStyle = ['#ffe3d3', '#d9f5ea', '#fff3c9'][i]; g.fillRect(x, gy - 620, w, 620);
        for (let k = 0; k < 6; k++) { g.fillStyle = k % 2 ? '#fff' : cols[i]; g.beginPath(); g.moveTo(x + k * w / 6, gy - 410); g.lineTo(x + (k + 1) * w / 6, gy - 410); g.lineTo(x + (k + 1) * w / 6, gy - 340); g.arc(x + (k + 0.5) * w / 6, gy - 340, w / 12, 0, Math.PI); g.closePath(); g.fill(); }
        rr(g, x + 40, gy - 600, w - 80, 90, 12); g.fillStyle = cols[i]; g.fill(); g.fillStyle = '#bfe3ff'; g.fillRect(x + 40, gy - 250, w * 0.45, 190); g.fillStyle = shade(cols[i], -0.15); g.fillRect(x + w * 0.62, gy - 280, w * 0.26, 280); } });
    layer(g, cam, 0.9, (g) => { g.fillStyle = '#e7e2da'; g.fillRect(-E.W, gy, E.W * 3, E.H); g.fillStyle = '#d6d0c6'; g.fillRect(-E.W, gy, E.W * 3, 26); seg(g, [[CX + 400, gy], [CX + 400, gy - 520]], 12, '#4a4a58'); circle(g, CX + 400, gy - 540, 36, P.yellow); glow(g, CX + 400, gy - 540, 160, '#fff1a8', 0.5); plant(g, CX - 470, gy, 1.2, P.orange); });
    bokeh(g, t, 14, 6); return { GY: gy, CX };
  },
};

// foreground desk (draw AFTER the characters so it hides their hands)
export function desk(g, y = E.H * 0.8, o = {}) {
  const top = o.top || P.woodL, body = o.body || P.wood;
  g.save(); g.shadowColor = 'rgba(80,40,10,.22)'; g.shadowBlur = 30; g.shadowOffsetY = -6; rr(g, -40, y - 30, E.W + 80, 44, 16); g.fillStyle = top; g.fill(); g.restore();
  g.fillStyle = body; g.fillRect(-40, y + 10, E.W + 80, E.H); g.fillStyle = 'rgba(0,0,0,.07)'; g.fillRect(-40, y + 10, E.W + 80, 18);
  if (o.laptop !== false) { rr(g, 100, y - 230, 300, 200, 14); g.fillStyle = '#d7dbe3'; g.fill(); rr(g, 116, y - 214, 268, 166, 8); g.fillStyle = P.blue; g.fill(); rr(g, 70, y - 38, 360, 16, 8); g.fillStyle = '#c3c8d2'; g.fill(); }
  rr(g, E.W - 250, y - 120, 86, 96, 16); g.fillStyle = P.yellow; g.fill(); ring(g, E.W - 156, y - 78, 24, 8, P.yellow);
}
