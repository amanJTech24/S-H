// js/countdown.js
// ─────────────────────────────────────────────────────────────────────────
//  5. EXISTING GITHUB SECTION 5 (COUNTDOWN TIMER)
//  Live countdown to Srishti Jain & Himanshu Jain's wedding (Asia/Kolkata timezone)
//  Confirmed Date: 5 December 2026 IST.
// ─────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  if (typeof WEDDING === 'undefined') return;

  const elDays = document.getElementById('cd-days');
  const elHrs  = document.getElementById('cd-hrs');
  const elMins = document.getElementById('cd-mins');
  const elSecs = document.getElementById('cd-secs');
  const cdMsg  = document.getElementById('cd-message');

  // Target date: Dec 5 2026 midnight IST (UTC+5:30 -> Dec 4 18:30 UTC)
  const TARGET_UTC = Date.UTC(2026, 11, 4, 18, 30, 0);

  function pad(n) { return String(Math.floor(n)).padStart(2, '0'); }

  function updateCountdown() {
    const now  = Date.now();
    let   diff = TARGET_UTC - now;

    if (diff <= 0) {
      if (elDays) elDays.textContent = '00';
      if (elHrs)  elHrs.textContent  = '00';
      if (elMins) elMins.textContent = '00';
      if (elSecs) elSecs.textContent = '00';
      if (cdMsg)  cdMsg.textContent  = '🎉 The wedding celebration is today!';
      return;
    }

    const days = Math.floor(diff / 864e5); diff -= days * 864e5;
    const hrs  = Math.floor(diff / 36e5);  diff -= hrs  * 36e5;
    const mins = Math.floor(diff / 6e4);   diff -= mins * 6e4;
    const secs = Math.floor(diff / 1000);

    if (elDays) elDays.textContent = pad(days);
    if (elHrs)  elHrs.textContent  = pad(hrs);
    if (elMins) elMins.textContent = pad(mins);
    if (elSecs) elSecs.textContent = pad(secs);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

})();
