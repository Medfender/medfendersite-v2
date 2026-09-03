"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import { useResolvedThumbnail } from "@/lib/audio/thumbnailResolver";
import MiniVisualizer from "./MiniVisualizer";
import TrackThumbnailCard from "@/components/player/TrackThumbnailCard";

// ─── Album cover card — the signature amber-stroked thumbnail ────────────
interface CoverCardProps {
  src: string | null;
  name: string;
  isPlaying: boolean;
}

function CoverCard({ src, name, isPlaying }: CoverCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState(false);

  return (
    <div
      className="relative shrink-0 rounded-lg overflow-hidden border-2 border-amber-500/70"
      style={{
        width: 56,
        height: 56,
        boxShadow:
          "0 0 14px rgba(245, 158, 11, 0.45), 0 0 4px rgba(245, 158, 11, 0.7), inset 0 0 0 1px rgba(245, 158, 11, 0.15)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      aria-label={`Cover art for ${name}`}
    >
      {/* Spinning ring when playing */}
      {isPlaying && (
        <div
          className="absolute inset-0 rounded-lg z-10 pointer-events-none"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0%, rgba(245,158,11,0.28) 30%, transparent 60%)",
            animation: "spin 2.4s linear infinite",
          }}
        />
      )}

      {src && !err ? (
        <img
          src={src}
          alt={name}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setErr(true);
            setLoaded(false);
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#0e0e12]">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500/40 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main StickyTransport ────────────────────────────────────────────────
export default function StickyTransport() {
  const {
    isPlaying,
    togglePlay,
    playNext,
    playPrevious,
    stop,
    seek,
    currentTime,
    duration,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    activeTrack,
    playlist,
    analyserNode,
  } = useAudio();

  // Scroll-aware visibility: hide the bar when the user is scrolled deep into
  // the page (toward the bottom), show it again when they scroll back up.
  // Driven by a viewport scroll listener that compares the new scrollY to the
  // previous one and only animates when state actually changes.
  const [isHidden, setIsHidden] = useState(false);
  const [miniMode, setMiniMode] = useState<"bars" | "curve" | "waveform">("bars");
  const [vinylVisible, setVinylVisible] = useState(false);

  useEffect(() => {
    let lastY = typeof window !== "undefined" ? window.scrollY : 0;
    let rafId = 0;
    let ticking = false;

    // Distance from the page bottom at which the bar starts hiding. 240px lets
    // the bar stay visible long enough to read the active track during the
    // last scroll, then fades it out before it overlaps the footer.
    const HIDE_NEAR_BOTTOM_PX = 240;

    const update = () => {
      ticking = false;
      const currentY = window.scrollY;
      const viewportH = window.innerHeight;
      const docH = document.documentElement.scrollHeight;
      const distanceFromBottom = docH - (currentY + viewportH);

      if (currentY <= 16) {
        // Always show when at the very top of the page
        setIsHidden(false);
      } else if (vinylVisible) {
        // Inside Vinyl Showcase section → hide
        setIsHidden(true);
      } else if (currentY < lastY - 4) {
        // Scrolling UP → reveal the bar
        setIsHidden(false);
      } else if (currentY > lastY + 4) {
        // Scrolling DOWN outside vinyl showcase → show (bar re-appears past it)
        setIsHidden(false);
      }

      lastY = currentY;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      rafId = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // ── Vinyl Showcase observer: bar hides when inside vinyl, shows after ─────
  const vinylRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = document.getElementById("vinyl-showcase-section");
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        setVinylVisible(e.isIntersecting);
      }
    }, { threshold: 0.01 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── Resolve thumbnail src for the active track (amber-stroked cover) ────
  // Shared hook — same resolution logic as PlaylistPanel, VinylShowcase, PatchBrowser.
  // Cancels in-flight resolution on track change automatically.
  const coverSrc = useResolvedThumbnail(activeTrack as any);

  // ── Helpers ─────────────────────────────────────────────────────────────
  const fmt = (sec: number) => {
    if (isNaN(sec) || !isFinite(sec) || !sec) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const trackName = (activeTrack as any)?.name || (activeTrack as any)?.title || "No track";
  const trackArtist =
    (activeTrack as any)?.gearTag || (activeTrack as any)?.artist || "—";

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-[#0c0c0c]/90 backdrop-blur-md border-t border-white/[0.08] shadow-[0_-20px_60px_rgba(0,0,0,0.7)] transition-all duration-300 ease-out ${
        isHidden ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
      role="region"
      aria-label="Audio transport bar"
      aria-hidden={isHidden}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 flex items-center gap-3 sm:gap-4 min-w-0">
        {/* ── Transport Controls (left) ──────────────────────────────────── */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => playPrevious?.()}
            aria-label="Previous track"
            className="w-8 h-8 rounded-full bg-white/[0.04] text-cyan-400 flex items-center justify-center hover:text-white hover:bg-white/[0.1] active:scale-95 transition shrink-0"
          >
            <SkipBack size={14} />
          </button>
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-200 shrink-0"
            style={{
              aspectRatio: "1/1",
              boxShadow:
                "0 0 15px rgba(0, 216, 246, 0.6), 0 0 4px rgba(0, 216, 246, 0.8)",
              animation: isPlaying
                ? "playPulse 2s ease-in-out infinite"
                : "none",
            }}
          >
            {isPlaying ? (
              <Pause size={18} className="shrink-0 text-slate-950" />
            ) : (
              <Play size={18} className="shrink-0 ml-0.5 text-slate-950" />
            )}
          </button>
          <button
            onClick={stop}
            aria-label="Stop"
            className="w-8 h-8 rounded-full bg-white/[0.04] text-cyan-400 flex items-center justify-center hover:text-white hover:bg-white/[0.1] active:scale-95 transition shrink-0"
          >
            <Square size={12} className="fill-current" />
          </button>
          <button
            onClick={() => playNext?.()}
            aria-label="Next track"
            className="w-8 h-8 rounded-full bg-white/[0.04] text-cyan-400 flex items-center justify-center hover:text-white hover:bg-white/[0.1] active:scale-95 transition shrink-0"
          >
            <SkipForward size={14} />
          </button>
        </div>

        {/* ── Album cover + track metadata + mini visualizer ─────────────── */}
        <div className="flex items-center gap-3 shrink min-w-0">
          <TrackThumbnailCard />
          <div className="hidden sm:flex flex-col min-w-0 shrink-1">
            <span className="text-sm font-bold text-white truncate leading-tight">
              {trackName}
            </span>
            <span className="text-[10px] font-mono text-cyan-400/70 uppercase tracking-wider truncate">
              {trackArtist}
            </span>
          </div>
          {/* Mini visualizer — same 150×36 footprint as FeaturedPlayer, click cycles bars→curve→waveform */}
          <div
            onClick={() => setMiniMode((prev) => (prev === "bars" ? "curve" : prev === "curve" ? "waveform" : "bars"))}
            className="hidden md:flex items-center justify-center cursor-pointer shrink-0 ml-2 rounded overflow-hidden transition-all duration-200 hover:brightness-110"
            title={`${miniMode === "bars" ? "Spec" : miniMode === "curve" ? "Curve" : "Osc"} — click to switch`}
            style={{ width: 150, height: 36, minWidth: 150, minHeight: 36, flexShrink: 0 }}
            aria-label="Cycle visualizer mode"
          >
            <MiniVisualizer
              analyserNode={analyserNode}
              isPlaying={isPlaying}
              mode={miniMode}
              width={150}
              height={36}
            />
          </div>
        </div>

        {/* ── Progress scrubber + timestamps (center) ────────────────────── */}
        <div className="flex-1 flex items-center gap-2 min-w-[120px] sm:min-w-[180px] max-w-md">
          <span className="text-[10px] font-mono text-neutral-500 tabular-nums w-8 text-right shrink-0">
            {fmt(currentTime)}
          </span>
          <div
            className="flex-1 h-1 bg-white/[0.08] rounded-full relative cursor-pointer group min-w-0"
            style={{ minHeight: 4 }}
          >
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-[width] duration-100"
              style={{
                background: "linear-gradient(90deg, #00d8f6 0%, #00a8c6 100%)",
                width: `${progress}%`,
                boxShadow: "0 0 8px rgba(0, 216, 246, 0.55)",
              }}
            />
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime || 0}
              onChange={(e) => seek(Number(e.target.value))}
              className="absolute inset-0 w-full h-6 -translate-y-1/2 top-1/2 opacity-0 cursor-pointer"
              aria-label="Seek"
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                left: `calc(${progress}% - 5px)`,
                boxShadow: "0 0 8px rgba(0, 216, 246, 0.9)",
              }}
            />
          </div>
          <span className="text-[10px] font-mono text-neutral-500 tabular-nums w-8 shrink-0">
            {fmt(duration)}
          </span>
        </div>

        {/* ── Volume + mute (right) ──────────────────────────────────────── */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
              isMuted
                ? "text-red-400 bg-red-500/10"
                : "text-cyan-400 hover:text-white"
            }`}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-16 sm:w-20 md:w-24 h-1 bg-white/[0.08] rounded-full appearance-none cursor-pointer accent-cyan-400"
            style={{
              background: `linear-gradient(to right, #00d8f6 0%, #00d8f6 ${
                volume * 100
              }%, rgba(255,255,255,0.1) ${volume * 100}%, rgba(255,255,255,0.1) 100%)`,
            }}
            aria-label="Volume"
          />
        </div>
      </div>

      {/* CSS animations — play button pulse + amber ring spin */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes playPulse {
          0%, 100% {
            box-shadow:
              0 0 15px rgba(0, 216, 246, 0.6),
              0 0 4px rgba(0, 216, 246, 0.8);
          }
          50% {
            box-shadow:
              0 0 22px rgba(0, 216, 246, 0.85),
              0 0 8px rgba(0, 216, 246, 1);
          }
        }
      `}</style>
    </div>
  );
}
