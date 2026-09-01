"use client";

import React, { useState, useEffect, useCallback } from "react";
import FeaturedAudioSection from "@/components/sections/FeaturedAudioSection";
import VinylShowcase from "@/components/VinylShowcase";
import Turntable from "@/components/turntable/Turntable";
import PlaylistPanel from "@/components/audio/PlaylistPanel";
import { useAudio } from "@/context/AudioContext";

function seededRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export default function AudioClient() {
  const [seed, setSeed] = useState<number | null>(null);
  useEffect(() => setSeed(Math.random()), []);

  const {
    transportState,
    isPowered,
    isPlaying,
    activeTrack,
    currentTime,
    duration,
    currentBpm,
    playTrack,
    togglePlay,
    stop: ctxStop,
    pause,
  } = useAudio();

  const handleTogglePlay = useCallback(() => togglePlay(), [togglePlay]);
  const handleTurntablePlay = useCallback(() => {
    if (activeTrack) playTrack(activeTrack);
  }, [activeTrack, playTrack]);
  const handleTurntableStop = useCallback(() => ctxStop(), [ctxStop]);
  const handleNeedleDrop = useCallback(() => {}, []);

  const bpm = isPowered && isPlaying ? currentBpm ?? 0 : 0;
  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <main className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 relative">
      {/* Background image spans hero → turntable → playlist */}
      <div className="absolute top-0 left-0 w-full h-[120vh] z-0 pointer-events-none">
        <img
          src="/images/gallery/So Lounge.JPG"
          alt=""
          className="w-full h-full object-cover opacity-15 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f19]/50 via-[#0b0f19]/20 to-[#0b0f19]/60" />
      </div>

      {/* ── 1. HERO — Featured Audio Experience ──────────────────────────────── */}
      <section className="w-full">
        <FeaturedAudioSection />
      </section>

      {/* ── 2. TURNTAKE + PLAYLIST SIDE-BY-SIDE ─────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-2 lg:py-4 bg-neutral-950">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Turntable */}
          <div className="w-full lg:w-[640px] shrink-0">
            <Turntable
              transportState={transportState}
              progress={progress}
              onTogglePlay={handleTogglePlay}
              onStop={handleTurntableStop}
              onNeedleDrop={handleNeedleDrop}
              onPlay={handleTurntablePlay}
              onPause={pause}
              bpm={bpm}
            />
          </div>
          {/* Playlist panel — right side, next to turntable */}
          <div className="w-full lg:flex-1 lg:max-w-md lg:min-w-[320px]">
            <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-5 shadow-2xl">
              <PlaylistPanel />
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. VINYL SHOWCASE ─────────────────────────────────────────────── */}
      <section className="w-full">
        <VinylShowcase />
      </section>

      {/* ── 4. WAVEFORM DIVIDER ───────────────────────────────────────────── */}
      <div className="w-full overflow-hidden opacity-20">
        <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="w-full h-8" aria-hidden="true">
          <path d="M0,20 C50,5 100,35 150,20 C200,5 250,35 300,20 C350,5 400,35 450,20 C500,5 550,35 600,20 C650,5 700,35 750,20 C800,5 850,35 900,20 C950,5 1000,35 1050,20 C1100,5 1150,35 1200,20" fill="none" stroke="#00d8f6" strokeWidth="1.5" />
          <path d="M0,20 C50,35 100,5 150,20 C200,35 250,5 300,20 C350,35 400,5 450,20 C500,35 550,5 600,20 C650,35 700,5 750,20 C800,35 850,5 900,20 C950,35 1000,5 1050,20 C1100,35 1150,5 1200,20" fill="none" stroke="#00d8f6" strokeWidth="0.75" opacity="0.5" />
        </svg>
      </div>

      {/* ── 5. GEAR INFO CARDS ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TONEX */}
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-gradient-to-br from-[#0c0e18] to-[#08090f] p-6">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,216,246,0.04),transparent_70%)]" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#00d8f6]/10 border border-[#00d8f6]/20 flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d8f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z" /><path d="M12 8v4l3 3" /><path d="M8.5 8.5 12 12m0 0 3.5-3.5M5 12h14" /></svg>
                </div>
                <div>
                  <h3 className="text-white font-bold tracking-wide text-sm uppercase">IK Multimedia TONEX</h3>
                  <p className="text-neutral-500 text-[10px] font-mono tracking-widest uppercase">AI Machine Modeling</p>
                </div>
              </div>
              <p className="text-neutral-400 text-xs leading-relaxed mb-4">
                Every preset is captured directly from the TONEX software — running at 192 kHz / 32-bit with IK's VIR™ technology. The resulting .tonex files retain every nuance of the original amp, cabinet, and microphone chain.
              </p>
              <div className="flex flex-wrap gap-2">
                {["VIR™ Cabinet", "192 kHz", "32-bit", "AI Modeling", "100+ Presets"].map((tag) => (
                  <span key={tag} className="text-[10px] font-mono px-2 py-1 rounded-md bg-[#00d8f6]/5 border border-[#00d8f6]/15 text-[#00d8f6]/80 uppercase tracking-wider">{tag}</span>
                ))}
              </div>
            </div>
          </div>

          {/* HX Stomp XL */}
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-gradient-to-br from-[#0c0e18] to-[#08090f] p-6">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(168,85,247,0.04),transparent_70%)]" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><circle cx="9" cy="13" r="1" fill="#a855f7" /><circle cx="15" cy="13" r="1" fill="#a855f7" /><path d="M9 17h6" /></svg>
                </div>
                <div>
                  <h3 className="text-white font-bold tracking-wide text-sm uppercase">Line 6 HX Stomp XL</h3>
                  <p className="text-neutral-500 text-[10px] font-mono tracking-widest uppercase">300+ DSP Processors</p>
                </div>
              </div>
              <p className="text-neutral-400 text-xs leading-relaxed mb-4">
                Captured via the HX Stomp XL's four stereo path slots — running in Hybrid mode with both DSP and analog bypass engaged. Each preset is A/B'd against the real amp at studio reference level.
              </p>
              <div className="flex flex-wrap gap-2">
                {["4 Stereo Paths", "Hybrid Mode", "300+ DSP", "8 Blocks", "126 dB SNR"].map((tag) => (
                  <span key={tag} className="text-[10px] font-mono px-2 py-1 rounded-md bg-purple-500/5 border border-purple-500/15 text-purple-400/80 uppercase tracking-wider">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. TECHNICAL SPECS ROW ─────────────────────────────────────────── */}
      <section className="w-full border-y border-white/[0.04] bg-gradient-to-r from-[#08090f] via-[#0c0e18] to-[#08090f] py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: "Sample Rate", value: "192 kHz", sub: "4× CD quality" },
              { label: "Bit Depth", value: "32-bit", sub: "Floating point" },
              { label: "SNR", value: "126 dB", sub: "A-weighted" },
              { label: "Latency", value: "< 1 ms", sub: "Round-trip" },
            ].map(({ label, value, sub }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">{label}</span>
                <span className="text-xl font-mono font-bold text-white tabular-nums">{value}</span>
                <span className="text-[10px] text-neutral-500">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. PLAYLIST / DETAILS ──────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-10 w-full">
        <div className="rounded-2xl border border-zinc-800 bg-neutral-900/60 backdrop-blur p-6">
          <p className="text-neutral-400 text-sm leading-relaxed">
            The turntable is fully functional — play, stop, power, and RPM controls are wired directly to the global audio context with no prop interference. All animations (vinyl spin, tonearm drop, needle state) respond to the three-state transport machine. Select a track from the playlist above, press play on the turntable, and watch the waveform respond in real time.
          </p>
        </div>
      </section>

      {/* ── 8. SIGNAL CHAIN ────────────────────────────────────────────────── */}
      <section className="w-full py-8 border-y border-white/[0.04] bg-gradient-to-r from-[#08090f] via-[#0c0e18] to-[#08090f]">
        <div className="flex items-center gap-3 max-w-6xl mx-auto px-6">
          <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest shrink-0">Signal Chain</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <div className="flex items-center gap-2">
            {["Instrument", "TONEX", "HX Stomp XL", "Interface", "DAW"].map((node, i, arr) => {
              const nodeSeed = seed !== null ? seed + i : null;
              return (
                <React.Fragment key={node}>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-8 rounded bg-neutral-900/80 border border-white/[0.06] overflow-hidden flex flex-col justify-end px-0.5 py-0.5">
                      {Array.from({ length: 6 }, (_, bi) => {
                        const r = nodeSeed !== null ? seededRandom(nodeSeed * 7 + bi) : 0.5;
                        const active = r > 0.3;
                        const isPeak = bi === 5;
                        const color = isPeak && active ? "bg-amber-400" : active ? "bg-[#00d8f6]" : "bg-neutral-800";
                        const opacity = active ? 0.6 + r * 0.4 : 0.15;
                        return (
                          <div
                            key={bi}
                            className={`h-1 rounded-sm mb-0.5 transition-all ${color}`}
                            style={{ opacity: nodeSeed === null ? 0.15 : opacity }}
                          />
                        );
                      })}
                    </div>
                    <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-tighter">{node}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <svg width="12" height="12" viewBox="0 0 12 12" className="text-neutral-700 shrink-0 -mt-3" aria-hidden="true">
                      <path d="M2 6h6M8 3l3 3-3 3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>
      </section>

      {/* ── 9. MANUAL LAYOUT ZONE ─────────────────────────────────────────── */}
      <section className="min-h-[400px] border-t border-dashed border-white/[0.06] bg-gradient-to-b from-[#06070b] to-[#020305] px-6 py-12 flex items-center justify-center" aria-label="Bottom layout workspace">
        <div className="max-w-4xl w-full flex flex-col items-center gap-6 text-center">
          <div className="w-2 h-2 rounded-full bg-[#00d8f6]/40 animate-pulse" />
          <h3 className="text-sm font-mono tracking-[0.3em] uppercase text-neutral-500">Manual Layout Zone</h3>
          <p className="text-xs text-neutral-600 font-light max-w-md leading-relaxed">
            This open space is reserved for manual rearrangement of decorative elements and additional sections.
          </p>
          <div className="w-full max-w-sm h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent mt-2" />
        </div>
      </section>
    </main>
  );
}
