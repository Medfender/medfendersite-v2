"use client";

import React from "react";
import presetsData from "@/content/presets.json";
import PresetCard, { PresetItem } from "./PresetCard";

export default function PresetsSection() {
  const presets = presetsData as PresetItem[];

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4 drop-shadow-[0_0_20px_rgba(0,216,246,0.3)]">
          Digital Preset Packs & Captures
        </h2>
        <p className="text-neutral-400 text-base md:text-lg max-w-2xl mx-auto">
          Hand-tuned presets for TONEX, HX Stomp, and studio captures. Preview the demo, then grab your pack.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {presets.map((preset) => (
          <PresetCard key={preset.id} preset={preset} />
        ))}
      </div>
    </section>
  );
}
