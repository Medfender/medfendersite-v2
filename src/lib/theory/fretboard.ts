/* ═══════════════════════════════════════════════════════════════════════
   FRETBOARD — physical geometry and the book's voicings

   Two separate concerns live here, in this order:

   1. GEOMETRY. A real neck is not a grid of equal boxes. Each fret sits
      at 1 − 2^(−n/12) of the scale length, so fret 12 is exactly halfway
      and the spaces narrow as you climb. Every position the UI draws comes
      from this function; nothing is eyeballed.

   2. VOICINGS. Every shape is a printed diagram from Beato Book 4.0,
      Chapter 2 ("Chord Forms", pp. 112–184), moved along the neck so its
      root matches the requested chord. There is no algorithmic fallback:
      a quality the book does not chart returns no shape.

   Musical meaning is never decided here. Chord tones, scales and degrees
   come from `chords.ts` / `scales.ts`; this module only maps the book's
   shapes onto physical positions.
   ═══════════════════════════════════════════════════════════════════════ */

import { noteToPitchClass, pitchClassToNote } from "./notes";
import type { ChordInfo } from "./chords";
import {
  BEATO_CHARTS,
  chartForQuality,
  placeBeatoChart,
  stringSetLabel,
  type BeatoChart,
  type BeatoFamily,
  type BeatoPlacement,
  type BeatoShape,
} from "./beatoVoicings";

/** Standard tuning, low E → high E, in MIDI note numbers. */
export const STANDARD_TUNING = [40, 45, 50, 55, 59, 64] as const;

/** String names, lowest string first. */
export const STRING_NAMES = ["E", "A", "D", "G", "B", "E"] as const;

/** Octave of each open string, for unambiguous labels. */
export const STRING_OCTAVES = [2, 2, 3, 3, 3, 4] as const;

/** The book's diagrams are printed inside the first five frets; sixteen
 *  frets is enough to place every printed shape in every key without
 *  reaching an open string. */
export const DEFAULT_MAX_FRET = 16;

/** Standard inlay positions; 12 sounds two octaves of the open string. */
export const INLAY_FRETS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24] as const;
export const DOUBLE_INLAY_FRETS = [12, 24] as const;

/** Distance of fret wire `n` from the nut, as a fraction of scale length. */
export function fretRatio(n: number): number {
  return 1 - Math.pow(2, -n / 12);
}

/** Position of fret wire `n` across a neck of `lastFret` frets. 0–1. */
export function fretPosition(n: number, lastFret: number): number {
  if (lastFret <= 0) return 0;
  return fretRatio(n) / fretRatio(lastFret);
}

/**
 * Centre of the space between two fret wires — where a finger actually
 * lands. Fret 0 is the open string, drawn at the nut.
 */
export function fretCentre(fret: number, lastFret: number): number {
  if (fret <= 0) return 0;
  return (fretPosition(fret - 1, lastFret) + fretPosition(fret, lastFret)) / 2;
}

export function isInlayFret(fret: number): boolean {
  return (INLAY_FRETS as readonly number[]).includes(fret);
}

export function isDoubleInlayFret(fret: number): boolean {
  return (DOUBLE_INLAY_FRETS as readonly number[]).includes(fret);
}

export type ChordRole = "root" | "third" | "fifth" | "seventh" | "color";

const INTERVAL_LABELS = [
  "R",
  "♭2",
  "2",
  "♭3",
  "3",
  "4",
  "♭5",
  "5",
  "♭6",
  "6",
  "♭7",
  "7",
] as const;

/** Root-relative interval label: 0 → "R", 3 → "♭3", 10 → "♭7". */
export function intervalLabel(semitones: number): string {
  return INTERVAL_LABELS[((semitones % 12) + 12) % 12];
}

export function pitchClassOf(stringIndex: number, fret: number): number {
  return (STANDARD_TUNING[stringIndex] + fret) % 12;
}

export function midiOf(stringIndex: number, fret: number): number {
  return STANDARD_TUNING[stringIndex] + fret;
}

export function noteNameOf(stringIndex: number, fret: number, preferFlats = false): string {
  return pitchClassToNote(pitchClassOf(stringIndex, fret), preferFlats);
}

/** The role a pitch class plays in a chord. */
export function chordRole(chord: ChordInfo, pc: number): ChordRole {
  const rootPc = chordRootPc(chord);
  return roleOf(rootPc, pc, chord.intervals.map((i) => i % 12));
}

export interface FretPosition {
  string: number;
  fret: number;
  midi: number;
  pc: number;
  name: string;
  /** Semitones above the chord root. */
  interval: number;
  label: string;
  role: ChordRole;
  /** True for the lowest sounding note. */
  isBass: boolean;
}

/** Provenance for a shape: which printed diagram it came from. */
export interface BookSource {
  family: BeatoFamily;
  chart: BeatoChart;
  /** Column the book prints the shape under. */
  column: string;
  /** Printed page in the book. */
  page: number;
  /** Semitones the printed shape was moved. */
  shift: number;
  /** Root pitch class of the printed diagram. */
  printedRootPc: number;
  /** Printed string set, e.g. "6-5-4-3". */
  stringSet: string;
}

export interface Voicing {
  positions: FretPosition[];
  /** Fret per string, low E → high E. -1 = muted. */
  shape: number[];
  minFret: number;
  maxFret: number;
  span: number;
  sounding: number;
  bassPc: number;
  /** Index of the bass interval in the chart's printed formula. */
  inversion: number;
  playability: number;
  /** The book diagram this shape came from. */
  book: BookSource;
}

export interface VoicingOptions {
  maxFret?: number;
  /** Force a bass pitch class (used for inversions / slash chords). */
  bassPc?: number;
  /** Spell note names with flats — pass the key's preference. */
  preferFlats?: boolean;
  /** Restrict to one drop family. */
  family?: BeatoFamily;
  /** Keep every octave of a printed shape (default: lowest only). */
  octaves?: boolean;
}

/**
 * Root pitch class of a chord.
 *
 * `chord.intervals` are semitone *offsets* from the root, so the root can
 * only come from the spelled name. Reading `intervals[0]` would return 0
 * for every chord in the catalogue.
 */
export function chordRootPc(chord: ChordInfo): number {
  if (!chord.isValid || !chord.root) return 0;
  try {
    return noteToPitchClass(chord.root);
  } catch {
    return 0;
  }
}

function roleOf(rootPc: number, pc: number, chordIntervals: number[]): ChordRole {
  const d = ((pc - rootPc) % 12 + 12) % 12;
  if (d === 0) return "root";
  if ((d === 3 || d === 4) && chordIntervals.includes(d)) return "third";
  if (d === 7) return "fifth";
  if ((d === 10 || d === 11) && chordIntervals.includes(d)) return "seventh";
  return "color";
}

/** Inversion number of a voicing, based on which chord tone is in the bass. */
export function inversionOf(chord: ChordInfo, bassPc: number): number {
  const rootPc = chordRootPc(chord);
  const bassInterval = (((bassPc - rootPc) % 12) + 12) % 12;
  const chordIntervals = Array.from(new Set(chord.intervals.map((i) => i % 12))).sort(
    (a, b) => a - b,
  );
  const idx = chordIntervals.indexOf(bassInterval);
  return idx > 0 ? idx : 0;
}

function buildVoicing(
  placement: BeatoPlacement,
  rootPc: number,
  roleIntervals: number[],
  preferFlats: boolean,
): Voicing {
  const { book, shape, shift } = placement;
  const positions: FretPosition[] = [];

  shape.forEach((fret, stringIndex) => {
    if (fret < 0) return;
    const pc = pitchClassOf(stringIndex, fret);
    const interval = (((pc - rootPc) % 12) + 12) % 12;
    positions.push({
      string: stringIndex,
      fret,
      midi: midiOf(stringIndex, fret),
      pc,
      name: pitchClassToNote(pc, preferFlats),
      interval,
      label: intervalLabel(interval),
      role: roleOf(rootPc, pc, roleIntervals),
      isBass: false,
    });
  });

  let lowest: FretPosition | null = null;
  for (const position of positions) {
    if (!lowest || position.midi < lowest.midi) lowest = position;
  }
  if (lowest) lowest.isBass = true;

  const frets = positions.map((position) => position.fret);
  const minFret = frets.length ? Math.min(...frets) : 0;
  const maxFret = frets.length ? Math.max(...frets) : 0;
  const bassPc = lowest ? lowest.pc : rootPc;
  const bassInterval = (((bassPc - rootPc) % 12) + 12) % 12;
  const chartIntervals = BEATO_CHARTS[book.chart].intervals;

  return {
    positions,
    shape,
    minFret,
    maxFret,
    span: maxFret - minFret,
    sounding: positions.length,
    bassPc,
    inversion: Math.max(0, chartIntervals.indexOf(bassInterval)),
    playability: Math.max(0, Math.min(1, 1 - (maxFret - minFret) * 0.12)),
    book: {
      family: book.family,
      chart: book.chart,
      column: book.column,
      page: book.page,
      shift,
      printedRootPc: book.printedRootPc,
      stringSet: stringSetLabel(shape),
    },
  };
}

/**
 * Every printed shape for one chart, in the book's own order, transposed so
 * its root is `rootPc`. One card per printed diagram unless `octaves` is set.
 */
export function voicingsForChart(
  chart: BeatoChart,
  rootPc: number,
  options: VoicingOptions & { roleIntervals?: number[] } = {},
): Voicing[] {
  const maxFret = options.maxFret ?? DEFAULT_MAX_FRET;
  const preferFlats = options.preferFlats ?? false;
  const roleIntervals = options.roleIntervals ?? BEATO_CHARTS[chart].intervals;
  const placements = placeBeatoChart(chart, rootPc, options.family, maxFret);

  const seenBook = new Set<string>();
  const seenShape = new Set<string>();
  const voicings: Voicing[] = [];

  for (const placement of placements) {
    const bookKey = [
      placement.book.family,
      placement.book.page,
      placement.book.column,
      placement.book.shape.join(","),
    ].join("|");
    if (!options.octaves && seenBook.has(bookKey)) continue;
    seenBook.add(bookKey);

    const shapeKey = placement.shape.join(",");
    if (seenShape.has(shapeKey)) continue;
    seenShape.add(shapeKey);

    const voicing = buildVoicing(placement, rootPc, roleIntervals, preferFlats);
    if (options.bassPc !== undefined && voicing.bassPc !== options.bassPc) continue;
    voicings.push(voicing);
  }

  return voicings;
}

/**
 * The printed diagram itself, at its printed fret, with no transposition.
 * Used where the page shows the book's own example rather than a chord the
 * reader asked for.
 */
export function printedVoicing(book: BeatoShape, preferFlats = false): Voicing {
  return buildVoicing(
    { book, shape: [...book.shape], shift: 0 },
    book.printedRootPc,
    BEATO_CHARTS[book.chart].intervals,
    preferFlats,
  );
}

/**
 * Every playable candidate for a chord — sourced ONLY from the Beato Book.
 *
 * A quality the book does not chart returns an empty list. There is no
 * generated fallback, so the UI can say "no book shape" honestly instead of
 * showing something the book never printed.
 */
export function solveVoicingCandidates(
  chord: ChordInfo,
  options: VoicingOptions = {},
): Voicing[] {
  if (!chord.isValid || chord.intervals.length === 0) return [];

  const chart = chartForQuality(chord.quality, chord.tensions ?? []);
  if (!chart) return [];

  const rootPc = chordRootPc(chord);
  const preferFlats = options.preferFlats ?? chord.root.includes("b");
  const bassPc =
    options.bassPc ?? (chord.bass ? noteToPitchClass(chord.bass) : undefined);

  return voicingsForChart(chart, rootPc, {
    ...options,
    bassPc,
    preferFlats,
    roleIntervals: chord.intervals.map((interval) => interval % 12),
  }).sort((a, b) => a.minFret - b.minFret || a.maxFret - b.maxFret);
}

/** The lowest-positioned book shape for a chord. */
export function solveVoicing(chord: ChordInfo, options: VoicingOptions = {}): Voicing | null {
  return solveVoicingCandidates(chord, options)[0] ?? null;
}

/** All chord tones at every position up to `maxFret`, for the full-neck view. */
export function chordTonePositions(
  chord: ChordInfo,
  maxFret = DEFAULT_MAX_FRET,
  preferFlats = chord.root.includes("b"),
): FretPosition[] {
  if (!chord.isValid) return [];
  const rootPc = chordRootPc(chord);
  const chordIntervals = chord.intervals.map((i) => i % 12);
  const chordPcs = new Set(chordIntervals.map((i) => (rootPc + i) % 12));
  const out: FretPosition[] = [];

  for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
    for (let fret = 0; fret <= maxFret; fret++) {
      const pc = pitchClassOf(stringIndex, fret);
      if (!chordPcs.has(pc)) continue;
      const interval = ((pc - rootPc) % 12 + 12) % 12;
      out.push({
        string: stringIndex,
        fret,
        midi: midiOf(stringIndex, fret),
        pc,
        name: pitchClassToNote(pc, preferFlats),
        interval,
        label: intervalLabel(interval),
        role: roleOf(rootPc, pc, chordIntervals),
        isBass: false,
      });
    }
  }
  return out;
}

export const ROLE_NAMES: Record<ChordRole, string> = {
  root: "Root",
  third: "Third",
  fifth: "Fifth",
  seventh: "Seventh",
  color: "Colour",
};
