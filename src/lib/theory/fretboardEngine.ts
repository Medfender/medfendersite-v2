/* ═══════════════════════════════════════════════════════════════════════
   FRETBOARD ENGINE — a progression, laid out for a hand

   Three questions, answered in order:

   1. WHAT IS THIS CHORD DOING?  Roman numeral, degree and harmonic
      function, read against an inferred (or supplied) key. Spelling comes
      from the key, so C minor writes ♭VII where C major writes vii°.

   2. WHAT SHAPE PLAYS IT?      Every candidate from `fretboard.ts`, then
      the one that costs the hand least to reach from the shape before it.

   3. HOW DOES IT MOVE?         A per-string ledger: which voices held,
      which moved and by how many semitones. This is the thing the UI
      draws, and the thing a player actually feels.

   Music theory lives in `chords.ts` / `scales.ts`. Geometry lives in
   `fretboard.ts`. This module only decides *order* and *cost*.
   ═══════════════════════════════════════════════════════════════════════ */

import { parseChord } from "./chords";
import type { ChordInfo, HarmonicFunction, ScaleRecommendation } from "./chords";
import { getScaleRecommendations } from "./scaleRecommendations";
import { noteToPitchClass, pitchClassToNote } from "./notes";
import { SCALE_FORMULAS, keyPrefersFlats, keyPrefersFlatsInMode } from "./scales";
import { DEFAULT_MAX_FRET, chordRootPc, solveVoicingCandidates } from "./fretboard";
import type { Voicing } from "./fretboard";

export type KeyMode = "major" | "minor";

export interface ProgressionOptions {
  /** Tonic, e.g. "C" or "Bb". Omit to infer. */
  key?: string;
  /** Defaults to the mode inferred from the key, or from the chords. */
  mode?: KeyMode;
  maxFret?: number;
  /** Cap the number of stored candidates per chord (default 24). */
  maxCandidates?: number;
}

export interface VoiceMove {
  /** String index, low E = 0 → high E = 5. */
  string: number;
  fromFret: number | null;
  toFret: number | null;
  fromNote: string | null;
  toNote: string | null;
  /** Signed semitone movement; 0 when the voice is held. */
  semitones: number;
  held: boolean;
}

export interface VoiceLeading {
  moves: VoiceMove[];
  /** Pitch classes present in both shapes. */
  commonTones: number[];
  /** Voices sounding in both shapes. */
  sharedVoices: number;
  totalMovement: number;
  /** Signed movement of the lowest voice — the bass line. */
  bassMovement: number;
  /** 0–1, where 1 is a perfectly still transition. */
  score: number;
  summary: string;
}

export interface ProgressionStep {
  index: number;
  symbol: string;
  chord: ChordInfo;
  /** e.g. "ii7", "V7", "Imaj7", "♭VII". */
  roman: string;
  /** Roman numeral without quality suffix, e.g. "ii". */
  degree: string;
  fn: HarmonicFunction["function"];
  scale: ScaleRecommendation | null;
  voicing: Voicing | null;
  candidates: Voicing[];
  /** Movement from the previous step; null for the first chord. */
  move: VoiceLeading | null;
}

export interface Progression {
  key: string;
  mode: KeyMode;
  steps: ProgressionStep[];
  /** Sum of every voice movement across the progression. */
  totalMovement: number;
  /** Mean semitone movement per transition. */
  averageMovement: number;
  /** 0–1, mean of the per-transition voice-leading scores. */
  smoothness: number;
  /** Written pitch classes of the key, for the scale rail. */
  keyNotes: string[];
}

/* ─────────────────────────────── Roman numerals ─────────────────────── */

const MAJOR_DEGREES = SCALE_FORMULAS.ionian;
const MINOR_DEGREES = SCALE_FORMULAS.aeolian;

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII"] as const;

interface DegreeReading {
  degree: number;
  accidental: "♭♭" | "♭" | "" | "♯" | "♯♯";
}

const LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const;

/**
 * Read a chord root as a scale degree of the key, using the *letter names*.
 *
 * This is the difference between ♯III and ♭IV for the same sounding note.
 * In C minor, E7 is a raised third (♯III), because its letter is E — a
 * third above C — not a flattened F. Pitch-class arithmetic alone cannot
 * tell those apart, so the spelling decides.
 *
 * Returns null when either name is unreadable, letting the caller fall
 * back to the pitch-class reading below.
 */
export function spelledDegree(
  chordRoot: string,
  key: string,
  mode: KeyMode,
): DegreeReading | null {
  const keyLetter = key[0]?.toUpperCase();
  const chordLetter = chordRoot[0]?.toUpperCase();
  const keyIndex = LETTERS.indexOf(keyLetter as (typeof LETTERS)[number]);
  const chordIndex = LETTERS.indexOf(chordLetter as (typeof LETTERS)[number]);
  if (keyIndex < 0 || chordIndex < 0) return null;

  const degree = ((chordIndex - keyIndex + 7) % 7) + 1;
  const formula = mode === "minor" ? MINOR_DEGREES : MAJOR_DEGREES;
  const expectedPc = (noteToPitchClass(key) + formula[degree - 1]) % 12;
  const actualPc = noteToPitchClass(chordRoot);
  const diff = ((actualPc - expectedPc + 18) % 12) - 6;

  switch (diff) {
    case 0:
      return { degree, accidental: "" };
    case -1:
      return { degree, accidental: "♭" };
    case 1:
      return { degree, accidental: "♯" };
    case -2:
      return { degree, accidental: "♭♭" };
    case 2:
      return { degree, accidental: "♯♯" };
    default:
      return null;
  }
}

/**
 * Read a pitch class as a scale degree of the key, without a spelling.
 *
 * Used when no chord name is available (or its letter is unreadable).
 * Degrees are counted from the key's own scale, so a natural-minor key
 * writes its seventh as VII and a major key writes the same pitch as ♭VII.
 */
export function degreeOf(pc: number, keyRootPc: number, mode: KeyMode): DegreeReading {
  const formula = mode === "minor" ? MINOR_DEGREES : MAJOR_DEGREES;
  const rel = ((pc - keyRootPc) % 12 + 12) % 12;

  const exact = formula.indexOf(rel);
  if (exact !== -1) return { degree: exact + 1, accidental: "" };

  // A semitone below a scale degree flattens it; a semitone above sharps it.
  // ♭I is not a degree, so a flattened tonic falls through to the sharp
  // reading (the leading tone of a minor key is ♯VII, not ♭I).
  const below = formula.findIndex((interval) => (interval - 1 + 12) % 12 === rel);
  if (below !== -1 && below > 0) return { degree: below + 1, accidental: "♭" };

  const above = formula.findIndex((interval) => (interval + 1) % 12 === rel);
  if (above !== -1) return { degree: above + 1, accidental: "♯" };

  return { degree: 1, accidental: "" };
}

const QUALITY_SUFFIX: Record<string, string> = {
  maj: "",
  maj7: "maj7",
  maj9: "maj9",
  "6": "6",
  m: "",
  m7: "7",
  m6: "6",
  m9: "9",
  "7": "7",
  "9": "9",
  "11": "11",
  "13": "13",
  dim: "°",
  dim7: "°7",
  halfDim: "ø7",
  aug: "+",
  sus2: "sus2",
  sus4: "sus4",
  "5": "5",
};

/** Uppercase unless the chord's third is minor, or it is diminished. */
function numeralCase(chord: ChordInfo): "upper" | "lower" {
  if (chord.quality === "dim" || chord.quality === "dim7" || chord.quality === "halfDim") {
    return "lower";
  }
  return chord.intervals.includes(3) && !chord.intervals.includes(4) ? "lower" : "upper";
}

/** e.g. `{ degree: "ii", roman: "ii7" }` for Dm7 in C. */
export function romanNumeral(
  chord: ChordInfo,
  key: string,
  mode: KeyMode,
): { degree: string; roman: string } {
  if (!chord.isValid) return { degree: "?", roman: "?" };

  const keyRootPc = noteToPitchClass(key);
  const reading = spelledDegree(chord.root, key, mode) ?? degreeOf(chordRootPc(chord), keyRootPc, mode);
  const base = ROMAN[reading.degree - 1] ?? "I";
  const cased = numeralCase(chord) === "lower" ? base.toLowerCase() : base;
  const degree = `${reading.accidental}${cased}`;
  return { degree, roman: `${degree}${QUALITY_SUFFIX[chord.quality] ?? ""}` };
}

/**
 * Tonic / subdominant / dominant. Borrowed chords are placed by what they
 * tend to do: ♭VII pulls home like a dominant, ♭VI leans subdominant.
 */
export function harmonicFunctionOf(reading: DegreeReading): HarmonicFunction["function"] {
  if (reading.accidental.startsWith("♯")) return reading.degree === 3 ? "tonic" : "other";
  if (reading.accidental.startsWith("♭")) {
    switch (reading.degree) {
      case 2:
        return "subdominant";
      case 3:
      case 6:
        return "subdominant";
      case 7:
        return "dominant";
      default:
        return "other";
    }
  }
  switch (reading.degree) {
    case 1:
    case 3:
    case 6:
      return "tonic";
    case 2:
    case 4:
      return "subdominant";
    case 5:
    case 7:
      return "dominant";
    default:
      return "other";
  }
}

/* ─────────────────────────────── Key inference ──────────────────────── */

function modeForQuality(quality: string): KeyMode {
  if (quality === "m" || quality === "m7" || quality === "m6" || quality === "m9") return "minor";
  return "major";
}

/**
 * Guess the tonic from the chords themselves.
 *
 * Scoring is weighted towards what a listener actually hears:
 *
 *   +3 × tone coverage   chord tones inside the candidate key (0–1 each)
 *   +2                   chord root is diatonic
 *   +5 / +3              a dominant resolving down a fifth into the next chord
 *   +4                   the progression opens on the tonic
 *   +4                   the progression closes on the tonic
 *   +3 / −1              the candidate's mode agrees with the first chord
 *   +2                   the key's own dominant seventh is present
 *
 * Opening and closing on the tonic is what keeps a D minor blues in D:
 * every chord of it is nearer G major's surface, but a vamp that starts and
 * ends on Dm7 is heard in D. Ties fall to the final chord.
 */
export function inferKey(symbols: string[]): { key: string; mode: KeyMode } {
  const chords = symbols.map(parseChord).filter((chord) => chord.isValid);
  if (chords.length === 0) return { key: "C", mode: "major" };

  const first = chords[0];
  const last = chords[chords.length - 1];
  const candidates = Array.from(new Set(chords.map((chord) => chord.root)));

  let best = { key: last.root, mode: modeForQuality(last.quality), score: -Infinity };

  for (const candidate of candidates) {
    const own = chords.find((chord) => chord.root === candidate);
    const mode = modeForQuality(own?.quality ?? "maj");
    const keyRootPc = noteToPitchClass(candidate);
    const formula = mode === "minor" ? MINOR_DEGREES : MAJOR_DEGREES;
    const keyPcs = formula.map((interval) => (keyRootPc + interval) % 12);

    let score = 0;

    chords.forEach((chord, index) => {
      const rootPc = chordRootPc(chord);
      const tones = chord.intervals.map((interval) => (rootPc + interval) % 12);
      const coverage = tones.filter((pc) => keyPcs.includes(pc)).length / Math.max(1, tones.length);
      score += coverage * 3;
      if (keyPcs.includes(rootPc)) score += 2;

      // A dominant-quality chord resolving up a fourth into the tonic.
      const next = chords[index + 1];
      const isDominant = chord.quality === "7" || chord.quality === "maj" || chord.quality === "dim";
      if (
        next &&
        isDominant &&
        chordRootPc(next) === keyRootPc &&
        (chordRootPc(next) - rootPc + 12) % 12 === 5
      ) {
        score += 5;
      }
    });

    // A vamp that keeps returning to a chord is heard in that chord's key.
    const returns = chords.filter((chord) => chord.root === candidate).length - 1;
    score += Math.min(6, returns * 1.5);

    if (chordRootPc(first) === keyRootPc) score += 4;
    if (chordRootPc(last) === keyRootPc) score += 4;

    const firstIsMinor = modeForQuality(first.quality) === "minor";
    score += (mode === "minor") === firstIsMinor ? 3 : -1;

    const dominantPc = (keyRootPc + 7) % 12;
    if (
      chords.some(
        (chord) =>
          chordRootPc(chord) === dominantPc && (chord.quality === "7" || chord.quality === "maj"),
      )
    ) {
      score += 2;
    }

    if (score > best.score) best = { key: candidate, mode, score };
  }

  return { key: best.key, mode: best.mode };
}

/* ─────────────────────────────── Voice leading ──────────────────────── */

function positionMap(voicing: Voicing): Map<number, { fret: number; midi: number; name: string; pc: number }> {
  const map = new Map<number, { fret: number; midi: number; name: string; pc: number }>();
  for (const position of voicing.positions) {
    map.set(position.string, {
      fret: position.fret,
      midi: position.midi,
      name: position.name,
      pc: position.pc,
    });
  }
  return map;
}

/** The per-string ledger between two shapes. */
export function voiceLeading(from: Voicing, to: Voicing): VoiceLeading {
  const before = positionMap(from);
  const after = positionMap(to);
  const moves: VoiceMove[] = [];

  let totalMovement = 0;
  let sharedVoices = 0;

  for (let string = 0; string < 6; string++) {
    const a = before.get(string);
    const b = after.get(string);
    const semitones = a && b ? b.midi - a.midi : 0;

    if (a && b) {
      sharedVoices += 1;
      totalMovement += Math.abs(semitones);
    }

    moves.push({
      string,
      fromFret: a ? a.fret : null,
      toFret: b ? b.fret : null,
      fromNote: a ? a.name : null,
      toNote: b ? b.name : null,
      semitones,
      held: Boolean(a && b && semitones === 0),
    });
  }

  const fromPcs = new Set(from.positions.map((position) => position.pc));
  const commonTones = Array.from(
    new Set(to.positions.map((position) => position.pc).filter((pc) => fromPcs.has(pc))),
  );

  const bassMovement = (to.positions[0]?.midi ?? 0) - (from.positions[0]?.midi ?? 0);
  const movementScore = 1 - Math.min(1, totalMovement / 18);
  const commonScore = commonTones.length / Math.max(1, Math.min(fromPcs.size, 4));
  const score = Math.max(0, Math.min(1, movementScore * 0.65 + Math.min(1, commonScore) * 0.35));

  const moving = moves.filter((move) => move.fromFret !== null && move.toFret !== null && !move.held);
  const held = moves.filter((move) => move.held).length;
  const summary = [
    `${held} voice${held === 1 ? "" : "s"} held`,
    moving.length ? `${moving.length} move ${totalMovement} semitone${totalMovement === 1 ? "" : "s"}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    moves,
    commonTones,
    sharedVoices,
    totalMovement,
    bassMovement,
    score,
    summary,
  };
}

/**
 * Cost of arriving at `candidate` from `previous`.
 *
 * Movement dominates, but a bass line that leaps more than a sixth is
 * penalised on top of it, because the ear follows the bass even when the
 * fingers do not have to.
 */
export function transitionCost(previous: Voicing, candidate: Voicing): number {
  const ledger = voiceLeading(previous, candidate);
  const bassLeap = Math.abs(ledger.bassMovement);
  const registerShift = Math.abs(candidate.minFret - previous.minFret);
  return ledger.totalMovement + Math.max(0, bassLeap - 7) * 1.5 + Math.max(0, registerShift - 2) * 2;
}

/* ─────────────────────────────── Progression ────────────────────────── */

export function analyseProgression(
  symbols: string[],
  options: ProgressionOptions = {},
): Progression {
  const cleaned = symbols.map((symbol) => symbol.trim()).filter(Boolean);
  const inferred = inferKey(cleaned);
  const key = options.key ?? inferred.key;
  const sameTonic = options.key
    ? noteToPitchClass(options.key) === noteToPitchClass(inferred.key)
    : false;
  const mode =
    options.mode ??
    (options.key
      ? sameTonic
        ? inferred.mode
        : modeForQuality(parseChord(options.key).quality)
      : inferred.mode);
  const maxFret = options.maxFret ?? DEFAULT_MAX_FRET;
  const maxCandidates = options.maxCandidates ?? 24;

  const steps: ProgressionStep[] = [];
  let previous: Voicing | null = null;
  let movementTotal = 0;
  let scoreTotal = 0;
  let transitions = 0;

  cleaned.forEach((symbol, index) => {
    const chord = parseChord(symbol);
    const { degree, roman } = romanNumeral(chord, key, mode);
    const keyRootPc = noteToPitchClass(key);
    const reading =
      (chord.isValid ? spelledDegree(chord.root, key, mode) : null) ??
      degreeOf(chordRootPc(chord), keyRootPc, mode);
    const fn = harmonicFunctionOf(reading);

    const useFlats = keyPrefersFlats(key);
    const allCandidates = chord.isValid
      ? solveVoicingCandidates(chord, { maxFret, preferFlats: useFlats }).slice(0, maxCandidates)
      : [];

    let chosen: Voicing | null = allCandidates[0] ?? null;
    if (previous && allCandidates.length > 1) {
      let bestCost = Infinity;
      for (const candidate of allCandidates) {
        const cost = transitionCost(previous, candidate);
        if (cost < bestCost) {
          bestCost = cost;
          chosen = candidate;
        }
      }
    }

    const move = previous && chosen ? voiceLeading(previous, chosen) : null;
    if (move) {
      movementTotal += move.totalMovement;
      scoreTotal += move.score;
      transitions += 1;
    }

    const recommendations = chord.isValid ? getScaleRecommendations(chord) : [];

    steps.push({
      index,
      symbol,
      chord,
      roman,
      degree,
      fn,
      scale: recommendations[0] ?? null,
      voicing: chosen,
      candidates: allCandidates,
      move,
    });

    if (chosen) previous = chosen;
  });

  const flats = keyPrefersFlatsInMode(key, mode);
  const formula = mode === "minor" ? MINOR_DEGREES : MAJOR_DEGREES;
  const keyNotes = formula.map((interval) =>
    pitchClassToNote((noteToPitchClass(key) + interval) % 12, flats),
  );

  return {
    key,
    mode,
    steps,
    totalMovement: movementTotal,
    averageMovement: transitions ? movementTotal / transitions : 0,
    smoothness: transitions ? scoreTotal / transitions : 0,
    keyNotes,
  };
}
