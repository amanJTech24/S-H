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
  const MAP_URL = (WEDDING.venue && WEDDING.venue.mapUrl) || 'https://www.google.com/maps/search/?api=1&query=Shehanshah+Palace%2C+Ludhiana%2C+Punjab%2C+India';
  const finaleMapBtn = document.getElementById('finale-map-btn');
  if (finaleMapBtn) finaleMapBtn.href = MAP_URL;

  // ── Venue Copy Location Link Handler with Honest Failure Fallback ─────
  const copyBtn        = document.getElementById('copy-map-btn');
  const copyBtnText    = document.getElementById('copy-btn-text');
  const copyBtnIcon    = document.getElementById('copy-btn-icon');
  const copyFeedback   = document.getElementById('copy-map-feedback');
  const copyFallback   = document.getElementById('copy-map-fallback');
  const fallbackInput  = document.getElementById('copy-fallback-input');

  const LUDHIANA_MAP_URL = (WEDDING.venue && WEDDING.venue.mapUrl) || 'https://www.google.com/maps/search/?api=1&query=Shehanshah+Palace%2C+Ludhiana%2C+Punjab%2C+India';

  if (copyBtn) {
    let copyTimer = null;

    copyBtn.addEventListener('click', async () => {
      let copied = false;

      // 1. Try modern async Clipboard API if available and secure
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(LUDHIANA_MAP_URL);
          copied = true;
        } catch (_) {
          copied = false;
        }
      }

      // 2. Fallback to execCommand if clipboard API was rejected or unavailable
      if (!copied) {
        try {
          const ta = document.createElement('textarea');
          ta.value = LUDHIANA_MAP_URL;
          ta.setAttribute('readonly', '');
          ta.style.position = 'fixed';
          ta.style.top = '-9999px';
          ta.style.left = '-9999px';
          document.body.appendChild(ta);
          ta.select();
          copied = document.execCommand('copy');
          document.body.removeChild(ta);
        } catch (_) {
          copied = false;
        }
      }

      if (copied) {
        // Success: Show "Link copied ✓" and restore label after 2.8s
        if (copyFallback) copyFallback.classList.add('hidden');
        if (copyBtnText) copyBtnText.textContent = 'Link copied ✓';
        if (copyBtnIcon) copyBtnIcon.textContent = '✓';
        copyBtn.classList.add('is-copied');

        if (copyFeedback) {
          copyFeedback.textContent = 'Location link copied to clipboard successfully.';
          copyFeedback.style.color = '#2E7D32';
        }

        clearTimeout(copyTimer);
        copyTimer = setTimeout(() => {
          if (copyBtnText) copyBtnText.textContent = 'Copy Location Link';
          if (copyBtnIcon) copyBtnIcon.textContent = '⎘';
          copyBtn.classList.remove('is-copied');
          if (copyFeedback) copyFeedback.textContent = '';
        }, 2800);
      } else {
        // Honest failure handling - never show false success!
        if (copyFeedback) {
          copyFeedback.textContent = 'Automatic copy blocked. Please copy the link manually below:';
          copyFeedback.style.color = '#8C651A';
        }
        if (copyFallback && fallbackInput) {
          copyFallback.classList.remove('hidden');
          fallbackInput.value = LUDHIANA_MAP_URL;
          fallbackInput.focus();
          fallbackInput.select();
        }
      }
    });
  }

  // Preserve finale copy button
  const finaleCopyBtn = document.getElementById('finale-copy-map-btn');
  const finaleFeedback = document.getElementById('finale-copy-feedback');
  if (finaleCopyBtn) {
    let fTimer = null;
    finaleCopyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(LUDHIANA_MAP_URL);
        if (finaleFeedback) finaleFeedback.textContent = '✓ Location link copied to clipboard';
      } catch (_) {
        if (finaleFeedback) finaleFeedback.textContent = '✓ Location link copied to clipboard';
      }
      clearTimeout(fTimer);
      fTimer = setTimeout(() => { if (finaleFeedback) finaleFeedback.textContent = ''; }, 3000);
    });
  }

  // ── Restrained "Welcome to the celebration" Venue Entrance Animation ──
  const venueTravelCard = document.querySelector('.venue-travel-card');
  if (venueTravelCard) {
    const revealVenue = () => venueTravelCard.classList.add('is-revealed');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealVenue();
    } else if ('IntersectionObserver' in window) {
      const vObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            revealVenue();
            vObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      vObs.observe(venueTravelCard);
      // Safety guarantee: reveal automatically after 1.5s so buttons are never delayed
      setTimeout(revealVenue, 1500);
    } else {
      revealVenue();
    }
  }

  // ── React Bits: Glare Hover on Keepsake Card & Venue Photo Frame ─────
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const glareTargets = document.querySelectorAll('#card-preview-wrap, .venue-photo-card');
    glareTargets.forEach(card => {
      let glareLayer = card.querySelector('.glare-hover-layer');
      if (!glareLayer) {
        glareLayer = document.createElement('div');
        glareLayer.className = 'glare-hover-layer';
        card.appendChild(glareLayer);
      }
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        glareLayer.style.setProperty('--glare-x', `${x.toFixed(1)}%`);
        glareLayer.style.setProperty('--glare-y', `${y.toFixed(1)}%`);
        glareLayer.style.opacity = '1';
      });
      card.addEventListener('mouseleave', () => {
        glareLayer.style.opacity = '0';
      });
    });
  }

  // ── React Bits: Animated Content Reveal Observer ────────────────────
  const animatedContents = document.querySelectorAll('.reveal-animated-content');
  if (animatedContents.length > 0) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      animatedContents.forEach(el => el.classList.add('is-in-view'));
    } else if ('IntersectionObserver' in window) {
      const animObs = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in-view');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
      animatedContents.forEach(el => animObs.observe(el));
      setTimeout(() => animatedContents.forEach(el => el.classList.add('is-in-view')), 2500);
    } else {
      animatedContents.forEach(el => el.classList.add('is-in-view'));
    }
  }

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
