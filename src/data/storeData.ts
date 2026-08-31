export interface ToneItem {
  id: string;
  name: string;
  gearTag: string;
  audioUrl: string;
}

export type PackType = "TONEX" | "HX Stomp";

export interface ToneModel {
  id: string;
  name: string;
  audioUrl: string;
  gearTag?: string;
}

export interface PackData {
  id: string;
  slug: string;
  title: string;
  description: string;
  badge: string;
  type: PackType;
  price: number;
  lemonSqueezyVariantId: string;
  checkoutUrl: string;
  tones: ToneItem[];
  videoDemos: string[];
  includedGear: string[];
  toneModels: ToneModel[];
}

export const packs: PackData[] = [
  {
    id: "srv-pack",
    slug: "srv-ultimate-amp-capture-pack",
    title: "SRV Ultimate Amp Capture Pack",
    description: "Direct capture of classic Texas blues amp tones — crystal cleans, touch-responsive crunch, and singing leads from the legendary Stevie Ray Vaughan setup.",
    badge: "TONEX",
    type: "TONEX",
    price: 29.00,
    lemonSqueezyVariantId: "9c678be0-e916-46fb-8340-112098cc6ed4",
    checkoutUrl: "https://medfender.lemonsqueezy.com/checkout/buy/9c678be0-e916-46fb-8340-112098cc6ed4?embed=1",
    videoDemos: [
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    ],
    includedGear: [
      "Fender Super Reverb (1974)",
      "Fender Twin Reverb (1973)",
      "Ibanez TS808 Overdrive",
      "Dallas-Arbiter Fuzz Face",
    ],
    tones: [
      { id: "srv-1", name: "SRV Cold Shot Crunch", gearTag: "Super Reverb + TS808", audioUrl: "/audio/demos/srv/cold-shot.mp3" },
      { id: "srv-2", name: "Sidi Bouganga Lead", gearTag: "Fender Strat + TONEX", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3" },
      { id: "srv-3", name: "Clean Twin Reverb", gearTag: "Twin Reverb Clean", audioUrl: "/audio/demos/srv/clean-twin.mp3" },
    ],
    toneModels: [
      { id: "srv-m1", name: "Cold Shot Crunch", audioUrl: "/audio/demos/srv/cold-shot.mp3", gearTag: "Fender Super Reverb · Ibanez TS808" },
      { id: "srv-m2", name: "Sidi Bouganga Lead", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3", gearTag: "Fender Strat · TONEX Capture" },
      { id: "srv-m3", name: "Texas Clean", audioUrl: "/audio/demos/srv/clean-twin.mp3", gearTag: "Fender Twin Reverb · Pure 96kHz" },
    ],
  },
  {
    id: "kandahar-pack",
    slug: "kandahar-high-gain-modern-pack",
    title: "Kandahar High-Gain Modern Pack",
    description: "Crushing high-gain amp captures and modern lead tones forged in the Moroccan desert. Punchy, aggressive, and saturated to perfection.",
    badge: "TONEX",
    type: "TONEX",
    price: 34.00,
    lemonSqueezyVariantId: "kandahar-variant-id",
    checkoutUrl: "https://medfender.lemonsqueezy.com/checkout/buy/kandahar-variant-id?embed=1",
    videoDemos: ["https://www.youtube.com/embed/dQw4w9WgXcQ"],
    includedGear: [
      "Mesa Dual Rectifier (2001)",
      "Soldano SLO-100",
      "Okkultist Metal Junkie",
      "Xotic RC Booster",
    ],
    tones: [
      { id: "k-1", name: "V2 Giant of Kandahar Lead", gearTag: "Metal Junkie capture + OD808", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3" },
      { id: "k-2", name: "Modern Recto Crunch", gearTag: "Mesa Dual Recto Channel 2", audioUrl: "/audio/demos/srv/cold-shot.mp3" },
      { id: "k-3", name: "Solodrive Lead", gearTag: "Soldano SLO-100", audioUrl: "/audio/demos/srv/clean-twin.mp3" },
    ],
    toneModels: [
      { id: "k-m1", name: "Giant of Kandahar", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3", gearTag: "Okkultist Metal Junkie · Xotic RC" },
      { id: "k-m2", name: "Modern Recto", audioUrl: "/audio/demos/srv/cold-shot.mp3", gearTag: "Mesa Dual Rectifier · Ch.2" },
      { id: "k-m3", name: "SLO Solodrive", audioUrl: "/audio/demos/srv/clean-twin.mp3", gearTag: "Soldano SLO-100 · Stock" },
    ],
  },
  {
    id: "british-pack",
    slug: "british-plexi-blues-pack",
    title: "British Plexi & Blues Pack",
    description: "Legendary vintage British valve amp tones and dynamic crunch — from '60s London pub rock to stadium-ready blues wail.",
    badge: "HX Stomp",
    type: "HX Stomp",
    price: 24.00,
    lemonSqueezyVariantId: "british-variant-id",
    checkoutUrl: "https://medfender.lemonsqueezy.com/checkout/buy/british-variant-id?embed=1",
    videoDemos: [
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    ],
    includedGear: [
      "Marshall JTM45 (1964)",
      "Marshall 1959 Super Lead Plexi",
      "Vox AC30 Top Boost",
      "Dallas-Arbiter Treble Booster",
    ],
    tones: [
      { id: "b-1", name: "1959 Plexi Jumped", gearTag: "Marshall 1959 + Treble Booster", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3" },
      { id: "b-2", name: "JTM45 Bluesbreaker", gearTag: "Classic Blues Crunch", audioUrl: "/audio/demos/srv/cold-shot.mp3" },
      { id: "b-3", name: "AC30 Top Boost Chime", gearTag: "Vox AC30 Top Boost", audioUrl: "/audio/demos/srv/clean-twin.mp3" },
    ],
    toneModels: [
      { id: "b-m1", name: "Plexi Jumped", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3", gearTag: "Marshall 1959 · Treble Booster" },
      { id: "b-m2", name: "JTM45 Breaker", audioUrl: "/audio/demos/srv/cold-shot.mp3", gearTag: "Marshall JTM45 · Blues Breaker" },
      { id: "b-m3", name: "AC30 Chime", audioUrl: "/audio/demos/srv/clean-twin.mp3", gearTag: "Vox AC30 · Top Boost" },
    ],
  },

  // ── NEW PACKS ──────────────────────────────────────────────────────────────
  {
    id: "gnawa-pack",
    slug: "gnawa-fuzz-fusion",
    title: "Gnawa Fuzz Fusion Pack",
    description: "Ancient Moroccan Gnawa rhythms fused with blistering fuzz tones. Spiritual, hypnotic, and undeniably heavy. A one-of-a-kind capture experience.",
    badge: "TONEX",
    type: "TONEX",
    price: 32.00,
    lemonSqueezyVariantId: "gnawa-variant-id",
    checkoutUrl: "https://medfender.lemonsqueezy.com/checkout/buy/gnawa-variant-id?embed=1",
    videoDemos: ["https://www.youtube.com/embed/dQw4w9WgXcQ"],
    includedGear: [
      "Gibson Les Paul Custom (2008)",
      "EarthQuaker Devices Palisades",
      "Mesa Thordan's Throne",
      "Custom Gnawa Guembri Preamp",
    ],
    tones: [
      { id: "gn-1", name: "Gnawa Ritual Fuzz", gearTag: "Les Paul + Palisades", audioUrl: "/audio/demos/srv/cold-shot.mp3" },
      { id: "gn-2", name: "Desert Cry Lead", gearTag: "Thordan's Throne", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3" },
      { id: "gn-3", name: "Guembri Drone", gearTag: "Guembri Preamp Capture", audioUrl: "/audio/demos/srv/clean-twin.mp3" },
    ],
    toneModels: [
      { id: "gn-m1", name: "Gnawa Ritual Fuzz", audioUrl: "/audio/demos/srv/cold-shot.mp3", gearTag: "Les Paul · Palisades" },
      { id: "gn-m2", name: "Desert Cry Lead", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3", gearTag: "Mesa Thordan's Throne" },
      { id: "gn-m3", name: "Guembri Drone", audioUrl: "/audio/demos/srv/clean-twin.mp3", gearTag: "Custom Guembri Preamp" },
    ],
  },
  {
    id: "strat-pack",
    slug: "stratocaster-glass-cleans",
    title: "Stratocaster Glass Cleans Pack",
    description: "Six decades of single-coil sparkle, from glassy country chicken-pickin' to jazzy comping and shimmering arpeggios. Pure, uncompressed, breathtaking.",
    badge: "HX Stomp",
    type: "HX Stomp",
    price: 22.00,
    lemonSqueezyVariantId: "strat-variant-id",
    checkoutUrl: "https://medfender.lemonsqueezy.com/checkout/buy/strat-variant-id?embed=1",
    videoDemos: [
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    ],
    includedGear: [
      "Fender American Pro II Stratocaster",
      "Fender Deluxe Reverb (2018)",
      "Fender Twin Reverb (1978)",
      "Carl Martin Compressor/Limiter",
    ],
    tones: [
      { id: "st-1", name: "Country Chicken Pickin'", gearTag: "American Pro II + Deluxe Reverb", audioUrl: "/audio/demos/srv/cold-shot.mp3" },
      { id: "st-2", name: "Jazz Chord Voicings", gearTag: "Fender Twin Reverb", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3" },
      { id: "st-3", name: "Ambient Shimmer", gearTag: "Strat + CM Compressor", audioUrl: "/audio/demos/srv/clean-twin.mp3" },
    ],
    toneModels: [
      { id: "st-m1", name: "Country Pickin'", audioUrl: "/audio/demos/srv/cold-shot.mp3", gearTag: "American Pro II · Deluxe Reverb" },
      { id: "st-m2", name: "Jazz Comping", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3", gearTag: "American Pro II · Twin Reverb" },
      { id: "st-m3", name: "Ambient Shimmer", audioUrl: "/audio/demos/srv/clean-twin.mp3", gearTag: "Strat · CM Comp" },
    ],
  },
  {
    id: "shoegaze-pack",
    slug: "ambient-shoegaze-reverbs",
    title: "Ambient Shoegaze Reverbs Pack",
    description: "Infinite reverbs, lush modulation, and walls of dreamy noise. Captured from hand-wired spring tanks and vintage digital hall processors for maximumethereal texture.",
    badge: "TONEX",
    type: "TONEX",
    price: 28.00,
    lemonSqueezyVariantId: "shoegaze-variant-id",
    checkoutUrl: "https://medfender.lemonsqueezy.com/checkout/buy/shoegaze-variant-id?embed=1",
    videoDemos: ["https://www.youtube.com/embed/dQw4w9WgXcQ"],
    includedGear: [
      "Stratocaster (1992 MIJ)",
      "Stone Ghost Cathedral Reverb",
      "Strymon BigSky (2014)",
      "Malekko Spring 2012",
    ],
    tones: [
      { id: "sg-1", name: "Cathedral Wall of Sound", gearTag: "Strat + Cathedral + BigSky", audioUrl: "/audio/demos/srv/cold-shot.mp3" },
      { id: "sg-2", name: "Spring Drip", gearTag: "Malekko Spring 2012", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3" },
      { id: "sg-3", name: "Lush Reverse Delay", gearTag: "BigSky Reverse Mode", audioUrl: "/audio/demos/srv/clean-twin.mp3" },
    ],
    toneModels: [
      { id: "sg-m1", name: "Cathedral Wall", audioUrl: "/audio/demos/srv/cold-shot.mp3", gearTag: "Strat · Stone Ghost · BigSky" },
      { id: "sg-m2", name: "Spring Drip", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3", gearTag: "Malekko Spring 2012" },
      { id: "sg-m3", name: "Lush Reverse", audioUrl: "/audio/demos/srv/clean-twin.mp3", gearTag: "Strymon BigSky · Reverse" },
    ],
  },
  {
    id: "chug-pack",
    slug: "modern-high-gain-chug",
    title: "Modern High-Gain Chug Pack",
    description: "Palm-mute perfection, pinch harmonics that cut through any mix, and leads that roar. From djent chug to progressive metal — this pack has it all.",
    badge: "HX Stomp",
    type: "HX Stomp",
    price: 36.00,
    lemonSqueezyVariantId: "chug-variant-id",
    checkoutUrl: "https://medfender.lemonsqueezy.com/checkout/buy/chug-variant-id?embed=1",
    videoDemos: ["https://www.youtube.com/embed/dQw4w9WgXcQ"],
    includedGear: [
      "Schecter C-1 FR S (2019)",
      "Kemper Profiler Powerhead",
      "Fortin Grindmaster",
      "MiAudio Crunchy Crunk",
    ],
    tones: [
      { id: "ch-1", name: "Djent Fundamental", gearTag: "Kemper · Grindmaster · Riff", audioUrl: "/audio/demos/srv/cold-shot.mp3" },
      { id: "ch-2", name: "Proggy Lead", gearTag: "Kemper · Neural DSP", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3" },
      { id: "ch-3", name: "Crunchy Crunk", gearTag: "MiAudio Crunchy Crunk", audioUrl: "/audio/demos/srv/clean-twin.mp3" },
    ],
    toneModels: [
      { id: "ch-m1", name: "Djent Fundamental", audioUrl: "/audio/demos/srv/cold-shot.mp3", gearTag: "Schecter · Kemper · Fortin" },
      { id: "ch-m2", name: "Proggy Lead", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3", gearTag: "Kemper · Neural DSP" },
      { id: "ch-m3", name: "Crunchy Crunk", audioUrl: "/audio/demos/srv/clean-twin.mp3", gearTag: "Schecter · MiAudio Crunk" },
    ],
  },
  {
    id: "tweed-pack",
    slug: "vintage-tweed-breakup",
    title: "Vintage Tweed Breakup Pack",
    description: "The warm, touch-sensitive breakup of a '52 Broadcaster cranked to the edge. From glistening clean to gritty bark — all the harmonic complexity of the real thing.",
    badge: "TONEX",
    type: "TONEX",
    price: 26.00,
    lemonSqueezyVariantId: "tweed-variant-id",
    checkoutUrl: "https://medfender.lemonsqueezy.com/checkout/buy/tweed-variant-id?embed=1",
    videoDemos: [
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    ],
    includedGear: [
      "Fender '52 Broadcaster Reissue",
      "Fender Tweed Deluxe (1957)",
      "Gibson J-45 Acoustic",
      "Bartlett Tri-String",
    ],
    tones: [
      { id: "tw-1", name: "Tweed Deluxe Edge", gearTag: "Broadcaster + Tweed Deluxe", audioUrl: "/audio/demos/srv/cold-shot.mp3" },
      { id: "tw-2", name: "Acoustic J-45 Blend", gearTag: "Gibson J-45 + DI", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3" },
      { id: "tw-3", name: "Boutique Clean", gearTag: "Tri-String Jazz Box", audioUrl: "/audio/demos/srv/clean-twin.mp3" },
    ],
    toneModels: [
      { id: "tw-m1", name: "Tweed Edge Breakup", audioUrl: "/audio/demos/srv/cold-shot.mp3", gearTag: "Broadcaster · Tweed Deluxe" },
      { id: "tw-m2", name: "Acoustic Blend", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3", gearTag: "Gibson J-45 · Bartlett DI" },
      { id: "tw-m3", name: "Boutique Clean", audioUrl: "/audio/demos/srv/clean-twin.mp3", gearTag: "Tri-String · Jazz Box" },
    ],
  },
  {
    id: "desert-pack",
    slug: "desert-blues-crunch",
    title: "Desert Blues Crunch Pack",
    description: "Sun-baked Texas blues crunch meets Saharan desert drone. Hand-built from blues legends and North African scales — crackle, warmth, and soul in every tone.",
    badge: "HX Stomp",
    type: "HX Stomp",
    price: 27.00,
    lemonSqueezyVariantId: "desert-variant-id",
    checkoutUrl: "https://medfender.lemonsqueezy.com/checkout/buy/desert-variant-id?embed=1",
    videoDemos: ["https://www.youtube.com/embed/dQw4w9WgXcQ"],
    includedGear: [
      "Gibson ES-335 (2015)",
      "Fender Bassman (1968)",
      "Fulltone OCD v1.7",
      "Demeter TRM-1 Tremulator",
    ],
    tones: [
      { id: "ds-1", name: "Desert Sun Crunch", gearTag: "ES-335 + Bassman", audioUrl: "/audio/demos/srv/cold-shot.mp3" },
      { id: "ds-2", name: "Sahara Drone Lead", gearTag: "Fulltone OCD + Bassman", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3" },
      { id: "ds-3", name: "Blues Crackle", gearTag: "Demeter Trem + ES-335", audioUrl: "/audio/demos/srv/clean-twin.mp3" },
    ],
    toneModels: [
      { id: "ds-m1", name: "Desert Sun Crunch", audioUrl: "/audio/demos/srv/cold-shot.mp3", gearTag: "ES-335 · Fender Bassman" },
      { id: "ds-m2", name: "Sahara Drone Lead", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3", gearTag: "Fulltone OCD · Bassman" },
      { id: "ds-m3", name: "Blues Crackle", audioUrl: "/audio/demos/srv/clean-twin.mp3", gearTag: "Demeter TRM-1 · ES-335" },
    ],
  },
];

export const featuredTrack = {
  title: "Sidi Bouganga",
  artist: "MEDFENDER",
  gearTag: "Fender Strat - TONEX Capture - Line 6 HX Stomp",
  audioUrl: "/audio/featured/Sidi%20Bouganga%20feat%20Younes%20Hadir.mp3",
};
