/**
 * timeline.ts — rolling DAW history buffer mode (preserved for future activation).
 *
 * Draws symmetrical white vertical bars that scroll continuously from left to
 * right. Uses a rolling `history: number[]` array. Scale = 0.5 to stay
 * comfortable within the canvas.
 */

import type { ThemeConfig } from './types';

export function drawTimeline(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  padLeft: number,
  padBottom: number,
  history: number[],
  theme?: ThemeConfig,
): void {
  const gW = width - padLeft;
  const gH = height - padBottom;
  const cy = gH / 2;
  const barW = 2;
  const gap = 2;
  const pitch = barW + gap;
  const tint = theme?.primary || '#ffffff';

  // Clear drawing region
  ctx.save();
  ctx.fillStyle = '#0b0f19';
  ctx.fillRect(padLeft, 0, gW, gH);
  ctx.restore();

  // Zero-crossing center line
  ctx.save();
  ctx.strokeStyle = `${tint}40`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padLeft, cy);
  ctx.lineTo(width, cy);
  ctx.stroke();
  ctx.restore();

  // Time tick marks (right-anchored, scroll left)
  ctx.save();
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
  ctx.lineWidth = 1;
  const tickSpacing = 64;
  const totalTicks = Math.ceil((gW + tickSpacing) / tickSpacing);
  for (let i = 0; i <= totalTicks; i++) {
    const tx = padLeft + gW - i * tickSpacing;
    if (tx < padLeft) break;
    ctx.beginPath();
    ctx.moveTo(tx, cy - 4);
    ctx.lineTo(tx, cy + 4);
    ctx.stroke();
  }
  ctx.restore();

  // Bars (right-aligned, scrolling left)
  ctx.save();
  ctx.shadowBlur = 0;
  ctx.fillStyle = tint;
  ctx.strokeStyle = tint;
  ctx.imageSmoothingEnabled = false;

  const SCALE = 0.5;
  for (let i = 0; i < history.length; i++) {
    const amp = Math.min(1, Math.max(0, history[i] || 0));
    const h = Math.max(1, amp * cy * SCALE);
    const x = padLeft + gW - (history.length - i) * pitch;
    if (x < padLeft) continue;
    if (x + barW > width) continue;

    ctx.fillRect(x, cy - h, barW, h); // up
    ctx.fillRect(x, cy, barW, h);      // down mirrored
  }

  ctx.restore();
}
