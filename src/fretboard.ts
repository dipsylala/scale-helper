// ---------------------------------------------------------------------------
// fretboard.ts — Fretboard model
// Combines a tuning, scale, root, and fret count into a 2-D grid of Cells.
// Indexed [stringIndex][fretIndex] where:
//   stringIndex 0 = lowest-pitched string (string 6 in standard notation)
//   fretIndex   0 = open string
// ---------------------------------------------------------------------------

import { Scale, getScaleNotes, getDegreeLabel } from "./scales";
import { Tuning, getNoteAtFret } from "./tunings";

export const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

export interface Cell {
  midi: number;
  pitchClass: number;
  noteName: string;
  inScale: boolean;
  isRoot: boolean;
  degreeLabel: string;
}

/**
 * Builds the full 2-D fretboard grid.
 * @param tuning   The tuning to use.
 * @param scale    The scale to highlight.
 * @param root     Root pitch-class (0 = C … 11 = B).
 * @param fretCount Number of frets to include (columns 0 = open, 1…fretCount).
 */
export function buildFretboard(
  tuning: Tuning,
  scale: Scale,
  root: number,
  fretCount: number,
): Cell[][] {
  const scaleNotes = getScaleNotes(root, scale);

  return tuning.strings.map((openMidi) => {
    const cells: Cell[] = [];
    for (let fret = 0; fret <= fretCount; fret++) {
      const midi = getNoteAtFret(openMidi, fret);
      const pitchClass = midi % 12;
      const inScale = scaleNotes.has(pitchClass);
      cells.push({
        midi,
        pitchClass,
        noteName: NOTE_NAMES[pitchClass],
        inScale,
        isRoot: inScale && pitchClass === root,
        degreeLabel: inScale ? getDegreeLabel(pitchClass, scale, root) : "",
      });
    }
    return cells;
  });
}
