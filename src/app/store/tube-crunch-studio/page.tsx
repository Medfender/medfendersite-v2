import { notFound } from "next/navigation";
import { packs } from "@/data/storeData";
import ProductDetailClient from "@/app/store/[slug]/ProductDetailClient";

export function generateStaticParams() {
  return [{ slug: "tube-crunch-studio" }];
}

export async function generateMetadata() {
  const pack = packs.find((p) => p.slug === "tube-crunch-studio");
  return {
    title: pack ? pack.title : "Tube Crunch Studio",
    description: pack?.description ?? "Tube Crunch Studio preset pack by Medfender.",
    alternates: { canonical: "/store/tube-crunch-studio" },
  };
}

export default function TubeCrunchStudioPage() {
  const pack = packs.find((p) => p.slug === "tube-crunch-studio");
  if (!pack) notFound();
  return <ProductDetailClient pack={pack} />;
}
