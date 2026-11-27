// Audio: every sound is synthesized with WebAudio — no audio files, no
// network. The context is created lazily on the first user gesture.

let ctx = null;
let master = null;

export function ensureAudio() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume();
    return;
  }
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);
  } catch (_e) {
    ctx = null; // headless or blocked: the game stays silent, never crashes
  }
}

function tone(freq, dur, type, slideTo, when = 0) {
  if (!ctx || !master) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t0 + dur);
  gain.gain.setValueAtTime(0.9, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain);
  gain.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noiseBurst(dur, when = 0) {
  if (!ctx || !master) return;
  const t0 = ctx.currentTime + when;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const gain = ctx.createGain();
  gain.gain.value = 0.5;
  src.connect(gain);
  gain.connect(master);
  src.start(t0);
}

export const sounds = {
  // The turkey's own gobble: two quick low honks.
  gobble() { tone(320, 0.12, 'sawtooth', 180); tone(300, 0.14, 'sawtooth', 160, 0.13); },
  // Corn pickup: bright rising chirp.
  chirp() { tone(660, 0.09, 'sine', 990); tone(990, 0.1, 'sine', 1320, 0.08); },
  // Jump: soft whoosh.
  jump() { tone(280, 0.16, 'sine', 560); },
  // Hitting a hazard: dull thud plus a squawk.
  thud() { noiseBurst(0.18); tone(220, 0.25, 'square', 90); },
  // Farmer spots the turkey: short alarm.
  alarm() { tone(520, 0.1, 'square', 520); tone(520, 0.1, 'square', 520, 0.14); },
  // Caught: descending sad notes.
  caught() { tone(392, 0.25, 'triangle', 392); tone(330, 0.25, 'triangle', 330, 0.24); tone(262, 0.5, 'triangle', 196, 0.48); },
  // Escaped: rising fanfare.
  fanfare() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', f, i * 0.13));
    tone(1319, 0.5, 'triangle', 1319, 0.55);
  },
  click() { tone(800, 0.05, 'sine', 700); },
};
