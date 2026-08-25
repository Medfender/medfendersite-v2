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

  const progressPercent =
    duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full max-w-3xl mx-auto backdrop-blur-xl bg-neutral-900/60 border border-white/10 rounded-3xl p-8 shadow-2xl">
      {/* Header / Meta */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-lg">
            {activeTrack?.title || "Select a track"}
          </h2>
          <p className="text-neutral-400 text-sm md:text-base mt-1 font-medium">
            {activeTrack?.artist || "Medfender"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="track-select" className="sr-only">
            Select track
          </label>
          <select
            id="track-select"
            value={selectedId}
            onChange={handleSelect}
            className="bg-neutral-950/60 border border-white/10 text-neutral-100 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-cyan-400/50 transition cursor-pointer"
          >
            {tracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visualizer */}
      <div className="rounded-2xl overflow-hidden ring-1 ring-white/5 mb-6 shadow-inner bg-gradient-to-b from-neutral-950 to-black/40">
        <SineWaveVisualizer />
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col gap-5">
        {/* Play / Times */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="h-14 w-14 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 text-black font-extrabold text-xl shadow-[0_0_30px_rgba(0,216,246,0.5)] hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          <div className="flex items-center gap-3 text-neutral-300 font-mono text-sm md:text-base tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span className="text-neutral-500">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Progress Scrubber */}
        <div className="relative w-full h-2 bg-neutral-800 rounded-full overflow-hidden group">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-400 to-cyan-300 rounded-full transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
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

        {/* Volume */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Vol</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-32 accent-cyan-400 h-1.5 rounded-full bg-neutral-800 appearance-none cursor-pointer"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}
