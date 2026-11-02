// js/config.js
// ─────────────────────────────────────────────────────────────────────────
//  WEDDING CONFIGURATION — update all confirmed details here.
//  Null values are displayed as "Details Pending" on the site.
// ─────────────────────────────────────────────────────────────────────────
const WEDDING = Object.freeze({
  bride:      'Srishti Jain',
  groom:      'Himanshu Jain',
  brideName:  'Srishti',
  groomName:  'Himanshu',
  initials:   'S & H',

  date: {
    display:  'Saturday, 5 December 2026',
    iso:      '2026-12-05',   // YYYY-MM-DD (all-day event)
    year:     2026,
    month:    12,             // 1-based
    day:      5,
    timezone: 'Asia/Kolkata',
  },

  // ── Set once confirmed ─────────────────────────────────────────────────
  time:  null,     // e.g. '6:30 PM IST'
  venue: {
    name:   null,  // e.g. 'City Palace, Jaipur' — update when confirmed
    mapUrl: 'https://maps.app.goo.gl/sGMF5VTTgQhBbkMn8',
  },
  ceremonies: [],  // Add { name, time, details } objects when confirmed

  // ── Calendar / download ────────────────────────────────────────────────
  icsFilename: 'Srishti-Himanshu-Wedding-2026.ics',

  // ── Optional background music ──────────────────────────────────────────
  // Drop an .mp3 file in assets/audio/ and set src below.
  music: {
    src:      null,   // e.g. 'assets/audio/shehnai.mp3'
    autoplay: false,
  },

  // ── Site copy ──────────────────────────────────────────────────────────
  wording: {
    opening:  'With the blessings of our families,',
    main:     'we joyfully invite you to celebrate the wedding of',
    closing:  'Your presence, love and blessings will make our day truly complete.',
    pending:  'Venue, timings and further ceremony details will be shared soon.',
    journey:  'A new journey begins — save the date',
  },

  // ── Card preview ───────────────────────────────────────────────────────
  card: {
    line1:  'Together with their families',
    line2:  'Srishti Jain',
    line3:  '& Himanshu Jain',
    line4:  'Request the honour of your presence',
    line5:  'Saturday, 5 December 2026',
    line6:  'Rajasthan, India',
  },
});
