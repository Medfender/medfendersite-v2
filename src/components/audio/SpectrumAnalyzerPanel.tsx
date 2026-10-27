"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import {
  audioTickController,
  EQBand,
  FilterType,
  freqToXNorm,
  xNormToFreq,
  dbToYNorm,
  yNormToDb,
} from "@/lib/audio/AudioTickController";
import { useAudio } from "@/context/AudioContext";
import { AudioPhysicsEngine } from "@/lib/visualizer/AudioPhysicsEngine";
import { renderStudioVisualizer } from "@/lib/visualizer/visualizerRenderers";
import type { ColorTheme } from "@/lib/visualizer/useAudioVisualizer";

const MAX_DB = 18;
const BAND_TYPES: FilterType[] = ["lowcut", "lowshelf", "peaking", "highshelf", "highcut"];

interface SpectrumAnalyzerPanelProps {
  selectedBandId: number | null;
  setSelectedBandId: (id: number | null) => void;
}

export default function SpectrumAnalyzerPanel({ selectedBandId, setSelectedBandId }: SpectrumAnalyzerPanelProps) {
  const { analyserNode, isPlaying, transportState } = useAudio();
  const playingRef = useRef(isPlaying);
  const transportRef = useRef(transportState);
  useEffect(() => { playingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { transportRef.current = transportState; }, [transportState]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const dragRef = useRef<{ bandId: number } | null>(null);
  const hoverRef = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [viewMode, setViewMode] = useState<"curve" | "bars">("curve");
  const [colorTheme, setColorTheme] = useState<ColorTheme>("cyan");
  const viewModeRef = useRef<"curve" | "bars">("curve");
  const colorThemeRef = useRef<ColorTheme>("cyan");
  useEffect(() => { viewModeRef.current = viewMode; }, [viewMode]);
  useEffect(() => { colorThemeRef.current = colorTheme; }, [colorTheme]);

  // Shared audio physics engine — same instance used by the Vinyl Showcase visualizer.
  // One engine, persistent buffers, zero per-frame allocation.
  const physicsEngineRef = useRef<AudioPhysicsEngine>(new AudioPhysicsEngine(128));

  // ── rAF render loop: zero React re-renders ───────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;
    const container = containerRef.current!;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const handleFrame = (frame: any) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx2d = canvas.getContext("2d");
      if (!ctx2d) return;
      // Zero-React-re-render path: draw directly on canvas using physics engine
      const container = containerRef.current!;
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();

      if (!playingRef.current || transportRef.current !== 'playing') {
        ctx2d.clearRect(0, 0, canvas.width, canvas.height);
        drawSilentFrame(ctx2d, canvas);
        return;
      }

      // LIVE EQ CURVE — same pipeline as VinylShowcase visualizer
      // Use the analyser from audioTickController (seeded in useEffect)
      const analyser = (audioTickController as any).analyserRef?.current;
      if (analyser && frame.frequencyData) {
        // Process with AudioPhysicsEngine for smooth EQ curve
        const phys = physicsEngineRef.current;
        const dt = Math.min(0.05, 0.016); // ~60Hz
        const freqBuf = frame.frequencyData;
        const timeBuf = new Uint8Array(analyser.fftSize || 512);
        try { analyser.getByteTimeDomainData(timeBuf); } catch { /* ignore */ }
        const data = phys.process(freqBuf, timeBuf, dt, true);

        // Render with the real EQ curve (drawCurve) using selected theme
        // We draw at CSS pixel scale — canvas backing store handles DPR
        const cssW = rect.width;
        const cssH = rect.height;
        ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx2d.clearRect(0, 0, cssW, cssH);

        const themeKey: ColorTheme = colorThemeRef.current;
        const themeObj = (require("@/lib/visualizer/useAudioVisualizer") as any).THEMES?.[themeKey] ?? (require("@/lib/visualizer/useAudioVisualizer") as any).THEMES?.cyan;

        const currentMode = viewModeRef.current;
        renderStudioVisualizer(ctx2d, data, cssW, cssH, currentMode, themeKey);
      } else {
        drawFrame(ctx2d, canvas, frame, viewModeRef.current, colorThemeRef.current);
      }
    };
    audioTickController.on(handleFrame);
    // Seed analyser node from AudioContext so tick loop can read frequency data
    if (analyserNode) audioTickController.seedRefs(analyserNode, null);
    audioTickController.start();

    // Tooltip rAF (independent of tick frame for smoothness)
    const renderLoop = () => {
      const tip = tooltipRef.current;
      const canvasEl = canvasRef.current;
      if (tip && canvasEl) {
        const band = hoverRef.current != null
          ? audioTickController.eqBands.find((b: EQBand) => b.id === hoverRef.current)
          : null;
        if (band) {
          const rect = canvasEl.getBoundingClientRect();
          const x = freqToXNorm(band.frequency) * rect.width;
          const y = dbToYNorm(band.gain) * rect.height;
          tip.style.transform = `translate(${x + 14}px, ${y - 48}px)`;
          tip.style.opacity = "1";
          tip.innerHTML = `
            <div style="color:#fbbf24;font-weight:700;font-family:'JetBrains Mono',monospace;font-size:10px;">${band.frequency.toFixed(0)} Hz</div>
            <div style="color:#f2e6c8;font-family:'JetBrains Mono',monospace;font-size:10px;">${band.gain >= 0 ? "+" : ""}${band.gain.toFixed(1)} dB</div>
            <div style="color:#94a3b8;font-family:'JetBrains Mono',monospace;font-size:9px;">Q ${band.q.toFixed(2)}</div>
            <div style="color:#475569;font-family:'JetBrains Mono',monospace;font-size:8px;text-transform:uppercase;letter-spacing:0.1em;">${band.type}</div>
          `;
        } else {
          tip.style.opacity = "0";
        }
      }
      rafRef.current = requestAnimationFrame(renderLoop);
    };
    rafRef.current = requestAnimationFrame(renderLoop);

    return () => {
      audioTickController.off(handleFrame);
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  // Re-seed analyser ref whenever the AudioContext creates/updates it
  useEffect(() => {
    if (analyserNode) audioTickController.seedRefs(analyserNode, null);
  }, [analyserNode]);

  // ── Canvas coordinate helpers ────────────────────────────────────────────

  const getCanvasPoint = useCallback((e: React.MouseEvent | MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }, []);

  const findBandAt = useCallback((x: number, y: number): EQBand | null => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const bands = audioTickController.eqBands;
    const HIT_RADIUS = 14;
    for (const b of bands) {
      const bx = freqToXNorm(b.frequency) * rect.width;
      const by = dbToYNorm(b.gain) * rect.height;
      const dx = x * rect.width - bx;
      const dy = y * rect.height - by;
      if (dx * dx + dy * dy < HIT_RADIUS * HIT_RADIUS) return b;
    }
    return null;
  }, []);

  // ── Mouse handlers (attached via useEffect for window-level tracking) ────

  const handlePointerDown = useCallback((e: React.MouseEvent) => {
    const p = getCanvasPoint(e);
    const hit = findBandAt(p.x, p.y);

    // Alt/Option + click empty canvas = solo band (temporary bandpass)
    if (e.altKey && !hit) {
      const freq = xNormToFreq(p.x);
      const gain = yNormToDb(p.y);
      const id = audioTickController.addBand("peaking", freq, gain, 4.0);
      dragRef.current = { bandId: id };
      setSelectedBandId(id);
      setTimeout(() => audioTickController.removeBand(id), 1500);
      return;
    }

    if (hit) {
      dragRef.current = { bandId: hit.id };
      setSelectedBandId(hit.id);
    }
  }, [getCanvasPoint, findBandAt]);

  const handlePointerMove = useCallback((e: React.MouseEvent) => {
    const p = getCanvasPoint(e);
    const hit = findBandAt(p.x, p.y);
    hoverRef.current = hit ? hit.id : null;

    const canvas = canvasRef.current!;
    canvas.style.cursor = hit ? "grab" : "default";

    if (dragRef.current) {
      const freq = xNormToFreq(p.x);
      const gain = yNormToDb(p.y);
      audioTickController.setBandFrequency(dragRef.current.bandId, freq);
      audioTickController.setBandGain(dragRef.current.bandId, gain);
    }
  }, [getCanvasPoint, findBandAt]);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const p = getCanvasPoint(e);
    const hit = findBandAt(p.x, p.y);
    if (hit) {
      // Double-click on band = toggle
      audioTickController.toggleBand(hit.id);
      return;
    }
    // Double-click empty = create new peaking band
    const freq = xNormToFreq(p.x);
    const gain = yNormToDb(p.y);
    const id = audioTickController.addBand("peaking", freq, gain, 1.0);
    setSelectedBandId(id);
  }, [getCanvasPoint, findBandAt]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    const p = getCanvasPoint(e);
    const hit = findBandAt(p.x, p.y);
    if (!hit) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.5 : 0.5;
    audioTickController.setBandQ(hit.id, hit.q + delta);
  }, [getCanvasPoint, findBandAt]);

  // Global mouse tracking for drag continuation
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const freq = xNormToFreq(x);
      const gain = yNormToDb(y);
      audioTickController.setBandFrequency(dragRef.current.bandId, freq);
      audioTickController.setBandGain(dragRef.current.bandId, gain);
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // ── JSX ──────────────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{
        background: "transparent",
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        role="img"
        aria-label="Live spectrum and EQ curve, 20 Hz to 20 kHz. Pointer-interactive: drag a band to change its frequency and gain, double-click to add one."
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
      />

      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 30,
          pointerEvents: "none",
          opacity: 0,
          padding: "6px 10px",
          background: "rgba(6,8,12,0.92)",
          border: "1px solid rgba(251,191,36,0.35)",
          boxShadow: "0 0 12px rgba(251,191,36,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
          whiteSpace: "nowrap",
          transition: "opacity 0.1s ease",
        }}
      />

      {/* Curve / Bars toggle + display profile swatches */}
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 10,
          zIndex: 20,
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 6px",
          background: "rgba(10,8,6,0.72)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(217,154,62,0.16)",
          borderRadius: 4,
        }}
      >
        {(["curve", "bars"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setViewMode(m)}
            style={{
              padding: "3px 8px",
              fontSize: 9,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: viewMode === m ? "#f2e6c8" : "#9ca3a5",
              background: viewMode === m ? "rgba(223,161,74,0.12)" : "transparent",
              border: viewMode === m ? "1px solid rgba(223,161,74,0.35)" : "1px solid rgba(100,116,139,0.25)",
              borderRadius: 3,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {m === "curve" ? "Curve" : "Bars"}
          </button>
        ))}
        <div style={{ width: 1, background: "rgba(148,163,184,0.2)", height: 14 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, transform: "translateX(8px)" }}>
        {(["cyan", "neon", "emerald"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setColorTheme(c)}
            aria-label={`${c} theme`}
            title={`${c} theme`}
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              border: `1.5px solid ${colorTheme === c ? "rgba(255,255,255,0.7)" : "rgba(100,116,139,0.3)"}`,
              background:
                c === "cyan" ? "#D0C0A6" : c === "neon" ? "#f87171" : "#34d399",
              boxShadow: colorTheme === c ? `0 0 6px ${c === "cyan" ? "rgba(223,161,74,0.5)" : c === "neon" ? "rgba(248,113,113,0.5)" : "rgba(52,211,153,0.5)"}` : "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          />
        ))}
        </div>
      </div>

    </div>
  );
}

// ── Canvas Drawing Functions (zero React state) ────────────────────────────

function drawSilentFrame(ctx2d: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (w === 0 || h === 0) return;
  ctx2d.clearRect(0, 0, w, h);

  // The idle instrument face: full log-frequency grid + dB rulings, so the
  // panel reads as a calibrated scale before any signal arrives.
  drawGrid(ctx2d, w, h);

  ctx2d.save();

  // Frequency ticks and labels along the floor of the scale.
  const ticks: Array<[number, string]> = [
    [20, "20"],
    [50, "50"],
    [100, "100"],
    [200, "200"],
    [500, "500"],
    [1000, "1k"],
    [2000, "2k"],
    [5000, "5k"],
    [10000, "10k"],
    [20000, "20k"],
  ];
  ctx2d.font = "9px ui-monospace, 'Geist Mono', monospace";
  ctx2d.textAlign = "center";
  ctx2d.textBaseline = "bottom";
  for (const [f, label] of ticks) {
    const x = freqToXNorm(f) * w;
    ctx2d.strokeStyle = "rgba(217,154,62,0.22)";
    ctx2d.lineWidth = 1;
    ctx2d.beginPath();
    ctx2d.moveTo(x, h - 26);
    ctx2d.lineTo(x, h - 18);
    ctx2d.stroke();
    ctx2d.fillStyle = "rgba(242,235,221,0.28)";
    ctx2d.fillText(label, Math.min(w - 12, Math.max(12, x)), h - 5);
  }

  // Zero-dB datum: dashed brass rule.
  const zeroY = dbToYNorm(0) * h;
  ctx2d.setLineDash([3, 5]);
  ctx2d.strokeStyle = "rgba(217,154,62,0.4)";
  ctx2d.lineWidth = 1;
  ctx2d.beginPath();
  ctx2d.moveTo(0, zeroY);
  ctx2d.lineTo(w, zeroY);
  ctx2d.stroke();
  ctx2d.setLineDash([]);

  // dB labels on the left edge.
  ctx2d.font = "9px ui-monospace, 'Geist Mono', monospace";
  ctx2d.textAlign = "left";
  ctx2d.textBaseline = "middle";
  for (const db of [12, 6, 0, -6, -12]) {
    const y = dbToYNorm(db) * h;
    if (y < 14 || y > h - 30) continue;
    ctx2d.fillStyle = "rgba(242,235,221,0.22)";
    ctx2d.fillText(db > 0 ? `+${db}` : `${db}`, 8, y);
  }

  ctx2d.restore();
}

function drawFrame(
  ctx2d: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  frame: any,
  viewMode: "curve" | "bars" = "curve",
  colorTheme: "cyan" | "neon" | "emerald" = "cyan"
) {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  ctx2d.clearRect(0, 0, w, h);

  drawGrid(ctx2d, w, h);
  if (frame.frequencyData) {
    if (viewMode === "bars") {
      drawBarsSpectrum(ctx2d, w, h, frame.frequencyData, colorTheme);
    } else {
      drawSpectrum(ctx2d, w, h, frame.frequencyData);
    }
  }
  drawResponseFill(ctx2d, w, h, frame);
  drawEQResponse(ctx2d, w, h, frame);
  drawBandHandles(ctx2d, w, h, frame);
  drawFrequencyLabels(ctx2d, w, h);
  drawDbLabels(ctx2d, w, h);
}

function drawGrid(ctx2d: CanvasRenderingContext2D, w: number, h: number) {
  ctx2d.save();
  // Decade grid: 20, 100, 1k, 10k
  for (const f of [20, 100, 1000, 10000]) {
    const x = freqToXNorm(f) * w;
    ctx2d.strokeStyle = "rgba(223,161,74,0.08)";
    ctx2d.lineWidth = 1;
    ctx2d.beginPath();
    ctx2d.moveTo(x, 0);
    ctx2d.lineTo(x, h);
    ctx2d.stroke();
  }
  // Minor decade lines
  ctx2d.strokeStyle = "rgba(223,161,74,0.03)";
  for (const f of [50, 200, 500, 2000, 5000, 20000]) {
    const x = freqToXNorm(f) * w;
    ctx2d.beginPath();
    ctx2d.moveTo(x, 0);
    ctx2d.lineTo(x, h);
    ctx2d.stroke();
  }
  // dB grid lines
  for (const db of [0, 6, 12, 18, -6, -12, -18]) {
    const y = dbToYNorm(db) * h;
    ctx2d.strokeStyle = db === 0 ? "rgba(255,255,255,0.18)" : "rgba(223,161,74,0.04)";
    ctx2d.lineWidth = db === 0 ? 1 : 0.5;
    ctx2d.beginPath();
    ctx2d.moveTo(0, y);
    ctx2d.lineTo(w, y);
    ctx2d.stroke();
  }
  ctx2d.restore();
}

function drawSpectrum(
  ctx2d: CanvasRenderingContext2D,
  w: number,
  h: number,
  data: Uint8Array
) {
  ctx2d.save();
  ctx2d.beginPath();
  ctx2d.moveTo(0, h);
  const N = data.length;
  const nyquist = 22050;
  for (let i = 0; i < N; i++) {
    const freq = (i * nyquist) / N;
    if (freq < 20 || freq > 20000) continue;
    const x = freqToXNorm(freq) * w;
    const v = data[i] / 255;
    const y = h - v * h;
    ctx2d.lineTo(x, y);
  }
  ctx2d.lineTo(w, h);
  ctx2d.closePath();
  // Cyan gradient fill
  const grad = ctx2d.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "rgba(223,161,74,0.35)");
  grad.addColorStop(1, "rgba(223,161,74,0.05)");
  ctx2d.fillStyle = grad;
  ctx2d.fill();
  // Glowing outline
  ctx2d.shadowColor = "#D0C0A6";
  ctx2d.shadowBlur = 8;
  ctx2d.strokeStyle = "#D0C0A6";
  ctx2d.lineWidth = 1.2;
  ctx2d.stroke();
  ctx2d.restore();
}

function drawEQResponse(
  ctx2d: CanvasRenderingContext2D,
  w: number,
  h: number,
  frame: any
) {
  const response = frame.eqFrequencyResponse;
  const freqs = frame.eqFrequencies;
  if (!response || !freqs) return;
  ctx2d.save();
  ctx2d.beginPath();
  for (let i = 0; i < response.length; i++) {
    const magDb = 20 * Math.log10(Math.max(response[i], 1e-6));
    const x = freqToXNorm(freqs[i]) * w;
    const y = dbToYNorm(Math.max(-18, Math.min(18, magDb))) * h;
    if (i === 0) ctx2d.moveTo(x, y);
    else ctx2d.lineTo(x, y);
  }
  // Amber/yellow glowing EQ curve
  ctx2d.shadowColor = "#fbbf24";
  ctx2d.shadowBlur = 14;
  ctx2d.strokeStyle = "#fbbf24";
  ctx2d.lineWidth = 1.8;
  ctx2d.lineCap = "round";
  ctx2d.stroke();
  ctx2d.restore();
}

function drawResponseFill(
  ctx2d: CanvasRenderingContext2D,
  w: number,
  h: number,
  frame: any
) {
  const response = frame.eqFrequencyResponse;
  const freqs = frame.eqFrequencies;
  if (!response || !freqs) return;
  ctx2d.save();
  ctx2d.beginPath();
  for (let i = 0; i < response.length; i++) {
    const magDb = 20 * Math.log10(Math.max(response[i], 1e-6));
    const x = freqToXNorm(freqs[i]) * w;
    const y = dbToYNorm(Math.max(-18, Math.min(18, magDb))) * h;
    if (i === 0) ctx2d.moveTo(x, y);
    else ctx2d.lineTo(x, y);
  }
  ctx2d.lineTo(w, h * 0.5);
  ctx2d.lineTo(0, h * 0.5);
  ctx2d.closePath();
  const grad = ctx2d.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "rgba(251,191,36,0.15)");
  grad.addColorStop(0.5, "rgba(251,191,36,0.05)");
  grad.addColorStop(1, "rgba(251,191,36,0.0)");
  ctx2d.fillStyle = grad;
  ctx2d.fill();
  ctx2d.restore();
}

function drawBandHandles(
  ctx2d: CanvasRenderingContext2D,
  w: number,
  h: number,
  frame: any
) {
  const bands: EQBand[] = frame.eqBands || [];
  for (const b of bands) {
    const x = freqToXNorm(b.frequency) * w;
    const y = dbToYNorm(b.gain) * h;

    // Guide crosshair
    ctx2d.save();
    ctx2d.strokeStyle = b.enabled ? "rgba(223,161,74,0.3)" : "rgba(148,163,184,0.1)";
    ctx2d.lineWidth = 0.6;
    ctx2d.setLineDash([3, 3]);
    ctx2d.beginPath();
    ctx2d.moveTo(x, 0);
    ctx2d.lineTo(x, h);
    ctx2d.moveTo(0, y);
    ctx2d.lineTo(w, y);
    ctx2d.stroke();
    ctx2d.setLineDash([]);
    ctx2d.restore();

    // Hover halo ring
    ctx2d.save();
    ctx2d.shadowColor = b.enabled ? "#D0C0A6" : "#475569";
    ctx2d.shadowBlur = 14;
    ctx2d.fillStyle = b.enabled ? "#D0C0A6" : "#475569";
    ctx2d.beginPath();
    ctx2d.arc(x, y, 6, 0, Math.PI * 2);
    ctx2d.fill();
    ctx2d.shadowBlur = 0;
    ctx2d.strokeStyle = "#0a0c10";
    ctx2d.lineWidth = 1.5;
    ctx2d.stroke();
    // Band number
    ctx2d.fillStyle = "#f2e6c8";
    ctx2d.font = "8px 'JetBrains Mono', monospace";
    ctx2d.textAlign = "center";
    ctx2d.textBaseline = "middle";
    ctx2d.fillText(String(b.id), x, y);
    ctx2d.restore();
  }
}

function drawFrequencyLabels(ctx2d: CanvasRenderingContext2D, w: number, h: number) {
  ctx2d.save();
  ctx2d.fillStyle = "rgba(148,163,184,0.5)";
  ctx2d.font = "9px 'JetBrains Mono', monospace";
  ctx2d.textAlign = "center";
  for (const f of [20, 100, 1000, 10000]) {
    const x = freqToXNorm(f) * w;
    ctx2d.fillText(f >= 1000 ? `${f / 1000}k` : `${f}`, x, h - 4);
  }
  ctx2d.restore();
}

function drawDbLabels(ctx2d: CanvasRenderingContext2D, w: number, h: number) {
  ctx2d.save();
  ctx2d.fillStyle = "rgba(148,163,184,0.4)";
  ctx2d.font = "9px 'JetBrains Mono', monospace";
  ctx2d.textAlign = "left";
  for (const db of [12, 0, -12]) {
    const y = dbToYNorm(db) * h;
    ctx2d.fillText(`${db > 0 ? "+" : ""}${db}`, 6, y - 3);
  }
  ctx2d.restore();
}

function getThemeColors(themes: "cyan" | "neon" | "emerald") {
  if (themes === "neon") return { stroke: "#f87171", fillTop: "rgba(248,113,113,0.35)", fillBottom: "rgba(248,113,113,0.05)", shadow: "#f87171" };
  if (themes === "emerald") return { stroke: "#34d399", fillTop: "rgba(52,211,153,0.35)", fillBottom: "rgba(52,211,153,0.05)", shadow: "#34d399" };
  return { stroke: "#D0C0A6", fillTop: "rgba(223,161,74,0.35)", fillBottom: "rgba(223,161,74,0.05)", shadow: "#D0C0A6" };
}

function drawBarsSpectrum(
  ctx2d: CanvasRenderingContext2D,
  w: number,
  h: number,
  data: Uint8Array,
  colorTheme: "cyan" | "neon" | "emerald"
) {
  const theme = getThemeColors(colorTheme);
  const barCount = 48;
  const gap = 2;
  const barAreaW = w * 0.9;
  const barW = (barAreaW / barCount) - gap;
  const offsetX = (w - barAreaW) / 2;
  const padLeft = 45;
  const barStartX = Math.max(padLeft, offsetX);

  for (let i = 0; i < barCount; i++) {
    const value = data[i] / 255;
    const barX = barStartX + i * (barW + gap);
    const barHeight = Math.max(1, value * h * 0.85);
    const y = h - barHeight;

    ctx2d.save();
    // Bar gradient
    const grad = ctx2d.createLinearGradient(0, y, 0, h);
    grad.addColorStop(0, theme.fillTop);
    grad.addColorStop(1, theme.fillBottom);
    ctx2d.fillStyle = grad;
    ctx2d.beginPath();
    (ctx2d as any).roundRect(barX, y, barW, barHeight, 2);
    ctx2d.fill();

    // Glowing outline
    ctx2d.shadowColor = theme.shadow;
    ctx2d.shadowBlur = 4;
    ctx2d.strokeStyle = theme.stroke;
    ctx2d.lineWidth = 0.8;
    ctx2d.stroke();
    ctx2d.restore();
  }
}
