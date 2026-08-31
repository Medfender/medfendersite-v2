import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { packs } from "@/data/storeData";

export default function Home() {
  const featured = packs.slice(0, 3);

  return (
    <main className="min-h-screen w-full bg-[url('/images/gallery/Me%20Guitar%203.png')] bg-cover bg-center bg-no-repeat relative">
      {/* Dark overlay — sits in front of the image, behind all content */}
      <div className="absolute inset-0 bg-black/50 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-black/30 z-0" />

      {/* All page content — stacked above the overlay */}
      <div className="relative z-10 flex flex-col">

        {/* 1. Hero */}
        <section className="relative overflow-hidden flex flex-col items-center justify-center text-center px-6 py-32 md:py-40">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white uppercase leading-[0.95] drop-shadow-[0_0_30px_rgba(0,216,246,0.15)]">
            Boutique Tube Tone{" "}
            <span className="text-cyan-400">Reimagined</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-neutral-300 max-w-2xl font-light tracking-wide leading-relaxed">
            Engineered specifically for IK Multimedia ToneX and Line 6 HX Stomp XL / Helix.
          </p>
          <div className="mt-10 flex gap-4 flex-wrap justify-center">
            <Link
              href="/store"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-cyan-400 text-[#0b0f19] font-black text-sm uppercase tracking-[0.15em] shadow-[0_0_20px_rgba(0,216,246,0.35)] hover:shadow-[0_0_30px_rgba(0,216,246,0.55)] hover:scale-[1.03] transition-all"
            >
              EXPLORE STORE <ArrowRight size={16} />
            </Link>
            <Link
              href="/audio"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/10 text-white font-bold text-sm uppercase tracking-[0.15em] hover:border-cyan-400/60 hover:text-cyan-300 transition-all backdrop-blur"
            >
              LISTEN TO SHOWCASE
            </Link>
          </div>
        </section>

        {/* 2. Value Specs Ticker */}
        <section className="bg-zinc-950/80 border-y border-zinc-800">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-6">
            {[
              { label: "Per HX Preset", sub: "4 Snapshots" },
              { label: "ToneX Captures", sub: "Tube Sweet-Spots" },
              { label: "Studio Resolution", sub: "96kHz / 24-Bit" },
              { label: "Universal ZIP", sub: "Instant Download" },
            ].map((s) => (
              <div key={s.label} className="text-center px-4 py-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
                <div className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-1">{s.sub}</div>
                <div className="text-lg font-black tracking-tight text-white">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Featured Packs */}
        <section className="max-w-6xl mx-auto px-6 py-24">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-12 uppercase">Featured Tone Packs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((pack) => (
              <Link
                key={pack.id}
                href={`/store/${pack.slug}`}
                className="group flex flex-col bg-neutral-900 border border-zinc-800 hover:border-cyan-600/60 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.6)] hover:shadow-[0_0_40px_rgba(0,216,246,0.08)] transition-all"
              >
                <div className="relative w-full aspect-square overflow-hidden bg-neutral-950">
                  <div className="w-full h-full" style={{ background: "radial-gradient(ellipse at 30% 40%, rgba(6,182,212,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(0,80,100,0.2) 0%, transparent 50%), linear-gradient(160deg, #0f1318 0%, #0b0f19 100%)" }} />
                </div>
                <div className="p-6 flex flex-col gap-3">
                  <h3 className="text-xl font-black text-white tracking-tight group-hover:text-cyan-300 transition-colors">{pack.title}</h3>
                  <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-cyan-400">
                    <span>{pack.badge}</span><span className="text-zinc-600">•</span><span>HX Stomp</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-2xl font-black text-white">${pack.price.toFixed(2)}</span>
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-950 text-cyan-300 border border-cyan-800">VIEW DETAILS</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. Sound Philosophy Banner */}
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#11161a]/90 to-[#0b0f14]/95 backdrop-blur-xl p-10 md:p-14 shadow-[0_0_60px_rgba(0,216,246,0.08)]">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase mb-6">Sound Philosophy</h2>
            <p className="text-neutral-300 text-lg leading-relaxed mb-6 max-w-3xl">
              Every preset is rigorously tested through gain-staging with real tube amp captures, then balanced for gig-ready tone — not studio-only. We dial for touch, not volume, so your rig responds the way your hands expect.
            </p>
            <Link href="/support/setup-guide" className="inline-flex items-center gap-2 text-cyan-400 font-black uppercase tracking-[0.15em] hover:text-cyan-300 transition-colors">
              SETUP GUIDE <ArrowRight size={16} />
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
