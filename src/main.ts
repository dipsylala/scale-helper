// ---------------------------------------------------------------------------
// main.ts — Application entry point
// Wires controls → fretboard model → renderer.
// ---------------------------------------------------------------------------

import { mountSettings, mountSelectors } from "./controls";
import { AppState } from "./state";
import { buildFretboard, NOTE_NAMES } from "./fretboard";
import { renderNeck, exportNeck, mountNeckListener } from "./renderer";
import { saveState, loadState, saveTheme, loadTheme } from "./persistence";
import { hasURLParams, paramsToState, syncURLToState } from "./url";
import { TUNINGS } from "./tunings";
import { SCALES } from "./scales";

const DEFAULT_STATE: AppState = {
  tuning: TUNINGS[0],
  scale: SCALES[0],
  root: 0,
  fretCount: 21,
  labelMode: "dots",
  handedness: "right",
};

const settingsEl = document.getElementById("settings")!;
const selectorsEl = document.getElementById("selectors")!;
const neckEl = document.getElementById("neck")!;
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

let state: AppState = hasURLParams()
  ? paramsToState(new URLSearchParams(window.location.search), DEFAULT_STATE)
  : loadState(DEFAULT_STATE);

function render(s: AppState, save = true): void {
  state = s;
  if (save) saveState(s);
  syncURLToState(s);
  const grid = buildFretboard(state.tuning, state.scale, state.root, state.fretCount);
  renderNeck(neckEl, grid, state.labelMode, state.fretCount, state.handedness === "left");
  mountSettings(settingsEl, state, render);
  mountSelectors(selectorsEl, state, render);
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
