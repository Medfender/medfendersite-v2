import type { Metadata } from "next";
import AudioClient from "./AudioClient";

export const metadata: Metadata = {
  title: "Audio",
  description: "Featured tracks and audio previews from Medfender's TONEX and HX Stomp preset packs.",
  alternates: { canonical: "/audio" },
};

export default function AudioPage() {
  return <AudioClient />;
}
