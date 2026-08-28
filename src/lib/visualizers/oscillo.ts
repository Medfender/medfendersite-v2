/**
 * oscillo.ts — time-domain oscilloscope waveform.
 *
 * Used by the bottom MiniVisualizer (waveform / oscillo mode).
 */

import type { ThemeConfig } from './types';

export function drawWaveform(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  padLeft: number,
  padBottom: number,
  timeDomain: Float32Array,
  theme: ThemeConfig,
): void {
  const gW = width - padLeft;
  const gH = height - padBottom;
  const sliceW = gW / timeDomain.length;
  const cy = gH / 2;

  ctx.beginPath();
  let x = padLeft;
  for (let i = 0; i < timeDomain.length; i++) {
    const v = timeDomain[i];
    const y = cy + v * (gH * 0.42);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
    x += sliceW;
  }

  ctx.save();
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 14;
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}
