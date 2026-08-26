"use client";

import React, { useState } from "react";
import { useAudio } from "@/context/AudioContext";

export interface PresetItem {
  id: string;
  title: string;
  category: string;
  price: number;
  lemonSqueezyVariantId: string;
  demoAudio: string;
  coverImage: string;
  description: { en: string; fr: string };
  packContents?: {
    tonexCaptures?: string[];
    irs?: string[];
    specs?: string;
    signalChain?: string[];
  };
  demoClips?: { id: string; label: string; src: string }[];
}

interface PresetCardProps {
  preset: PresetItem;
}

export default function PresetCard({ preset }: PresetCardProps) {
  const { currentTrack, isPlaying, playTrack, pauseTrack } = useAudio();
  const [showDetails, setShowDetails] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const handleDemo = (id: string, src: string) => {
    if (activeDemo === id) {
      pauseTrack();
      setActiveDemo(null);
    } else {
      playTrack({
        id: `${preset.id}-${id}`,
        title: `${preset.title} — ${id} demo`,
        src,
        artist: preset.category,
      });
      setActiveDemo(id);
    }
  };

  const checkoutUrl = "https://medfender.lemonsqueezy.com/checkout/buy/9c678be0-e916-46fb-8340-112098cc6ed4?embed=1";

  return (
    <article className="group bg-neutral-900/40 border border-white/10 backdrop-blur-md rounded-2xl p-6 transition hover:border-cyan-500/50 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-500/20 rounded-full px-3 py-1 shadow-[0_0_15px_rgba(0,216,246,0.15)]">
            {preset.category}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500 bg-neutral-950/60 border border-white/5 rounded-full px-2.5 py-0.5">
            .ZIP / 24-bit IRs
          </span>
        </div>
        <h3 className="text-xl font-extrabold text-white mb-2 tracking-tight leading-snug">{preset.title}</h3>
        <p className="text-neutral-400 text-sm leading-relaxed mb-4 line-clamp-3">{preset.description.en}</p>
      </div>

      <div className="flex items-center justify-between mt-4 pt-5 border-t border-white/5">
        <div className="flex flex-col gap-3 flex-1 mr-4">
          <span className="text-2xl font-extrabold text-white tracking-tight">${preset.price.toFixed(2)}</span>
          <button
            onClick={() => setShowDetails(true)}
            className="text-left text-xs font-bold text-cyan-400 hover:text-cyan-300 underline-offset-2 hover:underline transition-colors"
          >
            Inspect Pack Contents
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleDemo("main", preset.demoAudio)}
            className="relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 bg-neutral-950/60 border-white/10 text-neutral-300 hover:border-cyan-400/60 hover:text-cyan-300"
            aria-label={isPlaying ? "Pause demo" : "Play demo"}
          >
            {isPlaying && currentTrack?.src === preset.demoAudio ? (
              <span className="text-xl leading-none">⏸</span>
            ) : (
              <span className="text-xl leading-none pl-0.5">▶</span>
            )}
          </button>
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
            <h2 className="text-2xl font-extrabold text-white mb-6">Pack Contents — {preset.title}</h2>

            <div className="mb-6">
              <h3 className="text-sm font-bold text-cyan-400 mb-3 uppercase tracking-wider">Audio Demos</h3>
              <div className="flex flex-wrap gap-2">
                {(preset.demoClips || [{ id: "main", label: "Main Demo", src: preset.demoAudio }]).map((clip: { id: string; label: string; src: string }) => {
                  const isActive = activeDemo === clip.id && isPlaying;
                  return (
                    <button
                      key={clip.id}
                      onClick={() => handleDemo(clip.id, clip.src)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        isActive ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,216,246,0.45)]" : "bg-neutral-950/60 border border-white/10 text-neutral-300 hover:border-cyan-400/40"
                      }`}
                    >
                      {clip.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {preset.packContents?.tonexCaptures?.length ? (
              <div className="mb-6">
                <h3 className="text-lg font-extrabold text-white mb-3">TONEX Capture List</h3>
                <ul className="space-y-2 text-sm text-neutral-200">
                  {preset.packContents.tonexCaptures.map((capture: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60" />{capture}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {preset.packContents?.irs?.length ? (
              <div className="mb-6">
                <h3 className="text-lg font-extrabold text-white mb-3">Included Speaker Impulse Responses</h3>
                <ul className="space-y-2 text-sm text-neutral-200">
                  {preset.packContents.irs.map((ir: string, idx: number) => (
                    <li key={idx} className="flex items-center justify-between text-sm"><span className="text-neutral-200">{ir}</span><span className="text-cyan-400/80 text-xs">24-bit / 48kHz</span></li>
                  ))}
                </ul>
              </div>
            ) : null}

            {preset.packContents?.specs ? (
              <div className="mb-6 p-3 bg-gradient-to-r from-cyan-950/30 to-neutral-900/30 rounded-xl">
                <p className="text-sm text-cyan-200">{preset.packContents.specs}</p>
              </div>
            ) : null}

            {preset.packContents?.signalChain?.length ? (
              <div className="mb-6">
                <h3 className="text-lg font-extrabold text-white mb-3">HX Stomp Signal Chain</h3>
                <div className="bg-neutral-950/60 rounded-xl p-4">
                  <div className="flex flex-col gap-2 text-sm text-neutral-300">
                    {preset.packContents.signalChain.map((block: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-cyan-400/60" />{block}</div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-full rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-600 text-black font-extrabold text-base py-3 shadow-[0_0_20px_rgba(0,216,246,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-transform">Get Full Pack</a>
          </div>
        </div>
      )}
    </article>
  );
}
