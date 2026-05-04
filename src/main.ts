// ---------------------------------------------------------------------------
// main.ts — Application entry point
// Wires controls → fretboard model → renderer.
// ---------------------------------------------------------------------------

import { mountControls, AppState } from "./controls";
import { buildFretboard } from "./fretboard";
import { renderNeck, getPalette } from "./renderer";
import { saveState, loadState, saveTheme, loadTheme } from "./persistence";

const controlsEl = document.getElementById("controls")!;
const neckEl     = document.getElementById("neck")!;
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
  render(state); // re-render SVG with new palette
});

let state: AppState = loadState();

function render(s: AppState): void {
  state = s;
  saveState(s);
  const grid = buildFretboard(s.tuning, s.scale, s.root, s.fretCount);
  // palette is passed explicitly so renderNeck has no hidden DOM dependency
  renderNeck(neckEl, grid, s.labelMode, s.fretCount, getPalette(theme), s.handedness === "left");
  // Controls are re-mounted on every render so the Labels toggle reflects the
  // current active state. If focus/animation is added later, make surgical updates instead.
  mountControls(controlsEl, state, render);
}

// Boot
render(state);
