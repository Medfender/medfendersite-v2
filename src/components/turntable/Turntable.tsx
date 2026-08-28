"use client";

import React, { useState, useMemo } from "react";

/**
 * Turntable — luxury audiophile chassis.
 *
 * One unified 720×520 viewBox hosts the Platter, Tonearm, and Hardware Controls
 * in a single coordinate system, so mounting is exact.
 *
 * Coordinate map:
 *   Plinth  : full viewBox, 0 0 720 520
 *   Platter : center (215, 215), outer radius 175 (so vinyl outer edge ≈ 295)
 *   Tonearm : pivot (445, 200); arm extends leftward
 *              - parked : rotated +30° → headshell rests on arm rest at left
 *              - playing: rotated -12° → headshell tips the outer vinyl groove
 *   Strobe dots: arranged at radius 165 on platter
 *   Hardware: bottom row at y=440 (outside this SVG, in Tailwind overlay)
 *
 * Hardware controls (power, start/stop, speed, pitch) are rendered in Tailwind
 * absolutely-positioned on top of the deck.
 */

// ── Helpers ──────────────────────────────────────────────────────────────
const cos = (deg: number) => Math.cos((deg * Math.PI) / 180);
const sin = (deg: number) => Math.sin((deg * Math.PI) / 180);

export default function Turntable({ className }: { className?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<33 | 45>(33);
  const [pitch, setPitch] = useState(0); // -50 to +50

  // Platter coordinates
  const PCX = 215;
  const PCY = 215;
  const PLATTER_R = 175;     // outer platter edge
  const VINYL_R = 145;       // vinyl record radius
  const LABEL_R = 48;        // center label
  const STROBE_R = PLATTER_R - 18; // strobe dot ring
  const SPINDLE_R = 14;
  const DOT_COUNT = 33;

  // Tonearm coordinates
  const TPX = 445;  // gimbal pivot X
  const TPY = 200;  // gimbal pivot Y
  const HSX_END = -260; // headshell tip relative to pivot (left = negative)
  const HSY_END = 25;   // slight downward offset
  const REST_X = TPX - 110;
  const REST_Y = TPY;
  const PARK_ANGLE = 30;  // parked: headshell rests on arm rest
  const PLAY_ANGLE = -12; // playing: stylus tips outer groove
  const armAngle = isPlaying ? PLAY_ANGLE : PARK_ANGLE;

  // Strobe dots
  const dots = useMemo(
    () =>
      Array.from({ length: DOT_COUNT }, (_, i) => {
        const deg = (i * 360) / DOT_COUNT - 90;
        return {
          x: PCX + cos(deg) * STROBE_R,
          y: PCY + sin(deg) * STROBE_R,
        };
      }),
    [PCX, PCY, STROBE_R]
  );

  // Compute where the stylus tip lands when playing.
  // The headshell extends from pivot at angle (armAngle) for distance
  // sqrt(HSX_END^2 + HSY_END^2), so tip position in deck coords:
  const wandLen = Math.hypot(HSX_END, HSY_END);
  const wandBaseAng = Math.atan2(HSY_END, HSX_END); // angle of HS_END vector (radians)
  const tipAngle = wandBaseAng + (armAngle * Math.PI) / 180;
  const tipX = TPX + Math.cos(tipAngle) * wandLen;
  const tipY = TPY + Math.sin(tipAngle) * wandLen;
  // Distance from platter center
  const tipFromCenter = Math.hypot(tipX - PCX, tipY - PCY);

  return (
    <div
      className={`relative w-full max-w-[820px] mx-auto ${className}`}
      style={{
        filter: "drop-shadow(0 60px 80px rgba(0,0,0,0.85))",
      }}
    >
      {/* ════════════════════════════════════════════════════════
          OUTER PLINTH (chassis bezel) — Tailwind
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
        {/* Inner deck — bevel */}
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
              .vinyl-spin { animation: ${isPlaying ? "spin-vinyl 2.4s linear infinite" : "none"}; }
              .strobe-spin { animation: ${isPlaying ? "spin-vinyl 2.4s linear infinite" : "none"}; }
              .tonearm-spin { transition: transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94); }
            `}</style>

            <defs>
              {/* Gunmetal (structural) */}
              <linearGradient id="gm" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="#3c4352" />
                <stop offset="28%"  stopColor="#5c6678" />
                <stop offset="52%"  stopColor="#7c8698" />
                <stop offset="76%"  stopColor="#5c6678" />
                <stop offset="100%" stopColor="#2c3340" />
              </linearGradient>
              {/* Brushed gunmetal — micro horizontal banding */}
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
              {/* Brushed silver / die-cast aluminum */}
              <linearGradient id="silver-deep" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="#8892a0" />
                <stop offset="20%"  stopColor="#b8c0cc" />
                <stop offset="50%"  stopColor="#707a88" />
                <stop offset="80%"  stopColor="#c8d0da" />
                <stop offset="100%" stopColor="#6a7488" />
              </linearGradient>
              {/* Chrome */}
              <linearGradient id="chrome" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="#edf1f7" />
                <stop offset="12%"  stopColor="#9aaab8" />
                <stop offset="28%"  stopColor="#dde6ef" />
                <stop offset="50%"  stopColor="#f4f7fb" />
                <stop offset="72%"  stopColor="#a8b8c8" />
                <stop offset="88%"  stopColor="#d8e2ec" />
                <stop offset="100%" stopColor="#788898" />
              </linearGradient>
              {/* Gold */}
              <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="#a88220" />
                <stop offset="30%"  stopColor="#dcaa42" />
                <stop offset="62%"  stopColor="#be942e" />
                <stop offset="100%" stopColor="#7c6018" />
              </linearGradient>
              {/* Cartridge body */}
              <linearGradient id="cartridge" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="#1c2028" />
                <stop offset="50%"  stopColor="#262c38" />
                <stop offset="100%" stopColor="#0c0e14" />
              </linearGradient>
              {/* Counterweight radial */}
              <radialGradient id="cw-rad" cx="38%" cy="32%" r="62%">
                <stop offset="0%"   stopColor="#7c8698" />
                <stop offset="58%"  stopColor="#4a5262" />
                <stop offset="100%" stopColor="#2c3040" />
              </radialGradient>
              {/* Hydraulic lever */}
              <linearGradient id="hydraulic" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="#9aacbc" />
                <stop offset="42%"  stopColor="#c0d0e0" />
                <stop offset="100%" stopColor="#708090" />
              </linearGradient>
              {/* Anti-skate dial face */}
              <radialGradient id="dial-face" cx="45%" cy="40%" r="55%">
                <stop offset="0%"   stopColor="#2c3040" />
                <stop offset="100%" stopColor="#10121a" />
              </radialGradient>
              {/* Vinyl base */}
              <linearGradient id="vinyl-deep" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#0e0f14" />
                <stop offset="40%"  stopColor="#12141a" />
                <stop offset="70%"  stopColor="#080810" />
                <stop offset="100%" stopColor="#06070e" />
              </linearGradient>
              {/* Vinyl band (slight variation) */}
              <linearGradient id="vinyl-mid" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#141620" />
                <stop offset="50%"  stopColor="#161828" />
                <stop offset="100%" stopColor="#101218" />
              </linearGradient>
              {/* Specular sheen */}
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
              <filter id="shadow-lg" x="-50%" y="-35%" width="200%" height="200%">
                <feDropShadow dx="4" dy="8" stdDeviation="8" floodColor="#000" floodOpacity="0.82" />
              </filter>
            </defs>

            {/* ════════════════════════════════════════════════════
                PLATTER — die-cast aluminum edge + vinyl + spindle
            ════════════════════════════════════════════════════ */}

            {/* Platter surface (subtle brushed disk beneath the rim) */}
            <circle cx={PCX} cy={PCY} r={PLATTER_R + 5}
              fill="#0c0d12" />

            {/* Platter rim — thick brushed silver */}
            <g filter="url(#shadow-md)">
              <circle cx={PCX} cy={PCY} r={PLATTER_R}
                fill="none" stroke="url(#silver-deep)" strokeWidth="22" />
              {/* Inner bevel — dark gunmetal */}
              <circle cx={PCX} cy={PCY} r={PLATTER_R - 11}
                fill="none" stroke="url(#gm-brushed)" strokeWidth="8" />
              {/* Deep inner shadow transition */}
              <circle cx={PCX} cy={PCY} r={PLATTER_R - 22}
                fill="none" stroke="#0a0c12" strokeWidth="6" />
              {/* Top-left chrome specular arc */}
              <path
                d={`M ${PCX},${PCY - PLATTER_R + 4} A ${PLATTER_R - 4} ${PLATTER_R - 4} 0 0 1 ${PCX},${PCY - PLATTER_R - 22}`}
                fill="none" stroke="#d8e0ec" strokeWidth="2" opacity="0.5"
              />
            </g>

            {/* Strobe dots — recessed speed mirrors, rotating with platter */}
            <g className={isPlaying ? "strobe-spin" : ""}
              style={{ transformOrigin: `${PCX}px ${PCY}px` }}>
              {dots.map((dot, i) => (
                <g key={i}>
                  <circle cx={dot.x} cy={dot.y} r="5"
                    fill="#0a0c12" stroke="#181a22" strokeWidth="0.5" />
                  <circle cx={dot.x} cy={dot.y} r="3.2"
                    fill="url(#chrome)" opacity="0.92" />
                  <circle cx={dot.x - 1} cy={dot.y - 1} r="1.2"
                    fill="rgba(235,242,252,0.7)" />
                </g>
              ))}
            </g>

            {/* Vinyl record — rotating */}
            <g className="vinyl-spin"
              style={{ transformOrigin: `${PCX}px ${PCY}px` }}>
              {/* Base black */}
              <circle cx={PCX} cy={PCY} r={VINYL_R} fill="url(#vinyl-deep)" />
              {/* Micro-groove concentric bands */}
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
              <line x1={PCX - 16} y1={PCY + 4} x2={PCX + 16} y2={PCY + 4}
                stroke="#8a7860" strokeWidth="1" opacity="0.5" />
            </g>

            {/* Specular highlight (static overlay) */}
            <g style={{ pointerEvents: "none" }}>
              <path
                d={`M ${PCX - 95},${PCY - 35} Q ${PCX + 10},${PCY - 75} ${PCX + 90},${PCY - 20} L ${PCX + 25},${PCY + 60} Q ${PCX - 25},${PCY + 25} ${PCX - 80},${PCY - 35} Z`}
                fill="url(#spec-strong)" />
              <path
                d={`M ${PCX - 55},${PCY - 95} Q ${PCX + 35},${PCY - 60} ${PCX + 60},${PCY - 10}`}
                fill="none" stroke="#f0f4f8" strokeWidth="6" opacity="0.32" />
              <ellipse
                cx={PCX + 30} cy={PCY - 30} rx="30" ry="10"
                fill="rgba(245,250,255,0.22)"
                transform={`rotate(-15, ${PCX + 30}, ${PCY - 30})`} />
            </g>

            {/* Vinyl outer edge ring */}
            <circle cx={PCX} cy={PCY} r={VINYL_R}
              fill="none" stroke="#8898aa" strokeWidth="1" opacity="0.3" />

            {/* Center spindle — polished chrome */}
            <g filter="url(#shadow-sm)">
              <ellipse cx={PCX} cy={PCY + 3}
                rx={SPINDLE_R * 1.1} ry={SPINDLE_R * 0.8}
                fill="rgba(0,0,0,0.5)" opacity="0.55" />
              <ellipse cx={PCX} cy={PCY - 6}
                rx={SPINDLE_R} ry={SPINDLE_R - 1.5}
                fill="url(#chrome)" stroke="#8898a8" strokeWidth="0.5" />
              <ellipse cx={PCX} cy={PCY - 12}
                rx={SPINDLE_R - 2} ry={SPINDLE_R - 3.5}
                fill="url(#chrome)" stroke="#5a6a78" strokeWidth="0.4" />
              <ellipse cx={PCX - 3} cy={PCY - 10}
                rx="4" ry="5.5"
                fill="rgba(250,252,255,0.9)"
                transform={`rotate(-35, ${PCX - 3}, ${PCY - 10})`} />
              <ellipse cx={PCX + 2} cy={PCY - 8}
                rx="2.5" ry="3"
                fill="rgba(250,252,255,0.5)" />
              <circle cx={PCX} cy={PCY - 1.5}
                r={SPINDLE_R + 3.5}
                fill="none" stroke="#a0a8b8" strokeWidth="1" opacity="0.7" />
            </g>

            {/* ════════════════════════════════════════════════════
                TONEARM — placed to the right of platter
            ════════════════════════════════════════════════════ */}

            {/* Arm Rest — left of pivot */}
            <g filter="url(#shadow-md)">
              <rect x={REST_X + 18} y={REST_Y - 40}
                width="20" height="44" rx="4"
                fill="url(#gm-brushed)" stroke="#1e222a" strokeWidth="0.6" />
              <rect x={REST_X} y={REST_Y + 2}
                width="50" height="11" rx="3"
                fill="url(#gm-brushed)" stroke="#1e222a" strokeWidth="0.6" />
              <ellipse cx={REST_X + 28} cy={REST_Y - 1}
                rx="24" ry="7"
                fill="url(#matte-blk)" stroke="#2c3040" strokeWidth="0.6" />
              <rect x={REST_X - 3} y={REST_Y - 25}
                width="13" height="15" rx="2"
                fill="url(#chrome)" stroke="#5a6478" strokeWidth="0.4" />
              {[-7, 7].map((dx, i) => (
                <circle key={i} cx={REST_X + 28 + dx} cy={REST_Y - 35} r="2.5"
                  fill="url(#chrome)" stroke="#4a5262" strokeWidth="0.3" />
              ))}
              <text x={REST_X + 28} y={REST_Y + 22}
                textAnchor="middle" fontSize="6" fill="#4a5060"
                fontFamily="sans-serif" letterSpacing="0.5">REST</text>
            </g>

            {/* Arm Base Column */}
            <g filter="url(#shadow-md)">
              <rect x={TPX - 15} y={TPY + 18}
                width="30" height="11" rx="2.5"
                fill="url(#gm-brushed)" stroke="#1e222a" strokeWidth="0.6" />
              <rect x={TPX - 15} y={TPY - 10}
                width="30" height="30" rx="5"
                fill="url(#matte-blk)" stroke="#252830" strokeWidth="0.6" />
              <ellipse cx={TPX} cy={TPY - 8} rx="18" ry="6"
                fill="url(#gm)" stroke="#3a3e4c" strokeWidth="0.5" />
              <ellipse cx={TPX} cy={TPY + 18} rx="14" ry="4"
                fill="url(#gm-brushed)" stroke="#3a3e4c" strokeWidth="0.4" />
              <circle cx={TPX - 18} cy={TPY + 24} r="3.5"
                fill="url(#chrome)" stroke="#4a5262" strokeWidth="0.4" />
              <circle cx={TPX + 18} cy={TPY + 24} r="3.5"
                fill="url(#chrome)" stroke="#4a5262" strokeWidth="0.4" />
            </g>

            {/* Gimbal Bearing Housing */}
            <g filter="url(#shadow-md)">
              <circle cx={TPX} cy={TPY} r="32"
                fill="none" stroke="url(#gm)" strokeWidth="6" />
              <circle cx={TPX} cy={TPY} r="26"
                fill="url(#matte-blk)" stroke="#252830" strokeWidth="0.6" />
              <circle cx={TPX} cy={TPY} r="21"
                fill="url(#chrome)" stroke="#7a8898" strokeWidth="0.5" />
              <circle cx={TPX} cy={TPY} r="14"
                fill="url(#matte-blk)" stroke="#0c0d12" strokeWidth="0.4" />
              <ellipse cx={TPX - 6} cy={TPY - 6} rx="8" ry="5"
                fill="rgba(225,235,248,0.4)"
                transform={`rotate(-35, ${TPX - 6}, ${TPY - 6})`} />
              <ellipse cx={TPX + 8} cy={TPY - 4} rx="4" ry="2"
                fill="rgba(225,235,248,0.15)"
                transform={`rotate(20, ${TPX + 8}, ${TPY - 4})`} />
              {/* 4 micro-screws */}
              {[
                [TPX + 26, TPY, 0],
                [TPX, TPY + 26, 90],
                [TPX - 26, TPY, 180],
                [TPX, TPY - 26, 270],
              ].map(([sx, sy, deg], i) => (
                <g key={i}>
                  <circle cx={sx} cy={sy} r="3.2"
                    fill="url(#chrome)" stroke="#4a5262" strokeWidth="0.4" />
                  {deg === 0   && <line x1={TPX + 22} y1={TPY} x2={TPX + 30} y2={TPY}  stroke="#252830" strokeWidth="1" />}
                  {deg === 90  && <line x1={TPX} y1={TPY + 22} x2={TPX} y2={TPY + 30}  stroke="#252830" strokeWidth="1" />}
                  {deg === 180 && <line x1={TPX - 30} y1={TPY} x2={TPX - 22} y2={TPY}  stroke="#252830" strokeWidth="1" />}
                  {deg === 270 && <line x1={TPX} y1={TPY - 30} x2={TPX} y2={TPY - 22} stroke="#252830" strokeWidth="1" />}
                </g>
              ))}
            </g>

            {/* Anti-skate dial — below-left of gimbal */}
            <g filter="url(#shadow-sm)">
              <circle cx={TPX - 50} cy={TPY + 35} r="22"
                fill="url(#gm-brushed)" stroke="#1e222a" strokeWidth="0.6" />
              <circle cx={TPX - 50} cy={TPY + 35} r="22"
                fill="none" stroke="url(#chrome)" strokeWidth="2.5" strokeDasharray="2.5 4" />
              <circle cx={TPX - 50} cy={TPY + 35} r="17"
                fill="url(#dial-face)" stroke="#2c3040" strokeWidth="0.5" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
                const rad = (deg - 90) * Math.PI / 180;
                return (
                  <line key={i}
                    x1={TPX - 50 + Math.cos(rad) * 15}
                    y1={TPY + 35 + Math.sin(rad) * 15}
                    x2={TPX - 50 + Math.cos(rad) * 19}
                    y2={TPY + 35 + Math.sin(rad) * 19}
                    stroke="#4a5060" strokeWidth="1" />
                );
              })}
              <line x1={TPX - 50} y1={TPY + 35}
                x2={TPX - 50} y2={TPY + 19}
                stroke="url(#gold)" strokeWidth="3" strokeLinecap="round" />
              <circle cx={TPX - 50} cy={TPY + 35} r="4.5"
                fill="url(#chrome)" stroke="#5a6478" strokeWidth="0.4" />
              <text x={TPX - 50} y={TPY + 17} textAnchor="middle"
                fontSize="6" fill="#8a9aaa" fontFamily="monospace">2</text>
              <text x={TPX - 33} y={TPY + 38} textAnchor="middle"
                fontSize="6" fill="#8a9aaa" fontFamily="monospace">3</text>
              <text x={TPX - 50} y={TPY + 56} textAnchor="middle"
                fontSize="6" fill="#8a9aaa" fontFamily="monospace">1</text>
              <text x={TPX - 67} y={TPY + 38} textAnchor="middle"
                fontSize="6" fill="#8a9aaa" fontFamily="monospace">0</text>
              <text x={TPX - 50} y={TPY + 70}
                textAnchor="middle" fontSize="5" fill="#5a6478"
                fontFamily="sans-serif" letterSpacing="0.6">ANTI-SKATE</text>
            </g>

            {/* Cue hydraulic lever — right of gimbal */}
            <g filter="url(#shadow-sm)">
              <rect x={TPX + 24} y={TPY - 3} width="10" height="38" rx="3"
                fill="url(#gm-brushed)" stroke="#2c3040" strokeWidth="0.5" />
              <ellipse cx={TPX + 29} cy={TPY + 35} rx="9" ry="4.5"
                fill="url(#gm)" stroke="#3a3e4c" strokeWidth="0.5" />
              <rect
                x={TPX + 14}
                y={isPlaying ? TPY - 17 : TPY - 7}
                width="32" height="7" rx="3.5"
                fill="url(#hydraulic)" stroke="#5a6878" strokeWidth="0.5"
                style={{
                  transformOrigin: `${TPX + 29}px ${TPY}px`,
                  transform: `rotate(${isPlaying ? 22 : -14}deg)`,
                  transition: "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)",
                }}
              />
              <circle
                cx={TPX + 14} cy={isPlaying ? TPY - 20 : TPY - 8}
                r="6"
                fill="url(#chrome)" stroke="#6a7888" strokeWidth="0.4"
                style={{
                  transformOrigin: `${TPX + 29}px ${TPY}px`,
                  transform: `rotate(${isPlaying ? 22 : -14}deg)`,
                  transition: "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)",
                }}
              />
              <circle cx={TPX + 29} cy={TPY} r="2.8"
                fill="url(#chrome)" stroke="#4a5262" strokeWidth="0.3" />
              <text x={TPX + 29} y={TPY + 50}
                textAnchor="middle" fontSize="5" fill="#5a6478"
                fontFamily="sans-serif" letterSpacing="0.6">CUE</text>
            </g>

            {/* VTA fine-tune screw */}
            <g filter="url(#shadow-sm)">
              <circle cx={TPX + 38} cy={TPY - 16} r="6"
                fill="url(#chrome)" stroke="#4a5262" strokeWidth="0.4" />
              <line x1={TPX + 38 - 3.5} y1={TPY - 16}
                x2={TPX + 38 + 3.5} y2={TPY - 16}
                stroke="#252830" strokeWidth="1.4" />
              <text x={TPX + 38} y={TPY - 28}
                textAnchor="middle" fontSize="5" fill="#5a6478"
                fontFamily="sans-serif" letterSpacing="0.4">VTA</text>
            </g>

            {/* ════════════════════════════════════════════════════
                ROTATING TONEARM GROUP — wand + headshell + counterweight
            ════════════════════════════════════════════════════ */}
            <g
              className="tonearm-spin"
              style={{
                transformOrigin: `${TPX}px ${TPY}px`,
                transform: `rotate(${armAngle}deg)`,
              }}
            >
              {/* Counterweight — right of pivot */}
              <g filter="url(#shadow-md)">
                <rect x={TPX} y={TPY - 130}
                  width="14" height="130" rx="4"
                  fill="url(#gm-brushed)" stroke="#1e222a" strokeWidth="0.6" />
                <ellipse cx={TPX + 7} cy={TPY - 128}
                  rx="10" ry="3.5"
                  fill="url(#gm)" stroke="#3a3e4c" strokeWidth="0.5" />
                <ellipse cx={TPX + 7} cy={TPY - 145}
                  rx="26" ry="15"
                  fill="url(#cw-rad)" stroke="#1e222a" strokeWidth="0.8" />
                {[-9, -5, 0, 5, 9].map((dy, i) => (
                  <ellipse key={i}
                    cx={TPX + 7} cy={TPY - 145 + dy}
                    rx="25" ry="2.4"
                    fill="none" stroke="#1e222a" strokeWidth="1.2" />
                ))}
                <text x={TPX - 18} y={TPY - 140} textAnchor="middle"
                  fontSize="4.5" fill="#7a8598" fontFamily="monospace">-5</text>
                <text x={TPX + 32} y={TPY - 140} textAnchor="middle"
                  fontSize="4.5" fill="#7a8598" fontFamily="monospace">+5</text>
                <ellipse cx={TPX + 7} cy={TPY - 160}
                  rx="20" ry="8"
                  fill="url(#gm)" stroke="#252830" strokeWidth="0.6" />
                <ellipse cx={TPX - 1} cy={TPY - 152}
                  rx="9" ry="3.5"
                  fill="rgba(185,198,215,0.3)"
                  transform={`rotate(-12, ${TPX - 1}, ${TPY - 152})`} />
              </g>

              {/* Arm wand — extends LEFT from pivot toward headshell */}
              {/* S-curve path from pivot (0,0) to (HSX_END, HSY_END) */}
              {(() => {
                const WAND_PATH = `M 0,0
                  L ${HSX_END * 0.6},0
                  Q ${HSX_END * 0.8},0 ${HSX_END * 0.85},${HSY_END * 0.4}
                  Q ${HSX_END * 0.95},${HSY_END * 0.8} ${HSX_END},${HSY_END}`;
                return (
                  <>
                    <path d={WAND_PATH} fill="none"
                      stroke="rgba(0,0,0,0.65)" strokeWidth="9" strokeLinecap="round" />
                    <path d={WAND_PATH} fill="none"
                      stroke="url(#matte-blk)" strokeWidth="8" strokeLinecap="round" />
                    <path d={WAND_PATH} fill="none"
                      stroke="rgba(95,108,124,0.4)" strokeWidth="3" strokeLinecap="round"
                      transform="translate(0, -1.5)" />
                  </>
                );
              })()}

              {/* Locking Collar at wand tip */}
              <g filter="url(#shadow-sm)">
                <ellipse cx={HSX_END} cy={HSY_END}
                  rx="11" ry="6.5"
                  fill="url(#gm-brushed)" stroke="#252830" strokeWidth="0.5"
                  transform={`rotate(-5, ${HSX_END}, ${HSY_END})`} />
                {[-5, 0, 5].map((dy, i) => (
                  <line key={i}
                    x1={HSX_END - 5} y1={HSY_END + dy}
                    x2={HSX_END + 5} y2={HSY_END + dy}
                    stroke="#2c3040" strokeWidth="1" />
                ))}
              </g>

              {/* Headshell */}
              <g filter="url(#shadow-sm)"
                transform={`translate(${HSX_END - 70}, ${HSY_END - 1}) rotate(-5)`}>
                <path d="M 0,-9 L 90,-10 L 105,0 L 90,10 L 0,9 Z"
                  fill="url(#matte-blk)" stroke="#252830" strokeWidth="0.8" />
                <path d="M 0,-7.5 L 88,-9 L 100,-1.5 L 0,-5.5 Z"
                  fill="rgba(92,105,122,0.4)" />
                <path d="M 0,5.5 L 88,7 L 100,1.5 L 0,3.5 Z"
                  fill="rgba(0,0,0,0.5)" />
                {[1, 2, 3].map((dx, i) => (
                  <line key={i}
                    x1={88 - dx * 6} y1={-9} x2={88 - dx * 6} y2={9}
                    stroke="#252830" strokeWidth="0.9" />
                ))}

                {/* Finger lift */}
                <rect x="-20" y="-7" width="18" height="14" rx="4"
                  fill="url(#gm-brushed)" stroke="#3a3e4c" strokeWidth="0.5" />
                <line x1="-16" y1="-2" x2="-4" y2="-2" stroke="#1e222a" strokeWidth="1.2" />
                <line x1="-16" y1="2"  x2="-4" y2="2"  stroke="#1e222a" strokeWidth="1.2" />
                <line x1="-16" y1="6"  x2="-4" y2="6"  stroke="#1e222a" strokeWidth="1.2" />

                {/* Gold connector ring */}
                <ellipse cx="0" cy="0" rx="7" ry="9"
                  fill="url(#gold)" stroke="#7c6018" strokeWidth="0.5" />
                <ellipse cx="-1.5" cy="-3.5" rx="2.8" ry="3.5"
                  fill="rgba(220,190,75,0.45)" />

                {/* Cartridge */}
                <g transform="translate(38, 0)">
                  <rect x="-19" y="-15" width="50" height="30" rx="4.5"
                    fill="url(#cartridge)" stroke="#1e222a" strokeWidth="0.6" />
                  <rect x="-15" y="-14" width="42" height="10" rx="1.8"
                    fill="rgba(78,88,105,0.25)" />
                  <rect x="28" y="-12" width="6" height="24" rx="2"
                    fill="url(#matte-blk)" stroke="#252830" strokeWidth="0.4" />
                  <circle cx="-10" cy="-11" r="3.2"
                    fill="url(#chrome)" stroke="#4a5262" strokeWidth="0.4" />
                  <circle cx="-10" cy="11" r="3.2"
                    fill="url(#chrome)" stroke="#4a5262" strokeWidth="0.4" />
                  <path d="M -19,-6 Q -28,0 -19,6" fill="none"
                    stroke="#c02828" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M -19,0 Q -28,3 -19,8" fill="none"
                    stroke="#dcdce0" strokeWidth="1.4" strokeLinecap="round" />

                  {/* Cantilever */}
                  <line x1="34" y1="0" x2="58" y2="4"
                    stroke="url(#chrome)" strokeWidth="2.2" strokeLinecap="round" />
                  <circle cx="58" cy="4" r="2.4"
                    fill="url(#chrome)" stroke="#6a7888" strokeWidth="0.4" />

                  {/* Diamond stylus */}
                  <polygon
                    points="60,1 65,4 60,7 62,4"
                    fill="#cc1a4a" stroke="#aa1240" strokeWidth="0.4" />
                  <circle cx="63" cy="4" r="2"
                    fill="rgba(220,55,90,0.6)" />
                  <circle cx="62" cy="3" r="0.8"
                    fill="rgba(255,180,200,0.75)" />
                </g>
              </g>
            </g>

            {/* Stylus contact indicator — at the actual tip position */}
            <circle
              cx={tipX}
              cy={tipY}
              r={isPlaying ? 5 : 0}
              fill="#cc1a4a"
              opacity={isPlaying ? 0.75 : 0}
              style={{
                filter: "url(#shadow-sm)",
                transition: "opacity 0.7s ease, r 0.4s ease",
              }}
            />

          </svg>

          {/* ════════════════════════════════════════════════════
              HARDWARE CONTROLS OVERLAY (Tailwind) — bottom row
              Positioned in % so it scales with the deck's aspect ratio.
          ════════════════════════════════════════════════════ */}
          <div className="absolute inset-x-0 bottom-0 px-4 pb-3 z-30 flex items-end justify-between pointer-events-none">
            <div className="flex items-end gap-3 pointer-events-auto">
              {/* Power / Strobe Tower */}
              <div className="flex flex-col items-center gap-1">
                <div className="relative">
                  <div
                    className="w-7 h-9 rounded-t-md rounded-b-sm shadow-[inset_0_0_6px_rgba(0,0,0,0.6),0_2px_4px_rgba(0,0,0,0.4)] border border-white/[0.05] flex flex-col items-center pt-1.5"
                    style={{
                      background: "linear-gradient(180deg, #2a3038 0%, #181a22 50%, #0e1015 100%)",
                    }}
                  >
                    {/* Rotating power dial */}
                    <button
                      onClick={() => setIsPlaying((s) => !s)}
                      aria-label="Power"
                      className="w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_4px_rgba(220,50,50,0.4)] hover:shadow-[0_0_10px_rgba(220,50,50,0.6)] transition-shadow"
                      style={{ background: isPlaying ? "#a82828" : "#2a3038" }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_3px_rgba(220,50,50,0.8)]"
                        style={{
                          animation: isPlaying ? "spin-vinyl 0.8s linear infinite" : "none",
                        }}
                      />
                    </button>
                    {/* Strobe light */}
                    <div className="mt-auto mb-0.5 w-2 h-1 rounded-full bg-gradient-to-r from-red-500 via-rose-400 to-blue-400 shadow-[0_0_4px_rgba(220,50,50,0.6),0_0_8px_rgba(60,100,220,0.3)]" />
                  </div>
                  <div
                    className="w-10 h-1.5 rounded-full mx-auto border border-white/[0.05]"
                    style={{ background: "linear-gradient(180deg, #2a3038 0%, #181a22 100%)" }}
                  />
                </div>
                <span className="text-[7px] font-mono text-neutral-500 tracking-[0.15em] uppercase">Power</span>
              </div>

              {/* Start / Stop button */}
              <button
                onClick={() => setIsPlaying((s) => !s)}
                aria-label={isPlaying ? "Stop" : "Start"}
                className="w-9 h-9 rounded-lg shadow-[inset_0_0_6px_rgba(0,0,0,0.8),0_2px_6px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all duration-200 hover:scale-[1.05] active:scale-[0.97] border border-white/[0.06]"
                style={{
                  background: isPlaying
                    ? "linear-gradient(135deg, #2c3542 0%, #161822 50%, #0e1015 100%)"
                    : "linear-gradient(135deg, #363b48 0%, #1e232c 50%, #0e1016 100%)",
                  boxShadow: isPlaying
                    ? "inset 0 0 10px rgba(220,50,50,0.25), 0 4px 12px rgba(220,50,50,0.15)"
                    : "inset 0 0 6px rgba(0,0,0,0.6), 0 3px 10px rgba(0,0,0,0.5)",
                }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shadow-[inset_0_0_3px_rgba(0,0,0,0.5)]"
                  style={{ background: isPlaying ? "#2c3542" : "#363b48" }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-[0_0_6px_rgba(0,216,246,0.5)]"
                    style={{
                      animation: isPlaying ? "spin-vinyl 2.4s linear infinite" : "none",
                    }}
                  />
                </div>
              </button>

              {/* Speed Selectors */}
              <div className="flex flex-col gap-0.5">
                <span className="text-[6px] text-neutral-500 font-mono tracking-[0.2em] text-center mb-0.5">RPM</span>
                {[33, 45].map((rpm) => (
                  <button
                    key={rpm}
                    onClick={() => setSpeed(rpm as 33 | 45)}
                    aria-label={`${rpm} RPM`}
                    className={`w-7 h-5 rounded text-[8px] font-mono font-bold shadow-[inset_0_0_4px_rgba(0,0,0,0.5)] transition-all ${
                      speed === rpm
                        ? "bg-cyan-700/40 text-cyan-300 shadow-[0_0_6px_rgba(0,216,246,0.3)]"
                        : "bg-neutral-800/70 text-neutral-400"
                    }`}
                  >
                    {rpm}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-end gap-3 pointer-events-auto">
              {/* Pitch Fader */}
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[6px] text-neutral-500 font-mono tracking-[0.15em] uppercase">Pitch</span>
                <div
                  className="w-3 h-12 rounded-full shadow-[inset_0_0_4px_rgba(0,0,0,0.7),0_1px_3px_rgba(0,0,0,0.4)] border border-white/[0.06] relative overflow-hidden"
                  style={{
                    background: "linear-gradient(180deg, #141620 0%, #080a10 40%, #0e1016 100%)",
                  }}
                >
                  <div
                    className="absolute top-0 left-0.5 w-2 h-full rounded-full opacity-20"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
                    }}
                  />
                  <div className="absolute top-0.5 left-2 text-[5px] text-neutral-600 font-mono">+</div>
                  <div className="absolute top-1/2 -translate-y-1/2 left-1 text-[5px] text-neutral-500 font-mono">0</div>
                  <div className="absolute bottom-0.5 left-2 text-[5px] text-neutral-600 font-mono">-</div>
                  {/* Metallic cap */}
                  <div
                    className="absolute left-0 right-0 h-2 rounded-full shadow-[0_0_2px_rgba(0,0,0,0.5)] border-t border-white/[0.06]"
                    style={{
                      background: "linear-gradient(180deg, #5a6878 0%, #8898a8 40%, #4a5668 100%)",
                      top: `${50 - pitch * 0.5}%`,
                    }}
                  />
                  <div
                    className="absolute left-0 right-0 h-[1px] bg-cyan-500/40 shadow-[0_0_3px_rgba(0,216,246,0.5)]"
                    style={{ top: "50%" }}
                  />
                </div>
              </div>

              {/* Brand label */}
              <div className="flex flex-col items-end gap-0">
                <span className="text-[9px] font-bold text-neutral-300 tracking-[0.3em] uppercase">Lux</span>
                <span className="text-[7px] text-neutral-600 tracking-[0.15em] font-mono">AUDIO</span>
                <span className="text-[5px] text-neutral-700 tracking-[0.08em]">FLAGSHIP</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Isolation feet at the corners ── */}
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
