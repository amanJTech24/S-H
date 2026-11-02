// js/envelope.js
// ─────────────────────────────────────────────────────────────────────────
//  Envelope opening animation — tap/click to open, skip option
//  Dispatches 'envelopeOpened' event for music.js to listen to
// ─────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const screen   = document.getElementById('envelope-screen');
  const wrap     = document.getElementById('envelope-wrap');
  const mainSite = document.getElementById('main-site');
  const skipBtn  = document.getElementById('env-skip-btn');

  if (!screen || !wrap) return;

  let opened = false;

  function openEnvelope() {
    if (opened) return;
    opened = true;

    // 1. Flip the flap
    wrap.classList.add('open');

    // 2. After card rises, dismiss screen
    setTimeout(revealSite, 2200);
  }

  function revealSite() {
    screen.classList.add('hidden');
    // Remove from DOM after transition
    screen.addEventListener('transitionend', () => {
      if (screen.parentNode) screen.parentNode.removeChild(screen);
    }, { once: true });
    mainSite.removeAttribute('hidden');
    mainSite.classList.add('site-revealed');

    // Notify music.js and any other listeners
    document.dispatchEvent(new CustomEvent('envelopeOpened'));
  }

  // Interactions
  wrap.addEventListener('click',   openEnvelope);
  wrap.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEnvelope(); }
  });

  if (skipBtn) {
    skipBtn.addEventListener('click', e => {
      e.stopPropagation();
      opened = true;
      revealSite();
    });
    skipBtn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); revealSite(); }
    });
  }

  // Keyboard hint — Enter to open
  document.addEventListener('keydown', e => {
    if (!opened && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      openEnvelope();
    }
  }, { once: true });
})();
