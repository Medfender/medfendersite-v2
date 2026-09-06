'use client';

import { ReactNode } from "react";
import dynamic from "next/dynamic";

const SpiralGalaxyBackground = dynamic(
  () => import("@/components/SpiralGalaxy").then((mod) => mod.default),
  { ssr: false }
);

export default function GalaxyBackgroundClient({ children }: { children?: ReactNode }) {
  return (
    <>
      <SpiralGalaxyBackground />
      {children}
    </>
  );
}
