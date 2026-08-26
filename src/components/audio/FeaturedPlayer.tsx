"use client";

import React from "react";
import { featuredTrack } from "@/data/storeData";
import { useAudio } from "@/context/AudioContext";
import SpectrumVisualizer from "./SpectrumVisualizer";

interface FeaturedPlayerProps {
  isSectionInView: boolean;
}

export default function FeaturedPlayer({ isSectionInView }: FeaturedPlayerProps) {
  const {
    activeTrack,
    isPlaying,
    volume,
    setIsPlaying,
    setVisualizerActive,
    connectAudioElement,
    setCardVolume,
    pauseAllOtherMedia,
    audioCtx,
    seek,
    setVolume,
    setActiveAudioElement,
    activeAudioRef,
  } = useAudio();

  const trackInfo = {
    id: featuredTrack.title,
    title: featuredTrack.title,
    gearTag: featuredTrack.gearTag,
    audioUrl: featuredTrack.audioUrl,
  };

  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [prevVolume, setPrevVolume] = React.useState<number>(1);

  const formatTime = (sec: number) => {
    if (isNaN(sec) || !isFinite(sec)) return "0:00";
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleTogglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      setIsThisPlaying(false);
      setVisualizerActive(false);
    } else {
      if (pauseAllOtherMedia) pauseAllOtherMedia(audio);
      connectAudioElement(audio);
      setCardVolume(audio, volume);
      try {
        await audio.play();
        setIsPlaying(true);
        setIsThisPlaying(true);
        setVisualizerActive(true);
        if (audio && setActiveAudioElement) setActiveAudioElement(audio);
      } catch (err) {
        console.error("Playback failed:", err);
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = parseFloat(e.target.value);
    const newVol = Math.max(0, Math.min(1, isNaN(rawVal) ? 0 : rawVal));
    setVolume(newVol); // Local UI slider state

    if (audioRef.current) {
      setCardVolume(audioRef.current, newVol); // Update Web Audio GainNode in real-time
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleToggleMute = () => {
    const audio = audioRef.current;
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
      if (audio) setCardVolume(audio, 0);
    } else {
      const restored = prevVolume > 0 ? prevVolume : 1;
      setVolume(restored);
      if (audio) setCardVolume(audio, restored);
    }
  };

  const handleStop = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    // Only update global playing/visualizer state IF the Featured Player was the active sound source
    if (activeAudioRef.current === audio) {
      setIsPlaying(false);
      setVisualizerActive(false);
      activeAudioRef.current = null;
    }

    setCurrentTime(0);
    setIsThisPlaying(false);
  };

  const [isThisPlaying, setIsThisPlaying] = React.useState(false);

  const isPlayingDerived = activeTrack?.id === trackInfo.id && isPlaying;

  return (
    <>
      <audio
        ref={audioRef}
        src={featuredTrack.audioUrl}
        preload="auto"
        onEnded={() => {
          setIsPlaying(false);
          setVisualizerActive(false);
          setCurrentTime(0);
          setIsThisPlaying(false);
        }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onPlay={() => { setIsPlaying(true); setVisualizerActive(true); setIsThisPlaying(true); }}
        onPause={() => { setIsPlaying(false); setVisualizerActive(false); setIsThisPlaying(false); }}
        style={{ display: "none" }}
      />
      <div className={`fixed bottom-0 left-0 right-0 bg-neutral-950/90 border-t border-cyan-500/20 backdrop-blur-xl text-white z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] transition-all duration-500 ease-in-out ${
        isSectionInView
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-8 pointer-events-none'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:px-4 md:px-8 w-full">
          {/* Left Section: Play Button + Track Info */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleTogglePlay}
              className="relative group w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all duration-200 shrink-0 aspect-square"
              aria-label={isThisPlaying ? "Pause" : "Play"}
            >
              {isThisPlaying ? (
                <svg className="w-4 h-4 md:w-5 md:h-5 pointer-events-none" viewBox="0 0 24 24" fill="currentColor" aria-label="Pause">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg className="w-4 h-4 md:w-5 md:h-5 pointer-events-none" viewBox="0 0 24 24" fill="currentColor" aria-label="Play">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              )}
              {isThisPlaying && (
                <span className="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-30" />
              )}
            </button>

            <div className="flex flex-col truncate min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm md:text-base text-white truncate tracking-wide">{featuredTrack.title}</h4>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50 shrink-0">Featured</span>
              </div>
              <p className="text-xs text-neutral-400 truncate mt-0.5 font-mono">{featuredTrack.gearTag}</p>
            </div>
          </div>

          {/* Middle Section: Timeline & Seek Bar */}
          <div className="flex-1 flex items-center gap-2 min-w-0 w-full sm:px-2">
            <span className="text-xs font-mono text-neutral-400 shrink-0">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 min-w-[100px] h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition"
            />
            <span className="text-xs font-mono text-neutral-400 shrink-0">{formatTime(duration)}</span>
          </div>

          {/* Right Section: Stop Button + Volume + Spectrum */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleStop}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-neutral-800/80 text-neutral-400 flex items-center justify-center hover:text-white hover:bg-neutral-700 border border-neutral-700/60 transition shrink-0 aspect-square"
              aria-label="STOP"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 pointer-events-none" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>

            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <button
                onClick={handleToggleMute}
                className="text-xs font-mono text-neutral-400 hover:text-white transition-colors shrink-0 whitespace-nowrap"
              >
                {volume === 0 ? "MUTED" : "VOL"}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-16 md:w-20 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition shrink-0"
              />
            </div>

            <div className="hidden md:block shrink-0">
              <SpectrumVisualizer
                audioRef={audioRef}
                isActive={isThisPlaying}
                width={150}
                height={60}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}