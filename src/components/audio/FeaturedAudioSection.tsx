"use client";

import React, { useEffect, useState } from "react";
import { useAudio } from "@/context/AudioContext";
import { Play, Headphones, AudioWaveform } from "lucide-react";

/**
 * FeaturedAudioSection — full-width hero banner for the /audio route.
 * Pure presentation: bindings to the master turntable state are read-only.
 * Nothing here creates or destroys Web Audio API nodes; all audio flow
 * remains under the AudioContext's exclusive control.
 */
export default function FeaturedAudioSection() {
  const { activeTrack, isPlaying, isPowered, currentTrack } = useAudio();
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    const fmt = () => {
      const d = new Date();
      const hh = d.getHours().toString().padStart(2, "0");
      const mm = d.getMinutes().toString().padStart(2, "0");
      const ss = d.getSeconds().toString().padStart(2, "0");
      setNow(`${hh}:${mm}:${ss}`);
    };
    fmt();
    const id = setInterval(fmt, 1000);
    return () => clearInterval(id);
  }, []);

  const title =
    (activeTrack as any)?.name ||
    (activeTrack as any)?.title ||
    (currentTrack as any)?.name ||
    (currentTrack as any)?.title ||
    "Studio Engine — Idle";

  const artist =
    (activeTrack as any)?.artist ||
    (activeTrack as any)?.gearTag ||
    (currentTrack as any)?.artist ||
    (currentTrack as any)?.gearTag ||
    "Medfender Signal Chain";

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, rgba(11,15,25,1) 0%, rgba(15,20,32,1) 60%, rgba(11,15,25,1) 100%)",
        borderBottom: "1px solid rgba(0,216,246,0.08)",
      }}
    >
      {/* Background cyan glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 80% at 50% 0%, rgba(0,216,246,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-7xl mx-auto px-4 md:px-6 pt-28 md:pt-36 pb-10 md:pb-14">
        {/* Eyebrow row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono uppercase tracking-[0.25em]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,216,246,0.9)]" />
              Featured Audio
            </span>
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.25em]">
              Live · {now}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-neutral-500 uppercase tracking-[0.25em]">
            <Headphones size={12} className="text-cyan-400" />
            Reference Monitoring
          </div>
        </div>

        {/* Main banner grid */}
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-6 md:gap-10 items-end">
          {/* Left: title block */}
          <div>
            <h1
              className="text-white font-extrabold leading-[0.95] tracking-[-0.03em]"
              style={{
                fontSize: "clamp(2.5rem, 6.5vw, 5rem)",
                textShadow: "0 0 40px rgba(0,216,246,0.15)",
              }}
            >
              Studio Engine
              <span className="block text-cyan-400">In Motion.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm md:text-base text-neutral-400 leading-relaxed">
              A real-time listening workstation built around a master turntable
              engine. Every preset, EQ curve, and signal-chain node below is
              driven by the same audio state — no parallel graphs, no
              double-renders.
            </p>
          </div>

          {/* Right: live track status card — flat, borderless */}
          <div className="rounded-2xl bg-[#0e121c]/80 border-none backdrop-blur-md p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
                <AudioWaveform size={12} className="text-cyan-400" />
                Now On Deck
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isPlaying
                      ? "bg-cyan-400 shadow-[0_0_8px_rgba(0,216,246,0.9)] animate-pulse"
                      : isPowered
                        ? "bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]"
                        : "bg-neutral-600"
                  }`}
                />
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-400">
                  {isPlaying ? "Playing" : isPowered ? "Cued" : "Off"}
                </span>
              </div>
            </div>
            <div className="text-xl md:text-2xl font-bold text-white truncate tracking-tight">
              {title}
            </div>
            <div className="text-xs font-mono text-cyan-400/80 uppercase tracking-[0.2em] mt-1 truncate">
              {artist}
            </div>
            <div className="mt-4 flex items-center gap-3 text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em]">
              <span className="inline-flex items-center gap-1.5">
                <Play size={10} className="text-cyan-400" /> 192 kHz
              </span>
              <span className="text-neutral-700">·</span>
              <span>32-bit</span>
              <span className="text-neutral-700">·</span>
              <span>126 dB</span>
              <span className="text-neutral-700">·</span>
              <span>&lt; 1 ms</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
