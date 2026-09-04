"use client";

import React, { useState } from "react";
import { Play } from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import { useResolvedThumbnail } from "@/lib/audio/thumbnailResolver";

// ── Small thumbnail card (re-used for both active track hero and per-row chips) ──
function Thumbnail({ src, size = 32, accent = "cyan" }: { src: string | null; size?: number; accent?: "cyan" | "amber" }) {
  const [err, setErr] = useState(false);
  const borderColor = accent === "amber" ? "border-amber-500/50" : "border-cyan-500/40";
  const ringShadow = accent === "amber"
    ? "0 0 6px rgba(245,158,11,0.35)"
    : "0 0 6px rgba(0,216,246,0.3)";
  return (
    <div
      className={`relative shrink-0 rounded-md overflow-hidden border ${borderColor} bg-[#0e0e12]`}
      style={{ width: size, height: size, boxShadow: ringShadow }}
      aria-hidden
    >
      {src && !err ? (
        <img
          src={src}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setErr(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-neutral-700" />
        </div>
      )}
    </div>
  );
}

export default function PlaylistPanel() {
  const {
    playlist,
    activeTrack,
    isPlaying,
    playTrack,
  } = useAudio();

  // Resolve thumbnails for active track (hero card) and for each row
  const activeCoverSrc = useResolvedThumbnail(activeTrack as any);

  // Route through the central playTrack so the 3D turntable, sticky transport,
  // spectrum analyzer, and active-track state all update from the same source.
  // Direct DOM src/load/play() calls here previously drifted the rest of the
  // page out of sync with the playlist selection.
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
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Active-track hero with live-resolved thumbnail */}
      {activeTrack && (
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-cyan-500/[0.05] border border-cyan-500/30">
          <Thumbnail src={activeCoverSrc} size={48} accent="amber" />
          <div className="min-w-0 flex-1">
            <div className="text-[9px] font-mono text-cyan-400/70 uppercase tracking-[0.2em]">Now playing</div>
            <div className="text-sm font-bold text-white truncate">
              {(activeTrack as any).name || (activeTrack as any).title}
            </div>
            <div className="text-[10px] font-mono text-amber-400/80 truncate">
              {(activeTrack as any).gearTag || (activeTrack as any).artist}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-xs tracking-widest text-gray-500 font-semibold uppercase">Playlist</h3>
        <span className="text-[10px] font-mono text-neutral-600">{playlist.length} tracks</span>
      </div>
      {/* Invisible escalator: hidden scrollbar, scrollable via mouse wheel / trackpad / touch */}
      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[360px] pr-1 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {playlist.map((track) => {
          const isActive = (activeTrack as any)?.id === track.id;
          return (
            <PlaylistRow
              key={track.id}
              track={track}
              isActive={isActive}
              isPlaying={isPlaying}
              onClick={() => handlePlaylistSelect(track)}
            />
          );
        })}
        {playlist.length === 0 && (
          <p className="text-gray-600 text-xs p-4 text-center">No tracks loaded.</p>
        )}
      </div>
    </div>
  );
}

// ── Per-row component so each row resolves its own thumbnail without forcing
//    the whole list to re-render when the active track changes ──
function PlaylistRow({
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
    <div
      onClick={onClick}
      className={`flex items-center justify-between gap-3 p-2.5 rounded-lg cursor-pointer transition-all group ${
        isActive
          ? "bg-cyan-500/[0.08] border border-cyan-500/30"
          : "hover:bg-white/[0.03] border border-transparent"
      }`}
    >
      <Thumbnail src={coverSrc} size={32} accent={isActive ? "cyan" : "amber"} />
      <div className="min-w-0 flex-1">
        <h4 className={`text-sm font-semibold truncate ${isActive ? "text-cyan-300" : "text-gray-200"}`}>
          {(track as any).name || (track as any).title || "Untitled"}
        </h4>
        <p className="text-[10px] text-gray-500 truncate font-mono">
          {(track as any).gearTag || (track as any).artist}
        </p>
      </div>
      <div className="flex items-center gap-2 ml-1 shrink-0">
        {isActive && isPlaying ? (
          <div className="flex gap-0.5 h-4 items-end">
            <div className="w-0.5 bg-cyan-400 h-full animate-pulse rounded-full" />
            <div className="w-0.5 bg-cyan-400 h-2/3 animate-pulse rounded-full" style={{ animationDelay: "0.15s" }} />
            <div className="w-0.5 bg-cyan-400 h-4/5 animate-pulse rounded-full" style={{ animationDelay: "0.3s" }} />
          </div>
        ) : isActive ? (
          <Play className="text-cyan-400" size={12} />
        ) : (
          <Play className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" size={12} />
        )}
      </div>
    </div>
  );
}
