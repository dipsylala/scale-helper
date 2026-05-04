// ---------------------------------------------------------------------------
// state.ts — AppState type and default values.
// Kept separate so both controls and persistence can import without depending
// on each other or on UI modules.
// ---------------------------------------------------------------------------

import { TUNINGS, Tuning } from "./tunings";
import { SCALES, Scale } from "./scales";

export type LabelMode = "dots" | "noteNames" | "degrees";

export interface AppState {
  tuning: Tuning;
  scale: Scale;
  root: number;       // pitch-class 0–11
  fretCount: number;
  labelMode: LabelMode;
  handedness: "right" | "left";
}

export const DEFAULT_STATE: AppState = {
  tuning: TUNINGS[0],
  scale: SCALES[0],
  root: 0,            // C
  fretCount: 21,
  labelMode: "dots",
  handedness: "right",
};
