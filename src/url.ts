// ---------------------------------------------------------------------------
// url.ts — Shareable URL encoding/decoding for app state
// All 6 state fields are always written to the URL so shared links are
// self-contained. Uses history.replaceState (no browser history pollution).
//
// Short param keys:
//   r = root note name  (C, C#, …, B)
//   s = scale name      (Pentatonic Minor, …)
//   t = tuning name     (Standard (E A D G B E), …)
//   f = fret count      (12–24)
//   l = label mode      (dots | noteNames | degrees)
//   h = handedness      (right | left)
//   b = scale run BPM   (40–300)
// ---------------------------------------------------------------------------

import { AppState, LabelMode } from "./state";
import { NOTE_NAMES } from "./fretboard";
import { SCALES } from "./scales";
import { TUNINGS } from "./tunings";

const URL_KEYS = ["r", "s", "t", "f", "l", "h", "b"] as const;

/** Returns true if the URL search string contains any of the 6 state keys. */
export function hasURLParams(): boolean {
  const params = new URLSearchParams(window.location.search);
  return URL_KEYS.some((k) => params.has(k));
}

/** Serialize an AppState to URLSearchParams using short, human-readable keys. */
export function stateToParams(state: AppState): URLSearchParams {
  const p = new URLSearchParams();
  p.set("r", NOTE_NAMES[state.root]);
  p.set("s", state.scale.name);
  p.set("t", state.tuning.name);
  p.set("f", String(state.fretCount));
  p.set("l", state.labelMode);
  p.set("h", state.handedness);
  p.set("b", String(state.scaleRunBpm));
  return p;
}

/** Deserialize URLSearchParams into an AppState, falling back per-field to defaults. */
export function paramsToState(
  params: URLSearchParams,
  defaults: AppState,
): AppState {
  // root
  const rootName = params.get("r") ?? "";
  const rootIndex = (NOTE_NAMES as readonly string[]).indexOf(rootName);
  const root = rootIndex >= 0 ? rootIndex : defaults.root;

  // scale
  const scaleName = params.get("s") ?? "";
  const scale = SCALES.find((sc) => sc.name === scaleName) ?? defaults.scale;

  // tuning
  const tuningName = params.get("t") ?? "";
  const tuning = TUNINGS.find((tu) => tu.name === tuningName) ?? defaults.tuning;

  // fretCount
  const fretRaw = parseInt(params.get("f") ?? "", 10);
  const fretCount =
    Number.isInteger(fretRaw) && fretRaw >= 12 && fretRaw <= 24
      ? fretRaw
      : defaults.fretCount;

  // labelMode
  const labelRaw = params.get("l") ?? "";
  const LABEL_MODES: LabelMode[] = ["dots", "noteNames", "degrees"];
  const labelMode = (LABEL_MODES as string[]).includes(labelRaw)
    ? (labelRaw as LabelMode)
    : defaults.labelMode;

  // handedness
  const handRaw = params.get("h") ?? "";
  const handedness =
    handRaw === "right" || handRaw === "left" ? handRaw : defaults.handedness;

  // scaleRunBpm
  const bpmRaw = parseInt(params.get("b") ?? "", 10);
  const scaleRunBpm =
    Number.isInteger(bpmRaw) && bpmRaw >= 40 && bpmRaw <= 300
      ? bpmRaw
      : defaults.scaleRunBpm;

  return { root, scale, tuning, fretCount, labelMode, handedness, scaleRunBpm };
}

/** Push the current state into the URL without adding a browser history entry. */
export function syncURLToState(state: AppState): void {
  const params = stateToParams(state);
  history.replaceState(null, "", "?" + params.toString());
}
