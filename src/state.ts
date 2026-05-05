// ---------------------------------------------------------------------------
// state.ts — AppState type only.
// Type-only imports (erased at runtime) — zero runtime dependency risk.
// ---------------------------------------------------------------------------

import type { Tuning } from "./tunings";
import type { Scale } from "./scales";

export type LabelMode = "dots" | "noteNames" | "degrees";

export interface AppState {
  tuning: Tuning;
  scale: Scale;
  root: number; // pitch-class 0–11
  fretCount: number;
  labelMode: LabelMode;
  handedness: "right" | "left";
  scaleRunBpm: number;
}
