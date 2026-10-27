import Link from "next/link";
import type { Metadata } from "next";
import { site } from "@/lib/site";
import PageHero from "@/components/luxury/PageHero";
import SectionHeading from "@/components/luxury/SectionHeading";
import BookingBand from "@/components/luxury/BookingBand";
import FormationsShowcase from "@/components/luxury/FormationsShowcase";
import Reveal from "@/components/luxury/Reveal";

export const metadata: Metadata = {
  title: "Live — Event ensembles for private events & venues",
  description:
    "Event ensembles across Marrakech and worldwide — anniversaries, weddings, cocktails, corporate evenings, celebrations. Request availability.",
  alternates: { canonical: "/live" },
};

const rider = [
  { label: "Formations", value: "Trio · Quartet · Quintet · Sextet · Grand ensemble" },
  { label: "Line-up", value: "Jusqu'à 15 musiciens" },
  { label: "DJs", value: "Sur demande" },
  { label: "Travel", value: "Morocco & worldwide" },
  { label: "Lead time", value: "2–4 weeks" },
  { label: "Rider", value: "Technical rider on request" },
];

const signal = [
  "Fender Stratocaster through a hand-wired valve amp",
  "Loop station, volume pedal and a guarded pedalboard",
  "In-ear monitoring optional · house PA welcome",
  "Standalone staging · 60-second changeover",
  "PR sizzle & press photos supplied",
];

export default function LivePage() {
  return (
    <main className="flex flex-col">
      <PageHero
        size="tall"
        eyebrow="Live bookings"
        title={
          <>
            A live band for the
            <br />
            <em className="text-sand-gradient">room you are building.</em>
          </>
        }
        description="Ensembles for private dinners, hotel residencies, weddings, brand evenings, anniversaries and celebrations — from an intimate trio to a full stage. We read the space, then shape the night around it."
        image="/images/site/live-portrait.webp"
        imageAlt="Medfender on stage at So Lounge, Marrakech"
        focus="center 30%"
        sideLabel="On stage · Marrakech"
        meta={rider}
      >
        <Link href="/contact#booking" className="btn btn-brass">
          Request availability
        </Link>
        <Link href="#formations" className="btn btn-ghost">
          Formation details
        </Link>
      </PageHero>
      <FormationsShowcase />

      {/* Rider + signal chain */}
      <section className="border-y border-[var(--hairline-soft)] bg-ink-deep">
        <div className="mx-auto grid w-full max-w-[1560px] grid-cols-1 gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Occasions"
              title={
                <>
                  Nights that ask
                  <br /> for a
                  <br />
                  <em className="text-sand-gradient">guitarist.</em>
                </>
              }
            />
            <ul className="mt-10 space-y-4">
              {[
                "Private dinners & chef's tables",
                "Hotel residencies · weekly rooms",
                "Weddings, ceremonies, first dances",
                "Brand launches & corporate evenings",
                "Gala & award nights",
                "Festivals & club slots",
                "Studio scoring & live sessions",
              ].map((item, i) => (
                <li
                  key={item}
                  className="flex items-center gap-5 border-t border-[var(--hairline-soft)] py-4"
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <span className="font-mono text-[9px] tracking-[0.28em] text-brass-light">
                    0{i + 1}
                  </span>
                  <span className="text-sm text-cream">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <Reveal delay={0.15} className="lg:col-span-6 lg:col-start-7">
            <div className="relative overflow-hidden border border-[var(--hairline)] bg-ink">
              <img
                src="/images/site/live-motion.webp"
                alt="Medfender on stage mid-solo"
                className="absolute inset-0 h-full w-full object-cover opacity-60"
                loading="lazy"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/20"
              />
              <div className="relative z-10 p-8 md:p-10">
                <p className="eyebrow mb-6">The signal chain</p>
                <ul className="space-y-4">
                  {signal.map((line, i) => (
                    <li
                      key={line}
                      className="flex items-start gap-4 border-b border-[var(--hairline-soft)] pb-4 last:border-b-0"
                    >
                      <span className="mt-1 font-mono text-[8px] tracking-[0.28em] text-brass-light">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm leading-relaxed text-cream">
                        {line}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 grid grid-cols-2 gap-px bg-[var(--hairline-soft)]">
                  {[
                    { k: "Lead time", v: "2–4 weeks" },
                    { k: "Travel", v: "Worldwide" },
                    { k: "Rider", v: "On request" },
                    { k: "Reply", v: "Within 48 h" },
                  ].map((spec) => (
                    <div key={spec.k} className="bg-ink p-4">
                      <p className="font-mono text-[8px] uppercase tracking-[0.28em] text-sand-deep">
                        {spec.k}
                      </p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-cream">
                        {spec.v}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="mt-0">
        <BookingBand
          title="Give the room a night it remembers."
          body="Tell us the venue, the date and the formation that suits the evening — from trio to a full stage of 15, DJs on request. We reply within 48 hours with availability and a full technical rider."
        />
      </div>
    </main>
  );
}