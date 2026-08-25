import FeaturedPlayer from "@/components/audio/FeaturedPlayer";
import PresetsSection from "@/components/store/PresetsSection";
import MediaSection from "@/components/media/MediaSection";
import ContactSection from "@/components/contact/ContactSection";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
      <section id="audio" className="flex flex-col items-center justify-center px-6 pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="w-full max-w-5xl text-center mb-14">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-5 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-cyan-500 drop-shadow-[0_0_25px_rgba(0,216,246,0.45)]">
            Featured Audio Experience
          </h1>
          <p className="text-neutral-400 text-base md:text-lg max-w-xl mx-auto">
            Real-time web audio visualization powered by Web Audio API. Select a track, press play, and watch the waveform respond.
          </p>
        </div>
        <FeaturedPlayer />
      </section>

      <section id="store">
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
