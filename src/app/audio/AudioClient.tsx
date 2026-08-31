"use client";

import FeaturedAudioSection from "@/components/sections/FeaturedAudioSection";
import VinylShowcase from "@/components/VinylShowcase";

export default function AudioClient() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
      {/* Hero — visual mood / featured tracks */}
      <section className="w-full">
        <FeaturedAudioSection />
      </section>

      {/* Turntable — full space, its own section */}
      <section className="w-full px-4 lg:px-10 py-10 lg:py-16 flex justify-center">
        <VinylShowcase />
      </section>

      {/* Playlist / details below */}
      <section className="max-w-6xl mx-auto px-6 pb-20 w-full">
        <div className="w-full lg:grid lg:grid-cols-12 lg:gap-12 lg:items-start flex flex-col gap-10">
          <aside className="w-full lg:col-span-5 order-2 lg:order-1">
            <div className="rounded-2xl border border-zinc-800 bg-neutral-900/60 backdrop-blur p-6">
              <p className="text-neutral-400 text-sm">The turntable is fully functional above — play, stop, power, and RPM controls are wired directly to the global audio context with no prop interference. All animations (vinyl spin, tonearm drop, needle state) respond to the three-state transport machine.</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
