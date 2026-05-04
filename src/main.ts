// ---------------------------------------------------------------------------
// main.ts — Application entry point
// Wires controls → fretboard model → renderer.
// ---------------------------------------------------------------------------

import { mountSettings, mountSelectors, ScaleMemory } from "./controls";
import { AppState } from "./state";
import { buildFretboard, NOTE_NAMES } from "./fretboard";
import { renderNeck, exportNeck, setActiveNote, mountNeckListener, NeckPlayDetail } from "./renderer";
import { saveState, loadState, saveTheme, loadTheme } from "./persistence";
import { TUNINGS } from "./tunings";
import { SCALES, Scale } from "./scales";
import { generateRun, generateTab } from "./run";

const DEFAULT_STATE: AppState = {
  tuning: TUNINGS[0],
  scale: SCALES[0],
  root: 0,
  fretCount: 21,
  labelMode: "dots",
  handedness: "right",
};

function createScaleMemory(): ScaleMemory {
  const last: Partial<Record<"common" | "exotic", Scale>> = {};
  return {
    remember(scale: Scale) {
      last[scale.category] = scale;
    },
    recall(category: "common" | "exotic") {
      return last[category];
    },
  };
}

const settingsEl = document.getElementById("settings")!;
const selectorsEl = document.getElementById("selectors")!;
const neckEl = document.getElementById("neck")!;
const runControlsEl = document.getElementById("run-controls")!;
const runTabEl = document.getElementById("run-tab")!;;
const themeBtn = document.getElementById("theme-toggle") as HTMLButtonElement;
const exportSvgBtn = document.getElementById("export-svg") as HTMLButtonElement;
const exportPngBtn = document.getElementById("export-png") as HTMLButtonElement;

// ── Restore theme ─────────────────────────────────────────────────────────────
let theme = loadTheme();
document.documentElement.dataset["theme"] = theme;
themeBtn.textContent = theme === "light" ? "☀️" : "🌙";
themeBtn.setAttribute("aria-label", `Toggle ${theme === "light" ? "dark" : "light"} mode`);

// ── Theme toggle ─────────────────────────────────────────────────────────────
themeBtn.addEventListener("click", () => {
  theme = theme === "light" ? "dark" : "light";
  document.documentElement.dataset["theme"] = theme;
  themeBtn.textContent = theme === "light" ? "☀️" : "🌙";
  themeBtn.setAttribute("aria-label", `Toggle ${theme === "light" ? "dark" : "light"} mode`);
  saveTheme(theme);
  // SVG colours are CSS custom properties — the browser repaints automatically.
  // No re-render needed.
});

let state: AppState = loadState(DEFAULT_STATE);
const scaleMemory = createScaleMemory();

// ── Run state (not persisted) ─────────────────────────────────────────────────
let runDirection: "up" | "upDown" = "up";
let runBpm = 160;
let runPlaying = false;
let cancelRun: (() => void) | null = null;

function stopRun(): void {
  cancelRun?.();
  cancelRun = null;
  runPlaying = false;
}

function startRun(): void {
  stopRun();
  const grid = buildFretboard(state.tuning, state.scale, state.root, state.fretCount);
  const { sequence, phrases, repeatCount } = generateRun(grid, state.fretCount, runDirection);
  if (sequence.length === 0) return;

  // Derive open-string note names for the tab (stringIdx 0 = lowest).
  const stringNames = state.tuning.strings.map((midi) => NOTE_NAMES[midi % 12]);
  runTabEl.textContent = generateTab(sequence, stringNames, runDirection);

  runPlaying = true;
  mountRunControls();

  const ms = (60 / runBpm) * 1000;
  const timers: ReturnType<typeof setTimeout>[] = [];
  let cancelled = false;

  sequence.forEach((note, i) => {
    timers.push(
      setTimeout(() => {
        if (cancelled) return;
        neckEl.dispatchEvent(
          new CustomEvent<NeckPlayDetail>("neck:play", {
            detail: { stringIdx: note.stringIdx, fretIdx: note.fretIdx, midi: note.midi },
          }),
        );
      }, i * ms),
    );
  });

  timers.push(
    setTimeout(() => {
      if (cancelled) return;
      runPlaying = false;
      cancelRun = null;
      setActiveNote(neckEl, null);
      mountRunControls();
    }, sequence.length * ms),
  );

  cancelRun = () => { cancelled = true; timers.forEach(clearTimeout); };
}

function mountRunControls(): void {
  runControlsEl.innerHTML = "";

  const sectionLabel = document.createElement("span");
  sectionLabel.className = "run-section-label";
  sectionLabel.textContent = "Scale Run";
  runControlsEl.appendChild(sectionLabel);

  // Direction toggle (reuses .label-toggle style from settings)
  const dirLabel = document.createElement("label");
  dirLabel.textContent = "Direction";
  runControlsEl.appendChild(dirLabel);

  const dirGroup = document.createElement("div");
  dirGroup.className = "label-toggle";
  dirGroup.setAttribute("role", "group");
  dirGroup.setAttribute("aria-label", "Run direction");
  for (const [val, text] of [["up", "↑ Up"], ["upDown", "↑↓ Up + Down"]] as const) {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.className = runDirection === val ? "active" : "";
    btn.setAttribute("aria-pressed", String(runDirection === val));
    btn.addEventListener("click", () => {
      runDirection = val;
      mountRunControls();
    });
    dirGroup.appendChild(btn);
  }
  runControlsEl.appendChild(dirGroup);

  const bpmLabel = document.createElement("label");
  bpmLabel.textContent = "BPM";
  runControlsEl.appendChild(bpmLabel);

  const bpmInput = document.createElement("input");
  bpmInput.type = "number";
  bpmInput.min = "40";
  bpmInput.max = "240";
  bpmInput.value = String(runBpm);
  bpmInput.className = "bpm-input";
  bpmInput.setAttribute("aria-label", "Tempo in beats per minute");
  bpmInput.addEventListener("change", () => {
    runBpm = Math.min(240, Math.max(40, Number(bpmInput.value) || 120));
    bpmInput.value = String(runBpm);
  });
  runControlsEl.appendChild(bpmInput);

  // Play / Stop button
  const playBtn = document.createElement("button");
  playBtn.className = "run-play-btn" + (runPlaying ? " active" : "");
  playBtn.textContent = runPlaying ? "■ Stop" : "▶ Run";
  playBtn.setAttribute("aria-label", runPlaying ? "Stop scale run" : "Play scale run");
  playBtn.addEventListener("click", () => {
    if (runPlaying) {
      stopRun();
      setActiveNote(neckEl, null);
      mountRunControls();
    } else {
      startRun();
    }
  });
  runControlsEl.appendChild(playBtn);
}

function renderNeckOnly(): void {
  const grid = buildFretboard(state.tuning, state.scale, state.root, state.fretCount);
  renderNeck(neckEl, grid, state.labelMode, state.fretCount, state.handedness === "left");
}

function render(s: AppState, save = true): void {
  stopRun();
  setActiveNote(neckEl, null);
  runTabEl.textContent = "";
  state = s;
  if (save) saveState(s);
  renderNeckOnly();
  mountSettings(settingsEl, state, render);
  mountSelectors(selectorsEl, state, render, scaleMemory);
  mountRunControls();
}

// ── Export ───────────────────────────────────────────────────────────────────
function exportFilename(): string {
  return [state.scale.name, NOTE_NAMES[state.root], state.tuning.name]
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-|-$/g, "");
}

exportSvgBtn.addEventListener("click", () => exportNeck(neckEl, "svg", exportFilename()));
exportPngBtn.addEventListener("click", () => exportNeck(neckEl, "png", exportFilename()));

// Boot — state was just loaded from storage, no need to write it back
mountNeckListener(neckEl);
render(state, false);
