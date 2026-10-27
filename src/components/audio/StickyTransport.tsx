"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Volume2, VolumeX, Disc3 } from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import { useResolvedThumbnail } from "@/lib/audio/thumbnailResolver";
import { deckControls } from "@/lib/audio/DeckControls";
import MiniVisualizer from "./MiniVisualizer";

// ─── Album cover card — flat, sharp thumbnail (no rounded corners, no glow) ─
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
      className="relative shrink-0 overflow-hidden border border-white/10 cursor-pointer focus:outline-none focus:border-white/30 hover:border-white/25 active:scale-[0.98] transition-all duration-150 rounded-none"
      style={{
        width: 40,
        height: 40,
        flex: "0 0 40px",
        background: "none",
        padding: 0,
      }}
      aria-label={`Cover art for ${name} — click to open track`}
      onClick={onClick}
    >
      {/* Hairline playing indicator (no glow, no rounded ring) */}
      {isPlaying && (
        <div
          className="absolute top-0 left-0 right-0 h-[1px] z-10 pointer-events-none"
          style={{ background: "rgba(255,255,255,0.85)" }}
          aria-hidden
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
        <div className="w-full h-full flex items-center justify-center bg-[#121619]">
          <Disc3 size={16} className="text-cream/55" strokeWidth={1} />
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

  // Scroll-aware visibility: bar appears at the top of the page (above the
  // turntable hero) and slides down off-screen once the user scrolls past the
  // hero threshold. Scroll back up to reveal it again.
  const [isBarVisible, setIsBarVisible] = useState(true);
  const [miniMode, setMiniMode] = useState<"bars" | "curve" | "waveform">("bars");
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const volumePopRef = useRef<HTMLDivElement | null>(null);

  // Threshold roughly equals the height of the hero / turntable area —
  // past this point the bar slides off-screen.
  const HIDE_THRESHOLD_PX = 600;

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === "undefined") return;
      if (window.scrollY > HIDE_THRESHOLD_PX) {
        setIsBarVisible(false);
      } else {
        setIsBarVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Trigger once on mount to set the initial state
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close volume popover on outside tap / Escape
  useEffect(() => {
    if (!volumeOpen) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (!volumePopRef.current) return;
      if (!volumePopRef.current.contains(e.target as Node)) setVolumeOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setVolumeOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [volumeOpen]);

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
      className={`fixed bottom-0 left-0 right-0 z-50 h-14 bg-black/95 backdrop-blur-md flex items-center justify-between px-4 border-none shadow-none transition-transform duration-500 ease-out ${
        isBarVisible ? "translate-y-0" : "translate-y-full"
      }`}
      role="region"
      aria-label="Audio transport bar"
      aria-hidden={!isBarVisible}
    >
      <div className="max-w-7xl mx-auto flex items-center gap-3 sm:gap-4 md:gap-6 min-w-0 justify-between w-full">
        {/* ── Transport Controls — precision studio style ─────────────────── */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Prev */}
          <button
            onClick={() => playPrevious?.()}
            aria-label="Previous track"
            className="text-cream/55 hover:text-zinc-200 transition-colors p-1 active:scale-95"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden>
              <polygon points="19 20 9 12 19 4 19 20" />
              <line x1="5" y1="19" x2="5" y2="5" />
            </svg>
          </button>

          {/* Play / Pause — precision wireframe ring */}
          <button
            onClick={() => { deckControls.toggle(); }}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="w-7 h-7 rounded-full border border-zinc-600 hover:border-zinc-200 text-[#A1A8A3] hover:text-white flex items-center justify-center transition-all active:scale-95"
          >
            {isPlaying ? (
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 translate-x-[0.5px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>

          {/* Stop — bare, no fill */}
          <button
            onClick={() => { deckControls.stop(); }}
            aria-label="Stop"
            className="text-cream/55 hover:text-zinc-200 transition-colors p-1 active:scale-95"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden>
              <rect x="5" y="5" width="14" height="14" />
            </svg>
          </button>

          {/* Next */}
          <button
            onClick={() => playNext?.()}
            aria-label="Next track"
            className="text-cream/55 hover:text-zinc-200 transition-colors p-1 active:scale-95"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden>
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </button>
        </div>

        {/* ── Album cover + track info (left-center) ─────────────────────── */}
        <div className="flex items-center gap-3 shrink min-w-0 flex-1 sm:flex-initial">
          <CoverCard
            src={coverSrc}
            name={trackName}
            isPlaying={isPlaying}
            onClick={() => setIsReviewOpen(true)}
          />
          {/* Track metadata — synced with PlaylistPanel typography */}
          <div className="flex flex-col min-w-0 shrink max-w-[160px] lg:max-w-[260px]">
            <span className="text-sm font-semibold truncate leading-tight text-neutral-200">
              {trackName}
            </span>
            <span className="text-[10px] font-mono text-cream/55 truncate">
              {trackArtist}
            </span>
          </div>
          {/* Mini visualizer — same 150×36 footprint as FeaturedPlayer, click cycles bars→curve→waveform */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setMiniMode((prev) => (prev === "bars" ? "curve" : prev === "curve" ? "waveform" : "bars"))}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setMiniMode((prev) => (prev === "bars" ? "curve" : prev === "curve" ? "waveform" : "bars"));
              }
            }}
            className="hidden md:flex items-center justify-center cursor-pointer shrink-0 ml-2 transition-all duration-200 hover:brightness-110"
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

        {/* ── Center: ultra-thin 2px hairline progress track ─────────────── */}
        <div className="flex-1 flex items-center gap-3 min-w-0 sm:min-w-[200px] md:min-w-[260px] max-w-md">
          <span className="hidden sm:inline-block text-xs text-cream/55 font-mono tabular-nums w-8 text-right shrink-0">
            {fmt(currentTime)}
          </span>
          <div
            className="flex-1 h-[2px] bg-zinc-800 relative cursor-pointer group min-w-0"
            onClick={(e) => {
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              seek(ratio * duration);
            }}
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={duration || 0}
            aria-valuenow={currentTime || 0}
          >
            <div
              className="h-full bg-zinc-300 transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-none opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ left: `${progress}%`, transform: "translate(-50%, -50%)" }}
            />
          </div>
          <span className="hidden sm:inline-block text-xs text-cream/55 font-mono tabular-nums w-8 shrink-0">
            {fmt(duration)}
          </span>
        </div>

        {/* ── Right: volume + auxiliary controls ────────────────────────── */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 relative" ref={volumePopRef}>
          {/* Desktop: hairline inline volume track (mirrors progress bar) */}
          <div
            className="hidden sm:block w-16 md:w-20 h-[2px] bg-zinc-800 relative cursor-pointer group"
            onClick={(e) => {
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              setVolume(ratio);
            }}
            role="slider"
            aria-label="Volume"
            aria-valuemin={0}
            aria-valuemax={1}
            aria-valuenow={volume}
          >
            <div
              className="h-full bg-zinc-300 transition-all duration-75"
              style={{ width: `${Math.round(volume * 100)}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-none opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ left: `${Math.round(volume * 100)}%`, transform: "translate(-50%, -50%)" }}
            />
          </div>
          <span className="hidden md:inline-block text-xs text-cream/55 font-mono tabular-nums w-7 shrink-0">
            {Math.round(volume * 100)}%
          </span>
          {/* Mute toggle — flat icon, no pill */}
          <button
            onClick={() => { toggleMute(); setVolumeOpen(false); }}
            aria-label={isMuted ? "Unmute" : "Mute"}
            className={`w-8 h-8 flex items-center justify-center transition-colors active:scale-90 ${
              isMuted ? "text-cream/55 hover:text-zinc-200" : "text-cream/55 hover:text-zinc-200"
            }`}
          >
            {isMuted ? <VolumeX size={14} strokeWidth={1.25} /> : <Volume2 size={14} strokeWidth={1.25} />}
          </button>
          {/* Mobile: tap-to-open volume popover trigger (vertical bars icon) */}
          <button
            onClick={() => setVolumeOpen((o) => !o)}
            aria-label="Open volume control"
            aria-expanded={volumeOpen}
            className="sm:hidden w-8 h-8 flex items-center justify-center text-cream/55 hover:text-zinc-200 transition-colors active:scale-90"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <rect x="1" y="5" width="2" height="4" fill="currentColor" opacity="0.6"/>
              <rect x="4" y="3" width="2" height="8" fill="currentColor" opacity="0.85"/>
              <rect x="7" y="1" width="2" height="12" fill="currentColor"/>
            </svg>
          </button>
          {/* Volume popover — vertical hairline track above the bar */}
          {volumeOpen && (
            <div className="absolute bottom-full right-0 mb-2 flex flex-col items-center gap-2 p-3 bg-black/95 backdrop-blur-md border border-white/10 z-[60]">
              <div
                className="w-[2px] h-24 bg-zinc-800 relative cursor-pointer group"
                onClick={(e) => {
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                  const ratio = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
                  setVolume(ratio);
                }}
                role="slider"
                aria-label="Volume"
                aria-valuemin={0}
                aria-valuemax={1}
                aria-valuenow={volume}
              >
                <div
                  className="absolute bottom-0 left-0 w-full bg-zinc-300 transition-all duration-75"
                  style={{ height: `${Math.round(volume * 100)}%` }}
                />
                <div
                  className="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-none opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ bottom: `${Math.round(volume * 100)}%`, transform: "translate(-50%, 50%)" }}
                />
              </div>
              <span className="text-xs font-mono text-cream/55 tabular-nums">{Math.round(volume * 100)}%</span>
            </div>
          )}
        </div>
      </div>

    </div>

    {/* ── Amp-Style Review Card Modal ───────────── */}
    {isReviewOpen && typeof document !== "undefined" && createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md" onClick={() => setIsReviewOpen(false)} role="dialog" aria-modal="true" aria-label="Track review">
        <div onClick={e=>e.stopPropagation()} className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.95)] border border-white/[0.06]" style={{background:"linear-gradient(160deg,#2a2a2a 0%,#1c1c1c 40%,#141414 100%)"}}>
          <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-zinc-700 border border-white/[0.06] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] z-10"/>
          <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-zinc-700 border border-white/[0.06] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] z-10"/>
          <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-zinc-700 border border-white/[0.06] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] z-10"/>
          <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-zinc-700 border border-white/[0.06] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] z-10"/>
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
                <div className="w-6 h-1.5 rounded-sm bg-zinc-800 border border-white/[0.06]"/>
              </div>
            )}</div>
            <button onClick={()=>setIsReviewOpen(false)} className="px-4 py-1 rounded-full text-xs font-mono text-brass-light bg-brass/10 border border-brass/20 hover:bg-brass/20 transition" aria-label="Close review">Close</button>
            <p className="text-[10px] font-bold text-[#A1A8A3] uppercase tracking-[0.2em]">{trackName||"No Track"}</p>
          </div>
        </div>
      </div>, document.body
    )}
    </>
  );
}
