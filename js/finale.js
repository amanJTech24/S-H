// js/finale.js
// ─────────────────────────────────────────────────────────────────────────
//  8. FINALE — NEW DESIGN
//  Romantic closing:
//  - Illuminated palace arches (palace_garden_evening.png)
//  - Soft floating petals and twinkling golden motes (Canvas particle system)
//  - Full couple names: Srishti Jain & Himanshu Jain
//  - Quote: “Your blessings, our beginning. Your presence, our joy.”
//  - Tasteful shortcuts: Venue directions, Invitation download, Add to Calendar.
//  - High contrast, readable, motion restrained, offscreen pause.
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

  const PETAL_COLORS = [
    'rgba(245, 215, 215,',
    'rgba(255, 238, 235,',
    'rgba(230, 195, 195,',
    'rgba(255, 253, 247,',
  ];

  const DUST_COLORS = [
    'rgba(222, 197, 147,',
    'rgba(255, 235, 175,',
    'rgba(199, 170, 114,',
  ];

  function rand(a, b) { return a + Math.random() * (b - a); }

  function createPetal() {
    return {
      type:    'petal',
      x:       rand(-20, W + 20),
      y:       rand(-H * 0.2, -10),
      size:    rand(5, 11),
      color:   PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      alpha:   rand(0.4, 0.75),
      speedY:  rand(0.35, 0.95),
      drift:   rand(-0.25, 0.25),
      rot:     rand(0, Math.PI * 2),
      rotSpd:  rand(-0.015, 0.015),
      sway:    rand(0.25, 0.7),
      swayT:   rand(0, Math.PI * 2),
    };
  }

  function createDust() {
    return {
      type:     'dust',
      x:        rand(0, W),
      y:        rand(H * 0.2, H + 20),
      size:     rand(1, 3.2),
      color:    DUST_COLORS[Math.floor(Math.random() * DUST_COLORS.length)],
      alpha:    rand(0.25, 0.7),
      speedY:   rand(-0.5, -0.15),
      drift:    rand(-0.12, 0.12),
      pulse:    rand(0, Math.PI * 2),
      pulseSpd: rand(0.02, 0.05),
    };
  }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = canvas.offsetWidth  || section.offsetWidth  || window.innerWidth;
    H = canvas.offsetHeight || section.offsetHeight || window.innerHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function buildParticles() {
    const petalCount = Math.min(35, Math.floor(W / 32));
    const dustCount  = Math.min(50, Math.floor(W / 22));
    particles = [
      ...Array.from({ length: petalCount }, createPetal),
      ...Array.from({ length: dustCount  }, createDust),
    ];
    particles.forEach(p => {
      p.y = rand(0, H);
    });
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    const effectiveAlpha = p.alpha * (0.8 + 0.2 * Math.sin(p.swayT));
    ctx.fillStyle = p.color + effectiveAlpha + ')';
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size * 0.55, p.size, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawDust(d) {
    const pulseFactor = 0.5 + 0.5 * Math.sin(d.pulse);
    const alpha = d.alpha * (0.5 + 0.5 * pulseFactor);
    ctx.save();
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.size * (0.8 + 0.3 * pulseFactor), 0, Math.PI * 2);
    ctx.fillStyle = d.color + alpha + ')';
    ctx.shadowColor = 'rgba(222, 197, 147, 0.8)';
    ctx.shadowBlur  = d.size * 2;
    ctx.fill();
    ctx.restore();
  }

  function step() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.type === 'petal') {
        p.swayT += 0.02;
        p.x     += Math.sin(p.swayT) * p.sway + p.drift;
        p.y     += p.speedY;
        p.rot   += p.rotSpd;
        if (p.y > H + 15) {
          particles[i] = createPetal();
        } else {
          drawPetal(p);
        }
      } else {
        p.pulse += p.pulseSpd;
        p.y     += p.speedY;
        p.x     += p.drift;
        if (p.y < -10) {
          particles[i] = createDust();
        } else {
          drawDust(p);
        }
      }
    }

    if (isVisible && !document.hidden) {
      rafId = requestAnimationFrame(step);
    }
  }

  function start() {
    if (rafId) cancelAnimationFrame(rafId);
    resize();
    buildParticles();
    rafId = requestAnimationFrame(step);
  }

  // ── Visibility Detection ──────────────────────────────────────────────
  const io = new IntersectionObserver(entries => {
    isVisible = entries[0].isIntersecting;
    if (isVisible) {
      if (!particles.length) {
        start();
      } else if (!rafId) {
        rafId = requestAnimationFrame(step);
      }
    } else {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }
  }, { threshold: 0.1 });

  io.observe(section);
  window.addEventListener('resize', () => { if (isVisible) resize(); }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    } else if (isVisible && !rafId) {
      rafId = requestAnimationFrame(step);
    }
  });

  // Shortcut Actions
  const finaleInviteBtn = document.getElementById('finale-invite-btn');
  if (finaleInviteBtn) {
    finaleInviteBtn.addEventListener('click', () => {
      const cardSec = document.getElementById('card-section');
      if (cardSec) {
        cardSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  const finaleIcsBtn = document.getElementById('finale-ics-btn');
  if (finaleIcsBtn) {
    finaleIcsBtn.addEventListener('click', () => {
      const calIcs = document.getElementById('cal-ics-btn');
      if (calIcs) calIcs.click();
    });
  }

})();
