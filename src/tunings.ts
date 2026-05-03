// ---------------------------------------------------------------------------
// tunings.ts — Tuning registry
// Strings are ordered LOW → HIGH (string 6 first, string 1 last), matching
// the bottom-to-top visual order of the neck diagram.
// MIDI values: middle C = 60, low E (standard) = 40.
// ---------------------------------------------------------------------------

export interface Tuning {
  name: string;
  /** MIDI note numbers for open strings, ordered low → high (6 strings). */
  strings: readonly number[];
}

export const TUNINGS: readonly Tuning[] = [
  // ── Standard & variants ───────────────────────────────────────────────────
  { name: "Standard (E A D G B E)",            strings: [40, 45, 50, 55, 59, 64] },
  { name: "Half-step Down (Eb Ab Db Gb Bb Eb)", strings: [39, 44, 49, 54, 58, 63] },
  { name: "Full Step Down / D Standard",        strings: [38, 43, 48, 53, 57, 62] },
  { name: "C Standard (C F Bb Eb G C)",         strings: [36, 41, 46, 51, 55, 60] },

  // ── Drop tunings ──────────────────────────────────────────────────────────
  { name: "Drop D (D A D G B E)",               strings: [38, 45, 50, 55, 59, 64] },
  { name: "Double Drop D (D A D G B D)",        strings: [38, 45, 50, 55, 59, 62] },
  { name: "Drop C (C G C F A D)",               strings: [36, 43, 48, 53, 57, 62] },

  // ── Open tunings ──────────────────────────────────────────────────────────
  { name: "Open G (D G D G B D)",               strings: [38, 43, 50, 55, 59, 62] },
  { name: "Open D (D A D F# A D)",              strings: [38, 45, 50, 54, 57, 62] },
  { name: "Open E (E B E G# B E)",              strings: [40, 47, 52, 56, 59, 64] },
  { name: "Open A (E A E A C# E)",              strings: [40, 45, 52, 57, 61, 64] },
  { name: "Open C (C G C G C E)",               strings: [36, 43, 48, 55, 60, 64] },

  // ── Modal / other ─────────────────────────────────────────────────────────
  { name: "DADGAD",                             strings: [38, 45, 50, 55, 57, 62] },
];

/** Returns the MIDI note number at a given fret on an open string. */
export function getNoteAtFret(openMidi: number, fret: number): number {
  return openMidi + fret;
}
