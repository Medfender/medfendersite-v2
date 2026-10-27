export interface ChordInfo {
  originalSymbol: string;
  normalizedSymbol: string;
  root: string;
  quality: string;
  intervals: number[];
  notes: string[];
  tensions?: string[];
  bass?: string;
  isValid: boolean;
  error?: string;
}

export interface ProgressionAnalysis {
  key: string;
  romanNumerals: string[];
  harmonicFunctions: HarmonicFunction[];
  chordInfos: ChordInfo[];
}

export interface HarmonicFunction {
  degree: string; // I, ii, V, etc.
  function: 'tonic' | 'subdominant' | 'dominant' | 'other';
  chord: string; // chord symbol
  confidence: number; // 0-1
}

export interface VoicingOptions {
  maxFretSpan?: number; // maximum fret span (default 4)
  position?: number; // preferred position (0-11, null for any)
  preferOpenStrings?: boolean; // prefer open strings when possible
  avoidMuting?: boolean; // avoid muting strings if possible
  includeInversions?: boolean; // include inverted voicings
  maxVoicings?: number; // maximum number of voicings to return (default 4)
}

export interface Voicing {
  strings: number[]; // fret numbers per string (0-24, -1 for muted, -2 for not played)
  frets: number[]; // same as strings for clarity
  notes: string[]; // note names per string
  pitchClasses: number[]; // pitch classes per string
  rootPosition: boolean; // whether root is in bass
  inversion: number; // 0=root, 1=first inv, 2=second inv, etc. (based on bass note)
  playabilityScore: number; // 0-1 score based on stretch, muting, etc.
  fingering?: number[][]; // [string, fret, finger] or 0 for mute, null for not played
}

export interface ScaleRecommendation {
  scale: string; // scale name (ionian, dorian, etc.)
  /** Human-facing name, e.g. "Dorian". */
  displayName?: string;
  compatibilityScore: number; // 0-1 how well scale fits chord
  characteristicTones: number[]; // scale intervals that are chord tones
  avoidTones: number[]; // intervals a semitone above a chord tone
  /** The scale spelled from the chord root. */
  scaleNotes?: string[];
  reason: string; // explanation for recommendation
}

export interface VoiceLeadingOption {
  fromVoicing: Voicing;
  toVoicing: Voicing;
  voiceLeadingScore: number; // 0-1 based on smoothness
  commonTones: number[]; // number of common tones
  totalMovement: number; // total semitone movement of all voices
  noteMovement: string[]; // descriptive array like ["F→F", "A→G", "C→B"]
}

import { NOTE_NAMES, FLAT_NOTE_NAMES, noteToPitchClass } from './notes';

/**
 * Semitone offsets from the root for every quality the site names.
 *
 * The names match `chartForQuality` in `beatoVoicings.ts`, so a parsed chord
 * maps onto a printed book chart without a second translation table.
 */
const CHORD_INTERVALS: Record<string, number[]> = {
  maj: [0, 4, 7],
  m: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  "5": [0, 7],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  "6": [0, 4, 7, 9],
  m6: [0, 3, 7, 9],
  maj7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  "7": [0, 4, 7, 10],
  dim7: [0, 3, 6, 9],
  halfDim: [0, 3, 6, 10],
  m7b5: [0, 3, 6, 10],
  mMaj7: [0, 3, 7, 11],
  dimMaj7: [0, 3, 6, 11],
  dimMaj7b13: [0, 3, 8, 11],
  augMaj7: [0, 4, 8, 11],
  aug7: [0, 4, 8, 10],
  maj7b5: [0, 4, 6, 11],
  "7b5": [0, 4, 6, 10],
  "maj7#5": [0, 4, 8, 11],
  "7#5": [0, 4, 8, 10],
  maj7sus4: [0, 5, 7, 11],
  "7sus4": [0, 5, 7, 10],
  "9": [0, 4, 7, 10, 14],
  maj9: [0, 4, 7, 11, 14],
  m9: [0, 3, 7, 10, 14],
  "11": [0, 4, 7, 10, 14, 17],
  "13": [0, 4, 7, 10, 14, 17, 21],
};

/** Natural semitone of a chord degree, before any accidental. */
const DEGREE_SEMITONES: Record<number, number> = {
  1: 0,
  2: 2,
  3: 4,
  4: 5,
  5: 7,
  6: 9,
  7: 11,
  9: 14,
  11: 17,
  13: 21,
};

const ACCIDENTAL = { b: -1, "#": 1, "": 0 } as const;

/**
 * Apply one written alteration (`b5`, `#9`, `b13` …) to an interval set.
 *
 * The fifth and seventh are *replaced* in place, because that is how the book
 * writes them (`R 3 b5 b7`). Extensions above the octave are appended.
 */
function alterIntervals(intervals: number[], degree: number, accidental: keyof typeof ACCIDENTAL): number[] {
  const natural = DEGREE_SEMITONES[degree];
  if (natural === undefined) return intervals;
  const value = natural + ACCIDENTAL[accidental];

  if (degree === 5 || degree === 7 || degree === 3) {
    const naturalPitch = natural % 12;
    const next = intervals.filter((interval) => ((interval % 12) + 12) % 12 !== naturalPitch);
    next.push(value);
    return next;
  }

  if (degree === 6) return [...intervals, value];
  if (degree >= 9) return intervals.includes(value) ? intervals : [...intervals, value];
  return [...intervals, value];
}

export function parseChord(symbol: string): ChordInfo {
  const orig = symbol.trim();
  if (!orig) return { originalSymbol: orig, normalizedSymbol: '', root: '', quality: '', intervals: [], notes: [], isValid: false, error: 'empty symbol' };
  const [base, bass] = orig.split('/');
  const rootMatch = base.match(/^([A-Ga-g])([#b]?)/);
  if (!rootMatch) return { originalSymbol: orig, normalizedSymbol: '', root: '', quality: '', intervals: [], notes: [], isValid: false, error: 'invalid root' };
  const root = rootMatch[1].toUpperCase() + (rootMatch[2] || '');
  let remainder = base.slice(rootMatch[0].length);
  // Symbols the interval table names differently.
  const QUALITY_ALIASES: Array<[string, string]> = [
    ['m7b5', 'halfDim'],
    ['ø7', 'halfDim'],
    ['ø', 'halfDim'],
  ];
  let aliased: string | null = null;
  for (const [symbol, qualityName] of QUALITY_ALIASES) {
    if (remainder.startsWith(symbol)) {
      aliased = qualityName;
      remainder = remainder.slice(symbol.length);
      break;
    }
  }
  // Sort keys by length descending to match longer qualities first (e.g., 'mMaj7' before 'm')
  const sortedKeys = Object.keys(CHORD_INTERVALS).sort((a, b) => b.length - a.length);
  let quality = 'maj';
  if (aliased) {
    quality = aliased;
  } else {
    for (const q of sortedKeys) { if (remainder.startsWith(q)) { quality = q; remainder = remainder.slice(q.length); break; } }
  }

  let intervals = CHORD_INTERVALS[quality] ? [...CHORD_INTERVALS[quality]] : [0, 4, 7];

  // Everything left is a written alteration or extension: b5, #5, b9, #11, b13…
  const alterationMatches = Array.from(
    remainder.matchAll(/([b#]?)(\d{1,2})/g),
  ).filter((match) => match[2] !== undefined);
  const tensions: string[] = [];
  for (const match of alterationMatches) {
    const accidental = (match[1] || '') as keyof typeof ACCIDENTAL;
    const degree = Number(match[2]);
    if (!(accidental in ACCIDENTAL) || DEGREE_SEMITONES[degree] === undefined) continue;
    intervals = alterIntervals(intervals, degree, accidental);
    tensions.push(`${match[1]}${match[2]}`);
  }
  // Convert interval list to absolute pitch classes relative to the root
  const rootPc = noteToPitchClass(root);
  const absolutePcs = intervals.map(i => (rootPc + i) % 12);
  // Convert pitch classes to note names using the same accidental style as the root
  const useFlats = root.includes('b') || root.includes('q');
  const getNoteName = (pc: number) => {
    // Find the name with the same pitch class preferring flats if requested
    const sharpName = NOTE_NAMES[pc];
    const flatName = FLAT_NOTE_NAMES[pc];
    // Use flats if root has flat/q, or if root is natural (no accidentals) and pc is 1 or 10 (minor second or minor seventh above root)
    const useFlatsForThisNote = useFlats || (!root.includes('#') && !root.includes('b') && (pc === 1 || pc === 10));
    return useFlatsForThisNote ? flatName : sharpName;
  };
  let notes = absolutePcs.map(getNoteName);
  // Remove duplicates while preserving order of first appearance
  const seen = new Set<string>();
  const uniqueNotes = [];
  for (const note of notes) {
    if (!seen.has(note)) {
      seen.add(note);
      uniqueNotes.push(note);
    }
  }
  notes = uniqueNotes;
  return {
    originalSymbol: orig,
    normalizedSymbol: root + quality,
    root,
    quality,
    intervals: intervals.sort((a,b)=>a-b),
    notes: uniqueNotes,
    tensions: tensions,
    bass: bass ? bass.trim() : undefined,
    isValid: true
  };
}
