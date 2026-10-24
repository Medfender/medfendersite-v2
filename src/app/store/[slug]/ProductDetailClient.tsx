"use client";

import Link from "next/link";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Pause,
  Headphones,
  ShoppingCart,
  Zap,
  Check,
  Waves,
} from "lucide-react";
import type { PackData, ToneModel } from "@/data/storeData";
import { useCart } from "@/lib/CartContext";
import { DemoTracklist } from "@/components/DemoTracklist";
import SpectrumVisualizer from "@/components/audio/SpectrumVisualizer";

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PRODUCT DETAIL CLIENT — rebuilt from scratch
// ═══════════════════════════════════════════════════════════════════════════════
export default function ProductDetailClient({ pack }: { pack: PackData }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [activeTone, setActiveTone] = useState<ToneModel | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleToggle = useCallback(
    (id: string) => {
      const tone = pack.toneModels.find((t) => t.id === id);
      if (!tone || !audioRef.current) return;

      // Scenario A: Clicking the track that is currently loaded
      if (activeTone?.id === id) {
        if (isPlaying) {
          audioRef.current.pause();  // Just pause, keep currentTime
          setIsPlaying(false);
        } else {
          audioRef.current.play();   // Just resume from exact position
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
      audioRef.current.play().then(() => {
        setActiveTone(tone);
        setIsPlaying(true);
      }).catch(() => {});
    },
    [activeTone, isPlaying, pack.toneModels]
  );

  const handleAdd = () => {
    addToCart(pack);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  // Determine video layout
  const videoCount = pack.videoDemos.length;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-cyan-500/30">
      {/* ═══════════════════════════════════════════════════════════════════════
          PHASE 1 — CINEMATIC HERO (min-h-[60vh])
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full min-h-[60vh] md:min-h-[70vh] flex flex-col justify-end overflow-hidden bg-neutral-950">
        {/* Background image — studio / moody placeholder */}
        <img
          src="/images/hero-studio.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
          }}
        />
        {/* Gradient overlay — heavy bottom-weight for text pop */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent pointer-events-none" />
        {/* Extra top-vignette for cinematic feel */}
        <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-zinc-950/60 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 w-full pb-16 pt-32 md:pt-48">
          {/* Artist / Craft badge */}
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900/80 border border-zinc-700/60 backdrop-blur-sm rounded-none">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00d8f6] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300">Crafted by Medfender</span>
          </div>

          {/* Title — refined premium scale */}
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.05] drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)] max-w-4xl">
            {pack.title}
          </h1>

          {/* Description — readable, constrained */}
          <p className="mt-6 md:mt-8 text-base md:text-xl text-zinc-300 font-medium leading-relaxed max-w-3xl tracking-normal">
            {pack.description}
          </p>

          {/* Sub-meta row */}
          <div className="mt-8 flex flex-wrap items-center gap-6 text-[11px] font-mono uppercase tracking-[0.25em] text-zinc-300">
            <span className="text-cyan-300 font-extrabold">{pack.type}</span>
            <span className="w-px h-3 bg-zinc-700" />
            <span>{pack.includedGear.length} Captured Gear</span>
            <span className="w-px h-3 bg-zinc-700" />
            <span>{pack.toneModels.length} Tone Models</span>
            <span className="w-px h-3 bg-zinc-700" />
            <span>96kHz / 24-bit</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          UNIVERSAL ECOSYSTEM BANNER
         ═══════════════════════════════════════════════════════════════════════ */}
      <div className="w-full bg-zinc-900 border-y border-zinc-800 py-5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col items-center gap-4">
          <p className="text-xl md:text-2xl font-bold text-white text-center tracking-tight">
            One Purchase. All Platforms. Free Lifetime Updates.
          </p>
          <p className="text-lg md:text-xl font-medium text-zinc-200 tracking-widest mt-2">ToneX &bull; HX Stomp XL &bull; Helix</p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          PHASE 2 — STUDIO ANALYZER (Hero Spectrum Visualizer, full-width)
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden bg-neutral-950 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="flex items-center gap-3 mb-6">
            <Waves size={18} className="text-cyan-400" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300">Studio Analyzer</h2>
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-[10px] font-mono text-zinc-600 tracking-wider">Real-time spectrum — press Play to activate</span>
          </div>
          <div className="relative w-full h-[320px] md:h-[420px] rounded-none overflow-hidden border border-zinc-800 shadow-[0_0_40px_rgba(0,216,246,0.08)] bg-gradient-to-b from-neutral-950 to-black flex items-center justify-center">
            <SpectrumVisualizer isActive={isPlaying} width={900} height={400} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          PHASE 3 — CONTENT ARCHITECTURE (Grid)
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* ─── LEFT COLUMN (lg:col-span-8) ───────────────────────────── */}
          <div className="lg:col-span-8 space-y-16">

            {/* Demo Tracklist */}
            <article>
              <header className="flex items-center gap-4 mb-10">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-300 shrink-0">Demo Tracks</h2>
                <div className="h-px flex-1 bg-zinc-800" />
                <span className="text-[10px] font-mono text-zinc-300 tracking-wider">Preview pack tones</span>
              </header>

              <DemoTracklist
                demo={{
                  title: pack.title,
                  tracks: pack.toneModels.map((tone) => ({
                    id: tone.id,
                    title: tone.name,
                    audioUrl: tone.audioUrl,
                    duration: 94
                  }))
                }}
                activeTrackId={activeTone?.id || null}
                currentTime={currentTime}
                duration={audioRef.current ? audioRef.current.duration || 0 : 0}
                isPlaying={isPlaying}
                onTrackToggle={(id) => handleToggle(id)}
                onSeek={(trackId, time) => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = time;
                    setCurrentTime(time);
                  }
                }}
              />
            </article>

            {/* Video Demonstrations — secondary proof */}
            {videoCount > 0 && (
              <article>
                <header className="flex items-center gap-4 mb-8">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-300 shrink-0">Proof of Capture</h2>
                  <div className="h-px flex-1 bg-zinc-800" />
                </header>
                <div className={`grid grid-cols-1 ${videoCount === 2 ? "md:grid-cols-2" : "md:grid-cols-1"} gap-4`}>
                  {pack.videoDemos.map((src, idx) => (
                    <div key={idx} className="aspect-video border border-zinc-800 bg-black shadow-md overflow-hidden group">
                      <iframe
                        src={src}
                        title={`${pack.title} Demo ${idx + 1}`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ))}
                </div>
              </article>
            )}

            {/* Technical Specs — minimalist table */}
            <article id="details">
              <header className="flex items-center gap-4 mb-8">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-300 shrink-0">Technical Specifications</h2>
                <div className="h-px flex-1 bg-zinc-800" />
              </header>
              <div className="border-t border-zinc-800">
                {[
                  { label: "Sample Rate", value: "96 kHz" },
                  { label: "Bit Depth", value: "24-bit" },
                  { label: "Format", value: "WAV / MP3" },
                  { label: "Platform", value: pack.type },
                  { label: "License", value: "Royalty-free · Lifetime" },
                  { label: "File Size", value: "Approx. 120 MB" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-4 border-b border-zinc-800/70 hover:bg-zinc-950/30 transition-colors px-2 -mx-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-300">{label}</span>
                    <span className="text-sm font-extrabold text-white">{value}</span>
                  </div>
                ))}
              </div>
            </article>

            {/* Rig Architecture */}
            <article>
              <h3 className="text-2xl font-bold text-white mb-6 tracking-tight uppercase">
                Rig Architecture
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900 border border-zinc-800 p-6">
                  <h4 className="text-cyan-400 font-mono text-sm tracking-widest uppercase mb-3">
                    HX Stomp / Helix
                  </h4>
                  <p className="text-zinc-300 leading-relaxed text-sm">
                    Every Line 6 rig is meticulously gain-staged with 4 curated Snapshots per preset. We leverage the full DSP architecture to provide a seamlessly shifting, gig-ready ecosystem—moving from crystalline cleans to soaring leads without dropping a single preset.
                  </p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-6">
                  <h4 className="text-cyan-400 font-mono text-sm tracking-widest uppercase mb-3">
                    ToneX Ecosystem
                  </h4>
                  <p className="text-zinc-300 leading-relaxed text-sm">
                    Our ToneX profiles are captured at the amplifier&apos;s absolute sweet spots. Each pack provides multiple discrete captures across different gain tiers—from edge-of-breakup to searing lead—perfectly preserving the tactile response, sag, and harmonic bloom of the physical tubes.
                  </p>
                </div>
              </div>
            </article>

            {/* Captured Gear — signal chain */}
            <article>
              <header className="flex items-center gap-4 mb-6">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-300 shrink-0">Captured Signal Chain</h2>
                <div className="h-px flex-1 bg-zinc-800" />
              </header>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pack.includedGear.map((item) => (
                  <div key={item} className="flex items-center gap-3 px-4 py-3 bg-neutral-950 border border-zinc-800 hover:border-cyan-800/40 transition-colors group">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_6px_rgba(0,216,246,0.6)] shrink-0 group-hover:shadow-[0_0_10px_rgba(0,216,246,0.9)] transition-shadow" />
                    <span className="text-sm font-mono font-medium text-zinc-200 tracking-wide">{item}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>

          {/* ─── RIGHT COLUMN (lg:col-span-4) — Sticky Conversion Console ── */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
            <div className="bg-zinc-900 border-2 border-zinc-800 shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden rounded-none">
              {/* Top accent strip */}
              <div className="h-1 bg-gradient-to-r from-cyan-400 via-cyan-200 to-cyan-700" />

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b-2 border-zinc-800 bg-black/60">
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300">Buy This Pack</span>
                <span className="text-cyan-400 font-mono text-sm tracking-widest font-bold">{pack.id.toUpperCase()}</span>
              </div>

              <div className="p-8 space-y-6">
                {/* Price */}
                <div>
                  <div className="text-cyan-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">One-Time Price</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">${pack.price.toFixed(2)}</span>
                    <span className="text-xs font-mono text-zinc-500 tracking-widest uppercase">USD</span>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-300 mt-2 tracking-wider">Instant digital download · {pack.toneModels.length} tones</div>
                </div>

                {/* Trust row */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: <Zap size={12} />, label: "Instant" },
                    { icon: <Check size={12} />, label: "Verified" },
                    { icon: <Headphones size={12} />, label: "96kHz" },
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex flex-col items-center gap-1.5 py-3 border border-zinc-800 bg-black/40 rounded-none">
                      <span className="text-cyan-400">{icon}</span>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-300">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Massive CTA */}
                <AnimatePresence mode="wait">
                  <motion.button
                    key={added ? "added" : "idle"}
                    onClick={handleAdd}
                    initial={{ opacity: 1, scale: 1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0.8, scale: 0.99 }}
                    transition={{ duration: 0.12 }}
                    className={[
                      "w-full flex flex-row items-center justify-center gap-3 py-4 bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-black uppercase tracking-[0.2em] rounded-sm transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] active:scale-[0.98] cursor-pointer select-none",
                      added
                        ? "!bg-emerald-500 !text-white shadow-[inset_0_0_30px_rgba(16,185,129,0.3)]"
                        : "",
                    ].join(" ")}
                  >
                    {added ? (
                      <span className="text-sm font-black uppercase tracking-[0.2em]">Added ✓</span>
                    ) : (
                      <>
                        <ShoppingCart size={16} />
                        <span className="text-sm font-black uppercase tracking-[0.2em] leading-none">Add to Cart</span>
                        <span className="text-[10px] font-mono tracking-widest opacity-70">· ${pack.price.toFixed(2)}</span>
                      </>
                    )}
                  </motion.button>
                </AnimatePresence>

                <p className="text-center text-[10px] font-mono uppercase tracking-widest text-zinc-500 leading-relaxed">
                  Secure checkout via Lemon Squeezy
                  <br />
                  30-day refund guarantee · Lifetime license
                </p>
              </div>
            </div>
          </aside>
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
            // Fail-safe: capture duration from active audio if missing
            const currentDuration = audioRef.current?.duration;
            if (currentDuration && Number.isFinite(currentDuration) && currentDuration > 0) {
              const activeId = activeTone?.id;
              if (activeId) {
                setDurations?.((prev: any) => ({ ...prev, [activeId]: currentDuration }));
              }
            }
          }
        }}
        onLoadedMetadata={(e) => {
          const realDuration = e.currentTarget.duration;
          if (realDuration && Number.isFinite(realDuration) && realDuration > 0) {
            const activeId = activeTone?.id;
            if (activeId) {
              setDurations((prev) => ({ ...prev, [activeId]: realDuration }));
            }
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
