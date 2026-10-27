import type { Metadata } from "next";
import Link from "next/link";
import FretboardLab from "@/components/fretboard/FretboardLab";
import NeckMap from "@/components/neck/NeckMap";
import type { NeckNote } from "@/components/neck/NeckMap";
import { pitchClassToNote } from "@/lib/theory/notes";
import { getBeatoShapes, stringSetLabel } from "@/lib/theory/beatoVoicings";
import { printedVoicing } from "@/lib/theory/fretboard";

export const metadata: Metadata = {
  title: "Fretboard — The Book of Forms",
  description:
    "Every drop voicing in Beato Book 4.0, Chapter 2, transcribed shape by shape. Browse all 640 printed diagrams by family, chart and root, or read a progression in the book's own shapes.",
  alternates: { canonical: "/fretboard" },
  openGraph: {
    title: "Fretboard — The Book of Forms · Medfender",
    description:
      "The Beato Book's 640 drop-voicing diagrams, read from the printed pages and drawn on a neck to true fret spacing.",
    url: "/fretboard",
  },
};

const facts = [
  { label: "Source", value: "Beato Book 4.0 · pp. 112–184" },
  { label: "Charts", value: "18 types · 4 drop families" },
  { label: "Shapes", value: "640 printed diagrams" },
  { label: "Tuning", value: "Standard · E A D G B E" },
];

const method = [
  {
    index: "01",
    title: "Read the page",
    body: "Each diagram is vector art, not a photograph, so every dot is read at its exact string and fret. The red dot is the root. Crosses above the nut are mutes. Every shape is then checked against the interval set printed at the top of its chart.",
  },
  {
    index: "02",
    title: "Move it whole",
    body: "A shape is never reshaped. To change key the whole diagram slides along the neck, so the intervals stay exactly the ones the page printed. A placement that would need an open string is discarded rather than invented.",
  },
  {
    index: "03",
    title: "Say what is missing",
    body: "Eighteen chart types are printed. A triad, a ninth, a thirteenth, or an altered dominant outside those pages returns no shape at all — not a shape that is not in the book. The book's duplicated Drop 3 page is left out rather than counted twice.",
  },
];

export default function FretboardPage() {
  const heroBook = getBeatoShapes("Maj7", "Drop 2")[0];
  const heroVoicing = printedVoicing(heroBook);
  const heroRoot = pitchClassToNote(heroBook.printedRootPc, true);

  const heroNotes: NeckNote[] = heroVoicing.positions.map((position) => ({
    string: position.string,
    fret: position.fret,
    label: position.label,
    name: position.name,
    role: position.role,
    midi: position.midi,
    active: true,
  }));

  const heroMutes = heroVoicing.shape
    .map((fret, string) => (fret < 0 ? string : -1))
    .filter((string) => string >= 0);

  const heroShape = heroVoicing.shape
    .map((fret) => (fret < 0 ? "×" : fret === 0 ? "0" : String(fret)))
    .join(" ");

  return (
    <main id="top" className="flex flex-col">
      {/* ── Masthead ─────────────────────────────────────────────────── */}
      <section className="surface-ink relative isolate overflow-hidden bg-ink-deep text-paper">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse 55% 65% at 82% 18%, rgba(223,161,74,0.16) 0%, transparent 64%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(180deg, rgba(239,232,218,0.5) 0px, rgba(239,232,218,0.5) 1px, transparent 1px, transparent 30px)",
              maskImage:
                "linear-gradient(100deg, transparent 24%, black 62%, black 92%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(100deg, transparent 24%, black 62%, black 92%, transparent 100%)",
            }}
          />
        </div>

        <div className="relative mx-auto w-full max-w-[1560px] px-5 pb-12 pt-16 md:px-8 md:pb-16 md:pt-24">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4">
              <span className="fret-index" data-inlay="true">
                00
              </span>
              <span className="eyebrow-on-ink">
                The Atlas · Book of forms
              </span>
              <span aria-hidden className="h-px w-14 bg-cream/20 md:w-24" />
            </div>

            <h1 className="display-hero mt-8 max-w-3xl text-balance text-cream">
              Every shape,
              <br />
              <em className="italic text-brass">as printed.</em>
            </h1>

            <p className="mt-7 max-w-xl text-sm leading-relaxed text-cream/70 md:text-base">
              The drop-voicing chapter of the Beato Book, transcribed shape by
              shape: four families, eighteen chart types, every printed
              inversion. Browse the diagrams by chart and root, or let a
              progression choose among them — and read the voice leading on a
              neck drawn to true fret spacing.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="#lab" className="btn btn-brass">
                Open the charts
                <span aria-hidden>↓</span>
              </Link>
              <Link href="/academy" className="btn btn-ghost">
                Study the shapes
              </Link>
            </div>
          </div>

          <div className="mt-12 border border-cream/15 bg-cream/[0.03] px-4 pb-2 pt-5 md:mt-16 md:px-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4">
              <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-cream/45">
                {heroRoot}maj7 · {heroBook.family} · column {heroBook.column} · p.{" "}
                {heroBook.page}
              </p>
              <p className="font-mono text-[10px] tracking-[0.18em] text-brass-light">
                {heroShape}
              </p>
            </div>
            <div className="fretboard-scroll">
              <NeckMap
                tone="ink"
                lastFret={12}
                notes={heroNotes}
                mutedStrings={heroMutes}
                ariaLabel={`A ${heroRoot} major seventh chord in the book's Drop 2 voicing, drawn from the nut to fret twelve`}
              />
            </div>
            <p className="border-t border-cream/12 py-3 font-mono text-[8px] uppercase tracking-[0.18em] text-cream/55">
              One printed diagram, strings {stringSetLabel(heroBook.shape)}, exactly
              as it appears on page {heroBook.page}. Frets narrow by the twelfth
              root; nothing here is an equal grid.
            </p>
          </div>

          <div className="mt-12 md:mt-16">
            <div className="string-rule mb-6 opacity-50" aria-hidden>
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="font-mono text-[8px] uppercase tracking-[0.26em] text-cream/55">
                    {fact.label}
                  </dt>
                  <dd className="mt-2 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-cream/85">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── The charts ───────────────────────────────────────────────── */}
      <FretboardLab />

      {/* ── Method ───────────────────────────────────────────────────── */}
      <section className="surface-tooth relative border-t border-[var(--rule)] py-20 md:py-28">
        <div className="mx-auto w-full max-w-[1560px] px-5 md:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-4">
                <span className="fret-index" data-inlay="true">
                  12
                </span>
                <span className="eyebrow">Method</span>
                <span aria-hidden className="h-px flex-1 bg-[var(--rule)]" />
              </div>
              <h2 className="display-lg mt-7 max-w-md text-balance text-ink">
                How the pages
                <br />
                <em className="italic text-rust">were read.</em>
              </h2>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-ink/65">
                No shape on this page was generated. Every dot, mute and fret
                number comes from the book&apos;s own diagrams; the move along
                the neck is calculated so a printed shape can be played in any
                key, and the voice-leading readings are measured from those
                printed shapes.
              </p>
              <p className="mt-6 max-w-md border-l border-[var(--rule)] pl-5 font-mono text-[9px] uppercase leading-relaxed tracking-[0.16em] text-ink/60">
                Tuning is standard. Frets are placed by the twelfth root, not by
                an equal grid. A quality with no chart gets no shape.
              </p>
            </div>

            <ol className="lg:col-span-7 lg:pt-2">
              {method.map((step) => (
                <li
                  key={step.index}
                  className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-[var(--rule)] py-7 first:border-t-0 first:pt-0 md:gap-x-10"
                >
                  <span className="font-mono text-[10px] tabular-nums tracking-[0.18em] text-rust">
                    {step.index}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl leading-tight text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/65">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Closing ──────────────────────────────────────────────────── */}
      <section className="surface-ink relative overflow-hidden bg-ink-deep py-20 text-paper md:py-28">
        <div className="relative mx-auto grid w-full max-w-[1560px] grid-cols-1 items-end gap-10 px-5 md:px-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-4">
              <span className="fret-index" data-inlay="true">
                15
              </span>
              <span className="eyebrow-on-ink">Where it goes next</span>
            </div>
            <p className="display-lg mt-7 max-w-2xl text-balance text-cream">
              A page becomes useful once
              <br />
              <em className="italic text-brass">the hand has been there.</em>
            </p>
          </div>

          <div className="lg:col-span-5 lg:pl-8">
            <p className="max-w-md text-sm leading-relaxed text-paper/60">
              The charts are here to be used, not admired. Take one shape to the
              instrument, play it slowly, then come back and read what moved. If
              you would rather learn it in the room, the academy teaches from
              the same material.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Link href="/academy" className="btn btn-brass">
                See the academy
                <span aria-hidden>→</span>
              </Link>
              <Link href="/contact#booking" className="link-rule-light">
                Ask a question
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
