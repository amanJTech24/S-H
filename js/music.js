// js/music.js
// ─────────────────────────────────────────────────────────────────────────
//  Background music controller with:
//  - Persistent volume slider + mute/play toggle
//  - Gentle fade-in after envelope is opened
//  - No restart between sections (continuous loop)
//  - Respects browser autoplay restrictions
//  - Respects prefers-reduced-motion (doesn't affect audio, only UI)
//  - Generates a soft, pleasant ambient tone via Web Audio API as fallback
//    when no music file is configured (using a gentle synthesized melody)
// ─────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  if (typeof WEDDING === 'undefined') return;

  const controls  = document.getElementById('music-controls');
  const toggleBtn = document.getElementById('music-toggle');
  const volumeSlider = document.getElementById('music-volume');
  const audioEl   = document.getElementById('site-audio');

  if (!controls || !toggleBtn || !audioEl) return;

  const hasSrc = WEDDING.music && WEDDING.music.src;

  // ── If no music file configured, generate ambient tone via WebAudio ───
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

      // Soft harmonious ambient tones (S & H wedding)
      const tones = [
        { freq: 261.63, vol: 0.08, type: 'sine' },   // C4
        { freq: 329.63, vol: 0.06, type: 'sine' },   // E4
        { freq: 392.00, vol: 0.05, type: 'sine' },   // G4
        { freq: 523.25, vol: 0.04, type: 'sine' },   // C5 octave
      ];

      tones.forEach(t => {
        const osc  = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = t.type;
        osc.frequency.setValueAtTime(t.freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(t.vol, audioCtx.currentTime);

        // Gentle vibrato
        const lfo  = audioCtx.createOscillator();
        const lGain = audioCtx.createGain();
        lfo.frequency.setValueAtTime(0.4, audioCtx.currentTime);
        lGain.gain.setValueAtTime(1.5, audioCtx.currentTime);
        lfo.connect(lGain);
        lGain.connect(osc.frequency);
        lfo.start();

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        oscillators.push(osc);
      });

      usingWebAudio = true;
      return true;
    } catch (e) {
      return false;
    }
  }

  // ── State ─────────────────────────────────────────────────────────────
  let playing      = false;
  let targetVolume = 0.30;
  let fadeRafId    = null;

  // ── Volume from slider ─────────────────────────────────────────────────
  function getSliderVol() {
    return (parseInt(volumeSlider.value, 10) || 30) / 100;
  }

  // ── Fade helpers ──────────────────────────────────────────────────────
  function cancelFade() {
    if (fadeRafId) { cancelAnimationFrame(fadeRafId); fadeRafId = null; }
  }

  function fadeTo(targetVol, durationMs, onDone) {
    cancelFade();
    const startVol  = usingWebAudio
      ? masterGain.gain.value
      : audioEl.volume;
    const startTime = performance.now();

    function step(now) {
      const t = Math.min((now - startTime) / durationMs, 1);
      const easedT = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
      const vol = startVol + (targetVol - startVol) * easedT;

      if (usingWebAudio) {
        masterGain.gain.setValueAtTime(vol, audioCtx.currentTime);
      } else {
        audioEl.volume = Math.max(0, Math.min(1, vol));
      }

      updateVolumeSliderFill(vol);

      if (t < 1) {
        fadeRafId = requestAnimationFrame(step);
      } else {
        fadeRafId = null;
        if (onDone) onDone();
      }
    }
    fadeRafId = requestAnimationFrame(step);
  }

  function updateVolumeSliderFill(vol) {
    if (!volumeSlider) return;
    const pct = Math.round(vol * 100);
    volumeSlider.style.background =
      `linear-gradient(90deg, #B8975A ${pct}%, rgba(184,151,90,0.25) ${pct}%)`;
  }

  // ── Play / pause ──────────────────────────────────────────────────────
  function setIcon() {
    toggleBtn.textContent = playing ? '⏸' : '♪';
    toggleBtn.setAttribute('aria-label', playing ? 'Pause music' : 'Play background music');
  }

  function startMusic() {
    targetVolume = getSliderVol();

    if (usingWebAudio) {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      fadeTo(targetVolume, 1200);
      playing = true;
      setIcon();
      return;
    }

    if (hasSrc) {
      audioEl.volume = 0;
      audioEl.play().then(() => {
        playing = true;
        fadeTo(targetVolume, 1200);
        setIcon();
      }).catch(() => {
        // Autoplay blocked — user must interact first
        playing = false;
        setIcon();
      });
    } else {
      // No src and WebAudio not initialised — try now
      if (initWebAudio()) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        fadeTo(targetVolume, 1200);
        playing = true;
        setIcon();
      }
    }
  }

  function stopMusic(fadeMs = 700) {
    playing = false;
    setIcon();
    fadeTo(0, fadeMs, () => {
      if (usingWebAudio) {
        if (audioCtx) audioCtx.suspend();
      } else {
        audioEl.pause();
      }
    });
  }

  function toggleMusic() {
    if (playing) {
      stopMusic();
    } else {
      // Init WebAudio lazily (needs user gesture)
      if (!hasSrc && !usingWebAudio) {
        initWebAudio();
      }
      startMusic();
    }
  }

  // ── Volume slider interaction ─────────────────────────────────────────
  volumeSlider.addEventListener('input', () => {
    targetVolume = getSliderVol();
    if (usingWebAudio && masterGain) {
      masterGain.gain.setValueAtTime(playing ? targetVolume : 0, audioCtx.currentTime);
    } else {
      if (playing) audioEl.volume = targetVolume;
    }
    updateVolumeSliderFill(targetVolume);
  });

  // ── Envelope opened event — gentle fade in ────────────────────────────
  document.addEventListener('envelopeOpened', () => {
    controls.classList.remove('hidden');

    if (hasSrc) {
      audioEl.src    = WEDDING.music.src;
      audioEl.loop   = true;
      audioEl.volume = 0;
      audioEl.load();
    }

    // Gently attempt autoplay after envelope opens (user interacted with envelope)
    setTimeout(() => {
      if (!playing) {
        if (hasSrc) {
          audioEl.play().then(() => {
            playing = true;
            fadeTo(getSliderVol(), 2000);
            setIcon();
          }).catch(() => {
            // Autoplay restricted — controls are visible for user to start manually
          });
        } else if (!usingWebAudio) {
          // WebAudio needs explicit user gesture; leave controls ready
        }
      }
    }, 1200);
  }, { once: true });

  // ── Bind events ───────────────────────────────────────────────────────
  toggleBtn.addEventListener('click', toggleMusic);
  toggleBtn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMusic(); }
  });

  // ── Init UI ───────────────────────────────────────────────────────────
  updateVolumeSliderFill(targetVolume);
  setIcon();

  // Show controls — will be revealed after envelope opens
  // (hidden initially via CSS)

})();
