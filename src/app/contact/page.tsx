import type { Metadata } from "next";
import PageHero from "@/components/luxury/PageHero";
import ContactSection from "@/components/contact/ContactSection";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact & bookings — Medfender",
  description:
    "Reach Medfender for private-event bookings, custom tone captures, collaborations and press. Ensembles from trio to full stage.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main id="top" className="flex flex-col">
      <PageHero
        index="01"
        eyebrow="Bookings & enquiries"
        title={
          <>
            Put it on
            <br />
            <em className="italic text-brass">the calendar.</em>
          </>
        }
        description="Private evenings, hotel residencies, weddings, brand launches, custom captures. Send the venue, the date and the format — we'll reply with availability and a full technical rider."
        image="/images/site/live-portrait.webp"
        imageAlt="Medfender on stage at So Lounge, Marrakech"
        focus="center 32%"
        sideLabel="Contact · Marrakech"
        meta={[
          { label: "Reply", value: "Within 48 hours" },
          { label: "Based", value: "Marrakech, Morocco" },
          { label: "Travel", value: "Worldwide" },
          { label: "Languages", value: "EN · FR · AR" },
        ]}
      >
        <a href="#booking" className="btn btn-brass">
          Write to us
          <span aria-hidden>↓</span>
        </a>
        <a href={`mailto:${site.email}`} className="link-rule-light">
          {site.email}
        </a>
      </PageHero>

      <ContactSection />
    </main>
  );
}
