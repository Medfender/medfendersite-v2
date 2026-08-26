"use client";

import React, { useRef, useEffect, useState } from "react";
import { useAudio } from "@/context/AudioContext";
import type { PackData, ToneItem } from "@/data/storeData";

interface PresetCardProps {
  preset: PackData;
}

export default function PresetCard({ preset }: PresetCardProps) {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    pauseTrack,
    seek,
    analyser,
    togglePlay,
    setVolume,
  } = useAudio();

  const [showDetails, setShowDetails] = useState(false);
  const [activeToneId, setActiveToneId] = useState<string | null>(null);

  // Global audio mutex: play a tone → pause any currently playing track,
  // and vice‑versa (the main bottom player also respects this).
  const handleTonePlay = (tone: ToneItem) => {
    // If we are already playing this exact tone → pause it
    if (activeToneId === tone.id && isPlaying) {
      pauseTrack();
      setActiveToneId(null);
      return;
    }

    // Otherwise pause whatever is playing (main player or another tone)
    pauseTrack();

    // Play the selected tone mini‑track
    playTrack({
      id: `${preset.id}-${tone.id}`,
      title: tone.label,
      src: tone.src,
      artist: preset.category,
    });

    setActiveToneId(tone.id);
  };

  const checkoutUrl = preset.checkoutUrl || "https://medfender.lemonsqueezy.com/checkout/buy/9c678be0-e916-46fb-8340-112098cc6ed4?embed=1";

  // Mini spectrum visualizer for a tone
  const MiniSpectrum = ({ isActive }: { isActive: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number>(0);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !canvas.getContext("2d")) return;
      const ctx = canvas.getContext("2d")!;
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

        if (isActive && analyser) {
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyser.getByteFrequencyData(dataArray);
          const barCount = 24;
          const barW = w / barCount;
          for (let i = 0; i < barCount; i++) {
            const idx = Math.floor(i * (bufferLength / barCount));
            const v = dataArray[idx] / 255;
            const barH = v * h * 0.85;
            const x = i * barW + 1;

            const grad = ctx.createLinearGradient(0, h - barH, 0, h);
            grad.addColorStop(0, "#00f0ff");
            grad.addColorStop(0.4, "#00d8f6");
            grad.addColorStop(0.8, "#0088aa");
            grad.addColorStop(1, "rgba(0,216,246,0.15)");
            ctx.fillStyle = grad;
            ctx.fillRect(x, h - barH, barW - 2, barH);
          }
        } else {
          ctx.fillStyle = "rgba(0,216,246,0.08)";
          ctx.fillRect(0, h * 0.85, w, 2);
        }

        rafRef.current = requestAnimationFrame(draw);
      };
      rafRef.current = requestAnimationFrame(draw);

      return () => {
        window.removeEventListener("resize", resize);
        cancelAnimationFrame(rafRef.current);
      };
    }, [isActive, analyser]);

    return <canvas ref={canvasRef} className="w-full h-5 rounded-md" aria-label="Mini EQ" />;
  };


  return (
    <article className="group bg-neutral-900/40 border border-white/10 backdrop-blur-md rounded-2xl p-6 transition hover:border-cyan-500/50 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-400/20 rounded-md px-2.5 py-0.5 shadow-sm">
          {preset.category}
        </span>
        <button
          onClick={() => setShowDetails(true)}
          className="text-left text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline-offset-2 hover:underline transition-colors"
        >
          Inspect Pack Contents
        </button>
      </div>

      <h3 className="text-xl font-extrabold text-white mb-2 tracking-tight">{preset.title}</h3>
      <p className="text-neutral-400 text-sm leading-relaxed mb-4 line-clamp-3">{preset.description.en}</p>

      {/* Itemized tone list */}
      <div className="mb-4">
        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-300 mb-2">Included Tones</h4>
        <div className="space-y-3">
          {preset.tones.map((tone) => {
            const isActive = activeToneId === tone.id && isPlaying;
            return (
              <div
                key={tone.id}
                className="bg-neutral-950/40 border border-white/5 rounded-xl p-3 shadow-inner hover:border-cyan-500/20 transition-colors"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-white truncate leading-tight">{tone.label}</div>
                    <span className="inline-block text-[10px] font-mono text-cyan-200/80 bg-cyan-950/40 border border-cyan-400/20 rounded-md px-1.5 py-0.5 mt-1">{tone.gearTag}</span>
                  </div>
                  <button
                    onClick={() => handleTonePlay(tone)}
                    aria-label={isActive ? "Pause tone" : "Play tone"}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 shadow-md ${
                      isActive
                        ? "bg-gradient-to-br from-cyan-300 to-cyan-600 text-[#0b0f19] shadow-[0_0_15px_rgba(0,216,246,0.5)]"
                        : "bg-neutral-800 border border-white/10 text-cyan-300 hover:border-cyan-400/60 hover:text-white"
                    }`}
                  >
                    {isActive ? "⏸" : "▶"}
                  </button>
                </div>
                <MiniSpectrum isActive={isActive} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Action area */}
      <div className="flex items-center justify-between mt-2 pt-5 border-t border-white/5">
        <div className="flex flex-col gap-3 flex-1 mr-4">
          <span className="text-2xl font-extrabold text-white tracking-tight">
            ${preset.price.toFixed(2)}
          </span>
          <button
            onClick={() => setShowDetails(true)}
            className="text-left text-xs font-bold text-cyan-400 hover:text-cyan-300 underline-offset-2 hover:underline transition-colors"
          >
            Inspect Pack Contents
          </button>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-600 text-black font-extrabold text-sm px-5 py-2.5 shadow-[0_0_20px_rgba(0,216,246,0.35)] hover:scale-[1.03] active:scale-[0.97] transition-transform"
          >
            Buy Now
          </a>
        </div>
      </div>

      {/* collapsible details panel */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowDetails(false)} />
          <div className="relative bg-neutral-900/95 border border-white/10 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setShowDetails(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-950 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition"
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-extrabold text-white mb-6">
              Pack Contents — {preset.title}
            </h2>

            {/* Audio Demos */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-cyan-400 mb-3 uppercase tracking-wider">
                Audio Demos
              </h3>
              <div className="flex flex-wrap gap-2">
                {preset.tones.map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => handleTonePlay(tone)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                      activeToneId === tone.id && isPlaying
                        ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,216,246,0.45)]"
                        : "bg-neutral-950/60 border border-white/10 text-neutral-300 hover:border-cyan-400/40"
                    }`}
                  >
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Pack Info */}
            {preset.packContents?.tonexCaptures?.length ? (
              <div className="mb-6">
                <h3 className="text-lg font-extrabold text-white mb-3">TONEX Capture List</h3>
                <ul className="space-y-2 text-sm text-neutral-200">
                  {preset.packContents.tonexCaptures.map((capture, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60" />
                      {capture}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {preset.packContents?.irs?.length ? (
              <div className="mb-6">
                <h3 className="text-lg font-extrabold text-white mb-3">Included Speaker Impulse Responses</h3>
                <ul className="space-y-2 text-sm text-neutral-200">
                  {preset.packContents.irs.map((ir, idx) => (
                    <li key={idx} className="flex items-center justify-between">
                      <span className="text-neutral-200">{ir}</span>
                      <span className="text-cyan-400/80 text-xs">24-bit / 48kHz</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {preset.packContents?.specs && (
              <div className="mb-6 p-3 bg-gradient-to-r from-cyan-950/30 to-neutral-900/30 rounded-xl">
                <p className="text-sm text-cyan-200">{preset.packContents.specs}</p>
              </div>
            )}

            {preset.packContents?.signalChain?.length && (
              <div className="mb-6">
                <h3 className="text-lg font-extrabold text-white mb-3">HX Stomp Signal Chain</h3>
                <div className="bg-neutral-950/60 rounded-xl p-4">
                  <div className="flex flex-col gap-2 text-sm text-neutral-300">
                    {preset.packContents.signalChain.map((block, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-cyan-400/60" />
                        {block}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-600 text-black font-extrabold text-base py-3 shadow-[0_0_20px_rgba(0,216,246,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Get Full Pack
            </a>
          </div>
        </div>
      )}
    </article>
  );
}