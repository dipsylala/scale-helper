// ---------------------------------------------------------------------------
// run.ts — Riff / scale-run generator
// Generates an ascending (or ascending + descending) scale run across all
// strings.  For each string, 2–3 in-scale notes are selected starting from a
// given fret position.
//
// `repeatCount` (1 | 2 | 4) is chosen randomly each time, adding to the
// surprise factor of the generated run.
//
// Transitions between strings are based on a randomly-chosen note from those
// played on the current string: any of those frets can serve as the anchor
// for the next string.  For example, if frets 1, 4, 5 are played, the next
// string might start from fret 1 (→ 1 4 5), fret 4 (→ 4 5 7), or fret 5
// (→ 5 7 9), picked at random each time.
//
// With 35 % probability the note count is extended by 1 ("further up the
// fretboard before jumping"), so runs feel different each time.
//
// All notes are scheduled as quarter notes (one note per beat at the given BPM).
// ---------------------------------------------------------------------------

import { Cell } from "./fretboard";

export interface RunNote {
  midi: number;
  stringIdx: number; // 0 = lowest string
  fretIdx: number;   // 0 = open
}

/** The unique (non-repeated) phrase for a single string. */
export interface StringPhrase {
  stringIdx: number;
  notes: RunNote[];
}

export interface RunResult {
  /** Full playback sequence including repeats and direction reversal. */
  sequence: RunNote[];
  /** One entry per string played, ascending direction, no repeats — for tab. */
  phrases: StringPhrase[];
  /** Randomly chosen repeat count (1, 2, or 4). */
  repeatCount: 1 | 2 | 4;
}

/**
 * Generate a random scale run across all strings.
 *
 * @param grid      Fretboard grid (`grid[stringIdx][fretIdx]`).
 * @param fretCount Number of frets displayed.
 * @param direction "up" | "upDown" — ascending only, or ascend then descend.
 *
 * The phrase repeat count (1, 2, or 4) is chosen randomly so each run feels
 * fresh and unexpected.
 */
export function generateRun(
  grid: Cell[][],
  fretCount: number,
  direction: "up" | "upDown",
): RunResult {
  const REPEATS: (1 | 2 | 4)[] = [1, 2, 4];
  const repeatCount: 1 | 2 | 4 = REPEATS[Math.floor(Math.random() * REPEATS.length)]!;

  // Decide note count per string once — consistent throughout the run.
  const notesPerString = Math.random() < 0.75 ? 3 : 2;

  const numStrings = grid.length;
  const ascending: RunNote[] = [];
  const phrases: StringPhrase[] = [];

  // Start from the root note on the lowest string.
  let currentFret = 0;
  for (let f = 0; f <= fretCount; f++) {
    if (grid[0][f].isRoot) { currentFret = f; break; }
  }

  for (let s = 0; s < numStrings; s++) {
    // Allow a small dip below current fret — runs can move down the neck too.
    const windowStart = Math.max(0, currentFret - 2);
    const available: { fret: number; midi: number }[] = [];
    for (let f = windowStart; f <= fretCount; f++) {
      if (grid[s][f].inScale) available.push({ fret: f, midi: grid[s][f].midi });
    }

    // Fallback: full string scan if window didn't produce enough notes.
    if (available.length < notesPerString) {
      available.length = 0;
      for (let f = 0; f <= fretCount; f++) {
        if (grid[s][f].inScale) available.push({ fret: f, midi: grid[s][f].midi });
      }
    }
    if (available.length === 0) continue;

    // Find starting index: first note at or above currentFret, adjusted so
    // there are always `notesPerString` notes remaining after it.
    const count = Math.min(available.length, notesPerString);
    let startIdx = 0;
    for (let i = 0; i < available.length; i++) {
      if (available[i].fret >= currentFret) { startIdx = i; break; }
    }
    startIdx = Math.min(startIdx, available.length - count);

    const phrase: RunNote[] = available.slice(startIdx, startIdx + count).map(({ fret, midi }) => ({
      midi,
      stringIdx: s,
      fretIdx: fret,
    }));

    phrases.push({ stringIdx: s, notes: phrase });
    for (let r = 0; r < repeatCount; r++) ascending.push(...phrase);

    if (s >= numStrings - 1) break;

    // Transition: use a random note from this phrase as an anchor; prefer
    // moving up the neck but allow going slightly down (solo freedom).
    const anchor = phrase[Math.floor(Math.random() * phrase.length)].fretIdx;

    let nextFret = -1;
    for (let f = anchor; f <= fretCount; f++) {
      if (grid[s + 1][f].inScale) { nextFret = f; break; }
    }
    if (nextFret === -1) {
      for (let f = anchor - 1; f >= 1; f--) {
        if (grid[s + 1][f].inScale) { nextFret = f; break; }
      }
    }
    currentFret = nextFret !== -1 ? nextFret : anchor;
  }

  // Resolve to root: the run ends on the nearest root note on the last string.
  const lastPhrase = phrases[phrases.length - 1];
  if (lastPhrase) {
    const lastNote = lastPhrase.notes[lastPhrase.notes.length - 1];
    if (!grid[lastNote.stringIdx][lastNote.fretIdx].isRoot) {
      const s = lastNote.stringIdx;
      let rootFret = -1;
      // Search outward from last fret for a root note on this string.
      for (let radius = 1; radius <= fretCount && rootFret === -1; radius++) {
        const hi = lastNote.fretIdx + radius;
        const lo = lastNote.fretIdx - radius;
        if (hi <= fretCount && grid[s][hi].isRoot) rootFret = hi;
        else if (lo >= 0 && grid[s][lo].isRoot) rootFret = lo;
      }
      if (rootFret !== -1) {
        const rootNote: RunNote = { midi: grid[s][rootFret].midi, stringIdx: s, fretIdx: rootFret };
        lastPhrase.notes.push(rootNote);
        ascending.push(rootNote);
      }
    }
  }

  let sequence = ascending;
  if (direction === "upDown" && ascending.length > 0) {
    // Descending: reverse the ascending run, skip the shared turnaround note.
    sequence = [...ascending, ...[...ascending].reverse().slice(1)];
  }
  return { sequence, phrases, repeatCount };
}

// ── Tab generation ────────────────────────────────────────────────────────────

/**
 * Produce a plain-text guitar tab for the given run phrases.
 * Strings are displayed highest-to-lowest (standard tab orientation).
 * Fret column widths are normalised so two-digit fret numbers (10+) align
 * correctly with single-digit ones on the same tab.
 *
 * @param phrases     Per-string phrases from `RunResult.phrases`.
 * @param stringNames Open-string note names, indexed by stringIdx (0 = lowest).
 * @param repeatCount Repeat count — displayed as ×N when > 1.
 * @param direction   Appends "(then descend)" when "upDown".
 */
/**
 * Produce a plain-text guitar tab from the full playback sequence.
 * Each note in `sequence` occupies one time-column; silent strings fill with
 * dashes at that beat — exactly like printed guitar tab.
 */
export function generateTab(
  sequence: RunNote[],
  stringNames: string[],
  direction: "up" | "upDown",
): string {
  if (sequence.length === 0) return "";
  const numStrings = stringNames.length;

  // Uniform cell width: "--5", "--12", etc.
  const maxDigits = Math.max(1, ...sequence.map((n) => String(n.fretIdx).length));
  const cellWidth = maxDigits + 2;
  const emptyCell = "-".repeat(cellWidth);
  const cell = (fret: number): string => {
    const s = String(fret);
    return "-".repeat(cellWidth - s.length) + s;
  };

  // Build one array of cells per string, one cell per beat.
  const rows: string[][] = Array.from({ length: numStrings }, () => []);
  for (const note of sequence) {
    for (let s = 0; s < numStrings; s++) {
      rows[s].push(s === note.stringIdx ? cell(note.fretIdx) : emptyCell);
    }
  }

  // "TAB" label centred vertically in the left margin.
  const tabLetters = ["T", "A", "B"];
  const tabCol: string[] = new Array(numStrings).fill(" ");
  const tabStart = Math.floor((numStrings - 3) / 2);
  tabLetters.forEach((c, i) => { if (tabStart + i < numStrings) tabCol[tabStart + i] = c; });

  const lines: string[] = [];
  let row = 0;
  for (let s = numStrings - 1; s >= 0; s--) {
    const tab = tabCol[row++] ?? " ";
    const name = stringNames[s] ?? "?";
    const body = rows[s].join("") + "--";
    lines.push(`${tab} ${name}|${body}|`);
  }

  if (direction === "upDown") lines.push("   (then descend)");

  return lines.join("\n");
}
