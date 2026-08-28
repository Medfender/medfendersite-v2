/**
 * bars.ts — frequency-band equalizer bars with peak-hold caps and overflow glow.
 *
 * Used by the main head visualizer (Curve / Bars toggle).
 */

import type { ThemeConfig } from './types';
import { CEILING } from './types';

export interface BarDrawOptions {
  smoothed: Float32Array;
  peaks: Float32Array;
  barCount: number;
  gap: number;
  cornerRadius?: number;
}

export function drawBars(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  padLeft: number,
  padBottom: number,
  theme: ThemeConfig,
  opts: BarDrawOptions,
): void {
  const gW = width - padLeft;
  const gH = height - padBottom;
  const { smoothed, peaks, barCount, gap, cornerRadius = 3 } = opts;

  const step = Math.max(1, Math.floor(smoothed.length / barCount));
  const barW = Math.max(1, (gW - (barCount - 1) * gap) / barCount);

  let anyOverflow = false;

  // Pass 1 — draw bars, track overflow
  // -60 dB floor: anything quieter reads as silence (0 amplitude).
  for (let i = 0; i < barCount; i++) {
    const raw = smoothed[i * step] || 0;
    const clampedRaw = raw < 0.08 ? 0 : raw;
    const peakVal = peaks[i * step] || 0;
    const x = padLeft + i * (barW + gap);

    const clamped = Math.min(clampedRaw, 1.0);
    const h = clamped * gH * CEILING;
    const y = gH - h;

    if (raw > 1.0) anyOverflow = true;

    // Gradient fill
    const grad = ctx.createLinearGradient(0, y, 0, gH);
    grad.addColorStop(0, theme.primary);
    grad.addColorStop(1, 'rgba(15, 23, 42, 0.2)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, Math.max(1, barW), Math.max(0, h), [cornerRadius, cornerRadius, 0, 0]);
    ctx.fill();

    // Peak cap
    const peakClamped = Math.min(Math.min(peakVal, 1.0), clampedRaw);
    const peakY = gH - peakClamped * gH * CEILING;
    ctx.fillStyle = theme.peak;
    ctx.fillRect(x, peakY - 2, barW, 2);
  }

  // Pass 2 — overflow accent: bright stripe just above the +6 dB line
  if (anyOverflow) {
    const overflowY = 0;
    ctx.save();
    ctx.shadowColor = theme.overflow;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = theme.overflow;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padLeft, overflowY);
    ctx.lineTo(padLeft + gW, overflowY);
    ctx.stroke();
    ctx.restore();
  }
}
