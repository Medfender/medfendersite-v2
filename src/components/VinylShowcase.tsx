"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import type { ColorTheme } from "@/lib/visualizer/useAudioVisualizer";
import { useAudio } from "@/context/AudioContext";
import SpectrumCanvas from "@/components/visualizer/SpectrumCanvas";
import Turntable from "@/components/turntable/Turntable";
import type { VisualizerMode } from "@/lib/visualizer/visualizerRenderers";

export default function VinylShowcase() {
  const {
    isPlaying,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    currentTime,
    duration,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    playlist,
    activeTrack,
    analyserNode,
    setPlaybackRate,
    audioRef,
    playTrack,
  } = useAudio();

  const [pitch, setPitch] = useState<number>(0);
  const [visMode, setVisMode] = useState<VisualizerMode>("bars");

  // ── Pitch → playbackRate ─────────────────────────────────────────────────
  useEffect(() => {
    setPlaybackRate(1 + pitch / 100);
  }, [pitch, setPlaybackRate]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fmt = (sec: number) => {
    if (isNaN(sec) || !isFinite(sec) || !sec) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(Number(e.target.value));
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [visTheme, setVisTheme] = useState<ColorTheme>("cyan");

  // Click outside closes the volume popover; clicking the speaker toggles it.
  useEffect(() => {
    if (!showVolumeSlider) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Do not close if clicking inside the volume container
      if (target.closest('[data-volume-popover]')) return;
      setShowVolumeSlider(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [showVolumeSlider]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // ── Track info from context ───────────────────────────────────────────────
  const trackName =
    (activeTrack as any)?.name || (activeTrack as any)?.title || "No track selected";
  const trackArtist = (activeTrack as any)?.gearTag || (activeTrack as any)?.artist || "—";

  // ── Skip handlers that start playback ─────────────────────────────────────
  const handlePrev = () => {
    playPrevious();
    // playPrevious toggles isPlaying=true in the context
  };

  const handleNext = () => {
    playNext();
  };

  return (
    <section className="w-full bg-[#111111] py-20 text-gray-300 font-sans border-y border-gray-900">
      {/* Hidden audio — owned by AudioProvider, not VinylShowcase */}
      {/* The shared audioRef is used implicitly via the context controls */}

      <header className="text-center mb-16 px-4">
        <h2 className="text-5xl font-extrabold tracking-widest text-white mb-4 uppercase">
          Featured Vinyl Showcase
        </h2>
        <p className="text-gray-400 text-lg">
          A tactile listening experience. Select a track, drop the needle, and watch the vinyl spin.
        </p>
      </header>

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-start px-6">
        {/* ── Left Column ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-10">

          {/* Transport + Progress */}
          <div className="flex items-center gap-6 bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800">
            <button onClick={handlePrev} className="text-gray-400 hover:text-white transition-colors">
              <SkipBack size={24} />
            </button>
            <button
              onClick={togglePlay}
              className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full text-white hover:bg-white/10 hover:text-cyan-300 transition-colors"
            >
              {isPlaying ? <Pause size={24} /> : <Play className="ml-1" size={24} />}
            </button>
            <button onClick={handleNext} className="text-gray-400 hover:text-white transition-colors">
              <SkipForward size={24} />
            </button>

            {/* Progress Bar */}
            <div className="flex-1 flex items-center gap-4 ml-4">
              <span className="text-xs font-mono">{fmt(currentTime)}</span>
              <div className="flex-1 h-1 bg-gray-700 rounded-full relative cursor-pointer">
                <div
                  className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime || 0}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label="Seek"
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow transition-all"
                  style={{ left: `calc(${progress}% - 6px)` }}
                />
              </div>
              <span className="text-xs font-mono">{fmt(duration)}</span>
            </div>

            {/* Volume — click speaker to open popover slider; mute toggle inside */}
            <div
              className="relative flex items-center gap-2"
              data-volume-popover
            >
              <button
                onClick={() => setShowVolumeSlider((v) => !v)}
                aria-label={showVolumeSlider ? "Hide volume slider" : "Show volume slider"}
                aria-expanded={showVolumeSlider}
                className={`transition-colors ml-2 ${showVolumeSlider ? "text-cyan-400" : "text-gray-400 hover:text-white"}`}
                title={showVolumeSlider ? "Hide volume slider" : "Show volume slider"}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>

              {/* Popover slider + mute toggle */}
              <div
                className={`absolute bottom-full right-0 mb-3 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#181818]/95 border border-cyan-500/20 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition-all duration-300 ease-out origin-bottom-right whitespace-nowrap ${
                  showVolumeSlider ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 translate-y-2 scale-95 pointer-events-none"
                }`}
              >
                <input
                  type="range" min="0" max="1" step="0.01"
                  value={volume}
                  onChange={handleVolume}
                  className="w-28 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 shrink-0"
                  aria-label="Volume"
                />
                <span className="text-[10px] font-mono text-neutral-400 tabular-nums w-7 text-right">{Math.round(volume * 100)}</span>
                <button
                  onClick={toggleMute}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                  className={`transition-colors flex items-center justify-center w-6 h-6 rounded-full ${isMuted ? "text-red-400 bg-red-400/10" : "text-cyan-400 hover:text-white"}`}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Playlist */}
          <div>
            <h3 className="text-sm tracking-widest text-gray-500 mb-4 font-semibold uppercase">Playlist</h3>
            <div className="flex flex-col gap-2">
              {playlist.map((track) => {
                const isActive = (activeTrack as any)?.id === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track)}
                    className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors ${
                      isActive ? "bg-[#1a1a1a] border border-blue-900/30" : "hover:bg-gray-800/50"
                    }`}
                  >
                    <div>
                      <h4 className={`font-semibold ${isActive ? "text-blue-400" : "text-gray-200"}`}>
                        {(track as any).name || (track as any).title || "Untitled"}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">{(track as any).gearTag || (track as any).artist}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {isActive && isPlaying ? (
                        <div className="flex gap-1 h-4 items-end">
                          <div className="w-1 bg-blue-500 h-full animate-pulse" />
                          <div className="w-1 bg-blue-500 h-2/3 animate-pulse delay-75" />
                          <div className="w-1 bg-blue-500 h-4/5 animate-pulse delay-150" />
                        </div>
                      ) : isActive ? (
                        <Play className="text-blue-500" size={16} />
                      ) : null}
                    </div>
                  </div>
                );
              })}
              {playlist.length === 0 && (
                <p className="text-gray-600 text-sm p-4">No tracks loaded — play from the player bar above.</p>
              )}
            </div>
          </div>

          {/* Real-Time Spectrum Analyzer — uses the shared SpectrumCanvas
              backed by the canonical AudioPhysicsEngine + renderStudioVisualizer.
              Binds to the shared active AnalyserNode (no re-init), HiDPI-aware,
              full-width, no dead space on the right. */}
          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800 mt-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs tracking-widest text-gray-500 font-semibold uppercase">Real-Time Spectrum Analyzer</h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-600 hidden md:inline">PEAK HOLD | LOGARITHMIC</span>
                {/* Mode switcher — only the original modes from the visualizer engine */}
                <div className="flex items-center gap-1 bg-neutral-900 rounded-md p-0.5 border border-gray-800">
                  {(["bars", "curve"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setVisMode(m)}
                      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded transition-colors ${
                        visMode === m
                          ? "bg-blue-600 text-white"
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                      aria-label={`Switch to ${m} mode`}
                    >
                      {m === "curve" ? "Wave" : m}
                    </button>
                  ))}
                </div>
                {/* Three color theme circles — cyan / red (neon) / green (emerald) */}
                <div className="flex items-center gap-2 ml-2">
                  {(
                    [
                      { theme: "cyan" as ColorTheme, label: "Cyan / Blue", colorClass: "bg-sky-400 shadow-[0_0_4px_rgba(56,189,248,0.6)]" },
                      { theme: "neon" as ColorTheme, label: "Red / Neon", colorClass: "bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.6)]" },
                      { theme: "emerald" as ColorTheme, label: "Green / Emerald", colorClass: "bg-emerald-400 shadow-[0_0_4px_rgba(16,185,129,0.6)]" },
                    ] as const
                  ).map(({ theme, label, colorClass }) => (
                    <button
                      key={theme}
                      onClick={() => setVisTheme(theme)}
                      aria-label={label + " theme"}
                      title={label}
                      className={`w-4 h-4 rounded-full ${colorClass} border-2 border-neutral-700 transition-all duration-200 hover:scale-110 ${visTheme === theme ? "ring-2 ring-white ring-offset-1 ring-offset-neutral-900 scale-110" : "opacity-50 hover:opacity-100"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full h-24 relative">
              <SpectrumCanvas
                analyserNode={analyserNode}
                isPlaying={isPlaying}
                mode={visMode}
                theme={visTheme || "cyan"}
                className="w-full h-full block"
              />
            </div>
          </div>
        </div>

        {/* ── Right Column: Vinyl ────────────────────────────────────────── */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl">
            <Turntable playState={isPlaying ? 'playing' : 'stopped'} progress={duration > 0 ? (currentTime / duration) : 0} />
          </div>

          {/* Current Track Info */}
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-white mb-1">{trackName}</h3>
            <p className="text-blue-400 font-semibold mb-2">{trackArtist}</p>
            <p className="text-xs font-mono text-gray-500">
              {fmt(currentTime)} / {fmt(duration)}
            </p>
          </div>

          {/* Pitch Control */}
          <div className="w-full max-w-sm bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs tracking-widest text-gray-500 font-semibold uppercase">Pitch Control</span>
              <span className="text-xs font-mono text-blue-400 bg-blue-900/20 px-2 py-1 rounded">
                {pitch > 0 ? "+" : ""}
                {pitch}%
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-gray-600">-8%</span>
              <input
                type="range"
                min="-8"
                max="8"
                value={pitch}
                onChange={(e) => setPitch(Number(e.target.value))}
                className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-xs font-mono text-gray-600">+8%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
