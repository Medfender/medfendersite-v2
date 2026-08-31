"use client";

import { useAudio } from "@/context/AudioContext";
import FeaturedAudioSection from "@/components/sections/FeaturedAudioSection";
import VinylShowcase from "@/components/VinylShowcase";

export default function AudioClient() {
  const { isPlaying, currentTrack } = useAudio();

  return (
    <main className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
      {/* Hero — visual mood + featured tracks (no turntable) */}
      <section className="w-full">
        <FeaturedAudioSection />
      </section>

      {/* Main stage: turntable left, featured player / playlist right */}
      <section className="w-full px-4 lg:px-8 py-10 lg:py-14">
        <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-12 lg:gap-12 lg:items-start flex flex-col gap-10">

          {/* Primary: Turntable — all animations, buttons, state intact */}
          <div className="w-full lg:col-span-7 order-1">
            <VinylShowcase />
          </div>

          {/* Secondary: Featured Player + context info */}
          <aside className="w-full lg:col-span-5 order-2 flex flex-col gap-8">
            <div className="rounded-2xl border border-zinc-800 bg-neutral-900/60 backdrop-blur p-6">
              <h3 className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-bold mb-4">Now Playing</h3>
              {currentTrack ? (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-900 to-neutral-950 shadow-[0_0_15px_rgba(0,216,246,0.15)] flex items-center justify-center">
                    <span className="text-xl font-black text-white">{(currentTrack as any)?.name?.slice(0,2) || "--"}</span>
                  </div>
                  <div>
                    <div className="text-white font-black text-lg leading-tight">{(currentTrack as any)?.name || "No track"}</div>
                    <div className="text-neutral-400 text-sm">{(currentTrack as any)?.artist || (currentTrack as any)?.gearTag || "—"}</div>
                    <div className={`text-xs font-mono mt-1 ${isPlaying ? "text-green-400" : "text-neutral-500"}`}>{isPlaying ? "Playing" : "Paused"}</div>
                  </div>
                </div>
              ) : (
                <p className="text-neutral-500 text-sm">Select a track from the playlist to begin.</p>
              )}
            </div>

          </aside>
        </div>
      </section>
    </main>
  );
}
