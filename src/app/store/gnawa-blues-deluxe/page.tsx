import { notFound } from "next/navigation";
import { packs } from "@/data/storeData";
import ProductDetailClient from "@/app/store/[slug]/ProductDetailClient";

export function generateStaticParams() {
  return [{ slug: "gnawa-blues-deluxe" }];
}

export async function generateMetadata() {
  const pack = packs.find((p) => p.slug === "gnawa-blues-deluxe");
  return {
    title: pack ? pack.title : "Gnawa Blues Deluxe",
    description: pack?.description ?? "Gnawa Blues Deluxe preset pack by Medfender.",
    alternates: { canonical: "/store/gnawa-blues-deluxe" },
  };
}

export default function GnawaBluesDeluxePage() {
  const pack = packs.find((p) => p.slug === "gnawa-blues-deluxe");
  if (!pack) notFound();
  return <ProductDetailClient pack={pack} />;
}
