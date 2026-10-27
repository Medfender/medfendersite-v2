"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import { useResolvedThumbnail } from "@/lib/audio/thumbnailResolver";
import { deckControls } from "@/lib/audio/DeckControls";

function Thumbnail({ src, size = 32, active = false }: { src: string | null; size?: number; active?: boolean }) {
  const [err, setErr] = useState(false);
  const ring = active ? "border-brass/70" : "border-cream/15";
  return (
    <div
      className={`relative shrink-0 overflow-hidden border ${ring} bg-ink-deep`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {src && !err ? (
        <img src={src} alt="" className="h-full w-full object-cover" onError={() => setErr(true)} />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-1.5 w-1.5 rounded-full bg-cream/25" />
        </div>
      )}
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
        <div className="flex items-center gap-3 border-b border-[var(--rule-ink)] px-2 py-3">
          <Thumbnail src={activeCoverSrc} size={48} active />
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-brass">Active</div>
            <div className="truncate text-sm font-semibold text-cream">{(activeTrack as any).name || (activeTrack as any).title}</div>
            <div className="truncate font-mono text-[10px] text-cream/60">{(activeTrack as any).gearTag || (activeTrack as any).artist}</div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-2 pt-3 pb-1">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.25em] text-cream/65">Playlist</h3>
        <span className="font-mono text-[10px] text-cream/60">{playlist.length} tracks</span>
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
        {playlist.length === 0 && <p className="py-6 text-center text-xs text-cream/60">No tracks loaded.</p>}
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

  const durStr: string | undefined = (track as any).duration;

  return (
    <div
      onClick={onClick}
      className="group flex w-full cursor-pointer flex-col border-b border-[var(--rule-ink-soft)] py-3 transition-colors hover:bg-cream/[0.03]"
    >
      {/* Row info line */}
      <div className="flex items-center justify-between w-full px-2">
        {/* Left: index + thumb + title/sub */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="w-7 shrink-0 font-mono text-xs tabular-nums text-cream/60">{String(index).padStart(2, "0")}</span>
          <Thumbnail src={coverSrc} size={36} active={isActive} />
          <div className="min-w-0 flex-1">
            <h4 className={`truncate text-sm font-semibold ${isActive ? "text-brass-light" : "text-cream/90"}`}>
              {(track as any).name || (track as any).title || "Untitled"}
            </h4>
            <p className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-cream/60">{(track as any).gearTag || (track as any).artist || "—"}</p>
          </div>
        </div>

        {/* Center-right: minimalist circular play/pause */}
        <div className="flex items-center gap-3 shrink-0 ml-2">
          <button
            aria-label={isPlaying ? "Pause" : "Play"}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
              isActive
                ? "border-brass/60 bg-brass/10 text-cream"
                : "border-cream/20 text-cream/60 opacity-0 group-hover:opacity-100 hover:border-brass/50 hover:text-cream"
            }`}
          >
            {isPlaying ? <Pause size={12} strokeWidth={1.5} /> : <Play size={12} strokeWidth={1.5} className="ml-0.5" />}
          </button>
          {durStr ? (
            <span className="w-10 text-right font-mono text-xs tabular-nums text-cream/60">
              {durStr}
            </span>
          ) : null}
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
                  className={`w-[1px] transition-colors duration-75 ${played ? "bg-brass/85" : "bg-cream/20"}`}
                  style={{ height: `${Math.max(30, h * 0.7)}%` }}
                />
              );
            })}
          </div>
          {/* 1px white playhead scrubber */}
          <div
            className="pointer-events-none absolute bottom-0 top-0 z-10 w-[1px] bg-brass-light"
            style={{ left: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      )}
    </div>
  );
}
