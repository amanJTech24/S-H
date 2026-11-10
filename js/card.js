// js/card.js
// ─────────────────────────────────────────────────────────────────────────
//  7. INVITATION KEEPSAKE — Journey version
//  - Renders the illustrated wedding invitation card on a HiDPI <canvas>.
//  - Background artwork: assets/images/invitation_card.png (Mughal arch couple art).
//  - Coastal typography: Deep Navy #173B55 & Champagne Gold #C7AA72 on pearl ivory.
//  - Full couple names: Srishti Jain & Himanshu Jain.
//  - Confirmed date: Saturday, 5 December 2026.
//  - Clearly a wedding invitation, NOT a legal marriage certificate.
//  - Direct 2× HiDPI PNG download and printable A5 PDF download.
// ─────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  if (typeof WEDDING === 'undefined') return;

  const canvas = document.getElementById('card-canvas');
  const pngBtn = document.getElementById('card-png-btn');
  const pdfBtn = document.getElementById('card-pdf-btn');
  if (!canvas) return;

  const W   = 613;   // Native card width
  const H   = 1024;  // Native card height
  const DPR = 2;     // HiDPI scale

  canvas.width  = W * DPR;
  canvas.height = H * DPR;
  canvas.style.width  = '100%';
  canvas.style.height = 'auto';

  const ctx = canvas.getContext('2d');
  ctx.scale(DPR, DPR);

  // Background artwork — user uploaded master card with Shehanshah Palace & cursive calligraphy
  const bgImg  = new Image();
  bgImg.crossOrigin = 'anonymous';
  bgImg.src    = 'assets/images/invitation_card.png?v=5.4';
  let bgLoaded = false;

  function renderCard() {
    ctx.clearRect(0, 0, W, H);

    // 1. Draw artwork background (682 x 1024)
    if (bgLoaded && bgImg.naturalWidth > 0) {
      ctx.drawImage(bgImg, 0, 0, W, H);
    } else {
      // Fallback pearl-to-sand gradient
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0,   '#FFFDF7');
      bg.addColorStop(0.5, '#F5EFE4');
      bg.addColorStop(1,   '#EADCC6');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#C7AA72';
      ctx.lineWidth   = 2;
      ctx.strokeRect(16, 16, W - 32, H - 32);
    }
  }

  bgImg.onload  = () => { bgLoaded = true;  renderCard(); };
  bgImg.onerror = () => { bgLoaded = false; renderCard(); };
  renderCard();

  // ── PNG Download (Direct 2× HiDPI) ────────────────────────────────────
  function downloadPNG() {
    renderCard();
    const url = canvas.toDataURL('image/png');
    const a   = document.createElement('a');
    a.href    = url;
    a.download = 'Srishti-Jain-Himanshu-Jain-Wedding-Invitation.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // ── PDF Download (Print-Ready A5 Document) ────────────────────────────
  function downloadPDF() {
    renderCard();
    const imgData = canvas.toDataURL('image/png');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Srishti Jain & Himanshu Jain — Wedding Invitation</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Great+Vibes&display=swap');
@page { size: A5 portrait; margin: 0; }
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body {
  width: 148mm; height: 210mm;
  background: #FFFDF7;
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
  border-radius: 6px;
  box-shadow: 0 4px 24px rgba(23, 59, 85, 0.15);
}
.footer-note {
  margin-top: 5mm;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 7.5pt;
  letter-spacing: 0.22em;
  color: #C7AA72;
  text-align: center;
  text-transform: uppercase;
}
.border-outer {
  position: absolute;
  inset: 4mm;
  border: 1px solid rgba(199, 170, 114, 0.4);
  border-radius: 4px;
  pointer-events: none;
}
.border-inner {
  position: absolute;
  inset: 7mm;
  border: 1px solid rgba(199, 170, 114, 0.2);
  border-radius: 3px;
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
  <img class="card-img" src="${imgData}" alt="Srishti Jain & Himanshu Jain Wedding Invitation">
  <p class="footer-note">Srishti Jain &amp; Himanshu Jain · Saturday, 5 December 2026 · Shehanshah Palace</p>
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
      a.download = 'Srishti-Jain-Himanshu-Jain-Wedding-Invitation-Print.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  if (pngBtn) pngBtn.addEventListener('click', downloadPNG);
  if (pdfBtn) pdfBtn.addEventListener('click', downloadPDF);

  window.downloadInvitationPNG = downloadPNG;
  window.downloadInvitationPDF = downloadPDF;

})();
