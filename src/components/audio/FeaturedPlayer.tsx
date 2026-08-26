"use client";

import React, { useRef, useEffect, useState } from "react";
import { useAudio } from "@/context/AudioContext";
import { featuredTracks } from "@/data/storeData";

export default function FeaturedPlayer() {
  const { currentTrack, isPlaying, currentTime, duration, playTrack, togglePlay, seek, setVolume, analyser } = useAudio();
  // Manage volume locally to avoid type issues with setVolume
  const [trackIdx] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);

  const track = featuredTracks[trackIdx];

  // Real-time reactive frequency spectrum (FabFilter Pro-Q neon style)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, rect.width * dpr);
      canvas.height = Math.max(1, rect.height * dpr);
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width || 1;
      const h = rect.height || 1;
      ctx.clearRect(0, 0, w, h);

      if (isPlaying && analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        const barCount = 80;
        const barW = w / barCount;
        for (let i = 0; i < barCount; i++) {
          const idx = Math.floor(i * (bufferLength / barCount));
          const v = dataArray[idx] / 255;
          const barH = v * h * 0.92;
          const x = i * barW + 1;

          // Neon EQ glow with vertical gradient
          const grad = ctx.createLinearGradient(0, h - barH, 0, h);
          grad.addColorStop(0, "#00f0ff");
          grad.addColorStop(0.4, "#00d8f6");
          grad.addColorStop(0.8, "#0088aa");
          grad.addColorStop(1, "rgba(0,216,246,0.15)");

          ctx.fillStyle = grad;
          ctx.fillRect(x, h - barH, barW - 2, barH);

          // Highlight top edge
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(x, h - barH, barW - 2, 1.5);
        }
      } else {
        // Idle glow line
        const gradient = ctx.createLinearGradient(0, h * 0.85, w, h * 0.85);
        gradient.addColorStop(0, "rgba(0,216,246,0)");
        gradient.addColorStop(0.3, "rgba(0,216,246,0.4)");
        gradient.addColorStop(0.7, "rgba(0,216,246,0.4)");
        gradient.addColorStop(1, "rgba(0,216,246,0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, h * 0.82, w, 3);
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, analyser]);

  const formatTime = (s: number) => {
    if (!isFinite(s) || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handlePlay = () => {
    if (currentTrack?.src !== track.src) {
      playTrack({ id: track.id, title: track.title, src: track.src, artist: track.artist, coverUrl: track.coverUrl });
    } else {
      togglePlay();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0b0f19]/95 backdrop-blur-3xl border-t border-cyan-400/30 shadow-[0_-30px_80px_rgba(0,216,246,0.18)]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 flex items-center gap-4 md:gap-5">
        {/* Cover + Meta */}
        <div className="flex items-center gap-3 min-w-0 shrink-0">
          <div className="relative">
            <img src={track.coverUrl} alt={track.title} className="w-12 h-12 rounded-xl object-cover ring-2 ring-cyan-400/30 shadow-[0_0_12px_rgba(0,216,246,0.35)]" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,216,246,0.8)]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-black text-white truncate leading-none tracking-tight">{track.title}</h3>
            <p className="text-[11px] font-bold text-cyan-300 tracking-[0.15em] uppercase truncate">{track.artist}</p>
            <span className="inline-block text-[10px] font-mono font-semibold text-cyan-200/80 bg-cyan-950/50 border border-cyan-400/20 rounded-md px-1.5 py-0.5 mt-0.5">{track.gearTag}</span>
          </div>
        </div>

        {/* EQ Visualizer */}
        <div className="flex-1 h-14 hidden sm:block relative rounded-xl overflow-hidden bg-gradient-to-b from-[#0c1120] to-[#080c16] border border-white/5 shadow-inner">
          <canvas ref={canvasRef} className="w-full h-full" aria-label="EQ spectrum analyzer" />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 md:gap-5 shrink-0">
          <button
            onClick={handlePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-300 to-cyan-600 text-[#0b0f19] font-black flex items-center justify-center shadow-[0_0_20px_rgba(0,216,246,0.55)] hover:shadow-[0_0_30px_rgba(0,216,246,0.7)] hover:scale-105 active:scale-95 transition-all duration-150"
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          <div className="flex flex-col w-32 md:w-40">
            <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono font-bold">
              <span className="text-cyan-200">{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="relative h-1.5 bg-neutral-800/80 rounded-full overflow-hidden ring-1 ring-white/5">
              <div className="h-full bg-gradient-to-r from-cyan-300 via-cyan-400 to-cyan-200 rounded-full shadow-[0_0_6px_rgba(0,216,246,0.4)]" style={{ width: `${progressPct}%` }} />
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime || 0}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Seek"
              />
            </div>
          </div>

          <button onClick={() => setVolume(1)} className="text-[10px] font-black text-cyan-300 hover:text-white transition-colors tracking-widest">VOL</button>
        </div>
      </div>
    </div>
  );
}
