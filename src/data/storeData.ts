export interface ToneItem {
  id: string;
  label: string;
  src: string;
  gearTag: string;
}

export interface PackData {
  id: string;
  title: string;
  category: string;
  price: number;
  checkoutUrl: string;
  coverImage: string;
  description: { en: string; fr: string };
  tones: ToneItem[];
  packContents: {
    tonexCaptures: string[];
    irs: string[];
    specs: string;
    signalChain: string[];
  };
}

export interface FeaturedTrack {
  id: string;
  title: string;
  artist: string;
  src: string;
  coverUrl: string;
  gearTag: string;
}

export const featuredTracks: FeaturedTrack[] = [
  {
    id: "featured-track-1",
    title: "Sidi Bouganga",
    artist: "Medfender",
    src: "/audio/featured/sidi-bouganga.mp3",
    coverUrl: "/images/gallery/So Lounge.JPG",
    gearTag: "Fender Strat → TONEX Capture → Line 6 HX Stomp",
  },
  {
    id: "featured-track-2",
    title: "So Lounge Sofitel Experience",
    artist: "Medfender",
    src: "/audio/featured/so-lounge-sofitel.mp3",
    coverUrl: "/images/gallery/So Lounge.JPG",
    gearTag: "Fender Strat → TONEX Capture → Line 6 HX Stomp",
  },
];

export const packs: PackData[] = [
  {
    id: "tonex-srv-pack",
    title: "SRV Ultimate Amp Capture Pack",
    category: "TONEX",
    price: 19.99,
    checkoutUrl:
      "https://medfender.lemonsqueezy.com/checkout/buy/9c678be0-e916-46fb-8340-112098cc6ed4?embed=1",
    coverImage:
      "/images/presets/Impulse Response Everything Bundle — Official Tone Junkie Store.png",
    description: {
      en: "Direct capture of classic Texas blues amp tones with pristine low-end response.",
      fr: "Capture directe de sonorités blues texanes classiques avec une réponse précise des basses.",
    },
    tones: [
      {
        id: "srv-clean",
        label: "Clean Twin Reverb",
        src: "/audio/demos/Nina Simone - I put a spell on you.mp3",
        gearTag: "Fender Twin → TONEX Clean",
      },
      {
        id: "srv-crunch",
        label: "SRV Cold Shot Crunch",
        src: "/audio/demos/I'd Rather Go Blind.mp3",
        gearTag: "Strat → Drive → TONEX Crunch",
      },
      {
        id: "srv-lead",
        label: "Sidi Bouganga Lead",
        src: "/audio/demos/Bishop Briggs - River (Lyrics).mp3",
        gearTag: "Strat → TONEX Capture → HX Stomp",
      },
    ],
    packContents: {
      tonexCaptures: [
        "SRV Strat-Style Lead 59 @ 98dB gain",
        "SRV Strat-Style Rhythm @ 90dB gain",
        "SRV Strat-Style Solo @ 102dB gain",
        "SRV Strat-Style Clean @ 84dB gain",
      ],
      irs: [
        "SRV 4x12 200W Open Back — 24-bit / 48kHz",
        "SRV 2x12 Open Back — 24-bit / 48kHz",
        "SRV 1x12 Closed Back — 24-bit / 48kHz",
      ],
      specs: "24-bit / 48kHz WAV IRs, 1024-sample IR resolution, TONEX 4.5+ compatible",
      signalChain: [
        "Wah (Cry Baby GCB95)",
        "Drive (Klon KTR / OCD)",
        "Amp (SRV-style 200W head → 4x12 cab)",
        "FX Loop (Delay + Reverb)",
        "Tone Stack (Bass / Middle / Treble)",
      ],
    },
  },
];
