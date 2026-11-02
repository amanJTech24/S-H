// js/countdown.js
// ─────────────────────────────────────────────────────────────────────────
//  Live countdown to Srishti & Himanshu's wedding (Asia/Kolkata timezone)
//  ICS download: proper .ics file with correct MIME type
//  Google Calendar link: pre-filled, opens in new tab
// ─────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  if (typeof WEDDING === 'undefined') return;

  const elDays = document.getElementById('cd-days');
  const elHrs  = document.getElementById('cd-hrs');
  const elMins = document.getElementById('cd-mins');
  const elSecs = document.getElementById('cd-secs');
  const icsDlBtn  = document.getElementById('ics-download-btn');

  // Target date: Dec 5 2026 midnight IST
  // IST = UTC+5:30, so Dec 5 00:00 IST = Dec 4 18:30 UTC
  const TARGET_UTC = Date.UTC(2026, 11, 4, 18, 30, 0);

  function pad(n) { return String(Math.floor(n)).padStart(2, '0'); }

  function updateCountdown() {
    const now  = Date.now();
    let   diff = TARGET_UTC - now;

    if (diff <= 0) {
      [elDays, elHrs, elMins, elSecs].forEach(el => { if (el) el.textContent = '00'; });
      const msg = document.getElementById('cd-message');
      if (msg) msg.textContent = '🎉 The wedding is today!';
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

  // ── ICS Download ──────────────────────────────────────────────────────
  // Proper all-day event with correct MIME type text/calendar
  function buildICS() {
    const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Srishti & Himanshu Wedding//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Srishti & Himanshu Wedding',
      'X-WR-TIMEZONE:Asia/Kolkata',
      'BEGIN:VEVENT',
      `UID:srishti-himanshu-wedding-20261205@wedding.invite`,
      `DTSTAMP:${stamp}`,
      'DTSTART;VALUE=DATE:20261205',
      'DTEND;VALUE=DATE:20261206',
      "SUMMARY:Srishti & Himanshu's Wedding 💍",
      'DESCRIPTION:We joyfully invite you to celebrate the wedding of\\nSrishti Jain & Himanshu Jain.\\nSaturday\\, 5 December 2026.',
      'LOCATION:Rajasthan\\, India',
      'URL:https://maps.app.goo.gl/sGMF5VTTgQhBbkMn8',
      'TRANSP:TRANSPARENT',
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder: Srishti & Himanshu\'s Wedding is tomorrow!',
      'TRIGGER:-P1D',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ];
    return lines.join('\r\n');
  }

  function downloadICS() {
    const content  = buildICS();
    const blob     = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url      = URL.createObjectURL(blob);
    const a        = document.createElement('a');
    a.href         = url;
    a.download     = WEDDING.icsFilename || 'Srishti-Himanshu-Wedding-2026.ics';
    a.type         = 'text/calendar';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  if (icsDlBtn) {
    icsDlBtn.addEventListener('click', downloadICS);
    icsDlBtn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); downloadICS(); }
    });
  }

  // Make downloadICS globally accessible (used by finale.js and details section)
  window._weddingDownloadICS = downloadICS;

})();
