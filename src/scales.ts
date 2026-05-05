// ---------------------------------------------------------------------------
// scales.ts — Scale registry
// Scales are defined as arrays of semitone offsets from the root (pitch-class
// arithmetic). 0 is always the root; values are sorted ascending within 0–11.
// ---------------------------------------------------------------------------

export interface Scale {
  name: string;
  /** Display group for the scale selector grid. */
  group: string;
  /** Scale intervals as semitone steps from the root — e.g. 0 = root, 2 = whole step,
   *  3 = minor third. One semitone equals one fret. Always starts with 0; range 0–11. */
  degrees: readonly number[];
}

export const SCALES: readonly Scale[] = [
  // ── Pentatonic & Blues ─────────────────────────────────────────────────────
  { name: "Pentatonic Minor", group: "Pentatonic & Blues", degrees: [0, 3, 5, 7, 10] },
  { name: "Pentatonic Major", group: "Pentatonic & Blues", degrees: [0, 2, 4, 7, 9] },
  { name: "Minor Blues", group: "Pentatonic & Blues", degrees: [0, 3, 5, 6, 7, 10] },

  // ── Major & Minor ──────────────────────────────────────────────────────────
  { name: "Major (Ionian)", group: "Major & Minor", degrees: [0, 2, 4, 5, 7, 9, 11] },
  { name: "Natural Minor (Aeolian)", group: "Major & Minor", degrees: [0, 2, 3, 5, 7, 8, 10] },
  { name: "Harmonic Minor", group: "Major & Minor", degrees: [0, 2, 3, 5, 7, 8, 11] },
  { name: "Melodic Minor", group: "Major & Minor", degrees: [0, 2, 3, 5, 7, 9, 11] },

  // ── Diatonic Modes ──────────────────────────────────────────────────────────────────
  { name: "Dorian", group: "Diatonic Modes", degrees: [0, 2, 3, 5, 7, 9, 10] },
  { name: "Phrygian", group: "Diatonic Modes", degrees: [0, 1, 3, 5, 7, 8, 10] },
  { name: "Lydian", group: "Diatonic Modes", degrees: [0, 2, 4, 6, 7, 9, 11] },
  { name: "Mixolydian", group: "Diatonic Modes", degrees: [0, 2, 4, 5, 7, 9, 10] },
  { name: "Locrian", group: "Diatonic Modes", degrees: [0, 1, 3, 5, 6, 8, 10] },

  // ── Harmonic & Melodic Minor Modes ─────────────────────────────────────────
  // Phrygian Dominant — mode 5 of Harmonic Minor (1 b2 3 4 5 b6 b7)
  { name: "Phrygian Dominant", group: "Harmonic & Melodic Minor Modes", degrees: [0, 1, 4, 5, 7, 8, 10] },
  // Lydian Dominant — mode 4 of Melodic Minor (1 2 3 #4 5 6 b7)
  { name: "Lydian Dominant", group: "Harmonic & Melodic Minor Modes", degrees: [0, 2, 4, 6, 7, 9, 10] },
  // Super Locrian (Altered) — mode 7 of Melodic Minor (1 b9 #9 3 b5 #5 b7)
  { name: "Super Locrian (Altered)", group: "Harmonic & Melodic Minor Modes", degrees: [0, 1, 3, 4, 6, 8, 10] },

  // ── Symmetric ─────────────────────────────────────────────────────────────
  // Whole Tone — fully symmetrical 6-note scale (1 2 3 #4 #5 b7)
  { name: "Whole Tone", group: "Symmetric", degrees: [0, 2, 4, 6, 8, 10] },
  // Diminished Half-Whole — 8-note symmetrical (H W H W H W H W)
  { name: "Diminished (Half-Whole)", group: "Symmetric", degrees: [0, 1, 3, 4, 6, 7, 9, 10] },
  // Diminished Whole-Half — 8-note symmetrical (W H W H W H W H)
  { name: "Diminished (Whole-Half)", group: "Symmetric", degrees: [0, 2, 3, 5, 6, 8, 9, 11] },

  // ── Additional Heptatonic Scales ───────────────────────────────────────────────────
  // Double Harmonic Major (Byzantine) — (1 b2 3 4 5 b6 7)
  { name: "Double Harmonic Major", group: "Additional Heptatonic Scales", degrees: [0, 1, 4, 5, 7, 8, 11] },
  // Hungarian Minor — (1 2 b3 #4 5 b6 7)
  { name: "Hungarian Minor", group: "Additional Heptatonic Scales", degrees: [0, 2, 3, 6, 7, 8, 11] },
  // Enigmatic — (1 b2 3 #4 #5 #6 7)
  { name: "Enigmatic", group: "Additional Heptatonic Scales", degrees: [0, 1, 4, 6, 8, 10, 11] },
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
  0: "1",
  1: "b2",
  2: "2",
  3: "b3",
  4: "3",
  5: "4",
  6: "#4",
  7: "5",
  8: "b6",
  9: "6",
  10: "b7",
  11: "7",
};

/**
 * Returns the degree label for a given pitch-class within a scale/root context.
 * Returns "" if the pitch-class is not in the scale.
 */
export function getDegreeLabel(pitchClass: number, scale: Scale, root: number): string {
  const offset = (((pitchClass - root) % 12) + 12) % 12;
  if (!scale.degrees.includes(offset)) return "";
  return DEGREE_LABELS[offset] ?? "";
}
