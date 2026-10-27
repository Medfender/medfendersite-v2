/* ═══════════════════════════════════════════════════════════════════════
   BOOK SHAPE — a printed diagram, redrawn

   The miniature, in the book's own orientation: strings run top to bottom,
   frets left to right, root in red, muted strings crossed at the nut. Used
   on the chart cards where a dozen shapes sit side by side.
   ═══════════════════════════════════════════════════════════════════════ */

import { noteNameOf, pitchClassOf } from "@/lib/theory/fretboard";

interface BookShapeProps {
  /** Fret per string, low E → high E. -1 = muted. */
  shape: readonly number[];
  /** Sounding root pitch class, so the dot can be printed red. */
  rootPc: number;
  /** Draw the string names under the diagram. */
  showStrings?: boolean;
  className?: string;
}

const LEFT = 16;
const RIGHT = 6;
const TOP = 22;
const BOTTOM = 8;
const BOARD = 90;
const STRING_GAP = BOARD / 5;
const FRET_HEIGHT = 21;

export default function BookShape({
  shape,
  rootPc,
  showStrings = false,
  className = "",
}: BookShapeProps) {
  const sounding = shape.filter((fret) => fret >= 0);
  const minFret = sounding.length ? Math.min(...sounding) : 1;
  const maxFret = sounding.length ? Math.max(...sounding) : 5;
  const start = Math.max(1, minFret);
  const rows = Math.max(4, maxFret - start + 1);
  const height = TOP + rows * FRET_HEIGHT + (showStrings ? 16 : BOTTOM);
  const width = LEFT + BOARD + RIGHT;

  const stringX = (index: number) => LEFT + index * STRING_GAP;
  const fretY = (row: number) => TOP + row * FRET_HEIGHT;
  const noteY = (fret: number) => TOP + (fret - start + 0.5) * FRET_HEIGHT;
  const nut = start === 1;

  const labelFor = (index: number, fret: number) => {
    if (fret < 0) return "muted";
    return `${noteNameOf(index, fret)}${pitchClassOf(index, fret) === ((rootPc % 12) + 12) % 12 ? " root" : ""}`;
  };

  const description = shape
    .map((fret, index) =>
      fret < 0
        ? `string ${6 - index} muted`
        : `string ${6 - index}, fret ${fret}, ${labelFor(index, fret)}`,
    )
    .join("; ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label={`Chord diagram: ${description}`}
    >
      {/* Fret wires */}
      {Array.from({ length: rows + 1 }, (_, row) => (
        <line
          key={`wire-${row}`}
          x1={LEFT}
          x2={LEFT + BOARD}
          y1={fretY(row)}
          y2={fretY(row)}
          stroke={nut && row === 0 ? "var(--ink)" : "var(--rule)"}
          strokeWidth={nut && row === 0 ? 2.4 : 1}
        />
      ))}

      {!nut ? (
        <text
          x={LEFT - 5}
          y={fretY(0) + 8}
          textAnchor="end"
          fontSize="7.5"
          fill="var(--ink)"
          opacity="0.6"
          fontFamily="var(--font-geist-mono), monospace"
        >
          {start}
        </text>
      ) : null}

      {/* Strings */}
      {shape.map((fret, index) => (
        <line
          key={`string-${index}`}
          x1={stringX(index)}
          x2={stringX(index)}
          y1={TOP}
          y2={fretY(rows)}
          stroke="var(--rule)"
          strokeWidth={1.6 - index * 0.14}
          strokeLinecap="round"
        />
      ))}

      {shape.map((fret, index) => {
        if (fret < 0) {
          const x = stringX(index);
          return (
            <g key={`mute-${index}`} stroke="var(--ink)" strokeWidth="1.1" opacity="0.75">
              <line x1={x - 3} y1={TOP - 10} x2={x + 3} y2={TOP - 4} />
              <line x1={x + 3} y1={TOP - 10} x2={x - 3} y2={TOP - 4} />
            </g>
          );
        }
        if (fret === 0) {
          return (
            <circle
              key={`open-${index}`}
              cx={stringX(index)}
              cy={TOP - 7}
              r="3.2"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="1.2"
            />
          );
        }
        const isRoot =
          pitchClassOf(index, fret) === ((rootPc % 12) + 12) % 12;
        return (
          <circle
            key={`note-${index}`}
            cx={stringX(index)}
            cy={noteY(fret)}
            r="5.4"
            fill={isRoot ? "var(--rust)" : "var(--ink)"}
          />
        );
      })}

      {showStrings
        ? ["E", "A", "D", "G", "B", "E"].map((name, index) => (
            <text
              key={`name-${index}`}
              x={stringX(index)}
              y={fretY(rows) + 12}
              textAnchor="middle"
              fontSize="6.5"
              fill="var(--ink)"
              opacity="0.45"
              fontFamily="var(--font-geist-mono), monospace"
            >
              {name}
            </text>
          ))
        : null}
    </svg>
  );
}
