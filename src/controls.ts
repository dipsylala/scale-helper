// ---------------------------------------------------------------------------
// controls.ts — Control bar
// Builds the five controls (Tuning, Scale, Root, Frets, Labels) and fires
// an onChange callback with the current AppState whenever any value changes.
// ---------------------------------------------------------------------------

import { TUNINGS, Tuning, AVAILABLE_STRING_COUNTS, getTuningsForStringCount } from "./tunings";
import { SCALES, Scale } from "./scales";
import { NOTE_NAMES } from "./fretboard";
import { LabelMode } from "./renderer";

export interface AppState {
  tuning: Tuning;
  scale: Scale;
  root: number;       // pitch-class 0–11
  fretCount: number;
  labelMode: LabelMode;
}

export const DEFAULT_STATE: AppState = {
  tuning: TUNINGS[0],
  scale: SCALES[0],
  root: 0,            // C
  fretCount: 21,
  labelMode: "dots",
};

export function mountControls(
  container: HTMLElement,
  state: AppState,
  onChange: (s: AppState) => void,
): void {
  container.innerHTML = "";

  // ── Strings ───────────────────────────────────────────────────────────────
  const currentStringCount = state.tuning.strings.length;
  container.appendChild(makeLabel("Strings"));
  const stringCountSelect = makeSelect(
    AVAILABLE_STRING_COUNTS.map((n) => String(n)),
    AVAILABLE_STRING_COUNTS.indexOf(currentStringCount),
  );
  stringCountSelect.addEventListener("change", () => {
    const count = AVAILABLE_STRING_COUNTS[stringCountSelect.selectedIndex];
    const newTuning = getTuningsForStringCount(count)[0];
    onChange({ ...state, tuning: newTuning });
  });
  container.appendChild(stringCountSelect);

  // ── Tuning ────────────────────────────────────────────────────────────────
  const filteredTunings = getTuningsForStringCount(currentStringCount);
  container.appendChild(makeLabel("Tuning"));
  const tuningSelect = makeSelect(
    filteredTunings.map((t) => t.name),
    filteredTunings.indexOf(state.tuning),
  );
  tuningSelect.addEventListener("change", () => {
    onChange({ ...state, tuning: filteredTunings[tuningSelect.selectedIndex] });
  });
  container.appendChild(tuningSelect);

  // ── Scale ─────────────────────────────────────────────────────────────────
  container.appendChild(makeLabel("Scale"));
  const scaleSelect = makeSelect(
    SCALES.map((s) => s.name),
    SCALES.indexOf(state.scale),
  );
  scaleSelect.addEventListener("change", () => {
    onChange({ ...state, scale: SCALES[scaleSelect.selectedIndex] });
  });
  container.appendChild(scaleSelect);

  // ── Root ──────────────────────────────────────────────────────────────────
  container.appendChild(makeLabel("Root"));
  const rootSelect = makeSelect([...NOTE_NAMES], state.root);
  rootSelect.addEventListener("change", () => {
    onChange({ ...state, root: rootSelect.selectedIndex });
  });
  container.appendChild(rootSelect);

  // ── Frets ─────────────────────────────────────────────────────────────────
  container.appendChild(makeLabel("Frets"));
  const fretInput = document.createElement("input");
  fretInput.type = "number";
  fretInput.min = "12";
  fretInput.max = "24";
  fretInput.value = String(state.fretCount);
  fretInput.className = "fret-input";
  fretInput.addEventListener("change", () => {
    const v = Math.min(24, Math.max(12, Number(fretInput.value) || 21));
    fretInput.value = String(v);
    onChange({ ...state, fretCount: v });
  });
  container.appendChild(fretInput);

  // ── Labels ────────────────────────────────────────────────────────────────
  container.appendChild(makeLabel("Labels"));
  const labelGroup = document.createElement("div");
  labelGroup.className = "label-toggle";

  const labelOptions: { value: LabelMode; text: string }[] = [
    { value: "dots",      text: "Dots" },
    { value: "noteNames", text: "Note Names" },
    { value: "degrees",   text: "Degrees" },
  ];

  for (const opt of labelOptions) {
    const btn = document.createElement("button");
    btn.textContent = opt.text;
    btn.dataset["value"] = opt.value;
    if (state.labelMode === opt.value) btn.classList.add("active");
    btn.addEventListener("click", () => {
      onChange({ ...state, labelMode: opt.value });
    });
    labelGroup.appendChild(btn);
  }
  container.appendChild(labelGroup);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeLabel(text: string): HTMLLabelElement {
  const el = document.createElement("label");
  el.textContent = text;
  return el;
}

function makeSelect(options: string[], selectedIndex: number): HTMLSelectElement {
  const sel = document.createElement("select");
  for (const [i, name] of options.entries()) {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = name;
    if (i === selectedIndex) opt.selected = true;
    sel.appendChild(opt);
  }
  return sel;
}
