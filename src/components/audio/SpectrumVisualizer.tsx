"use client";

import React, { useEffect, useRef } from "react";
import { useAudio } from "@/context/AudioContext";

interface SpectrumVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isActive?: boolean;
  width?: number;
  height?: number;
}

export default function SpectrumVisualizer({
  audioRef,
  isActive = true,
  width = 150,
  height = 60,
}: SpectrumVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const { getFrequencyData } = useAudio();

  // Logarithmic bin mapping: focus on mid-range (human hearing sensitivity)
  const LOG_BINS = 32; // 32 symmetric pairs = 64 bars total
  const SMOOTHING = 0.15;

  // Pre-compute log-spaced frequency bin indices
  const binIndicesRef = useRef<number[]>([]);
  if (binIndicesRef.current.length === 0) {
    const freqBinCount = 128; // fftSize / 2 = 128
    for (let i = 0; i < LOG_BINS; i++) {
      // Logarithmic spacing: more bins in lower/mid frequencies
      const logPos = Math.log10(1 + i / LOG_BINS * 9) / Math.log10(10);
      const binIdx = Math.floor(logPos * (freqBinCount - 1));
      binIndicesRef.current.push(Math.min(binIdx, freqBinCount - 1));
    }
  }

  // Smoothing buffer for delicate motion
  const smoothedDataRef = useRef<Float32Array>(new Float32Array(LOG_BINS).fill(0));

  const drawFrame = () => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    if (!canvas || !audio || !isActive) {
      animationRef.current = requestAnimationFrame(drawFrame);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const freqData = getFrequencyData(audio);
    if (!freqData) {
      animationRef.current = requestAnimationFrame(drawFrame);
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width = width * dpr;
    const h = canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear with transparent background
    ctx.clearRect(0, 0, width, height);

    // Center line (horizontal axis)
    const centerY = height / 2;
    const maxBarHeight = centerY - 2;
    const barWidth = 1;
    const barGap = 1;
    const totalWidth = LOG_BINS * (barWidth + barGap);
    const startX = (width - totalWidth) / 2;

    // Map frequency data to log bins and smooth
    const rawValues: number[] = [];
    for (let i = 0; i < LOG_BINS; i++) {
      const binIdx = binIndicesRef.current[i];
      const val = freqData[binIdx] / 255; // Normalize 0-1
      rawValues.push(val);
    }

    // Smooth values for delicate motion
    for (let i = 0; i < LOG_BINS; i++) {
      smoothedDataRef.current[i] = smoothedDataRef.current[i] * SMOOTHING + rawValues[i] * (1 - SMOOTHING);
    }

    // Draw symmetric bars (top + bottom)
    for (let i = 0; i < LOG_BINS; i++) {
      const x = startX + i * (barWidth + barGap);
      const normalizedAmp = Math.max(0, Math.min(1, smoothedDataRef.current[i]));
      const barH = normalizedAmp * maxBarHeight;

      if (barH <= 0.5) continue;

      // Top half - cyan glow
      const topY = centerY - barH;
      const gradientTop = ctx.createLinearGradient(0, topY, 0, centerY);
      gradientTop.addColorStop(0, "rgba(168, 85, 247, 0.3)"); // Purple tip
      gradientTop.addColorStop(0.3, "rgba(34, 211, 238, 0.8)"); // Cyan peak
      gradientTop.addColorStop(1, "rgba(34, 211, 238, 0.4)"); // Cyan base

      ctx.fillStyle = gradientTop;
      ctx.shadowBlur = 4;
      ctx.shadowColor = "rgba(34, 211, 238, 0.9)";

      // Rounded caps - top bar
      const radius = 0.5;
      ctx.beginPath();
      ctx.roundRect(x, topY, barWidth, barH, radius);
      ctx.fill();

      // Bottom half - mirrored with purple echo (delicate)
      const bottomY = centerY;
      const bottomH = barH * 0.85; // Slightly shorter mirror
      const gradientBottom = ctx.createLinearGradient(0, centerY, 0, centerY + bottomH);
      gradientBottom.addColorStop(0, "rgba(34, 211, 238, 0.25)"); // Faint cyan at center
      gradientBottom.addColorStop(0.6, "rgba(168, 85, 247, 0.2)"); // Purple mid
      gradientBottom.addColorStop(1, "rgba(168, 85, 247, 0.05)"); // Fade out

      ctx.fillStyle = gradientBottom;
      ctx.shadowBlur = 2;
      ctx.shadowColor = "rgba(168, 85, 247, 0.5)";

      ctx.beginPath();
      ctx.roundRect(x, bottomY, barWidth, bottomH, radius);
      ctx.fill();

      // Reset shadow
      ctx.shadowBlur = 0;
    }

    animationRef.current = requestAnimationFrame(drawFrame);
  };

  useEffect(() => {
    if (!isActive) return;
    animationRef.current = requestAnimationFrame(drawFrame);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isActive, audioRef.current, getFrequencyData]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width: `${width}px`, height: `${height}px`, display: "block" }}
      aria-hidden="true"
    />
  );
}