"use client";

import { useCallback, useMemo, useState } from "react";
import { noteToPitchClass, pitchClassToNote } from "@/lib/theory/notes";
import { keyPrefersFlats } from "@/lib/theory/scales";
import {
  ROLE_NAMES,
  chordRootPc,
  intervalLabel,
  voicingsForChart,
} from "@/lib/theory/fretboard";
import type { ChordRole, Voicing } from "@/lib/theory/fretboard";
import { analyseProgression, voiceLeading } from "@/lib/theory/fretboardEngine";
import type { KeyMode, VoiceLeading } from "@/lib/theory/fretboardEngine";
import {
  BEATO_CHARTS,
  BEATO_CHART_ORDER,
  BEATO_FAMILIES,
  BEATO_SHAPE_COUNT,
  BEATO_SOURCE,
  beatoPage,
  beatoStringSets,
  chartForQuality,
} from "@/lib/theory/beatoVoicings";
import type { BeatoChart, BeatoFamily } from "@/lib/theory/beatoVoicings";
import BookShape from "@/components/fretboard/BookShape";
import NeckMap from "@/components/neck/NeckMap";
import type { NeckNote } from "@/components/neck/NeckMap";
import { usePluck } from "@/hooks/usePluck";

const ROOTS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

/**
 * Every preset uses seventh chords only, so every chord in it has a printed
 * chart in the book. Nothing here is a quality the book cannot voice.
 */
const PRESETS = [
  { id: "ii-v-i-c", label: "ii–V–I · C", chords: ["Dm7", "G7", "Cmaj7"] },
  { id: "ii-v-i-f", label: "ii–V–I · F", chords: ["Gm7", "C7", "Fmaj7"] },
  { id: "minor-ii-v-i", label: "Minor ii–V–I · A", chords: ["Bm7b5", "E7", "Am7"] },
  { id: "turnaround-c", label: "Turnaround · C", chords: ["Cmaj7", "Am7", "Dm7", "G7"] },
  { id: "blues-d", label: "Minor blues · D", chords: ["Dm7", "G7", "Dm7", "A7"] },
  {
    id: "giant-steps",
    label: "Giant Steps · opening",
    chords: ["Bmaj7", "D7", "Gmaj7", "Bb7", "Ebmaj7"],
  },
] as const;

const ROLE_SWATCH: Record<ChordRole, string> = {
  root: "var(--rust)",
  third: "var(--color-brass-ink)",
  fifth: "var(--ink)",
  seventh: "var(--color-sand-deep)",
  color: "var(--color-sand-deep)",
};

const FUNCTION_LABEL: Record<string, string> = {
  tonic: "Tonic",
  subdominant: "Subdominant",
  dominant: "Dominant",
  other: "Borrowed / colour",
};

const FORMULA_LABEL = (chart: BeatoChart) =>
  BEATO_CHARTS[chart].formula.replace(/♭/g, "b").replace(/♯/g, "#").replace(/𝄫/g, "bb");

function splitChords(text: string): string[] {
  return text
    .replace(/[→–—|,]/g, " ")
    .split(/\s+/)
    .map((symbol) => symbol.trim())
    .filter(Boolean);
}

function shapeNumber(voicing: Voicing): string {
  return voicing.shape
    .map((fret) => (fret < 0 ? "×" : fret === 0 ? "0" : String(fret)))
    .join(" ");
}

function toNeckNotes(voicing: Voicing): NeckNote[] {
  return voicing.positions.map((position) => ({
    string: position.string,
    fret: position.fret,
    label: position.label,
    name: position.name,
    role: position.role,
    midi: position.midi,
    active: true,
  }));
}

function midiOrder(voicing: Voicing): number[] {
  return [...voicing.positions].sort((a, b) => a.midi - b.midi).map((p) => p.midi);
}

function mutedStringsOf(voicing: Voicing): number[] {
  return voicing.shape
    .map((fret, string) => (fret < 0 ? string : -1))
    .filter((string) => string >= 0);
}

function clamp(value: number, count: number): number {
  return Math.min(Math.max(value, 0), Math.max(0, count - 1));
}

export default function FretboardLab() {
  const pluck = usePluck();

  const [view, setView] = useState<"charts" | "progression">("charts");
  const [status, setStatus] = useState(
    "Chart browser. Every shape is a printed diagram from the Beato Book.",
  );

  /* ── Chart browser ───────────────────────────────────────────────── */
  const [family, setFamily] = useState<BeatoFamily>("Drop 2");
  const [chart, setChart] = useState<BeatoChart>("Maj7");
  const [chartRoot, setChartRoot] = useState("C");
  const [stringFilter, setStringFilter] = useState("all");
  const [shapeIndex, setShapeIndex] = useState(0);

  const chartRootPc = useMemo(() => noteToPitchClass(chartRoot), [chartRoot]);

  const chartVoicings = useMemo(
    () =>
      voicingsForChart(chart, chartRootPc, {
        family,
        preferFlats: chartRoot.includes("b"),
      }),
    [chart, chartRootPc, family, chartRoot],
  );

  const setOptions = useMemo(
    () => ["all", ...beatoStringSets(chart, family)],
    [chart, family],
  );
  const activeSet = setOptions.includes(stringFilter) ? stringFilter : "all";

  const visibleShapes = useMemo(
    () =>
      activeSet === "all"
        ? chartVoicings
        : chartVoicings.filter((voicing) => voicing.book.stringSet === activeSet),
    [chartVoicings, activeSet],
  );

  const safeShapeIndex = clamp(shapeIndex, visibleShapes.length);
  const selectedShape = visibleShapes[safeShapeIndex] ?? null;

  const chartInfo = BEATO_CHARTS[chart];
  const chartSymbol = `${chartRoot}${chartInfo.suffix}`;

  /* ── Progression ─────────────────────────────────────────────────── */
  const [input, setInput] = useState("Dm7 G7 Cmaj7");
  const [submitted, setSubmitted] = useState("Dm7 G7 Cmaj7");
  const [activePreset, setActivePreset] = useState<string | null>("ii-v-i-c");
  const [keyChoice, setKeyChoice] = useState("auto");
  const [modeChoice, setModeChoice] = useState<"auto" | KeyMode>("auto");
  const [stepIndex, setStepIndex] = useState(0);
  const [selections, setSelections] = useState<Record<number, number>>({});

  const analysis = useMemo(() => {
    const symbols = splitChords(submitted);
    if (symbols.length === 0) return null;
    try {
      const options =
        keyChoice === "auto"
          ? {}
          : {
              key: keyChoice,
              mode: modeChoice === "auto" ? undefined : modeChoice,
            };
      return analyseProgression(symbols, options);
    } catch {
      return null;
    }
  }, [submitted, keyChoice, modeChoice]);

  const steps = useMemo(() => analysis?.steps ?? [], [analysis]);
  const safeStepIndex = clamp(stepIndex, steps.length);
  const step = steps[safeStepIndex] ?? null;
  const candidates = useMemo(() => step?.candidates ?? [], [step]);

  const candidateIndexFor = useCallback(
    (index: number) => {
      const entry = steps[index];
      if (!entry) return 0;
      const stored = selections[index];
      if (stored !== undefined) return clamp(stored, entry.candidates.length);
      if (!entry.voicing) return 0;
      const base = entry.candidates.findIndex(
        (candidate) => candidate.shape.join(",") === entry.voicing?.shape.join(","),
      );
      return Math.max(0, base);
    },
    [steps, selections],
  );

  const candidateIndex = candidateIndexFor(safeStepIndex);
  const voicing = candidates[candidateIndex] ?? step?.voicing ?? null;

  const previousStep = steps[safeStepIndex - 1] ?? null;
  const previousVoicing =
    previousStep?.candidates[candidateIndexFor(safeStepIndex - 1)] ??
    previousStep?.voicing ??
    null;
  const ledger: VoiceLeading | null =
    previousVoicing && voicing ? voiceLeading(previousVoicing, voicing) : null;

  const stepChord = step?.chord ?? null;
  const stepChart = stepChord?.isValid
    ? chartForQuality(stepChord.quality, stepChord.tensions ?? [])
    : null;
  const preferFlats = analysis ? keyPrefersFlats(analysis.key) : false;

  /* ── Actions ─────────────────────────────────────────────────────── */
  const applyInput = useCallback(() => {
    const next = input.trim();
    if (!next) return;
    setSubmitted(next);
    setActivePreset(null);
    setStepIndex(0);
    setSelections({});
    setStatus(`Read ${splitChords(next).join(" – ")}.`);
  }, [input]);

  const choosePreset = useCallback((preset: (typeof PRESETS)[number]) => {
    const text = preset.chords.join(" ");
    setInput(text);
    setSubmitted(text);
    setActivePreset(preset.id);
    setKeyChoice("auto");
    setModeChoice("auto");
    setStepIndex(0);
    setSelections({});
    setStatus(`${preset.label}: ${preset.chords.join(" – ")}.`);
  }, []);

  const chooseStep = useCallback(
    (index: number) => {
      setStepIndex(index);
      const next = steps[index];
      if (next) {
        setStatus(
          `${next.symbol} is ${next.roman} in ${analysis?.key ?? ""} ${
            analysis?.mode ?? ""
          }. ${next.candidates.length} printed shape${
            next.candidates.length === 1 ? "" : "s"
          }.`,
        );
      }
    },
    [steps, analysis],
  );

  const changeCandidate = useCallback(
    (direction: number) => {
      if (candidates.length === 0) return;
      const next = (candidateIndex + direction + candidates.length) % candidates.length;
      setSelections((current) => ({ ...current, [safeStepIndex]: next }));
      const chosen = candidates[next];
      setStatus(
        `Shape ${next + 1} of ${candidates.length} for ${
          step?.symbol ?? "the chord"
        }: ${chosen ? shapeNumber(chosen) : ""}.`,
      );
    },
    [candidates, candidateIndex, safeStepIndex, step?.symbol],
  );

  const toggleSound = useCallback(() => {
    void pluck.toggle();
    setStatus(
      pluck.enabled
        ? "Sound off. The atlas is silent."
        : "Sound on. Click any dot on the neck, or strum the shape.",
    );
  }, [pluck]);

  const pluckNote = useCallback(
    (note: NeckNote) => {
      if (!pluck.enabled) {
        setStatus("Turn sound on to hear the neck.");
        return;
      }
      if (typeof note.midi === "number") pluck.pluck(note.midi);
    },
    [pluck],
  );

  const changeFamily = useCallback((next: BeatoFamily) => {
    setFamily(next);
    setStringFilter("all");
    setShapeIndex(0);
    setStatus(`${next} charts.`);
  }, []);

  const changeChart = useCallback((next: BeatoChart) => {
    setChart(next);
    setStringFilter("all");
    setShapeIndex(0);
    setStatus(`${BEATO_CHARTS[next].name} charts.`);
  }, []);

  const changeChartRoot = useCallback((next: string) => {
    setChartRoot(next);
    setShapeIndex(0);
    setStatus(`Root ${next}.`);
  }, []);

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <section id="lab" className="surface-paper relative bg-paper">
      <p aria-live="polite" className="sr-only">
        {status}
      </p>

      <div className="mx-auto w-full max-w-[1560px] px-5 py-12 md:px-8 md:py-16">
        {/* Mode + sound */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--rule)] pb-6">
          <div role="group" aria-label="Atlas mode" className="flex gap-2">
            <button
              type="button"
              className="chip"
              aria-pressed={view === "charts"}
              onClick={() => {
                setView("charts");
                setStatus("Chart browser.");
              }}
            >
              Charts
            </button>
            <button
              type="button"
              className="chip"
              aria-pressed={view === "progression"}
              onClick={() => {
                setView("progression");
                setStatus("Progression reader.");
              }}
            >
              Progression
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="chip"
              aria-pressed={pluck.enabled}
              onClick={toggleSound}
              disabled={!pluck.supported}
              title={
                pluck.supported
                  ? "Synthesise a plucked string with Karplus–Strong"
                  : "Web Audio is unavailable in this browser"
              }
            >
              Sound {pluck.enabled ? "on" : "off"}
            </button>
            <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-ink/60">
              {BEATO_SHAPE_COUNT} printed shapes · 18 charts
            </span>
          </div>
        </div>

        {view === "charts" ? (
          <div className="pt-8">
            {/* Family + chart */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,300px)_1fr]">
              <div>
                <h2 className="label-rule text-rust">Family</h2>
                <div
                  role="group"
                  aria-label="Drop family"
                  className="mt-4 grid grid-cols-2 gap-2"
                >
                  {BEATO_FAMILIES.map((entry) => (
                    <button
                      key={entry}
                      type="button"
                      className="chip"
                      aria-pressed={family === entry}
                      onClick={() => changeFamily(entry)}
                    >
                      {entry}
                    </button>
                  ))}
                </div>

                <p className="mt-6 font-mono text-[8.5px] uppercase leading-relaxed tracking-[0.16em] text-ink/60">
                  {BEATO_SOURCE}
                </p>
                {family === "Drop 3" ? (
                  <p className="mt-3 font-mono text-[8px] uppercase leading-relaxed tracking-[0.14em] text-ink/60">
                    The book&apos;s Drop 3 Dimmaj7♭13 page (p. 148) repeats the
                    Maj7sus4 page (p. 144) byte for byte, so it is not duplicated
                    here.
                  </p>
                ) : null}
              </div>

              <div>
                <h2 className="label-rule text-rust">Chart</h2>
                <div
                  role="group"
                  aria-label="Chord chart type"
                  className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4"
                >
                  {BEATO_CHART_ORDER.map((entry) => (
                    <button
                      key={entry}
                      type="button"
                      className="chip flex-col items-start justify-center gap-0.5 px-3 py-2 text-left"
                      aria-pressed={chart === entry}
                      onClick={() => changeChart(entry)}
                    >
                      <span className="text-[0.8rem] leading-tight">
                        {BEATO_CHARTS[entry].label}
                      </span>
                      <span className="font-mono text-[7.5px] uppercase tracking-[0.12em] opacity-60">
                        {FORMULA_LABEL(entry)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Root + string set */}
            <div className="mt-8 grid grid-cols-1 gap-6 border-t border-[var(--rule)] pt-6 md:grid-cols-[minmax(0,1fr)_auto]">
              <div>
                <h2 className="label-rule text-rust">Root</h2>
                <div
                  role="group"
                  aria-label="Chord root"
                  className="mt-4 flex flex-wrap gap-2"
                >
                  {ROOTS.map((root) => (
                    <button
                      key={root}
                      type="button"
                      className="chip min-w-[52px] px-3"
                      aria-pressed={chartRoot === root}
                      onClick={() => changeChartRoot(root)}
                    >
                      {root}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="label-rule text-rust">String set</h2>
                <div
                  role="group"
                  aria-label="String set"
                  className="mt-4 flex flex-wrap gap-2"
                >
                  <button
                    type="button"
                    className="chip px-3"
                    aria-pressed={activeSet === "all"}
                    onClick={() => {
                      setStringFilter("all");
                      setShapeIndex(0);
                    }}
                  >
                    All
                  </button>
                  {setOptions
                    .filter((entry) => entry !== "all")
                    .map((entry) => (
                      <button
                        key={entry}
                        type="button"
                        className="chip px-3"
                        aria-pressed={activeSet === entry}
                        onClick={() => {
                          setStringFilter(entry);
                          setShapeIndex(0);
                        }}
                      >
                        {entry}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Selected shape on the neck */}
            <div className="mt-8 border border-[var(--rule)] bg-cream/45">
              <div className="flex flex-col gap-4 border-b border-[var(--rule)] px-4 py-4 md:flex-row md:items-end md:justify-between md:px-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <p className="font-display text-[1.9rem] leading-none text-ink">
                      {chartSymbol}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-rust">
                      {chartInfo.name}
                    </p>
                  </div>
                  <p className="mt-2 font-mono text-[8.5px] uppercase tracking-[0.16em] text-ink/60">
                    {selectedShape ? (
                      <>
                        {selectedShape.book.family} · column{" "}
                        <span className="normal-case">{selectedShape.book.column}</span>{" "}
                        · bass {intervalLabel(selectedShape.bassPc - chartRootPc)} ·
                        strings {selectedShape.book.stringSet} · p.{" "}
                        {selectedShape.book.page}
                      </>
                    ) : (
                      "No printed shape for this combination"
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {visibleShapes.length > 1 ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="chip px-3"
                        aria-label="Previous printed shape"
                        onClick={() =>
                          setShapeIndex(
                            (safeShapeIndex - 1 + visibleShapes.length) %
                              visibleShapes.length,
                          )
                        }
                      >
                        ←
                      </button>
                      <span className="min-w-[64px] text-center font-mono text-[9px] tabular-nums text-ink/60">
                        {safeShapeIndex + 1} / {visibleShapes.length}
                      </span>
                      <button
                        type="button"
                        className="chip px-3"
                        aria-label="Next printed shape"
                        onClick={() =>
                          setShapeIndex((safeShapeIndex + 1) % visibleShapes.length)
                        }
                      >
                        →
                      </button>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    className="chip"
                    onClick={() => {
                      if (selectedShape) pluck.strum(midiOrder(selectedShape));
                    }}
                    disabled={!pluck.enabled || !selectedShape}
                    title={
                      !selectedShape
                        ? "No printed shape to strum"
                        : pluck.enabled
                          ? "Strum the shape from the low string"
                          : "Turn sound on first"
                    }
                  >
                    Strum
                  </button>
                </div>
              </div>

              <div className="fretboard-scroll px-2 py-4 md:px-6 md:py-6">
                {selectedShape ? (
                  <NeckMap
                    lastFret={Math.max(15, selectedShape.maxFret)}
                    notes={toNeckNotes(selectedShape)}
                    mutedStrings={mutedStringsOf(selectedShape)}
                    onNoteClick={pluckNote}
                    ariaLabel={`${chartSymbol}, ${selectedShape.book.family} shape from page ${selectedShape.book.page}, printed under the ${selectedShape.book.column} column`}
                  />
                ) : (
                  <p className="max-w-xl px-4 py-10 text-sm leading-relaxed text-ink/60">
                    {family === "Drop 3" && chart === "Dimmaj7b13"
                      ? "The book's Drop 3 Dimmaj7♭13 page (p. 148) repeats the Maj7sus4 page (p. 144) byte for byte, so it is not duplicated here. Choose another family or chart."
                      : "No printed shape matches this root and string set."}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[var(--rule)] px-4 py-3 font-mono text-[8px] uppercase tracking-[0.18em] text-ink/60 md:px-6">
                <span className="font-mono text-[10px] tracking-[0.14em] text-ink">
                  {selectedShape ? shapeNumber(selectedShape) : "—"}
                </span>
                <span aria-hidden className="h-3 w-px bg-[var(--rule)]" />
                <span>{chartInfo.formula}</span>
                <span aria-hidden className="h-3 w-px bg-[var(--rule)]" />
                <span className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: ROLE_SWATCH.root }}
                  />
                  Root
                </span>
                <span>All other dots are the printed chord tones</span>
              </div>
            </div>

            {/* Shape cards */}
            <div className="mt-8">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="label-rule text-rust">
                  {family} · {BEATO_CHARTS[chart].label} · {chartRoot}
                </h2>
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-ink/60">
                  {visibleShapes.length} diagram
                  {visibleShapes.length === 1 ? "" : "s"} · p.{" "}
                  {beatoPage(chart, family)}
                </p>
              </div>

              {visibleShapes.length === 0 ? (
                <p className="mt-4 border border-[var(--rule)] bg-cream/40 px-5 py-8 text-sm leading-relaxed text-ink/60">
                  {family === "Drop 3" && chart === "Dimmaj7b13"
                    ? "The book's Drop 3 Dimmaj7♭13 page (p. 148) repeats the Maj7sus4 page (p. 144) byte for byte, so it is not counted twice. Choose another family or chart."
                    : "No printed diagram for this root and string set."}
                </p>
              ) : null}

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
                {visibleShapes.map((entry, index) => {
                  const active = index === safeShapeIndex;
                  return (
                    <button
                      key={`${entry.book.page}-${entry.book.column}-${entry.book.stringSet}-${entry.shape.join(",")}`}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setShapeIndex(index);
                        setStatus(
                          `${chartSymbol}: ${entry.book.family} shape under the ${entry.book.column} column, page ${entry.book.page}.`,
                        );
                      }}
                      className={`border p-3 text-left transition-colors ${
                        active
                          ? "border-ink bg-ink/[0.06]"
                          : "border-[var(--rule)] bg-cream/40 hover:border-ink/40"
                      }`}
                    >
                      <div className="flex items-baseline justify-between">
                        <span className="font-mono text-[8px] tracking-[0.16em] text-rust">
                          {entry.book.column}
                        </span>
                        <span className="font-mono text-[8px] tabular-nums text-ink/60">
                          p. {entry.book.page}
                        </span>
                      </div>
                      <BookShape
                        shape={entry.shape}
                        rootPc={chartRootPc}
                        showStrings
                        className="mx-auto mt-1 h-[142px] w-full"
                      />
                      <div className="mt-2 flex items-baseline justify-between border-t border-[var(--rule-soft)] pt-2">
                        <span className="font-mono text-[7.5px] uppercase tracking-[0.12em] text-ink/60">
                          {entry.book.stringSet}
                        </span>
                        <span className="font-mono text-[7.5px] uppercase tracking-[0.12em] text-ink/60">
                          frets {entry.minFret}–{entry.maxFret}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-8">
            {/* Presets + input */}
            <div className="flex flex-col gap-5">
              <div
                role="group"
                aria-label="Example progressions"
                className="flex flex-wrap gap-2"
              >
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className="chip"
                    aria-pressed={activePreset === preset.id}
                    onClick={() => choosePreset(preset)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <form
                className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-end"
                onSubmit={(event) => {
                  event.preventDefault();
                  applyInput();
                }}
              >
                <label className="block">
                  <span className="mb-2 block font-mono text-[8px] uppercase tracking-[0.22em] text-ink/60">
                    Chords · space separated
                  </span>
                  <input
                    value={input}
                    onChange={(event) => {
                      setInput(event.target.value);
                      setActivePreset(null);
                    }}
                    className="field"
                    placeholder="Dm7 G7 Cmaj7"
                    spellCheck={false}
                    autoComplete="off"
                    aria-describedby="chord-input-hint"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block font-mono text-[8px] uppercase tracking-[0.22em] text-ink/60">
                    Key
                  </span>
                  <select
                    value={keyChoice}
                    onChange={(event) => {
                      setKeyChoice(event.target.value);
                      setStepIndex(0);
                      setSelections({});
                    }}
                    className="field md:w-28"
                  >
                    <option value="auto">Auto</option>
                    {ROOTS.map((root) => (
                      <option key={root} value={root}>
                        {root}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block font-mono text-[8px] uppercase tracking-[0.22em] text-ink/60">
                    Mode
                  </span>
                  <select
                    value={modeChoice}
                    onChange={(event) => {
                      setModeChoice(event.target.value as "auto" | KeyMode);
                      setStepIndex(0);
                      setSelections({});
                    }}
                    className="field md:w-32"
                    disabled={keyChoice === "auto"}
                  >
                    <option value="auto">Inferred</option>
                    <option value="major">Major</option>
                    <option value="minor">Minor</option>
                  </select>
                </label>

                <button type="submit" className="btn btn-ink">
                  Read
                  <span aria-hidden>→</span>
                </button>
              </form>
              <p
                id="chord-input-hint"
                className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-ink/60"
              >
                Sevenths, sixths and the book&apos;s altered sevenths · slash chords
                welcome · a quality with no chart says so
              </p>
            </div>

            {analysis && step ? (
              <>
                {/* Analysis summary */}
                <div className="mt-8 flex flex-col gap-6 border-t border-[var(--rule)] pt-8 md:flex-row md:items-end md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="fret-index" data-inlay="true">
                        {String(safeStepIndex + 1).padStart(2, "0")}
                      </span>
                      <p className="eyebrow">
                        {analysis.key} {analysis.mode} · {analysis.steps.length} chord
                        {analysis.steps.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <p className="mt-4 font-display text-[2.1rem] leading-tight text-ink md:text-[2.8rem]">
                      {step.roman}
                    </p>
                  </div>

                  <dl className="grid grid-cols-3 gap-6 border-t border-[var(--rule)] pt-4 md:min-w-[380px]">
                    <div>
                      <dt className="font-mono text-[8px] uppercase tracking-[0.2em] text-ink/60">
                        Smoothness
                      </dt>
                      <dd className="mt-1.5 font-mono text-sm tabular-nums text-ink">
                        {Math.round(analysis.smoothness * 100)}%
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[8px] uppercase tracking-[0.2em] text-ink/60">
                        Mean move
                      </dt>
                      <dd className="mt-1.5 font-mono text-sm tabular-nums text-ink">
                        {analysis.averageMovement.toFixed(1)} st
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[8px] uppercase tracking-[0.2em] text-ink/60">
                        Total
                      </dt>
                      <dd className="mt-1.5 font-mono text-sm tabular-nums text-ink">
                        {analysis.totalMovement} st
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Chord rail */}
                <div
                  role="group"
                  aria-label="Chords in the progression"
                  className="mt-8 flex flex-wrap gap-2"
                >
                  {analysis.steps.map((entry, index) => (
                    <button
                      key={`${entry.symbol}-${index}`}
                      type="button"
                      className="chip"
                      aria-pressed={index === safeStepIndex}
                      onClick={() => chooseStep(index)}
                    >
                      <span className="text-[0.8rem]">{entry.symbol}</span>
                      <span className="text-[0.62rem] opacity-65">{entry.roman}</span>
                    </button>
                  ))}
                </div>

                {/* Neck panel */}
                <div className="mt-8 border border-[var(--rule)] bg-cream/45">
                  <div className="flex flex-col gap-4 border-b border-[var(--rule)] px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <p className="font-display text-[1.8rem] leading-none text-ink">
                          {step.symbol}
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-rust">
                          {step.roman}
                        </p>
                        <p className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-ink/60">
                          {FUNCTION_LABEL[step.fn] ?? step.fn}
                        </p>
                      </div>
                      <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.16em] text-ink/60">
                        {voicing ? (
                          <>
                            {voicing.book.family} · column{" "}
                            <span className="normal-case">{voicing.book.column}</span> ·
                            bass {intervalLabel(voicing.bassPc - chordRootPc(step.chord))} ·
                            strings {voicing.book.stringSet} · p. {voicing.book.page}
                          </>
                        ) : step.chord.isValid ? (
                          stepChart ? (
                            "No printed shape in this range"
                          ) : (
                            `The book prints no ${step.chord.quality} chart`
                          )
                        ) : (
                          step.chord.error ?? "Unreadable chord symbol"
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {candidates.length > 1 ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="chip px-3"
                            onClick={() => changeCandidate(-1)}
                            aria-label="Previous printed shape"
                          >
                            ←
                          </button>
                          <span className="min-w-[64px] text-center font-mono text-[9px] tabular-nums text-ink/60">
                            {candidateIndex + 1} / {candidates.length}
                          </span>
                          <button
                            type="button"
                            className="chip px-3"
                            onClick={() => changeCandidate(1)}
                            aria-label="Next printed shape"
                          >
                            →
                          </button>
                        </div>
                      ) : null}

                      <button
                        type="button"
                        className="chip"
                        onClick={() => {
                          if (voicing) pluck.strum(midiOrder(voicing));
                        }}
                        disabled={!pluck.enabled || !voicing}
                        title={
                          !voicing
                            ? "No printed shape to strum"
                            : pluck.enabled
                              ? "Strum the shape from the low string"
                              : "Turn sound on first"
                        }
                      >
                        Strum
                      </button>
                    </div>
                  </div>

                  <div className="fretboard-scroll px-2 py-4 md:px-6 md:py-6">
                    <NeckMap
                      lastFret={voicing ? Math.max(15, voicing.maxFret) : 15}
                      notes={voicing ? toNeckNotes(voicing) : []}
                      mutedStrings={voicing ? mutedStringsOf(voicing) : []}
                      onNoteClick={pluckNote}
                      ariaLabel={
                        voicing
                          ? `${step.symbol}, printed ${voicing.book.family} shape from page ${voicing.book.page}`
                          : `${step.symbol} has no printed shape`
                      }
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[var(--rule)] px-4 py-3 font-mono text-[8px] uppercase tracking-[0.18em] text-ink/60 md:px-6">
                    <span className="font-mono text-[10px] tracking-[0.14em] text-ink">
                      {voicing ? shapeNumber(voicing) : "—"}
                    </span>
                    <span aria-hidden className="h-3 w-px bg-[var(--rule)]" />
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        aria-hidden
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: ROLE_SWATCH.root }}
                      />
                      Root
                    </span>
                    <span>All other dots are the printed chord tones</span>
                  </div>
                </div>

                {/* The hand · the move · the book */}
                <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
                  <div className="lg:col-span-5">
                    <h2 className="label-rule text-rust">The hand</h2>
                    {voicing ? (
                      <ShapeTable voicing={voicing} />
                    ) : (
                      <p className="mt-4 text-sm leading-relaxed text-ink/60">
                        {step.chord.isValid && !stepChart
                          ? "The book has no four-note chart for this quality. Try a seventh chord, or one of the presets above."
                          : "No printed shape was found for this symbol."}
                      </p>
                    )}
                  </div>

                  <div className="lg:col-span-4">
                    <h2 className="label-rule text-rust">The move</h2>
                    {ledger ? (
                      <MoveTable ledger={ledger} />
                    ) : (
                      <p className="mt-4 text-sm leading-relaxed text-ink/60">
                        The opening chord has no previous shape. Select the next
                        chord to read the voice leading.
                      </p>
                    )}
                  </div>

                  <div className="lg:col-span-3">
                    <h2 className="label-rule text-rust">The book</h2>
                    <BookPlate
                      step={step}
                      chart={stepChart}
                      voicing={voicing}
                      candidates={candidates}
                      candidateIndex={candidateIndex}
                      onChoose={(index) => {
                        setSelections((current) => ({
                          ...current,
                          [safeStepIndex]: index,
                        }));
                      }}
                      preferFlats={preferFlats}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-8 border border-[var(--rule)] bg-cream/40 px-6 py-12">
                <p className="font-display text-2xl text-ink">
                  Nothing to read yet.
                </p>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/60">
                  Enter at least one chord symbol, or choose one of the
                  progressions above. Symbols such as <code>Dm7</code>,{" "}
                  <code>G7</code>, <code>Bbmaj7/D</code> and{" "}
                  <code>Bm7b5</code> have printed charts.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Small presentational pieces ───────────────────────────────────── */

function ShapeTable({ voicing }: { voicing: Voicing }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">
          Every sounding note in the shape, low string to high
        </caption>
        <thead>
          <tr className="border-y border-[var(--rule)]">
            {["String", "Fret", "Note", "Interval", "Role"].map((heading) => (
              <th
                key={heading}
                scope="col"
                className="py-2 pr-4 font-mono text-[8px] font-medium uppercase tracking-[0.18em] text-ink/60"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {voicing.positions.map((position) => (
            <tr
              key={`${position.string}-${position.fret}`}
              className="border-b border-[var(--rule-soft)]"
            >
              <td className="py-2 pr-4 font-mono text-[10px] text-ink/60">
                {6 - position.string}
              </td>
              <td className="py-2 pr-4 font-mono text-[10px] tabular-nums text-ink">
                {position.fret}
              </td>
              <td className="py-2 pr-4 font-display text-lg leading-none text-ink">
                {position.name}
              </td>
              <td className="py-2 pr-4 font-mono text-[10px] text-rust">
                {position.label}
              </td>
              <td className="py-2 pr-4 font-mono text-[9px] uppercase tracking-[0.12em] text-ink/65">
                {ROLE_NAMES[position.role]}
                {position.isBass ? " · bass" : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MoveTable({ ledger }: { ledger: VoiceLeading }) {
  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between border-b border-[var(--rule)] pb-2">
        <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-ink/60">
          {ledger.summary}
        </p>
        <p className="font-mono text-[10px] tabular-nums text-ink">
          {Math.round(ledger.score * 100)}%
        </p>
      </div>
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">
          Voice movement from the previous shape into this one
        </caption>
        <thead>
          <tr className="border-b border-[var(--rule)]">
            {["String", "From", "To", "Move"].map((heading) => (
              <th
                key={heading}
                scope="col"
                className="py-2 pr-3 font-mono text-[8px] font-medium uppercase tracking-[0.18em] text-ink/60"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ledger.moves.map((move) => (
            <tr key={move.string} className="border-b border-[var(--rule-soft)]">
              <td className="py-2 pr-3 font-mono text-[10px] text-ink/60">
                {6 - move.string}
              </td>
              <td className="py-2 pr-3 font-mono text-[10px] text-ink/70">
                {move.fromFret === null
                  ? "—"
                  : `${move.fromNote ?? ""} ${move.fromFret}`}
              </td>
              <td className="py-2 pr-3 font-mono text-[10px] text-ink">
                {move.toFret === null ? "—" : `${move.toNote ?? ""} ${move.toFret}`}
              </td>
              <td className="py-2 pr-3 font-mono text-[10px] tabular-nums">
                {move.fromFret === null || move.toFret === null ? (
                  move.fromFret === null && move.toFret === null ? (
                    <span className="text-ink/60">—</span>
                  ) : (
                    <span className="text-ink/60">
                      {move.fromFret === null ? "in" : "out"}
                    </span>
                  )
                ) : move.held ? (
                  <span className="text-ink/60">held</span>
                ) : (
                  <span className="text-rust">
                    {move.semitones > 0 ? "+" : ""}
                    {move.semitones}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 font-mono text-[8px] uppercase leading-relaxed tracking-[0.16em] text-ink/60">
        {ledger.commonTones.length} common tone
        {ledger.commonTones.length === 1 ? "" : "s"} · bass moves{" "}
        {ledger.bassMovement > 0 ? "+" : ""}
        {ledger.bassMovement} st
      </p>
    </div>
  );
}

function BookPlate({
  step,
  chart,
  voicing,
  candidates,
  candidateIndex,
  onChoose,
  preferFlats,
}: {
  step: {
    symbol: string;
    chord: { isValid: boolean; quality: string; root: string; intervals: number[] };
  };
  chart: BeatoChart | null;
  voicing: Voicing | null;
  candidates: Voicing[];
  candidateIndex: number;
  onChoose: (index: number) => void;
  preferFlats: boolean;
}) {
  if (!step.chord.isValid) {
    return (
      <p className="mt-4 text-sm leading-relaxed text-ink/60">
        This symbol could not be read as a chord.
      </p>
    );
  }

  if (!chart) {
    return (
      <div className="mt-4 border-t border-[var(--rule)] pt-4">
        <p className="font-display text-2xl leading-tight text-ink">
          No book chart
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink/60">
          Beato prints four-note drop voicings for eighteen chord types. A{" "}
          <em>{step.chord.quality}</em> chord is not one of them, and no shape is
          invented to stand in.
        </p>
      </div>
    );
  }

  const info = BEATO_CHARTS[chart];
  const rootNote = pitchClassToNote(noteToPitchClass(step.chord.root), preferFlats);

  return (
    <div className="mt-4">
      <p className="font-display text-2xl leading-tight text-ink">{info.name}</p>
      <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-rust">
        {info.formula}
      </p>

      <dl className="mt-4 divide-y divide-[var(--rule-soft)] border-y border-[var(--rule)]">
        <div className="flex items-baseline justify-between py-2">
          <dt className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink/60">
            Chart
          </dt>
          <dd className="font-mono text-[10px] text-ink">{info.label}</dd>
        </div>
        <div className="flex items-baseline justify-between py-2">
          <dt className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink/60">
            Family
          </dt>
          <dd className="font-mono text-[10px] text-ink">
            {voicing?.book.family ?? "—"}
          </dd>
        </div>
        <div className="flex items-baseline justify-between py-2">
          <dt className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink/60">
            Page
          </dt>
          <dd className="font-mono text-[10px] tabular-nums text-ink">
            {voicing?.book.page ?? info.firstPage}
          </dd>
        </div>
        <div className="flex items-baseline justify-between py-2">
          <dt className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink/60">
            Printed root
          </dt>
          <dd className="font-mono text-[10px] text-ink">
            {voicing ? pitchClassToNote(voicing.book.printedRootPc, preferFlats) : rootNote}
          </dd>
        </div>
        <div className="flex items-baseline justify-between py-2">
          <dt className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink/60">
            Shift
          </dt>
          <dd className="font-mono text-[10px] tabular-nums text-ink">
            {voicing ? `${voicing.book.shift >= 0 ? "+" : ""}${voicing.book.shift} st` : "—"}
          </dd>
        </div>
      </dl>

      <p className="mt-4 font-mono text-[8px] uppercase leading-relaxed tracking-[0.14em] text-ink/55">
        The printed shape is moved whole along the neck. Its intervals never
        change.
      </p>

      {candidates.length > 1 ? (
        <div className="mt-4">
          <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-ink/60">
            Printed shapes
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {candidates.map((candidate, index) => (
              <button
                key={`${candidate.book.page}-${candidate.book.column}-${candidate.shape.join(",")}`}
                type="button"
                className="chip min-h-0 px-2 py-1 font-mono text-[8px] tracking-[0.1em]"
                aria-pressed={index === candidateIndex}
                onClick={() => onChoose(index)}
                title={`${candidate.book.family}, page ${candidate.book.page}, ${candidate.book.column} column`}
              >
                {candidate.book.column}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
