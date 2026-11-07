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

  // ── Refined Shower Blessings Interaction (Section 1: Open Letter) ────
  const sendBlessingBtn = document.getElementById('send-blessing-btn');
  const blessingToast   = document.getElementById('blessing-toast');
  if (sendBlessingBtn) {
    let blessingCount = 0;
    sendBlessingBtn.addEventListener('click', () => {
      blessingCount++;
      const messages = [
        'Thank you for showering your blessings! Srishti & Himanshu feel truly blessed. ♡',
        'With your love and presence, our beginning is complete! ✨',
        'Your warmest hugs and prayers mean the world to us! 🌸',
        'Thank you for being part of our happiest celebration! 💍'
      ];
      if (blessingToast) {
        blessingToast.textContent = messages[blessingCount % messages.length];
        blessingToast.style.opacity = '1';
        setTimeout(() => {
          if (blessingToast) blessingToast.style.opacity = '0.9';
        }, 4000);
      }

      // One brief burst of soft white & powder-blue petals below the button (never covering letter text)
      const rect = sendBlessingBtn.getBoundingClientRect();
      for (let i = 0; i < 16; i++) {
        const petal = document.createElement('div');
        petal.className = 'blessing-silk-petal';
        const isBlue = i % 2 === 0;
        petal.style.cssText = `
          position: fixed;
          width: ${10 + Math.random() * 8}px;
          height: ${14 + Math.random() * 10}px;
          border-radius: 50% 10% 50% 50%;
          background: ${isBlue ? 'linear-gradient(135deg, #CBE0F5, #8BB4D9)' : 'linear-gradient(135deg, #FFFFFF, #F0F4F8)'};
          border: 1px solid ${isBlue ? 'rgba(139, 180, 217, 0.4)' : 'rgba(213, 228, 242, 0.6)'};
          box-shadow: 0 2px 6px rgba(25, 59, 85, 0.08);
          left: ${rect.left + rect.width / 2 + (Math.random() * 40 - 20)}px;
          top: ${rect.bottom - 10}px;
          pointer-events: none;
          z-index: 99;
          opacity: 0.95;
          transform: rotate(${Math.random() * 360}deg);
          transition: transform 1.2s cubic-bezier(0.2, 0.8, 0.3, 1), opacity 1.2s ease;
        `;
        document.body.appendChild(petal);

        const dx = (Math.random() - 0.5) * 160;
        const dy = 40 + Math.random() * 110;
        const rot = (Math.random() - 0.5) * 240;

        requestAnimationFrame(() => {
          petal.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(0.85)`;
          petal.style.opacity = '0';
        });

        setTimeout(() => petal.remove(), 1250);
      }
    });
  }

  // ── Keepsake Card Tap-To-Enlarge Lightbox Modal ───────────────────────
  const cardPreviewWrap  = document.getElementById('card-preview-wrap');
  const cardLightbox     = document.getElementById('card-lightbox');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const lightboxOverlay  = document.getElementById('lightbox-close-overlay');

  function openCardLightbox() {
    if (cardLightbox) cardLightbox.classList.remove('hidden');
  }
  function closeCardLightbox() {
    if (cardLightbox) cardLightbox.classList.add('hidden');
  }

  if (cardPreviewWrap) {
    cardPreviewWrap.addEventListener('click', openCardLightbox);
    cardPreviewWrap.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCardLightbox();
      }
    });
  }
  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeCardLightbox);
  if (lightboxOverlay)  lightboxOverlay.addEventListener('click', closeCardLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cardLightbox && !cardLightbox.classList.contains('hidden')) {
      closeCardLightbox();
    }
  });

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
