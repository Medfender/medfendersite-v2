export interface ToneItem {
  id: string;
  name: string;
  gearTag: string;
  audioUrl: string;
}

export interface PackData {
  id: string;
  title: string;
  description: string;
  badge: string;
  price: number;
  lemonSqueezyVariantId: string;
  checkoutUrl: string;
  tones: ToneItem[];
}

export const packs: PackData[] = [
  {
    id: "srv-pack",
    title: "SRV Ultimate Amp Capture Pack",
    description: "Direct capture of classic Texas blues amp tones.",
    badge: "TONEX",
    price: 29.00,
    lemonSqueezyVariantId: "9c678be0-e916-46fb-8340-112098cc6ed4",
    checkoutUrl: "https://medfender.lemonsqueezy.com/checkout/buy/9c678be0-e916-46fb-8340-112098cc6ed4?embed=1",
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
];

export const featuredTrack = {
  title: "Sidi Bouganga",
  artist: "MEDFENDER",
  gearTag: "Fender Strat - TONEX Capture - Line 6 HX Stomp",
  audioUrl: "/audio/featured/Sidi%20Bouganga%20feat%20Younes%20Hadir.mp3",
};
