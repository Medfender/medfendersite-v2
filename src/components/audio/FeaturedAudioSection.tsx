"use client";

import React, { useEffect, useState } from "react";
import { useAudio } from "@/context/AudioContext";
import { Headphones, AudioWaveform } from "lucide-react";

/**
 * FeaturedAudioSection — the dark studio masthead for the /audio route.
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

  const status = isPlaying ? "Playing" : isPowered ? "Cued" : "Off";

  return (
    <section className="surface-ink relative isolate w-full overflow-hidden border-b border-[var(--rule-ink)]">
      {/* Warm lamp glow, top-left */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 90% at 8% 0%, rgba(223,161,74,0.13) 0%, transparent 62%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1560px] px-5 pb-12 pt-32 md:px-8 md:pb-16 md:pt-44">
        {/* Eyebrow row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="folio">01</span>
            <span className="eyebrow-on-ink">Featured audio</span>
            <span aria-hidden className="h-px w-16 bg-[var(--rule-ink)] md:w-28" />
          </div>
          <div className="flex items-center gap-6 font-mono text-[8.5px] uppercase tracking-[0.28em] text-cream/55">
            <span className="tabular-nums">Live · {now}</span>
            <span className="hidden items-center gap-2 sm:inline-flex">
              <Headphones className="h-3 w-3 text-brass" strokeWidth={1.5} />
              Reference monitoring
            </span>
          </div>
        </div>

        {/* Masthead + deck card */}
        <div className="mt-10 grid grid-cols-1 items-end gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
          <div>
            <h1 className="display-xl text-cream">
              Studio engine,
              <br />
              <em className="text-sand-gradient">in motion.</em>
            </h1>
            <p className="mt-7 max-w-xl text-sm leading-relaxed text-cream/60 md:text-base">
              A real-time listening workstation built around a master turntable
              engine. Every preset, EQ curve and signal-chain node below is
              driven by the same audio state — no parallel graphs, no
              double-renders.
            </p>
          </div>

          {/* On-deck card */}
          <div className="border border-[var(--rule-ink)] bg-ink/50">
            <div className="flex items-center justify-between border-b border-[var(--rule-ink-soft)] px-5 py-3">
              <span className="inline-flex items-center gap-2 font-mono text-[8.5px] uppercase tracking-[0.28em] text-cream/55">
                <AudioWaveform className="h-3 w-3 text-brass" strokeWidth={1.5} />
                On deck
              </span>
              <span className="inline-flex items-center gap-2 font-mono text-[8.5px] uppercase tracking-[0.24em] text-cream/55">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isPlaying
                      ? "bg-brass-light shadow-[0_0_8px_rgba(223,161,74,0.85)]"
                      : isPowered
                        ? "bg-brass"
                        : "bg-cream/25"
                  }`}
                />
                {status}
              </span>
            </div>

            <div className="px-5 py-5">
              <p className="truncate font-display text-2xl leading-tight text-cream md:text-3xl">
                {title}
              </p>
              <p className="mt-2 truncate font-mono text-[9px] uppercase tracking-[0.22em] text-brass">
                {artist}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--rule-ink-soft)] pt-4 font-mono text-[8.5px] uppercase tracking-[0.22em] text-cream/55">
                <span>192 kHz</span>
                <span aria-hidden className="h-3 w-px bg-[var(--rule-ink)]" />
                <span>32-bit</span>
                <span aria-hidden className="h-3 w-px bg-[var(--rule-ink)]" />
                <span>126 dB</span>
                <span aria-hidden className="h-3 w-px bg-[var(--rule-ink)]" />
                <span>&lt; 1 ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
