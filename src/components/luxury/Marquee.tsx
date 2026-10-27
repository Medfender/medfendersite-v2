import Link from "next/link";
import { packs } from "@/data/storeData";

const items = packs.map((pack) => ({
  label: `${pack.title} — $${pack.price.toFixed(2)} · ${pack.type}`,
  href: `/store/${pack.slug}`,
}));

interface MarqueeProps {
  tone?: "paper" | "ink";
}

export default function Marquee({ tone = "paper" }: MarqueeProps) {
  const doubled = [...items, ...items, ...items];
  const onInk = tone === "ink";

  return (
    <div
      className={[
        "mf-marquee relative w-full overflow-hidden border-y border-[var(--rule)] py-3.5",
        onInk ? "surface-ink bg-ink-deep" : "bg-cream",
      ].join(" ")}
    >
      <div
        className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-16 ${
          onInk
            ? "bg-gradient-to-r from-ink-deep to-transparent"
            : "bg-gradient-to-r from-cream to-transparent"
        }`}
      />
      <div
        className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-16 ${
          onInk
            ? "bg-gradient-to-l from-ink-deep to-transparent"
            : "bg-gradient-to-l from-cream to-transparent"
        }`}
      />
      <div className="mf-marquee-track items-center">
        {doubled.map((item, i) => (
          <span key={`${item.label}-${i}`} className="flex shrink-0 items-center">
            <Link
              href={item.href}
              className={`font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 ${
                onInk
                  ? "text-cream/55 hover:text-brass-light"
                  : "text-ink/55 hover:text-rust"
              }`}
            >
              {item.label}
            </Link>
            <span
              aria-hidden
              className={`mx-7 h-3 w-px ${
                onInk ? "bg-cream/20" : "bg-ink/15"
              }`}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
