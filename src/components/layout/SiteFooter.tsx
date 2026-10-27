import Link from "next/link";
import { site } from "@/lib/site";

const year = new Date().getFullYear();

const explore = [
  { label: "The Fretboard", href: "/fretboard" },
  { label: "Setup guide", href: "/support/setup-guide" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
];

/**
 * The close of the book: quiet, structured, and legible.
 *
 * A single hairline across the top, four aligned columns, one thin legal
 * bar. No oversized watermark, no micro-type — the footer is an index, not
 * a poster.
 */
export default function SiteFooter() {
  return (
    <footer className="surface-ink relative border-t border-cream/12 bg-ink-deep text-paper">
      <div className="mx-auto w-full max-w-[1560px] px-5 md:px-8">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 py-14 md:grid-cols-12 md:gap-x-6 md:py-16">
          {/* Identity */}
          <div className="col-span-2 md:col-span-4">
            <Link
              href="/"
              className="wordmark inline-block text-[2rem] leading-none text-cream transition-colors hover:text-brass-light"
            >
              Medfender
            </Link>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-cream/55">
              {site.tagline}
            </p>
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-cream/55">
              {site.city} · Available worldwide
            </p>
          </div>

          {/* Navigate */}
          <nav aria-label="Navigate" className="col-span-1 md:col-span-3">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-cream/55">
              Navigate
            </p>
            <ul className="flex flex-col">
              {[...site.nav, { label: "Fretboard", href: "/fretboard" }].map(
                (item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-flex min-h-[34px] items-center text-[13px] text-cream/65 transition-colors hover:text-cream"
                    >
                      {item.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>

          {/* Explore */}
          <nav aria-label="Explore" className="col-span-1 md:col-span-2">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-cream/55">
              Explore
            </p>
            <ul className="flex flex-col">
              {explore.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-[34px] items-center text-[13px] text-cream/65 transition-colors hover:text-cream"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="col-span-2 md:col-span-3">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-cream/55">
              Contact
            </p>
            <a
              href={`mailto:${site.email}`}
              className="inline-block break-all text-[13px] text-cream transition-colors hover:text-brass-light"
            >
              {site.email}
            </a>
            <Link
              href="/contact#booking"
              className="mt-2 flex text-[13px] text-cream/65 transition-colors hover:text-cream"
            >
              Booking enquiries
            </Link>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-1">
              {site.socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[34px] items-center font-mono text-[10px] uppercase tracking-[0.16em] text-cream/55 transition-colors hover:text-brass-light"
                >
                  {social.label}
                  <span aria-hidden className="ml-1 text-[0.85em]">
                    ↗
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-cream/12 py-6 font-mono text-[10px] uppercase tracking-[0.16em] text-cream/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}
          </p>
          <p>Marrakech · Morocco</p>
          <p>Set in Newsreader &amp; Geist</p>
        </div>
      </div>
    </footer>
  );
}
