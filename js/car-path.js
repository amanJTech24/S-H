// js/car-path.js
// ─────────────────────────────────────────────────────────────────────────
//  3. CAR JOURNEY — Journey version only
//  - Ultra-Smooth High-FPS 3D Decorated Wedding Car.
//  - Precomputed path LUT & zero-reflow dimension caching for silky 60-120 FPS.
//  - Authentic Indian wedding car decorations: lush cascading roses & greenery,
//    regal couple (safa & veil), shiny chrome fluting, dual mirrors, trailing ribbons.
//  - Multi-tier festive LEDs (28 nodes) blinking like a real decorated wedding car:
//    warm gold, sparkling white, champagne amber, and rose pink.
//  - Dynamic glowing headlight projection beam & shimmering stardust trail.
//  - Delayed 500ms visibility trigger, offscreen pause, explicit replay.
// ─────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const section    = document.getElementById('journey');
  const stage      = document.getElementById('journey-stage');
  const svgEl      = document.getElementById('journey-svg');
  const carWrapper = document.getElementById('car-container');
  const greeting   = document.getElementById('journey-greeting');
  const dateReveal = document.getElementById('journey-date-reveal');
  const replayBtn  = document.getElementById('journey-replay-btn');

  if (!section || !stage || !svgEl || !carWrapper) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Setup SVG Road Coordinates ─────────────────────────────────────────
  const VBWIDTH  = 960;
  const VBHEIGHT = 280;
  svgEl.setAttribute('viewBox', `0 0 ${VBWIDTH} ${VBHEIGHT}`);

  // Elegant S-curve road
  const ROAD_D = `M -80 ${VBHEIGHT * 0.65}
    C 120 ${VBHEIGHT * 0.65}, 220 ${VBHEIGHT * 0.26}, 400 ${VBHEIGHT * 0.32}
    S 640 ${VBHEIGHT * 0.62}, 780 ${VBHEIGHT * 0.42}
    S 920 ${VBHEIGHT * 0.32}, ${VBWIDTH + 80} ${VBHEIGHT * 0.35}`;

  // Invisible travel path for getPointAtLength
  const travelPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  travelPath.setAttribute('d', ROAD_D);
  travelPath.setAttribute('fill', 'none');
  travelPath.setAttribute('stroke', 'none');
  svgEl.appendChild(travelPath);

  // Background road line (soft sand dashed)
  const roadBg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  roadBg.setAttribute('d', ROAD_D);
  roadBg.setAttribute('fill', 'none');
  roadBg.setAttribute('stroke', 'rgba(199, 170, 114, 0.25)');
  roadBg.setAttribute('stroke-width', '3');
  roadBg.setAttribute('stroke-dasharray', '8 6');
  svgEl.insertBefore(roadBg, svgEl.firstChild);

  // Active glowing trail drawn behind the car (champagne gold & ocean blue)
  const drawnTrail = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  drawnTrail.setAttribute('d', ROAD_D);
  drawnTrail.setAttribute('fill', 'none');
  drawnTrail.setAttribute('stroke', 'url(#carTrailGrad)');
  drawnTrail.setAttribute('stroke-width', '3.5');
  drawnTrail.setAttribute('stroke-linecap', 'round');
  drawnTrail.setAttribute('opacity', '0.95');
  svgEl.insertBefore(drawnTrail, svgEl.firstChild);

  // Stardust sparkle particle container
  const stardustGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  stardustGroup.id = 'car-stardust-group';
  svgEl.appendChild(stardustGroup);

  // Gradient defs
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <linearGradient id="carTrailGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${VBWIDTH}" y2="0">
      <stop offset="0%" stop-color="#3D87AE" stop-opacity="0.2"/>
      <stop offset="50%" stop-color="#C7AA72" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#3D87AE" stop-opacity="1"/>
    </linearGradient>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  `;
  svgEl.insertBefore(defs, svgEl.firstChild);

  // Destination Heart Marker
  const heartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  heartGroup.setAttribute('opacity', '0');
  heartGroup.setAttribute('filter', 'url(#softGlow)');
  const heartPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  heartPath.setAttribute('fill', '#3D87AE');
  heartPath.setAttribute('stroke', '#C7AA72');
  heartPath.setAttribute('stroke-width', '1.8');
  const HS = 18;
  heartPath.setAttribute('d',
    `M 0,${HS * 0.3}
     C 0,${-HS * 0.5} ${-HS},${-HS * 0.5} ${-HS},0
     C ${-HS},${HS * 0.55} 0,${HS * 0.85} 0,${HS}
     C 0,${HS * 0.85} ${HS},${HS * 0.55} ${HS},0
     C ${HS},${-HS * 0.5} 0,${-HS * 0.5} 0,${HS * 0.3} Z`
  );
  heartGroup.appendChild(heartPath);
  svgEl.appendChild(heartGroup);

  const totalLength = travelPath.getTotalLength();
  drawnTrail.style.strokeDasharray  = totalLength;
  drawnTrail.style.strokeDashoffset = totalLength;

  // ── HIGH-FPS OPTIMIZATION: PRECOMPUTED PATH LOOKUP TABLE (LUT) ─────────
  // Eliminates all expensive runtime SVG path getPointAtLength calls during 60+ FPS loop.
  const LUT_SAMPLES = 1200;
  const pathLUT = [];
  for (let i = 0; i <= LUT_SAMPLES; i++) {
    const l = (i / LUT_SAMPLES) * totalLength;
    const pt1 = travelPath.getPointAtLength(l);
    const pt2 = travelPath.getPointAtLength(Math.min(l + 2.5, totalLength));
    const dx  = pt2.x - pt1.x;
    const dy  = pt2.y - pt1.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    pathLUT.push({ x: pt1.x, y: pt1.y, angle });
  }

  // ── ZERO-REFLOW DIMENSION CACHING ─────────────────────────────────────
  let stageW = VBWIDTH;
  let stageH = VBHEIGHT;
  let scaleX = 1;
  let scaleY = 1;

  function updateDimensions() {
    stageW = stage.offsetWidth  || VBWIDTH;
    stageH = stage.offsetHeight || VBHEIGHT;
    scaleX = stageW / VBWIDTH;
    scaleY = stageH / VBHEIGHT;
  }
  updateDimensions();
  window.addEventListener('resize', updateDimensions, { passive: true });

  // ── Construct High-End 3D Decorated Wedding Car ────────────────────────
  // Features:
  // - Convertible Vintage Royal Roadster in Pearl Ivory & Champagne
  // - 28 multi-phase festive LED lights with static GPU glow
  // - Grand cascading floral garland: velvet crimson, blush pink, golden champagne roses
  // - Front chrome fluted grille, winged mascot, dual vintage headlamps & projection beams
  // - Royal couple silhouette with golden safa (turban) and crimson bridal dupatta
  // - Trailing satin ribbons with golden hearts and bells
  carWrapper.innerHTML = `
    <svg viewBox="0 0 190 100" width="190" height="100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Dimensional Body Gradients -->
        <linearGradient id="carBodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="30%" stop-color="#FFFDF7"/>
          <stop offset="70%" stop-color="#F3ECE0"/>
          <stop offset="100%" stop-color="#DDD1BD"/>
        </linearGradient>
        <linearGradient id="bodySpecular" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.7"/>
          <stop offset="50%" stop-color="#FFFDF7" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#DEC593" stop-opacity="0.6"/>
        </linearGradient>
        <linearGradient id="fenderGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FFFDF7"/>
          <stop offset="55%" stop-color="#E8DEC8"/>
          <stop offset="100%" stop-color="#C7AA72"/>
        </linearGradient>
        <linearGradient id="goldTrimGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FBF6EE"/>
          <stop offset="35%" stop-color="#DEC593"/>
          <stop offset="75%" stop-color="#C7AA72"/>
          <stop offset="100%" stop-color="#8F712E"/>
        </linearGradient>
        <linearGradient id="oceanInterior" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#286B8F"/>
          <stop offset="100%" stop-color="#173B55"/>
        </linearGradient>
        <!-- Dual Headlight Projection Beam Gradient -->
        <linearGradient id="headlightBeamGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#FFFDF7" stop-opacity="0.9"/>
          <stop offset="35%" stop-color="#FFF5B8" stop-opacity="0.45"/>
          <stop offset="100%" stop-color="#FFD700" stop-opacity="0"/>
        </linearGradient>
        <!-- Static GPU Soft Shadow Filter -->
        <filter id="shadowBlur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.2"/>
        </filter>
        <!-- Static GPU LED Glow Filter (Fast, zero layout thrashing) -->
        <filter id="ledGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Soft ground contact shadow -->
      <ellipse id="car-ground-shadow" cx="90" cy="80" rx="76" ry="7" fill="rgba(23, 59, 85, 0.32)" filter="url(#shadowBlur)" />

      <!-- Forward-Projecting Headlight Light Beams (Dual high-beam cones) -->
      <polygon id="car-headlight-cone" points="166,55 255,26 255,84" fill="url(#headlightBeamGrad)" opacity="0" pointer-events="none"/>

      <!-- Main Chassis & Body Group (Suspension Bobs Here) -->
      <g id="car-body-group">

        <!-- Deep Underbody Chassis Line -->
        <path d="M 22 68 L 158 68 L 156 73 L 24 73 Z" fill="#173B55" />

        <!-- Interior Leather Seats (Open Convertible Roadster) -->
        <path d="M 60 48 C 60 38, 66 34, 78 34 L 88 34 C 92 34, 94 38, 94 48 Z" fill="url(#oceanInterior)" />
        <path d="M 68 37 L 84 37" stroke="#DEC593" stroke-width="1.2" stroke-linecap="round" />

        <!-- Folded Convertible Soft-Top (Champagne accordion boot at rear) -->
        <path d="M 36 48 C 34 42, 38 37, 48 37 C 56 37, 58 42, 57 48 Z" fill="#E8DEC8" stroke="#A88B52" stroke-width="1" />
        <path d="M 40 40 C 44 43, 48 43, 52 40" fill="none" stroke="#A88B52" stroke-width="1" />

        <!-- Sleek Low-Profile Vintage Roadster Body Shell (Pearl Ivory) -->
        <path d="M 18 62
                 C 18 52, 26 47, 40 47
                 L 90 47
                 C 94 47, 98 45, 102 43
                 L 116 43
                 C 134 43, 150 47, 164 53
                 C 168 55, 170 58, 170 62
                 C 170 67, 164 71, 152 71
                 L 26 71
                 C 20 71, 18 66, 18 62 Z"
              fill="url(#carBodyGrad)"
              stroke="url(#goldTrimGrad)"
              stroke-width="1.3" />

        <!-- Body Specular Highlight (Chrome Sheen) -->
        <path d="M 22 55 Q 92 51 162 53" stroke="url(#bodySpecular)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M 24 57 Q 92 53 158 55" stroke="#C7AA72" stroke-width="0.8" fill="none"/>

        <!-- Vintage Chrome Side Trumpet Horn (Authentic Luxury Roadster Detail) -->
        <path d="M 104 47 L 115 45 L 115 49 Z" fill="url(#goldTrimGrad)" stroke="#8F712E" stroke-width="0.5"/>
        <circle cx="103" cy="47" r="1.8" fill="#DEC593"/>

        <!-- Flowing Curved Vintage Front Fender (Teardrop over front wheel at 128) -->
        <path d="M 108 57
                 C 110 45, 122 41, 140 43
                 C 154 45, 166 50, 171 63
                 C 169 69, 160 71, 148 71
                 C 146 61, 136 57, 128 57
                 C 118 57, 112 61, 110 71
                 L 102 71
                 C 104 64, 106 59, 108 57 Z"
              fill="url(#fenderGrad)" stroke="url(#goldTrimGrad)" stroke-width="1.1"/>

        <!-- Flowing Curved Vintage Rear Fender (Over rear wheel at 44) -->
        <path d="M 18 64
                 C 18 51, 28 45, 43 45
                 C 55 45, 62 50, 65 61
                 L 66 71
                 C 62 64, 54 58, 44 58
                 C 34 58, 27 64, 25 71
                 L 18 71
                 C 17 68, 17 65, 18 64 Z"
              fill="url(#fenderGrad)" stroke="url(#goldTrimGrad)" stroke-width="1.1"/>

        <!-- Vintage Chrome Running Board -->
        <rect x="66" y="69" width="36" height="3" rx="1.5" fill="url(#goldTrimGrad)"/>

        <!-- Low Raked Windshield with Gold Chrome Frame -->
        <path d="M 90 47 L 102 26 L 108 26 L 97 47 Z" fill="rgba(220, 239, 248, 0.75)" stroke="url(#goldTrimGrad)" stroke-width="1.4"/>
        <line x1="102" y1="26" x2="108" y2="26" stroke="#FFFFFF" stroke-width="1.8"/>

        <!-- Chrome Vintage Side Mirror -->
        <circle cx="101" cy="35" r="2.2" fill="url(#goldTrimGrad)"/>
        <ellipse cx="101" cy="35" rx="1.5" ry="1.8" fill="#FFFDF7"/>

        <!-- Royal Couple Silhouette in Traditional Indian Attire -->
        <!-- Groom (Golden Sherwani, Royal Turban / Safa with Kalgi Brooch) -->
        <ellipse cx="82" cy="37" rx="3.8" ry="4.8" fill="#173B55"/>
        <!-- Safa Turban Curve & Kalgi -->
        <path d="M 78 35 C 78 30, 86 29, 87 34 Z" fill="#C7AA72"/>
        <line x1="86" y1="31" x2="88" y2="27" stroke="#DEC593" stroke-width="1"/>
        <circle cx="88" cy="27" r="0.8" fill="#FFFDF7"/>

        <!-- Bride (Crimson Bridal Attire, Golden Dupatta Veil, Floral Hair Gajra) -->
        <ellipse cx="73" cy="39" rx="3.5" ry="4.4" fill="#8B1E2D"/>
        <!-- Golden Dupatta Veil draping behind -->
        <path d="M 69 39 Q 67 46 72 48" stroke="#DEC593" stroke-width="1.5" fill="none"/>
        <circle cx="70" cy="37" r="1.1" fill="#FFFDF7"/> <!-- Gajra flower -->

        <!-- V-Shaped Wedding Bonnet Ribbons (Windshield to Hood Grille) -->
        <path d="M 98 43 Q 132 45 168 53" fill="none" stroke="#FFFDF7" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M 98 43 Q 132 45 168 53" fill="none" stroke="#C7AA72" stroke-width="1.0" stroke-dasharray="4 2"/>

        <!-- Big Vintage Round Chrome Headlamp with glowing warm light -->
        <ellipse cx="167" cy="55" rx="4.8" ry="5.8" fill="url(#goldTrimGrad)"/>
        <ellipse cx="168" cy="55" rx="3.2" ry="4.2" fill="#FFFDF7" stroke="#FFE5A3" stroke-width="1"/>
        <ellipse id="car-headlamp-bulb" cx="169" cy="55" rx="2.4" ry="3.2" fill="#FFF5B8" filter="url(#ledGlow)"/>

        <!-- Vintage Radiator Grille & Winged Mascot -->
        <path d="M 166 50 L 172 52 L 171 66 L 165 65 Z" fill="url(#goldTrimGrad)" stroke="#8F712E" stroke-width="0.8"/>
        <line x1="168" y1="52" x2="168" y2="64" stroke="#173B55" stroke-width="0.8"/>
        <!-- Flying Golden Bonnet Mascot -->
        <path d="M 168 49 Q 172 46 174 48 Q 170 50 168 49 Z" fill="#DEC593"/>

        <!-- Front Chrome Bumper with Overriders -->
        <path d="M 162 69 C 172 69, 176 67, 176 62" stroke="url(#goldTrimGrad)" stroke-width="2.6" stroke-linecap="round" fill="none"/>
        <rect x="170" y="60" width="2" height="7" rx="1" fill="#F5EDE0"/>

        <!-- Rear Bumper & Trailing Satin Ribbons -->
        <path d="M 20 69 C 13 69, 11 67, 11 62" stroke="url(#goldTrimGrad)" stroke-width="2.6" stroke-linecap="round" fill="none"/>
        <!-- Heart Plaque at Rear -->
        <path d="M 13 55 C 13 52, 9 51, 7 54 C 5 51, 1 52, 1 55 C 1 59, 7 63, 7 65 C 7 63, 13 59, 13 55 Z" fill="#3D87AE" stroke="#C7AA72" stroke-width="0.8"/>
        <!-- Trailing Silk Satin Ribbons & Bells -->
        <path d="M 11 64 Q 3 67 -2 63 Q -6 59 -12 65" fill="none" stroke="#DEC593" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M 13 66 Q 5 72 0 70 Q -4 68 -9 74" fill="none" stroke="#3D87AE" stroke-width="1.3" stroke-linecap="round"/>
        <circle cx="-12" cy="65" r="1.2" fill="#FFD700"/> <!-- Golden bell -->
        <circle cx="-9" cy="74" r="1.0" fill="#FFD700"/>

        <!-- ── MAGNIFICENT WEDDING FLOWERS ON HOOD, SIDES & BOOT ───────── -->
        <!-- Lush Green Foliage on Hood -->
        <path d="M 126 45 C 134 39, 148 39, 162 46" fill="none" stroke="#2E5A38" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M 120 47 C 130 42, 144 42, 156 48" fill="none" stroke="#4C8057" stroke-width="2.5" stroke-linecap="round"/>

        <!-- Blooming Roses on Hood: Crimson Velvet, Blush Pink, Champagne & Jasmine -->
        <!-- Velvet Crimson Rose 1 -->
        <circle cx="130" cy="43" r="4.2" fill="#8B1E2D"/>
        <circle cx="130" cy="43" r="2.5" fill="#B2283E"/>
        <circle cx="130" cy="43" r="1.2" fill="#E8899E"/>

        <!-- Blush Pink Rose 2 -->
        <circle cx="140" cy="41" r="4.6" fill="#E8899E"/>
        <circle cx="140" cy="41" r="2.8" fill="#F3AFC0"/>
        <circle cx="140" cy="41" r="1.4" fill="#FFFDF7"/>

        <!-- Champagne Gold Rose 3 -->
        <circle cx="150" cy="43" r="4.0" fill="#C7AA72"/>
        <circle cx="150" cy="43" r="2.3" fill="#DEC593"/>
        <circle cx="150" cy="43" r="1.0" fill="#FFFDF7"/>

        <!-- Deep Scarlet Rose 4 -->
        <circle cx="160" cy="47" r="3.8" fill="#701622"/>
        <circle cx="160" cy="47" r="2.0" fill="#9C2433"/>

        <!-- Pearl White Jasmine Florets -->
        <circle cx="123" cy="46" r="2.4" fill="#FFFDF7" stroke="#DEC593" stroke-width="0.5"/>
        <circle cx="135" cy="38" r="2.2" fill="#FFFDF7" stroke="#DEC593" stroke-width="0.5"/>
        <circle cx="146" cy="39" r="2.4" fill="#FFFDF7" stroke="#DEC593" stroke-width="0.5"/>
        <circle cx="164" cy="51" r="2.2" fill="#FFFDF7" stroke="#DEC593" stroke-width="0.5"/>

        <!-- Windshield Arch Floral Garland -->
        <circle cx="95" cy="30" r="2.0" fill="#E8899E"/>
        <circle cx="102" cy="25" r="2.2" fill="#FFFDF7"/>
        <circle cx="108" cy="27" r="2.0" fill="#C7AA72"/>

        <!-- Side Door Floral Garlands (Wedding roses & greenery swag) -->
        <circle cx="68" cy="52" r="2.6" fill="#B2283E"/>
        <circle cx="76" cy="51" r="2.2" fill="#E8899E"/>
        <circle cx="84" cy="51" r="2.4" fill="#FFFDF7"/>
        <circle cx="92" cy="50" r="2.2" fill="#C7AA72"/>
        <path d="M 64 53 Q 80 48 96 52" fill="none" stroke="#4C8057" stroke-width="1.2"/>

        <!-- Rear Floral Cluster on Folded Top Boot -->
        <circle cx="44" cy="36" r="3.2" fill="#B2283E"/>
        <circle cx="51" cy="37" r="2.8" fill="#E8899E"/>
        <circle cx="48" cy="34" r="2.0" fill="#FFFDF7"/>
        <path d="M 40 37 Q 48 32 56 37" fill="none" stroke="#3B6E47" stroke-width="1.8"/>

        <!-- ── AUTHENTIC INDIAN WEDDING CAR BLINKING FAIRY LIGHTS (28 LEDS) ────────── -->
        <!-- Decorative golden wiring harness strings -->
        <path d="M 32 49 Q 86 46 164 53" fill="none" stroke="rgba(199, 170, 114, 0.75)" stroke-width="0.8" stroke-dasharray="2 4"/>
        <path d="M 64 69 Q 84 68 102 69" fill="none" stroke="rgba(199, 170, 114, 0.6)" stroke-width="0.7"/>

        <!-- Blinking LED nodes: 4 alternating phases (Gold, White, Amber, Rose) -->
        <g id="fairy-lights-group" filter="url(#ledGlow)">
          <!-- Bonnet & Hood LED String -->
          <circle class="fairy-light fairy-phase-1" cx="34" cy="49" r="2.5" fill="#FFE066"/>
          <circle class="fairy-light fairy-phase-2" cx="48" cy="48" r="2.3" fill="#FFFFFF"/>
          <circle class="fairy-light fairy-phase-3" cx="62" cy="47" r="2.6" fill="#FFB300"/>
          <circle class="fairy-light fairy-phase-4" cx="76" cy="46" r="2.4" fill="#FF80AB"/>
          <circle class="fairy-light fairy-phase-1" cx="90" cy="45" r="2.5" fill="#FFE066"/>
          <circle class="fairy-light fairy-phase-2" cx="104" cy="44" r="2.4" fill="#FFFFFF"/>
          <circle class="fairy-light fairy-phase-3" cx="118" cy="44" r="2.6" fill="#FFB300"/>
          <circle class="fairy-light fairy-phase-4" cx="132" cy="45" r="2.5" fill="#FF80AB"/>
          <circle class="fairy-light fairy-phase-1" cx="146" cy="47" r="2.6" fill="#FFE066"/>
          <circle class="fairy-light fairy-phase-2" cx="158" cy="51" r="2.5" fill="#FFFFFF"/>
          <circle class="fairy-light fairy-phase-3" cx="166" cy="53" r="2.6" fill="#FFB300"/>

          <!-- Running Board Side LEDs -->
          <circle class="fairy-light fairy-phase-3" cx="68" cy="69" r="2.2" fill="#FFB300"/>
          <circle class="fairy-light fairy-phase-1" cx="78" cy="68" r="2.4" fill="#FFE066"/>
          <circle class="fairy-light fairy-phase-2" cx="88" cy="68" r="2.3" fill="#FFFFFF"/>
          <circle class="fairy-light fairy-phase-4" cx="98" cy="69" r="2.2" fill="#FF80AB"/>

          <!-- Windshield Arch Festive LEDs -->
          <circle class="fairy-light fairy-phase-4" cx="91" cy="44" r="2.2" fill="#FF80AB"/>
          <circle class="fairy-light fairy-phase-1" cx="96" cy="36" r="2.4" fill="#FFE066"/>
          <circle class="fairy-light fairy-phase-2" cx="102" cy="28" r="2.5" fill="#FFFFFF"/>
          <circle class="fairy-light fairy-phase-3" cx="106" cy="26" r="2.4" fill="#FFB300"/>

          <!-- Front Fender & Bumper LEDs -->
          <circle class="fairy-light fairy-phase-1" cx="142" cy="56" r="2.2" fill="#FFE066"/>
          <circle class="fairy-light fairy-phase-2" cx="156" cy="62" r="2.3" fill="#FFFFFF"/>
          <circle class="fairy-light fairy-phase-4" cx="166" cy="67" r="2.2" fill="#FF80AB"/>

          <!-- Rear Fender & Boot LEDs -->
          <circle class="fairy-light fairy-phase-3" cx="24" cy="57" r="2.2" fill="#FFB300"/>
          <circle class="fairy-light fairy-phase-1" cx="30" cy="53" r="2.3" fill="#FFE066"/>
          <circle class="fairy-light fairy-phase-2" cx="44" cy="38" r="2.2" fill="#FFFFFF"/>
          <circle class="fairy-light fairy-phase-4" cx="54" cy="39" r="2.2" fill="#FF80AB"/>
        </g>

        <!-- Curved Wheel Arches -->
        <path d="M 28 68 A 16 16 0 0 1 60 68 Z" fill="#173B55"/>
        <path d="M 28 68 A 16 16 0 0 1 60 68" stroke="url(#goldTrimGrad)" stroke-width="1.3" fill="none"/>

        <path d="M 112 68 A 16 16 0 0 1 144 68 Z" fill="#173B55"/>
        <path d="M 112 68 A 16 16 0 0 1 144 68" stroke="url(#goldTrimGrad)" stroke-width="1.3" fill="none"/>

      </g><!-- /#car-body-group -->

      <!-- Rear Wheel Assembly (Rotating Spokes + Chrome Rims) -->
      <g id="wheel-rear" transform="translate(44, 68)">
        <!-- Rubber Tire with Deep Tread -->
        <circle cx="0" cy="0" r="14" fill="#173B55" stroke="#0F283B" stroke-width="1.8"/>
        <circle cx="0" cy="0" r="11" fill="#224C6D"/>
        <!-- Golden Wire Spokes -->
        <g id="spokes-rear">
          <circle cx="0" cy="0" r="9" fill="none" stroke="url(#goldTrimGrad)" stroke-width="1.1"/>
          <line x1="-9" y1="0" x2="9" y2="0" stroke="url(#goldTrimGrad)" stroke-width="1.3"/>
          <line x1="0" y1="-9" x2="0" y2="9" stroke="url(#goldTrimGrad)" stroke-width="1.3"/>
          <line x1="-6.3" y1="-6.3" x2="6.3" y2="6.3" stroke="url(#goldTrimGrad)" stroke-width="1.3"/>
          <line x1="-6.3" y1="6.3" x2="6.3" y2="-6.3" stroke="url(#goldTrimGrad)" stroke-width="1.3"/>
          <circle cx="0" cy="0" r="3.5" fill="url(#goldTrimGrad)"/>
          <circle cx="0" cy="0" r="1.4" fill="#FFFDF7"/>
        </g>
      </g>

      <!-- Front Steerable Wheel Assembly (Steers with Road Curves) -->
      <g id="wheel-front-pivot" transform="translate(128, 68)">
        <g id="wheel-front-steer">
          <!-- Rubber Tire -->
          <circle cx="0" cy="0" r="14" fill="#173B55" stroke="#0F283B" stroke-width="1.8"/>
          <circle cx="0" cy="0" r="11" fill="#224C6D"/>
          <!-- Golden Wire Spokes -->
          <g id="spokes-front">
            <circle cx="0" cy="0" r="9" fill="none" stroke="url(#goldTrimGrad)" stroke-width="1.1"/>
            <line x1="-9" y1="0" x2="9" y2="0" stroke="url(#goldTrimGrad)" stroke-width="1.3"/>
            <line x1="0" y1="-9" x2="0" y2="9" stroke="url(#goldTrimGrad)" stroke-width="1.3"/>
            <line x1="-6.3" y1="-6.3" x2="6.3" y2="6.3" stroke="url(#goldTrimGrad)" stroke-width="1.3"/>
            <line x1="-6.3" y1="6.3" x2="6.3" y2="-6.3" stroke="url(#goldTrimGrad)" stroke-width="1.3"/>
            <circle cx="0" cy="0" r="3.5" fill="url(#goldTrimGrad)"/>
            <circle cx="0" cy="0" r="1.4" fill="#FFFDF7"/>
          </g>
        </g>
      </g>

    </svg>
  `;

  const carBodyGroup   = document.getElementById('car-body-group');
  const groundShadow   = document.getElementById('car-ground-shadow');
  const spokesFront    = document.getElementById('spokes-front');
  const spokesRear     = document.getElementById('spokes-rear');
  const frontSteerGrp  = document.getElementById('wheel-front-steer');
  const headlightBeam  = document.getElementById('car-headlight-cone');

  // ── Animation & Physics State ──────────────────────────────────────────
  let progress         = 0;
  let rafId            = null;
  let running          = false;
  let hasCompleted     = false;
  let isVisible        = false;
  let startTimeout     = null;
  let startTime        = null;
  let wheelAngle       = 0;
  let bouncePhase      = 0;
  let prevLen          = 0;
  let stardustCounter  = 0;

  const DURATION_MS    = prefersReducedMotion ? 50 : 5600;
  const CAR_WIDTH      = 135;
  const CAR_HEIGHT     = 78;

  // Ultra-Smooth Cosine Easing (No jerky acceleration or stopping)
  function smoothCosine(t) {
    return 0.5 * (1 - Math.cos(Math.PI * t));
  }

  // High-performance Stardust Particle Spawner
  function spawnStardust(x, y) {
    if (prefersReducedMotion || !stardustGroup) return;
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    const rx = x + (Math.random() - 0.5) * 12;
    const ry = y + (Math.random() - 0.5) * 8;
    const r  = 1.0 + Math.random() * 2.2;
    const color = Math.random() > 0.5 ? '#FFE066' : '#DEC593';
    dot.setAttribute('cx', rx.toFixed(1));
    dot.setAttribute('cy', ry.toFixed(1));
    dot.setAttribute('r', r.toFixed(1));
    dot.setAttribute('fill', color);
    dot.style.opacity = '0.9';
    dot.style.transition = 'opacity 0.7s ease-out, transform 0.7s ease-out';
    stardustGroup.appendChild(dot);

    requestAnimationFrame(() => {
      dot.style.opacity = '0';
      dot.style.transform = `scale(0.3) translateY(${4 + Math.random() * 6}px)`;
    });

    setTimeout(() => {
      if (dot.parentNode) dot.parentNode.removeChild(dot);
    }, 750);
  }

  // ── Position Car Using Precomputed Path (Zero Reflows!) ────────────────
  function positionCar(easedProgress) {
    const lutIdx = Math.min(Math.floor(easedProgress * LUT_SAMPLES), LUT_SAMPLES);
    const pt = pathLUT[lutIdx] || pathLUT[0];

    // High-precision GPU translation (no offsetWidth calls!)
    const px = pt.x * scaleX - CAR_WIDTH / 2;
    const py = pt.y * scaleY - CAR_HEIGHT * 0.72;

    // Subtle natural suspension bounce
    bouncePhase += 0.14;
    const bounceY = Math.sin(bouncePhase) * 2.0;

    // Wheel rotation based on distance travelled
    const deltaLen = Math.abs(easedProgress * totalLength - prevLen);
    prevLen = easedProgress * totalLength;
    wheelAngle = (wheelAngle + deltaLen * 4.2) % 360;

    // Correct front steering angle (steers naturally into curve)
    const steerAngle = Math.max(-18, Math.min(18, pt.angle * 0.8));

    // Hardware accelerated 3D transform on GPU compositor thread
    carWrapper.style.transform = `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0) rotate(${ (pt.angle * 0.28).toFixed(2) }deg)`;

    if (carBodyGroup) {
      carBodyGroup.setAttribute('transform', `translate(0, ${bounceY.toFixed(2)})`);
    }
    if (groundShadow) {
      groundShadow.setAttribute('transform', `scale(${ (1 - Math.abs(bounceY) * 0.04).toFixed(3) })`);
    }
    if (spokesFront) {
      spokesFront.setAttribute('transform', `rotate(${wheelAngle.toFixed(1)})`);
    }
    if (spokesRear) {
      spokesRear.setAttribute('transform', `rotate(${wheelAngle.toFixed(1)})`);
    }
    if (frontSteerGrp) {
      frontSteerGrp.setAttribute('transform', `rotate(${steerAngle.toFixed(1)})`);
    }

    // Spawn trailing golden stardust while moving
    stardustCounter++;
    if (stardustCounter % 4 === 0 && running && progress > 0.05 && progress < 0.95) {
      spawnStardust(pt.x - 15, pt.y + 12);
    }
  }

  function placeDestinationHeart() {
    const endPt = pathLUT[LUT_SAMPLES] || travelPath.getPointAtLength(totalLength);
    heartGroup.setAttribute('transform', `translate(${endPt.x}, ${endPt.y})`);
    heartGroup.style.transition = 'opacity 0.8s ease';
    heartGroup.setAttribute('opacity', '1');
  }

  // ── High-FPS Smooth Animation Loop ─────────────────────────────────────
  function animate(ts) {
    if (!isVisible || document.hidden) {
      running = false;
      rafId = null;
      return;
    }

    if (!startTime) startTime = ts - progress * DURATION_MS;
    const elapsed = ts - startTime;
    progress = Math.min(elapsed / DURATION_MS, 1);

    const eased = smoothCosine(progress);
    const currentLen = eased * totalLength;

    // Draw active trail behind car
    drawnTrail.style.strokeDashoffset = totalLength - currentLen;

    // Update car position, wheels, suspension, and stardust
    positionCar(eased);

    // Reveal greeting at 38%
    if (progress >= 0.38 && greeting && !greeting.classList.contains('visible')) {
      greeting.classList.add('visible');
    }

    // Reveal date at 80%
    if (progress >= 0.80 && dateReveal && !dateReveal.classList.contains('visible')) {
      dateReveal.classList.add('visible');
    }

    if (progress < 1) {
      rafId = requestAnimationFrame(animate);
    } else {
      // Completed journey
      running = false;
      hasCompleted = true;
      rafId = null;
      carWrapper.classList.remove('is-travelling');
      carWrapper.classList.add('has-arrived');
      if (headlightBeam) {
        headlightBeam.style.opacity = '0.35';
        headlightBeam.style.transition = 'opacity 1s ease';
      }
      placeDestinationHeart();
    }
  }

  function startJourney() {
    if (running || hasCompleted) return;
    running      = true;
    startTime    = null;
    carWrapper.style.opacity = '1';
    carWrapper.style.transition = 'opacity 0.4s ease';
    carWrapper.classList.add('is-travelling');
    carWrapper.classList.remove('has-arrived');
    if (headlightBeam) {
      headlightBeam.style.opacity = '0.85';
      headlightBeam.style.transition = 'opacity 0.4s ease';
    }

    if (prefersReducedMotion) {
      progress = 1;
      drawnTrail.style.strokeDashoffset = 0;
      positionCar(1);
      if (greeting) greeting.classList.add('visible');
      if (dateReveal) dateReveal.classList.add('visible');
      placeDestinationHeart();
      carWrapper.classList.remove('is-travelling');
      carWrapper.classList.add('has-arrived');
      running = false;
      hasCompleted = true;
      return;
    }

    rafId = requestAnimationFrame(animate);
  }

  function resetJourney() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (startTimeout) { clearTimeout(startTimeout); startTimeout = null; }
    running      = false;
    hasCompleted = false;
    progress     = 0;
    startTime    = null;
    prevLen      = 0;
    drawnTrail.style.strokeDashoffset = totalLength;
    heartGroup.setAttribute('opacity', '0');
    if (greeting) greeting.classList.remove('visible');
    if (dateReveal) dateReveal.classList.remove('visible');
    carWrapper.classList.remove('is-travelling');
    carWrapper.classList.remove('has-arrived');
    if (headlightBeam) headlightBeam.style.opacity = '0';
    carWrapper.style.opacity = '0';

    // Brief settling before starting
    setTimeout(() => {
      startJourney();
    }, 180);
  }

  // ── Substantial Visibility Detection (500ms delay, responsive) ──────────
  function checkSubstantialVisibility() {
    const rect = stage.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return rect.top < vh * 0.75 && rect.bottom > vh * 0.25;
  }

  function handleVisibilityChange() {
    const nowVisible = checkSubstantialVisibility();

    if (nowVisible && !isVisible) {
      isVisible = true;
      if (!hasCompleted && !running) {
        if (startTimeout) clearTimeout(startTimeout);
        startTimeout = setTimeout(() => {
          if (isVisible && !hasCompleted && !running) {
            startJourney();
          }
        }, 500);
      } else if (running && progress > 0 && progress < 1) {
        startTime = null;
        rafId = requestAnimationFrame(animate);
      }
    } else if (!nowVisible && isVisible) {
      isVisible = false;
      if (startTimeout) {
        clearTimeout(startTimeout);
        startTimeout = null;
      }
      if (running && rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
        running = false;
      }
    }
  }

  // IntersectionObserver + scroll listener
  const io = new IntersectionObserver(() => {
    handleVisibilityChange();
  }, { threshold: [0, 0.2, 0.4, 0.6, 0.8] });

  io.observe(stage);
  window.addEventListener('scroll', handleVisibilityChange, { passive: true });
  window.addEventListener('resize', () => {
    updateDimensions();
    if (hasCompleted) {
      positionCar(1);
      placeDestinationHeart();
    }
  }, { passive: true });

  // Tab visibility handling
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (running && rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
        running = false;
      }
    } else {
      if (isVisible && !hasCompleted && progress > 0) {
        startTime = null;
        running = true;
        rafId = requestAnimationFrame(animate);
      }
    }
  });

  // Replay Button wiring
  if (replayBtn) {
    replayBtn.addEventListener('click', resetJourney);
    replayBtn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); resetJourney(); }
    });
  }

  // Initial car placement at start of road
  positionCar(0);
  carWrapper.style.opacity = '1';

})();
