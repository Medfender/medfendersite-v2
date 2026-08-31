import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Cpu, Headphones, Radio, ShieldCheck, Zap } from "lucide-react";
import { packs } from "@/data/storeData";

export function generateStaticParams() {
  return packs.map((pack) => ({ slug: pack.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const pack = packs.find((p) => p.slug === params.slug);
  return {
    title: pack ? `${pack.title} — Medfender` : "Product — Medfender",
    description: pack?.description ?? "Preset pack details.",
  };
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const pack = packs.find((p) => p.slug === params.slug);
  if (!pack) notFound();

  return (
    <main className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
      {/* ════════════════════════════════════════════════════════════════════
          HERO — UFC MAIN EVENT FIGHT CARD
         ════════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full bg-black border-b border-zinc-900 overflow-hidden">
        {/* Red corner / blue corner ambient tint edges */}
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-cyan-950/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-red-950/20 via-transparent to-transparent pointer-events-none" />

        {/* Top event banner */}
        <div className="relative max-w-6xl mx-auto px-6 md:px-12 pt-10 pb-4 flex items-center justify-between border-b border-zinc-900">
          <Link
            href="/store"
            className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.25em] text-zinc-500 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Card
          </Link>
          <span className="hidden md:inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.25em] text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
            Live · Tone Capture
          </span>
        </div>

        {/* Title block — sits ABOVE the video for max impact */}
        <div className="relative max-w-6xl mx-auto px-6 md:px-12 pt-12 md:pt-16 pb-8">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] rounded bg-zinc-900/80 text-cyan-300 border border-cyan-800/50 mb-6 shadow-[0_0_15px_rgba(0,216,246,0.25)]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00d8f6]" />
              {pack.type} · {pack.badge}
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-[-0.04em] text-white uppercase leading-[0.95] max-w-4xl">
              {pack.title}
            </h1>
            <div className="mt-6 max-w-2xl">
              <p className="text-zinc-300 text-base md:text-lg font-medium leading-relaxed">
                {pack.description}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
              <span>96kHz / 24-bit</span>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span>{pack.tones.length} Captures</span>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span>Instant Download</span>
            </div>
          </div>
        </div>

        {/* Massive YouTube embed — edge-to-edge dark container */}
        <div className="relative max-w-6xl mx-auto px-6 md:px-12 pb-16">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-zinc-800 bg-black shadow-[0_0_80px_rgba(0,216,246,0.1),inset_0_0_60px_rgba(0,0,0,0.9)]">
            {/* Inner bezel highlight */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 pointer-events-none z-10" />
            <iframe
              src={pack.videoDemoUrl}
              title={`${pack.title} Demo Video`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {/* Hardware screws on the bezel — corners */}
          <div className="absolute top-[4.5rem] left-3 md:left-9 w-2 h-2 rounded-full bg-zinc-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)] border border-zinc-900" />
          <div className="absolute top-[4.5rem] right-3 md:right-9 w-2 h-2 rounded-full bg-zinc-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)] border border-zinc-900" />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          MAIN EVENT GRID — TALE OF THE TAPE + CHECKOUT ZONE
         ════════════════════════════════════════════════════════════════════ */}
      <section className="relative max-w-6xl mx-auto w-full px-6 md:px-12 py-20 md:py-28 grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12">
        {/* ────────────── LEFT: TALE OF THE TAPE (3/5 width) ────────────── */}
        <article className="lg:col-span-3 order-2 lg:order-1">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-400">
              Tale of the Tape
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
          </div>

          {/* Spec Sheet Container */}
          <div className="relative rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-950 to-black shadow-[0_0_60px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.04)] overflow-hidden">
            {/* Top status bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/60 bg-zinc-950/80">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse" />
                <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-zinc-500">Status: Verified Capture</span>
              </div>
              <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-zinc-600">SN: {pack.id.toUpperCase()}</span>
            </div>

            {/* Spec rows */}
            <dl className="divide-y divide-zinc-800/40">
              <SpecRow icon={<Cpu size={14} />} label="Platform" value={pack.type} accent />
              <SpecRow icon={<Radio size={14} />} label="Capture Format" value="96kHz / 24-bit WAV" />
              <SpecRow icon={<Headphones size={14} />} label="Total Tones" value={`${pack.tones.length} captures`} />
              <SpecRow icon={<ShieldCheck size={14} />} label="License" value="Royalty-free · Lifetime" />
              <SpecRow icon={<Zap size={14} />} label="Delivery" value="Instant digital download" />
            </dl>

            {/* Captured Gear block — monospace, glowing accents */}
            <div className="px-6 py-6 border-t border-zinc-800/60 bg-black/50">
              <h3 className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-zinc-500 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 shadow-[0_0_8px_#00d8f6]" />
                Captured Gear / Signal Chain
              </h3>
              <ul className="space-y-2.5">
                {pack.includedGear.map((g, i) => (
                  <li
                    key={g}
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800/60 hover:border-cyan-700/50 hover:shadow-[0_0_15px_rgba(0,216,246,0.1)] transition-all"
                  >
                    <span className="shrink-0 w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-mono font-bold text-cyan-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-mono font-bold text-zinc-100 tracking-wide group-hover:text-cyan-100 transition-colors">
                      {g}
                    </span>
                    <Check size={14} className="ml-auto text-cyan-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </li>
                ))}
              </ul>
            </div>

            {/* Tone list */}
            <div className="px-6 py-6 border-t border-zinc-800/60">
              <h3 className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-zinc-500 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 shadow-[0_0_8px_#00d8f6]" />
                Included Tones
              </h3>
              <ul className="space-y-2">
                {pack.tones.map((tone) => (
                  <li
                    key={tone.id}
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-zinc-950/60 border border-zinc-900"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white truncate">{tone.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono tracking-wider truncate">{tone.gearTag}</div>
                    </div>
                    <span className="shrink-0 text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400 px-2 py-1 rounded border border-cyan-900/50 bg-cyan-950/30">
                      {tone.audioUrl ? "WAV" : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>

        {/* ────────────── RIGHT: CHECKOUT ZONE (2/5 width, sticky) ────────────── */}
        <aside className="lg:col-span-2 order-1 lg:order-2 lg:sticky lg:top-28 lg:self-start">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-700/50 to-transparent" />
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-400">
              Checkout Zone
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-700/50 to-transparent" />
          </div>

          <div className="relative rounded-2xl border-2 border-zinc-800 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black shadow-[0_0_80px_rgba(0,0,0,0.95),inset_0_2px_4px_rgba(255,255,255,0.03)] overflow-hidden">
            {/* Top status bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/60 bg-zinc-950/80">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]" />
                <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-zinc-500">On Sale</span>
              </div>
              <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-amber-400/80">Limited</span>
            </div>

            <div className="p-7 md:p-8">
              <span className="inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 mb-5">
                {pack.type}
              </span>
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase leading-tight mb-2">
                {pack.title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">{pack.description}</p>

              {/* PRICE — high-contrast gold/cyan accent */}
              <div className="mb-8 p-5 rounded-xl bg-black/60 border border-amber-900/30 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
                <div className="text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-500 mb-2">One-Time Price</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl md:text-7xl font-black tracking-tighter bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                    ${pack.price.toFixed(2)}
                  </span>
                  <span className="text-zinc-500 text-xs font-mono tracking-widest uppercase">USD</span>
                </div>
                <div className="mt-2 text-[10px] text-zinc-500 font-mono tracking-wider">Instant download · No subscription</div>
              </div>

              {/* ═══ THE TACTILE SWITCH — "GRAB YOUR PACK" ═══ */}
              <a
                href={pack.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block w-full text-center rounded-xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 text-zinc-950 font-black uppercase tracking-[0.18em] text-lg md:text-xl px-6 py-7 cursor-pointer select-none border-t-2 border-amber-200/80 border-b-2 border-amber-700/80 shadow-[0_8px_0_0_rgba(180,83,9,0.7),0_15px_30px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.7),inset_0_-2px_4px_rgba(180,83,9,0.4)] active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.85),0_0_0_0_rgba(180,83,9,0),0_0_25px_rgba(251,191,36,0.4)] active:translate-y-[2px] transition-all duration-75 hover:from-amber-200 hover:via-amber-300 hover:to-amber-500"
                aria-label={`Buy ${pack.title} for $${pack.price.toFixed(2)}`}
              >
                {/* LED indicator */}
                <span className="absolute top-2 right-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                </span>
                <span className="block">Grab Your Pack</span>
                <span className="block text-[9px] font-mono tracking-[0.3em] opacity-70 mt-1">Engage Checkout</span>
              </a>

              <p className="text-center text-[10px] text-zinc-600 font-mono tracking-[0.2em] uppercase mt-5">
                Secure checkout · 30-day refund
              </p>

              {/* Trust badges */}
              <div className="mt-6 grid grid-cols-3 gap-2">
                <TrustBadge label="Instant" />
                <TrustBadge label="Verified" />
                <TrustBadge label="Royalty-Free" />
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

/* ──────────── Subcomponents ──────────── */

function SpecRow({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-zinc-950/60 transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-cyan-400/80 shrink-0">{icon}</span>
        <dt className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500">{label}</dt>
      </div>
      <dd
        className={[
          "text-sm font-bold text-right",
          accent ? "text-cyan-300 drop-shadow-[0_0_8px_rgba(0,216,246,0.3)]" : "text-white",
        ].join(" ")}
      >
        {value}
      </dd>
    </div>
  );
}

function TrustBadge({ label }: { label: string }) {
  return (
    <div className="text-center px-2 py-2 rounded-md border border-zinc-800/60 bg-zinc-950/60">
      <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-zinc-500 leading-tight">{label}</div>
    </div>
  );
}
