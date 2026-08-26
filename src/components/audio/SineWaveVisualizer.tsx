"use client";

import React, { useRef, useEffect } from "react";
import { useAudio } from "@/context/AudioContext";

export default function SineWaveVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const { analyser, isPlaying } = useAudio();

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

      if (isPlaying && analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        // Create a more dynamic visual style
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = "#00d8f6";
        ctx.shadowColor = "#00d8f6";
        ctx.shadowBlur = 20;

        // Add subtle particle effects around the waveform
        ctx.globalCompositeOperation = "lighter";

        ctx.beginPath();
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = "#00d8f6";

        const sliceWidth = w / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * h) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(w, h / 2);
        ctx.stroke();

        // Add some particle effects
        ctx.globalCompositeOperation = "lighter";
        for (let i = 0; i < 5; i++) {
          const particleX = w * Math.random();
          const particleY = h / 2 + (Math.random() - 0.5) * 20;
          const particleSize = 2 + Math.random() * 3;

          ctx.beginPath();
          ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0,216,246,0.15)";
          ctx.fill();
        }
      } else {
        // Subtle flat baseline with enhanced glow
        ctx.beginPath();
        ctx.lineWidth = 2.0;
        ctx.strokeStyle = "rgba(0,216,246,0.4)";
        ctx.shadowColor = "rgba(0,216,246,0.3)";
        ctx.shadowBlur = 10;

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
  }, [isPlaying, analyser]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-64 md:h-80 lg:h-96 rounded-2xl bg-gradient-to-b from-neutral-950/80 to-black/60 shadow-xl"
      aria-label="Real-time audio visualizer"
    />
  );
}