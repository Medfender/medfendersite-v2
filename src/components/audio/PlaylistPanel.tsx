"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import { useResolvedThumbnail } from "@/lib/audio/thumbnailResolver";
import { deckControls } from "@/lib/audio/DeckControls";

function Thumbnail({ src, size = 32, accent = "cyan" }: { src: string | null; size?: number; accent?: "cyan" | "amber" }) {
  const [err, setErr] = useState(false);
  const ring = accent === "amber" ? "border-amber-500/40 shadow-[0_0_6px_rgba(245,158,11,0.3)]" : "border-brass/30 shadow-[0_0_6px_rgba(223,161,74,0.25)]";
  return (
    <div className={`relative shrink-0 rounded-sm overflow-hidden border ${ring} bg-[#0e0e12]`} style={{ width: size, height: size }} aria-hidden>
      {src && !err ? <img src={src} alt="" className="w-full h-full object-cover" onError={() => setErr(true)} /> : <div className="w-full h-full flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-neutral-700" /></div>}
    </div>
  );
}

// Simple in-memory cache so the same track URL isn't decoded twice across re-renders / re-mounts.
const waveformCache = new Map<string, number[]>();

/**
 * Fetches an audio file, decodes it via the Web Audio API, and maps the raw
 * PCM data into `numBars` density peaks. Globally normalized so the loudest
 * moment in the track fills the bar at 100%.
 */
async function extractRealWaveform(audioUrl: string, numBars = 150): Promise<number[]> {
  if (waveformCache.has(audioUrl)) return waveformCache.get(audioUrl)!;
  try {
    const response = await fetch(audioUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    const AudioCtor: typeof AudioContext | undefined =
      (typeof window !== "undefined" && (window.AudioContext || (window as any).webkitAudioContext)) || undefined;
    if (!AudioCtor) throw new Error("Web Audio API unavailable");
    const audioContext = new AudioCtor();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    try { audioContext.close(); } catch { /* noop */ }

    const channelData = audioBuffer.getChannelData(0);
    const blockSize = Math.max(1, Math.floor(channelData.length / numBars));
    const peaks: number[] = [];
    let globalMax = 0;

    for (let i = 0; i < numBars; i++) {
      const start = blockSize * i;
      let localPeak = 0;
      const end = Math.min(channelData.length, start + blockSize);
      for (let j = start; j < end; j++) {
        const v = Math.abs(channelData[j]);
        if (v > localPeak) localPeak = v;
      }
      peaks.push(localPeak);
      if (localPeak > globalMax) globalMax = localPeak;
    }

    if (globalMax === 0) {
      // Silent or near-silent track — return flat fallback.
      const flat = Array(numBars).fill(15);
      waveformCache.set(audioUrl, flat);
      return flat;
    }

    const normalized = peaks.map((p) => Math.max(10, (p / globalMax) * 100));
    waveformCache.set(audioUrl, normalized);
    return normalized;
  } catch (err) {
    console.warn("extractRealWaveform failed for", audioUrl, err);
    const fallback = Array(numBars).fill(15);
    waveformCache.set(audioUrl, fallback);
    return fallback;
  }
}

export default function PlaylistPanel({ onSeek }: { onSeek?: (percentage: number) => void } = {}) {
  const { playlist, activeTrack, isPlaying, playTrack, currentTime, duration } = useAudio();
  const activeCoverSrc = useResolvedThumbnail(activeTrack as any);

  const handlePlaylistSelect = (track: any) => {
    if (!track) return;
    const candidate = {
      id: track.id,
      name: track.name || track.title,
      gearTag: track.gearTag || track.artist,
      audioUrl: track.audioUrl || track.url || track.src,
      thumbnail: track.thumbnail || track.coverUrl || undefined,
    };
    playTrack(candidate as any);
    deckControls.play();
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Active-track hero — minimal, flat, no box */}
      {activeTrack && (
        <div className="flex items-center gap-3 px-2 py-3 border-b border-white/[0.06]/50">
          <Thumbnail src={activeCoverSrc} size={48} accent="amber" />
          <div className="min-w-0 flex-1">
            <div className="text-[9px] font-mono text-cream/55 uppercase tracking-[0.2em]">Active</div>
            <div className="text-sm font-bold text-white truncate">{(activeTrack as any).name || (activeTrack as any).title}</div>
            <div className="text-[10px] font-mono text-cream/55 truncate">{(activeTrack as any).gearTag || (activeTrack as any).artist}</div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-2 pt-3 pb-1">
        <h3 className="text-[10px] font-mono uppercase tracking-[0.25em] text-cream/55">Playlist</h3>
        <span className="text-[10px] font-mono text-cream/55">{playlist.length} tracks</span>
      </div>

      {/* Flat full-width rows — no gap, border-separated */}
      <div className="flex flex-col">
        {playlist.map((track, idx) => {
          const isActive = (activeTrack as any)?.id === track.id;
          return (
            <PlaylistRow
              key={track.id}
              index={idx + 1}
              track={track}
              isActive={isActive}
              isPlaying={isPlaying && isActive}
              progressPercent={isActive ? progressPercent : 0}
              onClick={() => handlePlaylistSelect(track)}
              onSeek={onSeek}
            />
          );
        })}
        {playlist.length === 0 && <p className="text-cream/55 text-xs py-6 text-center">No tracks loaded.</p>}
      </div>
    </div>
  );
}

function PlaylistRow({
  index,
  track,
  isActive,
  isPlaying,
  progressPercent,
  onClick,
  onSeek,
}: {
  index: number;
  track: any;
  isActive: boolean;
  isPlaying: boolean;
  progressPercent: number;
  onClick: () => void;
  onSeek?: (percentage: number) => void;
}) {
  const coverSrc = useResolvedThumbnail(track);

  // Real waveform — decodes the audio file on mount / when URL changes.
  const audioUrl = (track as any)?.url || (track as any)?.audioUrl || (track as any)?.src || null;
  const [waveData, setWaveData] = useState<number[]>(Array(150).fill(10));

  useEffect(() => {
    let mounted = true;
    if (audioUrl) {
      extractRealWaveform(audioUrl, 150).then((peaks) => {
        if (mounted) setWaveData(peaks);
      });
    }
    return () => { mounted = false; };
  }, [audioUrl]);

  const durStr = (track as any).duration || "0:00";

  return (
    <div
      onClick={onClick}
      className="w-full flex flex-col border-b border-white/[0.06]/40 py-3 transition-colors hover:bg-white/[0.02] cursor-pointer group"
    >
      {/* Row info line */}
      <div className="flex items-center justify-between w-full px-2">
        {/* Left: index + thumb + title/sub */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-xs text-cream/55 font-mono w-7 shrink-0">{String(index).padStart(2, "0")}</span>
          <Thumbnail src={coverSrc} size={36} accent={isActive ? "cyan" : "amber"} />
          <div className="min-w-0 flex-1">
            <h4 className={`text-sm font-semibold truncate ${isActive ? "text-brass-light" : "text-neutral-200"}`}>
              {(track as any).name || (track as any).title || "Untitled"}
            </h4>
            <p className="text-[10px] text-cream/55 truncate font-mono">{(track as any).gearTag || (track as any).artist || "—"}</p>
          </div>
        </div>

        {/* Center-right: minimalist circular play/pause */}
        <div className="flex items-center gap-3 shrink-0 ml-2">
          <button
            aria-label={isPlaying ? "Pause" : "Play"}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
              isActive
                ? "border-zinc-400 text-zinc-200"
                : "border-zinc-700 text-[#A1A8A3] opacity-0 group-hover:opacity-100 hover:border-zinc-500 hover:text-white"
            }`}
          >
            {isPlaying ? <Pause size={12} strokeWidth={1.5} /> : <Play size={12} strokeWidth={1.5} className="ml-0.5" />}
          </button>
          <span className="text-xs text-cream/55 font-mono w-10 text-right">{durStr}</span>
        </div>
      </div>

      {/* Dense waveform — only when this track is active. Click-to-seek. */}
      {isActive && (
        <div
          className="w-full h-6 relative flex items-center justify-between gap-[1px] mt-3 mb-1 px-2 cursor-pointer group"
          onClick={(e) => {
            if (!onSeek) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            onSeek(percent);
          }}
        >
          <div className="w-full h-full relative flex items-center justify-between gap-[1px]">
            {waveData.map((h, i) => {
              const barPct = (i / (waveData.length - 1)) * 100;
              const played = barPct <= progressPercent;
              return (
                <div
                  key={i}
                  className={`w-[1px] rounded-none transition-colors duration-75 ${played ? "bg-zinc-300" : "bg-zinc-800"}`}
                  style={{ height: `${Math.max(30, h * 0.7)}%` }}
                />
              );
            })}
          </div>
          {/* 1px white playhead scrubber */}
          <div
            className="absolute top-0 bottom-0 w-[1px] bg-white z-10 pointer-events-none"
            style={{ left: `${Math.min(100, Math.max(0, progressPercent))}%`, boxShadow: "0 0 3px rgba(255,255,255,0.6)" }}
          />
        </div>
      )}
    </div>
  );
}
