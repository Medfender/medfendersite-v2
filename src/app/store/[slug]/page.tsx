import { notFound } from "next/navigation";
import { packs } from "@/data/storeData";
import ProductDetailClient from "./ProductDetailClient";

export function generateStaticParams() {
  return packs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const pack = packs.find((p) => p.slug === resolvedParams.slug);
  return {
    title: pack ? pack.title : "Product",
    description: pack?.description ?? "Preset pack details.",
    alternates: { canonical: `/store/${resolvedParams.slug}` },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const pack = packs.find((p) => p.slug === resolvedParams.slug);
  if (!pack) notFound();
  return (
    <>
      <ProductDetailClient pack={pack} />
    </>
  );
}
