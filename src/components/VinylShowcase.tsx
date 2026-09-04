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

  return (
    <section className="w-full bg-[#111111] py-14 md:py-18 text-gray-300 font-sans border-y border-white/[0.04]">
      <header className="max-w-7xl mx-auto px-4 md:px-6 mb-8">
        <h2 className="text-xs font-mono uppercase tracking-[0.4em] text-neutral-500">
          Tactile Listening
        </h2>
        <p className="mt-1 text-2xl md:text-3xl font-bold text-white tracking-tight">
          Vinyl Showcase
        </p>
        <p className="mt-2 text-sm text-neutral-400 max-w-2xl">
          Pick a side. The spectrum pulses in real time, the master turntable spins
          above, and the docked bar takes over for transport.
        </p>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Left: Live Spectrum ─────────────────────────────────────── */}
        <div className="rounded-2xl bg-[#0a0a0a] border border-white/[0.06] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs tracking-[0.3em] text-neutral-500 font-semibold uppercase">
              Real-Time Spectrum
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-neutral-900 rounded-md p-0.5 border border-white/[0.06]">
                {(["bars", "curve"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setVisMode(m)}
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded transition-colors ${
                      visMode === m
                        ? "bg-cyan-500/20 text-cyan-300"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                    aria-label={`Switch to ${m} mode`}
                    aria-pressed={visMode === m}
                  >
                    {m === "curve" ? "Curve" : "Bars"}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {(
                  [
                    { theme: "cyan" as ColorTheme, label: "Cyan", colorClass: "bg-sky-400 shadow-[0_0_4px_rgba(56,189,248,0.6)]" },
                    { theme: "neon" as ColorTheme, label: "Red", colorClass: "bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.6)]" },
                    { theme: "emerald" as ColorTheme, label: "Green", colorClass: "bg-emerald-400 shadow-[0_0_4px_rgba(16,185,129,0.6)]" },
                  ] as const
                ).map(({ theme, label, colorClass }) => (
                  <button
                    key={theme}
                    onClick={() => setVisTheme(theme)}
                    aria-label={`${label} theme`}
                    title={label}
                    className={`w-4 h-4 rounded-full ${colorClass} border border-neutral-700 transition-all duration-200 hover:scale-110 ${
                      visTheme === theme ? "ring-2 ring-white ring-offset-1 ring-offset-neutral-900 scale-110" : "opacity-50 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="w-full h-40 relative">
            <SpectrumCanvas
              analyserNode={analyserNode}
              isPlaying={isPlaying}
              mode={visMode}
              theme={visTheme}
              className="w-full h-full block"
            />
          </div>
          <p className="mt-3 text-[10px] font-mono text-neutral-600 uppercase tracking-[0.2em]">
            Logarithmic · 48 bars · peak hold
          </p>
        </div>

        {/* ── Right: Playlist Grid ─────────────────────────────────────── */}
        <div className="rounded-2xl bg-[#0a0a0a] border border-white/[0.06] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs tracking-[0.3em] text-neutral-500 font-semibold uppercase">
              Tracklist
            </h3>
            <span className="text-[10px] font-mono text-neutral-600">
              {playlist.length} tracks
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {playlist.map((track) => {
              const isActive = (activeTrack as any)?.id === track.id;
              return (
                <ShowcaseRow
                  key={track.id}
                  track={track}
                  isActive={isActive}
                  isPlaying={isPlaying}
                  onClick={() => handlePlaylistSelect(track)}
                />
              );
            })}
            {playlist.length === 0 && (
              <p className="text-neutral-600 text-xs p-4 text-center">
                No tracks loaded.
              </p>
            )}
          </div>
          <p className="mt-4 text-[10px] font-mono text-neutral-600 uppercase tracking-[0.2em] text-center">
            Transport handled by docked bar player
          </p>
        </div>
      </div>
    </section>
  );
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
          ? "bg-cyan-500/[0.06] border border-cyan-500/30"
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
        <h4 className={`text-sm font-semibold truncate ${isActive ? "text-cyan-300" : "text-neutral-200"}`}>
          {(track as any).name || (track as any).title || "Untitled"}
        </h4>
        <p className="text-[10px] text-neutral-500 truncate mt-0.5 font-mono">
          {(track as any).gearTag || (track as any).artist}
        </p>
      </div>
      <div className="flex items-center gap-3 ml-1 shrink-0">
        {isActive && isPlaying ? (
          <div className="flex gap-0.5 h-4 items-end">
            <div className="w-0.5 bg-cyan-400 h-full animate-pulse rounded-full" />
            <div className="w-0.5 bg-cyan-400 h-2/3 animate-pulse rounded-full" style={{ animationDelay: "0.15s" }} />
            <div className="w-0.5 bg-cyan-400 h-4/5 animate-pulse rounded-full" style={{ animationDelay: "0.3s" }} />
          </div>
        ) : isActive ? (
          <Play className="text-cyan-400" size={14} />
        ) : (
          <Play className="text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity" size={12} />
        )}
      </div>
    </button>
  );
}
