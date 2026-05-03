// ---------------------------------------------------------------------------
// scales.ts — Scale registry
// Scales are defined as arrays of semitone offsets from the root (pitch-class
// arithmetic). 0 is always the root; values are sorted ascending within 0–11.
// ---------------------------------------------------------------------------

export interface Scale {
  name: string;
  /** Semitone offsets from root, sorted ascending, always starting with 0. */
  degrees: readonly number[];
}

export const SCALES: readonly Scale[] = [
  // Most commonly used on guitar first
  { name: "Pentatonic Minor",        degrees: [0, 3, 5, 7, 10] },
  { name: "Pentatonic Major",        degrees: [0, 2, 4, 7, 9] },
  { name: "Blues",                   degrees: [0, 3, 5, 6, 7, 10] },
  { name: "Natural Minor (Aeolian)", degrees: [0, 2, 3, 5, 7, 8, 10] },
  { name: "Major (Ionian)",          degrees: [0, 2, 4, 5, 7, 9, 11] },
  { name: "Harmonic Minor",          degrees: [0, 2, 3, 5, 7, 8, 11] },
  { name: "Dorian",                  degrees: [0, 2, 3, 5, 7, 9, 10] },
  { name: "Mixolydian",              degrees: [0, 2, 4, 5, 7, 9, 10] },
  { name: "Melodic Minor",           degrees: [0, 2, 3, 5, 7, 9, 11] },
  { name: "Phrygian",                degrees: [0, 1, 3, 5, 7, 8, 10] },
  { name: "Lydian",                  degrees: [0, 2, 4, 6, 7, 9, 11] },
  { name: "Locrian",                 degrees: [0, 1, 3, 5, 6, 8, 10] },

  // ── Exotic / shred scales ──────────────────────────────────────────────────
  // Phrygian Dominant — mode 5 of Harmonic Minor (1 b2 3 4 5 b6 b7)
  // Steve Vai, flamenco, Andalusian metal
  { name: "Phrygian Dominant",       degrees: [0, 1, 4, 5, 7, 8, 10] },

  // Lydian Dominant — mode 4 of Melodic Minor (1 2 3 #4 5 6 b7)
  // Joe Satriani's signature floating, tense sound
  { name: "Lydian Dominant",         degrees: [0, 2, 4, 6, 7, 9, 10] },

  // Whole Tone — fully symmetrical 6-note scale (1 2 3 #4 #5 b7)
  // Satriani & Vai for dreamy, unresolved textures
  { name: "Whole Tone",              degrees: [0, 2, 4, 6, 8, 10] },

  // Diminished Half-Whole — 8-note symmetrical (H W H W H W H W)
  // Dominant-chord tension; Vai, Satriani
  { name: "Diminished (Half-Whole)", degrees: [0, 1, 3, 4, 6, 7, 9, 10] },

  // Diminished Whole-Half — 8-note symmetrical (W H W H W H W H)
  // Companion to Half-Whole; fits diminished 7th chords
  { name: "Diminished (Whole-Half)", degrees: [0, 2, 3, 5, 6, 8, 9, 11] },

  // Double Harmonic Major (Byzantine) — (1 b2 3 4 5 b6 7)
  // Marty Friedman's Middle-Eastern / Byzantine flavour
  { name: "Double Harmonic Major",   degrees: [0, 1, 4, 5, 7, 8, 11] },

  // Hungarian Minor (Gypsy Minor) — (1 2 b3 #4 5 b6 7)
  // Marty Friedman; raised 4th gives a dramatic augmented 2nd
  { name: "Hungarian Minor",         degrees: [0, 2, 3, 6, 7, 8, 11] },

  // Super Locrian (Altered) — mode 7 of Melodic Minor (1 b2 b3 b4 b5 b6 b7)
  // Steve Vai in jazz-fusion contexts; maximum chromatic tension
  { name: "Super Locrian (Altered)", degrees: [0, 1, 3, 4, 6, 8, 10] },

  // Enigmatic — (1 b2 3 #4 #5 #6 7)
  // Steve Vai's most exotic calling card; highly chromatic and angular
  { name: "Enigmatic",               degrees: [0, 1, 4, 6, 8, 10, 11] },
];

/**
 * Returns the set of pitch-classes (0–11) that belong to the scale
 * when rooted at the given pitch-class.
 */
export function getScaleNotes(root: number, scale: Scale): Set<number> {
  const notes = new Set<number>();
  for (const offset of scale.degrees) {
    notes.add((root + offset) % 12);
  }
  return notes;
}

// Degree label map: semitone offset → common theory label
const DEGREE_LABELS: Record<number, string> = {
  0:  "1",
  1:  "b2",
  2:  "2",
  3:  "b3",
  4:  "3",
  5:  "4",
  6:  "#4",
  7:  "5",
  8:  "b6",
  9:  "6",
  10: "b7",
  11: "7",
};

/**
 * Returns the degree label for a given pitch-class within a scale/root context.
 * Returns "" if the pitch-class is not in the scale.
 */
export function getDegreeLabel(pitchClass: number, scale: Scale, root: number): string {
  const offset = ((pitchClass - root) % 12 + 12) % 12;
  if (!scale.degrees.includes(offset)) return "";
  return DEGREE_LABELS[offset] ?? "";
}
