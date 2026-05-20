/**
 * 音效系统 — Web Audio API 程序化生成
 */
let ctx = null;
let enabled = true;

export function initAudio() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
}
export function toggleSound() { enabled = !enabled; return enabled; }
export function isSoundOn() { return enabled; }

function tone(freq, type, dur, vol = 0.08) {
  if (!enabled || !ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  o.connect(g); g.connect(ctx.destination);
  o.start(ctx.currentTime); o.stop(ctx.currentTime + dur);
}

export function playClick()   { tone(600, 'sine', 0.06, 0.05); }
export function playSlide()   { tone(300 + Math.random() * 400, 'triangle', 0.08, 0.04); }
export function playSelect() {
  if (!enabled || !ctx) return;
  const o = ctx.createOscillator(); const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(500, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
  g.gain.setValueAtTime(0.06, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  o.connect(g); g.connect(ctx.destination);
  o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.15);
}
export function playSynth() {
  if (!enabled || !ctx) return;
  const o = ctx.createOscillator(); const g = ctx.createGain();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(150, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(2500, ctx.currentTime + 2);
  g.gain.setValueAtTime(0.04, ctx.currentTime);
  g.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 1);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.2);
  o.connect(g); g.connect(ctx.destination);
  o.start(ctx.currentTime); o.stop(ctx.currentTime + 2.2);
}
export function playBubble() {
  if (!enabled || !ctx) return;
  tone(800 + Math.random() * 600, 'sine', 0.04, 0.03);
}
export function playSuccess() {
  if (!enabled || !ctx) return;
  [523, 659, 784].forEach((f, i) => {
    setTimeout(() => tone(f, 'sine', 0.25, 0.07), i * 100);
  });
}
