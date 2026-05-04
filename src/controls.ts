// ---------------------------------------------------------------------------
// controls.ts — Control bar
// mountSettings: top bar (Strings, Frets, Labels, Handed)
// mountSelectors: below fretboard (Scale, Root, Tuning)
// Both fire onChange with the full AppState whenever any value changes.
// ---------------------------------------------------------------------------

import { AVAILABLE_STRING_COUNTS, getTuningsForStringCount } from "./tunings";
import { SCALES } from "./scales";
import { NOTE_NAMES } from "./fretboard";
import { LabelMode } from "./renderer";
import { AppState } from "./state";

export type { AppState } from "./state";
export { DEFAULT_STATE } from "./state";

// ── Top bar: settings that don't change often ─────────────────────────────────
export function mountSettings(
  container: HTMLElement,
  state: AppState,
  onChange: (s: AppState) => void,
): void {
  container.innerHTML = "";

  // ── Strings (segmented toggle) ───────────────────────────────────────────────────
  const currentStringCount = state.tuning.strings.length;
  container.appendChild(makeLabel("Strings"));
  container.appendChild(makeToggleGroup(
    AVAILABLE_STRING_COUNTS.map((n) => ({ value: String(n), text: String(n) })),
    String(currentStringCount),
    (v) => {
      const newTuning = getTuningsForStringCount(Number(v))[0];
      onChange({ ...state, tuning: newTuning });
    },
  ));

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
  container.appendChild(makeToggleGroup(
    [
      { value: "dots",      text: "Dots" },
      { value: "noteNames", text: "Note Names" },
      { value: "degrees",   text: "Degrees" },
    ],
    state.labelMode,
    (v) => onChange({ ...state, labelMode: v as LabelMode }),
  ));

  // ── Handed ────────────────────────────────────────────────────────────────
  container.appendChild(makeLabel("Handed"));
  container.appendChild(makeToggleGroup(
    [
      { value: "right", text: "Right" },
      { value: "left",  text: "Left"  },
    ],
    state.handedness,
    (v) => onChange({ ...state, handedness: v as "right" | "left" }),
  ));
}

// ── Below fretboard: scale, root, tuning ─────────────────────────────────────
export function mountSelectors(
  container: HTMLElement,
  state: AppState,
  onChange: (s: AppState) => void,
): void {
  container.innerHTML = "";

  // ── Root (full-width equal-width buttons) ─────────────────────────────────
  const rootFieldset = document.createElement("fieldset");
  rootFieldset.className = "selector-group";
  const rootLegend = document.createElement("legend");
  rootLegend.textContent = "Root";
  rootFieldset.appendChild(rootLegend);
  const rootRow = document.createElement("div");
  rootRow.className = "root-row";
  for (const name of NOTE_NAMES) {
    const btn = document.createElement("button");
    btn.textContent = name;
    if (NOTE_NAMES[state.root] === name) btn.classList.add("active");
    btn.addEventListener("click", () =>
      onChange({ ...state, root: NOTE_NAMES.indexOf(name as typeof NOTE_NAMES[number]) }),
    );
    rootRow.appendChild(btn);
  }
  rootFieldset.appendChild(rootRow);
  container.appendChild(rootFieldset);

  // ── Scale (grid + Common/Exotic filter) ───────────────────────────────────
  const isExotic = state.scale.category === "exotic";
  const visibleScales = SCALES.filter((s) => s.category === (isExotic ? "exotic" : "common"));
  const defaultExotic = SCALES.find((s) => s.category === "exotic")!;
  const defaultCommon = SCALES.find((s) => s.category === "common")!;

  const scaleSection = document.createElement("fieldset");
  scaleSection.className = "selector-group scale-section";
  const scaleLegend = document.createElement("legend");
  scaleLegend.textContent = "Scale";
  scaleSection.appendChild(scaleLegend);

  const scaleGrid = document.createElement("div");
  scaleGrid.className = "scale-grid";
  for (const s of visibleScales) {
    const btn = document.createElement("button");
    btn.textContent = s.name;
    if (state.scale.name === s.name) btn.classList.add("active");
    btn.addEventListener("click", () => onChange({ ...state, scale: s }));
    scaleGrid.appendChild(btn);
  }
  scaleSection.appendChild(scaleGrid);

  const filterToggle = makeToggleGroup(
    [{ value: "common", text: "Common" }, { value: "exotic", text: "Exotic" }],
    isExotic ? "exotic" : "common",
    (v) => onChange({ ...state, scale: v === "exotic" ? defaultExotic : defaultCommon }),
  );
  filterToggle.classList.add("scale-filter");
  scaleSection.appendChild(filterToggle);
  container.appendChild(scaleSection);

  // ── Tuning ────────────────────────────────────────────────────────────────
  const filteredTunings = getTuningsForStringCount(state.tuning.strings.length);
  container.appendChild(makeButtonGroup(
    filteredTunings.map((t) => t.name),
    state.tuning.name,
    (name) => {
      const t = filteredTunings.find((tu) => tu.name === name)!;
      onChange({ ...state, tuning: t });
    },
    "Tuning",
  ));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeLabel(text: string): HTMLLabelElement {
  const el = document.createElement("label");
  el.textContent = text;
  return el;
}

function makeToggleGroup(
  options: { value: string; text: string }[],
  activeValue: string,
  onSelect: (value: string) => void,
): HTMLElement {
  const group = document.createElement("div");
  group.className = "label-toggle";
  for (const opt of options) {
    const btn = document.createElement("button");
    btn.textContent = opt.text;
    btn.dataset["value"] = opt.value;
    if (activeValue === opt.value) btn.classList.add("active");
    btn.addEventListener("click", () => onSelect(opt.value));
    group.appendChild(btn);
  }
  return group;
}

function makeButtonGroup(
  options: string[],
  activeValue: string,
  onSelect: (value: string) => void,
  label: string,
): HTMLElement {
  const fieldset = document.createElement("fieldset");
  fieldset.className = "selector-group";

  const legend = document.createElement("legend");
  legend.textContent = label;
  fieldset.appendChild(legend);

  const group = document.createElement("div");
  group.className = "btn-group";
  for (const name of options) {
    const btn = document.createElement("button");
    btn.textContent = name;
    if (activeValue === name) btn.classList.add("active");
    btn.addEventListener("click", () => onSelect(name));
    group.appendChild(btn);
  }
  fieldset.appendChild(group);
  return fieldset;
}
