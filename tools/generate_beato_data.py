#!/usr/bin/env python3
"""Turn the extracted Beato diagrams into the site's chord-form database.

Run tools/extract_beato_chords.py first, then this script. The output is a
single JSON file that ships with the app; it is generated data, not a build
step, so the site never needs the 35 MB PDF at runtime.
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = Path("/tmp/opencode/beato-shapes.json")
TARGET = ROOT / "src/lib/theory/beatoShapes.json"

# String 1 = high E ... string 6 = low E. Shape arrays in the app are indexed
# 0 = low E, so the mapping is index = 6 - string number.
OPEN_PC = {1: 4, 2: 11, 3: 7, 4: 2, 5: 9, 6: 4}

# The book's Drop 3 "Dimmaj7b13" page is a duplicate of the Drop 3
# "Maj7sus4" page (same diagrams, same page content). Including it would put
# four-note sus chords under a diminished label, so it is deliberately left
# out. Everything else is reproduced exactly as printed.
EXCLUDED = {("Drop 3", "Dimmaj7b13")}

CHART_ORDER = [
    "Maj6",
    "Maj7",
    "Dom7",
    "Min7",
    "Min6",
    "Minmaj7",
    "Min7b5",
    "Dim7",
    "Dimmaj7",
    "Augmaj7",
    "Aug7",
    "Maj7b5",
    "Dom7b5",
    "Maj7sus4",
    "Dom7sus4",
    "Lydianmaj7",
    "LydianDom7",
    "Dimmaj7b13",
]

# Column headings exactly as printed above the four diagrams on each page.
COLUMNS = {
    "Maj6": ["Root", "3", "5", "6"],
    "Maj7": ["Root", "3", "5", "7"],
    "Dom7": ["Root", "3", "5", "b7"],
    "Min7": ["Root", "b3", "5", "b7"],
    "Min6": ["Root", "b3", "5", "6"],
    "Minmaj7": ["Root", "b3", "5", "7"],
    "Min7b5": ["Root", "b3", "b5", "b7"],
    "Dim7": ["Root", "b3", "b5", "bb7"],
    "Dimmaj7": ["Root", "b3", "b5", "7"],
    "Augmaj7": ["Root", "3", "#5", "7"],
    "Aug7": ["Root", "3", "#5", "b7"],
    "Maj7b5": ["Root", "3", "b5", "7"],
    "Dom7b5": ["Root", "3", "b5", "b7"],
    "Maj7sus4": ["Root", "4", "5", "7"],
    "Dom7sus4": ["Root", "4", "5", "b7"],
    "Lydianmaj7": ["Root", "#4", "5", "7"],
    "LydianDom7": ["Root", "#4", "5", "b7"],
    "Dimmaj7b13": ["Root", "b3", "#5", "7"],
}


def main():
    rows = json.load(SOURCE.open())
    shapes = []
    for row in rows:
        key = (row["family"], row["chartType"])
        if key in EXCLUDED:
            continue

        shape = [-1] * 6
        for string, fret in row["frets"].items():
            shape[6 - int(string)] = fret

        bass_string = min(row["stringSet"])
        bass_pc = (OPEN_PC[bass_string] + row["frets"][str(bass_string)]) % 12
        bass = (bass_pc - row["rootPc"]) % 12

        shapes.append(
            {
                "f": row["family"],
                "c": row["chartType"],
                "i": COLUMNS[row["chartType"]][row["col"]],
                "b": bass,
                "s": shape,
                "r": row["rootPc"],
                "p": row["page"],
            }
        )

    counts = Counter((s["f"], s["c"]) for s in shapes)
    assert len(shapes) == 640, len(shapes)
    assert all(n == 12 for (family, _), n in counts.items() if family == "Drop 2")
    assert all(n == 8 for (family, _), n in counts.items() if family != "Drop 2")

    payload = {
        "source": "Beato Book 4.0 — Chapter 2: Chord Forms, Drop Voicings (pp. 112–184)",
        "count": len(shapes),
        "charts": CHART_ORDER,
        "families": ["Drop 2", "Drop 3", "Drop 2+3", "Drop 2+4"],
        "shapes": shapes,
    }
    TARGET.write_text(json.dumps(payload, indent=1) + "\n")
    print(f"wrote {len(shapes)} shapes to {TARGET}")


if __name__ == "__main__":
    main()
