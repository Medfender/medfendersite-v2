import MediaSection from "@/components/media/MediaSection";
import ContactSection from "@/components/contact/ContactSection";
import Link from "next/link";
import { packs } from "@/data/storeData";
import PresetCard from "@/components/store/PresetCard";

export default function Home() {
  // Only show the first 3 packs on the home showcase
  const featuredPacks = packs.slice(0, 3);

  return (
    <main className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
      {/* ── Featured Packs: 3-card limit ── */}
      <section className="relative">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4 drop-shadow-[0_0_20px_rgba(0,216,246,0.3)]">
              Featured Preset Packs
            </h2>
            <p className="text-neutral-400 text-base md:text-lg max-w-2xl mx-auto">
              Hand-tuned presets for TONEX, HX Stomp, and studio captures. Preview the demo, then grab your pack.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPacks.map((pack) => (
              <PresetCard key={pack.id} preset={pack} />
            ))}
          </div>

          {/* Prominent VIEW ALL PACKS link */}
          <div className="flex justify-center mt-12">
            <Link
              href="/store"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl border-2 border-zinc-800 bg-zinc-950 hover:border-cyan-400/60 hover:bg-cyan-950/20 text-sm font-black uppercase tracking-[0.2em] text-cyan-300 hover:text-cyan-200 transition-all shadow-[0_0_20px_rgba(0,216,246,0)] hover:shadow-[0_0_30px_rgba(0,216,246,0.2)] active:translate-y-[1px]"
            >
              View All Packs →
            </Link>
          </div>
        </div>
      </section>

      <MediaSection />
      <ContactSection />
    </main>
  );
}
