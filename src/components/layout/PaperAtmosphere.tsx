"use client";

import React, { useEffect, useRef } from "react";
import { useAudio } from "@/context/AudioContext";
import { usePathname } from "next/navigation";

type Variant = "paper" | "ink" | "lab" | "store" | "audio";

function variantFor(path: string): Variant {
  if (path.startsWith("/fretboard")) return "lab";
  if (path.startsWith("/audio")) return "audio";
  if (path.startsWith("/store")) return "store";
  return "paper";
}

export default function PaperAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pathname = usePathname();
  const audio = useAudio();
  const variant = variantFor(pathname ?? "");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = canvas.getContext("2d")!;
    if (!c) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const intensity =
      variant === "store" ? 0.34 : variant === "lab" ? 0.5 : variant === "audio" ? 0.9 : 0.52;

    const brass = "192,138,43";
    const brassLight = "224,178,100";
    const paper = "246,245,242";
    const ink = "18,18,16";

    const darkMode = variant === "audio";

    let dpr = Math.min(1.5, window.devicePixelRatio || 1);
    let w = 0,
      h = 0;
    let px = 0.5,
      py = 0.42,
      ex = 0.5,
      ey = 0.42;
    let raf = 0;
    let running = true;
    let lastT = performance.now();
    let lowCost = false;
    let smoothedRms = 0;
    const Freq = new Uint8Array(128);

    const resize = () => {
      dpr = lowCost ? Math.min(1, window.devicePixelRatio || 1) : Math.min(1.5, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      c.setTransform(dpr, 0, 0, 0, dpr, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(document.documentElement);

    let tickCount = 0;
    const sampleAudio = () => {
      const node = audio?.analyserNode;
      if (!node || !audio?.isPlaying) {
        smoothedRms = smoothedRms * 0.92;
        return;
      }
      node.getByteFrequencyData(Freq);
      let s = 0;
      for (let i = 0; i < Freq.length; i++) s += Freq[i];
      const target = Math.min(1, (s / (Freq.length * 255)) * 1.6);
      smoothedRms = smoothedRms * 0.7 + target * 0.3;
    };

    const onMove = (e: MouseEvent) => {
      px = e.clientX / Math.max(1, w);
      py = e.clientY / Math.max(1, h);
    };
    const onLeave = () => {
      px = 0.5;
      py = 0.4;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else {
        running = true;
        lastT = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    function drawFrame(now: number) {
      tickCount++;
      if (tickCount % 4 === 0) sampleAudio();

      const t = now * 0.001;
      c.setTransform(dpr, 0, 0, 0, dpr, 0);
      c.clearRect(0, 0, w, h);

      if (darkMode) {
        const gg = c.createLinearGradient(0, 0, 0, h);
        gg.addColorStop(0, "rgba(10,8,6,0.5)");
        gg.addColorStop(1, "rgba(0,0,0,0)");
        c.fillStyle = gg;
        c.fillRect(0, 0, w, h);
      } else {
        const gg = c.createLinearGradient(0, 0, 0, h);
        gg.addColorStop(0, "rgba(255,255,255,0.30)");
        gg.addColorStop(0.5, "rgba(246,245,242,0.0)");
        gg.addColorStop(1, "rgba(229,228,222,0.32)");
        c.fillStyle = gg;
        c.fillRect(0, 0, w, h);
      }

      const rippleColor = darkMode ? "217,154,62" : brass;
      // On paper the gold is a rumour, not a wash: photography supplies the warmth.
      const warmth = darkMode ? 1 : 0.42;
      const breathe = 0.7 + 0.3 * Math.sin(t * 0.12);
      const audioBoost = darkMode ? 1 + smoothedRms * 1.6 : 1 + smoothedRms * 0.4;
      const baseIntensity = intensity * audioBoost * breathe * 0.6 + 0.4;

      const cx1 = (0.32 + 0.09 * Math.sin(t * 0.07) + (ex - 0.5) * 0.06) * w;
      const cy1 = (0.32 + 0.07 * Math.cos(t * 0.055) + (ey - 0.5) * 0.05) * h;
      const r1 = Math.max(w, h) * (darkMode ? 0.42 : 0.55);
      const g1 = c.createRadialGradient(cx1, cy1, 0, cx1, cy1, r1);
      g1.addColorStop(0, `rgba(${darkMode ? "240,197,121" : brassLight}, ${0.09 * baseIntensity * warmth})`);
      g1.addColorStop(0.45, `rgba(${brass}, ${0.03 * baseIntensity * warmth})`);
      g1.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = g1;
      c.fillRect(0, 0, w, h);

      const cx2 = (0.72 + 0.08 * Math.sin(t * 0.05 + 2) + (ex - 0.5) * 0.03) * w;
      const cy2 = (0.68 + 0.06 * Math.cos(t * 0.04 + 1) + (ey - 0.5) * 0.04) * h;
      const r2 = Math.max(w, h) * (darkMode ? 0.35 : 0.42);
      const g2 = c.createRadialGradient(cx2, cy2, 0, cx2, cy2, r2);
      g2.addColorStop(0, `rgba(${paper}, ${darkMode ? 0.02 : 0.15 * baseIntensity})`);
      g2.addColorStop(0.5, `rgba(240,197,121, ${0.04 * baseIntensity * warmth})`);
      g2.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = g2;
      c.fillRect(0, 0, w, h);

      const rcx = w * 0.5 + Math.sin(t * 0.06) * w * 0.04;
      const rcy = h * 0.46 + Math.cos(t * 0.05) * h * 0.03;
      const maxR = Math.max(w, h) * 0.58;
      const ringCount = variant === "lab" ? 10 : lowCost ? 4 : 7;
      const rippleScale = darkMode ? 1 + smoothedRms * 1.4 : 1;
      c.lineWidth = 1;
      for (let i = 0; i < ringCount; i++) {
        const phase = (i / ringCount + t * 0.055) % 1;
        const radius = phase * maxR;
        const alpha = (1 - phase) * 0.065 * intensity * rippleScale;
        if (alpha < 0.0015) continue;
        c.strokeStyle = `rgba(${rippleColor}, ${alpha})`;
        c.beginPath();
        c.arc(rcx, rcy, radius, 0, Math.PI * 2);
        c.stroke();
      }

      if (variant !== "store") {
        c.lineWidth = 0.6;
        c.strokeStyle = `rgba(${ink}, ${darkMode ? 0.06 : 0.035 * baseIntensity})`;
        const lineCount = lowCost ? 9 : 12;
        const spacing = w / (lineCount + 1);
        const drift = (t * 2.0) % spacing;
        const topF = variant === "lab" ? 0 : 0.12;
        const botF = variant === "lab" ? 1 : 0.88;
        for (let i = -1; i <= lineCount + 1; i++) {
          const x = i * spacing + drift;
          c.beginPath();
          c.moveTo(x, h * topF);
          c.lineTo(x, h * botF);
          c.stroke();
        }
        c.strokeStyle = `rgba(${brass}, ${darkMode ? 0.10 : 0.055 * baseIntensity})`;
        c.lineWidth = 1;
        const nut = variant === "lab" ? 0.333 : 0.28;
        c.beginPath();
        c.moveTo(0, h * nut);
        c.lineTo(w, h * nut);
        c.stroke();
      }

      if (variant === "lab") {
        const a = 0.08 * baseIntensity;
        c.fillStyle = `rgba(124,47,34, ${a})`;
        c.beginPath();
        c.arc(
          rcx + Math.sin(t * 0.17) * w * 0.06,
          rcy + Math.cos(t * 0.14) * h * 0.06,
          2.6,
          0,
          Math.PI * 2
        );
        c.fill();
      }
    }

    if (reduced) {
      drawFrame(0);
      const onResize = () => drawFrame(performance.now());
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
        ro.disconnect();
      };
    }

    // Sample the real frame rate for a couple of seconds before deciding an
    // effect this cheap is costing too much; slow devices get fewer rings.
    let lastPerfCheck = performance.now();

    function loop(now: number) {
      if (!running) return;
      const dt = now - lastT;
      lastT = now;
      if (!lowCost && now - lastPerfCheck > 1800) {
        lastPerfCheck = now;
        if (1000 / Math.max(dt, 1) < 25) {
          lowCost = true;
          resize();
        }
      }

      ex += (px - ex) * 0.06;
      ey += (py - ey) * 0.06;
      drawFrame(now);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, audio?.analyserNode]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}
