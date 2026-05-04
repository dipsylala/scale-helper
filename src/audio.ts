// ---------------------------------------------------------------------------
// audio.ts — Web Audio API note playback
// Lazy AudioContext (required by browser autoplay policy — must be created
// or resumed inside a user gesture).
// ---------------------------------------------------------------------------

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

/** MIDI note number → frequency in Hz. Middle A (69) = 440 Hz. */
function midiToHz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Play a short plucked-string tone for the given MIDI note.
 * Uses a sawtooth oscillator shaped by a low-pass filter sweep + gain decay
 * to approximate the attack and decay of a plucked string.
 */
export function playNote(midi: number): void {
  const ac = getCtx();
  // Resume if suspended (browser may pause context when page is backgrounded)
  if (ac.state === "suspended") void ac.resume();

  const freq = midiToHz(midi);
  const now = ac.currentTime;
  const decay = 1.6; // seconds

  const osc = ac.createOscillator();
  const filter = ac.createBiquadFilter();
  const gain = ac.createGain();

  // Sawtooth is rich in harmonics — the filter sweep tames it into a pluck
  osc.type = "sawtooth";
  osc.frequency.value = freq;

  // Low-pass filter: bright at attack, rolls off over the decay
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(freq * 6, now);
  filter.frequency.exponentialRampToValueAtTime(freq * 1.2, now + decay);
  filter.Q.value = 0.8;

  // Gain envelope: immediate peak → near-silence by end of decay
  gain.gain.setValueAtTime(0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + decay);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);

  osc.start(now);
  osc.stop(now + decay);
}
