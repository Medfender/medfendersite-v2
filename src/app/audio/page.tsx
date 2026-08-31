import type { Metadata } from "next";
import FeaturedAudioSection from "@/components/sections/FeaturedAudioSection";

export const metadata: Metadata = {
  title: "Audio — Medfender",
  description: "Featured tracks and audio previews from Medfender's TONEX and HX Stomp preset packs.",
};

export default function AudioPage() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
      <FeaturedAudioSection />
    </main>
  );
}
