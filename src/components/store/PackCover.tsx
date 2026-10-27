interface PackCoverProps {
  title: string;
  badge: string;
  index?: number;
  className?: string;
}

/**
 * Print inks — the covers are treated as plates from a product catalogue,
 * not photographs: paper stock, an etched field of rings, a monogram.
 */
const inks = [
  { ink: "#8a5a18", wash: "rgba(138,90,24,0.18)" },
  { ink: "#8a3a2a", wash: "rgba(138,58,42,0.18)" },
  { ink: "#2f3a33", wash: "rgba(47,58,51,0.18)" },
  { ink: "#4a4436", wash: "rgba(74,68,54,0.18)" },
];

export default function PackCover({
  title,
  badge,
  index = 0,
  className = "",
}: PackCoverProps) {
  const palette = inks[index % inks.length];
  const catalogue = String(index + 1).padStart(2, "0");
  const initials = title
    .replace(/[^a-zA-Z ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return (
    <div
      className={`relative isolate aspect-[4/5] w-full overflow-hidden border border-[var(--rule)] bg-paper-deep ${className}`}
      style={{
        backgroundImage: `radial-gradient(ellipse 80% 70% at 18% 12%, ${palette.wash} 0%, transparent 62%)`,
      }}
    >
      {/* Etched rings — a speaker cone read as an engraving */}
      <div
        aria-hidden
        className="absolute -left-[28%] -top-[18%] aspect-square w-[104%] rounded-full"
        style={{
          backgroundImage: `repeating-radial-gradient(circle at 50% 50%, transparent 0 9px, ${palette.ink}22 9px 10px)`,
        }}
      />

      {/* Zellige lattice, faintly printed */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='88' height='88' viewBox='0 0 88 88'%3E%3Cg fill='none' stroke='%23100e0b' stroke-width='0.6'%3E%3Cpath d='M44 2 L86 44 L44 86 L2 44 Z'/%3E%3Cpath d='M44 18 L70 44 L44 70 L18 44 Z'/%3E%3C/g%3E%3C/svg%3E\")",
          backgroundSize: "88px 88px",
        }}
      />

      {/* Top catalogue line */}
      <div className="absolute inset-x-4 top-4 z-10 flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.26em] text-ink/55">
        <span>{badge}</span>
        <span>MF · {catalogue}</span>
      </div>

      {/* Title printed on the sleeve */}
      <div className="absolute inset-x-4 top-1/2 z-10 -translate-y-1/2">
        <p className="font-display text-[1.45rem] leading-[1.12] text-ink">
          {title}
        </p>
      </div>

      {/* Monogram, watermarked */}
      <span
        aria-hidden
        className="absolute bottom-9 right-3 z-0 font-display text-[4.4rem] leading-[0.8] tracking-tight"
        style={{ color: palette.ink, opacity: 0.3 }}
      >
        {initials}
      </span>

      {/* Footer rule + micro caption */}
      <div className="absolute inset-x-4 bottom-4 z-10">
        <div
          aria-hidden
          className="mb-2 h-px w-full"
          style={{ background: `${palette.ink}33` }}
        />
        <div className="flex items-center justify-between font-mono text-[7.5px] uppercase tracking-[0.24em] text-ink/60">
          <span>Capture series</span>
          <span aria-hidden>↗</span>
        </div>
      </div>

      {/* Inner hairline */}
      <div aria-hidden className="pointer-events-none absolute inset-2.5 border border-ink/[0.07]" />
    </div>
  );
}
