import Link from "next/link";
import DocumentHeader from "@/components/luxury/DocumentHeader";

const routes = [
  { label: "Home", href: "/", note: "The press book" },
  { label: "Store", href: "/store", note: "Tone packs" },
  { label: "Academy", href: "/academy", note: "Lessons" },
  { label: "Audio", href: "/audio", note: "Listening room" },
  { label: "Media", href: "/media", note: "Photography & film" },
  { label: "Contact", href: "/contact", note: "Bookings" },
];

export default function NotFound() {
  return (
    <main className="flex flex-col">
      <DocumentHeader
        index="—"
        eyebrow="Error · 404"
        title={
          <>
            This page
            <br />
            <em className="text-sand-gradient">left the stage.</em>
          </>
        }
        intro="The address does not match anything in the book. It may have moved, or the link may have been mistyped."
      />

      <section className="surface-paper w-full">
        <div className="mx-auto w-full max-w-[1560px] px-5 py-16 md:px-8 md:py-24">
          <p className="eyebrow border-b border-[var(--rule)] pb-3">
            Where to next
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {routes.map((route, i) => (
              <li key={route.href}>
                <Link
                  href={route.href}
                  className="group flex items-baseline gap-4 border-b border-[var(--rule)] py-5 transition-colors hover:border-ink"
                >
                  <span className="folio shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1">
                    <span className="block font-display text-2xl leading-none text-ink transition-colors group-hover:text-rust">
                      {route.label}
                    </span>
                    <span className="mt-2 block font-mono text-[8.5px] uppercase tracking-[0.26em] text-sand-deep">
                      {route.note}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className="translate-x-0 text-lg text-ink/60 transition-transform duration-500 group-hover:translate-x-1 group-hover:text-rust"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
