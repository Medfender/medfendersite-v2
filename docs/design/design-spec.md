# Medfender — Design Specification

**Direction chosen:** *The Instrument, Drawn* (a synthesis of Direction A and B)
**Date:** 2026-10-25

---

## 1. Why this direction

Three directions were developed:

### A — *The Modern Instrument*
Materiality and precision: close-cropped instrument photography, engraved annotation, hardware-metal accents, the fretboard as a crafted object. **Strength:** unmistakably a guitarist's site. **Risk:** becomes a product catalogue; weak for text-heavy teaching; expensive to sustain photographically.

### B — *The Editorial Music Laboratory*
A publication that happens to be an instrument: strong reading typography, archival numbering, generous measure, diagrams treated as plates. **Strength:** carries lessons, essays, and commerce with equal authority. **Risk:** can drift into generic "luxury magazine" — the precise failure mode the current build is flirting with.

### C — *The Experimental Digital Instrument*
The interface *is* the instrument: generative visualisation, pitch-derived motion, spatial navigation. **Strength:** maximum memorability. **Risk:** spectacle outruns pedagogy; accessibility and performance costs; ages fastest.

### Decision matrix

| Criterion (weight) | A | B | C |
|---|---|---|---|
| Originality (20) | 7 | 8 | 9 |
| Musical relevance (20) | 9 | 7 | 9 |
| Usability for teaching/commerce (20) | 6 | 9 | 5 |
| Technical feasibility in this stack (10) | 8 | 9 | 5 |
| Accessibility (10) | 7 | 9 | 5 |
| Performance (10) | 7 | 9 | 5 |
| Longevity (10) | 7 | 9 | 6 |
| **Total** | **7.5** | **8.5** | **7.0** |

**Selected: A + B — "The Instrument, Drawn."** Take A's material and geometric authority, but bind it to B's editorial discipline. The instrument appears as *drawing* (precise SVG geometry, measured rules, real photography only where a photograph earns its place), not as product-shot gloss. The theory engine becomes the living proof of the thesis: the drawing is playable.

**One-line thesis:** *A guitarist's working notebook, set in the geometry of the neck — every rule measured like a fret, every lesson numbered like an étude, and one page you can actually play.*

---

## 2. The through-line

The recurring object is **the neck**: six strings and a fret scale.

- **Section rules** are drawn as six hairlines whose weights follow string gauges (low E heaviest). They are the site's signature divider — used sparingly, at most once per page.
- **Indices** are set as fret numbers; the double-dot at fret 12 marks the halfway point of long pages.
- **The hero** is a true-geometry fretboard segment (nut → 12th fret) burned into the paper, with the brand statement sitting in the neck's open space.
- **The lab** at `/fretboard` is the same drawing, made interactive.

Nothing is decorated with "guitar clip-art". The ornament *is* the measurement.

---

## 3. Colour architecture

| Token | Value | Role |
|---|---|---|
| `--paper` | `#F6F5F2` | primary canvas (neutral gallery off-white) |
| `--paper-deep` | `#E5E4DE` | secondary canvas / wells |
| `--cream` | `#FBFAF7` | raised surface on paper |
| `--ink` | `#121210` | primary text, dark canvas |
| `--ink-deep` | `#0B0B0A` | photographic ground |
| `--ink-soft` | `#262623` | elevated surface on ink |
| `--brass` | `#C08A2B` | primary interactive accent (hardware brass) |
| `--brass-bright` | `#E0B264` | accent on ink only |
| `--oxblood` | `#7D3125` | root notes; destructive/urgent |
| `--rule` | ink @ 15% | hairlines on paper |
| `--rule-ink` | paper @ 18% | hairlines on ink |

The canvas is deliberately **neutral, not warm**: no yellow cast in the paper, so
photography carries the only warmth on the page. Brass and oxblood are the only
colour that is ours.

**Functional musical palette** (used in diagrams and the lab, never decoratively):

| Meaning | Encoding |
|---|---|
| Root | oxblood fill + white label + square marker |
| Chord tone | brass fill + ink label |
| Scale tone (not chord tone) | paper fill, ink 1px outline, ink label |
| Outside the current scale | 18% ink dot only, no label at rest |
| Semitone movement in the ledger | oxblood arrow, numeric interval |

Colour is never the only signal: every state also carries a label, a shape, or a position.

**Contrast:** body text `--ink` on `--paper` ≈ 16:1. `--brass` is restricted to display sizes and non-text ornament; small accent text uses `--brass-ink` (`#7A5310`, ≈ 5.6:1). All pairings verified in `docs/design/contrast.md`.

---

## 4. Typography

Three voices, each with a job:

| Voice | Face | Job |
|---|---|---|
| **Editorial** | *Newsreader* (variable, 200–700, true italic) | Display, headlines, long-form reading. Optical sizes keep large type from looking clumsy. |
| **Interface** | *Geist* | Navigation, buttons, body-compact, UI labels. Neutral, excellent at 13–16px. |
| **Measurement** | *Geist Mono* | Fret numbers, intervals, prices, plate marks, tab. Tabular by nature. |

Rationale: the previous build used a single high-contrast display serif for *everything*, which flattens hierarchy into "luxury magazine". Splitting editorial from interface restores functional difference; the mono earns its place because this site genuinely measures things.

**Scale** (fluid, `clamp()`):

| Step | Size | Use |
|---|---|---|
| `--step--1` | 0.78rem | captions, folio |
| `--step-0` | 0.95rem | UI, compact body |
| `--step-1` | 1.06rem | reading body (1.7 line-height) |
| `--step-2` | 1.35rem | lede |
| `--step-3` | 1.9rem | h3 |
| `--step-4` | 2.7rem | h2 |
| `--step-5` | 3.9rem | section display |
| `--step-6` | clamp(3.2rem, 8vw, 7rem) | hero |

Rules: measure capped at 34rem for reading, 46rem for technical prose; display tracking `-0.02em`; no italic-accent-in-every-headline (max one per page); uppercase reserved for fret markers and metadata, never for headlines.

---

## 5. Layout grammar

- 12-column grid, max width **1560px**, gutters 20px mobile / 32px desktop.
- Editorial column = cols 1–7; annotation rail = cols 9–12. Asymmetry is structural: the right rail carries measurements (dates, keys, prices), never filler.
- **Measure rail** on long pages (desktop ≥1280px): a 56px left margin carrying fret numbers 0–12 aligned to section boundaries, with inlay dots at 3/5/7/9/12. It is an index, not decoration, and it is `aria-hidden`.
- Full-bleed allowed for: the hero neck, photographic plates, the fretboard lab, the ledger table.
- Radii: **0**. The only curves are physical (inlay dots, vinyl label, plucked-string motion).
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160 (px).
- Sections alternate paper → ink at most once per page; a page never zig-zags more than twice.

---

## 6. Imagery

- Existing photographs are kept (real band, real rooms) but re-cropped: instrument-led crops (neck, hands, pedalboard) preferred over full-stage wide shots.
- One photograph per page may be full-bleed; the rest are inset plates with a caption set in mono.
- Print grade: `saturate(.9) contrast(1.02)` — no sepia wash, no hard vignette over the subject.
- New original asset: the **fretboard drawing** (SVG, generated from equal-temperament ratios — see `src/lib/theory/fretboard.ts`). It is the only "illustration" the site needs.

---

## 7. Motion

One motion idea: **the plucked string settles.**

```css
@keyframes mf-settle {
  0%   { opacity: 0; transform: translateY(10px); }
  60%  { opacity: 1; transform: translateY(-1.5px); }
  100% { opacity: 1; transform: translateY(0); }
}
```
- Durations: micro (120–180ms) for controls; entrance (420–620ms) for content; no transition over 700ms.
- Easings: `cubic-bezier(.16,1,.3,1)` for entrances, `cubic-bezier(.2,.7,.3,1)` for state.
- Stagger: 40ms per item, maximum 5 items (never a long cascade).
- Page transitions: 160ms opacity only. No curtain, no wait.
- Interactive fretboard: a note's dot scales 1 → 1.12 → 1 over 220ms; voice-leading lines draw in 320ms.
- Scroll: CSS `view-timeline`/IntersectionObserver reveal, single-shot, never re-triggering.
- `prefers-reduced-motion: reduce` → all entrances collapse to opacity 0→1 over 1ms; no transforms; no marquee; no pluck animation.

---

## 8. Signature interaction — *The Atlas*

`/fretboard` is an instrument, not a widget.

- **Neck:** true fret geometry (`x(n) = 1 − 2^(−n/12)`), standard tuning E A D G B E, inlays at 3/5/7/9/12 (double)/15.
- **Choose a chord** (root × quality × inversion). The engine returns a playable voicing; the neck shows it with interval labels.
- **Choose a progression** (ii–V–I in C, ii–V–I in F, Andalusian in A minor, minor blues in D). Every chord in the progression is voiced on the same neck, and the **ledger** shows per-string movement, held tones, and total semitone travel.
- **Scale layer:** the recommended mode for the *current chord* is drawn as outlined scale tones under the chord shape, with the reason printed ("D Dorian contains all four chord tones and avoids the ♭6 that sits a semitone above the 5th").
- **Sound:** an optional plucked-string voice (Karplus–Strong in Web Audio, no assets), off by default, enabled by an explicit toggle. Never autoplays.
- **Accessibility:** the neck is `aria-hidden`; a synchronized text table (string, fret, note, degree, role) carries the same information; all controls are real buttons/radios; arrow keys move the chord root; `Esc` clears the selection.

The interaction is memorable because it *teaches something true*: you can hear/see why Dm7–G7–Cmaj7 works.

---

## 9. Responsive strategy

| Breakpoint | Behaviour |
|---|---|
| ≥1440 | 12-col grid, measure rail visible, hero neck full-bleed, lab shows 15 frets |
| 1024–1439 | 12-col, rail hidden, hero neck scaled, lab 12 frets |
| 768–1023 | 8-col, annotation rail moves below content, lab 9 frets with position control |
| <768 | 4-col, single measure (min 30rem), hero neck becomes a 0–7 fret crop with "extend" control, lab horizontally scrollable **with** a sticky fret-range indicator and a visible "drag" affordance; tables become per-string cards |

Mobile keeps musical information: never fewer than 4 strings or 5 frets visible, and never hides the interval labels silently (they collapse to a toggle that defaults on).

---

## 10. Accessibility commitments

- Semantic landmarks (`header/nav/main/footer`), one `h1` per route, ordered headings.
- Visible focus: 2px `--oxblood` outline with 3px offset on paper, `--brass-bright` on ink.
- All interactive targets ≥44×44px.
- Skip link to `#main`.
- Dynamic announcements via `aria-live="polite"` for chord changes in the lab.
- No hover-only information.
- Reduced-motion honoured globally and per-component.
- Contrast documented; automated axe pass plus manual keyboard walk.

---

## 11. What survives from the current build

- All routes and their URLs; all commerce, cart, audio-player, and academy-access logic.
- Photography (re-cropped).
- The warm paper/ink material decision (kept, but re-tuned and de-luxurified).
- `Reveal`, `Marquee`, `FormationsShowcase`, `ServicesShowcase`, `BookingBand` (restyled, not rewritten).
- The theory modules recovered from the repository's staged history (restored under `src/lib/theory/`) — the musical source of truth.

## 12. What is removed

- Gradient text, diamond ornaments, `PLATE 0X —` labels on every section, `letter-spacing: .3em` on all metadata, the "luxury" vocabulary in class names where it leaks into markup.
- The WebGL atelier backdrop (401 lines of canvas for a barely visible effect) — replaced by CSS light and real material.
- Full-page transition wrappers that delay content.
- Any text that claims achievements we cannot verify.

---

## 13. Quality bar for release

1. First viewport communicates: guitarist/composer, Marrakech, what you can do here (hear, learn, play, book), in under 5 seconds.
2. Every route shares the type/colour/rule system; no page looks like a different site.
3. The lab is musically correct on the four documented progressions and passes its regression tests.
4. Keyboard-only path exists for every primary journey.
5. Mobile is composed, not compressed: no horizontal overflow, no 8px text, no hidden controls.
6. `pnpm build` and `tsc --noEmit` clean; lint clean on touched files.
