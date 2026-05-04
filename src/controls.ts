// ---------------------------------------------------------------------------
// controls.ts — Control bar
// mountSettings: top bar (Strings, Frets, Labels, Handed)
// mountSelectors: below fretboard (Scale, Root, Tuning)
// Both fire onChange with the full AppState whenever any value changes.
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

// Split index in SCALES where exotic scales begin
const EXOTIC_START = SCALES.findIndex((s) => s.name === "Phrygian Dominant");

// ── Top bar: settings that don't change often ─────────────────────────────────
export function mountSettings(
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
  container.appendChild(rootRow);

  // ── Scale (grid + Common/Exotic filter) ───────────────────────────────────
  const isExotic = SCALES.indexOf(state.scale) >= EXOTIC_START;
  const visibleScales = isExotic ? SCALES.slice(EXOTIC_START) : SCALES.slice(0, EXOTIC_START);

  const scaleSection = document.createElement("div");
  scaleSection.className = "scale-section";

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
    (v) => onChange({ ...state, scale: v === "exotic" ? SCALES[EXOTIC_START] : SCALES[0] }),
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
  const wrap = document.createElement("div");
  wrap.className = "btn-group-wrap";

  const heading = document.createElement("span");
  heading.className = "btn-group-label";
  heading.textContent = label;
  wrap.appendChild(heading);

  const group = document.createElement("div");
  group.className = "btn-group";
  for (const name of options) {
    const btn = document.createElement("button");
    btn.textContent = name;
    if (activeValue === name) btn.classList.add("active");
    btn.addEventListener("click", () => onSelect(name));
    group.appendChild(btn);
  }
  wrap.appendChild(group);
  return wrap;
}
