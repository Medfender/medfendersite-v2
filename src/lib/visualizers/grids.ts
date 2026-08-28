/**
 * grids.ts — dB (Y-axis) and frequency (X-axis) reference grid renderers.
 * Both grids are used by the main head visualizer (Curve / Bars).
 */

import type { ThemeConfig } from './types';

export interface DbLine {
  val: number;   // 0–1 normalised amplitude (1.0 = +6 dB ceiling)
  label: string;  // left Y-axis dB label
}

// +6 dB ceiling at val 1.0. After analyser defaults (min=-90 / max=0),
// the canvas maps [-90, 0] dB → [0, 1] amplitude.
export const DB_GRID: DbLine[] = [
  { val: 1.0,  label: '+6 dB'  },
  { val: 0.72, label: '0 dB'   },
  { val: 0.5,  label: '-12 dB' },
  { val: 0.3,  label: '-24 dB' },
  { val: 0.1,  label: '-48 dB' },
];

export const DB_ZERO_VAL = 0.72;

export function drawDbGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  padLeft: number,
  padBottom: number,
  theme: ThemeConfig,
): void {
  const gW = width - padLeft;
  const gH = height - padBottom;

  ctx.lineWidth = 1;
  ctx.font = '500 10px Inter, system-ui, sans-serif';

  DB_GRID.forEach(({ val, label }) => {
    const y = gH - val * gH;
    if (y < 6) return; // clip top edge

    ctx.strokeStyle =
      val === DB_ZERO_VAL ? `${theme.primary}35` : 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width, y);
    ctx.stroke();

    // Suppress the stray +6 dB label so it never bleeds above the header
    if (label === '+6 dB') return;
    const labelY = Math.max(y + 3, 14);
    ctx.fillStyle = val === DB_ZERO_VAL ? theme.primary : 'rgba(148, 163, 184, 0.5)';
    ctx.textAlign = 'right';
    ctx.fillText(label, padLeft - 8, labelY);
  });
}

// ── Frequency grid ─────────────────────────────────────────────────────────────

export const FREQ_GRID = [
  { freq: 20,    label: '20Hz'  },
  { freq: 100,   label: '100Hz' },
  { freq: 500,   label: '500Hz' },
  { freq: 1000,  label: '1kHz'  },
  { freq: 5000,  label: '5kHz'  },
  { freq: 10000, label: '10kHz' },
  { freq: 20000, label: '20kHz' },
];

export function drawFreqGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  padLeft: number,
  padBottom: number,
): void {
  const gW = width - padLeft;
  const gH = height - padBottom;
  const rightInset = 22;

  FREQ_GRID.forEach(({ freq, label }, i) => {
    const isLast = i === FREQ_GRID.length - 1;
    const normX = isLast
      ? 1 - rightInset / gW
      : (Math.log10(freq) - Math.log10(20)) / (Math.log10(20000) - Math.log10(20));
    const x = padLeft + normX * gW;

    if (!isLast) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, gH);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
    if (isLast) {
      ctx.textAlign = 'right';
      ctx.fillText(label, width - 4, height - 6);
    } else {
      ctx.textAlign = 'center';
      ctx.fillText(label, x, height - 6);
    }
  });
}
