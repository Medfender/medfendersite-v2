"use client";

import Link from "next/link";
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Zap, Check, Headphones, Waves } from "lucide-react";
import type { PackData, ToneModel } from "@/data/storeData";
import { useCart } from "@/lib/CartContext";
import { DemoTracklist } from "@/components/DemoTracklist";
import SpectrumVisualizer from "@/components/audio/SpectrumVisualizer";
import PageHero from "@/components/luxury/PageHero";
import SectionHeading from "@/components/luxury/SectionHeading";
import Reveal from "@/components/luxury/Reveal";

export default function ProductDetailClient({ pack }: { pack: PackData }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [activeTone, setActiveTone] = useState<ToneModel | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleToggle = useCallback(
    (id: string) => {
      const tone = pack.toneModels.find((t) => t.id === id);
      if (!tone || !audioRef.current) return;

      // Scenario A: Clicking the track that is currently loaded
      if (activeTone?.id === id) {
        if (isPlaying) {
          audioRef.current.pause(); // Just pause, keep currentTime
          setIsPlaying(false);
        } else {
          audioRef.current.play(); // Just resume from exact position
          setIsPlaying(true);
        }
        // CRITICAL: Do NOT touch currentTime. Do NOT reassign src.
        return;
      }

      // Scenario B: Clicking a completely different track
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current.src = tone.audioUrl;
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => {
          setActiveTone(tone);
          setIsPlaying(true);
        })
        .catch(() => {});
    },
    [activeTone, isPlaying, pack.toneModels],
  );

  const handleAdd = () => {
    addToCart(pack);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const videoCount = pack.videoDemos.length;

  return (
    <main className="flex flex-col">
      {/* ── Plate 01 · The pack ─────────────────────────────────────────── */}
      <PageHero
        index="06"
        eyebrow={`Preset pack · ${pack.type}`}
        title={pack.title}
        description={pack.description}
        image="/images/site/portrait-studio.webp"
        imageAlt="Medfender in the studio"
        focus="center 35%"
        size="standard"
        sideLabel={`${pack.type} · Medfender`}
        meta={[
          { label: "Platform", value: pack.type },
          { label: "Captured gear", value: String(pack.includedGear.length) },
          { label: "Tone models", value: String(pack.toneModels.length) },
          { label: "Resolution", value: "96 kHz / 24-bit" },
        ]}
      >
        <a href="#buy" className="btn btn-brass">
          Buy the pack · ${pack.price.toFixed(2)}
        </a>
        <a href="#audition" className="btn btn-ghost">
          Hear the tones
        </a>
      </PageHero>

      {/* ── Platform strip ──────────────────────────────────────────────── */}
      <div className="surface-paper w-full border-b border-[var(--rule)]">
        <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-5 px-5 py-7 md:flex-row md:items-center md:justify-between md:px-8">
          <p className="font-display text-xl leading-tight text-ink md:text-2xl">
            One purchase. All platforms. Free lifetime updates.
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 font-mono text-[9px] uppercase tracking-[0.28em] text-sand-deep">
            <span>ToneX</span>
            <span aria-hidden className="hidden h-3 w-px bg-[var(--rule)] md:block" />
            <span>HX Stomp XL</span>
            <span aria-hidden className="hidden h-3 w-px bg-[var(--rule)] md:block" />
            <span>Helix</span>
          </div>
        </div>
      </div>

      {/* ── Plate 02 · Audition (ink) ───────────────────────────────────── */}
      <section id="audition" className="surface-ink scroll-mt-20 w-full">
        <div className="mx-auto w-full max-w-[1560px] px-5 py-16 md:px-8 md:py-24">
          <SectionHeading
            tone="ink"
            index="02"
            eyebrow="Audition"
            title={
              <>
                Press play.
                <br />
                <em className="text-sand-gradient">Judge with your ears.</em>
              </>
            }
            intro="Direct captures from the amplifiers that built the pack — no post-processing, no re-amping. The analyzer follows the same signal."
            action={
              <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.26em] text-cream/45">
                <Waves className="h-4 w-4 text-brass" strokeWidth={1.5} />
                Live spectrum
              </div>
            }
          />

          <div className="mt-12 border border-[var(--rule-ink)] bg-ink-deep">
            <div className="flex items-center justify-between border-b border-[var(--rule-ink-soft)] px-5 py-3">
              <span className="font-mono text-[8.5px] uppercase tracking-[0.3em] text-cream/50">
                Studio analyzer
              </span>
              <span className="font-mono text-[8.5px] uppercase tracking-[0.26em] text-brass">
                {isPlaying ? "Signal live" : "Awaiting playback"}
              </span>
            </div>
            <div className="relative flex h-[260px] w-full items-center justify-center overflow-hidden md:h-[360px]">
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(to bottom, rgba(239,232,218,0.055) 0 1px, transparent 1px 48px), repeating-linear-gradient(to right, rgba(239,232,218,0.035) 0 1px, transparent 1px 64px)",
                }}
              />
              <div
                aria-hidden
                className="absolute inset-x-0 top-1/2 h-px bg-cream/15"
              />
              {!isPlaying ? (
                <p className="relative z-10 font-mono text-[8.5px] uppercase tracking-[0.32em] text-cream/60">
                  Press play on a tone below
                </p>
              ) : null}
              <div className="relative z-10">
                <SpectrumVisualizer isActive={isPlaying} width={1200} height={360} />
              </div>
            </div>
          </div>

          <div className="mt-12">
            <div className="flex items-baseline gap-4 border-b border-[var(--rule-ink)] pb-4">
              <span className="folio">03</span>
              <span className="eyebrow-on-ink">Demo tracks</span>
              <span aria-hidden className="h-px flex-1 bg-[var(--rule-ink-soft)]" />
              <span className="font-mono text-[8.5px] uppercase tracking-[0.26em] text-cream/45">
                {pack.toneModels.length} tones
              </span>
            </div>

            <DemoTracklist
              demo={{
                title: pack.title,
                tracks: pack.toneModels.map((tone) => ({
                  id: tone.id,
                  title: tone.name,
                  audioUrl: tone.audioUrl,
                  duration: 94,
                })),
              }}
              activeTrackId={activeTone?.id || null}
              currentTime={currentTime}
              duration={audioDuration}
              isPlaying={isPlaying}
              onTrackToggle={(id) => handleToggle(id)}
              onSeek={(trackId, time) => {
                if (audioRef.current) {
                  audioRef.current.currentTime = time;
                  setCurrentTime(time);
                }
              }}
            />
          </div>

          {/* Video proof */}
          {videoCount > 0 && (
            <div className="mt-14">
              <div className="flex items-baseline gap-4 border-b border-[var(--rule-ink)] pb-4">
                <span className="folio">04</span>
                <span className="eyebrow-on-ink">Proof of capture</span>
                <span aria-hidden className="h-px flex-1 bg-[var(--rule-ink-soft)]" />
              </div>
              <div
                className={`mt-6 grid grid-cols-1 gap-4 ${
                  videoCount === 2 ? "md:grid-cols-2" : "md:grid-cols-1"
                }`}
              >
                {pack.videoDemos.map((src, idx) => (
                  <div
                    key={idx}
                    className="aspect-video overflow-hidden border border-[var(--rule-ink-soft)] bg-black"
                  >
                    <iframe
                      src={src}
                      title={`${pack.title} Demo ${idx + 1}`}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Paper body · Specifications & purchase ──────────────────────── */}
      <section className="surface-paper w-full">
        <div className="mx-auto w-full max-w-[1560px] px-5 py-16 md:px-8 md:py-24">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
            {/* Reading column */}
            <div className="lg:col-span-7">
              {/* Specifications */}
              <article id="details" className="scroll-mt-28">
                <div className="flex items-baseline gap-4">
                  <span className="folio">05</span>
                  <span className="eyebrow">Technical specifications</span>
                  <span aria-hidden className="h-px flex-1 bg-[var(--rule)]" />
                </div>
                <h2 className="display-md mt-5 text-ink">
                  The numbers,
                  <br />
                  <em className="accent-italic">in plain print.</em>
                </h2>

                <dl className="mt-8 border-t border-[var(--rule)]">
                  {[
                    { label: "Sample rate", value: "96 kHz" },
                    { label: "Bit depth", value: "24-bit" },
                    { label: "Format", value: "WAV / MP3" },
                    { label: "Platform", value: pack.type },
                    { label: "License", value: "Royalty-free · Lifetime" },
                    { label: "File size", value: "Approx. 120 MB" },
                    { label: "Delivery", value: "Instant download" },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex items-baseline justify-between gap-6 border-b border-[var(--rule-soft)] py-4"
                    >
                      <dt className="font-mono text-[9px] uppercase tracking-[0.26em] text-sand-deep">
                        {label}
                      </dt>
                      <dd className="text-right font-display text-lg leading-none text-ink md:text-xl">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>

              {/* Rig architecture */}
              <article className="mt-16">
                <div className="flex items-baseline gap-4">
                  <span className="folio">06</span>
                  <span className="eyebrow">Rig architecture</span>
                  <span aria-hidden className="h-px flex-1 bg-[var(--rule)]" />
                </div>
                <h2 className="display-md mt-5 text-ink">
                  Two ecosystems,
                  <br />
                  <em className="accent-italic">one pack.</em>
                </h2>

                <div className="mt-8 grid grid-cols-1 gap-px bg-[var(--rule-soft)] sm:grid-cols-2">
                  <div className="bg-paper p-6 md:p-7">
                    <p className="font-mono text-[8.5px] uppercase tracking-[0.3em] text-rust">
                      Line 6
                    </p>
                    <h3 className="mt-3 font-display text-xl text-ink">
                      HX Stomp / Helix
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink/60">
                      Every Line 6 rig is meticulously gain-staged with 4 curated
                      Snapshots per preset. We leverage the full DSP architecture
                      to provide a seamlessly shifting, gig-ready ecosystem —
                      moving from crystalline cleans to soaring leads without
                      dropping a single preset.
                    </p>
                  </div>
                  <div className="bg-paper p-6 md:p-7">
                    <p className="font-mono text-[8.5px] uppercase tracking-[0.3em] text-rust">
                      IK Multimedia
                    </p>
                    <h3 className="mt-3 font-display text-xl text-ink">
                      ToneX ecosystem
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink/60">
                      Our ToneX profiles are captured at the amplifier&apos;s
                      absolute sweet spots. Each pack provides multiple discrete
                      captures across different gain tiers — from
                      edge-of-breakup to searing lead — preserving the tactile
                      response, sag, and harmonic bloom of the physical tubes.
                    </p>
                  </div>
                </div>
              </article>

              {/* Captured gear */}
              <article className="mt-16">
                <div className="flex items-baseline gap-4">
                  <span className="folio">07</span>
                  <span className="eyebrow">Captured signal chain</span>
                  <span aria-hidden className="h-px flex-1 bg-[var(--rule)]" />
                </div>
                <h2 className="display-md mt-5 text-ink">
                  What went
                  <br />
                  <em className="accent-italic">into the room.</em>
                </h2>

                <ol className="mt-8 border-t border-[var(--rule)]">
                  {pack.includedGear.map((item, i) => (
                    <Reveal key={item} delay={i * 0.03}>
                      <li className="flex items-baseline gap-5 border-b border-[var(--rule-soft)] py-4">
                        <span className="font-mono text-[9px] tracking-[0.18em] text-rust">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-1 text-sm leading-relaxed text-ink/75">
                          {item}
                        </span>
                      </li>
                    </Reveal>
                  ))}
                </ol>
                <p className="mt-6 font-mono text-[8.5px] uppercase tracking-[0.26em] text-sand-deep">
                  Captured at session level · no re-amping
                </p>
              </article>
            </div>

            {/* Purchase panel */}
            <aside
              id="buy"
              className="scroll-mt-28 lg:col-span-4 lg:col-start-9 lg:sticky lg:top-24 lg:self-start"
            >
              <div className="border border-[var(--rule)] bg-[rgba(255,253,246,0.45)]">
                <div className="flex items-center justify-between border-b border-[var(--rule)] px-6 py-4">
                  <span className="eyebrow">Purchase</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-sand-deep">
                    {pack.type}
                  </span>
                </div>

                <div className="p-6 md:p-7">
                  <p className="font-mono text-[8.5px] uppercase tracking-[0.3em] text-sand-deep">
                    One-time price
                  </p>
                  <div className="mt-4 flex items-baseline gap-3">
                    <span className="display-lg text-ink">
                      ${pack.price.toFixed(2)}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-sand-deep">
                      USD
                    </span>
                  </div>
                  <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.22em] text-ink/50">
                    Instant download · {pack.toneModels.length} tones
                  </p>

                  <AnimatePresence mode="wait">
                    <motion.button
                      key={added ? "added" : "idle"}
                      onClick={handleAdd}
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0.85 }}
                      transition={{ duration: 0.12 }}
                      className={[
                        "btn mt-7 w-full",
                        added ? "btn-copper" : "btn-solid",
                      ].join(" ")}
                    >
                      {added ? (
                        <>
                          <Check size={14} />
                          Added to cart
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={14} />
                          Add to cart
                        </>
                      )}
                    </motion.button>
                  </AnimatePresence>

                  <div className="mt-6 space-y-2.5 border-t border-[var(--rule-soft)] pt-5">
                    {[
                      { icon: Zap, text: "Instant download after checkout" },
                      { icon: Check, text: "30-day refund guarantee" },
                      { icon: Headphones, text: "Lifetime licence · free updates" },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-start gap-3">
                        <Icon
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rust"
                          strokeWidth={1.5}
                        />
                        <span className="text-xs leading-relaxed text-ink/60">
                          {text}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="mt-5 font-mono text-[8.5px] uppercase leading-relaxed tracking-[0.24em] text-sand-deep">
                    Secure checkout via Lemon Squeezy
                  </p>
                </div>
              </div>

              <div className="mt-4 border border-[var(--rule)] px-6 py-5">
                <p className="font-mono text-[8.5px] uppercase tracking-[0.3em] text-sand-deep">
                  Not sure it fits
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">
                  Write to us with your rig and we will tell you which pack
                  suits it.
                </p>
                <Link href="/contact" className="link-rule mt-4">
                  Ask first
                  <span aria-hidden>→</span>
                </Link>
              </div>

              <Link
                href="/store"
                className="link-rule mt-8 inline-flex"
              >
                <span aria-hidden>←</span>
                Back to the store
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* Hidden audio — routes to Web Audio context on play */}
      <audio
        ref={audioRef}
        preload="metadata"
        crossOrigin="anonymous"
        onTimeUpdate={() => {
          if (isPlaying && audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setAudioDuration(audioRef.current.duration || 0);
          }
        }}
        onEnded={() => {
          setCurrentTime(0);
          setIsPlaying(false);
          setActiveTone(null);
        }}
        className="hidden"
      />
    </main>
  );
}
