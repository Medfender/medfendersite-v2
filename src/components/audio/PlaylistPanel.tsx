"use client";

import React from "react";
import { Play } from "lucide-react";
import { useAudio } from "@/context/AudioContext";

export default function PlaylistPanel() {
  const {
    playlist,
    activeTrack,
    isPlaying,
    seek,
    audioRef,
    setActiveTrack,
    ensureAudioContext,
    currentTime,
    transportState,
  } = useAudio();

  const handlePlaylistSelect = (track: any) => {
    const rawSrc = track?.url || track?.audioUrl || track?.src;
    if (audioRef.current) {
      if (rawSrc) {
        try {
          const clean = decodeURIComponent(rawSrc.startsWith("http")
            ? rawSrc.replace(/^https?:\/\/[^/]+/, "")
            : rawSrc.startsWith("/") ? rawSrc : `/${rawSrc}`);
          const encoded = encodeURI(clean);
          audioRef.current.src = encoded;
          audioRef.current.currentTime = 0;
          audioRef.current.load();
        } catch (err) {
          console.error("[PlaylistPanel] src error:", err);
        }
      }
    }
    setActiveTrack(track);
    ensureAudioContext?.().catch((err: unknown) => console.error("AudioContext resume failed:", err));
    if (audioRef.current) {
      audioRef.current.play().catch((err: unknown) => {
        if ((err as Error)?.name !== "AbortError") console.error("[PlaylistPanel] play error:", err);
      });
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-xs tracking-widest text-gray-500 font-semibold uppercase">Playlist</h3>
        <span className="text-[10px] font-mono text-neutral-600">{playlist.length} tracks</span>
      </div>
      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[340px] pr-1 scrollbar-thin">
        {playlist.map((track) => {
          const isActive = (activeTrack as any)?.id === track.id;
          return (
            <div
              key={track.id}
              onClick={() => handlePlaylistSelect(track)}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all group ${
                isActive
                  ? "bg-[#1a1a1a] border border-blue-900/30"
                  : "hover:bg-gray-800/50 border border-transparent"
              }`}
            >
              <div className="min-w-0">
                <h4 className={`text-sm font-semibold truncate ${isActive ? "text-blue-400" : "text-gray-200"}`}>
                  {(track as any).name || (track as any).title || "Untitled"}
                </h4>
                <p className="text-[10px] text-gray-500 truncate">
                  {(track as any).gearTag || (track as any).artist}
                </p>
              </div>
              <div className="flex items-center gap-3 ml-2 shrink-0">
                {isActive && isPlaying ? (
                  <div className="flex gap-0.5 h-4 items-end">
                    <div className="w-0.5 bg-blue-400 h-full animate-pulse rounded-full" style={{ animation: "none" }} />
                    <div className="w-0.5 bg-blue-400 h-2/3 animate-pulse rounded-full" style={{ animationDelay: "0.15s" }} />
                    <div className="w-0.5 bg-blue-400 h-4/5 animate-pulse rounded-full" style={{ animationDelay: "0.3s" }} />
                  </div>
                ) : isActive ? (
                  <Play className="text-blue-400" size={12} />
                ) : (
                  <Play className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" size={12} />
                )}
              </div>
            </div>
          );
        })}
        {playlist.length === 0 && (
          <p className="text-gray-600 text-xs p-4 text-center">No tracks loaded.</p>
        )}
      </div>
    </div>
  );
}
