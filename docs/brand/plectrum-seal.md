# The Plectrum Seal — the Medfender mark

> Ground-up remake of the identity symbol. The mark is a guitarist's mark:
> a Fender-351-shaped plectrum holding a Stratocaster, drawn in machined
> steel and cobalt, built entirely on real instrument geometry.

## The concept

A guitarist's logo should be made of guitar truths. The Plectrum Seal is
exactly three of them, nested:

1. **The shell is a pick.** The 351 contour — tip north, tuned by eye to
   the real pick's narrow tip and broad, flat-bottomed mass. Its tip
   carries a single cobalt signal dot: the pick is live.
2. **The instrument is a blueprint.** The Stratocaster inside is built on
   the office blueprint constants (see `STRAT_*` in
   `tools/brand_assets_generator.py`, shared by both the React mark and
   the generated favicons): body 18.1″ × 12.6″ (1.437:1), 25.5″ scale,
   nut 1.6875″, headstock swept 14° — the sweep applied as a pivot about
   the nut, never a translation, so the paddle never crowds the fretboard.
3. **The fretboard is honest.** Fret positions follow the true 12-TET
   rule `f(n) = nut + S·(1 − 2^(−n/12))`. The pickups are routed in Strat
   formation (the middle one slanted). The tuner posts are six-in-line
   along the bass edge.

## The Zellige fusion

The position markers are Fes inlay work: 8-point safs sit at frets
3 · 5 · 7 · 9, and the octave carries the 12-point rosette — **one point
per semitone**. Moroccan ornamentation where a Stratocaster keeps its
dots. This fusion is the identity: Fez geometry meeting American
guitar hardware, both drawn with the same monoline pen.

## The physics — the strings

The six strings are the living part of the mark. Hovering the logo plucks
them, low E first, ascending (an arpeggio, one string every 0.82 s). Each
string rings as a damped two-mode standing wave:

    y(x,t) = A·sin(πx/L)·e^(−t/τ)·cos(2πft)
           + β·A·sin(2πx/L)·e^(−t/βτ)·cos(4πft)

- `f` is the string's **real open pitch ratio** (E₂ A₂ D₃ G₃ B₃ E₄),
  rendered on a stroboscopically slowed clock so the standing wave is
  visible while the ratios stay true.
- `τ` (sustain) shortens across the set exactly as string mass shortens
  it — the low E rings longest.
- β ≈ 0.31: the second mode (from the pluck point at 0.28 L) carries the
  shape's brightness and dies faster, like a real plucked string.
- At rest, the low E shimmers in a faint sympathetic resonance — the
  room breathing into the thickest string.
- A ringing string also glows cobalt: the signal you can see.

All of it is written straight to path `d` per frame — no React state, no
re-renders. The loop pauses when the tab is hidden or the mark is
offscreen, and is fully frozen under `prefers-reduced-motion` (strings
render straight, identical to SSR — hydration-safe by construction).

## Wordmark

The authentic geometric monoline logotype is carried over unchanged:
stroke skeleton, cap height 160/208, stroke 17.6, with its Zellige
inlays (which now read also as fret markers — the same stars as on the
board inside the seal).

## Static twin

`tools/brand_assets_generator.py` mirrors the seal for the icon set:
`medfender-favicon.svg` (bolder strokes for favicon.ico / icon.svg) and
`medfender-icon.svg` (the seal on the obsidian plate, for
apple-icon.png). Same constants, same fret math, straight strings, no
animation. `tools/make_favicon.py` then produces `src/app/favicon.ico`,
`src/app/icon.svg` and `src/app/apple-icon.png`.

## Demos

- `/brand-demo` — variants, size ladder, live string physics.
- `/brand` — the brand system page (swatches + generated studies).
