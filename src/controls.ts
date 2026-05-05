// ---------------------------------------------------------------------------
// controls.ts — Control bar
// mountSettings: top bar (Strings, Frets, Labels, Handed)
// mountSelectors: below fretboard (Scale, Root, Tuning)
// Both fire onChange with the full AppState whenever any value changes.
// ---------------------------------------------------------------------------

import { AVAILABLE_STRING_COUNTS, getTuningsForStringCount } from "./tunings";
import { SCALES, Scale } from "./scales";
import { NOTE_NAMES } from "./fretboard";
import { AppState } from "./state";

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
  container.appendChild(
    makeToggleGroup(
      AVAILABLE_STRING_COUNTS.map((n) => ({ value: String(n), text: String(n) })),
      String(currentStringCount),
      (v) => {
        const newTuning = getTuningsForStringCount(Number(v))[0];
        onChange({ ...state, tuning: newTuning });
      },
      "Number of strings",
    ),
  );

  // ── Frets ─────────────────────────────────────────────────────────────────
  container.appendChild(makeLabel("Frets"));
  const fretInput = document.createElement("input");
  fretInput.type = "number";
  fretInput.min = "12";
  fretInput.max = "24";
  fretInput.value = String(state.fretCount);
  fretInput.className = "fret-input";
  fretInput.setAttribute("aria-label", "Number of frets to display");
  fretInput.addEventListener("change", () => {
    const v = Math.min(24, Math.max(12, Number(fretInput.value) || 21));
    fretInput.value = String(v);
    onChange({ ...state, fretCount: v });
  });
  container.appendChild(fretInput);

  // ── Labels ────────────────────────────────────────────────────────────────
  container.appendChild(makeLabel("Labels"));
  container.appendChild(
    makeToggleGroup(
      [
        { value: "dots", text: "Dots" },
        { value: "noteNames", text: "Note Names" },
        { value: "degrees", text: "Degrees" },
      ],
      state.labelMode,
      (v) => onChange({ ...state, labelMode: v }),
      "Note label style",
    ),
  );

  // ── Handed ────────────────────────────────────────────────────────────────
  container.appendChild(makeLabel("Handed"));
  container.appendChild(
    makeToggleGroup(
      [
        { value: "right", text: "Right" },
        { value: "left", text: "Left" },
      ],
      state.handedness,
      (v) => onChange({ ...state, handedness: v }),
      "Guitar handedness",
    ),
  );
}

// ── Below fretboard: scale, root, tuning ─────────────────────────────────────
export function mountSelectors(
  container: HTMLElement,
  state: AppState,
  onChange: (s: AppState) => void,
): void {
  container.innerHTML = "";

  // ── Tuning ────────────────────────────────────────────────────────────────
  const filteredTunings = getTuningsForStringCount(state.tuning.strings.length);
  container.appendChild(
    makeButtonGroup(
      filteredTunings.map((t) => t.name),
      state.tuning.name,
      (name) => {
        const t = filteredTunings.find((tu) => tu.name === name)!;
        onChange({ ...state, tuning: t });
      },
      "Tuning",
    ),
  );

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
    btn.setAttribute("aria-label", `Root note ${name}`);
    if (NOTE_NAMES[state.root] === name) {
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
    } else {
      btn.setAttribute("aria-pressed", "false");
    }
    btn.addEventListener("click", () =>
      onChange({ ...state, root: NOTE_NAMES.indexOf(name as (typeof NOTE_NAMES)[number]) }),
    );
    rootRow.appendChild(btn);
  }
  rootFieldset.appendChild(rootRow);
  container.appendChild(rootFieldset);

  // ── Scale (grouped grid) ──────────────────────────────────────────────────
  const scaleSection = document.createElement("fieldset");
  scaleSection.className = "selector-group scale-section";
  const scaleLegend = document.createElement("legend");
  scaleLegend.textContent = "Scale";
  scaleSection.appendChild(scaleLegend);

  const groups = new Map<string, Scale[]>();
  for (const s of SCALES) {
    if (!groups.has(s.group)) groups.set(s.group, []);
    groups.get(s.group)!.push(s);
  }

  const scaleGrid = document.createElement("div");
  scaleGrid.className = "scale-grid";
  for (const [groupName, groupScales] of groups) {
    const heading = document.createElement("span");
    heading.className = "scale-group-heading";
    heading.textContent = groupName;
    scaleGrid.appendChild(heading);
    for (const s of groupScales) {
      const btn = document.createElement("button");
      btn.textContent = s.name;
      btn.title = s.name;
      btn.setAttribute("aria-label", `${s.name} scale`);
      if (state.scale.name === s.name) {
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
      } else {
        btn.setAttribute("aria-pressed", "false");
      }
      btn.addEventListener("click", () => onChange({ ...state, scale: s }));
      scaleGrid.appendChild(btn);
    }
  }
  scaleSection.appendChild(scaleGrid);
  container.appendChild(scaleSection);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeLabel(text: string): HTMLSpanElement {
  const el = document.createElement("span");
  el.textContent = text;
  return el;
}

function makeToggleGroup<T extends string>(
  options: { value: T; text: string }[],
  activeValue: T,
  onSelect: (value: T) => void,
  ariaLabel?: string,
): HTMLElement {
  const group = document.createElement("div");
  group.className = "label-toggle";
  if (ariaLabel) group.setAttribute("aria-label", ariaLabel);
  group.setAttribute("role", "group");
  for (const opt of options) {
    const btn = document.createElement("button");
    btn.textContent = opt.text;
    btn.dataset["value"] = opt.value;
    btn.setAttribute("aria-label", `${opt.text}${ariaLabel ? ` — ${ariaLabel}` : ""}`);
    if (activeValue === opt.value) {
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
    } else {
      btn.setAttribute("aria-pressed", "false");
    }
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
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", label);
  for (const name of options) {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.setAttribute("aria-label", `${label}: ${name}`);
    if (activeValue === name) {
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
    } else {
      btn.setAttribute("aria-pressed", "false");
    }
    btn.addEventListener("click", () => onSelect(name));
    group.appendChild(btn);
  }
  fieldset.appendChild(group);
  return fieldset;
}
