/**
 * Shared audio visualizer engine — single source of truth for bar rendering
 * across the main head visualizer and the bottom-player mini visualizer.
 *
 * Exposes:
 *  - drawBars()  — renders gradient bars with peak-hold caps and overflow glow
 *  - renderLoop() — factory for a requestAnimationFrame render loop with cleanup
 */

export type ColorTheme = 'cyan' | 'neon' | 'emerald';
export type VisualizerMode = 'curve' | 'bars' | 'waveform';

export interface ThemeConfig {
  primary: string;
  glow: string;
  peak: string;
  overflow: string;   // intense accent for >+6 dB overflow highlight
  gradTop: string;
  gradMid: string;
}

export const THEMES: Record<ColorTheme, ThemeConfig> = {
  cyan: {
    primary: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.85)',
    peak: '#f59e0b',
    overflow: '#ffffff',
    gradTop: 'rgba(56, 189, 248, 0.38)',
    gradMid: 'rgba(14, 165, 233, 0.12)',
  },
  neon: {
    primary: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.9)',
    peak: '#06b6d4',
    overflow: '#ffffff',
    gradTop: 'rgba(244, 63, 94, 0.42)',
    gradMid: 'rgba(217, 70, 239, 0.14)',
  },
  emerald: {
    primary: '#10b981',
    glow: 'rgba(16, 185, 129, 0.85)',
    peak: '#38bdf8',
    overflow: '#ffffff',
    gradTop: 'rgba(16, 185, 129, 0.40)',
    gradMid: 'rgba(6, 182, 212, 0.12)',
  },
};

  // ── dB grid ─────────────────────────────────────────────────────────────────

export interface DbLine {
  val: number;    // 0–1 normalised amplitude (1.0 = +6 dB ceiling)
  label: string;  // left Y-axis dB label
}

// +6 dB ceiling at val 1.0. After analyser defaults (min=-90 / max=0),
// the canvas maps [-90, 0] dB → [0, 1] amplitude. We clip at -24 dB
// inside drawBars so bottom dead-space is eliminated.
export const DB_GRID: DbLine[] = [
  { val: 1.0,  label: '+6 dB' },
  { val: 0.72, label: '0 dB'  },
  { val: 0.5,  label: '-12 dB' },
  { val: 0.3,  label: '-24 dB' },
  { val: 0.1,  label: '-48 dB' },
];

export const DB_ZERO_VAL = 0.72;

// ── dB grid renderer — internal reference lines ONLY, no dB labels ──────────

export function drawDbGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  padLeft: number,
  padBottom: number,
  theme: ThemeConfig,
) {
  const gW = width - padLeft;
  const gH = height - padBottom;

  ctx.lineWidth = 1;
  ctx.font = '500 10px Inter, system-ui, sans-serif';

  // Subtle horizontal reference lines + left Y-axis dB labels.
  DB_GRID.forEach(({ val, label }) => {
    const y = gH - val * gH;
    // Clip line drawing inside top padding — suppress anything at the very edge
    if (y < 6) return;
    ctx.strokeStyle = val === DB_ZERO_VAL ? `${theme.primary}35` : 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width, y);
    ctx.stroke();

    // Left Y-axis dB label — suppress the top (+6 dB) value entirely so it
    // never bleeds above the status header. All lower dB values render
    // normally and are clipped to stay inside the grid.
    if (label === '+6 dB') return; // suppress stray top label
    const labelY = Math.max(y + 3, 14);
    ctx.fillStyle = val === DB_ZERO_VAL ? theme.primary : 'rgba(148, 163, 184, 0.5)';
    ctx.textAlign = 'right';
    ctx.fillText(label, padLeft - 8, labelY);
  });
}

// ── Analyser range constants ─────────────────────────────────────────────────

/** Matches analyserNode settings in AudioContext. Used for normalization math. */
export const ANALYSER_MAX_DB = 6;   // ceiling — bars hit the top of the canvas here
export const ANALYSER_MIN_DB = -24; // floor  — everything below -24 dB reads as silence

// ── Freq grid ───────────────────────────────────────────────────────────────

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
) {
  const gW = width - padLeft;
  const gH = height - padBottom;

  // Right-side inset so the final freq tick label is fully visible.
  const rightInset = 22;

  FREQ_GRID.forEach(({ freq, label }, i) => {
    const isLast = i === FREQ_GRID.length - 1;
    // For the last tick (20kHz), pin the X coordinate inside the grid so
    // the right-aligned text never clips the canvas edge.
    const normX = isLast
      ? 1 - rightInset / gW
      : (Math.log10(freq) - Math.log10(20)) / (Math.log10(20000) - Math.log10(20));
    const x = padLeft + normX * gW;

    // Vertical freq separator line (only for non-edge ticks to avoid
    // double-drawing the right border).
    if (!isLast) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, gH);
      ctx.stroke();
    }

    // Hz label — right-aligned for the last tick, center-aligned otherwise.
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

// ── Shared bar renderer ─────────────────────────────────────────────────────

/**
 * Ceiling multiplier: 1.0 means the bar/curve reaches all the way to the top edge
 * of the grid area at +6 dB.  No visual compression — the highest peaks sit flush
 * against the +6 dB ceiling line with the overflow glow sitting just above it.
 */
const CEILING = 1.0;

export interface BarDrawOptions {
  smoothed: Float32Array;
  peaks:    Float32Array;
  barCount: number;
  gap:      number;
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
  // -24 dB floor: raw byte < 68 (~26.7% of 255) = silence / clipped
  for (let i = 0; i < barCount; i++) {
    const raw = smoothed[i * step] || 0;
    // Clip below -24 dB (byte value 68 out of 255 when min=-90 max=0)
    const clampedRaw = raw < 0.267 ? 0 : raw;
    const peakVal = peaks[i * step] || 0;
    const x = padLeft + i * (barW + gap);

    // Clamp to ceiling so the bar top stops at +6 dB visually
    const clamped  = Math.min(clampedRaw, 1.0);
    const h       = clamped * gH * CEILING;
    const y       = gH - h;

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
  // (sits ON the top edge of the grid area) when any bar exceeded ceiling.
  if (anyOverflow) {
    const overflowY = 0;  // flush with the very top of the grid
    ctx.save();
    ctx.shadowColor = theme.overflow;
    ctx.shadowBlur  = 10;
    ctx.strokeStyle = theme.overflow;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(padLeft,      overflowY);
    ctx.lineTo(padLeft + gW, overflowY);
    ctx.stroke();
    ctx.restore();
  }
}

// ── Waveform renderer ───────────────────────────────────────────────────────

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
  ctx.shadowBlur  = 14;
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth   = 2;
  ctx.stroke();
  ctx.restore();
}

// ── Curve renderer ──────────────────────────────────────────────────────────

export function drawCurve(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  padLeft: number,
  padBottom: number,
  theme: ThemeConfig,
  smoothed: Float32Array,
  peaks: Float32Array,
): void {
  const gW = width - padLeft;
  const gH = height - padBottom;
  const getX = (i: number) => padLeft + (i / (smoothed.length - 1)) * gW;
  const getY = (val: number) => gH - Math.min(val, 1.0) * gH * CEILING;

  // Peak-hold line
  ctx.beginPath();
  ctx.moveTo(getX(0), getY(peaks[0]));
  for (let i = 0; i < peaks.length - 1; i++) {
    const x0 = getX(i),     y0 = getY(peaks[i]);
    const x1 = getX(i + 1), y1 = getY(peaks[i + 1]);
    ctx.bezierCurveTo((x0+x1)/2, y0, (x0+x1)/2, y1, x1, y1);
  }
  ctx.strokeStyle = `${theme.peak}88`;
  ctx.lineWidth   = 1;
  ctx.stroke();

  // Wave spline
  const wavePath = new Path2D();
  wavePath.moveTo(getX(0), getY(smoothed[0]));
  for (let i = 0; i < smoothed.length - 1; i++) {
    const x0 = getX(i),     y0 = getY(smoothed[i]);
    const x1 = getX(i + 1), y1 = getY(smoothed[i + 1]);
    wavePath.bezierCurveTo((x0+x1)/2, y0, (x0+x1)/2, y1, x1, y1);
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
  ctx.shadowBlur  = 12;
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth   = 2.5;
  ctx.stroke(wavePath);
  ctx.restore();
}

// ── rAF render-loop factory ─────────────────────────────────────────────────

export type RenderFn = (timestamp: number) => void;

export function createRenderLoop(fn: RenderFn): { start: () => number; stop: () => void } {
  let animId = 0;
  const loop = (ts: number) => {
    fn(ts);
    animId = requestAnimationFrame(loop);
  };
  return {
    start: () => { animId = requestAnimationFrame(loop); return animId; },
    stop:  () => { cancelAnimationFrame(animId); },
  };
}
