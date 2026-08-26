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
  tones: ToneItem[];
}

export const packs: PackData[] = [
  {
    id: "srv-pack",
    title: "SRV Ultimate Amp Capture Pack",
    description: "Direct capture of classic Texas blues amp tones.",
    badge: "TONEX",
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
  audioUrl: "/audio/featured/sidi-bouganga.mp3",
};
