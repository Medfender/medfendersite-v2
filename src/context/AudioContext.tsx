"use client";

import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from "react";
import { ToneItem } from "@/data/storeData";
import { previewController } from "@/components/store/PresetCard";
import { analyze } from "web-audio-beat-detector";
import { audioTickController } from "@/lib/audio/AudioTickController";

type TrackInfo = ToneItem;
type TransportState = "stopped" | "playing" | "paused";

interface AudioContextType {
  audioCtx: AudioContext | null;
  // Legacy compat — used by external consumers (visualizer, etc.)
  isPlaying: boolean;
  setIsPlaying: (val: boolean) => void;
  isPowered: boolean;
  setIsPowered: (val: boolean) => void;
  togglePower: () => void;
  isVisualizerActive: boolean;
  setIsVisualizerActive: (val: boolean) => void;
  setVisualizerActive: (val: boolean) => void;
  // ── ONE AUTHORITATIVE TRANSPORT STATE ──────────────────────────────────────
  transportState: TransportState;
  setTransportState: (val: TransportState) => void;
  // Legacy compat — derived, NOT a separate state machine
  isStopped: boolean;
  stopPlayback: () => void;
  connectAudioElement: (audioEl: HTMLAudioElement) => void;
  connectSourceToAnalyser: () => void;
  setActiveAudioElement: (audioEl: HTMLAudioElement | null) => void;
  registerAudioElement: (audioEl: HTMLAudioElement) => (() => void) | void;
  setMasterVolume: (val: number) => void;
  setCardVolume: (audioEl: HTMLAudioElement | null, val: number) => void;
  getFrequencyData: (audioEl: HTMLAudioElement) => Uint8Array | null;
  getActiveFrequencyData: () => Uint8Array | null;
  setScratchFilterFreq: (hz: number) => void;
  setPlaybackRate: (rate: number) => void;
  activeTrack: TrackInfo | null;
  setActiveTrack: (track: TrackInfo | null) => void;
  currentTrack: TrackInfo | null;
  playlist: TrackInfo[];
  loadPlaylist: (tracks: TrackInfo[]) => void;
  playNext: () => void;
  playPrevious: () => void;
  skipForward: (s?: number) => void;
  skipBackward: (s?: number) => void;
  playTrack: (track: TrackInfo) => void;
  pauseTrack: () => void;
  stopTrack: () => void;
  togglePlayStop: (track: TrackInfo) => void;
  togglePlay: () => void;
  pause: () => void;
  volume: number;
  setVolume: (val: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
  currentTime: number;
  duration: number;
  seek: (time: number) => void;
  stop: () => void;
  currentBpm: number | 'CAL' | null;
  setCurrentBpm: (bpm: number | 'CAL' | null) => void;
  analyzeTrackBpm: (audioSrc: string) => void;
  pauseAllOtherMedia: (activeAudioEl?: HTMLAudioElement | null) => void;
  activeAudioRef: React.RefObject<HTMLAudioElement | null>;
  analyserRef: React.RefObject<AnalyserNode | null>;
  analyserNode: AnalyserNode | null;
  gainNodeRef: React.RefObject<GainNode | null>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  getAnalyserNode: () => AnalyserNode | null;
  ensureAudioContext: () => Promise<void>;
}

const AudioContextInstance = createContext<AudioContextType | null>(null);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodesRef = useRef<Map<HTMLAudioElement, MediaElementAudioSourceNode>>(new Map());
  const gainNodesRef = useRef<Map<HTMLAudioElement, GainNode>>(new Map());
  const analysersRef = useRef<Map<HTMLAudioElement, AnalyserNode>>(new Map());
  const scratchFiltersRef = useRef<Map<HTMLAudioElement, BiquadFilterNode>>(new Map());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const initGuardRef = useRef(false);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodesMap = useRef<WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>>(new WeakMap());
  const bpmCache = useRef<Record<string, number>>({});
  const currentIndexRef = useRef<number>(0);
  const isNavigatingRef = useRef<boolean>(false);

  // ─── ONE AUTHORITATIVE TRANSPORT STATE ─────────────────────────────────────
  const [transportState, setTransportStateRaw] = useState<TransportState>("stopped");
  const setTransportState = useCallback((val: TransportState) => {
    setTransportStateRaw(val);
    audioTickController.setTransportState(val);
  }, []);
  // isStopped derived — NOT a separate useState
  const isStopped = transportState === "stopped";

  // Legacy compat
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPowered, setIsPowered] = useState(false);
  const [isVisualizerActive, setIsVisualizerActive] = useState(false);

  // Belt-and-suspenders: keep isPowered in sync with playback
  useEffect(() => {
    if (isPlaying && !isPowered) setIsPowered(true);
  }, [isPlaying, isPowered]);

  const [activeTrack, setActiveTrackState] = useState<TrackInfo | null>(null);
  const activeTrackRef = useRef<TrackInfo | null>(null);
  const [playlist, setPlaylist] = useState<TrackInfo[]>([]);
  const [volume, setVolumeState] = useState(0.85);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentBpm, setCurrentBpm] = useState<number | 'CAL' | null>(null);
  const [, setAnalyserTick] = useState(0);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  // ─── Centralized debug trace ────────────────────────────────────────────────
  const logTransport = useCallback((event: string, extra?: object) => {
    console.log("[TRANSPORT]", { event, transportState, isPlaying, isPowered, currentTime, ...extra });
  }, [transportState, isPlaying, isPowered, currentTime]);

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const setActiveTrack = useCallback((track: TrackInfo | null) => {
    setActiveTrackState(track);
    activeTrackRef.current = track;
  }, []);

  const tickAnalyser = useCallback(() => setAnalyserTick((n) => n + 1), []);

  const buildCleanUrl = (raw: string | undefined): string => {
    if (!raw || typeof raw !== "string") {
      return "/audio/featured/Sidi Bouganga feat Younes Hadir.mp3";
    }
    const stripped = raw.startsWith("http")
      ? raw.replace(/^https?:\/\/[^/]+/, "")
      : raw;
    const withSlash = stripped.startsWith("/") ? stripped : `/${stripped}`;
    return encodeURI(decodeURIComponent(withSlash));
  };

  const needsTrackReload = (track: TrackInfo, currentSrc: string): boolean => {
    const rawSrc = (track as any)?.url || (track as any)?.audioUrl || (track as any)?.src;
    if (!rawSrc) return true;
    const clean = buildCleanUrl(rawSrc);
    const decodedCurrent = decodeURI(currentSrc.replace(/^https?:\/\/[^/]+/, ""));
    const decodedClean = decodeURI(clean);
    return decodedCurrent !== decodedClean;
  };

  // ─── Offline BPM analysis ───────────────────────────────────────────────────
  const analyzeTrackBpm = async (audioSrc: string) => {
    if (bpmCache.current[audioSrc]) {
      setCurrentBpm(bpmCache.current[audioSrc]);
      return;
    }
    setCurrentBpm('CAL');
    try {
      const response = await fetch(audioSrc);
      if (!response.ok) { setCurrentBpm(null); return; }
      const arrayBuffer = await response.arrayBuffer();
      const tempCtx = new AudioContext();
      try {
        const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer.slice(0));
        const bpm = await analyze(audioBuffer);
        const preciseBpm = Number(bpm.toFixed(2));
        bpmCache.current[audioSrc] = preciseBpm;
        setCurrentBpm(preciseBpm);
      } finally {
        try { await tempCtx.close(); } catch { /* ignore */ }
      }
    } catch {
      setCurrentBpm(null);
    }
  };

  // ─── Audio init ────────────────────────────────────────────────────────────
  const initAudio = useCallback(async () => {
    if (initGuardRef.current) {
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        try { await audioCtxRef.current.resume(); } catch { /* ignore */ }
      }
      return;
    }
    initGuardRef.current = true;
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtxClass();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.15;
      analyser.minDecibels = -90;
      analyser.maxDecibels = 0;
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      tickAnalyser();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume();
    }
  }, [tickAnalyser]);

  const ensureAudioContext = async () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
      const analyser = audioCtxRef.current.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.15;
      analyser.minDecibels = -90;
      analyser.maxDecibels = 0;
      analyserRef.current = analyser;
      tickAnalyser();
    }
    if (audioCtxRef.current.state === "suspended") {
      try { await audioCtxRef.current.resume(); } catch (e) { console.error("Failed to resume AudioContext:", e); }
    }
  };

  const initWebAudioRef = useRef<() => void>(() => {});
  const connectSourceToAnalyser = useCallback(() => { initWebAudioRef.current(); }, []);
  const connectAudioElement = useCallback((audioEl: HTMLAudioElement) => {
    if (sourceNodeRef.current) return;
    initAudio();
    initWebAudioRef.current();
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
    if (gainNode && audioCtxRef.current) applyVolumeToGainNode(gainNode, val, audioCtxRef.current);
  }, [applyVolumeToGainNode]);

  const setMasterVolume = useCallback((val: number) => {
    if (audioRef.current) setCardVolume(audioRef.current, val);
  }, [setCardVolume]);

  const setScratchFilterFreq = useCallback((hz: number) => {
    const clamped = Math.max(200, Math.min(16000, hz));
    const filter = activeAudioRef.current ? scratchFiltersRef.current.get(activeAudioRef.current) : null;
    if (filter && audioCtxRef.current) {
      filter.frequency.cancelScheduledValues(audioCtxRef.current.currentTime);
      filter.frequency.setTargetAtTime(clamped, audioCtxRef.current.currentTime, 0.02);
    }
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    if (activeAudioRef.current) {
      const safeRate = Math.max(0.1, Math.min(16, Math.abs(rate)));
      activeAudioRef.current.playbackRate = safeRate;
    }
  }, []);

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
    return () => {};
  }, [connectAudioElement]);

  const getAnalyserNode = useCallback((): AnalyserNode | null => {
    if (!audioRef.current) return null;
    if (analyserRef.current) return analyserRef.current;
    connectAudioElement(audioRef.current);
    return analyserRef.current;
  }, [connectAudioElement]);

  // ─── Power toggle ──────────────────────────────────────────────────────────
  const togglePower = useCallback(() => {
    setIsPowered((prev) => {
      const next = !prev;
      if (!next) {
        // Powering OFF → stop transport
        if (audioRef.current) {
          try { audioRef.current.pause(); } catch { /* ignore */ }
          try { audioRef.current.currentTime = 0; } catch { /* ignore */ }
        }
        if (playPromiseRef.current) {
          playPromiseRef.current.then(() => {
            try { audioRef.current?.pause(); } catch { /* ignore */ }
            if (audioRef.current) audioRef.current.currentTime = 0;
          }).catch(() => {});
        }
        setIsPlaying(false);
        setIsVisualizerActive(false);
        setCurrentTime(0);
        setDuration(0);
        setCurrentBpm(null);
        isNavigatingRef.current = false;
        setTransportState("stopped");
        logTransport("POWER_OFF");
      }
      return next;
    });
  }, [logTransport]);

  // ─── Transport state transitions ────────────────────────────────────────────

  const playTrack = async (track: TrackInfo) => {
    if (!audioRef.current) return;
    await initAudio();
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume();
    }
    activeAudioRef.current = audioRef.current;

    const rawSrc = (track as any)?.url || (track as any)?.audioUrl || (track as any)?.src;
    const audioSrc = buildCleanUrl(rawSrc);

    audioRef.current.preload = "auto";
    audioRef.current.crossOrigin = "anonymous";

    const cleanPath = decodeURIComponent(audioSrc);
    const encodedSrc = encodeURI(cleanPath);
    const currentOrigin = audioRef.current.src ? new URL(audioRef.current.src).pathname : "";
    if (currentOrigin && currentOrigin !== encodedSrc) {
      audioRef.current.src = encodedSrc;
      audioRef.current.load();
      audioRef.current.currentTime = 0;
      setDuration(0);
    } else if (!currentOrigin) {
      audioRef.current.src = encodedSrc;
      audioRef.current.load();
      audioRef.current.currentTime = 0;
      setDuration(0);
    }

    activeTrackRef.current = track;
    setActiveTrackState(track);
    setCurrentBpm(null);
    void analyzeTrackBpm(audioSrc);

    const idx = playlist.findIndex(
      (t) => decodeURIComponent((t as any)?.url || "") === decodeURIComponent((track as any)?.url || "")
    );
    currentIndexRef.current = idx === -1 ? 0 : idx;

    try {
      audioRef.current.muted = false;
      audioRef.current.volume = 1.0;
      const promise = audioRef.current.play();
      if (promise !== undefined) {
        playPromiseRef.current = promise;
        promise.catch((err: any) => {
          if (err.name !== "AbortError") console.error("[AudioContext] Playback rejected:", err);
        });
      }
      setIsPlaying(true);
      setIsPowered(true);
      setIsVisualizerActive(true);
      setTransportState("playing");
      logTransport("PLAY", { from: "playTrack" });
      initWebAudioRef.current();
      setCardVolume(audioRef.current, volume);
    } catch (err: any) {
      console.error("[AudioContext] Playback exception:", err);
    }
  };

  const pauseTrack = () => {
    if (!audioRef.current) return;
    if (playPromiseRef.current) {
      playPromiseRef.current.then(() => audioRef.current?.pause()).catch(() => {});
    } else {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setIsVisualizerActive(false);
    setTransportState("paused");
    logTransport("PAUSE", { from: "pauseTrack" });
  };

  const stopTrack = () => {
    if (!audioRef.current) return;
    if (playPromiseRef.current) {
      playPromiseRef.current.then(() => {
        audioRef.current?.pause();
        if (audioRef.current) audioRef.current.currentTime = 0;
      }).catch(() => {});
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsVisualizerActive(false);
    setTransportState("stopped");
    logTransport("STOP", { from: "stopTrack" });
  };

  const togglePlayStop = (track: TrackInfo) => {
    if (activeTrackRef.current?.id === track.id && transportState === "playing") {
      pauseTrack();
    } else {
      playTrack(track);
    }
  };

  const currentTrack = activeTrack;

  // ─── togglePlay — ONE play() call per action ───────────────────────────────
  const togglePlay = useCallback(async () => {
    logTransport("togglePlay CALLED");

    if (!audioRef.current) return;

    if (transportState === "playing") {
      // ── PAUSE branch ──────────────────────────────────────────────────────
      audioRef.current.pause();
      setIsPlaying(false);
      setIsVisualizerActive(false);
      setTransportState("paused");
      logTransport("PAUSE", { from: "togglePlay" });
    } else {
      // ── PLAY branch ──────────────────────────────────────────────────────
      // Ensure a track exists before calling play()
      if (!activeTrackRef.current || !audioRef.current.src || audioRef.current.src === window.location.href) {
        if (playlist && playlist.length > 0) {
          playTrack(playlist[0]);
          return;
        }
        const fallbackTrack: TrackInfo = {
          id: "fallback",
          name: "Sidi Bouganga feat Younes Hadir",
          url: "/audio/featured/Sidi Bouganga feat Younes Hadir.mp3",
        } as any;
        playTrack(fallbackTrack);
        return;
      }

      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        try { await audioCtxRef.current.resume(); } catch (e) {
          console.error("AudioContext resume failed:", e);
        }
      }

      try {
        // Exactly ONE audio.play() call
        const playPromise = audioRef.current.play();
        await playPromise;
        setIsPlaying(true);
        setIsPowered(true);
        setIsVisualizerActive(true);
        setTransportState("playing");
        logTransport("PLAY", { from: "togglePlay" });
        initWebAudioRef.current();
      } catch (err: any) {
        if (err.name !== "AbortError") console.error("[AudioContext] togglePlay REJECTED:", err);
      }
    }
  }, [transportState, playlist, logTransport]);

  const pause = () => { pauseTrack(); };

  // ─── Mute ─────────────────────────────────────────────────────────────────
  const lastVolumeRef = useRef(0.85);
  const toggleMute = useCallback(() => {
    if (audioCtxRef.current) {
      const gain = gainNodeRef.current;
      if (gain) {
        if (isMuted) {
          const restore = lastVolumeRef.current > 0.01 ? lastVolumeRef.current : 0.85;
          applyVolumeToGainNode(gain, restore, audioCtxRef.current);
          setIsMuted(false);
          setVolumeState(restore);
        } else {
          if (volume > 0.01) lastVolumeRef.current = volume;
          applyVolumeToGainNode(gain, 0, audioCtxRef.current);
          setIsMuted(true);
          setVolumeState(0);
        }
      } else {
        setIsMuted((m) => !m);
      }
    } else {
      setIsMuted((m) => !m);
    }
  }, [isMuted, volume, applyVolumeToGainNode]);

  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    setIsMuted(false);
    if (audioRef.current) {
      audioRef.current.volume = 1.0;
      audioRef.current.muted = false;
    }
    if (gainNodeRef.current && audioCtxRef.current) applyVolumeToGainNode(gainNodeRef.current, clamped, audioCtxRef.current);
    const el = audioRef.current;
    if (el && gainNodesRef.current.get(el) && audioCtxRef.current) {
      applyVolumeToGainNode(gainNodesRef.current.get(el)!, clamped, audioCtxRef.current);
    }
  }, [applyVolumeToGainNode]);

  const stop = () => {
    if (audioRef.current) {
      if (playPromiseRef.current) {
        playPromiseRef.current.then(() => {
          audioRef.current?.pause();
          if (audioRef.current) audioRef.current.currentTime = 0;
        }).catch(() => {});
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setIsVisualizerActive(false);
    setTransportState("stopped");
    logTransport("STOP", { from: "stop" });
  };

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      if (playPromiseRef.current) {
        playPromiseRef.current.then(() => {
          try { audioRef.current?.pause(); } catch { /* ignore */ }
          if (audioRef.current) audioRef.current.currentTime = 0;
        }).catch(() => {});
      } else {
        try { audioRef.current.pause(); } catch { /* ignore */ }
        try { audioRef.current.currentTime = 0; } catch { /* ignore */ }
      }
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setTransportState("stopped");
    setIsVisualizerActive(false);
    logTransport("STOP", { from: "stopPlayback" });
  }, [logTransport]);

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const loadPlaylist = useCallback((tracks: TrackInfo[]) => { setPlaylist(tracks); }, []);

  const skipForward = (seconds: number = 10) => {
    if (!audioRef.current) return;
    const next = Math.min(duration || audioRef.current.duration || 0, (audioRef.current.currentTime || 0) + seconds);
    audioRef.current.currentTime = next;
    setCurrentTime(next);
  };

  const skipBackward = (seconds: number = 10) => {
    if (!audioRef.current) return;
    const prev = Math.max(0, (audioRef.current.currentTime || 0) - seconds);
    audioRef.current.currentTime = prev;
    setCurrentTime(prev);
  };

  const playTrackAtIndex = useCallback(async (targetIndex: number) => {
    if (!playlist || playlist.length === 0 || !audioRef.current) return;
    isNavigatingRef.current = true;

    const safeIndex = (targetIndex % playlist.length + playlist.length) % playlist.length;
    const targetTrack = playlist[safeIndex];
    const targetUrl = (targetTrack as any)?.url || (targetTrack as any)?.audioUrl || "";

    currentIndexRef.current = safeIndex;
    setActiveTrack(targetTrack);
    setIsPlaying(true);
    setIsPowered(true);
    setTransportState("playing");
    setCurrentBpm(null);
    void analyzeTrackBpm(targetUrl);

    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      try { await audioCtxRef.current.resume(); } catch (e) { console.error("AudioContext resume error:", e); }
    }

    audioRef.current.src = targetUrl;
    audioRef.current.currentTime = 0;

    try {
      await audioRef.current.play();
    } catch (err: any) {
      if (err.name !== "AbortError") console.error("Playback error:", err);
    } finally {
      isNavigatingRef.current = false;
    }
  }, [playlist, logTransport]);

  const playNext = useCallback(() => { playTrackAtIndex(currentIndexRef.current + 1); }, [playTrackAtIndex]);
  const playPrevious = useCallback(() => { playTrackAtIndex(currentIndexRef.current - 1); }, [playTrackAtIndex]);

  // ─── Global media coordination ─────────────────────────────────────────────
  const pauseAllOtherMedia = useCallback((activeAudioEl?: HTMLAudioElement | null) => {
    sourceNodesRef.current.forEach((_source, audioEl) => {
      if (audioEl !== activeAudioEl && !audioEl.paused) {
        try { audioEl.pause(); audioEl.currentTime = 0; } catch (e) {
          console.warn("[AudioContext] Error pausing audio element:", e);
        }
      }
    });
    if (typeof document !== "undefined") {
      document.querySelectorAll("iframe").forEach((iframe) => {
        try {
          iframe.contentWindow?.postMessage(
            JSON.stringify({ event: "command", func: "pauseVideo", args: "" }), "*"
          );
        } catch { /* ignore */ }
      });
    }
    setActiveTrackState(null);
    activeTrackRef.current = null;
    previewController.notify(null, false);
    if (audioRef.current !== activeAudioEl && transportState === "playing") {
      setIsPlaying(false);
      setIsVisualizerActive(false);
    }
  }, [transportState]);

  // ─── useEffect hooks ──────────────────────────────────────────────────────
  useEffect(() => {
    if (audioRef.current) activeAudioRef.current = audioRef.current;
  }, [activeTrack]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.onerror = () => {
      console.error("[Audio Error Code]", el.error?.code, "Message:", el.error?.message, "Path:", el.src);
    };
    return () => { el.onerror = null; };
  }, []);

  useEffect(() => {
    if (!audioRef.current || !activeTrack) return;
    if (needsTrackReload(activeTrack, audioRef.current.src)) {
      const rawSrc = (activeTrack as any)?.url || (activeTrack as any)?.audioUrl || (activeTrack as any)?.src;
      const cleanSrc = buildCleanUrl(rawSrc);
      audioRef.current.src = cleanSrc;
      audioRef.current.load();
      audioRef.current.currentTime = 0;
      setDuration(0);
    }
  }, [activeTrack]);

  const handleAudioError = () => {
    const err = audioRef.current?.error;
    if (err?.code === 4) {
      console.warn(`[Audio System] Track unavailable: ${audioRef.current?.src}`);
    } else if (err) {
      console.error(`[Audio System] Error ${err.code}: ${err.message}`);
    }
    setIsPlaying(false);
    setIsVisualizerActive(false);
    setDuration(0);
  };

  // ─── Single shared Web Audio pipeline ──────────────────────────────────────
  const initWebAudio = useCallback(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    audioEl.crossOrigin = "anonymous";

    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    if (!sourceNodeRef.current) {
      try {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.7;
        analyser.minDecibels = -90;
        analyser.maxDecibels = 0;

        const source = ctx.createMediaElementSource(audioEl);
        const masterGain = ctx.createGain();
        masterGain.gain.value = 0.85;

        source.connect(analyser);
        source.connect(masterGain);
        masterGain.connect(ctx.destination);

        sourceNodeRef.current = source;
        analyserRef.current = analyser;
        gainNodeRef.current = masterGain;

        setAnalyserNode(analyser);
        tickAnalyser();
      } catch (err) {
        console.warn("Web Audio binding warning:", err);
      }
    }
  }, [tickAnalyser]);

  initWebAudioRef.current = initWebAudio;

  // Seed the tick controller with refs after every analyser creation
  useEffect(() => {
    audioTickController.seedRefs(analyserRef.current, audioRef.current);
  }, [analyserNode]);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        preload="metadata"
        style={{ display: "none" }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            audioRef.current.crossOrigin = 'anonymous';
            setDuration(isNaN(audioRef.current.duration) ? 0 : audioRef.current.duration);
          }
        }}
        onCanPlay={() => {
          if (audioRef.current) setDuration(isNaN(audioRef.current.duration) ? 0 : audioRef.current.duration);
        }}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime || 0);
        }}
        onPlay={() => {
          setIsPlaying(true);
          setIsPowered(true);
          setIsVisualizerActive(true);
          initWebAudioRef.current();
        }}
        onPause={() => {
          if (!isNavigatingRef.current) {
            setIsPlaying(false);
            setIsVisualizerActive(false);
            // Do NOT auto-set transportState here.
            // The authoritative state change is made by the user-action handlers above.
          }
        }}
        onEnded={() => {
          if (!isNavigatingRef.current) {
            setCurrentTime(0);
            setTransportState("stopped");
            setIsPlaying(false);
            setIsVisualizerActive(false);
            logTransport("ENDED");
            playNext();
          }
        }}
        onError={() => {
          const err = audioRef.current?.error;
          console.error("[Audio Error Code]", err?.code, "Message:", err?.message, "Path:", audioRef.current?.src);
          handleAudioError();
        }}
        onDurationChange={() => {
          if (audioRef.current) setDuration(isNaN(audioRef.current.duration) ? 0 : audioRef.current.duration);
        }}
      />
      <AudioContextInstance.Provider
        value={{
          audioCtx: audioCtxRef.current,
          isPlaying,
          setIsPlaying,
          isPowered,
          setIsPowered,
          togglePower,
          isStopped,
          transportState,
          setTransportState,
          stopPlayback,
          isVisualizerActive,
          setIsVisualizerActive,
          setVisualizerActive: setIsVisualizerActive,
          connectAudioElement,
          connectSourceToAnalyser,
          setActiveAudioElement,
          registerAudioElement,
          setMasterVolume,
          setCardVolume,
          getFrequencyData,
          getActiveFrequencyData,
          activeTrack,
          setActiveTrack,
          currentTrack,
          playTrack,
          pauseTrack,
          stopTrack,
          togglePlayStop,
          togglePlay,
          pause,
          volume,
          setVolume,
          isMuted: isMuted,
          toggleMute,
          currentTime,
          duration,
          seek,
          stop,
          playlist,
          loadPlaylist,
          playNext,
          playPrevious,
          skipForward,
          skipBackward,
          setScratchFilterFreq,
          setPlaybackRate,
          pauseAllOtherMedia,
          activeAudioRef,
          audioRef,
          analyserRef,
          analyserNode,
          gainNodeRef,
          getAnalyserNode,
          ensureAudioContext,
          currentBpm,
          setCurrentBpm,
          analyzeTrackBpm,
        }}
      >
        {children}
      </AudioContextInstance.Provider>
    </>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContextInstance);
  if (!context) throw new Error("useAudio must be used within AudioProvider");
  return context;
};
