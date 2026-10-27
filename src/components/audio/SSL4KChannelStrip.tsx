"use client";

import React, { useState, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   SSL 4K Channel Strip — 1:1 VST Skeuomorphic Replica (SVG / DOM)
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── 1. SSLKnob (parameterized SVG knob) ─────────────────────────────── */
function SSLKnob({
  color,
  label,
  value = 50,
  onChange,
}: {
  color: string;
  label: string;
  value?: number;
  onChange?: (v: number) => void;
}) {
  const rotation = Math.round(130 - (value / 100) * 260); // -130 to +130
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setDragging(true);
      const startY = e.clientY;
      const startVal = value;
      const onMove = (ev: MouseEvent) => {
        const delta = startY - ev.clientY;
        let next = Math.round(startVal + delta / 2.5);
        next = Math.max(0, Math.min(100, next));
        onChange?.(next);
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        setDragging(false);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [value, onChange]
  );

  return (
    <div className="flex flex-col items-center gap-0.5 select-none" ref={ref}>
      <div
        className={`relative w-10 h-10 cursor-grab active:cursor-grabbing ${dragging ? "scale-95" : ""} transition-transform duration-75`}
        onMouseDown={handleDown}
        title={`${label} — ${value}`}
      >
        <svg viewBox="0 0 40 40" className="w-full h-full block" aria-label={`${label} knob`}>
          <defs>
            {/* Fluted / ribbed dark base radial */}
            <radialGradient id={`base-${label}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#181818" />
              <stop offset="60%" stopColor="#111" />
              <stop offset="100%" stopColor="#080808" />
            </radialGradient>
            {/* Static specular highlight — fixed top-left, NEVER rotates */}
            <radialGradient id={`spec-${label}`} cx="30%" cy="25%" r="40%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
              <stop offset="40%" stopColor="rgba(255,255,255,0.15)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>

          {/* Dark charcoal base ring with radial gradient */}
          <circle cx="20" cy="20" r="18" fill={`url(#base-${label})`} stroke="#0a0a0a" strokeWidth="0.5" />
          {/* Subtle fluted ring shadow */}
          <circle cx="20" cy="20" r="14" fill="none" stroke="#222" strokeWidth="0.5" opacity="0.3" />
          <circle cx="20" cy="20" r="10" fill="none" stroke="#222" strokeWidth="0.3" opacity="0.25" />

          {/* Static specular highlight — stays at 10 o'clock always */}
          <ellipse cx="14" cy="12" rx="7" ry="4" fill={`url(#spec-${label})`} transform="rotate(-30 14 12)" />

          {/* Rotating cap */}
          <g transform={`rotate(${rotation} 20 20)`}>
            <circle cx="20" cy="20" r="12" fill={`url(#capGrad-${label})`} />
            {/* Cap color gradient defined per instance via style */}
          </g>
        </svg>
        {/* Cap rendered as HTML overlay for easier gradient control */}
        <div
          className="absolute inset-[3.5px] rounded-full shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),inset_0_-2px_3px_rgba(0,0,0,0.7)] transition-transform duration-75 ease-out"
          style={{
            background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.35) 0%, ${color} 30%, ${color}aa 70%, #0a0a0a 100%)`,
            transform: `rotate(${rotation}deg)`,
          }}
        >
          {/* Crisp white indicator line — ONLY cap rotates */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-[2px] h-[35%] rounded-full shadow-[0_0_3px_rgba(255,255,255,0.8)]"
            style={{
              top: "6%",
              background: "linear-gradient(180deg, #fff 0%, #ddd 50%, #999 100%)",
            }}
          />
          {/* Center hub */}
          <div
            className="absolute rounded-full shadow-[inset_0_0_4px_rgba(0,0,0,0.9)] border border-white/20"
            style={{
              width: "28%",
              height: "28%",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#080808",
            }}
          />
        </div>
      </div>
      <span className="text-[7px] font-mono text-neutral-400 tracking-tight whitespace-nowrap">{label}</span>
    </div>
  );
}

/* ─── 2. SSLButton (rectangular switch) ───────────────────────────────── */
function SSLButton({
  label,
  active,
  type,
  onClick,
}: {
  label: string;
  active: boolean;
  type: "mute" | "solo" | "eq";
  onClick?: () => void;
}) {
  const bg = active
    ? type === "mute"
      ? "#ff2a2a"
      : type === "solo"
        ? "#f5b841"
        : "#00ffa0"
    : "#d3d3d3";

  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className="relative w-8 h-8 rounded-[3px] border-2 border-neutral-400 transition-all duration-100 active:translate-y-[1px] flex items-center justify-center"
      style={{
        background: active
          ? `linear-gradient(135deg, ${bg}88 0%, ${bg}44 60%, #1a1a1a 100%)`
          : "linear-gradient(180deg, #f0f0f0 0%, #d3d3d3 100%)",
        boxShadow: active
          ? `inset 0 3px 6px rgba(0,0,0,0.8), 0 0 8px ${bg}88, 0 0 16px ${bg}44`
          : "0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.6)",
      }}
    >
      {/* LED bloom */}
      <div
        className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full transition-all duration-150"
        style={{
          backgroundColor: bg,
          boxShadow: active ? `0 0 6px ${bg}, 0 0 2px ${bg}` : "none",
          opacity: active ? 1 : 0.2,
        }}
      />
      <span className="text-[5px] font-mono font-bold text-neutral-800 leading-none">{label}</span>
    </button>
  );
}

/* ─── 3. SSLFader (vertical 100mm long-throw) ──────────────────────────── */
function SSLFader({
  value = 70,
  onChange,
}: {
  value?: number;
  onChange?: (v: number) => void;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const handleDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const rect = (e.currentTarget as HTMLElement).parentElement?.getBoundingClientRect();
      if (!rect) return;
      const onMove = (ev: MouseEvent) => {
        const y = ev.clientY - rect.top;
        const next = Math.round(Math.max(0, Math.min(100, (1 - y / rect.height) * 100)));
        onChange?.(next);
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [onChange]
  );

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      {/* Track plate */}
      <div
        className="relative w-8 h-48 rounded-md overflow-hidden border border-[#222] shadow-[0_2px_8px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(0,0,0,0.8)]"
        style={{ background: "linear-gradient(180deg, #181818 0%, #0f0f11 100%)" }}
      >
        {/* Deep recessed track SVG */}
        <svg viewBox="0 0 32 192" className="w-full h-full block" preserveAspectRatio="none">
          <defs>
            <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#000" floodOpacity="0.9" />
            </filter>
          </defs>
          {/* Track slot rectangle with severe inner shadow */}
          <rect
            x="12"
            y="8"
            width="8"
            height="176"
            rx="3"
            fill="#0a0a0a"
            style={{
              filter: "inset 0 10px 10px rgba(0,0,0,1), inset 0 -10px 10px rgba(0,0,0,1)",
            }}
          />
          {/* Dust guard line */}
          <line x1="16" y1="8" x2="16" y2="184" stroke="#1a1a1a" strokeWidth="0.5" opacity="0.6" />
        </svg>

        {/* Scale tick marks — left side */}
        <div className="absolute left-0.5 top-2 bottom-2 flex flex-col justify-between text-[5px] font-mono text-neutral-500 pointer-events-none z-10">
          <span>+10</span>
          <span>0</span>
          <span>-20</span>
          <span>-∞</span>
        </div>

        {/* Small tick marks */}
        <div className="absolute left-1 top-4 bottom-4 w-[1px] bg-neutral-700/30" />

        {/* Cap */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-7 z-20 cursor-grab active:cursor-grabbing"
          style={{
            bottom: `calc(${pct}% - 11px)`,
            height: "22px",
            transition: "bottom 75ms ease-out",
          }}
          onMouseDown={handleDown}
          role="slider"
          aria-valuenow={pct}
          aria-label="Channel fader"
          aria-orientation="vertical"
          tabIndex={0}
        >
          {/* Silver aluminum cap with metallic gradient */}
          <div
            className="w-full h-full rounded-[3px] relative shadow-[0_6px_12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.8),inset_0_-1px_0_rgba(0,0,0,0.3)]"
            style={{
              background: "linear-gradient(180deg, #eae8e6 0%, #c8c6c2 25%, #8a8884 55%, #5a5854 80%, #4a4846 100%)",
              border: "0.5px solid #777",
            }}
          >
            {/* Horizontal black grip line */}
            <div
              className="absolute left-1 right-1 top-1/2 -translate-y-1/2 h-[3px] rounded-full z-10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)]"
              style={{
                background: "linear-gradient(180deg, #2a2a2a 0%, #0a0a0a 40%, #0a0a0a 60%, #1a1a1a 100%)",
              }}
            />
            {/* Top edge highlight */}
            <div
              className="absolute left-1 right-1 top-0 h-[1.5px] rounded-full"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
              }}
            />
          </div>
        </div>
      </div>
      <span className="text-[7px] font-mono text-neutral-500 tracking-tight">FADER</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component — SSL 4K Channel Strip
   ═══════════════════════════════════════════════════════════════════════════ */
export default function SSL4KChannelStrip() {
  const [dynThreshold, setDynThreshold] = useState(30);
  const [dynRatio, setDynRatio] = useState(50);
  const [dynRelease, setDynRelease] = useState(45);

  const [hpFreq, setHpFreq] = useState(40);
  const [lpFreq, setLpFreq] = useState(60);

  const [hfGain, setHfGain] = useState(0);
  const [hmfGain, setHmfGain] = useState(0);
  const [lmfGain, setLmfGain] = useState(0);
  const [lfGain, setLfGain] = useState(0);

  const [eqIn, setEqIn] = useState(true);
  const [chOut, setChOut] = useState(true);

  const [pan, setPan] = useState(0);
  const [faderVal, setFaderVal] = useState(70);

  const [soloActive, setSoloActive] = useState(false);
  const [muteActive, setMuteActive] = useState(false);

  return (
    <section
      aria-label="SSL 4000 E Channel Strip"
      className="w-full max-w-sm mx-auto bg-[#181a1b] rounded-2xl border border-[#2a2d30]/60 shadow-[0_0_60px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.03)] overflow-hidden"
    >
      {/* Header — SSL branding */}
      <div className="relative bg-gradient-to-b from-[#222225] to-[#18181a] px-3 py-2.5 border-b border-[#2a2d30]/40 shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[11px] font-extrabold text-white tracking-tight leading-none drop-shadow">SSL 4000 E</h3>
            <span className="text-[7px] font-mono text-neutral-500 tracking-[0.15em] uppercase">Channel Strip</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-mono text-brass/70 tracking-wider">CH 1</span>
            <div className="w-1 h-1 rounded-full bg-brass/40 mt-0.5 mx-auto shadow-[0_0_4px_rgba(223,161,74,0.4)]" />
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="p-3 space-y-3 bg-gradient-to-b from-[#181a1b] via-[#16181a] to-[#131416]">

        {/* ── Dynamics Section ─── */}
        <section aria-label="Dynamics">
          <div className="flex items-center gap-2 mb-1.5 border-b border-[#2a2d30]/40 pb-0.5">
            <span className="text-[6px] font-mono text-neutral-500 tracking-[0.2em] uppercase">Dynamics</span>
            <div className="flex-1 h-px bg-gradient-to-r from-[#2a2d30]/60 to-transparent" />
          </div>
          <div className="flex justify-center gap-3">
            <SSLKnob color="#1E90FF" label="THR" value={dynThreshold} onChange={setDynThreshold} />
            <SSLKnob color="#2E8B57" label="RATIO" value={dynRatio} onChange={setDynRatio} />
            <SSLKnob color="#2E8B57" label="REL" value={dynRelease} onChange={setDynRelease} />
          </div>
        </section>

        {/* ── Filters Section (Magenta caps) ─── */}
        <section aria-label="Filters">
          <div className="flex items-center gap-2 mb-1.5 border-b border-[#2a2d30]/40 pb-0.5">
            <span className="text-[6px] font-mono text-neutral-500 tracking-[0.2em] uppercase">Filters</span>
            <div className="flex-1 h-px bg-gradient-to-r from-[#2a2d30]/60 to-transparent" />
          </div>
          <div className="flex justify-center gap-3">
            <SSLKnob color="#C71585" label="HPF" value={hpFreq} onChange={setHpFreq} />
            <SSLKnob color="#C71585" label="LPF" value={lpFreq} onChange={setLpFreq} />
          </div>
        </section>

        {/* ── EQ Section (SSL colors) ─── */}
        <section aria-label="Equalization">
          <div className="flex items-center gap-2 mb-1.5 border-b border-[#2a2d30]/40 pb-0.5">
            <span className="text-[6px] font-mono text-neutral-500 tracking-[0.2em] uppercase">EQ</span>
            <div className="flex-1 h-px bg-gradient-to-r from-[#2a2d30]/60 to-transparent" />
          </div>
          <div className="flex justify-center gap-2 flex-wrap">
            <SSLKnob color="#1E90FF" label="HF" value={hfGain} onChange={setHfGain} />
            <SSLKnob color="#2E8B57" label="HMF" value={hmfGain} onChange={setHmfGain} />
            <SSLKnob color="#2E8B57" label="LMF" value={lmfGain} onChange={setLmfGain} />
            <SSLKnob color="#222222" label="LF" value={lfGain} onChange={setLfGain} />
          </div>
        </section>

        {/* ── Output / Pan / Switches ─── */}
        <section aria-label="Output Controls" className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-0.5 border-b border-[#2a2d30]/40 pb-0.5">
            <span className="text-[6px] font-mono text-neutral-500 tracking-[0.2em] uppercase">Output</span>
            <div className="flex-1 h-px bg-gradient-to-r from-[#2a2d30]/60 to-transparent" />
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex gap-2">
              <SSLButton label="CH OUT" active={chOut} type="eq" onClick={() => setChOut((v) => !v)} />
              <SSLButton label="EQ IN" active={eqIn} type="eq" onClick={() => setEqIn((v) => !v)} />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[6px] font-mono text-neutral-600">PAN</span>
              <SSLKnob color="#1E90FF" label="PAN" value={60 + pan * 2} onChange={(v) => setPan(Math.round((v - 60) / 2))} />
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <SSLButton label="SOLO" active={soloActive} type="solo" onClick={() => setSoloActive((v) => !v)} />
            <SSLButton label="MUTE" active={muteActive} type="mute" onClick={() => setMuteActive((v) => !v)} />
          </div>
        </section>

        {/* ── Fader Section (100mm long-throw) ─── */}
        <section aria-label="Fader" className="flex justify-center pt-1">
          <SSLFader value={faderVal} onChange={setFaderVal} />
        </section>

      </div>

      {/* Footer strip */}
      <div className="bg-gradient-to-b from-[#0e0e10] to-[#08080a] px-3 py-1.5 border-t border-[#222228]/60 flex items-center justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <span className="text-[7px] font-mono text-neutral-600 tracking-[0.15em] uppercase">SSL E • 4000 Series • Oxford</span>
        <span className="text-[7px] font-mono text-neutral-700">{faderVal}%</span>
      </div>
    </section>
  );
}
