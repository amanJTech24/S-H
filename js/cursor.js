// js/cursor.js
// ─────────────────────────────────────────────────────────────────────────
//  Wedding Vibe Glowing Heart Ring Cursor & Sparkle Particle System
//  - Fully universal across all desktop browsers (Chrome, Edge, Firefox, Safari).
//  - Solitaire heart diamond & gold band with physical tilt follower.
//  - Real-time 60fps canvas particle trail: floating golden hearts & diamond stars.
//  - Interactive click burst: radial fireworks of glittering hearts & stardust.
//  - Cleanly detects mouse vs touch without relying on restrictive media queries.
// ─────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  // Respect user preference for reduced motion (disable particles, keep cursor lightweight)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initWeddingCursor() {
    // Prevent duplicate initialization
    if (document.getElementById('wedding-cursor-ring')) return;

    // 1. Create DOM Elements
    // ─────────────────────────────────────────────────────────────────────
    const dotEl = document.createElement('div');
    dotEl.id = 'wedding-cursor-dot';
    dotEl.className = 'wedding-cursor-dot';
    dotEl.setAttribute('aria-hidden', 'true');

    const ringEl = document.createElement('div');
    ringEl.id = 'wedding-cursor-ring';
    ringEl.className = 'wedding-cursor-ring';
    ringEl.setAttribute('aria-hidden', 'true');

    // SVG Artwork: Polished Gold Wedding Band with Sparkling Heart Diamond Solitaire
    ringEl.innerHTML = `
      <svg class="ring-svg" viewBox="-20 -20 40 40" width="42" height="42" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Rich Metallic Gold Gradient -->
          <linearGradient id="ringGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fff8dc" />
            <stop offset="25%" stop-color="#f8d57e" />
            <stop offset="60%" stop-color="#d4af37" />
            <stop offset="85%" stop-color="#997316" />
            <stop offset="100%" stop-color="#ffd978" />
          </linearGradient>

          <!-- Iridescent Diamond Heart Radial Gradient -->
          <radialGradient id="ringDiamondGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="35%" stop-color="#f0f7ff" />
            <stop offset="70%" stop-color="#bfe0ff" />
            <stop offset="100%" stop-color="#70aff3" />
          </radialGradient>

          <!-- Golden Outer Glow -->
          <filter id="ringAuraGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Soft Pulsing Outer Aura -->
        <circle cx="0" cy="2" r="14.5" class="ring-aura-circle" />

        <!-- Circular Gold Wedding Band -->
        <circle cx="0" cy="2" r="11.5" class="ring-band" stroke="url(#ringGoldGrad)" />

        <!-- Inner Edge Shadow for 3D Tubular Depth -->
        <circle cx="0" cy="2" r="9.2" fill="none" stroke="rgba(70, 45, 10, 0.45)" stroke-width="0.75" />

        <!-- Top Specular Highlight Arc -->
        <path d="M -8,5 A 11.5 11.5 0 0 1 -4,-8" fill="none" stroke="#ffffff" stroke-width="0.8" opacity="0.85" stroke-linecap="round" />

        <!-- Ornate Prong Mount at Top (12 o'clock) -->
        <path d="M -4,-8 L -2.5,-10.5 L 2.5,-10.5 L 4,-8 Z" fill="url(#ringGoldGrad)" stroke="#b8932e" stroke-width="0.5" />

        <!-- Sparkling Solitaire Heart Diamond -->
        <g class="ring-heart-solitaire" transform="translate(0, -10.5)">
          <!-- Heart Gemstone Shape -->
          <path d="M 0,-3.5 C -2.8,-7.2 -7.5,-4.8 -7.5,-1.2 C -7.5,2.8 -1.2,6.2 0,8.8 C 1.2,6.2 7.5,2.8 7.5,-1.2 C 7.5,-4.8 2.8,-7.2 0,-3.5 Z"
                fill="url(#ringDiamondGrad)" stroke="#ffffff" stroke-width="0.85" filter="url(#ringAuraGlow)" />

          <!-- Brilliant Facet Cuts -->
          <path d="M 0,-3.5 L 0,8.8 M 0,-3.5 L -4.5,-0.2 L 0,3.2 L 4.5,-0.2 Z" fill="none" stroke="rgba(255, 255, 255, 0.85)" stroke-width="0.5" />

          <!-- Radiant Diamond Sparkle Star at Heart Center -->
          <polygon points="0,-1.5 0.7,-0.2 2,0 0.7,0.2 0,1.5 -0.7,0.2 -2,0 -0.7,-0.2" fill="#ffffff" class="diamond-sparkle-center" />
        </g>
      </svg>
    `;

    // Fullscreen Particle Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'wedding-cursor-canvas';
    canvas.className = 'wedding-cursor-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    const ctx = canvas.getContext('2d');

    document.body.appendChild(canvas);
    document.body.appendChild(ringEl);
    document.body.appendChild(dotEl);

    // 2. State & Coordinates
    // ─────────────────────────────────────────────────────────────────────
    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let prevMouseX = -100;
    let prevMouseY = -100;
    let ringAngle = 0;
    let isHovering = false;
    let isClicking = false;
    let isVisible = false;
    let lastSpawnTime = 0;
    let dpr = window.devicePixelRatio || 1;

    function resizeCanvas() {
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener('resize', resizeCanvas, { passive: true });
    resizeCanvas();

    // 3. Particle System (Floating Hearts, Golden Stars & Stardust)
    // ─────────────────────────────────────────────────────────────────────
    const particles = [];
    const MAX_PARTICLES = 120;

    const GOLD_COLORS = [
      '#ffd700', // Pure gold
      '#ffe484', // Pale champagne gold
      '#e5b964', // Warm wedding gold
      '#ffffff', // Diamond white
      '#ffb8c6', // Romantic blush rose
      '#90cdf4'  // Icy sapphire sparkle
    ];

    class Particle {
      constructor(x, y, vx, vy, size, type, color, life, decay) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.type = type; // 'star' | 'heart' | 'spark' | 'ring'
        this.color = color;
        this.alpha = 1;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.12;
        this.life = life || 1;
        this.decay = decay || (0.015 + Math.random() * 0.02);
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy -= 0.025; // Gentle upward fairy float
        this.vx *= 0.98;
        this.rotation += this.rotSpeed;
        this.alpha -= this.decay;
        if (this.type === 'ring') {
          this.size += 1.8;
        }
        return this.alpha > 0;
      }

      draw(c) {
        if (this.alpha <= 0) return;
        c.save();
        c.translate(this.x, this.y);
        c.rotate(this.rotation);
        c.globalAlpha = Math.max(0, Math.min(1, this.alpha));

        if (this.type === 'heart') {
          c.fillStyle = this.color;
          c.shadowColor = this.color;
          c.shadowBlur = 6;
          c.beginPath();
          const s = this.size * 0.55;
          c.moveTo(0, s * 0.3);
          c.bezierCurveTo(-s * 0.8, -s * 0.6, -s * 1.3, s * 0.3, 0, s * 1.3);
          c.bezierCurveTo(s * 1.3, s * 0.3, s * 0.8, -s * 0.6, 0, s * 0.3);
          c.fill();
        } else if (this.type === 'star') {
          c.fillStyle = this.color;
          c.shadowColor = this.color;
          c.shadowBlur = 8;
          c.beginPath();
          const rOuter = this.size;
          const rInner = this.size * 0.25;
          for (let i = 0; i < 8; i++) {
            const rad = (i * Math.PI) / 4;
            const r = i % 2 === 0 ? rOuter : rInner;
            const px = Math.cos(rad) * r;
            const py = Math.sin(rad) * r;
            if (i === 0) c.moveTo(px, py);
            else c.lineTo(px, py);
          }
          c.closePath();
          c.fill();
        } else if (this.type === 'ring') {
          c.strokeStyle = this.color;
          c.lineWidth = 1.5;
          c.shadowColor = this.color;
          c.shadowBlur = 10;
          c.beginPath();
          c.arc(0, 0, this.size, 0, Math.PI * 2);
          c.stroke();
        } else {
          c.fillStyle = this.color;
          c.shadowColor = this.color;
          c.shadowBlur = 5;
          c.beginPath();
          c.arc(0, 0, Math.max(0.5, this.size * 0.6), 0, Math.PI * 2);
          c.fill();
        }

        c.restore();
      }
    }

    function addParticle(p) {
      if (particles.length < MAX_PARTICLES) {
        particles.push(p);
      }
    }

    function spawnTrail(x, y, speed) {
      if (prefersReducedMotion) return;
      const now = performance.now();
      const interval = speed > 10 ? 35 : 70;
      if (now - lastSpawnTime < interval) return;
      lastSpawnTime = now;

      const color = GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)];
      const roll = Math.random();

      if (roll < 0.35) {
        const vx = (Math.random() - 0.5) * 0.8;
        const vy = (Math.random() - 0.5) * 0.8 - 0.3;
        addParticle(new Particle(x, y, vx, vy, 7 + Math.random() * 4, 'heart', color, 1, 0.022));
      } else if (roll < 0.70) {
        const vx = (Math.random() - 0.5) * 1.2;
        const vy = (Math.random() - 0.5) * 1.2;
        addParticle(new Particle(x, y, vx, vy, 6 + Math.random() * 5, 'star', color, 1, 0.028));
      } else {
        const vx = (Math.random() - 0.5) * 0.6;
        const vy = (Math.random() - 0.5) * 0.6;
        addParticle(new Particle(x, y, vx, vy, 2.5 + Math.random() * 2, 'spark', color, 1, 0.035));
      }
    }

    function spawnClickBurst(x, y) {
      if (prefersReducedMotion) return;

      addParticle(new Particle(x, y, 0, 0, 6, 'ring', '#ffd700', 1, 0.03));

      const burstCount = 18;
      for (let i = 0; i < burstCount; i++) {
        const angle = (i / burstCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
        const force = 2.2 + Math.random() * 3.4;
        const vx = Math.cos(angle) * force;
        const vy = Math.sin(angle) * force - 0.5;
        const color = GOLD_COLORS[i % GOLD_COLORS.length];

        let type = 'spark';
        let size = 3.5 + Math.random() * 2.5;

        if (i % 3 === 0) {
          type = 'heart';
          size = 8 + Math.random() * 4;
        } else if (i % 3 === 1) {
          type = 'star';
          size = 8 + Math.random() * 4;
        }

        addParticle(new Particle(x, y, vx, vy, size, type, color, 1, 0.018 + Math.random() * 0.012));
      }
    }

    // 4. Pointer / Mouse Event Listeners
    // ─────────────────────────────────────────────────────────────────────
    function handlePointerMove(clientX, clientY, pointerType) {
      // If pure touch gesture on phone/tablet, hide custom cursor
      if (pointerType === 'touch') {
        document.body.classList.add('touch-active');
        document.body.classList.remove('custom-cursor-enabled');
        dotEl.style.opacity = '0';
        ringEl.style.opacity = '0';
        isVisible = false;
        return;
      }

      // Mouse or trackpad movement confirmed
      document.body.classList.remove('touch-active');
      document.body.classList.add('custom-cursor-enabled');

      if (!isVisible) {
        isVisible = true;
        dotEl.style.opacity = '1';
        ringEl.style.opacity = '1';
      }

      prevMouseX = mouseX;
      prevMouseY = mouseY;
      mouseX = clientX;
      mouseY = clientY;

      // Position center dot immediately
      dotEl.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

      const dx = mouseX - prevMouseX;
      const dy = mouseY - prevMouseY;
      const speed = Math.hypot(dx, dy);

      if (speed > 1) {
        const targetTilt = Math.max(-25, Math.min(25, dx * 1.1));
        ringAngle += (targetTilt - ringAngle) * 0.15;
      } else {
        ringAngle *= 0.9;
      }

      spawnTrail(mouseX, mouseY, speed);
    }

    // Listen on both pointermove and mousemove for absolute compatibility across Chrome versions
    window.addEventListener('pointermove', e => {
      handlePointerMove(e.clientX, e.clientY, e.pointerType);
    }, { passive: true });

    window.addEventListener('mousemove', e => {
      handlePointerMove(e.clientX, e.clientY, 'mouse');
    }, { passive: true });

    window.addEventListener('pointerdown', e => {
      if (e.pointerType === 'touch') return;
      isClicking = true;
      ringEl.classList.add('is-clicking');
      spawnClickBurst(e.clientX, e.clientY);
    });

    window.addEventListener('mousedown', e => {
      isClicking = true;
      ringEl.classList.add('is-clicking');
      spawnClickBurst(e.clientX, e.clientY);
    });

    window.addEventListener('pointerup', () => {
      isClicking = false;
      ringEl.classList.remove('is-clicking');
    });

    window.addEventListener('mouseup', () => {
      isClicking = false;
      ringEl.classList.remove('is-clicking');
    });

    document.addEventListener('mouseleave', () => {
      isVisible = false;
      dotEl.style.opacity = '0';
      ringEl.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
      if (!document.body.classList.contains('touch-active')) {
        isVisible = true;
        dotEl.style.opacity = '1';
        ringEl.style.opacity = '1';
      }
    });

    // Handle touch start gracefully (mobile safety)
    window.addEventListener('touchstart', () => {
      document.body.classList.add('touch-active');
      document.body.classList.remove('custom-cursor-enabled');
      dotEl.style.opacity = '0';
      ringEl.style.opacity = '0';
      isVisible = false;
    }, { passive: true });

    // Hover detection for interactive targets
    const INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, select, textarea, .envelope-stationery, .calendar-day, .btn-gold, .btn-luminous, .btn-ocean';

    document.addEventListener('mouseover', e => {
      if (e.target.closest && e.target.closest(INTERACTIVE_SELECTOR)) {
        isHovering = true;
        ringEl.classList.add('is-hovering');
        dotEl.classList.add('is-hovering');
      }
    });

    document.addEventListener('mouseout', e => {
      if (e.target.closest && e.target.closest(INTERACTIVE_SELECTOR)) {
        isHovering = false;
        ringEl.classList.remove('is-hovering');
        dotEl.classList.remove('is-hovering');
      }
    });

    // 5. 60 FPS Render Loop (Smooth Lerp + Particle Canvas)
    // ─────────────────────────────────────────────────────────────────────
    function animate() {
      requestAnimationFrame(animate);

      if (!isVisible) {
        if (particles.length > 0) {
          ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
          for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            if (!p.update()) particles.splice(i, 1);
            else p.draw(ctx);
          }
        }
        return;
      }

      if (ringX < 0) {
        ringX = mouseX;
        ringY = mouseY;
      }

      const lerpFactor = isHovering ? 0.22 : 0.16;
      ringX += (mouseX - ringX) * lerpFactor;
      ringY += (mouseY - ringY) * lerpFactor;

      const scale = isClicking ? 0.85 : (isHovering ? 1.35 : 1);
      ringEl.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${scale}) rotate(${ringAngle}deg)`;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (!p.update()) {
          particles.splice(i, 1);
        } else {
          p.draw(ctx);
        }
      }
    }

    requestAnimationFrame(animate);
  }

  // Safely initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWeddingCursor);
  } else {
    initWeddingCursor();
  }

})();