/* Duck Dash: Fire & Ash — Kurzgesagt-styled Puzzle Platformer.
 * Flat vector aesthetic, bold colors, smooth animation, science infographic elements.
 * Dual elemental mechanics (Fire Duck & Ash Duck), tasks, puzzles, Canvas 2D. */
(() => {
'use strict';

const W = 960, H = 540, T = 45;
const GRAV = 2200, RUN = 240, JUMP = 720, FLAP = 580;
const GLIDE_FALL = 120, MAX_FALL = 900, GLIDE_MAX = 1.4;
const INTERACT_R = 48, CRATE_PUSH = 155;
const SAVE_KEY = 'duckpuzzle.v2';

const $ = s => document.querySelector(s);
const canvas = $('#game'), ctx = canvas.getContext('2d');
const DPR = Math.min(2, Math.max(1, Math.ceil(devicePixelRatio || 1)));
canvas.width = W * DPR; canvas.height = H * DPR;

/* ── Kurzgesagt Palette ─────────────────────────────────────── */
const C = {
  // Normal Duck
  duck:'#ffd23f', duckD:'#f2a900', wing:'#ffc21a', wingD:'#e69a00',
  beak:'#ff7a2f', beakD:'#e0561a', leg:'#ff8a2b',
  ink:'#101032', white:'#ffffff',
  // Fire Element
  fire:'#ff5400', fireD:'#c42800', fireGlow:'#ffaa00', fireFlame:'#ffe600',
  fireWing:'#ff8c00', fireBeak:'#ffd23f',
  // Ash Element
  ash:'#2d2d3a', ashD:'#1c1c26', ashL:'#404052',
  ashEye:'#00f0ff', ashEmber:'#ff3366', ashVein:'#ff6b4a',
  // Puzzle & Environment
  ice:'#a5f3fc', iceD:'#38bdf8', iceBorder:'#0284c7',
  magma:'#ff3b00', magmaD:'#b81400', magmaGlow:'#ff9900',
  bread:'#ffc857', breadD:'#e8932a', crust:'#c9741a',
  pink:'#ff5d8f', pinkD:'#d93b6f',
  purple:'#9b5de5', purpleD:'#6f3bb8', lilac:'#c9a3ff',
  cyan:'#35e0b8', cyanD:'#1fb394',
  crate:'#d4956a', crateD:'#a66b3e', crateL:'#f0c896',
  leverBase:'#8a86c9', leverHandle:'#e6e2ff',
  portalA:'#9b5de5', portalB:'#35e0b8',
  keyYellow:'#ffd23f', keyPink:'#ff5d8f', keyBlue:'#4dabf7',
  gateYellow:'#e0a800', gatePink:'#d93b6f', gateBlue:'#2b8ad9',
  brazierStone:'#373254', brazierRim:'#585285',
};
const keyCol = c => c === 'yellow' ? C.keyYellow : c === 'pink' ? C.keyPink : C.keyBlue;
const gateCol = c => c === 'yellow' ? C.gateYellow : c === 'pink' ? C.gatePink : C.gateBlue;

/* ── Level Themes ───────────────────────────────────────────── */
const THEMES = [
  { sky:['#0a0e2a','#2b1766'], far:'#251b5c', mid:'#1b1348',
    ground:'#3f348a', groundD:'#2d2568', cap:'#ffaa00', capD:'#d97700',
    planet:['#ff5400','#c42800'], ring:'#ffd0aa', accent:'#ffaa00' },
  { sky:['#180820','#481232'], far:'#3d1428', mid:'#2a0c1a',
    ground:'#4a2034', groundD:'#341422', cap:'#ff5d8f', capD:'#d93b6f',
    planet:['#ff3366','#991133'], ring:'#ffa0b8', accent:'#ff3366' },
  { sky:['#081a2e','#114b5f'], far:'#103b45', mid:'#092930',
    ground:'#1c5866', groundD:'#113c47', cap:'#35e0b8', capD:'#1fb394',
    planet:['#35e0b8','#128c70'], ring:'#a8ffeb', accent:'#35e0b8' },
  { sky:['#160833','#4a186b'], far:'#3b1358', mid:'#280c3e',
    ground:'#54247a', groundD:'#3c1759', cap:'#c9a3ff', capD:'#9b5de5',
    planet:['#9b5de5','#6b2fb5'], ring:'#ebd4ff', accent:'#c9a3ff' },
  { sky:['#0b1636','#184478'], far:'#173d68', mid:'#0e2847',
    ground:'#23588f', groundD:'#173e66', cap:'#4dabf7', capD:'#2278bf',
    planet:['#4dabf7','#1c64a8'], ring:'#cfe8ff', accent:'#4dabf7' },
  { sky:['#1f143d','#662244'], far:'#481a38', mid:'#301026',
    ground:'#522646', groundD:'#3a1830', cap:'#ffd23f', capD:'#e0a800',
    planet:['#ffd23f','#e07b00'], ring:'#fff1b8', accent:'#ffd23f' }
];

/* ── Puzzle Levels with Fire & Ash Tasks ──────────────────────── */
const LEVELS = [
  { /* 1 — The Solar Awakening */
    name:'Solar Awakening', sub:'Harness Fire to light Braziers and melt Ice',
    w:32, theme:THEMES[0],
    ground:[[0,32]],
    plats:[[7,6,4],[19,6,4]],
    blocks:[], spikes:[], springs:[],
    doors:[], buttons:[], crates:[], keys:[], gates:[], levers:[], togglePlats:[], portals:[],
    // Fire & Ash elements
    altars:[[4,9,'fire']],
    braziers:[[10,5,0],[21,5,0]],
    ice:[[15,7,2,3]],
    ashPlates:[],
    magma:[],
    bread:[[2,9],[5,9],[8,5],[11,5],[17,9],[20,5],[22,5],[25,9],[27,9]],
    enemies:[],
    tasks:[
      { id:'altar_fire', desc:'Attune to Solar Fire at the Altar', current:0, total:1, done:false },
      { id:'braziers', desc:'Ignite Ancient Braziers', current:0, total:2, done:false },
      { id:'ice', desc:'Melt Cryo Barrier with Fire Duck', current:0, total:1, done:false }
    ],
    start:[1,9], cp:[16,9], goal:[29,9],
    hint:'Step on the Solar Altar to become Fire Duck! Light braziers and melt ice to unlock the pond.'
  },
  { /* 2 — The Cinder Crucible */
    name:'Cinder Crucible', sub:'Ash Form resists Magma and triggers Heavy Plates',
    w:34, theme:THEMES[1],
    ground:[[0,11],[16,34]],
    plats:[[22,6,3]],
    blocks:[], spikes:[], springs:[],
    doors:[[20,4,1,6,1]], // opened by ash plate 1
    buttons:[], crates:[], keys:[], gates:[], levers:[], togglePlats:[], portals:[],
    altars:[[4,9,'ash']],
    braziers:[],
    ice:[],
    ashPlates:[[18,9,1]],
    magma:[[11,9,5]], // 5 tiles of magma only Ash Duck can cross safely
    bread:[[2,9],[6,9],[9,9],[17,9],[19,9],[23,5],[26,9],[28,9],[30,9]],
    enemies:[],
    tasks:[
      { id:'altar_ash', desc:'Embrace Ash Form at Cinder Altar', current:0, total:1, done:false },
      { id:'magma', desc:'Traverse the Molten Magma Trench', current:0, total:1, done:false },
      { id:'ashPlates', desc:'Depress the Heavy Ash Plate', current:0, total:1, done:false }
    ],
    start:[1,9], cp:[17,9], goal:[31,9],
    hint:'Normal ducks burn in magma! Become Ash Duck to walk across and press the heavy stone plate.'
  },
  { /* 3 — Thermal Equilibrium */
    name:'Thermal Equilibrium', sub:'Switch between Fire and Ash to solve dual obstacles',
    w:38, theme:THEMES[2],
    ground:[[0,38]],
    plats:[[6,6,3],[22,6,4]],
    blocks:[], spikes:[], springs:[],
    doors:[[28,4,1,6,1]],
    buttons:[],
    crates:[[13,9]],
    keys:[], gates:[], levers:[], togglePlats:[], portals:[],
    altars:[[3,9,'fire'],[18,9,'ash']],
    braziers:[[7,5,0]],
    ice:[[11,7,2,3]], // blocks crate until melted
    ashPlates:[[25,9,1]],
    magma:[[20,9,3]],
    bread:[[2,9],[5,9],[8,5],[14,9],[17,9],[23,5],[26,9],[30,9],[33,9]],
    enemies:[['e',15,9]],
    tasks:[
      { id:'ice', desc:'Melt Cryo Seal to release Crate', current:0, total:1, done:false },
      { id:'braziers', desc:'Ignite Solar Beacon', current:0, total:1, done:false },
      { id:'ashPlates', desc:'Activate Heavy Ash Plate', current:0, total:1, done:false }
    ],
    start:[1,9], cp:[19,9], goal:[35,9],
    hint:'Use Fire Duck to melt the ice around the crate, then Ash Duck to push it past the magma!'
  },
  { /* 4 — Quantum Cinders */
    name:'Quantum Cinders', sub:'Warp cargo and reach high altitude thermal points',
    w:38, theme:THEMES[3],
    ground:[[0,38]],
    plats:[[7,5,4],[27,6,3]],
    blocks:[[19,0,1,10]],
    spikes:[],
    springs:[[5,9,1]],
    doors:[[33,4,1,6,1]],
    buttons:[],
    crates:[[12,9]],
    keys:[[8,4,'yellow']],
    gates:[[30,4,1,6,'yellow']],
    levers:[], togglePlats:[],
    portals:[[16,9,22,9,'purple']],
    altars:[[3,9,'fire'],[24,9,'ash']],
    braziers:[[8,3,0]],
    ice:[[28,8,2,2]],
    ashPlates:[[26,9,1]],
    magma:[],
    bread:[[2,9],[4,8],[7,4],[10,4],[14,9],[23,9],[25,8],[28,5],[32,9],[35,9]],
    enemies:[['f',14,4]],
    tasks:[
      { id:'braziers', desc:'Bounce & Ignite High Altitude Brazier', current:0, total:1, done:false },
      { id:'portalCrate', desc:'Teleport Crate through Quantum Portal', current:0, total:1, done:false },
      { id:'ashPlates', desc:'Depress Sector Ash Plate', current:0, total:1, done:false }
    ],
    start:[1,9], cp:[23,9], goal:[35,9],
    hint:'Mushroom spring gives huge lift to ignite high braziers. Warped crates carry momentum!'
  },
  { /* 5 — The Stellar Reactor */
    name:'Stellar Reactor', sub:'Route energy networks with levers and triple braziers',
    w:42, theme:THEMES[4],
    ground:[[0,12],[20,30],[36,42]],
    plats:[[14,5,4]],
    blocks:[], spikes:[], springs:[[6,9,1]],
    doors:[[35,4,1,6,1]],
    buttons:[], crates:[], keys:[], gates:[],
    levers:[[4,9,1],[22,9,2]],
    togglePlats:[[12,8,4,1,true],[16,6,4,1,false],[28,7,5,2,false],[33,8,3,2,true]],
    portals:[],
    altars:[[2,9,'fire'],[24,9,'ash']],
    braziers:[[8,4,0],[15,4,0],[27,8,0]],
    ice:[[31,7,2,3]],
    ashPlates:[[38,9,1]],
    magma:[[12,9,8],[30,9,6]],
    bread:[[3,9],[7,8],[14,4],[16,4],[21,9],[25,9],[28,6],[32,6],[37,9],[39,9]],
    enemies:[['f',15,3],['e',26,9]],
    tasks:[
      { id:'braziers', desc:'Power 3 Stellar Reactor Braziers', current:0, total:3, done:false },
      { id:'ice', desc:'Melt Sub-Zero Coolant Core', current:0, total:1, done:false },
      { id:'ashPlates', desc:'Depress Terminal Reactor Plate', current:0, total:1, done:false }
    ],
    start:[1,9], cp:[21,9], goal:[40,9],
    hint:'Flip levers to form bridges over magma trenches. Ignite all 3 braziers to power the system.'
  },
  { /* 6 — The Grand Crucible */
    name:'The Grand Crucible', sub:'The ultimate synthesis of Fire, Ash, Portals and Crystals',
    w:52, theme:THEMES[5],
    ground:[[0,52]],
    plats:[[6,6,4],[18,6,4],[32,6,4],[44,7,3]],
    blocks:[[15,0,1,10],[28,0,1,10],[40,0,1,10]],
    spikes:[], springs:[[4,9,1],[30,9,1]],
    doors:[[15,4,1,6,1],[40,4,1,6,2]],
    buttons:[],
    crates:[[7,9]],
    keys:[[20,5,'pink'],[34,5,'blue']],
    gates:[[28,4,1,6,'pink'],[48,4,1,6,'blue']],
    levers:[[23,9,1]],
    togglePlats:[[26,7,4,1,false]],
    portals:[[25,9,42,9,'purple']],
    altars:[[2,9,'fire'],[17,9,'ash'],[31,9,'fire']],
    braziers:[[8,5,0],[21,5,0],[33,5,0]],
    ice:[[12,7,2,3],[37,7,2,3]],
    ashPlates:[[10,9,1],[44,9,2]],
    magma:[[13,9,2],[38,9,2]],
    bread:[[3,9],[5,8],[8,4],[16,9],[19,5],[24,9],[29,8],[32,5],[36,9],[41,9],[45,6],[49,9]],
    enemies:[['e',11,9],['f',22,4],['e',32,9],['f',43,5]],
    tasks:[
      { id:'braziers', desc:'Ignite All 3 Celestial Braziers', current:0, total:3, done:false },
      { id:'ice', desc:'Melt Both Cryo Barrier Gates', current:0, total:2, done:false },
      { id:'ashPlates', desc:'Depress Both Cosmic Ash Plates', current:0, total:2, done:false },
      { id:'keys', desc:'Collect Both Quantum Crystals', current:0, total:2, done:false }
    ],
    start:[1,9], cp:[29,9], goal:[50,9],
    hint:'Master both forms! Melt barriers with Fire, walk magma & weigh plates with Ash, warp cargo!'
  }
];

/* ── Level Building ─────────────────────────────────────────── */
let lvl = null;
function buildLevel(d) {
  const h = d.h || 12, w = d.w;
  const g = Array.from({length:h}, () => new Array(w).fill(0));
  d.ground.forEach(([a,b]) => { for (let x=a;x<b;x++) for (let y=d.gy||10;y<h;y++) g[y][x]=1; });
  (d.blocks||[]).forEach(([x,y,bw,bh]) => { for(let i=0;i<bw;i++) for(let j=0;j<bh;j++) if(y+j<h&&x+i<w) g[y+j][x+i]=1; });
  (d.plats||[]).forEach(([x,y,l]) => { for(let i=0;i<l;i++) if(x+i<w) g[y][x+i]=2; });
  (d.doors||[]).forEach(([x,y,dw,dh]) => { for(let i=0;i<dw;i++) for(let j=0;j<dh;j++) if(y+j<h&&x+i<w) g[y+j][x+i]=5; });
  (d.springs||[]).forEach(([x,y,l]) => { for(let i=0;i<l;i++) if(x+i<w) g[y][x+i]=4; });
  (d.spikes||[]).forEach(([x,y,l]) => { for(let i=0;i<l;i++) if(x+i<w) g[y][x+i]=3; });
  (d.gates||[]).forEach(([x,y,gw,gh]) => { for(let i=0;i<gw;i++) for(let j=0;j<gh;j++) if(y+j<h&&x+i<w) g[y+j][x+i]=6; });
  // Tile 7 = Ice Block, Tile 8 = Magma Bed
  (d.ice||[]).forEach(([x,y,iw,ih]) => { for(let i=0;i<iw;i++) for(let j=0;j<ih;j++) if(y+j<h&&x+i<w) g[y+j][x+i]=7; });
  (d.magma||[]).forEach(([x,y,l]) => { for(let i=0;i<l;i++) if(x+i<w) g[y][x+i]=8; });

  return {
    name:d.name, w, h, grid:g, theme:d.theme, def:d,
    start:d.start, cp:d.cp||d.start, goal:d.goal,
    doors:d.doors||[],
    btns:(d.buttons||[]).map(([x,y,id,latch])=>({x,y,id,latch:!!latch,on:false}))
  };
}
const tile = (x,y) => { if(x<0||x>=lvl.w) return 1; if(y<0||y>=lvl.h) return 0; return lvl.grid[y][x]; };

/* ── State ──────────────────────────────────────────────────── */
let state = 'title';
let levelIndex = 0, time = 0;
let player, enemies, bread, crates, keys, gates, levers, portals;
let altars, braziers, iceBlocks, ashPlates, magmaBeds, tasks;
let particles, rings, popups;
let cam = 0, camY = 0, shake = 0;
let score = 0, totalBread = 0, breadGot = 0, foesBeaten = 0, levelTime = 0;
let cpActive = false, respawn = {x:0,y:0};
let stateTimer = 0, levelStartScore = 0;
let inventory = [];
let portalCd = 0;
let pondUnlocked = false;
let unlocked = 1;
try { unlocked = parseInt(localStorage.getItem('duckpuzzle.unlocked')||'1',10)||1; } catch(e){}
let best = 0;
try { best = parseInt(localStorage.getItem(SAVE_KEY)||'0',10)||0; } catch(e){}

const inp = {left:false, right:false, jump:false, down:false};
let jumpBuf = 0, interactReq = false;

/* ── Audio Synthesis ────────────────────────────────────────── */
let AC = null, master = null, muted = false;
try { muted = localStorage.getItem('duckpuzzle.muted')==='1'; } catch(e){}

function audio() {
  if (!AC) { try { AC = new (window.AudioContext||window.webkitAudioContext)(); master = AC.createGain(); master.gain.value = 0.45; master.connect(AC.destination); } catch(e){ return null; } }
  if (AC.state==='suspended') AC.resume(); return AC;
}
function tone(f,f2,dur,type='square',vol=0.12,delay=0) {
  if(muted) return; const a=audio(); if(!a) return;
  const t0=a.currentTime+delay, o=a.createOscillator(), g=a.createGain();
  o.type=type; o.frequency.setValueAtTime(f,t0);
  if(f2) o.frequency.exponentialRampToValueAtTime(f2,t0+dur);
  g.gain.setValueAtTime(vol,t0); g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  o.connect(g); g.connect(master); o.start(t0); o.stop(t0+dur+0.03);
}
const sfx = {
  jump:()=>tone(360,640,0.13,'triangle',0.15),
  flap:()=>{tone(300,520,0.09,'triangle',0.11);tone(420,700,0.09,'triangle',0.07,0.05);},
  bread:()=>{tone(880,1320,0.08,'sine',0.12);tone(1320,1760,0.1,'sine',0.1,0.07);},
  stomp:()=>{tone(220,90,0.14,'square',0.13);tone(520,780,0.08,'sine',0.1,0.05);},
  interact:()=>{tone(440,880,0.12,'triangle',0.14);tone(660,1320,0.1,'sine',0.1,0.06);},
  spring:()=>tone(240,880,0.22,'sine',0.17),
  hurt:()=>tone(300,70,0.35,'sawtooth',0.14),
  key:()=>{tone(660,1320,0.12,'sine',0.15);tone(990,1760,0.14,'sine',0.12,0.1);tone(1320,2200,0.16,'sine',0.1,0.22);},
  gate:()=>{[523,659,784,1047].forEach((f,i)=>tone(f,f,0.15,'triangle',0.13,i*0.07));},
  lever:()=>{tone(220,440,0.15,'square',0.12);tone(330,660,0.12,'triangle',0.1,0.08);},
  portal:()=>{tone(200,800,0.25,'sine',0.13);tone(400,1200,0.2,'sine',0.1,0.05);},
  check:()=>{tone(660,660,0.08,'sine',0.12);tone(880,880,0.1,'sine',0.12,0.09);tone(1175,1175,0.16,'sine',0.12,0.19);},
  win:()=>[523,659,784,1047,1319].forEach((f,i)=>tone(f,f,0.22,'triangle',0.14,i*0.1)),
  reset:()=>{tone(330,165,0.2,'triangle',0.1);tone(262,131,0.25,'triangle',0.08,0.1);},
  // Fire & Ash additions
  flame:()=>{tone(220,880,0.28,'sawtooth',0.16);tone(440,1100,0.22,'triangle',0.12,0.04);},
  ash:()=>{tone(180,90,0.3,'sine',0.2);tone(120,60,0.4,'triangle',0.18,0.08);},
  melt:()=>{tone(1200,300,0.25,'triangle',0.12);tone(800,150,0.3,'sawtooth',0.08,0.06);},
  task:()=>[440,554,659,880].forEach((f,i)=>tone(f,f,0.16,'sine',0.14,i*0.08)),
};

// Ambient procedural music
let musicStep = 0;
setInterval(() => {
  if(state!=='play'||muted||!AC) return;
  const pent = [262,294,330,392,440,523,587,659];
  if(musicStep%6===0) tone(131*(musicStep%12===0?1:1.5),0,2.0,'sine',0.035);
  if(Math.random()<0.55) tone(pent[(Math.random()*pent.length)|0],0,1.2,'sine',0.025);
  musicStep++;
}, 550);

/* ── Helpers ────────────────────────────────────────────────── */
const rnd=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const approach=(v,t,d)=>(v<t?Math.min(t,v+d):Math.max(t,v-d));
const hash=(x,y)=>{let h=(x*374761393+y*668265263)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967295;};
function mulberry(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

function rrect(x,y,w,h,r) {
  r=Math.min(r,w/2,h/2); ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
}
function blob(x,y,rx,ry,base,shade) {
  ctx.save(); ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);
  ctx.fillStyle=shade; ctx.fill(); ctx.clip();
  ctx.beginPath(); ctx.ellipse(x-rx*0.2,y-ry*0.2,rx*0.96,ry*0.96,0,0,Math.PI*2);
  ctx.fillStyle=base; ctx.fill(); ctx.restore();
}
function disc(x,y,r,col){ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;

/* ── Particles & Popups ─────────────────────────────────────── */
function burst(x,y,n,colors,speed=220,life=0.6,grav=600,size=5) {
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2, s=rnd(speed*0.3,speed);
    particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-speed*0.3,life:life*rnd(0.6,1),max:life,g:grav,r:size*rnd(0.6,1.2),c:colors[(Math.random()*colors.length)|0]});
  }
}
function puff(x,y,n=6,color='rgba(255,255,255,0.7)') {
  for(let i=0;i<n;i++) particles.push({x:x+rnd(-8,8),y,vx:rnd(-50,50),vy:rnd(-20,30),life:0.4,max:0.4,g:0,r:rnd(3,6),c:color,grow:10});
}
function popup(x,y,txt,col='#fff'){popups.push({x,y,txt,t:0,col});}

/* ── Task System ────────────────────────────────────────────── */
function initTasks(defTasks) {
  tasks = (defTasks||[]).map(t => ({
    id: t.id, desc: t.desc, current: t.current||0, total: t.total||1, done: false
  }));
  checkTasks();
}
function progressTask(id, amt=1) {
  const t = tasks.find(x => x.id === id);
  if(!t || t.done) return;
  t.current = Math.min(t.total, t.current + amt);
  if(t.current >= t.total) {
    t.done = true;
    sfx.task();
    popup(player.x+player.w/2, player.y-40, 'TASK COMPLETE: '+t.desc, C.cyan);
    burst(player.x+player.w/2, player.y-20, 16, [C.cyan, C.duck, '#fff'], 220, 0.7, 300, 5);
  }
  checkTasks();
}
function checkTasks() {
  const allDone = tasks.length === 0 || tasks.every(t => t.done);
  if(allDone && !pondUnlocked) {
    pondUnlocked = true;
    sfx.win(); shake = 0.25;
    const gx = lvl.goal[0]*T + T/2, gy = (lvl.goal[1]+1)*T;
    burst(gx, gy-40, 40, [C.cyan, C.duck, C.pink, '#fff'], 320, 1.2, 350, 6);
    popup(gx, gy-90, 'COSMIC POND UNLOCKED!', C.cyan);
    showHint('The Pond forcefield has dissolved! Jump in to advance!');
  }
}

/* ── Level & Entity Setup ───────────────────────────────────── */
function loadLevel(i) {
  levelIndex = i;
  lvl = buildLevel(LEVELS[i]);
  const d = lvl.def;
  enemies = (d.enemies||[]).map(([k,tx,ty]) => {
    if(k==='e') return {type:'e',x:tx*T+(T-34)/2,y:(ty+1)*T-30,w:34,h:30,vx:0,vy:0,dir:Math.random()<0.5?-1:1,speed:50,ph:Math.random()*6};
    return {type:'f',x0:tx*T+T/2,y0:ty*T+T/2,range:T*2.5,t:Math.random()*6,x:0,y:0,w:30,h:30,ph:Math.random()*6,dir:1};
  });
  bread = (d.bread||[]).map(([tx,ty])=>({x:tx*T+T/2,y:ty*T+T/2,got:false,ph:Math.random()*6}));
  crates = (d.crates||[]).map(([tx,ty])=>({x:tx*T,y:ty*T,w:T-2,h:T-2,vx:0,vy:0,onGround:false}));
  keys = (d.keys||[]).map(([tx,ty,col])=>({x:tx*T+T/2,y:ty*T+T/2,color:col,got:false,ph:Math.random()*6}));
  gates = (d.gates||[]).map(([tx,ty,gw,gh,col])=>({x:tx,y:ty,w:gw,h:gh,color:col,open:false}));
  levers = (d.levers||[]).map(([tx,ty,id])=>({x:tx,y:ty,id,on:false,anim:0}));
  portals = (d.portals||[]).map(([x1,y1,x2,y2,col])=>({x1,y1,x2,y2,color:col,t:0}));

  // Fire & Ash entities
  altars = (d.altars||[]).map(([tx,ty,el])=>({x:tx,y:ty,el,t:Math.random()*6}));
  braziers = (d.braziers||[]).map(([tx,ty,doorId])=>({x:tx,y:ty,doorId:doorId||0,lit:false,anim:0}));
  iceBlocks = (d.ice||[]).map(([tx,ty,iw,ih])=>({x:tx,y:ty,w:iw,h:ih,melted:false}));
  ashPlates = (d.ashPlates||[]).map(([tx,ty,id])=>({x:tx,y:ty,id,on:false}));
  magmaBeds = (d.magma||[]).map(([tx,ty,l])=>({x:tx,y:ty,l}));

  particles=[]; rings=[]; popups=[];
  inventory = [];
  portalCd = 0;
  pondUnlocked = false;

  const sx=d.start[0]*T+T/2, sy=((d.start[1])+1)*T;
  respawn={x:sx,y:sy}; cpActive=false;
  player={
    x:sx-14,y:sy-42,w:28,h:42,vx:0,vy:0,facing:1,onGround:false,
    coyote:0,flaps:1,glide:GLIDE_MAX,gliding:false,inv:0,quack:0,
    sx:1,sy:1,drop:0,prevBottom:sy,blink:0,jumping:false,
    element:'normal' // 'normal' | 'fire' | 'ash'
  };
  cam=0; camY=0; shake=0;
  breadGot=0; foesBeaten=0; levelTime=0; levelStartScore=score;
  updateTogglePlats();
  initTasks(d.tasks);

  if(d.hint) setTimeout(()=>{if(state==='play') showHint(d.hint);},500);
}

function placePlayerAtRespawn() {
  player.x=respawn.x-player.w/2; player.y=respawn.y-player.h;
  player.vx=player.vy=0; player.inv=1.2; player.flaps=1;
}
function resetLevel() {
  sfx.reset();
  score = levelStartScore;
  totalBread -= breadGot;
  loadLevel(levelIndex);
  updateCamera(0,true);
  state='play'; showScreen(null);
}

/* ── Toggle Platforms & Doors ───────────────────────────────── */
function updateTogglePlats() {
  const d = lvl.def;
  (d.togglePlats||[]).forEach(([x,y,len,leverId,defaultOn]) => {
    const lv = levers.find(l=>l.id===leverId);
    const leverOn = lv ? lv.on : false;
    const active = defaultOn ? !leverOn : leverOn;
    for(let i=0;i<len;i++) if(x+i<lvl.w) lvl.grid[y][x+i] = active ? 2 : 0;
  });
}
function openDoorsForId(id) {
  for(const d of lvl.doors) if(d[4]===id) for(let i=0;i<d[2];i++) for(let j=0;j<d[3];j++) {
    if(d[1]+j<lvl.h&&d[0]+i<lvl.w) {
      lvl.grid[d[1]+j][d[0]+i]=0;
      burst((d[0]+i)*T+T/2,(d[1]+j)*T+T/2,4,[C.cyan,'#fff'],180,0.5,400,4);
    }
  }
}
function closeDoorsForId(id) {
  for(const d of lvl.doors) if(d[4]===id) for(let i=0;i<d[2];i++) for(let j=0;j<d[3];j++) {
    if(d[1]+j<lvl.h&&d[0]+i<lvl.w) lvl.grid[d[1]+j][d[0]+i]=5;
  }
}

/* ── Physics ────────────────────────────────────────────────── */
function physics(e, dt) {
  const prevBottom = e.y + e.h;
  e.x += e.vx * dt; e.hitWall = 0;
  let x0=Math.floor(e.x/T),x1=Math.floor((e.x+e.w-0.01)/T),y0=Math.floor(e.y/T),y1=Math.floor((e.y+e.h-0.01)/T);
  for(let ty=y0;ty<=y1;ty++) for(let tx=x0;tx<=x1;tx++) {
    const t=tile(tx,ty);
    // Solid: 1 ground/wall, 5 door, 6 gate, 7 ice
    if(t===1||t===5||t===6||t===7) {
      if(e.vx>0){e.x=tx*T-e.w;e.hitWall=1;} else if(e.vx<0){e.x=(tx+1)*T;e.hitWall=-1;} e.vx=0;
    }
  }
  e.y += e.vy * dt; e.onGround = false;
  x0=Math.floor(e.x/T);x1=Math.floor((e.x+e.w-0.01)/T);y0=Math.floor(e.y/T);y1=Math.floor((e.y+e.h-0.01)/T);
  for(let ty=y0;ty<=y1;ty++) for(let tx=x0;tx<=x1;tx++) {
    const t=tile(tx,ty);
    if(t===1||t===5||t===6||t===7) {
      if(e.vy>0){e.y=ty*T-e.h;e.onGround=true;e.vy=0;} else if(e.vy<0){e.y=(ty+1)*T;e.vy=0;}
    } else if(t===2&&e.vy>=0&&prevBottom<=ty*T+2&&!(e.drop>0)) {
      e.y=ty*T-e.h;e.onGround=true;e.vy=0;
    } else if(t===4&&e===player&&e.vy>0&&prevBottom<=ty*T+30) {
      e.y=ty*T+22-e.h;e.vy=-1050;e.flaps=1;e.glide=GLIDE_MAX;e.jumping=false;
      e.sx=0.7;e.sy=1.35;sfx.spring();puff(e.x+e.w/2,e.y+e.h,6);
    }
  }
}

/* ── Player Update ──────────────────────────────────────────── */
function updatePlayer(dt) {
  const p = player;
  p.prevBottom = p.y + p.h;
  const dir = (inp.right?1:0)-(inp.left?1:0);
  const target = dir * RUN * (p.gliding?1.1:1);
  const acc = (p.onGround?2800:1900)*dt;
  p.vx = approach(p.vx, target, dir===0?acc*1.3:acc);
  if(dir!==0) p.facing = dir;

  if(p.onGround){p.coyote=0.1;p.flaps=1;p.glide=GLIDE_MAX;p.jumping=false;}
  else p.coyote=Math.max(0,p.coyote-dt);
  jumpBuf=Math.max(0,jumpBuf-dt);
  p.inv=Math.max(0,p.inv-dt);
  p.drop=Math.max(0,p.drop-dt);
  p.quack=Math.max(0,p.quack-dt*3);
  p.blink=p.blink>0?p.blink-dt:(Math.random()<dt*0.4?0.12:0);

  // Jump / Flap
  if(jumpBuf>0) {
    if(inp.down&&p.onGround&&tile(Math.floor((p.x+p.w/2)/T),Math.floor((p.y+p.h+2)/T))===2) {
      p.drop=0.25;p.vy=80;p.onGround=false;jumpBuf=0;
    } else if(p.coyote>0) {
      p.vy=-JUMP;p.coyote=0;jumpBuf=0;p.onGround=false;p.jumping=true;
      p.sx=0.75;p.sy=1.3;sfx.jump();puff(p.x+p.w/2,p.y+p.h,5);
    } else if(p.flaps>0) {
      p.vy=-FLAP;p.flaps--;jumpBuf=0;p.jumping=true;
      p.sx=0.8;p.sy=1.25;sfx.flap();puff(p.x+p.w/2,p.y+p.h,7);
    }
  }

  let g = GRAV;
  if(p.vy<0&&!inp.jump&&p.jumping) g*=2.1;
  p.gliding=false;
  if(!p.onGround&&inp.jump&&p.vy>0&&p.glide>0&&p.flaps<=0){p.gliding=true;p.glide-=dt;}
  p.vy+=g*dt;
  if(p.gliding) p.vy=Math.min(p.vy,GLIDE_FALL);
  p.vy=Math.min(p.vy,MAX_FALL);

  const wasGround=p.onGround;
  physics(p,dt);
  pushCrates(p);
  if(!wasGround&&p.onGround){p.sx=1.28;p.sy=0.72;puff(p.x+p.w/2,p.y+p.h,5);}
  p.sx+=(1-p.sx)*Math.min(1,dt*14);
  p.sy+=(1-p.sy)*Math.min(1,dt*14);

  // Particle aura for active element
  if(Math.random()<0.3) {
    if(p.element==='fire') {
      particles.push({x:p.x+p.w/2+rnd(-10,10),y:p.y+p.h*0.6+rnd(-10,10),vx:rnd(-20,20),vy:rnd(-60,-110),life:0.35,max:0.35,g:0,r:rnd(2,4.5),c:Math.random()<0.5?C.fire:C.fireGlow});
    } else if(p.element==='ash') {
      particles.push({x:p.x+p.w/2+rnd(-8,8),y:p.y+p.h*0.7+rnd(-8,8),vx:rnd(-15,15),vy:rnd(-40,-80),life:0.4,max:0.4,g:0,r:rnd(1.8,3.5),c:Math.random()<0.3?C.ashEmber:C.ashL});
    }
  }

  // Interact Action (X key / touch ACT button)
  if(interactReq) { interactReq=false; doInteract(); }

  // Altars: proximity check (auto or interact)
  const pcx=p.x+p.w/2, pcy=p.y+p.h/2;
  for(const alt of altars) {
    const ax=alt.x*T+T/2, ay=(alt.y+1)*T-24;
    if(Math.abs(pcx-ax)<28 && Math.abs(pcy-ay)<32) {
      if(p.element!==alt.el) setDuckElement(alt.el, ax, ay);
    }
  }

  // Ice melting (proximity + Fire Duck)
  if(p.element==='fire') {
    for(const ic of iceBlocks) {
      if(ic.melted) continue;
      const icRect={x:ic.x*T-6,y:ic.y*T-6,w:ic.w*T+12,h:ic.h*T+12};
      if(overlap(p,icRect)) meltIceBlock(ic);
    }
  }

  // Magma hazards
  const tx0=Math.floor(p.x/T), tx1=Math.floor((p.x+p.w)/T);
  const ty0=Math.floor(p.y/T), ty1=Math.floor((p.y+p.h+2)/T);
  for(let ty=ty0;ty<=ty1;ty++) for(let tx=tx0;tx<=tx1;tx++) {
    if(tile(tx,ty)===8) {
      if(p.element==='ash') {
        progressTask('magma', 1);
        if(Math.random()<0.25) puff(p.x+p.w/2, p.y+p.h, 2, C.ashL);
      } else {
        hurt(tx*T+T/2, true);
        popup(p.x+p.w/2, p.y-24, 'MAGMA TOO HOT! NEED ASH DUCK', C.magma);
      }
    }
  }

  // Ash Pressure Plates
  updateAshPlates();

  // Bread
  for(const b of bread) {
    if(!b.got&&Math.abs(b.x-pcx)<26&&Math.abs(b.y-pcy)<32) {
      b.got=true;breadGot++;score+=10;totalBread++;
      sfx.bread();burst(b.x,b.y,8,[C.bread,'#fff1b8'],150,0.45,200,4);
    }
  }

  // Keys & Gates
  for(const k of keys) {
    if(!k.got&&Math.abs(k.x-pcx)<24&&Math.abs(k.y-pcy)<30) {
      k.got=true; inventory.push(k.color); score+=50;
      sfx.key(); burst(k.x,k.y,16,[keyCol(k.color),'#fff'],220,0.7,300,5);
      popup(k.x,k.y-30,k.color.toUpperCase()+' CRYSTAL',keyCol(k.color));
      progressTask('keys', 1);
      progressTask('crystal', 1);
    }
  }
  for(const g of gates) {
    if(g.open) continue;
    const gx=g.x*T,gy=g.y*T,gw=g.w*T,gh=g.h*T;
    if(overlap(p,{x:gx-8,y:gy,w:gw+16,h:gh})) {
      const idx=inventory.indexOf(g.color);
      if(idx>=0) {
        inventory.splice(idx,1); g.open=true; score+=100;
        for(let i=0;i<g.w;i++) for(let j=0;j<g.h;j++) if(g.y+j<lvl.h&&g.x+i<lvl.w) lvl.grid[g.y+j][g.x+i]=0;
        sfx.gate(); shake=0.15;
        burst(gx+gw/2,gy+gh/2,24,[keyCol(g.color),'#fff'],300,0.9,400,6);
        popup(gx+gw/2,gy-20,'CRYSTAL GATE UNLOCKED',keyCol(g.color));
      }
    }
  }

  // Standard Buttons (if any)
  updateButtons();

  // Portals
  checkPortals(dt);

  // Checkpoint
  if(!cpActive) {
    const cx=lvl.cp[0]*T+T/2;
    if(pcx>=cx-10) {
      cpActive=true; respawn={x:cx,y:(lvl.cp[1]+1)*T};
      sfx.check(); popup(cx,lvl.cp[1]*T-20,'CHECKPOINT',C.cyan);
      burst(cx,lvl.cp[1]*T,14,[C.cyan,'#fff'],220,0.8,300,5);
    }
  }

  // Spikes
  for(let ty=ty0;ty<=ty1;ty++) for(let tx=tx0;tx<=tx1;tx++) {
    if(tile(tx,ty)===3) {
      const hb={x:tx*T+8,y:ty*T+T-22,w:T-16,h:22};
      if(overlap(p,hb)) hurt(tx*T+T/2,true);
    }
  }

  // Enemies
  for(const e of enemies) {
    if(e.dead||!overlap(p,e)) continue;
    if(p.vy>80&&p.prevBottom<=e.y+14) {
      killEnemy(e);p.vy=inp.jump?-JUMP*0.85:-520;
      p.flaps=1;p.glide=GLIDE_MAX;p.jumping=true;p.inv=Math.max(p.inv,0.12);p.sx=0.8;p.sy=1.25;
    } else hurt(e.x+e.w/2,false);
  }

  // Fall pit
  if(p.y>lvl.h*T+80) {
    sfx.hurt(); shake=0.2;
    placePlayerAtRespawn();
    popup(respawn.x,respawn.y-90,'Oops!',C.pink);
  }

  // Goal Pond
  const gx=lvl.goal[0]*T+T/2, gy=(lvl.goal[1]+1)*T;
  if(state==='play'&&overlap(p,{x:gx-46,y:gy-100,w:92,h:100})) {
    if(pondUnlocked) {
      beginFinish();
    } else {
      sfx.hurt();
      popup(gx, gy-80, 'POND LOCKED: COMPLETE ALL TASKS!', C.pink);
      showHint('Complete the research tasks listed on top-left to break the pond seal!');
    }
  }
}

/* ── Element Transformations ────────────────────────────────── */
function setDuckElement(el, x, y) {
  player.element = el;
  if(el==='fire') {
    sfx.flame(); shake=0.12;
    burst(x,y,28,[C.fire,C.fireGlow,C.fireFlame,'#fff'],260,0.8,400,6);
    popup(x,y-40,'SOLAR FIRE DUCK (6,000 K)',C.fire);
    progressTask('altar_fire',1);
  } else if(el==='ash') {
    sfx.ash(); shake=0.15;
    burst(x,y,28,[C.ashL,C.ashEmber,C.ashEye,'#fff'],240,0.8,500,6);
    popup(x,y-40,'CINDER ASH DUCK (HEAVY DENSITY)',C.ashEye);
    progressTask('altar_ash',1);
  }
}

/* ── Ice Melting ────────────────────────────────────────────── */
function meltIceBlock(ic) {
  ic.melted = true;
  for(let i=0;i<ic.w;i++) for(let j=0;j<ic.h;j++) {
    const gx=ic.x+i, gy=ic.y+j;
    if(gy<lvl.h&&gx<lvl.w) lvl.grid[gy][gx]=0;
  }
  sfx.melt(); shake=0.1;
  const cx=ic.x*T+ic.w*T/2, cy=ic.y*T+ic.h*T/2;
  burst(cx,cy,24,[C.ice,C.iceD,'#ffffff'],220,0.7,300,5);
  puff(cx,cy,12,'rgba(200,240,255,0.85)');
  popup(cx,cy-30,'CRYO SEAL MELTED',C.ice);
  progressTask('ice',1);
}

/* ── Ash Plates ─────────────────────────────────────────────── */
function updateAshPlates() {
  for(const ap of ashPlates) {
    const apRect = {x:ap.x*T+4, y:ap.y*T+T-14, w:T-8, h:14};
    let pressed = false;
    // Only Ash Duck has the density to depress an ash plate
    if(player.element==='ash' && overlap(player, apRect)) pressed = true;
    // Crates can also depress ash plates
    if(!pressed) {
      for(const cr of crates) if(overlap(cr, apRect)) { pressed = true; break; }
    }
    const wasOn = ap.on; ap.on = pressed;
    if(ap.on && !wasOn) {
      sfx.lever(); shake=0.1;
      popup(ap.x*T+T/2, ap.y*T-24, 'ASH PLATE ACTIVE', C.ashEye);
      openDoorsForId(ap.id);
      progressTask('ashPlates',1);
      progressTask('ashPlate',1);
      progressTask('cratePlate',1);
    } else if(!ap.on && wasOn) {
      closeDoorsForId(ap.id);
    }
    // If Normal or Fire duck steps on it, show hint
    if(!pressed && overlap(player, apRect) && player.element!=='ash') {
      if(Math.random()<0.08) popup(ap.x*T+T/2, ap.y*T-20, 'TOO LIGHT! NEED ASH DUCK', C.pink);
    }
  }
}

/* ── Crate Mechanics ────────────────────────────────────────── */
function pushCrates(p) {
  for(const cr of crates) {
    if(!overlap(p,cr)) continue;
    const dx=(p.x+p.w/2)-(cr.x+cr.w/2);
    const dy=(p.y+p.h/2)-(cr.y+cr.h/2);
    if(Math.abs(dx)>Math.abs(dy)*0.5) {
      if(dx<0) { cr.vx=CRATE_PUSH; p.x=cr.x-p.w; }
      else { cr.vx=-CRATE_PUSH; p.x=cr.x+cr.w; }
    } else if(dy<0&&p.vy>=0) {
      p.y=cr.y-p.h; p.onGround=true; p.vy=0;
    }
  }
}
function updateCrates(dt) {
  for(const cr of crates) {
    cr.vy=Math.min(cr.vy+GRAV*dt,MAX_FALL);
    cr.vx=approach(cr.vx,0,600*dt);
    physics(cr,dt);
    for(const cr2 of crates) {
      if(cr===cr2||!overlap(cr,cr2)) continue;
      const dx=(cr.x+cr.w/2)-(cr2.x+cr2.w/2);
      if(dx<0) cr.x=cr2.x-cr.w; else cr.x=cr2.x+cr2.w;
      cr.vx=0;
    }
    // Crate in portal
    if(portalCd<=0) {
      const ccx=cr.x+cr.w/2, ccy=cr.y+cr.h/2;
      for(const po of portals) {
        const p1x=po.x1*T+T/2,p1y=(po.y1+1)*T-cr.h/2;
        const p2x=po.x2*T+T/2,p2y=(po.y2+1)*T-cr.h/2;
        if(Math.abs(ccx-p1x)<22&&Math.abs(ccy-p1y)<30) {
          cr.x=p2x-cr.w/2;cr.y=p2y-cr.h/2;portalCd=0.5;sfx.portal();
          burst(p1x,p1y,10,[C.portalA,'#fff'],180,0.5,200,4);
          burst(p2x,p2y,10,[C.portalB,'#fff'],180,0.5,200,4);
          progressTask('portalCrate',1);
          break;
        }
        if(Math.abs(ccx-p2x)<22&&Math.abs(ccy-p2y)<30) {
          cr.x=p1x-cr.w/2;cr.y=p1y-cr.h/2;portalCd=0.5;sfx.portal();
          burst(p2x,p2y,10,[C.portalB,'#fff'],180,0.5,200,4);
          burst(p1x,p1y,10,[C.portalA,'#fff'],180,0.5,200,4);
          progressTask('portalCrate',1);
          break;
        }
      }
    }
  }
}

/* ── Standard Buttons ───────────────────────────────────────── */
function updateButtons() {
  for(const b of lvl.btns) {
    const bRect = {x:b.x*T+4,y:b.y*T+T-14,w:T-8,h:14};
    if(b.latch) {
      if(!b.on && overlap(player,bRect)) {
        b.on=true; sfx.check(); shake=0.12;
        popup(b.x*T+T/2,b.y*T-20,'ACTIVATED',C.cyan);
        openDoorsForId(b.id);
      }
    } else {
      let pressed = overlap(player,bRect);
      if(!pressed) for(const cr of crates) if(overlap(cr,bRect)){pressed=true;break;}
      const wasOn = b.on; b.on = pressed;
      if(b.on&&!wasOn) {
        sfx.check(); popup(b.x*T+T/2,b.y*T-20,'PLATE ACTIVE',C.cyan);
        openDoorsForId(b.id);
      } else if(!b.on&&wasOn) {
        closeDoorsForId(b.id);
      }
    }
  }
}

/* ── Portals ────────────────────────────────────────────────── */
function checkPortals(dt) {
  portalCd=Math.max(0,portalCd-dt);
  if(portalCd>0) return;
  const p=player, pcx=p.x+p.w/2, pcy=p.y+p.h/2;
  for(const po of portals) {
    const p1x=po.x1*T+T/2,p1y=(po.y1+1)*T;
    const p2x=po.x2*T+T/2,p2y=(po.y2+1)*T;
    if(Math.abs(pcx-p1x)<20&&Math.abs(pcy-(p1y-p.h/2))<30) {
      p.x=p2x-p.w/2;p.y=p2y-p.h;portalCd=0.5;sfx.portal();
      burst(p1x,p1y-20,12,[C.portalA,'#fff'],200,0.6,200,4);
      burst(p2x,p2y-20,12,[C.portalB,'#fff'],200,0.6,200,4); break;
    }
    if(Math.abs(pcx-p2x)<20&&Math.abs(pcy-(p2y-p.h/2))<30) {
      p.x=p1x-p.w/2;p.y=p1y-p.h;portalCd=0.5;sfx.portal();
      burst(p2x,p2y-20,12,[C.portalB,'#fff'],200,0.6,200,4);
      burst(p1x,p1y-20,12,[C.portalA,'#fff'],200,0.6,200,4); break;
    }
  }
}

/* ── Interaction (Braziers, Altars, Levers, Quack) ─────────── */
function doInteract() {
  const p=player, pcx=p.x+p.w/2, pcy=p.y+p.h/2;

  // 1. Ignite Braziers (requires Fire Duck)
  for(const br of braziers) {
    const bx=br.x*T+T/2, by=br.y*T+T/2;
    if(Math.abs(pcx-bx)<INTERACT_R+10 && Math.abs(pcy-by)<55) {
      if(!br.lit) {
        if(p.element==='fire') {
          br.lit = true; br.anim = 1;
          sfx.flame(); shake=0.15;
          burst(bx,by-10,24,[C.fire,C.fireGlow,C.fireFlame,'#fff'],280,0.8,400,6);
          popup(bx,by-36,'SOLAR BRAZIER IGNITED',C.fire);
          if(br.doorId) openDoorsForId(br.doorId);
          progressTask('braziers',1);
          progressTask('brazier',1);
          return;
        } else {
          sfx.hurt();
          popup(bx,by-30,'NEEDS FIRE DUCK TO IGNITE',C.pink);
          return;
        }
      }
    }
  }

  // 2. Altars interaction
  for(const alt of altars) {
    const ax=alt.x*T+T/2, ay=(alt.y+1)*T-24;
    if(Math.abs(pcx-ax)<INTERACT_R+6 && Math.abs(pcy-ay)<50) {
      setDuckElement(alt.el, ax, ay);
      return;
    }
  }

  // 3. Levers
  for(const lv of levers) {
    const lvx=lv.x*T+T/2, lvy=lv.y*T+T/2;
    if(Math.abs(pcx-lvx)<INTERACT_R&&Math.abs(pcy-lvy)<50) {
      lv.on=!lv.on; lv.anim=1; sfx.lever(); shake=0.1;
      popup(lvx,lvy-40,lv.on?'ON':'OFF',C.cyan);
      updateTogglePlats();
      progressTask('lever',1);
      return;
    }
  }

  // 4. Default Quack & Shockwave
  p.quack=1;
  sfx.interact();
  const cx=p.x+p.w/2, cy=p.y+p.h/2;
  rings.push({x:cx,y:cy,t:0});
  for(const e of enemies) {
    if(e.dead) continue;
    const ex=e.x+e.w/2, ey=e.y+e.h/2;
    if(Math.hypot(ex-cx,ey-cy)<150) killEnemy(e);
  }
}

function killEnemy(e) {
  e.dead=true;foesBeaten++;score+=25;sfx.stomp();
  const cols=e.type==='e'?[C.pink,C.pinkD,'#fff']:[C.purple,C.lilac,'#fff'];
  burst(e.x+e.w/2,e.y+e.h/2,16,cols,260,0.7,700,6);
  popup(e.x+e.w/2,e.y-6,'+25','#ffd23f');
}
function hurt(fromX,spike) {
  const p=player;
  if(p.inv>0||state!=='play') return;
  sfx.hurt(); shake=0.3;
  burst(p.x+p.w/2,p.y+p.h/2,12,[C.duck,C.duckD,'#fff'],260,0.6,700,5);
  p.inv=1.7; p.vy=spike?-560:-430;
  p.vx=(p.x+p.w/2<fromX?-1:1)*240; p.onGround=false;
}

/* ── Enemy Update ───────────────────────────────────────────── */
function updateEnemies(dt) {
  for(const e of enemies) {
    if(e.dead) continue;
    if(e.type==='e') {
      e.vy=Math.min(e.vy+GRAV*dt,MAX_FALL); e.vx=e.dir*e.speed;
      physics(e,dt);
      if(e.hitWall) e.dir=-e.hitWall;
      else if(e.onGround) {
        const fx=e.dir>0?e.x+e.w+2:e.x-2;
        const below=tile(Math.floor(fx/T),Math.floor((e.y+e.h+4)/T));
        const front=tile(Math.floor(fx/T),Math.floor((e.y+e.h/2)/T));
        if(below===0||below===3||front===3) e.dir=-e.dir;
      }
    } else {
      e.t+=dt; const nx=e.x0+Math.sin(e.t*0.9)*e.range;
      e.dir=nx>=e.x?1:-1; e.x=nx-e.w/2; e.y=e.y0+Math.sin(e.t*2.1)*18-e.h/2;
    }
  }
}

/* ── FX / Camera / Main Loop ────────────────────────────────── */
function updateFx(dt) {
  for(let i=particles.length-1;i>=0;i--){
    const q=particles[i]; q.life-=dt;
    if(q.life<=0){particles.splice(i,1);continue;}
    q.vy+=q.g*dt; q.x+=q.vx*dt; q.y+=q.vy*dt;
    if(q.grow) q.r+=q.grow*dt;
  }
  for(let i=rings.length-1;i>=0;i--){rings[i].t+=dt;if(rings[i].t>0.45)rings.splice(i,1);}
  for(let i=popups.length-1;i>=0;i--){popups[i].t+=dt;if(popups[i].t>1.2)popups.splice(i,1);}
  shake=Math.max(0,shake-dt);
}
function updateCamera(dt,snap) {
  const p=player;
  const want=clamp(p.x+p.w/2+p.facing*70-W*0.45,0,lvl.w*T-W);
  cam=snap?want:cam+(want-cam)*Math.min(1,dt*6);
  const wy=clamp(p.y+p.h/2-H*0.55,0,Math.max(0,lvl.h*T-H));
  camY=snap?wy:camY+(wy-camY)*Math.min(1,dt*6);
}
function update(dt) {
  if(state==='play') {
    levelTime+=dt; updatePlayer(dt); updateCrates(dt);
    if(state==='play'||state==='finishing') updateEnemies(dt);
    updateCamera(dt);
  } else if(state==='finishing') {
    updateEnemies(dt); stateTimer-=dt;
    const p=player; p.vy+=GRAV*dt; physics(p,dt);
    if(p.onGround&&stateTimer>0.3){p.vy=-420;p.sx=0.8;p.sy=1.2;}
    if(stateTimer<=0) showLevelEnd();
  } else if(state==='dying') {
    const p=player; p.vy+=GRAV*dt; p.y+=p.vy*dt;
    stateTimer-=dt; if(stateTimer<=0) showGameOver();
  }
  if(particles) updateFx(dt);
  for(const lv of levers) lv.anim=Math.max(0,lv.anim-dt*4);
  for(const br of braziers) br.anim=Math.max(0,br.anim-dt*3);
  for(const po of portals) po.t+=dt;
}

function beginFinish() {
  state='finishing'; stateTimer=1.2; sfx.win();
  const gx=lvl.goal[0]*T+T/2,gy=(lvl.goal[1]+1)*T;
  burst(gx,gy-40,40,[C.cyan,'#fff',C.duck,C.pink],380,1.3,500,6);
  player.vx=0;
}
function beginDying() {
  state='dying';stateTimer=1.1;player.vy=-520;player.vx=0;player.dead=true;
  document.body.classList.add('menu');
}
function showGameOver() { state='over'; sfx.reset(); showScreen('over'); }

let hintText = '', hintTimer = 0;
function showHint(txt) { hintText=txt; hintTimer=5; }

/* ══════════════════════════════════════════════════════════════
 * RENDERING (Kurzgesagt Vector Aesthetic)
 * ══════════════════════════════════════════════════════════════ */
const starRand = mulberry(42);
const STARS = Array.from({length:130},()=>({x:starRand()*W,y:starRand()*H*0.85,r:0.5+starRand()*2,p:0.02+starRand()*0.12,sp:0.6+starRand()*2.2,ph:starRand()*6.28}));
const NEBULA = Array.from({length:8},()=>({x:starRand()*W,y:starRand()*H*0.7,rx:80+starRand()*180,ry:40+starRand()*100,ph:starRand()*6.28}));

function drawBackground(camX, t) {
  const th=lvl.theme;
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,th.sky[0]);g.addColorStop(1,th.sky[1]);
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);

  for(const n of NEBULA) {
    const x=((n.x-camX*0.03)%W+W)%W;
    const ng=ctx.createRadialGradient(x,n.y,0,x,n.y,n.rx);
    ng.addColorStop(0,th.accent+'18');ng.addColorStop(0.6,th.accent+'08');ng.addColorStop(1,'transparent');
    ctx.fillStyle=ng;ctx.fillRect(x-n.rx,n.y-n.ry,n.rx*2,n.ry*2);
  }
  for(const s of STARS) {
    const x=(((s.x-camX*s.p)%W)+W)%W;
    ctx.globalAlpha=0.3+0.7*(0.5+0.5*Math.sin(t*s.sp+s.ph));
    disc(x,s.y,s.r,'#fff');
  }
  ctx.globalAlpha=1;

  // Celestial Giant with Ring
  const px=720-camX*0.04, py=140;
  const glow=ctx.createRadialGradient(px,py,40,px,py,220);
  glow.addColorStop(0,'rgba(255,255,255,0.14)');glow.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=glow;ctx.fillRect(px-230,py-230,460,460);
  ctx.save();ctx.translate(px,py);ctx.rotate(-0.28);
  ctx.fillStyle=th.ring;ctx.globalAlpha=0.35;
  ctx.beginPath();ctx.ellipse(0,0,118,24,0,Math.PI,Math.PI*2);ctx.fill();
  ctx.globalAlpha=1;
  blob(0,0,70,70,th.planet[0],th.planet[1]);
  ctx.fillStyle=th.ring;ctx.globalAlpha=0.6;
  ctx.beginPath();ctx.ellipse(0,0,118,24,0,0,Math.PI);ctx.fill();
  ctx.globalAlpha=1;ctx.restore();

  // Small Moon
  blob(280-camX*0.07,85,18,18,'#ffffff','#b9b4e6');

  // Background Hills
  hills(camX*0.15,395,46,150,th.far);
  hills(camX*0.32,450,34,110,th.mid);
}

function hills(off,base,amp,wl,col) {
  ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0,H);
  for(let x=0;x<=W+12;x+=12){const wx=x+off;const y=base+Math.sin(wx/wl)*amp+Math.sin(wx/(wl*0.43)+1.7)*amp*0.3;ctx.lineTo(x,y);}
  ctx.lineTo(W,H);ctx.closePath();ctx.fill();
}

/* ── Tile Rendering ─────────────────────────────────────────── */
function rtop(x,y,w,h,rl,rr){ctx.beginPath();ctx.moveTo(x,y+h);ctx.lineTo(x,y+rl);if(rl)ctx.quadraticCurveTo(x,y,x+rl,y);ctx.lineTo(x+w-rr,y);if(rr)ctx.quadraticCurveTo(x+w,y,x+w,y+rr);ctx.lineTo(x+w,y+h);ctx.closePath();ctx.fill();}

function drawTiles(camX) {
  const th=lvl.theme;
  const x0=Math.max(0,Math.floor(camX/T)-1),x1=Math.min(lvl.w-1,Math.floor((camX+W)/T)+1);
  const ya=Math.max(0,Math.floor(camY/T)-2),yb=Math.min(lvl.h,Math.ceil((camY+H)/T)+2);
  for(let y=ya;y<yb;y++) for(let x=x0;x<=x1;x++) {
    const t=lvl.grid[y][x]; if(!t) continue;
    const px=Math.round(x*T-camX),py=y*T;
    if(t===1) drawSolid(x,y,px,py,th);
    else if(t===5) drawDoorTile(px,py);
    else if(t===6) drawGateTile(x,y,px,py);
    else if(t===2) drawOneway(x,y,px,py,th);
    else if(t===4) drawSpring(px,py);
    else if(t===3) drawSpike(x,y,px,py);
    else if(t===7) drawIceTile(px,py);
    else if(t===8) drawMagmaTile(px,py);
  }
}

function drawSolid(x,y,px,py,th) {
  const h=hash(x,y);
  const up=tile(x,y-1)===1,rt=tile(x+1,y)===1,dn=tile(x,y+1)===1,lf=tile(x-1,y)===1;
  if(!dn&&y<lvl.h-1){ctx.fillStyle=th.groundD;ctx.beginPath();ctx.moveTo(px+5,py+T-1);ctx.lineTo(px+T-5,py+T-1);ctx.lineTo(px+T/2+(h-0.5)*8,py+T+12+h*20);ctx.closePath();ctx.fill();}
  ctx.fillStyle=th.ground;ctx.fillRect(px,py,T+1,T+1);
  if(!rt){ctx.fillStyle=th.groundD;ctx.fillRect(px+T-9,py,10,T+1);}
  if(!dn&&y<lvl.h-1){ctx.fillStyle=th.groundD;ctx.fillRect(px,py+T-9,T+1,10);}
  if(h>0.5) disc(px+10+h*22,py+16+h*16,3+h*3,th.groundD);
  if(h<0.18) disc(px+30,py+30,4,th.groundD);
  if(!up){ctx.fillStyle=th.cap;rtop(px,py,T+1,14,lf?0:9,rt?0:9);ctx.fillStyle=th.capD;ctx.fillRect(px,py+14,T+1,5);if(!rt)rtop(px+T-9,py,10,14,0,9);}
}
function drawOneway(x,y,px,py,th) {
  const lf=tile(x-1,y)===2,rt=tile(x+1,y)===2;
  ctx.fillStyle=th.capD;rrect(px-(lf?1:0),py+4,T+(lf?1:0)+(rt?1:0),12,lf&&rt?0:6);ctx.fill();
  ctx.fillStyle=th.cap;rrect(px-(lf?1:0),py,T+(lf?1:0)+(rt?1:0),11,lf&&rt?0:6);ctx.fill();
}
function drawSpike(x,y,px,py) {
  const n=3,w=T/n;
  for(let i=0;i<n;i++){const bx=px+i*w,by=py+T;
    ctx.fillStyle=C.pinkD;ctx.beginPath();ctx.moveTo(bx+1,by);ctx.lineTo(bx+w/2,by-26);ctx.lineTo(bx+w-1,by);ctx.closePath();ctx.fill();
    ctx.fillStyle=C.pink;ctx.beginPath();ctx.moveTo(bx+1,by);ctx.lineTo(bx+w/2,by-26);ctx.lineTo(bx+w/2+1,by);ctx.closePath();ctx.fill();
  }
}
function drawSpring(px,py) {
  const cx=px+T/2,sq=Math.sin(time*3+px)*0.03;
  ctx.fillStyle='#ffe9d2';rrect(cx-7,py+30,14,15,4);ctx.fill();
  ctx.save();ctx.translate(cx,py+32);ctx.scale(1+sq,1-sq);
  blob(0,0,21,11,C.pink,C.pinkD);
  disc(-8,-3,3,'#fff');disc(5,-5,2.4,'#fff');disc(11,0,2,'#fff');ctx.restore();
}
function drawDoorTile(px,py) {
  ctx.fillStyle=C.pinkD;ctx.fillRect(px+4,py,T-8,T+1);
  ctx.fillStyle=C.pink;ctx.fillRect(px+4,py,T-20,T+1);
  ctx.fillStyle=C.duck;ctx.fillRect(px+4,py+T/2-3,T-8,6);
}
function drawGateTile(x,y,px,py) {
  let col=C.purple,colD=C.purpleD;
  for(const g of gates) if(!g.open&&x>=g.x&&x<g.x+g.w&&y>=g.y&&y<g.y+g.h){col=keyCol(g.color);colD=gateCol(g.color);break;}
  ctx.fillStyle=colD;ctx.fillRect(px+2,py,T-4,T+1);
  ctx.fillStyle=col;ctx.fillRect(px+6,py,T-16,T+1);
  ctx.globalAlpha=0.3+0.2*Math.sin(time*4+x*2+y);
  disc(px+T/2,py+T/2,8,'#fff');
  ctx.globalAlpha=1;
}
function drawIceTile(px,py) {
  ctx.fillStyle=C.iceD; rrect(px+1,py+1,T-2,T-2,5); ctx.fill();
  ctx.fillStyle=C.ice; rrect(px+3,py+3,T-6,T-6,4); ctx.fill();
  // Faceted crystal lines
  ctx.strokeStyle='rgba(255,255,255,0.75)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(px+6,py+6); ctx.lineTo(px+T-12,py+T-12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(px+T-8,py+8); ctx.lineTo(px+T/2,py+T/2); ctx.stroke();
  disc(px+12,py+12,3,'#fff');
}
function drawMagmaTile(px,py) {
  ctx.fillStyle=C.magmaD; ctx.fillRect(px,py,T,T);
  const g=ctx.createLinearGradient(0,py,0,py+T);
  g.addColorStop(0,C.magma); g.addColorStop(1,C.magmaD);
  ctx.fillStyle=g; ctx.fillRect(px,py+6,T,T-6);
  // Bubbling molten spots
  const b1=Math.sin(time*5+px)*3;
  ctx.fillStyle=C.magmaGlow;
  disc(px+12,py+8+b1,4+Math.sin(time*4)*1.5,C.magmaGlow);
  disc(px+32,py+12-b1,5+Math.cos(time*4)*1.5,C.magmaGlow);
  ctx.fillStyle='#fff';
  disc(px+13,py+7+b1,1.5,'#fff');
}

/* ── Puzzle Entities Rendering ──────────────────────────────── */
function drawAltars(camX,t) {
  for(const alt of altars) {
    const x=alt.x*T+T/2-camX, y=(alt.y+1)*T;
    const isFire = alt.el === 'fire';
    const mainCol = isFire ? C.fire : C.ashEye;
    const baseCol = isFire ? '#4a2510' : '#1c1c28';

    // Pedestal
    ctx.fillStyle=baseCol; rrect(x-18,y-14,36,14,4); ctx.fill();
    ctx.fillStyle=mainCol; rrect(x-14,y-12,28,4,2); ctx.fill();

    // Floating Core Orb
    const orbY = y - 32 + Math.sin(t*3+alt.t)*4;
    const glow = ctx.createRadialGradient(x,orbY,2,x,orbY,24);
    glow.addColorStop(0, mainCol+'88'); glow.addColorStop(1, mainCol+'00');
    ctx.fillStyle=glow; ctx.fillRect(x-24,orbY-24,48,48);

    if(isFire) {
      // Solar Crown Core
      blob(x,orbY,12,12,C.fireFlame,C.fire);
      disc(x-3,orbY-3,4,'#fff');
      for(let i=0;i<4;i++) {
        const a = t*2 + i*(Math.PI/2);
        disc(x+Math.cos(a)*18, orbY+Math.sin(a)*18, 2.5, C.fireGlow);
      }
    } else {
      // Obsidian Cinder Core
      ctx.save(); ctx.translate(x,orbY); ctx.rotate(t*1.5);
      ctx.fillStyle=C.ash; rrect(-10,-10,20,20,3); ctx.fill();
      ctx.fillStyle=C.ashEye; rrect(-4,-4,8,8,2); ctx.fill();
      ctx.restore();
    }

    // Proximity indicator
    const pcx=player.x+player.w/2-cam;
    if(Math.abs(pcx-x)<INTERACT_R+12) {
      ctx.font='bold 11px "Inter","Segoe UI",system-ui,sans-serif';
      ctx.textAlign='center'; ctx.fillStyle=mainCol;
      ctx.fillText(isFire?'[X] SOLAR FIRE ALTAR':'[X] CINDER ASH ALTAR', x, y-52);
    }
  }
}

function drawBraziers(camX,t) {
  for(const br of braziers) {
    const x=br.x*T+T/2-camX, y=(br.y+1)*T;
    // Stone Bowl Base
    ctx.fillStyle=C.brazierStone; rrect(x-14,y-12,28,12,3); ctx.fill();
    ctx.fillStyle=C.brazierRim; rrect(x-18,y-18,36,7,3); ctx.fill();

    if(br.lit) {
      // Roaring Kurzgesagt Flame
      const fy = y - 18;
      const flW = 12 + Math.sin(t*14)*2;
      const flH = 22 + Math.sin(t*18)*4;

      const gl = ctx.createRadialGradient(x,fy-10,3,x,fy-10,32);
      gl.addColorStop(0,C.fireGlow+'99'); gl.addColorStop(1,C.fireGlow+'00');
      ctx.fillStyle=gl; ctx.fillRect(x-32,fy-42,64,64);

      // Multi-layer stylized flame teardrops
      ctx.fillStyle=C.fire;
      ctx.beginPath(); ctx.moveTo(x-flW,fy); ctx.quadraticCurveTo(x,fy-flH-8,x,fy-flH-12); ctx.quadraticCurveTo(x,fy-flH-8,x+flW,fy); ctx.closePath(); ctx.fill();
      ctx.fillStyle=C.fireGlow;
      ctx.beginPath(); ctx.moveTo(x-flW*0.7,fy); ctx.quadraticCurveTo(x,fy-flH*0.7,x,fy-flH*0.8); ctx.quadraticCurveTo(x,fy-flH*0.7,x+flW*0.7,fy); ctx.closePath(); ctx.fill();
      ctx.fillStyle=C.fireFlame;
      disc(x,fy-6,4,C.fireFlame); disc(x,fy-12,2.5,'#fff');
    } else {
      // Unlit coals
      disc(x-6,y-17,3,'#1f1f2e'); disc(x+4,y-17,3.5,'#1f1f2e'); disc(x,y-18,2.5,'#2b2b3a');
      const pcx=player.x+player.w/2-cam;
      if(Math.abs(pcx-x)<INTERACT_R+10) {
        ctx.font='bold 11px "Inter","Segoe UI",system-ui,sans-serif';
        ctx.textAlign='center'; ctx.fillStyle=C.fireGlow;
        ctx.fillText(player.element==='fire'?'[X] IGNITE BRAZIER':'NEEDS FIRE DUCK', x, y-32);
      }
    }
  }
}

function drawAshPlates(camX) {
  for(const ap of ashPlates) {
    const x=ap.x*T-camX, y=ap.y*T+T;
    ctx.fillStyle='#232332'; rrect(x+3,y-9,T-6,9,2); ctx.fill();
    ctx.fillStyle=ap.on?C.ashEye:'#45455c';
    rrect(x+7, y-(ap.on?5:12), T-14, ap.on?4:9, 3); ctx.fill();
    // Inscribed glyph
    ctx.fillStyle=ap.on?'#fff':'rgba(255,255,255,0.4)';
    ctx.fillRect(x+T/2-3, y-(ap.on?4:9), 6, 2);
    // Label
    ctx.font='bold 9px "Inter","Segoe UI",system-ui,sans-serif'; ctx.textAlign='center';
    ctx.fillStyle='rgba(255,255,255,0.45)';
    ctx.fillText('HEAVY PLATE', x+T/2, y+11);
  }
}

function drawCrates(camX) {
  for(const cr of crates) {
    const x=cr.x-camX,y=cr.y;
    if(x<-60||x>W+60) continue;
    ctx.fillStyle='rgba(0,0,0,0.2)';ctx.beginPath();ctx.ellipse(x+cr.w/2,y+cr.h+3,cr.w*0.4,4,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=C.crateD;rrect(x,y,cr.w,cr.h,6);ctx.fill();
    ctx.fillStyle=C.crate;rrect(x+3,y+3,cr.w-8,cr.h-8,4);ctx.fill();
    ctx.fillStyle=C.crateL;rrect(x+6,y+6,cr.w-18,cr.h-18,3);ctx.fill();
    ctx.strokeStyle=C.crateD;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(x+8,y+8);ctx.lineTo(x+cr.w-8,y+cr.h-8);ctx.moveTo(x+cr.w-8,y+8);ctx.lineTo(x+8,y+cr.h-8);ctx.stroke();
  }
}

function drawKeys(camX,t) {
  for(const k of keys) {
    if(k.got) continue;
    const x=k.x-camX,y=k.y+Math.sin(t*3+k.ph)*5;
    if(x<-30||x>W+30) continue;
    const col=keyCol(k.color);
    const gl=ctx.createRadialGradient(x,y,2,x,y,32);
    gl.addColorStop(0,col+'66');gl.addColorStop(1,col+'00');
    ctx.fillStyle=gl;ctx.fillRect(x-32,y-32,64,64);
    ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t*2+k.ph)*0.15);
    ctx.fillStyle=col;ctx.beginPath();
    for(let i=0;i<6;i++){const a=i*Math.PI/3-Math.PI/6;ctx.lineTo(Math.cos(a)*12,Math.sin(a)*12);}
    ctx.closePath();ctx.fill();
    ctx.fillStyle='#fff';ctx.globalAlpha=0.5;
    ctx.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3-Math.PI/6;ctx.lineTo(Math.cos(a)*6,Math.sin(a)*6);}
    ctx.closePath();ctx.fill();ctx.globalAlpha=1;
    ctx.restore();
  }
}

function drawLevers(camX,t) {
  for(const lv of levers) {
    const x=lv.x*T+T/2-camX, y=(lv.y+1)*T;
    ctx.fillStyle='#554f8c';rrect(x-12,y-8,24,8,3);ctx.fill();
    const angle=lv.on?0.7:-0.7;
    const animAngle=angle+(lv.anim>0?(lv.on?-1:1)*Math.sin(lv.anim*Math.PI)*0.3:0);
    ctx.save();ctx.translate(x,y-8);ctx.rotate(-animAngle);
    ctx.fillStyle=C.leverBase;rrect(-3,-28,6,28,3);ctx.fill();
    disc(0,-28,7,lv.on?C.cyan:C.pink);
    disc(-1,-30,3,'rgba(255,255,255,0.4)');
    ctx.restore();
    ctx.font='bold 10px "Inter","Segoe UI",system-ui,sans-serif';ctx.textAlign='center';
    ctx.fillStyle='rgba(255,255,255,0.5)';ctx.fillText('LEVER',x,y+12);
  }
}

function drawPortals(camX,t) {
  for(const po of portals) {
    [[po.x1,po.y1,C.portalA],[po.x2,po.y2,C.portalB]].forEach(([tx,ty,col]) => {
      const x=tx*T+T/2-camX,y=(ty+1)*T;
      if(x<-60||x>W+60) return;
      for(let i=3;i>=0;i--) {
        const r=14+i*5,a=0.08*(4-i)+0.06*Math.sin(t*3+i);
        ctx.globalAlpha=a;disc(x,y-22,r,col);
      }
      ctx.globalAlpha=1;
      ctx.strokeStyle=col;ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(x,y-22,18,t*2,t*2+Math.PI*1.5);ctx.stroke();
      ctx.strokeStyle='#fff';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(x,y-22,12,t*-3,t*-3+Math.PI);ctx.stroke();
      disc(x,y-22,6,'#fff');
    });
  }
}

function drawCheckpoint(camX,t) {
  const x=lvl.cp[0]*T+T/2-camX,y=(lvl.cp[1]+1)*T;
  if(x<-60||x>W+60) return;
  ctx.fillStyle='#d7d3ff';rrect(x-3,y-74,6,74,3);ctx.fill();
  disc(x,y-76,6,'#fff');
  const col=cpActive?C.cyan:'#6f6aa8',colD=cpActive?C.cyanD:'#554f8c';
  const wv=Math.sin(t*4)*(cpActive?4:1.5);
  ctx.fillStyle=colD;ctx.beginPath();ctx.moveTo(x+3,y-70);ctx.quadraticCurveTo(x+22,y-66+wv,x+38,y-58+wv);ctx.lineTo(x+3,y-44);ctx.closePath();ctx.fill();
  ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x+3,y-70);ctx.quadraticCurveTo(x+22,y-66+wv,x+38,y-58+wv);ctx.lineTo(x+3,y-58);ctx.closePath();ctx.fill();
}

function drawGoal(camX,t) {
  const x=lvl.goal[0]*T+T/2-camX,y=(lvl.goal[1]+1)*T;
  if(x<-140||x>W+140) return;
  const bg=ctx.createLinearGradient(0,y-260,0,y);
  bg.addColorStop(0,'rgba(53,224,184,0)');bg.addColorStop(1,'rgba(53,224,184,0.3)');
  ctx.fillStyle=bg;ctx.beginPath();ctx.moveTo(x-40,y);ctx.lineTo(x-70,y-260);ctx.lineTo(x+70,y-260);ctx.lineTo(x+40,y);ctx.closePath();ctx.fill();

  // Pond
  const pg=ctx.createLinearGradient(0,y-12,0,y+14);
  pg.addColorStop(0,'#6ff0ff');pg.addColorStop(1,'#1ba0d8');
  ctx.fillStyle='#128bc0';ctx.beginPath();ctx.ellipse(x,y-2,62,16,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=pg;ctx.beginPath();ctx.ellipse(x-3,y-5,56,12,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.8)';ctx.lineWidth=2;
  for(let i=0;i<3;i++){const k=((t*0.5+i/3)%1);ctx.globalAlpha=1-k;ctx.beginPath();ctx.ellipse(x,y-4,10+k*46,3+k*9,0,0,Math.PI*2);ctx.stroke();}
  ctx.globalAlpha=1;

  // Task Forcefield Shield if locked
  if(!pondUnlocked) {
    ctx.save();
    const sy = y - 50;
    const pulse = Math.sin(t*4)*4;
    ctx.fillStyle='rgba(255,93,143,0.18)';
    ctx.beginPath(); ctx.arc(x,sy,55+pulse,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=C.pink; ctx.lineWidth=3;
    ctx.setLineDash([8,6]);
    ctx.beginPath(); ctx.arc(x,sy,55+pulse,0,Math.PI*2); ctx.stroke();
    ctx.setLineDash([]);
    // Lock badge
    ctx.fillStyle='rgba(16,16,50,0.85)'; rrect(x-50,sy-12,100,24,12); ctx.fill();
    ctx.strokeStyle=C.pink; ctx.lineWidth=1.5; rrect(x-50,sy-12,100,24,12); ctx.stroke();
    ctx.font='bold 10px "Inter","Segoe UI",system-ui,sans-serif';
    ctx.textAlign='center'; ctx.fillStyle='#fff';
    ctx.fillText('SEALED · TASKS', x, sy+4);
    ctx.restore();
  }
}

function drawBread(camX,t) {
  for(const b of bread) {
    if(b.got) continue;
    const x=b.x-camX;if(x<-30||x>W+30)continue;
    const y=b.y+Math.sin(t*3+b.ph)*4;
    const gl=ctx.createRadialGradient(x,y,2,x,y,28);
    gl.addColorStop(0,'rgba(255,200,87,0.4)');gl.addColorStop(1,'rgba(255,200,87,0)');
    ctx.fillStyle=gl;ctx.fillRect(x-28,y-28,56,56);
    ctx.fillStyle=C.crust;rrect(x-12,y-10,24,22,7);ctx.fill();
    disc(x-6,y-10,7,C.crust);disc(x+6,y-10,7,C.crust);
    ctx.fillStyle=C.bread;rrect(x-9,y-7,18,17,5);ctx.fill();
    disc(x-5,y-9,5,C.bread);disc(x+5,y-9,5,C.bread);
  }
}

function drawEnemy(e,camX,t) {
  const x=e.x+e.w/2-camX;if(x<-60||x>W+60) return;
  if(e.type==='e') {
    const y=e.y+e.h,sq=Math.sin(t*8+e.ph)*0.07;
    ctx.save();ctx.translate(x,y);ctx.scale(1-sq,1+sq);
    ctx.fillStyle=C.pinkD;ctx.beginPath();ctx.ellipse(-9,-2,7,3.5,0,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(9,-2,7,3.5,0,0,7);ctx.fill();
    ctx.fillStyle=C.pinkD;for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*10-4,-26);ctx.lineTo(i*10,-35);ctx.lineTo(i*10+4,-26);ctx.closePath();ctx.fill();}
    blob(0,-15,20,15.5,C.pink,C.pinkD);
    const d=e.dir;disc(-6+d*1,-17,5.2,'#fff');disc(8+d*1,-17,5.2,'#fff');disc(-5+d*2.6,-16.5,2.5,C.ink);disc(9+d*2.6,-16.5,2.5,C.ink);
    ctx.strokeStyle=C.ink;ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-12,-26);ctx.lineTo(-2,-22.5);ctx.moveTo(14,-26);ctx.lineTo(4,-22.5);ctx.stroke();
    ctx.restore();
  } else {
    const cy=e.y+e.h/2;ctx.save();ctx.translate(x,cy);
    ctx.save();ctx.rotate(t*0.8+e.ph);ctx.fillStyle=C.lilac;
    for(let i=0;i<8;i++){ctx.rotate(Math.PI/4);ctx.beginPath();ctx.moveTo(-4.5,-13);ctx.lineTo(0,-26);ctx.lineTo(4.5,-13);ctx.closePath();ctx.fill();disc(0,-26,2.6,'#fff');}
    ctx.restore();blob(0,0,16.5,16.5,C.purple,C.purpleD);
    const lx=clamp((player.x-e.x)/60,-1,1),ly=clamp((player.y-e.y)/60,-1,1);
    disc(0,-1,7,'#fff');disc(lx*2.5,-1+ly*2.5,3.4,C.ink);disc(lx*2.5+1,-2+ly*2.5,1,'#fff');
    ctx.restore();
  }
}

/* ── Kurzgesagt Duck Drawing (Normal / Fire / Ash Forms) ─────── */
function drawDuck(x,y,o) {
  const s=o.scale||0.8, f=o.facing||1;
  const t=o.t||0, run=o.run||0;
  const el=o.element||'normal';

  // Palette selection per element
  let cDuck=C.duck, cDuckD=C.duckD, cWing=C.wing, cWingD=C.wingD;
  let cBeak=C.beak, cBeakD=C.beakD, cEye=C.ink, cCheek=C.pink;

  if(el==='fire') {
    cDuck=C.fireGlow; cDuckD=C.fireD; cWing=C.fire; cWingD=C.fireD;
    cBeak=C.fireBeak; cBeakD=C.fire; cEye='#ffffff'; cCheek='#ff2200';
  } else if(el==='ash') {
    cDuck=C.ash; cDuckD=C.ashD; cWing=C.ashL; cWingD=C.ashD;
    cBeak=C.ashD; cBeakD='#12121c'; cEye=C.ashEye; cCheek=C.ashEmber;
  }

  ctx.save(); ctx.translate(x,y); ctx.scale(f*s*(o.sx||1), s*(o.sy||1));

  // Element Background Corona (Solar glow / Ash void)
  if(el==='fire') {
    const cg = ctx.createRadialGradient(0,-30,8,0,-30,48);
    cg.addColorStop(0,C.fireGlow+'55'); cg.addColorStop(1,C.fireGlow+'00');
    ctx.fillStyle=cg; ctx.fillRect(-50,-80,100,100);
  } else if(el==='ash') {
    const ag = ctx.createRadialGradient(0,-30,8,0,-30,42);
    ag.addColorStop(0,C.ashEye+'33'); ag.addColorStop(1,C.ashEye+'00');
    ctx.fillStyle=ag; ctx.fillRect(-50,-80,100,100);
  }

  // Legs & Feet
  const sw=Math.sin(t*16)*run*6;
  ctx.fillStyle=el==='ash'?'#222230':C.leg;
  rrect(-10+sw,-9,6,10,3);ctx.fill(); rrect(5-sw,-9,6,10,3);ctx.fill();
  ctx.fillStyle=cBeak;
  ctx.beginPath();ctx.ellipse(-5+sw+3,1,9,3.4,0,0,7);ctx.fill();
  ctx.beginPath();ctx.ellipse(10-sw+3,1,9,3.4,0,0,7);ctx.fill();

  // Tail
  ctx.fillStyle=cDuckD;
  ctx.beginPath();ctx.moveTo(-17,-24);ctx.quadraticCurveTo(-30,-40,-37,-34);ctx.quadraticCurveTo(-33,-22,-19,-13);ctx.closePath();ctx.fill();

  // Fire Tail Plumes (if Fire form)
  if(el==='fire') {
    ctx.fillStyle=C.fireFlame;
    ctx.beginPath();ctx.moveTo(-24,-30);ctx.quadraticCurveTo(-38,-48+Math.sin(t*18)*4,-44,-42);ctx.quadraticCurveTo(-38,-30,-22,-22);ctx.closePath();ctx.fill();
  }

  // Body
  blob(0,-21,25,19.5,cDuck,cDuckD);

  // Wing & Rotation
  let wa=0.15;
  if(o.glide) wa=0.55+Math.sin(t*22)*0.06;
  else if(o.air) wa=o.vy<0?0.95+Math.sin(t*30)*0.2:0.35;
  else wa=0.1+Math.sin(t*16)*0.08*run;
  ctx.save();ctx.translate(2,-22);ctx.rotate(wa);
  const ws=o.glide?1.25:1;
  blob(-9*ws,0,14*ws,7.5,cWing,cWingD);
  ctx.restore();

  // Head
  blob(11,-41,15.5,14.5,cDuck,cDuckD);

  // Fire Form: Stylized Solar Crown Feathers
  if(el==='fire') {
    ctx.fillStyle=C.fire;
    ctx.beginPath(); ctx.moveTo(4,-54); ctx.lineTo(8,-66+Math.sin(t*20)*3); ctx.lineTo(13,-54); ctx.closePath(); ctx.fill();
    ctx.fillStyle=C.fireFlame;
    ctx.beginPath(); ctx.moveTo(11,-54); ctx.lineTo(17,-70+Math.cos(t*20)*3); ctx.lineTo(21,-54); ctx.closePath(); ctx.fill();
  }

  // Cheek
  ctx.globalAlpha=0.6; ctx.fillStyle=cCheek;
  ctx.beginPath();ctx.ellipse(6,-35,4.2,2.6,0,0,7);ctx.fill();
  ctx.globalAlpha=1;

  // Beak
  const q=o.quack||0;
  ctx.fillStyle=cBeakD;ctx.beginPath();ctx.ellipse(24,-33+q*4,9,3.4,0,0,7);ctx.fill();
  ctx.fillStyle=cBeak;ctx.beginPath();ctx.ellipse(25,-38-q*4.5,11.5,5,-q*0.2,0,7);ctx.fill();
  if(q>0.2){ctx.fillStyle='#8a1f2f';ctx.beginPath();ctx.ellipse(23,-35.5,6.5,1.8+q*2.5,0,0,7);ctx.fill();ctx.fillStyle=cBeak;ctx.beginPath();ctx.ellipse(25,-38-q*4.5,11.5,5,-q*0.2,0,7);ctx.fill();}

  // Eye
  if(o.blink>0||o.dead){
    ctx.strokeStyle=el==='ash'?C.ashEye:C.ink;
    ctx.lineWidth=2.6;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(10,-44);ctx.lineTo(18,-44);ctx.stroke();
  } else {
    disc(14.5,-44.5,5.4,el==='fire'?'#fffae0':'#fff');
    disc(16.2,-44.2,3,cEye);
    disc(17.1,-45.4,1.1,'#fff');
  }

  ctx.restore();
}

function drawPlayer(t) {
  const p=player;
  if(p.inv>0&&state==='play'&&Math.floor(p.inv*14)%2===0) return;
  drawDuck(p.x+p.w/2-cam,p.y+p.h,{
    facing:p.facing,t:time,run:p.onGround?clamp(Math.abs(p.vx)/RUN,0,1):0,
    air:!p.onGround,vy:p.vy,glide:p.gliding,sx:p.sx,sy:p.sy,quack:p.quack,
    blink:p.blink,dead:p.dead,scale:0.82,element:p.element
  });
  if(p.glide<GLIDE_MAX-0.02&&!p.onGround){
    const cx=p.x+p.w/2-cam,cy=p.y-14;
    ctx.fillStyle='rgba(255,255,255,0.25)';rrect(cx-16,cy,32,4,2);ctx.fill();
    ctx.fillStyle=C.cyan;rrect(cx-16,cy,32*Math.max(0,p.glide/GLIDE_MAX),4,2);ctx.fill();
  }
}

/* ── FX Rendering ───────────────────────────────────────────── */
function drawFx(camX) {
  for(const r of rings){
    const k=r.t/0.45,e=1-Math.pow(1-k,3);
    ctx.globalAlpha=(1-k)*0.4;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(r.x-camX,r.y,150*e,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1-k;ctx.strokeStyle='#fff';ctx.lineWidth=5*(1-k)+1;ctx.beginPath();ctx.arc(r.x-camX,r.y,150*e,0,Math.PI*2);ctx.stroke();
  }
  ctx.globalAlpha=1;
  for(const q of particles){ctx.globalAlpha=clamp(q.life/q.max,0,1);disc(q.x-camX,q.y,q.r,q.c);}
  ctx.globalAlpha=1;
  ctx.font='900 16px "Inter","Segoe UI",system-ui,sans-serif';ctx.textAlign='center';
  for(const p of popups){
    const k=p.t/1.2;ctx.globalAlpha=1-k*k;
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillText(p.txt,p.x-camX+1.5,p.y-k*40+2);
    ctx.fillStyle=p.col;ctx.fillText(p.txt,p.x-camX,p.y-k*40);
  }
  ctx.globalAlpha=1;
}

/* ── Scientific HUD & Task Checklist ────────────────────────── */
function drawHUD() {
  // Title / World
  ctx.textAlign='center';
  ctx.font='900 13px "Inter","Segoe UI",system-ui,sans-serif';
  ctx.fillStyle='rgba(255,255,255,0.7)';
  ctx.fillText('PUZZLE '+(levelIndex+1)+' · '+lvl.name.toUpperCase()+'  ·  SCORE '+score, W/2, 22);

  // Bread Counter
  ctx.textAlign='left';
  ctx.fillStyle=C.crust;rrect(20,36,20,18,5);ctx.fill();disc(25,36,5,C.crust);disc(35,36,5,C.crust);
  ctx.fillStyle=C.bread;rrect(22,39,16,14,3);ctx.fill();
  ctx.font='900 16px "Inter","Segoe UI",system-ui,sans-serif';ctx.fillStyle='#fff';
  ctx.fillText(breadGot+'/'+lvl.def.bread.length, 48, 51);

  // Active Element Pill
  const el = player.element;
  const elCol = el==='fire'?C.fire:el==='ash'?C.ashEye:C.cyan;
  const elName = el==='fire'?'SOLAR DUCK (6,000 K)':el==='ash'?'ASH DUCK (DENSE)':el==='normal'?'DUCK (ORGANIC)':'DUCK';
  ctx.fillStyle='rgba(16,16,46,0.75)'; rrect(20,62,180,24,12); ctx.fill();
  ctx.strokeStyle=elCol; ctx.lineWidth=1.5; rrect(20,62,180,24,12); ctx.stroke();
  disc(32, 74, 5, elCol);
  ctx.font='bold 11px "Inter","Segoe UI",system-ui,sans-serif'; ctx.fillStyle='#fff';
  ctx.fillText(elName, 44, 78);

  // Mission Research Protocol (Task Checklist Card)
  if(tasks && tasks.length>0) {
    const cardW = 270, cardH = 26 + tasks.length*20;
    const cardX = W - cardW - 20, cardY = 16;
    ctx.fillStyle='rgba(12,12,38,0.85)'; rrect(cardX,cardY,cardW,cardH,10); ctx.fill();
    ctx.strokeStyle=pondUnlocked?'rgba(53,224,184,0.6)':'rgba(255,255,255,0.18)'; ctx.lineWidth=1.5;
    rrect(cardX,cardY,cardW,cardH,10); ctx.stroke();

    ctx.font='900 11px "Inter","Segoe UI",system-ui,sans-serif';
    ctx.fillStyle=pondUnlocked?C.cyan:'#a09ccc';
    ctx.fillText(pondUnlocked?'✓ PROTOCOL COMPLETE · POND UNLOCKED':'RESEARCH PROTOCOL · TASKS', cardX+12, cardY+18);

    tasks.forEach((tk, idx) => {
      const ty = cardY + 36 + idx*19;
      // Checkbox
      ctx.fillStyle = tk.done ? C.cyan : 'rgba(255,255,255,0.2)';
      rrect(cardX+12, ty-10, 12, 12, 3); ctx.fill();
      if(tk.done) {
        ctx.fillStyle='#101032';
        ctx.font='bold 10px "Inter","Segoe UI",sans-serif';
        ctx.fillText('✓', cardX+14, ty);
      }
      // Task text
      ctx.font = '600 11px "Inter","Segoe UI",system-ui,sans-serif';
      ctx.fillStyle = tk.done ? '#ffffff' : 'rgba(255,255,255,0.7)';
      const counter = tk.total>1 ? ' ('+tk.current+'/'+tk.total+')' : '';
      ctx.fillText(tk.desc + counter, cardX+30, ty);
    });
  }

  // Inventory Crystals
  if(inventory.length>0) {
    ctx.font='800 11px "Inter","Segoe UI",system-ui,sans-serif';
    ctx.fillStyle='rgba(255,255,255,0.5)';ctx.fillText('CRYSTALS',22,106);
    inventory.forEach((col,i) => {
      const kx=30+i*24, ky=120;
      disc(kx,ky,9,keyCol(col));
      ctx.globalAlpha=0.6;disc(kx-2,ky-2,3,'#fff');ctx.globalAlpha=1;
    });
  }

  // Hint Pill
  if(hintTimer>0) {
    hintTimer-=1/60;
    const a=hintTimer>4.5?clamp((5-hintTimer)*4,0,1):hintTimer<1?hintTimer:1;
    ctx.globalAlpha=a*0.9;
    ctx.font='800 15px "Inter","Segoe UI",system-ui,sans-serif';ctx.textAlign='center';
    const tw=ctx.measureText(hintText).width+40;
    ctx.fillStyle='rgba(11,11,38,0.85)';rrect(W/2-tw/2,H-56,tw,34,17);ctx.fill();
    ctx.strokeStyle=C.cyan+'66';ctx.lineWidth=2;rrect(W/2-tw/2,H-56,tw,34,17);ctx.stroke();
    ctx.fillStyle=C.cyan;ctx.fillText(hintText,W/2,H-34);
    ctx.globalAlpha=1;
  }

  // Reset Hint
  ctx.textAlign='right';ctx.font='700 11px "Inter","Segoe UI",system-ui,sans-serif';
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.fillText('R = Reset Puzzle',W-20,H-14);
}

/* ── Main Render ────────────────────────────────────────────── */
let titleQuack = 0;
function render() {
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,W,H);
  let ox=0,oy=0;if(shake>0){ox=rnd(-1,1)*shake*18;oy=rnd(-1,1)*shake*18;}
  ctx.save();ctx.translate(ox,oy);

  if(state==='title') {
    drawBackground(0,time);drawTiles(0);drawBread(0,time);
    const bob=Math.abs(Math.sin(time*2.2))*6;
    drawDuck(700,450-bob,{scale:2.4,facing:-1,t:time,run:0,quack:titleQuack,blink:(time%3.4)<0.12?1:0,sy:1+Math.sin(time*4.4)*0.02,element:'fire'});
    titleQuack=Math.max(0,titleQuack-0.05);
    drawFx(0);
  } else {
    drawBackground(cam,time);
    ctx.save();ctx.translate(0,-Math.round(camY));
    drawTiles(cam);
    drawCheckpoint(cam,time);
    drawGoal(cam,time);
    drawButtons(cam);
    drawAshPlates(cam);
    drawAltars(cam,time);
    drawBraziers(cam,time);
    drawPortals(cam,time);
    drawLevers(cam,time);
    drawBread(cam,time);
    drawKeys(cam,time);
    drawCrates(cam);
    for(const e of enemies) if(!e.dead) drawEnemy(e,cam,time);
    drawPlayer(time);
    drawFx(cam);
    ctx.restore();
  }
  ctx.restore();
  if(state!=='title') drawHUD();
}

/* ══════════════════════════════════════════════════════════════
 * SCREENS & FLOW
 * ══════════════════════════════════════════════════════════════ */
const screens = {title:$('#title'),lvls:$('#lvls'),device:$('#device'),pause:$('#pause'),end:$('#levelEnd'),over:$('#gameOver'),win:$('#win')};
function showScreen(name){for(const k in screens) screens[k].classList.toggle('hidden',k!==name);document.body.classList.toggle('menu',name!==null);}

function saveBest(){if(score>best){best=score;try{localStorage.setItem(SAVE_KEY,String(best));}catch(e){}}}
function updateBestLine(){$('#bestLine').textContent=best>0?'Best score: '+best:'';}

function buildGrid() {
  const g=$('#grid'); g.innerHTML='';
  LEVELS.forEach((L,i) => {
    const b=document.createElement('button');
    b.className='lv'; b.textContent=i+1; b.title=L.name+(L.sub?' — '+L.sub:'');
    b.disabled=i>=unlocked;
    if(i<unlocked) { const dot=document.createElement('span'); dot.className='lvname'; dot.textContent=L.name; b.appendChild(dot); }
    b.addEventListener('click',()=>startGame(i)); g.appendChild(b);
  });
}

function startGame(i=0) {
  audio(); score=0; totalBread=0;
  loadLevel(i); updateCamera(0,true);
  state='play'; showScreen(null);
}
function showLevelEnd() {
  state='end'; score+=Math.max(0,Math.round(60-levelTime))*2;
  saveBest();
  unlocked=Math.max(unlocked,Math.min(LEVELS.length,levelIndex+2));
  try{localStorage.setItem('duckpuzzle.unlocked',String(unlocked));}catch(e){}
  $('#endWorld').textContent='Puzzle '+(levelIndex+1)+' · '+lvl.name;
  $('#endBread').textContent=breadGot+'/'+lvl.def.bread.length;
  $('#endFoes').textContent=String(foesBeaten);
  $('#endTime').textContent=Math.round(levelTime)+'s';
  $('#endScore').textContent=String(score);
  $('#btnNext').textContent=levelIndex===LEVELS.length-1?'Finish':'Next Puzzle';
  showScreen('end');
}
function nextLevel() {
  if(levelIndex>=LEVELS.length-1){
    state='win';
    $('#winBread').textContent=String(totalBread);
    $('#winScore').textContent=String(score);
    $('#winBest').textContent=score>=best?'New best score!':'Best score: '+best;
    showScreen('win');
    return;
  }
  loadLevel(levelIndex+1);updateCamera(0,true);state='play';showScreen(null);
}
function showGameOver(){state='over';sfx.reset();saveBest();showScreen('over');}
function retryLevel(){score=levelStartScore;totalBread-=breadGot;loadLevel(levelIndex);updateCamera(0,true);state='play';showScreen(null);}
function toTitle(){state='title';loadLevel(0);cam=0;updateBestLine();showScreen('title');}
function pauseGame(){if(state!=='play')return;state='pause';showScreen('pause');}
function resumeGame(){if(state!=='pause')return;state='play';showScreen(null);}

/* ── Input ──────────────────────────────────────────────────── */
const keymap={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'jump',KeyW:'jump',Space:'jump',ArrowDown:'down',KeyS:'down'};
const interactKeys=['KeyX','KeyK','KeyZ','ShiftLeft','ShiftRight','KeyE'];

window.addEventListener('keydown',e=>{
  const k=keymap[e.code];
  if(k&&state==='play'){e.preventDefault();if(k==='jump'&&!inp.jump)jumpBuf=0.14;inp[k]=true;}
  if(interactKeys.includes(e.code)&&state==='play'){e.preventDefault();if(!e.repeat)interactReq=true;}
  if(e.code==='KeyR'&&state==='play'){e.preventDefault();resetLevel();}
  if(e.repeat) return;
  if(e.code==='KeyP'||e.code==='Escape'){state==='pause'?resumeGame():pauseGame();}
  if(e.code==='KeyM') toggleMute();
  audio();
});
window.addEventListener('keyup',e=>{const k=keymap[e.code];if(k)inp[k]=false;});
window.addEventListener('blur',()=>{inp.left=inp.right=inp.jump=inp.down=false;pauseGame();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseGame();});

function press(act,down){
  if(act==='quack'){if(down)interactReq=true;return;}
  if(act==='jump'&&down&&!inp.jump)jumpBuf=0.14;
  inp[act]=down;
}
document.querySelectorAll('[data-act]').forEach(b=>{
  const act=b.dataset.act;
  const on=e=>{e.preventDefault();if(b.setPointerCapture)try{b.setPointerCapture(e.pointerId);}catch(_){}b.classList.add('on');audio();press(act,true);};
  const off=e=>{e.preventDefault();b.classList.remove('on');press(act,false);};
  b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('lostpointercapture',off);b.addEventListener('contextmenu',e=>e.preventDefault());
});

const touchCapable=('ontouchstart' in window)||!!(window.matchMedia&&window.matchMedia('(pointer: coarse)').matches);
const DEVICE_KEY='duckpuzzle.device';
let device=touchCapable?'mobile':'computer';
try{const d=localStorage.getItem(DEVICE_KEY);if(d==='mobile'||d==='computer')device=d;}catch(e){}

function applyDevice(d){
  device=d;document.body.classList.toggle('touch',d==='mobile');
  $('#devMobile').classList.toggle('sel',d==='mobile');$('#devComputer').classList.toggle('sel',d==='computer');
  $('#btnSwitch').textContent=d==='mobile'?'Switch to keyboard controls':'Switch to mobile controls';
  try{localStorage.setItem(DEVICE_KEY,d);}catch(e){}
}
function goMobileFullscreen(){
  const el=document.documentElement;
  const lock=()=>{try{if(screen.orientation&&screen.orientation.lock)screen.orientation.lock('landscape').catch(()=>{});}catch(e){}};
  try{if(document.fullscreenElement||document.webkitFullscreenElement){lock();return;}const req=el.requestFullscreen||el.webkitRequestFullscreen;if(req){const r=req.call(el,{navigationUI:'hide'});if(r&&r.then)r.then(lock).catch(()=>{});else lock();}}catch(e){}
}
function chooseDevice(d){applyDevice(d);audio();if(d==='mobile')goMobileFullscreen();buildGrid();showScreen('lvls');}
applyDevice(device);

function toggleMute(){muted=!muted;try{localStorage.setItem('duckpuzzle.muted',muted?'1':'0');}catch(e){}$('#btnMute').classList.toggle('off',muted);}

$('#btnPlay').addEventListener('click',()=>{audio();showScreen('device');});
$('#devComputer').addEventListener('click',()=>chooseDevice('computer'));
$('#devMobile').addEventListener('click',()=>chooseDevice('mobile'));
$('#btnLvBack').addEventListener('click',()=>showScreen('device'));
$('#btnDevBack').addEventListener('click',()=>showScreen('title'));
$('#btnSwitch').addEventListener('click',()=>{const d=device==='mobile'?'computer':'mobile';applyDevice(d);if(d==='mobile')goMobileFullscreen();});
$('#btnNext').addEventListener('click',nextLevel);
$('#btnRetry').addEventListener('click',retryLevel);
$('#btnAgain').addEventListener('click',toTitle);
$('#btnResume').addEventListener('click',resumeGame);
$('#btnQuit').addEventListener('click',toTitle);
$('#btnQuit2').addEventListener('click',toTitle);
$('#btnPause').addEventListener('click',()=>{state==='pause'?resumeGame():pauseGame();});
$('#btnMute').addEventListener('click',toggleMute);
$('#btnMute').classList.toggle('off',muted);
canvas.addEventListener('pointerdown',()=>{if(state==='title'){audio();sfx.flame();titleQuack=1;rings.push({x:700,y:400,t:0});}});

/* ── Main Animation Loop ────────────────────────────────────── */
let last = 0;
function frame(ts) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.033,(ts-last)/1000||0);
  last = ts; time += dt;
  update(dt); render();
}

loadLevel(0); updateBestLine(); showScreen('title');
requestAnimationFrame(frame);

})();
