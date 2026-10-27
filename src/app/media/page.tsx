import type { Metadata } from "next";
import PageHero from "@/components/luxury/PageHero";
import MediaSection from "@/components/media/MediaSection";
import BookingBand from "@/components/luxury/BookingBand";

export const metadata: Metadata = {
  title: "Media — photography & live performance",
  description:
    "Still frames, live clips and behind-the-scenes footage from Medfender's studio sessions and So Lounge residencies.",
  alternates: { canonical: "/media" },
};

export default function MediaPage() {
  return (
    <main id="top" className="flex flex-col">
      <PageHero
        index="01"
        eyebrow="The archive"
        title={
          <>
            Frames from
            <br />
            <em className="italic text-brass">the last few nights.</em>
          </>
        }
        description="Stage stills, close-ups and the moments between — shot over a run of dates at So Lounge, Marrakech, and in the studio. Open any frame to view it full size."
        image="/images/site/live-motion.webp"
        imageAlt="Medfender mid-solo under stage light"
        focus="center 38%"
        sideLabel="Photography · So Lounge"
        meta={[
          { label: "Venue", value: "So Lounge, Marrakech" },
          { label: "Archive", value: "2024 — 2026" },
          { label: "Formats", value: "Stills · Live clips" },
          { label: "Usage", value: "Press on request" },
        ]}
      >
        <a href="#archive" className="btn btn-brass">
          Open the archive
          <span aria-hidden>↓</span>
        </a>
      </PageHero>

      <div id="archive">
        <MediaSection />
      </div>

      <BookingBand
        eyebrow="Press & media"
        title="Need photographs for a programme?"
        body="A full press kit — high-resolution portraits, stage photography and a short biography — is available for promoters, journalists and venues. Tell us the outlet and the deadline."
        ctaLabel="Request the press kit"
        ctaHref="/contact#booking"
      />
    </main>
  );
}
