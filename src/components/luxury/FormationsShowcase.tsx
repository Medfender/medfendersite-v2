"use client";

import { useState } from "react";
import Link from "next/link";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import { formations } from "./formationsData";

export default function FormationsShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = formations[activeIndex];

  return (
    <section
      id="formations"
      className="surface-paper relative overflow-hidden bg-paper py-20 md:py-28"
    >
      <div className="mx-auto w-full max-w-[1560px] px-5 md:px-8">
        <SectionHeading
          index="7"
          inlay
          eyebrow="Formations"
          title={
            <>
              One band.
              <br />
              <em className="italic text-rust">From trio to full stage.</em>
            </>
          }
          intro="The same soul at every size — from an intimate trio to 15 musicians with Gnaoua and brass sections. Choose the room and the occasion; the arrangement follows."
          action={
            <Link href="/live" className="link-rule">
              The live act
              <span aria-hidden>→</span>
            </Link>
          }
        />

        {/* ── Desktop: index + plate ─────────────────────────────────── */}
        <div className="mt-14 hidden gap-14 lg:grid lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="border-t border-[var(--rule)]">
              {formations.map((formation, i) => {
                const isActive = i === activeIndex;
                return (
                  <button
                    key={formation.slug}
                    type="button"
                    onMouseEnter={() => setActiveIndex(i)}
                    onFocus={() => setActiveIndex(i)}
                    onClick={() => setActiveIndex(i)}
                    aria-pressed={isActive}
                    className={[
                      "group flex w-full items-center gap-5 border-b border-[var(--rule)] px-4 py-6 text-left transition-all duration-500",
                      isActive
                        ? "bg-ink text-cream"
                        : "text-ink hover:bg-ink/[0.035]",
                    ].join(" ")}
                  >
                    <span
                      className={`font-mono text-[10px] tracking-[0.16em] ${
                        isActive ? "text-brass" : "text-rust/85"
                      }`}
                    >
                      {formation.number}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block font-display text-2xl leading-tight md:text-[1.75rem] ${
                          isActive ? "text-cream" : "text-ink"
                        }`}
                      >
                        {formation.title}
                      </span>
                      <span
                        className={`mt-1.5 block truncate font-mono text-[8.5px] uppercase tracking-[0.24em] ${
                          isActive ? "text-cream/55" : "text-ink/60"
                        }`}
                      >
                        {formation.instrumentation}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={`shrink-0 text-sm transition-transform duration-500 ${
                        isActive
                          ? "translate-x-0 text-brass"
                          : "-translate-x-1 text-ink/60 group-hover:translate-x-0"
                      }`}
                    >
                      →
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mt-6 font-mono text-[8.5px] uppercase leading-relaxed tracking-[0.24em] text-ink/60">
              {active.subtitle}
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-28">
              <div className="plate aspect-[4/5] w-full">
                {formations.map((formation, i) => (
                  <img
                    key={formation.slug}
                    src={formation.imageSrc}
                    alt={formation.imageAlt}
                    loading={i === 0 ? "eager" : "lazy"}
                    className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
                    style={{ opacity: i === activeIndex ? 1 : 0 }}
                  />
                ))}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="flex items-end justify-between gap-6">
                    <div>
                      <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-cream/50">
                        Fig. {active.number} / 05
                      </p>
                      <p className="mt-2 font-display text-2xl text-cream">
                        {active.title}
                      </p>
                    </div>
                    <Link
                      href="/contact#booking"
                      className="shrink-0 font-mono text-[9px] uppercase tracking-[0.24em] text-cream/75 transition-colors hover:text-brass"
                    >
                      Enquire →
                    </Link>
                  </div>
                </div>
              </div>

              <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink/65">
                {active.body}
              </p>
            </div>
          </div>
        </div>

        {/* ── Mobile: stacked plates ─────────────────────────────────── */}
        <div className="mt-12 grid gap-10 lg:hidden">
          {formations.map((formation, i) => (
            <Reveal key={formation.slug} delay={i * 0.04}>
              <article>
                <div className="plate aspect-[4/3] w-full">
                  <img
                    src={formation.imageSrc}
                    alt={formation.imageAlt}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-[var(--rule)] pt-3">
                  <h3 className="display-sm text-ink">{formation.title}</h3>
                  <span className="font-mono text-[10px] text-rust">
                    {formation.number}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.24em] text-ink/60">
                  {formation.instrumentation}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink/65">
                  {formation.body}
                </p>
                <Link
                  href="/contact#booking"
                  className="mt-4 inline-flex font-mono text-[9px] uppercase tracking-[0.24em] text-rust"
                >
                  Enquire →
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
