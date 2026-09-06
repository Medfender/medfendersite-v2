'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/* ════════════════════════════════════════════════════
   COPY & ASSETS
═══════════════════════════════════════════════════ */
const MARQUEE_TEXT = 'TONEX CAPTURES • HX STOMP XL PRESETS • HYBRID GNAWA FUSION • CUSTOM IMPULSE RESPONSES •';

const HERO_IMG =
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=2000&q=80';

const PHILOSOPHY_IMGS = [
  'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?auto=format&fit=crop&w=1400&q=80',
];

/* ════════════════════════════════════════════════════
   FRAMER MOTION — staggered mask-reveal variants
═══════════════════════════════════════════════════ */
const wordVariant: any = {
  hidden: { y: '110%', opacity: 0 },
  visible: (i: number) => ({
    y: '0%',
    opacity: 1,
    transition: {
      delay: i * 0.12,
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const fadeUp: any = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.4 + i * 0.15,
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

/* ════════════════════════════════════════════════════
   MARQUEE COMPONENT
═══════════════════════════════════════════════════ */
function Marquee() {
  const { scrollYProgress } = useScroll();
  // Subtle scroll-reactive speed: scroll direction nudges marquee speed
  const speedMult = useTransform(scrollYProgress, [0, 0.3], [1, 0.4]);

  return (
    <div className="relative w-full overflow-hidden border-y border-zinc-900 py-5 bg-[#050505]">
      <motion.div
        className="flex items-center whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          x: { repeat: Infinity, duration: 28, ease: 'linear' },
        }}
        style={{ x: speedMult, willChange: 'transform' }}
      >
        {/* Duplicate for seamless loop */}
        {[...Array(6)].map((_, i) => (
          <span
            key={i}
            className="flex items-center text-[0.7rem] font-black uppercase tracking-[0.22em] text-zinc-600"
          >
            {MARQUEE_TEXT}
            <span className="mx-8 text-amber-500/40">◆</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   HERO SECTION — staggered mask-reveal + parallax img
═══════════════════════════════════════════════════ */
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // Hero image parallax: moves up as user scrolls
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);

  return (
    <section ref={ref} className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#050505]">
      {/* ── Display Text: MEDFENDER (mask-reveal) ── */}
      <div className="relative z-10 flex flex-col items-center px-6 overflow-hidden">
        <div className="overflow-hidden">
          <motion.h1
            className="text-[14vw] font-black tracking-[-0.04em] leading-[0.88] text-white"
            variants={wordVariant}
            initial="hidden"
            animate="visible"
          >
            MEDFENDER
          </motion.h1>
        </div>

        {/* Sub: DIGITAL TONE ARCHITECTURE */}
        <motion.div
          className="overflow-hidden mt-3"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <p className="text-[0.65rem] font-black uppercase tracking-[0.35em] text-[#E5A93C]">
            DIGITAL TONE ARCHITECTURE
          </p>
        </motion.div>
      </div>

      {/* ── Hero image container: parallax on scroll ── */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: imgY }}
      >
        <div className="absolute inset-0 bg-[#050505]/60" />
        <img
          src={HERO_IMG}
          alt="Recording studio console"
          className="w-full h-full object-cover opacity-50"
        />
      </motion.div>

      {/* ── Scroll indicator ── */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={3}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[0.55rem] uppercase tracking-[0.3em] text-zinc-600 font-black">
            SCROLL
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-zinc-600 to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   SOUND PHILOSOPHY — sticky left + scrollable right
═══════════════════════════════════════════════════ */
const cards = [
  {
    num: '01',
    title: 'The Setup',
    body:
      'Integrating the organic feel of analog gear with the precision of digital processors. Every preset begins with a real signal chain — genuine tube preamps, real outboard, physical cab IRs — then distilled into a HX Stomp or TONEX capture that feels indistinguishable from the source.',
    img: PHILOSOPHY_IMGS[0],
  },
  {
    num: '02',
    title: 'The Tone',
    body:
      'Blues, rock, fusion, and Gnawa fusion architecture. We build for how a guitarist actually plays — not how a chart measures. Touch sensitivity, note bloom, harmonic feedback at stage volume. Tone that responds to your hands, not just your fingers.',
    img: PHILOSOPHY_IMGS[1],
  },
  {
    num: '03',
    title: ' The Craft',
    body:
      'Precision audio engineering backed by stem separation, multi-band analysis, and gain-staging at 96kHz / 24-bit. Every impulse response and capture is verified against the original before release. We don\'t ship until the comparison is airtight.',
    img: PHILOSOPHY_IMGS[2],
  },
];

function SoundPhilosophy() {
  return (
    <section className="relative bg-[#050505]">
      {/* Section header */}
      <div className="border-t border-zinc-900 pt-20 pb-12 px-6">
        <p className="text-[0.6rem] font-black uppercase tracking-[0.35em] text-zinc-700">
          SOUND PHILOSOPHY
        </p>
      </div>

      {/* Sticky + scrollable layout */}
      <div className="max-w-7xl mx-auto flex gap-16 px-6 pb-32">
        {/* Left: sticky heading */}
        <div className="w-2/5 sticky top-24 h-fit shrink-0">
          <h2 className="text-4xl md:text-5xl font-black tracking-[-0.02em] leading-[1.05] text-white uppercase">
            Built on trust.
            <br />
            Driven by tone.
          </h2>
          <div className="mt-10 flex flex-col gap-3">
            {cards.map((c) => (
              <div key={c.num} className="flex items-center gap-4 text-zinc-700">
                <span className="text-[0.55rem] font-black tracking-widest">{c.num}</span>
                <div className="h-px flex-1 bg-zinc-900" />
                <span className="text-[0.6rem] font-black uppercase tracking-widest text-zinc-700">
                  {c.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: scrollable cards */}
        <div className="w-3/5 space-y-10 pt-2">
          {cards.map((card, i) => (
            <motion.div
              key={card.num}
              className="group flex gap-8 items-start"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{
                delay: i * 0.1,
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {/* Card text side */}
              <div className="flex-1 pt-2">
                <div className="flex items-center gap-4 mb-5">
                  <span className="text-[0.55rem] font-black tracking-widest text-[#E5A93C]">
                    {card.num}
                  </span>
                  <div className="h-px flex-1 border-t border-zinc-900" />
                </div>
                <h3 className="text-2xl font-black tracking-tight text-white mb-4">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500 max-w-lg">{card.body}</p>
              </div>

              {/* Card image side */}
              <div className="w-64 shrink-0">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950">
                  <img
                    src={card.img}
                    alt={card.title}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/80 to-transparent" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   MASSIVE FOOTER — edge-to-edge wordmark
═══════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-[#050505]">
      {/* Nav row */}
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-8">
        <div className="flex gap-10 text-[0.6rem] font-black uppercase tracking-[0.3em] text-zinc-700">
          <Link href="/store" className="hover:text-white transition-colors duration-200">
            STORE
          </Link>
          <Link href="/audio" className="hover:text-white transition-colors duration-200">
            AUDIO
          </Link>
          <Link href="/support" className="hover:text-white transition-colors duration-200">
            SUPPORT
          </Link>
        </div>
        <Link
          href="mailto:contact@medfender.com"
          className="group flex items-center gap-3 text-[0.6rem] font-black uppercase tracking-[0.3em] text-[#E5A93C] hover:text-amber-300 transition-colors duration-200"
        >
          BOOK A SESSION
          <svg
            className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 6h8M6 2l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>

      {/* Edge-to-edge wordmark */}
      <div className="overflow-hidden border-t border-zinc-900 py-4">
        <h3 className="text-[18vw] font-black tracking-[-0.05em] leading-none text-white uppercase text-center select-none">
          MEDFENDER
        </h3>
      </div>

      {/* Legal */}
      <div className="border-t border-zinc-900 py-5 text-center text-[0.55rem] font-light text-zinc-800 tracking-wider">
        © {new Date().getFullYear()} Medfender — Digital Tone Architecture
      </div>
    </footer>
  );
}

/* ════════════════════════════════════════════════════
   ROOT PAGE
═══════════════════════════════════════════════════ */
export default function Home() {
  return (
    <main className="bg-[#050505] text-white antialiased">
      <Hero />
      <Marquee />
      <SoundPhilosophy />
      <Footer />
    </main>
  );
}
