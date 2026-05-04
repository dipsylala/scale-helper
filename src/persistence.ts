// ---------------------------------------------------------------------------
// persistence.ts — Save and restore AppState + theme via localStorage.
// State is keyed by human-readable names so it survives scale/tuning reorders.
// ---------------------------------------------------------------------------

import { TUNINGS } from "./tunings";
import { SCALES } from "./scales";
import { AppState, LabelMode } from "./state";

const STORAGE_KEY = "scaleHelperState";
const THEME_KEY = "scaleHelperTheme";

interface StoredState {
  tuningName: string;
  scaleName: string;
  root: number;
  fretCount: number;
  labelMode: LabelMode;
  handedness: "right" | "left";
}

export function saveState(state: AppState): void {
  const stored: StoredState = {
    tuningName: state.tuning.name,
    scaleName: state.scale.name,
    root: state.root,
    fretCount: state.fretCount,
    labelMode: state.labelMode,
    handedness: state.handedness,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

export function loadState(defaults: AppState): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaults };
    const stored = JSON.parse(raw) as Partial<StoredState>;

    const tuning = TUNINGS.find((t) => t.name === stored.tuningName) ?? defaults.tuning;
    const scale = SCALES.find((s) => s.name === stored.scaleName) ?? defaults.scale;
    const root =
      typeof stored.root === "number" && stored.root >= 0 && stored.root <= 11
        ? stored.root
        : defaults.root;
    const fretCount =
      typeof stored.fretCount === "number" && stored.fretCount >= 12 && stored.fretCount <= 24
        ? stored.fretCount
        : defaults.fretCount;
    const labelMode: LabelMode = (["dots", "noteNames", "degrees"] as LabelMode[]).includes(
      stored.labelMode as LabelMode,
    )
      ? (stored.labelMode as LabelMode)
      : defaults.labelMode;

    const handedness: "right" | "left" = stored.handedness === "left" ? "left" : "right";

    return { tuning, scale, root, fretCount, labelMode, handedness };
  } catch {
    return { ...defaults };
  }
}

export function saveTheme(theme: "dark" | "light"): void {
  localStorage.setItem(THEME_KEY, theme);
}

export function loadTheme(): "dark" | "light" {
  return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
}
