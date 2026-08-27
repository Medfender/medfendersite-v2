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
}

/**
 * MiniVisualizer — free-contained canvas component for the bottom player bar.
 * Draws using the SAME shared engine (drawBars / drawWaveform / drawCurve) as
 * the main head visualizer for visual consistency.
 *
 * Strict fixed footprint controlled by `width` × `height` props.
 * Overflowing (>+6 dB) bars trigger a white glow line at the canvas top edge.
 */
export const MiniVisualizer: React.FC<MiniVisualizerProps> = ({
  analyserNode,
  isPlaying = false,
  mode = "bars",
  width = 150,
  height = 50,
  themeKey = "cyan",
  smoothing = 0.25,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Persistent scratch buffers — survive re-renders without churn.
  const smoothedRef  = useRef<Float32Array<ArrayBuffer>>(new Float32Array(new ArrayBuffer(32 * 4)).fill(0) as Float32Array<ArrayBuffer>);
  const peaksRef     = useRef<Float32Array<ArrayBuffer>>(new Float32Array(new ArrayBuffer(32 * 4)).fill(0) as Float32Array<ArrayBuffer>);
  const peakHoldRef  = useRef<Float32Array<ArrayBuffer>>(new Float32Array(new ArrayBuffer(32 * 4)).fill(0) as Float32Array<ArrayBuffer>);
  const tdRef        = useRef<Float32Array<ArrayBuffer>>(new Float32Array(new ArrayBuffer(128 * 4)).fill(0) as Float32Array<ArrayBuffer>);
  const rawBufRef    = useRef<Uint8Array<ArrayBuffer> | null>(null);

  useEffect(() => {
    const theme = THEMES[themeKey] ?? THEMES.cyan;

    const loop = createRenderLoop(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const cssW = width;
      const cssH = height;
      canvas.width  = cssW * dpr;
      canvas.height = cssH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      // Prepare frequency buffer
      const binCount = analyserNode ? analyserNode.frequencyBinCount : 64;
      if (!rawBufRef.current || rawBufRef.current.length !== binCount) {
        const ab = new ArrayBuffer(binCount) as ArrayBuffer;
        rawBufRef.current = new Uint8Array(ab) as Uint8Array<ArrayBuffer>;
      }
      const raw = rawBufRef.current;

      if (analyserNode && isPlaying) {
        analyserNode.getByteFrequencyData(raw);
        analyserNode.getFloatTimeDomainData(tdRef.current);
      } else {
        raw.fill(0);
        tdRef.current.fill(0);
      }

      // ── Smoothed frequency + peak hold ───────────────────────────────────
      const barCount = 16;
      const step = Math.max(1, Math.floor(raw.length / (barCount * 2)));
      const smoothed  = smoothedRef.current;
      const peaks    = peaksRef.current;
      const peakHold = peakHoldRef.current;

      let anyOverflow = false;
      for (let i = 0; i < barCount; i++) {
        const v = raw[i * step] / 255;
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

      // ── Render by mode ───────────────────────────────────────────────────
      if (mode === "bars") {
        drawBars(ctx, cssW, cssH, 0, 0, theme, {
          smoothed,
          peaks,
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
      } else if (mode === "curve") {
        drawCurve(ctx, cssW, cssH, 0, 0, theme, smoothed, peaks);
      } else {
        drawWaveform(ctx, cssW, cssH, 0, 0, tdRef.current, theme);
      }
    });

    const id = loop.start();
    return () => loop.stop();
  }, [analyserNode, isPlaying, mode, width, height, themeKey, smoothing]);

  return (
    <canvas
      ref={canvasRef}
      className="block"
      style={{
        width:  `${width}px`,
        height: `${height}px`,
        flexShrink: 0,
        imageRendering: "auto",
      }}
    />
  );
};

export default MiniVisualizer;
