# Scale Helper — Product Spec

## Problem Statement

Guitar players learning scales need a visual reference showing where every note of
a given scale falls on the fretboard. Existing tools are often cluttered, require
sign-up, or don't make the underlying theory (scale as intervals) transparent. A
simple, self-contained web page that lets the learner pick a tuning, a scale, and a
root note — and immediately see the correct notes lit up — removes that friction.

---

## Solution

A single-page static web application (TypeScript + Vite, deployable to GitHub Pages)
that renders a guitar neck diagram. A control bar at the top of the page lets the
user configure tuning, scale, root note, fret count, and note label style. Every
time any control changes, the neck re-renders to show only the notes that belong to
the selected scale, with the root note visually distinct from the other scale tones.

The core scale logic is defined as **interval arrays** (semitone offsets from the
root), making it straightforward to map a scale onto any tuning without hard-coding
note names.

---

## User Stories

### Control Bar

1. As a learner, I want a dropdown to select a tuning, so that the neck reflects
   the actual open-string pitches of my guitar.
2. As a learner, I want a dropdown to select a scale (e.g. Major, Minor, Blues),
   so that I can explore different tonalities.
3. As a learner, I want a dropdown to select the root note (C through B, using
   sharps for accidentals), so that I can practise the scale in any key.
4. As a learner, I want a number input (or stepper) to set how many frets are
   shown (defaulting to 21), so that the diagram matches the length of my guitar
   neck.
5. As a learner, I want a toggle/radio group to switch between three label styles
   — **dots only**, **note names**, and **scale degrees** — so that I can focus on
   theory or on note names depending on my practice goal.
6. As a learner, I want all controls to sit in a single row across the top of the
   page, so that the neck diagram has as much screen space as possible.

### Neck Diagram

7. As a learner, I want to see a horizontal neck diagram with the lowest-pitched
   string at the bottom, consistent with standard guitar tablature.
8. As a learner, I want open strings (fret 0) to be shown to the left of the nut,
   so that I can include open-position notes in my practice.
9. As a learner, I want standard fret position markers (single dots at frets 3, 5,
   7, 9, 15, 17, 19; double dots at frets 12 and 21) rendered below the lowest
   string, so that I can orient myself on the neck.
10. As a learner, I want fret numbers displayed at the top of the diagram, so that
    I can identify fret positions at a glance.
11. As a learner, I want string names (the open-string note name) displayed at the
    far left, so that I know which string is which.
12. As a learner, I want scale notes to be shown as filled circles on the
    appropriate string/fret intersections, so that I can see exactly where to place
    my fingers.
13. As a learner, I want the root note to be displayed in a visually distinct
    colour or shape (e.g. filled square or contrasting colour), so that I always
    know where the tonic is.
14. As a learner, I want non-scale notes to be invisible (no dot, no label), so
    that the diagram is uncluttered.

### Appearance

15. As a learner, I want a dark/light mode toggle in the header, so that I can
    use the app comfortably in different lighting conditions.
16. As a learner, I want my chosen theme to be remembered across sessions, so that
    I do not have to switch it every time I open the app.

### Label Modes

17. As a learner in **dots only** mode, I want scale-note circles to contain no
    text, so that I can focus purely on patterns and shapes.
18. As a learner in **note names** mode, I want each scale-note circle to display
    the note's letter name (e.g. "A", "C#"), so that I can learn the names of the
    notes on the neck.
19. As a learner in **scale degrees** mode, I want each scale-note circle to
    display the degree number (1–7 for diatonic scales; 1, 2, 3, 5, 6 for
    pentatonic major; etc.), so that I can understand the function of each note
    within the scale.

### Reactivity

20. As a learner, I want the neck to re-render immediately whenever I change any
    control, without a page reload, so that I can explore different options quickly.

---

## Acceptance Criteria

1. The control bar contains exactly five controls in order: **Tuning**, **Scale**,
   **Root**, **Frets**, and **Labels**.
2. The **Tuning** dropdown offers the following options, grouped by category
   (display name → open strings low-to-high):

   *Standard & variants*
   - Standard → E A D G B E
   - Half-step Down → Eb Ab Db Gb Bb Eb
   - Full Step Down / D Standard → D G C F A D
   - C Standard → C F Bb Eb G C

   *Drop tunings*
   - Drop D → D A D G B E
   - Double Drop D → D A D G B D
   - Drop C → C G C F A D

   *Open tunings*
   - Open G → D G D G B D
   - Open D → D A D F# A D
   - Open E → E B E G# B E
   - Open A → E A E A C# E
   - Open C → C G C G C E

   *Modal / other*
   - DADGAD → D A D G A D

3. The **Scale** dropdown offers the following scales, in order (common first,
   then exotic/shred):
   Pentatonic Minor, Pentatonic Major, Blues, Natural Minor (Aeolian),
   Major (Ionian), Harmonic Minor, Dorian, Mixolydian, Melodic Minor,
   Phrygian, Lydian, Locrian, Phrygian Dominant, Lydian Dominant,
   Whole Tone, Diminished (Half-Whole), Diminished (Whole-Half),
   Double Harmonic Major, Hungarian Minor, Super Locrian (Altered), Enigmatic.
4. The **Root** dropdown offers all 12 chromatic pitches using sharps for
   accidentals: C, C#, D, D#, E, F, F#, G, G#, A, A#, B.
5. The **Frets** input defaults to 21; the user can change it; values outside the
   range 12–24 are clamped or rejected.
6. The **Labels** toggle has three states: Dots, Note Names, Scale Degrees.
7. All controls default to: Standard tuning, Pentatonic Minor scale, root C, 21 frets, Dots
   labels.
18. A **theme toggle** button (🌙/☀️) is present in the header; clicking it
    switches between dark and light themes.
19. The selected theme is persisted in `localStorage` and restored on next load;
    the default theme is dark.
20. All UI colours (background, text, controls, neck) update immediately when the
    theme changes, via CSS custom properties on `<html data-theme>`.
8. The neck diagram is drawn horizontally; string 1 (highest pitch) is at the top,
   string 6 (lowest pitch) is at the bottom.
9. Open strings (fret 0) are displayed as a column to the left of the nut line.
10. Fret numbers are shown above each fret column (1, 2, 3 … N).
11. String names are shown to the left of the open-string column.
12. Standard fretboard position markers appear below the neck at frets 3, 5, 7, 9,
    15, 17, 19, 21 (single dot) and 12, 24 (double dot), subject to the fret count.
13. For E Major (root E, Major scale, Standard tuning), fret 0 string 6 is
    highlighted as the root and fret 0 string 1 is highlighted as the root.
14. For E Major, exactly the notes E, F#, G#, A, B, C#, D# are highlighted across
    the entire neck; no other notes show dots.
15. The root note dot is visually distinct (different fill colour or shape) from
    other scale-note dots.
16. In Note Names mode every visible dot shows the correct note name with no text
    on non-scale frets.
17. In Scale Degrees mode every visible dot shows the correct degree (e.g. root = 1,
    major second = 2).
18. Changing any control updates the diagram without a full page reload.

---

## Implementation Decisions

### Modules

#### `scales.ts` — Scale Registry (deep module)
- Defines each scale as a `{ name: string; degrees: number[] }` object where
  `degrees` is an array of semitone offsets from the root (0–11), sorted ascending,
  always starting with 0.
- Exports a `SCALES` constant (ordered list) and a `getScaleNotes(root: number,
  scale: Scale): Set<number>` helper that returns the set of MIDI pitch-classes
  (mod 12) in the scale.
- Also exports `getDegreeLabel(semitone: number, scale: Scale, root: number):
  string` to map a pitch-class to its degree number (e.g. "1", "b3", "5").
- Purely functional; no DOM dependency. Fully unit-testable.

**Interval definitions (semitones from root):**

| Scale | Intervals |
|---|---|
| Pentatonic Minor | 0 3 5 7 10 |
| Pentatonic Major | 0 2 4 7 9 |
| Blues | 0 3 5 6 7 10 |
| Natural Minor (Aeolian) | 0 2 3 5 7 8 10 |
| Major (Ionian) | 0 2 4 5 7 9 11 |
| Harmonic Minor | 0 2 3 5 7 8 11 |
| Dorian | 0 2 3 5 7 9 10 |
| Mixolydian | 0 2 4 5 7 9 10 |
| Melodic Minor | 0 2 3 5 7 9 11 |
| Phrygian | 0 1 3 5 7 8 10 |
| Lydian | 0 2 4 6 7 9 11 |
| Locrian | 0 1 3 5 6 8 10 |
| Phrygian Dominant | 0 1 4 5 7 8 10 |
| Lydian Dominant | 0 2 4 6 7 9 10 |
| Whole Tone | 0 2 4 6 8 10 |
| Diminished (Half-Whole) | 0 1 3 4 6 7 9 10 |
| Diminished (Whole-Half) | 0 2 3 5 6 8 9 11 |
| Double Harmonic Major | 0 1 4 5 7 8 11 |
| Hungarian Minor | 0 2 3 6 7 8 11 |
| Super Locrian (Altered) | 0 1 3 4 6 8 10 |
| Enigmatic | 0 1 4 6 8 10 11 |

#### `tunings.ts` — Tuning Registry (deep module)
- Defines each tuning as `{ name: string; strings: number[] }` where `strings` is
  an array of 6 MIDI note numbers, ordered **low string first** (string 6 → string
  1), matching the neck's bottom-to-top visual order.
- Exports a `TUNINGS` constant and a `getNoteAtFret(openMidi: number, fret: number):
  number` helper (simply `openMidi + fret`).
- Purely functional; fully unit-testable.

**MIDI values for open strings (middle C = 60, low E standard = 40):**

| Tuning | String 6→1 MIDI |
|---|---|
| Standard | 40 45 50 55 59 64 |
| Half-step Down | 39 44 49 54 58 63 |
| Full Step Down / D Standard | 38 43 48 53 57 62 |
| C Standard | 36 41 46 51 55 60 |
| Drop D | 38 45 50 55 59 64 |
| Double Drop D | 38 45 50 55 59 62 |
| Drop C | 36 43 48 53 57 62 |
| Open G | 38 43 50 55 59 62 |
| Open D | 38 45 50 54 57 62 |
| Open E | 40 47 52 56 59 64 |
| Open A | 40 45 52 57 61 64 |
| Open C | 36 43 48 55 60 64 |
| DADGAD | 38 45 50 55 57 62 |

#### `fretboard.ts` — Fretboard Model (deep module)
- Accepts a tuning, a scale, a root pitch-class (0–11), and a fret count.
- Returns a 2D array `Cell[][]` (indexed `[stringIndex][fretIndex]` where fret 0
  is the open string) where each `Cell` contains:
  - `midi: number` — absolute MIDI note
  - `pitchClass: number` — `midi % 12`
  - `noteName: string` — e.g. "A#"
  - `inScale: boolean`
  - `isRoot: boolean`
  - `degreeLabel: string` — e.g. "1", "b3", "5"
- Purely functional; fully unit-testable.

#### `renderer.ts` — SVG Neck Renderer
- Accepts the 2D `Cell[][]` grid, a `LabelMode` string union (`"dots" |
  "noteNames" | "degrees"`), the fret count, and a `Palette` object.
- The `Palette` is passed explicitly by `main.ts` (not read from the DOM inside
  the renderer), keeping `renderNeck` a pure function of its arguments.
- Exports `getPalette(theme: "dark" | "light"): Palette` so callers can obtain
  the correct palette before passing it in.
- Two built-in palettes: `DARK_PALETTE` (default) and `LIGHT_PALETTE`.
- Responsible for: neck background rect, nut, fret lines, string lines, position
  markers, fret number labels, string name labels, open-string column, scale-note
  dots.
- Root dots are rendered as rotated diamonds (amber); other scale dots are circles
  (blue); non-scale positions are empty.
- Re-renders by replacing the SVG element.

#### `controls.ts` — Control Bar
- Builds and mounts the top control bar into a given DOM node.
- Fires a `change` callback with the new full configuration state whenever any
  control changes.
- Encapsulates all DOM event handling.

#### `persistence.ts` — State & Theme Persistence
- Saves and restores `AppState` and the active theme via `localStorage`.
- State is serialised by **name** (not array index), so it is robust to
  scale/tuning reordering.
- Validates all fields on load; falls back to `DEFAULT_STATE` for any missing or
  out-of-range value.
- Exports: `saveState`, `loadState`, `saveTheme`, `loadTheme`.
- Theme type is `"dark" | "light"` throughout — no raw strings.

#### `main.ts` — Application Entry Point
- Instantiates controls, renderer, and persistence.
- Holds application state (`AppState`) and current theme (`"dark" | "light"`).
- Restores state and theme from `localStorage` on boot.
- On any control change: saves state, recomputes the fretboard model, re-renders
  the neck with the current palette.
- Owns the dark/light mode toggle button and updates the `data-theme` attribute
  on `<html>` so CSS variables switch instantly.

### Architectural Decisions

- **No framework** — vanilla TypeScript with direct DOM/SVG manipulation keeps
  the bundle tiny and the app deployable as a single HTML file + JS bundle.
- **Vite** as the build tool: fast HMR for development, single-file output
  suitable for GitHub Pages.
- **SVG** (not Canvas) for the neck: SVG scales cleanly on all screen sizes and
  supports accessible `<title>` elements per note dot if desired later.
- **Interval-based scale definition**: scales are stored as semitone-offset arrays,
  not as fixed lists of note names. This means `scales.ts` has zero dependency on
  tuning or root and can be tested independently.
- **Pitch-class arithmetic** (`mod 12`): all note comparisons use pitch-class, so
  octave differences on the neck are transparent.
- Accidentals use **sharps only** throughout the codebase. Flat display is out of
  scope for v1.

---

## Testing Decisions

Good tests verify **observable behaviour through the public interface**, not internal
implementation. They do not import private helpers or test intermediate state.

### Modules to test

- **`scales.ts`**: given a root and a scale name, `getScaleNotes` returns the
  correct set of pitch-classes; `getDegreeLabel` returns correct labels for every
  interval in every scale.
- **`tunings.ts`**: `getNoteAtFret` returns correct MIDI values for several
  string/fret pairs across each tuning; open strings match the spec table above.
- **`fretboard.ts`**: for a known root, scale, and tuning, the 2D grid contains the
  correct `inScale`, `isRoot`, `noteName`, and `degreeLabel` values at specific
  positions. Spot-check: E Major Standard tuning, fret 0 string 6 → root; fret 2
  string 6 → F# in scale, degree "2".

### What makes a good test here

- Test at the module boundary (exported functions), not internal helpers.
- Use concrete expected values from the interval table in this spec — they are the
  ground truth.
- Tests should not import the renderer or touch the DOM.

---

## Out of Scope (v1)

- Left-handed / mirrored neck layout
- Bass guitar (4- or 5-string necks)
- Custom / user-defined tunings
- Custom / user-defined scales
- Capo support
- Chord diagrams
- Audio / playback of scale notes
- Mobile-first / responsive layout (the diagram may overflow on small screens)
- Flat accidental display

---

## Further Notes

- The spec table of MIDI values and interval arrays is the normative reference for
  testing. Implementations must match these values exactly.
- Fret position marker placement follows standard Fender/Gibson convention.
  Single dots at 3, 5, 7, 9, 15, 17, 19, 21; double dots at 12 and 24.
  Fret 21 has a single dot (the pattern repeats the first octave: 3→15, 5→17,
  7→19, 9→21; the double dot repeats at 24, not 21). Markers only render if the
  selected fret count is ≥ that fret number.
- The degree label for an interval should follow common theory notation:
  unaltered degrees are plain numbers ("1", "2", "3"…); flattened degrees use a
  "b" prefix ("b3", "b7"); raised degrees use "#" ("4#" → Lydian raised fourth).
  For pentatonic/blues scales the missing diatonic degrees are simply absent (no
  label shown for those frets, as they are not in the scale).
