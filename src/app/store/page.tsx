import type { Metadata } from "next";
import PresetsSection from "@/components/store/PresetsSection";

export const metadata: Metadata = {
  title: "Tone Store — Medfender",
  description: "Hand-tuned TONEX and HX Stomp preset packs. Direct amp captures, blade-precision gear profiles, instant download.",
};

export default function StorePage() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
      <PresetsSection />
    </main>
  );
}
