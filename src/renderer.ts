// ---------------------------------------------------------------------------
// renderer.ts — SVG neck renderer
// Renders the guitar neck as an SVG element and mounts it into a container.
// String 0 (lowest pitch) is drawn at the BOTTOM; string N-1 (highest) at TOP.
// ---------------------------------------------------------------------------

import { Cell, NOTE_NAMES } from "./fretboard";

export type LabelMode = "dots" | "noteNames" | "degrees";

// ── Layout constants ─────────────────────────────────────────────────────────
const STRING_SPACING = 28;       // px between strings
const FRET_WIDTH = 48;           // px per fret column
const OPEN_COL_WIDTH = 44;       // px for the open-string (fret 0) column
const NUT_WIDTH = 6;             // px width of the nut bar
const PADDING_TOP = 28;          // space above highest string (fret numbers)
const PADDING_BOTTOM = 16;       // space below lowest string
const PADDING_LEFT = 36;         // space left of open column (string labels)
const NECK_EXTRA_RIGHT = 16;     // px past the last fret line to close off the neck
const NECK_V_BLEED = 4;          // px the neck background extends beyond the outer strings
const DOT_RADIUS = 11;
const FONT_SIZE_LABEL = 10;
const FONT_SIZE_FRET = 11;
const FONT_SIZE_STRING = 11;
// SVG text y-offset to visually centre glyphs on their anchor point.
// SVG text is anchored at the baseline; 0.35em approximates the cap-height midpoint.
const TEXT_V_OFFSET = FONT_SIZE_LABEL * 0.35;

// Position markers: fret → single | double
// Pattern: single at 3,5,7,9 and double at 12, then repeats (+12 each octave)
const POSITION_MARKERS: Record<number, "single" | "double"> = {
  3: "single", 5: "single", 7: "single", 9: "single",
  12: "double",
  15: "single", 17: "single", 19: "single", 21: "single",
  24: "double",
};

// ── Colour palettes ───────────────────────────────────────────────────────────
interface Palette {
  root: string;
  scale: string;
  text: string;
  string: string;
  fret: string;
  nut: string;
  neckBg: string;
  neckEdge: string;
  marker: string;
  fretNum: string;
  stringLabel: string;
}

const DARK_PALETTE: Palette = {
  root:        "#e67e22",
  scale:       "#2980b9",
  text:        "#ffffff",
  string:      "#8a8a8a",
  fret:        "#555555",
  nut:         "#cccccc",
  neckBg:      "#2a1f14",
  neckEdge:    "#3d2b18",
  marker:      "#c0c0c0",
  fretNum:     "#aaaaaa",
  stringLabel: "#cccccc",
};

const LIGHT_PALETTE: Palette = {
  root:        "#c0550a",
  scale:       "#1a6ea8",
  text:        "#ffffff",
  string:      "#666666",
  fret:        "#9e8a76",
  nut:         "#3a2e24",
  neckBg:      "#c8a96e",
  neckEdge:    "#a07840",
  marker:      "#1a1a1a",
  fretNum:     "#555555",
  stringLabel: "#333333",
};

export function getPalette(theme: "dark" | "light"): Palette {
  return theme === "light" ? LIGHT_PALETTE : DARK_PALETTE;
}

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K): SVGElementTagNameMap[K] {
  return document.createElementNS("http://www.w3.org/2000/svg", tag);
}

function attr(el: Element, attrs: Record<string, string | number>): void {
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, String(v));
  }
}

export function renderNeck(
  container: HTMLElement,
  /** grid[stringIndex][fretIndex], stringIndex 0 = lowest string */
  grid: Cell[][],
  labelMode: LabelMode,
  fretCount: number,
  palette: Palette,
  leftHanded = false,
): void {
  const numStrings = grid.length;
  const C = palette;

  const totalWidth  = PADDING_LEFT + OPEN_COL_WIDTH + NUT_WIDTH + fretCount * FRET_WIDTH + NECK_EXTRA_RIGHT;
  const totalHeight = PADDING_TOP + (numStrings - 1) * STRING_SPACING + PADDING_BOTTOM;

  // Mirror x coordinate for left-handed layout
  const mx  = (x: number): number => leftHanded ? totalWidth - x : x;
  // Mirror the left edge of a rect (its right edge becomes the mirrored left edge)
  const mrx = (x: number, w: number): number => leftHanded ? totalWidth - x - w : x;
  // Flip text-anchor horizontally
  const ta  = (anchor: "start" | "end" | "middle"): string =>
    leftHanded && anchor !== "middle" ? (anchor === "start" ? "end" : "start") : anchor;

  const svg = svgEl("svg");
  attr(svg, {
    width: totalWidth,
    height: totalHeight,
    viewBox: `0 0 ${totalWidth} ${totalHeight}`,
    "aria-label": "Guitar fretboard diagram",
  });

  // ── Helper: x position of a fret column ──────────────────────────────────
  // fret 0 = open string column centre
  // fret 1..N = between fret lines
  const fretX = (fret: number): number => {
    if (fret === 0) return PADDING_LEFT + OPEN_COL_WIDTH / 2;
    return PADDING_LEFT + OPEN_COL_WIDTH + NUT_WIDTH + (fret - 0.5) * FRET_WIDTH;
  };

  // ── Helper: y position of a string ───────────────────────────────────────
  // string 0 = lowest = bottom → highest y
  const stringY = (stringIdx: number): number =>
    PADDING_TOP + (numStrings - 1 - stringIdx) * STRING_SPACING;

  // ── Neck background ─────────────────────────────────────────────────────
  const neckX = PADDING_LEFT + OPEN_COL_WIDTH;
  const neckY = PADDING_TOP - NECK_V_BLEED;
  const neckW = NUT_WIDTH + fretCount * FRET_WIDTH + NECK_EXTRA_RIGHT;
  const neckH = (numStrings - 1) * STRING_SPACING + NECK_V_BLEED * 2;
  const neckBg = svgEl("rect");
  attr(neckBg, {
    x: mrx(neckX, neckW), y: neckY,
    width: neckW, height: neckH,
    fill: C.neckBg,
    rx: 4,
    stroke: C.neckEdge,
    "stroke-width": 1,
  });
  svg.appendChild(neckBg);

  // ── Fret lines ────────────────────────────────────────────────────────────
  for (let f = 0; f <= fretCount; f++) {
    const x = mx(PADDING_LEFT + OPEN_COL_WIDTH + NUT_WIDTH + f * FRET_WIDTH);
    const line = svgEl("line");
    attr(line, {
      x1: x, y1: PADDING_TOP,
      x2: x, y2: PADDING_TOP + (numStrings - 1) * STRING_SPACING,
      stroke: C.fret,
      "stroke-width": 1,
    });
    svg.appendChild(line);
  }

  // ── Nut ───────────────────────────────────────────────────────────────────
  const nut = svgEl("rect");
  attr(nut, {
    x: mrx(PADDING_LEFT + OPEN_COL_WIDTH, NUT_WIDTH),
    y: PADDING_TOP,
    width: NUT_WIDTH,
    height: (numStrings - 1) * STRING_SPACING,
    fill: C.nut,
  });
  svg.appendChild(nut);

  // ── Position markers (on fretboard, at vertical midpoint) ─────────────────
  const markerCenterY = PADDING_TOP + ((numStrings - 1) * STRING_SPACING) / 2;
  for (const [fretStr, kind] of Object.entries(POSITION_MARKERS)) {
    const f = Number(fretStr);
    if (f > fretCount) continue;
    const cx = mx(fretX(f));
    if (kind === "single") {
      const circle = svgEl("circle");
      attr(circle, { cx, cy: markerCenterY, r: 5, fill: C.marker });
      svg.appendChild(circle);
    } else {
      // double dot — offset horizontally
      for (const offset of [-8, 8]) {
        const circle = svgEl("circle");
        attr(circle, { cx: cx + offset, cy: markerCenterY, r: 5, fill: C.marker });
        svg.appendChild(circle);
      }
    }
  }

  // ── String lines ──────────────────────────────────────────────────────────
  for (let s = 0; s < numStrings; s++) {
    const y = stringY(s);
    const line = svgEl("line");
    // Thicker strings for lower-pitched strings
    const thickness = 1 + ((numStrings - 1 - s) / (numStrings - 1)) * 2;
    attr(line, {
      x1: mx(PADDING_LEFT + OPEN_COL_WIDTH), y1: y,
      x2: mx(totalWidth - 8), y2: y,
      stroke: C.string,
      "stroke-width": thickness,
    });
    svg.appendChild(line);
  }

  // ── Fret numbers (above neck) ─────────────────────────────────────────────
  for (let f = 1; f <= fretCount; f++) {
    const t = svgEl("text");
    attr(t, {
      x: mx(fretX(f)),
      y: PADDING_TOP - 18,
      "text-anchor": "middle",
      "font-size": FONT_SIZE_FRET,
      fill: C.fretNum,
      "font-family": "monospace",
    });
    t.textContent = String(f);
    svg.appendChild(t);
  }

  // ── Note dots ─────────────────────────────────────────────────────────────
  for (let s = 0; s < numStrings; s++) {
    for (let f = 0; f <= fretCount; f++) {
      const cell = grid[s][f];
      if (!cell.inScale) continue;

      const cx = mx(fretX(f));
      const cy = stringY(s);
      const color = cell.isRoot ? C.root : C.scale;
      // Open strings (fret 0) are hollow; fretted notes are filled
      const open = f === 0;
      const dotFill   = open ? "none" : color;
      const dotStroke = color;

      if (cell.isRoot) {
        // Root: diamond (rotated square)
        const size = DOT_RADIUS * 1.1;
        const diamond = svgEl("rect");
        attr(diamond, {
          x: cx - size * 0.75,
          y: cy - size * 0.75,
          width: size * 1.5,
          height: size * 1.5,
          rx: 3,
          fill: dotFill,
          stroke: dotStroke,
          "stroke-width": open ? 2 : 0,
          transform: `rotate(45 ${cx} ${cy})`,
        });
        svg.appendChild(diamond);
      } else {
        const circle = svgEl("circle");
        attr(circle, {
          cx, cy, r: DOT_RADIUS,
          fill: dotFill,
          stroke: dotStroke,
          "stroke-width": open ? 2 : 0,
        });
        svg.appendChild(circle);
      }

      // Label text — open strings: string name drawn by label loop below.
      // Fretted notes: follow labelMode.
      let label = "";
      if (f > 0) {
        if (labelMode === "noteNames") label = cell.noteName;
        else if (labelMode === "degrees") label = cell.degreeLabel;
      }

      if (label) {
        const t = svgEl("text");
        attr(t, {
          x: cx,
          y: cy + TEXT_V_OFFSET,
          "text-anchor": "middle",
          "font-size": FONT_SIZE_LABEL,
          fill: open ? color : C.text,
          "font-family": "sans-serif",
          "font-weight": "bold",
          "pointer-events": "none",
        });
        t.textContent = label;
        svg.appendChild(t);
      }
    }
  }

  // ── String name labels (at open-string column, inside shape when in scale) ─
  // Drawn after dots so text sits on top of hollow shapes.
  for (let s = 0; s < numStrings; s++) {
    const cell = grid[s][0];
    const color = cell.inScale
      ? (cell.isRoot ? C.root : C.scale)
      : C.stringLabel;
    const t = svgEl("text");
    attr(t, {
      x: mx(fretX(0)),
      y: stringY(s) + TEXT_V_OFFSET,
      "text-anchor": "middle",
      "font-size": FONT_SIZE_STRING,
      fill: color,
      "font-family": "sans-serif",
      "font-weight": cell.inScale ? "bold" : "normal",
      "pointer-events": "none",
    });
    t.textContent = NOTE_NAMES[cell.midi % 12];
    svg.appendChild(t);
  }

  // Replace any existing SVG
  container.innerHTML = "";
  container.appendChild(svg);
}
