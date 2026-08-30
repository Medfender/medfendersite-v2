/**
 * Studio-grade audio physics engine.
 * Modes: curve | bars | waveform (radial removed for this version)
 */
export type VisualizerMode = 'curve' | 'bars' | 'waveform';

export interface FrameData {
  smoothed: Float32Array;
  peaks: Float32Array;
  timeDomain: Float32Array;
}

/**
 * LERP rate for smoothing frequency data towards audio FFT updates.
 * Calibrated for 60Hz as 1.0 (per second of "60% of distance closed").
 * The actual per-frame rate is `LERP_SPEED * deltaTime` so physics remains
 * identical at 60Hz, 144Hz, and 240Hz.
 */
const LERP_SPEED = 22.0; // higher = snappier; tuned for musical transients

export class AudioPhysicsEngine {
  private smoothed: Float32Array;
  private peaks: Float32Array;
  private peakDecay: Float32Array;
  private timeDomain: Float32Array; // pre-allocated, reused per frame
  private numBins: number;
  private timeBufLen: number = 0;
  private idlePhase: number = 0;

  constructor(numBins: number = 128) {
    this.numBins = numBins;
    this.smoothed = new Float32Array(numBins);
    this.peaks = new Float32Array(numBins);
    this.peakDecay = new Float32Array(numBins);
    this.timeDomain = new Float32Array(1024); // grows on demand up to analyser fftSize
  }

  public process(
    freqData: Uint8Array,
    timeData: Uint8Array,
    dt: number,
    isPlaying: boolean
  ): FrameData {
    this.idlePhase += dt * 1.5;

    // Per-frame LERP factor: closes (1 - e^(-LERP_SPEED*dt)) of the distance
    // every second. dt-normalized so visual response is refresh-rate independent.
    const lerpAlpha = 1 - Math.exp(-LERP_SPEED * dt);

    for (let i = 0; i < this.numBins; i++) {
      let targetAmp = 0;

      if (isPlaying) {
        const dataLength = freqData.length;
        const normIndex = Math.pow(i / (this.numBins - 1), 1.7);
        const bin = Math.min(Math.floor(normIndex * dataLength), dataLength - 1);
        const rawVal = freqData[bin] || 0;
        const normalized = rawVal / 255.0;
        // Floor cutoff at -60 dB: with minDecibels=-90 / maxDecibels=0,
        // the -60 dB point maps to ~0.08 of the 0..255 range.
        const FLOOR = 0.08;
        const clipped = normalized < FLOOR ? 0 : (normalized - FLOOR) / (1 - FLOOR);
        // Sensitivity curve boost for high visual response
        targetAmp = Math.min(1.0, Math.pow(clipped, 1.05) * 1.45);
      } else {
        // Organic ambient wave when audio is idle/paused
        const wave1 = Math.sin(this.idlePhase + i * 0.08) * 0.04;
        const wave2 = Math.cos(this.idlePhase * 1.3 + i * 0.15) * 0.025;
        targetAmp = Math.max(0.015, 0.04 + wave1 + wave2);
      }

      // LERP: explicit linear interpolation of smoothed toward target.
      // Ballistics: instant attack (asymmetric), fast exponential release.
      const current = this.smoothed[i];
      if (targetAmp > current) {
        // Attack — close most of the gap in a single frame for snappy transients
        this.smoothed[i] = current + (targetAmp - current) * Math.min(1, dt * 55);
      } else {
        // Release — use the LERP factor so motion is refresh-rate independent
        this.smoothed[i] = current + (targetAmp - current) * lerpAlpha;
      }

      // Peak-Hold Decay (dt-normalized)
      if (this.smoothed[i] > this.peaks[i]) {
        this.peaks[i] = this.smoothed[i];
        this.peakDecay[i] = 0;
      } else {
        this.peakDecay[i] += dt * 0.5;
        this.peaks[i] = Math.max(0, this.peaks[i] - this.peakDecay[i] * dt);
      }
    }

    // Oscilloscope Time-Domain Processing — reuse pre-allocated buffer
    // (grow once if fftSize exceeds initial size; never per-frame).
    const tLen = timeData.length;
    if (tLen > this.timeBufLen) {
      this.timeDomain = new Float32Array(tLen);
      this.timeBufLen = tLen;
    }
    for (let i = 0; i < tLen; i++) {
      this.timeDomain[i] = (timeData[i] - 128) / 128.0;
    }

    return {
      smoothed: this.smoothed,
      peaks: this.peaks,
      timeDomain: this.timeDomain,
    };
  }
}
