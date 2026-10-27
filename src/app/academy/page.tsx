import type { Metadata } from "next";
import PageHero from "@/components/luxury/PageHero";
import BookingBand from "@/components/luxury/BookingBand";
import AcademyLibrary from "@/components/academy/AcademyLibrary";
import AcademyMembership from "@/components/academy/AcademyMembership";

export const metadata: Metadata = {
  title: "Academy — guitar lessons for every level",
  description:
    "Medfender's guitar academy: structured courses from your first chords to advanced gypsy-jazz vocabulary. Tabs, sheet music and backing tracks included.",
  alternates: { canonical: "/academy" },
};

export default function AcademyPage() {
  return (
    <main id="top" className="flex flex-col">
      <PageHero
        index="01"
        eyebrow="The academy"
        title={
          <>
            Learn the craft.
            <br />
            <em className="italic text-brass">Play the music.</em>
          </>
        }
        description="A dedicated guitar academy: programmes and courses from your very first chords to advanced improvisation. Tabs, sheet music, backing tracks and play-alongs included with every lesson."
        image="/images/site/full/Me-Guitar-3.webp"
        imageAlt="Medfender playing a Stratocaster in the studio"
        focus="center 40%"
        meta={[
          { label: "Courses", value: "9 programmes" },
          { label: "Levels", value: "Beginner → Advanced" },
          { label: "Access", value: "Members only" },
          { label: "Preview", value: "First video free" },
        ]}
        sideLabel="Academy · Guitar"
      >
        <a href="#library" className="btn btn-brass">
          Browse the courses
          <span aria-hidden>↓</span>
        </a>
        <a href="#membership" className="link-rule-light">
          Membership
        </a>
      </PageHero>

      <div id="library">
        <AcademyLibrary />
      </div>

      <AcademyMembership />

      <BookingBand
        eyebrow="Private coaching"
        title="Want one-to-one lessons with Medfender?"
        body="Bring your level, your goals and your repertoire. We design a tailored programme and track your progress week by week — in Marrakech or online."
        ctaLabel="Request coaching"
        ctaHref="/contact#booking"
      />
    </main>
  );
}
