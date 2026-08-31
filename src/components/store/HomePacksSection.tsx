"use client";

import React from "react";
import Link from "next/link";
import { packs } from "@/data/storeData";
import type { PackData } from "@/data/storeData";
import PresetCard from "./PresetCard";

export default function HomePacksSection() {
  // Limit to first 3 packs on the home showcase
  const presets = (packs as PackData[]).slice(0, 3);

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4 drop-shadow-[0_0_20px_rgba(0,216,246,0.3)]">
          Featured Preset Packs
        </h2>
        <p className="text-neutral-400 text-base md:text-lg max-w-2xl mx-auto">
          Hand-tuned presets for TONEX, HX Stomp, and studio captures. Preview the demo, then grab your pack.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {presets.map((preset) => (
          <PresetCard key={preset.id} preset={preset} />
        ))}
      </div>

      <div className="text-center mt-10">
        <Link
          href="/store"
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-cyan-300 hover:text-cyan-200 transition-colors"
        >
          View All Packs →
        </Link>
      </div>
    </section>
  );
}
