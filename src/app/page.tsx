'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { packs } from '@/data/storeData';

const featured = packs.slice(0, 3);

// Placeholder image URLs (Unsplash)
const HERO_PLACEHOLDER = 'https://images.unsplash.com/photo-1593780876795-3dc5b2c1f5af?crop=edges&fit=crop&w=2400&h=1600';
const PACK_IMAGES = [
  'https://images.unsplash.com/photo-1606220844189-ba2a4596f180?crop=edges&fit=crop&w=1200&h=1200',
  'https://images.unsplash.com/photo-1612579064455-2c5c31e2c3a5?crop=edges&fit=crop&w=1200&h=1200',
  'https://images.unsplash.com/photo-1593780876803-7b9f5a0e2e9e?crop=edges&fit=crop&w=1200&h=1200',
];
const PHILOSOPHY_IMAGES = [
  'https://images.unsplash.com/photo-1593780876795-3dc5b2c1f5af?crop=edges&fit=crop&w=1600&h=900',
  'https://images.unsplash.com/photo-1606220844189-ba2a4596f180?crop=edges&fit=crop&w=1600&h=900',
  'https://images.unsplash.com/photo-1612579064455-2c5c31e2c3a5?crop=edges&fit=crop&w=1600&h=900',
];

const MARQUEE_TEXT = 'ENGINEERED FOR TONEX  •  HX STOMP  •  HELIX  •  BOUTIQUE TUBE TONE  •  PREMIUM CAPTURES';

export default function Home() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ['start start', 'end start'] });

  // Hero media scale: 1 (hero) → 1.3 (zoom out as scrolled past)
  const mediaScale = useTransform(scrollYProgress, [0, 0.6], [1, 1.3]);
  // Hero text: fully opaque/slide-up at top, fade/slide-down past threshold
  const titleOpacity = useTransform(scrollYProgress, [0, 0.35, 0.55], [1, 0.92, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);

  return (
    <main className="bg-[#050505] text-white font-mono tracking-tight text-xs">
      {/* ════════════════════════════════════════════════════
           HERO SECTION — Cinematic, scroll-driven scale
           Hero media expands + text fades as user scrolls down.
      ════════════════════════════════════════════════════ */}
      <section
        ref={targetRef}
        className="relative h-screen w-full flex items-center justify-center overflow-hidden"
      >
        {/* Animated media container — scales up as scroll descends */}
        <motion.div
          style={{ scale: mediaScale }}
          className="absolute inset-0 z-0"
        >
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: `url('${HERO_PLACEHOLDER}')` }}
          />
          {/* Dark radial overlay for hero text legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/70 via-transparent to-[#050505]/90" />
        </motion.div>

        {/* Hero title — fades/slides as scroll progresses */}
        <div className="relative z-10 text-center pointer-events-none">
          <motion.h1
            style={{ opacity: titleOpacity, y: titleY }}
            className="text-[5rem] md:text-[7vw] font-black tracking-[-0.03em] uppercase leading-[0.92] text-white"
          >
            BOUTIQUE TUBE TONE
          </motion.h1>
          <motion.p
            style={{ opacity: titleOpacity }}
            className="mt-8 text-lg md:text-xl text-neutral-400 font-light tracking-[0.1em] uppercase"
          >
            Engineered for ToneX • HX Stomp • Helix
          </motion.p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
           MARQUEE — Kinetic typography, scroll-driven
      ════════════════════════════════════════════════════ */}
      <div className="w-full overflow-hidden bg-black border-y border-neutral-800 py-3">
        <motion.div
          className="flex items-center whitespace-nowrap text-[0.65rem] md:text-[0.75rem] font-black uppercase tracking-[0.2em] text-neutral-400"
          // Scroll-driven horizontal movement
          style={{ x: useTransform(scrollYProgress, [0, 1], [0, -200]) }}
        >
          <span>{MARQUEE_TEXT}</span>
          <span className="mx-6 text-neutral-700">●</span>
          <span>{MARQUEE_TEXT}</span>
        </motion.div>
      </div>

      {/* ════════════════════════════════════════════════════
           TONE PACKS GRID — Studio style
      ════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-black tracking-[-0.02em] text-white mb-12">
          Featured Tone Packs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featured.map((pack, i) => (
            <Link key={pack.id} href={`/store/${pack.slug}`}>
              <motion.div
                className="group relative bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden transition-all duration-500"
                whileHover={{ borderColor: 'rgba(255,255,255,0.15)' }}
              >
                {/* Premium image container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-950 rounded-t-3xl">
                  <motion.img
                    src={PACK_IMAGES[i % PACK_IMAGES.length]}
                    alt={pack.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-transparent to-transparent" />
                </div>

                {/* Subtle card footer */}
                <div className="p-6 border-t border-neutral-800">
                  <h3 className="text-xl font-black text-white tracking-tight group-hover:text-neutral-200 transition-colors">
                    {pack.title}
                  </h3>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-neutral-500">
                      {pack.badge}
                    </span>
                    <motion.span
                      className="inline-flex items-center text-neutral-300 group-hover:text-white transition-colors"
                      initial={{ x: 0, opacity: 0.6 }}
                      whileHover={{ x: 6, opacity: 1 }}
                    >
                      VIEW DETAILS
                      <ArrowRight className="ml-2 w-3 h-3" />
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
           SOUND PHILOSOPHY — Sticky left header, scrolling
           right column with image/text blocks
      ════════════════════════════════════════════════════ */}
      <section className="relative py-24 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto flex gap-12 px-6">
          {/* Left column: sticky heading */}
          <div className="w-1/3 sticky top-20 h-fit pt-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.02em] text-white uppercase">
              Built on trust. <br />Driven by tone.
            </h2>
            <div className="mt-8 w-px h-32 bg-neutral-800" />
          </div>

          {/* Right column: scrollable blocks */}
          <div className="w-2/3 space-y-24 pb-12">
            {PHILOSOPHY_IMAGES.map((img, idx) => (
              <div key={idx} className="flex items-center gap-8">
                <div className="w-1/2">
                  <div className="aspect-[3/2] rounded-3xl overflow-hidden border border-neutral-800">
                    <img src={img} alt={`Philosophy ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="w-1/2">
                  <h3 className="text-xl font-black text-white mb-3">
                    {idx === 0
                      ? 'Real tube captures'
                      : idx === 1
                        ? 'Touch-responsive gain staging'
                        : 'Gig-ready presence'}
                  </h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    Every preset is rigorously tested through gain-staging with real
                    tube amp captures, then balanced for gig-ready tone — not studio-only.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
           FOOTER — Massive wordmark
      ════════════════════════════════════════════════════ */}
      <footer className="py-16 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-end">
          {/* Nav links above wordmark */}
          <div className="flex gap-8 text-[0.65rem] font-black uppercase tracking-[0.25em] text-neutral-500">
            <Link href="/store" className="hover:text-white transition-colors">STORE</Link>
            <Link href="/audio" className="hover:text-white transition-colors">AUDIO</Link>
            <Link href="/support" className="hover:text-white transition-colors">SUPPORT</Link>
          </div>

          {/* Massive "MEDFENDER" wordmark */}
          <h3 className="text-[3rem] md:text-[5vw] font-black tracking-[-0.04em] text-white uppercase leading-none">
            MEDFENDER
          </h3>
        </div>
        <div className="mt-4 border-t border-neutral-900 pt-4 text-center text-[0.65rem] font-light text-neutral-600">
          © {new Date().getFullYear()} Medfender. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
