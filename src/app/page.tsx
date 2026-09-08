'use client';

import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';

/* ════════════════════════════════════════════════════
   COPY & ASSETS
═══════════════════════════════════════════════════ */
/* ════════════════════════════════════════════════════
   MARQUEE DATA
═══════════════════════════════════════════════════ */
const marqueeItems = [
  { label: 'TONEX CAPTURES', href: '/store/tonex', accent: 'NEW' },
  { label: 'HX STOMP XL PRESETS', href: '/store/hx-stomp', accent: null },
  { label: 'HYBRID GNAWA FUSION', href: '/store/gnawa', accent: null },
  { label: 'CUSTOM IMPULSE RESPONSES', href: '/store/irs', accent: 'NEW' },
  { label: 'AMP PROFILES', href: '/store/profiles', accent: null },
  { label: 'STOMP RIGS', href: '/store/stomps', accent: null },
  { label: 'STUDIO SESSIONS', href: '/store/sessions', accent: 'NEW' },
];

const MARQUEE_TEXT = 'TONEX CAPTURES • HX STOMP XL PRESETS • HYBRID GNAWA FUSION • CUSTOM IMPULSE RESPONSES •';

const HERO_IMG = '/images/gallery/hero-cropped.jpg';

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
  const tripleItems = [...marqueeItems, ...marqueeItems, ...marqueeItems];

  return (
    <div className="relative w-full overflow-hidden border-y border-zinc-900 py-6 bg-[#050505] group">
      {/* Edge fades for cinematic entry/exit */}
      <div className="pointer-events-none absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-[#050505] to-transparent z-10" />
      <div className="pointer-events-none absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[#050505] to-transparent z-10" />

      <style jsx>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee-scroll 18s linear infinite;
          will-change: transform;
        }
        .group:hover .marquee-track {
          animation-play-state: paused;
        }
      `}</style>

      <div className="marquee-track flex items-center whitespace-nowrap w-max">
        {tripleItems.map((item, i) => (
          <span key={i} className="flex items-center shrink-0">
            {item.accent && (
              <span
                className={[
                  "mr-3 px-2 py-0.5 text-[0.55rem] font-black uppercase tracking-widest",
                  item.accent === 'NEW'
                    ? "bg-[#E5A93C] text-black"
                    : "border border-zinc-700 text-zinc-500"
                ].join(" ")}
              >
                {item.accent}
              </span>
            )}
            <Link
              href={item.href}
              className="text-[0.85rem] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-[#E5A93C] transition-colors duration-200"
            >
              {item.label}
            </Link>
            {/* Vertical separator */}
            <span className="mx-8 w-px h-4 bg-zinc-800 shrink-0" aria-hidden="true" />
          </span>
        ))}
      </div>
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

  // Parallax disabled to preserve natural image framing at scroll=0
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '0%']);

  return (
    <section ref={ref} className="relative w-full overflow-hidden bg-[#050505] pt-0 mt-0 mb-0 pb-0">
      {/* Natural hero image — full width, no forced crop */}
      <div className="relative w-full mb-0 pb-0 h-auto">
        <img
          src={HERO_IMG}
          alt="Medfender sound architecture stage"
          className="w-full h-auto block"
        />
        {/* Top gradient fade overlay */}
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none z-10" />
        {/* Top gradient removed — image renders fully clear */}
      </div>

      {/* Marquee preset string flush to hero image bottom */}

    </section>
  );
}

import { useCart } from '@/lib/CartContext';
import { packs } from '@/data/storeData';

/* ════════════════════════════════════════════════════
   PRESET CARD — compact audio preview card
═══════════════════════════════════════════════════ */
interface Preset {
  id: string;
  title: string;
  genre: string;
  price: string;
  href: string;
  img?: string;
  tracks?: { id: string; title: string; duration: string }[];
}

const presets: Preset[] = [
  {
    id: 'gnawa-blues-deluxe',
    title: 'GNAWA BLUES DELUXE',
    genre: 'Blues / Fusion',
    price: '$29',
    href: '/store/gnawa-blues-deluxe',
    img: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=200&q=80',
    tracks: [
      { id: '001', title: 'GNAWA LEAD & FUSION CLEAN', duration: '1:48' },
      { id: '002', title: 'TUBE CRUNCH RHYTHM DEMO', duration: '2:15' },
      { id: '003', title: 'SOLO BOOST & REVERB CAB', duration: '1:32' },
    ],
  },
  {
    id: 'tube-crunch-studio',
    title: 'TUBE CRUNCH STUDIO',
    genre: 'Rock / Crunch',
    price: '$24',
    href: '/store/tube-crunch-studio',
    img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=200&q=80',
    tracks: [
      { id: '001', title: 'HEAVY CRUNCH RHYTHM BREAK', duration: '1:55' },
      { id: '002', title: 'CLEAN TWIN ROLL', duration: '2:05' },
      { id: '003', title: 'STAGE REVERB SWELL', duration: '1:42' },
    ],
  },
];

function PlayIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2.5v11l10-5.5L3 2.5z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
      <rect x="2" y="2" width="8" height="8" rx="1" />
    </svg>
  );
}

function PresetCard({ preset, isLastAdded, onPresetSelect }: { preset: Preset; isLastAdded?: boolean; onPresetSelect?: (p: any) => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAdded, setShowAdded] = useState(false);
  const { addToCart } = useCart();

  // Map preset to closest PackData for cart integration
  const packForCart = packs.find(
    (pk) => pk.title === preset.title || pk.slug.includes(preset.title.toLowerCase().replace(/\s+/g, '-'))
  ) || {
    id: preset.href,
    slug: preset.href,
    title: preset.title,
    price: parseFloat(preset.price.replace('$', '')) || 0,
    badge: preset.genre,
    type: 'TONEX' as const,
    description: preset.title,
    toneModels: [],
    tones: [],
  } as any;

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-3 w-full flex flex-col">
      {/* Thumbnail + info row */}
      <div className="flex gap-3 items-start">
        <div className="w-16 h-16 shrink-0 rounded-md bg-zinc-800 border border-zinc-700 overflow-hidden">
          <img
            src={preset.img || '/images/gallery/hero-cropped.jpg'}
            alt={preset.title}
            className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-300"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-tight text-white leading-tight truncate">
            {preset.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[0.55rem] font-medium text-zinc-400 uppercase tracking-wider">{preset.genre}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm font-black text-[#E5A93C]">{preset.price}</p>
            <button
              onClick={() => {
                addToCart(packForCart);
                setShowAdded(true);
                setTimeout(() => setShowAdded(false), 2000);
              }}
              className="text-[0.55rem] font-black uppercase tracking-widest bg-[#E5A93C] hover:bg-[#d4942e] text-black px-2.5 py-0.5 rounded-md border border-[#E5A93C]/30 hover:border-[#E5A93C]/60 transition-all duration-200 shadow-[0_0_6px_rgba(229,169,60,0.15)] hover:shadow-[0_0_10px_rgba(229,169,60,0.35)]"
            >
              {showAdded ? 'ADDED ✓' : 'ADD'}
            </button>
            {isLastAdded && (
              <Link
                href="/checkout"
                aria-label="Checkout"
                className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/50 hover:border-zinc-600 text-[#00d8f6] hover:text-[#00d8f6]/90 transition-colors duration-200"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="5" cy="12" r="1.5" />
                  <circle cx="11" cy="12" r="1.5" />
                  <path d="M2 2h2.5l1.5 7h7l1.5-3H5.5" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mini-player */}
      <button
        onClick={() => onPresetSelect?.(preset)}
        className="flex items-center justify-between w-full bg-zinc-900/50 p-2 rounded-lg mt-3 border border-zinc-700/30 hover:border-zinc-600/50 transition-colors duration-200"
      >
        <span className="text-[0.6rem] font-black uppercase tracking-widest text-zinc-300">
          {isPlaying ? 'STOP PREVIEW' : 'PLAY PREVIEW'}
        </span>
        {isPlaying ? <StopIcon /> : <PlayIcon />}
      </button>

      {/* Bottom action buttons */}
      <div className="flex gap-2 w-full mt-auto pt-3">
        <Link
          href="/store"
          className="group/explore flex-1 relative inline-flex items-center justify-center gap-1.5 py-1.5 text-[0.6rem] font-black uppercase tracking-widest bg-zinc-800/60 hover:bg-zinc-700/60 border border-zinc-700/50 text-zinc-300 rounded-lg transition-all duration-200 overflow-hidden"
        >
          <span className="relative z-10">EXPLORE</span>
          <svg className="relative z-10 w-3 h-3 transition-transform duration-200 group-hover/explore:translate-x-0.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 6h8M7 3l3 3-3 3" />
          </svg>
          <span className="absolute inset-0 -translate-x-full group-hover/explore:translate-x-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transition-transform duration-500" />
        </Link>
        <Link
          href={`${preset.href}#details`}
          className="group/details flex-1 relative inline-flex items-center justify-center gap-1.5 py-1.5 text-[0.6rem] font-black uppercase tracking-widest bg-[#00d8f6]/10 hover:bg-[#00d8f6]/20 border border-[#00d8f6]/30 text-[#00d8f6] rounded-lg transition-all duration-200 overflow-hidden"
        >
          <span className="relative z-10">DETAILS</span>
          <span className="absolute inset-0 bg-[#00d8f6]/0 group-hover/details:bg-[#00d8f6]/5 transition-colors duration-200" />
        </Link>
      </div>
    </div>
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
  {
    num: '04',
    title: 'The Stage',
    body: 'Translating studio-grade tone to the live environment. Whether it is an intimate solo arrangement or a high-energy Gnawa fusion trio, the digital architecture is built to cut through the mix, adapt to any venue, and command the room.',
    img: '/images/gallery/So Lounge.JPG',
  },
];

function SoundPhilosophy({ onPresetSelect }: { onPresetSelect: (preset: any) => void }) {
  const scrollRef = useRef(null);
  const isInView = useInView(scrollRef, { once: true, margin: "0px 0px -20% 0px" });
  const { itemCount, cartItems } = useCart();
  const [showNotif, setShowNotif] = useState(false);
  const prevCount = useRef(itemCount);

  // Show notification when cart gains an item, auto-hide after 2.5s
  useEffect(() => {
    if (itemCount > prevCount.current) {
      setShowNotif(true);
      const t = setTimeout(() => setShowNotif(false), 2500);
      return () => clearTimeout(t);
    }
    prevCount.current = itemCount;
  }, [itemCount]);

  // Determine which preset was last added to cart
  const lastAddedId = cartItems.length > 0 ? cartItems[cartItems.length - 1].pack.id : null;

  return (
    <section className="relative bg-[#050505] border-t-0 border-zinc-900 pt-0 pb-24 mt-0">
      {/* Sticky + scrollable layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 px-6 py-24">
        {/* Left: outer grid cell — stretches full height */}
        <div className="lg:col-span-5 relative h-full">
          {/* Inner sticky wrapper */}
          <div className="sticky top-24 space-y-6">
            <p className="text-[0.6rem] font-black uppercase tracking-[0.35em] text-[#E5A93C] mb-4">
              SOUND PHILOSOPHY
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.02em] leading-[1.05] text-white uppercase">
              Built on trust.
              <br />
              Driven by tone.
            </h2>
            <div className="mt-10 flex flex-col gap-3">
              {cards.map((c) => (
                <div key={c.num} className="flex items-center gap-4 text-zinc-400">
                  <span className="text-[0.55rem] font-black tracking-widest">{c.num}</span>
                  <div className="h-px flex-1 bg-zinc-900" />
                  <span className="text-[0.6rem] font-black uppercase tracking-widest text-zinc-400">
                    {c.title}
                  </span>
                </div>
              ))}
            </div>
            {/* Notification banner — cart confirmation */}
            <div
              className={`mb-3 flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-2.5 transition-all duration-300 ${
                showNotif ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5A93C] animate-pulse" />
              <p className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-300">
                Added to your cart — <span className="text-[#E5A93C]">presets ready for checkout</span>
              </p>
            </div>

            {/* Two preset cards — below index list */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              {presets.map((p) => (
                <PresetCard
                  key={p.id}
                  preset={p}
                  isLastAdded={!!(p.id === lastAddedId || (lastAddedId && p.href.includes(lastAddedId)))}
                  onPresetSelect={onPresetSelect}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: scrollable cards */}
        <div ref={scrollRef} className="lg:col-span-7 space-y-24">
          {cards.map((card, i) => (
            <motion.div
              key={card.num}
              className="group flex gap-8 items-start min-h-[200px] pt-0 mt-0"
              initial={false}
              animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: 60, y: 40 }}
              transition={{
                duration: 0.7,
                delay: i * 0.15,
                ease: [0.21, 0.47, 0.32, 0.98],
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
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/30 to-transparent" />
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
   FOOTER — premium audio-studio footer (glass + cyan/gold)
═══════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="relative w-full overflow-hidden bg-[#0b0f19] text-white">
      {/* Top hairline + glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00d8f6]/40 to-transparent" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00d8f6]/[0.08] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-10">
        {/* Main grid: brand + nav + newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Brand column */}
          <div className="md:col-span-4 space-y-6">
            <Link href="/" className="inline-block group">
              <span className="block text-3xl font-black tracking-tighter uppercase leading-none text-white group-hover:text-[#00d8f6] transition-colors duration-300">
                Medfender
              </span>
              <span className="block text-[0.65rem] font-black uppercase tracking-[0.35em] text-zinc-500 mt-2 group-hover:text-[#E5A93C] transition-colors duration-300">
                Sound Architecture
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-zinc-400 max-w-xs">
              Analog precision meets digital architecture. Presets, impulse captures, and live session tone — engineered for the stage.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {[
                { label: 'Instagram', href: 'https://www.instagram.com/medfender', icon: 'instagram' },
                { label: 'YouTube', href: 'https://www.youtube.com/@medfenderchannel7634', icon: 'youtube' },
                { label: 'SoundCloud', href: 'https://soundcloud.com/med-hamza-798230889', icon: 'soundcloud' },
              ].map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-zinc-800 bg-zinc-900/40 flex items-center justify-center text-zinc-400 hover:text-[#00d8f6] hover:border-[#00d8f6]/50 hover:bg-[#00d8f6]/5 transition-all duration-200"
                  title={s.label}
                >
                  {s.icon === 'instagram' && (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>
                  )}
                  {s.icon === 'youtube' && (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75,15.02 15.5,11.75 9.75,8.48" fill="currentColor" stroke="none"/></svg>
                  )}
                  {s.icon === 'soundcloud' && (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 8.5a6.5 6.5 0 0 1 6.5 0v7a6.5 6.5 0 0 1-6.5 0v-7z"/><path d="M7.5 10.5a6.5 6.5 0 0 1 6.5 0v5a6.5 6.5 0 0 1-6.5 0v-5z"/><path d="M14 12.5a6.5 6.5 0 0 1 6.5 0v3a6.5 6.5 0 0 1-6.5 0v-3z"/><path d="M21 14a4 4 0 0 1-2 3.5"/></svg>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation columns */}
          <div className="md:col-span-3 md:col-start-6">
            <h4 className="text-[0.55rem] font-black uppercase tracking-[0.3em] text-[#E5A93C] mb-5">Explore</h4>
            <nav className="flex flex-col gap-3">
              {[
                { label: 'Audio Sessions', href: '/audio' },
                { label: 'Store & Presets', href: '/store' },
                { label: 'Media & Studio', href: '/media' },
                { label: 'Contact & Setup', href: '/contact' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-zinc-300 hover:text-white hover:translate-x-1 transition-all duration-200 w-fit"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-[0.55rem] font-black uppercase tracking-[0.3em] text-[#E5A93C] mb-5">Store</h4>
            <nav className="flex flex-col gap-3">
              {[
                { label: 'TONEX Captures', href: '/store/tonex' },
                { label: 'HX Stomp Presets', href: '/store/hx-stomp' },
                { label: 'GNAWA Fusion', href: '/store/gnawa' },
                { label: 'Custom Impulse', href: '/store/irs' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-zinc-300 hover:text-white hover:translate-x-1 transition-all duration-200 w-fit"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Newsletter / CTA */}
          <div className="md:col-span-2 md:col-start-11">
            <h4 className="text-[0.55rem] font-black uppercase tracking-[0.3em] text-[#E5A93C] mb-5">Stay Tuned</h4>
            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">New captures, preset drops, and session announcements — direct to inbox.</p>
            <form
              onSubmit={(e) => { e.preventDefault(); }}
              className="flex flex-col gap-2"
            >
              <input
                type="email"
                placeholder="your@email.com"
                aria-label="Email for newsletter"
                className="w-full px-3 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-lg text-xs font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00d8f6]/60 focus:ring-1 focus:ring-[#00d8f6]/20 transition-all duration-200"
              />
              <button
                type="submit"
                className="w-full px-3 py-2.5 bg-[#00d8f6] hover:bg-[#00b0d4] text-black text-[0.65rem] font-black uppercase tracking-widest rounded-lg transition-colors duration-200 shadow-[0_0_15px_rgba(0,216,246,0.25)] hover:shadow-[0_0_20px_rgba(0,216,246,0.35)]"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar: legal + back-to-top */}
        <div className="mt-16 pt-8 border-t border-zinc-900/60 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6 text-[0.6rem] font-bold tracking-widest text-zinc-600 uppercase">
            <span>© 2026 Medfender</span>
            <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms</Link>
            <Link href="/support/setup-guide" className="hover:text-zinc-400 transition-colors">Setup Guide</Link>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
            className="group flex items-center gap-2 text-[0.6rem] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-[#00d8f6] transition-colors duration-200"
          >
            Back to top
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-zinc-800 group-hover:border-[#00d8f6]/50 bg-zinc-900/40 group-hover:bg-[#00d8f6]/10 transition-all duration-200">
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 10V2M2 6l4-4 4 4"/></svg>
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}

/* ════════════════════════════════════════════════════
   AMBIENT IDLE VISUALIZER — cursor inactivity overlay
═══════════════════════════════════════════════════ */
function AmbientVisualizer({ title, isPlaying }: { title: string; isPlaying: boolean }) {
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    if (!isPlaying) { setIsIdle(false); return; }
    let timer: ReturnType<typeof setTimeout>;
    const handleMouseMove = () => {
      setIsIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIsIdle(true), 3000);
    };
    window.addEventListener('mousemove', handleMouseMove);
    timer = setTimeout(() => setIsIdle(true), 3000);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timer);
    };
  }, [isPlaying]);

  return (
    <AnimatePresence>
      {isPlaying && isIdle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center pointer-events-none"
        >
          {/* Rotating radial ring */}
          <motion.svg
            className="w-48 h-48 mb-10"
            viewBox="0 0 200 200"
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          >
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const r1 = 70 + (i % 3) * 18;
              const r2 = r1 + 12;
              const x1 = 100 + r1 * Math.cos(rad);
              const y1 = 100 + r1 * Math.sin(rad);
              const x2 = 100 + r2 * Math.cos(rad);
              const y2 = 100 + r2 * Math.sin(rad);
              return (
                <motion.line
                  key={angle}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={i % 2 === 0 ? '#E5A93C' : '#00d8f6'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
                />
              );
            })}
          </motion.svg>

          <p className="font-black uppercase tracking-[0.4em] text-[11px] text-zinc-500 mb-3">PLAYING NOW</p>
          <p className="font-black uppercase tracking-[0.3em] text-sm text-white mb-2 text-center px-4">{title}</p>
          <p className="font-black uppercase tracking-[0.4em] text-[10px] text-zinc-600">MEDFENDER TONE ARCHITECTURE</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ════════════════════════════════════════════════════
   IN-PAGE TRACKLIST — michaelgatt-style expandable list
═══════════════════════════════════════════════════ */
const TRACK_BARS = 36;
const trackWaveforms: Record<string, number[]> = {};
function getTrackWave(id: string): number[] {
  if (!trackWaveforms[id]) {
    trackWaveforms[id] = Array.from({ length: TRACK_BARS }, (_, i) => {
      const p = i / (TRACK_BARS - 1);
      return Math.max(3, Math.min(28, 8 + Math.sin(p * Math.PI) * 12 + Math.sin(p * Math.PI * 4) * 4 + (Math.random() - 0.5) * 5));
    });
  }
  return trackWaveforms[id];
}

function ExpandedTracklist({
  demo,
  playingTrackId,
  onTrackToggle,
  onClose,
  onSeek,
  expandedTrackId: expandedTrackIdProp,
  currentTime = 0,
}: {
  demo: any;
  playingTrackId: string | null;
  onTrackToggle: (id: string) => void;
  onClose: () => void;
  onSeek?: (trackId: string, time: number) => void;
  expandedTrackId?: string | null;
  currentTime?: number;
}) {
  const [internalExpandedId, setInternalExpandedId] = useState<string | null>(null);
  const expandedTrackId = expandedTrackIdProp ?? internalExpandedId;

  const WAVEFORM_BARS = 250;

  // Seeded pseudo-random heights for realistic amplitude peaks
  function seededRandom(seed: number): number {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  }

  function getWaveHeights(id: string): number[] {
    const seed = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return Array.from({ length: WAVEFORM_BARS }, (_, i) => {
      const r = seededRandom(seed * 1000 + i);
      const peak = 0.2 + r * 0.8; // 20%–100% height variation
      const trans = seededRandom(seed * 3000 + i) > 0.88 ? 0.3 : 1; // transient dips
      return Math.round(peak * trans * 100);
    });
  }

  const tracks = demo.tracks || [];

  function handleTrackClick(trackId: string) {
    setInternalExpandedId(trackId);
    onTrackToggle(trackId);
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="border-t border-zinc-900 bg-[#050505]"
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-[0.55rem] font-black uppercase tracking-[0.25em] text-[#E5A93C]">DEMO TRACKS</span>
            <span className="text-zinc-800">|</span>
            <span className="text-[0.55rem] font-black uppercase tracking-[0.25em] text-zinc-500">{demo.title}</span>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center transition-colors"
            aria-label="Close tracklist"
          >
            <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2.5 2.5l5 5M7.5 2.5l-5 5"/></svg>
          </button>
        </div>

        {/* Track rows */}
        <div className="space-y-1">
          {tracks.map((track: any, idx: number) => {
            const isPlaying = track.id === playingTrackId;
            const isExpanded = expandedTrackId === track.id;
            const dur = (() => {
              const [m, s] = (track.duration || '1:34').split(':').map(Number);
              return (m || 1) * 60 + (s || 34);
            })();
            const progressPct = Math.min(100, Math.max(0, (currentTime / dur) * 100));

            return (
              <div
                key={track.id}
                className="w-full flex flex-col py-6 border-b border-zinc-900/50 last:border-0 transition-all duration-500"
              >
                {/* Top control bar — 3-column grid, edge-to-edge */}
                <div className="w-full grid grid-cols-3 items-center">
                  <div className="flex items-center gap-6 md:gap-12">
                    <span className="text-[10px] font-mono tracking-[0.4em] text-zinc-600">{String(idx + 1).padStart(3, '0')}</span>
                    <span className={`text-sm md:text-lg font-light tracking-[0.3em] uppercase transition-colors ${isPlaying ? 'text-white' : isExpanded ? 'text-zinc-200' : 'text-zinc-500'}`}>
                      {track.title}
                    </span>
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleTrackClick(track.id)}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                      className="w-12 h-12 rounded-full border border-zinc-600 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white transition-all duration-300"
                    >
                      {isPlaying ? (
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M10 9v6m4-6v6" /></svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 ml-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2.5v11l9-5.5L4 2.5z"/></svg>
                      )}
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <span className="text-[10px] font-mono tracking-[0.4em] text-zinc-600">{isPlaying ? '0:42 / 1:34' : `${track.duration} / 1:34`}</span>
                  </div>
                </div>

                {/* Waveform — visible for EXPANDED track, regardless of play/pause */}
                {isExpanded && (
                  <div
                    className="w-full h-12 relative flex items-center justify-between mt-6 cursor-pointer"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const pct = Math.max(0, Math.min(1, clickX / rect.width));
                      onSeek?.(track.id, pct * dur);
                    }}
                  >
                    {/* 250 hyper-dense, 1px wide bars */}
                    <div className="flex items-center justify-between w-full h-full">
                      {getWaveHeights(track.id).map((h, i) => {
                        const barPct = (i / WAVEFORM_BARS) * 100;
                        const played = barPct <= progressPct;
                        return (
                          <div
                            key={i}
                            className={`w-[1px] rounded-none transition-colors duration-75 ${played ? 'bg-zinc-300' : 'bg-zinc-800'}`}
                            style={{ height: `${Math.max(15, h)}%` }}
                          />
                        );
                      })}
                    </div>
                    {/* Razor playhead */}
                    <div
                      className="absolute top-0 bottom-0 w-[1px] bg-white z-10 pointer-events-none transition-all duration-75"
                      style={{ left: `${progressPct}%`, boxShadow: '0 0 4px rgba(255,255,255,0.7)' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════
   ROOT PAGE
═══════════════════════════════════════════════════ */
export default function Home() {
  const [activeDemo, setActiveDemo] = useState<any | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [trackProgress, setTrackProgress] = useState({ id: '', time: 0, dur: 94 });

  // Simulate progress ticker when a track is playing
  useEffect(() => {
    if (!playingTrackId) return;
    const interval = setInterval(() => {
      setTrackProgress(p => {
        if (p.id !== playingTrackId) return { id: playingTrackId, time: 0, dur: 94 };
        const next = p.time + 0.8;
        return { ...p, time: next > p.dur ? 0 : next };
      });
    }, 800);
    return () => clearInterval(interval);
  }, [playingTrackId]);

  const handleTrackToggle = (trackId: string) => {
    setPlayingTrackId(prev => prev === trackId ? null : trackId);
  };

  const handleSeek = (trackId: string, time: number) => {
    setTrackProgress(p => ({ id: trackId, time, dur: 94 }));
  };

  const handleClose = () => {
    setActiveDemo(null);
    setPlayingTrackId(null);
    setTrackProgress({ id: '', time: 0, dur: 94 });
  };

  const playingTrack = activeDemo?.tracks?.find((t: any) => t.id === playingTrackId);

  return (
    <main className="bg-zinc-950 text-white antialiased flex flex-col gap-0 space-y-0">
      <Hero />
      <Marquee />
      <SoundPhilosophy onPresetSelect={(preset: any) => {
        setActiveDemo(preset);
        setPlayingTrackId(null);
      }} />

      {/* In-page expandable tracklist */}
      <AnimatePresence>
        {activeDemo !== null && (
          <ExpandedTracklist
            demo={activeDemo}
            playingTrackId={playingTrackId}
            onTrackToggle={handleTrackToggle}
            onClose={handleClose}
            onSeek={handleSeek}
            currentTime={trackProgress.id === playingTrackId ? trackProgress.time : 0}
          />
        )}
      </AnimatePresence>

      <Footer />

      {/* Ambient idle visualizer */}
      {playingTrackId && (
        <AmbientVisualizer
          title={playingTrack?.title || activeDemo?.title || ''}
          isPlaying={true}
        />
      )}
    </main>
  );
}
