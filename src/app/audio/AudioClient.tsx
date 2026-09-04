"use client";

import React from "react";
import { useAudio } from "@/context/AudioContext";
import Turntable from "@/components/turntable/Turntable";
import PatchBrowser from "@/components/audio/PatchBrowser";
import PlaylistPanel from "@/components/audio/PlaylistPanel";
import StickyTransport from "@/components/audio/StickyTransport";
import SignalChain from "@/components/audio/SignalChain";
import FeaturedAudioSection from "@/components/audio/FeaturedAudioSection";
import VinylShowcase from "@/components/VinylShowcase";

export default function AudioClient() {
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

  const handleTogglePlay = () => togglePlay();
  const handleTurntablePlay = () => {
    if (activeTrack) playTrack(activeTrack);
  };
  const handleTurntableStop = () => ctxStop();
  const handleNeedleDrop = () => {};

  const bpm = isPowered && isPlaying ? currentBpm ?? 0 : 0;
  const progress = duration > 0 ? currentTime / duration : 0;

  // Audition bridge: selecting from playlist or patch loads onto turntable
  const handlePatchAudition = (track: any) => {
    const candidate = {
      ...track,
      id: track.id || track.title || `patch-${Date.now()}`,
      name: track.name || track.title || track.name,
      audioUrl: track.url || track.audioUrl || "/audio/featured/01.mp3",
      thumbnail: track.thumbnail || track.coverUrl || track.thumbnail || undefined,
    };
    if (playTrack) playTrack(candidate);
  };

  return (
    <>
      <main
        className="min-h-screen flex flex-col bg-[#0b0f19] text-neutral-100 relative overflow-x-hidden"
        style={{ backgroundImage: "none" }}
      >
        {/* ── Section 1: Featured Audio Hero Banner ─────────────────────────── */}
        <FeaturedAudioSection />

        {/* ── Section 3: Master Turntable & Playlist Workstation ─────────────── */}
        <section className="w-full max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-20 md:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 lg:gap-6 items-start">
            {/* Center: 3D Turntable (master audio source of truth) */}
            <div className="w-full flex justify-start lg:justify-start flex-shrink-0">
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

            {/* Right Panel: Integrated Playlist Card */}
            <aside className="w-full lg:max-w-[340px] lg:ml-auto">
              <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-4 shadow-[0_0_60px_rgba(0,216,246,0.06)]" style={{ height: 'clamp(220px, 32vw, 340px)', maxHeight: 'clamp(220px, 32vw, 340px)' }}>
                {/* Playlist */}
                <PlaylistPanel />
              </div>
            </aside>
          </div>
        </section>

        {/* ── Section 4: Vinyl Showcase ─────────────────────────────────────── */}
        <section id="vinyl-showcase-section" className="w-full">
          <VinylShowcase />
        </section>


        {/* ── Section 6: Gear Info Cards (TONEX + HX Stomp XL) ─────────────── */}
        <section className="w-full max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-18">
          <div className="mb-6">
            <h2 className="text-xs font-mono uppercase tracking-[0.4em] text-neutral-500">
              Profiling &amp; Modeling
            </h2>
            <p className="mt-1 text-xl md:text-2xl font-bold text-white tracking-tight">
              Gear Info
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* IK Multimedia TONEX */}
            <div
              className="group relative overflow-hidden rounded-2xl bg-[#111111] border border-white/[0.06] p-6 transition-all hover:border-amber-500/30 hover:shadow-[0_0_40px_rgba(245,158,11,0.08)]"
            >
              {/* Small product thumbnail — placed in corner, not dominant */}
              <img
                src="/images/Line 6 IK/tonex_one_pedal_bundle_prodmenu@2x.webp"
                alt="TONEX"
                className="absolute top-4 right-4 w-14 h-14 object-contain opacity-40 mix-blend-screen rounded-md pointer-events-none group-hover:opacity-60 transition-opacity"
                style={{ filter: "drop-shadow(0 0 6px rgba(245,158,11,0.3))" }}
              />
              {/* Subtle background texture — very low opacity */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none opacity-[0.07] mix-blend-overlay rounded-2xl bg-cover bg-right-top"
                style={{
                  backgroundImage: "url('/images/Line 6 IK/Tonex IK.webp')",
                  backgroundSize: "contain",
                }}
              />
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 12 Q10 8 12 12 Q14 16 16 12" />
                      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">IK Multimedia TONEX</h3>
                    <p className="text-xs font-mono text-amber-400/70">Amplification &amp; Cab IR</p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-400 uppercase tracking-wider">
                  Modeler
                </span>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed mb-4">
                AI-trained amplifier and cabinet impulse response modeling. TONEX captures
                the exact harmonic behavior of your favorite amps — from clean headroom
                to saturated drive — and replays them with 192 kHz / 32-bit precision.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Resolution", value: "192 kHz" },
                  { label: "Bit Depth", value: "32-bit" },
                  { label: "SNR", value: "126 dB" },
                  { label: "Latency", value: "< 1 ms" },
                ].map((spec) => (
                  <div key={spec.label} className="rounded-lg bg-[#0a0a0a] border border-white/[0.04] p-2.5">
                    <div className="text-[10px] font-mono text-neutral-600 uppercase tracking-[0.15em]">{spec.label}</div>
                    <div className="text-sm font-mono text-white mt-0.5">{spec.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Line 6 HX Stomp XL */}
            <div
              className="group relative overflow-hidden rounded-2xl bg-[#111111] border border-white/[0.06] p-6 transition-all hover:border-cyan-500/30 hover:shadow-[0_0_40px_rgba(0,216,246,0.08)]"
            >
              {/* Small product thumbnail */}
              <img
                src="/images/Line 6 IK/Line-6-XL-Stomp-1024x614.webp"
                alt="HX Stomp XL"
                className="absolute top-4 right-4 w-14 h-14 object-contain opacity-40 mix-blend-screen rounded-md pointer-events-none group-hover:opacity-60 transition-opacity"
                style={{ filter: "drop-shadow(0 0 6px rgba(0,216,246,0.3))" }}
              />
              {/* Subtle background texture */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none opacity-[0.07] mix-blend-overlay rounded-2xl bg-cover bg-left-bottom"
                style={{
                  backgroundImage: "url('/images/Line 6 IK/hxstomp.webp')",
                  backgroundSize: "contain",
                }}
              />
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
                      <rect x="2" y="6" width="20" height="14" rx="2" />
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <circle cx="8.5" cy="12" r="1.2" fill="currentColor" />
                      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
                      <circle cx="15.5" cy="12" r="1.2" fill="currentColor" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Line 6 HX Stomp XL</h3>
                    <p className="text-xs font-mono text-cyan-400/70">Multi-Effects &amp; Processing</p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                  Multi-FX
                </span>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed mb-4">
                Next-generation HX modeling processor with four stereo signal processing
                paths. Run up to eight simultaneous effects chains, including
                amplifier models, drive stages, modulations, delays, and reverbs —
                all with ultra-low latency.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Processing", value: "4× Stereo" },
                  { label: "Paths", value: "8 Simultaneous" },
                  { label: "DSP", value: "SHARC × 2" },
                  { label: "Looper", value: "Up to 2 min" },
                ].map((spec) => (
                  <div key={spec.label} className="rounded-lg bg-[#0a0a0a] border border-white/[0.04] p-2.5">
                    <div className="text-[10px] font-mono text-neutral-600 uppercase tracking-[0.15em]">{spec.label}</div>
                    <div className="text-sm font-mono text-white mt-0.5">{spec.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 6b: Preset & Patch Browser ──────────────────────────── */}
        <section className="w-full max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-10">
          <PatchBrowser onAudition={handlePatchAudition} />
        </section>

        {/* ── Section 7: Technical Specs Row ────────────────────────────────── */}
        <section className="w-full bg-[#090b10] border-y border-white/[0.04] py-6">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: "192 kHz", label: "Sample Rate", accent: "cyan" },
                { value: "32-bit", label: "Bit Depth", accent: "cyan" },
                { value: "126 dB", label: "Dynamic Range", accent: "amber" },
                { value: "< 1 ms", label: "Round-Trip Latency", accent: "cyan" },
              ].map((spec) => (
                <div key={spec.label} className="flex flex-col items-center text-center">
                  <span
                    className="text-2xl md:text-3xl font-mono font-bold tracking-tight"
                    style={{
                      color: spec.accent === "cyan" ? "#00d8f6" : "#f59e0b",
                      textShadow: spec.accent === "cyan"
                        ? "0 0 20px rgba(0,216,246,0.4)"
                        : "0 0 20px rgba(245,158,11,0.4)",
                    }}
                  >
                    {spec.value}
                  </span>
                  <span className="mt-1 text-[10px] font-mono text-neutral-500 uppercase tracking-[0.25em]">
                    {spec.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 8: Playlist & Details Description Block ──────────────── */}
        <section className="w-full max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-18">
          <div className="rounded-2xl bg-[#111111] border border-white/[0.06] p-6 md:p-8 shadow-[0_0_60px_rgba(0,216,246,0.04)]">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
              <h2 className="text-xs font-mono uppercase tracking-[0.4em] text-neutral-500">
                Track &amp; Gear Context
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Track context */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3">Active Track</h3>
                <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.04] p-4">
                  <div className="text-base font-semibold text-white truncate">
                    {(activeTrack as any)?.name || (activeTrack as any)?.title || "—"}
                  </div>
                  <div className="text-xs font-mono text-cyan-400/70 mt-1 uppercase tracking-[0.15em]">
                    {(activeTrack as any)?.gearTag || (activeTrack as any)?.artist || "No track selected"}
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-[10px] font-mono text-neutral-500">
                    <span>{Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, "0")} total</span>
                    <span className="text-neutral-700">·</span>
                    <span>{Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, "0")} elapsed</span>
                  </div>
                </div>
              </div>

              {/* Gear notes */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3">Signal Notes</h3>
                <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.04] p-4 space-y-2.5">
                  {[
                    "Guitar → 1/4\" TRS balanced direct",
                    "TONEX Black Tube: vintage tube preamp model",
                    "HX Stomp XL: stereo amp + modulation chain",
                    "Interface USB-C: 192 kHz / 32-bit record path",
                    "DAW: Cubase — stereo monitoring out",
                  ].map((note, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400/60 shrink-0" />
                      <span className="text-xs font-mono text-neutral-400 leading-relaxed">{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 9: Signal Chain Diagram ──────────────────────────────── */}
        <section className="w-full pb-14 md:pb-18">
          <SignalChain />
        </section>

        {/* ── Section 9: Manual Layout Zone ──────────────────────────────── */}
        <section className="w-full pb-24 md:pb-28">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div
              className="min-h-[400px] rounded-2xl border border-white/[0.05] flex flex-col items-center justify-center gap-6 relative overflow-hidden"
              style={{
                background: "linear-gradient(180deg, rgba(11,15,25,0.5) 0%, rgba(15,20,32,0.5) 100%)",
              }}
            >
              {/* Subtle grid background */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                  backgroundImage: "linear-gradient(rgba(0,216,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,216,246,0.5) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />

              {/* Pulsing indicator dot */}
              <div className="relative flex items-center justify-center">
                <span
                  className="absolute w-4 h-4 rounded-full bg-cyan-400 opacity-40"
                  style={{
                    boxShadow: "0 0 20px rgba(0,216,246,0.6)",
                    animation: "manualPulse 2s ease-in-out infinite",
                  }}
                />
                <span
                  className="relative w-3 h-3 rounded-full bg-cyan-400"
                  style={{
                    boxShadow: "0 0 12px rgba(0,216,246,0.9), 0 0 24px rgba(0,216,246,0.4)",
                  }}
                />
              </div>

              {/* Typography */}
              <div className="relative text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  Manual Layout Zone
                </h2>
                <p className="mt-3 text-sm text-neutral-500 font-mono max-w-md">
                  Reserved space for manual content, documentation links,
                  or additional gear information cards.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-400 uppercase tracking-[0.2em]">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Ready for Content
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Viewport Dock: Animated Bar Player ──────────────────────────── */}
      {/* Hidden sentinel used by StickyTransport to detect scroll-to-bottom */}
      <div id="sticky-transport-sentinel" style={{ height: 1, position: 'absolute', bottom: 100, pointerEvents: 'none' }} aria-hidden />
      <StickyTransport />

      {/* ── CSS Keyframes ─────────────────────────────────────────────── */}
      <style>{`
        @keyframes manualPulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </>
  );
}
