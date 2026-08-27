"use client";

import React, { useEffect, useRef } from "react";
import { useAudio } from "@/context/AudioContext";

interface SpectrumVisualizerProps {
  isActive?: boolean;
  width?: number;
  height?: number;
}

export default function SpectrumVisualizer({
  isActive = true,
  width = 150,
  height = 60,
}: SpectrumVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const { analyserNode, isPlaying } = useAudio();

  const LOG_BINS = 32;
  const SMOOTHING = 0.15;
  const binIndicesRef = useRef<number[]>([]);
  const smoothedDataRef = useRef<Float32Array>(new Float32Array(LOG_BINS).fill(0));

  if (binIndicesRef.current.length === 0) {
    // fftSize=128 → frequencyBinCount = 64
    const freqBinCount = 64;
    for (let i = 0; i < LOG_BINS; i++) {
      const logPos = Math.log10(1 + i / LOG_BINS * 9) / Math.log10(10);
      const binIdx = Math.floor(logPos * (freqBinCount - 1));
      binIndicesRef.current.push(Math.min(binIdx, freqBinCount - 1));
    }
  }

  const drawFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive) {
      animationRef.current = requestAnimationFrame(drawFrame);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = (canvas.width = width * dpr);
    const h = (canvas.height = height * dpr);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const centerY = height / 2;
    const maxBarHeight = centerY - 2;
    const barWidth = 1;
    const barGap = 1;
    const totalWidth = LOG_BINS * (barWidth + barGap);
    const startX = (width - totalWidth) / 2;

    const rawValues: number[] = [];
    if (analyserNode && isPlaying) {
      const freqData = new Uint8Array(analyserNode.frequencyBinCount);
      analyserNode.getByteFrequencyData(freqData);
      for (let i = 0; i < LOG_BINS; i++) {
        const binIdx = binIndicesRef.current[i];
        rawValues.push(freqData[binIdx] / 255);
      }
    } else {
      for (let i = 0; i < LOG_BINS; i++) rawValues.push(0);
    }

    for (let i = 0; i < LOG_BINS; i++) {
      smoothedDataRef.current[i] = smoothedDataRef.current[i] * SMOOTHING + rawValues[i] * (1 - SMOOTHING);
    }

    for (let i = 0; i < LOG_BINS; i++) {
      const x = startX + i * (barWidth + barGap);
      const normalizedAmp = Math.max(0, Math.min(1, smoothedDataRef.current[i]));
      const barH = normalizedAmp * maxBarHeight;
      if (barH <= 0.5) continue;

      const topY = centerY - barH;
      const gradientTop = ctx.createLinearGradient(0, topY, 0, centerY);
      gradientTop.addColorStop(0, "rgba(168, 85, 247, 0.3)");
      gradientTop.addColorStop(0.3, "rgba(34, 211, 238, 0.8)");
      gradientTop.addColorStop(1, "rgba(34, 211, 238, 0.4)");

      ctx.fillStyle = gradientTop;
      ctx.shadowBlur = 4;
      ctx.shadowColor = "rgba(34, 211, 238, 0.9)";

      const radius = 0.5;
      ctx.beginPath();
      ctx.roundRect(x, topY, barWidth, barH, radius);
      ctx.fill();

      const bottomY = centerY;
      const bottomH = barH * 0.85;
      const gradientBottom = ctx.createLinearGradient(0, centerY, 0, centerY + bottomH);
      gradientBottom.addColorStop(0, "rgba(34, 211, 238, 0.25)");
      gradientBottom.addColorStop(0.6, "rgba(168, 85, 247, 0.2)");
      gradientBottom.addColorStop(1, "rgba(168, 85, 247, 0.05)");

      ctx.fillStyle = gradientBottom;
      ctx.shadowBlur = 2;
      ctx.shadowColor = "rgba(168, 85, 247, 0.5)";

      ctx.beginPath();
      ctx.roundRect(x, bottomY, barWidth, bottomH, radius);
      ctx.fill();

      ctx.shadowBlur = 0;
    }

    animationRef.current = requestAnimationFrame(drawFrame);
  };

  useEffect(() => {
    if (!isActive || !isPlaying) return;
    animationRef.current = requestAnimationFrame(drawFrame);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isActive, isPlaying, analyserNode]);

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
