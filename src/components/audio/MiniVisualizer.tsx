"use client";

import React, { useEffect, useRef } from "react";
import {
  THEMES,
  drawBars,
  drawWaveform,
  drawCurve,
  createRenderLoop,
} from "@/lib/visualizer/useAudioVisualizer";
import type { ColorTheme, VisualizerMode } from "@/lib/visualizer/useAudioVisualizer";

interface MiniVisualizerProps {
  analyserNode?: AnalyserNode | null;
  isPlaying?: boolean;
  mode?: VisualizerMode;
  width?: number;
  height?: number;
  themeKey?: ColorTheme;
  smoothing?: number;
  /** Optional click handler to cycle visualizer mode — single source of truth lives in parent. */
  onModeCycle?: () => void;
}

/**
 * MiniVisualizer — free-contained canvas component for the bottom player bar.
 * Draws using the SAME shared engine (drawBars / drawWaveform / drawCurve) as
 * the main head visualizer for visual consistency.
 *
 * Strict fixed footprint controlled by `width` × `height` props.
 * Features smooth fade-in/out transition when play/pause state changes.
 */
export const MiniVisualizer: React.FC<MiniVisualizerProps> = ({
  analyserNode,
  isPlaying = false,
  mode = "bars",
  width = 150,
  height = 50,
  themeKey = "cyan",
  smoothing = 0.25,
  onModeCycle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mode is driven entirely by the parent's `mode` prop. The canvas cycles mode
  // on click via the optional `onModeCycle` callback so there is no dual state.
  const handleClick = () => {
    if (onModeCycle) onModeCycle();
  };

  // Persistent scratch buffers — survive re-renders without churn.
  const smoothedRef  = useRef<Float32Array<ArrayBuffer>>(new Float32Array(new ArrayBuffer(32 * 4)).fill(0) as Float32Array<ArrayBuffer>);
  const peaksRef     = useRef<Float32Array<ArrayBuffer>>(new Float32Array(new ArrayBuffer(32 * 4)).fill(0) as Float32Array<ArrayBuffer>);
  const peakHoldRef  = useRef<Float32Array<ArrayBuffer>>(new Float32Array(new ArrayBuffer(32 * 4)).fill(0) as Float32Array<ArrayBuffer>);
  const tdRef        = useRef<Float32Array<ArrayBuffer>>(new Float32Array(new ArrayBuffer(128 * 4)).fill(0) as Float32Array<ArrayBuffer>);
  const rawBufRef    = useRef<Uint8Array<ArrayBuffer> | null>(null);

  // Ref so the loop can read play state without being torn down on flips
  const isPlayingRef = useRef(isPlaying);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  useEffect(() => {
    // Persistent fade coefficient — survives outside the loop
    let fadeLevel = 0;

    const theme = THEMES[themeKey] ?? THEMES.cyan;
    const loopMode = mode; // capture so the loop doesn't restart when mode flips

    const loop = createRenderLoop(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;

      // Read the ACTUAL rendered bounding box — respects flex sizing, responsive
      // layout, and any CSS width overrides from the parent container. This
      // replaces the stale `width` prop which defaults to 150 and never updates.
      const rect = canvas.getBoundingClientRect();
      const cssW = rect.width  || width;
      const cssH = rect.height || height;

      // Always set physical backing store to match CSS size × DPR so the canvas
      // fills the correct number of physical pixels on HiDPI/Retina screens.
      // The conditional guard is removed because comparing canvas.width (physical)
      // against cssW*dpr (also physical) can incorrectly evaluate false on first
      // render when canvas.width already equals rect.width (raw CSS value) —
      // causing ctx.scale(dpr) to compress all drawing into the left half.
      canvas.width  = cssW * dpr;
      canvas.height = cssH * dpr;
      // setTransform RESETS the matrix each frame, then scales. ctx.scale(dpr,dpr)
      // would COMPOUND with any prior transform and grow geometrically over many
      // rAF frames — eventually shrinking drawing to zero. setTransform avoids that.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Smooth interpolation of fade coefficient (read from ref so the loop
      // outlives React state flips and the fade-out still renders).
      if (isPlayingRef.current) {
        fadeLevel = Math.min(1, fadeLevel + 0.02); // Smooth, quick fade in
      } else {
        fadeLevel = Math.max(0, fadeLevel - 0.005); // Very slow, cinematic fade out
      }

      // Apply global alpha so the entire drawing fades smoothly
      ctx.globalAlpha = Math.max(0, fadeLevel);

      // Idle short-circuit: if the audio is stopped AND the fade is finished,
      // clear the canvas. The createRenderLoop wrapper self-schedules on every
      // call, so returning here keeps the loop alive and waiting for the next play.
      if (!isPlayingRef.current && fadeLevel <= 0.001) {
        ctx.clearRect(0, 0, cssW, cssH);
        ctx.globalAlpha = 1;
        return;
      }

      ctx.clearRect(0, 0, cssW, cssH);

      // Prepare frequency buffer
      const binCount = analyserNode ? analyserNode.frequencyBinCount : 64;
      if (!rawBufRef.current || rawBufRef.current.length !== binCount) {
        const ab = new ArrayBuffer(binCount) as ArrayBuffer;
        rawBufRef.current = new Uint8Array(ab) as Uint8Array<ArrayBuffer>;
      }
      const raw = rawBufRef.current;

      if (analyserNode && isPlayingRef.current) {
        // ONLY fetch new frequency/waveform data if music is playing.
        // If stopped, we bypass the fetch so the buffers freeze at their last
        // known active state, allowing `fadeLevel` to scale them down smoothly.
        analyserNode.getByteFrequencyData(raw);
        analyserNode.getFloatTimeDomainData(tdRef.current);
      }

      // ── Smoothed frequency + peak hold ───────────────────────────────────
      // Logarithmic frequency-to-bin mapping: bins are spaced in log-space
      // so the entire 20Hz–20kHz range fills the full canvas width evenly.
      // Each bar i reads from a log-positioned bin index instead of linear step.
      const barCount = 16;
      const smoothed  = smoothedRef.current;
      const peaks    = peaksRef.current;
      const peakHold = peakHoldRef.current;

      // Log-normalised bin spread: 20Hz → index near 0, 20kHz → index near raw.length-1.
      // Without this, linear `raw[i*step]` clusters most energy in the left/middle
      // (low/mid bands) and leaves the high-frequency right side blank/dead.
      // Strict musical range: 20Hz → 10kHz (covers bass, mids, presence; ignores
      // the very top octave where analysers are typically noise-floor dominated).
      const logMin = Math.log10(20);
      const logMax = Math.log10(10000);
      const freqBinCount = raw.length;

      let anyOverflow = false;
      for (let i = 0; i < barCount; i++) {
        // Map bar position 0..barCount-1 to log frequency 20Hz..10kHz
        const t = i / (barCount - 1); // 0 → 20Hz, 1 → 10kHz
        const logFreq = logMin + t * (logMax - logMin);
        const freq = Math.pow(10, logFreq);
        // Convert frequency back to bin index (relative to fft bin count)
        const binIdx = Math.round((freq / 10000) * (freqBinCount - 1));
        const safeIdx = Math.max(0, Math.min(freqBinCount - 1, binIdx));
        const v = raw[safeIdx] / 255;
        const next = Math.min(v, 1.0);
        smoothed[i] += (next - smoothed[i]) * (1 - smoothing);
        if (smoothed[i] > peakHold[i]) {
          peakHold[i] = smoothed[i];
        } else {
          peakHold[i] += (smoothed[i] - peakHold[i]) * 0.08;
        }
        peaks[i] = peakHold[i];
        if (v > 1.0) anyOverflow = true;
      }

      // Scale amplitude by fadeLevel so the waveform collapses to a flatline
      // smoothly as it fades to black, instead of freezing in mid-air.
      const adjustedSmoothed = new Float32Array(smoothed.length);
      for (let i = 0; i < smoothed.length; i++) {
        adjustedSmoothed[i] = smoothed[i] * fadeLevel;
      }
      const adjustedPeaks = new Float32Array(peaks.length);
      for (let i = 0; i < peaks.length; i++) {
        adjustedPeaks[i] = peaks[i] * fadeLevel;
      }
      const adjustedTd = new Float32Array(tdRef.current.length);
      for (let i = 0; i < tdRef.current.length; i++) {
        adjustedTd[i] = tdRef.current[i] * fadeLevel;
      }

      // ── Render by mode ───────────────────────────────────────────────────
      if (loopMode === "bars") {
        drawBars(ctx, cssW, cssH, 0, 0, theme, {
          smoothed: adjustedSmoothed,
          peaks: adjustedPeaks,
          barCount,
          gap: 2,
          cornerRadius: 2,
        });
        // Overflow glow along the top edge
        if (anyOverflow) {
          ctx.save();
          ctx.shadowColor = theme.overflow;
          ctx.shadowBlur  = 8;
          ctx.strokeStyle = theme.overflow;
          ctx.lineWidth   = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(cssW, 0);
          ctx.stroke();
          ctx.restore();
        }
      } else if (loopMode === "curve") {
        drawCurve(ctx, cssW, cssH, 0, 0, theme, adjustedSmoothed, adjustedPeaks);
      } else {
        drawWaveform(ctx, cssW, cssH, 0, 0, adjustedTd, theme);
      }

      ctx.globalAlpha = 1;
    });

    const id = loop.start();
    return () => loop.stop();
  }, [analyserNode, mode, width, height, themeKey, smoothing]);

  return (
    <canvas
      ref={canvasRef}
      className="block cursor-pointer w-full h-full"
      onClick={handleClick}
      style={{
        // Fallback intrinsic size in case the parent is unsized; with w-full/h-full
        // the canvas grows to fill its flex/grid container.
        minWidth: width,
        minHeight: height,
        flexShrink: 0,
        imageRendering: "auto",
        display: "block",
      }}
    />
  );
};

export default MiniVisualizer;
