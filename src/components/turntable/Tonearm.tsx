"use client";

import React, { useMemo } from "react";

interface TonearmProps {
  /** True when the tonearm is lowered onto the vinyl record (playing) */
  isPlaying?: boolean;
  /** Additional CSS class(es) */
  className?: string;
}

/**
 * Luxury Tonearm Assembly — inspired by Technics SL-1000R / McIntosh MT10.
 *
 * ViewBox: 0 0 280 220
 *
 * Coordinate layout (within 280×220 viewBox):
 *   - Gimbal pivot at (80, 108) — at the platter's right edge (platter cx=170, r=102 → edge x=272)
 *   - The arm extends LEFT from the pivot toward the record
 *   - Arm rest: left of pivot, on the plinth surface
 *   - Counterweight: right of pivot, balanced
 *   - Headshell (when parked): ~x=24, y=112 — rests on arm rest
 *   - Headshell (when playing): ~x=148, y=116 — stylus tips vinyl groove
 *
 * All sub-assemblies:
 *   - Arm rest with magnetic latch (left of pivot)
 *   - Arm base column with plinth plate
 *   - Gimbal bearing housing with 4 slotted micro-screws
 *   - Anti-skate dial with gold pointer
 *   - Cue hydraulic lever
 *   - Counterweight with knurl rings + laser-etched scale
 *   - S-shaped matte black arm wand
 *   - Threaded locking collar
 *   - Magnesium alloy headshell + finger lift + gold connector ring
 *   - MC cartridge body, cantilever, ruby diamond stylus
 *   - VTA fine-tune screw
 *
 * Animation:
 *   Parked  (isPlaying=false): arm rotates +28° — headshell rests on arm rest (left).
 *   Playing (isPlaying=true):  arm rotates -12° — stylus tips vinyl groove.
 *
 * To mount on the Platter chassis (chassis width=640, platter center x=202, platter edge x=272):
 *   Tonearm container: positioned at chassis x=272 (aligned to platter edge), with
 *   viewBox="80 0 200 220" so the gimbal at (80, 108) maps to chassis x=272+80=352,
 *   and the headshell at (148, 116) maps to x=272+148=420 — just past the platter's
 *   vinyl outer edge at x=272+82=354.
 */
export default function Tonearm({ isPlaying = false, className }: TonearmProps) {
  // ── Coordinate system ──────────────────────────────────────────────────
  // Pivot / gimbal center sits at the platter's right edge (platter edge x=272 in chassis coords).
  // In this SVG: pivot at (80, 108).
  const px = 80;  // pivot X in local viewBox coords
  const py = 108; // pivot Y

  // Headshell geometry: arm wand extends LEFT from pivot in this design.
  // HS_END is the arm wand tip where the headshell mounts.
  // When arm is horizontal: headshell at ~(24, 112) — resting position.
  // When arm is tilted CW for playing: headshell tips the vinyl at ~(148, 116).
  const HS_END_X = 24;   // headshell tip X when parked (arm straight, pointing left)
  const HS_END_Y = 112;  // headshell tip Y

  // Arm geometry:
  // Wand starts at pivot (80, 108), extends straight left to ~x=60,
  // then bends back right in an S-curve to reach HS_END.
  // We approximate this with a simpler straight-to-curved path.
  const WAND_END_X = HS_END_X + 10; // arm wand tip before headshell

  // Angles (degrees, SVG coordinate system, y-down):
  //   +degrees = clockwise = arm swings LEFT (toward rest)
  //   -degrees = counter-clockwise = arm swings RIGHT (toward vinyl)
  const PARK_ANGLE =  28;  // parked: headshell rests on arm rest (left)
  const PLAY_ANGLE = -12;  // playing: arm lowered toward vinyl (right)
  const armAngle   = isPlaying ? PLAY_ANGLE : PARK_ANGLE;

  // ── Gradient / filter defs ──────────────────────────────────────────────
  const defs = useMemo(() => (
    <defs>
      <linearGradient id="gm" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#3c4352" />
        <stop offset="28%"  stopColor="#5c6678" />
        <stop offset="52%"  stopColor="#7c8698" />
        <stop offset="76%"  stopColor="#5c6678" />
        <stop offset="100%" stopColor="#2c3340" />
      </linearGradient>

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

      <linearGradient id="matte-blk" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%"   stopColor="#252830" />
        <stop offset="45%"  stopColor="#18191f" />
        <stop offset="100%" stopColor="#0c0d12" />
      </linearGradient>

      <linearGradient id="chrome" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%"   stopColor="#edf1f7" />
        <stop offset="12%"  stopColor="#9aaab8" />
        <stop offset="28%"  stopColor="#dde6ef" />
        <stop offset="50%"  stopColor="#f4f7fb" />
        <stop offset="72%"  stopColor="#a8b8c8" />
        <stop offset="88%"  stopColor="#d8e2ec" />
        <stop offset="100%" stopColor="#788898" />
      </linearGradient>

      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#a88220" />
        <stop offset="30%"  stopColor="#dcaa42" />
        <stop offset="62%"  stopColor="#be942e" />
        <stop offset="100%" stopColor="#7c6018" />
      </linearGradient>

      <linearGradient id="cartridge" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%"   stopColor="#1c2028" />
        <stop offset="50%"  stopColor="#262c38" />
        <stop offset="100%" stopColor="#0c0e14" />
      </linearGradient>

      <radialGradient id="cw-rad" cx="38%" cy="32%" r="62%">
        <stop offset="0%"   stopColor="#7c8698" />
        <stop offset="58%"  stopColor="#4a5262" />
        <stop offset="100%" stopColor="#2c3040" />
      </radialGradient>

      <linearGradient id="hydraulic" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%"   stopColor="#9aacbc" />
        <stop offset="42%"  stopColor="#c0d0e0" />
        <stop offset="100%" stopColor="#708090" />
      </linearGradient>

      <radialGradient id="dial-face" cx="45%" cy="40%" r="55%">
        <stop offset="0%"   stopColor="#2c3040" />
        <stop offset="100%" stopColor="#10121a" />
      </radialGradient>

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
  ), []);

  // Arm wand path (horizontal "resting" position — arm pointing left toward rest)
  const ARM_WAND = `
    M 0,0
    L ${WAND_END_X - 20},0
    Q ${WAND_END_X - 8},0 ${WAND_END_X},0
    L ${WAND_END_X},0
  `;

  // Arm wand highlight path
  const ARM_HI = `
    M 0,-1.2
    L ${WAND_END_X - 22},-1.2
    Q ${WAND_END_X - 9},-1.2 ${WAND_END_X - 1},-1.2
  `;

  // ── Arm rest position (left of pivot) ─────────────────────────────────
  // The arm rest sits left of the pivot, roughly aligned with the platter edge.
  const REST_X = px - 58; // arm rest X in local coords
  const REST_Y = py;       // arm rest Y (same as pivot height)

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <svg
      viewBox="0 0 280 220"
      className={className}
      style={{ overflow: "visible" }}
      aria-label="Tonearm assembly"
      role="img"
    >
      {defs}

      {/* ── Arm Rest & Locking Cradle (left of pivot) ────────────────────── */}
      <g id="arm-rest" filter="url(#shadow-md)">
        <rect x={REST_X + 10} y={REST_Y - 26} width="12" height="28" rx="3"
          fill="url(#gm-brushed)" stroke="#1e222a" strokeWidth="0.5" />
        <rect x={REST_X} y={REST_Y + 1} width="32" height="7" rx="2"
          fill="url(#gm-brushed)" stroke="#1e222a" strokeWidth="0.5" />
        <ellipse cx={REST_X + 16} cy={REST_Y - 1} rx="16" ry="4.5"
          fill="url(#matte-blk)" stroke="#2c3040" strokeWidth="0.5" />
        <rect x={REST_X - 2} y={REST_Y - 16} width="8" height="10" rx="1.5"
          fill="url(#chrome)" stroke="#5a6478" strokeWidth="0.3" />
        {[-4, 4].map((dx, i) => (
          <circle key={i} cx={REST_X + 16 + dx} cy={REST_Y - 22} r="1.8"
            fill="url(#chrome)" stroke="#4a5262" strokeWidth="0.3" />
        ))}
        <text x={REST_X + 16} y={REST_Y + 13}
          textAnchor="middle" fontSize="3.5" fill="#4a5060"
          fontFamily="sans-serif" letterSpacing="0.3">REST</text>
      </g>

      {/* ── Arm Base Column & Plinth Mount ────────────────────────────────── */}
      <g id="arm-base" filter="url(#shadow-md)">
        <rect x={px - 9} y={py + 10} width="18" height="7" rx="1.5"
          fill="url(#gm-brushed)" stroke="#1e222a" strokeWidth="0.5" />
        <rect x={px - 9} y={py - 6} width="18" height="18" rx="3"
          fill="url(#matte-blk)" stroke="#252830" strokeWidth="0.5" />
        <ellipse cx={px} cy={py - 5} rx="11" ry="3.5"
          fill="url(#gm)" stroke="#3a3e4c" strokeWidth="0.5" />
        <ellipse cx={px} cy={py + 11} rx="9" ry="2.5"
          fill="url(#gm-brushed)" stroke="#3a3e4c" strokeWidth="0.4" />
        <circle cx={px - 11} cy={py + 14} r="2.2"
          fill="url(#chrome)" stroke="#4a5262" strokeWidth="0.3" />
        <circle cx={px + 11} cy={py + 14} r="2.2"
          fill="url(#chrome)" stroke="#4a5262" strokeWidth="0.3" />
      </g>

      {/* ── Gimbal Bearing Housing ─────────────────────────────────────────── */}
      <g id="gimbal" filter="url(#shadow-md)">
        <circle cx={px} cy={py} r="20"
          fill="none" stroke="url(#gm)" strokeWidth="3.5" />
        <circle cx={px} cy={py} r="16"
          fill="url(#matte-blk)" stroke="#252830" strokeWidth="0.5" />
        <circle cx={px} cy={py} r="13"
          fill="url(#chrome)" stroke="#7a8898" strokeWidth="0.4" />
        <circle cx={px} cy={py} r="8.5"
          fill="url(#matte-blk)" stroke="#0c0d12" strokeWidth="0.3" />
        <ellipse cx={px - 4} cy={py - 4} rx="5" ry="3"
          fill="rgba(225,235,248,0.35)"
          transform={`rotate(-35 ${px - 4} ${py - 4})`} />
        <ellipse cx={px + 5} cy={py - 3} rx="2.5" ry="1.2"
          fill="rgba(225,235,248,0.15)"
          transform={`rotate(20 ${px + 5} ${py - 3})`} />
        {/* 4 micro-screws */}
        {[
          [px + 16, py,      0],
          [px,      py + 16, 90],
          [px - 16, py,      180],
          [px,      py - 16, 270],
        ].map(([sx, sy, deg], i) => (
          <g key={i}>
            <circle cx={sx} cy={sy} r="2.2"
              fill="url(#chrome)" stroke="#4a5262" strokeWidth="0.3" />
            {deg === 0   && <line x1={px + 14} y1={py} x2={px + 18} y2={py}   stroke="#252830" strokeWidth="0.7" />}
            {deg === 90  && <line x1={px} y1={py + 14} x2={px} y2={py + 18}   stroke="#252830" strokeWidth="0.7" />}
            {deg === 180 && <line x1={px - 18} y1={py} x2={px - 14} y2={py}   stroke="#252830" strokeWidth="0.7" />}
            {deg === 270 && <line x1={px} y1={py - 18} x2={px} y2={py - 14}  stroke="#252830" strokeWidth="0.7" />}
          </g>
        ))}
      </g>

      {/* ── Anti-Skate Dial (below-left of gimbal) ──────────────────────── */}
      <g id="anti-skate" filter="url(#shadow-sm)">
        <circle cx={px - 28} cy={py + 20} r="13"
          fill="url(#gm-brushed)" stroke="#1e222a" strokeWidth="0.5" />
        <circle cx={px - 28} cy={py + 20} r="13"
          fill="none" stroke="url(#chrome)" strokeWidth="1.4" strokeDasharray="1.8 2.8" />
        <circle cx={px - 28} cy={py + 20} r="10"
          fill="url(#dial-face)" stroke="#2c3040" strokeWidth="0.4" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
          const rad = (deg - 90) * Math.PI / 180;
          return (
            <line key={i}
              x1={px - 28 + Math.cos(rad) * 9}  y1={py + 20 + Math.sin(rad) * 9}
              x2={px - 28 + Math.cos(rad) * 11} y2={py + 20 + Math.sin(rad) * 11}
              stroke="#4a5060" strokeWidth="0.7" />
          );
        })}
        <line x1={px - 28} y1={py + 20} x2={px - 28} y2={py + 11}
          stroke="url(#gold)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx={px - 28} cy={py + 20} r="2.8"
          fill="url(#chrome)" stroke="#5a6478" strokeWidth="0.3" />
        <text x={px - 28} y={py + 10}  textAnchor="middle"
          fontSize="3.5" fill="#8a9aaa" fontFamily="monospace">2</text>
        <text x={px - 18} y={py + 22}  textAnchor="middle"
          fontSize="3.5" fill="#8a9aaa" fontFamily="monospace">3</text>
        <text x={px - 28} y={py + 33}  textAnchor="middle"
          fontSize="3.5" fill="#8a9aaa" fontFamily="monospace">1</text>
        <text x={px - 38} y={py + 22}  textAnchor="middle"
          fontSize="3.5" fill="#8a9aaa" fontFamily="monospace">0</text>
        <text x={px - 28} y={py + 40}
          textAnchor="middle" fontSize="3" fill="#5a6478"
          fontFamily="sans-serif" letterSpacing="0.5">ANTI-SKATE</text>
      </g>

      {/* ── Cue Hydraulic Lever (right of gimbal) ─────────────────────────── */}
      <g id="cue-lever" filter="url(#shadow-sm)">
        <rect x={px + 14} y={py - 2} width="6" height="22" rx="2"
          fill="url(#gm-brushed)" stroke="#2c3040" strokeWidth="0.4" />
        <ellipse cx={px + 17} cy={py + 20} rx="5.5" ry="2.8"
          fill="url(#gm)" stroke="#3a3e4c" strokeWidth="0.4" />
        <rect
          x={px + 8}
          y={isPlaying ? py - 10 : py - 4}
          width="20" height="4.5" rx="2.25"
          fill="url(#hydraulic)" stroke="#5a6878" strokeWidth="0.4"
          style={{
            transformOrigin: `${px + 17}px ${py}px`,
            transform: `rotate(${isPlaying ? 22 : -14}deg)`,
            transition: "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        />
        <circle
          cx={px + 8} cy={isPlaying ? py - 12 : py - 5}
          r="3.8"
          fill="url(#chrome)" stroke="#6a7888" strokeWidth="0.3"
          style={{
            transformOrigin: `${px + 17}px ${py}px`,
            transform: `rotate(${isPlaying ? 22 : -14}deg)`,
            transition: "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        />
        <circle cx={px + 17} cy={py} r="1.8"
          fill="url(#chrome)" stroke="#4a5262" strokeWidth="0.3" />
        <text x={px + 17} y={py + 28}
          textAnchor="middle" fontSize="3" fill="#5a6478"
          fontFamily="sans-serif" letterSpacing="0.5">CUE</text>
      </g>

      {/* ── VTA Fine-Tune Screw ────────────────────────────────────────────── */}
      <g id="vta-screw" filter="url(#shadow-sm)">
        <circle cx={px + 22} cy={py - 10} r="3.8"
          fill="url(#chrome)" stroke="#4a5262" strokeWidth="0.3" />
        <line x1={px + 22 - 2.2} y1={py - 10} x2={px + 22 + 2.2} y2={py - 10}
          stroke="#252830" strokeWidth="0.9" />
        <text x={px + 22} y={py - 17}
          textAnchor="middle" fontSize="3" fill="#5a6478"
          fontFamily="sans-serif" letterSpacing="0.3">VTA</text>
      </g>

      {/* ═══════════════════════════════════════════════════════════════════
          ROTATING ARM GROUP
          Counterweight + arm wand + headshell all rotate together
          around the gimbal pivot (px, py).
      ═══════════════════════════════════════════════════════════════════ */}
      <g
        style={{
          transformOrigin: `${px}px ${py}px`,
          transform: `rotate(${armAngle}deg)`,
          transition: "transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)",
        }}
      >
        {/* ── Counterweight (right of pivot) ─────────────────────────────── */}
        <g id="counterweight" filter="url(#shadow-md)">
          {/* Shaft connecting pivot to counterweight */}
          <rect x={px} y={py - 70} width="8" height="70" rx="2.5"
            fill="url(#gm-brushed)" stroke="#1e222a" strokeWidth="0.5" />
          <ellipse cx={px + 4} cy={py - 69} rx="5.5" ry="2.2"
            fill="url(#gm)" stroke="#3a3e4c" strokeWidth="0.4" />
          {/* Knurled body */}
          <ellipse cx={px + 4} cy={py - 80} rx="15" ry="9"
            fill="url(#cw-rad)" stroke="#1e222a" strokeWidth="0.6" />
          {[-5, -2.5, 0, 2.5, 5].map((dy, i) => (
            <ellipse key={i}
              cx={px + 4} cy={py - 80 + dy} rx="14.5" ry="1.4"
              fill="none" stroke="#1e222a" strokeWidth="0.9" />
          ))}
          <text x={px - 11} y={py - 77} textAnchor="middle"
            fontSize="2.8" fill="#7a8598" fontFamily="monospace">-5</text>
          <text x={px + 19} y={py - 77} textAnchor="middle"
            fontSize="2.8" fill="#7a8598" fontFamily="monospace">+5</text>
          <ellipse cx={px + 4} cy={py - 89} rx="11" ry="4.5"
            fill="url(#gm)" stroke="#252830" strokeWidth="0.5" />
          <ellipse cx={px - 1} cy={py - 83} rx="5.5" ry="2.2"
            fill="rgba(185,198,215,0.28)"
            transform={`rotate(-12 ${px - 1} ${py - 83})`} />
        </g>

        {/* ── Arm Wand ──────────────────────────────────────────────────── */}
        {/* Shadow */}
        <path d={ARM_WAND} fill="none" stroke="rgba(0,0,0,0.65)"
          strokeWidth="5.5" strokeLinecap="round" />
        {/* Body */}
        <path d={ARM_WAND} fill="none" stroke="url(#matte-blk)"
          strokeWidth="5" strokeLinecap="round" />
        {/* Highlight */}
        <path d={ARM_HI} fill="none" stroke="rgba(95,108,124,0.38)"
          strokeWidth="2" strokeLinecap="round" />

        {/* ── Locking Collar ──────────────────────────────────────────── */}
        <g filter="url(#shadow-sm)">
          <ellipse cx={WAND_END_X} cy={0} rx="6.5" ry="3.8"
            fill="url(#gm-brushed)" stroke="#252830" strokeWidth="0.5"
            transform={`rotate(-5 ${WAND_END_X} 0)`} />
          {[-3, 0, 3].map((dy, i) => (
            <line key={i}
              x1={WAND_END_X - 3} y1={dy} x2={WAND_END_X + 3} y2={dy}
              stroke="#2c3040" strokeWidth="0.7"
            />
          ))}
        </g>

        {/* ── Headshell ─────────────────────────────────────────────── */}
        <g id="headshell" filter="url(#shadow-sm)"
          transform={`translate(${HS_END_X + 4}, -1) rotate(-2)`}>
          {/* Body */}
          <path d="M 0,-5.5 L 52,-6.5 L 62,0 L 52,6.5 L 0,5.5 Z"
            fill="url(#matte-blk)" stroke="#252830" strokeWidth="0.6" />
          <path d="M 0,-4.5 L 50,-5.5 L 59,-1 L 0,-3.5 Z"
            fill="rgba(92,105,122,0.38)" />
          <path d="M 0,3.5 L 50,4.5 L 59,1 L 0,2.5 Z"
            fill="rgba(0,0,0,0.5)" />
          {[1.5, 3.5, 5.5].map((dx, i) => (
            <line key={i}
              x1={50 - dx * 4} y1={-5.5} x2={50 - dx * 4} y2={5.5}
              stroke="#252830" strokeWidth="0.7" />
          ))}

          {/* Finger lift */}
          <rect x="-12" y="-4.5" width="11" height="9" rx="2.5"
            fill="url(#gm-brushed)" stroke="#3a3e4c" strokeWidth="0.5" />
          <line x1="-10" y1="-1" x2="-2" y2="-1" stroke="#1e222a" strokeWidth="0.9" />
          <line x1="-10" y1="1"  x2="-2" y2="1"  stroke="#1e222a" strokeWidth="0.9" />
          <line x1="-10" y1="3"  x2="-2" y2="3"  stroke="#1e222a" strokeWidth="0.9" />

          {/* Gold connector ring */}
          <ellipse cx="0" cy="0" rx="4.5" ry="6"
            fill="url(#gold)" stroke="#7c6018" strokeWidth="0.4" />
          <ellipse cx="-1.2" cy="-2.5" rx="1.8" ry="2.2"
            fill="rgba(220,190,75,0.42)" />

          {/* Cartridge */}
          <g transform="translate(22, 0)">
            <rect x="-11" y="-9" width="30" height="18" rx="2.8"
              fill="url(#cartridge)" stroke="#1e222a" strokeWidth="0.5" />
            <rect x="-9" y="-8.5" width="26" height="6" rx="1.2"
              fill="rgba(78,88,105,0.22)" />
            <rect x="17" y="-7" width="3.5" height="14" rx="1.2"
              fill="url(#matte-blk)" stroke="#252830" strokeWidth="0.3" />
            <circle cx="-5.5" cy="-6.5" r="2"
              fill="url(#chrome)" stroke="#4a5262" strokeWidth="0.3" />
            <circle cx="-5.5" cy="6.5" r="2"
              fill="url(#chrome)" stroke="#4a5262" strokeWidth="0.3" />
            <path d="M -11,-4 Q -16,0 -11,4" fill="none"
              stroke="#c02828" strokeWidth="0.9" strokeLinecap="round" />
            <path d="M -11,0 Q -16,2 -11,5" fill="none"
              stroke="#dcdce0" strokeWidth="0.9" strokeLinecap="round" />

            {/* Cantilever */}
            <line x1="20.5" y1="0" x2="34" y2="2.5"
              stroke="url(#chrome)" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="34" cy="2.5" r="1.4"
              fill="url(#chrome)" stroke="#6a7888" strokeWidth="0.3" />

            {/* Diamond stylus */}
            <polygon points="35.5,0.5 38.5,2.5 35.5,4.5 36.8,2.5"
              fill="#cc1a4a" stroke="#aa1240" strokeWidth="0.3" />
            <circle cx="37" cy="2.5" r="1.2" fill="rgba(220,55,90,0.55)" />
            <circle cx="36.5" cy="1.8" r="0.5" fill="rgba(255,180,200,0.7)" />
          </g>
        </g>
      </g>

      {/* ── Stylus contact indicator (world-space, vinyl groove position) ──── */}
      {/* When playing, the stylus tip lands at the vinyl outer groove.
          Platter vinyl outer edge in chassis coords: platter cx=202, vinylR=82 → x=284.
          In Tonearm SVG (mounted at chassis x=272): vinyl_groove_x = 284 - 272 = 12. */}
      <circle
        cx={12}
        cy={116}
        r={isPlaying ? 3 : 0}
        fill="#cc1a4a"
        opacity={isPlaying ? 0.7 : 0}
        style={{
          filter: "url(#shadow-sm)",
          transition: "opacity 0.7s ease, r 0.4s ease",
        }}
      />

      {/* ── Platter surface reference line ─────────────────────────────── */}
      {/* Horizontal line representing the record surface at y=112 */}
      <line x1="0" y1="116" x2="80" y2="116"
        stroke="rgba(80,90,110,0.15)" strokeWidth="0.6" strokeDasharray="2 4" />
    </svg>
  );
}
