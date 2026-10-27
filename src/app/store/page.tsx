import type { Metadata } from "next";
import PageHero from "@/components/luxury/PageHero";
import PresetsSection from "@/components/store/PresetsSection";
import BookingBand from "@/components/luxury/BookingBand";

export const metadata: Metadata = {
  title: "Tone store — real amp captures",
  description:
    "Hand-tuned TONEX and HX Stomp preset packs. Direct amp captures, blade-precision gear profiles, instant download.",
  alternates: { canonical: "/store" },
};

export default function StorePage() {
  return (
    <main id="top" className="flex flex-col">
      <PageHero
        index="01"
        eyebrow="The tone library"
        title={
          <>
            The rig,
            <br />
            <em className="italic text-brass">captured.</em>
          </>
        }
        description="Hand-tuned TONEX and HX Stomp packs, built from a real amplifier, a real cabinet and a real room. Documented signal chains, instant download."
        image="/images/site/portrait-studio.webp"
        imageAlt="Medfender with a Stratocaster in the studio, amplifier and microphone rig behind him"
        focus="center 40%"
        sideLabel="Tone library · Marrakech"
        meta={[
          { label: "Formats", value: "TONEX · HX Stomp" },
          { label: "Delivery", value: "Instant download" },
          { label: "Captured at", value: "96 kHz / 24-bit" },
          { label: "Support", value: "Setup guide included" },
        ]}
      >
        <a href="#catalogue" className="btn btn-brass">
          Browse the catalogue
          <span aria-hidden>↓</span>
        </a>
      </PageHero>

      <div id="catalogue">
        <PresetsSection />
      </div>

      <BookingBand
        eyebrow="Custom captures"
        title="Want a capture of your own amplifier?"
        body="Bring your head, cabinet and pedals. We dial the chain, capture it at 96 kHz and hand over a matched pack. Single units or full rigs."
        ctaLabel="Request a capture"
        ctaHref="/contact#booking"
      />
    </main>
  );
}
