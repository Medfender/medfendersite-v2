"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PackData } from "@/data/storeData";

export const previewController = {
  listeners: new Set<(id: string | null, playing: boolean) => void>(),
  activeId: null as string | null,
  notify(id: string | null, playing: boolean) {
    this.activeId = playing ? id : null;
    this.listeners.forEach((fn) => fn(id, playing));
  },
};

interface PresetCardProps {
  preset: PackData;
  /** Optional cover image src — falls back to a dark gradient placeholder */
  coverImage?: string;
}

export default function PresetCard({ preset, coverImage }: PresetCardProps) {
  const href = `/store/${preset.slug}`;

  // Comma-separated platform list from badge + type
  const platforms = [preset.badge, ...(preset.type !== preset.badge ? [preset.type] : [])].join(", ");

  return (
    <Link
      href={href}
      className="group flex flex-col bg-neutral-900 border border-zinc-800 hover:border-cyan-600/60 transition-all duration-200 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.6)] hover:shadow-[0_0_40px_rgba(0,216,246,0.08)]"
    >
      {/* Cover image — square aspect, dark overlay */}
      <div className="relative w-full aspect-square overflow-hidden bg-neutral-950">
        {coverImage ? (
          <img
            src={coverImage}
            alt={preset.title}
            className="w-full h-full object-cover opacity-70 group-hover:opacity-80 group-hover:scale-[1.03] transition-all duration-500"
          />
        ) : (
          /* Abstract dark gradient placeholder */
          <div
            className="w-full h-full"
            style={{
              background:
                "radial-gradient(ellipse at 30% 40%, rgba(6,182,212,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(0,80,100,0.2) 0%, transparent 50%), linear-gradient(160deg, #0f1318 0%, #0b0f19 100%)",
            }}
          />
        )}
        {/* Bottom gradient fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />

        {/* Badge overlay */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.25em] text-cyan-300 border border-cyan-700/50 bg-black/60 backdrop-blur-sm">
            {preset.badge}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 px-5 pt-4 pb-0">
        {/* Title */}
        <h3 className="text-lg font-bold text-white leading-snug line-clamp-2 tracking-tight group-hover:text-cyan-100 transition-colors">
          {preset.title}
        </h3>

        {/* Platforms */}
        <p className="mt-1 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
          {platforms}
        </p>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price + CTA row */}
        <div className="mt-4 mb-0">
          {/* Price */}
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-3xl font-black text-white tracking-tight leading-none">
              ${preset.price.toFixed(2)}
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-600">
              USD
            </span>
          </div>

          {/* Full-width explore button */}
          <div className="-mx-5 -mb-0">
            <div
            className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-cyan-600 text-white font-black uppercase tracking-widest text-xs py-3.5 transition-colors duration-150 group/btn"
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
          >
            <span>Explore Rig</span>
              <ArrowRight
                size={13}
                className="shrink-0 group-hover/btn:translate-x-0.5 transition-transform duration-150"
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
