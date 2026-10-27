"use client";

import React, { useState, useCallback } from "react";
import { Download, Waves, X } from "lucide-react";
import { useResolvedThumbnail } from "@/lib/audio/thumbnailResolver";

const PATCHES = [
  {
    title: "NX Blue Drive",
    hardware: "Line 6 HX Stomp XL",
    accent: "cyan" as const,
    chain: "Drive → Amp Capture → Stereo Delay → IR",
    file: ".hlx",
    tags: ["Overdrive", "Clean Amp", "Stereo"],
  },
  {
    title: "ToneX Black Tube",
    hardware: "IK Multimedia ToneX",
    accent: "amber" as const,
    chain: "Tube Preamp → Cabinet IR → Reverb → EQ",
    file: ".txp",
    tags: ["Tube", "Vintage", "Cab IR"],
  },
  {
    title: "HX Haze Glow",
    hardware: "Line 6 HX Stomp XL",
    accent: "cyan" as const,
    chain: "Modulation → Lust Drive → Amp → Reverb",
    file: ".hlx",
    tags: ["Ambient", "Drive", "Mod"],
  },
  {
    title: "ToneX Watt King",
    hardware: "IK Multimedia ToneX",
    accent: "amber" as const,
    chain: "Amp Model → Cabinet → Delay → Chorus",
    file: ".txp",
    tags: ["Power", "Amp Model", "Delay"],
  },
];

interface PatchBrowserProps {
  onAudition: (track: any) => void;
}

function PatchCard({ patch, onAudition }: { patch: typeof PATCHES[0]; onAudition?: (t: any) => void }) {
  const coverSrc = useResolvedThumbnail({ name: patch.title, artist: patch.hardware, gearTag: patch.file });
  const [previewOpen, setPreviewOpen] = useState(false);

  const openPreview = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewOpen(true);
    onAudition?.({ name: patch.title, url: "/audio/featured-artists/Sidi Bouganga feat Younes Hadir.mp3", hardware: patch.hardware, preview: true });
  }, [onAudition, patch]);

  const closePreview = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewOpen(false);
  }, []);

  return (
    <>
      <div
        onClick={openPreview}
        className="group relative rounded-xl bg-neutral-950/60 border border-white/[0.06] hover:border-white/20 transition-all p-4 cursor-pointer hover:-translate-y-0.5 flex flex-col"
      >
        {/* Thumbnail — fixed height, stable */}
        <div className="w-full h-24 rounded-lg overflow-hidden mb-3 bg-[#120909] border border-white/[0.08] shadow-[0_0_12px_rgba(245,158,11,0.25)]">
          {coverSrc ? (
            <img src={coverSrc} alt={patch.title} className="w-full h-full object-cover transition-opacity duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Waves size={28} className="text-amber-500/30" />
            </div>
          )}
        </div>

        {/* Hardware badge */}
        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider mb-2 border ${
          patch.accent === "cyan"
            ? "bg-brass/10 text-brass border-brass/20 ring-1 ring-brass/30"
            : "bg-amber-500/10 text-amber-400 border-amber-500/20 ring-1 ring-amber-500/30"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${patch.accent === "cyan" ? "bg-brass shadow-[0_0_6px_rgba(223,161,74,0.6)]" : "bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]"}`} />
          <span className="font-bold">{patch.hardware}</span>
          <span className="text-[9px] opacity-70">{patch.file}</span>
        </div>

        <h3 className="text-sm font-semibold text-white leading-tight mb-1">{patch.title}</h3>
        <p className="text-[10px] text-neutral-400 font-mono leading-relaxed mb-3">{patch.chain}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {patch.tags.map((t) => (
            <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-white/[0.04]">{t}</span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] mt-auto">
          <span className="text-[10px] font-mono text-neutral-500">{patch.file}</span>
          <button
            onClick={(e) => { e.stopPropagation(); alert(`Download ${patch.file}`); }}
            className="flex items-center gap-1 text-[10px] font-medium text-brass hover:text-white transition"
            aria-label={`Download ${patch.title}`}
          >
            <Download size={12} /> Download Patch
          </button>
        </div>
      </div>

      {/* Preview overlay — amp-style close button */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          onClick={closePreview}
          role="dialog"
          aria-modal="true"
          aria-label={`Preview ${patch.title}`}
        >
          <div
            className="relative max-w-md w-full rounded-2xl bg-neutral-900/95 border border-white/[0.10] shadow-[0_0_60px_rgba(223,161,74,0.15)] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Amp-style close — square with thick stroke like amp power */}
            <button
              onClick={closePreview}
              className="absolute -top-3 -right-3 w-10 h-10 rounded-lg bg-neutral-950 border-2 border-amber-400 text-amber-400 hover:text-white hover:border-white transition flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.4)] z-10"
              aria-label="Close preview"
              title="Close"
            >
              <X size={18} strokeWidth={2.5} />
            </button>

            <div className="w-full h-32 rounded-xl overflow-hidden mb-4 bg-[#120909] border border-white/[0.08] shadow-[0_0_12px_rgba(245,158,11,0.25)]">
              {coverSrc ? (
                <img src={coverSrc} alt={patch.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Waves size={32} className="text-amber-500/30" /></div>
              )}
            </div>

            <h3 className="text-lg font-bold text-white mb-1">{patch.title}</h3>
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider mb-3 border ${
              patch.accent === "cyan" ? "bg-brass/10 text-brass border-brass/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${patch.accent === "cyan" ? "bg-brass" : "bg-amber-400"}`} />
              <span className="font-bold">{patch.hardware}</span>
            </div>

            <p className="text-xs text-neutral-400 font-mono leading-relaxed mb-3">{patch.chain}</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {patch.tags.map((t) => (
                <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-white/[0.04]">{t}</span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); alert(`Download ${patch.file}`); }}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-brass/10 border border-brass/30 text-brass-light text-xs font-semibold hover:bg-brass/20 transition"
              >
                <Download size={14} /> Download {patch.file}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function PatchBrowser({ onAudition }: PatchBrowserProps) {
  return (
    <div className="rounded-3xl bg-neutral-900/60 backdrop-blur-xl border border-white/10 p-5 sm:p-6 shadow-[0_0_30px_rgba(223,161,74,0.08)]">
      <div className="flex items-center gap-2 mb-4">
        <Waves className="text-brass" size={18} />
        <h2 className="text-sm font-bold tracking-widest uppercase text-neutral-100">Preset & Patch Browser</h2>
        <span className="text-[10px] font-mono text-neutral-500">4 patches</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PATCHES.map((p) => (
          <PatchCard key={p.title} patch={p} onAudition={onAudition} />
        ))}
      </div>
    </div>
  );
}
