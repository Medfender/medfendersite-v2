"use client";

import React, { useState, useMemo } from "react";
import { useAudio } from "@/context/AudioContext";
import tracksData from "@/content/tracks.json";
import SineWaveVisualizer from "./SineWaveVisualizer";

interface TrackItem {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverUrl: string;
}

export default function FeaturedPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    playTrack,
    pauseTrack,
    togglePlay,
    seek,
    setVolume,
  } = useAudio();

  const tracks = useMemo(() => tracksData as TrackItem[], []);
  const [selectedId, setSelectedId] = useState<string>(tracks[0]?.id || "");
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);

  const activeTrack = useMemo(() => {
    if (currentTrack) return currentTrack;
    const found = tracks.find((t) => t.id === selectedId);
    if (found) {
      return {
        id: found.id,
        title: found.title,
        src: found.audioUrl,
        artist: found.artist,
        coverUrl: found.coverUrl,
      };
    }
    return null;
  }, [currentTrack, tracks, selectedId]);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedId(id);
    const found = tracks.find((t) => t.id === id);
    if (found) {
      playTrack({
        id: found.id,
        title: found.title,
        src: found.audioUrl,
        artist: found.artist,
        coverUrl: found.coverUrl,
      });
    }
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleMuteToggle = () => {
    if (isMuted) {
      setVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto rounded-3xl overflow-hidden border border-cyan-500/20 shadow-[0_0_60px_rgba(0,216,246,0.08),0_8px_32px_rgba(0,0,0,0.6)]">
      {/* Hardware synth inspired outer chassis */}
      <div className="relative bg-gradient-to-b from-neutral-900 via-neutral-950 to-black">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

        {/* Header / Meta */}
        <div className="px-8 pt-6 pb-4">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="flex items-end gap-4">
              {/* LED indicator */}
              <div className={`w-3 h-3 rounded-full mb-1 shadow-[0_0_8px] ${isPlaying ? "bg-cyan-400 shadow-cyan-400 animate-pulse" : "bg-neutral-700 shadow-none"}`} />
              <div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-lg">
                  {activeTrack?.title || "Select a track"}
                </h2>
                <p className="text-cyan-400/80 text-sm font-bold tracking-widest uppercase mt-0.5">
                  {activeTrack?.artist || "Medfender"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="track-select" className="sr-only">Select track</label>
              <select
                id="track-select"
                value={selectedId}
                onChange={handleSelect}
                className="bg-black/60 border border-cyan-500/20 text-cyan-100 text-xs font-bold rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/40 transition cursor-pointer"
              >
                {tracks.map((t) => (
                  <option key={t.id} value={t.id} className="bg-neutral-900">{t.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Visualizer */}
        <div className="px-4">
          <div className="rounded-2xl overflow-hidden border border-white/5 shadow-[inset_0_2px_20px_rgba(0,0,0,0.8)]">
            <SineWaveVisualizer />
          </div>
        </div>

        {/* Controls Bar — hardware synth style */}
        <div className="px-8 pb-6 pt-2">
          {/* Scrub / Progress */}
          <div className="mb-5">
            <div className="relative w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden border border-white/5 shadow-[inset_0_1px_4px_rgba(0,0,0,0.6)] group cursor-pointer">
              {/* Fill */}
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full shadow-[0_0_12px_rgba(0,216,246,0.6)] transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
              />
              {/* Thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-[0_0_10px_rgba(0,216,246,0.8),0_2px_8px_rgba(0,0,0,0.8)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                style={{ left: `calc(${progressPercent}% - 8px)` }}
              />
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime || 0}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                aria-label="Seek"
              />
            </div>
          </div>

          {/* Play / Time / Volume row */}
          <div className="flex items-center justify-between gap-4">
            {/* Play button */}
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="group flex items-center justify-center w-14 h-14 rounded-2xl border-2 border-cyan-500/30 bg-gradient-to-b from-neutral-800 to-neutral-950 hover:from-cyan-900/40 hover:to-neutral-900 hover:border-cyan-400/60 active:scale-95 transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_16px_rgba(0,0,0,0.5)]"
            >
              <span className={`text-2xl leading-none ${isPlaying ? "text-cyan-300" : "text-cyan-300"} group-hover:text-cyan-200`}>
                {isPlaying ? "▶" : "▶"}
              </span>
            </button>

            {/* Time display */}
            <div className="flex items-center gap-2 font-mono text-sm tabular-nums bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 shadow-inner">
              <span className="text-cyan-300 font-bold">{formatTime(currentTime)}</span>
              <span className="text-neutral-600">/</span>
              <span className="text-neutral-500">{formatTime(duration)}</span>
            </div>

            {/* Volume row */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleMuteToggle}
                aria-label={isMuted ? "Unmute" : "Mute"}
                className={`text-xs font-black uppercase tracking-wider px-2 py-1 rounded-lg border transition-colors ${
                  isMuted
                    ? "text-rose-400 border-rose-500/30 bg-rose-950/30"
                    : "text-neutral-400 border-white/5 hover:text-cyan-300 hover:border-cyan-500/30"
                }`}
              >
                {isMuted ? "MUTED" : "VOL"}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setVolume(v);
                  setIsMuted(v === 0);
                }}
                className="w-20 accent-cyan-400 h-1 rounded-full bg-neutral-800 appearance-none cursor-pointer"
                aria-label="Volume"
              />
            </div>
          </div>
        </div>

        {/* Bottom accent bar */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent mb-1" />
      </div>
    </div>
  );
}
