"use client";

import React, { useState } from "react";
import { useAudio } from "@/context/AudioContext";
import SpectrumCanvas from "@/components/visualizer/SpectrumCanvas";
import type { VisualizerMode, ColorTheme } from "@/lib/visualizer/visualizerRenderers";

interface HeroVisualizerProps {
  isSectionInView: boolean;
}

export default function HeroVisualizer({ isSectionInView }: HeroVisualizerProps) {
  const { isPlaying, activeTrack, analyserNode } = useAudio();
  const [mode, setMode] = useState<VisualizerMode>("curve");
  const [theme, setTheme] = useState<ColorTheme>("cyan");

  return (
    <div
      className={`relative w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 transition-all duration-500 ease-in-out ${
        isSectionInView ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-8 pointer-events-none"
      }`}
    >
      {/* Borderless / transparent container — visualizer canvas is incrusted
          on top of the hero background. All chrome is overlayed absolutely. */}
      <div className="relative w-full h-[200px] sm:h-[200px] md:h-[240px] overflow-hidden bg-transparent">
        {/* Spectrum Canvas — embedded seamlessly into the section */}
        <SpectrumCanvas
          analyserNode={analyserNode}
          isPlaying={isPlaying}
          mode={mode}
          theme={theme}
          className="w-full h-full block"
        />

        {/* ── Floating HUD overlays (incrusted, not boxed) ── */}

        {/* Status badge — top-left, lifted above the grid so high-frequency
            spikes never collide with the text. */}
        <div className="pointer-events-none absolute top-2 left-3 z-10 flex items-center gap-2.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isPlaying
                ? "bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.85)]"
                : "bg-neutral-600"
            } ${isPlaying ? "animate-pulse" : ""}`}
          />
          <span
            className="text-xs font-mono tracking-[0.15em] text-slate-200 uppercase font-medium"
            style={{
              textShadow:
                "0 0 12px rgba(8,12,22,0.95), 0 1px 2px rgba(0,0,0,0.85)",
            }}
          >
            {isPlaying
              ? `Live Spectrum — ${activeTrack?.name || "Audio"}`
              : "Studio Analyzer — Idle"}
          </span>
        </div>

        {/* Mode + theme controls — top-right, glassmorphic blur chips */}
        <div className="absolute top-2 right-3 z-10 flex items-center gap-2.5">
          <div
            className="flex gap-0.5 rounded-lg p-0.5 border border-white/10"
            style={{
              background: "rgba(10, 14, 23, 0.55)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            {(["curve", "bars", "waveform"] as VisualizerMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1 rounded-md capitalize text-[11px] font-medium transition-all duration-200 ${
                  mode === m
                    ? "bg-sky-500/20 text-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.25)]"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
                aria-label={`Switch to ${m} mode`}
                style={{
                  textShadow: mode === m ? "0 0 8px rgba(56,189,248,0.5)" : "none",
                }}
              >
                {m === "curve" ? "Curve" : m === "bars" ? "Bars" : "Oscillo"}
              </button>
            ))}
          </div>

          <div
            className="flex items-center gap-1.5 rounded-lg border border-white/10 p-1"
            style={{
              background: "rgba(10, 14, 23, 0.55)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            {(["cyan", "neon", "emerald"] as ColorTheme[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ring-offset-1 ${
                  t === "cyan" ? "bg-sky-400" : t === "neon" ? "bg-rose-500" : "bg-emerald-400"
                } ${
                  theme === t
                    ? "scale-125 ring-2 ring-white/60"
                    : "opacity-50 hover:opacity-100 hover:scale-110"
                }`}
                aria-label={`Switch to ${t} theme`}
                title={t}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
