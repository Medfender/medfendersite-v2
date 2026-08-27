"use client";

import React, { useState } from "react";
import { Play } from "lucide-react";
import mediaData from "@/content/media.json";

interface VideoCardProps {
  videoId: string;
  title: string;
  youtubeId: string;
}

function VideoCard({ videoId, title, youtubeId }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-neutral-950/40 relative">
        {isPlaying ? (
          <iframe
            className="w-full h-full"
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
            className="group relative block w-full h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <img
              src={thumb}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-cyan-500/90 group-hover:bg-cyan-400 flex items-center justify-center shadow-[0_0_30px_rgba(0,216,246,0.6)] transition-all duration-300 group-hover:scale-110">
                <Play className="w-7 h-7 md:w-9 md:h-9 text-black fill-black ml-1" strokeWidth={0} />
              </span>
            </div>
            <div className="absolute bottom-3 left-3 right-3 text-left">
              <h3 className="text-white font-bold text-sm md:text-base drop-shadow-lg">
                {title}
              </h3>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

export default function MediaSection() {
  const [activeTab, setActiveTab] = useState<"videos" | "gallery">("videos");

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4 drop-shadow-[0_0_20px_rgba(0,216,246,0.3)]">
          Live Performances & Studio
        </h2>
        <p className="text-neutral-400 text-base md:text-lg max-w-2xl mx-auto mb-8">
          Watch live sets, capture walkthroughs, and explore the gear behind the sound.
        </p>

        <div className="inline-flex items-center gap-2 bg-neutral-950/60 border border-white/10 rounded-full p-1 backdrop-blur-md">
          <button
            onClick={() => setActiveTab("videos")}
            className={`px-5 py-2 rounded-full text-sm font-extrabold transition ${
              activeTab === "videos"
                ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(0,216,246,0.45)]"
                : "text-neutral-300 hover:text-white"
            }`}
          >
            Live Performances
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={`px-5 py-2 rounded-full text-sm font-extrabold transition ${
              activeTab === "gallery"
                ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(0,216,246,0.45)]"
                : "text-neutral-300 hover:text-white"
            }`}
          >
            Gear & Studio
          </button>
        </div>
      </div>

      {activeTab === "videos" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mediaData.youtube.map((video) => (
            <VideoCard key={video.id} videoId={video.id} title={video.title} youtubeId={video.youtubeId} />
          ))}
        </div>
      )}

      {activeTab === "gallery" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mediaData.gallery.map((item) => (
            <a
              key={item.id}
              href={item.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block overflow-hidden rounded-2xl border border-white/10 shadow-lg relative bg-neutral-950/30"
              aria-label={item.alt}
            >
              <img
                src={item.imageUrl}
                alt={item.alt || item.title}
                className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110 group-hover:brightness-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-white font-extrabold text-sm drop-shadow-lg">
                  {item.title}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
