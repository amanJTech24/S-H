// js/envelope.js
// ─────────────────────────────────────────────────────────────────────────
//  Luxury Wedding Envelope Opening Interaction
//  Palette: Pearl white, powder blue & icy silver.
//  - Tap/click or press Enter on envelope/seal to open.
//  - Seal catches glint of light & lifts.
//  - Triangular flap rotates upward from top crease (180deg).
//  - Ivory liner with blue floral pattern fills screen & dissolves into palace hero over ~1.6s.
//  - Starts background music gently, respecting guest mute setting.
//  - Once per session (sessionStorage) + discreet "Skip intro" link.
// ─────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const screen   = document.getElementById('envelope-screen');
  const wrap     = document.getElementById('envelope-wrap');
  const mainSite = document.getElementById('main-site');
  const skipBtn  = document.getElementById('env-skip-btn');

  if (!screen || !wrap) return;

  const SESSION_KEY = 'wedding_intro_seen';
  let opened = false;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Immediate site reveal (for session bypass, skip button, or ?skip=1)
  function revealSiteImmediate() {
    opened = true;
    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch (_) {}

    screen.classList.add('hidden');
    if (screen.parentNode) {
      screen.parentNode.removeChild(screen);
    }

    if (mainSite) {
      mainSite.removeAttribute('hidden');
      mainSite.classList.add('site-revealed');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    // Trigger audio controller if user gesture occurred
    document.dispatchEvent(new CustomEvent('envelopeOpened'));
  }

  // Smooth cinematic opening interaction
  function openEnvelope() {
    if (opened) return;
    opened = true;

    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch (_) {}

    // Start background music gently on gesture
    document.dispatchEvent(new CustomEvent('envelopeOpened'));

    if (prefersReducedMotion) {
      screen.classList.add('hidden');
      setTimeout(revealSiteImmediate, 450);
      return;
    }

    // Step 1: Seal catches glint of light and lifts
    screen.classList.add('envelope-opening');
    wrap.classList.add('envelope-opening');

    // Step 2: Triangular flap rotates upward from its top crease
    setTimeout(() => {
      wrap.classList.add('envelope-opened');
    }, 280);

    // Step 3: Ivory floral liner expands to fill the screen and dissolve into palace hero
    setTimeout(() => {
      screen.classList.add('liner-filling');
      screen.classList.add('liner-expanding');

      if (mainSite) {
        mainSite.removeAttribute('hidden');
        mainSite.classList.add('site-revealed');
      }
    }, 700);

    // Step 4: Complete transition into palace hero over ~1.6s
    setTimeout(() => {
      screen.classList.add('hidden');

      setTimeout(() => {
        if (screen.parentNode) {
          screen.parentNode.removeChild(screen);
        }
      }, 850);
    }, 1600);
  }

  // Entire envelope is tappable and keyboard-accessible
  wrap.addEventListener('click', openEnvelope);
  wrap.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openEnvelope();
    }
  });

  // Skip intro link
  if (skipBtn) {
    skipBtn.addEventListener('click', e => {
      e.stopPropagation();
      revealSiteImmediate();
    });
    skipBtn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        revealSiteImmediate();
      }
    });
  }

  // Escape key acts as skip
  document.addEventListener('keydown', e => {
    if (!opened && e.key === 'Escape') {
      e.preventDefault();
      revealSiteImmediate();
    }
  });

  // Global enter/space keypress opens envelope if not already opened
  document.addEventListener('keydown', e => {
    if (!opened && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      openEnvelope();
    }
  }, { once: true });

  // Test state: view envelope open (?state=open or ?flap=open)
  if (window.location.search.includes('flap=open') || window.location.search.includes('test=open')) {
    wrap.classList.add('envelope-opened');
  }

  // Auto-skip if already viewed in this session or if requested via URL
  const hasSeenIntro = (() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === 'true';
    } catch (_) {
      return false;
    }
  })();

  if (hasSeenIntro || window.location.search.includes('skip=1') || window.location.search.includes('open=1')) {
    revealSiteImmediate();
  }

})();
