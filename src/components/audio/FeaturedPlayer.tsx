"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Square, Volume2, VolumeX } from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import MiniVisualizer from "./MiniVisualizer";
import type { VisualizerMode } from "@/lib/visualizer/useAudioVisualizer";

interface FeaturedPlayerProps {
  isSectionInView: boolean;
}

const MINI_MODES: VisualizerMode[] = ["bars", "curve", "waveform"];
const MODE_LABELS: Record<VisualizerMode, string> = {
  bars: "Spec",
  curve: "Curve",
  waveform: "Osc",
};

export default function FeaturedPlayer({ isSectionInView }: FeaturedPlayerProps) {
  const {
    activeTrack, currentTrack, isPlaying, volume, setVolume,
    isMuted, toggleMute, togglePlay, seek, currentTime, duration,
    analyserNode, playNext, playPrevious, stop, playlist,
  } = useAudio();

  // ── Track metadata ────────────────────────────────────────────────────────
  const trackName =
    ((activeTrack as any)?.title   || (activeTrack as any)?.name    || currentTrack?.name       || (currentTrack as any)?.title   || "Unknown Track");
  const trackArtist =
    ((activeTrack as any)?.artist  || (activeTrack as any)?.gearTag || (currentTrack as any)?.gearTag || (currentTrack as any)?.artist || "MedFender");

  const [coverError, setCoverError] = useState(false);
  useEffect(() => { setCoverError(false); }, []);


  // ── Mini visualizer mode (3-way cycle) ──────────────────────────────────
  const [miniMode, setMiniMode] = useState<VisualizerMode>("bars");
  const cycleMiniMode = () => {
    setMiniMode((prev) => {
      const idx = MINI_MODES.indexOf(prev);
      return MINI_MODES[(idx + 1) % MINI_MODES.length];
    });
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fmt = (sec: number) => {
    if (isNaN(sec) || !isFinite(sec) || !sec) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // ── Empty state ─────────────────────────────────────────────────────────
  if (!currentTrack && !isPlaying && duration === 0) {
    const emptyMsg = "No audio — add files to /public/audio/featured";
    return (
      <div
        className={`fixed bottom-0 left-0 right-0 bg-neutral-950/90 border-t border-cyan-500/20 backdrop-blur-xl text-white z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] transition-all duration-500 ease-in-out ${
          isSectionInView ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-8 pointer-events-none"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 p-2 sm:px-4 md:px-6 w-full h-[60px]">
          <span className="text-xs text-neutral-500 font-mono">{emptyMsg}</span>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-xs text-cyan-400 hover:text-white transition shrink-0"
          >
            ↑ Top
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-neutral-950/90 border-t border-cyan-500/20 backdrop-blur-xl text-white z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] transition-all duration-500 ease-in-out ${
        isSectionInView ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-8 pointer-events-none"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3 p-2 sm:px-4 md:px-6 w-full min-h-[60px]">

        {/* ── Left: transport + track info ──────────────────────────────────── */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Transport buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={playPrevious}
              aria-label="Previous track"
              className="w-8 h-8 rounded-full bg-neutral-800/80 text-cyan-400 flex items-center justify-center hover:text-white hover:bg-neutral-700/80 transition shrink-0"
            >
              <SkipBack size={14} />
            </button>

            <button
              onClick={togglePlay}
              className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 flex items-center justify-center shadow-[0_0_14px_rgba(0,216,246,0.3)] hover:scale-105 active:scale-95 transition-transform duration-200 shrink-0 overflow-hidden"
              aria-label={isPlaying ? "Pause" : "Play"}
              style={{ aspectRatio: "1 / 1" }}
            >
              <span className="flex items-center justify-center w-full h-full">
                {isPlaying
                  ? <Pause size={18} className="shrink-0" />
                  : <Play size={18} className="shrink-0 ml-0.5" />}
              </span>
            </button>

            <button
              onClick={playNext}
              aria-label="Next track"
              className="w-8 h-8 rounded-full bg-neutral-800/80 text-cyan-400 flex items-center justify-center hover:text-white hover:bg-neutral-700/80 transition shrink-0"
            >
              <SkipForward size={14} />
            </button>
          </div>

          {/* Track info — title + artist, no numerotation badge, perfectly centered with transport controls */}
          <div className="flex flex-col justify-center min-w-0 h-10 hidden sm:flex">
            <h4 className="text-sm font-bold text-white truncate leading-tight">{trackName}</h4>
            <p className="text-[10px] text-neutral-500 truncate font-mono leading-tight mt-0.5">{trackArtist}</p>
          </div>
        </div>

        {/* ── Center: timeline ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0 mx-2">
          <span className="text-[10px] font-mono text-neutral-500 shrink-0 tabular-nums">
            {fmt(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime || 0}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1 bg-neutral-700 rounded-lg appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(0,216,246,0.6)] [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cyan-400 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-[0_0_6px_rgba(0,216,246,0.6)]"
            aria-label="Seek"
          />
          <span className="text-[10px] font-mono text-neutral-500 shrink-0 tabular-nums">
            {fmt(duration)}
          </span>
        </div>

        {/* ── Right: volume + mini visualizer + stop ───────────────────────── */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Volume — mute toggle + always-visible slider */}
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <button
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
              className="w-7 h-7 rounded-full text-neutral-400 flex items-center justify-center hover:text-cyan-400 transition shrink-0"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <input
              type="range" min="0" max="1" step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 md:w-20 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 shrink-0 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(0,216,246,0.6)] [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cyan-400 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-[0_0_6px_rgba(0,216,246,0.6)]"
              aria-label="Volume"
            />
          </div>

          {/* Stop — immediately before the interactive Mini Visualizer */}
          <button
            onClick={stop}
            title="Stop"
            aria-label="Stop"
            className="w-7 h-7 rounded-full text-neutral-500 hover:text-cyan-400 hover:bg-white/5 transition-colors shrink-0 flex items-center justify-center"
          >
            <Square fill="currentColor" size={13} />
          </button>

          {/* Free-contained mini visualizer — no card, no border, no shadow.
              Fixed 150×50 footprint; click cycles bars → curve → waveform. */}
          <div
            onClick={cycleMiniMode}
            className="hidden md:flex items-center justify-center cursor-pointer shrink-0 ml-4 rounded overflow-hidden transition-all duration-200 hover:brightness-110 group h-9"
            title={`${MODE_LABELS[miniMode]} — click to switch`}
            style={{
              width: 150,
              height: 36,
              minWidth: 150,
              minHeight: 36,
              maxWidth: 150,
              maxHeight: 36,
              flexShrink: 0,
            }}
          >
            <MiniVisualizer
              analyserNode={analyserNode}
              isPlaying={isPlaying}
              mode={miniMode}
              onModeCycle={cycleMiniMode}
              width={150}
              height={36}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
