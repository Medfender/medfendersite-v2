"use client";

import React, { useState } from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

export interface TransportControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function TransportControls({
  isPlaying,
  onTogglePlay,
  onNext,
  onPrevious,
}: TransportControlsProps) {
  // Local pulse gives the play/pause button tactile feedback even when the
  // turntable is mid-swing and the actual isPlaying flip is delayed.
  const [pulse, setPulse] = useState(false);

  const handlePlayPause = () => {
    setPulse(true);
    // Reset pulse after the visual tap animation finishes.
    window.setTimeout(() => setPulse(false), 180);
    onTogglePlay();
  };

  const handlePrev = () => {
    onPrevious();
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <div
      className="flex items-center gap-2.5 shrink-0 select-none"
      aria-label="Playback controls"
      role="group"
    >
      {/* Previous */}
      <button
        aria-label="Previous track"
        onClick={handlePrev}
        className="relative w-9 h-9 rounded-full bg-neutral-800/70 text-brass flex items-center justify-center border border-white/[0.06] hover:text-white hover:bg-neutral-700/80 hover:border-brass/30 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm shrink-0 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brass/60"
        title="Previous track"
      >
        <SkipBack size={15} strokeWidth={2} />
      </button>

      {/* Play / Pause */}
      <button
        aria-label={isPlaying ? "Pause" : "Play"}
        aria-pressed={isPlaying}
        onClick={handlePlayPause}
        className={`relative w-11 h-11 rounded-full bg-gradient-to-tr from-brass to-blue-600 text-slate-950 flex items-center justify-center shadow-[0_0_16px_rgba(223,161,74,0.35)] hover:shadow-[0_0_22px_rgba(223,161,74,0.55)] hover:scale-[1.08] active:scale-[0.93] transition-all duration-200 shrink-0 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brass-light/70 ${
          pulse ? "scale-[0.93]" : "scale-100"
        }`}
        style={{ aspectRatio: "1 / 1" }}
        title={isPlaying ? "Pause" : "Play"}
        data-state={isPlaying ? "playing" : "paused"}
      >
        <span className="flex items-center justify-center w-full h-full pointer-events-none">
          {isPlaying ? (
            <Pause size={18} strokeWidth={2.2} fill="currentColor" />
          ) : (
            <Play size={18} strokeWidth={2.2} fill="currentColor" className="ml-0.5" />
          )}
        </span>
      </button>

      {/* Next */}
      <button
        aria-label="Next track"
        onClick={handleNext}
        className="relative w-9 h-9 rounded-full bg-neutral-800/70 text-brass flex items-center justify-center border border-white/[0.06] hover:text-white hover:bg-neutral-700/80 hover:border-brass/30 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm shrink-0 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brass/60"
        title="Next track"
      >
        <SkipForward size={15} strokeWidth={2} />
      </button>
    </div>
  );
}
