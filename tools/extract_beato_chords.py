#!/usr/bin/env python3
"""Extract the chord-form diagrams from the Beato Book 4.0 PDF.

The book prints every drop-voicing family as a grid of 12 fretboard diagrams
per page (three rows of four). The diagrams are vector art, so the exact
string/fret geometry can be read from the PDF itself instead of being guessed.

Each page is one chart type; the four columns are the close-position
inversions printed above them (Root / 3 / 5 / 6 or 7), and the three rows are
the three string sets the family uses.

Output: JSON with one entry per diagram.
String numbering uses 1 = high E ... 6 = low E (guitar convention).
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import pymupdf

PDF = Path(__file__).resolve().parent.parent / "Beato-book-40.pdf"

# Standard tuning, pitch classes for string 1 (high E) .. 6 (low E).
OPEN_PC = {1: 4, 2: 11, 3: 7, 4: 2, 5: 9, 6: 4}

CHART_TYPES = {
    "Maj6": {0, 4, 7, 9},
    "Maj7": {0, 4, 7, 11},
    "Dom7": {0, 4, 7, 10},
    "Min7": {0, 3, 7, 10},
    "Min6": {0, 3, 7, 9},
    "Minmaj7": {0, 3, 7, 11},
    "Min7b5": {0, 3, 6, 10},
    "Dim7": {0, 3, 6, 9},
    "Dimmaj7": {0, 3, 6, 11},
    "Augmaj7": {0, 4, 8, 11},
    "Aug7": {0, 4, 8, 10},
    "Maj7b5": {0, 4, 6, 11},
    "Dom7b5": {0, 4, 6, 10},
    "Maj7sus4": {0, 5, 7, 11},
    "Dom7sus4": {0, 5, 7, 10},
}

INVERSION_LABELS = {
    "Maj6": ["Root", "3", "5", "6"],
    "Min6": ["Root", "3", "5", "6"],
}


def title_of(page: pymupdf.Page) -> tuple[str, int]:
    """Return (chart type, printed page number) from the page text."""
    spans = []
    printed = None
    for block in page.get_text("dict")["blocks"]:
        if block["type"] != 0:
            continue
        for line in block["lines"]:
            for span in line["spans"]:
                text = span["text"].strip()
                if not text:
                    continue
                if text.startswith("Drop"):
                    continue
                if span["bbox"][1] > 740:
                    printed = text
                else:
                    spans.append((span["bbox"][0], text))
    spans.sort(key=lambda s: s[0])
    title = "".join(s[1] for s in spans).replace(" ", "")
    return normalize_title(title), int(printed) if printed and printed.isdigit() else 0


def normalize_title(title: str) -> str:
    key = re.sub(r"[^a-z0-9]", "", title.lower())
    lookup = {
        "maj6": "Maj6",
        "maj7": "Maj7",
        "dom7": "Dom7",
        "min7": "Min7",
        "min6": "Min6",
        "minmaj7": "Minmaj7",
        "min7b5": "Min7b5",
        "dim7": "Dim7",
        "dimmaj7": "Dimmaj7",
        "augmaj7": "Augmaj7",
        "aug7": "Aug7",
        "maj7b5": "Maj7b5",
        "dom7b5": "Dom7b5",
        "maj7sus4": "Maj7sus4",
        "dom7sus4": "Dom7sus4",
        "lydianmaj7": "Lydianmaj7",
        "lydiandom7": "LydianDom7",
        "dimmaj7b13": "Dimmaj7b13",
    }
    return lookup.get(key, title)


def circles(page: pymupdf.Page):
    """Unique dots with (cx, cy, is_root)."""
    out = {}
    for drawing in page.get_drawings():
        rect = drawing["rect"]
        if not (9 <= rect.width <= 14 and 9 <= rect.height <= 14):
            continue
        fill = drawing.get("fill")
        if fill is None:
            continue
        if all(c > 0.99 for c in fill):
            continue
        key = (round(rect.x0 + rect.width / 2, 1), round(rect.y0 + rect.height / 2, 1))
        is_root = fill[0] > 0.5 and fill[1] < 0.5 and fill[2] < 0.5
        out[key] = is_root
    return [(x, y, root) for (x, y), root in out.items()]


def group(values, tol=3.0):
    groups = []
    for value in sorted(values):
        if not groups or value - groups[-1][-1] > tol:
            groups.append([value])
        else:
            groups[-1].append(value)
    return [sum(g) / len(g) for g in groups]


def extract_page(page: pymupdf.Page, family: str, printed: int, chart: str):
    drawings = page.get_drawings()
    verticals = [
        d["rect"].x0
        for d in drawings
        if d["rect"].width < 2.6 and d["rect"].height > 100
    ]
    wires = [
        d["rect"]
        for d in drawings
        if d["rect"].width > 60 and d["rect"].height < 6
    ]
    string_x = group(verticals)
    col_groups = []
    for x in string_x:
        if not col_groups or x - col_groups[-1][-1] > 30:
            col_groups.append([x])
        else:
            col_groups[-1].append(x)
    col_strings = [g[:6] for g in col_groups if len(g) >= 6]

    # Rows: wire y values, clustered with a large gap threshold.
    wire_ys = sorted({round(w.y0, 1) for w in wires})
    row_groups = []
    for y in wire_ys:
        if not row_groups or y - row_groups[-1][-1] > 60:
            row_groups.append([y])
        else:
            row_groups[-1].append(y)
    rows = [sorted(g)[:6] for g in row_groups if len(g) >= 6]

    dots = circles(page)
    labels = INVERSION_LABELS.get(chart, ["Root", "3", "5", "7"])
    out = []

    for r, wire in enumerate(rows):
        top, bottom = wire[0], wire[-1]
        spacing = (bottom - top) / 5
        for c, strings in enumerate(col_strings):
            left, right = min(strings), max(strings)
            in_col = [
                (x, y, root)
                for x, y, root in dots
                if left - 8 <= x <= right + 8 and top - 6 <= y <= bottom + 5
            ]
            if len(in_col) < 4:
                continue
            positions = []
            for x, y, root in in_col:
                s = min(range(len(strings)), key=lambda i: abs(strings[i] - x))
                string = 6 - s  # leftmost line is string 6 (low E)
                if abs(y - top) < 5:
                    fret = 0
                else:
                    # Dots are centred in a fret space: half a space below the
                    # nut is fret 1, one and a half spaces is fret 2, and so on.
                    fret = int(round((y - top) / spacing))
                positions.append((string, max(0, min(5, fret)), root))
            if len({p[0] for p in positions}) != 4:
                continue
            if sum(1 for p in positions if p[2]) != 1:
                continue
            root_pc = next(
                (OPEN_PC[s] + f) % 12 for s, f, is_root in positions if is_root
            )
            intervals = {((OPEN_PC[s] + f) - root_pc) % 12 for s, f, _ in positions}
            out.append(
                {
                    "family": family,
                    "chartType": chart,
                    "inversion": labels[c],
                    "stringSet": sorted(p[0] for p in positions),
                    "frets": {str(s): f for s, f, _ in sorted(positions)},
                    "rootPc": root_pc,
                    "intervals": sorted(intervals),
                    "row": r,
                    "col": c,
                    "page": printed,
                }
            )
    return out


def main():
    doc = pymupdf.open(PDF)
    families = [
        (114, 131, "Drop 2"),
        (132, 149, "Drop 3"),
        (150, 167, "Drop 2+3"),
        (168, 185, "Drop 2+4"),
    ]
    result = []
    problems = []
    for first, last, family in families:
        current = None
        for pdf_page in range(first, last + 1):
            page = doc[pdf_page - 1]
            chart, printed = title_of(page)
            if chart.startswith("Drop") or not chart:
                chart = current or ""
            if chart:
                current = chart
            if not current:
                continue
            diagrams = extract_page(page, family, printed, current)
            if len(diagrams) != 12:
                problems.append(
                    f"page {pdf_page} ({family} {current}): {len(diagrams)} diagrams"
                )
            for d in diagrams:
                expected = CHART_TYPES.get(current)
                if expected and not set(d["intervals"]).issubset(expected):
                    problems.append(
                        f"page {pdf_page} {family} {current} {d['inversion']} "
                        f"strings {d['stringSet']} frets {d['frets']}: "
                        f"intervals {d['intervals']} not in {sorted(expected)}"
                    )
            result.extend(diagrams)

    print(json.dumps(result, indent=1))
    print(f"# {len(result)} shapes", file=sys.stderr)
    for p in problems:
        print("# PROBLEM", p, file=sys.stderr)


if __name__ == "__main__":
    main()
