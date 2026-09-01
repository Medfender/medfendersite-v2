"use client";

// AudioTickController — standalone singleton outside React tree.
// Manages a single requestAnimationFrame loop, exposes pub/sub emitter + useAudioTick hook.
// Per ADR-0001: shared analyser node, zero React renders for animation.

export type TransportState = "stopped" | "playing" | "paused";

export interface TickFrame {
  time: number; // seconds (from audioRef.current.currentTime mirror)
  progress: number; // 0..1
  transportState: TransportState;
  isPlaying: boolean;
  frequencyData: Uint8Array | null; // shared analyser output
}

type TickListener = (frame: TickFrame) => void;

class AudioTickController {
  private rafId = 0;
  private running = false;

  // Refs mirrored from AudioProvider (seeded once at init)
  analyserRef: { current: AnalyserNode | null } = { current: null };
  audioRef: { current: HTMLAudioElement | null } = { current: null };
  transportRef = { current: "stopped" as TransportState };

  private listeners = new Set<TickListener>();
  private lastFrame = 0;

  // ── Pub / Sub (A7) ─────────────────────────────────────────────────────────
  on = (cb: TickListener) => { this.listeners.add(cb); };
  off = (cb: TickListener) => { this.listeners.delete(cb); };

  // ── Mirror helpers (bridged from AudioProvider) ─────────────────────────────
  setTransportState = (s: TransportState) => { this.transportRef.current = s; };
  seedRefs = (analyser: AnalyserNode | null, audio: HTMLAudioElement | null) => {
    this.analyserRef.current = analyser;
    this.audioRef.current = audio;
  };

  // ── rAF loop (A4, A6) ──────────────────────────────────────────────────────
  private tick = () => {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this.tick);

    const audio = this.audioRef.current;
    const analyser = this.analyserRef.current;
    const state = this.transportRef.current;
    const isPlaying = state === "playing";

    const time = audio ? (audio.currentTime || 0) : 0;
    const duration = audio && isFinite(audio.duration) ? audio.duration : 1;
    const progress = duration > 0 ? time / duration : 0;

    let freq: Uint8Array | null = null;
    if (analyser && isPlaying) {
      try {
        const bins = analyser.frequencyBinCount;
        const data = new Uint8Array(bins);
        analyser.getByteFrequencyData(data);
        freq = data;
      } catch { /* analyser not ready yet */ }
    }

    const frame: TickFrame = { time, progress, transportState: state, isPlaying, frequencyData: freq };
    this.listeners.forEach((cb) => {
      try { cb(frame); } catch { /* isolate bad subscriber */ }
    });
  };

  start = () => {
    if (this.running) return;
    this.running = true;
    this.rafId = requestAnimationFrame(this.tick);
  };

  stop = () => {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  };

  // Auto-shutdown when all subscribers gone (cleanup guard)
  checkIdle = () => {
    if (this.listeners.size === 0 && this.running) this.stop();
  };
}

export const audioTickController = new AudioTickController();
