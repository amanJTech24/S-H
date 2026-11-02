// js/car-path.js
// ─────────────────────────────────────────────────────────────────────────
//  Animated 3D decorated wedding car following a curved golden SVG path.
//  Trail draws behind it; ends in a heart. Text fades in mid-journey.
//  Triggered by IntersectionObserver. Respects prefers-reduced-motion.
//  Offscreen rendering paused automatically.
// ─────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const section  = document.getElementById('journey');
  const stage    = document.getElementById('journey-stage');
  const svgEl    = document.getElementById('journey-svg');
  const carImg   = document.getElementById('car-img');
  const greeting = document.getElementById('journey-greeting');

  if (!section || !stage || !svgEl || !carImg) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Build SVG path ────────────────────────────────────────────────────
  const VBWIDTH  = 900;
  const VBHEIGHT = 280;
  svgEl.setAttribute('viewBox', `0 0 ${VBWIDTH} ${VBHEIGHT}`);

  // Gentle S-curve road: enters left, rises, levels out right
  const PATH_D = `M -80 ${VBHEIGHT * 0.62}
    C 100 ${VBHEIGHT * 0.62}, 200 ${VBHEIGHT * 0.28}, 360 ${VBHEIGHT * 0.34}
    S 580 ${VBHEIGHT * 0.58}, 740 ${VBHEIGHT * 0.44}
    S 900 ${VBHEIGHT * 0.36}, ${VBWIDTH + 80} ${VBHEIGHT * 0.38}`;

  // Invisible path for getPointAtLength travel
  const travelPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  travelPath.setAttribute('d', PATH_D);
  travelPath.setAttribute('fill', 'none');
  travelPath.setAttribute('stroke', 'none');
  svgEl.appendChild(travelPath);

  // Background dashed road line
  const roadLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  roadLine.setAttribute('d', PATH_D);
  roadLine.setAttribute('fill', 'none');
  roadLine.setAttribute('stroke', 'rgba(184,151,90,0.18)');
  roadLine.setAttribute('stroke-width', '2');
  roadLine.setAttribute('stroke-dasharray', '8 6');
  svgEl.insertBefore(roadLine, svgEl.firstChild);

  // Solid golden trail that grows as car moves
  const drawnTrail = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  drawnTrail.setAttribute('d', PATH_D);
  drawnTrail.setAttribute('fill', 'none');
  drawnTrail.setAttribute('stroke', 'url(#trailGrad)');
  drawnTrail.setAttribute('stroke-width', '2.5');
  drawnTrail.setAttribute('stroke-linecap', 'round');
  drawnTrail.setAttribute('opacity', '0.9');
  svgEl.insertBefore(drawnTrail, svgEl.firstChild);

  // Gradient definition for trail
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <linearGradient id="trailGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${VBWIDTH}" y2="0">
      <stop offset="0%" stop-color="#B8975A" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#D4B27A" stop-opacity="1"/>
    </linearGradient>`;
  svgEl.insertBefore(defs, svgEl.firstChild);

  // Heart at end of path
  const heartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  heartGroup.setAttribute('opacity', '0');
  const heartPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  heartPath.setAttribute('fill', '#6B1A29');
  heartPath.setAttribute('stroke', '#B8975A');
  heartPath.setAttribute('stroke-width', '1.5');
  const HS = 20;
  heartPath.setAttribute('d',
    `M 0,${HS * 0.3}
     C 0,${-HS * 0.5} ${-HS},${-HS * 0.5} ${-HS},0
     C ${-HS},${HS * 0.55} 0,${HS * 0.85} 0,${HS}
     C 0,${HS * 0.85} ${HS},${HS * 0.55} ${HS},0
     C ${HS},${-HS * 0.5} 0,${-HS * 0.5} 0,${HS * 0.3} Z`
  );
  heartGroup.appendChild(heartPath);
  svgEl.appendChild(heartGroup);

  // Setup trail dash animation
  const totalLength = travelPath.getTotalLength();
  drawnTrail.style.strokeDasharray  = totalLength;
  drawnTrail.style.strokeDashoffset = totalLength;

  // ── Suspension bounce state ───────────────────────────────────────────
  let bouncePhase = 0;
  const BOUNCE_AMP  = 2.5; // px vertical bounce
  const BOUNCE_FREQ = 0.08;

  // ── Animation state ───────────────────────────────────────────────────
  let progress      = 0;
  let rafId         = null;
  let running       = false;
  let greetingShown = false;
  let isVisible     = false;

  const DURATION_MS = prefersReducedMotion ? 60 : 5000;
  let startTime     = null;

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function positionCar(len) {
    const pt  = travelPath.getPointAtLength(len);
    const pt2 = travelPath.getPointAtLength(Math.min(len + 2, totalLength));
    const dx  = pt2.x - pt.x;
    const dy  = pt2.y - pt.y;
    const ang = Math.atan2(dy, dx) * (180 / Math.PI);

    const carW = carImg.naturalWidth  > 0 ? 120 : 120;
    const carH = carImg.naturalHeight > 0 ? (120 * carImg.naturalHeight / carImg.naturalWidth) : 72;

    const stageW = stage.offsetWidth  || VBWIDTH;
    const stageH = stage.offsetHeight || VBHEIGHT;
    const scaleX = stageW / VBWIDTH;
    const scaleY = stageH / VBHEIGHT;

    const px = pt.x * scaleX - carW / 2;
    const py = pt.y * scaleY - carH / 2;

    // Suspension bounce
    const bounce = Math.sin(bouncePhase) * BOUNCE_AMP;
    bouncePhase += BOUNCE_FREQ;

    // Apply gentle tilt (30% of road angle) + bounce
    carImg.style.transform =
      `translate(${px}px, ${py + bounce}px) rotate(${ang * 0.28}deg)`;
  }

  function placeHeart() {
    const endPt  = travelPath.getPointAtLength(totalLength);
    heartGroup.setAttribute('transform',
      `translate(${endPt.x}, ${endPt.y}) scale(${(stage.offsetWidth || VBWIDTH) / VBWIDTH})`);
  }

  function animate(ts) {
    if (!isVisible) { rafId = null; running = false; return; }
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;
    progress = Math.min(elapsed / DURATION_MS, 1);
    const ep = easeInOut(progress);
    const currentLen = ep * totalLength;

    // Draw trail
    drawnTrail.style.strokeDashoffset = totalLength - currentLen;

    // Move car
    positionCar(currentLen);

    // Show greeting at 45%
    if (progress > 0.45 && !greetingShown && greeting) {
      greetingShown = true;
      greeting.classList.add('visible');
    }

    if (progress < 1) {
      rafId = requestAnimationFrame(animate);
    } else {
      // Show heart, hide car
      placeHeart();
      heartGroup.style.transition = 'opacity 0.9s ease';
      heartGroup.setAttribute('opacity', '1');
      carImg.style.opacity = '0';
      rafId   = null;
      running = false;
    }
  }

  function startAnimation() {
    if (running) return;
    running       = true;
    greetingShown = false;
    startTime     = null;
    progress      = 0;
    bouncePhase   = 0;
    drawnTrail.style.strokeDashoffset = totalLength;
    heartGroup.setAttribute('opacity', '0');
    if (greeting) greeting.classList.remove('visible');
    carImg.style.opacity    = '1';
    carImg.style.transition = 'opacity 0.5s ease';

    if (prefersReducedMotion) {
      drawnTrail.style.strokeDashoffset = 0;
      if (greeting) greeting.classList.add('visible');
      placeHeart();
      heartGroup.setAttribute('opacity', '1');
      carImg.style.opacity = '0';
      running = false;
      return;
    }

    rafId = requestAnimationFrame(animate);
  }

  // ── Observe visibility — start once, pause offscreen ──────────────────
  const io = new IntersectionObserver(entries => {
    isVisible = entries[0].isIntersecting;
    if (isVisible && !running && progress === 0) {
      startAnimation();
    } else if (!isVisible && rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
      running = false;
    }
  }, { threshold: 0.25 });
  io.observe(section);

})();
