import FeaturedAudioSection from "@/components/sections/FeaturedAudioSection";
import PresetsSection from "@/components/store/PresetsSection";
import MediaSection from "@/components/media/MediaSection";
import ContactSection from "@/components/contact/ContactSection";
import VinylShowcase from "@/components/VinylShowcase";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
      <FeaturedAudioSection />

      <section className="relative">
        <PresetsSection />
        <div className="max-w-6xl mx-auto px-6 pb-12 -mt-8">
          <Link
            href="/store"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-cyan-300 hover:text-cyan-200 transition-colors"
          >
            View All Packs →
          </Link>
        </div>
      </section>

      <VinylShowcase />

      <MediaSection />

      <ContactSection />
    </main>
  );
}
