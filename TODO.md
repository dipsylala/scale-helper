# TODO — Potential Improvements

## Tests
- [ ] Add Vitest as dev dependency
- [ ] `scales.ts` — test `getScaleNotes` returns correct pitch-classes for every scale + root combo
- [ ] `scales.ts` — test `getDegreeLabel` returns correct labels for every interval in every scale
- [ ] `tunings.ts` — test `getNoteAtFret` against the MIDI table for all 33 tunings
- [ ] `fretboard.ts` — spot-check E Major / Standard: fret 0 string 6 → root, fret 2 string 6 → F# degree "2"
- [ ] `fretboard.ts` — verify no non-scale notes appear for a known configuration
- [ ] `persistence.ts` — test round-trip save/load with valid and corrupted data

## UX / Features (Out of Scope for v1)
- [ ] Custom / user-defined tunings
- [ ] Custom / user-defined scales
- [ ] Capo support
- [ ] Chord diagrams
- [ ] Flat accidental display (toggle between sharps and flats)
- [ ] Mobile-first responsive layout (diagram currently overflows on small screens)
- [ ] Keyboard navigation for selectors (arrow keys, Enter to select)
- [ ] Shareable URL with state encoded in query params
- [ ] Export fretboard as PNG/SVG
- [ ] Highlight scale patterns (CAGED shapes, 3NPS positions)
- [ ] Play full scale up/down on click (not just single notes)

## Performance
- [ ] Benchmark SVG re-render on control change — consider incremental updates if neck gets large (8-string × 24 frets)
- [ ] Pre-compute scale note sets on scale/root change rather than per-render
