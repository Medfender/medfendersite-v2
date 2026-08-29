"use client";

import React, { useState, useRef, useEffect } from "react";

export default function Turntable({
  transportState = 'stopped',
  isPendingPlay = false,
  className,
  progress,
  onTogglePlay,
  onStop,
  onNeedleDrop,
  isPoweredOn = true,
  onTogglePower,
  bpm = 0,
}: {
  transportState?: 'playing' | 'paused' | 'stopped';
  isPendingPlay?: boolean;
  className?: string;
  progress?: number;
  onTogglePlay?: () => void;
  onStop?: () => void;
  onNeedleDrop?: () => void;
  isPoweredOn?: boolean;
  onTogglePower?: () => void;
  bpm?: number;
}) {
  const [speed, setSpeed] = useState<33 | 45>(33);
  const [pitch, setPitch] = useState(0);

  const isPlaying = transportState === 'playing' || isPendingPlay;
  const vinylSpinning = transportState === 'playing' && isPoweredOn;

  const [isLifted, setIsLifted] = useState(false);
  const [armAngle, setArmAngle] = useState(0);
  const [isLeverEngaged, setIsLeverEngaged] = useState(false);

  useEffect(() => {
    let timer1: ReturnType<typeof setTimeout>;
    let timer2: ReturnType<typeof setTimeout>;

    if (transportState === 'playing') {
      if (armAngle === 0) {
        // 1. Coming from STOP: Engage lever, lift arm, swing, drop
        setIsLeverEngaged(true);
        setIsLifted(true);
        timer1 = setTimeout(() => {
          setArmAngle(30);
          timer2 = setTimeout(() => setIsLifted(false), 600);
        }, 400);
      } else {
        // 2. Coming from PAUSE: Lever stays engaged. Just drop the needle.
        setIsLifted(false);
      }
    }
    else if (transportState === 'paused') {
      // 3. Paused: Lift needle straight up, but DO NOT flip the lever
      setIsLifted(true);
    }
    else if (transportState === 'stopped') {
      // 4. Stopped: Disengage lever, lift arm, swing back, drop
      setIsLeverEngaged(false);
      setIsLifted(true);
      timer1 = setTimeout(() => {
        setArmAngle(0);
        timer2 = setTimeout(() => setIsLifted(false), 600);
      }, 400);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [transportState, armAngle]);

  const PCX = 215; const PCY = 215; const PLATTER_R = 175; const VINYL_R = 145; const LABEL_R = 48; const SPINDLE_R = 8;
  const TPX = 490; const TPY = 75; const WAND_LEN = 220; const CW_LEN = 50; const WAND_W = 7;
  const REST_X = TPX; const REST_Y = TPY + 220; const PARK_ANGLE = 0;
  const PLAY_ANGLE = 55; const INNER_ANGLE = 75;

  const currentProgress = progress ?? 0;
  const frozenAngleRef = useRef<number>(PLAY_ANGLE);
  useEffect(() => {
    if (transportState === 'paused') {
      frozenAngleRef.current = PLAY_ANGLE + (currentProgress * (INNER_ANGLE - PLAY_ANGLE));
    }
  }, [transportState, currentProgress]);

  let displayAngle: number;
  if (transportState === 'stopped') displayAngle = PARK_ANGLE;
  else if (transportState === 'playing') displayAngle = PLAY_ANGLE + (currentProgress * (INNER_ANGLE - PLAY_ANGLE));
  else displayAngle = frozenAngleRef.current;

  const PITCH_X = 660; const PITCH_Y = 130; const PITCH_LEN = 230;

  return (
    <div className={`relative w-full max-w-[820px] mx-auto ${className}`} style={{ filter: 'drop-shadow(2px 4px 4px rgba(0,0,0,0.8))' }}>
      <div className="relative w-full rounded-[36px] p-3 border border-white/[0.07]" style={{ background: "linear-gradient(180deg, #1a1d28 0%, #0c0e14 60%, #04050a 100%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -2px 8px rgba(0,0,0,0.5), 0 30px 80px rgba(0,0,0,0.6)" }}>
        <div className="relative w-full rounded-[28px] overflow-hidden border border-white/[0.04]" style={{ background: "linear-gradient(135deg, #1a1c24 0%, #0a0b10 70%, #06070b 100%)", boxShadow: "inset 0 0 50px rgba(0,0,0,0.7), inset 0 0 1px rgba(255,255,255,0.05)", aspectRatio: "720 / 520" }}>
          <svg viewBox="0 0 720 520" className="absolute inset-0 w-full h-full" style={{ display: "block" }} aria-label="Turntable deck">
            <style>{`
              @keyframes spin-vinyl { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
              .vinyl-spin { animation: spin-vinyl 2.4s linear infinite; animation-play-state: ${vinylSpinning ? "running" : "paused"}; }
            `}</style>

            <defs>
              <linearGradient id="anodized-dark" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#2a2e38"/><stop offset="40%" stopColor="#1c1f28"/><stop offset="100%" stopColor="#0e1015"/></linearGradient>
              <linearGradient id="brushed-al" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#5a6070"/><stop offset="8%" stopColor="#7a8298"/><stop offset="16%" stopColor="#5a6070"/><stop offset="24%" stopColor="#7a8298"/><stop offset="32%" stopColor="#5a6070"/><stop offset="40%" stopColor="#7a8298"/><stop offset="48%" stopColor="#5a6070"/><stop offset="56%" stopColor="#7a8298"/><stop offset="64%" stopColor="#5a6070"/><stop offset="72%" stopColor="#7a8298"/><stop offset="80%" stopColor="#5a6070"/><stop offset="88%" stopColor="#7a8298"/><stop offset="96%" stopColor="#5a6070"/><stop offset="100%" stopColor="#4a5068"/></linearGradient>
              <linearGradient id="precision-chrome" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f8f8fc"/><stop offset="15%" stopColor="#d0d4e0"/><stop offset="40%" stopColor="#8090a8"/><stop offset="65%" stopColor="#c0c8d8"/><stop offset="85%" stopColor="#8898b0"/><stop offset="100%" stopColor="#4a5268"/></linearGradient>
              <linearGradient id="polished-al" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#c8ccd8"/><stop offset="30%" stopColor="#8898a8"/><stop offset="70%" stopColor="#5a6478"/><stop offset="100%" stopColor="#2a303c"/></linearGradient>
              <linearGradient id="dark-alloy" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#3a3e4c"/><stop offset="35%" stopColor="#1e2128"/><stop offset="70%" stopColor="#0e1015"/><stop offset="100%" stopColor="#060810"/></linearGradient>
              <radialGradient id="cw-mass" cx="35%" cy="30%" r="70%"><stop offset="0%" stopColor="#a8acb8"/><stop offset="40%" stopColor="#6a6e7c"/><stop offset="75%" stopColor="#3a3e4c"/><stop offset="100%" stopColor="#1a1e28"/></radialGradient>
              <linearGradient id="brass" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#e8c060"/><stop offset="30%" stopColor="#c89030"/><stop offset="65%" stopColor="#a87020"/><stop offset="100%" stopColor="#604010"/></linearGradient>
              <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#d4a830"/><stop offset="35%" stopColor="#f0c040"/><stop offset="65%" stopColor="#c89828"/><stop offset="100%" stopColor="#806010"/></linearGradient>
              <radialGradient id="chrome-spindle" cx="35%" cy="30%" r="75%"><stop offset="0%" stopColor="#ffffff"/><stop offset="20%" stopColor="#d8e0ec"/><stop offset="50%" stopColor="#9aaab8"/><stop offset="80%" stopColor="#5a6a78"/><stop offset="100%" stopColor="#2c3340"/></radialGradient>
              <linearGradient id="vinyl-deep" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#0e0f14"/><stop offset="40%" stopColor="#12141a"/><stop offset="70%" stopColor="#080810"/><stop offset="100%" stopColor="#06070e"/></linearGradient>
              <linearGradient id="vinyl-mid" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#141620"/><stop offset="50%" stopColor="#161828"/><stop offset="100%" stopColor="#101218"/></linearGradient>
              <linearGradient id="cart-blue" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#2a4880"/><stop offset="40%" stopColor="#1c3060"/><stop offset="100%" stopColor="#0c1830"/></linearGradient>
              <linearGradient id="cantilever-grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#e8c840"/><stop offset="50%" stopColor="#d4af37"/><stop offset="100%" stopColor="#b89020"/></linearGradient>
              <linearGradient id="cue-al" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#7a8098"/><stop offset="40%" stopColor="#a0a8b8"/><stop offset="100%" stopColor="#4a5068"/></linearGradient>

              {/* Arm tube: premium satin-black composite with cylindrical volumetric shading */}
              <linearGradient id="arm-tube-dark-metal" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#141620"/>
                <stop offset="15%"  stopColor="#2a3045"/>
                <stop offset="35%"  stopColor="#3e4660"/>
                <stop offset="50%"  stopColor="#505a78"/>
                <stop offset="65%"  stopColor="#3a4055"/>
                <stop offset="85%"  stopColor="#181c2e"/>
                <stop offset="100%" stopColor="#0d0f16"/>
              </linearGradient>
              <linearGradient id="arm-tube-specular-band" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="rgba(255,255,255,0.05)"/>
                <stop offset="30%"  stopColor="rgba(255,255,255,0.22)"/>
                <stop offset="50%"  stopColor="rgba(255,255,255,0.10)"/>
                <stop offset="70%"  stopColor="rgba(255,255,255,0.28)"/>
                <stop offset="100%" stopColor="rgba(255,255,255,0.06)"/>
              </linearGradient>
              <linearGradient id="arm-tube-specular" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="rgba(255,255,255,0.22)"/>
                <stop offset="100%" stopColor="rgba(0,0,0,0.0)"/>
              </linearGradient>
              <linearGradient id="arm-tube-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="rgba(0,0,0,0.0)"/>
                <stop offset="100%" stopColor="rgba(0,0,0,0.4)"/>
              </linearGradient>

              <filter id="shadow-sm" x="-25%" y="-25%" width="150%" height="160%"><feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.65"/></filter>
              <filter id="shadow-md" x="-35%" y="-25%" width="170%" height="170%"><feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.72"/></filter>
              <filter id="shadow-lg" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="4" dy="8" stdDeviation="6" floodColor="#000" floodOpacity="0.6"/></filter>
            </defs>

            {/* PLATTER */}
            <circle cx={PCX} cy={PCY} r={PLATTER_R + 5} fill="#0c0d12" />
            <g filter="url(#shadow-md)">
              <circle cx={PCX} cy={PCY} r={PLATTER_R} fill="none" stroke="url(#brushed-al)" strokeWidth="22" />
              <circle cx={PCX} cy={PCY} r={PLATTER_R - 11} fill="none" stroke="url(#brushed-al)" strokeWidth="8" />
              <circle cx={PCX} cy={PCY} r={PLATTER_R - 22} fill="none" stroke="#0a0c12" strokeWidth="6" />
            </g>
            <g className="vinyl-spin" style={{ transformOrigin: `${PCX}px ${PCY}px` }}>
              <circle cx={PCX} cy={PCY} r={VINYL_R} fill="url(#vinyl-deep)" />
              {Array.from({ length: 24 }, (_, j) => {
                const bandR = VINYL_R - j * 5.8;
                if (bandR < LABEL_R + 4) return null;
                const fill = j % 2 === 0 ? "url(#vinyl-deep)" : "url(#vinyl-mid)";
                return <circle key={j} cx={PCX} cy={PCY} r={bandR} fill={fill} stroke={j % 3 === 0 ? "rgba(40,45,55,0.32)" : "none"} strokeWidth={0.5} />;
              })}
              <g opacity="0.07">{Array.from({ length: 120 }, (_, g) => (
                <line key={g} x1={PCX} y1={PCY - VINYL_R} x2={PCX} y2={PCY + VINYL_R} stroke="#d8dce4" strokeWidth="0.4" transform={`rotate(${g * 3}, ${PCX}, ${PCY})`} />
              ))}</g>
              <circle cx={PCX} cy={PCY} r={LABEL_R} fill="#0a0c14" />
              <circle cx={PCX} cy={PCY} r={LABEL_R - 2} fill="none" stroke="url(#gold)" strokeWidth="5" />
              <circle cx={PCX} cy={PCY} r={LABEL_R - 14} fill="none" stroke="url(#gold)" strokeWidth="2" opacity="0.6" />
              <text x={PCX} y={PCY - 4} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#c8a838" letterSpacing="3" fontFamily="sans-serif">GOLDEN SOUND</text>
              <text x={PCX} y={PCY + 8} textAnchor="middle" fontSize="5" fill="#8a7860" letterSpacing="2" fontFamily="monospace">180g • 33⅓ RPM</text>
            </g>
            <circle cx={PCX} cy={PCY} r={VINYL_R} fill="none" stroke="#8898aa" strokeWidth="1" opacity="0.3" />

            {/* SPINDLE */}
            <g id="tonearm-spindle">
              <ellipse cx={PCX} cy={PCY + 1.5} rx={SPINDLE_R + 1} ry={SPINDLE_R - 1} fill="rgba(0,0,0,0.55)" opacity="0.7" />
              <circle cx={PCX} cy={PCY} r={SPINDLE_R} fill="url(#chrome-spindle)" stroke="#5a6a78" strokeWidth="0.6" />
              <ellipse cx={PCX - 2} cy={PCY - 2} rx="3" ry="2" fill="rgba(255,255,255,0.9)" transform={`rotate(-35, ${PCX - 2}, ${PCY - 2})`} />
              <circle cx={PCX} cy={PCY} r="1.4" fill="#1a1d24" />
            </g>

            {/* ══════════════════════════════════════════════════════════════
                #tonearm-system — authoritative container for all arm geometry
                ══════════════════════════════════════════════════════════════ */}
            <g id="tonearm-system">

              {/* ─────────────────────────────────────────────────────────
                  #tonearm-static-base
                  Everything inside is DECK-MOUNTED and NEVER rotates.
                  Pivot housing, mounting screws, mounting plate, anti-skate.
                  ══════════════════════════════════════════════════════════ */}
              <g id="tonearm-static-base">

                {/* Cradle (rest position) */}
                <g id="tonearm-base-cradle" filter="url(#shadow-md)">
                  <rect x={REST_X - 32} y={REST_Y - 4} width="64" height="12" rx="3" fill="url(#brushed-al)" stroke="#1e222a" strokeWidth="0.6" />
                  <ellipse cx={REST_X} cy={REST_Y - 4} rx="20" ry="6" fill="url(#anodized-dark)" stroke="#2c3040" strokeWidth="0.6" />
                  <rect x={REST_X - 4} y={REST_Y - 28} width="8" height="20" rx="2" fill="url(#precision-chrome)" stroke="#5a6478" strokeWidth="0.4" />
                  <circle cx={REST_X} cy={REST_Y - 18} r="2.2" fill="#a82828" opacity="0.85" />
                </g>

                {/* Arm base column (plinth mount) */}
                <g id="tonearm-arm-base-column" filter="url(#shadow-md)">
                  <rect x={TPX - 16} y={TPY + 18} width="32" height="12" rx="3" fill="url(#brushed-al)" stroke="#1e222a" strokeWidth="0.6" />
                  <rect x={TPX - 16} y={TPY - 10} width="32" height="30" rx="5" fill="url(#anodized-dark)" stroke="#252830" strokeWidth="0.6" />
                  <ellipse cx={TPX} cy={TPY - 8} rx="19" ry="6" fill="url(#precision-chrome)" stroke="#3a3e4c" strokeWidth="0.5" />
                  {/* Mounting screws — always stationary */}
                  <circle cx={TPX - 20} cy={TPY + 24} r="3.5" fill="url(#precision-chrome)" stroke="#4a5262" strokeWidth="0.4" />
                  <circle cx={TPX + 20} cy={TPY + 24} r="3.5" fill="url(#precision-chrome)" stroke="#4a5262" strokeWidth="0.4" />
                </g>

                {/* Pivot housing — the deck-mounted bearing socket. DOES NOT rotate. */}
                <g id="tonearm-pivot-housing" filter="url(#shadow-md)">
                  <circle cx={TPX} cy={TPY} r="34" fill="url(#dark-alloy)" stroke="#0e1015" strokeWidth="0.8" />
                  <circle cx={TPX} cy={TPY} r="30" fill="none" stroke="url(#precision-chrome)" strokeWidth="6" />
                  {Array.from({ length: 24 }, (_, i) => {
                    const a = (i * 360) / 24; const rad = (a * Math.PI) / 180;
                    const x1 = +(TPX + Math.cos(rad) * 27).toFixed(3); const y1 = +(TPY + Math.sin(rad) * 27).toFixed(3);
                    const x2 = +(TPX + Math.cos(rad) * 33).toFixed(3); const y2 = +(TPY + Math.sin(rad) * 33).toFixed(3);
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0e1015" strokeWidth="0.5" opacity="0.7" />;
                  })}
                </g>

                {/* Anti-skate control — deck-mounted, never rotates */}
                <g id="anti-skate-system">
                  <g id="anti-skate-control" filter="url(#shadow-sm)">
                    <circle cx={TPX + 58} cy={TPY - 8} r="9" fill="url(#anodized-dark)" stroke="#252830" strokeWidth="0.5" />
                    <circle cx={TPX + 58} cy={TPY - 8} r="6.5" fill="url(#brass)" stroke="#4a3a18" strokeWidth="0.4" />
                    <line x1={TPX + 58} y1={TPY - 12} x2={TPX + 58} y2={TPY - 5} stroke="#1e1410" strokeWidth="1" />
                    <circle cx={TPX + 58} cy={TPY - 8} r="1.2" fill="#1a1410" />
                    <text x={TPX + 58} y={TPY + 9} textAnchor="middle" fontSize="4" fill="#5a6478" fontFamily="monospace" letterSpacing="0.4">A-SKATE</text>
                  </g>
                </g>

                {/* Cue system base — deck-mounted, does NOT rotate */}
                <g id="cueing-system">
                {/* 1. Mechanical Cam Housing (The Bridge connecting the lever to the piston and main base) */}
                <path d="M 456,108 L 476,96 L 476,82 L 448,82 A 12 12 0 0,0 448,105 Z" fill="url(#dark-alloy)" stroke="#1a1c23" strokeWidth="1" filter="url(#shadow-sm)" />

                {/* 2. Static Lever Pivot Base */}
                <circle cx="456" cy="94" r="9" fill="url(#precision-chrome)" stroke="#222" strokeWidth="0.5" />
                <circle cx="456" cy="94" r="4" fill="#111" />

                {/* 3. The Animated Lever (Tied strictly to Start/Stop state) */}
                <g style={{
                  transform: `rotateX(${isLeverEngaged ? 180 : 0}deg)`,
                  transformOrigin: '456px 94px',
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                   {/* Shorter, thinner metal shaft */}
                   <rect x="454.75" y="80" width="2.5" height="14" rx="1" fill="url(#precision-chrome)" stroke="#222" strokeWidth="0.5" />
                   {/* Smaller rubber grip tip */}
                   <circle cx="456" cy="79" r="3" fill="#111318" />
                </g>
              </g>

                {/* Static cue arc (lift path indicator) */}
                <g id="cueing-arc">
                  <path d={`M ${TPX - 12},${TPY + 8} Q ${TPX},${TPY + 14} ${TPX + 12},${TPY + 8}`} fill="none" stroke="url(#precision-chrome)" strokeWidth="1.2" strokeLinecap="round" />
                </g>

              </g>
              {/* End #tonearm-static-base */}

              {/* ─────────────────────────────────────────────────────────
                  #cueing-lever — independent cueing lever.
                  Sits ABOVE static base but BELOW rotating arm.
                  It pivots at its own hinge, independent of arm angle.
                  Painter's order: cue base (static) → cue lever → rotating arm
                  ══════════════════════════════════════════════════════════ */}
              {/* ─────────────────────────────────────────────────────────
                  Cue mechanism — split into two physically separate parts:
                    1. #cue-lift-platform — translates straight up/down only
                       (chrome hydraulic piston + matte rubber crescent).
                    2. #cue-lever-handle — rotates only at its base pivot.
                  Sits ABOVE static base but BELOW rotating arm.
                  ══════════════════════════════════════════════════════════ */}
              <g id="cue-lift-mechanism">
                {/* Chrome Hydraulic Piston Base */}
                <rect x="473.5" y="86" width="5" height="12" rx="2" fill="url(#precision-chrome)" stroke="#222" strokeWidth="0.5" />

                {/* Static Piston Rod & Rubber Crescent */}
                <rect x="474.5" y="80" width="3" height="10" fill="url(#precision-chrome)" />

                {/* Black matte rubber rail */}
                <path d="M 468,90 A 25,25 0 0,0 512,90" fill="none" stroke="#111318" strokeWidth="7" strokeLinecap="round" />

                {/* Inner rubber highlight */}
                <path d="M 468,90 A 25,25 0 0,0 512,90" fill="none" stroke="#2d323d" strokeWidth="4" strokeLinecap="round" />
              </g>
              <text x="456" y="115" textAnchor="middle" fontSize="5" fill="#5a6478" fontFamily="sans-serif" letterSpacing="0.6">CUE</text>

              {/* ─────────────────────────────────────────────────────────
                  #tonearm-assembly — THE ONLY GROUP THAT ROTATES.
                  ONE authoritative transform: rotate(displayAngle, TPX, TPY).
                  Every child inherits this movement. No child has its own
                  animated transform.
                  ══════════════════════════════════════════════════════════ */}
              <g id="tonearm-static-base" filter="url(#shadow-sm)">
                <circle cx={TPX} cy={TPY} r="24" fill="url(#dark-alloy)" stroke="#252830" strokeWidth="0.6" />
                <circle cx={TPX} cy={TPY} r="20" fill="none" stroke="url(#precision-chrome)" strokeWidth="2.4" />
                {[
                  [TPX + 28, TPY, 0], [TPX, TPY + 28, 90], [TPX - 28, TPY, 180], [TPX, TPY - 28, 270],
                ].map(([sx, sy], i) => (
                  <circle key={i} cx={sx as number} cy={sy as number} r="2.4" fill="url(#precision-chrome)" stroke="#4a5262" strokeWidth="0.4" />
                ))}
              </g>

              {/* WRAPPER: Handles strictly the vertical lift illusion (shadow + translation) */}
              <g
                id="tonearm-lift-wrapper"
                style={{
                  transformOrigin: '490px 75px',
                  transform: isLifted ? 'scale(1.03)' : 'scale(1)',
                  filter: isLifted ? 'drop-shadow(15px 25px 12px rgba(0,0,0,0.35))' : 'drop-shadow(4px 6px 4px rgba(0,0,0,0.6))',
                  transition: 'transform 0.4s ease-in-out, filter 0.4s ease-in-out',
                }}
              >
                {/* INNER GROUP: Handles strictly the rotation, locked to 490,75 */}
                <g
                  id="tonearm-assembly"
                  style={{
                    transform: `rotate(${armAngle}deg)`,
                    transformOrigin: '490px 75px',
                    transition: 'transform 0.6s cubic-bezier(0.34, 1.1, 0.64, 1)',
                  }}
                >
                {/* Bearing carrier (rotates with arm — visually inside the
                    static pivot housing ring). */}
                <g id="tonearm-bearing-carrier" filter="url(#shadow-sm)">
                  <circle cx={TPX} cy={TPY} r="16" fill="url(#polished-al)" stroke="#3a3e4c" strokeWidth="0.5" />
                  <circle cx={TPX} cy={TPY} r="9" fill="#060810" stroke="#0e1015" strokeWidth="0.4" />
                  <ellipse cx={TPX - 3} cy={TPY - 3} rx="5" ry="3" fill="rgba(220,228,248,0.5)" />
                </g>

                {/* Counterweight assembly */}
                <g id="counterweight-assembly" filter="url(#shadow-md)">
                  <g id="counterweight-shaft">
                    <rect x={TPX - WAND_W} y={TPY - CW_LEN} width={WAND_W * 2} height={CW_LEN} rx={WAND_W} fill="url(#polished-al)" stroke="#1e222a" strokeWidth="0.8" />
                    <rect x={TPX - WAND_W + 2} y={TPY - CW_LEN + 2} width={WAND_W * 0.45} height={CW_LEN - 4} rx={WAND_W * 0.45} fill="rgba(195,205,225,0.22)" />
                    <rect x={TPX + WAND_W * 0.1} y={TPY - CW_LEN + 2} width={WAND_W * 0.45} height={CW_LEN - 4} rx={WAND_W * 0.45} fill="rgba(0,0,0,0.3)" />
                  </g>
                  <g id="counterweight-knurl">
                    {Array.from({ length: 6 }, (_, k) => {
                      const kx = TPX - WAND_W + 2 + k * 2.2;
                      return <line key={k} x1={kx} y1={TPY - CW_LEN + 4} x2={kx} y2={TPY - 4} stroke="#0c0d12" strokeWidth="0.6" opacity="0.55" />;
                    })}
                  </g>
                  <g id="counterweight-lock">
                    <rect x={TPX - WAND_W - 0.5} y={TPY - 10} width={WAND_W * 2 + 1} height="4" rx="1" fill="url(#precision-chrome)" stroke="#3a3e4c" strokeWidth="0.4" />
                    <rect x={TPX - WAND_W} y={TPY - 9} width={WAND_W * 0.3} height="2" rx="0.5" fill="rgba(255,255,255,0.35)" />
                  </g>
                  <g id="counterweight-end-cap">
                    <ellipse cx={TPX} cy={TPY - CW_LEN} rx={WAND_W * 0.95} ry={WAND_W * 0.6} fill="url(#polished-al)" stroke="#252830" strokeWidth="0.6" />
                    <ellipse cx={TPX - WAND_W * 0.3} cy={TPY - CW_LEN - 1} rx={WAND_W * 0.5} ry={WAND_W * 0.22} fill="rgba(225,235,248,0.4)" />
                  </g>
                  <g id="counterweight-scale">
                    <text x={TPX - WAND_W - 4} y={TPY - CW_LEN / 2} textAnchor="end" fontSize="4.5" fill="#7a8598" fontFamily="monospace">-5</text>
                    <text x={TPX + WAND_W + 4} y={TPY - CW_LEN / 2} textAnchor="start" fontSize="4.5" fill="#7a8598" fontFamily="monospace">+5</text>
                  </g>
                </g>

                {/* ════════════════════════════════════════════════════════
                    #tonearm-arm-tube — Premium precision-machined arm
                    Redesigned as a filled tapered tube polygon with proper
                    3D volumetric shading. Not a stroked path.
                    Architecture:
                      - Filled polygon body (tapered left/right offset curves)
                      - Left edge: upper/light-facing surface
                      - Right edge: lower/shadow-facing surface
                      - Highlight band: specular region along center-top
                      - Pivot collar: machined connector to bearing
                      - Headshell stub: precision transition to headshell
                    All coordinates: pivot=(TPX,TPY), arm_len=WAND_LEN,
                    centerline curves right then converges to headshell.
                    ════════════════════════════════════════════════════════ */}
                <g id="tonearm-arm-tube">
                  {/* 1. Ambient Drop Shadow */}
                  <path d="M 490,75 L 490,295" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="10" strokeLinecap="round" transform="translate(6, 6)" filter="blur(3px)" />
                  {/* 2. Base Pipe (Dark outer edge for volumetric depth) */}
                  <path d="M 490,75 L 490,295" fill="none" stroke="#111318" strokeWidth="9" strokeLinecap="round" />
                  {/* 3. Midtone Machined Metal */}
                  <path d="M 490,75 L 490,295" fill="none" stroke="#2d323d" strokeWidth="7" strokeLinecap="round" />
                  {/* 4. Bright Core Metallic Reflection */}
                  <path d="M 490,75 L 490,295" fill="none" stroke="#6a7387" strokeWidth="4" strokeLinecap="round" />
                  {/* 5. God-Tier Specular Highlight (Offset slightly left to simulate directional lighting) */}
                  <path d="M 490,75 L 490,295" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" transform="translate(-1.5, -0.5)" filter="drop-shadow(0px 0px 2px rgba(255,255,255,0.6))" />
                </g>

                {/* Headshell — rigid child of arm. NO independent rotation.
                    Local origin: arm tip (TPX, TPY + WAND_LEN).
                    Cartridge faces forward with natural alignment to record groove. */}
                <g id="headshell-assembly" transform={`translate(${TPX} ${TPY + WAND_LEN})`}>
                  <g id="headshell-body">
                    <path d="M -22,-9 L 10,-9 L 22,-5 L 22,8 L 10,12 L -22,10 Z" fill="url(#anodized-dark)" stroke="#1a1e28" strokeWidth="0.8" />
                    <path d="M -21,-8 L 9,-8 L 20,-5 L -21,-4 Z" fill="rgba(195,205,225,0.12)" />
                    <path d="M -21,9 L 9,11 L 20,5 L -21,4 Z" fill="rgba(0,0,0,0.4)" />
                    <path d="M -21,-8 L -21,10" fill="none" stroke="rgba(195,205,225,0.15)" strokeWidth="0.8" strokeLinecap="round" />
                  </g>
                  <g id="headshell-connector">
                    <ellipse cx="-18" cy="0" rx="6" ry="9" fill="url(#gold)" stroke="#7c6018" strokeWidth="0.6" />
                    <ellipse cx="-18" cy="0" rx="4" ry="7" fill="rgba(0,0,0,0.3)" />
                    <ellipse cx="-20" cy="-2" rx="1.5" ry="3" fill="rgba(240,220,100,0.3)" />
                  </g>
                  <g id="headshell-finger-lift">
                    <path d="M -36,-6 C -44,-6 -46,-2 -44,2 C -46,6 -44,9 -36,9 L -30,9 L -30,-6 Z" fill="url(#polished-al)" stroke="#3a3e4c" strokeWidth="0.5" />
                    <line x1="-43" y1="1.5" x2="-31" y2="1.5" stroke="#1e222a" strokeWidth="0.6" opacity="0.6" />
                    <path d="M -35,-5 C -42,-5 -44,-2 -42,0" fill="none" stroke="rgba(200,210,230,0.3)" strokeWidth="0.8" strokeLinecap="round" />
                  </g>
                  <g id="cartridge-assembly" transform="translate(-1, 0)">
                    <rect x="-14" y="-9" width="28" height="18" rx="2.5" fill="url(#cart-blue)" stroke="#0c1830" strokeWidth="0.6" />
                    <rect x="-11" y="-8" width="22" height="4" rx="1.5" fill="rgba(100,160,255,0.15)" />
                    <rect x="-11" y="2" width="5" height="6" rx="1" fill="#040810" />
                    <rect x="6" y="2" width="5" height="6" rx="1" fill="#040810" />
                    <g id="cartridge-screw-left">
                      <circle cx="-8.5" cy="5" r="1.8" fill="url(#precision-chrome)" stroke="#4a5262" strokeWidth="0.3" />
                      <line x1="-10" y1="5" x2="-7" y2="5" stroke="#1e222a" strokeWidth="0.5" />
                      <line x1="-8.5" y1="3.3" x2="-8.5" y2="6.7" stroke="#1e222a" strokeWidth="0.5" />
                    </g>
                    <g id="cartridge-screw-right">
                      <circle cx="8.5" cy="5" r="1.8" fill="url(#precision-chrome)" stroke="#4a5262" strokeWidth="0.3" />
                      <line x1="7" y1="5" x2="10" y2="5" stroke="#1e222a" strokeWidth="0.5" />
                      <line x1="8.5" y1="3.3" x2="8.5" y2="6.7" stroke="#1e222a" strokeWidth="0.5" />
                    </g>
                    <g id="stylus-assembly">
                      <line id="cantilever" x1="13" y1="0" x2="26" y2="3.5" stroke="url(#cantilever-grad)" strokeWidth="0.8" strokeLinecap="round" />
                      <circle id="stylus-tip" cx="26" cy="3.5" r="1.5" fill="url(#precision-chrome)" stroke="#6a7888" strokeWidth="0.3" />
                      <circle cx="25.4" cy="3.1" r="0.5" fill="rgba(255,255,255,0.7)" />
                    </g>
                  </g>
                </g>
              </g>
              {/* End #tonearm-assembly */}
              </g>
              {/* End #tonearm-lift-wrapper */}

            </g>
            {/* End #tonearm-system */}

            {/* PITCH FADER */}
            <g id="pitch-fader">
              <rect x={PITCH_X - 4} y={PITCH_Y} width="8" height={PITCH_LEN} rx="3" fill="#06070b" stroke="#252830" strokeWidth="0.5" />
              <rect x={PITCH_X - 2} y={PITCH_Y + 2} width="4" height={PITCH_LEN - 4} rx="2" fill="url(#anodized-dark)" />
              {Array.from({ length: 9 }, (_, i) => {
                const t = i / 8; const y = PITCH_Y + t * PITCH_LEN; const isMajor = i === 0 || i === 4 || i === 8;
                return <line key={i} x1={PITCH_X + 5} y1={y} x2={PITCH_X + (isMajor ? 14 : 9)} y2={y} stroke={isMajor ? "#7a8598" : "#3c4352"} strokeWidth={isMajor ? 0.8 : 0.5} />;
              })}
              <text x={PITCH_X + 17} y={PITCH_Y + 3} fontSize="6" fill="#7a8598" fontFamily="monospace">+8%</text>
              <text x={PITCH_X + 17} y={PITCH_Y + PITCH_LEN / 2 + 2} fontSize="6" fill="#7a8598" fontFamily="monospace">0</text>
              <text x={PITCH_X + 17} y={PITCH_Y + PITCH_LEN + 4} fontSize="6" fill="#7a8598" fontFamily="monospace">-8%</text>
              <g style={{ transform: `translate(${PITCH_X}px, ${PITCH_Y + PITCH_LEN / 2 - pitch * (PITCH_LEN / 16)}px)`, transition: "transform 0.15s ease-out" }}>
                <rect x={-9} y={-7} width="18" height="14" rx="2.5" fill="rgba(0,0,0,0.6)" opacity="0.5" filter="url(#shadow-sm)" />
                <rect x={-9} y={-7} width="18" height="14" rx="2.5" fill="url(#precision-chrome)" stroke="#3a3e4c" strokeWidth="0.5" />
                <line x1={-6} y1={0} x2={6} y2={0} stroke="#1a1d24" strokeWidth="1.2" />
                <line x1={-7} y1={-3.5} x2={-7} y2={3.5} stroke="#252830" strokeWidth="0.5" />
                <line x1={7} y1={-3.5} x2={7} y2={3.5} stroke="#252830" strokeWidth="0.5" />
                <rect x={-8} y={-6} width="16" height="3" rx="1.5" fill="rgba(255,255,255,0.35)" />
              </g>
              <text x={PITCH_X} y={PITCH_Y - 6} textAnchor="middle" fontSize="6" fill="#5a6478" fontFamily="sans-serif" letterSpacing="0.8">PITCH</text>
            </g>
          </svg>

          <div className="absolute left-3 right-3 bottom-3 z-30 flex items-end justify-between gap-3 pointer-events-auto">
            <div className="flex items-end gap-3">
              <div className="flex flex-col items-center gap-1">
                <div className="relative">
                  <div className="w-9 h-9 rounded-md border border-white/[0.06] flex items-center justify-center" style={{ background: "linear-gradient(180deg, #2a3038 0%, #181a22 50%, #0e1015 100%)", boxShadow: "inset 0 0 6px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.5)" }}>
                    <button onClick={onTogglePower} aria-label={isPoweredOn ? "Power off" : "Power on"} aria-pressed={isPoweredOn} className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95" style={{
                      background: isPoweredOn ? "radial-gradient(circle at 35% 30%, #ff4a4a 0%, #c82828 60%, #581418 100%)" : "radial-gradient(circle at 35% 30%, #5a626c 0%, #2c3040 60%, #14161a 100%)",
                      boxShadow: isPoweredOn ? "0 0 8px rgba(220,50,50,0.6), inset 0 1px 2px rgba(255,200,200,0.4)" : "inset 0 1px 2px rgba(255,255,255,0.1)",
                      filter: isPoweredOn ? 'none' : 'grayscale(0.6) opacity(0.7)',
                    }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: isPoweredOn ? "#ff3a3a" : "#3a1010", boxShadow: isPoweredOn ? "0 0 6px rgba(255,58,58,0.9), 0 0 12px rgba(255,58,58,0.4)" : "none" }} />
                    </button>
                  </div>
                </div>
                <span className="text-[7px] font-mono text-neutral-500 tracking-[0.15em] uppercase">Power</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <button onClick={(e) => { if (onTogglePlay) { onTogglePlay(); } }} aria-label={transportState === 'playing' ? "Pause" : "Play"} className="w-11 h-11 rounded-md border border-white/[0.08] flex items-center justify-center transition-all hover:scale-105 active:scale-95" style={{ background: "linear-gradient(180deg, #2c3542 0%, #161822 50%, #0e1015 100%)", boxShadow: transportState === 'playing' ? "inset 0 0 12px rgba(0,216,246,0.25), 0 0 10px rgba(0,216,246,0.2), 0 3px 8px rgba(0,0,0,0.5)" : "inset 0 0 6px rgba(0,0,0,0.7), 0 3px 8px rgba(0,0,0,0.5)" }}>
                  {transportState === 'playing' ? (
                    <div className="flex gap-1"><div className="w-1 h-4 rounded-sm bg-cyan-400" /><div className="w-1 h-4 rounded-sm bg-cyan-400" /></div>
                  ) : (
                    <div className="w-0 h-0 ml-0.5" style={{ borderLeft: "8px solid #00d8f6", borderTop: "6px solid transparent", borderBottom: "6px solid transparent", filter: "drop-shadow(0 0 4px rgba(0,216,246,0.6))" }} />
                  )}
                </button>
                <span className="text-[7px] font-mono text-neutral-500 tracking-[0.15em] uppercase">{transportState === 'playing' ? "Pause" : "Play"}</span>
              </div>
            </div>

            <div className="flex items-end gap-3">
              <div className="flex flex-col gap-1 items-center">
                <div className="flex gap-1">
                  {[33, 45].map((rpm) => (
                    <button key={rpm} onClick={() => setSpeed(rpm as 33 | 45)} aria-label={`${rpm} RPM`} aria-pressed={speed === rpm} className={`w-9 h-5 rounded text-[9px] font-mono font-bold transition-all ${speed === rpm ? "text-cyan-300" : "text-neutral-500"} hover:text-neutral-300`} style={{ background: speed === rpm ? "linear-gradient(180deg, #0a3540 0%, #082832 100%)" : "linear-gradient(180deg, #1a1c24 0%, #0c0d12 100%)", boxShadow: speed === rpm ? "inset 0 0 6px rgba(0,216,246,0.3), 0 0 4px rgba(0,216,246,0.2)" : "inset 0 0 4px rgba(0,0,0,0.6)", border: speed === rpm ? "1px solid rgba(0,216,246,0.4)" : "1px solid rgba(255,255,255,0.05)" }}>
                      {rpm}
                    </button>
                  ))}
                </div>
                <span className="text-[7px] font-mono text-neutral-500 tracking-[0.15em] uppercase text-center">RPM</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-20 h-14 rounded-md border border-white/[0.08] flex flex-col items-center justify-center px-1" style={{ background: "linear-gradient(180deg, #02060a 0%, #000000 100%)", boxShadow: "inset 0 0 10px rgba(0,0,0,0.9), 0 0 6px rgba(0,216,246,0.15)" }}>
                  <span className="text-[8px] font-mono text-neutral-500 tracking-[0.25em] uppercase leading-none">BPM</span>
                  <span className={`text-2xl font-mono leading-none tabular-nums ${bpm > 0 ? "text-green-400" : "text-green-900"}`} style={{ textShadow: bpm > 0 ? "0 0 6px rgba(34,197,94,0.8), 0 0 14px rgba(34,197,94,0.4)" : "none" }}>
                    {bpm > 0 ? (Math.round(bpm * 10) / 10).toFixed(1) : "--.-"}
                  </span>
                </div>
                <span className="text-[7px] font-mono text-neutral-500 tracking-[0.15em] uppercase">Tempo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`absolute left-3 bottom-3 right-3 top-3 w-2 h-2 rounded-full border border-white/[0.05] shadow-[0_2px_4px_rgba(0,0,0,0.6)]`} style={{ background: "radial-gradient(circle, #2a3038 0%, #0a0c10 100%)" }} />
    </div>
  );
}
