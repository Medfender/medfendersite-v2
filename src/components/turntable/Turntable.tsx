"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

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
  const [antiSkateAngle, setAntiSkateAngle] = useState(0);

  const handleAntiSkateMouseDown = useCallback((e: React.MouseEvent<SVGGElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget;
    const svgEl = target.closest('svg');
    if (!svgEl) return;
    const cx = TPX + 36;
    const cy = TPY - 4;
    const handleMove = (ev: MouseEvent) => {
      const pt = (svgEl as SVGSVGElement).createSVGPoint();
      pt.x = ev.clientX;
      pt.y = ev.clientY;
      const ctm = (svgEl as SVGSVGElement).getScreenCTM();
      if (!ctm) return;
      const svgPt = pt.matrixTransform(ctm.inverse());
      const dx = svgPt.x - cx;
      const dy = svgPt.y - cy;
      const deg = Math.atan2(dy, dx) * 180 / Math.PI + 90;
      const norm = ((deg % 360) + 360) % 360;
      const val = Math.max(0, Math.min(300, Math.round(norm)));
      setAntiSkateAngle(val);
    };
    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, []);

  useEffect(() => {
    let timer1: ReturnType<typeof setTimeout>;
    let timer2: ReturnType<typeof setTimeout>;

    if (transportState === 'playing') {
      if (armAngle === 0) {
        // 1. Coming from STOP: Engage lever, lift arm, swing, drop
        setIsLeverEngaged(true);
        setIsLifted(true);
        timer1 = setTimeout(() => {
          setArmAngle(38);
          timer2 = setTimeout(() => setIsLifted(false), 600);
        }, 400);
      } else {
        // 2. Coming from PAUSE: Lever stays engaged. Just drop the needle.
        setIsLifted(false);
      }
    }
    else if (transportState === 'paused') {
      // 3. Paused: Lift arm off the record (lever engaged, needle raised)
      setIsLeverEngaged(true);
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
  // Top-down center of the counterweight puck. Offset slightly downward
  // from the original back-of-arm anchor so the scale tick numbers fit
  // cleanly above the dial ring inside the SVG viewBox.
  const CW_CX = TPX; const CW_CY = TPY - CW_LEN + 8;
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
  const sliderY = PITCH_Y + PITCH_LEN / 2 - pitch * (PITCH_LEN / 16);

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
                  <circle cx="490" cy="300" r="14" fill="#2c3040" stroke="#1a1c23" strokeWidth="1" />
                  <circle cx="490" cy="300" r="9" fill="url(#brushed-al)" stroke="#1a1c23" strokeWidth="0.5" />
                  <circle cx="490" cy="300" r="4" fill="url(#precision-chrome)" />
                  <path d="M 487,297 C 484,297 484,303 487,303 L 493,303 C 496,303 496,297 493,297" fill="none" stroke="#111318" strokeWidth="2.5" strokeLinecap="round" />
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
                    <g id="a-skate-dial" style={{ cursor: 'grab', touchAction: 'none' }}
                    onMouseDown={handleAntiSkateMouseDown}>
                    <circle cx={TPX + 36} cy={TPY - 4} r="9" fill="url(#anodized-dark)" stroke="#252830" strokeWidth="0.5" />
                    <circle cx={TPX + 36} cy={TPY - 4} r="6.5" fill="url(#brass)" stroke="#4a3a18" strokeWidth="0.4" />
                    <g transform={`rotate(${antiSkateAngle} ${TPX + 36} ${TPY - 4})`}>
                      <line x1={TPX + 36} y1={TPY - 8} x2={TPX + 36} y2={TPY - 1} stroke="#1e1410" strokeWidth="1" />
                    </g>
                    <circle cx={TPX + 36} cy={TPY - 4} r="1.2" fill="#1a1410" />
                    <text x={TPX + 36} y={TPY + 5} textAnchor="middle" fontSize="4" fill="#5a6478" fontFamily="monospace" letterSpacing="0.4">A-SKATE</text>
                  </g>
                </g>

                {/* Cue system base — deck-mounted, does NOT rotate */}
                <g id="cueing-system" transform="translate(0, -10)">
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
                     {/* Vibrant accent cue lever tip */}
                     <circle cx="456" cy="79" r="3" fill="#e63946" stroke="#111318" strokeWidth="0.5" />
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
                  [TPX + 28, TPY, 0], [TPX, TPY + 28, 90], [TPX, TPY - 28, 270],
                ].map(([sx, sy], i) => (
                  <circle key={i} cx={sx as number} cy={sy as number} r="2.4" fill="url(#precision-chrome)" stroke="#4a5262" strokeWidth="0.4" />
                ))}
              </g>

              {/* WRAPPER: Handles strictly the vertical lift illusion (shadow + translation) */}
              <g id="tonearm-lift-wrapper" style={{ transformOrigin: '490px 75px', transform: isLifted ? 'scale(1.03)' : 'scale(1)', filter: isLifted ? 'drop-shadow(15px 25px 12px rgba(0,0,0,0.35))' : 'drop-shadow(4px 6px 4px rgba(0,0,0,0.6))', transition: 'transform 0.4s ease-in-out, filter 0.4s ease-in-out' }}>
                {/* INNER GROUP: Handles strictly the rotation, locked to 490,75 */}
                <g id="tonearm-assembly" style={{ transform: `rotate(${armAngle}deg)`, transformOrigin: '490px 75px', transition: 'transform 0.6s cubic-bezier(0.34, 1.1, 0.64, 1)' }}>
                {/* Bearing carrier (rotates with arm — visually inside the
                    static pivot housing ring). */}
                <g id="tonearm-bearing-carrier" filter="url(#shadow-sm)">
                  <circle cx={TPX} cy={TPY} r="16" fill="url(#polished-al)" stroke="#3a3e4c" strokeWidth="0.5" />
                  <circle cx={TPX} cy={TPY} r="9" fill="#060810" stroke="#0e1015" strokeWidth="0.4" />
                  <ellipse cx={TPX - 3} cy={TPY - 3} rx="5" ry="3" fill="rgba(220,228,248,0.5)" />
                </g>

                {/* Counterweight assembly — main tubular sleeve viewed from overhead */}
                <g id="counterweight-assembly" filter="url(#shadow-md)">
                  {/* Main cylindrical weight barrel viewed from top */}
                  <rect x={TPX - 9} y={TPY - CW_LEN} width={18} height={CW_LEN} rx="3" fill="url(#precision-chrome)" stroke="#1a1c23" strokeWidth="0.8" />

                  {/* Knurled adjustment grip section in the middle */}
                  <rect x={TPX - 8} y={TPY - CW_LEN + 22} width={16} height="20" fill="#2c3040" />
                  {/* Fine knurling lines */}
                  <line x1={TPX - 7.5} y1={TPY - CW_LEN + 22} x2={TPX - 7.5} y2={TPY - CW_LEN + 32} stroke="#111318" strokeWidth="0.5" />
                  <line x1={TPX - 5.5} y1={TPY - CW_LEN + 22} x2={TPX - 5.5} y2={TPY - CW_LEN + 32} stroke="#111318" strokeWidth="0.5" />
                  <line x1={TPX - 3.5} y1={TPY - CW_LEN + 22} x2={TPX - 3.5} y2={TPY - CW_LEN + 32} stroke="#111318" strokeWidth="0.5" />
                  <line x1={TPX - 1.5} y1={TPY - CW_LEN + 22} x2={TPX - 1.5} y2={TPY - CW_LEN + 32} stroke="#111318" strokeWidth="0.5" />
                  <line x1={TPX + 0.5} y1={TPY - CW_LEN + 22} x2={TPX + 0.5} y2={TPY - CW_LEN + 32} stroke="#111318" strokeWidth="0.5" />
                  <line x1={TPX + 2.5} y1={TPY - CW_LEN + 22} x2={TPX + 2.5} y2={TPY - CW_LEN + 32} stroke="#111318" strokeWidth="0.5" />
                  <line x1={TPX + 4.5} y1={TPY - CW_LEN + 22} x2={TPX + 4.5} y2={TPY - CW_LEN + 32} stroke="#111318" strokeWidth="0.5" />
                  <line x1={TPX + 6.5} y1={TPY - CW_LEN + 22} x2={TPX + 6.5} y2={TPY - CW_LEN + 32} stroke="#111318" strokeWidth="0.5" />

                  {/* Number markings and scale ring */}
                  <g id="counterweight-scale" opacity="0.85">
                    <line x1={TPX - 9} y1={TPY - CW_LEN + 12} x2={TPX - 7} y2={TPY - CW_LEN + 12} stroke="#ffffff" strokeWidth="0.5" />
                    <line x1={TPX - 9} y1={TPY - CW_LEN + 14} x2={TPX - 7.5} y2={TPY - CW_LEN + 14} stroke="#ffffff" strokeWidth="0.4" />
                    <line x1={TPX - 9} y1={TPY - CW_LEN + 16} x2={TPX - 7} y2={TPY - CW_LEN + 16} stroke="#ffffff" strokeWidth="0.5" />
                  </g>

                  {/* Rear end cap */}
                  <g id="counterweight-end-cap">
                    <rect x={TPX - 8.5} y={TPY - CW_LEN + 2} width="17" height="4" rx="2" fill="#111318" stroke="#333" strokeWidth="0.5" />
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
                <g id="headshell-assembly" transform="translate(490, 282)">
                  <g transform="scale(1.4)">
                    <g id="bayonet-collar">
                      {/* Plug inserted inside the tube */}
                      <rect x="-3.5" y="-4" width="7" height="8" fill="#111318" />
                      {/* Well-rounded locking collar matching the arm tube diameter */}
                      <rect x="-4.5" y="3" width="9" height="7" rx="1.5" fill="url(#precision-chrome)" stroke="#1a1c23" strokeWidth="0.5" />
                      {/* Tighter, more realistic knurled grip lines */}
                      <line x1="-3.2" y1="3" x2="-3.2" y2="10" stroke="#111318" strokeWidth="0.4" />
                      <line x1="-2.4" y1="3" x2="-2.4" y2="10" stroke="#111318" strokeWidth="0.4" />
                      <line x1="-1.6" y1="3" x2="-1.6" y2="10" stroke="#111318" strokeWidth="0.4" />
                      <line x1="-0.8" y1="3" x2="-0.8" y2="10" stroke="#111318" strokeWidth="0.4" />
                      <line x1="0" y1="3" x2="0" y2="10" stroke="#111318" strokeWidth="0.4" />
                      <line x1="0.8" y1="3" x2="0.8" y2="10" stroke="#111318" strokeWidth="0.4" />
                      <line x1="1.6" y1="3" x2="1.6" y2="10" stroke="#111318" strokeWidth="0.4" />
                      <line x1="2.4" y1="3" x2="2.4" y2="10" stroke="#111318" strokeWidth="0.4" />
                      <line x1="3.2" y1="3" x2="3.2" y2="10" stroke="#111318" strokeWidth="0.4" />
                      {/* Base flange connecting to the headshell body */}
                      <path d="M -4.5,10 L 4.5,10 L 5,14 L -5,14 Z" fill="#2c3040" />
                    </g>
                    <g transform="rotate(23 0 8.5)">
                      {/* CARTRIDGE & STYLUS — top-down orthographic */}
                      <g id="cartridge-assembly">
                        {/* Gold cartridge body */}
                        <rect x="-4.5" y="12" width="9" height="20" fill="#b89947" rx="1" />
                        {/* Dark inner recess */}
                        <rect x="-3" y="15" width="6" height="15" fill="#111318" />
                        {/* Diamond stylus tip — flat top-down */}
                        <path d="M 0,34.5 L 1.2,36.5 L 0,38.5 L -1.2,36.5 Z" fill="#e5e7eb" />
                        {/* Diamond center dot */}
                        <circle cx="0" cy="36.5" r="0.4" fill="#d4d4d8" />
                      </g>
                      {/* HEADSHELL BODY */}
                      <g id="headshell-body">
                        <path d="M -5,8.5 L 5,8.5 L 7.5,14 L 7.5,33 C 7.5,34 6.5,35 0,35 C -6.5,35 -7.5,34 -7.5,33 L -7.5,14 Z" fill="#2c3040" stroke="#1a1c23" strokeWidth="0.5" />
                        <rect x="-4.5" y="15" width="2" height="12" rx="1" fill="#1a1c23" />
                        <rect x="2.5" y="15" width="2" height="12" rx="1" fill="#1a1c23" />
                        <circle cx="-3.5" cy="22" r="1.8" fill="url(#precision-chrome)" />
                        <line x1="-4.5" y1="22" x2="-2.5" y2="22" stroke="#222" strokeWidth="0.5" transform="rotate(45 -3.5 22)" />
                        <circle cx="3.5" cy="22" r="1.8" fill="url(#precision-chrome)" />
                        <line x1="2.5" y1="22" x2="4.5" y2="22" stroke="#222" strokeWidth="0.5" transform="rotate(-15 3.5 22)" />
                        <circle cx="0" cy="28" r="1.5" fill="#1a1c23" opacity="0.5" />
                      </g>
                      {/* MACHINED FINGER LIFT — flat top-down pill strip */}
                      <g id="headshell-finger-lift">
                        {/* Dark matte pill strip — flat top-down silhouette */}
                        <rect x="7" y="11" width="8" height="7" rx="1.2" fill="#0e1015" stroke="#252830" strokeWidth="0.4" />
                        {/* Thin center recess line (grip groove from above) */}
                        <line x1="9" y1="11.5" x2="9" y2="17.5" stroke="#04060c" strokeWidth="0.8" strokeLinecap="round" />
                        <line x1="13" y1="11.5" x2="13" y2="17.5" stroke="#04060c" strokeWidth="0.8" strokeLinecap="round" />
                        {/* Subtle center highlight */}
                        <line x1="11" y1="11.5" x2="11" y2="17.5" stroke="rgba(100,108,128,0.25)" strokeWidth="0.4" strokeLinecap="round" />
                      </g>
                    </g>
                    </g>
                </g>
                </g>
              </g>
              {/* End #tonearm-lift-wrapper */}
            </g>
            {/* End #tonearm-system */}
          </g>

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
              <g style={{ transform: `translateX(${PITCH_X}px) translateY(${sliderY}px)`, transition: "transform 0.15s ease-out" }}>
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
                  <span className={`text-2xl font-mono leading-none tabular-nums transition-all duration-300 ${bpm > 0 && isPlaying ? 'text-[#00ffaa]' : 'text-green-900'}`} style={{ textShadow: bpm > 0 && isPlaying ? '0 0 12px rgba(0, 255, 170, 0.6)' : 'none' }}>
                    {bpm > 0 ? bpm : '--'}
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
