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

// ═══════════════════════════════════════════════════════════════════════════════
// STUDIO ANALYZER — Web Audio API Canvas Spectrum
// ═══════════════════════════════════════════════════════════════════════════════
function StudioVisualizer({ active, audioRef }: { active: boolean; audioRef: React.RefObject<HTMLAudioElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const dataRef = useRef<Uint8Array<ArrayBuffer>>(new Uint8Array(new ArrayBuffer(512)));

  // Initialize AudioContext + Analyser once (only on user interaction / play)
  const initAudioGraph = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!audioRef.current) return;
    try {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!ctxRef.current) {
        ctxRef.current = new AC();
      }
      const ctx = ctxRef.current!;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      if (!analyserRef.current) {
        analyserRef.current = ctx.createAnalyser();
        analyserRef.current.fftSize = 1024;
      }
      if (!sourceRef.current) {
        sourceRef.current = ctx.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(ctx.destination);
      }
    } catch (e) {
      // Silent fail — browser may throttle audio context
    }
  }, [audioRef]);

  // Draw loop
  useEffect(() => {
    if (!active) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    // Init graph when playing starts
    initAudioGraph();

    const draw = () => {
      if (!canvas || !ctx || !analyserRef.current) return;
      const canvasCtx = ctx;

      animRef.current = requestAnimationFrame(draw);

      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Get frequency data
      analyserRef.current.getByteFrequencyData(dataArray);

      // Clear previous frame
      canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

      // Set up the glowing stroke
      canvasCtx.lineWidth = 3;
      canvasCtx.strokeStyle = "#06b6d4"; // Premium Cyan
      canvasCtx.shadowBlur = 15;
      canvasCtx.shadowColor = "#06b6d4";

      canvasCtx.beginPath();

      // Calculate width of each data point
      const sliceWidth = (WIDTH * 1.0) / bufferLength;
      let x = 0;

      // Draw the continuous wave line
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 255.0;
        // Multiply by 0.8 to prevent clipping at the very top of the canvas
        const y = HEIGHT - (v * HEIGHT * 0.8);

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          // Connect the line smoothly
          canvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      // Stroke the glowing line
      canvasCtx.stroke();

      // Draw a subtle translucent fill beneath the wave
      canvasCtx.lineTo(WIDTH, HEIGHT);
      canvasCtx.lineTo(0, HEIGHT);
      canvasCtx.fillStyle = "rgba(6, 182, 212, 0.05)";
      canvasCtx.fill();
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [active, initAudioGraph]);

  return (
    <section className="relative w-full overflow-hidden bg-neutral-950 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="flex items-center gap-3 mb-6">
          <Waves size={18} className="text-cyan-400" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300">Studio Analyzer</h2>
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-[10px] font-mono text-zinc-600 tracking-wider">Real-time spectrum — press Play to activate</span>
        </div>
        <div className="relative w-full h-[320px] md:h-[420px] rounded-none overflow-hidden border border-zinc-800 shadow-[0_0_40px_rgba(0,216,246,0.08)] bg-gradient-to-b from-neutral-950 to-black">
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TONE CHANNEL — analog hardware row
// ═══════════════════════════════════════════════════════════════════════════════
function ToneChannel({
  tone,
  active,
  onToggle,
}: {
  tone: ToneModel;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="w-full group relative bg-neutral-950 border-b border-zinc-800/80 hover:border-zinc-600 transition-colors">
      {/* Subtle left glow edge when active */}
      <div className={`absolute left-0 top-0 bottom-0 w-[2px] transition-colors ${active ? "bg-cyan-400 shadow-[0_0_12px_rgba(0,216,246,0.7)]" : "bg-transparent"}`} />

      <div className="flex items-stretch gap-0 min-h-[72px]">
        {/* Play button — heavy analog feel */}
        <button
          onClick={onToggle}
          aria-label={active ? `Stop ${tone.name}` : `Play ${tone.name}`}
          className={`shrink-0 flex items-center justify-center px-6 py-4 border-r transition-all cursor-pointer ${
            active
              ? "bg-cyan-600 border-cyan-400 text-white shadow-[inset_0_0_20px_rgba(0,216,246,0.4)]"
              : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          }`}
        >
          {active ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
        </button>

        {/* Tone info — monospace gear details */}
        <div className="flex-1 min-w-0 px-6 py-4 flex flex-col justify-center">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h3 className={`text-lg font-black uppercase tracking-tight leading-tight ${active ? "text-cyan-200" : "text-white"}`}>
              {tone.name}
            </h3>
            {active && (
              <span className="inline-block text-[9px] font-mono uppercase tracking-[0.2em] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 border border-cyan-800/50 rounded-none">
                Playing
              </span>
            )}
          </div>
          <p className="text-[11px] font-mono text-zinc-300 mt-1 tracking-wider truncate">{tone.gearTag || "—"}</p>
        </div>

        {/* Right: gear meta */}
        <div className="hidden md:flex shrink-0 items-center px-6 py-4 border-l border-zinc-800 bg-black/30">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 leading-relaxed">
            Source<br />
            <span className="text-zinc-300 font-bold">96kHz / 24-bit</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PRODUCT DETAIL CLIENT — rebuilt from scratch
// ═══════════════════════════════════════════════════════════════════════════════
export default function ProductDetailClient({ pack }: { pack: PackData }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [activeTone, setActiveTone] = useState<ToneModel | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleToggle = useCallback(
    (id: string) => {
      const tone = pack.toneModels.find((t) => t.id === id);
      if (!tone || !audioRef.current) return;

      if (activeTone?.id === id && isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        setActiveTone(null);
        return;
      }

      audioRef.current.src = tone.audioUrl;
      audioRef.current.currentTime = 0;
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
          PHASE 2 — STUDIO ANALYZER (Web Audio API Oscilloscope Waveform)
         ═══════════════════════════════════════════════════════════════════════ */}
      <StudioVisualizer active={isPlaying} audioRef={audioRef} />

      {/* ═══════════════════════════════════════════════════════════════════════
          PHASE 3 — CONTENT ARCHITECTURE (Grid)
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* ─── LEFT COLUMN (lg:col-span-8) ───────────────────────────── */}
          <div className="lg:col-span-8 space-y-16">

            {/* Interactive Tone Rack */}
            <article>
              <header className="flex items-center gap-4 mb-10">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-300 shrink-0">Tone Rack</h2>
                <div className="h-px flex-1 bg-zinc-800" />
                <span className="text-[10px] font-mono text-zinc-300 tracking-wider">Select a model below to audition</span>
              </header>

              <div className="border border-zinc-800 bg-neutral-950 shadow-[0_0_40px_rgba(0,0,0,0.7)]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-black/50">
                  <div className="flex items-center gap-3">
                    <Headphones size={16} className="text-cyan-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">Active Channels</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-300">{pack.toneModels.length} Available</span>
                </div>
                <div>
                  {pack.toneModels.map((tone) => (
                    <ToneChannel
                      key={tone.id}
                      tone={tone}
                      active={activeTone?.id === tone.id && isPlaying}
                      onToggle={() => handleToggle(tone.id)}
                    />
                  ))}
                </div>
              </div>
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
            <article>
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
                <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-600">{pack.id.toUpperCase()}</span>
              </div>

              <div className="p-8 space-y-6">
                {/* Price */}
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-[0.4em] text-zinc-500 mb-2">One-Time Price</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-7xl font-black tracking-tighter text-white leading-none">${pack.price.toFixed(2)}</span>
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
                      "w-full flex flex-col items-center justify-center gap-2 py-7 px-6 cursor-pointer select-none transition-all duration-100 shadow-2xl",
                      added
                        ? "bg-emerald-500 text-white shadow-[inset_0_0_30px_rgba(16,185,129,0.3)] active:translate-y-[1px]"
                        : "bg-white text-black font-black uppercase tracking-widest shadow-[0_6px_0_0_#0891b2,0_0_30px_rgba(0,216,246,0.3)] hover:bg-cyan-50 hover:shadow-[0_8px_0_0_#0891b2,0_0_50px_rgba(0,216,246,0.5)] active:translate-y-[2px] active:shadow-[inset_0_4px_10px_rgba(0,0,0,0.6)]",
                    ].join(" ")}
                  >
                    {added ? (
                      <span className="text-2xl font-black uppercase tracking-widest">Added ✓</span>
                    ) : (
                      <>
                        <ShoppingCart size={24} />
                        <span className="text-2xl font-black uppercase tracking-widest leading-none">Add to Cart</span>
                        <span className="text-[11px] font-mono tracking-widest opacity-70">${pack.price.toFixed(2)} · Instant</span>
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
        onEnded={() => {
          setIsPlaying(false);
          setActiveTone(null);
        }}
        className="hidden"
      />
    </main>
  );
}
