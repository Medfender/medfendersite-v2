"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PackData } from "@/data/storeData";
import PackCover from "./PackCover";

/**
 * Tiny pub/sub so AudioContext / demo players can mute others when one
 * starts. Preserved from the original implementation.
 */
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
  index?: number;
}

export default function PresetCard({ preset, index = 0 }: PresetCardProps) {
  const href = `/store/${preset.slug}`;
  const platforms = preset.platforms ?? [preset.badge];

  return (
    <Link href={href} className="group flex h-full flex-col">
      <PackCover title={preset.title} badge={preset.badge} index={index} />

      <div className="flex flex-1 flex-col pt-4">
        <p className="font-mono text-[8.5px] uppercase tracking-[0.26em] text-rust">
          {preset.type} · digital pack
        </p>
        <h3 className="mt-2.5 font-display text-2xl leading-snug text-ink transition-colors group-hover:text-rust">
          {preset.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/60">
          {preset.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {platforms.slice(0, 3).map((platform) => (
            <span
              key={platform}
              className="border border-[var(--rule)] px-2 py-0.5 font-mono text-[7.5px] uppercase tracking-[0.2em] text-ink/50"
            >
              {platform}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-[var(--rule)] pt-3.5">
          <span className="font-mono text-sm text-ink">
            ${preset.price.toFixed(2)}
          </span>
          <span className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.24em] text-ink/50 transition-colors group-hover:text-rust">
            Explore rig
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
