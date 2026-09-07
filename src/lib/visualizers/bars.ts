/**
 * drawBars — flat, sharp studio-grade frequency meter.
 * No shadows, no rounded corners, no glow. Strict 1px peak caps in white.
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
  const { smoothed, peaks } = opts;

  const barW = Math.max(1, (gW / smoothed.length) - 1);

  for (let i = 0; i < smoothed.length; i++) {
    const raw = smoothed[i] || 0;
    const clampedRaw = raw < 0.08 ? 0 : raw;
    const peakVal = peaks[i] || 0;
    const x = padLeft + i * (barW + 1);

    const clamped = Math.min(clampedRaw, 1.0);
    const barH = clamped * gH * CEILING;
    const y = gH - barH;

    // Studio cyan vertical gradient: faint at bottom, mid cyan, solid at peaks
    const grad = ctx.createLinearGradient(0, gH, 0, 0);
    grad.addColorStop(0, 'rgba(6, 182, 212, 0.05)');
    grad.addColorStop(0.6, 'rgba(6, 182, 212, 0.4)');
    grad.addColorStop(1, 'rgba(6, 182, 212, 0.8)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, barW, Math.max(1, barH));

    // 1px clinical white peak cap
    const peakClamped = Math.min(Math.min(peakVal, 1.0), clampedRaw);
    const peakY = gH - peakClamped * gH * CEILING;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillRect(x, peakY, barW, 1);
  }
}
