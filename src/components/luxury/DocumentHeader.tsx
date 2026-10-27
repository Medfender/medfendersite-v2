import type { ReactNode } from "react";

interface DocumentHeaderProps {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  image?: string;
  imageAlt?: string;
  /** Folio printed before the eyebrow. */
  index?: string;
  /** Right-aligned note under the title, e.g. a revision date. */
  note?: string;
  children?: ReactNode;
}

/**
 * DocumentHeader — the dark title page for prose routes (legal, support,
 * error pages). Short enough to read as a masthead rather than a hero, but
 * dark at the top so the fixed navigation stays legible.
 */
export default function DocumentHeader({
  eyebrow,
  title,
  intro,
  image = "/images/site/portrait-studio.webp",
  imageAlt = "",
  index,
  note,
  children,
}: DocumentHeaderProps) {
  return (
    <section className="relative isolate overflow-hidden bg-ink-deep pb-16 pt-32 text-paper md:pb-20 md:pt-44">
      <img
        src={image}
        alt={imageAlt}
        aria-hidden={imageAlt === "" ? true : undefined}
        className="grade-print absolute right-0 top-0 h-full w-2/3 object-cover opacity-25 md:w-1/2"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(7,6,5,0.97) 0%, rgba(7,6,5,0.9) 42%, rgba(7,6,5,0.55) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-24"
        style={{
          background:
            "linear-gradient(180deg, rgba(7,6,5,0) 0%, rgba(7,6,5,0.85) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1560px] px-5 md:px-8">
        <div className="flex items-center gap-4">
          {index ? (
            <span className="fret-index">{index}</span>
          ) : null}
          <span className="eyebrow-on-ink">{eyebrow}</span>
          <span aria-hidden className="h-px w-16 bg-cream/25 md:w-28" />
        </div>

        <h1 className="display-xl mt-7 max-w-4xl text-balance text-cream">
          {title}
        </h1>

        {intro ? (
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-cream/65 md:text-base">
            {intro}
          </p>
        ) : null}

        {children ? (
          <div className="mt-8 flex flex-wrap items-center gap-3">{children}</div>
        ) : null}

        {note ? (
          <p className="mt-10 border-t border-cream/15 pt-5 font-mono text-[9px] uppercase tracking-[0.28em] text-cream/60">
            {note}
          </p>
        ) : null}
      </div>
    </section>
  );
}
