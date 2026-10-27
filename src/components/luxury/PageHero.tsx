import type { ReactNode } from "react";
import Image from "next/image";

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  image: string;
  imageAlt: string;
  /** CSS object-position for the photograph. */
  focus?: string;
  /** Short facts printed along the base of the frame. */
  meta?: { label: string; value: string }[];
  /** Calls to action. */
  children?: ReactNode;
  /** "tall" for landing pages, "standard" for supporting pages. */
  size?: "standard" | "tall";
  /** Optional vertical label on the right edge. */
  sideLabel?: string;
  /** Fret position printed before the eyebrow. */
  index?: string;
  /** When true, the index is treated as an inlaid fret. */
  inlay?: boolean;
}

/**
 * The opening spread of a section: a full-bleed photograph, the type set on
 * the lower third, and a single measured rail of facts at the base. No
 * ornament beyond the fret index — the photograph is the ornament.
 */
export default function PageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  focus = "center",
  meta,
  children,
  size = "standard",
  sideLabel = "Medfender · Marrakech",
  index,
  inlay = false,
}: PageHeroProps) {
  const minHeight = size === "tall" ? "min-h-[88svh]" : "min-h-[70svh]";

  return (
    <section
      className={`surface-ink relative isolate flex w-full flex-col justify-end overflow-hidden bg-ink-deep ${minHeight}`}
    >
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="grade-print object-cover"
        style={{ objectPosition: focus }}
      />

      {/* Navbar legibility above, type legibility below. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,8,6,0.76) 0%, rgba(10,8,6,0.12) 26%, rgba(10,8,6,0.16) 48%, rgba(10,8,6,0.82) 84%, rgba(10,8,6,0.96) 100%)",
        }}
      />
      {/* On busy stages (a bright LED wall behind the type) the vertical
          scrim alone is not enough. This left-hand shade holds the copy at
          AA without flattening the photograph. */}
      <div aria-hidden className="hero-shade absolute inset-0" />

      {/* Vertical edge label */}
      <p
        aria-hidden
        className="absolute right-6 top-1/2 hidden -translate-y-1/2 rotate-90 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.36em] text-cream/55 lg:block"
      >
        {sideLabel}
      </p>

      <div className="relative z-10 mx-auto w-full max-w-[1560px] px-5 pb-10 pt-36 md:px-8 md:pb-12 md:pt-44">
        <div className="flex items-center gap-4">
          {index ? (
            <span className="fret-index" data-inlay={inlay || undefined}>
              {index}
            </span>
          ) : null}
          <span className="eyebrow-on-ink">{eyebrow}</span>
          <span aria-hidden className="h-px w-16 bg-cream/20 md:w-28" />
        </div>

        <div className="mt-7 max-w-5xl">
          <h1 className="display-xl text-cream text-balance">{title}</h1>
          {description ? (
            <p className="mt-7 max-w-xl text-sm leading-relaxed text-cream/70 md:text-base">
              {description}
            </p>
          ) : null}
          {children ? (
            <div className="mt-9 flex flex-wrap items-center gap-3">{children}</div>
          ) : null}
        </div>

        {meta?.length ? (
          <div className="mt-12 md:mt-16">
            <div className="string-rule mb-6 opacity-50" aria-hidden>
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
              {meta.map((item) => (
                <div key={item.label}>
                  <dt className="font-mono text-[8px] uppercase tracking-[0.26em] text-cream/55">
                    {item.label}
                  </dt>
                  <dd className="mt-2 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-cream/85">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </div>
    </section>
  );
}
