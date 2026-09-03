// ── Track list — sourced from public/audio/* and public/audio/featured-artists/* ──
// Edit entries here to match the on-disk asset filenames. Each track is a single source of truth
// for the playlist, sticky transport, turntable spin-up, and spectrum analyzer audition.

export interface FeaturedTrack {
  id: string;
  name: string;
  artist: string;
  gearTag: string;
  audioUrl: string;
  thumbnail?: string;
  hardware: "TONEX" | "HX Stomp XL";
}

// ── Featured artists (public/audio/featured-artists/) ────────────────────────
export const featuredArtists: FeaturedTrack[] = [
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

// ── Demo tracks (public/audio/demos/srv/) ─────────────────────────────────
export const demoTracks: FeaturedTrack[] = [
  {
    id: "sidi-bouganga-lead",
    name: "Sidi Bouganga Lead",
    artist: "Demo",
    gearTag: "Lead Tone · HX Stomp XL",
    audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3",
    hardware: "HX Stomp XL",
  },
  {
    id: "cold-shot",
    name: "Cold Shot",
    artist: "Demo",
    gearTag: "Clean Tone · HX Stomp XL",
    audioUrl: "/audio/demos/srv/cold-shot.mp3",
    hardware: "HX Stomp XL",
  },
  {
    id: "clean-twin",
    name: "Clean Twin",
    artist: "Demo",
    gearTag: "Fender-style Clean · TONEX",
    audioUrl: "/audio/demos/srv/clean-twin.mp3",
    hardware: "TONEX",
  },
];

// ── Root-level tracks (public/audio/) ─────────────────────────────────────
export const rootTracks: FeaturedTrack[] = [
  {
    id: "01-what-you-wont-do",
    name: "01 What You Won't Do For Love",
    artist: "Medfender",
    gearTag: "Reference Track",
    audioUrl: "/audio/01 What You Won't Do For Love.mp3",
    hardware: "HX Stomp XL",
  },
  {
    id: "gnaoua",
    name: "Gnaoua",
    artist: "Medfender",
    gearTag: "Gnaoua Texture",
    audioUrl: "/audio/gnaoua.mp3",
    hardware: "TONEX",
  },
  {
    id: "voices",
    name: "Voices",
    artist: "Medfender",
    gearTag: "Vocal Texture",
    audioUrl: "/audio/voices.mp3",
    hardware: "HX Stomp XL",
  },
  {
    id: "sidi-bouganga",
    name: "Sidi Bouganga",
    artist: "Medfender",
    gearTag: "Full Mix",
    audioUrl: "/audio/sidi_bouganga.mp3",
    hardware: "HX Stomp XL",
  },
];

// ── Full playlist (all sources merged) ─────────────────────────────────────
export const allTracks: FeaturedTrack[] = [
  ...featuredArtists,
  ...demoTracks,
  ...rootTracks,
];
