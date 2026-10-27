"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAudio } from "@/context/AudioContext";

/* ============================================================================
   SSL 4000 XL-Desk — Studio Noir Redesign
   Dark anodized aluminum, warm VU glow, cyan LCD signature
   ============================================================================ */

/* === Types ================================================================= */
interface LCDInfo {
  title: string;
  description: string;
}

/* === LCD Hover Readout — The Soul of the Console =========================== */
function LCDScreen({ info }: { info: LCDInfo }) {
  const hasContent = info.title && info.title !== "";
  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border transition-all duration-300"
      style={{
        background: "linear-gradient(180deg, #0a1812 0%, #061410 50%, #040d0a 100%)",
        borderColor: hasContent ? "rgba(0,212,255,0.5)" : "rgba(0,212,255,0.15)",
        boxShadow: hasContent
          ? "inset 0 0 30px rgba(0,212,255,0.12), inset 0 0 10px rgba(0,212,255,0.06), 0 0 20px rgba(0,212,255,0.15)"
          : "inset 0 0 20px rgba(0,0,0,0.9), inset 0 0 8px rgba(0,0,0,0.6)",
        minHeight: "80px",
      }}
    >
      {/* Subtle CRT scanline texture */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.3) 2px, rgba(0,212,255,0.3) 3px)",
        }}
      />
      {/* Content */}
      <div className="relative z-10 px-4 py-3">
        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{
              backgroundColor: hasContent ? "#D0C0A6" : "#1a3a2a",
              boxShadow: hasContent
                ? "0 0 6px #D0C0A6, 0 0 2px #D0C0A6"
                : "none",
            }}
          />
          <span
            className="text-[8px] font-mono tracking-[0.25em] uppercase transition-colors duration-300"
            style={{ color: hasContent ? "rgba(0,212,255,0.7)" : "rgba(0,212,255,0.3)" }}
          >
            SSL Monitor
          </span>
        </div>
        {/* Title */}
        <div
          className="font-mono font-bold text-sm leading-snug mb-1 transition-all duration-200"
          style={{
            color: hasContent ? "#D0C0A6" : "rgba(0,212,255,0.25)",
            textShadow: hasContent ? "0 0 8px rgba(0,212,255,0.5)" : "none",
          }}
        >
          {info.title || "—"}
        </div>
        {/* Description */}
        <div
          className="text-[9px] font-mono leading-relaxed transition-colors duration-200"
          style={{ color: hasContent ? "rgba(0,212,255,0.55)" : "rgba(0,212,255,0.18)" }}
        >
          {info.description || "Select a control to view parameters"}
        </div>
      </div>
    </div>
  );
}

/* === LED Segment Meter — 8 segments, green → amber → red ================= */
function LEDSegmentMeter({ value, label }: { value: number; label?: string }) {
  const leds = 8;
  const active = Math.min(leds, Math.round((value / 100) * leds));
  // SSL 4000G color progression: green → amber → red
  const colors = ["#39ff5a", "#39ff5a", "#39ff5a", "#f5a623", "#f5a623", "#ff3333", "#ff3333", "#ff1a1a"];
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        className="flex flex-row gap-[1.5px] h-12 px-1 py-0.5 rounded-sm"
        style={{
          background: "linear-gradient(180deg, #080808 0%, #0a0a0a 100%)",
          boxShadow:
            "inset 0 1px 3px rgba(0,0,0,0.98), inset 0 -1px 1px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.5)",
          border: "1px solid #151515",
        }}
      >
        {Array.from({ length: leds }).map((_, i) => {
          const on = i < active;
          const c = colors[i];
          return (
            <div
              key={i}
              className="w-[3px] rounded-full transition-all duration-75"
              style={{
                height: "100%",
                background: on
                  ? `linear-gradient(180deg, ${c}ff 0%, ${c}cc 60%, ${c}99 100%)`
                  : `linear-gradient(180deg, ${c}1a 0%, ${c}12 60%, ${c}10 100%)`,
                boxShadow: on
                  ? `0 0 6px ${c}, 0 0 2px ${c}, inset 0 1px 1px rgba(255,255,255,0.25)`
                  : "none",
                opacity: on ? 1 : 0.25,
              }}
            />
          );
        })}
      </div>
      {label && (
        <span className="text-[5px] font-mono text-neutral-600 tracking-[0.1em]">
          {label}
        </span>
      )}
    </div>
  );
}

/* === Rotary Knob — Anodized aluminum, clean studio aesthetic ============== */
function RotaryKnob({
  color,
  rotation,
  label,
  sublabel,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
}: {
  color: string;
  rotation: number;
  label?: string;
  sublabel?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        className="relative w-10 h-10 cursor-grab active:cursor-grabbing"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseDown={onMouseDown}
        title={`${label || ""}${sublabel ? ` — ${sublabel}` : ""}`}
      >
        {/* Outer housing — dark anodized */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(145deg, #1e1e22 0%, #111114 60%, #0a0a0d 100%)",
            boxShadow:
              "0 5px 12px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.04), inset 0 -2px 4px rgba(0,0,0,0.8)",
          }}
        />
        {/* Subtle top reflection */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none z-20"
          style={{
            background:
              "conic-gradient(from 220deg at 32% 28%, rgba(255,255,255,0.1) 0deg, rgba(255,255,255,0.02) 40deg, transparent 80deg)",
          }}
        />
        {/* Rotating cap */}
        <div
          className="absolute inset-[3px] rounded-full transition-transform duration-75 ease-out"
          style={{
            background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.25) 0%, ${color}cc 25%, ${color}88 65%, #0a0a0d 100%)`,
            transform: `rotate(${rotation}deg)`,
            boxShadow:
              "inset 0 1px 2px rgba(255,255,255,0.12), inset 0 -2px 4px rgba(0,0,0,0.7), 0 1px 2px rgba(0,0,0,0.5)",
          }}
        >
          {/* Indicator tick */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-[2px] rounded-full"
            style={{
              top: "7%",
              height: "32%",
              background: "linear-gradient(180deg, #fff 0%, #ccc 50%, #999 100%)",
              boxShadow: "0 0 3px rgba(255,255,255,0.7), inset 0 0 1px rgba(0,0,0,0.3)",
            }}
          />
          {/* Center hub */}
          <div
            className="absolute rounded-full"
            style={{
              width: "26%",
              height: "26%",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#060608",
              border: `0.5px solid ${color}44`,
              boxShadow: "inset 0 0 4px rgba(0,0,0,0.9)",
            }}
          />
        </div>
      </div>
      {label && (
        <span className="text-[7px] font-mono text-neutral-400 tracking-tight whitespace-nowrap">
          {label}
        </span>
      )}
      {sublabel && (
        <span className="text-[6px] font-mono text-neutral-600 tracking-tight">
          {sublabel}
        </span>
      )}
    </div>
  );
}

/* === Square Switch — Illuminated Solo / Cut ================================= */
function SquareSwitch({
  active,
  color,
  label,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: {
  active: boolean;
  color: string;
  label: string;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="relative w-7 h-7 rounded-sm border transition-all duration-100 active:translate-y-[1px]"
        style={{
          background: active
            ? `linear-gradient(135deg, ${color}44 0%, ${color}22 60%, #0a0a0a 100%)`
            : "linear-gradient(180deg, #161618 0%, #0c0c0e 100%)",
          borderColor: active ? `${color}99` : "#222225",
          boxShadow: active
            ? `inset 0 0 8px ${color}44, 0 0 10px ${color}55, 0 0 2px ${color}88`
            : "inset 0 2px 4px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.4)",
        }}
        aria-pressed={active}
        aria-label={label}
        title={label}
      >
        {/* LED dot */}
        <div
          className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full transition-all duration-150"
          style={{
            backgroundColor: color,
            boxShadow: active ? `0 0 8px ${color}, 0 0 2px ${color}` : "none",
            opacity: active ? 1 : 0.2,
          }}
        />
        {/* Label text inside button */}
        <span
          className="absolute inset-0 flex items-center justify-center text-[6px] font-mono font-bold tracking-[0.05em]"
          style={{
            color: active ? color : "#555",
            textShadow: active ? `0 0 4px ${color}88` : "none",
          }}
        >
          {label}
        </span>
      </button>
    </div>
  );
}

/* === Fader Cap — Deep recess, smooth SSL-style cap ========================= */
function FaderCap({
  value,
  label,
  sublabel,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
}: {
  value: number;
  label?: string;
  sublabel?: string;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex flex-col items-center gap-0.5">
      {/* Track housing */}
      <div
        className="relative w-6 h-36 rounded-md overflow-hidden"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{
          background: "linear-gradient(180deg, #0d0d0f 0%, #09090b 100%)",
          boxShadow:
            "inset 0 3px 6px rgba(0,0,0,0.95), inset 0 -3px 6px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.5)",
          border: "1px solid #1a1a1e",
        }}
      >
        {/* Scale markings */}
        <div className="absolute left-0.5 top-0 text-[4px] font-mono text-neutral-700 z-20">
          +10
        </div>
        <div className="absolute left-0.5 top-[35%] text-[4px] font-mono text-neutral-700 z-20">
          0
        </div>
        <div className="absolute left-0.5 bottom-0 text-[4px] font-mono text-neutral-700 z-20">
          ∞
        </div>
        {/* Recessed track groove */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-1 bottom-1 w-2 rounded-full z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, #020202 0%, #0A0D0F 50%, #020202 100%)",
            boxShadow:
              "inset 0 15px 20px -10px rgba(0,0,0,1), inset 0 -15px 20px -10px rgba(0,0,0,1), inset 3px 0 4px rgba(0,0,0,0.8), inset -3px 0 4px rgba(0,0,0,0.8)",
          }}
        />
        {/* Fader cap */}
        <div
          onMouseDown={onMouseDown}
          className="absolute left-1/2 -translate-x-1/2 w-5 z-30 cursor-grab active:cursor-grabbing"
          style={{
            bottom: `calc(${pct}% - 5px)`,
            height: "20px",
            transition: "bottom 75ms ease-out",
          }}
          role="slider"
          aria-valuenow={pct}
          aria-label={label || "Channel fader"}
          aria-orientation="vertical"
          tabIndex={0}
        >
          <div
            className="w-full h-full rounded-[2px]"
            style={{
              background:
                "linear-gradient(180deg, #d8d6d4 0%, #b0aea8 25%, #888480 55%, #5a5856 80%, #3a3836 100%)",
              boxShadow:
                "0 6px 12px rgba(0,0,0,0.85), 0 2px 3px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(0,0,0,0.3)",
              border: "0.5px solid #666",
            }}
          >
            {/* Grip groove */}
            <div
              className="absolute left-1 right-1 top-1/2 -translate-y-1/2 h-[1px] rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, #1a1a1a 0%, #0a0a0a 40%, #0a0a0a 60%, #1a1a1a 100%)",
              }}
            />
          </div>
        </div>
      </div>
      {label && (
        <span className="text-[6px] font-mono text-neutral-600 tracking-[0.08em]">
          {label}
        </span>
      )}
      {sublabel && (
        <span className="text-[6px] font-mono text-neutral-700 tracking-tight">
          {sublabel}
        </span>
      )}
    </div>
  );
}

/* === Channel Strip — 8-Channel Row ======================================== */
function ChannelStrip({
  index,
  onMouseEnterLCD,
  onMouseLeaveLCD,
}: {
  index: number;
  onMouseEnterLCD: (info: LCDInfo) => void;
  onMouseLeaveLCD: () => void;
}) {
  const [muted, setMuted] = useState(false);
  const [soloed, setSoloed] = useState(false);
  const [gainDB, setGainDB] = useState(-5);
  const [threshold, setThreshold] = useState(30);
  const [release, setRelease] = useState(45);
  const [hFreq, setHFreq] = useState(50);
  const [hMidFreq, setHMidFreq] = useState(55);
  const [lMidFreq, setLMidFreq] = useState(40);
  const [lFreq, setLFreq] = useState(35);
  const [aux1, setAux1] = useState(20);
  const [aux2, setAux2] = useState(15);
  const [pan, setPan] = useState(0);
  const [faderVal, setFaderVal] = useState(70);

  const [meterVal, setMeterVal] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const base = muted ? 2 : 15 + Math.random() * 60;
      const noise = Math.sin(Date.now() / 150) * 15 + Math.random() * 10;
      setMeterVal(Math.max(0, Math.min(100, base + noise + (soloed ? 10 : 0))));
    }, 60);
    return () => clearInterval(interval);
  }, [muted, soloed]);

  const handleKnobDrag = useCallback(
    (setter: (v: number) => void, minV: number, maxV: number, step = 1) =>
      (e: React.MouseEvent) => {
        e.preventDefault();
        const startY = e.clientY;
        const startVal = (minV + maxV) / 2;
        const onMove = (ev: MouseEvent) => {
          const delta = startY - ev.clientY;
          const change = Math.round((delta / 4) * step);
          setter(Math.max(minV, Math.min(maxV, startVal + change)));
        };
        const onUp = () => {
          window.removeEventListener("mousemove", onMove);
          window.removeEventListener("mouseup", onUp);
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
      },
    []
  );

  // Subtle color variation per channel for knob caps
  const channelColors = [
    "#c8a030",
    "#8a9098",
    "#2c5fa0",
    "#7a1a40",
    "#c8a030",
    "#8a9098",
    "#2c5fa0",
    "#7a1a40",
  ];
  const capColor = channelColors[index % channelColors.length];

  return (
    <div
      className="relative flex flex-col items-center w-[130px] shrink-0 rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #1a1a1e 0%, #141418 60%, #0f0f12 100%)",
        border: "1px solid #222228",
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.3)",
      }}
    >
      {/* ── Section 1: Channel ID + VU ───────────────────────────────────── */}
      <div className="w-full px-3 pt-3 pb-2 border-b border-[#1a1a1e]">
        <div className="flex items-center justify-between mb-1.5">
          {/* Channel number badge */}
          <div
            className="px-2 py-0.5 rounded-sm text-[8px] font-mono font-bold tracking-[0.15em]"
            style={{
              background: "#0a0a0d",
              border: "1px solid #2a2a30",
              color: "#999",
              boxShadow: "inset 0 0 4px rgba(0,0,0,0.8)",
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </div>
          {/* Signal present indicator */}
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: muted ? "#333" : meterVal > 10 ? "#39ff5a" : "#1a1a1a",
              boxShadow: muted ? "none" : meterVal > 10 ? "0 0 4px #39ff5a" : "none",
            }}
          />
        </div>
        <LEDSegmentMeter
          value={meterVal}
          label={muted ? "MUTED" : soloed ? "SOLO" : undefined}
        />
      </div>

      {/* ── Section 2: Gain + Dynamics ──────────────────────────────────── */}
      <div className="w-full px-2 pt-2 pb-1 border-b border-[#1a1a1e]">
        {/* LINE GAIN */}
        <div className="flex justify-center mb-1.5">
          <RotaryKnob
            color="#cc3333"
            rotation={gainDB * 5 - 100}
            label="GAIN"
            sublabel="dB"
            onMouseEnter={() =>
              onMouseEnterLCD({
                title: `CH ${index + 1} Line Gain`,
                description:
                  "Input gain stage. Adjusts pre-EQ signal level before dynamics.",
              })
            }
            onMouseLeave={onMouseLeaveLCD}
            onMouseDown={handleKnobDrag(setGainDB, -30, 30, 2)}
          />
        </div>
        {/* THR + REL side by side */}
        <div className="flex justify-center gap-1">
          <RotaryKnob
            color="#c8a030"
            rotation={threshold * 2.7 - 90}
            label="THR"
            onMouseEnter={() =>
              onMouseEnterLCD({
                title: `CH ${index + 1} Dynamics — Threshold`,
                description: "Compression threshold. Signals above this level trigger gain reduction.",
              })
            }
            onMouseLeave={onMouseLeaveLCD}
            onMouseDown={handleKnobDrag(setThreshold, 0, 100, 1)}
          />
          <RotaryKnob
            color="#c8a030"
            rotation={release * 2.7 - 90}
            label="REL"
            onMouseEnter={() =>
              onMouseEnterLCD({
                title: `CH ${index + 1} Dynamics — Release`,
                description: "Release time. How quickly compression returns after signal drops.",
              })
            }
            onMouseLeave={onMouseLeaveLCD}
            onMouseDown={handleKnobDrag(setRelease, 10, 200, 5)}
          />
        </div>
      </div>

      {/* ── Section 3: EQ — 2×2 Grid ───────────────────────────────────── */}
      <div className="w-full px-2 pt-2 pb-1 border-b border-[#1a1a1e]">
        <div className="text-[5px] font-mono text-neutral-600 tracking-[0.2em] text-center mb-1 uppercase">
          EQ
        </div>
        <div className="grid grid-cols-2 gap-x-1 gap-y-1 justify-items-center">
          <RotaryKnob
            color="#2a8fd0"
            rotation={hFreq * 2.7 - 90}
            label="HF"
            onMouseEnter={() =>
              onMouseEnterLCD({
                title: `CH ${index + 1} High Frequency`,
                description: "Shelf EQ above 6 kHz. Air and presence control.",
              })
            }
            onMouseLeave={onMouseLeaveLCD}
            onMouseDown={handleKnobDrag(setHFreq, 10, 100, 2)}
          />
          <RotaryKnob
            color="#2a8f4d"
            rotation={hMidFreq * 2.7 - 90}
            label="HMF"
            onMouseEnter={() =>
              onMouseEnterLCD({
                title: `CH ${index + 1} High-Mid`,
                description: "Bell EQ for vocal presence and guitar clarity (2–8 kHz).",
              })
            }
            onMouseLeave={onMouseLeaveLCD}
            onMouseDown={handleKnobDrag(setHMidFreq, 10, 100, 2)}
          />
          <RotaryKnob
            color="#2a8f4d"
            rotation={lMidFreq * 2.7 - 90}
            label="LMF"
            onMouseEnter={() =>
              onMouseEnterLCD({
                title: `CH ${index + 1} Low-Mid`,
                description: "Controls warmth and body in the 200 Hz – 2 kHz range.",
              })
            }
            onMouseLeave={onMouseLeaveLCD}
            onMouseDown={handleKnobDrag(setLMidFreq, 10, 100, 2)}
          />
          <RotaryKnob
            color="#1a1a20"
            rotation={lFreq * 2.7 - 90}
            label="LF"
            onMouseEnter={() =>
              onMouseEnterLCD({
                title: `CH ${index + 1} Low Frequency`,
                description: "Shelf EQ for sub-bass and low-end impact.",
              })
            }
            onMouseLeave={onMouseLeaveLCD}
            onMouseDown={handleKnobDrag(setLFreq, 10, 100, 2)}
          />
        </div>
      </div>

      {/* ── Section 4: Aux + Pan ───────────────────────────────────────── */}
      <div className="w-full px-2 pt-2 pb-1 border-b border-[#1a1a1e]">
        <div className="flex justify-center gap-1">
          <RotaryKnob
            color="#8a9098"
            rotation={aux1 * 2.7 - 90}
            label="AUX1"
            onMouseEnter={() =>
              onMouseEnterLCD({
                title: `CH ${index + 1} Aux Send 1`,
                description: "Routes a portion of the channel to the monitor or effects bus.",
              })
            }
            onMouseLeave={onMouseLeaveLCD}
            onMouseDown={handleKnobDrag(setAux1, 0, 100, 2)}
          />
          <RotaryKnob
            color="#8a9098"
            rotation={aux2 * 2.7 - 90}
            label="AUX2"
            onMouseEnter={() =>
              onMouseEnterLCD({
                title: `CH ${index + 1} Aux Send 2`,
                description: "Secondary auxiliary send for parallel headphone mix.",
              })
            }
            onMouseLeave={onMouseLeaveLCD}
            onMouseDown={handleKnobDrag(setAux2, 0, 100, 2)}
          />
          <RotaryKnob
            color="#4a6aaa"
            rotation={pan * 90 - 90}
            label="PAN"
            onMouseEnter={() =>
              onMouseEnterLCD({
                title: `CH ${index + 1} Stereo Pan`,
                description: "Routes audio between Left and Right master busses.",
              })
            }
            onMouseLeave={onMouseLeaveLCD}
            onMouseDown={handleKnobDrag((v) => setPan(Math.round(v - 50)), -50, 50, 2)}
          />
        </div>
      </div>

      {/* ── Section 5: Solo / Cut ───────────────────────────────────────── */}
      <div className="w-full px-3 pt-2 pb-1 border-b border-[#1a1a1e]">
        <div className="flex justify-center gap-2">
          <SquareSwitch
            active={soloed}
            color="#f5a623"
            label="S"
            onClick={() => {
              setSoloed((s) => !s);
              onMouseEnterLCD({
                title: `CH ${index + 1} Solo`,
                description: "Solo — isolates this channel in the monitor mix.",
              });
            }}
            onMouseEnter={() =>
              onMouseEnterLCD({
                title: `CH ${index + 1} Solo`,
                description: "Illuminated Solo. Press to isolate the channel in the monitor bus.",
              })
            }
            onMouseLeave={onMouseLeaveLCD}
          />
          <SquareSwitch
            active={muted}
            color="#ff3333"
            label="C"
            onClick={() => {
              setMuted((m) => !m);
              onMouseEnterLCD({
                title: `CH ${index + 1} Cut / Mute`,
                description: "Silences the channel from the master output.",
              });
            }}
            onMouseEnter={() =>
              onMouseEnterLCD({
                title: `CH ${index + 1} Cut`,
                description: "Cut — silences the channel from the master mix.",
              })
            }
            onMouseLeave={onMouseLeaveLCD}
          />
        </div>
      </div>

      {/* ── Section 6: Fader ───────────────────────────────────────────── */}
      <div className="w-full px-2 pt-2 pb-3">
        <FaderCap
          value={faderVal}
          label={`${faderVal}%`}
          onMouseDown={(e) => {
            const rect = (e.currentTarget as HTMLElement)
              .closest(".relative")
              ?.getBoundingClientRect();
            if (!rect) return;
            const track = rect.height;
            const onMove = (ev: MouseEvent) => {
              const y = ev.clientY - rect.top;
              const pct = Math.round(
                Math.max(0, Math.min(100, (1 - y / track) * 100))
              );
              setFaderVal(pct);
            };
            const onUp = () => {
              window.removeEventListener("mousemove", onMove);
              window.removeEventListener("mouseup", onUp);
            };
            window.addEventListener("mousemove", onMove);
            window.addEventListener("mouseup", onUp);
          }}
          onMouseEnter={() =>
            onMouseEnterLCD({
              title: `CH ${index + 1} Channel Fader`,
              description:
                "Linear fader controlling main output level. 100mm long-throw for precise attenuation.",
            })
          }
          onMouseLeave={onMouseLeaveLCD}
        />
      </div>
    </div>
  );
}

/* === Master Bus Section ===================================================== */
function MasterBusSection({
  hoverInfo,
  setHoverInfo,
}: {
  hoverInfo: LCDInfo;
  setHoverInfo: (info: LCDInfo) => void;
}) {
  const { volume, setVolume } = useAudio();
  const masterFaderVal = Math.round(volume * 100);
  const [vuValue, setVuValue] = useState(35);
  const [compressThreshold, setCompressThreshold] = useState(40);
  const [compressRatio, setCompressRatio] = useState(50);
  const [compressRelease, setCompressRelease] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      setVuValue(Math.round(20 + Math.random() * 60));
    }, 120);
    return () => clearInterval(interval);
  }, []);

  const handleKnobDrag = useCallback(
    (setter: (v: number) => void, minV: number, maxV: number, step = 1) =>
      (e: React.MouseEvent) => {
        e.preventDefault();
        const startY = e.clientY;
        const startVal = (minV + maxV) / 2;
        const onMove = (ev: MouseEvent) => {
          const delta = startY - ev.clientY;
          const change = Math.round((delta / 4) * step);
          setter(Math.max(minV, Math.min(maxV, startVal + change)));
        };
        const onUp = () => {
          window.removeEventListener("mousemove", onMove);
          window.removeEventListener("mouseup", onUp);
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
      },
    []
  );

  return (
    <div
      className="w-full px-6 py-5 flex gap-8 items-start border-t-2"
      style={{
        background: "linear-gradient(180deg, #1a1518 0%, #121012 50%, #0d0d0e 100%)",
        borderColor: "#2a232a",
        boxShadow: "0 -8px 30px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* ── G-Series Bus Compressor ─────────────────────────────────────── */}
      <div className="flex gap-4 items-center shrink-0">
        {/* Section label */}
        <div className="flex flex-col items-center gap-0.5 mr-1">
          <div
            className="text-[8px] font-mono font-bold tracking-[0.2em]"
            style={{ color: "rgba(245,166,35,0.8)" }}
          >
            SSL
          </div>
          <div className="text-[7px] font-mono tracking-[0.15em]" style={{ color: "rgba(245,166,35,0.45)" }}>
            G-SERIES
          </div>
          <div className="text-[6px] font-mono tracking-[0.1em]" style={{ color: "rgba(245,166,35,0.3)" }}>
            BUS COMP
          </div>
        </div>

        {/* Compressor knobs */}
        <div className="flex gap-2 items-center">
          <RotaryKnob
            color="#f5a623"
            rotation={compressThreshold * 2.7 - 120}
            label="THR"
            onMouseEnter={() =>
              setHoverInfo({
                title: "G-Series Compressor — Threshold",
                description:
                  "Sets the input level at which compression begins. Classic SSL bus compression character.",
              })
            }
            onMouseLeave={() => setHoverInfo({ title: "", description: "" })}
          />
          <RotaryKnob
            color="#f5a623"
            rotation={compressRatio * 2.7 - 120}
            label="RAT"
            onMouseEnter={() =>
              setHoverInfo({
                title: "G-Series Compressor — Ratio",
                description:
                  "Compression ratio. Classic setting is 4:1 for SSL bus glue.",
              })
            }
            onMouseLeave={() => setHoverInfo({ title: "", description: "" })}
          />
          <RotaryKnob
            color="#f5a623"
            rotation={compressRelease * 2.7 - 120}
            label="REL"
            onMouseEnter={() =>
              setHoverInfo({
                title: "G-Series Compressor — Release",
                description:
                  "Release time. Controls how quickly compression stops after signal drops.",
              })
            }
            onMouseLeave={() => setHoverInfo({ title: "", description: "" })}
          />
        </div>

        {/* Vintage VU Meter */}
        <div
          className="w-16 h-16 rounded-xl relative overflow-hidden shrink-0"
          style={{
            background: "linear-gradient(180deg, #181210 0%, #0a0805 100%)",
            border: "1px solid #3a2a1a",
            boxShadow:
              "inset 0 0 20px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.6), inset 0 0 4px rgba(245,166,35,0.1)",
          }}
        >
          {/* Inner recess */}
          <div
            className="absolute inset-2 rounded-lg"
            style={{
              background: "linear-gradient(180deg, #1a1508 0%, #0f0c04 50%, #0a0805 100%)",
              boxShadow: "inset 0 0 12px rgba(0,0,0,0.95)",
            }}
          />
          {/* VU face */}
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div
              className="w-12 h-12 rounded-full relative overflow-hidden flex items-center justify-center"
              style={{
                background: "linear-gradient(180deg, #0a0805 0%, #2a1a0a 100%)",
                border: "1px solid #3a2a1a",
                boxShadow: "inset 0 0 10px rgba(0,0,0,0.9)",
              }}
            >
              {/* Needle */}
              <div
                className="absolute w-[1.5px] h-[42%] rounded-full"
                style={{
                  transformOrigin: "bottom center",
                  transform: `rotate(${(vuValue / 100) * 135 - 67.5}deg) translateY(-50%)`,
                  bottom: "50%",
                  left: "50%",
                  background: "linear-gradient(180deg, #ffd966 0%, #8a6e2a 100%)",
                  boxShadow: "0 0 6px #ffd966, 0 0 2px #ffd966",
                  transition: "transform 0.2s ease-out",
                }}
              />
              {/* Center cap */}
              <div
                className="absolute rounded-full z-10"
                style={{
                  width: "8px",
                  height: "8px",
                  background: "#0a0805",
                  border: "1px solid #ffd966",
                  boxShadow: "0 0 2px #ffd966",
                }}
              />
            </div>
          </div>
          {/* VU label */}
          <div
            className="absolute bottom-1 inset-x-0 text-center text-[5px] font-mono"
            style={{ color: "rgba(245,166,35,0.4)", letterSpacing: "0.15em" }}
          >
            VU
          </div>
        </div>
      </div>

      {/* ── LCD Readout — Signature Element ──────────────────────────────── */}
      <div className="flex-1 min-w-[280px] max-w-[400px]">
        <LCDScreen info={hoverInfo} />
      </div>

      {/* ── Master Fader ─────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        <div
          className="text-[8px] font-mono font-bold tracking-[0.2em] uppercase"
          style={{ color: "rgba(245,166,35,0.7)" }}
        >
          Master
        </div>
        <FaderCap
          value={masterFaderVal}
          label={`${masterFaderVal}%`}
          onMouseDown={(e) => {
            const rect = (e.currentTarget as HTMLElement)
              .closest(".relative")
              ?.getBoundingClientRect();
            if (!rect) return;
            const onMove = (ev: MouseEvent) => {
              const y = ev.clientY - rect.top;
              const pct = Math.round(
                Math.max(0, Math.min(100, (1 - y / rect.height) * 100))
              );
              setVolume(pct / 100);
            };
            const onUp = () => {
              window.removeEventListener("mousemove", onMove);
              window.removeEventListener("mouseup", onUp);
            };
            window.addEventListener("mousemove", onMove);
            window.addEventListener("mouseup", onUp);
          }}
          onMouseEnter={() =>
            setHoverInfo({
              title: "Master Stereo Fader",
              description:
                "Controls the overall stereo output level sent to the main bus.",
            })
          }
          onMouseLeave={() => setHoverInfo({ title: "", description: "" })}
        />
      </div>
    </div>
  );
}

/* === Main SSLConsole Component ============================================== */
export default function SSLConsole() {
  const { analyserNode } = useAudio();
  const [hoverInfo, setHoverInfo] = useState<LCDInfo>({
    title: "",
    description: "",
  });

  const channels = Array.from({ length: 8 }).map((_, i) => i);

  // Keep analyser connected (placeholder — real integration later)
  useEffect(() => {
    if (!analyserNode) return;
    const data = new Uint8Array(analyserNode.frequencyBinCount);
    let raf: number;
    const tick = () => {
      analyserNode.getByteFrequencyData(data);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [analyserNode]);

  return (
    <section aria-label="SSL 4000 XL-Desk Mixing Console">
      <div
        className="mx-auto rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #141418 0%, #111114 50%, #0d0d10 100%)",
          border: "1px solid #1e1e24",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.02) inset",
          maxWidth: "1280px",
        }}
      >
        {/* ── Console Header ─────────────────────────────────────────────── */}
        <div
          className="relative px-6 pt-5 pb-4 border-b overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #18181e 0%, #141418 100%)",
            borderColor: "#1e1e24",
            boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
          }}
        >
          {/* Brushed metal overlay */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />
          <div className="relative flex items-center justify-between">
            {/* Left: Branding */}
            <div>
              <div className="flex items-baseline gap-2">
                <h2
                  className="text-2xl font-black tracking-tight text-white"
                  style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
                >
                  XL-Desk
                </h2>
                <span className="text-base font-light text-neutral-500 tracking-wide">
                  4000-Series
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="text-[9px] font-mono text-neutral-500 tracking-[0.2em] uppercase"
                >
                  Solid State Logic
                </span>
                <span className="w-0.5 h-0.5 rounded-full bg-neutral-700" />
                <span
                  className="text-[9px] font-mono text-neutral-600 tracking-[0.15em]"
                >
                  Oxford, England
                </span>
              </div>
            </div>
            {/* Right: Model info */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end gap-0.5">
                <div
                  className="text-[8px] font-mono tracking-[0.2em] text-neutral-500 uppercase"
                >
                  Analog
                </div>
                <div className="flex gap-1">
                  {["8 CH", "G-SERIES", "VU"].map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-sm text-[6px] font-mono tracking-[0.12em] uppercase"
                      style={{
                        background: "#0a0a0d",
                        border: "1px solid #222228",
                        color: "#444",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Channel Strips Row ──────────────────────────────────────────── */}
        <div
          className="flex gap-2 px-4 py-4 overflow-x-auto"
          style={{ background: "linear-gradient(180deg, #141418 0%, #101012 100%)" }}
        >
          {channels.map((i) => (
            <ChannelStrip
              key={i}
              index={i}
              onMouseEnterLCD={(info: LCDInfo) => setHoverInfo(info)}
              onMouseLeaveLCD={() =>
                setHoverInfo({ title: "", description: "" })
              }
            />
          ))}
        </div>

        {/* ── Master Bus ─────────────────────────────────────────────────── */}
        <MasterBusSection hoverInfo={hoverInfo} setHoverInfo={setHoverInfo} />

        {/* ── Footer Strip ───────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-6 py-2.5 border-t"
          style={{
            background: "linear-gradient(180deg, #0a0a0c 0%, #08080a 100%)",
            borderColor: "#161618",
          }}
        >
          <div
            className="text-[8px] font-mono text-neutral-700 tracking-[0.2em] uppercase"
          >
            Analogue • 4000 Series • Oxford England
          </div>
          <div className="flex gap-1">
            {["SSL", "XL-DESK", "ANALOGUE"].map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-sm text-[6px] font-mono tracking-[0.1em] uppercase"
                style={{
                  background: "#0c0c0e",
                  border: "1px solid #1a1a1e",
                  color: "#333",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
