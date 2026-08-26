"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { useAudio } from "@/context/AudioContext";

// Matches the ToneItem interface that AudioContext expects
export interface Track {
  id: string;
  name: string;
  gearTag: string;
  audioUrl: string;
  duration?: string;
  coverUrl?: string;
}

/* Static fallback — renders immediately even before fetch resolves */
const FALLBACK_TRACKS: Track[] = [
  { id: "fb-1", name: "Sidi Bouganga", gearTag: "MEDFENDER", audioUrl: "/audio/featured/sidi-bouganga.mp3", duration: "4:15", coverUrl: "/audio/featured/sidi-bouganga.jpg" },
  { id: "fb-2", name: "Vices et bordel", gearTag: "Oussmane Cissokho", audioUrl: "/audio/featured/Vices%20et%20bordel%20-%20Oussmane%20Cissokho.mp3", duration: "5:28", coverUrl: "/audio/featured/Vices%20et%20bordel%20-%20Oussmane%20Cissokho.jpg" },
  { id: "fb-3", name: "Never Too Much", gearTag: "Medfender", audioUrl: "/audio/featured/06.%20Never%20Too%20Much.flac", duration: "5:10", coverUrl: "/audio/featured/06.%20Never%20Too%20Much.jpg" },
];

export default function VinylFeaturedPlayer() {
  const {
    currentTrack, isPlaying, playTrack, togglePlay,
    volume, setVolume,
  } = useAudio();

  const [tracks, setTracks] = useState<Track[]>(FALLBACK_TRACKS);
  const [selectedId, setSelectedId] = useState<string>(FALLBACK_TRACKS[0].id);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.85);

  // Render-time diagnostic
  console.log('[VinylPlayer] AudioContext state:', { currentTrack, isPlaying });

  /* Fetch dynamic tracks */
  useEffect(() => {
    fetch("/api/featured-tracks")
      .then((r) => r.json())
      .then((data: { tracks: any[] }) => {
        console.log('[VinylPlayer] API Response:', data.tracks);
        if (!data.tracks?.length) return;
        const mapped: Track[] = data.tracks.map((t: any, i: number) => ({
          id: t.id || `track-${i + 1}`,
          name: t.name || t.title || "Untitled",
          gearTag: t.gearTag || t.artist || "Medfender",
          audioUrl: t.audioUrl || t.src || "",
          duration: t.duration || "0:00",
          coverUrl: t.coverUrl || "/audio/featured/vinyl-default.jpg",
        }));
        setTracks(mapped);
        if (!selectedId || !mapped.find((m) => m.id === selectedId)) {
          setSelectedId(mapped[0].id);
        }
      })
      .catch((err) => {
        console.warn('[VinylPlayer] API fetch failed, using fallback:', err);
      });
  }, []);

  const activeTrack = tracks.find((t) => t.id === selectedId) ?? tracks[0];

  /* Simplified active-state matching from spec */
  const isSelected = currentTrack
    ? (currentTrack.id === activeTrack.id || currentTrack.audioUrl === activeTrack.audioUrl)
    : false;
  const isCurrentlyPlaying = isSelected && isPlaying;

  /* Try/catch playback handler from spec */
  const handlePlayTrack = (track: any) => {
    if (currentTrack?.id === track.id || currentTrack?.audioUrl === track.audioUrl) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  const handleSelect = (track: Track) => {
    console.log('[VinylPlayer] Track clicked:', track);
    setSelectedId(track.id);
    handlePlayTrack({
      id: track.id,
      name: track.name,
      gearTag: track.gearTag,
      audioUrl: track.audioUrl,
    });
  };

  const handleToggle = () => {
    if (!activeTrack) return;
    handlePlayTrack({
      id: activeTrack.id,
      name: activeTrack.name,
      gearTag: activeTrack.gearTag,
      audioUrl: activeTrack.audioUrl,
    });
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (v > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (isMuted) { setVolume(prevVolume || 0.85); setIsMuted(false); }
    else { setPrevVolume(volume || 0.85); setVolume(0); setIsMuted(true); }
  };

  if (!tracks.length) return null;

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-16" aria-label="Featured Vinyl Showcase">
      <style>{`
        @keyframes vinylRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .vinyl-disc { animation: vinylRotate 3s linear infinite; }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: rgba(0,216,246,0.06); border-radius: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(0,216,246,0.28); border-radius: 4px; }
      `}</style>

      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-3 drop-shadow-[0_0_20px_rgba(0,216,246,0.3)]">FEATURED VINYL SHOWCASE</h2>
        <p className="text-neutral-400 text-base md:text-lg max-w-xl mx-auto">A tactile listening experience. Select a track, drop the needle, and watch the vinyl spin.</p>
      </div>

      <div className="relative bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800/80 shadow-2xl rounded-2xl p-6 md:p-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">

          {/* LEFT: Controls + Playlist */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            {/* Transport — explicit <button type="button"> */}
            <div className="flex items-center gap-4 flex-wrap">
              <button
                type="button"
                onClick={handleToggle}
                aria-label={isCurrentlyPlaying ? "Pause" : "Play"}
                className="w-14 h-14 shrink-0 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-black flex items-center justify-center shadow-[0_0_20px_rgba(0,216,246,0.35)] hover:scale-105 active:scale-95 transition-transform duration-200"
              >
                {isCurrentlyPlaying ? <Pause size={28} /> : <Play size={28} />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono text-neutral-400">0:00</span>
                  <span className="text-xs font-mono text-neutral-400">{activeTrack?.duration || "0:00"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={handleVolume}
                  className="w-20 sm:w-24 h-1.5 bg-neutral-700 accent-cyan-400 rounded-lg cursor-pointer" aria-label="Volume" />
                <span className="text-xs font-mono text-neutral-400 w-8">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
              </div>
            </div>

            {/* Playlist */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-300 mb-2">Playlist</h3>
              <div className="max-h-[216px] overflow-y-auto custom-scroll border border-cyan-500/10 rounded-xl bg-neutral-950/60">
                {tracks.map((t) => {
                  const rowActive = activeTrack?.id === t.id;
                  const isRowActivePlaying =
                    currentTrack &&
                    (currentTrack.id === t.id || currentTrack.audioUrl === t.audioUrl || (currentTrack as any).src === t.audioUrl) &&
                    isPlaying;
                  return (
                    <div
                      key={t.id}
                      className={`w-full text-left flex items-center gap-3 px-3 py-3 border-b border-neutral-800/50 transition-colors hover:bg-neutral-900/60 ${rowActive ? "bg-cyan-500/10 border-l-2 border-cyan-400" : ""}`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelect(t)}
                        aria-label={isRowActivePlaying ? "Pause" : "Play"}
                        className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-neutral-800 relative">
                          {t.coverUrl ? (
                            <img src={t.coverUrl} alt={t.name || "Cover"} className="w-full h-full object-cover opacity-80"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          ) : (
                            <svg viewBox="0 0 24 24" className="w-full h-full text-neutral-500 p-2" fill="none" stroke="currentColor" strokeWidth="1.5" aria-label="Default cover">
                              <circle cx="12" cy="12" r="9" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`font-bold text-sm truncate ${rowActive ? "text-cyan-300" : "text-white"}`}>
                            {t.name || "Untitled"}
                          </div>
                          <div className="text-xs text-neutral-400 truncate">{t.gearTag || "Medfender"}</div>
                        </div>
                        <div className="mr-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors shrink-0 flex items-center">
                          {isRowActivePlaying ? <Pause size={14} /> : <Play size={14} />}
                        </div>
                        <span className="text-xs font-mono text-neutral-500 shrink-0">{t.duration || "0:00"}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: Turntable */}
          <div className="w-full lg:w-[380px] shrink-0 flex flex-col items-center justify-center">
            <div className="relative w-72 h-72 md:w-80 md:h-80">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neutral-700 via-neutral-800 to-neutral-900 shadow-[inset_0_0_30px_rgba(0,0,0,0.6)] border border-neutral-600/40 flex items-center justify-center">
                {[0, 90, 180, 270].map((deg) => (
                  <div key={deg} className="absolute w-2 h-2 rounded-full bg-neutral-500 shadow-inner" style={{ top: deg === 0 ? "8%" : deg === 180 ? "92%" : "50%", left: deg === 90 ? "92%" : deg === 270 ? "8%" : "50%", transform: "translate(-50%, -50%)" }} />
                ))}
                <div className="absolute top-6 right-6 w-6 h-6 rounded-full bg-gradient-to-tr from-neutral-400 to-neutral-600 shadow-md border border-neutral-300/30 z-20" />
              </div>

              {/* Vinyl disc — forced animationPlayState inline */}
              <div
                className="vinyl-disc absolute top-1/2 left-1/2 w-56 h-56 md:w-64 md:h-64 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden shadow-[0_0_40px_rgba(0,216,246,0.15)]"
                style={{
                  animationPlayState: isCurrentlyPlaying ? 'running' : 'paused',
                  background: "repeating-radial-gradient(circle at 50% 50%, #1a1a2e 0px, #1a1a2e 2px, #111 3px, #111 4px)",
                }}
              >
                {[0, 90, 180, 270].map((inset) => <div key={inset} className="absolute rounded-full border border-neutral-700/40" style={{ inset: `${inset}px` }} />)}
                <div className="absolute inset-0 rounded-full opacity-70 pointer-events-none" style={{ background: "conic-gradient(from 45deg, rgba(255,255,255,0.14) 0deg, transparent 60deg, rgba(255,255,255,0.14) 180deg, transparent 240deg)" }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_20px_rgba(0,216,246,0.5)] flex items-center justify-center border-2 border-white/20 overflow-hidden z-10">
                  {activeTrack?.coverUrl ? (
                    <img src={activeTrack.coverUrl} alt={activeTrack.name || ""} className="w-full h-full object-cover opacity-90"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-12 h-12 text-black/60" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="9" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-neutral-950 shadow-inner border border-neutral-600/50 z-20" />
              </div>

              {/* Tonearm — forced transform inline */}
              <div
                className="absolute top-8 right-8 w-28 h-28 origin-[85%_15%] transition-transform duration-700 ease-in-out pointer-events-none"
                style={{ transform: isCurrentlyPlaying ? 'rotate(23deg)' : 'rotate(0deg)' }}
              >
                <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg" aria-label="Tonearm">
                  <line x1="10" y1="10" x2="90" y2="70" stroke="#c0c0c0" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="10" cy="10" r="7" fill="#a0a0a0" />
                  <circle cx="10" cy="10" r="4" fill="#e0e0e0" />
                  <rect x="80" y="62" width="8" height="4" rx="1" fill="#333" />
                  <rect x="82" y="60" width="4" height="6" rx="0.5" fill="#777" />
                </svg>
              </div>
            </div>

            <div className="text-center mt-4 min-w-0">
              <h4 className="text-lg font-extrabold text-white truncate">{activeTrack?.name || ""}</h4>
              <p className="text-sm font-mono text-cyan-400 truncate">{activeTrack?.gearTag || ""}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
