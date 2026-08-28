"use client";

import React, { useMemo } from "react";

interface PlatterProps {
  isPlaying?: boolean;
  className?: string;
}

/**
 * Platter & Vinyl Record — luxury audiophile turntable component.
 *
 * Design references: Technics SP-10R / McIntosh MT10 platter assemblies.
 * Features a heavy die-cast aluminum platter rim, recessed strobe dots,
 * micro-groove vinyl surface with dynamic specular lighting, a polished
 * chrome center spindle with sharp highlight, an audiophile-grade gold-foil
 * center label, and smooth CSS rotation on the vinyl surface when playing.
 */
export default function Platter({ isPlaying = false, className }: PlatterProps) {
  const defs = useMemo(
    () => (
      <defs>
        {/* Brushed silver / die-cast aluminum */}
        <linearGradient id="silver-deep" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#8892a0" />
          <stop offset="20%"  stopColor="#b8c0cc" />
          <stop offset="50%"  stopColor="#707a88" />
          <stop offset="80%"  stopColor="#c8d0da" />
          <stop offset="100%" stopColor="#6a7488" />
        </linearGradient>

        {/* Heavy brushed gunmetal — platter inner rim */}
        <linearGradient id="gunmetal-deep" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#2a2e38" />
          <stop offset="30%"  stopColor="#384050" />
          <stop offset="60%"  stopColor="#242830" />
          <stop offset="100%" stopColor="#181a22" />
        </linearGradient>

        {/* Black anodized aluminum — inner platter ring */}
        <linearGradient id="black-deep" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#101218" />
          <stop offset="50%"  stopColor="#06080c" />
          <stop offset="100%" stopColor="#0a0c14" />
        </linearGradient>

        {/* Deep vinyl black */}
        <linearGradient id="vinyl-deep" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#0e0f14" />
          <stop offset="40%"  stopColor="#12141a" />
          <stop offset="70%"  stopColor="#080810" />
          <stop offset="100%" stopColor="#06070e" />
        </linearGradient>

        {/* Micro-groove band gradient — slightly brighter */}
        <linearGradient id="vinyl-mid" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#141620" />
          <stop offset="50%"  stopColor="#161828" />
          <stop offset="100%" stopColor="#101218" />
        </linearGradient>

        {/* Specular highlight — angular glossy sheen */}
        <linearGradient id="spec-strong" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%"   stopColor="rgba(245,250,255,0.08)" />
          <stop offset="35%"  stopColor="rgba(240,248,255,0.35)" />
          <stop offset="65%"  stopColor="rgba(255,255,255,0.15)" />
          <stop offset="100%" stopColor="rgba(245,250,255,0.03)" />
        </linearGradient>

        {/* Gold foil */}
        <linearGradient id="gold-foil" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#b8922a" />
          <stop offset="30%"  stopColor="#dcc842" />
          <stop offset="70%"  stopColor="#b59230" />
          <stop offset="100%" stopColor="#7c6018" />
        </linearGradient>

        {/* Chrome spindle */}
        <linearGradient id="chrome-spindle" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#e8eef4" />
          <stop offset="20%"  stopColor="#9aaab8" />
          <stop offset="45%"  stopColor="#dde6ef" />
          <stop offset="75%"  stopColor="#b0bec8" />
          <stop offset="100%" stopColor="#8898a8" />
        </linearGradient>
      </defs>
    ), []);

  // Platter dimensions
  const cx = 170; // center of platter
  const cy = 105;
  const platterR = 102; // platter outer radius
  const vinylR = 82; // vinyl record radius (inside the platter edge)
  const labelR = 28; // center label radius
  const spindleR = 9; // center spindle radius

  // Strobe dots: 33 dots (for 33 1/3 RPM) arranged radially
  const DOT_COUNT = 33;
  const dots = useMemo(
    () =>
      Array.from({ length: DOT_COUNT }, (_, i) => {
        const angle = (i * 360) / DOT_COUNT - 90; // start at top
        const rad = (angle * Math.PI) / 180;
        const r = platterR - 10; // inset from rim
        const x = cx + Math.cos(rad) * r;
        const y = cy + Math.sin(rad) * r;
        return { x, y, angle };
      }),
    [cx, cy, platterR]
  );

  return (
    <svg
      viewBox="0 0 340 210"
      className={className}
      style={{ overflow: "visible" }}
      aria-label="Vinyl platter assembly"
      role="img"
    >
      <style>{`
        @keyframes spin-vinyl {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
      {defs}

      {/* ═══════════════════════════════════════════════════════════
          PLATTER EDGE — Die-cast aluminum rim with brushed silver
      ═══════════════════════════════════════════════════════════ */}
      <g filter="url(#shadow-md)">
        {/* Outer rim — thick brushed silver ring */}
        <circle
          cx={cx} cy={cy} r={platterR}
          fill="none"
          stroke="url(#silver-deep)"
          strokeWidth="14"
        />
        {/* Inner bevel — dark metal */}
        <circle
          cx={cx} cy={cy} r={platterR - 7}
          fill="none"
          stroke="url(#gunmetal-deep)"
          strokeWidth="6"
        />
        {/* Deep inner shadow — transition to black */}
        <circle
          cx={cx} cy={cy} r={platterR - 14}
          fill="none"
          stroke="#161a22"
          strokeWidth="4"
        />
        {/* Edge highlight — top-left chrome strip */}
        <path
          d={`M ${cx},${cy - platterR + 3} A ${platterR - 2} ${platterR - 2} 0 0 1 ${cx},${cy - platterR - 14}`}
          fill="none"
          stroke="#d8e0ec"
          strokeWidth="1.5"
          opacity="0.5"
        />
      </g>

      {/* ═══════════════════════════════════════════════════════════
          STROBE DOTS — Recessed speed indicator mirrors around rim
      ═══════════════════════════════════════════════════════════ */}
      <g filter="url(#shadow-sm)">
        {dots.map((dot, i) => (
          <g key={i}>
            {/* Recessed dark well */}
            <circle
              cx={dot.x} cy={dot.y} r="3.2"
              fill="#0e1016"
              stroke="#181a22"
              strokeWidth="0.5"
            />
            {/* Mirror surface — polished chrome */}
            <circle
              cx={dot.x} cy={dot.y} r="2"
              fill="url(#chrome-spindle)"
              opacity="0.92"
            />
            {/* Inner specular catch */}
            <circle
              cx={dot.x - 0.7} cy={dot.y - 0.7} r="0.8"
              fill="rgba(235,242,252,0.7)"
            />
          </g>
        ))}
      </g>

      {/* ═══════════════════════════════════════════════════════════
          VINYL RECORD — Rotating component
          When isPlaying is true, the vinyl surface rotates smoothly
          around the platter center via the `spin-vinyl` keyframes.
      ═══════════════════════════════════════════════════════════ */}
      <g
        className="vinyl-spin"
        style={{
          transformOrigin: `${cx}px ${cy}px`,
          animation: isPlaying ? "spin-vinyl 2.4s linear infinite" : "none",
        }}
      >
        {/* Base black */}
        <circle cx={cx} cy={cy} r={vinylR} fill="url(#vinyl-deep)" />

        {/* Micro-groove concentric bands */}
        {Array.from({ length: 14 }, (_, j) => {
          const bandR = vinylR - j * 5.5;
          const fill = j % 2 === 0 ? "url(#vinyl-deep)" : "url(#vinyl-mid)";
          return (
            <circle
              key={j}
              cx={cx} cy={cy} r={bandR}
              fill={fill}
              stroke={j % 3 === 0 ? "rgba(40,45,55,0.28)" : "none"}
              strokeWidth={0.5}
            />
          );
        })}

        {/* Faint radial groove texture (very subtle, doesn't hurt spin) */}
        <g opacity="0.08">
          {Array.from({ length: 80 }, (_, g) => (
            <line
              key={g}
              x1={cx} y1={cy - vinylR}
              x2={cx} y2={cy + vinylR}
              stroke="#e0e0e8"
              strokeWidth="0.3"
              transform={`rotate(${g * 4.5}, ${cx}, ${cy})`}
            />
          ))}
        </g>

        {/* ════════════════════════════════════════════════════
            CENTER LABEL — Gold-foil audiophile-grade label
            Rotates with the vinyl (part of the record assembly).
        ════════════════════════════════════════════════════ */}
        <g>
          <circle cx={cx} cy={cy} r={labelR} fill="#0a0c14" />
          <circle cx={cx} cy={cy} r={labelR - 1.5} fill="none" stroke="url(#gold-foil)" strokeWidth="4" />
          <circle cx={cx} cy={cy} r={labelR - 8} fill="none" stroke="url(#gold-foil)" strokeWidth="1.5" opacity="0.6" />
          <text
            x={cx} y={cy - 2}
            textAnchor="middle"
            fontSize="4.5"
            fontWeight="bold"
            fill="#c8a838"
            letterSpacing="2"
            fontFamily="sans-serif"
          >
            GOLDEN SOUND
          </text>
          <text
            x={cx} y={cy + 5.5}
            textAnchor="middle"
            fontSize="2.8"
            fill="#8a7860"
            letterSpacing="1.5"
            fontFamily="monospace"
          >
            180g • 33⅓ RPM
          </text>
          <line x1={cx - 8} y1={cy + 3} x2={cx + 8} y2={cy + 3}
            stroke="#8a7860" strokeWidth="0.6" opacity="0.5" />
        </g>
      </g>

      {/* ════════════════════════════════════════════════════
          SPECULAR HIGHLIGHT — Angular glossy reflection
          Static overlay (does NOT rotate), simulating the room's
          light source reflecting off the spinning grooves.
      ════════════════════════════════════════════════════ */}
      <g style={{ pointerEvents: "none" }}>
        {/* Main angular highlight */}
        <path
          d={`M ${cx - 55},${cy - 20} Q ${cx + 5},${cy - 45} ${cx + 50},${cy - 10} L ${cx + 15},${cy + 35} Q ${cx - 15},${cy + 15} ${cx - 45},${cy - 20} Z`}
          fill="url(#spec-strong)"
        />
        {/* Secondary bright streak */}
        <path
          d={`M ${cx - 30},${cy - 55} Q ${cx + 20},${cy - 35} ${cx + 35},${cy - 5}`}
          fill="none"
          stroke="#f0f4f8"
          strokeWidth="4"
          opacity="0.35"
        />
        {/* Bright specular glint */}
        <ellipse
          cx={cx + 18}
          cy={cy - 18}
          rx="18"
          ry="6"
          fill="rgba(245,250,255,0.22)"
          transform={`rotate(-15, ${cx + 18}, ${cy - 18})`}
        />
      </g>

      {/* ═══════════════════════════════════════════════════════════
          CENTER SPINDLE — Polished chrome protruding upward
          This sits ABOVE everything, with a sharp specular highlight
          and a cast shadow falling onto the label below.
      ═══════════════════════════════════════════════════════════ */}
      <g filter="url(#shadow-sm)">
        {/* Spindle shadow cast onto the label */}
        <ellipse
          cx={cx} cy={cy + 2}
          rx={spindleR * 1.1} ry={spindleR * 0.8}
          fill="rgba(0,0,0,0.5)"
          opacity="0.55"
        />
        {/* Spindle body — polished chrome */}
        <ellipse
          cx={cx} cy={cy - 4}
          rx={spindleR} ry={spindleR - 1}
          fill="url(#chrome-spindle)"
          stroke="#8898a8" strokeWidth="0.3"
        />
        {/* Spindle top cap */}
        <ellipse cx={cx} cy={cy - 8} rx={spindleR - 1.5} ry={spindleR - 2.5}
          fill="url(#chrome-spindle)" stroke="#5a6a78" strokeWidth="0.3" />
        {/* Sharp specular light catch */}
        <ellipse
          cx={cx - 2} cy={cy - 7}
          rx={2.5} ry={3.5}
          fill="rgba(250,252,255,0.9)"
          transform={`rotate(-35, ${cx - 2}, ${cy - 7})`}
        />
        {/* Secondary specular */}
        <ellipse
          cx={cx + 1.5} cy={cy - 5.5}
          rx="1.5" ry="2"
          fill="rgba(250,252,255,0.5)"
        />
        {/* Spindle base collar — polished ring */}
        <circle cx={cx} cy={cy - 1} r={spindleR + 2.5}
          fill="none"
          stroke="#a0a8b8"
          strokeWidth="0.8"
          opacity="0.7"
        />
      </g>

      {/* ═══════════════════════════════════════════════════════════
          VINYL OUTER EDGE — Thin bright ring at vinyl-platter boundary
          ═══════════════════════════════════════════════════════════ */}
      <circle
        cx={cx} cy={cy} r={vinylR}
        fill="none"
        stroke="#8898aa"
        strokeWidth="0.6"
        opacity="0.3"
      />

    </svg>
  );
}
