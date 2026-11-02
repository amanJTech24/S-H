// js/calendar.js
// ─────────────────────────────────────────────────────────────────────────
//  December 2026 calendar with animated heart that searches for the 5th.
//  Dec 1 2026 = Tuesday. Target = Dec 5 (Saturday).
//  Replay control included.
// ─────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const gridEl   = document.getElementById('cal-grid');
  const replayBtn = document.getElementById('cal-replay-btn');
  const section  = document.getElementById('calendar-section');

  if (!gridEl) return;

  // Dec 1 2026 is Tuesday (day index 2, Sun=0)
  const START_DOW   = 2;  // Tuesday
  const DAYS_IN_DEC = 31;
  const TARGET_DAY  = 5;

  // ── Build calendar grid ───────────────────────────────────────────────
  const cells = []; // { el, day } — null day for empty

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

    // Day cells
    for (let d = 1; d <= DAYS_IN_DEC; d++) {
      const el = document.createElement('div');
      el.className = 'cal-cell';
      el.textContent = d;
      el.setAttribute('aria-label', `December ${d}`);
      if (d === TARGET_DAY) el.id = 'cal-target';
      gridEl.appendChild(el);
      cells.push({ el, day: d });
    }
  }

  // ── Heart marker ──────────────────────────────────────────────────────
  let heartEl = document.getElementById('cal-heart-marker');
  if (!heartEl) {
    heartEl = document.createElement('div');
    heartEl.id = 'cal-heart-marker';
    heartEl.className = 'cal-heart-marker';
    heartEl.textContent = '❤';
    heartEl.setAttribute('aria-hidden', 'true');
  }

  function getCellCenter(cell) {
    const cellRect  = cell.getBoundingClientRect();
    const gridRect  = gridEl.getBoundingClientRect();
    return {
      x: cellRect.left - gridRect.left + cellRect.width / 2,
      y: cellRect.top  - gridRect.top  + cellRect.height / 2,
    };
  }

  function moveHeartToCell(cell) {
    const pos  = getCellCenter(cell);
    const hw   = heartEl.offsetWidth  || 18;
    const hh   = heartEl.offsetHeight || 18;
    heartEl.style.left = (pos.x - hw / 2) + 'px';
    heartEl.style.top  = (pos.y - hh / 2) + 'px';
  }

  // ── Animation sequence ────────────────────────────────────────────────
  let timeouts = [];
  let animating = false;

  function clearAllTimeouts() {
    timeouts.forEach(clearTimeout);
    timeouts.length = 0;
  }

  function delay(ms) {
    return new Promise(resolve => {
      timeouts.push(setTimeout(resolve, ms));
    });
  }

  function getDayCells() {
    return cells.filter(c => c.day !== null);
  }

  async function runAnimation() {
    if (animating) return;
    animating = true;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    buildGrid();

    // Position heart at first day
    const dayCells = getDayCells();
    const firstCell = dayCells[0].el;
    gridEl.style.position = 'relative';

    if (!heartEl.parentElement) {
      gridEl.appendChild(heartEl);
    }

    moveHeartToCell(firstCell);
    heartEl.style.opacity = '1';

    if (prefersReducedMotion) {
      // Skip straight to final
      const targetCell = dayCells.find(c => c.day === TARGET_DAY);
      if (targetCell) {
        moveHeartToCell(targetCell.el);
        targetCell.el.classList.add('today');
      }
      animating = false;
      return;
    }

    // Random dates to "search" before settling
    const searchDates = [3, 12, 7, 19, 2, 24, 8, 14, 5];
    // (last item MUST be target)

    let delay_ms = 350;
    for (let i = 0; i < searchDates.length; i++) {
      const d    = searchDates[i];
      const cell = dayCells.find(c => c.day === d);
      if (!cell) continue;

      await delay(delay_ms);
      moveHeartToCell(cell.el);

      // Slow down as we approach the end
      delay_ms = i < searchDates.length - 3 ? 320 : 500;
    }

    // Final: settle on TARGET_DAY
    await delay(600);
    const targetCell = dayCells.find(c => c.day === TARGET_DAY);
    if (targetCell) {
      moveHeartToCell(targetCell.el);
      targetCell.el.classList.add('today');

      // Pulse heart
      heartEl.style.transform = 'scale(1.5)';
      await delay(200);
      heartEl.style.transform = 'scale(1.0)';
      await delay(150);
      heartEl.style.transform = 'scale(1.3)';
      await delay(150);
      heartEl.style.transform = 'scale(1.0)';
    }

    animating = false;
  }

  function reset() {
    clearAllTimeouts();
    animating = false;
    heartEl.style.transform = '';
    heartEl.style.opacity   = '0';
    runAnimation();
  }

  if (replayBtn) {
    replayBtn.addEventListener('click', reset);
    replayBtn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reset(); }
    });
  }

  // Trigger on scroll into view
  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      io.disconnect();
      // Small delay so layout is stable
      setTimeout(runAnimation, 400);
    }
  }, { threshold: 0.4 });

  if (section) io.observe(section);
  else runAnimation();

})();
