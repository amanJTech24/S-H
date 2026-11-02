# Srishti & Himanshu — Wedding Website

## Project Structure

```
wedding-srishti-himanshu/
├── index.html                  ← Main page (open this)
├── README.md
│
├── assets/
│   ├── images/
│   │   ├── palace_hero.png     ← Hero background (Rajasthani palace illustration)
│   │   ├── wax_seal.png        ← Envelope wax seal (S & H)
│   │   ├── invitation_card.png ← Card preview background
│   │   ├── rose_petals.png     ← Falling petals overlay
│   │   └── decorated_car.png   ← Animated wedding car
│   ├── fonts/                  ← (optional) locally bundled font files
│   └── audio/                  ← Drop an .mp3 file here for background music
│
├── css/
│   └── main.css                ← All styles (design tokens → sections)
│
└── js/
    ├── config.js               ← ★ ALL EDITABLE WEDDING DETAILS ARE HERE ★
    ├── envelope.js             ← Envelope open animation
    ├── petals.js               ← Canvas falling rose petals
    ├── car-path.js             ← Car following curved golden SVG path
    ├── calendar.js             ← December 2026 calendar + heart animation
    ├── countdown.js            ← IST countdown + .ics download
    ├── card.js                 ← Canvas invitation card + PNG/PDF download
    ├── music.js                ← Optional background music toggle
    └── app.js                  ← Main init, fade-up observers, accessibility
```

---

## Updating Wedding Details

**All confirmed information is in one file: `js/config.js`**

| Field | How to update |
|-------|--------------|
| Time | Set `time: '6:30 PM IST'` (currently `null`) |
| Venue name | Set `venue.name: 'City Palace, Jaipur'` (currently `null`) |
| Map link | Already set to the correct Google Maps URL |
| Music | Add an `.mp3` to `assets/audio/` and set `music.src: 'assets/audio/filename.mp3'` |
| Ceremonies | Add objects to the `ceremonies: []` array |

---

## Features

1. **Burgundy envelope** with gold S&H wax seal — tap/click to open, skip button
2. **Full-screen palace hero** — Rajasthani palace illustration, calligraphy names, date
3. **Falling rose petals** — canvas animation (pauses when scrolled away, respects reduced motion)
4. **Animated car** following a curved golden SVG path — trail draws behind it, ends in a heart
5. **December 2026 calendar** — heart searches dates, settles on Saturday the 5th; Replay button
6. **Live countdown** in Asia/Kolkata timezone + downloadable `.ics` calendar event
7. **Celebration details** with Google Maps button
8. **Invitation card preview** — canvas-rendered, downloadable as PNG or PDF
9. **Optional gentle music** — off by default; toggle button (only shown when src is configured)
10. **Reduced motion** support throughout
11. **Keyboard accessible** — envelope opens on Enter/Space, skip button, all controls reachable

---

## Hosting (Free Options)

### Netlify Drop (easiest)
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the entire `wedding-srishti-himanshu/` folder onto the page
3. Copy the generated URL

### GitHub Pages
1. Create a new GitHub repository
2. Upload all files (preserving the folder structure)
3. Go to Settings → Pages → Source: `main` branch, `/root`
4. Site will be at `https://yourusername.github.io/repo-name/`

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` from inside the `wedding-srishti-himanshu/` folder
3. Follow prompts (no framework needed, it's static)

---

## Browser Support

Tested and working at 390px / 768px / 1440px on:
- Chrome 120+
- Firefox 121+
- Safari 17+
- Edge 120+

---

## Fonts Used

Loaded from Google Fonts (requires internet on first load):
- **Great Vibes** — script calligraphy for names
- **Cormorant Garamond** — elegant serif headings
- **EB Garamond** — body text
- **Cinzel** — display labels and uppercase details

To bundle fonts locally: download the `.woff2` files from [Google Fonts](https://fonts.google.com) and add `@font-face` declarations to `css/main.css`.

---

*Made with love for Srishti & Himanshu · Saturday, 5 December 2026*
