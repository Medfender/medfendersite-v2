"use client";

import React, { useState } from "react";
import mediaData from "@/content/media.json";

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
            <div key={video.id} className="flex flex-col gap-3">
              <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-neutral-950/40">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${video.youtubeId}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <h3 className="text-white font-bold text-sm md:text-base px-1">
                {video.title}
              </h3>
            </div>
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
