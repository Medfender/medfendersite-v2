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

export class AudioPhysicsEngine {
  private smoothed: Float32Array;
  private peaks: Float32Array;
  private peakDecay: Float32Array;
  private numBins: number;
  private idlePhase: number = 0;

  constructor(numBins: number = 128) {
    this.numBins = numBins;
    this.smoothed = new Float32Array(numBins);
    this.peaks = new Float32Array(numBins);
    this.peakDecay = new Float32Array(numBins);
  }

  public process(
    freqData: Uint8Array,
    timeData: Uint8Array,
    dt: number,
    isPlaying: boolean
  ): FrameData {
    this.idlePhase += dt * 1.5;

    for (let i = 0; i < this.numBins; i++) {
      let targetAmp = 0;

      if (isPlaying) {
        const dataLength = freqData.length;
        const normIndex = Math.pow(i / (this.numBins - 1), 1.7);
        const bin = Math.min(Math.floor(normIndex * dataLength), dataLength - 1);
        const rawVal = freqData[bin] || 0;
        const normalized = rawVal / 255.0;
// Floor cutoff at -24 dB: anything quieter reads as silence (0 amplitude).
// With analyser minDecibels=-90 / maxDecibels=0, -24 dB ≈ 0.267 of the 0..255 range.
        const FLOOR = 0.267;
        const clipped = normalized < FLOOR ? 0 : (normalized - FLOOR) / (1 - FLOOR);
        // Sensitivity curve boost for high visual response
        targetAmp = Math.min(1.0, Math.pow(clipped, 1.05) * 1.45);
      } else {
        // Organic ambient wave when audio is idle/paused
        const wave1 = Math.sin(this.idlePhase + i * 0.08) * 0.04;
        const wave2 = Math.cos(this.idlePhase * 1.3 + i * 0.15) * 0.025;
        targetAmp = Math.max(0.015, 0.04 + wave1 + wave2);
      }

      // Ballistics: Instant attack, fast exponential release
      const current = this.smoothed[i];
      if (targetAmp > current) {
        this.smoothed[i] = current + (targetAmp - current) * Math.min(1, dt * 55);
      } else {
        const decay = Math.exp(-dt * 6.5);
        this.smoothed[i] = current * decay + targetAmp * (1 - decay);
      }

      // Peak-Hold Decay
      if (this.smoothed[i] > this.peaks[i]) {
        this.peaks[i] = this.smoothed[i];
        this.peakDecay[i] = 0;
      } else {
        this.peakDecay[i] += dt * 0.5;
        this.peaks[i] = Math.max(0, this.peaks[i] - this.peakDecay[i] * dt);
      }
    }

    // Oscilloscope Time-Domain Processing
    const timeNorm = new Float32Array(timeData.length);
    for (let i = 0; i < timeData.length; i++) {
      timeNorm[i] = (timeData[i] - 128) / 128.0;
    }

    return {
      smoothed: this.smoothed,
      peaks: this.peaks,
      timeDomain: timeNorm,
    };
  }
}
