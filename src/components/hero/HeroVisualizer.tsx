"use client";

import React, { useRef, useEffect, useState } from "react";
import { useAudio } from "@/context/AudioContext";

// Clean frequency tick array - well-spaced target frequencies
const TICKS = [100, 250, 500, 1000, 2000, 4000, 8000, 16000];

// Format labels dynamically
const formatFreqLabel = (freq: number): string => {
  return freq < 1000 ? `${freq} Hz` : `${freq / 1000} kHz`;
};

interface HeroVisualizerProps {
  isSectionInView: boolean;
}

export default function HeroVisualizer({ isSectionInView }: HeroVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { getActiveFrequencyData, isPlaying, activeTrack, isVisualizerActive, activeAudioRef } = useAudio();
  const animFrameRef = useRef<number | null>(null);
  const peakInfoRef = useRef<{ bin: number; freq: number; db: number } | null>(null);
  const peakHoldRef = useRef<{ x: number; height: number; timestamp: number }[]>([]);
  const canvasSizeRef = useRef<{ w: number; h: number; dpr: number }>({ w: 800, h: 120, dpr: 1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const cssW = rect.width || 800;
    const cssH = rect.height || 120;

    const setCanvasSize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      canvas.style.width = r.width + "px";
      canvas.style.height = r.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      canvasSizeRef.current = { w: r.width, h: r.height, dpr };
    };
    setCanvasSize();

    const sampleRate = 44100;
    const fftSize = 256;
    const nyquist = sampleRate / 2;
    const bins = fftSize / 2;
    const binWidthHz = nyquist / bins;

    const getBinForFreq = (freq: number) => Math.min(bins - 1, Math.round(freq / binWidthHz));
    const getFreqForBin = (bin: number) => bin * binWidthHz;

    const render = () => {
      const isAnyAudioPlaying = () => {
        return activeAudioRef.current && !activeAudioRef.current.paused && activeAudioRef.current.currentTime > 0;
      };

      animFrameRef.current = requestAnimationFrame(render);
      const { w, h } = canvasSizeRef.current;

      ctx.clearRect(0, 0, w, h);

      const axisHeight = 28;
      const axisY = h - axisHeight;
      const barAreaH = axisY;

      const axisBg = ctx.createLinearGradient(0, axisY, 0, h);
      axisBg.addColorStop(0, "rgba(11,15,25,0.6)");
      axisBg.addColorStop(1, "rgba(11,15,25,0.95)");
      ctx.fillStyle = axisBg;
      ctx.fillRect(0, axisY, w, axisHeight);

      ctx.strokeStyle = "rgba(6,182,212,0.04)";
      ctx.lineWidth = 1;
      for (let i = 1; i < 5; i++) {
        const gy = (barAreaH * i) / 5;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }

      const maxBars = 64;
      const bufferLength = 128;
      const binsToUse = Math.min(bufferLength, maxBars);
      const gap = 1;
      const barW = Math.max(2, (w / binsToUse) - gap);

      const freqData = getActiveFrequencyData ? getActiveFrequencyData() : null;

      if (freqData) {
        const dataArray = new Uint8Array(bufferLength);
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = freqData[i];
        }
        const totalEnergy = dataArray.reduce((acc, val) => acc + val, 0);

        if ((totalEnergy > 0 || isVisualizerActive) && (isAnyAudioPlaying() || isVisualizerActive)) {
          let peakBin = 0;
          let peakValue = 0;

          for (let i = 0; i < binsToUse; i++) {
            const value = dataArray[i];
            const barHeight = (value / 255) * barAreaH * 0.9;
            const y = axisY - barHeight;
            const x = i * (barW + gap);

            if (value > peakValue) {
              peakValue = value;
              peakBin = i;
            }

            const grad = ctx.createLinearGradient(0, axisY, 0, y);
            grad.addColorStop(0, "rgba(6,182,212,0.35)");
            grad.addColorStop(0.4, "rgba(6,182,212,0.85)");
            grad.addColorStop(0.7, "rgba(59,130,246,0.95)");
            grad.addColorStop(1, "rgba(168,85,247,1)");

            ctx.fillStyle = grad;

            const r = Math.min(barW / 2, 4);
            const x2 = x + barW;
            const y2 = axisY;

            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x2 - r, y);
            ctx.quadraticCurveTo(x2, y, x2, y + r);
            ctx.lineTo(x2, y2 - r);
            ctx.quadraticCurveTo(x2, y2, x2 - r, y2);
            ctx.lineTo(x + r, y2);
            ctx.quadraticCurveTo(x, y2, x, y2 - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
            ctx.fill();

            if (barHeight > 3) {
              const capGrad = ctx.createLinearGradient(x, y, x + barW, y);
              capGrad.addColorStop(0, "rgba(168,85,247,0.9)");
              capGrad.addColorStop(0.5, "rgba(6,182,212,1)");
              capGrad.addColorStop(1, "rgba(168,85,247,0.9)");
              ctx.fillStyle = capGrad;
              ctx.fillRect(x, y, barW, Math.min(3, barHeight));
            }
          }

          const peakDb = peakValue > 0 ? 20 * Math.log10(peakValue / 255) : -Infinity;
          const peakFreq = getFreqForBin(peakBin);
          peakInfoRef.current = { bin: peakBin, freq: Math.round(peakFreq), db: Math.round(peakDb * 10) / 10 };

          const peakX = peakBin * (barW + gap) + barW / 2;
          const peakY = axisY - (peakValue / 255) * barAreaH * 0.9;
          const now = Date.now();
          peakHoldRef.current = [...peakHoldRef.current, { x: peakX, height: peakY, timestamp: now }]
            .filter(p => now - p.timestamp < 1200);

          peakHoldRef.current.forEach(ph => {
            const age = now - ph.timestamp;
            const progress = age / 1200;
            const opacity = 1 - progress;
            const fallOffset = progress * progress * 40;

            ctx.fillStyle = `rgba(168,85,247,${opacity * 0.8})`;
            ctx.beginPath();
            ctx.arc(ph.x, ph.height + fallOffset, 3, 0, Math.PI * 2);
            ctx.fill();
          });
        } else {
          ctx.beginPath();
          ctx.strokeStyle = "rgba(6,182,212,0.25)";
          ctx.lineWidth = 2;
          const time = Date.now() * 0.0015;
          for (let px = 0; px < w; px += 2) {
            const y = axisY - barAreaH * 0.5 + Math.sin(px * 0.02 + time) * 15 + Math.sin(px * 0.05 - time * 0.5) * 8;
            if (px === 0) ctx.moveTo(px, y);
            else ctx.lineTo(px, y);
          }
          ctx.stroke();

          const fade = ctx.createLinearGradient(0, axisY - barAreaH * 0.3, 0, axisY);
          fade.addColorStop(0, "rgba(11,15,25,0)");
          fade.addColorStop(1, "rgba(11,15,25,0.9)");
          ctx.fillStyle = fade;
          ctx.fillRect(0, axisY - barAreaH * 0.3, w, barAreaH * 0.3);
        }
      } else {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(6,182,212,0.25)";
        ctx.lineWidth = 2;
        const time = Date.now() * 0.0015;
        for (let px = 0; px < w; px += 2) {
          const y = axisY - barAreaH * 0.5 + Math.sin(px * 0.02 + time) * 15 + Math.sin(px * 0.05 - time * 0.5) * 8;
          if (px === 0) ctx.moveTo(px, y);
          else ctx.lineTo(px, y);
        }
        ctx.stroke();

        const fade = ctx.createLinearGradient(0, axisY - barAreaH * 0.3, 0, axisY);
        fade.addColorStop(0, "rgba(11,15,25,0)");
        fade.addColorStop(1, "rgba(11,15,25,0.9)");
        ctx.fillStyle = fade;
        ctx.fillRect(0, axisY - barAreaH * 0.3, w, barAreaH * 0.3);
      }

      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.textBaseline = "top";

      // Accurate logarithmic mapping with canvas padding
      const PADDING_X = 28;
      const minFreq = 20;
      const maxFreq = 20000;
      const usableWidth = w - PADDING_X * 2;

      const getXPosition = (freq: number) => {
        const logMin = Math.log10(minFreq);
        const logMax = Math.log10(maxFreq);
        const logFreq = Math.log10(freq);
        const ratio = (logFreq - logMin) / (logMax - logMin);
        return PADDING_X + ratio * usableWidth;
      };

      TICKS.forEach((freq, index) => {
        const x = getXPosition(freq);
        const label = formatFreqLabel(freq);

        // Draw tick line
        ctx.strokeStyle = "rgba(6,182,212,0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, axisY);
        ctx.lineTo(x, axisY + 6);
        ctx.stroke();

        // Set text alignment: left for first, center for middle, right for last
        if (index === 0) {
          ctx.textAlign = "left";
        } else if (index === TICKS.length - 1) {
          ctx.textAlign = "right";
        } else {
          ctx.textAlign = "center";
        }

        // Draw label
        ctx.fillStyle = "rgba(6,182,212,0.7)";
        ctx.fillText(label, x, axisY + 8);
      });

      ctx.strokeStyle = "rgba(6,182,212,0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, axisY);
      ctx.lineTo(w, axisY);
      ctx.stroke();
    };

    render();

    const onResize = () => {
      setCanvasSize();
    };
    window.addEventListener("resize", onResize);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [getActiveFrequencyData, isPlaying, isVisualizerActive]);

  return (
    <div className={`w-full relative overflow-hidden rounded-2xl bg-transparent backdrop-blur-none my-4 shadow-none border-none transition-all duration-500 ease-in-out ${
      isSectionInView
        ? 'opacity-100 translate-y-0 pointer-events-auto'
        : 'opacity-0 translate-y-8 pointer-events-none'
    }`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 px-1 gap-2">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isPlaying ? "bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(0,216,246,0.6)]" : "bg-neutral-600"}`} />
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
            {isPlaying ? `Live Spectrum: ${activeTrack?.name || "Audio"}` : "Audio Spectrum - Idle"}
          </span>
        </div>
        {activeTrack?.gearTag && (
          <span className="text-[11px] font-mono text-cyan-400/80 truncate max-w-[250px]">
            {activeTrack.gearTag}
          </span>
        )}
      </div>

      <div className="relative w-full h-28 md:h-36 overflow-hidden rounded-xl bg-gradient-to-b from-[#0b0f19]/40 via-[#0b0f19]/20 to-[#0b0f19]/80">
        <canvas
          ref={canvasRef}
          width={800}
          height={120}
          className="w-full h-full block"
          aria-label="Audio spectrum visualizer"
        />
        {isPlaying && peakInfoRef.current && (
          <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-[#0b0f19]/90 backdrop-blur-sm border border-cyan-400/30 shadow-[0_0_15px_rgba(0,216,246,0.2)]">
            <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-300">
              <span className="text-cyan-400">{peakInfoRef.current.freq} Hz</span>
              <span className="text-neutral-500">[Bin #{peakInfoRef.current.bin}]</span>
              <span className="text-cyan-400 font-bold">Peak: {peakInfoRef.current.db > -Infinity ? peakInfoRef.current.db : "-∞"} dB</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}