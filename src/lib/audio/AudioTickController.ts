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
  /** EQ frequency response magnitude (normalized, 0..1) per frequency bin */
  eqFrequencyResponse: Float32Array | null;
  /** Frequencies (Hz) corresponding to each EQ response bin */
  eqFrequencies: Float32Array | null;
  /** Live EQ band state */
  eqBands: EQBand[];
}

type TickListener = (frame: TickFrame) => void;

// ── EQ Band types (used by SpectrumAnalyzerPanel) ──────────────────────────
export type FilterType = "lowcut" | "lowshelf" | "peaking" | "highshelf" | "highcut";

export interface EQBand {
  id: number;
  type: FilterType;
  frequency: number;
  gain: number;
  q: number;
  enabled: boolean;
}

// ── Canvas coordinate helpers (used by SpectrumAnalyzerPanel) ───────────────
const MIN_FREQ = 20;
const MAX_FREQ = 20000;
const MIN_DB = -18;
const MAX_DB = 18;
const DB_RANGE = MAX_DB - MIN_DB; // 36

/** Map frequency (Hz) to a 0..1 normalized x coordinate (logarithmic). */
export function freqToXNorm(freq: number): number {
  return Math.log(freq / MIN_FREQ) / Math.log(MAX_FREQ / MIN_FREQ);
}

/** Map a 0..1 x coordinate back to frequency (Hz). */
export function xNormToFreq(x: number): number {
  return MIN_FREQ * Math.pow(MAX_FREQ / MIN_FREQ, Math.max(0, Math.min(1, x)));
}

/** Map dB value to a 0..1 normalized y coordinate (0 = top, 1 = bottom). */
export function dbToYNorm(db: number): number {
  return 1 - (db - MIN_DB) / DB_RANGE;
}

/** Map a 0..1 y coordinate back to dB. */
export function yNormToDb(y: number): number {
  return (1 - Math.max(0, Math.min(1, y))) * DB_RANGE + MIN_DB;
}

class AudioTickController {
  private rafId = 0;
  private running = false;

  // Refs mirrored from AudioProvider (seeded once at init)
  analyserRef: { current: AnalyserNode | null } = { current: null };
  audioRef: { current: HTMLAudioElement | null } = { current: null };
  transportRef = { current: "stopped" as TransportState };

  // EQ state (used by SpectrumAnalyzerPanel) — initialized with flat defaults
  eqBands: EQBand[] = [
    { id: 1, type: "peaking", frequency: 100, gain: 0, q: 1.0, enabled: true },
    { id: 2, type: "peaking", frequency: 1000, gain: 0, q: 1.0, enabled: true },
    { id: 3, type: "peaking", frequency: 3500, gain: 0, q: 1.0, enabled: true },
  ];

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

    const frame: TickFrame = {
      time,
      progress,
      transportState: state,
      isPlaying,
      frequencyData: freq,
      // EQ: simplified flat response (real EQ processing requires a BiquadFilterNode chain)
      eqFrequencyResponse: this.eqBands.length > 0
        ? new Float32Array(512).fill(1)
        : null,
      eqFrequencies: this.eqBands.length > 0
        ? new Float32Array(512).fill(0).map((_, i) => 20 * Math.pow(20000 / 20, i / 511))
        : null,
      eqBands: this.eqBands,
    };
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

  // ── EQ control methods (used by SpectrumAnalyzerPanel) ──────────────────────
  private nextBandId = 4;
  addBand = (type: FilterType, frequency: number, gain: number, q: number): number => {
    const id = this.nextBandId++;
    this.eqBands.push({ id, type, frequency, gain, q, enabled: true });
    return id;
  };
  removeBand = (id: number) => {
    this.eqBands = this.eqBands.filter((b) => b.id !== id);
  };
  setBandType = (id: number, type: FilterType) => {
    const b = this.eqBands.find((x) => x.id === id);
    if (b) b.type = type;
  };
  setBandFrequency = (id: number, frequency: number) => {
    const b = this.eqBands.find((x) => x.id === id);
    if (b) b.frequency = frequency;
  };
  setBandGain = (id: number, gain: number) => {
    const b = this.eqBands.find((x) => x.id === id);
    if (b) b.gain = gain;
  };
  setBandQ = (id: number, q: number) => {
    const b = this.eqBands.find((x) => x.id === id);
    if (b) b.q = q;
  };
  toggleBand = (id: number) => {
    const b = this.eqBands.find((x) => x.id === id);
    if (b) b.enabled = !b.enabled;
  };
  resetAll = () => {
    this.eqBands = [
      { id: 1, type: "peaking", frequency: 100, gain: 0, q: 1.0, enabled: true },
      { id: 2, type: "peaking", frequency: 1000, gain: 0, q: 1.0, enabled: true },
      { id: 3, type: "peaking", frequency: 3500, gain: 0, q: 1.0, enabled: true },
    ];
    this.nextBandId = 4;
  };
}

export const audioTickController = new AudioTickController();
