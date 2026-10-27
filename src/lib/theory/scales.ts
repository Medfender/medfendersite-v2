import { pitchClassToNote, noteToPitchClass } from "./notes";

// Scale formulas in semitones from root
export const SCALE_FORMULAS: Record<string, number[]> = {
  // Major scale modes
  ionian: [0, 2, 4, 5, 7, 9, 11], // Major scale
  dorian: [0, 2, 3, 5, 7, 9, 10], // Minor with major 6
  phrygian: [0, 1, 3, 5, 7, 8, 10], // Minor with flat 2
  lydian: [0, 2, 4, 6, 7, 9, 11], // Major with sharp 4
  mixolydian: [0, 2, 4, 5, 7, 9, 10], // Major with flat 7
  aeolian: [0, 2, 3, 5, 7, 8, 10], // Natural minor
  locrian: [0, 1, 3, 5, 6, 8, 10], // Diminished scale

  // Harmonic minor modes
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  locrianNatural6: [0, 1, 3, 5, 6, 8, 10],
  ionianSharp5: [0, 2, 4, 5, 8, 9, 11],
  dorianSharp4: [0, 2, 3, 6, 7, 9, 10],
  phrygianDominant: [0, 1, 4, 5, 7, 8, 10],
  lydianSharp2: [0, 2, 3, 6, 7, 9, 11],
  ultralocrian: [0, 1, 3, 5, 6, 8, 9],

  // Melodic minor modes (jazz/ascending)
  melodicMinor: [0, 2, 3, 5, 7, 9, 11],
  dorianFlat2: [0, 1, 3, 5, 7, 9, 10],
  lydianAugmented: [0, 2, 4, 6, 8, 9, 11],
  lydianDominant: [0, 2, 4, 6, 7, 9, 10],
  mixolydianFlat6: [0, 2, 4, 5, 7, 8, 10],
  locrianNatural2: [0, 1, 3, 5, 6, 8, 10],
  altered: [0, 1, 3, 4, 6, 8, 10],

  // Symmetric scales
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  wholeTone: [0, 2, 4, 6, 8, 10],
  diminishedHalfWhole: [0, 1, 3, 4, 6, 7, 9, 10],
  diminishedWholeHalf: [0, 2, 3, 5, 6, 8, 9, 11],

  // Pentatonic and blues
  majorPentatonic: [0, 2, 4, 7, 9],
  minorPentatonic: [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
};

/** Human-facing names for the scale ids above. */
export const SCALE_NAMES: Record<string, string> = {
  ionian: "Ionian",
  dorian: "Dorian",
  phrygian: "Phrygian",
  lydian: "Lydian",
  mixolydian: "Mixolydian",
  aeolian: "Aeolian",
  locrian: "Locrian",
  harmonicMinor: "Harmonic minor",
  locrianNatural6: "Locrian ♮6",
  ionianSharp5: "Ionian ♯5",
  dorianSharp4: "Dorian ♯4",
  phrygianDominant: "Phrygian dominant",
  lydianSharp2: "Lydian ♯2",
  ultralocrian: "Ultralocrian",
  melodicMinor: "Melodic minor",
  dorianFlat2: "Dorian ♭2",
  lydianAugmented: "Lydian augmented",
  lydianDominant: "Lydian dominant",
  mixolydianFlat6: "Mixolydian ♭6",
  locrianNatural2: "Locrian ♮2",
  altered: "Altered",
  chromatic: "Chromatic",
  wholeTone: "Whole tone",
  diminishedHalfWhole: "Half–whole diminished",
  diminishedWholeHalf: "Whole–half diminished",
  majorPentatonic: "Major pentatonic",
  minorPentatonic: "Minor pentatonic",
  blues: "Blues",
};

// Scale aliases and metadata
export const SCALE_ALIASES: Record<string, string[]> = {
  ionian: ["major"],
  aeolian: ["natural minor", "minor"],
  dorian: ["dorian"],
  phrygian: ["phrygian"],
  lydian: ["lydian"],
  mixolydian: ["mixolydian"],
  locrian: ["locrian"],
  harmonicMinor: ["harmonic minor"],
  melodicMinor: ["melodic minor", "jazz minor"],
  locrianNatural6: ["locrian ♮2", "half-diminished"],
  ionianSharp5: ["ionian ♯5", "augmented"],
  dorianSharp4: ["dorian ♯4"],
  phrygianDominant: ["phrygian dominant", "spanish phrygian"],
  lydianSharp2: ["lydian ♯2"],
  ultralocrian: ["ultralocrian"],
  dorianFlat2: ["dorian ♭2"],
  lydianAugmented: ["lydian augmented"],
  lydianDominant: ["lydian dominant"],
  mixolydianFlat6: ["mixolydian ♭6"],
  locrianNatural2: ["locrian ♮2"],
  altered: ["altered", "super locrian", "diminished whole-tone"],
};

/** Keys conventionally written with flats. */
const FLAT_KEYS = new Set(["F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"]);

/**
 * Whether a key is conventionally spelled with flats.
 * The accidental in the root wins; natural roots fall back to the
 * key-signature convention (F major uses Bb, not A#).
 */
export function keyPrefersFlats(root: string): boolean {
  if (root.includes("b")) return true;
  if (root.includes("#")) return false;
  return FLAT_KEYS.has(root);
}

/** Minor keys whose key signature is conventionally written with flats. */
const FLAT_MINOR_KEYS = new Set(["D", "G", "C", "F", "Bb", "Eb", "Ab"]);

/**
 * Key-signature spelling with the mode taken into account.
 *
 * D minor needs a B♭ (its relative major is F), even though D major would
 * use sharps. `keyPrefersFlats` only knows the major-key convention.
 */
export function keyPrefersFlatsInMode(
  root: string,
  mode: "major" | "minor",
): boolean {
  if (mode === "major") return keyPrefersFlats(root);
  if (root.includes("b")) return true;
  if (root.includes("#")) return false;
  return FLAT_MINOR_KEYS.has(root);
}

// Get scale notes from root and scale type
export function getScaleNotes(root: string, scaleType: string, useFlats?: boolean): string[] {
  const formula = SCALE_FORMULAS[scaleType];
  if (!formula) {
    throw new Error(`Unknown scale type: ${scaleType}`);
  }

  const rootPc = noteToPitchClass(root);
  const flats = useFlats ?? keyPrefersFlats(root);

  return formula.map((interval) => {
    const pc = (rootPc + interval) % 12;
    return pitchClassToNote(pc, flats);
  });
}

// Get scale degrees (1, b2, 2, etc.) for a scale
export function getScaleDegrees(scaleType: string): string[] {
  const formula = SCALE_FORMULAS[scaleType];
  if (!formula) {
    throw new Error(`Unknown scale type: ${scaleType}`);
  }

  const degreeNames = ["1", "b2", "2", "b3", "3", "4", "#4/b5", "5", "#5/b6", "6", "b7", "7"];
  return formula.map((interval) => degreeNames[interval]);
}

// Get characteristic notes (notes that distinguish this scale from similar ones)
export function getCharacteristicNotes(root: string, scaleType: string): string[] {
  // Define what makes each scale characteristic compared to its parent or similar scales
  const characteristicIntervals: Record<string, number[]> = {
    ionian: [],
    dorian: [9], // major 6 distinguishes from natural minor
    phrygian: [1],
    lydian: [6],
    mixolydian: [10],
    aeolian: [],
    locrian: [1, 6],

    harmonicMinor: [11],
    phrygianDominant: [1, 4, 10],
    lydianAugmented: [6, 8],
    lydianDominant: [6, 10],
    altered: [1, 4, 6, 8, 10],

    blues: [6],
  };

  const intervals = characteristicIntervals[scaleType] ?? [];
  const flats = keyPrefersFlats(root);
  const rootPc = noteToPitchClass(root);
  return intervals.map((interval) => pitchClassToNote((rootPc + interval) % 12, flats));
}
