// js/app.js
// ─────────────────────────────────────────────────────────────────────────
//  Main application initialiser
//  - Populate text from WEDDING config
//  - Intersection Observer for fade-up animations
//  - Copy map link button
//  - Download wedding details PDF
//  - Finale ICS button wiring
// ─────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  if (typeof WEDDING === 'undefined') {
    console.error('WEDDING config not loaded');
    return;
  }

  // ── Populate dynamic text ─────────────────────────────────────────────
  function setText(id, text) {
    const el = document.getElementById(id);
    if (el && text) el.textContent = text;
  }

  function showOrPending(id, value, pendingText) {
    const el = document.getElementById(id);
    if (!el) return;
    if (value) {
      el.textContent = value;
      el.classList.remove('detail-pending');
    } else {
      el.textContent  = pendingText || 'Details Pending';
      el.classList.add('detail-pending');
    }
  }

  // Venue name
  showOrPending('detail-venue-name', WEDDING.venue && WEDDING.venue.name, 'Venue details will be announced soon');
  // Time
  showOrPending('detail-time', WEDDING.time, 'Timings to be announced');

  // Map links
  const MAP_URL = (WEDDING.venue && WEDDING.venue.mapUrl) || 'https://maps.app.goo.gl/sGMF5VTTgQhBbkMn8';
  ['venue-map-btn', 'finale-map-btn'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.href = MAP_URL;
  });

  // Journey greeting text
  const jGreeting = document.getElementById('journey-greeting');
  if (jGreeting) jGreeting.textContent = WEDDING.wording.journey;

  // ── Copy Map Link ─────────────────────────────────────────────────────
  const copyMapBtn      = document.getElementById('copy-map-btn');
  const copyMapFeedback = document.getElementById('copy-map-feedback');
  let   copyTimeout     = null;

  if (copyMapBtn) {
    copyMapBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(MAP_URL);
        if (copyMapFeedback) {
          copyMapFeedback.textContent = '✓ Map link copied to clipboard';
          clearTimeout(copyTimeout);
          copyTimeout = setTimeout(() => {
            copyMapFeedback.textContent = '';
          }, 3000);
        }
      } catch (e) {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = MAP_URL;
        ta.style.position = 'fixed';
        ta.style.opacity  = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        if (copyMapFeedback) {
          copyMapFeedback.textContent = '✓ Copied!';
          clearTimeout(copyTimeout);
          copyTimeout = setTimeout(() => {
            copyMapFeedback.textContent = '';
          }, 3000);
        }
      }
    });
  }

  // ── Download Wedding Details PDF ──────────────────────────────────────
  // Generates a beautiful, phone-friendly wedding details card as HTML/print
  const detailsPdfBtn = document.getElementById('details-pdf-btn');
  if (detailsPdfBtn) {
    detailsPdfBtn.addEventListener('click', () => {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Srishti & Himanshu — Wedding Details</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Cinzel:wght@400;500&family=Great+Vibes&display=swap');
@page { size: A5 portrait; margin: 12mm 10mm; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Cormorant Garamond', Georgia, serif;
  background: #FBF7F0;
  color: #2C1810;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.page {
  width: 128mm;
  margin: 0 auto;
  padding: 8mm 0;
}
.border-frame {
  border: 1px solid rgba(184,151,90,0.4);
  border-radius: 3px;
  padding: 8mm 10mm;
  position: relative;
}
.border-frame::before,
.border-frame::after {
  content: '✦';
  position: absolute;
  color: rgba(184,151,90,0.5);
  font-size: 10pt;
}
.border-frame::before { top: 3mm; left: 3mm; }
.border-frame::after  { bottom: 3mm; right: 3mm; }
.top-ornament {
  text-align: center;
  color: #B8975A;
  font-size: 12pt;
  margin-bottom: 4mm;
  letter-spacing: 0.3em;
}
.eyebrow {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 6.5pt;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #B8975A;
  text-align: center;
  display: block;
  margin-bottom: 2mm;
}
.couple-names {
  font-family: 'Great Vibes', cursive;
  font-size: 30pt;
  color: #6B1A29;
  text-align: center;
  line-height: 1.1;
  display: block;
  margin-bottom: 1mm;
}
.couple-names .amp {
  font-size: 0.55em;
  color: #B8975A;
}
.divider {
  display: block;
  text-align: center;
  color: rgba(184,151,90,0.6);
  margin: 3mm 0;
  font-size: 9pt;
  letter-spacing: 0.5em;
}
.invite-text {
  font-style: italic;
  color: #6B4C3B;
  text-align: center;
  font-size: 10pt;
  line-height: 1.6;
  margin-bottom: 4mm;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin: 3mm 0;
}
td {
  padding: 3mm 2mm;
  border-bottom: 1px solid rgba(184,151,90,0.15);
  vertical-align: top;
  font-size: 9.5pt;
}
td:first-child {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 6pt;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #9A7B6A;
  width: 22mm;
  padding-top: 4mm;
}
tr:last-child td { border-bottom: none; }
.pending {
  font-style: italic;
  color: #9A7B6A;
  font-size: 8.5pt;
}
.map-url {
  font-size: 7.5pt;
  color: #6B1A29;
  word-break: break-all;
}
.closing {
  font-family: 'Great Vibes', cursive;
  font-size: 20pt;
  color: #6B1A29;
  text-align: center;
  margin: 4mm 0 2mm;
  display: block;
}
.bottom-note {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 6pt;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(184,151,90,0.8);
  text-align: center;
  margin-top: 3mm;
}
@media print {
  body { background: #FBF7F0; }
}
</style>
</head>
<body>
<div class="page">
  <div class="border-frame">

    <div class="top-ornament">✦ &nbsp; ✦ &nbsp; ✦</div>
    <span class="eyebrow">Wedding Invitation</span>

    <span class="couple-names">
      Srishti <span class="amp">&amp;</span> Himanshu
    </span>
    <span class="eyebrow" style="margin-top:1mm;">Jain</span>

    <span class="divider">― ― ―</span>

    <p class="invite-text">
      With the blessings of our families, we joyfully invite you<br>
      to celebrate our wedding.
    </p>

    <table>
      <tr>
        <td>Date</td>
        <td><strong>Saturday, 5 December 2026</strong></td>
      </tr>
      <tr>
        <td>Time</td>
        <td class="pending">Timings to be announced</td>
      </tr>
      <tr>
        <td>Venue</td>
        <td class="pending">Details to be announced</td>
      </tr>
      <tr>
        <td>Location</td>
        <td>Rajasthan, India</td>
      </tr>
      <tr>
        <td>Directions</td>
        <td><span class="map-url">maps.app.goo.gl/sGMF5VTTgQhBbkMn8</span></td>
      </tr>
    </table>

    <span class="divider">― ― ―</span>

    <span class="closing">With Love</span>

    <p class="bottom-note">Srishti &amp; Himanshu · 5 December 2026 · Rajasthan, India</p>
  </div>
</div>
<script>
  window.addEventListener('load', function() {
    setTimeout(function() { window.print(); }, 500);
  });
<\/script>
</body>
</html>`;

      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url  = URL.createObjectURL(blob);
      const win  = window.open(url, '_blank');
      if (!win) {
        const a  = document.createElement('a');
        a.href   = url;
        a.download = 'Srishti-Himanshu-Wedding-Details.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    });
  }

  // ── Finale ICS button ─────────────────────────────────────────────────
  const finaleIcsBtn = document.getElementById('finale-ics-btn');
  if (finaleIcsBtn) {
    finaleIcsBtn.addEventListener('click', () => {
      if (window._weddingDownloadICS) window._weddingDownloadICS();
    });
  }

  // ── Intersection Observer — fade-up ────────────────────────────────────
  const fadeEls = document.querySelectorAll('.fade-up');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, {
      threshold:  0.12,
      rootMargin: '0px 0px -30px 0px',
    });
    fadeEls.forEach(el => io.observe(el));
  } else {
    fadeEls.forEach(el => el.classList.add('in-view'));
  }

  // ── Reduced motion: reveal everything immediately ──────────────────────
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    fadeEls.forEach(el => el.classList.add('in-view'));
  }

  // ── Stagger child fade-ups ─────────────────────────────────────────────
  document.querySelectorAll('[data-stagger]').forEach(parent => {
    const children = parent.querySelectorAll('.fade-up');
    children.forEach((child, i) => {
      child.style.transitionDelay = `${i * 0.12}s`;
    });
  });

  // ── Active nav highlight ───────────────────────────────────────────────
  const sections = document.querySelectorAll('[data-section]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (navLinks.length && sections.length) {
    const sectionIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.dataset.section;
          navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.target === id);
          });
        }
      });
    }, { threshold: 0.4 });
    sections.forEach(s => sectionIO.observe(s));
  }

  // ── Skip to main link (accessibility) ────────────────────────────────
  const skipLink = document.getElementById('skip-to-main');
  if (skipLink) {
    skipLink.addEventListener('click', e => {
      e.preventDefault();
      const main = document.getElementById('main-site');
      if (main) { main.setAttribute('tabindex', '-1'); main.focus(); }
    });
  }

})();
