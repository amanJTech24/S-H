// js/config.js
// ─────────────────────────────────────────────────────────────────────────
//  WEDDING CONFIGURATION — confirmed details for Srishti Jain & Himanshu Jain.
//  Date: Saturday, 5 December 2026.
// ─────────────────────────────────────────────────────────────────────────
const WEDDING = Object.freeze({
  bride:      'Srishti Jain',
  groom:      'Himanshu Jain',
  brideName:  'Srishti Jain',
  groomName:  'Himanshu Jain',
  coupleFull: 'Srishti Jain & Himanshu Jain',
  initials:   'S & H',

  date: {
    display:  'Saturday, 5 December 2026',
    iso:      '2026-12-05',   // YYYY-MM-DD (all-day event)
    year:     2026,
    month:    12,             // 1-based
    day:      5,
    timezone: 'Asia/Kolkata',
  },

  // ── Confirmed details & placeholders ────────────────────────────────────
  time:  null,     // Time column removed per user request
  venue: {
    name:   'Shehanshah Palace',
    mapUrl: 'https://maps.app.goo.gl/DZTHWSUSbHaPdhuF6',
  },
  ceremonies: [],

  // ── Calendar / download filenames ───────────────────────────────────────
  icsFilename: 'Srishti-Jain-Himanshu-Jain-Wedding-2026.ics',
  pdfDetailsFilename: 'Srishti-Jain-Himanshu-Jain-Wedding-Details.pdf',
  cardPngFilename: 'Srishti-Jain-Himanshu-Jain-Wedding-Invitation.png',

  // ── Background Wedding Music ──────────────────────────────────────────
  music: {
    src:      'assets/audio/peaceful_wedding_melody.mp3', // Peaceful continuous romantic felt piano & acoustic guitar wedding melody
    autoplay: false,
  },

  // ── Site copy ──────────────────────────────────────────────────────────
  wording: {
    heroEyebrow:     'A Wedding Celebration',
    heroTagline:     'Saturday · 5 December 2026',
    familyHeading:   'Our dearest people. Our happiest beginning.',
    familyBodyLead:  'To our beloved family, relatives and friends—this celebration would not be complete without you.',
    familyBodyMain:  'As Srishti Jain and Himanshu Jain begin a new chapter, we invite you to bring your blessings, your laughter and your warmest hugs.',
    familyBodySub:   'Come celebrate, make memories, and fill our wedding day with the love of the people who mean the most to us.',
    familyClosing:   'Your presence is the most beautiful part of our celebration.',
    journeyGreeting: 'A new journey begins — save the date',
    journeyDate:     'Saturday · 5 December 2026',
    countdownLabel:  'The Big Day Is Near',
    venueHeading:    'Celebration Details',
    keepsakeHeading: 'Wedding Invitation Keepsake',
    finaleQuote:     'Your blessings, our beginning. Your presence, our joy.',
  },

  // ── Card preview ───────────────────────────────────────────────────────
  card: {
    line1:  'Together with their families',
    line2:  'Srishti Jain',
    line3:  '& Himanshu Jain',
    line4:  'Request the honour of your presence at the wedding celebration',
    line5:  'Saturday, 5 December 2026',
    line6:  'Rajasthan, India',
  },
});
