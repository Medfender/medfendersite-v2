import type { ReactNode } from "react";
import Link from "next/link";

export interface LegalSection {
  /** Section heading, printed after its folio number. */
  title: string;
  body: ReactNode;
}

interface LegalArticleProps {
  sections: LegalSection[];
  /** Small print closing the document. */
  colophon: string;
  related: { label: string; href: string }[];
}

/**
 * LegalArticle — the reading body for policy pages: a numbered contents rail
 * and a single ruled column of prose, set like a printed statute.
 */
export default function LegalArticle({
  sections,
  colophon,
  related,
}: LegalArticleProps) {
  return (
    <section className="surface-paper w-full">
      <div className="mx-auto w-full max-w-[1560px] px-5 py-16 md:px-8 md:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Contents rail */}
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow border-b border-[var(--rule)] pb-3">
                Contents
              </p>
              <ol className="mt-4 space-y-0">
                {sections.map((section, i) => (
                  <li key={section.title}>
                    <a
                      href={`#s-${i + 1}`}
                      className="group flex items-baseline gap-3 border-b border-[var(--rule-soft)] py-2.5"
                    >
                      <span className="font-mono text-[9px] tracking-[0.18em] text-rust">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-xs leading-snug text-ink/60 transition-colors group-hover:text-ink">
                        {section.title}
                      </span>
                    </a>
                  </li>
                ))}
              </ol>

              <div className="mt-8 hidden lg:block">
                <p className="font-mono text-[8.5px] uppercase leading-relaxed tracking-[0.26em] text-sand-deep">
                  Medfender
                  <br />
                  Marrakech · Morocco
                </p>
              </div>
            </div>
          </aside>

          {/* Reading column */}
          <div className="lg:col-span-8 lg:col-start-5">
            <div className="doc-prose">
              {sections.map((section, i) => (
                <section
                  key={section.title}
                  id={`s-${i + 1}`}
                  className="scroll-mt-28 border-t border-[var(--rule)] pt-8 first:border-t-0 first:pt-0 [&:not(:first-child)]:mt-14"
                >
                  <div className="flex items-baseline gap-4">
                    <span className="folio shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="display-sm text-ink">{section.title}</h2>
                  </div>
                  <div className="mt-4">{section.body}</div>
                </section>
              ))}
            </div>

            <div className="mt-16 border-t border-[var(--rule)] pt-6">
              <p className="font-mono text-[9px] uppercase leading-relaxed tracking-[0.26em] text-sand-deep">
                {colophon}
              </p>
            </div>

            <nav className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
              {related.map((link) => (
                <Link key={link.href} href={link.href} className="link-rule">
                  {link.label}
                  <span aria-hidden>→</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
