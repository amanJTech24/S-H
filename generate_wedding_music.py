import numpy as np
import wave, math, subprocess, os

SR = 44100
DUR = 60.0 # 60 seconds seamless loop
N = int(SR * DUR)

t = np.linspace(0, DUR, N, endpoint=False)
left = np.zeros(N, dtype=np.float64)
right = np.zeros(N, dtype=np.float64)

# ── Scale: Raag Bhupali (Key of C# / Db) — Auspicious Peaceful Wedding Raga
# Notes: Sa, Re, Ga, Pa, Dha
SA3  = 138.59
PA3  = 207.65
SA4  = 277.18
RE4  = 311.13
GA4  = 349.23
PA4  = 415.30
DHA4 = 466.16
SA5  = 554.37
RE5  = 622.25
GA5  = 698.46
PA5  = 830.61

# ── 1. Tanpura & Deep Ambient Warmth Drone ───────────────────────────────
drone_freqs = [69.30, SA3, PA3, SA4, GA4, PA4]
for idx, f in enumerate(drone_freqs):
    lfo1 = 0.82 + 0.18 * np.sin(2 * np.pi * 0.11 * t + idx * 0.9)
    lfo2 = 0.82 + 0.18 * np.cos(2 * np.pi * 0.16 * t + idx * 1.3)
    # Warm rich acoustic drone with gentle warm harmonics
    w = (np.sin(2 * np.pi * f * t) +
         0.35 * np.sin(2 * np.pi * 2 * f * t) +
         0.12 * np.sin(2 * np.pi * 3 * f * t) +
         0.04 * np.sin(2 * np.pi * 4 * f * t))
    vol = 0.045 / (1.0 + idx * 0.35)
    pan = 0.35 + 0.3 * (idx % 2)
    left  += w * lfo1 * vol * (1.0 - pan)
    right += w * lfo2 * vol * pan

# ── 2. Helper: Synthesize Bansuri (Bamboo Flute) Note ─────────────────────
# Bansuri features: soft attack, gentle chiff breath noise, singing vibrato, warm round tone
def add_bansuri_note(start_sec, dur_sec, freq, end_freq=None, vol=0.18, pan=0.48):
    if end_freq is None:
        end_freq = freq
    start_idx = int(start_sec * SR)
    dur_idx = int(dur_sec * SR)
    end_idx = min(N, start_idx + dur_idx)
    if start_idx >= N:
        return

    actual_len = end_idx - start_idx
    nt = np.linspace(0, dur_sec, actual_len, endpoint=False)

    # Smooth pitch transition (Meend glide)
    cur_freq = np.linspace(freq, end_freq, actual_len)

    # Expressive vibrato (starts after 0.25s, around 4.8 Hz)
    vib_delay = np.clip((nt - 0.25) / 0.5, 0, 1)
    vibrato = np.sin(2 * np.pi * 4.8 * nt) * (cur_freq * 0.015) * vib_delay
    instant_freq = cur_freq + vibrato

    phase = 2 * np.pi * np.cumsum(instant_freq) / SR

    # Flute tone: dominant fundamental + gentle 2nd, 3rd, 4th harmonics + warm air breathiness
    tone = (np.sin(phase) +
            0.22 * np.sin(2 * phase) +
            0.08 * np.sin(3 * phase) +
            0.03 * np.sin(4 * phase))

    # Breathiness (pinkish noise)
    noise = np.random.randn(actual_len) * 0.02
    tone += noise

    # Smooth ADSR envelope: 120ms attack, gentle decay, sustained singing body, 250ms release
    env = np.ones(actual_len)
    att_samples = int(min(0.14 * SR, actual_len * 0.4))
    rel_samples = int(min(0.28 * SR, actual_len * 0.4))

    env[:att_samples] = 0.5 * (1 - np.cos(np.pi * np.arange(att_samples) / att_samples))
    env[-rel_samples:] = 0.5 * (1 + np.cos(np.pi * np.arange(rel_samples) / rel_samples))

    note_signal = tone * env * vol
    left[start_idx:end_idx]  += note_signal * (1.0 - pan)
    right[start_idx:end_idx] += note_signal * pan

# ── 3. Helper: Synthesize Santoor / Harp Pluck ────────────────────────────
def add_santoor_pluck(start_sec, freq, vol=0.08, decay=1.8, pan=0.5):
    start_idx = int(start_sec * SR)
    dur_sec = min(decay * 2.2, DUR - start_sec)
    if dur_sec <= 0:
        return
    dur_idx = int(dur_sec * SR)
    end_idx = min(N, start_idx + dur_idx)

    actual_len = end_idx - start_idx
    st = np.linspace(0, dur_sec, actual_len, endpoint=False)

    # Natural acoustic plucked string (Karplus-like harmonic sum)
    pluck = (np.sin(2 * np.pi * freq * st) * np.exp(-st * (2.8 / decay)) +
             0.5 * np.sin(2 * np.pi * 2 * freq * st) * np.exp(-st * (4.2 / decay)) +
             0.25 * np.sin(2 * np.pi * 3 * freq * st) * np.exp(-st * (6.5 / decay)) +
             0.12 * np.sin(2 * np.pi * 4 * freq * st) * np.exp(-st * (9.0 / decay)))

    pluck_signal = pluck * vol
    left[start_idx:end_idx]  += pluck_signal * (1.0 - pan)
    right[start_idx:end_idx] += pluck_signal * pan

# ── 4. Helper: Temple Bell / Singing Bowl Chime ───────────────────────────
def add_bell_chime(start_sec, freq, vol=0.06, decay=4.5):
    start_idx = int(start_sec * SR)
    dur_sec = min(decay * 2.5, DUR - start_sec)
    if dur_sec <= 0:
        return
    dur_idx = int(dur_sec * SR)
    end_idx = min(N, start_idx + dur_idx)

    actual_len = end_idx - start_idx
    bt = np.linspace(0, dur_sec, actual_len, endpoint=False)

    # Metallic inharmonic partials
    chime = (np.sin(2 * np.pi * freq * bt) * np.exp(-bt * 0.7) +
             0.4 * np.sin(2 * np.pi * (freq * 2.76) * bt) * np.exp(-bt * 1.4) +
             0.2 * np.sin(2 * np.pi * (freq * 5.40) * bt) * np.exp(-bt * 2.5) +
             0.1 * np.sin(2 * np.pi * (freq * 8.93) * bt) * np.exp(-bt * 3.8))

    chime_signal = chime * vol
    left[start_idx:end_idx]  += chime_signal * 0.5
    right[start_idx:end_idx] += chime_signal * 0.5

# ── 5. Compose the Melodic Phrases ───────────────────────────────────────
# Phrase 1 (0.8s - 14s): Peaceful Opening Alaap
add_bell_chime(0.8, 554.37, vol=0.07, decay=5.0)

# Santoor gentle opening ripples
santoor_arpeggio1 = [(0.5, SA3), (0.9, PA3), (1.3, SA4), (1.7, GA4), (2.1, PA4), (2.5, SA5)]
for stime, sfreq in santoor_arpeggio1:
    add_santoor_pluck(stime, sfreq, vol=0.06, decay=1.6, pan=0.35 + 0.3 * (sfreq % 2))

# Bansuri Melody — Phrase 1 (Deep peace and devotion)
# Sa -> Re -> Ga -> Pa -> Ga -> Re -> Sa
add_bansuri_note(2.8,  2.2, SA4, end_freq=RE4, vol=0.17, pan=0.46)
add_bansuri_note(5.2,  3.0, GA4, end_freq=GA4, vol=0.19, pan=0.48)
add_bansuri_note(8.4,  2.4, PA4, end_freq=GA4, vol=0.18, pan=0.52)
add_bansuri_note(11.0, 2.8, RE4, end_freq=SA4, vol=0.16, pan=0.50)

# Phrase 2 (14s - 28s): Joyful Romantic Ascent
add_bell_chime(14.2, 415.30, vol=0.06, decay=4.8)

santoor_arpeggio2 = [(14.0, GA4), (14.3, PA4), (14.6, DHA4), (14.9, SA5), (15.2, GA5)]
for stime, sfreq in santoor_arpeggio2:
    add_santoor_pluck(stime, sfreq, vol=0.07, decay=1.8, pan=0.6)

# Bansuri Melody — Phrase 2
# Ga -> Pa -> Dha -> Sa' -> Dha -> Pa
add_bansuri_note(15.8, 2.4, GA4,  end_freq=PA4,  vol=0.18, pan=0.45)
add_bansuri_note(18.4, 2.2, DHA4, end_freq=SA5,  vol=0.20, pan=0.48)
add_bansuri_note(20.8, 3.4, SA5,  end_freq=SA5,  vol=0.22, pan=0.50)
add_bansuri_note(24.4, 2.6, DHA4, end_freq=PA4,  vol=0.18, pan=0.54)

# Phrase 3 (28s - 43s): Heartfelt Celestial Climax (Pahadi / Yaman summit)
add_bell_chime(28.5, 622.25, vol=0.08, decay=5.2)

# Cascading harp / santoor waterfall
santoor_cascade = [
    (27.8, SA5), (28.1, DHA4), (28.4, PA4), (28.7, GA4), (29.0, RE4), (29.3, SA4),
    (30.0, SA4), (30.3, GA4),  (30.6, PA4), (30.9, DHA4), (31.2, SA5), (31.5, RE5)
]
for stime, sfreq in santoor_cascade:
    add_santoor_pluck(stime, sfreq, vol=0.065, decay=1.5, pan=0.3 + 0.4 * (sfreq % 3 / 2))

# Bansuri Melody — Phrase 3
# Sa' -> Re' -> Ga' -> Re' -> Sa' -> Dha -> Pa -> Ga
add_bansuri_note(31.8, 2.6, SA5, end_freq=RE5, vol=0.21, pan=0.48)
add_bansuri_note(34.6, 3.2, GA5, end_freq=RE5, vol=0.23, pan=0.52)
add_bansuri_note(38.0, 2.8, SA5, end_freq=DHA4, vol=0.20, pan=0.47)
add_bansuri_note(41.0, 2.4, PA4, end_freq=GA4,  vol=0.18, pan=0.51)

# Phrase 4 (43s - 57s): Calming Descent & Resolution
add_bell_chime(43.5, 466.16, vol=0.06, decay=4.6)

santoor_arpeggio3 = [(43.2, PA4), (43.6, GA4), (44.0, RE4), (44.4, SA4)]
for stime, sfreq in santoor_arpeggio3:
    add_santoor_pluck(stime, sfreq, vol=0.06, decay=1.7, pan=0.4)

# Bansuri Melody — Phrase 4
# Ga -> Re -> Sa -> Re -> Ga -> Sa (final peaceful resolution)
add_bansuri_note(44.8, 2.5, GA4, end_freq=RE4, vol=0.17, pan=0.48)
add_bansuri_note(47.5, 3.2, SA4, end_freq=SA4, vol=0.18, pan=0.50)
add_bansuri_note(51.0, 2.2, RE4, end_freq=GA4, vol=0.16, pan=0.46)
add_bansuri_note(53.4, 3.8, SA4, end_freq=SA4, vol=0.17, pan=0.50)

# Gentle closing chimes before loop reset
for chime_time, chime_f in [(55.5, SA5), (56.8, PA4), (58.0, SA4)]:
    add_santoor_pluck(chime_time, chime_f, vol=0.045, decay=2.4, pan=0.5)

# ── 6. Acoustic Reverb Simulation (Warm Palatial Hall Reflection) ─────────
# Schroeder-style comb filter reverb simulation for lush spaciousness
reverb_delay_samples = [int(0.029 * SR), int(0.037 * SR), int(0.043 * SR), int(0.051 * SR)]
rev_left = np.zeros(N)
rev_right = np.zeros(N)

for d in reverb_delay_samples:
    rev_left[d:]  += left[:-d] * 0.22
    rev_right[d:] += right[:-d] * 0.22

# Second delay bounce for cathedral/palace tail
d2 = int(0.088 * SR)
rev_left[d2:]  += rev_right[:-d2] * 0.14
rev_right[d2:] += rev_left[:-d2] * 0.14

left  += rev_left * 0.55
right += rev_right * 0.55

# ── 7. Seamless Loop Crossfade (Wrap last 2.5s into first 2.5s) ───────────
cross_samples = int(2.5 * SR)
fade_out = np.linspace(1, 0, cross_samples)
fade_in  = np.linspace(0, 1, cross_samples)

# Blend end into start
left[:cross_samples]  = left[:cross_samples] * fade_in + left[-cross_samples:] * fade_out
right[:cross_samples] = right[:cross_samples] * fade_in + right[-cross_samples:] * fade_out

# Trim end to keep exact seamless loop
left[-cross_samples:]  *= fade_in
right[-cross_samples:] *= fade_in

# ── 8. Soft Limiting & Master Normalization ────────────────────────────────
peak = max(np.max(np.abs(left)), np.max(np.abs(right)))
if peak > 0:
    target_peak = 0.88 # -1.1 dB headroom
    left  = (left / peak) * target_peak
    right = (right / peak) * target_peak

# Convert to 16-bit PCM stereo
audio_stereo = np.zeros((N, 2), dtype=np.int16)
audio_stereo[:, 0] = np.int16(left * 32767.0)
audio_stereo[:, 1] = np.int16(right * 32767.0)

wav_path = r'c:\Users\window\.gemini\antigravity-ide\scratch\wedding-srishti-himanshu\assets\audio\peaceful_wedding_melody.wav'
mp3_path = r'c:\Users\window\.gemini\antigravity-ide\scratch\wedding-srishti-himanshu\assets\audio\peaceful_wedding_melody.mp3'

with wave.open(wav_path, 'wb') as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(SR)
    wf.writeframes(audio_stereo.tobytes())

print(f'WAV generated successfully at {wav_path}')

# Encode to MP3 with ffmpeg
cmd = ['ffmpeg', '-y', '-i', wav_path, '-codec:a', 'libmp3lame', '-b:a', '128k', mp3_path]
res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode == 0:
    print(f'MP3 successfully encoded at {mp3_path}')
    # Clean up large WAV to keep repo lightweight
    try:
        os.remove(wav_path)
        print('Cleaned up temporary WAV')
    except:
        pass
else:
    print('ffmpeg error:', res.stderr[:200])
