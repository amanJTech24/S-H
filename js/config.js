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
    city:   'Ludhiana, Punjab, India',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Shehanshah+Palace%2C+Ludhiana%2C+Punjab%2C+India',
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

  // ── Parents & Family details ───────────────────────────────────────────
  parents: {
    bride: 'D/O Manisha and Ajay Jain',
    groom: 'S/O Pooja and Pramodh Kumar Jain',
  },

  // ── Site copy ──────────────────────────────────────────────────────────
  wording: {
    heroEyebrow:     'A Wedding Celebration',
    heroTagline:     'Saturday · 5 December 2026',
    familyHeading:   'Our happiest day, made complete by you.',
    familyMessage:   'To the family who raised us, the relatives who have cheered us on, and the friends who became family—this celebration belongs to you too. As we begin our forever, we would love to have you beside us, filling the day with laughter, warm hugs, and your blessings.',
    familyClosing:   'With love, Srishti Jain & Himanshu Jain',
    journeyReveals: [
      'With our favourite people…',
      'Towards our forever',
      '05 December 2026',
    ],
    calendarHeading: 'December 2026',
    calendarSub:     'A Date Chosen by the Heart',
    calendarFinish:  'One date. Two hearts. Everyone we love.',
    countdownHeading:'A little closer to forever.',
    countdownSub:    'Counting the days until we celebrate together.',
    venueHeading:    'Shehanshah Palace',
    venueLocation:   'Ludhiana, Punjab, India',
    venueDate:       'Saturday, 5 December 2026',
    keepsakeHeading: 'A little piece of our celebration.',
    keepsakeSub:     'Keep our invitation close. We can’t wait to celebrate with you.',
    finaleQuote:     'Your blessings, our beginning. Your presence, our joy.',
  },

  // ── Card preview ───────────────────────────────────────────────────────
  card: {
    line1:  'Together with their families',
    line2:  'Srishti Jain',
    line3:  '& Himanshu Jain',
    line4:  'Request the honour of your presence at the wedding celebration',
    line5:  'Saturday, 5 December 2026',
    line6:  'Ludhiana, Punjab, India',
  },
});
