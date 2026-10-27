"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  ListMusic,
  Star,
  ChevronDown,
} from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import { deckControls } from "@/lib/audio/DeckControls";

function useTranslations(namespace: string) {
  const keys: Record<string, string> = {
    "AudioPlayer.noLyrics": "No lyrics",
    "AudioPlayer.add": "Add",
  };
  return (key: string) => keys[`${namespace}.${key}`] ?? key;
}

export interface Track {
  id?: string;
  title?: string;
  name?: string;
  artist?: string;
  author?: string;
  thumbnail?: string;
  coverUrl?: string;
  duration?: number;
}

interface AudioPlayerProps {
  track?: Track;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  onSkipBack?: () => void;
  onSkipForward?: () => void;
  onToggleRepeat?: () => void;
  onOpenQueue?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  isPowered?: boolean;
  repeatMode?: "off" | "all" | "one";
  mode?: "modal" | "embedded";
}

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

export default function AudioPlayer({
  track: propTrack,
  isPlaying: propPlaying,
  isPowered: propPowered,
  onPlayPause,
  onSkipBack,
  onSkipForward,
  onToggleRepeat,
  onOpenQueue,
  onToggleFavorite,
  isFavorite = false,
  repeatMode = 'off',
  mode,
}: AudioPlayerProps) {
  const {
    activeTrack,
    currentTrack,
    isPlaying: ctxPlaying,
    isPowered: ctxPowered,
    setIsPowered,
    togglePlay,
    togglePower,
    playNext,
    playPrevious,
    currentTime,
    duration,
    seek,
    audioRef,
  } = useAudio();

  const track = propTrack || (activeTrack as Track) || (currentTrack as Track) || null;
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const t = useTranslations("AudioPlayer");

  const playing = propPlaying ?? ctxPlaying ?? false;
  const isPoweredProp = propPowered !== undefined ? propPowered : (ctxPowered ?? false);

  const handlePlay = () => {
    try {
      if ((audioRef as any)?.context?.state === "suspended") {
        (audioRef as any).context.resume();
      }
    } catch { /* ignore browser gate */ }
    if (!isPoweredProp && setIsPowered) setIsPowered(true);
    deckControls.toggle();
    if (onPlayPause) onPlayPause(); else togglePlay();
  };

  // Power-on / resume Web Audio + turntable when playing from off
  // 3-state repeat cycle: off → all → one → off
  const cycleRepeat = () => {
    const next = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
    // In a real wired app you'd call setRepeatMode here. For now the parent prop controls state.
    if (onToggleRepeat) onToggleRepeat();
  };

  const thumbSrc =
    track?.thumbnail || track?.coverUrl || `/images/Thumbnails/${encodeURIComponent(track?.name || track?.title || "").trim()}.jpg`;

  const title = (track?.title || track?.name || "Unknown Track").trim();
  const artist = (track?.artist || track?.author || "Unknown Artist").trim();

  const progressValue = duration > 0 && isFinite(currentTime) ? Math.min(currentTime, duration) : 0;

  return (
    <>
      {/* Mobile overlay z-[100] */}
      <div className={`md:hidden ${mode === "embedded" ? "hidden" : ""}`}>
        {!isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(true)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-full bg-black/70 backdrop-blur-xl border border-white/10 shadow-2xl text-white text-sm font-medium hover:bg-black/80 transition-colors"
            aria-label="Open player"
          >
            <span className="w-2 h-2 rounded-full bg-brass animate-pulse" />
            <span className="truncate max-w-[200px]">{title}</span>
            <Play size={14} className="text-brass" />
          </button>
        )}

        {isMobileOpen && (
          <div
            className="fixed inset-0 z-[100] bg-[#0b0f19]/95 backdrop-blur-2xl overflow-y-auto flex flex-col"
            role="dialog"
            aria-label="Audio player"
            aria-modal="true"
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <button aria-label="Minimize" onClick={() => setIsMobileOpen(false)} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
                <ChevronDown className="w-6 h-6 text-white/90" />
              </button>
              <span className="text-xs font-mono tracking-[0.2em] uppercase text-white/40">Now Playing</span>
              <div className="w-10" />
            </div>

            <div className="flex-1 flex items-center justify-center px-8">
              <div className="relative w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(223,161,74,0.12)] ring-1 ring-white/10">
                {thumbSrc ? (
                  <Image src={thumbSrc} alt={title} fill className="object-cover" priority sizes="(max-width: 768px) 320px, 280px" />
                ) : (
                  <div className="w-full h-full bg-[#121619] rounded-md flex items-center justify-center"><ListMusic className="w-16 h-16 text-white/10" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
              </div>
            </div>

            <div className="px-6 pt-4 pb-2 text-center">
              <h2 className="text-2xl font-extrabold text-white tracking-tight leading-tight drop-shadow-lg">{title}</h2>
              <p className="text-sm text-white/60 mt-1">{artist}</p>
              <div className="flex items-center justify-end mt-2 gap-2">
                <button aria-label="Favorite" onClick={onToggleFavorite} className={`p-2 rounded-full transition-colors ${isFavorite ? "text-amber-400" : "text-white/40 hover:text-white/80"}`}>
                  <Star size={18} fill={isFavorite ? "currentColor" : "none"} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 px-6 pb-4">
              <span className="text-xs text-white/50 bg-white/10 px-3 py-1 rounded-full border border-white/20">{t("noLyrics")}</span>
              <button className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-medium capitalize text-white/70 hover:text-white hover:bg-white/20 transition-colors">{t("add")}</button>
            </div>

            <div className="px-6 pb-1">
              <input
                type="range" min={0} max={duration || 0} step={0.1} value={progressValue}
                onChange={(e) => seek(Number(e.target.value))}
                aria-label="Seek"
                className="w-full h-1 bg-white/20 rounded-full appearance-none accent-white cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(255,255,255,0.8)] hover:[&::-webkit-slider-thumb]:scale-125 transition-transform"
              />
              <div className="flex justify-between text-[11px] text-white/60 font-mono mt-1.5">
                <span>{fmtTime(currentTime || 0)}</span>
                <span>{fmtTime(duration || 0)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 px-6 pb-10 pt-2">
              <button
                type="button"
                aria-label="Toggle Repeat Mode"
                onClick={onToggleRepeat ?? cycleRepeat}
                className="relative p-2 rounded-full cursor-pointer pointer-events-auto text-white/50 hover:text-white transition-all active:scale-95"
              >
                {repeatMode === 'one' ? <Repeat1 className="w-5 h-5 text-white" /> : <Repeat className={`w-5 h-5 ${repeatMode === 'all' ? 'text-white' : ''}`} />}
              </button>
              <button aria-label="Previous" onClick={onSkipBack ?? playPrevious} className="text-white/50 hover:text-white transition-colors"><SkipBack size={28} strokeWidth={1.5} /></button>
              <button aria-label={playing ? "Pause" : "Play"} onClick={handlePlay} className="w-14 h-14 rounded-full bg-[#2a2a2a] hover:bg-[#333] flex items-center justify-center text-white transition-colors shadow-[0_0_30px_rgba(223,161,74,0.15)] hover:scale-105 active:scale-95">
                {playing ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" className="pl-1" />}
              </button>
              <button aria-label="Next" onClick={onSkipForward ?? playNext} className="text-white/50 hover:text-white transition-colors"><SkipForward size={28} strokeWidth={1.5} /></button>
              <button
                type="button"
                aria-label="Open Playlist Queue"
                onClick={onOpenQueue}
                className="p-2 rounded-full cursor-pointer pointer-events-auto text-white/50 hover:text-white transition-all active:scale-95"
              >
                <ListMusic className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop glassmorphic card */}
      <div className={`hidden md:block ${mode === "modal" ? "hidden" : ""}`}>
        <div className="w-full max-w-3xl mx-auto rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(223,161,74,0.08)] overflow-hidden p-4 md:px-6 md:py-4 flex flex-col md:flex-row items-center gap-4">
          {/* Album art */}
          <div className="shrink-0 w-20 h-20 md:w-24 md:h-24 relative rounded-md overflow-hidden ring-1 ring-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            {thumbSrc ? (
              <Image src={thumbSrc} alt={title} fill className="object-cover" priority sizes="96px" />
            ) : (
              <div className="w-full h-full bg-[#121619] rounded-md flex items-center justify-center"><ListMusic className="w-8 h-8 text-white/10" /></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />
          </div>

          {/* Info + controls */}
          <div className="flex-1 min-w-0 flex flex-col w-full">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="min-w-0">
                <h2 className="text-base font-bold text-white truncate">{title}</h2>
                <p className="text-xs text-white/60 truncate">{artist}</p>
              </div>
              <button aria-label="Favorite" onClick={onToggleFavorite} className={`shrink-0 p-2 rounded-full border border-white/10 transition-colors ${isFavorite ? "bg-amber-400/10 text-amber-400 border-amber-400/30" : "text-white/40 hover:text-white/80 hover:bg-white/5"}`}>
                <Star size={18} fill={isFavorite ? "currentColor" : "none"} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-white/50 bg-white/10 px-3 py-1 rounded-full border border-white/20">{t("noLyrics")}</span>
              <button className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-medium capitalize text-white/70 hover:text-white hover:bg-white/20 transition-colors">{t("add")}</button>
            </div>

            <div className="mb-2">
              <input
                type="range" min={0} max={duration || 0} step={0.1} value={progressValue}
                onChange={(e) => seek(Number(e.target.value))}
                aria-label="Seek"
                className="w-full h-1 bg-white/20 rounded-full appearance-none accent-white cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white transition-opacity hover:[&::-webkit-slider-thumb]:opacity-100 [&::-webkit-slider-thumb]:opacity-60"
              />
              <div className="flex justify-between text-[11px] text-white/60 font-mono mt-1">
                <span>{fmtTime(currentTime || 0)}</span>
                <span>{fmtTime(duration || 0)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-5 md:gap-6">
              <button
                type="button"
                aria-label="Toggle Repeat Mode"
                onClick={onToggleRepeat ?? cycleRepeat}
                className="relative p-2 rounded-full cursor-pointer pointer-events-auto text-white/50 hover:text-white transition-all active:scale-95"
              >
                {repeatMode === 'one' ? <Repeat1 className="w-5 h-5 text-white" /> : <Repeat className={`w-5 h-5 ${repeatMode === 'all' ? 'text-white' : ''}`} />}
              </button>
              <button aria-label="Previous" onClick={onSkipBack ?? playPrevious} className="text-white/50 hover:text-white transition-colors"><SkipBack size={28} strokeWidth={1.5} /></button>
              <button aria-label={playing ? "Pause" : "Play"} onClick={handlePlay} className="w-14 h-14 rounded-full bg-[#2a2a2a] hover:bg-[#333] flex items-center justify-center text-white transition-colors shadow-[0_0_30px_rgba(223,161,74,0.15)] hover:scale-105 active:scale-95">
                {playing ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" className="pl-1" />}
              </button>
              <button aria-label="Next" onClick={onSkipForward ?? playNext} className="text-white/50 hover:text-white transition-colors"><SkipForward size={28} strokeWidth={1.5} /></button>
              <button
                type="button"
                aria-label="Open Playlist Queue"
                onClick={onOpenQueue}
                className="p-2 rounded-full cursor-pointer pointer-events-auto text-white/50 hover:text-white transition-all active:scale-95"
              >
                <ListMusic className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
