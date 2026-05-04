// ---------------------------------------------------------------------------
// tunings.ts — Tuning registry
// Strings are ordered LOW → HIGH (string 6 first, string 1 last), matching
// the bottom-to-top visual order of the neck diagram.
// MIDI values: middle C (C4) = 60.
//
// Quick MIDI reference — add/subtract 12 per octave:
//
//   Oct  │  C   C#   D   D#   E   F   F#   G   G#   A   A#   B
//   ─────┼──────────────────────────────────────────────────────
//   -1   │   0    1   2    3   4   5    6   7    8   9   10  11
//    0   │  12   13  14   15  16  17   18  19   20  21   22  23
//    1   │  24   25  26   27  28  29   30  31   32  33   34  35
//    2   │  36   37  38   39  40  41   42  43   44  45   46  47
//    3   │  48   49  50   51  52  53   54  55   56  57   58  59
//    4   │  60   61  62   63  64  65   66  67   68  69   70  71  ← middle C
//    5   │  72   73  74   75  76  77   78  79   80  81   82  83
//    6   │  84   85  86   87  88  89   90  91   92  93   94  95
//
// Common open-string references:
//   Low B  (7-string / 5-string bass) = 35   (B1)
//   Low E  (standard guitar)          = 40   (E2)
//   Low E  (bass guitar)              = 28   (E1)
//   Middle C                          = 60   (C4)
// ---------------------------------------------------------------------------

export interface Tuning {
  name: string;
  /** MIDI note numbers for open strings, ordered low → high (6 strings). */
  strings: readonly number[];
}

export const TUNINGS: readonly Tuning[] = [
  // ── Standard & variants ───────────────────────────────────────────────────
  { name: "Standard (E A D G B E)",            strings: [40, 45, 50, 55, 59, 64] },
  { name: "Half-step Down (Eb Ab Db Gb Bb Eb)", strings: [39, 44, 49, 54, 58, 63] },
  { name: "Full Step Down / D Standard",        strings: [38, 43, 48, 53, 57, 62] },
  { name: "C Standard (C F Bb Eb G C)",         strings: [36, 41, 46, 51, 55, 60] },

  // ── Drop tunings ──────────────────────────────────────────────────────────
  { name: "Drop D (D A D G B E)",               strings: [38, 45, 50, 55, 59, 64] },
  { name: "Double Drop D (D A D G B D)",        strings: [38, 45, 50, 55, 59, 62] },
  { name: "Drop C (C G C F A D)",               strings: [36, 43, 48, 53, 57, 62] },

  // ── Open tunings ──────────────────────────────────────────────────────────
  { name: "Open G (D G D G B D)",               strings: [38, 43, 50, 55, 59, 62] },
  { name: "Open D (D A D F# A D)",              strings: [38, 45, 50, 54, 57, 62] },
  { name: "Open E (E B E G# B E)",              strings: [40, 47, 52, 56, 59, 64] },
  { name: "Open A (E A E A C# E)",              strings: [40, 45, 52, 57, 61, 64] },
  { name: "Open C (C G C G C E)",               strings: [36, 43, 48, 55, 60, 64] },

  // ── Modal / other ─────────────────────────────────────────────────────────
  { name: "DADGAD",                             strings: [38, 45, 50, 55, 57, 62] },

  // ── 7-string ──────────────────────────────────────────────────────────────
  { name: "7-String Standard (B E A D G B E)",    strings: [35, 40, 45, 50, 55, 59, 64] },
  { name: "7-String Drop A (A E A D G B E)",      strings: [33, 40, 45, 50, 55, 59, 64] },
  { name: "7-String Half-step Down",              strings: [34, 39, 44, 49, 54, 58, 63] },

  // ── 8-string ──────────────────────────────────────────────────────────────
  { name: "8-String Standard (F# B E A D G B E)", strings: [30, 35, 40, 45, 50, 55, 59, 64] },
  { name: "8-String Drop E (E B E A D G B E)",    strings: [28, 35, 40, 45, 50, 55, 59, 64] },
  { name: "8-String Half-step Down",              strings: [29, 34, 39, 44, 49, 54, 58, 63] },

  // ── 5-string bass ─────────────────────────────────────────────────────────
  { name: "5-String Bass Standard (B E A D G)",   strings: [23, 28, 33, 38, 43] },
  { name: "5-String Bass High-C (E A D G C)",     strings: [28, 33, 38, 43, 48] },
  { name: "5-String Bass Drop A (A E A D G)",     strings: [21, 28, 33, 38, 43] },

  // ── 4-string bass ─────────────────────────────────────────────────────────
  { name: "4-String Bass Standard (E A D G)",     strings: [28, 33, 38, 43] },
  { name: "4-String Bass Drop D (D A D G)",       strings: [26, 33, 38, 43] },
  { name: "4-String Bass D Standard (D G C F)",   strings: [26, 31, 36, 41] },
  { name: "4-String Bass Half-step Down",         strings: [27, 32, 37, 42] },

  // ── 4-string cigar box ────────────────────────────────────────────────────
  { name: "Cigar Box 4 Open G (G D G B)",         strings: [43, 50, 55, 59] },
  { name: "Cigar Box 4 Open D (D A D F#)",        strings: [38, 45, 50, 54] },
  { name: "Cigar Box 4 Open G Low (D G D G)",     strings: [38, 43, 50, 55] },
  { name: "Cigar Box 4 Open E (E B E G#)",        strings: [40, 47, 52, 56] },

  // ── 3-string (cigar box) ──────────────────────────────────────────────────
  { name: "Cigar Box Open G (G D G)",             strings: [43, 50, 55] },
  { name: "Cigar Box Open D (D A D)",             strings: [38, 45, 50] },
  { name: "Cigar Box Open A (A E A)",             strings: [45, 52, 57] },
];

/** All string counts present in the TUNINGS list, sorted ascending. */
export const AVAILABLE_STRING_COUNTS: readonly number[] =
  [...new Set(TUNINGS.map((t) => t.strings.length))].sort((a, b) => a - b);

/** Returns all tunings that use exactly n strings. */
export function getTuningsForStringCount(n: number): readonly Tuning[] {
  return TUNINGS.filter((t) => t.strings.length === n);
}

/** Returns the MIDI note number at a given fret on an open string. */
export function getNoteAtFret(openMidi: number, fret: number): number {
  return openMidi + fret;
}
