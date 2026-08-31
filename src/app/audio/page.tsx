import type { Metadata } from "next";
import AudioClient from "./AudioClient";

export const metadata: Metadata = {
  title: "Audio — Medfender",
  description: "Featured tracks and audio previews from Medfender's TONEX and HX Stomp preset packs.",
};

export default function AudioPage() {
  return <AudioClient />;
}
