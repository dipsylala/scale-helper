// ---------------------------------------------------------------------------
// main.ts — Application entry point
// Wires controls → fretboard model → renderer.
// ---------------------------------------------------------------------------

import { mountSettings, mountSelectors } from "./controls";
import { AppState } from "./state";
import { buildFretboard } from "./fretboard";
import { renderNeck } from "./renderer";
import { saveState, loadState, saveTheme, loadTheme } from "./persistence";

const settingsEl  = document.getElementById("settings")!;
const selectorsEl = document.getElementById("selectors")!;
const neckEl      = document.getElementById("neck")!;
const themeBtn   = document.getElementById("theme-toggle") as HTMLButtonElement;

// ── Restore theme ─────────────────────────────────────────────────────────────
let theme = loadTheme();
document.documentElement.dataset["theme"] = theme;
themeBtn.textContent = theme === "light" ? "☀️" : "🌙";

// ── Theme toggle ─────────────────────────────────────────────────────────────
themeBtn.addEventListener("click", () => {
  theme = theme === "light" ? "dark" : "light";
  document.documentElement.dataset["theme"] = theme;
  themeBtn.textContent = theme === "light" ? "☀️" : "🌙";
  saveTheme(theme);
  // SVG colours are CSS custom properties — the browser repaints automatically.
  // No re-render needed.
});

let state: AppState = loadState();

function renderNeckOnly(): void {
  const grid = buildFretboard(state.tuning, state.scale, state.root, state.fretCount);
  renderNeck(neckEl, grid, state.labelMode, state.fretCount, state.handedness === "left");
}

function render(s: AppState, save = true): void {
  state = s;
  if (save) saveState(s);
  renderNeckOnly();
  mountSettings(settingsEl, state, render);
  mountSelectors(selectorsEl, state, render);
}

// Boot — state was just loaded from storage, no need to write it back
render(state, false);
