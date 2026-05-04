# Scale Helper

A static web application for visualising guitar scales on a fretboard diagram.

**Live site:** https://dipsylala.github.io/scale-helper/

## What it does

Pick a tuning, a scale, and a root note — the fretboard updates instantly to show every note in that scale across the full neck. Root notes are highlighted differently from other scale tones. Labels can be switched between plain dots, note names, and scale degrees.

All selections are remembered between sessions via `localStorage`. The URL also changes so if you want to share a particular set of settings, or bookmark them you can.

## Controls

| Control | Description |
|---|---|
| **Strings** | Number of strings (3–8) — switches to the first tuning for that string count |
| **Tuning** | 33 tunings across 3–8 strings: standard, drop, open, modal, bass, and cigar box variants |
| **Scale** | 21 scales: common modes, pentatonics, blues, and exotic/shred scales |
| **Root** | Chromatic root note (C–B, sharps) |
| **Frets** | Number of frets to display (12–24, default 21) |
| **Labels** | Dots only / Note names / Scale degrees |
| **Handed** | Right-handed (normal) or left-handed (mirrored neck) |
| **🌙 / ☀️** | Toggle dark/light mode |

Click any scale note on the fretboard to hear it played.

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Building

```bash
npm run build
```

Output goes to `dist/`. The `base` path is set to `/scale-helper/` in `vite.config.ts` for GitHub Pages.

## Deployment

Pushing to `main` triggers the GitHub Actions workflow at `.github/workflows/deploy.yml`, which builds the project and deploys `dist/` to GitHub Pages automatically.

To enable this on a fresh fork: **Settings → Pages → Source → GitHub Actions**.

## Project structure

```
src/
  state.ts        AppState interface and LabelMode type (pure types, zero imports at runtime)
  scales.ts       Scale registry — interval arrays, degree labels, categories
  tunings.ts      Tuning registry — MIDI open-string values, 3–8 strings
  fretboard.ts    Builds the 2-D Cell grid from tuning + scale + root
  renderer.ts     Renders the fretboard as an SVG element
  controls.ts     Builds the settings bar and selectors, fires onChange callbacks
  persistence.ts  Saves/restores state and theme via localStorage
  audio.ts        Web Audio API note playback (click a note to hear it)
  main.ts         Application entry point — DEFAULT_STATE, wires everything together
  style.css       CSS custom-property theming (dark + light)
```

Scales are defined as **semitone-offset arrays** (e.g. Major = `[0,2,4,5,7,9,11]`), making them tuning- and root-agnostic. The fretboard model is pure data with no DOM dependency, so all music-theory logic is unit-testable in isolation.

## Spec

See [SPEC.md](SPEC.md) for the full product requirements, acceptance criteria, and implementation decisions.
