/* ═════════════════════════════════════════════════════════════════════════
   BEATO CHORD FORMS — the book's drop voicings, transcribed from the PDF

   Every shape in `beatoShapes.json` was read out of the vector diagrams in
   Beato Book 4.0, Chapter 2 ("Chord Forms", pp. 112–184). Nothing here is
   generated: the four drop families, the eighteen chart types, the printed
   string sets, fret positions, root and page number are the book's own.

   The only operation performed at runtime is transposition: moving a printed
   shape along the neck so its root matches the requested chord. That keeps
   the shape identical while making it usable in any key.

   Source pages:
     Drop 2      pp. 113–130
     Drop 3      pp. 131–148
     Drop 2+3    pp. 149–166
     Drop 2+4    pp. 167–184
   ════════════════════════════════════════════════════════════════════════ */

import data from "./beatoShapes.json";

export const BEATO_FAMILIES = ["Drop 2", "Drop 3", "Drop 2+3", "Drop 2+4"] as const;
export type BeatoFamily = (typeof BEATO_FAMILIES)[number];

export const BEATO_CHART_ORDER = [
  "Maj6",
  "Maj7",
  "Dom7",
  "Min7",
  "Min6",
  "Minmaj7",
  "Min7b5",
  "Dim7",
  "Dimmaj7",
  "Augmaj7",
  "Aug7",
  "Maj7b5",
  "Dom7b5",
  "Maj7sus4",
  "Dom7sus4",
  "Lydianmaj7",
  "LydianDom7",
  "Dimmaj7b13",
] as const;
export type BeatoChart = (typeof BEATO_CHART_ORDER)[number];

export interface BeatoChartInfo {
  label: string;
  name: string;
  /** The chord symbol suffix used on the site. */
  suffix: string;
  /** Semitones above the root, as printed in the book's diagrams. */
  intervals: number[];
  /** The formula as the book writes it. */
  formula: string;
  firstPage: number;
}

export const BEATO_CHARTS: Record<BeatoChart, BeatoChartInfo> = {
  Maj6: { label: "Maj6", name: "Major sixth", suffix: "6", intervals: [0, 4, 7, 9], formula: "R 3 5 6", firstPage: 113 },
  Maj7: { label: "Maj7", name: "Major seventh", suffix: "maj7", intervals: [0, 4, 7, 11], formula: "R 3 5 7", firstPage: 114 },
  Dom7: { label: "Dom7", name: "Dominant seventh", suffix: "7", intervals: [0, 4, 7, 10], formula: "R 3 5 ♭7", firstPage: 115 },
  Min7: { label: "Min7", name: "Minor seventh", suffix: "m7", intervals: [0, 3, 7, 10], formula: "R ♭3 5 ♭7", firstPage: 116 },
  Min6: { label: "Min6", name: "Minor sixth", suffix: "m6", intervals: [0, 3, 7, 9], formula: "R ♭3 5 6", firstPage: 117 },
  Minmaj7: { label: "Minmaj7", name: "Minor major seventh", suffix: "mMaj7", intervals: [0, 3, 7, 11], formula: "R ♭3 5 7", firstPage: 118 },
  Min7b5: { label: "Min7♭5", name: "Half-diminished", suffix: "m7b5", intervals: [0, 3, 6, 10], formula: "R ♭3 ♭5 ♭7", firstPage: 119 },
  Dim7: { label: "Dim7", name: "Diminished seventh", suffix: "dim7", intervals: [0, 3, 6, 9], formula: "R ♭3 ♭5 𝄫7", firstPage: 120 },
  Dimmaj7: { label: "Dimmaj7", name: "Diminished major seventh", suffix: "dimMaj7", intervals: [0, 3, 6, 11], formula: "R ♭3 ♭5 7", firstPage: 121 },
  Augmaj7: { label: "Augmaj7", name: "Augmented major seventh", suffix: "augMaj7", intervals: [0, 4, 8, 11], formula: "R 3 ♯5 7", firstPage: 122 },
  Aug7: { label: "Aug7", name: "Augmented seventh", suffix: "7#5", intervals: [0, 4, 8, 10], formula: "R 3 ♯5 ♭7", firstPage: 123 },
  Maj7b5: { label: "Maj7♭5", name: "Major seventh flat five", suffix: "maj7b5", intervals: [0, 4, 6, 11], formula: "R 3 ♭5 7", firstPage: 124 },
  Dom7b5: { label: "Dom7♭5", name: "Dominant seventh flat five", suffix: "7b5", intervals: [0, 4, 6, 10], formula: "R 3 ♭5 ♭7", firstPage: 125 },
  Maj7sus4: { label: "Maj7sus4", name: "Major seventh suspended fourth", suffix: "maj7sus4", intervals: [0, 5, 7, 11], formula: "R 4 5 7", firstPage: 126 },
  Dom7sus4: { label: "Dom7sus4", name: "Dominant seventh suspended fourth", suffix: "7sus4", intervals: [0, 5, 7, 10], formula: "R 4 5 ♭7", firstPage: 127 },
  Lydianmaj7: { label: "Lydianmaj7", name: "Lydian major seventh", suffix: "maj7#11", intervals: [0, 6, 7, 11], formula: "R ♯4 5 7", firstPage: 128 },
  LydianDom7: { label: "LydianDom7", name: "Lydian dominant", suffix: "7#11", intervals: [0, 6, 7, 10], formula: "R ♯4 5 ♭7", firstPage: 129 },
  Dimmaj7b13: { label: "Dimmaj7♭13", name: "Diminished major seventh flat thirteen", suffix: "dimMaj7b13", intervals: [0, 3, 8, 11], formula: "R ♭3 ♯5 7", firstPage: 130 },
};

/** Column headings exactly as printed above the four diagrams on each page. */
export const BEATO_COLUMNS: Record<BeatoChart, readonly string[]> = {
  Maj6: ["Root", "3", "5", "6"],
  Maj7: ["Root", "3", "5", "7"],
  Dom7: ["Root", "3", "5", "b7"],
  Min7: ["Root", "b3", "5", "b7"],
  Min6: ["Root", "b3", "5", "6"],
  Minmaj7: ["Root", "b3", "5", "7"],
  Min7b5: ["Root", "b3", "b5", "b7"],
  Dim7: ["Root", "b3", "b5", "bb7"],
  Dimmaj7: ["Root", "b3", "b5", "7"],
  Augmaj7: ["Root", "3", "#5", "7"],
  Aug7: ["Root", "3", "#5", "b7"],
  Maj7b5: ["Root", "3", "b5", "7"],
  Dom7b5: ["Root", "3", "b5", "b7"],
  Maj7sus4: ["Root", "4", "5", "7"],
  Dom7sus4: ["Root", "4", "5", "b7"],
  Lydianmaj7: ["Root", "#4", "5", "7"],
  LydianDom7: ["Root", "#4", "5", "b7"],
  Dimmaj7b13: ["Root", "b3", "#5", "7"],
};

export interface BeatoShape {
  family: BeatoFamily;
  chart: BeatoChart;
  /** Column the book prints the shape under (Root / 3 / 5 / 6 / 7 …). */
  column: string;
  /** Bass interval in semitones above the root, read from the diagram. */
  bass: number;
  /** Fret per string, low E → high E. -1 = muted. As printed. */
  shape: number[];
  /** Root pitch class of the printed diagram. */
  printedRootPc: number;
  /** Printed page in the book. */
  page: number;
}

interface RawShape {
  f: string;
  c: string;
  i: string;
  b: number;
  s: number[];
  r: number;
  p: number;
}

const raw = data.shapes as RawShape[];

export const BEATO_SHAPES: readonly BeatoShape[] = raw.map((entry) => ({
  family: entry.f as BeatoFamily,
  chart: entry.c as BeatoChart,
  column: entry.i,
  bass: entry.b,
  shape: entry.s,
  printedRootPc: entry.r,
  page: entry.p,
}));

export const BEATO_SOURCE = data.source;
export const BEATO_SHAPE_COUNT = BEATO_SHAPES.length;

export function isBeatoChart(value: string): value is BeatoChart {
  return (BEATO_CHART_ORDER as readonly string[]).includes(value);
}

/**
 * Printed page of a chart inside a family.
 *
 * Drop 2 orders Min7 before Min6; the three other families print Min6 first.
 * Every family then follows the same sequence, one page per chart.
 */
export function beatoPage(chart: BeatoChart, family: BeatoFamily): number {
  const shared: BeatoChart[] = [
    "Maj6",
    "Maj7",
    "Dom7",
    "Min6",
    "Min7",
    "Minmaj7",
    "Min7b5",
    "Dim7",
    "Dimmaj7",
    "Augmaj7",
    "Aug7",
    "Maj7b5",
    "Dom7b5",
    "Maj7sus4",
    "Dom7sus4",
    "Lydianmaj7",
    "LydianDom7",
    "Dimmaj7b13",
  ];
  const order: BeatoChart[] =
    family === "Drop 2"
      ? [
          "Maj6",
          "Maj7",
          "Dom7",
          "Min7",
          "Min6",
          "Minmaj7",
          "Min7b5",
          "Dim7",
          "Dimmaj7",
          "Augmaj7",
          "Aug7",
          "Maj7b5",
          "Dom7b5",
          "Maj7sus4",
          "Dom7sus4",
          "Lydianmaj7",
          "LydianDom7",
          "Dimmaj7b13",
        ]
      : shared;
  const offsets: Record<BeatoFamily, number> = {
    "Drop 2": 0,
    "Drop 3": 18,
    "Drop 2+3": 36,
    "Drop 2+4": 54,
  };
  return 113 + order.indexOf(chart) + offsets[family];
}

export function isBeatoFamily(value: string): value is BeatoFamily {
  return (BEATO_FAMILIES as readonly string[]).includes(value);
}

export function getBeatoShapes(
  chart: BeatoChart,
  family?: BeatoFamily,
): BeatoShape[] {
  return BEATO_SHAPES.filter(
    (shape) => shape.chart === chart && (!family || shape.family === family),
  );
}

/** String numbers the shape sounds, low E = 6 → high E = 1, highest first. */
export function shapeStringNumbers(shape: readonly number[]): number[] {
  const strings: number[] = [];
  shape.forEach((fret, index) => {
    if (fret >= 0) strings.push(6 - index);
  });
  return strings.sort((a, b) => b - a);
}

/** Printed string set in the book's own order, e.g. "6-5-4-3". */
export function stringSetLabel(shape: readonly number[]): string {
  return shapeStringNumbers(shape).join("-");
}

/**
 * The string sets a family actually prints. Drop 2 uses three sets; the
 * other families use two.
 */
export function beatoStringSets(
  chart: BeatoChart,
  family: BeatoFamily,
): string[] {
  const seen = new Set<string>();
  for (const entry of getBeatoShapes(chart, family)) {
    seen.add(stringSetLabel(entry.shape));
  }
  return [...seen].sort((a, b) => {
    const aLow = Number(a.split("-")[0]);
    const bLow = Number(b.split("-")[0]);
    return bLow - aLow || a.localeCompare(b);
  });
}

export interface BeatoPlacement {
  book: BeatoShape;
  /** Absolute fret per string, low E → high E. */
  shape: number[];
  /** Semitones the printed shape was moved. */
  shift: number;
}

/**
 * Move a printed shape so its root becomes `targetRootPc`.
 *
 * The interval structure is untouched; only the whole shape slides along the
 * neck. Every octave that fits between the first fret and `maxFret` is
 * returned, lowest first. Open strings are never introduced: the book's drop
 * diagrams are all fretted shapes, so a placement that would reach fret 0 is
 * discarded rather than invented.
 */
export function placeBeatoShape(
  book: BeatoShape,
  targetRootPc: number,
  maxFret = 16,
): BeatoPlacement[] {
  const sounding = book.shape.filter((fret) => fret >= 0);
  if (sounding.length === 0) return [];
  const minFret = Math.min(...sounding);
  const maxPrinted = Math.max(...sounding);
  const delta = ((targetRootPc - book.printedRootPc) % 12 + 12) % 12;

  const out: BeatoPlacement[] = [];
  const seen = new Set<string>();
  for (let octave = -2; octave <= 2; octave += 1) {
    const shift = delta + octave * 12;
    if (minFret + shift < 1) continue;
    if (maxPrinted + shift > maxFret) continue;
    const shape = book.shape.map((fret) => (fret < 0 ? -1 : fret + shift));
    const key = shape.join(",");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ book, shape, shift });
  }
  return out.sort((a, b) => {
    const aMin = Math.min(...a.shape.filter((f) => f >= 0));
    const bMin = Math.min(...b.shape.filter((f) => f >= 0));
    return aMin - bMin;
  });
}

/** Every placement of every printed shape for a chart and root. */
export function placeBeatoChart(
  chart: BeatoChart,
  targetRootPc: number,
  family?: BeatoFamily,
  maxFret = 16,
): BeatoPlacement[] {
  return getBeatoShapes(chart, family).flatMap((book) =>
    placeBeatoShape(book, targetRootPc, maxFret),
  );
}

/**
 * The chart type the book prints for a chord quality. Returns null for
 * qualities the book has no four-note chart for — plain triads, ninths,
 * elevenths, thirteenths, and altered dominants outside the eighteen printed
 * pages. Better an honest gap than a shape that is not in the book.
 */
export function chartForQuality(
  quality: string,
  tensions: string[] = [],
): BeatoChart | null {
  const tension = new Set(
    tensions.map((entry) => entry.toLowerCase().replace(/^add/, "")),
  );

  /** Alterations the book actually prints over a seventh chord. */
  const PRINTED = new Set(["b5", "#5", "#11"]);
  const unsupported = [...tension].filter((entry) => !PRINTED.has(entry));

  switch (quality) {
    case "6":
      return tension.size === 0 ? "Maj6" : null;
    case "m6":
      return tension.size === 0 ? "Min6" : null;
    case "maj7":
      if (unsupported.length) return null;
      if (tension.has("#11")) return "Lydianmaj7";
      if (tension.has("b5")) return "Maj7b5";
      if (tension.has("#5")) return "Augmaj7";
      return "Maj7";
    case "maj7#11":
      return "Lydianmaj7";
    case "maj7b5":
      return "Maj7b5";
    case "maj7#5":
      return "Augmaj7";
    case "7":
      if (unsupported.length) return null;
      if (tension.has("#11")) return "LydianDom7";
      if (tension.has("b5")) return "Dom7b5";
      if (tension.has("#5")) return "Aug7";
      return "Dom7";
    case "7#11":
      return "LydianDom7";
    case "7b5":
      return "Dom7b5";
    case "7#5":
      return "Aug7";
    case "m7":
      return tension.size === 0 ? "Min7" : null;
    case "mMaj7":
      return tension.size === 0 ? "Minmaj7" : null;
    case "halfDim":
    case "m7b5":
      return tension.size === 0 ? "Min7b5" : null;
    case "dim7":
      return tension.size === 0 ? "Dim7" : null;
    case "dimMaj7":
      return tension.size === 0 ? "Dimmaj7" : null;
    case "dimMaj7b13":
      return "Dimmaj7b13";
    case "augMaj7":
      return "Augmaj7";
    case "aug7":
      return "Aug7";
    case "maj7sus4":
      return "Maj7sus4";
    case "7sus4":
    case "dom7sus4":
      return "Dom7sus4";
    default:
      return null;
  }
}

/**
 * The book's own inversion name for a shape, taken from its bass interval.
 * `Root`, `3`, `5`, `6`, `7`, `♯4` …
 */
export function bassLabel(shape: BeatoShape): string {
  const labels: Record<number, string> = {
    0: "Root",
    1: "♭2",
    2: "2",
    3: "♭3",
    4: "3",
    5: "4",
    6: "♯4",
    7: "5",
    8: "♭6",
    9: "6",
    10: "♭7",
    11: "7",
  };
  return labels[shape.bass] ?? "—";
}
