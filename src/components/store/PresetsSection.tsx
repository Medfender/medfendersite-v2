"use client";

import React from "react";
import { packs } from "@/data/storeData";
import type { PackData } from "@/data/storeData";
import PresetCard from "./PresetCard";
import Reveal from "@/components/luxury/Reveal";
import SectionHeading from "@/components/luxury/SectionHeading";

export default function PresetsSection() {
  const presets = packs as PackData[];

  return (
    <section className="surface-paper bg-paper">
      <div className="mx-auto w-full max-w-[1560px] px-5 py-20 md:px-8 md:py-28">
        <SectionHeading
          index="01"
          eyebrow="Catalogue"
          title={
            <>
              Every capture,
              <br />
              <em className="italic text-rust">in print.</em>
            </>
          }
          intro="Profiles and presets built from real amplifiers, real cabinets and real rooms. Each pack ships with its signal chain documented, so the sound survives the trip to your rig."
          action={
            <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-ink/60">
              {presets.length} releases · instant download
            </p>
          }
        />

        <div className="mt-14 grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {presets.map((preset, i) => (
            <Reveal key={preset.id} delay={(i % 4) * 0.04}>
              <PresetCard preset={preset} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
