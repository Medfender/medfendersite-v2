import Link from "next/link";
import { site } from "@/lib/site";

interface BookingBandProps {
  eyebrow?: string;
  title?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Secondary link — defaults to a direct email. */
  secondaryLabel?: string;
  secondaryHref?: string;
  /** Paper (default) or ink. Paper keeps the close of a dark page from doubling up. */
  tone?: "paper" | "ink";
}

/**
 * The recurring invitation: one statement, one action, one set of terms.
 * Kept quiet — a ruled page rather than a poster.
 */
export default function BookingBand({
  eyebrow = "Booking enquiries",
  title = "Give the room a night it remembers.",
  body = "Event ensembles — for private dinners, hotel residencies, weddings, brand evenings and festivals across Morocco and abroad. From a trio to a full stage of 15 musicians, DJs on request. Send the date and the venue; we will send availability and a full technical rider.",
  ctaLabel = "Request availability",
  ctaHref = "/contact#booking",
  secondaryLabel,
  secondaryHref,
  tone = "paper",
}: BookingBandProps) {
  const onInk = tone === "ink";

  return (
    <section
      className={[
        "relative overflow-hidden border-t",
        onInk
          ? "surface-ink border-cream/12 bg-ink-deep text-paper"
          : "surface-paper border-[var(--rule)] bg-paper-deep/45 text-ink",
      ].join(" ")}
    >
      {/* A staff, drawn faintly behind the type. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            opacity: onInk ? 0.16 : 0.5,
            background: onInk
              ? "radial-gradient(ellipse 60% 70% at 78% 15%, rgba(224,178,100,0.16) 0%, transparent 60%)"
              : "radial-gradient(ellipse 60% 70% at 82% 10%, rgba(192,138,43,0.12) 0%, transparent 62%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            opacity: onInk ? 0.1 : 0.06,
            backgroundImage: `repeating-linear-gradient(180deg, ${
              onInk ? "rgba(251,250,247,0.5)" : "rgba(18,18,16,0.45)"
            } 0px, ${
              onInk ? "rgba(251,250,247,0.5)" : "rgba(18,18,16,0.45)"
            } 1px, transparent 1px, transparent 26px)`,
            maskImage:
              "linear-gradient(105deg, transparent 28%, black 56%, black 90%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(105deg, transparent 28%, black 56%, black 90%, transparent 100%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1560px] px-5 py-20 md:px-8 md:py-24">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <div className="mb-7 flex items-center gap-3">
              <span className="fret-index" data-inlay="true">
                24
              </span>
              <p className={onInk ? "eyebrow-on-ink" : "eyebrow"}>{eyebrow}</p>
            </div>
            <h2
              className={`display-lg text-balance ${
                onInk ? "text-cream" : "text-ink"
              }`}
            >
              {(() => {
                const words = title.trim().split(/\s+/);
                const last = words.pop() ?? "";
                return (
                  <>
                    {words.join(" ")}{" "}
                    <em
                      className={`italic ${
                        onInk ? "text-brass" : "text-rust"
                      }`}
                    >
                      {last}
                    </em>
                  </>
                );
              })()}
            </h2>
          </div>

          <div className="lg:col-span-5 lg:pt-2">
            <p
              className={`max-w-md text-sm leading-relaxed ${
                onInk ? "text-paper/60" : "text-ink/65"
              }`}
            >
              {body}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Link
                href={ctaHref}
                className={`btn ${onInk ? "btn-brass" : "btn-ink"}`}
              >
                {ctaLabel}
                <span aria-hidden>→</span>
              </Link>
              <a
                href={secondaryHref ?? `mailto:${site.email}`}
                className={onInk ? "link-rule-light" : "link-rule"}
              >
                {secondaryLabel ?? site.email}
              </a>
            </div>
          </div>
        </div>

        <dl
          className={`mt-12 grid grid-cols-3 gap-4 border-t pt-6 md:mt-16 ${
            onInk ? "border-cream/15" : "border-[var(--rule)]"
          }`}
        >
          {[
            { k: "Reply", v: "48 h" },
            { k: "Roster", v: "Trio → 15" },
            { k: "Travel", v: "Worldwide" },
          ].map((item) => (
            <div key={item.k}>
              <dt
                className={`font-mono text-[9px] uppercase tracking-[0.22em] ${
                  onInk ? "text-cream/55" : "text-ink/55"
                }`}
              >
                {item.k}
              </dt>
              <dd
                className={`mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] ${
                  onInk ? "text-cream/85" : "text-ink/80"
                }`}
              >
                {item.v}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
