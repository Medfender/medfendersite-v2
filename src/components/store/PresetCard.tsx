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
  description: {
    en: string;
    fr: string;
  };
}

interface PresetCardProps {
  preset: PresetItem;
}

export default function PresetCard({ preset }: PresetCardProps) {
  const { currentTrack, isPlaying, playTrack, pauseTrack, togglePlay } = useAudio();
  const isThisPlaying = currentTrack?.src === preset.demoAudio && isPlaying;

  const handleDemoClick = () => {
    if (isThisPlaying) {
      pauseTrack();
    } else {
      playTrack({
        id: preset.id,
        title: preset.title,
        src: preset.demoAudio,
        artist: preset.category,
      });
    }
  };

  const checkoutUrl = "https://medfender.lemonsqueezy.com/checkout/buy/9c678be0-e916-46fb-8340-112098cc6ed4?embed=1";

  return (
    <article className="group bg-neutral-900/40 border border-white/10 backdrop-blur-md rounded-2xl p-6 transition hover:border-cyan-500/50 hover:shadow-cyan-500/10 hover:shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-500/20 rounded-full px-3 py-1 shadow-[0_0_15px_rgba(0,216,246,0.15)]">
            {preset.category}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500 bg-neutral-950/60 border border-white/5 rounded-full px-2.5 py-0.5">
            .ZIP / 24-bit IRs
          </span>
        </div>

        <h3 className="text-xl font-extrabold text-white mb-2 tracking-tight leading-snug">
          {preset.title}
        </h3>
        <p className="text-neutral-400 text-sm leading-relaxed mb-5">
          {preset.description.en}
        </p>
      </div>

      <div className="flex items-center justify-between mt-4 pt-5 border-t border-white/5">
        <div className="flex flex-col gap-3 flex-1 mr-4">
          <span className="text-2xl font-extrabold text-white tracking-tight">
            ${preset.price.toFixed(2)}
          </span>
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-600 text-black font-extrabold text-sm px-5 py-2.5 shadow-[0_0_20px_rgba(0,216,246,0.35)] hover:scale-[1.03] active:scale-[0.97] transition-transform"
          >
            Buy Now
          </a>
        </div>

        <button
          onClick={handleDemoClick}
          aria-label={isThisPlaying ? "Pause demo" : "Play demo"}
          className={`relative flex items-center justify-center h-14 w-14 rounded-full border-2 transition-all duration-300 ${
            isThisPlaying
              ? "border-cyan-400 bg-cyan-950/40 text-cyan-400 shadow-[0_0_20px_rgba(0,216,246,0.45)] scale-105"
              : "border-white/10 bg-neutral-950/40 text-neutral-300 hover:border-cyan-400/60 hover:text-cyan-300 hover:shadow-[0_0_15px_rgba(0,216,246,0.15)]"
          }`}
        >
          {isThisPlaying ? (
            <span className="text-xl leading-none">⏸</span>
          ) : (
            <span className="text-xl leading-none pl-0.5">▶</span>
          )}
          {isThisPlaying && (
            <span className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-pulse pointer-events-none" />
          )}
        </button>
      </div>
    </article>
  );
}
