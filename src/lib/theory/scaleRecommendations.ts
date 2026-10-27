import { getScaleNotes, keyPrefersFlats, SCALE_FORMULAS, SCALE_NAMES } from "./scales";
import { noteToPitchClass } from "./notes";
import type { ChordInfo, ScaleRecommendation } from "./chords";

/** The mode a player reaches for first for each chord quality. */
const PRIMARY_MODE: Record<string, string> = {
  maj: "ionian",
  m: "aeolian",
  "7": "mixolydian",
  maj7: "ionian",
  m7: "dorian",
  m6: "dorian",
  "6": "ionian",
  dim: "locrian",
  dim7: "diminishedWholeHalf",
  halfDim: "locrian",
  sus2: "ionian",
  sus4: "mixolydian",
  "5": "minorPentatonic",
};

/**
 * A scale tone a semitone above a chord tone is the classic "avoid note":
 * it fights the harmony when held. Counting these is what separates Dorian
 * from Aeolian over a m7 chord — both contain the chord, only Dorian has
 * no tone sitting a minor second over the fifth.
 */
function avoidNotes(scalePcs: number[], chordPcs: number[]): number[] {
  return scalePcs.filter(
    (pc) => !chordPcs.includes(pc) && chordPcs.some((chordPc) => (chordPc + 1) % 12 === pc),
  );
}

/**
 * Rank every known scale against a chord.
 *
 * Scoring is deliberately explainable, and weighted so that the working
 * choice beats a technically-compatible exotic one:
 *
 *   70  contains every chord tone (otherwise scaled by coverage)
 *   30  is the conventional first choice for this chord quality
 *   12  is a practical size (5–7 notes)
 *   10  matches the chord's third quality
 *    8  matches the chord's seventh quality (when the chord has a seventh)
 *   -9  per avoid note
 *  -25  for synthetic scales of eight or more notes
 *
 * Ties are broken by fewer avoid notes, then alphabetically, so the result
 * is stable across runs.
 */
const MAX_SCORE = 130;

export function getScaleRecommendations(chord: ChordInfo): ScaleRecommendation[] {
  if (!chord.isValid) return [];

  const rootPc = noteToPitchClass(chord.root);
  const chordPcs = chord.intervals.map((i) => (rootPc + i) % 12);
  const hasThird = chord.intervals.some((i) => i === 3 || i === 4);
  const chordThird = chord.intervals.find((i) => i === 3 || i === 4);
  const chordSeventh = chord.intervals.find((i) => i === 10 || i === 11);
  const preferred = PRIMARY_MODE[chord.quality];

  const scored: Array<{
    score: number;
    avoid: number[];
    recommendation: ScaleRecommendation;
  }> = [];

  for (const [scaleName, formula] of Object.entries(SCALE_FORMULAS)) {
    const scalePcs = formula.map((i) => (rootPc + i) % 12);
    const matched = chordPcs.filter((pc) => scalePcs.includes(pc)).length;
    const containsAll = matched === chordPcs.length;

    let score = containsAll ? 70 : Math.round((matched / chordPcs.length) * 45);

    if (formula.length >= 5 && formula.length <= 7) score += 12;
    if (formula.length >= 8) score -= 25;

    if (hasThird && scalePcs.includes((rootPc + chordThird!) % 12)) score += 10;
    if (chordSeventh !== undefined && scalePcs.includes((rootPc + chordSeventh) % 12)) score += 8;
    if (preferred === scaleName) score += 30;

    const avoid = avoidNotes(scalePcs, chordPcs);
    score -= avoid.length * 9;

    const flats = keyPrefersFlats(chord.root);
    const scaleNotes = getScaleNotes(chord.root, scaleName, flats);

    scored.push({
      score,
      avoid,
      recommendation: {
        scale: scaleName,
        displayName: SCALE_NAMES[scaleName] ?? scaleName,
        compatibilityScore: Math.max(0, Math.min(1, score / MAX_SCORE)),
        characteristicTones: formula.filter((i) => chordPcs.includes((rootPc + i) % 12)),
        avoidTones: avoid,
        scaleNotes,
        reason: buildReason({
          scaleName,
          chord,
          matched,
          total: chordPcs.length,
          avoid,
          containsAll,
          preferred,
        }),
      },
    });
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.avoid.length !== b.avoid.length) return a.avoid.length - b.avoid.length;
    return a.recommendation.scale.localeCompare(b.recommendation.scale);
  });

  return scored.map((entry) => entry.recommendation);
}

function buildReason(args: {
  scaleName: string;
  chord: ChordInfo;
  matched: number;
  total: number;
  avoid: number[];
  containsAll: boolean;
  preferred?: string;
}): string {
  const { scaleName, chord, matched, total, avoid, containsAll, preferred } = args;
  const name = SCALE_NAMES[scaleName] ?? scaleName;

  if (!containsAll) {
    return `${name} contains ${matched} of ${total} chord tones, so part of ${chord.originalSymbol} sits outside the scale. Useful for tension, not for a settled statement.`;
  }
  if (avoid.length === 0 && preferred === scaleName) {
    return `${name} contains every tone of ${chord.originalSymbol} and adds no note a semitone above one of them — the settled first choice.`;
  }
  if (avoid.length === 0) {
    return `${name} contains every tone of ${chord.originalSymbol} without a semitone clash.`;
  }
  return `${name} contains every tone of ${chord.originalSymbol}, but ${avoid.length} scale tone${
    avoid.length === 1 ? " sits" : "s sit"
  } a semitone above a chord tone — colour that wants resolving.`;
}
