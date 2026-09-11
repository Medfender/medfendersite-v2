"use client";

import React, { useState } from "react";
import { useAudio } from "@/context/AudioContext";
import Turntable from "@/components/turntable/Turntable";
import PlaylistPanel from "@/components/audio/PlaylistPanel";
import StickyTransport from "@/components/audio/StickyTransport";
import AudioPlayer from "@/components/player/AudioPlayer";
import SignalChain from "@/components/audio/SignalChain";
import FeaturedAudioSection from "@/components/audio/FeaturedAudioSection";
import VinylShowcase from "@/components/VinylShowcase";
import LocalTrackPanel from "@/components/audio/LocalTrackPanel";
import SpectrumVisualizer from "@/components/audio/SpectrumVisualizer";
import SpectrumAnalyzerPanel from "@/components/audio/SpectrumAnalyzerPanel";

import { deckControls } from "@/lib/audio/DeckControls";

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
    playNext,
    playPrevious,
    stop: ctxStop,
    pause,
    seek,
  } = useAudio();

  // Click-to-seek: convert a 0..1 waveform percent into an absolute time on the active track.
  const handlePlaylistSeek = (percent: number) => {
    if (duration > 0) seek(percent * duration);
  };

  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');

  const handleToggleRepeat = () => {
    setRepeatMode(prev => prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off');
  };

  const handleTogglePlay = () => togglePlay();
  const handleTurntablePlay = () => {
    if (activeTrack) playTrack(activeTrack);
  };
  const handleTurntableStop = () => ctxStop();
  const handleNeedleDrop = () => {};

  const bpm = isPowered && isPlaying ? currentBpm ?? 0 : 0;
  const progress = duration > 0 ? currentTime / duration : 0;

  // Audition bridge: selecting from playlist or patch loads onto turntable
  return (
    <>
      <main
        className="min-h-screen flex flex-col text-neutral-100 relative overflow-x-hidden bg-transparent"
      >
        {/* ── Section 1: Featured Audio Hero Banner ─────────────────────────── */}
        <FeaturedAudioSection />

        {/* ── Section 3: Master Turntable & Playlist Workstation ─────────────── */}
        <section className="w-full max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-20 md:pb-24">
          {/* Section header: Tactile Listening / Vinyl Showcase */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xs font-mono uppercase tracking-[0.4em] text-neutral-500">
                Tactile Listening
              </h2>
              <p className="mt-1 text-xl md:text-2xl font-bold text-white tracking-tight">
                Vinyl Showcase
              </p>
            </div>
            <a
              href="#local-library"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('.w-full.max-w-3xl')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="inline-flex items-center gap-2 self-center px-4 py-2.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm font-mono uppercase tracking-[0.1em] hover:bg-cyan-500/20 hover:border-cyan-500/50 transition shrink-0"
            >
              Import your music
            </a>
          </div>
            {/* Main Wrapper: Flexbox pulls the right column immediately next to the left */}
            <div className="w-full flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
              {/* Left Column: Explicitly locked width, preventing any flex-shrinking */}
              <div className="flex-none w-full lg:w-[480px] xl:w-[500px] relative">
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

              {/* Right Column: Takes up the remaining space, pulled left, with a wider max-width */}
              <div className="flex-1 w-full max-w-[900px] aspect-[21/9] xl:aspect-[3/1] relative">
                <SpectrumAnalyzerPanel
                  selectedBandId={null}
                  setSelectedBandId={() => {}}
                />
              </div>
            </div>

          {/* Playlist: flat horizontal-line aesthetic, no card/box framing */}
          <div id="playlist-panel" data-playlist className="mt-6">
            <PlaylistPanel onSeek={handlePlaylistSeek} />
          </div>

          {/* Audio Player — embedded below playlist on desktop */}
          <div className="mt-8 md:mt-10 w-full max-w-3xl mx-auto">
            <AudioPlayer
              isPlaying={isPlaying}
              isPowered={isPowered}
              onPlayPause={handleTogglePlay}
              onSkipBack={playPrevious}
              onSkipForward={playNext}
              onToggleRepeat={handleToggleRepeat}
              repeatMode={repeatMode}
              onOpenQueue={() => {
                const panel = document.getElementById('playlist-panel');
                if (panel) {
                  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                  const el = document.querySelector('[data-playlist]') || document.querySelector('.rounded-2xl.bg-\[#0a0a0a\]');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            />
          </div>

        </section>

        {/* ── Section 3b: Local Track Library (moved up, full block) ───────── */}
        <section id="local-library" className="w-full max-w-7xl mx-auto px-4 md:px-6 pb-8">
          <LocalTrackPanel />
        </section>

        {/* ── Section 4: Vinyl Showcase ─────────────────────────────────────── */}
        <section id="vinyl-showcase-section" className="w-full">
          <VinylShowcase />
        </section>



        {/* ── Section 8: Playlist & Details Description Block ──────────────── */}
        <section className="w-full max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-18">
          <div className="rounded-2xl bg-transparent/60 border-none p-6 md:p-8">
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
                <div className="rounded-xl bg-transparent/40 border-none p-4">
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
                <div className="rounded-xl bg-transparent/40 border-none p-4 space-y-2.5">
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
                background: "linear-gradient(180deg, rgba(11,15,25,0.2) 0%, rgba(15,20,32,0.2) 100%)",
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
