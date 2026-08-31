"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Play,
  Pause,
  Headphones,
  Cpu,
  Radio,
  ShieldCheck,
  Zap,
  Volume2,
  ShoppingCart,
} from "lucide-react";
import type { PackData, ToneModel } from "@/data/storeData";
import { useCart } from "@/lib/CartContext";

// ─── Animated LED EQ Bar (per-bar randomness via controls) ────────────────────
function EQBar({ active, delay }: { active: boolean; delay: number }) {
  const controls = useAnimationControls();

  useEffect(() => {
    if (!active) {
      controls.stop();
      controls.set({ height: "10%" });
      return;
    }
    const tick = () => {
      // 4-segment height swap, mimics a real audio LED bar
      const h = 25 + Math.random() * 70;
      controls.start({
        height: `${h}%`,
        transition: { duration: 0.12 + Math.random() * 0.18, ease: "easeOut" },
      });
    };
    tick();
    const id = setInterval(tick, 220 + delay);
    return () => clearInterval(id);
  }, [active, controls, delay]);

  return (
    <motion.span
      animate={controls}
      initial={{ height: "10%" }}
      style={{ minHeight: 4 }}
      className="w-[3px] rounded-sm bg-gradient-to-t from-cyan-600 via-cyan-400 to-cyan-200 shadow-[0_0_8px_rgba(0,216,246,0.6)]"
    />
  );
}

// ─── 5-bar Premium LED VU Visualizer ──────────────────────────────────────────
function PremiumVU({ active }: { active: boolean }) {
  return (
    <div
      className="flex items-end gap-[3px] h-12 w-24 px-2 py-1 rounded-md bg-black/80 border border-zinc-800 shadow-[inset_0_2px_6px_rgba(0,0,0,0.9),inset_0_0_8px_rgba(0,216,246,0.06)] justify-center"
      aria-hidden="true"
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <EQBar key={i} active={active} delay={i * 60} />
      ))}
    </div>
  );
}

// ─── Channel Strip (mixing-desk row) ──────────────────────────────────────────
function ToneChannel({
  tone,
  activeId,
  onSelect,
}: {
  tone: ToneModel;
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const playing = activeId === tone.id;
  return (
    <div
      className={[
        "relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors",
        playing
          ? "border-cyan-700/70 bg-cyan-950/20 shadow-[inset_0_0_30px_rgba(0,216,246,0.1)]"
          : "border-zinc-800 bg-zinc-950 hover:border-zinc-700",
      ].join(" ")}
    >
      {/* Channel number plate */}
      <div className="shrink-0 w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-mono font-black text-cyan-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
        CH
      </div>

      {/* Play button */}
      <button
        onClick={() => onSelect(tone.id)}
        aria-label={playing ? `Stop ${tone.name}` : `Play ${tone.name}`}
        className={[
          "shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer",
          playing
            ? "bg-gradient-to-b from-cyan-300 to-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(0,216,246,0.6),inset_0_2px_3px_rgba(255,255,255,0.7)]"
            : "bg-gradient-to-b from-zinc-700 to-zinc-800 text-zinc-300 shadow-[0_2px_6px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.1)] hover:from-zinc-600 hover:to-zinc-700",
        ].join(" ")}
      >
        {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
      </button>

      {/* Tone info */}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-extrabold text-white tracking-tight truncate">
          {tone.name}
        </div>
        <div className="text-[10px] text-zinc-500 font-mono tracking-wider truncate">
          {tone.gearTag || "—"}
        </div>
      </div>

      {/* Premium animated EQ — only on the active channel */}
      <PremiumVU active={playing} />

      {/* Status LED */}
      <div className="shrink-0 flex items-center gap-1.5">
        <span
          className={[
            "w-2 h-2 rounded-full transition-all",
            playing
              ? "bg-cyan-400 shadow-[0_0_10px_#00d8f6]"
              : "bg-zinc-700",
          ].join(" ")}
        />
        <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 hidden sm:inline">
          {playing ? "ON" : "OFF"}
        </span>
      </div>
    </div>
  );
}

// ─── Main Product Detail Component ────────────────────────────────────────────
export default function ProductDetailClient({ pack }: { pack: PackData }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  // ── Single shared audio engine ────────────────────────────────────────────
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeTone, setActiveTone] = useState<ToneModel | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSelectTone = useCallback(
    (id: string) => {
      const tone = pack.toneModels.find((t) => t.id === id);
      if (!tone || !audioRef.current) return;

      // Clicking the same tone again → stop
      if (activeTone?.id === id && isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        setActiveTone(null);
        return;
      }

      // Switch to new tone
      audioRef.current.src = tone.audioUrl;
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => {
          setActiveTone(tone);
          setIsPlaying(true);
        })
        .catch(() => {
          // autoplay blocked or audio missing — silent fail
        });
    },
    [activeTone, isPlaying, pack.toneModels]
  );

  // ── Hero / video layout ───────────────────────────────────────────────────
  const videoCount = pack.videoDemos.length;
  const isSingle = videoCount === 1;
  const isDouble = videoCount === 2;

  // ── Buy box handler ───────────────────────────────────────────────────────
  const handleAdd = () => {
    addToCart(pack);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <main className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
      {/* ═════════════════════════════════════════════════════════════════════
          HERO — VIDEO LAYOUT
         ═════════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full bg-black border-b border-zinc-900 overflow-hidden">
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-cyan-950/20 via-transparent to-transparent pointer-events-none z-10" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-red-950/15 via-transparent to-transparent pointer-events-none z-10" />

        <div className="relative z-0">
          {isSingle && (
            <div className="aspect-video w-full max-w-[1600px] mx-auto shadow-[inset_0_0_80px_rgba(0,0,0,0.9)]">
              <iframe
                src={pack.videoDemos[0]}
                title={`${pack.title} Demo`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          {isDouble && (
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 pt-6 pb-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 aspect-video rounded-xl overflow-hidden border-2 border-zinc-800 shadow-[0_0_40px_rgba(0,0,0,0.7)] relative">
                <span className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded bg-red-600 text-white text-[9px] font-black uppercase tracking-widest shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                  Primary Demo
                </span>
                <iframe
                  src={pack.videoDemos[0]}
                  title={`${pack.title} Demo 1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="md:col-span-1 aspect-video rounded-xl overflow-hidden border border-zinc-800 shadow-[0_0_30px_rgba(0,0,0,0.7)] relative">
                <span className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded bg-cyan-600 text-white text-[9px] font-black uppercase tracking-widest shadow-[0_0_8px_rgba(0,216,246,0.5)]">
                  Alt Angle
                </span>
                <iframe
                  src={pack.videoDemos[1]}
                  title={`${pack.title} Demo 2`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>

        <div className="relative bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent -mt-24 pt-24 pb-10 px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <Link
              href="/store"
              className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.3em] text-zinc-500 hover:text-cyan-300 transition-colors mb-4"
            >
              <ArrowLeft size={12} /> Back to Store
            </Link>
            <span className="inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 mb-3 shadow-[0_0_10px_rgba(0,216,246,0.15)]">
              {pack.type} · {pack.badge}
            </span>
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-[-0.04em] text-white uppercase leading-[0.95]">
              {pack.title}
            </h1>
            <p className="text-zinc-300 text-base md:text-lg font-medium leading-relaxed max-w-2xl mt-5">
              {pack.description}
            </p>
            <div className="flex items-center gap-3 mt-4 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
              <span>96kHz / 24-bit</span>
              <span className="w-1 h-1 bg-zinc-700 rounded-full" />
              <span>{pack.includedGear.length} Gear Items</span>
              <span className="w-1 h-1 bg-zinc-700 rounded-full" />
              <span>{pack.toneModels.length} Tone Models</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════
          BOTTOM — TONE PLAYER + TALE OF THE TAPE + BUY BOX
         ═════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto w-full px-6 md:px-12 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
        {/* LEFT — TALE OF THE TAPE */}
        <article className="lg:col-span-1 order-3 lg:order-1">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6">
            Tale of the Tape
          </h2>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)]">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-zinc-800/40">
                <tr>
                  <td className="px-5 py-3 text-[10px] font-mono uppercase text-zinc-600">Pack</td>
                  <td className="px-5 py-3 font-bold text-white">{pack.title}</td>
                </tr>
                <tr>
                  <td className="px-5 py-3 text-[10px] font-mono uppercase text-zinc-600">Type</td>
                  <td className="px-5 py-3 font-extrabold text-cyan-300">{pack.type}</td>
                </tr>
                <tr>
                  <td className="px-5 py-3 text-[10px] font-mono uppercase text-zinc-600">Price</td>
                  <td className="px-5 py-3 font-extrabold text-xl text-amber-400">
                    ${pack.price.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-3 text-[10px] font-mono uppercase text-zinc-600">Includes</td>
                  <td className="px-5 py-3 font-medium text-zinc-200">
                    {pack.includedGear.length} captured tones
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-3 text-[10px] font-mono uppercase text-zinc-600 align-top">Gear</td>
                  <td className="px-5 py-3">
                    <ul className="space-y-1">
                      {pack.includedGear.map((g) => (
                        <li key={g} className="flex items-center gap-2 text-sm text-zinc-300">
                          <Check size={10} className="text-cyan-400 shrink-0" />
                          {g}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 text-[9px] font-mono uppercase tracking-widest text-zinc-500">
            <SpecIcon icon={<Cpu size={12} />} label="96kHz" />
            <SpecIcon icon={<Radio size={12} />} label="24-bit" />
            <SpecIcon icon={<ShieldCheck size={12} />} label="Royalty-Free" />
            <SpecIcon icon={<Zap size={12} />} label="Instant DL" />
          </div>
        </article>

        {/* MIDDLE — TONE PLAYER (Mini-Rack) */}
        <article className="lg:col-span-1 order-2 lg:order-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
              <Headphones size={14} className="text-cyan-400" />
              Listen to the Models
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-950 to-black shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-950/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
                  Mini-Rack · {pack.toneModels.length} Channels
                </span>
              </div>
              <div className="flex items-center gap-2">
                {activeTone && (
                  <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-400 truncate max-w-[120px]">
                    Now: {activeTone.name}
                  </span>
                )}
                <Volume2 size={12} className="text-zinc-600" />
              </div>
            </div>

            <div className="p-3 space-y-2">
              {pack.toneModels.map((m) => (
                <ToneChannel
                  key={m.id}
                  tone={m}
                  activeId={activeTone?.id ?? null}
                  onSelect={handleSelectTone}
                />
              ))}
            </div>
          </div>
        </article>

        {/* RIGHT — BUY BOX */}
        <aside className="lg:col-span-1 order-1 lg:order-3 lg:sticky lg:top-28 lg:self-start">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6">
            Checkout Zone
          </h2>
          <div className="rounded-2xl border-2 border-zinc-800 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black shadow-[0_0_60px_rgba(0,0,0,0.95),inset_0_2px_4px_rgba(255,255,255,0.03)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-950/80">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">
                {pack.type}
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                Pack ID: {pack.id.toUpperCase()}
              </span>
            </div>

            <div className="p-7 md:p-8">
              <h3 className="text-2xl font-black tracking-tight text-white uppercase mb-2">
                {pack.title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-5">{pack.description}</p>

              <div className="mb-6 p-4 rounded-xl bg-black/60 border border-amber-900/20 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
                <div className="text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-500 mb-1">
                  One-Time Price
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black tracking-tighter text-amber-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]">
                    ${pack.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">USD</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-2">
                  {pack.toneModels.length} tones · instant download
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.button
                  key={added ? "added" : "idle"}
                  onClick={handleAdd}
                  initial={{ scale: 1 }}
                  animate={{ scale: added ? [1, 1.04, 1] : 1 }}
                  transition={{ duration: 0.25 }}
                  className={[
                    "relative w-full rounded-xl text-center font-black uppercase tracking-[0.15em] text-lg md:text-xl px-8 py-6 transition-all duration-75 cursor-pointer select-none",
                    "shadow-[0_8px_0_0_rgba(180,83,9,0.7),0_15px_30px_rgba(0,0,0,0.6),inset_0_2px_6px_rgba(255,255,255,0.7)]",
                    added
                      ? "bg-gradient-to-b from-emerald-400 to-emerald-600 text-white shadow-[0_0_30px_rgba(16,185,129,0.6)]"
                      : "bg-gradient-to-b from-cyan-400 to-cyan-600 text-slate-950 hover:from-cyan-300 hover:to-cyan-500 hover:shadow-[0_10px_0_0_rgba(180,83,9,0.8),0_20px_40px_rgba(0,0,0,0.7),inset_0_2px_8px_rgba(255,255,255,0.9)] active:translate-y-[1px] active:shadow-[inset_0_4px_8px_rgba(0,0,0,0.8),0_0_25px_rgba(0,216,246,0.3)]",
                  ].join(" ")}
                  aria-label={added ? `${pack.title} added to cart` : `Add ${pack.title} to cart`}
                >
                  <span className="block flex items-center justify-center gap-2">
                    {added ? "Added to Cart ✓" : (
                      <>
                        <ShoppingCart size={20} className="inline" />
                        Add to Cart
                      </>
                    )}
                  </span>
                  <span className="block text-[9px] font-mono tracking-[0.3em] opacity-70 mt-1">
                    ${pack.price.toFixed(2)} · Instant Download
                  </span>
                </motion.button>
              </AnimatePresence>

              <p className="text-center text-[10px] text-zinc-600 font-mono tracking-[0.2em] uppercase mt-4">
                Open cart to checkout via Lemon Squeezy
              </p>
            </div>
          </div>
        </aside>
      </section>

      {/* ── Single shared audio element for the whole page ── */}
      <audio
        ref={audioRef}
        preload="metadata"
        crossOrigin="anonymous"
        onEnded={() => {
          setIsPlaying(false);
          setActiveTone(null);
        }}
      />
    </main>
  );
}

function SpecIcon({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-zinc-800/60 bg-zinc-950/60">
      <span className="text-cyan-400/80">{icon}</span>
      <span className="text-zinc-400">{label}</span>
    </div>
  );
}
