import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAudio } from "@/context/AudioContext";

interface Track {
  id: string;
  title: string;
  duration?: string | number;
  audioUrl?: string;
}

interface DemoTracklistProps {
  demo: {
    title: string;
    tracks: Track[];
  };
  activeTrackId?: string | null;
  currentTime?: number;
  duration?: number;
  isPlaying?: boolean;
  onTrackToggle?: (id: string) => void;
  onSeek?: (trackId: string, time: number) => void;
}

const TRACK_BARS = 36;
const trackWaveforms: Record<string, number[]> = {};

function getTrackWave(id: string): number[] {
  if (!trackWaveforms[id]) {
    trackWaveforms[id] = Array.from({ length: TRACK_BARS }, (_, i) => {
      const p = i / (TRACK_BARS - 1);
      return Math.max(3, Math.min(28, 8 + Math.sin(p * Math.PI) * 12 + Math.sin(p * Math.PI * 4) * 4 + (Math.random() - 0.5) * 5));
    });
  }
  return trackWaveforms[id];
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function getWaveHeights(id: string): number[] {
  const seed = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return Array.from({ length: 250 }, (_, i) => {
    const r = seededRandom(seed * 1000 + i);
    const peak = 0.2 + r * 0.8;
    const trans = seededRandom(seed * 3000 + i) > 0.88 ? 0.3 : 1;
    return Math.round(peak * trans * 100);
  });
}

const getTrackDurationSeconds = (track: any, durations: Record<string, number>): number => {
  if (durations[track.id] && Number.isFinite(durations[track.id])) {
    return durations[track.id];
  }
  if (typeof track.duration === "number") {
    return track.duration;
  }
  if (typeof track.duration === "string" && track.duration.includes(":")) {
    const [mins, secs] = track.duration.split(":").map(Number);
    return mins * 60 + secs;
  }
  return 0;
};

const formatTime = (secs: number) => {
  if (!secs || isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export function DemoTracklist({
  demo,
  activeTrackId,
  currentTime = 0,
  duration,
  isPlaying,
  onTrackToggle,
  onSeek,
}: DemoTracklistProps) {
  const [internalExpandedId, setInternalExpandedId] = useState<string | null>(null);
  const [durations, setDurations] = useState<Record<string, number>>({});

  const { playlist } = useAudio();

  const localTracks = playlist.filter((t: any) => t.id?.startsWith("local-"));
  const hasLocal = localTracks.length > 0;

  // When user-added local tracks exist, show them as the active temporary tracklist.
  const tracks = hasLocal
    ? localTracks.map((t: any) => ({
        id: t.id,
        title: t.name || t.title || "Untitled",
        duration: t.duration || "0:00",
        audioUrl: t.audioUrl || t.url || t.src,
        thumbnail: t.thumbnail,
      }))
    : (demo.tracks || []);
  const displayTitle = hasLocal ? "Local Tracks" : (demo.title || "Demo Tracks");

  // Background preloading: double-buffered duration extraction
  useEffect(() => {
    tracks.forEach((track: any) => {
      if (!track.audioUrl) return;
      const audio = new Audio(track.audioUrl);
      audio.preload = "auto";
      const captureDuration = () => {
        if (audio.duration && Number.isFinite(audio.duration) && audio.duration > 0) {
          setDurations((prev) => ({ ...prev, [track.id]: audio.duration }));
        }
      };
      audio.addEventListener("loadedmetadata", captureDuration);
      audio.addEventListener("durationchange", captureDuration);
      audio.load(); // Forces browser to parse headers immediately
    });
  }, [tracks]);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="border-t border-zinc-900 bg-[#050505]"
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-[0.55rem] font-black uppercase tracking-[0.25em] text-[#E5A93C]">DEMO TRACKS</span>
            <span className="text-zinc-800">|</span>
            <span className="text-[0.55rem] font-black uppercase tracking-[0.25em] text-zinc-500">{demo.title}</span>
          </div>
        </div>

        {/* Track rows */}
        <div className="space-y-1">
          {tracks.map((track: any, idx: number) => {
            const isActive = activeTrackId === track.id;
            const isExpanded = internalExpandedId === track.id;
            const durNum = getTrackDurationSeconds(track, durations);

            // Preloader first, then static track.duration fallback
            const rawDuration = (durations[track.id] && Number.isFinite(durations[track.id])) ? durations[track.id] : (typeof track.duration === "number" ? track.duration : (typeof track.duration === "string" && track.duration.includes(":") ? (() => { const [m, s] = track.duration.split(":").map(Number); return m * 60 + s; })() : 0));
            const hasValidDuration = rawDuration > 0 && Number.isFinite(rawDuration);
            const displayCurrentTime = isActive ? formatTime(currentTime) : "0:00";
            const displayTotalTime = hasValidDuration ? formatTime(rawDuration) : "--:--";

            const trackPlaying = isActive && isPlaying;
            const progressDur = (isActive && duration ? duration : (durNum || 0)) || 0;
            const progressPct = Math.min(100, Math.max(0, (currentTime / progressDur) * 100));

            return (
              <div
                key={track.id}
                className="w-full flex flex-col py-3 border-b border-zinc-900/50 last:border-0 transition-all duration-500"
              >
                {/* Top control bar — 3-column grid */}
                <div className="w-full grid grid-cols-3 items-center">
                  <div className="flex items-center gap-6 md:gap-12 min-w-0">
                    <span className="text-[10px] font-mono tracking-[0.4em] text-zinc-600 shrink-0">{String(idx + 1).padStart(3, "0")}</span>
                    <span className={`text-xs md:text-sm font-light tracking-[0.15em] uppercase truncate transition-colors ${trackPlaying ? "text-white" : isExpanded ? "text-zinc-200" : "text-zinc-500"}`}>
                      {track.title}
                    </span>
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={() => {
                        setInternalExpandedId(track.id);
                        if (onTrackToggle) onTrackToggle(track.id);
                      }}
                      aria-label={trackPlaying ? "Pause" : "Play"}
                      className="w-12 h-12 rounded-full border border-zinc-600 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white transition-all duration-300"
                    >
                      {trackPlaying ? (
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M10 9v6m4-6v6" /></svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 ml-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2.5v11l9-5.5L4 2.5z"/></svg>
                      )}
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <span className="text-[10px] font-mono tracking-[0.4em] text-zinc-600">{`${displayCurrentTime} / ${displayTotalTime}`}</span>
                  </div>
                </div>

                {/* Waveform — visible for EXPANDED track */}
                {isExpanded && (
                  <div
                    className="w-full h-12 relative flex items-center justify-between mt-6 cursor-pointer"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const pct = Math.max(0, Math.min(1, clickX / rect.width));
                      const seekDur = isActive && duration ? duration : durNum;
                      const seekTime = pct * seekDur;
                      if (onSeek) onSeek(track.id, seekTime);
                    }}
                  >
                    {/* 250 hyper-dense bars */}
                    <div className="flex items-center justify-between w-full h-full">
                      {getWaveHeights(track.id).map((h, i) => {
                        const barPct = (i / 250) * 100;
                        const played = barPct <= progressPct;
                        return (
                          <div
                            key={i}
                            className={`w-[1px] rounded-none transition-colors duration-75 ${played ? "bg-zinc-300" : "bg-zinc-800"}`}
                            style={{ height: `${Math.max(15, h)}%` }}
                          />
                        );
                      })}
                    </div>
                    {/* Razor playhead */}
                    <div
                      className="absolute top-0 bottom-0 w-[1px] bg-white z-10 pointer-events-none transition-all duration-75"
                      style={{ left: `${progressPct}%`, boxShadow: "0 0 4px rgba(255,255,255,0.7)" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
