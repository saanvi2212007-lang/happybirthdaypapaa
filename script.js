/* ─────────────────────────────────────────────────
   BIRTHDAY CARD  –  script.js
   Particles, Sparkles, Confetti, Page Navigation
───────────────────────────────────────────────── */

'use strict';

/* ══════════════════════════════════════════
   1. PAGE NAVIGATION
══════════════════════════════════════════ */
let currentPage = 1;
const TOTAL = 4;
const transition = document.getElementById('pageTransition');

function goToPage(n) {
  if (n < 1 || n > TOTAL || n === currentPage) return;

  // flash overlay
  transition.classList.add('flash');
  setTimeout(() => {
    const prev = document.getElementById(`page${currentPage}`);
    const next = document.getElementById(`page${n}`);

    prev.classList.remove('active');
    prev.classList.add('exit-left');

    setTimeout(() => {
      prev.classList.remove('exit-left');
    }, 700);

    next.classList.add('active');
    currentPage = n;

    // trigger page-specific animations
    if (n === 3) triggerConfetti('confetti3');
    if (n === 1) triggerConfetti('confetti1');

    transition.classList.remove('flash');
    updateDots();
  }, 350);
}

function updateDots() {
  document.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === currentPage - 1);
  });
}

// keyboard navigation
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goToPage(currentPage + 1);
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goToPage(currentPage - 1);
});

// touch / swipe
let touchStartX = 0;
document.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
document.addEventListener('touchend', e => {
  const dx = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(dx) > 50) dx > 0 ? goToPage(currentPage + 1) : goToPage(currentPage - 1);
});

/* ══════════════════════════════════════════
   2. GLOBAL FLOATING PARTICLES (canvas)
══════════════════════════════════════════ */
(function initGlobalParticles() {
  const canvas = document.getElementById('globalCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const colors = [
    'rgba(56,189,248,',   // sky blue
    'rgba(37,99,235,',    // royal blue
    'rgba(30,58,138,',    // navy
    'rgba(245,158,11,',   // gold
    'rgba(167,139,250,',  // purple
    'rgba(248,250,252,',  // white
  ];

  function createParticle() {
    return {
      x: Math.random() * 1920,
      y: Math.random() * 1080,
      r: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(Math.random() * 0.5 + 0.1),
      alpha: Math.random() * 0.7 + 0.15,
      color: colors[Math.floor(Math.random() * colors.length)],
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.04 + 0.01,
    };
  }

  for (let i = 0; i < 220; i++) particles.push(createParticle());

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.twinkle += p.twinkleSpeed;
      const a = p.alpha * (0.6 + 0.4 * Math.sin(p.twinkle));

      // glow
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      grd.addColorStop(0, p.color + a + ')');
      grd.addColorStop(1, p.color + '0)');
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + a + ')';
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      if (p.x < -10 || p.x > W + 10) { p.x = Math.random() * W; p.y = H + 10; }
    });
    requestAnimationFrame(draw);
  }
  draw();
}());

/* ══════════════════════════════════════════
   3. PER-PAGE SPARKLE CANVASES
══════════════════════════════════════════ */
function initSparkleCanvas(canvasId, colorSet) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, sparks = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);
  resize();

  function mkSpark() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      size: Math.random() * 3 + 1,
      alpha: 0,
      maxAlpha: Math.random() * 0.8 + 0.2,
      growing: true,
      speed: Math.random() * 0.015 + 0.005,
      color: colorSet[Math.floor(Math.random() * colorSet.length)],
      shape: Math.random() < 0.4 ? 'star' : 'circle',
    };
  }

  for (let i = 0; i < 60; i++) {
    const s = mkSpark(); s.alpha = Math.random() * s.maxAlpha; sparks.push(s);
  }

  function drawStar(cx, cy, r, pts, ctx) {
    ctx.beginPath();
    for (let k = 0; k < pts * 2; k++) {
      const angle = (k * Math.PI) / pts - Math.PI / 2;
      const rad = k % 2 === 0 ? r : r * 0.45;
      k === 0 ? ctx.moveTo(cx + rad * Math.cos(angle), cy + rad * Math.sin(angle))
              : ctx.lineTo(cx + rad * Math.cos(angle), cy + rad * Math.sin(angle));
    }
    ctx.closePath();
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    sparks.forEach(s => {
      s.growing ? (s.alpha += s.speed) : (s.alpha -= s.speed);
      if (s.alpha >= s.maxAlpha) s.growing = false;
      if (s.alpha <= 0) {
        s.growing = true;
        s.x = Math.random() * W;
        s.y = Math.random() * H;
        s.color = colorSet[Math.floor(Math.random() * colorSet.length)];
      }
      ctx.save();
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = s.color;
      if (s.shape === 'star') {
        drawStar(s.x, s.y, s.size, 4, ctx);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
    requestAnimationFrame(frame);
  }
  frame();
}

const coverColors = ['#38bdf8','#7dd3fc','#fde68a','#f59e0b','#a78bfa','#ffffff'];
const inner1Colors = ['#38bdf8','#bae6fd','#7dd3fc','#fde68a','#a78bfa'];
const inner2Colors = ['#fbbf24','#38bdf8','#f472b6','#34d399','#a78bfa','#7dd3fc'];
const closeColors  = ['#38bdf8','#93c5fd','#fde68a','#f59e0b','#ffffff','#a78bfa'];

initSparkleCanvas('canvas1', coverColors);
initSparkleCanvas('canvas2', inner1Colors);
initSparkleCanvas('canvas3', inner2Colors);
initSparkleCanvas('canvas4', closeColors);

/* ══════════════════════════════════════════
   4. CONFETTI
══════════════════════════════════════════ */
function triggerConfetti(layerId) {
  const layer = document.getElementById(layerId);
  if (!layer) return;
  layer.innerHTML = '';
  const palette = ['#38bdf8','#fbbf24','#f472b6','#a78bfa','#34d399','#fb923c','#ffffff','#7dd3fc'];
  const count = 60;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      left: ${Math.random() * 100}%;
      background: ${palette[Math.floor(Math.random() * palette.length)]};
      width: ${Math.random() * 8 + 5}px;
      height: ${Math.random() * 14 + 8}px;
      border-radius: ${Math.random() < 0.4 ? '50%' : '2px'};
      animation-duration: ${Math.random() * 3 + 2.5}s;
      animation-delay: ${Math.random() * 2}s;
      transform: rotate(${Math.random() * 360}deg);
    `;
    layer.appendChild(el);
  }
}

// initial confetti on cover
triggerConfetti('confetti1');

/* ══════════════════════════════════════════
   5. MOUSE SPARKLE TRAIL
══════════════════════════════════════════ */
(function mouseTrail() {
  const colors = ['#38bdf8','#fde68a','#f472b6','#a78bfa','#ffffff'];
  document.addEventListener('mousemove', e => {
    for (let i = 0; i < 2; i++) {
      const spark = document.createElement('div');
      const size = Math.random() * 10 + 4;
      Object.assign(spark.style, {
        position: 'fixed',
        left: `${e.clientX - size / 2}px`,
        top:  `${e.clientY - size / 2}px`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: colors[Math.floor(Math.random() * colors.length)],
        pointerEvents: 'none',
        zIndex: 999,
        opacity: '0.85',
        transition: 'transform 0.5s ease, opacity 0.5s ease',
        willChange: 'transform, opacity',
        boxShadow: `0 0 ${size}px ${colors[Math.floor(Math.random() * colors.length)]}`,
      });
      document.body.appendChild(spark);
      requestAnimationFrame(() => {
        spark.style.transform = `translate(${(Math.random() - 0.5) * 60}px, ${(Math.random() - 0.5) * 60}px) scale(0)`;
        spark.style.opacity = '0';
      });
      setTimeout(() => spark.remove(), 550);
    }
  });
}());

/* ══════════════════════════════════════════
   6. AMBIENT GLOW PULSE (CSS var driven)
══════════════════════════════════════════ */
(function ambientPulse() {
  let t = 0;
  function pulse() {
    t += 0.01;
    const v = Math.sin(t) * 0.5 + 0.5;
    document.querySelectorAll('.bokeh').forEach((b, i) => {
      b.style.opacity = (0.15 + v * 0.12 + i * 0.01).toFixed(3);
    });
    requestAnimationFrame(pulse);
  }
  pulse();
}());
