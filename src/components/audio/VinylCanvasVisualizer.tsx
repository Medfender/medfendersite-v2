"use client";

import React, { useEffect, useRef } from "react";
import { useAudio } from "@/context/AudioContext";

interface VinylCanvasVisualizerProps {
  isPlaying: boolean;
  isCurrentTrackActive: boolean;
}

const TOTAL_BARS = 64;
const BAR_GAP = 2; // px
const PEAK_DECAY = 0.012;
const ACTIVE_DECAY = 0.22;
const CANVAS_HEIGHT = 136; // h-34

// 6-point studio layout — guaranteed no overlap
const FREQ_LABELS: { freq: number; label: string }[] = [
  { freq: 20,    label: "20Hz" },
  { freq: 100,   label: "100Hz" },
  { freq: 500,   label: "500Hz" },
  { freq: 1000,  label: "1kHz" },
  { freq: 5000,  label: "5kHz" },
  { freq: 20000, label: "20kHz" },
];

const DB_GRID = [
  { val: 0,   label: "0dB" },
  { val: -12, label: "-12dB" },
  { val: -24, label: "-24dB" },
  { val: -36, label: "-36dB" },
  { val: -48, label: "-48dB" },
];

// Frequency-position-aware color: Indigo/Violet → Cyan/Blue → Ice Blue/Pink
function barColor(t: number): [number, number, number] {
  const clamped = Math.max(0, Math.min(1, t));
  // t=0 → Indigo/Violet (sub-bass), t=0.2→Cyan (mids), t=0.7→Pink (highs)
  if (clamped <= 0.2) {
    const local = clamped / 0.2;
    return [
      Math.round(99 + (139 - 99) * local),   // 99→139 (indigo→violet)
      Math.round(102 + (92 - 102) * local),  // 102→92
      Math.round(241 + (246 - 241) * local),  // 241→246
    ];
  } else if (clamped <= 0.7) {
    const local = (clamped - 0.2) / 0.5;
    return [
      Math.round(139 + (6 - 139) * local),   // violet→cyan
      Math.round(92 + (182 - 92) * local),    // 92→182
      Math.round(246 + (212 - 246) * local),  // 246→212
    ];
  } else {
    const local = (clamped - 0.7) / 0.3;
    return [
      Math.round(6 + (244 - 6) * local),     // cyan→pink
      Math.round(182 + (63 - 182) * local), // 182→63
      Math.round(212 + (94 - 212) * local), // 212→94
    ];
  }
}

// Hot peak color: shifts to neon pink when amp > 0.8
function peakColor(r: number, g: number, b: number, amp: number): [number, number, number] {
  if (amp > 0.8) {
    return [244, 63, 94]; // #f43f5e hot pink
  }
  if (amp > 0.65) {
    return [0, 242, 254]; // #00f2fe neon cyan
  }
  return [r, g, b];
}

export default function VinylCanvasVisualizer({ isPlaying, isCurrentTrackActive }: VinylCanvasVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);

  const smoothed = useRef<Float32Array>(new Float32Array(TOTAL_BARS));
  const peakHold = useRef<Float32Array>(new Float32Array(TOTAL_BARS));
  const proceduralPhase = useRef(0);
  const { getActiveFrequencyData } = useAudio();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let cssW = container.clientWidth || 800;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      cssW = rect.width || container.clientWidth || 800;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(CANVAS_HEIGHT * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${CANVAS_HEIGHT}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const freqToX = (f: number, w: number) => {
      const logMin = Math.log10(20);
      const logMax = Math.log10(20000);
      const ratio = (Math.log10(Math.max(20, f)) - logMin) / (logMax - logMin);
      return ratio * w;
    };

    const draw = () => {
      const active = isPlaying && isCurrentTrackActive;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, CANVAS_HEIGHT);

      // --- Background gradient (dark studio) ---
      const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      bg.addColorStop(0, "#0b0f19");
      bg.addColorStop(1, "#0b1118");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, cssW, CANVAS_HEIGHT);

      // --- Plot area: balanced padding, bars sit inside borders ---
      const plotLeft = 8;
      const plotRight = cssW - 8;
      const plotWidth = plotRight - plotLeft;
      const plotTop = 20;
      const plotBottom = CANVAS_HEIGHT - 24; // bottom of bars
      const plotHeight = plotBottom - plotTop;
      const dBToY = (db: number) => plotTop + ((48 + db) / 48) * plotHeight;

      // --- dB grid lines (horizontal) ---
      DB_GRID.forEach(({ val, label }, idx) => {
        const y = dBToY(val);
        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(plotLeft, y);
        ctx.lineTo(plotLeft + plotWidth, y);
        ctx.stroke();

        ctx.font = "9px ui-monospace, SFMono-Regular, monospace";
        ctx.fillStyle = "rgba(100,116,139,0.55)";
        ctx.textBaseline = "middle";
        if (idx === 0) {
          ctx.textAlign = "right";
          ctx.fillText(label, plotLeft + plotWidth - 4, y - 1);
        } else {
          ctx.textAlign = "left";
          ctx.fillText(label, plotLeft + 4, y - 1);
        }
      });

      // --- Frequency vertical hairlines ---
      FREQ_LABELS.forEach(({ freq }) => {
        const x = freqToX(freq, plotWidth);
        ctx.strokeStyle = "rgba(255,255,255,0.04)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(plotLeft + x, plotTop);
        ctx.lineTo(plotLeft + x, plotBottom);
        ctx.stroke();
      });

      // --- Frequency axis labels (dedicated bottom lane, below bars) ---
      const labelY = CANVAS_HEIGHT - 6;
      ctx.font = "9.5px ui-monospace, SFMono-Regular, monospace";
      ctx.fillStyle = "rgba(156,163,175,0.7)";
      ctx.textBaseline = "alphabetic";
      FREQ_LABELS.forEach(({ freq, label }, idx) => {
        const x = plotLeft + freqToX(freq, plotWidth);
        const last = idx === FREQ_LABELS.length - 1;
        const first = idx === 0;
        if (last) {
          ctx.textAlign = "right";
          ctx.fillText(label, plotLeft + plotWidth - 4, labelY);
        } else if (first) {
          ctx.textAlign = "left";
          ctx.fillText(label, plotLeft + 4, labelY);
        } else {
          ctx.textAlign = "center";
          ctx.fillText(label, x, labelY);
        }
      });

      // --- Compute amplitudes (logarithmic bins) ---
      const target = new Float32Array(TOTAL_BARS);
      let usingFallback = true;

      if (active) {
        const freq = getActiveFrequencyData ? getActiveFrequencyData() : null;
        if (freq && freq.length > 0) {
          usingFallback = false;
          for (let i = 0; i < TOTAL_BARS; i++) {
            const t = i / (TOTAL_BARS - 1);
            const bin = Math.min(freq.length - 1, Math.floor(Math.pow(t, 1.65) * (freq.length - 1)));
            target[i] = freq[bin] / 255;
          }
        }
      }

      if (usingFallback) {
        proceduralPhase.current += 0.048;
        for (let i = 0; i < TOTAL_BARS; i++) {
          const a = Math.sin(proceduralPhase.current + i * 0.28) * 0.5 + 0.5;
          const b = Math.cos(proceduralPhase.current * 0.7 + i * 0.2) * 0.5 + 0.5;
          const centerBoost = 1 - Math.abs((i / (TOTAL_BARS - 1)) * 2 - 1) * 0.35;
          target[i] = active ? Math.max(0.06, a * 0.65 + b * 0.35) * centerBoost : 0;
        }
      }

      // --- Smoothing ---
      const decay = active ? ACTIVE_DECAY : 0.06;
      for (let i = 0; i < TOTAL_BARS; i++) {
        smoothed.current[i] += (target[i] - smoothed.current[i]) * decay;
        if (!active) {
          smoothed.current[i] = Math.max(0.012, smoothed.current[i] * 0.94);
        }
        const cur = smoothed.current[i];
        peakHold.current[i] = cur > peakHold.current[i]
          ? cur
          : Math.max(cur, peakHold.current[i] - PEAK_DECAY);
      }

      // --- Draw bars: full-width edge-to-edge from x=0 to x=plotWidth ---
      const barWidth = Math.max(2, (plotWidth - (TOTAL_BARS - 1) * BAR_GAP) / TOTAL_BARS);
      const startX = plotLeft;
      const baselineY = plotBottom - 2;

      for (let i = 0; i < TOTAL_BARS; i++) {
        const amp = smoothed.current[i];
        const x = startX + i * (barWidth + BAR_GAP);
        const barH = Math.max(amp * (plotHeight - 12), amp > 0.02 ? 2 : 0);
        const y = baselineY - barH;

        if (barH <= 0) continue;

        const freqT = i / Math.max(1, TOTAL_BARS - 1);
        const [baseR, baseG, baseB] = barColor(freqT);
        const isHotPeak = amp > 0.8;
        const [peakR, peakG, peakB] = isHotPeak ? [236, 72, 153] : [baseR, baseG, baseB];

        // 1. Background layer — translucent wide glow
        ctx.fillStyle = `rgba(${baseR},${baseG},${baseB},0.35)`;
        ctx.shadowColor = `rgb(${baseR},${baseG},${baseB})`;
        ctx.shadowBlur = 14;
        ctx.fillRect(x - 0.6, y, barWidth + 1.2, barH);

        // 2. Foreground core — intense bright inner tube (0.6x width, centered)
        const coreW = Math.max(1, barWidth * 0.6);
        const coreX = x + (barWidth - coreW) / 2;
        ctx.shadowBlur = 0;
        const coreGrad = ctx.createLinearGradient(0, y, 0, baselineY);
        coreGrad.addColorStop(0, `rgba(${peakR},${peakG},${peakB},0.95)`);
        coreGrad.addColorStop(0.6, `rgba(${baseR},${baseG},${baseB},0.90)`);
        coreGrad.addColorStop(1, `rgba(${baseR},${baseG},${baseB},0.40)`);
        ctx.fillStyle = coreGrad;
        ctx.fillRect(coreX, y, coreW, barH);

        // Peak dot — 2-tier: hot white core + radial gradient glow
        if (amp > 0.35 && active) {
          const peakY = baselineY - peakHold.current[i] * (plotHeight - 12);
          const peakX = x + barWidth / 2;
          const pulse = 0.85 + Math.sin(performance.now() * 0.003 + i * 0.4) * 0.15;
          const dotR = 2.0 * pulse;

          // Outer radial gradient glow
          const glow = ctx.createRadialGradient(peakX, peakY - 3, 0, peakX, peakY - 3, dotR * 4);
          glow.addColorStop(0, `rgba(${baseR},${baseG},${baseB},0.85)`);
          glow.addColorStop(0.4, `rgba(${baseR},${baseG},${baseB},0.35)`);
          glow.addColorStop(1, `rgba(${baseR},${baseG},${baseB},0)`);
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(peakX, peakY - 3, dotR * 4, 0, Math.PI * 2);
          ctx.fill();

          // White hot core
          ctx.shadowColor = `rgb(${baseR},${baseG},${baseB})`;
          ctx.shadowBlur = 10;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(peakX, peakY - 3, dotR, 0, Math.PI * 2);
          ctx.fill();

          ctx.shadowBlur = 0;
        }
      }

      ctx.shadowBlur = 0;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      ro.disconnect();
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, isCurrentTrackActive, getActiveFrequencyData]);

  return (
    <div
      ref={containerRef}
      className="w-full"
    >
      <canvas
        ref={canvasRef}
        aria-label="Real-time spectrum analyzer"
        className="w-full h-34 block overflow-hidden rounded-lg"
      />
    </div>
  );
}
