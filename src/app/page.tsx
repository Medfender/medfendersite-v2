import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import { packs } from "@/data/storeData";
import { parseChord } from "@/lib/theory/chords";
import { intervalLabel, solveVoicing } from "@/lib/theory/fretboard";
import Reveal from "@/components/luxury/Reveal";
import SectionHeading from "@/components/luxury/SectionHeading";
import BookingBand from "@/components/luxury/BookingBand";
import Marquee from "@/components/luxury/Marquee";
import PackCover from "@/components/store/PackCover";
import ServicesShowcase from "@/components/luxury/ServicesShowcase";
import FormationsShowcase from "@/components/luxury/FormationsShowcase";
import HeroPlate from "@/components/hero/HeroPlate";
import NeckMap from "@/components/neck/NeckMap";
import type { NeckNote } from "@/components/neck/NeckMap";

export const metadata: Metadata = {
  title: "Medfender — Guitarist, Composer & Live Act · Marrakech",
  description: site.description,
  alternates: { canonical: "/" },
};

const pillars = [
  {
    number: "I",
    title: "Gnawa rhythm",
    body: "The qarqaba pulse and the guembri's loop, translated to strings. Hypnotic, cyclical and patient — the oldest layer of the sound.",
    position: "5",
  },
  {
    number: "II",
    title: "Texas blues",
    body: "Bold attack, glassy cleans, a midrange that bites. The roadhouse language: honest, overdriven, and never rushed.",
    position: "7",
  },
  {
    number: "III",
    title: "Cinematic rock",
    body: "Long reverb tails, wide dynamics and space between the notes. Music that behaves like a score for the room it is in.",
    position: "9",
  },
];

const frames = [
  { src: "/images/site/thumb/IMG_7746.webp", title: "So Lounge — stage left", tag: "Live" },
  { src: "/images/site/thumb/IMG_7748.webp", title: "Low angle, second set", tag: "Live" },
  { src: "/images/site/thumb/Me-Guitar-3.webp", title: "Portrait with the Strat", tag: "Studio" },
  { src: "/images/site/thumb/IMG_7747.webp", title: "Pedalboard, after soundcheck", tag: "Gear" },
];

const featuredSlugs = [
  "gnawa-blues-deluxe",
  "srv-ultimate-amp-capture-pack",
  "the-synth-board-hx-stomp-exclusive",
];

const atlasChord = parseChord("Cmaj7");
const atlasShape = solveVoicing(atlasChord, { maxFret: 12 });
const atlasNotes: NeckNote[] =
  atlasShape?.positions.map((position) => ({
    string: position.string,
    fret: position.fret,
    label: intervalLabel(position.interval),
    name: position.name,
    role: position.role,
    active: true,
  })) ?? [];

export default function HomePage() {
  const featured = featuredSlugs
    .map((slug) => packs.find((pack) => pack.slug === slug))
    .filter((pack): pack is (typeof packs)[number] => Boolean(pack));

  return (
    <main id="top" className="flex flex-col">
      {/* ── Fret 0 · The room ────────────────────────────────────────── */}
      <section className="surface-ink relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-ink-deep">
        <HeroPlate
          src="/images/site/hero-stage.webp"
          alt="Medfender performing with the band at So Lounge, Marrakech"
        />

        {/* Navbar legibility at the top, type legibility at the base */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(11,11,10,0.62) 0%, rgba(11,11,10,0.04) 26%, rgba(11,11,10,0.10) 46%, rgba(11,11,10,0.62) 76%, rgba(11,11,10,0.94) 100%)",
          }}
        />
        {/* The band emerges from the room; the type sits in it. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(94deg, rgba(11,11,10,0.72) 0%, rgba(11,11,10,0.26) 34%, rgba(11,11,10,0) 62%, rgba(11,11,10,0.22) 100%)",
          }}
        />

        {/* Vertical folio */}
        <p
          aria-hidden
          className="absolute right-6 top-1/2 hidden -translate-y-1/2 rotate-90 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.36em] text-cream/60 lg:block"
        >
          The instrument · Marrakech
        </p>

        <div className="relative z-10 mx-auto w-full max-w-[1560px] px-5 pb-10 pt-40 md:px-8 md:pb-12">
          <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-4">
                <span className="fret-index" data-inlay="false">
                  0
                </span>
                <span className="eyebrow-on-ink">
                  Live band · Composer · Marrakech
                </span>
                <span aria-hidden className="h-px w-16 bg-cream/25 md:w-28" />
              </div>

              <h1 className="display-hero mt-8 text-cream">
                Gnawa soul.
                <br />
                <em className="italic text-brass">Electric blues.</em>
              </h1>

              <p className="mt-8 max-w-xl text-sm leading-relaxed text-cream/70 md:text-base">
                A band built for the room — from an intimate trio to fifteen
                musicians with Gnaoua and brass sections. Private dinners, hotel
                residencies, weddings and festivals across Morocco and abroad.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                <Link href="/contact#booking" className="btn btn-brass">
                  Request availability
                  <span aria-hidden>→</span>
                </Link>
                <Link href="/audio" className="link-rule-light">
                  Hear the room
                  <span aria-hidden>↗</span>
                </Link>
                <Link href="/fretboard" className="link-rule-light">
                  Play the atlas
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 lg:pb-2">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-cream/20 pt-6">
                {[
                  { k: "Instrument", v: "Guitar · Composition" },
                  { k: "Roster", v: "Trio → 15 players" },
                  { k: "Territory", v: "Morocco & abroad" },
                  { k: "Reply", v: "Within 48 hours" },
                ].map((item) => (
                  <div key={item.k}>
                    <dt className="font-mono text-[9px] uppercase tracking-[0.26em] text-cream/60">
                      {item.k}
                    </dt>
                    <dd className="mt-2 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-cream/85">
                      {item.v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ── The signature: the instrument, drawn ─────────────────────── */}
      <section className="surface-paper relative border-b border-[var(--rule)] bg-paper py-16 md:py-24">
        <div className="mx-auto w-full max-w-[1560px] px-5 md:px-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <Reveal className="max-w-2xl">
              <div className="mb-5 flex items-center gap-4">
                <span className="fret-index" data-inlay="true">
                  12
                </span>
                <span className="eyebrow">The instrument, drawn</span>
                <span aria-hidden className="h-px w-16 bg-[var(--rule)] md:w-24" />
              </div>
              <h2 className="display-lg text-ink text-balance">
                Every note is a position.
                <br />
                <em className="italic text-rust">Every position is a choice.</em>
              </h2>
              <p className="mt-6 max-w-xl text-sm leading-relaxed text-ink/65 md:text-base">
                The fretboard on this site is not a picture of a guitar. It is
                the guitar&apos;s actual geometry — fret wires placed by the
                two-to-the-twelfth law, strings gauged low to high, inlays where
                the maker puts them. The shapes come from the Beato Book&apos;s
                printed drop voicings, moved along the neck and judged by how
                little the hand has to move.
              </p>
            </Reveal>

            <Reveal delay={0.1} className="shrink-0">
              <Link href="/fretboard" className="btn btn-ink">
                Open the atlas
                <span aria-hidden>→</span>
              </Link>
            </Reveal>
          </div>

          <Reveal delay={0.14}>
            <div className="mt-12 border border-[var(--rule)] bg-cream px-2 py-6 md:px-6">
              <NeckMap
                lastFret={12}
                notes={atlasNotes}
                tone="paper"
                ariaLabel="The C major seventh chord drawn on a twelve-fret guitar neck in standard tuning"
              />
            </div>
          </Reveal>

          <div className="mt-4 flex flex-col gap-2 font-mono text-[8.5px] uppercase tracking-[0.22em] text-ink/60 sm:flex-row sm:items-center sm:justify-between">
            <p>Standard tuning · 25.5″ scale</p>
            <p>
              <span aria-hidden className="mr-2 inline-block h-2 w-2 bg-rust align-middle" />
              Root · third · fifth · seventh
            </p>
          </div>
        </div>
      </section>

      <Marquee />

      {/* ── Fret 3 · The player ─────────────────────────────────────── */}
      <section className="surface-paper relative bg-paper py-20 md:py-32">
        <div className="mx-auto w-full max-w-[1560px] px-5 md:px-8">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <figure>
                <div className="plate aspect-[4/5] w-full">
                  <Image
                    src="/images/site/portrait-studio.webp"
                    alt="Medfender in the studio with his Stratocaster"
                    width={1200}
                    height={1500}
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="h-full w-full object-cover object-[55%_center]"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent"
                  />
                </div>
                <figcaption className="mt-3 flex items-center justify-between border-t border-[var(--rule)] pt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-ink/60">
                  <span>The studio · Marrakech</span>
                  <span>Fig. 02</span>
                </figcaption>
              </figure>
            </Reveal>

            <div className="lg:col-span-6 lg:col-start-7 lg:pt-6">
              <Reveal>
                <div className="mb-7 flex items-center gap-4">
                  <span className="fret-index" data-inlay="true">
                    3
                  </span>
                  <span className="eyebrow">The player</span>
                  <span aria-hidden className="h-px flex-1 bg-[var(--rule)]" />
                </div>
                <h2 className="display-xl text-ink text-balance">
                  A hand-trained ear.
                  <br />
                  <em className="italic text-rust">A room-trained instinct.</em>
                </h2>
              </Reveal>

              <Reveal delay={0.1}>
                <p className="mt-8 text-base leading-relaxed text-ink/75 first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-[3.4rem] first-letter:leading-[0.82] first-letter:text-ink md:text-[1.05rem]">
                  Medfender is the working name of a Marrakech guitarist and
                  composer who has spent his life between two vocabularies: the
                  looping, hypnotic pulse of Gnawa and the crying, overdriven
                  honesty of Texas blues.
                </p>
                <p className="mt-5 text-sm leading-relaxed text-ink/65 md:text-base">
                  On stage the many become one language — cinematic, unhurried,
                  built around the room rather than the set list. From an
                  intimate trio to fifteen musicians with Gnaoua and brass, the
                  formation follows the night.
                </p>
              </Reveal>

              <Reveal delay={0.18}>
                <div className="mt-10 border-t border-[var(--rule)] pt-7">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="mb-2 font-mono text-[8.5px] uppercase tracking-[0.26em] text-ink/60">
                        Signature
                      </p>
                      <p className="wordmark text-2xl text-ink">Medfender</p>
                    </div>
                    <p className="font-mono text-[9px] uppercase leading-relaxed tracking-[0.2em] text-ink/60 sm:text-right">
                      Guitar · Composer
                      <br />
                      Marrakech, Morocco
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── Fret 5 · The sound ──────────────────────────────────────── */}
      <section className="surface-ink relative overflow-hidden bg-ink-deep py-20 md:py-32">
        <div className="relative mx-auto w-full max-w-[1560px] px-5 md:px-8">
          <SectionHeading
            index="5"
            inlay
            tone="ink"
            eyebrow="The sound"
            title={
              <>
                Three rivers,
                <br />
                <em className="italic text-brass">one current.</em>
              </>
            }
            intro="Moroccan rhythm, American blues and filmic rock are not a fusion project here. They are one guitarist's accent."
            action={
              <Link href="/audio" className="link-rule-light">
                Listen to the library
                <span aria-hidden>→</span>
              </Link>
            }
          />

          <div className="mt-16 grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-3">
            {pillars.map((pillar, i) => (
              <Reveal key={pillar.title} delay={i * 0.09}>
                <div className="border-t border-cream/20 pt-6">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[10px] tracking-[0.2em] text-brass">
                      {pillar.number}
                    </span>
                    <span className="font-mono text-[9px] tracking-[0.16em] text-cream/55">
                      pos. {pillar.position}
                    </span>
                  </div>
                  <h3 className="mt-8 font-display text-[2rem] leading-tight text-cream">
                    {pillar.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-cream/60">
                    {pillar.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <div className="mt-16 border-t border-cream/15 pt-6">
              <div className="string-rule mb-5 opacity-40" aria-hidden>
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
              <p className="font-mono text-[9px] uppercase leading-relaxed tracking-[0.22em] text-cream/60">
                Stratocaster · hand-wired valve amp · a pedalboard that has
                earned every mark
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <FormationsShowcase />
      <ServicesShowcase />

      {/* ── Fret 12 · Tone library ─────────────────────────────────── */}
      <section className="surface-paper border-b border-[var(--rule)] bg-paper py-20 md:py-28">
        <div className="mx-auto w-full max-w-[1560px] px-5 md:px-8">
          <SectionHeading
            index="12"
            inlay
            eyebrow="Tone library"
            title={
              <>
                The rig,
                <br />
                <em className="italic text-rust">captured.</em>
              </>
            }
            intro="For players: the same chains heard on stage, profiled for TONEX and HX Stomp. Each pack is built from a real amplifier, a real cabinet and a real room."
            action={
              <Link href="/store" className="link-rule">
                All {packs.length} packs
                <span aria-hidden>→</span>
              </Link>
            }
          />

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {featured.map((pack, i) => (
              <Reveal key={pack.id} delay={i * 0.08}>
                <Link
                  href={`/store/${pack.slug}`}
                  className="group flex h-full flex-col"
                >
                  <PackCover title={pack.title} badge={pack.badge} index={i} />
                  <div className="flex flex-1 flex-col border-t border-[var(--rule)] pt-4">
                    <p className="font-mono text-[8.5px] uppercase tracking-[0.22em] text-rust">
                      {pack.type} · Digital pack
                    </p>
                    <h3 className="mt-3 font-display text-2xl leading-snug text-ink transition-colors group-hover:text-rust">
                      {pack.title}
                    </h3>
                    <div className="mt-auto flex items-center justify-between pt-6">
                      <span className="font-mono text-sm text-ink">
                        ${pack.price.toFixed(2)}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink/60 transition-colors group-hover:text-rust">
                        Explore rig →
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fret 15 · Pull quote ────────────────────────────────────── */}
      <section className="surface-ink relative isolate flex min-h-[64svh] items-center overflow-hidden bg-ink-deep">
        <Image
          src="/images/site/full/So-Lounge.webp"
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="grade-print object-cover opacity-70"
        />
        <div aria-hidden className="absolute inset-0 bg-ink-deep/50" />

        <div className="relative mx-auto w-full max-w-4xl px-6 py-24 text-center">
          <Reveal>
            <div className="mb-8 flex items-center justify-center gap-4">
              <span className="fret-index" data-inlay="true">
                15
              </span>
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-cream/60">
                From the bandstand
              </p>
            </div>
            <blockquote className="display-lg text-cream text-balance">
              The room decides the set list.
              <br />
              <em className="italic text-brass">
                The guitar just has to listen.
              </em>
            </blockquote>
            <p className="mt-9 font-mono text-[9px] uppercase tracking-[0.28em] text-cream/60">
              Medfender · So Lounge, Marrakech
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Fret 17 · Frames ────────────────────────────────────────── */}
      <section className="surface-paper bg-paper py-20 md:py-28">
        <div className="mx-auto w-full max-w-[1560px] px-5 md:px-8">
          <SectionHeading
            index="17"
            inlay
            eyebrow="In the room"
            title={
              <>
                Frames from
                <br />
                <em className="italic text-rust">the last few nights.</em>
              </>
            }
            action={
              <Link href="/media" className="link-rule">
                All media
                <span aria-hidden>→</span>
              </Link>
            }
          />

          <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {frames.map((frame, i) => (
              <Reveal key={frame.src} delay={i * 0.06}>
                <Link href="/media" className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden border border-[var(--rule)] bg-paper-dim">
                    <Image
                      src={frame.src}
                      alt={frame.title}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="grade-print object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-100"
                    />
                    <span className="absolute left-3 top-3 font-mono text-[9px] uppercase tracking-[0.22em] text-cream/80">
                      {frame.tag}
                    </span>
                    <p className="absolute inset-x-3 bottom-3 font-mono text-[8.5px] uppercase leading-relaxed tracking-[0.18em] text-cream/90">
                      {frame.title}
                    </p>
                  </div>
                  <p className="mt-3 flex items-center justify-between border-t border-[var(--rule)] pt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-ink/60">
                    <span>Fig. {String(i + 1).padStart(2, "0")}</span>
                    <span className="transition-colors group-hover:text-rust">
                      View ↗
                    </span>
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fret 19 · Listening room ───────────────────────────────── */}
      <section className="surface-ink relative overflow-hidden border-y border-cream/12 bg-ink-deep py-20 md:py-28">
        <div className="mx-auto grid w-full max-w-[1560px] grid-cols-1 items-center gap-12 px-5 md:px-8 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <div className="relative mx-auto aspect-square w-full max-w-[420px]">
              {/* Disc */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, #171716 0%, #0c0c0b 58%, #141413 100%)",
                  boxShadow:
                    "0 50px 90px -40px rgba(0,0,0,0.9), 0 0 0 1px rgba(251,250,247,0.08)",
                }}
              >
                <div
                  className="absolute inset-[6%] rounded-full"
                  style={{
                    backgroundImage:
                      "repeating-radial-gradient(circle at 50% 50%, rgba(239,232,218,0.075) 0px, rgba(239,232,218,0.075) 1px, transparent 1px, transparent 5px)",
                  }}
                />
                <div
                  className="absolute inset-[6%] rounded-full"
                  style={{
                    backgroundImage:
                      "repeating-radial-gradient(circle at 50% 50%, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.5) 1px, transparent 1px, transparent 11px)",
                  }}
                />
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    backgroundImage:
                      "conic-gradient(from 205deg at 50% 50%, transparent 0deg, rgba(247,242,231,0.16) 28deg, transparent 70deg, transparent 200deg, rgba(247,242,231,0.09) 240deg, transparent 285deg)",
                  }}
                />

                <div className="absolute inset-[34%] rounded-full border border-[#8e7449]/40 bg-gradient-to-br from-[#e0c395] to-[#b3905c] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-4 text-center">
                    <span className="font-mono text-[6.5px] uppercase tracking-[0.24em] text-[#3b2c14]">
                      Side A
                    </span>
                    <span className="font-display text-[clamp(1rem,3.2vw,1.6rem)] leading-none text-[#241706]">
                      Medfender
                    </span>
                    <span className="font-mono text-[6px] uppercase tracking-[0.2em] text-[#3b2c14]/80">
                      33⅓ rpm · Marrakech
                    </span>
                  </div>
                  <div className="absolute left-1/2 top-1/2 h-[7%] w-[7%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink-deep" />
                </div>
              </div>
            </div>
          </Reveal>

          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal>
              <div className="mb-7 flex items-center gap-4">
                <span className="fret-index" data-inlay="true">
                  19
                </span>
                <span className="eyebrow-on-ink">The listening room</span>
                <span aria-hidden className="h-px flex-1 bg-cream/15" />
              </div>
              <h2 className="display-xl text-cream text-balance">
                The set list,
                <br />
                <em className="italic text-brass">on vinyl.</em>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-7 max-w-md text-sm leading-relaxed text-cream/60 md:text-base">
                A working turntable, a curated playlist, spectral analysis and
                full transport — built into the site for players who want to
                hear the details, not just read about them.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="mt-9 flex flex-wrap items-center gap-6">
                <Link href="/audio" className="btn btn-brass">
                  Open the listening room
                  <span aria-hidden>→</span>
                </Link>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-cream/55">
                  Turntable · Playlist · Spectrum
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <BookingBand tone="paper" />
    </main>
  );
}
