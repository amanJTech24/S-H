// js/app.js
// ─────────────────────────────────────────────────────────────────────────
//  Main Application Initialiser
//  - Populate text from WEDDING config
//  - Staggered Intersection Observer for fade-up animations
//  - Copy location link fallback with feedback
//  - Keyboard accessibility & skip link
// ─────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  if (typeof WEDDING === 'undefined') {
    console.error('WEDDING config not loaded');
    return;
  }

  function showOrPending(id, value, pendingText) {
    const el = document.getElementById(id);
    if (!el) return;
    if (value) {
      el.textContent = value;
      el.classList.remove('detail-pending');
    } else {
      el.textContent = pendingText || 'Details Pending';
      el.classList.add('detail-pending');
    }
  }

  // Populate Venue Details (Confirmed Venue: Shehanshah Palace)
  showOrPending('detail-venue-name', WEDDING.venue && WEDDING.venue.name, 'Shehanshah Palace');

  // Verify and set directions link
  const MAP_URL = (WEDDING.venue && WEDDING.venue.mapUrl) || 'https://maps.app.goo.gl/DZTHWSUSbHaPdhuF6';
  ['venue-map-btn', 'finale-map-btn'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.href = MAP_URL;
  });

  // Copy Location Link Fallback (Venue Section & Finale Section)
  const MAP_DIRECT_URL = 'https://www.google.com/maps/search/?api=1&query=Shehanshah+Palace';

  function setupCopyButton(btnId, feedbackId) {
    const btn = document.getElementById(btnId);
    const feedback = document.getElementById(feedbackId);
    if (!btn) return;
    let timeout = null;

    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(MAP_URL);
        showMsg('✓ Location link copied to clipboard');
      } catch (err) {
        const ta = document.createElement('textarea');
        ta.value = MAP_URL;
        ta.style.position = 'fixed';
        ta.style.opacity  = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showMsg('✓ Location link copied to clipboard');
      }
    });

    function showMsg(msg) {
      if (!feedback) return;
      feedback.textContent = msg;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        feedback.textContent = '';
      }, 3200);
    }
  }

  setupCopyButton('copy-map-btn', 'copy-map-feedback');
  setupCopyButton('finale-copy-map-btn', 'finale-copy-feedback');

  // ── Romantic Floating Canvas for Section 2 (Family Invitation) ─────────
  const romanceCanvas = document.getElementById('romance-canvas');
  if (romanceCanvas) {
    const rCtx = romanceCanvas.getContext('2d');
    let rW, rH;
    const rParticles = [];

    function resizeRomance() {
      const invSec = document.getElementById('invitation');
      if (!invSec) return;
      rW = romanceCanvas.width = invSec.offsetWidth;
      rH = romanceCanvas.height = invSec.offsetHeight;
    }
    resizeRomance();
    window.addEventListener('resize', resizeRomance, { passive: true });

    for (let i = 0; i < 24; i++) {
      rParticles.push({
        x: Math.random() * (rW || 800),
        y: Math.random() * (rH || 600),
        size: 8 + Math.random() * 12,
        speedY: 0.3 + Math.random() * 0.6,
        drift: -0.3 + Math.random() * 0.6,
        rot: Math.random() * Math.PI * 2,
        rotSpd: -0.01 + Math.random() * 0.02,
        alpha: 0.15 + Math.random() * 0.35,
        type: Math.random() > 0.4 ? 'petal' : 'heart',
      });
    }

    function renderRomance() {
      rCtx.clearRect(0, 0, rW, rH);
      for (const p of rParticles) {
        p.y += p.speedY;
        p.x += p.drift;
        p.rot += p.rotSpd;
        if (p.y > rH + 20) { p.y = -20; p.x = Math.random() * rW; }
        if (p.x < -20) p.x = rW + 20;
        if (p.x > rW + 20) p.x = -20;

        rCtx.save();
        rCtx.translate(p.x, p.y);
        rCtx.rotate(p.rot);
        if (p.type === 'heart') {
          rCtx.fillStyle = `rgba(199, 170, 114, ${p.alpha * 0.6})`;
          rCtx.font = `${p.size}px serif`;
          rCtx.fillText('♥', 0, 0);
        } else {
          rCtx.fillStyle = `rgba(240, 195, 200, ${p.alpha * 0.5})`;
          rCtx.beginPath();
          rCtx.ellipse(0, 0, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
          rCtx.fill();
        }
        rCtx.restore();
      }
      requestAnimationFrame(renderRomance);
    }
    requestAnimationFrame(renderRomance);
  }

  // ── Interactive Shower Blessings Button (Section 2) ───────────────────
  const sendBlessingBtn = document.getElementById('send-blessing-btn');
  const blessingToast   = document.getElementById('blessing-toast');
  if (sendBlessingBtn) {
    let blessingCount = 0;
    sendBlessingBtn.addEventListener('click', (e) => {
      blessingCount++;
      const messages = [
        'Thank you for showering your blessings! ♡',
        'With your love and presence, our journey is complete! ✨',
        'Your warmest hugs and prayers mean the world to us! 🌸',
        'Srishti & Himanshu are blessed to have you in their lives! 💍'
      ];
      if (blessingToast) {
        blessingToast.textContent = messages[blessingCount % messages.length];
        blessingToast.style.opacity = '1';
        setTimeout(() => {
          if (blessingToast) blessingToast.style.opacity = '0.9';
        }, 3500);
      }

      // Spawn floating hearts from button
      const rect = sendBlessingBtn.getBoundingClientRect();
      for (let i = 0; i < 12; i++) {
        const h = document.createElement('div');
        h.className = 'interactive-floating-heart';
        h.textContent = ['♥', '🌸', '✨', '✦', '💍'][Math.floor(Math.random() * 5)];
        h.style.left = (rect.left + rect.width / 2 + (Math.random() * 80 - 40)) + 'px';
        h.style.top  = (rect.top + window.scrollY) + 'px';
        h.style.setProperty('--dx', `${(Math.random() - 0.5) * 140}px`);
        h.style.setProperty('--dy', `${-120 - Math.random() * 120}px`);
        document.body.appendChild(h);
        setTimeout(() => h.remove(), 1600);
      }
    });
  }

  // Staggered Fade-Up Observer
  const fadeElements = document.querySelectorAll('.fade-up');
  if ('IntersectionObserver' in window) {
    const fadeObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '50px 0px 50px 0px' });

    fadeElements.forEach(el => fadeObserver.observe(el));
  } else {
    fadeElements.forEach(el => el.classList.add('visible'));
  }

  function checkFade() {
    const vh = window.innerHeight || 900;
    fadeElements.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < vh + 300 && r.bottom > -300) {
        el.classList.add('visible');
      }
    });
  }
  window.addEventListener('scroll', checkFade, { passive: true });
  window.addEventListener('load', checkFade);
  checkFade();
  setTimeout(checkFade, 50);
  setTimeout(checkFade, 300);

  function scrollToTarget() {
    const urlParams = new URLSearchParams(window.location.search);
    const targetScroll = urlParams.get('scroll') || window.location.hash.replace('#', '');
    if (targetScroll) {
      const targetSec = document.getElementById(targetScroll);
      if (targetSec) {
        targetSec.scrollIntoView({ behavior: 'instant', block: 'start' });
        targetSec.classList.add('visible');
        targetSec.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
        checkFade();
      }
    }
  }
  window.addEventListener('load', scrollToTarget);
  setTimeout(scrollToTarget, 100);
  setTimeout(scrollToTarget, 400);

})();
