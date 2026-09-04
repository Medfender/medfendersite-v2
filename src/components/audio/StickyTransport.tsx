"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Play, Pause, Square, SkipBack, SkipForward, Volume2, VolumeX, Disc3 } from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import { useResolvedThumbnail } from "@/lib/audio/thumbnailResolver";
import { deckControls } from "@/lib/audio/DeckControls";
import MiniVisualizer from "./MiniVisualizer";

// ─── Album cover card — the signature amber-stroked thumbnail ────────────
interface CoverCardProps {
  src: string | null;
  name: string;
  isPlaying: boolean;
  onClick?: () => void;
}

function CoverCard({ src, name, isPlaying, onClick }: CoverCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState(false);

  return (
    <button
      className="relative shrink-0 rounded-lg overflow-hidden border-2 border-amber-500/70 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 focus:ring-offset-[#0c0c0c] hover:scale-105 active:scale-95 transition-transform duration-200"
      style={{
        width: 40,
        height: 40,
        flex: "0 0 40px",
        boxShadow:
          "0 0 14px rgba(245, 158, 11, 0.45), 0 0 4px rgba(245, 158, 11, 0.7), inset 0 0 0 1px rgba(245, 158, 11, 0.15)",
        background: "none",
        padding: 0,
      }}
      aria-label={`Cover art for ${name} — click to open track`}
      onClick={onClick}
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
    </button>
  );
}

// ─── Main StickyTransport ────────────────────────────────────────────────
export default function StickyTransport() {
  const {
    isPlaying,
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
  const [isReviewOpen, setIsReviewOpen] = useState(false);

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
    <>
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-[#0c0c0c]/90 backdrop-blur-md border-t border-white/[0.08] shadow-[0_-20px_60px_rgba(0,0,0,0.7)] transition-all duration-300 ease-out ${
        isHidden ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
      role="region"
      aria-label="Audio transport bar"
      aria-hidden={isHidden}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-2 flex items-center gap-3 sm:gap-4 min-w-0">
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
            onClick={() => {
              // Same play/pause toggle as the turntable's play/pause button — delegates
              // to deckControls so the tonearm choreography fires. The registered
              // handlers handle: powered-off → power on + play, playing → paused,
              // paused/stopped → playing. Never goes to stopped.
              deckControls.toggle();
            }}
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
            onClick={() => {
              // Route through turntable choreography — preserves the lift/rotate/rest
              // animation that the deck's own Stop button drives.
              deckControls.stop();
            }}
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

        {/* ── Album cover card (amp-style, floating, clickable) ─────────── */}
        <div className="flex items-center gap-3 shrink min-w-0">
          {/* Amp-style floating card — amber-stroked, spinning ring when playing */}
          <CoverCard
            src={coverSrc}
            name={trackName}
            isPlaying={isPlaying}
            onClick={() => setIsReviewOpen(true)}
          />
          {/* Track metadata */}
          <div className="hidden sm:flex flex-col min-w-0 shrink-1" style={{ width: 160, minWidth: 160, maxWidth: 160 }}>
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
            style={{ width: 120, height: 32, minWidth: 120, minHeight: 32, flexShrink: 0 }}
            aria-label="Cycle visualizer mode"
          >
            <MiniVisualizer
              analyserNode={analyserNode}
              isPlaying={isPlaying}
              mode={miniMode}
              width={120}
              height={32}
            />
          </div>
        </div>

        {/* ── Progress scrubber + timestamps (center) ────────────────────── */}
        <div className="flex-1 flex items-center gap-2 min-w-[120px] sm:min-w-[160px] md:min-w-[200px] max-w-sm">
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

    {/* ── Amp-Style Review Card Modal ───────────── */}
    {isReviewOpen && typeof document !== "undefined" && createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md" onClick={() => setIsReviewOpen(false)} role="dialog" aria-modal="true" aria-label="Track review">
        <div onClick={e=>e.stopPropagation()} className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.95)] border border-white/[0.06]" style={{background:"linear-gradient(160deg,#2a2a2a 0%,#1c1c1c 40%,#141414 100%)"}}>
          <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-zinc-700 border border-zinc-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] z-10"/>
          <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-zinc-700 border border-zinc-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] z-10"/>
          <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-zinc-700 border border-zinc-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] z-10"/>
          <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-zinc-700 border border-zinc-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] z-10"/>
          <div className="px-6 pt-8 pb-4 border-b border-black/40" style={{background:"linear-gradient(180deg,rgba(255,255,255,0.03) 0%,transparent 100%)"}}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-1">{["bg-amber-500","bg-amber-400","bg-zinc-600","bg-zinc-700","bg-zinc-800"].map((c,i)=><div key={i} className={`w-1 h-3 rounded-full ${c}`}/>)}</div>
              <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-amber-500/80">♪ Featured Track ♪</p>
              <div className="flex gap-1">{["bg-amber-500","bg-zinc-800","bg-zinc-700","bg-amber-400","bg-zinc-600"].map((c,i)=><div key={i} className={`w-1 h-3 rounded-full ${c}`}/>)}</div>
            </div>
            <div className="relative p-2 rounded-lg overflow-hidden" style={{background:"repeating-linear-gradient(90deg,#111 0px,#111 3px,transparent 3px,transparent 7px),repeating-linear-gradient(0deg,#111 0px,#111 3px,transparent 3px,transparent 7px)",boxShadow:"inset 0 0 20px rgba(0,0,0,0.8),inset 0 0 4px rgba(0,0,0,0.6)"}}>
              <div className="relative w-full aspect-square bg-black rounded-md overflow-hidden" style={{boxShadow:"inset 0 4px 16px rgba(0,0,0,0.9),inset 0 0 2px rgba(0,0,0,0.5)"}}>
                <div className="absolute inset-0 rounded-md bg-gradient-to-b from-white/[0.03] via-transparent to-black/60 pointer-events-none z-10"/>
                <img src={coverSrc||""} alt={trackName} className="w-full h-full object-cover rounded-sm"/>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center px-6 py-6 space-y-4" style={{background:"linear-gradient(0deg,rgba(0,0,0,0.2) 0%,transparent 60%)"}}>
            <div className="flex gap-6">{[0,1,2].map(i=>
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="relative w-7 h-10 rounded-t-[14px] rounded-b-sm overflow-hidden" style={{background:"linear-gradient(180deg,#1a1a1a 0%,#0a0a0a 100%)",boxShadow:`0 0 ${12+i*4}px rgba(255,140,0,0.35)`}}>
                  <div className="absolute inset-2 top-1 rounded-sm opacity-20" style={{background:"repeating-linear-gradient(0deg,#888 0px,#888 1px,transparent 1px,transparent 3px),repeating-linear-gradient(90deg,#888 0px,#888 1px,transparent 1px,transparent 3px)"}}/>
                  <div className="absolute bottom-0 inset-x-1 h-2 rounded-b-sm" style={{background:"radial-gradient(ellipse at center bottom,rgba(255,120,0,0.8) 0%,rgba(255,60,0,0.4) 50%,transparent 100%)"}}/>
                </div>
                <div className="w-6 h-1.5 rounded-sm bg-zinc-800 border border-zinc-900"/>
              </div>
            )}</div>
            <button onClick={()=>setIsReviewOpen(false)} className="px-4 py-1 rounded-full text-xs font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition" aria-label="Close review">Close</button>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">{trackName||"No Track"}</p>
          </div>
        </div>
      </div>, document.body
    )}
    </>
  );
}
