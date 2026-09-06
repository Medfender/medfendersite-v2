'use client';

import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

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

const HERO_IMG = '/images/gallery/IMG_7742.JPG';

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

  // Hero image parallax: moves up as user scrolls
  const imgY = useTransform(scrollYProgress, [0, 1], ['-10%', '8%']);

  return (
    <section ref={ref} className="relative min-h-[120vh] w-full flex flex-col items-center overflow-hidden bg-[url('/images/gallery/IMG_7742.JPG')] bg-cover bg-center pt-28">
      {/* Fade-in gradient overlay: top of image softly blends to black */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-[28rem] bg-gradient-to-b from-[#050505] via-[#050505]/50 to-transparent z-10" />
      {/* ── Display Text: sub-text only ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 mt-auto mb-16">
        {/* Sub-text: Audio Architecture */}
        <div className="overflow-hidden mt-4">
          <motion.p
            className="text-[1rem] font-black uppercase tracking-[0.35em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            SOUND ARCHITECTURE & LIVE SESSIONS
          </motion.p>
        </div>

      </div>

      {/* Parallax image handled via section bg */}

      {/* ── Scroll indicator: minimalist track + animated dot ── */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={3}
      >
        <div className="relative w-[1px] h-10 bg-zinc-800 overflow-hidden">
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#E5A93C]"
            animate={{ top: ['0%', '100%'] }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </motion.div>
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
}

const presets: Preset[] = [
  {
    id: 'gnawa-blues-deluxe',
    title: 'GNAWA BLUES DELUXE',
    genre: 'Blues / Fusion',
    price: '$29',
    href: '/store/gnawa-blues-deluxe',
    img: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'tube-crunch-studio',
    title: 'TUBE CRUNCH STUDIO',
    genre: 'Rock / Crunch',
    price: '$24',
    href: '/store/tube-crunch-studio',
    img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=200&q=80',
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

function PresetCard({ preset, isLastAdded }: { preset: Preset; isLastAdded?: boolean }) {
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
            src={preset.img || '/images/gallery/IMG_7742.JPG'}
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
        onClick={() => setIsPlaying(!isPlaying)}
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
          href={preset.href}
          className="flex-1 text-center py-1.5 text-[0.6rem] font-black uppercase tracking-widest bg-zinc-800/60 hover:bg-zinc-700/60 border border-zinc-700/50 text-zinc-300 rounded-lg transition-colors duration-200"
        >
          EXPLORE
        </Link>
        <Link
          href={`${preset.href}#details`}
          className="flex-1 text-center py-1.5 text-[0.6rem] font-black uppercase tracking-widest bg-[#00d8f6]/10 hover:bg-[#00d8f6]/20 border border-[#00d8f6]/30 text-[#00d8f6] rounded-lg transition-colors duration-200"
        >
          DETAILS
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

function SoundPhilosophy() {
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
    <section className="relative bg-[#050505] border-t border-zinc-900 pt-20">
      {/* Sticky + scrollable layout */}
      <div className="max-w-7xl mx-auto flex gap-16 px-6 py-24 pb-32">
        {/* Left: sticky heading */}
        <div className="w-2/5 sticky top-24 h-fit shrink-0">
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
          <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-3">
            {presets.map((p) => (
              <PresetCard
                key={p.id}
                preset={p}
                isLastAdded={p.id === lastAddedId || (lastAddedId && p.href.includes(lastAddedId))}
              />
            ))}
          </div>
        </div>

        {/* Right: scrollable cards */}
        <div ref={scrollRef} className="w-3/5 space-y-10 pt-8 pb-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.num}
              className="group flex gap-8 items-start"
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
          <Link href="/support/setup-guide" className="hover:text-white transition-colors duration-200">
            SUPPORT
          </Link>
        </div>
        <Link
          href="/contact"
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
    <main className="bg-zinc-950 text-white antialiased">
      <Hero />
      <Marquee />
      <SoundPhilosophy />
      <Footer />
    </main>
  );
}
