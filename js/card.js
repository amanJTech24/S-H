// js/card.js
// ─────────────────────────────────────────────────────────────────────────
//  Renders the premium invitation card on a <canvas>
//  PNG download: high-res direct download
//  PDF download: beautiful print-ready page served via Blob URL (no popup req.)
//  Uses the new premium invitation_card.png as background
// ─────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  if (typeof WEDDING === 'undefined') return;

  const canvas = document.getElementById('card-canvas');
  const pngBtn = document.getElementById('card-png-btn');
  const pdfBtn = document.getElementById('card-pdf-btn');
  if (!canvas) return;

  const W   = 600;   // Logical card width (portrait)
  const H   = 800;   // Logical card height
  const DPR = 2;     // HiDPI scale

  canvas.width  = W * DPR;
  canvas.height = H * DPR;
  canvas.style.width  = '100%';
  canvas.style.height = 'auto';

  const ctx = canvas.getContext('2d');
  ctx.scale(DPR, DPR);

  // Load background image
  const bgImg   = new Image();
  bgImg.src     = 'assets/images/invitation_card.png';
  let bgLoaded  = false;

  // ── Draw helpers ──────────────────────────────────────────────────────
  function drawWrappedText(text, x, y, maxW, lineH) {
    const words = text.split(' ');
    let line = '';
    words.forEach((word, i) => {
      const test = line + (line ? ' ' : '') + word;
      if (ctx.measureText(test).width > maxW && i > 0) {
        ctx.fillText(line, x, y);
        y   += lineH;
        line = word;
      } else {
        line = test;
      }
    });
    ctx.fillText(line, x, y);
    return y + lineH;
  }

  function goldLine(y) {
    const cx = W / 2;
    const grd = ctx.createLinearGradient(cx - 120, y, cx + 120, y);
    grd.addColorStop(0,    'rgba(184,151,90,0)');
    grd.addColorStop(0.5,  'rgba(184,151,90,0.8)');
    grd.addColorStop(1,    'rgba(184,151,90,0)');
    ctx.beginPath();
    ctx.moveTo(cx - 120, y);
    ctx.lineTo(cx + 120, y);
    ctx.strokeStyle = grd;
    ctx.lineWidth   = 0.8;
    ctx.stroke();
  }

  // ── Render card ───────────────────────────────────────────────────────
  function renderCard() {
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2;

    // ── Background image ──────────────────────────────────────────────
    if (bgLoaded && bgImg.naturalWidth > 0) {
      ctx.drawImage(bgImg, 0, 0, W, H);
    } else {
      // Fallback gradient
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0,   '#FBF7F0');
      bg.addColorStop(0.5, '#F5EFE4');
      bg.addColorStop(1,   '#EDE4D5');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      // Outer border frames
      ctx.strokeStyle = '#B8975A';
      ctx.lineWidth   = 1.5;
      ctx.strokeRect(14, 14, W - 28, H - 28);
      ctx.strokeStyle = 'rgba(184,151,90,0.35)';
      ctx.lineWidth   = 0.7;
      ctx.strokeRect(22, 22, W - 44, H - 44);
    }

    // ── Ivory legibility layer over art (just the upper text zone) ────
    // Draw a subtle semi-transparent rounded rect for text area in the arch
    ctx.save();
    const textAreaX = 60;
    const textAreaY = 40;
    const textAreaW = W - 120;
    const textAreaH = 300;
    ctx.beginPath();
    ctx.roundRect(textAreaX, textAreaY, textAreaW, textAreaH, 12);
    ctx.fillStyle = 'rgba(252, 248, 242, 0.72)';
    ctx.fill();
    ctx.restore();

    let y = 82;

    // ── Top ornament ──────────────────────────────────────────────────
    ctx.fillStyle    = '#B8975A';
    ctx.font         = '15px Georgia, serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦  ✦  ✦', cx, y);
    y += 38;

    // ── Ganesh / blessing line ────────────────────────────────────────
    ctx.font      = 'italic 13px Georgia, serif';
    ctx.fillStyle = 'rgba(154,123,106,0.95)';
    ctx.fillText('ॐ  Together with their families', cx, y);
    y += 36;

    goldLine(y - 10);

    // ── Invite line ───────────────────────────────────────────────────
    ctx.font         = 'italic 14px Georgia, serif';
    ctx.fillStyle    = '#6B4C3B';
    ctx.textBaseline = 'alphabetic';
    y = drawWrappedText('joyfully request the honour of your presence', cx, y, 340, 22);
    y += 6;

    goldLine(y + 2);
    y += 20;

    // ── Bride name ────────────────────────────────────────────────────
    ctx.font      = '400 48px Georgia, serif';
    ctx.fillStyle = '#6B1A29';
    ctx.textBaseline = 'middle';
    ctx.fillText('Srishti Jain', cx, y);
    y += 46;

    // ── Ampersand ─────────────────────────────────────────────────────
    ctx.font      = 'italic 22px Georgia, serif';
    ctx.fillStyle = '#B8975A';
    ctx.fillText('&', cx, y);
    y += 38;

    // ── Groom name ────────────────────────────────────────────────────
    ctx.font      = '400 48px Georgia, serif';
    ctx.fillStyle = '#6B1A29';
    ctx.fillText('Himanshu Jain', cx, y);
    y += 54;

    goldLine(y - 10);

    // ── Date ──────────────────────────────────────────────────────────
    ctx.font      = '500 17px Georgia, serif';
    ctx.fillStyle = '#6B1A29';
    ctx.fillText('Saturday, 5 December 2026', cx, y);
    y += 28;

    // ── Location ─────────────────────────────────────────────────────
    ctx.font      = 'italic 13px Georgia, serif';
    ctx.fillStyle = '#9A7B6A';
    ctx.fillText('Rajasthan, India', cx, y);
    y += 36;

    goldLine(y - 8);
    y += 12;

    // ── Bottom ornament ───────────────────────────────────────────────
    ctx.font      = '15px Georgia, serif';
    ctx.fillStyle = '#B8975A';
    ctx.fillText('✦  ✦  ✦', cx, y);
  }

  bgImg.onload  = () => { bgLoaded = true;  renderCard(); };
  bgImg.onerror = () => { bgLoaded = false; renderCard(); };
  renderCard();

  // ── PNG Download ──────────────────────────────────────────────────────
  function downloadPNG() {
    renderCard();
    const url = canvas.toDataURL('image/png');
    const a   = document.createElement('a');
    a.href    = url;
    a.download = 'Srishti-Himanshu-Invitation.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // ── PDF Download ──────────────────────────────────────────────────────
  // Generates a proper, styled print PDF via a blob URL (phone-friendly).
  // No popup required — uses standard anchor download.
  function downloadPDF() {
    renderCard();
    const imgData = canvas.toDataURL('image/png');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Srishti & Himanshu — Wedding Invitation</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Cinzel:wght@400;500&family=Great+Vibes&display=swap');
@page { size: A5 portrait; margin: 0; }
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body {
  width: 148mm; height: 210mm;
  background: #FBF7F0;
  font-family: 'Cormorant Garamond', Georgia, serif;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.page {
  width: 148mm; min-height: 210mm;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 8mm 6mm;
  position: relative;
}
.card-img {
  width: 100%;
  max-width: 130mm;
  height: auto;
  display: block;
  border-radius: 4px;
  box-shadow: 0 4px 20px rgba(107,26,41,0.18);
}
.footer-note {
  margin-top: 6mm;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 7pt;
  letter-spacing: 0.2em;
  color: #B8975A;
  text-align: center;
  text-transform: uppercase;
}
.border-outer {
  position: absolute;
  inset: 4mm;
  border: 1px solid rgba(184,151,90,0.3);
  border-radius: 3px;
  pointer-events: none;
}
.border-inner {
  position: absolute;
  inset: 7mm;
  border: 1px solid rgba(184,151,90,0.15);
  border-radius: 2px;
  pointer-events: none;
}
@media print {
  body { -webkit-print-color-adjust: exact; }
}
</style>
</head>
<body>
<div class="page">
  <div class="border-outer"></div>
  <div class="border-inner"></div>
  <img class="card-img" src="${imgData}" alt="Srishti & Himanshu Wedding Invitation">
  <p class="footer-note">Srishti &amp; Himanshu · 5 December 2026 · Rajasthan, India</p>
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

    // Try direct open (triggers browser print dialog on phones too)
    const win = window.open(url, '_blank');
    if (!win) {
      // Fallback: offer direct download as HTML (printable)
      const a  = document.createElement('a');
      a.href   = url;
      a.download = 'Srishti-Himanshu-Invitation-Print.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  if (pngBtn) pngBtn.addEventListener('click', downloadPNG);
  if (pdfBtn) pdfBtn.addEventListener('click', downloadPDF);

})();
