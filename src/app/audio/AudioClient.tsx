"use client";

import FeaturedAudioSection from "@/components/sections/FeaturedAudioSection";
import VinylShowcase from "@/components/VinylShowcase";

export default function AudioClient() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
      <FeaturedAudioSection />

      {/* Responsive split: VinylPlayer top / left, Playlist bottom / right */}
      <section className="w-full px-4 py-8 lg:px-8 lg:py-12">
        <div className="w-full lg:grid lg:grid-cols-12 lg:gap-10 lg:items-start flex flex-col gap-8">

          {/* Left / Top: VinylPlayer */}
          <div className="w-full lg:col-span-7 order-1">
            <VinylShowcase />
          </div>

          {/* Right / Bottom: Playlist (from VinylShowcase, below the player) */}
          <div className="w-full lg:col-span-5 order-2" />
        </div>
      </section>
    </main>
  );
}
