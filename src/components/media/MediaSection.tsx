"use client";

import React, { useState, useMemo } from "react";
import { Play, X, ArrowUpRight } from "lucide-react";
import Reveal from "@/components/luxury/Reveal";
import mediaData from "@/content/media.json";

type Filter = "All" | "Live" | "Stage" | "Gear" | "Portrait";

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  alt: string;
  thumb: string;
  full: string;
  tag: Filter;
}

function toOptimizedPath(original: string, bucket: "full" | "thumb") {
  // /images/gallery/IMG_7746.JPG -> /images/site/thumb/IMG_7746.webp
  const base = original.replace("/images/gallery/", "");
  const name = base.replace(/\.[^.]+$/, "").replace(/\s+/g, "-");
  return `/images/site/${bucket}/${name}.webp`;
}

function deriveTag(title: string): Filter {
  const t = title.toLowerCase();
  if (t.includes("gear") || t.includes("pedal")) return "Gear";
  if (t.includes("portrait") || t.includes("personal") || t.includes("strat")) return "Portrait";
  if (t.includes("backstage") || t.includes("setup")) return "Stage";
  return "Live";
}

const gallery: GalleryItem[] = mediaData.gallery.map((g) => ({
  ...g,
  thumb: toOptimizedPath(g.imageUrl, "thumb"),
  full: toOptimizedPath(g.imageUrl, "full"),
  tag: deriveTag(g.title),
}));

const filters: Filter[] = ["All", "Live", "Stage", "Gear", "Portrait"];

function VideoCard({ title, youtubeId }: { title: string; youtubeId: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [thumb, setThumb] = useState(
    `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`
  );

  return (
    <figure className="group">
      <div className="relative aspect-video w-full overflow-hidden border border-[var(--rule)] bg-ink">
        {isPlaying ? (
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            aria-label={`Play ${title}`}
            className="relative block h-full w-full cursor-pointer focus:outline-none"
          >
            <img
              src={thumb}
              alt={title}
              loading="lazy"
              onError={() =>
                setThumb(`https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`)
              }
              className="grade-print h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-14 w-14 items-center justify-center border border-paper/60 bg-paper/95 text-ink transition-all duration-500 group-hover:border-brass group-hover:bg-brass group-hover:text-ink md:h-16 md:w-16">
                <Play className="ml-0.5 h-5 w-5 md:h-6 md:w-6" fill="currentColor" strokeWidth={0} />
              </span>
            </div>
          </button>
        )}
      </div>
      <figcaption className="mt-3 flex items-baseline justify-between gap-4 border-t border-[var(--rule)] pt-2.5">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink/70">
          {title.replace(/IMG_\d+ - /, "")}
        </span>
        <span className="shrink-0 font-mono text-[8.5px] uppercase tracking-[0.24em] text-ink/60">
          Watch ↗
        </span>
      </figcaption>
    </figure>
  );
}

export default function MediaSection() {
  const [activeTab, setActiveTab] = useState<"videos" | "gallery">("videos");
  const [filter, setFilter] = useState<Filter>("All");
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  const filtered = useMemo(
    () => (filter === "All" ? gallery : gallery.filter((g) => g.tag === filter)),
    [filter]
  );

  return (
    <section className="surface-paper bg-paper">
      <div className="mx-auto w-full max-w-[1560px] px-5 py-16 md:px-8 md:py-24">
        {/* Tab switch */}
        <div className="flex items-center gap-8 border-b border-[var(--rule)]">
          {(["videos", "gallery"] as const).map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                "relative -mb-px flex items-baseline gap-3 pb-4 font-mono text-[10px] uppercase tracking-[0.26em] transition-colors",
                activeTab === tab ? "text-ink" : "text-ink/60 hover:text-ink/70",
              ].join(" ")}
            >
              <span className="text-[9px] tracking-[0.18em] text-rust">
                0{i + 1}
              </span>
              {tab === "videos" ? "Live clips" : "Still frames"}
              <span
                className={[
                  "absolute bottom-0 left-0 h-px bg-ink transition-all duration-500",
                  activeTab === tab ? "w-full" : "w-0",
                ].join(" ")}
              />
            </button>
          ))}
          <span className="ml-auto hidden pb-4 font-mono text-[8.5px] uppercase tracking-[0.24em] text-ink/60 sm:block">
            Medfender · Archive
          </span>
        </div>

        {activeTab === "videos" ? (
          <div className="pt-12">
            <div className="grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-2">
              {mediaData.youtube.map((video) => (
                <Reveal key={video.id}>
                  <VideoCard title={video.title} youtubeId={video.youtubeId} />
                </Reveal>
              ))}
            </div>
          </div>
        ) : (
          <div className="pt-12">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={[
                    "font-mono text-[9px] uppercase tracking-[0.24em] transition-colors",
                    filter === f
                      ? "text-rust underline decoration-rust/40 underline-offset-[6px]"
                      : "text-ink/60 hover:text-ink",
                  ].join(" ")}
                >
                  {f}
                </button>
              ))}
              <span className="ml-auto font-mono text-[8.5px] uppercase tracking-[0.26em] text-ink/60">
                {filtered.length} of {gallery.length} frames
              </span>
            </div>

            {/* Grid */}
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
              {filtered.map((item, i) => (
                <Reveal key={item.id} delay={(i % 4) * 0.04}>
                  <button
                    type="button"
                    onClick={() => setLightbox(item)}
                    className="group relative block w-full focus:outline-none"
                    aria-label={`Open ${item.title}`}
                  >
                    <div className="relative aspect-[4/5] w-full overflow-hidden border border-[var(--rule)] bg-paper-dim">
                      <img
                        src={item.thumb}
                        alt={item.alt}
                        loading="lazy"
                        className="grade-print h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent opacity-70 transition-opacity group-hover:opacity-90" />
                      <span className="absolute left-2.5 top-2.5 font-mono text-[8px] uppercase tracking-[0.26em] text-cream/80">
                        {item.tag}
                      </span>
                      <ArrowUpRight className="absolute bottom-3 right-3 h-4 w-4 text-cream opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <p className="mt-2.5 flex items-baseline justify-between gap-3 border-t border-[var(--rule)] pt-2 font-mono text-[8.5px] uppercase leading-relaxed tracking-[0.18em] text-ink/60">
                      <span className="line-clamp-2">
                        {item.title.replace(/IMG_\d+ - /, "")}
                      </span>
                      <span className="shrink-0 text-ink/60">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </p>
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox ? (
        <div
          className="surface-ink fixed inset-0 z-[90] flex items-center justify-center bg-ink-deep/95 px-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.title}
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Close lightbox"
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center border border-cream/25 text-cream transition-colors hover:border-brass hover:text-brass"
          >
            <X className="h-5 w-5" />
          </button>
          <figure
            className="relative max-h-[88svh] max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightbox.full}
              alt={lightbox.alt}
              className="max-h-[80svh] w-auto border border-cream/20 object-contain shadow-2xl"
            />
            <figcaption className="mt-4 flex items-center justify-between gap-6 border-t border-cream/15 pt-3 font-mono text-[9px] uppercase tracking-[0.24em] text-cream/55">
              <span>{lightbox.title}</span>
              <span>
                {lightbox.tag} · {mediaData.gallery.indexOf(lightbox) + 1} /{" "}
                {gallery.length}
              </span>
            </figcaption>
          </figure>
        </div>
      ) : null}
    </section>
  );
}
