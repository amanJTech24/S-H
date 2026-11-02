// js/petals.js
// ─────────────────────────────────────────────────────────────────────────
//  Falling rose petals canvas overlay on the hero section
//  Respects prefers-reduced-motion
// ─────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const canvas = document.getElementById('petals-canvas');
  if (!canvas) return;

  // Respect reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const ctx = canvas.getContext('2d');

  // Petal colors
  const COLORS = [
    'rgba(229,180,180,0.7)',
    'rgba(242,196,206,0.65)',
    'rgba(255,230,230,0.6)',
    'rgba(245,220,210,0.55)',
    'rgba(210,160,160,0.5)',
  ];

  const PETAL_COUNT = 28;
  let petals = [];
  let W, H, dpr;
  let rafId;

  function resize() {
    dpr    = window.devicePixelRatio || 1;
    W      = canvas.offsetWidth;
    H      = canvas.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function randBetween(a, b) { return a + Math.random() * (b - a); }

  function createPetal() {
    const size = randBetween(6, 16);
    return {
      x:      randBetween(-20, W + 20),
      y:      randBetween(-H * 0.5, -10),
      size,
      color:  COLORS[Math.floor(Math.random() * COLORS.length)],
      speed:  randBetween(0.6, 1.8),
      drift:  randBetween(-0.4, 0.4),
      rot:    randBetween(0, Math.PI * 2),
      rotSpd: randBetween(-0.02, 0.02),
      sway:   randBetween(0.3, 0.9),
      swayT:  randBetween(0, Math.PI * 2),
      opacity: randBetween(0.5, 0.9),
    };
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle   = p.color;

    // Simple ellipse petal shape
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size * 0.45, p.size * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle vein highlight
    ctx.beginPath();
    ctx.moveTo(0, -p.size * 0.7);
    ctx.lineTo(0, p.size * 0.7);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth   = 0.5;
    ctx.stroke();

    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);

    petals.forEach(p => {
      p.swayT += 0.015;
      p.x     += p.drift + Math.sin(p.swayT) * p.sway;
      p.y     += p.speed;
      p.rot   += p.rotSpd;

      if (p.y > H + 20) {
        // Recycle petal back to top
        Object.assign(p, createPetal(), { y: -20, x: randBetween(0, W) });
      }

      drawPetal(p);
    });

    rafId = requestAnimationFrame(tick);
  }

  function init() {
    resize();
    petals = Array.from({ length: PETAL_COUNT }, createPetal);
    // Spread initial Y positions
    petals.forEach(p => { p.y = randBetween(0, H); });
    tick();
  }

  const resizeObserver = new ResizeObserver(() => {
    resize();
    petals.forEach(p => { p.x = Math.min(p.x, W); });
  });
  resizeObserver.observe(canvas);

  // Only run when hero is visible
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        if (!rafId) tick();
      } else {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    });
  }, { threshold: 0.1 });

  const hero = document.getElementById('hero');
  if (hero) observer.observe(hero);

  init();
})();
