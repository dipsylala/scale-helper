# TODO — Potential Improvements

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
