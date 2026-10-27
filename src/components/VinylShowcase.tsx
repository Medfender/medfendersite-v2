"use client";

import React, { useState } from "react";
import { Play } from "lucide-react";
import type { ColorTheme } from "@/lib/visualizer/useAudioVisualizer";
import { useAudio } from "@/context/AudioContext";
import SpectrumCanvas from "@/components/visualizer/SpectrumCanvas";
import type { VisualizerMode } from "@/lib/visualizer/visualizerRenderers";
import { useResolvedThumbnail } from "@/lib/audio/thumbnailResolver";

/**
 * Vinyl Showcase — pure listening/visual showcase section.
 * No duplicate transport: play/pause/stop/prev/next are owned by
 * StickyTransport (the fixed bottom dock). Clicking a track here
 * loads it onto the master turntable pipeline; the docked bar
 * reflects the change.
 */
export default function VinylShowcase() {
  const {
    playlist,
    activeTrack,
    isPlaying,
    audioRef,
    setActiveTrack,
    ensureAudioContext,
    analyserNode,
  } = useAudio();

  const [visMode, setVisMode] = useState<VisualizerMode>("curve");
  const [visTheme, setVisTheme] = useState<ColorTheme>("cyan");

  // ── Playlist select: loads onto master pipeline (no local play/stop) ────
  const handlePlaylistSelect = (track: any) => {
    const rawSrc = track?.url || track?.audioUrl || track?.src;
    if (audioRef.current) {
      if (rawSrc) {
        try {
          const clean = decodeURIComponent(
            rawSrc.startsWith("http")
              ? rawSrc.replace(/^https?:\/\/[^/]+/, "")
              : rawSrc.startsWith("/")
                ? rawSrc
                : `/${rawSrc}`
          );
          const encoded = encodeURI(clean);
          const currentPath = audioRef.current.src
            ? new URL(audioRef.current.src).pathname
            : "";
          if (currentPath !== encoded) {
            audioRef.current.src = encoded;
            audioRef.current.currentTime = 0;
            audioRef.current.load();
          }
        } catch (e) {
          console.error("[VinylShowcase] Failed to load track src:", e);
        }
      }
    }
    setActiveTrack(track);
    ensureAudioContext?.().catch((err: unknown) =>
      console.error("AudioContext resume failed:", err)
    );
  };

  return null;
}

// ── Per-row component so each row resolves its own thumbnail without forcing
//    the whole list to re-render when the active track changes ──
function ShowcaseRow({
  track,
  isActive,
  isPlaying,
  onClick,
}: {
  track: any;
  isActive: boolean;
  isPlaying: boolean;
  onClick: () => void;
}) {
  const coverSrc = useResolvedThumbnail(track);
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between gap-3 p-3 rounded-lg text-left transition-all group w-full ${
        isActive
          ? "bg-brass/[0.06] border border-brass/30"
          : "hover:bg-white/[0.03] border border-transparent"
      }`}
      aria-label={`Select ${(track as any).name || (track as any).title}`}
      aria-pressed={isActive}
    >
      <div
        className="relative shrink-0 rounded-md overflow-hidden border border-amber-500/40 bg-[#0e0e12]"
        style={{ width: 36, height: 36, boxShadow: isActive ? "0 0 8px rgba(245,158,11,0.5)" : "0 0 4px rgba(245,158,11,0.2)" }}
        aria-hidden
      >
        {coverSrc ? (
          <img src={coverSrc} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-amber-500/40" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className={`text-sm font-semibold truncate ${isActive ? "text-brass-light" : "text-neutral-200"}`}>
          {(track as any).name || (track as any).title || "Untitled"}
        </h4>
        <p className="text-[10px] text-neutral-500 truncate mt-0.5 font-mono">
          {(track as any).gearTag || (track as any).artist}
        </p>
      </div>
      <div className="flex items-center gap-3 ml-1 shrink-0">
        {isActive && isPlaying ? (
          <div className="flex gap-0.5 h-4 items-end">
            <div className="w-0.5 bg-brass h-full animate-pulse rounded-full" />
            <div className="w-0.5 bg-brass h-2/3 animate-pulse rounded-full" style={{ animationDelay: "0.15s" }} />
            <div className="w-0.5 bg-brass h-4/5 animate-pulse rounded-full" style={{ animationDelay: "0.3s" }} />
          </div>
        ) : isActive ? (
          <Play className="text-brass" size={14} />
        ) : (
          <Play className="text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity" size={12} />
        )}
      </div>
    </button>
  );
}
