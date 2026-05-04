# Scale Helper — Product and Technical Spec

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

1. As a learner, I want a segmented toggle to select the number of strings (3–8),
   so that the neck diagram matches my instrument. Switching string count selects
   the first available tuning for that count.
2. As a learner, I want a button group to select a tuning, so that the neck reflects
   the actual open-string pitches of my guitar.
3. As a learner, I want a button grid to select a scale (e.g. Major, Minor, Blues),
   so that I can explore different tonalities.
4. As a learner, I want a button row to select the root note (C through B, using
   sharps for accidentals), so that I can practise the scale in any key.
5. As a learner, I want a number input (or stepper) to set how many frets are
   shown (defaulting to 21), so that the diagram matches the length of my guitar
   neck.
6. As a learner, I want a toggle/radio group to switch between three label styles
   — **dots only**, **note names**, and **scale degrees** — so that I can focus on
   theory or on note names depending on my practice goal.
7. As a learner, I want a right/left handed toggle to mirror the neck diagram,
   so that it matches how I hold my guitar.
8. As a learner, I want all controls to sit in a single row across the top of the
   page, so that the neck diagram has as much screen space as possible.

### Neck Diagram

9. As a learner, I want to see a horizontal neck diagram with the lowest-pitched
   string at the bottom, consistent with standard guitar tablature.
10. As a learner, I want open strings (fret 0) to be shown to the left of the nut,
    so that I can include open-position notes in my practice.
11. As a learner, I want standard fret position markers (single dots at frets 3, 5,
    7, 9, 15, 17, 19, 21; double dots at frets 12 and 24) rendered at the vertical
    midpoint of the neck, so that I can orient myself on the neck.
12. As a learner, I want fret numbers displayed at the top of the diagram, so that
    I can identify fret positions at a glance.
13. As a learner, I want string names (the open-string note name) displayed at the
    far left, so that I know which string is which.
14. As a learner, I want scale notes to be shown as filled circles on the
    appropriate string/fret intersections, so that I can see exactly where to place
    my fingers.
15. As a learner, I want the root note to be displayed in a visually distinct
    colour or shape (e.g. filled square or contrasting colour), so that I always
    know where the tonic is.
16. As a learner, I want non-scale notes to be invisible (no dot, no label), so
    that the diagram is uncluttered.

### Appearance

17. As a learner, I want a dark/light mode toggle in the header, so that I can
    use the app comfortably in different lighting conditions.
18. As a learner, I want my chosen theme to be remembered across sessions, so that
    I do not have to switch it every time I open the app.

### Label Modes

19. As a learner in **dots only** mode, I want scale-note circles to contain no
    text, so that I can focus purely on patterns and shapes.
20. As a learner in **note names** mode, I want each scale-note circle to display
    the note's letter name (e.g. "A", "C#"), so that I can learn the names of the
    notes on the neck.
21. As a learner in **scale degrees** mode, I want each scale-note circle to
    display the degree number (1–7 for diatonic scales; 1, 2, 3, 5, 6 for
    pentatonic major; etc.), so that I can understand the function of each note
    within the scale.

### Reactivity

22. As a learner, I want the neck to re-render immediately whenever I change any
    control, without a page reload, so that I can explore different options quickly.

### Audio

23. As a learner, I want to click on a scale note to hear what it sounds like,
    so that I can connect the visual position with the actual pitch.

### Handedness

24. As a left-handed player, I want to mirror the neck diagram so that the nut
    is on the right and frets extend left, matching how I hold my guitar.

### String Count

25. As a player of non-standard instruments (7/8-string, bass, cigar box), I want
    to select the number of strings so that the neck diagram matches my instrument.

---

## Acceptance Criteria

1. The settings bar contains controls for: **Strings** (segmented toggle for string count), **Frets** (number input), **Labels** (three-way toggle), and **Handed** (right/left toggle).
   The selectors panel (below the fretboard) contains: **Root** (12 buttons), **Scale** (grid with Common/Exotic filter toggle), and **Tuning** (button group filtered by string count).
2. The **Tuning** dropdown offers 33 options across 3–8 strings, grouped by category.
   Selecting a string count filters the tuning list to only show tunings for that count.
   Switching string count selects the first tuning for that count.

   *Standard & variants (6-string)*
   - Standard (E A D G B E) → 40 45 50 55 59 64
   - Half-step Down (Eb Ab Db Gb Bb Eb) → 39 44 49 54 58 63
   - Full Step Down / D Standard → 38 43 48 53 57 62
   - C Standard (C F Bb Eb G C) → 36 41 46 51 55 60

   *Drop tunings (6-string)*
   - Drop D (D A D G B E) → 38 45 50 55 59 64
   - Double Drop D (D A D G B D) → 38 45 50 55 59 62
   - Drop C (C G C F A D) → 36 43 48 53 57 62

   *Open tunings (6-string)*
   - Open G (D G D G B D) → 38 43 50 55 59 62
   - Open D (D A D F# A D) → 38 45 50 54 57 62
   - Open E (E B E G# B E) → 40 47 52 56 59 64
   - Open A (E A E A C# E) → 40 45 52 57 61 64
   - Open C (C G C G C E) → 36 43 48 55 60 64

   *Modal / other (6-string)*
   - DADGAD → 38 45 50 55 57 62

   *7-string*
   - 7-String Standard (B E A D G B E) → 35 40 45 50 55 59 64
   - 7-String Drop A (A E A D G B E) → 33 40 45 50 55 59 64
   - 7-String Half-step Down → 34 39 44 49 54 58 63

   *8-string*
   - 8-String Standard (F# B E A D G B E) → 30 35 40 45 50 55 59 64
   - 8-String Drop E (E B E A D G B E) → 28 35 40 45 50 55 59 64
   - 8-String Half-step Down → 29 34 39 44 49 54 58 63

   *5-string bass*
   - 5-String Bass Standard (B E A D G) → 23 28 33 38 43
   - 5-String Bass High-C (E A D G C) → 28 33 38 43 48
   - 5-String Bass Drop A (A E A D G) → 21 28 33 38 43

   *4-string bass*
   - 4-String Bass Standard (E A D G) → 28 33 38 43
   - 4-String Bass Drop D (D A D G) → 26 33 38 43
   - 4-String Bass D Standard (D G C F) → 26 31 36 41
   - 4-String Bass Half-step Down → 27 32 37 42

   *4-string cigar box*
   - Cigar Box 4 Open G (G D G B) → 43 50 55 59
   - Cigar Box 4 Open D (D A D F#) → 38 45 50 54
   - Cigar Box 4 Open G Low (D G D G) → 38 43 50 55
   - Cigar Box 4 Open E (E B E G#) → 40 47 52 56

   *3-string cigar box*
   - Cigar Box Open G (G D G) → 43 50 55
   - Cigar Box Open D (D A D) → 38 45 50
   - Cigar Box Open A (A E A) → 45 52 57

3. The **Scale** selector offers the following scales in a button grid, in order (common first,
   then exotic/shred), filterable by Common/Exotic toggle:
   Pentatonic Minor, Pentatonic Major, Blues, Natural Minor (Aeolian),
   Major (Ionian), Harmonic Minor, Dorian, Mixolydian, Melodic Minor,
   Phrygian, Lydian, Locrian, Phrygian Dominant, Lydian Dominant,
   Whole Tone, Diminished (Half-Whole), Diminished (Whole-Half),
   Double Harmonic Major, Hungarian Minor, Super Locrian (Altered), Enigmatic.
4. The **Root** selector offers all 12 chromatic pitches as a button row using sharps for
   accidentals: C, C#, D, D#, E, F, F#, G, G#, A, A#, B.
5. The **Frets** input defaults to 21; the user can change it; values outside the
   range 12–24 are clamped or rejected.
6. The **Labels** toggle has three states: Dots, Note Names, Scale Degrees.
7. All controls default to: Standard tuning, Pentatonic Minor scale, root C, 21 frets, Dots
   labels, right-handed layout.
8. A **theme toggle** button (🌙/☀️) is present in the header; clicking it
   switches between dark and light themes.
9. The selected theme is persisted in `localStorage` and restored on next load;
   the default theme is dark.
10. All UI colours (background, text, controls, neck) update immediately when the
    theme changes, via CSS custom properties on `<html data-theme>`.
11. The neck diagram is drawn horizontally; the lowest-pitched string is at the
    bottom, the highest-pitched string is at the top, consistent with standard
    guitar tablature.
12. Open strings (fret 0) are displayed as a column to the left of the nut line.
13. Fret numbers are shown above each fret column (1, 2, 3 … N).
14. String names are shown to the left of the open-string column.
15. Standard fretboard position markers appear at the vertical midpoint of the neck
    at frets 3, 5, 7, 9, 15, 17, 19, 21 (single dot) and 12, 24 (double dot),
    subject to the fret count.
16. For E Major (root E, Major scale, Standard tuning), fret 0 string 6 is
    highlighted as the root and fret 0 string 1 is highlighted as the root.
17. For E Major, exactly the notes E, F#, G#, A, B, C#, D# are highlighted across
    the entire neck; no other notes show dots.
18. The root note dot is visually distinct (different fill colour or shape) from
    other scale-note dots.
19. In Note Names mode every visible dot shows the correct note name with no text
    on non-scale frets.
20. In Scale Degrees mode every visible dot shows the correct degree (e.g. root = 1,
    major second = 2).
21. Changing any control updates the diagram without a full page reload.
22. The **Handed** toggle switches between right-handed (nut left, frets extend right)
    and left-handed (mirrored) layout.
23. Clicking a scale note on the fretboard plays the corresponding note via the
    Web Audio API (lazy AudioContext, plucked-string synthesis).

---

## Implementation Decisions

### Modules

#### `scales.ts` — Scale Registry (deep module)
- Defines each scale as a `{ name: string; category: "common" | "exotic"; degrees: number[] }` object where
  `degrees` is an array of semitone offsets from the root (0–11), sorted ascending,
  always starting with 0.
- `category` is `"common"` for widely-used guitar scales (pentatonics, modes, blues)
  and `"exotic"` for advanced/shred/world scales. Controls use this to filter the
  scale grid rather than relying on a fragile index boundary.
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
  an array of MIDI note numbers of length 3–8, ordered **low string first**,
  matching the neck's bottom-to-top visual order.
- Exports a `TUNINGS` constant (33 tunings), `AVAILABLE_STRING_COUNTS` (derived
  from data: `[3, 4, 5, 6, 7, 8]`), `getTuningsForStringCount(n)`, and a
  `getNoteAtFret(openMidi, fret) => openMidi + fret` helper.
- 33 tunings spanning 3–8 strings: standard 6-string variants, drop/open/modal,
  7- and 8-string electric, 4- and 5-string bass, and 3- and 4-string cigar box.

**MIDI values for open strings (middle C = 60, low E standard = 40):**

| Tuning | Open Strings MIDI (low → high) |
|---|---|
| Standard (E A D G B E) | 40 45 50 55 59 64 |
| Half-step Down (Eb Ab Db Gb Bb Eb) | 39 44 49 54 58 63 |
| Full Step Down / D Standard | 38 43 48 53 57 62 |
| C Standard (C F Bb Eb G C) | 36 41 46 51 55 60 |
| Drop D (D A D G B E) | 38 45 50 55 59 64 |
| Double Drop D (D A D G B D) | 38 45 50 55 59 62 |
| Drop C (C G C F A D) | 36 43 48 53 57 62 |
| Open G (D G D G B D) | 38 43 50 55 59 62 |
| Open D (D A D F# A D) | 38 45 50 54 57 62 |
| Open E (E B E G# B E) | 40 47 52 56 59 64 |
| Open A (E A E A C# E) | 40 45 52 57 61 64 |
| Open C (C G C G C E) | 36 43 48 55 60 64 |
| DADGAD | 38 45 50 55 57 62 |
| 7-String Standard (B E A D G B E) | 35 40 45 50 55 59 64 |
| 7-String Drop A (A E A D G B E) | 33 40 45 50 55 59 64 |
| 7-String Half-step Down | 34 39 44 49 54 58 63 |
| 8-String Standard (F# B E A D G B E) | 30 35 40 45 50 55 59 64 |
| 8-String Drop E (E B E A D G B E) | 28 35 40 45 50 55 59 64 |
| 8-String Half-step Down | 29 34 39 44 49 54 58 63 |
| 5-String Bass Standard (B E A D G) | 23 28 33 38 43 |
| 5-String Bass High-C (E A D G C) | 28 33 38 43 48 |
| 5-String Bass Drop A (A E A D G) | 21 28 33 38 43 |
| 4-String Bass Standard (E A D G) | 28 33 38 43 |
| 4-String Bass Drop D (D A D G) | 26 33 38 43 |
| 4-String Bass D Standard (D G C F) | 26 31 36 41 |
| 4-String Bass Half-step Down | 27 32 37 42 |
| Cigar Box 4 Open G (G D G B) | 43 50 55 59 |
| Cigar Box 4 Open D (D A D F#) | 38 45 50 54 |
| Cigar Box 4 Open G Low (D G D G) | 38 43 50 55 |
| Cigar Box 4 Open E (E B E G#) | 40 47 52 56 |
| Cigar Box Open G (G D G) | 43 50 55 |
| Cigar Box Open D (D A D) | 38 45 50 |
| Cigar Box Open A (A E A) | 45 52 57 |

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
  "noteNames" | "degrees"`), the fret count, and a `leftHanded` boolean.
- All neck colours are CSS custom properties (e.g. `var(--neck-root)`,
  `var(--neck-scale)`) defined in `style.css` under `:root` and
  `[data-theme="light"]`. The SVG inherits the active theme automatically —
  no palette object or re-render needed on theme change.
- Two built-in themes: dark (default) and light, switched via
  `<html data-theme="dark" | "light">`.
- Responsible for: neck background rect, nut, fret lines, string lines, position
  markers, fret number labels, string name labels, open-string column, scale-note
  dots.
- Root dots are rendered as rotated diamonds (amber); other scale dots are circles
  (blue); non-scale positions are empty.
- Open strings (fret 0) are rendered as hollow shapes (transparent fill, coloured
  stroke); fretted notes are filled.
- Each note dot is wrapped in a clickable `<g>` group; clicking plays the note
  via `playNote()` from `audio.ts`.
- Re-renders by replacing the SVG element.

#### `audio.ts` — Web Audio API Note Playback
- Lazy `AudioContext` (created on first user gesture to comply with browser
  autoplay policy). Resumes if suspended (e.g. after page backgrounding).
- `playNote(midi: number)`: plays a short plucked-string tone for the given
  MIDI note using a sawtooth oscillator shaped by a low-pass filter sweep
  and gain decay envelope (~1.6s decay).
- Invoked when a user clicks a scale note dot on the fretboard.

#### `controls.ts` — Control Bar
- Exports `mountSettings(container, state, onChange)` (top bar: Strings, Frets,
  Labels, Handed toggles) and `mountSelectors(container, state, onChange,
  scaleMemory)` (below fretboard: Root, Scale, Tuning).
- Both functions rebuild the DOM on every call; `onChange` is called with the
  updated full `AppState` on any control change.
- Exports the `ScaleMemory` interface (`remember(scale)` / `recall(category)`).
  `main.ts` creates a `ScaleMemory` instance via `createScaleMemory()` (a closure
  over a per-category last-selected map) and passes it into `mountSelectors` so
  that switching the Common/Exotic filter returns the user to the scale they were
  last on in that category.
- All toggle groups use `aria-pressed` and `role="group"`; note buttons include
  `aria-label` attributes for screen reader accessibility.

#### `state.ts` — Shared State Types
- Exports the `AppState` interface and `LabelMode` type union.
- Uses `import type` for `Tuning` and `Scale` — erased at compile time, zero runtime dependency.
- Imported by `controls.ts`, `persistence.ts`, and `main.ts` so the type
  definition has a single authoritative home.

#### `main.ts` — Application Entry Point
- Defines `DEFAULT_STATE` (Standard tuning, Pentatonic Minor, root C, 21 frets, Dots, right-handed).
- Instantiates controls, renderer, and persistence.
- Holds application state (`AppState`) and current theme (`"dark" | "light"`).
- Restores state and theme from `localStorage` on boot.
- On a control change: saves state, recomputes the fretboard model, re-renders
  the neck, and remounts controls to reflect new state.
- On theme toggle: updates the `data-theme` attribute on `<html>` and the
  toggle button emoji. SVG colours are CSS custom properties so the browser
  repaints automatically — no re-render needed.
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
- **CSS custom properties** for theming: all neck colours use `var()` references
  so theme switching requires no re-render — the browser repaints automatically
  when `<html data-theme>` changes.
- **Web Audio API** for note playback: click-to-play uses a lazy `AudioContext`
  with a sawtooth oscillator + low-pass filter sweep to approximate a plucked
  string tone.

---

## Testing

**Framework**: [Vitest](https://vitest.dev/) — shares `vite.config.ts` directly,
so TypeScript and ESM work with zero extra config.

```
npm test          # single run
npm run test:watch  # interactive watch mode
```

Tests live alongside their source files as `src/*.test.ts` and run in a Node
environment (no DOM needed for the modules under test).

### Test files

| File | Tests | What's covered |
|---|---|---|
| `src/scales.test.ts` | 15 | Registry invariants; `getScaleNotes` (all roots, wrap-around); `getDegreeLabel` (correct labels, out-of-scale → `""`, negative offset wrap) |
| `src/tunings.test.ts` | 13 | Registry invariants (ascending strings, no duplicate names); `AVAILABLE_STRING_COUNTS`; `getTuningsForStringCount`; `getNoteAtFret` |
| `src/fretboard.test.ts` | 14 | Grid shape; MIDI / pitchClass / noteName accuracy; `inScale` / `isRoot` correctness for C major and A pentatonic minor; `degreeLabel` content |
| `src/persistence.test.ts` | 16 | Full round-trip save/load; empty storage; invalid JSON; unknown tuning/scale/labelMode; out-of-range root/fretCount; theme save/load |

### Principles

- Test at the module boundary (exported functions), not internal helpers.
- Use concrete expected values from the interval table in this spec — they are the
  ground truth.
- Tests must not import the renderer or touch the DOM.

---

## Out of Scope (v1)

- Custom / user-defined tunings
- Custom / user-defined scales
- Capo support
- Chord diagrams
- Flat accidental display
- Mobile-first / responsive layout (the diagram may overflow on small screens)

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
  "b" prefix ("b3", "b7"); raised degrees use a "#" prefix ("#4" → Lydian raised fourth).
  For pentatonic/blues scales the missing diatonic degrees are simply absent (no
  label shown for those frets, as they are not in the scale).
