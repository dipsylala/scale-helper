import { describe, it, expect, beforeEach } from "vitest";
import { saveState, loadState, saveTheme, loadTheme } from "./persistence";
import { TUNINGS } from "./tunings";
import { SCALES } from "./scales";
import { AppState } from "./state";

// ── localStorage stub ─────────────────────────────────────────────────────────
// Vitest runs in Node; provide a minimal in-memory localStorage replacement.
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { for (const k in store) delete store[k]; },
};
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock, writable: true });

// ── Fixtures ──────────────────────────────────────────────────────────────────

const DEFAULT_STATE: AppState = {
  tuning: TUNINGS[0],
  scale: SCALES[0],
  root: 0,
  fretCount: 21,
  labelMode: "dots",
  handedness: "right",
  scaleRunBpm: 120,
};

const ALT_STATE: AppState = {
  tuning: TUNINGS.find((t) => t.name === "Drop D (D A D G B E)")!,
  scale: SCALES.find((s) => s.name === "Blues")!,
  root: 7,      // G
  fretCount: 15,
  labelMode: "degrees",
  handedness: "left",
  scaleRunBpm: 90,
};

beforeEach(() => localStorageMock.clear());

// ── saveState / loadState round-trip ─────────────────────────────────────────

describe("saveState + loadState", () => {
  it("round-trips the default state", () => {
    saveState(DEFAULT_STATE);
    const loaded = loadState(DEFAULT_STATE);
    expect(loaded.tuning.name).toBe(DEFAULT_STATE.tuning.name);
    expect(loaded.scale.name).toBe(DEFAULT_STATE.scale.name);
    expect(loaded.root).toBe(DEFAULT_STATE.root);
    expect(loaded.fretCount).toBe(DEFAULT_STATE.fretCount);
    expect(loaded.labelMode).toBe(DEFAULT_STATE.labelMode);
    expect(loaded.handedness).toBe(DEFAULT_STATE.handedness);
  });

  it("round-trips a non-default state", () => {
    saveState(ALT_STATE);
    const loaded = loadState(DEFAULT_STATE);
    expect(loaded.tuning.name).toBe("Drop D (D A D G B E)");
    expect(loaded.scale.name).toBe("Blues");
    expect(loaded.root).toBe(7);
    expect(loaded.fretCount).toBe(15);
    expect(loaded.labelMode).toBe("degrees");
    expect(loaded.handedness).toBe("left");
  });

  it("returns defaults when localStorage is empty", () => {
    const loaded = loadState(DEFAULT_STATE);
    expect(loaded.tuning.name).toBe(DEFAULT_STATE.tuning.name);
    expect(loaded.root).toBe(DEFAULT_STATE.root);
  });

  it("returns defaults when localStorage contains invalid JSON", () => {
    store["scaleHelperState"] = "not valid json {{";
    const loaded = loadState(DEFAULT_STATE);
    expect(loaded.tuning.name).toBe(DEFAULT_STATE.tuning.name);
  });

  it("falls back to default tuning when stored tuning name is unknown", () => {
    saveState(DEFAULT_STATE);
    const raw = JSON.parse(store["scaleHelperState"]);
    raw.tuningName = "Nonexistent Tuning";
    store["scaleHelperState"] = JSON.stringify(raw);
    const loaded = loadState(DEFAULT_STATE);
    expect(loaded.tuning.name).toBe(DEFAULT_STATE.tuning.name);
  });

  it("falls back to default scale when stored scale name is unknown", () => {
    saveState(DEFAULT_STATE);
    const raw = JSON.parse(store["scaleHelperState"]);
    raw.scaleName = "Nonexistent Scale";
    store["scaleHelperState"] = JSON.stringify(raw);
    const loaded = loadState(DEFAULT_STATE);
    expect(loaded.scale.name).toBe(DEFAULT_STATE.scale.name);
  });

  it("clamps out-of-range root to default", () => {
    saveState(DEFAULT_STATE);
    const raw = JSON.parse(store["scaleHelperState"]);
    raw.root = 99;
    store["scaleHelperState"] = JSON.stringify(raw);
    const loaded = loadState(DEFAULT_STATE);
    expect(loaded.root).toBe(DEFAULT_STATE.root);
  });

  it("clamps out-of-range fretCount to default", () => {
    saveState(DEFAULT_STATE);
    const raw = JSON.parse(store["scaleHelperState"]);
    raw.fretCount = 5; // below minimum of 12
    store["scaleHelperState"] = JSON.stringify(raw);
    const loaded = loadState(DEFAULT_STATE);
    expect(loaded.fretCount).toBe(DEFAULT_STATE.fretCount);
  });

  it("falls back to default labelMode for an unknown value", () => {
    saveState(DEFAULT_STATE);
    const raw = JSON.parse(store["scaleHelperState"]);
    raw.labelMode = "invalidMode";
    store["scaleHelperState"] = JSON.stringify(raw);
    const loaded = loadState(DEFAULT_STATE);
    expect(loaded.labelMode).toBe(DEFAULT_STATE.labelMode);
  });

  it("defaults handedness to 'right' for unknown value", () => {
    saveState(DEFAULT_STATE);
    const raw = JSON.parse(store["scaleHelperState"]);
    raw.handedness = "ambidextrous";
    store["scaleHelperState"] = JSON.stringify(raw);
    const loaded = loadState(DEFAULT_STATE);
    expect(loaded.handedness).toBe("right");
  });
});

// ── saveTheme / loadTheme ─────────────────────────────────────────────────────

describe("saveTheme + loadTheme", () => {
  it("round-trips 'dark'", () => {
    saveTheme("dark");
    expect(loadTheme()).toBe("dark");
  });

  it("round-trips 'light'", () => {
    saveTheme("light");
    expect(loadTheme()).toBe("light");
  });

  it("returns 'dark' when nothing is stored", () => {
    expect(loadTheme()).toBe("dark");
  });

  it("returns 'dark' for an unrecognised stored value", () => {
    store["scaleHelperTheme"] = "solarized";
    expect(loadTheme()).toBe("dark");
  });
});
