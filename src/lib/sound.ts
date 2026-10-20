// Sons curtos de acerto, erro e conquista (gerados na hora, sem arquivos).
let ctx: AudioContext | null = null;

function tone(freqs: number[], type: OscillatorType, step = 0.1, len = 0.18, vol = 0.12) {
  try {
    ctx = ctx || new (window.AudioContext || (window as any).webkitAudioContext)();
    const t0 = ctx.currentTime;
    freqs.forEach((f, i) => {
      const o = ctx!.createOscillator();
      const g = ctx!.createGain();
      o.type = type;
      o.frequency.value = f;
      g.gain.setValueAtTime(vol, t0 + i * step);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * step + len);
      o.connect(g).connect(ctx!.destination);
      o.start(t0 + i * step);
      o.stop(t0 + i * step + len + 0.02);
    });
  } catch { /* sem som */ }
}

export const sfx = {
  ok: () => tone([660, 880], 'triangle'),
  bad: () => tone([300, 220], 'sawtooth', 0.12, 0.2, 0.06),
  tap: () => tone([520], 'sine', 0.05, 0.06, 0.05),
  win: () => tone([523, 659, 784, 1047], 'triangle', 0.12, 0.25),
};
