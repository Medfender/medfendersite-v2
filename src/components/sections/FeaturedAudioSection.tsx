"use client";

import React, { useRef, useEffect, useState } from "react";
import FeaturedPlayer from "@/components/audio/FeaturedPlayer";
import HeroVisualizer from "@/components/hero/HeroVisualizer";

export default function FeaturedAudioSection() {
  const audioSectionRef = useRef<HTMLElement>(null);
  const [isAudioSectionInView, setIsAudioSectionInView] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsAudioSectionInView(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    if (audioSectionRef.current) observer.observe(audioSectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="audio"
      ref={audioSectionRef}
      className="flex flex-col items-center justify-center px-6 pt-32 pb-24 md:pt-40 md:pb-32 relative overflow-hidden"
    >
      {/* Layered background image with gradient mask */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/gallery/So Lounge.JPG"
          alt=""
          className="w-full h-full object-cover opacity-30 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f19]/70 via-[#0b0f19]/40 to-[#0b0f19]/95" />
      </div>
      <div className="relative z-10 w-full max-w-5xl text-center mb-14">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-5 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-cyan-500 drop-shadow-[0_0_25px_rgba(0,216,246,0.45)]">
          Featured Audio Experience
        </h1>
        <p className="text-neutral-400 text-base md:text-lg max-w-xl mx-auto">
          Real-time web audio visualization powered by Web Audio API. Select a track, press play, and watch the waveform respond.
        </p>
      </div>
      <HeroVisualizer isSectionInView={isAudioSectionInView} />
      <FeaturedPlayer isSectionInView={isAudioSectionInView} />
    </section>
  );
}