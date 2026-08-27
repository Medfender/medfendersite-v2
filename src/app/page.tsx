import FeaturedAudioSection from "@/components/sections/FeaturedAudioSection";
import PresetsSection from "@/components/store/PresetsSection";
import MediaSection from "@/components/media/MediaSection";
import ContactSection from "@/components/contact/ContactSection";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
      <FeaturedAudioSection />

      <section id="store" className="relative">
        <PresetsSection />
      </section>


      <section id="media">
        <MediaSection />
      </section>

      <section id="contact">
        <ContactSection />
      </section>
    </main>
  );
}
