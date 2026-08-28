/**
 * curve.ts — smooth spline wave with gradient fill, peak-hold overlay,
 * and glow outline. The default head-visualizer mode.
 */

import type { ThemeConfig } from './types';
import { CEILING } from './types';

export function drawCurve(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  padLeft: number,
  padBottom: number,
  theme: ThemeConfig,
  smoothed: Float32Array,
  peaks: Float32Array,
  /** Number of populated bars/points — must match the log-mapped barCount.
   *  Used so the curve spans 0→cssW exactly, not over the full smoothed.length. */
  barCount?: number,
): void {
  const gW = width - padLeft;
  const gH = height - padBottom;
  // Use barCount when provided so the last point lands at x = cssW.
  // Fall back to smoothed.length-1 (the old behaviour) for callers that omit it.
  const n = (barCount && barCount > 1) ? barCount : Math.max(2, smoothed.length);
  const getX = (i: number) => padLeft + (i / (n - 1)) * gW;
  const getY = (val: number) => gH - Math.min(val, 1.0) * gH * CEILING;

  // Peak-hold line — iterate only over the filled [0..barCount-1] region
  ctx.beginPath();
  ctx.moveTo(getX(0), getY(peaks[0]));
  for (let i = 0; i < n - 1; i++) {
    const x0 = getX(i), y0 = getY(peaks[i]);
    const x1 = getX(i + 1), y1 = getY(peaks[i + 1]);
    ctx.bezierCurveTo((x0 + x1) / 2, y0, (x0 + x1) / 2, y1, x1, y1);
  }
  ctx.strokeStyle = `${theme.peak}88`;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Wave spline — same; stop at barCount-1 so last point lands at cssW (10kHz)
  const wavePath = new Path2D();
  wavePath.moveTo(getX(0), getY(smoothed[0]));
  for (let i = 0; i < n - 1; i++) {
    const x0 = getX(i), y0 = getY(smoothed[i]);
    const x1 = getX(i + 1), y1 = getY(smoothed[i + 1]);
    wavePath.bezierCurveTo((x0 + x1) / 2, y0, (x0 + x1) / 2, y1, x1, y1);
  }

  // Gradient fill
  const fillPath = new Path2D(wavePath);
  fillPath.lineTo(padLeft + gW, gH);
  fillPath.lineTo(padLeft, gH);
  fillPath.closePath();

  const fillGrad = ctx.createLinearGradient(0, 0, 0, gH);
  fillGrad.addColorStop(0, theme.gradTop);
  fillGrad.addColorStop(0.5, theme.gradMid);
  fillGrad.addColorStop(1, 'rgba(15, 23, 42, 0.0)');
  ctx.fillStyle = fillGrad;
  ctx.fill(fillPath);

  // Glowing outline
  ctx.save();
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 12;
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 2.5;
  ctx.stroke(wavePath);
  ctx.restore();
}
