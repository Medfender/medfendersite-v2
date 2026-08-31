export interface ToneItem {
  id: string;
  name: string;
  gearTag: string;
  audioUrl: string;
}

export type PackType = "TONEX" | "HX Stomp";

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
  videoDemoUrl: string;
  includedGear: string[];
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
    videoDemoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    includedGear: [
      "Fender Super Reverb (1974)",
      "Fender Twin Reverb (1973)",
      "Ibanez TS808 Overdrive",
      "Dallas-Arbiter Fuzz Face",
    ],
    tones: [
      {
        id: "srv-1",
        name: "SRV Cold Shot Crunch",
        gearTag: "Super Reverb + TS808",
        audioUrl: "/audio/demos/srv/cold-shot.mp3",
      },
      {
        id: "srv-2",
        name: "Sidi Bouganga Lead",
        gearTag: "Fender Strat + TONEX",
        audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3",
      },
      {
        id: "srv-3",
        name: "Clean Twin Reverb",
        gearTag: "Twin Reverb Clean",
        audioUrl: "/audio/demos/srv/clean-twin.mp3",
      },
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
    videoDemoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
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
    videoDemoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
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
  },
];

export const featuredTrack = {
  title: "Sidi Bouganga",
  artist: "MEDFENDER",
  gearTag: "Fender Strat - TONEX Capture - Line 6 HX Stomp",
  audioUrl: "/audio/featured/Sidi%20Bouganga%20feat%20Younes%20Hadir.mp3",
};
