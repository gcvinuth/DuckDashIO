/* Duck Dash — a tiny 2D platformer.
 * Flat vector look: no outlines, soft gradients, one shaded side per shape.
 * No dependencies. Everything is drawn with the Canvas 2D API.
 */
(() => {
'use strict';

/* ====================================================================
 * Constants
 * ==================================================================== */
const W = 960, H = 540, T = 45;               // logical size, tile size
const GRAV = 2300, RUN = 270, JUMP = 760, FLAP = 640;
const GLIDE_FALL = 115, MAX_FALL = 900, GLIDE_MAX = 1.5;
const QUACK_R = 150, QUACK_CD = 2.2;
const MAX_LIVES = 3;
const SAVE_KEY = 'duckdash.best.v1';

const $ = (s) => document.querySelector(s);
const canvas = $('#game');
const ctx = canvas.getContext('2d');
const DPR = Math.min(2, Math.max(1, Math.ceil(window.devicePixelRatio || 1)));
canvas.width = W * DPR;
canvas.height = H * DPR;

const C = {
  duck: '#ffd23f', duckD: '#f2a900',
  wing: '#ffc21a', wingD: '#e69a00',
  beak: '#ff7a2f', beakD: '#e0561a',
  leg: '#ff8a2b',
  ink: '#1a1a3d', white: '#ffffff',
  bread: '#ffc857', breadD: '#e8932a', crust: '#c9741a',
  pink: '#ff5d8f', pinkD: '#d93b6f',
  purple: '#9b5de5', purpleD: '#6f3bb8', lilac: '#c9a3ff',
  cyan: '#35e0b8', cyanD: '#1fb394'
};

/* ====================================================================
 * Levels (tile coordinates, 12 rows high, ground surface is row 10)
 * ==================================================================== */
const LEVELS = [
  {
    name: 'Pond Life', w: 72,
    theme: { sky: ['#1a1f4f', '#4b2a86'], far: '#3a3590', mid: '#2d2a74',
             ground: '#4a3fa0', groundD: '#372f80', cap: '#35e0b8', capD: '#1fb394',
             planet: ['#ff6b9d', '#c93b78'], ring: '#ffd0e0' },
    ground: [[0, 18], [21, 34], [37, 52], [55, 72]],
    plats: [[8, 8, 4], [24, 8, 4], [28, 6, 3], [44, 8, 5], [60, 8, 4], [64, 6, 4]],
    blocks: [],
    spikes: [[41, 9, 2], [58, 9, 2]],
    bread: [[4, 9], [5, 9], [6, 9], [9, 7], [10, 7], [11, 7], [19, 6], [25, 7], [26, 7],
            [29, 5], [30, 5], [35, 7], [45, 7], [46, 7], [47, 7], [53, 7], [61, 7], [65, 5], [66, 5]],
    enemies: [['e', 14, 9], ['e', 30, 9], ['f', 40, 6], ['e', 48, 9], ['e', 62, 9]],
    start: [2, 9], cp: [38, 9], goal: [69, 9]
  },
  {
    name: 'Neon Caves', w: 80,
    theme: { sky: ['#0d1b3a', '#14506b'], far: '#1b5280', mid: '#133f63',
             ground: '#24648f', groundD: '#194c70', cap: '#ff9f1c', capD: '#d97f00',
             planet: ['#2ee6c0', '#16a48a'], ring: '#b8fff1' },
    ground: [[0, 12], [15, 26], [29, 40], [44, 56], [59, 80]],
    plats: [[6, 7, 3], [12, 6, 3], [17, 8, 3], [22, 6, 3], [31, 7, 4], [36, 5, 3], [41, 6, 3],
            [46, 6, 3], [52, 5, 4], [60, 7, 4], [66, 5, 3], [72, 7, 4]],
    blocks: [[20, 8, 2, 2], [48, 8, 2, 2], [64, 8, 2, 2]],
    spikes: [[24, 9, 2], [33, 9, 3], [50, 9, 3], [62, 9, 2], [69, 9, 3]],
    bread: [[3, 9], [4, 9], [7, 6], [8, 6], [13, 5], [18, 7], [23, 5], [24, 5], [27, 6], [32, 6],
            [33, 6], [37, 4], [38, 4], [42, 5], [47, 5], [48, 5], [53, 4], [54, 4], [57, 6],
            [61, 6], [62, 6], [67, 4], [68, 4], [73, 6], [74, 6]],
    enemies: [['e', 9, 9], ['e', 37, 9], ['e', 54, 9], ['e', 72, 9],
              ['f', 27, 7], ['f', 45, 4], ['f', 58, 6], ['f', 70, 4]],
    start: [2, 9], cp: [30, 9], goal: [77, 9]
  },
  {
    name: 'Deep Sky', w: 90,
    theme: { sky: ['#1e1b5e', '#d6457f'], far: '#7a3399', mid: '#58288a',
             ground: '#3f2f8c', groundD: '#2d2268', cap: '#ffd23f', capD: '#e0a800',
             planet: ['#ffd23f', '#e8a200'], ring: '#fff1b0' },
    ground: [[0, 10], [76, 90]],
    plats: [[4, 7, 3]],
    blocks: [[13, 8, 4, 2], [21, 7, 4, 2], [29, 6, 4, 2], [37, 8, 5, 2], [46, 6, 4, 2],
             [54, 4, 4, 2], [60, 7, 5, 2], [68, 6, 4, 2]],
    spikes: [[31, 5, 1], [64, 6, 1]],
    bread: [[11, 7], [15, 6], [16, 6], [19, 5], [22, 5], [23, 5], [26, 4], [30, 4], [33, 4],
            [38, 7], [40, 7], [44, 5], [48, 5], [52, 3], [55, 3], [56, 3], [58, 5], [61, 5],
            [62, 5], [66, 4], [69, 5], [70, 5], [73, 7], [74, 7], [80, 9], [81, 9], [82, 9]],
    enemies: [['e', 39, 7], ['e', 61, 6], ['f', 19, 6], ['f', 34, 5], ['f', 50, 4], ['f', 66, 5]],
    start: [2, 9], cp: [47, 5], goal: [86, 9]
  }
];

/* ====================================================================
 * Level building
 * ==================================================================== */
// grid values: 0 empty, 1 solid, 2 one-way platform, 3 spike
let lvl = null;

function buildLevel(d) {
  const h = 12, w = d.w;
  const g = Array.from({ length: h }, () => new Array(w).fill(0));
  d.ground.forEach(([a, b]) => { for (let x = a; x < b; x++) for (let y = 10; y < h; y++) g[y][x] = 1; });
  (d.blocks || []).forEach(([x, y, bw, bh]) => {
    for (let i = 0; i < bw; i++) for (let j = 0; j < bh; j++) g[y + j][x + i] = 1;
  });
  (d.plats || []).forEach(([x, y, l]) => { for (let i = 0; i < l; i++) g[y][x + i] = 2; });
  (d.spikes || []).forEach(([x, y, l]) => { for (let i = 0; i < l; i++) g[y][x + i] = 3; });
  return {
    name: d.name, w, h, grid: g, theme: d.theme, def: d,
    start: d.start, cp: d.cp, goal: d.goal
  };
}

const tile = (x, y) => {
  if (x < 0 || x >= lvl.w) return 1;
  if (y < 0 || y >= lvl.h) return 0;
  return lvl.grid[y][x];
};

/* ====================================================================
 * State
 * ==================================================================== */
let state = 'title';         // title | play | pause | finishing | dying | end | over | win
let levelIndex = 0;
let time = 0;                // global animation clock
let player, enemies, bread, particles, rings, popups;
let cam = 0, shake = 0;
let lives = MAX_LIVES, score = 0, levelStartScore = 0, totalBread = 0, levelStartBread = 0;
let breadGot = 0, foesBeaten = 0, levelTime = 0;
let cpActive = false, respawn = { x: 0, y: 0 };
let stateTimer = 0;
let best = 0;
try { best = parseInt(localStorage.getItem(SAVE_KEY) || '0', 10) || 0; } catch (e) { /* ignore */ }

const inp = { left: false, right: false, jump: false, down: false };
let jumpBuf = 0, quackReq = false;

/* ====================================================================
 * Audio (tiny WebAudio synth, no files)
 * ==================================================================== */
let AC = null, master = null, muted = false;
try { muted = localStorage.getItem('duckdash.muted') === '1'; } catch (e) { /* ignore */ }

function audio() {
  if (!AC) {
    try {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      master = AC.createGain();
      master.gain.value = 0.5;
      master.connect(AC.destination);
    } catch (e) { return null; }
  }
  if (AC.state === 'suspended') AC.resume();
  return AC;
}

function tone(f, f2, dur, type = 'square', vol = 0.12, delay = 0) {
  if (muted) return;
  const a = audio();
  if (!a) return;
  const t0 = a.currentTime + delay;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t0);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(master);
  o.start(t0); o.stop(t0 + dur + 0.03);
}

const sfx = {
  jump: () => tone(360, 640, 0.13, 'triangle', 0.16),
  flap: () => { tone(300, 520, 0.09, 'triangle', 0.12); tone(420, 700, 0.09, 'triangle', 0.08, 0.05); },
  bread: () => { tone(880, 1320, 0.08, 'sine', 0.12); tone(1320, 1760, 0.1, 'sine', 0.1, 0.07); },
  stomp: () => { tone(220, 90, 0.14, 'square', 0.14); tone(520, 780, 0.08, 'sine', 0.1, 0.05); },
  quack: () => { tone(620, 290, 0.14, 'sawtooth', 0.15); tone(540, 250, 0.17, 'sawtooth', 0.13, 0.15); },
  hurt: () => { tone(300, 70, 0.35, 'sawtooth', 0.16); },
  check: () => { tone(660, 660, 0.08, 'sine', 0.12); tone(880, 880, 0.1, 'sine', 0.12, 0.09); tone(1175, 1175, 0.16, 'sine', 0.12, 0.19); },
  win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, f, 0.22, 'triangle', 0.14, i * 0.1)),
  over: () => [392, 330, 262, 196].forEach((f, i) => tone(f, f * 0.98, 0.26, 'triangle', 0.15, i * 0.18))
};

// ambient pentatonic bells while playing
let musicStep = 0;
setInterval(() => {
  if (state !== 'play' || muted || !AC) return;
  const pent = [523, 587, 659, 784, 880, 1047];
  if (musicStep % 4 === 0) tone(131 * (musicStep % 8 === 0 ? 1 : 1.5), 0, 1.6, 'sine', 0.05);
  if (Math.random() < 0.7) tone(pent[(Math.random() * pent.length) | 0], 0, 1.0, 'sine', 0.03);
  musicStep++;
}, 480);

/* ====================================================================
 * Helpers
 * ==================================================================== */
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const approach = (v, t, d) => (v < t ? Math.min(t, v + d) : Math.max(t, v - d));
const hash = (x, y) => {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = (h ^ (h >>> 13)) * 1274126177 | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};
function mulberry(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function rrect(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Flat ellipse with a shaded crescent on the lower-right: the signature look.
function blob(x, y, rx, ry, base, shade) {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = shade;
  ctx.fill();
  ctx.clip();
  ctx.beginPath();
  ctx.ellipse(x - rx * 0.2, y - ry * 0.2, rx * 0.96, ry * 0.96, 0, 0, Math.PI * 2);
  ctx.fillStyle = base;
  ctx.fill();
  ctx.restore();
}

function disc(x, y, r, col) {
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/* ====================================================================
 * Particles & effects
 * ==================================================================== */
function burst(x, y, n, colors, speed = 220, life = 0.6, grav = 600, size = 5) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, s = rnd(speed * 0.3, speed);
    particles.push({
      x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - speed * 0.3,
      life: life * rnd(0.6, 1), max: life, g: grav, r: size * rnd(0.6, 1.2),
      c: colors[(Math.random() * colors.length) | 0]
    });
  }
}
function puff(x, y, n = 6) {
  for (let i = 0; i < n; i++) {
    particles.push({
      x: x + rnd(-8, 8), y, vx: rnd(-50, 50), vy: rnd(-20, 30),
      life: 0.4, max: 0.4, g: 0, r: rnd(3, 6), c: 'rgba(255,255,255,0.7)', grow: 10
    });
  }
}
function popup(x, y, txt, col = '#fff') { popups.push({ x, y, txt, t: 0, col }); }

/* ====================================================================
 * Level / entity setup
 * ==================================================================== */
function loadLevel(i) {
  levelIndex = i;
  lvl = buildLevel(LEVELS[i]);
  const d = lvl.def;
  enemies = d.enemies.map(([k, tx, ty]) => {
    if (k === 'e') {
      return { type: 'e', x: tx * T + (T - 34) / 2, y: (ty + 1) * T - 30, w: 34, h: 30,
               vx: 0, vy: 0, dir: Math.random() < 0.5 ? -1 : 1, speed: 55, ph: Math.random() * 6 };
    }
    return { type: 'f', x0: tx * T + T / 2, y0: ty * T + T / 2, range: T * 3, t: Math.random() * 6,
             x: 0, y: 0, w: 32, h: 32, ph: Math.random() * 6, dir: 1 };
  });
  bread = d.bread.map(([tx, ty]) => ({ x: tx * T + T / 2, y: ty * T + T / 2, got: false, ph: Math.random() * 6 }));
  particles = []; rings = []; popups = [];
  const sx = d.start[0] * T + T / 2, sy = (d.start[1] + 1) * T;
  respawn = { x: sx, y: sy };
  cpActive = false;
  player = {
    x: sx - 14, y: sy - 42, w: 28, h: 42, vx: 0, vy: 0, facing: 1,
    onGround: false, coyote: 0, flaps: 1, glide: GLIDE_MAX, gliding: false,
    inv: 0, quack: 0, quackCd: 0, sx: 1, sy: 1, drop: 0, prevBottom: sy, blink: 0, wasGround: false, jumping: false
  };
  cam = 0; shake = 0;
  breadGot = 0; foesBeaten = 0; levelTime = 0;
  levelStartScore = score;
}

function placePlayerAtRespawn() {
  player.x = respawn.x - player.w / 2;
  player.y = respawn.y - player.h;
  player.vx = player.vy = 0;
  player.inv = 1.6;
  player.flaps = 1;
}

/* ====================================================================
 * Physics
 * ==================================================================== */
function physics(e, dt) {
  const prevBottom = e.y + e.h;
  // horizontal
  e.x += e.vx * dt;
  e.hitWall = 0;
  let x0 = Math.floor(e.x / T), x1 = Math.floor((e.x + e.w - 0.01) / T);
  let y0 = Math.floor(e.y / T), y1 = Math.floor((e.y + e.h - 0.01) / T);
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      if (tile(tx, ty) === 1) {
        if (e.vx > 0) { e.x = tx * T - e.w; e.hitWall = 1; }
        else if (e.vx < 0) { e.x = (tx + 1) * T; e.hitWall = -1; }
        e.vx = 0;
      }
    }
  }
  // vertical
  e.y += e.vy * dt;
  e.onGround = false;
  x0 = Math.floor(e.x / T); x1 = Math.floor((e.x + e.w - 0.01) / T);
  y0 = Math.floor(e.y / T); y1 = Math.floor((e.y + e.h - 0.01) / T);
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      const t = tile(tx, ty);
      if (t === 1) {
        if (e.vy > 0) { e.y = ty * T - e.h; e.onGround = true; e.vy = 0; }
        else if (e.vy < 0) { e.y = (ty + 1) * T; e.vy = 0; }
      } else if (t === 2 && e.vy >= 0 && prevBottom <= ty * T + 2 && !(e.drop > 0)) {
        e.y = ty * T - e.h; e.onGround = true; e.vy = 0;
      }
    }
  }
}

const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/* ====================================================================
 * Update
 * ==================================================================== */
function updatePlayer(dt) {
  const p = player;
  p.prevBottom = p.y + p.h;
  const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
  const target = dir * RUN * (p.gliding ? 1.12 : 1);
  const acc = (p.onGround ? 2800 : 1900) * dt;
  p.vx = approach(p.vx, target, dir === 0 ? acc * 1.3 : acc);
  if (dir !== 0) p.facing = dir;

  // timers
  if (p.onGround) { p.coyote = 0.1; p.flaps = 1; p.glide = GLIDE_MAX; p.jumping = false; }
  else p.coyote = Math.max(0, p.coyote - dt);
  jumpBuf = Math.max(0, jumpBuf - dt);
  p.inv = Math.max(0, p.inv - dt);
  p.drop = Math.max(0, p.drop - dt);
  p.quackCd = Math.max(0, p.quackCd - dt);
  p.quack = Math.max(0, p.quack - dt * 3);
  p.blink = p.blink > 0 ? p.blink - dt : (Math.random() < dt * 0.4 ? 0.12 : 0);

  // jump / flap / drop-through
  if (jumpBuf > 0) {
    if (inp.down && p.onGround && tile(Math.floor((p.x + p.w / 2) / T), Math.floor((p.y + p.h + 2) / T)) === 2) {
      p.drop = 0.25; p.vy = 80; p.onGround = false; jumpBuf = 0;
    } else if (p.coyote > 0) {
      p.vy = -JUMP; p.coyote = 0; jumpBuf = 0; p.onGround = false; p.jumping = true;
      p.sx = 0.75; p.sy = 1.3; sfx.jump(); puff(p.x + p.w / 2, p.y + p.h, 5);
    } else if (p.flaps > 0) {
      p.vy = -FLAP; p.flaps--; jumpBuf = 0; p.jumping = true;
      p.sx = 0.8; p.sy = 1.25; sfx.flap(); puff(p.x + p.w / 2, p.y + p.h, 7);
    }
  }

  // gravity, variable jump height, gliding
  let g = GRAV;
  if (p.vy < 0 && !inp.jump && p.jumping) g *= 2.1;
  p.gliding = false;
  if (!p.onGround && inp.jump && p.vy > 0 && p.glide > 0 && p.flaps <= 0) {
    p.gliding = true;
    p.glide -= dt;
  }
  p.vy += g * dt;
  if (p.gliding) p.vy = Math.min(p.vy, GLIDE_FALL);
  p.vy = Math.min(p.vy, MAX_FALL);

  const wasGround = p.onGround;
  physics(p, dt);
  if (!wasGround && p.onGround) {
    p.sx = 1.28; p.sy = 0.72; puff(p.x + p.w / 2, p.y + p.h, 5);
  }
  p.sx += (1 - p.sx) * Math.min(1, dt * 14);
  p.sy += (1 - p.sy) * Math.min(1, dt * 14);

  // quack
  if (quackReq) {
    quackReq = false;
    if (p.quackCd <= 0) doQuack();
  }

  // bread
  const pcx = p.x + p.w / 2, pcy = p.y + p.h / 2;
  for (const b of bread) {
    if (!b.got && Math.abs(b.x - pcx) < 26 && Math.abs(b.y - pcy) < 32) {
      b.got = true; breadGot++; score += 10; totalBread++;
      sfx.bread();
      burst(b.x, b.y, 8, [C.bread, '#fff1b8'], 150, 0.45, 200, 4);
    }
  }

  // checkpoint
  if (!cpActive) {
    const cx = lvl.cp[0] * T + T / 2;
    if (pcx >= cx - 10) {
      cpActive = true;
      respawn = { x: cx, y: (lvl.cp[1] + 1) * T };
      sfx.check();
      popup(cx, lvl.cp[1] * T - 20, 'CHECKPOINT', C.cyan);
      burst(cx, lvl.cp[1] * T, 14, [C.cyan, '#fff'], 220, 0.8, 300, 5);
    }
  }

  // spikes
  const tx0 = Math.floor(p.x / T), tx1 = Math.floor((p.x + p.w) / T);
  const ty0 = Math.floor(p.y / T), ty1 = Math.floor((p.y + p.h) / T);
  for (let ty = ty0; ty <= ty1; ty++) {
    for (let tx = tx0; tx <= tx1; tx++) {
      if (tile(tx, ty) === 3) {
        const hb = { x: tx * T + 8, y: ty * T + T - 22, w: T - 16, h: 22 };
        if (overlap(p, hb)) hurt(tx * T + T / 2, true);
      }
    }
  }

  // enemies
  for (const e of enemies) {
    if (e.dead || !overlap(p, e)) continue;
    if (p.vy > 80 && p.prevBottom <= e.y + 14) {
      killEnemy(e, 'stomp');
      p.vy = inp.jump ? -JUMP * 0.85 : -520;
      p.flaps = 1; p.glide = GLIDE_MAX; p.jumping = true; p.inv = Math.max(p.inv, 0.12);
      p.sx = 0.8; p.sy = 1.25;
    } else {
      hurt(e.x + e.w / 2, false);
    }
  }

  // fell into the abyss
  if (p.y > lvl.h * T + 80) {
    lives--;
    sfx.hurt();
    if (lives <= 0) { beginDying(); }
    else { placePlayerAtRespawn(); shake = 0.2; popup(respawn.x, respawn.y - 90, 'Oops!', C.pink); }
  }

  // goal
  const gx = lvl.goal[0] * T + T / 2, gy = (lvl.goal[1] + 1) * T;
  if (state === 'play' && overlap(p, { x: gx - 46, y: gy - 100, w: 92, h: 100 })) beginFinish();
}

function doQuack() {
  const p = player;
  p.quackCd = QUACK_CD; p.quack = 1;
  sfx.quack();
  const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
  rings.push({ x: cx, y: cy, t: 0 });
  popup(cx + p.facing * 20, p.y - 22, 'QUACK!', '#fff');
  shake = Math.max(shake, 0.08);
  for (const e of enemies) {
    if (e.dead) continue;
    const ex = e.x + e.w / 2, ey = e.y + e.h / 2;
    if (Math.hypot(ex - cx, ey - cy) < QUACK_R) killEnemy(e, 'quack');
  }
}

function killEnemy(e, how) {
  e.dead = true; foesBeaten++; score += 25;
  if (how === 'stomp') sfx.stomp();
  const cols = e.type === 'e' ? [C.pink, C.pinkD, '#fff'] : [C.purple, C.lilac, '#fff'];
  burst(e.x + e.w / 2, e.y + e.h / 2, 16, cols, 260, 0.7, 700, 6);
  popup(e.x + e.w / 2, e.y - 6, '+25', '#ffd23f');
}

function hurt(fromX, spike) {
  const p = player;
  if (p.inv > 0 || state !== 'play') return;
  lives--;
  sfx.hurt();
  shake = 0.3;
  burst(p.x + p.w / 2, p.y + p.h / 2, 12, [C.duck, C.duckD, '#fff'], 260, 0.6, 700, 5);
  if (lives <= 0) { beginDying(); return; }
  p.inv = 1.7;
  p.vy = spike ? -560 : -430;
  p.vx = (p.x + p.w / 2 < fromX ? -1 : 1) * 240;
  p.onGround = false;
}

function beginDying() {
  state = 'dying'; stateTimer = 1.1;
  player.vy = -520; player.vx = 0;
  player.dead = true;
  document.body.classList.add('menu');
}

function beginFinish() {
  state = 'finishing'; stateTimer = 1.2;
  sfx.win();
  const gx = lvl.goal[0] * T + T / 2, gy = (lvl.goal[1] + 1) * T;
  burst(gx, gy - 40, 40, [C.cyan, '#fff', C.duck, C.pink], 380, 1.3, 500, 6);
  player.vx = 0;
}

function updateEnemies(dt) {
  for (const e of enemies) {
    if (e.dead) continue;
    if (e.type === 'e') {
      e.vy = Math.min(e.vy + GRAV * dt, MAX_FALL);
      e.vx = e.dir * e.speed;
      physics(e, dt);
      if (e.hitWall) e.dir = -e.hitWall;
      else if (e.onGround) {
        const fx = e.dir > 0 ? e.x + e.w + 2 : e.x - 2;
        const below = tile(Math.floor(fx / T), Math.floor((e.y + e.h + 4) / T));
        const front = tile(Math.floor(fx / T), Math.floor((e.y + e.h / 2) / T));
        if (below === 0 || below === 3 || front === 3) e.dir = -e.dir;
      }
    } else {
      e.t += dt;
      const nx = e.x0 + Math.sin(e.t * 0.9) * e.range;
      e.dir = nx >= e.x ? 1 : -1;
      e.x = nx - e.w / 2;
      e.y = e.y0 + Math.sin(e.t * 2.1) * 18 - e.h / 2;
    }
  }
}

function updateFx(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const q = particles[i];
    q.life -= dt;
    if (q.life <= 0) { particles.splice(i, 1); continue; }
    q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt;
    if (q.grow) q.r += q.grow * dt;
  }
  for (let i = rings.length - 1; i >= 0; i--) {
    rings[i].t += dt;
    if (rings[i].t > 0.45) rings.splice(i, 1);
  }
  for (let i = popups.length - 1; i >= 0; i--) {
    popups[i].t += dt;
    if (popups[i].t > 0.9) popups.splice(i, 1);
  }
  shake = Math.max(0, shake - dt);
}

function updateCamera(dt, snap) {
  const p = player;
  const want = clamp(p.x + p.w / 2 + p.facing * 70 - W * 0.45, 0, lvl.w * T - W);
  cam = snap ? want : cam + (want - cam) * Math.min(1, dt * 6);
}

function update(dt) {
  if (state === 'play') {
    levelTime += dt;
    updatePlayer(dt);
    if (state === 'play' || state === 'dying' || state === 'finishing') updateEnemies(dt);
    updateCamera(dt);
  } else if (state === 'finishing') {
    updateEnemies(dt);
    stateTimer -= dt;
    // happy hop
    const p = player;
    p.vy += GRAV * dt; physics(p, dt);
    if (p.onGround && stateTimer > 0.3) { p.vy = -420; p.sx = 0.8; p.sy = 1.2; }
    if (stateTimer <= 0) showLevelEnd();
  } else if (state === 'dying') {
    const p = player;
    p.vy += GRAV * dt; p.y += p.vy * dt;
    stateTimer -= dt;
    if (stateTimer <= 0) showGameOver();
  } else if (state === 'title') {
    // attract mode: rings pulse occasionally
    if (!rings) return;
  }
  if (particles) updateFx(dt);
}

/* ====================================================================
 * Rendering — background
 * ==================================================================== */
const starRand = mulberry(7);
const STARS = Array.from({ length: 110 }, () => ({
  x: starRand() * W, y: starRand() * H * 0.8, r: 0.6 + starRand() * 1.8,
  p: 0.02 + starRand() * 0.12, sp: 0.6 + starRand() * 2.2, ph: starRand() * 6.28
}));
const SPORES = Array.from({ length: 26 }, () => ({
  x: starRand() * W, y: starRand() * H, r: 2 + starRand() * 5, p: 0.35 + starRand() * 0.4,
  sp: 6 + starRand() * 14, ph: starRand() * 6.28
}));

function drawBackground(camX, t) {
  const th = lvl.theme;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, th.sky[0]);
  g.addColorStop(1, th.sky[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // stars
  for (const s of STARS) {
    const x = (((s.x - camX * s.p) % W) + W) % W;
    ctx.globalAlpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph));
    disc(x, s.y, s.r, '#fff');
  }
  ctx.globalAlpha = 1;

  // big planet with ring and crescent shade
  const px = 720 - camX * 0.04, py = 150;
  const glow = ctx.createRadialGradient(px, py, 40, px, py, 220);
  glow.addColorStop(0, 'rgba(255,255,255,0.16)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(px - 230, py - 230, 460, 460);
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(-0.28);
  ctx.fillStyle = th.ring; ctx.globalAlpha = 0.35;
  ctx.beginPath(); ctx.ellipse(0, 0, 118, 24, 0, Math.PI, Math.PI * 2); ctx.fill();   // back of ring
  ctx.globalAlpha = 1;
  blob(0, 0, 70, 70, th.planet[0], th.planet[1]);
  ctx.fillStyle = th.ring; ctx.globalAlpha = 0.6;
  ctx.beginPath(); ctx.ellipse(0, 0, 118, 24, 0, 0, Math.PI); ctx.fill();             // front of ring
  ctx.globalAlpha = 1;
  ctx.restore();
  // small moon
  const mx = 300 - camX * 0.07, my = 90;
  blob(mx, my, 20, 20, '#ffffff', '#b9b4e6');

  // hills
  hills(camX * 0.15, 392, 46, 150, th.far);
  hills(camX * 0.32, 448, 34, 110, th.mid);

  // floating spores
  for (const s of SPORES) {
    const x = (((s.x - camX * s.p + Math.sin(t * 0.4 + s.ph) * 14) % W) + W) % W;
    const y = ((s.y - t * s.sp) % H + H) % H;
    ctx.globalAlpha = 0.22;
    disc(x, y, s.r, '#fff');
  }
  ctx.globalAlpha = 1;
}

function hills(off, base, amp, wl, col) {
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let x = 0; x <= W + 12; x += 12) {
    const wx = x + off;
    const y = base + Math.sin(wx / wl) * amp + Math.sin(wx / (wl * 0.43) + 1.7) * amp * 0.3;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();
}

/* ====================================================================
 * Rendering — world
 * ==================================================================== */
function rtop(x, y, w, h, rl, rr) {
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + rl);
  if (rl) ctx.quadraticCurveTo(x, y, x + rl, y);
  ctx.lineTo(x + w - rr, y);
  if (rr) ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();
}

function drawTiles(camX) {
  const th = lvl.theme;
  const x0 = Math.max(0, Math.floor(camX / T) - 1), x1 = Math.min(lvl.w - 1, Math.floor((camX + W) / T) + 1);
  for (let y = 0; y < lvl.h; y++) {
    for (let x = x0; x <= x1; x++) {
      const t = lvl.grid[y][x];
      if (!t) continue;
      const px = Math.round(x * T - camX), py = y * T;
      if (t === 1) drawSolid(x, y, px, py, th);
      else if (t === 2) drawOneway(x, y, px, py, th);
      else drawSpike(x, y, px, py);
    }
  }
}

function drawSolid(x, y, px, py, th) {
  const h = hash(x, y);
  const up = tile(x, y - 1) === 1, rt = tile(x + 1, y) === 1, lf = tile(x - 1, y) === 1, dn = tile(x, y + 1) === 1;
  // stalactite under floating rock
  if (!dn && y < lvl.h - 1) {
    ctx.fillStyle = th.groundD;
    ctx.beginPath();
    ctx.moveTo(px + 5, py + T - 1);
    ctx.lineTo(px + T - 5, py + T - 1);
    ctx.lineTo(px + T / 2 + (h - 0.5) * 8, py + T + 12 + h * 20);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = th.ground;
  ctx.fillRect(px, py, T + 1, T + 1);
  if (!rt) { ctx.fillStyle = th.groundD; ctx.fillRect(px + T - 9, py, 10, T + 1); }
  if (!dn && y < lvl.h - 1) { ctx.fillStyle = th.groundD; ctx.fillRect(px, py + T - 9, T + 1, 10); }
  if (h > 0.5) disc(px + 10 + h * 22, py + 16 + h * 16, 3 + h * 3, th.groundD);
  if (h < 0.18) disc(px + 30, py + 30, 4, th.groundD);
  if (!up) {
    ctx.fillStyle = th.cap;
    rtop(px, py, T + 1, 14, lf ? 0 : 9, rt ? 0 : 9);
    ctx.fillStyle = th.capD;
    ctx.fillRect(px, py + 14, T + 1, 5);
    if (!rt) { rtop(px + T - 9, py, 10, 14, 0, 9); }
  }
}

function drawOneway(x, y, px, py, th) {
  const lf = tile(x - 1, y) === 2, rt = tile(x + 1, y) === 2;
  const pad = 0;
  ctx.fillStyle = th.capD;
  rrect(px - (lf ? 1 : 0), py + 4, T + (lf ? 1 : 0) + (rt ? 1 : 0) + pad, 12, lf && rt ? 0 : 6);
  ctx.fill();
  ctx.fillStyle = th.cap;
  rrect(px - (lf ? 1 : 0), py, T + (lf ? 1 : 0) + (rt ? 1 : 0), 11, lf && rt ? 0 : 6);
  ctx.fill();
}

function drawSpike(x, y, px, py) {
  const n = 3, w = T / n;
  for (let i = 0; i < n; i++) {
    const bx = px + i * w, by = py + T;
    ctx.fillStyle = C.pinkD;
    ctx.beginPath(); ctx.moveTo(bx + 1, by); ctx.lineTo(bx + w / 2, by - 26); ctx.lineTo(bx + w - 1, by); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.pink;
    ctx.beginPath(); ctx.moveTo(bx + 1, by); ctx.lineTo(bx + w / 2, by - 26); ctx.lineTo(bx + w / 2 + 1, by); ctx.closePath(); ctx.fill();
  }
}

function drawCheckpoint(camX, t) {
  const x = lvl.cp[0] * T + T / 2 - camX, y = (lvl.cp[1] + 1) * T;
  if (x < -60 || x > W + 60) return;
  ctx.fillStyle = '#d7d3ff';
  rrect(x - 3, y - 74, 6, 74, 3); ctx.fill();
  disc(x, y - 76, 6, '#fff');
  const col = cpActive ? C.cyan : '#6f6aa8', colD = cpActive ? C.cyanD : '#554f8c';
  const wv = Math.sin(t * 4) * (cpActive ? 4 : 1.5);
  ctx.fillStyle = colD;
  ctx.beginPath(); ctx.moveTo(x + 3, y - 70); ctx.quadraticCurveTo(x + 22, y - 66 + wv, x + 38, y - 58 + wv); ctx.lineTo(x + 3, y - 44); ctx.closePath(); ctx.fill();
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(x + 3, y - 70); ctx.quadraticCurveTo(x + 22, y - 66 + wv, x + 38, y - 58 + wv); ctx.lineTo(x + 3, y - 58); ctx.closePath(); ctx.fill();
}

function drawGoal(camX, t) {
  const x = lvl.goal[0] * T + T / 2 - camX, y = (lvl.goal[1] + 1) * T;
  if (x < -140 || x > W + 140) return;
  // light beam
  const bg = ctx.createLinearGradient(0, y - 260, 0, y);
  bg.addColorStop(0, 'rgba(53,224,184,0)');
  bg.addColorStop(1, 'rgba(53,224,184,0.32)');
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.moveTo(x - 40, y); ctx.lineTo(x - 70, y - 260); ctx.lineTo(x + 70, y - 260); ctx.lineTo(x + 40, y); ctx.closePath(); ctx.fill();
  // pond
  const pg = ctx.createLinearGradient(0, y - 12, 0, y + 14);
  pg.addColorStop(0, '#6ff0ff'); pg.addColorStop(1, '#1ba0d8');
  ctx.fillStyle = '#128bc0';
  ctx.beginPath(); ctx.ellipse(x, y - 2, 62, 16, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = pg;
  ctx.beginPath(); ctx.ellipse(x - 3, y - 5, 56, 12, 0, 0, Math.PI * 2); ctx.fill();
  // ripples
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const k = ((t * 0.5 + i / 3) % 1);
    ctx.globalAlpha = 1 - k;
    ctx.beginPath(); ctx.ellipse(x, y - 4, 10 + k * 46, 3 + k * 9, 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // lily pad
  ctx.fillStyle = '#1fb394';
  ctx.beginPath(); ctx.ellipse(x + 30, y - 6, 12, 4, 0, 0, Math.PI * 2); ctx.fill();
  disc(x + 33, y - 9, 3, C.pink);
  // sparkles
  for (let i = 0; i < 5; i++) {
    const a = t * 1.2 + i * 1.26, sx = x + Math.cos(a) * (28 + i * 6), sy = y - 40 - ((t * 30 + i * 40) % 130);
    ctx.globalAlpha = 0.8; disc(sx, sy, 2.5, '#fff');
  }
  ctx.globalAlpha = 1;
}

function drawBread(camX, t) {
  for (const b of bread) {
    if (b.got) continue;
    const x = b.x - camX;
    if (x < -30 || x > W + 30) continue;
    const y = b.y + Math.sin(t * 3 + b.ph) * 4;
    const gl = ctx.createRadialGradient(x, y, 2, x, y, 28);
    gl.addColorStop(0, 'rgba(255,200,87,0.45)'); gl.addColorStop(1, 'rgba(255,200,87,0)');
    ctx.fillStyle = gl; ctx.fillRect(x - 28, y - 28, 56, 56);
    // slice: crust + crumb
    ctx.fillStyle = C.crust;
    rrect(x - 12, y - 10, 24, 22, 7); ctx.fill();
    disc(x - 6, y - 10, 7, C.crust); disc(x + 6, y - 10, 7, C.crust);
    ctx.fillStyle = C.bread;
    rrect(x - 9, y - 7, 18, 17, 5); ctx.fill();
    disc(x - 5, y - 9, 5, C.bread); disc(x + 5, y - 9, 5, C.bread);
    ctx.fillStyle = C.breadD;
    rrect(x + 2, y - 2, 7, 12, 3); ctx.fill();
    disc(x - 3, y + 1, 1.3, C.crust); disc(x + 1, y + 5, 1.1, C.crust);
  }
}

/* ---------- enemies ---------- */
function drawEnemy(e, camX, t) {
  const x = e.x + e.w / 2 - camX;
  if (x < -60 || x > W + 60) return;
  if (e.type === 'e') {
    const y = e.y + e.h;
    const sq = Math.sin(t * 8 + e.ph) * 0.07;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1 - sq, 1 + sq);
    // feet
    ctx.fillStyle = C.pinkD;
    ctx.beginPath(); ctx.ellipse(-9, -2, 7, 3.5, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(9, -2, 7, 3.5, 0, 0, 7); ctx.fill();
    // little dorsal spikes
    ctx.fillStyle = C.pinkD;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath(); ctx.moveTo(i * 10 - 4, -26); ctx.lineTo(i * 10, -35); ctx.lineTo(i * 10 + 4, -26); ctx.closePath(); ctx.fill();
    }
    blob(0, -15, 20, 15.5, C.pink, C.pinkD);
    // eyes
    const d = e.dir;
    disc(-6 + d * 1, -17, 5.2, '#fff'); disc(8 + d * 1, -17, 5.2, '#fff');
    disc(-5 + d * 2.6, -16.5, 2.5, C.ink); disc(9 + d * 2.6, -16.5, 2.5, C.ink);
    // angry brows
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-12, -26); ctx.lineTo(-2, -22.5); ctx.moveTo(14, -26); ctx.lineTo(4, -22.5); ctx.stroke();
    ctx.restore();
  } else {
    const cy = e.y + e.h / 2;
    ctx.save();
    ctx.translate(x, cy);
    ctx.save();
    ctx.rotate(t * 0.8 + e.ph);
    ctx.fillStyle = C.lilac;
    for (let i = 0; i < 8; i++) {
      ctx.rotate(Math.PI / 4);
      ctx.beginPath(); ctx.moveTo(-4.5, -13); ctx.lineTo(0, -26); ctx.lineTo(4.5, -13); ctx.closePath(); ctx.fill();
      disc(0, -26, 2.6, '#fff');
    }
    ctx.restore();
    blob(0, 0, 16.5, 16.5, C.purple, C.purpleD);
    // eye looks toward player
    const lx = clamp((player.x - e.x) / 60, -1, 1), ly = clamp((player.y - e.y) / 60, -1, 1);
    disc(0, -1, 7, '#fff');
    disc(lx * 2.5, -1 + ly * 2.5, 3.4, C.ink);
    disc(lx * 2.5 + 1, -2 + ly * 2.5, 1, '#fff');
    ctx.restore();
  }
}

/* ---------- the duck ---------- */
function drawDuck(x, y, o) {
  const s = o.scale || 0.8, f = o.facing || 1;
  const t = o.t || 0, run = o.run || 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(f * s * (o.sx || 1), s * (o.sy || 1));

  // legs & feet
  const sw = Math.sin(t * 16) * run * 6;
  ctx.fillStyle = C.leg;
  rrect(-10 + sw, -9, 6, 10, 3); ctx.fill();
  rrect(5 - sw, -9, 6, 10, 3); ctx.fill();
  ctx.fillStyle = C.beak;
  ctx.beginPath(); ctx.ellipse(-5 + sw + 3, 1, 9, 3.4, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(10 - sw + 3, 1, 9, 3.4, 0, 0, 7); ctx.fill();

  // tail
  ctx.fillStyle = C.duckD;
  ctx.beginPath(); ctx.moveTo(-17, -24); ctx.quadraticCurveTo(-30, -40, -37, -34); ctx.quadraticCurveTo(-33, -22, -19, -13); ctx.closePath(); ctx.fill();

  // body
  blob(0, -21, 25, 19.5, C.duck, C.duckD);

  // wing
  let wa = 0.15;
  if (o.glide) wa = 0.55 + Math.sin(t * 22) * 0.06;
  else if (o.air) wa = o.vy < 0 ? 0.95 + Math.sin(t * 30) * 0.2 : 0.35;
  else wa = 0.1 + Math.sin(t * 16) * 0.08 * run;
  ctx.save();
  ctx.translate(2, -22);
  ctx.rotate(wa);
  const ws = o.glide ? 1.25 : 1;
  blob(-9 * ws, 0, 14 * ws, 7.5, C.wing, C.wingD);
  ctx.restore();

  // head
  blob(11, -41, 15.5, 14.5, C.duck, C.duckD);
  // cheek
  ctx.globalAlpha = 0.55; ctx.fillStyle = C.pink;
  ctx.beginPath(); ctx.ellipse(6, -35, 4.2, 2.6, 0, 0, 7); ctx.fill();
  ctx.globalAlpha = 1;

  // beak (opens when quacking)
  const q = o.quack || 0;
  ctx.fillStyle = C.beakD;
  ctx.beginPath(); ctx.ellipse(24, -33 + q * 4, 9, 3.4, 0, 0, 7); ctx.fill();
  ctx.fillStyle = C.beak;
  ctx.beginPath(); ctx.ellipse(25, -38 - q * 4.5, 11.5, 5, -q * 0.2, 0, 7); ctx.fill();
  if (q > 0.2) { ctx.fillStyle = '#8a1f2f'; ctx.beginPath(); ctx.ellipse(23, -35.5, 6.5, 1.8 + q * 2.5, 0, 0, 7); ctx.fill(); ctx.fillStyle = C.beak; ctx.beginPath(); ctx.ellipse(25, -38 - q * 4.5, 11.5, 5, -q * 0.2, 0, 7); ctx.fill(); }

  // eye
  if (o.blink > 0 || o.dead) {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(10, -44); ctx.lineTo(18, -44); ctx.stroke();
  } else {
    disc(14.5, -44.5, 5.4, '#fff');
    disc(16.2, -44.2, 3, C.ink);
    disc(17.1, -45.4, 1.1, '#fff');
  }
  ctx.restore();
}

function drawPlayer(t) {
  const p = player;
  if (p.inv > 0 && state === 'play' && Math.floor(p.inv * 14) % 2 === 0) return;
  drawDuck(p.x + p.w / 2 - cam, p.y + p.h, {
    facing: p.facing, t: time, run: p.onGround ? clamp(Math.abs(p.vx) / RUN, 0, 1) : 0,
    air: !p.onGround, vy: p.vy, glide: p.gliding, sx: p.sx, sy: p.sy, quack: p.quack,
    blink: p.blink, dead: p.dead, scale: 0.82
  });
  // glide meter
  if (p.glide < GLIDE_MAX - 0.02 && !p.onGround) {
    const cx = p.x + p.w / 2 - cam, cy = p.y - 14;
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; rrect(cx - 16, cy, 32, 4, 2); ctx.fill();
    ctx.fillStyle = C.cyan; rrect(cx - 16, cy, 32 * Math.max(0, p.glide / GLIDE_MAX), 4, 2); ctx.fill();
  }
}

function drawFx(camX) {
  // quack rings
  for (const r of rings) {
    const k = r.t / 0.45, e = 1 - Math.pow(1 - k, 3);
    ctx.globalAlpha = (1 - k) * 0.5;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(r.x - camX, r.y, QUACK_R * e, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1 - k;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 5 * (1 - k) + 1;
    ctx.beginPath(); ctx.arc(r.x - camX, r.y, QUACK_R * e, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // particles
  for (const q of particles) {
    ctx.globalAlpha = clamp(q.life / q.max, 0, 1);
    disc(q.x - camX, q.y, q.r, q.c);
  }
  ctx.globalAlpha = 1;
  // popups
  ctx.font = '900 18px "Avenir Next","Segoe UI",system-ui,sans-serif';
  ctx.textAlign = 'center';
  for (const p of popups) {
    const k = p.t / 0.9;
    ctx.globalAlpha = 1 - k * k;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillText(p.txt, p.x - camX + 1.5, p.y - k * 36 + 2);
    ctx.fillStyle = p.col;
    ctx.fillText(p.txt, p.x - camX, p.y - k * 36);
  }
  ctx.globalAlpha = 1;
}

/* ---------- HUD ---------- */
function heart(x, y, s, col) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.bezierCurveTo(-18, -2, -10, -15, 0, -5);
  ctx.bezierCurveTo(10, -15, 18, -2, 0, 10);
  ctx.closePath();
  ctx.fillStyle = col; ctx.fill();
  ctx.restore();
}

function drawHUD() {
  for (let i = 0; i < MAX_LIVES; i++) heart(34 + i * 38, 36, 1.35, i < lives ? C.pink : 'rgba(255,255,255,0.2)');
  // bread counter
  ctx.fillStyle = C.crust; rrect(20, 60, 22, 20, 6); ctx.fill();
  disc(26, 60, 6, C.crust); disc(36, 60, 6, C.crust);
  ctx.fillStyle = C.bread; rrect(23, 63, 16, 15, 4); ctx.fill();
  ctx.font = '900 20px "Avenir Next","Segoe UI",system-ui,sans-serif';
  ctx.textAlign = 'left'; ctx.fillStyle = '#fff';
  ctx.fillText(breadGot + ' / ' + lvl.def.bread.length, 52, 78);
  // quack meter
  const ready = player.quackCd <= 0;
  const cx = 32, cy = 112, r = 14;
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
  ctx.fillStyle = ready ? C.pink : '#b9b4e6';
  ctx.beginPath(); ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - player.quackCd / QUACK_CD)); ctx.closePath(); ctx.fill();
  ctx.font = '800 14px "Avenir Next","Segoe UI",system-ui,sans-serif';
  ctx.fillStyle = ready ? '#fff' : '#b9b4e6';
  ctx.fillText(ready ? 'Quack ready (X)' : 'Quack...', 54, 117);
  // level name + score
  ctx.textAlign = 'center';
  ctx.font = '900 15px "Avenir Next","Segoe UI",system-ui,sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.fillText('WORLD ' + (levelIndex + 1) + ' · ' + lvl.name.toUpperCase() + '  ·  SCORE ' + score, W / 2, 26);
}

/* ---------- frame ---------- */
function render() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, W, H);
  let ox = 0, oy = 0;
  if (shake > 0) { ox = rnd(-1, 1) * shake * 18; oy = rnd(-1, 1) * shake * 18; }
  ctx.save();
  ctx.translate(ox, oy);

  if (state === 'title') {
    drawBackground(0, time);
    drawTiles(0);
    drawBread(0, time);
    // big duck, bobbing gently
    const bob = Math.abs(Math.sin(time * 2.2)) * 6;
    drawDuck(700, 450 - bob, { scale: 2.4, facing: -1, t: time, run: 0, quack: titleQuack, blink: (time % 3.4) < 0.12 ? 1 : 0, sy: 1 + Math.sin(time * 4.4) * 0.02 });
    titleQuack = Math.max(0, titleQuack - 0.05);
    drawFx(0);
  } else {
    drawBackground(cam, time);
    drawTiles(cam);
    drawCheckpoint(cam, time);
    drawGoal(cam, time);
    drawBread(cam, time);
    for (const e of enemies) if (!e.dead) drawEnemy(e, cam, time);
    drawPlayer(time);
    drawFx(cam);
  }
  ctx.restore();
  if (state !== 'title') drawHUD();
}

let titleQuack = 0;

/* ====================================================================
 * Screens & flow
 * ==================================================================== */
const screens = {
  title: $('#title'), device: $('#device'), pause: $('#pause'), end: $('#levelEnd'), over: $('#gameOver'), win: $('#win')
};
function showScreen(name) {
  for (const k in screens) screens[k].classList.toggle('hidden', k !== name);
  document.body.classList.toggle('menu', name !== null);
}

function saveBest() {
  if (score > best) {
    best = score;
    try { localStorage.setItem(SAVE_KEY, String(best)); } catch (e) { /* ignore */ }
  }
}
function updateBestLine() {
  $('#bestLine').textContent = best > 0 ? 'Best score: ' + best : '';
}

function startGame() {
  audio();
  score = 0; totalBread = 0; lives = MAX_LIVES;
  loadLevel(0);
  updateCamera(0, true);
  state = 'play';
  showScreen(null);
}

function showLevelEnd() {
  state = 'end';
  score += Math.max(0, Math.round(60 - levelTime)) * 2; // speed bonus
  saveBest();
  $('#endWorld').textContent = 'World ' + (levelIndex + 1) + ' · ' + lvl.name;
  $('#endBread').textContent = breadGot + '/' + lvl.def.bread.length;
  $('#endFoes').textContent = String(foesBeaten);
  $('#endTime').textContent = Math.round(levelTime) + 's';
  $('#endScore').textContent = String(score);
  $('#btnNext').textContent = levelIndex === LEVELS.length - 1 ? 'Finish' : 'Next world';
  showScreen('end');
}

function nextLevel() {
  if (levelIndex >= LEVELS.length - 1) {
    state = 'win';
    $('#winBread').textContent = String(totalBread);
    $('#winScore').textContent = String(score);
    $('#winBest').textContent = score >= best ? 'New best score!' : 'Best score: ' + best;
    showScreen('win');
    return;
  }
  lives = Math.max(lives, 2);        // small kindness between worlds
  loadLevel(levelIndex + 1);
  updateCamera(0, true);
  state = 'play';
  showScreen(null);
}

function showGameOver() {
  state = 'over';
  sfx.over();
  saveBest();
  showScreen('over');
}

function retryLevel() {
  score = levelStartScore;
  totalBread -= breadGot; lives = MAX_LIVES;
  loadLevel(levelIndex);
  updateCamera(0, true);
  state = 'play';
  showScreen(null);
}

function toTitle() {
  state = 'title';
  loadLevel(0);
  cam = 0;
  updateBestLine();
  showScreen('title');
}

function pauseGame() {
  if (state !== 'play') return;
  state = 'pause';
  showScreen('pause');
}
function resumeGame() {
  if (state !== 'pause') return;
  state = 'play';
  showScreen(null);
}

/* ====================================================================
 * Input
 * ==================================================================== */
const keymap = {
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'jump', KeyW: 'jump', Space: 'jump', ArrowDown: 'down', KeyS: 'down'
};
const quackKeys = ['KeyX', 'KeyK', 'KeyZ', 'ShiftLeft', 'ShiftRight'];

window.addEventListener('keydown', (e) => {
  const k = keymap[e.code];
  if (k && state === 'play') {
    e.preventDefault();
    if (k === 'jump' && !inp.jump) jumpBuf = 0.14;
    inp[k] = true;
  }
  if (quackKeys.includes(e.code) && state === 'play') { e.preventDefault(); if (!e.repeat) quackReq = true; }
  if (e.repeat) return;
  if (e.code === 'KeyP' || e.code === 'Escape') { state === 'pause' ? resumeGame() : pauseGame(); }
  if (e.code === 'KeyM') toggleMute();
  audio();
});
window.addEventListener('keyup', (e) => {
  const k = keymap[e.code];
  if (k) inp[k] = false;
});
window.addEventListener('blur', () => { inp.left = inp.right = inp.jump = inp.down = false; pauseGame(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) pauseGame(); });

function press(act, down) {
  if (act === 'quack') { if (down) quackReq = true; return; }
  if (act === 'jump' && down && !inp.jump) jumpBuf = 0.14;
  inp[act] = down;
}
document.querySelectorAll('[data-act]').forEach((b) => {
  const act = b.dataset.act;
  const on = (e) => { e.preventDefault(); if (b.setPointerCapture) { try { b.setPointerCapture(e.pointerId); } catch (_) { /* */ } } b.classList.add('on'); audio(); press(act, true); };
  const off = (e) => { e.preventDefault(); b.classList.remove('on'); press(act, false); };
  b.addEventListener('pointerdown', on);
  b.addEventListener('pointerup', off);
  b.addEventListener('pointercancel', off);
  b.addEventListener('lostpointercapture', off);
  b.addEventListener('contextmenu', (e) => e.preventDefault());
});

/* ---------- device choice: computer (keyboard) or mobile (touch) ---------- */
const touchCapable = ('ontouchstart' in window) || !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
const DEVICE_KEY = 'duckdash.device';
let device = touchCapable ? 'mobile' : 'computer';
try { const d = localStorage.getItem(DEVICE_KEY); if (d === 'mobile' || d === 'computer') device = d; } catch (e) { /* ignore */ }

function applyDevice(d) {
  device = d;
  document.body.classList.toggle('touch', d === 'mobile');
  $('#devMobile').classList.toggle('sel', d === 'mobile');
  $('#devComputer').classList.toggle('sel', d === 'computer');
  $('#btnSwitch').textContent = d === 'mobile' ? 'Switch to keyboard controls' : 'Switch to mobile controls';
  try { localStorage.setItem(DEVICE_KEY, d); } catch (e) { /* ignore */ }
}

// Fullscreen + landscape lock help on phones. Must run inside a tap handler.
function goMobileFullscreen() {
  const el = document.documentElement;
  const lock = () => {
    try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); } catch (e) { /* ignore */ }
  };
  try {
    if (document.fullscreenElement || document.webkitFullscreenElement) { lock(); return; }
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (req) {
      const r = req.call(el, { navigationUI: 'hide' });
      if (r && r.then) r.then(lock).catch(() => {}); else lock();
    }
  } catch (e) { /* ignore */ }
}

function chooseDevice(d) {
  applyDevice(d);
  audio();
  if (d === 'mobile') goMobileFullscreen();
  startGame();
}
applyDevice(device);

function toggleMute() {
  muted = !muted;
  try { localStorage.setItem('duckdash.muted', muted ? '1' : '0'); } catch (e) { /* ignore */ }
  $('#btnMute').classList.toggle('off', muted);
}

$('#btnPlay').addEventListener('click', () => { audio(); showScreen('device'); });
$('#devComputer').addEventListener('click', () => chooseDevice('computer'));
$('#devMobile').addEventListener('click', () => chooseDevice('mobile'));
$('#btnDevBack').addEventListener('click', () => showScreen('title'));
$('#btnSwitch').addEventListener('click', () => {
  const d = device === 'mobile' ? 'computer' : 'mobile';
  applyDevice(d);
  if (d === 'mobile') goMobileFullscreen();
});
$('#btnNext').addEventListener('click', nextLevel);
$('#btnRetry').addEventListener('click', retryLevel);
$('#btnAgain').addEventListener('click', toTitle);
$('#btnResume').addEventListener('click', resumeGame);
$('#btnQuit').addEventListener('click', toTitle);
$('#btnQuit2').addEventListener('click', toTitle);
$('#btnPause').addEventListener('click', () => { state === 'pause' ? resumeGame() : pauseGame(); });
$('#btnMute').addEventListener('click', toggleMute);
$('#btnMute').classList.toggle('off', muted);
canvas.addEventListener('pointerdown', () => {
  if (state === 'title') { audio(); sfx.quack(); titleQuack = 1; rings.push({ x: 700, y: 400, t: 0 }); }
});

/* ====================================================================
 * Main loop
 * ==================================================================== */
let last = 0;
function frame(ts) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.033, (ts - last) / 1000 || 0);
  last = ts;
  time += dt;
  update(dt);
  render();
}

// boot
loadLevel(0);
updateBestLine();
showScreen('title');
requestAnimationFrame(frame);

})();
