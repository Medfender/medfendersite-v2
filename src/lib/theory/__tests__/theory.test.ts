import { describe, expect, it } from "vitest";

import { noteToPitchClass, pitchClassToNote, transpose } from "../notes";
import { getScaleNotes, getScaleDegrees, keyPrefersFlats, getCharacteristicNotes } from "../scales";
import { parseChord } from "../chords";
import { getScaleRecommendations } from "../scaleRecommendations";

describe("notes", () => {
  it("round-trips pitch classes", () => {
    for (let pc = 0; pc < 12; pc++) {
      expect(noteToPitchClass(pitchClassToNote(pc))).toBe(pc);
      expect(noteToPitchClass(pitchClassToNote(pc, true))).toBe(pc);
    }
  });

  it("transposes by semitone count", () => {
    expect(transpose("C", 7)).toBe("G");
    expect(transpose("Bb", 2)).toBe("C");
  });
});

describe("key spelling", () => {
  it("uses the key signature rather than the sharp default", () => {
    expect(keyPrefersFlats("F")).toBe(true);
    expect(keyPrefersFlats("E")).toBe(false);
    expect(getScaleNotes("F", "ionian")).toEqual(["F", "G", "A", "Bb", "C", "D", "E"]);
    expect(getScaleNotes("E", "ionian")).toContain("G#");
    expect(getScaleNotes("E", "ionian")).not.toContain("Ab");
  });

  it("spells a flat key's chords consistently", () => {
    expect(getScaleNotes("Bb", "mixolydian")).toEqual(["Bb", "C", "D", "Eb", "F", "G", "Ab"]);
  });

  it("names the scale degrees it returns", () => {
    expect(getScaleDegrees("dorian")).toEqual(["1", "2", "b3", "4", "5", "6", "b7"]);
  });

  it("finds Dorian's characteristic sixth in the key's spelling", () => {
    expect(getCharacteristicNotes("D", "dorian")).toEqual(["B"]);
    expect(getCharacteristicNotes("G", "mixolydian")).toEqual(["F"]);
  });
});

describe("chord parsing", () => {
  it("keeps C7 and Cmaj7 distinct", () => {
    const dominant = parseChord("C7");
    const major = parseChord("Cmaj7");

    expect(dominant.intervals).toEqual([0, 4, 7, 10]);
    expect(major.intervals).toEqual([0, 4, 7, 11]);
    expect(dominant.notes).toContain("Bb");
    expect(major.notes).toContain("B");
    expect(dominant.notes).not.toEqual(major.notes);
  });

  it("reads a slash bass as a separate pitch class", () => {
    const chord = parseChord("Bbmaj7/D");
    expect(chord.bass).toBe("D");
    expect(chord.root).toBe("Bb");
    expect(chord.intervals).toEqual([0, 4, 7, 11]);
  });

  it("keeps a major sixth major", () => {
    expect(parseChord("C6").intervals).toEqual([0, 4, 7, 9]);
    expect(parseChord("Cm6").intervals).toEqual([0, 3, 7, 9]);
  });

  it("reads the book's seventh-chord qualities", () => {
    expect(parseChord("CmMaj7").intervals).toEqual([0, 3, 7, 11]);
    expect(parseChord("CdimMaj7").intervals).toEqual([0, 3, 6, 11]);
    expect(parseChord("CaugMaj7").intervals).toEqual([0, 4, 8, 11]);
    expect(parseChord("C7sus4").intervals).toEqual([0, 5, 7, 10]);
    expect(parseChord("Cmaj7sus4").intervals).toEqual([0, 5, 7, 11]);
    expect(parseChord("CdimMaj7b13").intervals).toEqual([0, 3, 8, 11]);
  });

  it("replaces an altered fifth instead of adding another", () => {
    expect(parseChord("Cmaj7b5").intervals).toEqual([0, 4, 6, 11]);
    expect(parseChord("C7b5").intervals).toEqual([0, 4, 6, 10]);
    expect(parseChord("C7#5").intervals).toEqual([0, 4, 8, 10]);
    expect(parseChord("Cmaj7#5").intervals).toEqual([0, 4, 8, 11]);
  });

  it("keeps extensions above the octave and records the tension", () => {
    const chord = parseChord("C7#11");
    expect(chord.intervals).toEqual([0, 4, 7, 10, 18]);
    expect(chord.tensions).toEqual(["#11"]);
    expect(parseChord("C7b13").intervals).toEqual([0, 4, 7, 10, 20]);
  });
});

describe("scale recommendation", () => {
  const first = (symbol: string) => getScaleRecommendations(parseChord(symbol))[0];

  it("puts Dorian first over a minor seventh", () => {
    expect(first("Dm7").scale).toBe("dorian");
  });

  it("puts Mixolydian first over a dominant seventh", () => {
    expect(first("G7").scale).toBe("mixolydian");
  });

  it("puts Ionian first over a major seventh", () => {
    expect(first("Cmaj7").scale).toBe("ionian");
  });

  it("explains itself in the chord's own terms", () => {
    const rec = first("Dm7");
    expect(rec.scaleNotes).toEqual(["D", "E", "F", "G", "A", "B", "C"]);
    expect(rec.reason).toContain("Dm7");
    expect(rec.compatibilityScore).toBeGreaterThan(0.8);
    expect(rec.avoidTones).toHaveLength(0);
  });
});
