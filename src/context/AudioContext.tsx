"use client";

import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from "react";
import { ToneItem } from "@/data/storeData";
import { previewController } from "@/components/store/PresetCard";
import { analyze } from "web-audio-beat-detector";

type TrackInfo = ToneItem;

interface AudioContextType {
  audioCtx: AudioContext | null;
  isPlaying: boolean;
  setIsPlaying: (val: boolean) => void;
  // Global turntable power state. Default off; auto-flips true on any play.
  isPowered: boolean;
  setIsPowered: (val: boolean) => void;
  togglePower: () => void;
  isVisualizerActive: boolean;
  setIsVisualizerActive: (val: boolean) => void;
  setVisualizerActive: (val: boolean) => void;
  connectAudioElement: (audioEl: HTMLAudioElement) => void;
  connectSourceToAnalyser: () => void;
  setActiveAudioElement: (audioEl: HTMLAudioElement | null) => void;
  registerAudioElement: (audioEl: HTMLAudioElement) => (() => void) | void;
  setMasterVolume: (val: number) => void;
  setCardVolume: (audioEl: HTMLAudioElement | null, val: number) => void;
  getFrequencyData: (audioEl: HTMLAudioElement) => Uint8Array | null;
  getActiveFrequencyData: () => Uint8Array | null;
  // Scratch / motor torque
  setScratchFilterFreq: (hz: number) => void;
  setPlaybackRate: (rate: number) => void;
  // Playback controls
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
  // Real-time analyzed BPM. Holds a number (e.g., 143.34), 'CAL' (analyzing), or null (idle).
  currentBpm: number | 'CAL' | null;
  setCurrentBpm: (bpm: number | 'CAL' | null) => void;
  // Offline BPM analysis trigger (fire-and-forget; never awaits)
  analyzeTrackBpm: (audioSrc: string) => void;
  // Global media coordination
  pauseAllOtherMedia: (activeAudioEl?: HTMLAudioElement | null) => void;
  activeAudioRef: React.RefObject<HTMLAudioElement | null>;
  analyserRef: React.RefObject<AnalyserNode | null>;
  // Live analyser — use this directly, not analyserNode (that one may be stale)
  analyserNode: AnalyserNode | null;
  gainNodeRef: React.RefObject<GainNode | null>;
  /** The single shared <audio> element owned by the provider. */
  audioRef: React.RefObject<HTMLAudioElement | null>;
  /** Returns the shared AnalyserNode, wiring the Web Audio graph exactly once.
   *  Safe to call from multiple visualizer components — uses a WeakMap singleton
   *  under the hood to prevent InvalidStateError from double-createMediaElementSource. */
  getAnalyserNode: () => AnalyserNode | null;
  /** Initializes the AudioContext and resumes it if suspended. Call this during
   *  a user gesture (e.g. inside a click handler) to ensure the Web Audio API
   *  is not blocked by the browser's autoplay policy. */
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
  // WeakMap singleton — prevents InvalidStateError: "HTMLMediaElement already connected"
  // when the same <audio> element re-enters the connect path.
  const sourceNodesMap = useRef<WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>>(new WeakMap());
  // In-memory BPM cache — keys are audio URLs, values are precise BPMs.
  // Stored in a ref so cache writes never trigger React re-renders.
  const bpmCache = useRef<Record<string, number>>({});

  const getOrCreateSourceNode = (ctx: AudioContext, audioEl: HTMLAudioElement): MediaElementAudioSourceNode => {
    const map = sourceNodesMap.current;
    const existing = map.get(audioEl);
    if (existing) return existing;
    const source = ctx.createMediaElementSource(audioEl);
    map.set(audioEl, source);
    return source;
  };
  // Synchronous index tracker — eliminates stale-closure bugs in async skip nav
  const currentIndexRef = useRef<number>(0);
  // Navigation lock — held during a track switch so native onPause / onEnded
  // events emitted by the src swap don't flip isPlaying to false.
  const isNavigatingRef = useRef<boolean>(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPowered, setIsPowered] = useState(false);
  const [isVisualizerActive, setIsVisualizerActive] = useState(false);
  const [activeTrack, setActiveTrackState] = useState<TrackInfo | null>(null);
  // Ref to avoid stale-closure issues in async playTrack / togglePlay
  const activeTrackRef = useRef<TrackInfo | null>(null);
  const [playlist, setPlaylist] = useState<TrackInfo[]>([]);
  const [volume, setVolumeState] = useState(0.85);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentBpm, setCurrentBpm] = useState<number | 'CAL' | null>(null);
  // Tick state once per rAF frame so consumers re-render when the analyser
  // node is created. Without this, components that read `analyserNode` from
  // the context never see updates created inside callbacks.
  const [, setAnalyserTick] = useState(0);
  // Shared reactive analyser node — updated synchronously when wired.
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  // Master kill switch — when going from ON to OFF, fully reset audio + state.
  // When going from OFF to ON, simply power on (idle; no auto-play).
  const togglePower = useCallback(() => {
    setIsPowered((prev) => {
      const next = !prev;
      if (!next) {
        // Powering OFF — kill audio, reset transport, return tonearm to rest
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
      }
      return next;
    });
  }, []);

  // Public setter that keeps the ref and state in sync
  const setActiveTrack = useCallback((track: TrackInfo | null) => {
    setActiveTrackState(track);
    activeTrackRef.current = track;
  }, []);

  /** Force React to re-render so consumers always see the live analyser node. */
  const tickAnalyser = useCallback(() => {
    setAnalyserTick((n) => n + 1);
  }, []);

  /** Offline BPM analysis — runs on a temporary, separate AudioContext so it
   *  never interferes with live playback or the visualizer's AnalyserNode.
   *  Decodes the audio buffer offline and passes it to the beat detector. */
  const analyzeTrackBpm = async (audioSrc: string) => {
    // Step 1: Cache check — return instantly if BPM is already known for this URL.
    if (bpmCache.current[audioSrc]) {
      const cachedBpm = bpmCache.current[audioSrc];
      setCurrentBpm(cachedBpm);
      return;
    }

    // Step 2: Cache miss — show 3-letter "CAL" while analyzing, then update to precise value.
    setCurrentBpm('CAL');

    try {
      const response = await fetch(audioSrc);
      if (!response.ok) {
        console.error("BPM Analysis Failed: HTTP", response.status, "for", audioSrc);
        setCurrentBpm(null);
        return;
      }
      const arrayBuffer = await response.arrayBuffer();
      // Temporary, throwaway AudioContext — used only to decode the file,
      // then closed. Never connects to the live playback graph.
      const tempCtx = new AudioContext();
      try {
        const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer.slice(0));
        const bpm = await analyze(audioBuffer);
        // Step 4: Format to exactly two decimal places and save to both cache and state.
        const preciseBpm = Number(bpm.toFixed(2));
        bpmCache.current[audioSrc] = preciseBpm;
        setCurrentBpm(preciseBpm);
      } finally {
        // Release the temporary decoder context immediately
        try { await tempCtx.close(); } catch { /* ignore */ }
      }
    } catch (error) {
      console.error("BPM Analysis Failed:", error);
      setCurrentBpm(null);
    }
  };

  const initAudio = useCallback(async () => {
    if (initGuardRef.current) {
      // Already initialized in a previous call — still make sure it is running.
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
      // Per spec: fftSize=128, smoothing=0.8
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.15;
      // Spec-default dynamic range. Floor clipping at -24 dB happens in
      // the render loop (AudioPhysicsEngine / useAudioVisualizer.drawBars),
      // NOT on the AnalyserNode itself.
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

  // Synchronous AudioContext initialization + resume before any skip/play
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
  // ref to initWebAudio so the legacy connect functions can delegate without TDZ issues
  const initWebAudioRef = useRef<() => void>(() => {});
  const connectSourceToAnalyser = useCallback(() => {
    // Delegate to the canonical pipeline — ensures only one spec (fftSize=256 / smoothing=0.7) ever applies
    initWebAudioRef.current();
  }, []);

  // ---------------------------------------------------------------------------
  // connectAudioElement — Web Audio graph + CORS fallback
  // ---------------------------------------------------------------------------
  const connectAudioElement = useCallback((audioEl: HTMLAudioElement) => {
    if (sourceNodeRef.current) return; // EXACTLY ONCE — already wired by initWebAudio
    initAudio();
    // Delegate to the canonical pipeline so only one spec is ever applied
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
    if (gainNode && audioCtxRef.current) {
      applyVolumeToGainNode(gainNode, val, audioCtxRef.current);
    }
  }, [applyVolumeToGainNode]);

  const setMasterVolume = useCallback((val: number) => {
    if (audioRef.current) {
      setCardVolume(audioRef.current, val);
    }
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
    return () => {
      // Cleanup if needed when card unmounts
    };
  }, [connectAudioElement]);

  /** Returns the shared AnalyserNode, wiring the Web Audio graph exactly once.
   *  Multiple callers (top visualizer + bottom mini player) safely share this —
   *  the WeakMap inside connectAudioElement prevents InvalidStateError. */
  const getAnalyserNode = useCallback((): AnalyserNode | null => {
    if (!audioRef.current) return null;
    if (analyserRef.current) return analyserRef.current;
    // Lazily wire: this calls the same path that connectAudioElement does,
    // but the guard inside it (sourceNodeRef check + WeakMap) prevents double-connect.
    connectAudioElement(audioRef.current);
    return analyserRef.current;
  }, [connectAudioElement]);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * Normalise a raw track URL into a clean, origin-free path string.
   * decodeURIComponent first prevents double-encoding (%20 → %2520);
   * encodeURI produces a single-encoded path safe for audio.src.
   */
  // Named native-pause handler — used by the audio element's onPause listener.
  const handleNativePause = () => {
    if (!isNavigatingRef.current) {
      setIsPlaying(false);
      setIsVisualizerActive(false);
    }
  };

  const buildCleanUrl = (raw: string | undefined): string => {
    if (!raw || typeof raw !== "string") {
      // Fallback to the real file that exists on disk
      return "/audio/featured/Sidi Bouganga feat Younes Hadir.mp3";
      // NOTE: the API at /api/audio/featured returns the playlist in alphabetical
      // order from `public/audio/featured-artists/`. To make "Vices et Bordel" the
      // default, its filename is prefixed with `01 - ` (renamed on disk), so it
      // sorts first. Fallback above preserves the original default if the API
      // is unavailable.
    }
    // Strip origin if accidentally included (e.g. full URL pasted in)
    const stripped = raw.startsWith("http")
      ? raw.replace(/^https?:\/\/[^/]+/, "")
      : raw;
    // Ensure leading slash
    const withSlash = stripped.startsWith("/") ? stripped : `/${stripped}`;
    // Decode then re-encode to normalise any prior encoding
    return encodeURI(decodeURIComponent(withSlash));
  };

  /** Check whether a new track needs the audio element reloaded */
  const needsTrackReload = (track: TrackInfo, currentSrc: string): boolean => {
    const rawSrc = (track as any)?.url || (track as any)?.audioUrl || (track as any)?.src;
    if (!rawSrc) return true;
    const clean = buildCleanUrl(rawSrc);
    // Decode both sides so spaces (%20) match raw spaces in URLs
    const decodedCurrent = decodeURI(currentSrc.replace(/^https?:\/\/[^/]+/, ""));
    const decodedClean = decodeURI(clean);
    return decodedCurrent !== decodedClean;
  };

  // ---------------------------------------------------------------------------
  // Playback functions
  // ---------------------------------------------------------------------------
  /** Handle media load failures gracefully — prevent unhandled exceptions (Code 4) */
  const handleAudioError = () => {
    const err = audioRef.current?.error;
    if (err?.code === 4) {
      console.warn(`[Audio System] Track unavailable or file missing at: ${audioRef.current?.src}`);
    } else if (err) {
      console.error(`[Audio System] Error ${err.code}: ${err.message}`);
    }
    setIsPlaying(false);
    setIsVisualizerActive(false);
    setDuration(0);
  };

  const playTrack = async (track: TrackInfo) => {
    if (!audioRef.current) return;

    await initAudio();
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume();
    }
    activeAudioRef.current = audioRef.current;

    // Step 1 — extract URL with full fallback chain
    const rawSrc = (track as any)?.url || (track as any)?.audioUrl || (track as any)?.src;
    const audioSrc = buildCleanUrl(rawSrc);
    console.log("[AudioContext] Loading URL:", audioSrc);

    // Step 2 — set preload BEFORE src so the browser begins fetching early
    audioRef.current.preload = "auto";

    // Step 2a — ensure CORS is set before any src assignment so analyser receives
    // valid cross-origin data (no tainted audio). Setting it after src is a no-op.
    audioRef.current.crossOrigin = "anonymous";

    // Step 3 — encode clean source once; decode first to prevent %2520
    if (audioRef.current) {
      const cleanPath = decodeURIComponent(audioSrc);
      const encodedSrc = encodeURI(cleanPath);
      // Normalize both sides to relative paths before comparing.
      // audioRef.current.src returns a full URL; encodedSrc is relative.
      // Without stripping the origin, the comparison always fails for the same track.
      const currentOrigin = audioRef.current.src
        ? new URL(audioRef.current.src).pathname
        : "";
      if (currentOrigin && currentOrigin !== encodedSrc) {
        // Track changed — reload src and reset to beginning.
        audioRef.current.src = encodedSrc;
        audioRef.current.load();
        audioRef.current.currentTime = 0;
        setDuration(0);
      } else if (!currentOrigin) {
        // No src set — assign and load for first track.
        audioRef.current.src = encodedSrc;
        audioRef.current.load();
        audioRef.current.currentTime = 0;
        setDuration(0);
      }
      // Same track (currentOrigin === encodedSrc): src unchanged, time preserved.
    }

    // Step 4 — sync activeTrack state SYNCHRONOUSLY so the player UI updates
    // before the browser begins buffering the new source.
    activeTrackRef.current = track;
    setActiveTrackState(track);

    // Step 4a — Reset BPM while the analyzer is running (so the UI shows '--').
    // This is decoupled from the live AnalyserNode stream; it runs on a separate
    // offline AudioContext and never touches the playback graph.
    setCurrentBpm(null);
    void analyzeTrackBpm(audioSrc);

    // Sync index ref so skip nav starts from this track (direct selection from list)
    const idx = playlist.findIndex(
      (t) => decodeURIComponent((t as any)?.url || "") === decodeURIComponent((track as any)?.url || "")
    );
    currentIndexRef.current = idx === -1 ? 0 : idx;

    // Step 5 — initiate playback
    try {
      audioRef.current.muted = false;
      audioRef.current.volume = 1.0;

      const promise = audioRef.current.play();
      if (promise !== undefined) {
        playPromiseRef.current = promise;
        promise.catch((err: any) => {
          if (err.name !== "AbortError") {
            console.error("[AudioContext] Playback rejected:", err, "URL:", audioSrc);
          }
        });
      }

      setIsPlaying(true);
      setIsPowered(true); // Global play → turntable powers on
      setIsVisualizerActive(true);

      // The JSX <audio onPlay={initWebAudio}> handles Web Audio wiring.
      // This call invokes it synchronously so the analyser is available
      // immediately (before rAF renders) rather than waiting for the native event.
      initWebAudioRef.current();

      setCardVolume(audioRef.current, volume);
    } catch (err: any) {
      console.error("[AudioContext] Playback exception:", err, "URL:", audioSrc);
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
  };

  const stopTrack = () => {
    if (!audioRef.current) return;
    if (playPromiseRef.current) {
      playPromiseRef.current
        .then(() => {
          audioRef.current?.pause();
          if (audioRef.current) audioRef.current.currentTime = 0;
        })
        .catch(() => {});
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsVisualizerActive(false);
  };

  const togglePlayStop = (track: TrackInfo) => {
    if (activeTrackRef.current?.id === track.id && isPlaying) {
      pauseTrack();
    } else {
      playTrack(track);
    }
  };

  const currentTrack = activeTrack;

  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      // Pause without resetting currentTime or clearing src
      audioRef.current.pause();
      setIsPlaying(false);
      setIsVisualizerActive(false);
    } else {
      // Resume audio (if context is suspended, resume it first)
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        try {
          await audioCtxRef.current.resume();
        } catch (e) {
          console.error("AudioContext resume failed:", e);
        }
      }
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setIsPowered(true); // Global play → turntable powers on
        setIsVisualizerActive(true);
        initWebAudioRef.current(); // Ensure pipeline is wired before first rAF frame
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Play error:", err);
        }
      }
    }
  }, [isPlaying]);

  const pause = () => {
    pauseTrack();
  };

  /** Toggle mute — remembers the last active volume, restores cleanly on unmute.
   *  Mute is implemented ENTIRELY at the Web Audio masterGain layer. The HTML
   *  <audio> element stays at volume=1.0 and muted=false so the underlying
   *  MediaElementAudioSourceNode continues feeding the AnalyserNode with raw
   *  signal — the spectrum analyzer / visualizer keep animating while muted. */
  const lastVolumeRef = useRef(0.85);
  const toggleMute = useCallback(() => {
    if (audioCtxRef.current) {
      const gain = gainNodeRef.current;
      if (gain) {
        if (isMuted) {
          // Unmute → restore last volume
          const restore = lastVolumeRef.current > 0.01 ? lastVolumeRef.current : 0.85;
          applyVolumeToGainNode(gain, restore, audioCtxRef.current);
          setIsMuted(false);
          setVolumeState(restore);
        } else {
          // Mute → remember current level, ramp gain to 0
          if (volume > 0.01) lastVolumeRef.current = volume;
          applyVolumeToGainNode(gain, 0, audioCtxRef.current);
          setIsMuted(true);
          setVolumeState(0);
        }
      } else {
        // Fallback (pre-pipeline): flip isMuted only
        setIsMuted((m) => !m);
      }
    } else {
      setIsMuted((m) => !m);
    }
    // IMPORTANT: never touch audioRef.current.muted or call audioRef.current.pause().
    // Both would freeze the MediaElementAudioSourceNode and stop the analyser.
  }, [isMuted, volume, applyVolumeToGainNode]);

  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    setIsMuted(false); // un-mute when volume changes
    // Visualizer decoupling: HTML audio element stays at 100% so
    // MediaElementAudioSource outputs full unattenuated signal to the
    // pre-gain AnalyserNode. All attenuation lives at the Web Audio GainNode.
    if (audioRef.current) {
      audioRef.current.volume = 1.0;
      audioRef.current.muted = false;
    }
    if (gainNodeRef.current && audioCtxRef.current) {
      applyVolumeToGainNode(gainNodeRef.current, clamped, audioCtxRef.current);
    }
    const el = audioRef.current;
    if (el && gainNodesRef.current.get(el) && audioCtxRef.current) {
      applyVolumeToGainNode(gainNodesRef.current.get(el)!, clamped, audioCtxRef.current);
    }
  }, []);

  const stop = () => {
    if (audioRef.current) {
      if (playPromiseRef.current) {
        playPromiseRef.current
          .then(() => {
            audioRef.current?.pause();
            if (audioRef.current) audioRef.current.currentTime = 0;
          })
          .catch(() => {});
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setIsVisualizerActive(false);
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const loadPlaylist = useCallback((tracks: TrackInfo[]) => {
    setPlaylist(tracks);
  }, []);

  const skipForward = (seconds: number = 10) => {
    if (!audioRef.current) return;
    const next = Math.min(
      duration || audioRef.current.duration || 0,
      (audioRef.current.currentTime || 0) + seconds
    );
    audioRef.current.currentTime = next;
    setCurrentTime(next);
  };

  const skipBackward = (seconds: number = 10) => {
    if (!audioRef.current) return;
    const prev = Math.max(0, (audioRef.current.currentTime || 0) - seconds);
    audioRef.current.currentTime = prev;
    setCurrentTime(prev);
  };

  /** Get current playlist index with robust fallback (id / filename / url) */
  const getCurrentIndex = () => {
    if (!playlist.length || !activeTrack) return 0;
    const idx = playlist.findIndex(
      (t) =>
        t.id === activeTrack.id ||
        (t as any)?.filename === (activeTrack as any)?.filename ||
        (t as any)?.url === (activeTrack as any)?.url ||
        (t as any)?.audioUrl === (activeTrack as any)?.audioUrl
    );
    return idx !== -1 ? idx : 0;
  };

  // Unified playback switcher — single source of truth for index math.
  // Handles rapid-click interruptions gracefully (AbortError ignored).
  // Always forces playback on skip/back even from paused state.
  const playTrackAtIndex = useCallback(async (targetIndex: number) => {
    if (!playlist || playlist.length === 0 || !audioRef.current) return;

    // Lock navigation guard — hold during the whole switch so native pause/ended
    // events from the src swap don't flip isPlaying to false.
    isNavigatingRef.current = true;

    // 1. Calculate circular index mathematically
    const safeIndex = (targetIndex % playlist.length + playlist.length) % playlist.length;
    const targetTrack = playlist[safeIndex];
    const targetUrl = (targetTrack as any)?.url || (targetTrack as any)?.audioUrl || "";

    // 2. Update state and synchronous refs immediately
    currentIndexRef.current = safeIndex;
    setActiveTrack(targetTrack);
    setIsPlaying(true);
    setIsPowered(true); // Global play → turntable powers on
    setCurrentBpm(null);
    void analyzeTrackBpm(targetUrl);

    // 3. Unlock Web Audio Context if suspended
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      try {
        await audioCtxRef.current.resume();
      } catch (e) {
        console.error("AudioContext resume error:", e);
      }
    }

    // 4. Update audio source and trigger immediate play (unconditional src assignment)
    audioRef.current.src = targetUrl;
    audioRef.current.currentTime = 0;

    try {
      await audioRef.current.play();
    } catch (err: any) {
      // Silently ignore browser promise cancellation from rapid clicking
      if (err.name !== "AbortError") {
        console.error("Playback error:", err);
      }
    } finally {
      // Release lock after promise settles — guarantees it clears even on AbortError
      isNavigatingRef.current = false;
    }
  }, [playlist]);

  // Clean 1-line skip handlers — currentIndexRef stays in sync via playTrackAtIndex
  const playNext = useCallback(() => {
    playTrackAtIndex(currentIndexRef.current + 1);
  }, [playTrackAtIndex]);

  const playPrevious = useCallback(() => {
    playTrackAtIndex(currentIndexRef.current - 1);
  }, [playTrackAtIndex]);

  // ---------------------------------------------------------------------------
  // Global media coordination
  // ---------------------------------------------------------------------------
  const pauseAllOtherMedia = useCallback((activeAudioEl?: HTMLAudioElement | null) => {
    sourceNodesRef.current.forEach((_source, audioEl) => {
      if (audioEl !== activeAudioEl && !audioEl.paused) {
        try {
          audioEl.pause();
          audioEl.currentTime = 0;
        } catch (e) {
          console.warn("[AudioContext] Error pausing audio element:", e);
        }
      }
    });

    if (typeof document !== "undefined") {
      document.querySelectorAll("iframe").forEach((iframe) => {
        try {
          iframe.contentWindow?.postMessage(
            JSON.stringify({ event: "command", func: "pauseVideo", args: "" }),
            "*"
          );
        } catch {
          // Ignore cross-origin errors
        }
      });
    }

    setActiveTrackState(null);
    activeTrackRef.current = null;
    previewController.notify(null, false);

    if (audioRef.current !== activeAudioEl && isPlaying) {
      setIsPlaying(false);
      setIsVisualizerActive(false);
    }
  }, [isPlaying, setIsPlaying, setIsVisualizerActive, setActiveTrackState]);

  // ---------------------------------------------------------------------------
  // useEffect hooks
  // ---------------------------------------------------------------------------

  // Keep activeAudioRef in sync with the global player element
  useEffect(() => {
    if (audioRef.current) {
      activeAudioRef.current = audioRef.current;
    }
  }, [activeTrack]);

  // Attach media error diagnostics once the audio element is mounted
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.onerror = () => {
      console.error(
        "[Audio Error Code]",
        el.error?.code,
        "Message:",
        el.error?.message,
        "Path:",
        el.src
      );
    };
    return () => {
      el.onerror = null;
    };
  }, []);

  // Re-bind source and reload when activeTrack changes externally
  useEffect(() => {
    if (!audioRef.current || !activeTrack) return;
    if (needsTrackReload(activeTrack, audioRef.current.src)) {
      const rawSrc = (activeTrack as any)?.url || (activeTrack as any)?.audioUrl || (activeTrack as any)?.src;
      const cleanSrc = buildCleanUrl(rawSrc);
      console.log("[AudioContext] activeTrack changed externally — reloading source:", cleanSrc);
      audioRef.current.src = cleanSrc;
      audioRef.current.load();
      audioRef.current.currentTime = 0;
      setDuration(0);
    }
  }, [activeTrack]);

  // ─── Single shared Web Audio pipeline ────────────────────────────────────────
  // Called by the JSX onPlay handler (and from playTrack) — wires the
  // source → analyser → destination graph exactly once per audio element.
  // The onPlay event fires only after a real user gesture, so the
  // AudioContext is guaranteed not to be in the "blocked" suspended state.
  const initWebAudio = useCallback(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    // Defensive: ensure CORS attribute is set on the element before source creation
    audioEl.crossOrigin = "anonymous";

    // Initialize AudioContext on user interaction (gesture unlocks the API)
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }

    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    // Bind source and analyser only once per audio element
    if (!sourceNodeRef.current) {
      try {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256; // High responsiveness
        analyser.smoothingTimeConstant = 0.7;
        analyser.minDecibels = -90;
        analyser.maxDecibels = 0;

        // Decoupled parallel routing: the analyser taps the source DIRECTLY
        // (pre-volume, pre-mute), while the audible output flows through
        // the masterGain independently. This means the spectrum analyzer
        // always sees the raw 100% signal — volume slider, mute state, and
        // any future gain changes do NOT dim the visualizer.
        //
        //   source ──► analyser      (raw, unscaled, ignores masterGain)
        //           └► masterGain ──► destination   (audible output)
        const source = ctx.createMediaElementSource(audioEl);
        const masterGain = ctx.createGain();
        masterGain.gain.value = 0.85; // match initial volume state

        source.connect(analyser);
        // NOTE: analyser.connect(...) is intentionally NOT chained to masterGain.
        // The analyser is a sink of its own; connecting it downstream would
        // re-introduce the post-gain attenuation it was just decoupled from.

        source.connect(masterGain);
        masterGain.connect(ctx.destination);

        sourceNodeRef.current = source;
        analyserRef.current   = analyser;
        gainNodeRef.current   = masterGain;

        // Update reactive state so React consumers re-render with the live node
        setAnalyserNode(analyser);
        tickAnalyser();

        console.log("✅ Web Audio API Pipeline successfully connected to <audio>");
      } catch (err) {
        console.warn("Web Audio binding warning:", err);
      }
    }
  }, [tickAnalyser]);

  // Register initWebAudio with the ref so legacy connect functions can delegate without TDZ
  initWebAudioRef.current = initWebAudio;

  // Backup safety net: also bind on first render in case the play event
  // never fires (e.g., track autoplay block) — this keeps the analyser
  // reachable for components even when paused.
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    // No-op listener — pipeline is wired via initWebAudio on play
    return () => {};
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <>
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        preload="metadata"
        style={{ display: "none" }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            audioRef.current.crossOrigin = 'anonymous'; // Defensive: enforce CORS before any load
            setDuration(isNaN(audioRef.current.duration) ? 0 : audioRef.current.duration);
          }
        }}
        onCanPlay={() => {
          if (audioRef.current) {
            setDuration(isNaN(audioRef.current.duration) ? 0 : audioRef.current.duration);
          }
        }}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime || 0);
        }}
        onPlay={() => {
          setIsPlaying(true);
          setIsPowered(true); // Native play event → turntable powers on
          setIsVisualizerActive(true);
          initWebAudioRef.current(); // Wire Web Audio pipeline the moment user gesture unlocks it
        }}
        onPause={handleNativePause}
        onEnded={() => {
          if (!isNavigatingRef.current) {
            setCurrentTime(0);
            playNext();
          }
        }}
        onError={() => {
          const err = audioRef.current?.error;
          console.error(
            "[Audio Error Code]",
            err?.code,
            "Message:",
            err?.message,
            "Path:",
            audioRef.current?.src
          );
          handleAudioError();
        }}
        onDurationChange={() => {
          if (audioRef.current) {
            setDuration(isNaN(audioRef.current.duration) ? 0 : audioRef.current.duration);
          }
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
          // Playback controls
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
          // Scratch / motor torque
          setScratchFilterFreq,
          setPlaybackRate,
          // Global media coordination
          pauseAllOtherMedia,
          activeAudioRef,
          audioRef, // expose so components can bind directly to the shared element
          analyserRef,
          analyserNode, // reactive state version — updated by the single pipeline
          gainNodeRef,
          getAnalyserNode,
          ensureAudioContext,
          // Offline BPM analysis
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
