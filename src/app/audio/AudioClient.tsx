"use client";

import FeaturedAudioSection from "@/components/sections/FeaturedAudioSection";
import VinylShowcase from "@/components/VinylShowcase";

export default function AudioClient() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
      <FeaturedAudioSection />

      <section className="w-full px-6 py-12 flex justify-center">
        <VinylShowcase />
      </section>
    </main>
  );
}
