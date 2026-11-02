// js/finale.js
// ─────────────────────────────────────────────────────────────────────────
//  Palace garden finale section:
//  - Romantic particle system: drifting petals + golden dust particles
//  - Canvas-based, IntersectionObserver paused offscreen
//  - Respects prefers-reduced-motion
// ─────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const section = document.getElementById('finale-section');
  const canvas  = document.getElementById('finale-canvas');
  if (!section || !canvas) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const ctx = canvas.getContext('2d');
  let W, H, dpr;
  let particles = [];
  let rafId = null;
  let isVisible = false;

  // ── Particle factory ──────────────────────────────────────────────────
  const PETAL_COLORS = [
    'rgba(220,160,160,',
    'rgba(245,200,200,',
    'rgba(255,230,225,',
    'rgba(210,140,140,',
    'rgba(245,215,195,',
  ];

  const DUST_COLORS = [
    'rgba(212,178,122,',
    'rgba(240,220,160,',
    'rgba(184,151,90,',
  ];

  function rand(a, b) { return a + Math.random() * (b - a); }

  function createPetal() {
    return {
      type:    'petal',
      x:       rand(-20, W + 20),
      y:       rand(-H * 0.3, -10),
      size:    rand(5, 12),
      color:   PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      alpha:   rand(0.4, 0.8),
      speedY:  rand(0.4, 1.2),
      drift:   rand(-0.3, 0.3),
      rot:     rand(0, Math.PI * 2),
      rotSpd:  rand(-0.018, 0.018),
      sway:    rand(0.3, 0.8),
      swayT:   rand(0, Math.PI * 2),
    };
  }

  function createDust() {
    return {
      type:   'dust',
      x:      rand(0, W),
      y:      rand(H * 0.3, H + 20),
      size:   rand(1, 3.5),
      color:  DUST_COLORS[Math.floor(Math.random() * DUST_COLORS.length)],
      alpha:  rand(0.2, 0.6),
      speedY: rand(-0.6, -0.15),  // float upward
      drift:  rand(-0.15, 0.15),
      pulse:  rand(0, Math.PI * 2),
      pulseSpd: rand(0.02, 0.06),
    };
  }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = canvas.offsetWidth  || section.offsetWidth;
    H = canvas.offsetHeight || section.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function buildParticles() {
    const petalCount = Math.min(40, Math.floor(W / 30));
    const dustCount  = Math.min(60, Math.floor(W / 20));
    particles = [
      ...Array.from({ length: petalCount }, createPetal),
      ...Array.from({ length: dustCount  }, createDust),
    ];
    // Spread initial Y
    particles.forEach(p => {
      if (p.type === 'petal') p.y = rand(-H * 0.1, H);
      else                    p.y = rand(0, H);
    });
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color + p.alpha + ')';
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size * 0.42, p.size * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
    // Subtle highlight vein
    ctx.beginPath();
    ctx.moveTo(0, -p.size * 0.65);
    ctx.lineTo(0, p.size * 0.65);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth   = 0.6;
    ctx.stroke();
    ctx.restore();
  }

  function drawDust(p) {
    const pulseAlpha = p.alpha + Math.sin(p.pulse) * 0.15;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, pulseAlpha));
    ctx.fillStyle   = p.color + Math.max(0, Math.min(1, pulseAlpha)) + ')';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    // Soft glow
    const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
    grd.addColorStop(0, p.color + (pulseAlpha * 0.3) + ')');
    grd.addColorStop(1, p.color + '0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function tick() {
    if (!isVisible) { rafId = null; return; }
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      if (p.type === 'petal') {
        p.swayT += 0.012;
        p.x     += p.drift + Math.sin(p.swayT) * p.sway;
        p.y     += p.speedY;
        p.rot   += p.rotSpd;
        if (p.y > H + 20) {
          Object.assign(p, createPetal(), { y: rand(-30, -5), x: rand(0, W) });
        }
        drawPetal(p);
      } else {
        p.pulse += p.pulseSpd;
        p.x += p.drift;
        p.y += p.speedY;
        if (p.y < -20) {
          Object.assign(p, createDust(), { y: H + 20, x: rand(0, W) });
        }
        drawDust(p);
      }
    });

    rafId = requestAnimationFrame(tick);
  }

  // ── IntersectionObserver ──────────────────────────────────────────────
  const io = new IntersectionObserver(entries => {
    isVisible = entries[0].isIntersecting;
    if (isVisible && !rafId) {
      rafId = requestAnimationFrame(tick);
    } else if (!isVisible && rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }, { threshold: 0.1 });

  // ── Init ──────────────────────────────────────────────────────────────
  const ro = new ResizeObserver(() => {
    resize();
    buildParticles();
  });
  ro.observe(section);

  resize();
  buildParticles();
  io.observe(section);

  // Wire up the "Save the Date" ICS button in finale section
  const finaleIcsBtn = document.getElementById('finale-ics-btn');
  if (finaleIcsBtn) {
    finaleIcsBtn.addEventListener('click', () => {
      const mainIcsBtn = document.getElementById('ics-download-btn');
      if (mainIcsBtn) mainIcsBtn.click();
    });
  }

})();
