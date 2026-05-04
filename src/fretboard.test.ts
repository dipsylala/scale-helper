import { describe, it, expect } from "vitest";
import { buildFretboard, NOTE_NAMES } from "./fretboard";
import { SCALES } from "./scales";
import { TUNINGS } from "./tunings";

const STD = TUNINGS.find((t) => t.name === "Standard (E A D G B E)")!;
const MAJOR = SCALES.find((s) => s.name === "Major (Ionian)")!;
const PMIN = SCALES.find((s) => s.name === "Pentatonic Minor")!;

// ── Grid shape ────────────────────────────────────────────────────────────────

describe("buildFretboard — grid shape", () => {
  it("returns one row per string", () => {
    const grid = buildFretboard(STD, MAJOR, 0, 12);
    expect(grid.length).toBe(STD.strings.length); // 6
  });

  it("returns fretCount + 1 columns per row (fret 0 = open)", () => {
    const fretCount = 15;
    const grid = buildFretboard(STD, MAJOR, 0, fretCount);
    for (const row of grid) {
      expect(row.length).toBe(fretCount + 1);
    }
  });

  it("works for 3-string and 8-string tunings", () => {
    for (const tuning of TUNINGS) {
      const grid = buildFretboard(tuning, MAJOR, 0, 12);
      expect(grid.length).toBe(tuning.strings.length);
    }
  });
});

// ── MIDI / pitchClass accuracy ────────────────────────────────────────────────

describe("buildFretboard — MIDI and pitch class", () => {
  it("fret 0 MIDI matches the tuning's open string MIDI", () => {
    const grid = buildFretboard(STD, MAJOR, 0, 12);
    for (let s = 0; s < STD.strings.length; s++) {
      expect(grid[s][0].midi).toBe(STD.strings[s]);
    }
  });

  it("each subsequent fret increments MIDI by 1", () => {
    const grid = buildFretboard(STD, MAJOR, 0, 24);
    for (const row of grid) {
      for (let f = 1; f < row.length; f++) {
        expect(row[f].midi).toBe(row[f - 1].midi + 1);
      }
    }
  });

  it("pitchClass equals midi % 12", () => {
    const grid = buildFretboard(STD, PMIN, 9, 12);
    for (const row of grid) {
      for (const cell of row) {
        expect(cell.pitchClass).toBe(cell.midi % 12);
      }
    }
  });

  it("noteName matches NOTE_NAMES[pitchClass]", () => {
    const grid = buildFretboard(STD, MAJOR, 0, 12);
    for (const row of grid) {
      for (const cell of row) {
        expect(cell.noteName).toBe(NOTE_NAMES[cell.pitchClass]);
      }
    }
  });
});

// ── inScale / isRoot ──────────────────────────────────────────────────────────

describe("buildFretboard — inScale and isRoot", () => {
  it("every isRoot cell also has inScale=true", () => {
    const grid = buildFretboard(STD, MAJOR, 0, 12);
    for (const row of grid) {
      for (const cell of row) {
        if (cell.isRoot) expect(cell.inScale).toBe(true);
      }
    }
  });

  it("isRoot is true iff pitchClass equals the root", () => {
    const root = 4; // E
    const grid = buildFretboard(STD, MAJOR, root, 12);
    for (const row of grid) {
      for (const cell of row) {
        if (cell.inScale) {
          expect(cell.isRoot).toBe(cell.pitchClass === root);
        }
      }
    }
  });

  it("C major from root 0: only pitch-classes 0,2,4,5,7,9,11 are inScale", () => {
    const scaleSet = new Set([0, 2, 4, 5, 7, 9, 11]);
    const grid = buildFretboard(STD, MAJOR, 0, 12);
    for (const row of grid) {
      for (const cell of row) {
        expect(cell.inScale).toBe(scaleSet.has(cell.pitchClass));
      }
    }
  });

  it("A pentatonic minor from root 9: only pitch-classes 9,0,2,4,7 are inScale", () => {
    const scaleSet = new Set([9, 0, 2, 4, 7]);
    const grid = buildFretboard(STD, PMIN, 9, 12);
    for (const row of grid) {
      for (const cell of row) {
        expect(cell.inScale).toBe(scaleSet.has(cell.pitchClass));
      }
    }
  });
});

// ── degreeLabel ───────────────────────────────────────────────────────────────

describe("buildFretboard — degreeLabel", () => {
  it("degreeLabel is empty for out-of-scale cells", () => {
    const grid = buildFretboard(STD, MAJOR, 0, 12);
    for (const row of grid) {
      for (const cell of row) {
        if (!cell.inScale) expect(cell.degreeLabel).toBe("");
      }
    }
  });

  it('root note always has degreeLabel "1"', () => {
    const grid = buildFretboard(STD, MAJOR, 0, 12);
    for (const row of grid) {
      for (const cell of row) {
        if (cell.isRoot) expect(cell.degreeLabel).toBe("1");
      }
    }
  });

  it("degreeLabel is non-empty for all in-scale cells", () => {
    const grid = buildFretboard(STD, PMIN, 9, 12);
    for (const row of grid) {
      for (const cell of row) {
        if (cell.inScale) expect(cell.degreeLabel.length).toBeGreaterThan(0);
      }
    }
  });
});
