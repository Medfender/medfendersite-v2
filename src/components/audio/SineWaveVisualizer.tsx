"use client";

import React, { useRef, useEffect } from "react";
import { useAudio } from "@/context/AudioContext";

export default function SineWaveVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const { getFrequencyData, isPlaying, audioCtx } = useAudio();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      const audioEl = audioRef.current;
      const freqData = audioEl ? getFrequencyData(audioEl) : null;

      if (isPlaying && freqData) {
        const bufferLength = freqData.length;
        const dataArray = new Uint8Array(bufferLength);
        // Use frequency data for a more musical visualization
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = freqData[i];
        }

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "#00d8f6";
        ctx.shadowColor = "#00d8f6";
        ctx.shadowBlur = 16;

        ctx.globalCompositeOperation = "lighter";

        ctx.beginPath();

        const sliceWidth = w / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 255.0;
          const y = h - v * h * 0.6; // Invert and scale

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            const prevV = dataArray[i - 1] / 255.0;
            const prevY = h - prevV * h * 0.6;
            const cpX = x - sliceWidth / 2;
            const cpY = (prevY + y) / 2;
            ctx.quadraticCurveTo(cpX, cpY, x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();

        // Mirror below center line for symmetry
        ctx.globalCompositeOperation = "lighter";
        ctx.beginPath();
        ctx.strokeStyle = "rgba(168, 85, 247, 0.4)";
        ctx.shadowColor = "rgba(168, 85, 247, 0.5)";
        ctx.shadowBlur = 8;
        ctx.lineWidth = 1.5;

        x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 255.0;
          const y = v * h * 0.4; // Mirror below

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            const prevV = dataArray[i - 1] / 255.0;
            const prevY = prevV * h * 0.4;
            const cpX = x - sliceWidth / 2;
            const cpY = (prevY + y) / 2;
            ctx.quadraticCurveTo(cpX, cpY, x, y);
          }
          x += sliceWidth;
        }
        ctx.stroke();
      } else {
        // Subtle flat baseline with enhanced glow
        ctx.beginPath();
        ctx.lineWidth = 2.0;
        ctx.strokeStyle = "rgba(0,216,246,0.3)";
        ctx.shadowColor = "rgba(0,216,246,0.2)";
        ctx.shadowBlur = 8;

        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, getFrequencyData]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-64 md:h-80 lg:h-96 rounded-2xl bg-gradient-to-b from-neutral-950/80 to-black/60 shadow-xl"
      aria-label="Real-time audio visualizer"
    />
  );
}