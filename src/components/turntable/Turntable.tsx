"use client";

import React, { useState, useMemo } from "react";

/**
 * Turntable — luxury DJ deck chassis (Technics SL-1200 inspired).
 *
 * Single 720×520 viewBox hosts the Platter (left) and Tonearm (right)
 * in a unified coordinate system, so mounting is exact.
 *
 * Coordinate map:
 *   Plinth        : full viewBox, 0 0 720 520
 *   Platter       : center (215, 215), outer radius 175
 *   Spindle       : same center, small chrome disc
 *   Tonearm pivot : (445, 200) — right side of chassis
 *   Park angle    : +30° (arm swung outward, rests on cradle)
 *   Play angle    : -10° (arm swung inward, stylus on outer lead-in groove)
 *   Hardware      : bottom-left controls, pitch fader far right
 *
 * The platter spins continuously while `isPlaying` is true; when paused,
 * `animation-play-state: paused` coasts the rotation smoothly to a stop.
 */

// ── Helpers ──────────────────────────────────────────────────────────────
const cos = (deg: number) => Math.cos((deg * Math.PI) / 180);
const sin = (deg: number) => Math.sin((deg * Math.PI) / 180);

export default function Turntable({ isPlaying, className }: { isPlaying?: boolean; className?: string }) {
  const [internalPlaying, setInternalPlaying] = useState(false);
  const active = isPlaying ?? internalPlaying;
  const toggleInternal = () => setInternalPlaying((s) => !s);

  const [speed, setSpeed] = useState<33 | 45>(33);
  const [pitch, setPitch] = useState(0); // -8 to +8 (%)

  // Platter coordinates
  const PCX = 215;
  const PCY = 215;
  const PLATTER_R = 175;
  const VINYL_R = 145;
  const LABEL_R = 48;
  const SPINDLE_R = 8;

  // Tonearm coordinates — strict vertical-axis system, Technics SL-1200 style
  const TPX = 490;
  const TPY = 75;
  const WAND_LEN = 220;          // wand length (downward)
  const CW_LEN = 50;             // counterweight length (upward)
  const WAND_W = 7;              // wand stroke width
  // Native arm points STRAIGHT DOWN (positive Y axis from pivot)
  // Cradle sits where the arm rests at PARK_ANGLE
  const REST_X = TPX;
  const REST_Y = TPY + 220;
  const PARK_ANGLE = 0;
  const PLAY_ANGLE = 55;
  const armAngle = active ? PLAY_ANGLE : PARK_ANGLE;

  // Stylus tip in chassis coords — wand natively points straight down (+Y)
  // At angle θ (CCW negative in screen y-down), tip = (TPX + sin(θ)·L, TPY + cos(θ)·L)
  const tipRad = (armAngle * Math.PI) / 180;
  const tipX = Number((TPX + Math.sin(tipRad) * WAND_LEN).toFixed(3));
  const tipY = Number((TPY + Math.cos(tipRad) * WAND_LEN).toFixed(3));

  // Pitch fader (far right edge, near bottom)
  const PITCH_X = 660;
  const PITCH_Y = 130;
  const PITCH_LEN = 230;

  return (
    <div
      className={`relative w-full max-w-[820px] mx-auto ${className}`}
      style={{
        filter: "drop-shadow(0 60px 80px rgba(0,0,0,0.85))",
      }}
    >
      {/* ════════════════════════════════════════════════════════
          OUTER PLINTH (chassis bezel)
      ════════════════════════════════════════════════════════ */}
      <div
        className="relative w-full rounded-[36px] p-3 border border-white/[0.07]"
        style={{
          background:
            "linear-gradient(180deg, #1a1d28 0%, #0c0e14 60%, #04050a 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -2px 8px rgba(0,0,0,0.5), 0 30px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Inner deck */}
        <div
          className="relative w-full rounded-[28px] overflow-hidden border border-white/[0.04]"
          style={{
            background:
              "linear-gradient(135deg, #1a1c24 0%, #0a0b10 70%, #06070b 100%)",
            boxShadow:
              "inset 0 0 50px rgba(0,0,0,0.7), inset 0 0 1px rgba(255,255,255,0.05)",
            aspectRatio: "720 / 520",
          }}
        >
          {/* ═════════════════════════════════════════════════════
              DECK SURFACE — single SVG (Platter + Tonearm)
          ═════════════════════════════════════════════════════ */}
          <svg
            viewBox="0 0 720 520"
            className="absolute inset-0 w-full h-full"
            style={{ display: "block" }}
            aria-label="Turntable deck"
          >
            <style>{`
              @keyframes spin-vinyl {
                from { transform: rotate(0deg); }
                to   { transform: rotate(360deg); }
              }
              .vinyl-spin  {
                animation: spin-vinyl 2.4s linear infinite;
                animation-play-state: ${active ? "running" : "paused"};
              }
              .tonearm-spin {
                transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
              }
            `}</style>

            <defs>
              {/* Gunmetal */}
              <linearGradient id="gm" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="#3c4352" />
                <stop offset="28%"  stopColor="#5c6678" />
                <stop offset="52%"  stopColor="#7c8698" />
                <stop offset="76%"  stopColor="#5c6678" />
                <stop offset="100%" stopColor="#2c3340" />
              </linearGradient>
              {/* Brushed gunmetal */}
              <linearGradient id="gm-brushed" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="#4e5565" />
                <stop offset="9%"   stopColor="#6a7588" />
                <stop offset="18%"  stopColor="#4e5565" />
                <stop offset="27%"  stopColor="#6a7588" />
                <stop offset="36%"  stopColor="#4e5565" />
                <stop offset="45%"  stopColor="#6a7588" />
                <stop offset="54%"  stopColor="#4e5565" />
                <stop offset="63%"  stopColor="#6a7588" />
                <stop offset="72%"  stopColor="#4e5565" />
                <stop offset="81%"  stopColor="#6a7588" />
                <stop offset="90%"  stopColor="#4e5565" />
                <stop offset="100%" stopColor="#3c4352" />
              </linearGradient>
              {/* Matte black */}
              <linearGradient id="matte-blk" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="#252830" />
                <stop offset="45%"  stopColor="#18191f" />
                <stop offset="100%" stopColor="#0c0d12" />
              </linearGradient>
              {/* Brushed silver */}
              <linearGradient id="silver-deep" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="#8892a0" />
                <stop offset="20%"  stopColor="#b8c0cc" />
                <stop offset="50%"  stopColor="#707a88" />
                <stop offset="80%"  stopColor="#c8d0da" />
                <stop offset="100%" stopColor="#6a7488" />
              </linearGradient>
              {/* Chrome (for spindle) */}
              <radialGradient id="chrome-spindle" cx="35%" cy="30%" r="75%">
                <stop offset="0%"   stopColor="#ffffff" />
                <stop offset="20%"  stopColor="#d8e0ec" />
                <stop offset="50%"  stopColor="#9aaab8" />
                <stop offset="80%"  stopColor="#5a6a78" />
                <stop offset="100%" stopColor="#2c3340" />
              </radialGradient>
              {/* Chrome (linear, for clips/screws) */}
              <linearGradient id="chrome" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="#e8eef8" />
                <stop offset="35%"  stopColor="#b8c0cc" />
                <stop offset="70%"  stopColor="#6a7488" />
                <stop offset="100%" stopColor="#3a3e4c" />
              </linearGradient>
              {/* Gold */}
              <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="#a88220" />
                <stop offset="30%"  stopColor="#dcaa42" />
                <stop offset="62%"  stopColor="#be942e" />
                <stop offset="100%" stopColor="#7c6018" />
              </linearGradient>
              {/* Cartridge */}
              <linearGradient id="cartridge" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="#1c2028" />
                <stop offset="50%"  stopColor="#262c38" />
                <stop offset="100%" stopColor="#0c0e14" />
              </linearGradient>
              {/* Counterweight */}
              <radialGradient id="cw-rad" cx="38%" cy="32%" r="62%">
                <stop offset="0%"   stopColor="#7c8698" />
                <stop offset="58%"  stopColor="#4a5262" />
                <stop offset="100%" stopColor="#2c3040" />
              </radialGradient>
              {/* VTA / Gimbal metallic */}
              <linearGradient id="gimbal-metal" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8892a0" />
                <stop offset="40%" stopColor="#b8c0cc" />
                <stop offset="70%" stopColor="#6a7488" />
                <stop offset="100%" stopColor="#3a3e4c" />
              </linearGradient>
              {/* Anti-skate brass */}
              <radialGradient id="antiskate-brass" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#c8a850" />
                <stop offset="60%" stopColor="#9a7d30" />
                <stop offset="100%" stopColor="#554820" />
              </radialGradient>
              {/* Vinyl base */}
              <linearGradient id="vinyl-deep" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#0e0f14" />
                <stop offset="40%"  stopColor="#12141a" />
                <stop offset="70%"  stopColor="#080810" />
                <stop offset="100%" stopColor="#06070e" />
              </linearGradient>
              <linearGradient id="vinyl-mid" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#141620" />
                <stop offset="50%"  stopColor="#161828" />
                <stop offset="100%" stopColor="#101218" />
              </linearGradient>
              {/* Specular sheen on vinyl */}
              <linearGradient id="spec-strong" x1="30%" y1="0%" x2="70%" y2="100%">
                <stop offset="0%"   stopColor="rgba(245,250,255,0.08)" />
                <stop offset="35%"  stopColor="rgba(240,248,255,0.35)" />
                <stop offset="65%"  stopColor="rgba(255,255,255,0.15)" />
                <stop offset="100%" stopColor="rgba(245,250,255,0.03)" />
              </linearGradient>

              {/* Filters */}
              <filter id="shadow-sm" x="-25%" y="-25%" width="150%" height="160%">
                <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.65" />
              </filter>
              <filter id="shadow-md" x="-35%" y="-25%" width="170%" height="170%">
                <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.72" />
              </filter>
            </defs>

            {/* ════════════════════════════════════════════════════
                PLATTER — die-cast aluminum + vinyl + center spindle
            ════════════════════════════════════════════════════ */}

            {/* Platter surface (dark backing) */}
            <circle cx={PCX} cy={PCY} r={PLATTER_R + 5} fill="#0c0d12" />

            {/* Platter rim — thick brushed silver */}
            <g filter="url(#shadow-md)">
              <circle cx={PCX} cy={PCY} r={PLATTER_R}
                fill="none" stroke="url(#silver-deep)" strokeWidth="22" />
              {/* Inner bevel */}
              <circle cx={PCX} cy={PCY} r={PLATTER_R - 11}
                fill="none" stroke="url(#gm-brushed)" strokeWidth="8" />
              {/* Deep inner transition */}
              <circle cx={PCX} cy={PCY} r={PLATTER_R - 22}
                fill="none" stroke="#0a0c12" strokeWidth="6" />
              {/* Top-left chrome specular arc */}
              <path
                d={`M ${PCX},${PCY - PLATTER_R + 4} A ${PLATTER_R - 4} ${PLATTER_R - 4} 0 0 1 ${PCX},${PCY - PLATTER_R - 22}`}
                fill="none" stroke="#d8e0ec" strokeWidth="2" opacity="0.5"
              />
            </g>

            {/* Vinyl record (rotating) */}
            <g
              className="vinyl-spin"
              style={{ transformOrigin: `${PCX}px ${PCY}px` }}
            >
              {/* Base black */}
              <circle cx={PCX} cy={PCY} r={VINYL_R} fill="url(#vinyl-deep)" />
              {/* Concentric groove bands */}
              {Array.from({ length: 24 }, (_, j) => {
                const bandR = VINYL_R - j * 5.8;
                if (bandR < LABEL_R + 4) return null;
                const fill = j % 2 === 0 ? "url(#vinyl-deep)" : "url(#vinyl-mid)";
                return (
                  <circle key={j}
                    cx={PCX} cy={PCY} r={bandR}
                    fill={fill}
                    stroke={j % 3 === 0 ? "rgba(40,45,55,0.32)" : "none"}
                    strokeWidth={0.5} />
                );
              })}
              {/* Faint radial groove texture */}
              <g opacity="0.07">
                {Array.from({ length: 120 }, (_, g) => (
                  <line key={g}
                    x1={PCX} y1={PCY - VINYL_R}
                    x2={PCX} y2={PCY + VINYL_R}
                    stroke="#d8dce4" strokeWidth="0.4"
                    transform={`rotate(${g * 3}, ${PCX}, ${PCY})`} />
                ))}
              </g>
              {/* Center label — gold foil */}
              <circle cx={PCX} cy={PCY} r={LABEL_R} fill="#0a0c14" />
              <circle cx={PCX} cy={PCY} r={LABEL_R - 2}
                fill="none" stroke="url(#gold)" strokeWidth="5" />
              <circle cx={PCX} cy={PCY} r={LABEL_R - 14}
                fill="none" stroke="url(#gold)" strokeWidth="2" opacity="0.6" />
              <text
                x={PCX} y={PCY - 4}
                textAnchor="middle"
                fontSize="9" fontWeight="bold"
                fill="#c8a838" letterSpacing="3"
                fontFamily="sans-serif">
                GOLDEN SOUND
              </text>
              <text
                x={PCX} y={PCY + 8}
                textAnchor="middle"
                fontSize="5" fill="#8a7860" letterSpacing="2"
                fontFamily="monospace">
                180g • 33⅓ RPM
              </text>
            </g>

            {/* Vinyl outer edge ring */}
            <circle cx={PCX} cy={PCY} r={VINYL_R}
              fill="none" stroke="#8898aa" strokeWidth="1" opacity="0.3" />

            {/* Center SPINDLE — small crisp silver disc, does NOT rotate */}
            <g>
              {/* Cast shadow under spindle */}
              <ellipse cx={PCX} cy={PCY + 1.5}
                rx={SPINDLE_R + 1} ry={SPINDLE_R - 1}
                fill="rgba(0,0,0,0.55)" opacity="0.7" />
              {/* Spindle body */}
              <circle cx={PCX} cy={PCY} r={SPINDLE_R}
                fill="url(#chrome-spindle)"
                stroke="#5a6a78" strokeWidth="0.6" />
              {/* Bright specular catch */}
              <ellipse cx={PCX - 2} cy={PCY - 2}
                rx="3" ry="2"
                fill="rgba(255,255,255,0.9)"
                transform={`rotate(-35, ${PCX - 2}, ${PCY - 2})`} />
              {/* Inner pin */}
              <circle cx={PCX} cy={PCY} r="1.4"
                fill="#1a1d24" />
            </g>

            {/* ════════════════════════════════════════════════════
                TONEARM ASSEMBLY — RIGHT SIDE OF CHASSIS
            ════════════════════════════════════════════════════ */}

            {/* Arm Rest / Cradle — directly under pivot at (430, 280), cradles vertical arm at PARK */}
            <g filter="url(#shadow-md)">
              {/* Base plate — centered under pivot */}
              <rect x={REST_X - 32} y={REST_Y - 4}
                width="64" height="12" rx="3"
                fill="url(#gm-brushed)" stroke="#1e222a" strokeWidth="0.6" />
              {/* Cradle cup */}
              <ellipse cx={REST_X} cy={REST_Y - 4}
                rx="20" ry="6"
                fill="url(#matte-blk)" stroke="#2c3040" strokeWidth="0.6" />
              {/* Vertical clip post */}
              <rect x={REST_X - 4} y={REST_Y - 28}
                width="8" height="20" rx="2"
                fill="url(#chrome)" stroke="#5a6478" strokeWidth="0.4" />
              {/* Magnetic latch */}
              <circle cx={REST_X} cy={REST_Y - 18} r="2.2"
                fill="#a82828" opacity="0.85" />
            </g>

            {/* Arm Base Column */}
            <g filter="url(#shadow-md)">
              <rect x={TPX - 16} y={TPY + 18}
                width="32" height="12" rx="3"
                fill="url(#gm-brushed)" stroke="#1e222a" strokeWidth="0.6" />
              <rect x={TPX - 16} y={TPY - 10}
                width="32" height="30" rx="5"
                fill="url(#matte-blk)" stroke="#252830" strokeWidth="0.6" />
              <ellipse cx={TPX} cy={TPY - 8} rx="19" ry="6"
                fill="url(#gm)" stroke="#3a3e4c" strokeWidth="0.5" />
              <circle cx={TPX - 20} cy={TPY + 24} r="3.5"
                fill="url(#chrome)" stroke="#4a5262" strokeWidth="0.4" />
              <circle cx={TPX + 20} cy={TPY + 24} r="3.5"
                fill="url(#chrome)" stroke="#4a5262" strokeWidth="0.4" />
            </g>

            {/* Anti-Skate Dial — brass knob to the RIGHT of pivot (Technics-style) */}
            <g filter="url(#shadow-sm)">
              <circle cx={TPX + 58} cy={TPY - 8} r="9"
                fill="url(#matte-blk)" stroke="#252830" strokeWidth="0.5" />
              <circle cx={TPX + 58} cy={TPY - 8} r="6.5"
                fill="url(#antiskate-brass)" stroke="#4a3a18" strokeWidth="0.4" />
              <line x1={TPX + 58} y1={TPY - 12} x2={TPX + 58} y2={TPY - 5}
                stroke="#1e1410" strokeWidth="1" />
              <circle cx={TPX + 58} cy={TPY - 8} r="1.2" fill="#1a1410" />
              <text x={TPX + 58} y={TPY + 9} textAnchor="middle"
                fontSize="4" fill="#5a6478" fontFamily="monospace"
                letterSpacing="0.4">A-SKATE</text>
            </g>

            {/* Gimbal Bearing Housing — multi-layer concentric metal ring */}
            <g filter="url(#shadow-md)">
              {/* Outer mounting plate */}
              <circle cx={TPX} cy={TPY} r="34"
                fill="url(#matte-blk)" stroke="#1e222a" strokeWidth="0.8" />
              {/* VTA adjustment ring (knurled) */}
              <circle cx={TPX} cy={TPY} r="30"
                fill="none" stroke="url(#gimbal-metal)" strokeWidth="6" />
              {/* Knurl tick marks around VTA ring */}
              {Array.from({ length: 24 }, (_, i) => {
                const a = (i * 360) / 24;
                const rad = (a * Math.PI) / 180;
                const x1 = TPX + Math.cos(rad) * 27;
                const y1 = TPY + Math.sin(rad) * 27;
                const x2 = TPX + Math.cos(rad) * 33;
                const y2 = TPY + Math.sin(rad) * 33;
                return (
                  <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="#1e222a" strokeWidth="0.5" opacity="0.7" />
                );
              })}
              {/* Mid bearing housing */}
              <circle cx={TPX} cy={TPY} r="24"
                fill="url(#matte-blk)" stroke="#252830" strokeWidth="0.6" />
              {/* Bearing ring (chrome) */}
              <circle cx={TPX} cy={TPY} r="20"
                fill="none" stroke="url(#silver-deep)" strokeWidth="2.4" />
              {/* Bearing inner race */}
              <circle cx={TPX} cy={TPY} r="16"
                fill="url(#gimbal-metal)" stroke="#3a3e4c" strokeWidth="0.5" />
              {/* Center bearing ball */}
              <circle cx={TPX} cy={TPY} r="9"
                fill="url(#matte-blk)" stroke="#0c0d12" strokeWidth="0.4" />
              <ellipse cx={TPX - 3} cy={TPY - 3} rx="5" ry="3"
                fill="rgba(225,235,248,0.4)"
                transform={`rotate(-35, ${TPX - 3}, ${TPY - 3})`} />
              {/* 4 micro-screws on outer plate */}
              {[
                [TPX + 28, TPY, 0],
                [TPX, TPY + 28, 90],
                [TPX - 28, TPY, 180],
                [TPX, TPY - 28, 270],
              ].map(([sx, sy, deg], i) => (
                <g key={i}>
                  <circle cx={sx} cy={sy} r="2.4"
                    fill="url(#chrome)" stroke="#4a5262" strokeWidth="0.4" />
                  {deg === 0   && <line x1={sx - 2} y1={sy} x2={sx + 2} y2={sy}  stroke="#252830" strokeWidth="0.8" />}
                  {deg === 90  && <line x1={sx} y1={sy - 2} x2={sx} y2={sy + 2}  stroke="#252830" strokeWidth="0.8" />}
                  {deg === 180 && <line x1={sx - 2} y1={sy} x2={sx + 2} y2={sy}  stroke="#252830" strokeWidth="0.8" />}
                  {deg === 270 && <line x1={sx} y1={sy - 2} x2={sx} y2={sy + 2}  stroke="#252830" strokeWidth="0.8" />}
                </g>
              ))}
            </g>

            {/* Cue hydraulic lever (left of pivot) */}
            <g filter="url(#shadow-sm)">
              <rect x={TPX - 38} y={TPY - 2} width="8" height="32" rx="2"
                fill="url(#gm-brushed)" stroke="#2c3040" strokeWidth="0.4" />
              <ellipse cx={TPX - 34} cy={TPY + 30} rx="8" ry="4"
                fill="url(#gm)" stroke="#3a3e4c" strokeWidth="0.4" />
              <rect
                x={TPX - 36}
                y={active ? TPY - 14 : TPY - 4}
                width="28" height="6" rx="3"
                fill="url(#silver-deep)" stroke="#5a6878" strokeWidth="0.4"
                style={{
                  transformOrigin: `${TPX - 34}px ${TPY}px`,
                  transform: `rotate(${active ? 22 : -14}deg)`,
                  transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
              <text x={TPX - 34} y={TPY + 44}
                textAnchor="middle" fontSize="5" fill="#5a6478"
                fontFamily="sans-serif" letterSpacing="0.6">CUE</text>
            </g>

            {/* ════════════════════════════════════════════════════
                ROTATING TONEARM GROUP — nested architecture
                Outer wrapper: STATIC translate, pins pivot at (TPX, TPY) forever.
                Inner wrapper: DYNAMIC rotate, isolated from translate, with local 0,0 origin.
            ════════════════════════════════════════════════════ */}
            <g transform={`translate(${TPX}, ${TPY})`}>
              <g
                className="tonearm-spin"
                style={{
                  transform: `rotate(${active ? PLAY_ANGLE : PARK_ANGLE}deg)`,
                  transformOrigin: "0px 0px",
                  transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
              {/* ── Counterweight — straight UP from pivot (native) ── */}
              <g filter="url(#shadow-md)">
                {/* Body: vertical cylinder from pivot upward */}
                <rect
                  x={TPX - WAND_W}
                  y={TPY - CW_LEN}
                  width={WAND_W * 2}
                  height={CW_LEN}
                  rx={WAND_W}
                  fill="url(#gm-brushed)"
                  stroke="#1e222a"
                  strokeWidth="0.8"
                />
                {/* Left highlight face */}
                <rect
                  x={TPX - WAND_W + 2}
                  y={TPY - CW_LEN + 2}
                  width={WAND_W * 0.45}
                  height={CW_LEN - 4}
                  rx={WAND_W * 0.45}
                  fill="rgba(195,205,225,0.22)"
                />
                {/* Right shadow face */}
                <rect
                  x={TPX + WAND_W * 0.1}
                  y={TPY - CW_LEN + 2}
                  width={WAND_W * 0.45}
                  height={CW_LEN - 4}
                  rx={WAND_W * 0.45}
                  fill="rgba(0,0,0,0.3)"
                />
                {/* Knurl rings — horizontal stripes across the cylinder */}
                {Array.from({ length: 4 }, (_, k) => {
                  const ky = TPY - CW_LEN + 10 * (k + 1);
                  return (
                    <line key={k}
                      x1={TPX - WAND_W + 1}
                      y1={ky}
                      x2={TPX + WAND_W - 1}
                      y2={ky}
                      stroke="#1e222a"
                      strokeWidth="1"
                    />
                  );
                })}
                {/* Domed end cap at far end (top) */}
                <ellipse
                  cx={TPX}
                  cy={TPY - CW_LEN}
                  rx={WAND_W * 0.9}
                  ry={WAND_W * 0.55}
                  fill="url(#gm)"
                  stroke="#252830"
                  strokeWidth="0.6"
                />
                {/* Highlight catch on end cap */}
                <ellipse
                  cx={TPX - WAND_W * 0.3}
                  cy={TPY - CW_LEN - 1}
                  rx={WAND_W * 0.5}
                  ry={WAND_W * 0.22}
                  fill="rgba(225,235,248,0.4)"
                />
                {/* Scale markings -5 and +5 */}
                <text
                  x={TPX - WAND_W - 4}
                  y={TPY - CW_LEN / 2}
                  textAnchor="end"
                  fontSize="4.5"
                  fill="#7a8598"
                  fontFamily="monospace"
                >-5</text>
                <text
                  x={TPX + WAND_W + 4}
                  y={TPY - CW_LEN / 2}
                  textAnchor="start"
                  fontSize="4.5"
                  fill="#7a8598"
                  fontFamily="monospace"
                >+5</text>
              </g>

              {/* ── S-Wand — straight DOWN from pivot, gentle S bowing right ── */}
              {(() => {
                // Wand is drawn from pivot (0,0) down to (0, +WAND_LEN).
                // S-curve bows right: control points push x positive then back to 0.
                //   cp1: ( 14,  55) — bulge right early
                //   cp2: ( 14, 165) — bulge right late
                //   end: (  0, 220) — straight down at tip
                const cp1x = 14, cp1y = 55;
                const cp2x = 14, cp2y = 165;
                const ex = 0, ey = WAND_LEN;
                const D = WAND_W;
                return (
                  <g>
                    {/* Shadow outline */}
                    <path
                      d={`M 0,0 C ${cp1x},${cp1y} ${cp2x},${cp2y} ${ex},${ey}`}
                      fill="none"
                      stroke="rgba(0,0,0,0.5)"
                      strokeWidth={D * 2 + 3}
                      strokeLinecap="round"
                    />
                    {/* Main tube body — metallic gradient stroke */}
                    <path
                      d={`M 0,0 C ${cp1x},${cp1y} ${cp2x},${cp2y} ${ex},${ey}`}
                      fill="none"
                      stroke="url(#silver-deep)"
                      strokeWidth={D * 2}
                      strokeLinecap="round"
                    />
                    {/* Specular highlight along left (inner) edge of curve */}
                    <path
                      d={`M ${-D * 0.4},${D * 0.6} C ${cp1x - D},${cp1y} ${cp2x - D},${cp2y} ${ex - D * 0.4},${ey - D * 0.6}`}
                      fill="none"
                      stroke="rgba(245,250,255,0.55)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    {/* Dark outer (right) curve shadow */}
                    <path
                      d={`M ${D * 0.4},${D * 0.6} C ${cp1x + D},${cp1y + 2} ${cp2x + D},${cp2y + 2} ${ex + D * 0.4},${ey - D * 0.4}`}
                      fill="none"
                      stroke="rgba(20,25,35,0.45)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </g>
                );
              })()}

              {/* ── Headshell — mounted at the bottom tip of the wand (0, +WAND_LEN) ── */}
              <g
                filter="url(#shadow-sm)"
                transform={`translate(0, ${WAND_LEN}) rotate(25)`}
              >
                {/* Headshell body: rectangular block ~52×20 with trapezoidal front */}
                <path
                  d="M -26,-10 L 12,-10 L 24,-5 L 24,8 L 12,12 L -26,10 Z"
                  fill="url(#matte-blk)"
                  stroke="#252830"
                  strokeWidth="0.8"
                />
                {/* Top highlight face */}
                <path
                  d="M -25,-9 L 11,-9 L 22,-5 L -25,-4 Z"
                  fill="rgba(195,205,225,0.2)"
                />
                {/* Bottom shadow face */}
                <path
                  d="M -25,9 L 11,11 L 22,4 L -25,4 Z"
                  fill="rgba(0,0,0,0.4)"
                />
                {/* Gold connector ring at base of headshell (attaches to wand tip) */}
                <ellipse cx="-22" cy="0" rx="6.5" ry="9"
                  fill="url(#gold)" stroke="#7c6018" strokeWidth="0.6" />
                {/* Finger lift — protruding past front of headshell */}
                <rect x="12" y="-10" width="10" height="20" rx="2.5"
                  fill="url(#gm-brushed)" stroke="#3a3e4c" strokeWidth="0.5" />
                {[0, 1, 2].map((i) => (
                  <line key={i}
                    x1="14" y1={-5 + i * 5}
                    x2="20" y2={-5 + i * 5}
                    stroke="#1e222a" strokeWidth="0.8" />
                ))}
                {/* Cartridge body — mounted on the front half of headshell */}
                <g transform="translate(-2, 0)">
                  {/* Cartridge main body */}
                  <rect x="-15" y="-9" width="30" height="18" rx="3"
                    fill="url(#cartridge)" stroke="#1e222a" strokeWidth="0.6" />
                  {/* Top face detail */}
                  <rect x="-12" y="-8" width="24" height="6" rx="1.5"
                    fill="rgba(78,88,105,0.25)" />
                  {/* Mounting screws */}
                  <circle cx="-8" cy="-5" r="1.8"
                    fill="url(#chrome)" stroke="#4a5262" strokeWidth="0.4" />
                  <circle cx="-8" cy="5" r="1.8"
                    fill="url(#chrome)" stroke="#4a5262" strokeWidth="0.4" />
                  {/* Cantilever tube (chrome) — pointing forward (right in headshell local frame) */}
                  <line x1="15" y1="0" x2="30" y2="4"
                    stroke="url(#chrome)" strokeWidth="2.2" strokeLinecap="round" />
                  {/* Stylus mount */}
                  <circle cx="31" cy="4.5" r="1.8"
                    fill="url(#chrome)" stroke="#6a7888" strokeWidth="0.4" />
                  {/* Diamond stylus */}
                  <polygon points="33,1 38,4.5 33,8 35,4.5"
                    fill="#cc1a4a" stroke="#aa1240" strokeWidth="0.4" />
                </g>
              </g>
              </g>
            </g>

            {/* Stylus contact indicator (glows at tip when playing) */}
            <circle
              cx={tipX}
              cy={tipY}
              r={active ? 4 : 0}
              fill="#cc1a4a"
              opacity={active ? 0.7 : 0}
              style={{
                filter: "url(#shadow-sm)",
                transition: "opacity 0.7s ease, r 0.4s ease",
              }}
            />

            {/* ════════════════════════════════════════════════════
                PITCH FADER — far right edge, vertical track
            ════════════════════════════════════════════════════ */}
            <g>
              {/* Fader track recess (dark groove) */}
              <rect
                x={PITCH_X - 4}
                y={PITCH_Y}
                width="8"
                height={PITCH_LEN}
                rx="3"
                fill="#06070b"
                stroke="#252830"
                strokeWidth="0.5"
              />
              {/* Inner track shadow */}
              <rect
                x={PITCH_X - 2}
                y={PITCH_Y + 2}
                width="4"
                height={PITCH_LEN - 4}
                rx="2"
                fill="url(#matte-blk)"
              />
              {/* Scale tick marks: +% top, -% bottom, 0 middle */}
              {Array.from({ length: 9 }, (_, i) => {
                const t = i / 8; // 0..1
                const y = PITCH_Y + t * PITCH_LEN;
                const isMajor = i === 0 || i === 4 || i === 8;
                return (
                  <g key={i}>
                    <line
                      x1={PITCH_X + 5} y1={y}
                      x2={PITCH_X + (isMajor ? 14 : 9)} y2={y}
                      stroke={isMajor ? "#7a8598" : "#3c4352"}
                      strokeWidth={isMajor ? 0.8 : 0.5}
                    />
                  </g>
                );
              })}
              {/* Scale labels */}
              <text x={PITCH_X + 17} y={PITCH_Y + 3} fontSize="6" fill="#7a8598" fontFamily="monospace">+8%</text>
              <text x={PITCH_X + 17} y={PITCH_Y + PITCH_LEN / 2 + 2} fontSize="6" fill="#7a8598" fontFamily="monospace">0</text>
              <text x={PITCH_X + 17} y={PITCH_Y + PITCH_LEN + 4} fontSize="6" fill="#7a8598" fontFamily="monospace">-8%</text>
              {/* Fader handle knob — centered at 0% */}
              <g
                style={{
                  transform: `translate(${PITCH_X}px, ${PITCH_Y + PITCH_LEN / 2 - pitch * (PITCH_LEN / 16)}px)`,
                  transition: "transform 0.15s ease-out",
                }}
              >
                {/* Knob shadow */}
                <rect x={-9} y={-7} width="18" height="14" rx="2.5"
                  fill="rgba(0,0,0,0.6)" opacity="0.5" filter="url(#shadow-sm)" />
                {/* Knob body — brushed silver cap */}
                <rect x={-9} y={-7} width="18" height="14" rx="2.5"
                  fill="url(#silver-deep)" stroke="#3a3e4c" strokeWidth="0.5" />
                {/* Center indicator line */}
                <line x1={-6} y1={0} x2={6} y2={0}
                  stroke="#1a1d24" strokeWidth="1.2" />
                {/* Side grip lines */}
                <line x1={-7} y1={-3.5} x2={-7} y2={3.5} stroke="#252830" strokeWidth="0.5" />
                <line x1={7} y1={-3.5} x2={7} y2={3.5} stroke="#252830" strokeWidth="0.5" />
                {/* Specular */}
                <rect x={-8} y={-6} width="16" height="3" rx="1.5"
                  fill="rgba(255,255,255,0.35)" />
              </g>
              {/* "PITCH" label */}
              <text x={PITCH_X} y={PITCH_Y - 6} textAnchor="middle"
                fontSize="6" fill="#5a6478" fontFamily="sans-serif"
                letterSpacing="0.8">PITCH</text>
            </g>

          </svg>

          {/* ════════════════════════════════════════════════════
              BOTTOM-LEFT HARDWARE CONTROLS OVERLAY (Tailwind)
          ════════════════════════════════════════════════════ */}
          <div className="absolute left-3 bottom-3 z-30 flex items-end gap-3 pointer-events-auto">
            {/* Power Switch with red LED */}
            <div className="flex flex-col items-center gap-1">
              <div className="relative">
                <div
                  className="w-9 h-9 rounded-md border border-white/[0.06] flex items-center justify-center"
                  style={{
                    background: "linear-gradient(180deg, #2a3038 0%, #181a22 50%, #0e1015 100%)",
                    boxShadow: "inset 0 0 6px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  <button
                    onClick={toggleInternal}
                    aria-label="Power"
                    className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: active
                        ? "radial-gradient(circle at 35% 30%, #e85858 0%, #a82828 60%, #581418 100%)"
                        : "radial-gradient(circle at 35% 30%, #5a626c 0%, #2c3040 60%, #14161a 100%)",
                      boxShadow: active
                        ? "0 0 8px rgba(220,50,50,0.6), inset 0 1px 2px rgba(255,200,200,0.4)"
                        : "inset 0 1px 2px rgba(255,255,255,0.1)",
                    }}
                  >
                    {/* Red LED */}
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: active ? "#ff3a3a" : "#3a1010",
                        boxShadow: active
                          ? "0 0 6px rgba(255,58,58,0.9), 0 0 12px rgba(255,58,58,0.4)"
                          : "none",
                      }}
                    />
                  </button>
                </div>
              </div>
              <span className="text-[7px] font-mono text-neutral-500 tracking-[0.15em] uppercase">Power</span>
            </div>

            {/* Start/Stop button */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={toggleInternal}
                aria-label={active ? "Stop" : "Start"}
                className="w-11 h-11 rounded-md border border-white/[0.08] flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(180deg, #2c3542 0%, #161822 50%, #0e1015 100%)",
                  boxShadow: active
                    ? "inset 0 0 12px rgba(0,216,246,0.25), 0 0 10px rgba(0,216,246,0.2), 0 3px 8px rgba(0,0,0,0.5)"
                    : "inset 0 0 6px rgba(0,0,0,0.7), 0 3px 8px rgba(0,0,0,0.5)",
                }}
              >
                {active ? (
                  <div className="flex gap-1">
                    <div className="w-1 h-4 rounded-sm bg-cyan-400" />
                    <div className="w-1 h-4 rounded-sm bg-cyan-400" />
                  </div>
                ) : (
                  <div
                    className="w-0 h-0 ml-0.5"
                    style={{
                      borderLeft: "8px solid #00d8f6",
                      borderTop: "6px solid transparent",
                      borderBottom: "6px solid transparent",
                      filter: "drop-shadow(0 0 4px rgba(0,216,246,0.6))",
                    }}
                  />
                )}
              </button>
              <span className="text-[7px] font-mono text-neutral-500 tracking-[0.15em] uppercase">
                {active ? "Stop" : "Start"}
              </span>
            </div>

            {/* Speed selectors 33 / 45 */}
            <div className="flex flex-col gap-1">
              <div className="flex gap-1">
                {[33, 45].map((rpm) => (
                  <button
                    key={rpm}
                    onClick={() => setSpeed(rpm as 33 | 45)}
                    aria-label={`${rpm} RPM`}
                    aria-pressed={speed === rpm}
                    className={`w-9 h-5 rounded text-[9px] font-mono font-bold transition-all ${
                      speed === rpm
                        ? "text-cyan-300"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                    style={{
                      background: speed === rpm
                        ? "linear-gradient(180deg, #0a3540 0%, #082832 100%)"
                        : "linear-gradient(180deg, #1a1c24 0%, #0c0d12 100%)",
                      boxShadow: speed === rpm
                        ? "inset 0 0 6px rgba(0,216,246,0.3), 0 0 4px rgba(0,216,246,0.2)"
                        : "inset 0 0 4px rgba(0,0,0,0.6)",
                      border: speed === rpm
                        ? "1px solid rgba(0,216,246,0.4)"
                        : "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    {rpm}
                  </button>
                ))}
              </div>
              <span className="text-[7px] font-mono text-neutral-500 tracking-[0.15em] uppercase text-center">RPM</span>
            </div>
          </div>

        </div>

        {/* ── Isolation feet ── */}
        {[
          "left-3 bottom-3",
          "right-3 bottom-3",
          "left-3 top-3",
          "right-3 top-3",
        ].map((pos, i) => (
          <div
            key={i}
            className={`absolute ${pos} w-2 h-2 rounded-full border border-white/[0.05] shadow-[0_2px_4px_rgba(0,0,0,0.6)]`}
            style={{
              background: "radial-gradient(circle, #2a3038 0%, #0a0c10 100%)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
