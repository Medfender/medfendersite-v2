// Music theory: notes, intervals, and pitch classes

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const FLAT_NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Mapping from note name to pitch class (0-11)
export function noteToPitchClass(note: string): number {
  // Check flat note names first (they have proper casing)
  const flatIndex = FLAT_NOTE_NAMES.indexOf(note);
  if (flatIndex !== -1) return flatIndex;

  // Then check sharp note names (uppercase)
  const noteUpper = note.toUpperCase();
  const sharpIndex = NOTE_NAMES.indexOf(noteUpper);
  if (sharpIndex !== -1) return sharpIndex;

  throw new Error(`Invalid note name: ${note}`);
}

// Mapping from pitch class (0-11) to note name (using sharps by default)
export function pitchClassToNote(pc: number, useFlats = false): string {
  const index = ((pc % 12) + 12) % 12;
  return useFlats ? FLAT_NOTE_NAMES[index] : NOTE_NAMES[index];
}

// Interval names in semitones
export const INTERVAL_NAMES = [
  'Unison', 'm2', 'M2', 'm3', 'M3', 'P4', 'aug4/dim5', 'P5', 'm6', 'M6', 'm7', 'M7'
];

export function getIntervalName(semitones: number): string {
  const index = ((semitones % 12) + 12) % 12;
  return INTERVAL_NAMES[index];
}

// Calculate distance between two notes in semitones
export function distance(note1: string, note2: string): number {
  const pc1 = noteToPitchClass(note1);
  const pc2 = noteToPitchClass(note2);
  return (pc2 - pc1 + 12) % 12;
}

// Get note at a given interval from a root note
export function transpose(root: string, semitones: number): string {
  const rootPc = noteToPitchClass(root);
  const newPc = (rootPc + semitones) % 12;
  return pitchClassToNote(newPc);
}

// Generate chromatic scale starting from a note
export function chromaticScale(root: string, length = 12): string[] {
  const rootPc = noteToPitchClass(root);
  return Array.from({ length }, (_, i) =>
    pitchClassToNote((rootPc + i) % 12)
  );
}