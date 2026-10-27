import { describe, expect, it } from "vitest";

import { parseChord } from "../chords";
import { STANDARD_TUNING } from "../fretboard";
import { printedVoicing, solveVoicing } from "../fretboard";
import {
  BEATO_CHARTS,
  BEATO_CHART_ORDER,
  BEATO_FAMILIES,
  BEATO_SHAPE_COUNT,
  BEATO_SHAPES,
  beatoPage,
  beatoStringSets,
  chartForQuality as chartForQualityName,
  getBeatoShapes,
  isBeatoChart,
  isBeatoFamily,
  placeBeatoChart,
  placeBeatoShape,
  shapeStringNumbers,
  stringSetLabel,
} from "../beatoVoicings";
import type { BeatoChart, BeatoFamily } from "../beatoVoicings";

const STRING_SETS: Record<BeatoFamily, string[]> = {
  "Drop 2": ["4-3-2-1", "5-4-3-2", "6-5-4-3"],
  "Drop 3": ["5-3-2-1", "6-4-3-2"],
  "Drop 2+3": ["5-4-3-1", "6-5-4-2"],
  "Drop 2+4": ["5-4-2-1", "6-5-3-2"],
};

function intervalsOf(shape: readonly number[], rootPc: number): number[] {
  const pcs = new Set<number>();
  shape.forEach((fret, string) => {
    if (fret < 0) return;
    pcs.add((((STANDARD_TUNING[string] + fret - rootPc) % 12) + 12) % 12);
  });
  return [...pcs].sort((a, b) => a - b);
}

describe("the book database", () => {
  it("holds every printed diagram except the duplicated page", () => {
    // 18 charts × 12 Drop 2 shapes + 17 charts × 8 shapes for each of the
    // three remaining families. Drop 3 Dimmaj7♭13 (p. 148) is a byte-for-byte
    // duplicate of Maj7sus4 (p. 144) and is deliberately absent.
    expect(BEATO_SHAPE_COUNT).toBe(640);
    expect(216 + 136 + 144 + 144).toBe(640);
    expect(BEATO_SHAPES).toHaveLength(640);
  });

  it("prints twelve Drop 2 diagrams per chart and eight for the rest", () => {
    for (const chart of BEATO_CHART_ORDER) {
      for (const family of BEATO_FAMILIES) {
        if (chart === "Dimmaj7b13" && family === "Drop 3") {
          expect(getBeatoShapes(chart, family)).toHaveLength(0);
          continue;
        }
        expect(getBeatoShapes(chart, family)).toHaveLength(
          family === "Drop 2" ? 12 : 8,
        );
      }
    }
  });

  it("never carries the duplicated Drop 3 Dimmaj7♭13 page", () => {
    const duplicated = BEATO_SHAPES.filter(
      (shape) => shape.chart === "Dimmaj7b13" && shape.family === "Drop 3",
    );
    expect(duplicated).toHaveLength(0);
  });

  it("uses only the string sets each family prints", () => {
    for (const family of BEATO_FAMILIES) {
      const used = new Set(
        BEATO_SHAPES.filter((shape) => shape.family === family).map((shape) =>
          stringSetLabel(shape.shape),
        ),
      );
      expect([...used].sort()).toEqual(STRING_SETS[family]);
    }
  });

  it("puts every shape on the page its chart and family occupy", () => {
    for (const shape of BEATO_SHAPES) {
      expect(shape.page).toBe(beatoPage(shape.chart, shape.family));
    }
    expect(beatoPage("Maj6", "Drop 2")).toBe(113);
    expect(beatoPage("Maj7", "Drop 2")).toBe(114);
    expect(beatoPage("Maj6", "Drop 3")).toBe(131);
    expect(beatoPage("Dimmaj7b13", "Drop 2")).toBe(130);
    expect(beatoPage("Dimmaj7b13", "Drop 2+4")).toBe(184);
  });

  it("matches every shape's sounding notes to its chart's interval set", () => {
    for (const shape of BEATO_SHAPES) {
      const expected = [...BEATO_CHARTS[shape.chart].intervals].sort((a, b) => a - b);
      expect(intervalsOf(shape.shape, shape.printedRootPc), `${shape.chart} p.${shape.page}`).toEqual(
        expected,
      );
    }
  });

  it("keeps the printed bass inside the chart's intervals", () => {
    for (const shape of BEATO_SHAPES) {
      expect(BEATO_CHARTS[shape.chart].intervals).toContain(shape.bass);
    }
  });

  it("prints the chart's own column headings", () => {
    for (const shape of BEATO_SHAPES) {
      // The extraction stored the printed column heading (Root / 3 / b5 / …).
      expect(typeof shape.column).toBe("string");
      expect(shape.column.length).toBeGreaterThan(0);
    }
    expect(BEATO_CHART_ORDER).toHaveLength(18);
  });

  it("puts exactly four notes on every diagram", () => {
    for (const shape of BEATO_SHAPES) {
      expect(shape.shape.filter((fret) => fret >= 0)).toHaveLength(4);
    }
  });

  it("numbers strings low E = 6 to high E = 1", () => {
    const shape = BEATO_SHAPES.find(
      (entry) => stringSetLabel(entry.shape) === "6-5-4-3",
    );
    expect(shape).toBeDefined();
    expect(shapeStringNumbers(shape!.shape)).toEqual([6, 5, 4, 3]);
  });

  it("exposes the eighteen charts and their printed formulas", () => {
    expect(Object.keys(BEATO_CHARTS)).toHaveLength(18);
    expect(BEATO_CHARTS.Maj7.formula).toBe("R 3 5 7");
    expect(BEATO_CHARTS.Lydianmaj7.formula).toBe("R ♯4 5 7");
    expect(BEATO_CHARTS.Dimmaj7b13.formula).toBe("R ♭3 ♯5 7");
  });

  it("recognises its own chart and family names", () => {
    expect(isBeatoChart("Maj7")).toBe(true);
    expect(isBeatoChart("maj7")).toBe(false);
    expect(isBeatoFamily("Drop 2+4")).toBe(true);
    expect(isBeatoFamily("Drop 5")).toBe(false);
  });
});

describe("transposition", () => {
  const targets = Array.from({ length: 12 }, (_, index) => index);

  it("keeps every interval and never opens a string", () => {
    for (const shape of BEATO_SHAPES) {
      for (const target of targets) {
        const placements = placeBeatoShape(shape, target);
        expect(placements.length).toBeGreaterThan(0);
        for (const placement of placements) {
          expect(intervalsOf(placement.shape, target)).toEqual(
            intervalsOf(shape.shape, shape.printedRootPc),
          );
          for (const fret of placement.shape) {
            if (fret < 0) continue;
            expect(fret).toBeGreaterThanOrEqual(1);
            expect(fret).toBeLessThanOrEqual(16);
          }
        }
      }
    }
  });

  it("finds a shape for every chart, family and root", () => {
    for (const chart of BEATO_CHART_ORDER) {
      for (const family of BEATO_FAMILIES) {
        if (chart === "Dimmaj7b13" && family === "Drop 3") continue;
        for (const root of targets) {
          expect(
            placeBeatoChart(chart, root, family).length,
            `${chart} ${family} root ${root}`,
          ).toBeGreaterThan(0);
        }
      }
    }
  });

  it("offers the printed string sets for a chart", () => {
    expect(beatoStringSets("Maj7", "Drop 2")).toEqual([
      "6-5-4-3",
      "5-4-3-2",
      "4-3-2-1",
    ]);
    expect(beatoStringSets("Maj7", "Drop 3")).toEqual(["6-4-3-2", "5-3-2-1"]);
    expect(beatoStringSets("Dimmaj7b13", "Drop 3")).toEqual([]);
  });

  it("does not move a shape printed already in the requested key", () => {
    const shape = BEATO_SHAPES.find(
      (entry) => entry.chart === "Maj7" && entry.family === "Drop 2" && entry.column === "7",
    )!;
    const placements = placeBeatoShape(shape, shape.printedRootPc);
    expect(placements[0].shift).toBe(0);
    expect(placements[0].shape).toEqual(shape.shape);
  });
});

describe("chart lookup", () => {
  it("maps the qualities the book prints", () => {
    expect(chartForQualityName("6")).toBe("Maj6");
    expect(chartForQualityName("m6")).toBe("Min6");
    expect(chartForQualityName("maj7")).toBe("Maj7");
    expect(chartForQualityName("7")).toBe("Dom7");
    expect(chartForQualityName("m7")).toBe("Min7");
    expect(chartForQualityName("mMaj7")).toBe("Minmaj7");
    expect(chartForQualityName("m7b5")).toBe("Min7b5");
    expect(chartForQualityName("dim7")).toBe("Dim7");
    expect(chartForQualityName("dimMaj7")).toBe("Dimmaj7");
    expect(chartForQualityName("augMaj7")).toBe("Augmaj7");
    expect(chartForQualityName("7#5")).toBe("Aug7");
    expect(chartForQualityName("maj7b5")).toBe("Maj7b5");
    expect(chartForQualityName("7b5")).toBe("Dom7b5");
    expect(chartForQualityName("maj7sus4")).toBe("Maj7sus4");
    expect(chartForQualityName("7sus4")).toBe("Dom7sus4");
    expect(chartForQualityName("dimMaj7b13")).toBe("Dimmaj7b13");
  });

  it("reads printed alterations from a chord symbol", () => {
    expect(chartForQualityName("maj7", ["#11"])).toBe("Lydianmaj7");
    expect(chartForQualityName("7", ["#11"])).toBe("LydianDom7");
    expect(chartForQualityName("7", ["b5"])).toBe("Dom7b5");
    expect(chartForQualityName("7", ["#5"])).toBe("Aug7");
  });

  it("refuses qualities the book does not chart", () => {
    expect(chartForQualityName("maj")).toBeNull();
    expect(chartForQualityName("m")).toBeNull();
    expect(chartForQualityName("dim")).toBeNull();
    expect(chartForQualityName("sus4")).toBeNull();
    expect(chartForQualityName("maj9")).toBeNull();
    expect(chartForQualityName("9")).toBeNull();
    expect(chartForQualityName("13")).toBeNull();
    expect(chartForQualityName("7", ["b9"])).toBeNull();
  });
});

describe("book-sourced voicings", () => {
  it("returns a printed shape for Cmaj7 with its page and column", () => {
    const voicing = solveVoicing(parseChord("Cmaj7"));
    expect(voicing).not.toBeNull();
    expect(voicing!.book.chart).toBe("Maj7");
    expect(voicing!.book.page).toBeGreaterThanOrEqual(113);
    expect(voicing!.book.page).toBeLessThanOrEqual(184);
    expect(voicing!.positions).toHaveLength(4);
    expect(voicing!.book.column.length).toBeGreaterThan(0);
  });

  it("labels the printed diagram's own root and shape", () => {
    const book = getBeatoShapes("Maj7", "Drop 2")[0];
    const voicing = printedVoicing(book);
    expect(voicing.shape).toEqual(book.shape);
    expect(voicing.book.shift).toBe(0);
    expect(voicing.book.page).toBe(book.page);
    expect(voicing.positions.map((position) => position.pc).sort()).toEqual(
      [...new Set(voicing.positions.map((position) => position.pc))].sort(),
    );
  });

  it("finds a printed inversion for a slash bass", () => {
    const slash = parseChord("Bbmaj7/D");
    const shape = solveVoicing(slash);
    expect(shape).not.toBeNull();
    expect(shape!.bassPc).toBe(2); // D
  });

  it("returns no shape at all for a triad", () => {
    expect(solveVoicing(parseChord("C"))).toBeNull();
    expect(solveVoicing(parseChord("Cm"))).toBeNull();
  });

  it("returns no shape for a quality outside the book's charts", () => {
    expect(solveVoicing(parseChord("C9"))).toBeNull();
    expect(solveVoicing(parseChord("C13"))).toBeNull();
    expect(solveVoicing(parseChord("C7b9"))).toBeNull();
  });

  it("maps every printed chart onto a chord symbol it can be looked up by", () => {
    const symbols: Record<BeatoChart, string> = {
      Maj6: "C6",
      Maj7: "Cmaj7",
      Dom7: "C7",
      Min7: "Cm7",
      Min6: "Cm6",
      Minmaj7: "CmMaj7",
      Min7b5: "Cm7b5",
      Dim7: "Cdim7",
      Dimmaj7: "CdimMaj7",
      Augmaj7: "CaugMaj7",
      Aug7: "C7#5",
      Maj7b5: "Cmaj7b5",
      Dom7b5: "C7b5",
      Maj7sus4: "Cmaj7sus4",
      Dom7sus4: "C7sus4",
      Lydianmaj7: "Cmaj7#11",
      LydianDom7: "C7#11",
      Dimmaj7b13: "CdimMaj7b13",
    };
    for (const chart of BEATO_CHART_ORDER) {
      expect(chartForQualityName(
        parseChord(symbols[chart]).quality,
        parseChord(symbols[chart]).tensions,
      )).toBe(chart);
    }
  });
});
