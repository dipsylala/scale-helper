import { describe, it, expect } from "vitest";
import {
  TUNINGS,
  AVAILABLE_STRING_COUNTS,
  getTuningsForStringCount,
  getNoteAtFret,
} from "./tunings";

// ── TUNINGS registry ──────────────────────────────────────────────────────────

describe("TUNINGS registry", () => {
  it("contains at least one tuning", () => {
    expect(TUNINGS.length).toBeGreaterThan(0);
  });

  it("every tuning has a non-empty name", () => {
    for (const t of TUNINGS) {
      expect(t.name.length).toBeGreaterThan(0);
    }
  });

  it("has no duplicate tuning names", () => {
    const names = TUNINGS.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("every tuning has at least 3 strings", () => {
    for (const t of TUNINGS) {
      expect(t.strings.length, `${t.name} has fewer than 3 strings`).toBeGreaterThanOrEqual(3);
    }
  });

  it("every tuning has strings in ascending MIDI order (low → high)", () => {
    for (const t of TUNINGS) {
      for (let i = 1; i < t.strings.length; i++) {
        expect(
          t.strings[i],
          `${t.name}: string ${i} (${t.strings[i]}) not higher than string ${i - 1} (${t.strings[i - 1]})`,
        ).toBeGreaterThan(t.strings[i - 1]);
      }
    }
  });

  it("standard E tuning open strings have correct MIDI values", () => {
    const std = TUNINGS.find((t) => t.name === "Standard (E A D G B E)")!;
    expect(std).toBeDefined();
    // E2=40, A2=45, D3=50, G3=55, B3=59, E4=64
    expect([...std.strings]).toEqual([40, 45, 50, 55, 59, 64]);
  });
});

// ── AVAILABLE_STRING_COUNTS ───────────────────────────────────────────────────

describe("AVAILABLE_STRING_COUNTS", () => {
  it("is sorted ascending", () => {
    for (let i = 1; i < AVAILABLE_STRING_COUNTS.length; i++) {
      expect(AVAILABLE_STRING_COUNTS[i]).toBeGreaterThan(AVAILABLE_STRING_COUNTS[i - 1]);
    }
  });

  it("contains no duplicates", () => {
    expect(new Set(AVAILABLE_STRING_COUNTS).size).toBe(AVAILABLE_STRING_COUNTS.length);
  });

  it("reflects all string counts present in TUNINGS", () => {
    const expected = [...new Set(TUNINGS.map((t) => t.strings.length))].sort((a, b) => a - b);
    expect([...AVAILABLE_STRING_COUNTS]).toEqual(expected);
  });
});

// ── getTuningsForStringCount ──────────────────────────────────────────────────

describe("getTuningsForStringCount", () => {
  it("returns only tunings with the requested string count", () => {
    for (const n of AVAILABLE_STRING_COUNTS) {
      const result = getTuningsForStringCount(n);
      expect(result.length).toBeGreaterThan(0);
      for (const t of result) {
        expect(t.strings.length).toBe(n);
      }
    }
  });

  it("returns an empty array for a string count with no tunings", () => {
    expect(getTuningsForStringCount(99)).toEqual([]);
  });

  it("includes Standard E in the 6-string results", () => {
    const sixString = getTuningsForStringCount(6);
    expect(sixString.some((t) => t.name === "Standard (E A D G B E)")).toBe(true);
  });
});

// ── getNoteAtFret ─────────────────────────────────────────────────────────────

describe("getNoteAtFret", () => {
  it("returns the open MIDI note at fret 0", () => {
    expect(getNoteAtFret(40, 0)).toBe(40);
  });

  it("adds the fret number to the open MIDI note", () => {
    expect(getNoteAtFret(40, 5)).toBe(45);
    expect(getNoteAtFret(40, 12)).toBe(52);
  });

  it("is consistent across a full string span (0–24 frets)", () => {
    const openMidi = 40; // E2
    for (let fret = 0; fret <= 24; fret++) {
      expect(getNoteAtFret(openMidi, fret)).toBe(openMidi + fret);
    }
  });
});
