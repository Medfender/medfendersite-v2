// ── Shared track type (imported by both hand-written and generated data) ──
export interface FeaturedTrack {
  id: string;
  name: string;
  artist: string;
  gearTag: string;
  audioUrl: string;
  thumbnail?: string;
  hardware: "TONEX" | "HX Stomp XL";
}