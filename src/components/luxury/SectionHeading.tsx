import type { ReactNode } from "react";
import Reveal from "./Reveal";

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  /** Left-aligned by default; centred suits short manifesto sections. */
  align?: "left" | "center";
  /** Optional action rendered opposite the title (left align only). */
  action?: ReactNode;
  /** Paper (default) or ink surface. */
  tone?: "paper" | "ink";
  /** Fret position printed before the label. */
  index?: string;
  /** Mark this section as an inlaid fret. */
  inlay?: boolean;
  className?: string;
}

/**
 * A section opens the way a page in a notebook opens: a fret number, a
 * label, a rule, then the heading. The rule is the only decoration.
 */
export default function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  action,
  tone = "paper",
  index,
  inlay = false,
  className = "",
}: SectionHeadingProps) {
  const centered = align === "center";
  const onInk = tone === "ink";

  return (
    <div
      className={[
        "flex flex-col gap-8",
        centered
          ? "items-center text-center"
          : "md:flex-row md:items-end md:justify-between",
        className,
      ].join(" ")}
    >
      <Reveal className={centered ? "max-w-3xl" : "max-w-2xl"}>
        <div
          className={`mb-6 flex items-center gap-4 ${
            centered ? "justify-center" : ""
          }`}
        >
          {index ? (
            <span className="fret-index" data-inlay={inlay || undefined}>
              {index}
            </span>
          ) : null}
          <span className={onInk ? "eyebrow-on-ink" : "eyebrow"}>{eyebrow}</span>
          {!centered ? (
            <span
              aria-hidden
              className="h-px flex-1"
              style={{ background: onInk ? "var(--rule-ink)" : "var(--rule)" }}
            />
          ) : null}
        </div>

        <h2
          className={`display-lg text-balance ${
            onInk ? "text-cream" : "text-ink"
          }`}
        >
          {title}
        </h2>
        {intro ? (
          <p
            className={`mt-6 max-w-xl text-sm leading-relaxed md:text-base ${
              onInk ? "text-cream/65" : "text-ink/65"
            }`}
          >
            {intro}
          </p>
        ) : null}
      </Reveal>

      {action ? (
        <Reveal delay={0.12} className={centered ? "" : "shrink-0"}>
          {action}
        </Reveal>
      ) : null}
    </div>
  );
}
