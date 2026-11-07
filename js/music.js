// js/music.js
// ─────────────────────────────────────────────────────────────────────────
//  Calm Background Instrumental Music Controller
//  - Begins ONLY after opening interaction (opening or skipping envelope).
//  - Persistent mute/volume controls (floating pill).
//  - No restart during scrolling (continuous loop).
//  - Web Audio API soft harmonic ambient tone if no audio file configured.
// ─────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  if (typeof WEDDING === 'undefined') return;

  const controls     = document.getElementById('music-controls');
  const toggleBtn    = document.getElementById('music-toggle');
  const volumeSlider = document.getElementById('music-volume');
  const audioEl      = document.getElementById('site-audio');

  if (!controls || !toggleBtn || !audioEl) return;

  const hasSrc = WEDDING.music && WEDDING.music.src;

  // Preload audio track if configured
  if (hasSrc && audioEl) {
    audioEl.preload = 'auto';
    audioEl.loop = true;
    audioEl.src = WEDDING.music.src;
  }

  // Web Audio Harmonic Ambient Generator Fallback
  let audioCtx    = null;
  let masterGain  = null;
  let oscillators = [];
  let usingWebAudio = false;

  function initWebAudio() {
    try {
      audioCtx   = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);

      // Low-pass filter for soft, warm acoustic presence
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, audioCtx.currentTime);
      filter.connect(masterGain);

      // Soft D Major warm romantic harmonic frequencies (heartfelt, peaceful, comforting)
      const tones = [
        { freq: 146.83, vol: 0.04, type: 'sine' },     // D3 - Grounding warm bass
        { freq: 220.00, vol: 0.035, type: 'sine' },    // A3 - Harmonious fifth
        { freq: 293.66, vol: 0.03, type: 'triangle' }, // D4 - Sweet acoustic warmth
        { freq: 369.99, vol: 0.025, type: 'sine' },    // F#4 - Uplifting, heartfelt major third
        { freq: 440.00, vol: 0.02, type: 'sine' },     // A4 - Soft sparkling glow
      ];

      tones.forEach(t => {
        const osc  = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = t.type;
        osc.frequency.setValueAtTime(t.freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(t.vol, audioCtx.currentTime);

        // Gentle undulating vibrato
        const lfo   = audioCtx.createOscillator();
        const lGain = audioCtx.createGain();
        lfo.frequency.setValueAtTime(0.2, audioCtx.currentTime);
        lGain.gain.setValueAtTime(1.1, audioCtx.currentTime);
        lfo.connect(lGain);
        lGain.connect(osc.frequency);
        lfo.start();

        osc.connect(gain);
        gain.connect(filter);
        osc.start();
        oscillators.push(osc);
      });

      usingWebAudio = true;
      return true;
    } catch (e) {
      return false;
    }
  }

  let isPlaying    = false;
  let targetVolume = 0.28;
  let fadeRafId    = null;

  function getSliderVolume() {
    return (parseInt(volumeSlider.value, 10) || 30) / 100;
  }

  function fadeTo(targetVol, durationMs) {
    if (fadeRafId) cancelAnimationFrame(fadeRafId);
    const startVol  = usingWebAudio ? (masterGain ? masterGain.gain.value : 0) : audioEl.volume;
    const startTime = performance.now();

    function step(now) {
      const elapsed = Math.min((now - startTime) / durationMs, 1);
      const current = startVol + (targetVol - startVol) * elapsed;
      if (usingWebAudio && masterGain && audioCtx) {
        masterGain.gain.setValueAtTime(current, audioCtx.currentTime);
      } else if (!usingWebAudio) {
        audioEl.volume = Math.max(0, Math.min(1, current));
      }
      if (elapsed < 1) {
        fadeRafId = requestAnimationFrame(step);
      } else {
        fadeRafId = null;
      }
    }
    fadeRafId = requestAnimationFrame(step);
  }

  function playMusic() {
    if (isPlaying) return;

    if (hasSrc) {
      if (!audioEl.src || !audioEl.src.includes('peaceful_wedding_melody')) {
        audioEl.src = WEDDING.music.src;
      }
      audioEl.loop = true;
      audioEl.play().then(() => {
        isPlaying = true;
        updateUI();
        fadeTo(getSliderVolume(), 2200);
      }).catch((err) => {
        console.warn('Audio playback error, falling back to Web Audio:', err);
        // Fallback to Web Audio if audio element fails
        if (initWebAudio()) {
          isPlaying = true;
          updateUI();
          fadeTo(getSliderVolume(), 2200);
        }
      });
    } else {
      if (!audioCtx) initWebAudio();
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      isPlaying = true;
      updateUI();
      fadeTo(getSliderVolume(), 2200);
    }
  }

  function pauseMusic() {
    if (!isPlaying) return;
    fadeTo(0, 600);
    setTimeout(() => {
      if (hasSrc) audioEl.pause();
      if (audioCtx && audioCtx.state === 'running') audioCtx.suspend();
      isPlaying = false;
      updateUI();
    }, 650);
  }

  function toggleMusic() {
    if (isPlaying) pauseMusic();
    else playMusic();
  }

  function updateUI() {
    toggleBtn.textContent = isPlaying ? '❚❚' : '♪';
    toggleBtn.setAttribute('aria-label', isPlaying ? 'Pause background music' : 'Play background music');
    controls.classList.remove('hidden');
  }

  // Volume slider event
  volumeSlider.addEventListener('input', () => {
    const vol = getSliderVolume();
    if (usingWebAudio && masterGain && audioCtx) {
      masterGain.gain.setValueAtTime(vol, audioCtx.currentTime);
    } else if (!usingWebAudio) {
      audioEl.volume = vol;
    }
    if (vol === 0 && isPlaying) {
      pauseMusic();
    } else if (vol > 0 && !isPlaying) {
      playMusic();
    }
  });

  toggleBtn.addEventListener('click', toggleMusic);

  // Trigger music only after opening interaction
  document.addEventListener('envelopeOpened', () => {
    controls.classList.remove('hidden');
    playMusic();
  }, { once: true });

})();
