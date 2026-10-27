import type { ChordRole } from "@/lib/theory/fretboard";
import {
  STRING_NAMES,
  STRING_OCTAVES,
  fretCentre,
  fretPosition,
  isDoubleInlayFret,
  isInlayFret,
} from "@/lib/theory/fretboard";

export interface NeckNote {
  string: number;
  fret: number;
  /** Interval or note printed inside the dot, e.g. "R", "♭3", "G". */
  label?: string;
  name?: string;
  role?: ChordRole;
  /** MIDI note number, used when a dot is plucked. */
  midi?: number;
  /** Emphasise the note (the sounding shape rather than the full map). */
  active?: boolean;
}

interface NeckMapProps {
  /** Highest fret drawn. Defaults to 12. */
  lastFret?: number;
  /** Dots drawn on the neck. */
  notes?: NeckNote[];
  /** Faint chord-tone map drawn beneath the sounding shape. */
  ghostNotes?: NeckNote[];
  /** Strings not sounded in the shape, marked with a cross at the nut. */
  mutedStrings?: number[];
  /** Print the fret number under every fret. */
  showFretNumbers?: boolean;
  /** Print the open-string names at the nut. */
  showStringNames?: boolean;
  /** Paper or ink surface. */
  tone?: "paper" | "ink";
  /** Screen-reader description of the drawing. */
  ariaLabel?: string;
  /** Fires when a sounding note is activated (click or Enter/Space). */
  onNoteClick?: (note: NeckNote) => void;
  className?: string;
}

const WIDTH = 1200;
const HEIGHT = 272;
const PAD = { left: 96, right: 40, top: 40, bottom: 54 };

const STRING_GAUGE = [2.8, 2.35, 1.95, 1.55, 1.2, 0.9];

const ROLE_FILL: Record<ChordRole, string> = {
  root: "var(--rust)",
  third: "var(--color-brass-ink)",
  fifth: "var(--ink)",
  seventh: "var(--color-sand-deep)",
  color: "var(--color-sand-deep)",
};

/** On ink the same roles lift to their light equivalents. */
const ROLE_FILL_INK: Record<ChordRole, string> = {
  root: "#d8715a",
  third: "var(--color-brass-light)",
  fifth: "var(--color-cream)",
  seventh: "var(--color-sand)",
  color: "var(--color-sand)",
};

/**
 * The neck, drawn to scale.
 *
 * Every x-position comes from `fretPosition()`, which derives from the real
 * 2^(−n/12) series — so fret 12 sits exactly at the midpoint and the spaces
 * narrow as they climb. Nothing here is an equal-spaced grid.
 */
export default function NeckMap({
  lastFret = 12,
  notes = [],
  ghostNotes = [],
  mutedStrings = [],
  showFretNumbers = true,
  showStringNames = true,
  tone = "paper",
  ariaLabel = "Guitar neck in standard tuning, from the nut to fret 12",
  onNoteClick,
  className = "",
}: NeckMapProps) {
  const onInk = tone === "ink";

  // The drawing follows the surface it sits on: ink on paper, paper on ink.
  // Every tone resolves from the theme tokens so it can never drift off-system.
  const palette = onInk
    ? {
        board: "rgba(251,250,247,0.035)",
        boardEdge: "rgba(251,250,247,0.16)",
        wire: "rgba(251,250,247,0.22)",
        wireStrong: "rgba(224,178,100,0.9)",
        nut: "rgba(251,250,247,0.85)",
        string: "rgba(251,250,247,0.26)",
        label: "rgba(251,250,247,0.72)",
        fretLabel: "rgba(251,250,247,0.42)",
        inlay: "rgba(251,250,247,0.10)",
        defaultNote: "var(--color-brass-light)",
        noteStroke: "rgba(251,250,247,0.5)",
      }
    : {
        board: "rgba(18,18,16,0.045)",
        boardEdge: "rgba(18,18,16,0.16)",
        wire: "rgba(18,18,16,0.20)",
        wireStrong: "rgba(125,49,37,0.9)",
        nut: "var(--ink)",
        string: "rgba(18,18,16,0.34)",
        label: "rgba(18,18,16,0.72)",
        fretLabel: "rgba(18,18,16,0.45)",
        inlay: "rgba(18,18,16,0.12)",
        defaultNote: "var(--color-brass-ink)",
        noteStroke: "rgba(18,18,16,0.42)",
      };

  const ink = palette.wireStrong;
  const softInk = palette.wire;
  const board = palette.board;
  const boardEdge = palette.boardEdge;
  const label = palette.label;
  const fretLabel = palette.fretLabel;
  const inlay = palette.inlay;
  const noteStroke = palette.noteStroke;

  const getNoteColor = (role?: ChordRole) =>
    role
      ? (onInk ? ROLE_FILL_INK : ROLE_FILL)[role]
      : palette.defaultNote;

  const x0 = PAD.left;
  const x1 = WIDTH - PAD.right;
  const yTop = PAD.top;
  const yBottom = HEIGHT - PAD.bottom;
  // High E (index 5) at top, Low E (index 0) at bottom
  const stringY = (index: number) =>
    yBottom - ((yBottom - yTop) * index) / (STRING_GAUGE.length - 1);
  // Nut at left, frets increase to the right
  const fretX = (fret: number) =>
    x0 + (x1 - x0) * fretPosition(fret, lastFret);
  const noteX = (fret: number) =>
    fret <= 0 ? x0 - 24 : x0 + (x1 - x0) * fretCentre(fret, lastFret);

  const boardTop = yTop - 15;
  const boardHeight = yBottom - yTop + 30;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={`neck-svg ${className}`}
      role="group"
      aria-label={ariaLabel}
    >
      {/* The board itself: a pale panel, never a photograph. */}
      <rect
        x={x0}
        y={boardTop}
        width={x1 - x0}
        height={boardHeight}
        fill={board}
        stroke={boardEdge}
        strokeWidth="1"
      />

      {/* Inlays, between the third and fourth strings. */}
      {Array.from({ length: lastFret }, (_, i) => i + 1).map((fret) => {
        if (!isInlayFret(fret) || fret > lastFret) return null;
        const cx = noteX(fret);
        const centre = (stringY(2) + stringY(3)) / 2;
        if (isDoubleInlayFret(fret)) {
          return (
            <g key={`inlay-${fret}`} aria-hidden>
              <circle cx={cx} cy={centre - 13} r={5.5} fill={inlay} />
              <circle cx={cx} cy={centre + 13} r={5.5} fill={inlay} />
            </g>
          );
        }
        return (
          <circle
            key={`inlay-${fret}`}
            cx={cx}
            cy={centre}
            r={5.5}
            fill={inlay}
            aria-hidden
          />
        );
      })}

      {/* Fret wires: physical positions, not divisions. */}
      {Array.from({ length: lastFret }, (_, i) => i + 1).map((fret) => (
        <line
          key={`fret-${fret}`}
          x1={fretX(fret)}
          x2={fretX(fret)}
          y1={boardTop}
          y2={boardTop + boardHeight}
          stroke={fret - 12 === 0 ? ink : softInk}
          strokeWidth={fret === 12 ? 1.6 : 1}
        />
      ))}

      {/* Nut at left side */}
      <line
        x1={x0}
        x2={x0}
        y1={boardTop - 7}
        y2={boardTop + boardHeight + 7}
        stroke={ink}
        strokeWidth="4"
      />

      {/* Strings start precisely at the nut (x0) and extend to the end of the neck (x1) */}
      {STRING_GAUGE.map((gauge, index) => (
        <line
          key={`string-${index}`}
          x1={x0}
          x2={x1}
          y1={stringY(index)}
          y2={stringY(index)}
          stroke={softInk}
          strokeWidth={gauge}
          strokeLinecap="round"
        />
      ))}

      {/* Open-string names at left (nut). */}
      {showStringNames
        ? STRING_NAMES.map((name, index) => (
            <text
              key={`open-${index}`}
              x={x0 - 54}
              y={stringY(index) + 3.5}
              textAnchor="middle"
              fontSize="9.5"
              letterSpacing="0.06em"
              fill={index === 0 ? ink : label}
            >
              {name}
              <tspan fontSize="7" dy="1">
                {STRING_OCTAVES[index]}
              </tspan>
            </text>
          ))
        : null}

      {/* Fret numbers. */}
      {showFretNumbers
        ? Array.from({ length: lastFret }, (_, i) => i + 1).map((fret) => (
            <text
              key={`num-${fret}`}
              x={noteX(fret)}
              y={HEIGHT - 22}
              textAnchor="middle"
              fontSize={isInlayFret(fret) ? 10 : 9}
              fill={isInlayFret(fret) ? label : fretLabel}
              letterSpacing="0.04em"
            >
              {fret}
            </text>
          ))
        : null}

      {/* Muted strings, marked at the nut (left side). */}
      {mutedStrings.map((string) => (
        <text
          key={`muted-${string}`}
          x={x0 - 26}
          y={stringY(string) + 4}
          textAnchor="middle"
          fontSize="12"
          fill={softInk}
          aria-hidden
        >
          ×
        </text>
      ))}

      {/* Faint chord-tone map. */}
      {ghostNotes.map((note) => (
        <circle
          key={`ghost-${note.string}-${note.fret}`}
          cx={noteX(note.fret)}
          cy={stringY(note.string)}
          r={4}
          fill="none"
          stroke={note.role ? getNoteColor(note.role) : softInk}
          strokeWidth="1.2"
          opacity="0.25"
          aria-hidden
        />
      ))}

      {/* The sounding shape. */}
      {notes.map((note) => {
        const cx = noteX(note.fret);
        const cy = stringY(note.string);
        const fill = getNoteColor(note.role);
        const open = note.fret === 0;
        const description = `${note.name ?? STRING_NAMES[note.string]} · string ${
          6 - note.string
        }, fret ${note.fret}${note.label ? `, ${note.label}` : ""}`;
        return (
          <g
            key={`note-${note.string}-${note.fret}`}
            className="note-dot"
            data-active={note.active ? "true" : undefined}
            role={onNoteClick ? "button" : undefined}
            tabIndex={onNoteClick ? 0 : undefined}
            aria-label={onNoteClick ? `Pluck ${description}` : undefined}
            onClick={onNoteClick ? () => onNoteClick(note) : undefined}
            onKeyDown={
              onNoteClick
                ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onNoteClick(note);
                    }
                  }
                : undefined
            }
            style={onNoteClick ? { cursor: "pointer" } : undefined}
          >
            {onNoteClick ? (
              <rect
                x={cx - 17}
                y={cy - 17}
                width={34}
                height={34}
                fill="transparent"
              />
            ) : null}
            <circle
              cx={cx}
              cy={cy}
              r={13}
              fill={note.active ? fill : "transparent"}
              stroke={note.active ? fill : noteStroke}
              strokeWidth={note.active ? 0 : 1.25}
            />
            {open && !note.active ? (
              <circle cx={cx} cy={cy} r={7} fill="none" stroke={noteStroke} strokeWidth="1.2" />
            ) : null}
            {note.label ? (
              <text
                x={cx}
                y={cy + 3.2}
                textAnchor="middle"
                fontSize="8.5"
                fontWeight="600"
                letterSpacing="0.02em"
                fill={note.active ? (onInk ? "var(--ink)" : "var(--cream)") : label}
              >
                {note.label}
              </text>
            ) : null}
            <title>{description}</title>
          </g>
        );
      })}
    </svg>
  );
}
