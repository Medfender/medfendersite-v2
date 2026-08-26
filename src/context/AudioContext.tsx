"use client";

import React, { createContext, useContext, useRef, useState, useCallback } from "react";
import { ToneItem } from "@/data/storeData";
import { previewController } from "@/components/store/PresetCard";

type TrackInfo = ToneItem;

interface AudioContextType {
  audioCtx: AudioContext | null;
  isPlaying: boolean;
  setIsPlaying: (val: boolean) => void;
  isVisualizerActive: boolean;
  setIsVisualizerActive: (val: boolean) => void;
  setVisualizerActive: (val: boolean) => void;
  connectAudioElement: (audioEl: HTMLAudioElement) => void;
  setActiveAudioElement: (audioEl: HTMLAudioElement | null) => void;
  registerAudioElement: (audioEl: HTMLAudioElement) => (() => void) | void;
  setMasterVolume: (val: number) => void;
  setCardVolume: (audioEl: HTMLAudioElement | null, val: number) => void;
  getFrequencyData: (audioEl: HTMLAudioElement) => Uint8Array | null;
  getActiveFrequencyData: () => Uint8Array | null;
  // Playback controls
  activeTrack: TrackInfo | null;
  playTrack: (track: TrackInfo) => void;
  pauseTrack: () => void;
  stopTrack: () => void;
  togglePlayStop: (track: TrackInfo) => void;
  volume: number;
  setVolume: (val: number) => void;
  currentTime: number;
  duration: number;
  seek: (time: number) => void;
  // Global media coordination
  pauseAllOtherMedia: (activeAudioEl?: HTMLAudioElement | null) => void;
  activeAudioRef: React.RefObject<HTMLAudioElement | null>;
}

const AudioContextInstance = createContext<AudioContextType | null>(null);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodesRef = useRef<Map<HTMLAudioElement, MediaElementAudioSourceNode>>(new Map());
  const gainNodesRef = useRef<Map<HTMLAudioElement, GainNode>>(new Map());
  const analysersRef = useRef<Map<HTMLAudioElement, AnalyserNode>>(new Map());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisualizerActive, setIsVisualizerActive] = useState(false);
  const [activeTrack, setActiveTrack] = useState<TrackInfo | null>(null);
  const [volume, setVolumeState] = useState(0.85);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtxClass();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.82;

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
    }

    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  }, []);

  const connectAudioElement = useCallback((audioEl: HTMLAudioElement) => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx || !audioEl) return;

    // Fixed at 1.0 so Web Audio GainNode has full authority over loudness
    audioEl.volume = 1.0;

    if (!sourceNodesRef.current.has(audioEl)) {
      try {
        const source = ctx.createMediaElementSource(audioEl);
        const gainNode = ctx.createGain();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.85;

        // Chain: Source -> Analyser -> GainNode -> Destination
        source.connect(analyser);
        analyser.connect(gainNode);
        gainNode.connect(ctx.destination);

        sourceNodesRef.current.set(audioEl, source);
        gainNodesRef.current.set(audioEl, gainNode);
        analysersRef.current.set(audioEl, analyser);
      } catch (e) {
        console.warn("Audio element already connected or source creation failed:", e);
      }
    }
  }, [initAudio]);

  const applyVolumeToGainNode = useCallback((gainNode: GainNode, rawVal: number | string, ctx: AudioContext) => {
    const v = Math.max(0, Math.min(1, parseFloat(String(rawVal)) || 0));
    gainNode.gain.cancelScheduledValues(0);
    if (v <= 0.001) {
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.value = 0;
    } else {
      gainNode.gain.setValueAtTime(v, ctx.currentTime);
    }
  }, []);

  const setCardVolume = useCallback((audioEl: HTMLAudioElement | null, val: number) => {
    if (!audioEl) return;
    const gainNode = gainNodesRef.current.get(audioEl);
    if (gainNode && audioCtxRef.current) {
      applyVolumeToGainNode(gainNode, val, audioCtxRef.current);
    }
  }, [applyVolumeToGainNode]);

  const setMasterVolume = useCallback((val: number) => {
    // Delegate to setCardVolume if active main audio element exists
    if (audioRef.current) {
      setCardVolume(audioRef.current, val);
    }
  }, [setCardVolume]);

  const getFrequencyData = useCallback((audioEl: HTMLAudioElement): Uint8Array | null => {
    const analyser = analysersRef.current.get(audioEl);
    if (!analyser) return null;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    return data;
  }, []);

  const getActiveFrequencyData = useCallback(() => {
    if (!activeAudioRef.current) return null;
    return getFrequencyData(activeAudioRef.current);
  }, [getFrequencyData]);

  const setActiveAudioElement = useCallback((audioEl: HTMLAudioElement | null) => {
    activeAudioRef.current = audioEl;
  }, []);

  const registerAudioElement = useCallback((audioEl: HTMLAudioElement) => {
    connectAudioElement(audioEl);
    return () => {
      // Cleanup if needed when card unmounts
    };
  }, [connectAudioElement]);

  // Playback functions
  const playTrack = async (track: TrackInfo) => {
    if (!audioRef.current) return;
    initAudio();
    if (audioCtxRef.current?.state === "suspended") {
      await audioCtxRef.current.resume();
    }
    if (audioRef.current) activeAudioRef.current = audioRef.current;
    if (activeTrack?.id !== track.id) {
      setActiveTrack(track);
      audioRef.current.src = track.audioUrl;
      audioRef.current.currentTime = 0;
    }
    try {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
      setIsPlaying(true);
      setIsVisualizerActive(true);
      // Ensure bottom-player audio is connected to analyser
      if (audioRef.current) {
        audioRef.current.volume = 1.0;
        connectAudioElement(audioRef.current);
        // Apply the current volume to the gain node
        setCardVolume(audioRef.current, volume);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Playback error:", err);
      }
    }
  };

  const pauseTrack = () => {
    if (!audioRef.current) return;
    try {
      audioRef.current.pause();
    } catch (e) { /* ignore */ }
    setIsPlaying(false);
    setIsVisualizerActive(false);
  };

  const stopTrack = () => {
    if (!audioRef.current) return;
    try {
      audioRef.current.pause();
    } catch (e) { /* ignore */ }
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setIsVisualizerActive(false);
  };

  const togglePlayStop = (track: TrackInfo) => {
    if (activeTrack?.id === track.id && isPlaying) {
      pauseTrack();
    } else {
      playTrack(track);
    }
  };

  const setVolume = (val: number) => {
    setVolumeState(val);
    if (audioRef.current) audioRef.current.volume = 1.0;
    const activeAudioEl = audioRef.current;
    if (activeAudioEl && gainNodesRef.current.get(activeAudioEl) && audioCtxRef.current) {
      applyVolumeToGainNode(gainNodesRef.current.get(activeAudioEl)!, val, audioCtxRef.current);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Global media coordination: pause all other audio elements and YouTube iframes
  const pauseAllOtherMedia = useCallback((activeAudioEl?: HTMLAudioElement | null) => {
    // Pause all registered HTMLAudioElements across ToneCards and FeaturedPlayer (except activeAudioEl)
    sourceNodesRef.current.forEach((source, audioEl) => {
      if (audioEl !== activeAudioEl && !audioEl.paused) {
        try {
          audioEl.pause();
          audioEl.currentTime = 0;
        } catch (e) {
          console.warn("Error pausing audio element:", e);
        }
      }
    });

    // Pause all YouTube iframe embeds on the page
    if (typeof document !== "undefined") {
      document.querySelectorAll("iframe").forEach((iframe) => {
        try {
          iframe.contentWindow?.postMessage(
            JSON.stringify({ event: "command", func: "pauseVideo", args: "" }),
            "*"
          );
        } catch (e) {
          // Ignore cross-origin errors
        }
      });
    }

    // Reset preset/demo card active state
    setActiveTrack(null);
    previewController.notify(null, false);

    // Reset active playing states in context if the currently active track is not the activeAudioEl
    if (audioRef.current !== activeAudioEl && isPlaying) {
      setIsPlaying(false);
      setIsVisualizerActive(false);
    }
  }, [isPlaying, setIsPlaying, setIsVisualizerActive]);

  return (
    <AudioContextInstance.Provider
      value={{
        audioCtx: audioCtxRef.current,
        isPlaying,
        setIsPlaying,
        isVisualizerActive,
        setIsVisualizerActive,
        setVisualizerActive: setIsVisualizerActive,
        connectAudioElement,
        setActiveAudioElement,
        registerAudioElement,
        setMasterVolume,
        setCardVolume,
        getFrequencyData,
        getActiveFrequencyData,
        // Playback controls
        activeTrack,
        playTrack,
        pauseTrack,
        stopTrack,
        togglePlayStop,
        volume,
        setVolume,
        currentTime,
        duration,
        seek,
        // Global media coordination
        pauseAllOtherMedia,
        activeAudioRef,
      }}
    >
      {children}
    </AudioContextInstance.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContextInstance);
  if (!context) throw new Error("useAudio must be used within AudioProvider");
  return context;
};
