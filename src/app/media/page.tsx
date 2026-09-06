import type { Metadata } from "next";
import MediaSection from "@/components/media/MediaSection";

export const metadata: Metadata = {
  title: "Media — Medfender",
  description: "Videos, photos, and behind-the-scenes content from Medfender's studio sessions and live performances.",
};

export default function MediaPage() {
  return (
    <main className="min-h-screen flex flex-col text-neutral-100">
      <MediaSection />
    </main>
  );
}
