// ── Hand-written featured-artist overrides ─────────────────────────────────
// Curated metadata that cannot be derived from filenames: display name,
// artist, gear tag, hardware, and thumbnail paths for tracks whose on-disk
// audio/thumb basenames don't match.
//
// The generator (scripts/generate-featured-artists.ts) merges these over the
// auto-generated entries by `audioUrl` — so curated data survives re-scans.
import { FeaturedTrack } from "./featuredTrackTypes";

export const featuredArtistsOverrides: FeaturedTrack[] = [
  {
    id: "sidi-bouganga",
    name: "Sidi Bouganga",
    artist: "feat. Younes Hadir",
    gearTag: "Fender Strat · TONEX Capture · HX Stomp XL",
    audioUrl: "/audio/featured-artists/Sidi Bouganga feat Younes Hadir.mp3",
    thumbnail: "/images/Thumbnails/Sidi Bouganga feat Younes Hadir.jpg",
    hardware: "TONEX",
  },
  {
    id: "rijal-allah",
    name: "Rijal Allah",
    artist: "Gnaoua Brothers",
    gearTag: "Gnaoua Trance · Modulated Reverb · HX Stomp",
    audioUrl: "/audio/featured-artists/Gnaoua Brothers - Rijal Allah feat Younes Hadir.wav",
    thumbnail: "/images/Thumbnails/Rijal Allah feat Younes Hadir.jpg",
    hardware: "HX Stomp XL",
  },
  {
    id: "vices-et-bordel",
    name: "Vices et Bordel",
    artist: "Ousmane Cissokho",
    gearTag: "Acoustic Kora · IK ToneX Acoustic",
    audioUrl: "/audio/featured-artists/Vices et Bordel - Ousmane Cissokho.mp3",
    thumbnail: "/images/Thumbnails/Ousmane Cissokho.jpeg",
    hardware: "TONEX",
  },
  {
    id: "what-you-wont-do",
    name: "What You Won't Do For Love",
    artist: "Boby Caldwell",
    gearTag: "Smooth Jazz Rhodes · HX Stomp XL",
    audioUrl: "/audio/featured-artists/Boby Caldwell - What You Won't Do For Love.mp3",
    thumbnail: "/images/Thumbnails/Boby Caldwell - What You Won't Do For Love.webp",
    hardware: "HX Stomp XL",
  },
];