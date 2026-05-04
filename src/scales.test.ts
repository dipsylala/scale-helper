import { describe, it, expect } from "vitest";
import { SCALES, getScaleNotes, getDegreeLabel } from "./scales";

// ── SCALES registry ───────────────────────────────────────────────────────────

describe("SCALES registry", () => {
  it("contains at least one common and one exotic scale", () => {
    expect(SCALES.some((s) => s.category === "common")).toBe(true);
    expect(SCALES.some((s) => s.category === "exotic")).toBe(true);
  });

  it("every scale starts with degree 0 (root)", () => {
    for (const scale of SCALES) {
      expect(scale.degrees[0], `${scale.name} should start with 0`).toBe(0);
    }
  });

  it("every scale has unique degrees in range 0–11", () => {
    for (const scale of SCALES) {
      const unique = new Set(scale.degrees);
      expect(unique.size, `${scale.name} has duplicate degrees`).toBe(scale.degrees.length);
      for (const d of scale.degrees) {
        expect(d, `${scale.name} has degree out of range: ${d}`).toBeGreaterThanOrEqual(0);
        expect(d, `${scale.name} has degree out of range: ${d}`).toBeLessThanOrEqual(11);
      }
    }
  });

  it("every scale has a non-empty name and a valid category", () => {
    for (const scale of SCALES) {
      expect(scale.name.length).toBeGreaterThan(0);
      expect(["common", "exotic"]).toContain(scale.category);
    }
  });

  it("has no duplicate scale names", () => {
    const names = SCALES.map((s) => s.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

// ── getScaleNotes ─────────────────────────────────────────────────────────────

describe("getScaleNotes", () => {
  it("returns C major notes when root=0 (C)", () => {
    const major = SCALES.find((s) => s.name === "Major (Ionian)")!;
    const notes = getScaleNotes(0, major);
    // C D E F G A B — pitch classes 0 2 4 5 7 9 11
    expect([...notes].sort((a, b) => a - b)).toEqual([0, 2, 4, 5, 7, 9, 11]);
  });

  it("returns G major notes when root=7 (G)", () => {
    const major = SCALES.find((s) => s.name === "Major (Ionian)")!;
    const notes = getScaleNotes(7, major);
    // G A B C D E F# — pitch classes 7 9 11 0 2 4 6
    expect([...notes].sort((a, b) => a - b)).toEqual([0, 2, 4, 6, 7, 9, 11]);
  });

  it("wraps correctly at the octave boundary", () => {
    // Pentatonic Minor from B (11): degrees [0,3,5,7,10] → 11,2,4,6,9
    const pmin = SCALES.find((s) => s.name === "Pentatonic Minor")!;
    const notes = getScaleNotes(11, pmin);
    expect([...notes].sort((a, b) => a - b)).toEqual([2, 4, 6, 9, 11]);
  });

  it("returns a set with the same number of elements as the scale's degrees", () => {
    for (const scale of SCALES) {
      const notes = getScaleNotes(0, scale);
      expect(notes.size).toBe(scale.degrees.length);
    }
  });

  it("root pitch-class is always in the result", () => {
    const major = SCALES.find((s) => s.name === "Major (Ionian)")!;
    for (let root = 0; root < 12; root++) {
      expect(getScaleNotes(root, major).has(root)).toBe(true);
    }
  });
});

// ── getDegreeLabel ────────────────────────────────────────────────────────────

describe("getDegreeLabel", () => {
  const major = SCALES.find((s) => s.name === "Major (Ionian)")!;
  const pmin  = SCALES.find((s) => s.name === "Pentatonic Minor")!;

  it('returns "1" for the root itself', () => {
    expect(getDegreeLabel(0, major, 0)).toBe("1");
    expect(getDegreeLabel(7, major, 7)).toBe("1");
  });

  it("returns correct degree labels for C major", () => {
    // C=1, D=2, E=3, F=4, G=5, A=6, B=7
    const expected: Record<number, string> = { 0: "1", 2: "2", 4: "3", 5: "4", 7: "5", 9: "6", 11: "7" };
    for (const [pc, label] of Object.entries(expected)) {
      expect(getDegreeLabel(Number(pc), major, 0)).toBe(label);
    }
  });

  it("returns correct degree labels for A pentatonic minor (root=9)", () => {
    // A=1, C=b3, D=4, E=5, G=b7
    const expected: Record<number, string> = { 9: "1", 0: "b3", 2: "4", 4: "5", 7: "b7" };
    for (const [pc, label] of Object.entries(expected)) {
      expect(getDegreeLabel(Number(pc), pmin, 9)).toBe(label);
    }
  });

  it("returns empty string for a pitch-class not in the scale", () => {
    // C# (1) is not in C major
    expect(getDegreeLabel(1, major, 0)).toBe("");
  });

  it("works correctly when pitch-class is below root (wraps around)", () => {
    // B (11) is the major 7th of C major — offset = (11 - 0 + 12) % 12 = 11
    expect(getDegreeLabel(11, major, 0)).toBe("7");
    // F (5) in G major — offset = (5 - 7 + 12) % 12 = 10 → b7 (not in major, should be "")
    expect(getDegreeLabel(5, major, 7)).toBe("");
  });
});
