"use client";

import React, { useRef } from "react";
import { useAudioTick } from "@/lib/audio/useAudioTick";

interface VUMeterProps {
  className?: string;
}

export default function VUMeter({ className }: VUMeterProps) {
  const needleRef = useRef<SVGGElement | null>(null);
  const ledRef = useRef<SVGGElement | null>(null);

  // Smoothed needle state — mutated directly on the DOM element, zero re-renders
  const angleRef = useRef(0);
  const peakRef = useRef(0);
  const peakDecayRef = useRef(0);

  useAudioTick((frame) => {
    const { frequencyData } = frame;
    if (!frequencyData || frequencyData.length === 0) return;

    // Derive a "VU level" from the low/mid frequency bins — realistic for a VU meter
    const bins = 32;
    let sum = 0;
    for (let i = 0; i < bins; i++) {
      sum += frequencyData[i] ?? 0;
    }
    const avg = sum / bins / 255; // 0..1

    // Needle physics — spring-like follow with overshoot damping
    const targetAngle = -45 + avg * 80; // -45deg (silence) to +35deg (peak)
    const spring = 0.12;
    const damping = 0.75;
    angleRef.current += (targetAngle - angleRef.current) * spring;
    angleRef.current *= damping + (1 - damping);
    const needleAngle = Math.max(-45, Math.min(35, angleRef.current));

    if (needleRef.current) {
      needleRef.current.style.transform = `rotate(${needleAngle}deg)`;
      needleRef.current.style.transformOrigin = "100px 130px";
      needleRef.current.style.transition = "none";
    }

    // Peak hold
    if (avg > peakRef.current) {
      peakRef.current = avg;
    } else {
      peakDecayRef.current++;
      if (peakDecayRef.current > 8) {
        peakRef.current = Math.max(avg, peakRef.current - 0.015);
      }
    }
    const peakAngle = -45 + peakRef.current * 80;

    if (ledRef.current) {
      ledRef.current.style.transform = `rotate(${peakAngle}deg)`;
      ledRef.current.style.transformOrigin = "100px 130px";
      ledRef.current.style.transition = "none";
    }
  });

  return (
    <svg
      viewBox="0 0 200 170"
      className={className}
      aria-label="VU meter"
      role="img"
    >
      <defs>
        {/* Walnut faceplate background */}
        <radialGradient id="vu-bg" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#2a1a0c" />
          <stop offset="60%" stopColor="#1c0f08" />
          <stop offset="100%" stopColor="#0d0a07" />
        </radialGradient>
        {/* Brushed metal chassis */}
        <linearGradient id="vu-chassis" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c8bca0" />
          <stop offset="15%" stopColor="#d4c8a8" />
          <stop offset="30%" stopColor="#b8ac90" />
          <stop offset="45%" stopColor="#d0c4a0" />
          <stop offset="60%" stopColor="#b0a488" />
          <stop offset="75%" stopColor="#c4b894" />
          <stop offset="100%" stopColor="#9a8e78" />
        </linearGradient>
        {/* Glass front overlay */}
        <linearGradient id="vu-glass" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="40%" stopColor="rgba(255,255,255,0.04)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.12)" />
        </linearGradient>
        {/* Amber needle glow */}
        <filter id="needle-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {/* Red peak LED glow */}
        <filter id="peak-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Chassis housing */}
      <rect x="2" y="2" width="196" height="166" rx="4" fill="url(#vu-bg)" stroke="#3d2b18" strokeWidth="1.5" />
      {/* Chassis face */}
      <rect x="8" y="8" width="184" height="154" rx="2" fill="url(#vu-chassis)" stroke="#8a7d60" strokeWidth="0.8" />

      {/* Meter scale plate */}
      <rect x="18" y="14" width="164" height="130" rx="1" fill="#f0e8d8" stroke="#b0a488" strokeWidth="0.5" />

      {/* Scale markings — VU scale from -20 to +3 */}
      {[
        { dB: -20, x: 32 }, { dB: -10, x: 56 }, { dB: -7, x: 68 },
        { dB: -5, x: 77 }, { dB: -3, x: 87 }, { dB: 0, x: 100 },
        { dB: 1, x: 107 }, { dB: 2, x: 114 }, { dB: 3, x: 122 },
      ].map(({ dB, x }) => {
        const angle = -45 + ((dB + 20) / 23) * 80;
        const rad = (angle * Math.PI) / 180;
        const r1 = 72;
        const r2 = 78;
        const y1 = 130 - r1 * Math.cos(rad);
        const x1 = 100 + r1 * Math.sin(rad);
        const y2 = 130 - r2 * Math.cos(rad);
        const x2 = 100 + r2 * Math.sin(rad);
        const isPeak = dB >= 0;
        return (
          <g key={dB}>
            <line
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isPeak ? "#c0392b" : "#2c1a0e"} strokeWidth={isPeak ? 1.5 : 1}
            />
            <text
              x={x1 * 1.18 - 20} y={y1 * 1.18 + 3 - 30}
              textAnchor="middle"
              fontSize="8"
              fontFamily="JetBrains Mono, monospace"
              fontWeight={dB === 0 ? "700" : "400"}
              fill={isPeak ? "#c0392b" : "#4a3828"}
            >
              {dB === 0 ? "0" : dB > 0 ? `+${dB}` : `${dB}`}
            </text>
          </g>
        );
      })}

      {/* Minor tick marks */}
      {[-17, -14, -12, -8, -6, -4, -2, -1, 1.5].map((dB) => {
        const angle = -45 + ((dB + 20) / 23) * 80;
        const rad = (angle * Math.PI) / 180;
        const r1 = 74;
        const r2 = 78;
        const y1 = 130 - r1 * Math.cos(rad);
        const x1 = 100 + r1 * Math.sin(rad);
        const y2 = 130 - r2 * Math.cos(rad);
        const x2 = 100 + r2 * Math.sin(rad);
        return (
          <line key={dB} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4a3828" strokeWidth="0.6" />
        );
      })}

      {/* Red zone arc */}
      <path
        d="M 152 78 A 78 78 0 0 1 178 110"
        fill="none"
        stroke="#c0392b"
        strokeWidth="6"
        opacity="0.3"
        strokeLinecap="round"
      />

      {/* VU label */}
      <text x="100" y="95" textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono, monospace" fontWeight="700" fill="#2c1a0e" letterSpacing="2">VU</text>

      {/* Amber meter needle */}
      <g ref={needleRef}>
        <line
          x1="100" y1="130" x2="100" y2="40"
          stroke="#00d8f6"
          strokeWidth="2"
          strokeLinecap="round"
          filter="url(#needle-glow)"
        />
        {/* Needle tip */}
        <circle cx="100" cy="40" r="2.5" fill="#ff8c00" filter="url(#needle-glow)" />
      </g>

      {/* Peak hold needle (thin red) */}
      <g ref={ledRef}>
        <line
          x1="100" y1="130" x2="100" y2="44"
          stroke="#e74c3c"
          strokeWidth="1"
          strokeLinecap="round"
          filter="url(#peak-glow)"
          opacity="0.8"
        />
      </g>

      {/* Pivot jewel */}
      <circle cx="100" cy="130" r="8" fill="#1c0f08" stroke="#3d2b18" strokeWidth="1" />
      <circle cx="100" cy="130" r="5" fill="#00d8f6" stroke="#8a6a28" strokeWidth="0.5" />
      <ellipse cx="98" cy="128" rx="2.5" ry="1.5" fill="rgba(255,255,255,0.5)" transform="rotate(-30 98 128)" />

      {/* Glass front reflection */}
      <rect x="18" y="14" width="164" height="130" rx="1" fill="url(#vu-glass)" style={{ mixBlendMode: "overlay" }} />

      {/* Amber power LED */}
      <circle cx="172" cy="148" r="3" fill="#ff8c00" filter="url(#needle-glow)" opacity="0.9" />
      <circle cx="172" cy="148" r="5" fill="none" stroke="#ff8c00" strokeWidth="0.5" opacity="0.4" />

      {/* Model label */}
      <text x="100" y="155" textAnchor="middle" fontSize="6" fontFamily="JetBrains Mono, monospace" fill="#9a8e78" letterSpacing="1.5">MODEL SL-1200</text>
    </svg>
  );
}
