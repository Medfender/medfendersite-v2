"use client";

export default function LandingBackdrop() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-[#060910]">
      {/* Base stage darkness */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 0%, rgba(0,216,246,0.11) 0%, transparent 60%), radial-gradient(ellipse 60% 45% at 8% 85%, rgba(0,216,246,0.06) 0%, transparent 58%), linear-gradient(180deg, #060910 0%, #05070d 42%, #03050a 100%)",
        }}
      />

      {/* Stage light from above */}
      <div
        className="absolute inset-x-0 top-0 h-[70vh]"
        style={{
          background:
            "conic-gradient(from 180deg at 50% 0%, transparent 42%, rgba(0,216,246,0.09) 50%, transparent 58%)",
          maskImage: "linear-gradient(180deg, black 0%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(180deg, black 0%, transparent 100%)",
        }}
      />

      {/* Guitar-string staff: horizontal lines */}
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, rgba(0,216,246,0.35) 0 1px, transparent 1px 46px)",
          maskImage:
            "radial-gradient(ellipse 85% 70% at 50% 45%, black 0%, transparent 88%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 85% 70% at 50% 45%, black 0%, transparent 88%)",
        }}
      />

      {/* Fret positions: vertical lines */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(0,216,246,0.45) 0 1px, transparent 1px 92px)",
          maskImage:
            "radial-gradient(ellipse 90% 65% at 50% 50%, black 0%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 65% at 50% 50%, black 0%, transparent 90%)",
        }}
      />

      {/* Soundwave contour */}
      <svg
        className="absolute inset-x-0 bottom-0 h-44 w-full opacity-40"
        viewBox="0 0 1440 180"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="waveA" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(0,216,246,0)" />
            <stop offset="20%" stopColor="rgba(0,216,246,0.75)" />
            <stop offset="50%" stopColor="rgba(103,232,249,0.9)" />
            <stop offset="80%" stopColor="rgba(0,216,246,0.75)" />
            <stop offset="100%" stopColor="rgba(0,216,246,0)" />
          </linearGradient>
        </defs>
        <path
          d="M0 120 C 120 40, 240 40, 360 100 S 600 180, 720 90 S 960 0, 1080 100 S 1320 160, 1440 110"
          fill="none"
          stroke="url(#waveA)"
          strokeWidth="1.2"
        />
        <path
          d="M0 140 C 160 80, 320 80, 480 130 S 720 200, 840 120 S 1040 40, 1200 130 S 1360 180, 1440 150"
          fill="none"
          stroke="rgba(0,216,246,0.35)"
          strokeWidth="0.8"
        />
      </svg>

      {/* Rhythm markers */}
      <div className="absolute inset-x-0 top-[58%] flex items-center justify-center gap-10 opacity-30">
        {Array.from({ length: 9 }).map((_, i) => (
          <span
            key={i}
            className="block h-1.5 w-1.5 rounded-full bg-cyan-300"
            style={{ boxShadow: "0 0 10px rgba(0,216,246,0.8)" }}
          />
        ))}
      </div>

      {/* Faint grain */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.9'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
