import { describe, expect, it } from "vitest";

import { parseChord } from "../chords";
import {
  DEFAULT_MAX_FRET,
  STANDARD_TUNING,
  chordRole,
  chordTonePositions,
  fretCentre,
  fretPosition,
  fretRatio,
  inversionOf,
  isDoubleInlayFret,
  isInlayFret,
  noteNameOf,
  pitchClassOf,
  solveVoicing,
  solveVoicingCandidates,
} from "../fretboard";
import {
  analyseProgression,
  degreeOf,
  inferKey,
  romanNumeral,
  transitionCost,
  voiceLeading,
} from "../fretboardEngine";

describe("neck geometry", () => {
  it("puts the twelfth fret exactly at half the scale length", () => {
    expect(fretRatio(12)).toBeCloseTo(0.5, 10);
    expect(fretRatio(24)).toBeCloseTo(0.75, 10);
  });

  it("narrows the space between wires as it climbs", () => {
    let previousGap = fretRatio(12) - fretRatio(11);
    for (let n = 11; n >= 1; n--) {
      const gap = fretRatio(n) - fretRatio(n - 1);
      expect(gap).toBeGreaterThan(previousGap);
      previousGap = gap;
    }
  });

  it("normalises positions across the drawn neck", () => {
    expect(fretPosition(0, 12)).toBe(0);
    expect(fretPosition(12, 12)).toBeCloseTo(1, 10);
    for (let n = 1; n <= 12; n++) {
      expect(fretPosition(n, 12)).toBeGreaterThan(fretPosition(n - 1, 12));
    }
  });

  it("places a finger in the space behind the wire, not on it", () => {
    for (let fret = 1; fret <= 12; fret++) {
      expect(fretCentre(fret, DEFAULT_MAX_FRET)).toBeGreaterThan(fretPosition(fret - 1, DEFAULT_MAX_FRET));
      expect(fretCentre(fret, DEFAULT_MAX_FRET)).toBeLessThan(fretPosition(fret, DEFAULT_MAX_FRET));
    }
  });

  it("marks standard inlays, single and double", () => {
    expect([3, 5, 7, 9, 12, 15].every(isInlayFret)).toBe(true);
    expect(isInlayFret(4)).toBe(false);
    expect(isDoubleInlayFret(12)).toBe(true);
    expect(isDoubleInlayFret(7)).toBe(false);
  });
});

describe("string map", () => {
  it("uses standard tuning, low to high", () => {
    expect([...STANDARD_TUNING]).toEqual([40, 45, 50, 55, 59, 64]);
  });

  it("names open strings as their pitch classes", () => {
    expect(noteNameOf(0, 0)).toBe("E");
    expect(noteNameOf(1, 0)).toBe("A");
    expect(noteNameOf(5, 0)).toBe("E");
  });

  it("adds frets as semitones", () => {
    expect(pitchClassOf(0, 1)).toBe(5); // F on the low E string
    expect(pitchClassOf(0, 12)).toBe(4); // E, one octave up
    expect(pitchClassOf(5, 12)).toBe(4); // E, one octave up
    expect(pitchClassOf(1, 3)).toBe(0); // C on the A string
  });
});

describe("book voicings", () => {
  const chord = parseChord("Cmaj7");
  const voicing = solveVoicing(chord);

  it("returns a printed four-note shape", () => {
    expect(voicing).not.toBeNull();
    expect(voicing!.shape).toHaveLength(6);
    expect(voicing!.sounding).toBe(4);
    expect(voicing!.span).toBeLessThanOrEqual(4);
    expect(voicing!.playability).toBeGreaterThanOrEqual(0);
    expect(voicing!.playability).toBeLessThanOrEqual(1);
  });

  it("carries the book's provenance", () => {
    // `solveVoicing` takes the lowest playable printed shape across all four
    // families, so the page is whatever family that shape came from.
    expect(voicing!.book.chart).toBe("Maj7");
    expect(voicing!.book.page).toBeGreaterThanOrEqual(113);
    expect(voicing!.book.page).toBeLessThanOrEqual(184);
    expect(voicing!.book.stringSet.split("-")).toHaveLength(4);
    expect(voicing!.book.column.length).toBeGreaterThan(0);
    // The whole shape was slid along the neck: printed root + shift = C.
    expect(
      ((voicing!.book.printedRootPc + voicing!.book.shift) % 12 + 12) % 12,
    ).toBe(0);
  });

  it("plays only chord tones", () => {
    const pcs = new Set([0, 4, 7, 11]);
    for (const position of voicing!.positions) {
      expect(pcs.has(position.pc)).toBe(true);
    }
  });

  it("marks exactly one bass voice", () => {
    const bass = voicing!.positions.filter((position) => position.isBass);
    expect(bass).toHaveLength(1);
    const lowest = voicing!.positions.reduce((a, b) => (a.midi <= b.midi ? a : b));
    expect(bass[0].midi).toBe(lowest.midi);
  });

  it("labels each role from the chord, not from the shape", () => {
    expect(chordRole(chord, 0)).toBe("root");
    expect(chordRole(chord, 4)).toBe("third");
    expect(chordRole(chord, 7)).toBe("fifth");
    expect(chordRole(chord, 11)).toBe("seventh");
  });

  it("honours a slash bass and reports the inversion", () => {
    const slash = parseChord("Bbmaj7/D");
    const shape = solveVoicing(slash);
    expect(shape).not.toBeNull();
    expect(shape!.bassPc).toBe(2); // D
    expect(inversionOf(slash, shape!.bassPc)).toBe(1);
    expect(inversionOf(slash, 10)).toBe(0);
  });

  it("places chord tones across the whole neck", () => {
    const positions = chordTonePositions(chord, 12);
    expect(positions.length).toBeGreaterThan(20);
    expect(positions.every((position) => position.fret <= 12)).toBe(true);
    expect(positions.some((position) => position.interval === 11)).toBe(true);
  });

  it("invents nothing for a quality the book does not chart", () => {
    expect(solveVoicingCandidates(parseChord("C"))).toEqual([]);
    expect(solveVoicingCandidates(parseChord("C9"))).toEqual([]);
    expect(solveVoicingCandidates(parseChord("C7b9"))).toEqual([]);
  });

  it("returns each printed shape once", () => {
    const candidates = solveVoicingCandidates(chord);
    expect(new Set(candidates.map((candidate) => candidate.shape.join(","))).size).toBe(
      candidates.length,
    );
    expect(candidates.length).toBeGreaterThan(1);
  });
});

describe("roman numerals", () => {
  const numeral = (symbol: string, key = "C", mode: "major" | "minor" = "major") =>
    romanNumeral(parseChord(symbol), key, mode);

  it("reads the ii–V–I in C", () => {
    expect(numeral("Dm7").roman).toBe("ii7");
    expect(numeral("G7").roman).toBe("V7");
    expect(numeral("Cmaj7").roman).toBe("Imaj7");
    expect(numeral("Fmaj7").roman).toBe("IVmaj7");
  });

  it("marks diminished and half-diminished chords", () => {
    expect(numeral("Bm7b5").roman).toBe("viiø7");
    expect(numeral("Bdim7").roman).toBe("vii°7");
  });

  it("spells borrowed chords against the key", () => {
    expect(numeral("Bb", "C", "major").roman).toBe("♭VII");
    expect(numeral("Bb", "C", "minor").roman).toBe("VII");
    expect(numeral("E7", "C", "minor").roman).toBe("♯III7");
  });

  it("counts degrees from the mode's own scale", () => {
    expect(degreeOf(2, 0, "major")).toEqual({ degree: 2, accidental: "" });
    expect(degreeOf(10, 0, "major")).toEqual({ degree: 7, accidental: "♭" });
    expect(degreeOf(10, 0, "minor")).toEqual({ degree: 7, accidental: "" });
    expect(degreeOf(11, 0, "minor")).toEqual({ degree: 7, accidental: "♯" });
  });
});

describe("key inference", () => {
  it("hears ii–V–I in C", () => {
    expect(inferKey(["Dm7", "G7", "Cmaj7"])).toEqual({ key: "C", mode: "major" });
  });

  it("hears a minor cadence in A", () => {
    const inferred = inferKey(["Am7", "D7", "Gmaj7", "Cmaj7", "Fmaj7", "Bm7b5", "E7", "Am7"]);
    expect(inferred.key).toBe("A");
    expect(inferred.mode).toBe("minor");
  });
});

describe("voice leading", () => {
  const a = solveVoicing(parseChord("Dm7"))!;
  const b = solveVoicing(parseChord("G7"))!;

  it("accounts for every string", () => {
    const ledger = voiceLeading(a, b);
    expect(ledger.moves).toHaveLength(6);
    expect(ledger.score).toBeGreaterThanOrEqual(0);
    expect(ledger.score).toBeLessThanOrEqual(1);
    expect(ledger.totalMovement).toBe(
      ledger.moves.reduce((sum, move) => sum + Math.abs(move.semitones), 0),
    );
  });

  it("counts held voices honestly", () => {
    const ledger = voiceLeading(a, a);
    expect(ledger.totalMovement).toBe(0);
    const sounding = ledger.moves.filter((move) => move.fromFret !== null);
    expect(sounding.length).toBeGreaterThan(0);
    expect(sounding.every((move) => move.held)).toBe(true);
    expect(ledger.score).toBeGreaterThan(0.9);
    expect(ledger.commonTones.length).toBe(new Set(a.positions.map((p) => p.pc)).size);
  });

  it("costs nothing to stay put and something to travel", () => {
    expect(transitionCost(a, a)).toBe(0);
    const candidates = solveVoicingCandidates(parseChord("Dm7"), { maxFret: 15 });
    const furthest = [...candidates].sort((x, y) => y.minFret - x.minFret)[0];
    expect(transitionCost(a, furthest)).toBeGreaterThan(0);
    for (const candidate of candidates) {
      expect(transitionCost(a, candidate)).toBeGreaterThanOrEqual(
        voiceLeading(a, candidate).totalMovement,
      );
    }
  });
});

describe("progression analysis", () => {
  const progression = analyseProgression(["Dm7", "G7", "Cmaj7"]);

  it("names the key and every function", () => {
    expect(progression.key).toBe("C");
    expect(progression.mode).toBe("major");
    expect(progression.steps.map((step) => step.roman)).toEqual(["ii7", "V7", "Imaj7"]);
    expect(progression.steps.map((step) => step.fn)).toEqual([
      "subdominant",
      "dominant",
      "tonic",
    ]);
  });

  it("gives every chord a printed shape and a scale", () => {
    for (const step of progression.steps) {
      expect(step.voicing).not.toBeNull();
      expect(step.voicing!.book).toBeDefined();
      expect(step.candidates.length).toBeGreaterThan(0);
      expect(step.candidates.every((candidate) => candidate.book)).toBe(true);
      expect(step.scale).not.toBeNull();
      expect(step.scale!.scale).toBe(
        step.index === 0 ? "dorian" : step.index === 1 ? "mixolydian" : "ionian",
      );
    }
  });

  it("keeps the hand moving less than a blind shape-by-shape reading", () => {
    const blind = progression.steps.reduce((sum, step, index) => {
      if (index === 0) return 0;
      const previous = progression.steps[index - 1].candidates[0];
      const current = step.candidates[0];
      return sum + (previous && current ? voiceLeading(previous, current).totalMovement : 0);
    }, 0);

    expect(progression.totalMovement).toBeLessThanOrEqual(blind);
    expect(progression.averageMovement).toBeGreaterThan(0);
    expect(progression.smoothness).toBeGreaterThan(0.3);
    expect(progression.smoothness).toBeLessThanOrEqual(1);
  });

  it("writes the key's notes in its own spelling", () => {
    const f = analyseProgression(["Gm7", "C7", "Fmaj7"]);
    expect(f.key).toBe("F");
    expect(f.keyNotes).toEqual(["F", "G", "A", "Bb", "C", "D", "E"]);
  });

  it("spells a flat minor key with flats, not sharps", () => {
    const d = analyseProgression(["Dm7", "G7", "Dm7", "A7"]);
    expect(d.key).toBe("D");
    expect(d.mode).toBe("minor");
    expect(d.keyNotes).toEqual(["D", "E", "F", "G", "A", "Bb", "C"]);
    expect(d.keyNotes).not.toContain("A#");
  });

  it("keeps a sharp minor key sharp", () => {
    const e = analyseProgression(["Em7", "A7", "Em7", "B7"]);
    expect(e.key).toBe("E");
    expect(e.mode).toBe("minor");
    expect(e.keyNotes).toEqual(["E", "F#", "G", "A", "B", "C", "D"]);
  });

  it("honours an explicit key over the inference", () => {
    const inF = analyseProgression(["Dm7", "G7", "Cmaj7"], { key: "F" });
    expect(inF.key).toBe("F");
    // Dm7 is the submediant of F; G7 is a secondary dominant of the V.
    expect(inF.steps.map((step) => step.roman)).toEqual(["vi7", "II7", "Vmaj7"]);
  });

  it("survives junk input without throwing", () => {
    const junk = analyseProgression(["H13", "Cmaj7"]);
    expect(junk.steps).toHaveLength(2);
    expect(junk.steps[0].chord.isValid).toBe(false);
    expect(junk.steps[1].chord.isValid).toBe(true);
    expect(junk.steps[0].candidates).toEqual([]);
  });

  it("is honest about a chord quality it cannot voice", () => {
    const plain = analyseProgression(["C", "G7", "Cmaj7"]);
    expect(plain.steps[0].voicing).toBeNull();
    expect(plain.steps[0].candidates).toEqual([]);
    expect(plain.steps[1].voicing).not.toBeNull();
  });

  it("collects candidates deterministically", () => {
    const again = analyseProgression(["Dm7", "G7", "Cmaj7"]);
    expect(again.steps.map((step) => step.voicing?.shape)).toEqual(
      progression.steps.map((step) => step.voicing?.shape),
    );
  });
});
