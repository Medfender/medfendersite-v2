"use client";

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";

export interface AudioTrack {
  id: string;
  title: string;
  src: string;
  artist?: string;
  coverUrl?: string;
}

interface AudioState {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  analyser: AnalyserNode | null;
}

interface AudioContextValue extends AudioState {
  playTrack: (track: AudioTrack) => void;
  pauseTrack: () => void;
  togglePlay: () => void;
  seek: (timeInSeconds: number) => void;
  setVolume: (level: number) => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const webAudioContextRef = useRef<AudioContext | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState<number>(1);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  // Initialize persistent audio element once
  useEffect(() => {
    if (typeof window === "undefined") return;

    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    // Initialize Web Audio API
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    webAudioContextRef.current = ctx;

    const analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = 256;
    analyserNodeRef.current = analyserNode;
    setAnalyser(analyserNode);

    // Connect audio element to analyser
    const source = ctx.createMediaElementSource(audio);
    source.connect(analyserNode);
    analyserNode.connect(ctx.destination);
    sourceNodeRef.current = source;

    // Event listeners
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => setVolumeState(audio.volume);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("volumechange", handleVolumeChange);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("volumechange", handleVolumeChange);

      if (audio.src) {
        audio.pause();
        audio.src = "";
      }
      source.disconnect();
      analyserNode.disconnect();
      if (ctx.state !== "closed") {
        ctx.close();
      }
    };
  }, []);

  const resumeAudioContext = useCallback(async () => {
    const ctx = webAudioContextRef.current;
    if (ctx && ctx.state === "suspended") {
      await ctx.resume();
    }
  }, []);

  const playTrack = useCallback(
    (track: AudioTrack) => {
      const audio = audioRef.current;
      if (!audio) return;

      if (currentTrack?.src !== track.src) {
        audio.src = encodeURI(track.src);
        audio.load();
        setCurrentTrack(track);
      } else if (currentTrack?.id === track.id) {
        setCurrentTrack(track);
      }

      audio.play().catch(() => {
        // Autoplay blocked; resume on user interaction handled separately
      });
      setIsPlaying(true);
      resumeAudioContext();
    },
    [currentTrack?.id, currentTrack?.src, resumeAudioContext]
  );

  const pauseTrack = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsPlaying(true);
      resumeAudioContext();
    }
  }, [isPlaying, resumeAudioContext]);

  const seek = useCallback((timeInSeconds: number) => {
    const audio = audioRef.current;
    if (audio && !isNaN(timeInSeconds) && isFinite(timeInSeconds)) {
      audio.currentTime = Math.max(0, timeInSeconds);
      setCurrentTime(timeInSeconds);
    }
  }, []);

  const setVolume = useCallback((level: number) => {
    const newVolume = Math.max(0, Math.min(1, level));
    setVolumeState(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  // Sync volume on mount
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        analyser,
        playTrack,
        pauseTrack,
        togglePlay,
        seek,
        setVolume,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio(): AudioContextValue {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
