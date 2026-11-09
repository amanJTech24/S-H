// js/calendar.js
// ─────────────────────────────────────────────────────────────────────────
//  4. CALENDAR — Journey version only
//  - December 2026 calendar (Dec 1 = Tuesday, Dec 5 = Saturday).
//  - Searching / jumping heart animation finishes on Saturday, 5 December.
//  - Starts ONLY when calendar stage is substantially visible for 500ms.
//  - Independent playback state, offscreen pause/resume and replay.
//  - Reduced-motion mode shows final highlighted date immediately.
//  - Valid all-day calendar download (.ics & Google Calendar).
//  - Separate wedding-details PDF download.
// ─────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const section    = document.getElementById('calendar-section');
  const cardEl     = document.getElementById('calendar-card');
  const gridEl     = document.getElementById('cal-grid');
  const replayBtn  = document.getElementById('cal-replay-btn');
  const icsBtn     = document.getElementById('cal-ics-btn');
  const gcalBtn    = document.getElementById('cal-gcal-btn');
  const pdfBtn     = document.getElementById('cal-pdf-btn');

  if (!gridEl) return;

  const START_DOW   = 2;  // Dec 1, 2026 is Tuesday (Sun=0)
  const DAYS_IN_DEC = 31;
  const TARGET_DAY  = 5;  // Saturday, 5 December 2026

  const cells = [];
  let heartEl = null;

  function buildGrid() {
    gridEl.innerHTML = '';
    cells.length = 0;

    // Leading empty cells
    for (let i = 0; i < START_DOW; i++) {
      const el = document.createElement('div');
      el.className = 'cal-cell empty';
      el.setAttribute('aria-hidden', 'true');
      gridEl.appendChild(el);
      cells.push({ el, day: null });
    }

    // Day cells (1 - 31)
    for (let d = 1; d <= DAYS_IN_DEC; d++) {
      const el = document.createElement('div');
      el.className = 'cal-cell';
      el.textContent = d;
      el.setAttribute('aria-label', `December ${d}, 2026`);
      if (d === TARGET_DAY) {
        el.classList.add('target-day');
      }
      gridEl.appendChild(el);
      cells.push({ el, day: d });
    }

    // Setup heart marker with '5' prominently shown inside it
    if (!heartEl) {
      heartEl = document.createElement('div');
      heartEl.id = 'cal-heart-marker';
      heartEl.className = 'cal-heart-marker';
      heartEl.innerHTML = `
        <svg viewBox="0 0 36 34" width="36" height="34" class="cal-heart-svg" aria-hidden="true">
          <defs>
            <linearGradient id="calHeartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#367FA3"/>
              <stop offset="100%" stop-color="#193B55"/>
            </linearGradient>
            <filter id="heartGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(197, 173, 121, 0.5)"/>
            </filter>
          </defs>
          <path d="M 18 31 C 18 31 2 20 2 10.5 C 2 4.8 6.5 1 12 1 C 15.2 1 17 2.6 18 3.8 C 19 2.6 20.8 1 24 1 C 29.5 1 34 4.8 34 10.5 C 34 20 18 31 18 31 Z"
                fill="url(#calHeartGrad)" stroke="#C5AD79" stroke-width="1.8" filter="url(#heartGlow)"/>
          <text x="18" y="14.5" text-anchor="middle" dominant-baseline="central" fill="#FFFFFF" font-family="'Cinzel', Georgia, serif" font-weight="700" font-size="14.5">5</text>
        </svg>
      `;
      heartEl.setAttribute('aria-hidden', 'true');
    }
    gridEl.appendChild(heartEl);
  }

  function getCellCenter(cell) {
    const cellRect = cell.getBoundingClientRect();
    const gridRect = gridEl.getBoundingClientRect();
    return {
      x: cellRect.left - gridRect.left + cellRect.width / 2,
      y: cellRect.top  - gridRect.top  + cellRect.height / 2,
    };
  }

  function moveHeartToCell(cell) {
    if (!cell || !heartEl) return;
    const pos = getCellCenter(cell);
    const hw  = heartEl.offsetWidth  || 22;
    const hh  = heartEl.offsetHeight || 22;
    heartEl.style.left = (pos.x - hw / 2) + 'px';
    heartEl.style.top  = (pos.y - hh / 2) + 'px';
  }

  // ── Independent Animation State Machine ───────────────────────────────
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let isSubstantiallyVisible = false;
  let startTimer             = null;
  let isRunning              = false;
  let isPaused               = false;
  let hasFinished            = false;
  let stepIndex              = 0;
  let activeTimeout          = null;

  // Jumping dates ending on Saturday, 5 December
  const SEARCH_DATES = [3, 12, 7, 19, 2, 24, 8, 14, 5];

  function getDayCells() {
    return cells.filter(c => c.day !== null);
  }

  function triggerCalendarCelebration(targetEl) {
    if (prefersReducedMotion) return;
    const rect = targetEl.getBoundingClientRect();
    const gridRect = gridEl.getBoundingClientRect();
    const cx = rect.left - gridRect.left + rect.width / 2;
    const cy = rect.top - gridRect.top + rect.height / 2;

    // Burst 16 golden sparkles and tiny hearts
    for (let i = 0; i < 16; i++) {
      const spark = document.createElement('div');
      spark.className = 'cal-celebration-particle';
      spark.textContent = i % 3 === 0 ? '♥' : (i % 2 === 0 ? '✦' : '•');
      spark.style.left = cx + 'px';
      spark.style.top = cy + 'px';
      const angle = (i / 16) * Math.PI * 2;
      const dist = 35 + Math.random() * 45;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;
      spark.style.setProperty('--tx', `${tx}px`);
      spark.style.setProperty('--ty', `${ty}px`);
      spark.style.animation = `calBurst 0.9s cubic-bezier(0.25, 1, 0.5, 1) forwards`;
      gridEl.appendChild(spark);
      setTimeout(() => spark.remove(), 950);
    }
  }

  function completeAnimation() {
    isRunning   = false;
    isPaused    = false;
    hasFinished = true;
    const dayCells = getDayCells();
    const targetCell = dayCells.find(c => c.day === TARGET_DAY);
    if (targetCell) {
      targetCell.el.classList.add('settled');
      moveHeartToCell(targetCell.el);
      heartEl.style.opacity = '1';
      heartEl.style.transform = 'scale(1.4)';
      triggerCalendarCelebration(targetCell.el);
      setTimeout(() => {
        if (heartEl) heartEl.style.transform = 'scale(1.05)';
      }, 350);
    }
  }

  function nextStep() {
    if (!isRunning || isPaused) return;

    if (stepIndex >= SEARCH_DATES.length) {
      completeAnimation();
      return;
    }

    const dayNumber = SEARCH_DATES[stepIndex];
    const dayCells = getDayCells();
    const cellObj = dayCells.find(c => c.day === dayNumber);

    if (cellObj) {
      moveHeartToCell(cellObj.el);
      heartEl.style.opacity = '1';
    }

    stepIndex++;

    // Slower, graceful hopping speed per user request
    const isPenultimate = stepIndex === SEARCH_DATES.length - 1;
    const isFinal       = stepIndex === SEARCH_DATES.length;
    const delayMs       = isFinal ? 1050 : (isPenultimate ? 820 : 640);

    activeTimeout = setTimeout(nextStep, delayMs);
  }

  function startAnimation() {
    if (isRunning || hasFinished) return;
    isRunning   = true;
    isPaused    = false;
    stepIndex   = 0;

    buildGrid();

    if (prefersReducedMotion) {
      completeAnimation();
      return;
    }

    // Place heart at first candidate then step
    const dayCells = getDayCells();
    moveHeartToCell(dayCells[0].el);
    heartEl.style.opacity = '0';
    setTimeout(() => {
      if (isRunning && !isPaused) {
        heartEl.style.opacity = '1';
        nextStep();
      }
    }, 150);
  }

  function pauseAnimation() {
    if (isRunning && !isPaused) {
      isPaused = true;
      if (activeTimeout) {
        clearTimeout(activeTimeout);
        activeTimeout = null;
      }
    }
  }

  function resumeAnimation() {
    if (isRunning && isPaused) {
      isPaused = false;
      nextStep();
    }
  }

  function resetAnimation() {
    if (activeTimeout) clearTimeout(activeTimeout);
    if (startTimer) clearTimeout(startTimer);
    isRunning   = false;
    isPaused    = false;
    hasFinished = false;
    stepIndex   = 0;
    buildGrid();
    setTimeout(startAnimation, 150);
  }

  // ── Independent Visibility Detection (500ms delay) ────────────────────
  function checkSubstantialVisibility() {
    const targetEl = cardEl || section;
    if (!targetEl) return false;
    const rect = targetEl.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return rect.top < vh * 0.75 && rect.bottom > vh * 0.25;
  }

  function handleVisibility() {
    const visibleNow = checkSubstantialVisibility();

    if (visibleNow && !isSubstantiallyVisible) {
      isSubstantiallyVisible = true;
      if (!hasFinished && !isRunning) {
        if (startTimer) clearTimeout(startTimer);
        // Start only when substantially visible for 500ms continuously
        startTimer = setTimeout(() => {
          if (isSubstantiallyVisible && !hasFinished && !isRunning) {
            startAnimation();
          }
        }, 500);
      } else if (isRunning && isPaused) {
        resumeAnimation();
      }
    } else if (!visibleNow && isSubstantiallyVisible) {
      isSubstantiallyVisible = false;
      if (startTimer) {
        clearTimeout(startTimer);
        startTimer = null;
      }
      if (isRunning && !isPaused) {
        pauseAnimation();
      }
    }
  }

  const observer = new IntersectionObserver(() => {
    handleVisibility();
  }, { threshold: [0, 0.25, 0.5, 0.75] });

  if (cardEl) observer.observe(cardEl);
  else if (section) observer.observe(section);

  window.addEventListener('scroll', handleVisibility, { passive: true });
  window.addEventListener('resize', () => {
    if (hasFinished) {
      const dayCells = getDayCells();
      const targetCell = dayCells.find(c => c.day === TARGET_DAY);
      if (targetCell) moveHeartToCell(targetCell.el);
    }
  }, { passive: true });

  // Tab visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pauseAnimation();
    } else {
      if (isSubstantiallyVisible) {
        resumeAnimation();
      }
    }
  });

  // Replay Button
  if (replayBtn) {
    replayBtn.addEventListener('click', resetAnimation);
    replayBtn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); resetAnimation(); }
    });
  }

  // ── Calendar Downloads ────────────────────────────────────────────────
  // 1. Valid All-Day ICS Event for 5 December 2026
  function buildICS() {
    const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Srishti Jain & Himanshu Jain Wedding//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Srishti Jain & Himanshu Jain Wedding',
      'X-WR-TIMEZONE:Asia/Kolkata',
      'BEGIN:VEVENT',
      'UID:srishti-jain-himanshu-jain-wedding-20261205@wedding.invite',
      `DTSTAMP:${stamp}`,
      'DTSTART;VALUE=DATE:20261205',
      'DTEND;VALUE=DATE:20261206',
      'SUMMARY:Srishti Jain & Himanshu Jain Wedding 💍',
      'DESCRIPTION:We joyfully invite you to celebrate the wedding of Srishti Jain & Himanshu Jain.\\nSaturday\\, 5 December 2026.',
      'LOCATION:Shehanshah Palace\\, Ludhiana\\, Punjab\\, India',
      'URL:https://www.google.com/maps/search/?api=1&query=Shehanshah+Palace%2C+Ludhiana%2C+Punjab%2C+India',
      'TRANSP:TRANSPARENT',
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder: Srishti Jain & Himanshu Jain Wedding is tomorrow!',
      'TRIGGER:-P1D',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ];
    return lines.join('\r\n');
  }

  function downloadICS() {
    const content = buildICS();
    const blob    = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement('a');
    a.href        = url;
    a.download    = 'Srishti-Jain-Himanshu-Jain-Wedding-2026.ics';
    a.type        = 'text/calendar';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  if (icsBtn) {
    icsBtn.addEventListener('click', downloadICS);
  }

  // 2. Google Calendar Direct Link
  if (gcalBtn) {
    const gcalUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' + encodeURIComponent('Srishti Jain & Himanshu Jain Wedding 💍') +
      '&dates=20261205/20261206' +
      '&details=' + encodeURIComponent('We joyfully invite you to celebrate the wedding of Srishti Jain & Himanshu Jain. Saturday, 5 December 2026.') +
      '&location=' + encodeURIComponent('Shehanshah Palace, Ludhiana, Punjab, India');
    gcalBtn.href = gcalUrl;
  }

  // 3. Separate Wedding Details PDF Download
  function downloadWeddingDetailsPDF() {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Srishti Jain & Himanshu Jain — Wedding Details</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=EB+Garamond:wght@400;500&family=Great+Vibes&display=swap');
@page { size: A5 portrait; margin: 10mm; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'EB Garamond', Georgia, serif;
  background: #FFFDF7;
  color: #173B55;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  padding: 8mm;
}
.page-border {
  border: 1.5px solid #C7AA72;
  border-radius: 8px;
  padding: 8mm 6mm;
  position: relative;
  background: #FFFFFF;
}
.page-border::before {
  content: '';
  position: absolute;
  inset: 3mm;
  border: 1px solid rgba(199, 170, 114, 0.35);
  border-radius: 6px;
  pointer-events: none;
}
.header { text-align: center; margin-bottom: 6mm; }
.eyebrow {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 8pt;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: #3D87AE;
  margin-bottom: 2mm;
  display: block;
}
.names {
  font-family: 'Great Vibes', cursive;
  font-size: 28pt;
  color: #173B55;
  line-height: 1.2;
}
.date-badge {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 8.5pt;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #C7AA72;
  font-weight: 600;
  margin-top: 2mm;
  display: block;
}
.divider {
  text-align: center;
  color: #C7AA72;
  font-size: 10pt;
  margin: 4mm 0;
  letter-spacing: 0.4em;
}
.intro-text {
  text-align: center;
  font-size: 10.5pt;
  line-height: 1.6;
  color: #244b6a;
  margin-bottom: 6mm;
}
.details-table {
  width: 100%;
  border-collapse: collapse;
  margin: 4mm 0 6mm;
}
.details-table td {
  padding: 3mm 2mm;
  border-bottom: 1px solid #EADCC6;
  font-size: 10pt;
}
.details-table td.label {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 7.5pt;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #3D87AE;
  font-weight: 600;
  width: 25mm;
}
.details-table td.value {
  color: #173B55;
}
.pending {
  font-style: italic;
  color: #527998;
}
.footer {
  text-align: center;
  margin-top: 6mm;
}
.quote {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
  font-size: 11pt;
  color: #3D87AE;
  margin-bottom: 3mm;
}
.sub-footer {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 6.5pt;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #C7AA72;
}
</style>
</head>
<body>
<div class="page-border">
  <div class="header">
    <span class="eyebrow">Wedding Celebration Details</span>
    <h1 class="names">Srishti Jain &amp; Himanshu Jain</h1>
    <span class="date-badge">Saturday · 5 December 2026</span>
  </div>

  <div class="divider">✦ &nbsp; ✦ &nbsp; ✦</div>

  <p class="intro-text">
    To our beloved family, relatives and friends—we look forward to celebrating this cherished beginning with your presence and blessings.
  </p>

  <table class="details-table">
    <tr>
      <td class="label">Date</td>
      <td class="value"><strong>Saturday, 5 December 2026</strong></td>
    </tr>
    <tr>
      <td class="label">Time</td>
      <td class="value pending">Timings to be announced</td>
    </tr>
    <tr>
      <td class="label">Venue</td>
      <td class="value">Shehanshah Palace</td>
    </tr>
    <tr>
      <td class="label">Location</td>
      <td class="value">Ludhiana, Punjab, India</td>
    </tr>
    <tr>
      <td class="label">Directions</td>
      <td class="value"><a href="https://www.google.com/maps/search/?api=1&query=Shehanshah+Palace%2C+Ludhiana%2C+Punjab%2C+India" style="color:#367FA3; text-decoration:underline;">View on Google Maps</a></td>
    </tr>
  </table>

  <div class="footer">
    <p class="quote">“Your blessings, our beginning. Your presence, our joy.”</p>
    <p class="sub-footer">Srishti Jain &amp; Himanshu Jain · 5 December 2026</p>
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
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Srishti-Jain-Himanshu-Jain-Wedding-Details.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  if (pdfBtn) {
    pdfBtn.addEventListener('click', downloadWeddingDetailsPDF);
  }

  // Initial grid build
  buildGrid();

})();
