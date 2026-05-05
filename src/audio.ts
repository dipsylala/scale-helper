// ---------------------------------------------------------------------------
// audio.ts — Web Audio API note playback
// Uses Karplus-Strong string synthesis for a guitar-like pluck tone.
// Lazy AudioContext (required by browser autoplay policy).
// ---------------------------------------------------------------------------

import type { Scale } from "./scales";
import type { Tuning } from "./tunings";

let ctx: AudioContext | null = null;

// Cancel functions for notes currently scheduled in a scale run.
const activeRunCancels: Array<() => void> = [];

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

/** MIDI note number → frequency in Hz. Middle A (69) = 440 Hz. */
function midiToHz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Karplus-Strong plucked-string synthesis.
 *
 * Creates a guitar-like plucked-string voice using additive synthesis.
 *
 * Four sine harmonics with individually differentiated decay rates simulate
 * the natural spectral evolution of a plucked string (high harmonics die
 * faster than the fundamental). A brief bandpass-filtered noise burst
 * provides the percussive pluck transient. Works reliably at all frequencies,
 * unlike Karplus-Strong which is limited by the Web Audio API minimum delay.
 *
 * Returns a cancel function that silences the voice immediately.
 */
function createGuitarVoice(
  ac: AudioContext,
  freq: number,
  decay: number,
  startTime: number,
): () => void {
  // Master output — sharp attack, then exponential decay
  const output = ac.createGain();
  output.gain.setValueAtTime(0.001, startTime);
  output.gain.exponentialRampToValueAtTime(0.8, startTime + 0.004);
  output.gain.exponentialRampToValueAtTime(0.001, startTime + decay);
  output.connect(ac.destination);

  // Body filter: sweeps from bright at attack to warm over the sustain
  const body = ac.createBiquadFilter();
  body.type = "lowpass";
  body.frequency.setValueAtTime(Math.min(freq * 14, 14000), startTime);
  body.frequency.exponentialRampToValueAtTime(Math.min(freq * 3, 6000), startTime + decay * 0.5);
  body.Q.value = 0.6;
  body.connect(output);

  // Harmonic series: [ frequency multiplier, relative amplitude, decay fraction ]
  // Higher harmonics have shorter decay fractions — characteristic of real strings
  const harmonics: [number, number, number][] = [
    [1, 0.50, 1.00],
    [2, 0.28, 0.55],
    [3, 0.14, 0.35],
    [4, 0.07, 0.22],
  ];

  const oscs: OscillatorNode[] = [];
  for (const [mult, amp, decayFrac] of harmonics) {
    const osc = ac.createOscillator();
    const hGain = ac.createGain();
    osc.type = "sine";
    osc.frequency.value = freq * mult;
    hGain.gain.setValueAtTime(amp, startTime);
    hGain.gain.exponentialRampToValueAtTime(0.001, startTime + decay * decayFrac);
    osc.connect(hGain);
    hGain.connect(body);
    osc.start(startTime);
    osc.stop(startTime + decay + 0.05);
    oscs.push(osc);
  }

  // Short noise burst through a bandpass centred on the fundamental — the "twang"
  const burstDuration = 0.009;
  const burstBuf = ac.createBuffer(1, Math.round(ac.sampleRate * burstDuration), ac.sampleRate);
  const burstData = burstBuf.getChannelData(0);
  for (let i = 0; i < burstData.length; i++) burstData[i] = Math.random() * 2 - 1;
  const burst = ac.createBufferSource();
  burst.buffer = burstBuf;
  const burstFilter = ac.createBiquadFilter();
  burstFilter.type = "bandpass";
  burstFilter.frequency.value = freq;
  burstFilter.Q.value = 1.5;
  const burstGain = ac.createGain();
  burstGain.gain.setValueAtTime(0.18, startTime);
  burstGain.gain.exponentialRampToValueAtTime(0.001, startTime + burstDuration);
  burst.connect(burstFilter);
  burstFilter.connect(burstGain);
  burstGain.connect(output);
  burst.start(startTime);

  return () => {
    const t = ac.currentTime;
    try {
      output.gain.cancelScheduledValues(t);
      output.gain.setValueAtTime(0, t);
    } catch { /* already cleaned up */ }
    for (const osc of oscs) {
      try { osc.stop(t + 0.01); } catch { /* already stopped */ }
    }
  };
}

/**
 * Play a short plucked-string tone for the given MIDI note.
 */
export function playNote(midi: number): void {
  const ac = getCtx();
  if (ac.state === "suspended") void ac.resume();
  createGuitarVoice(ac, midiToHz(midi), 2.0, ac.currentTime);
}

/**
 * Schedule a note at a specific AudioContext time for the run sequencer.
 * Returns a cancel function.
 */
function playScheduled(midi: number, startTime: number): () => void {
  return createGuitarVoice(getCtx(), midiToHz(midi), 1.2, startTime);
}

/**
 * Play a 4-octave scale run.
 * The start note is the lowest occurrence of the root pitch-class that is
 * >= the lowest open string of the current tuning.
 * mode "up"     → ascending only, ends on the root note 4 octaves up.
 * mode "upDown" → ascending then descending back to the root.
 */
export function playScaleRun(
  root: number,
  scale: Scale,
  tuning: Tuning,
  mode: "up" | "upDown",
  bpm: number,
): void {
  const ac = getCtx();
  if (ac.state === "suspended") void ac.resume();

  const lowestOpen = Math.min(...tuning.strings);
  // Find the lowest MIDI value with the correct pitch class that is >= lowestOpen
  const lowestOctaveBase = lowestOpen - ((lowestOpen % 12) - root + 12) % 12;
  const startMidi = lowestOctaveBase < lowestOpen ? lowestOctaveBase + 12 : lowestOctaveBase;

  // Build ascending notes: 4 octaves of scale degrees + final root at top
  const ascending: number[] = [];
  for (let oct = 0; oct < 4; oct++) {
    for (const deg of scale.degrees) {
      ascending.push(startMidi + oct * 12 + deg);
    }
  }
  ascending.push(startMidi + 48); // root of octave 4

  const notes =
    mode === "upDown"
      ? [...ascending, ...[...ascending].reverse().slice(1)]
      : ascending;

  const spacing = 30 / bpm; // one eighth note per beat
  const now = ac.currentTime;

  // Cancel any in-progress run before scheduling new notes
  for (const cancel of activeRunCancels) cancel();
  activeRunCancels.length = 0;

  notes.forEach((midi, i) => {
    activeRunCancels.push(playScheduled(midi, now + i * spacing));
  });
}
