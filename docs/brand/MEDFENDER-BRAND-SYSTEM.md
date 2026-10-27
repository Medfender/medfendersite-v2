# MEDFENDER — BRAND DESIGN SYSTEM
## "The Geometric Skeleton & Liquid Soul"

> Jimi Hendrix liquid-light psychedelia × Moroccan Zellige craftsmanship ×
> Fender American Deluxe Stratocaster geometry.

**Status:** Living document. The machine-readable implementation lives in
`src/styles/brand-tokens.css` and `tools/brand_assets_generator.py`. This
document is the *reasoning* behind every number in those files. If they ever
disagree, the code is wrong.

---

## 0. THE THREE BRAND PRINCIPLES, OPERATIONALISED

| Principle | Operational rule | Enforced by |
|---|---|---|
| **Craft over Haste** | No line, angle, colour or duration ships without a stated structural or harmonic purpose. | Every token in `brand-tokens.css` carries an inline comment stating its job. |
| **Fusion, Not Compromise** | The two forces must *clash* in the same frame. Zellige geometry is **razor-sharp and never blurred**; the Hendrix layer is **fluid and never straightened**. They are never averaged. | The Zellige layer receives no displacement filter. The Hendrix layer receives no geometric correction. |
| **Dark-First Luxury** | Obsidian occupies ~80% of every screen. Luminous accents are scarce and precious. Crimson appears **once** per composition. | `--med-obsidian` is the page background; the only non-obsidian large fields are glass and the Zellige pattern itself. |

### The decisive tension

Most brands in this territory fail in one of two ways: they blur the Zellige
into "generic sacred geometry clipart", or they let the psychedelic layer
dissolve the structure into mush. Medfender's defence is a **separation of
concerns enforced by render layer**:

```
  layer 7   vignette / velvet grain          ← texture
  layer 6   LIQUID SOUL  (cobalt→purple)     ← chaotic, turbulent, never geometric
  layer 5   THE STRAT (knocked out)           ← the void; never drawn
  layer 4   gold arris + strapwork hairlines ← specular, razor-sharp
  layer 3   12-POINT ROSETTE                  ← razor-sharp, exact
  layer 2   crimson harmonic core             ← the single point of heat
  layer 1   obsidian field                    ← the void the brand is lit out of
```

The Zellige layers (2–4) are **geometrically exact** and carry no filter. The
Hendrix layer (6) carries a two-band turbulence and is never used to define a
shape. The Strat (5) exists only as *absence* in layers 3–4.

---

## 1. MASTER PATTERN & VISUAL ASSET SPECIFICATIONS

### 1.1 ANATOMY — central 12-point Zellige star radiating into fluid swirls

#### 1.1.1 The construction law

The 12-point rosette is **not drawn by eye**. It is the union of two
overlapping regular hexagons rotated 30° from each other.

```
  outer tip   k:  angle = 15° + k·30°,  radius = R
  inner vertex: angle = 15° + k·30° + 15°, radius = R · cos(30°)/cos(15°)
                                                  = 0.896575 · R
```

This ratio (**0.896575**) is the single most important number in the
identity. It was validated against three alternatives by A/B render and
local-vision review:

| Variant | Ratio | Verdict |
|---|---|---|
| **A — hexagon union** | **0.896575** | **Adopted.** Most authentic, seamless, best "dark-first luxury". |
| B — softened | 0.86 | More generic, less hand-cut. |
| C — sharpened | 0.82 | Aggressively sharp, reads busy when tiled, loses the khatim character. |

The 8-point *safa* is two overlapping squares rotated 45°:
ratio = cos(45°)/cos(22.5°) = **0.765367**.

**The ratio is the proof.** Anyone who asks "why 12 points?" gets an answer
that is a construction, not a preference.

#### 1.1.2 Layer-by-layer anatomy (hero core, canvas 1000 × 1000)

| # | Layer | Radius / extent | Fill | Purpose |
|---|---|---|---|---|
| 1 | Obsidian field | full canvas | `--med-obsidian-field` radial | Cinematic depth. The void. |
| 2 | Crimson harmonic core | r = 90 (9% canvas) | crimson radial gradient, glow | The single focal heat. Represented once, always. |
| 3 | **12-point rosette** | R = 300 (30% canvas) | 12 rhombic tesserae | The structural skeleton. |
| 3a | ↳ tessera colour rhythm | — | 4-fold rhythm in 12-fold symmetry | The rosette's colour circulates: deep cobalt → light cobalt → royal purple → light purple, repeating three times. |
| 3b | ↳ gold knot | r = 0.30 R | burnished gold | Locks the centre; carries the metallic specular. |
| 4 | Inner 8-point skeleton | r = 0.52 R = 156 | gold hairline 2.2px | The secondary sacred polygon. Reads as a second order of structure. |
| 5 | 12 strapwork spokes | tip → adjacent edge midpoint | gold hairline 1.8px | Interlace. Connects the tesserae into one object. |
| 6 | 8-point safa ring | centres at r = 395, star r = 88 | cobalt tesserae + gold knot | Extends the lattice outward; proves the pattern continues past the crop. |
| 7 | **Liquid soul** | inner 205 → outer 420–720 | cobalt→purple, 34 splines | The flowing counter-force. |
| 8 | **The Strat** | length 600 (60% canvas) | *void* | The hidden instrument. |
| 9 | Velvet grain + vignette | full canvas | turbulence | Tactile depth. |

#### 1.1.3 The liquid soul — how the swirls are built

The swirls are **34 cubic Bézier splines** radiating outward from r = 0.205
of the canvas, each with:

* a start angle on the rosette's tip ring,
* ±4.5° of seeded angular jitter (±18° at the far end),
* a far radius drawn from 0.42–0.72 of the canvas,
* a stroke width from 1.0%–4.5% of the canvas,
* opacity 0.30–0.72,
* alternating cobalt→purple and purple→violet gradients.

They are rendered through a **two-band turbulence filter**:

```
  feTurbulence  baseFrequency 0.007 0.011   numOctaves 3   → slow swell
  feTurbulence  baseFrequency 0.055 0.075   numOctaves 2   → fine bleed
  feDisplacementMap  scale = 34·0.35        → the swell displaces the bleed
  feDisplacementMap  scale = 34             → displaces the source
  feGaussianBlur   stdDeviation 0.9
```

The single-band version (the first draft) read as "high-end digital paint
stroke". The two-band version reads as **pigment dispersing in water**. This
was the difference between "luxury" and "sophisticated" in review.

**The swirls may never touch the tessera edges.** They pass *behind* the
Zellige layer. Where liquid meets geometry, geometry wins — that is the
entire thesis of the brand.

---

### 1.2 NEGATIVE SPACE ILLUSION RULES — the Stratocaster

This is the highest-risk element in the identity. A Stratocaster that reads
as a guitar *drawn on top of* a pattern is a logo mistake. One that reads as
a guitar *found inside* the pattern is a masterstroke. These ten rules are
the difference.

#### Reference geometry (Fender American Deluxe Stratocaster)

| Dimension | Inches | Normalised |
|---|---|---|
| Body length | 18.10 | 46.71% of overall |
| Body width | 12.60 | body ratio **1.437 : 1** |
| Overall length | 38.75 | overall ratio **3.075 : 1** |
| Headstock length | 8.75 | 22.58% of overall |
| Headstock width | 6.40 | 50.79% of body width |
| Headstock back-angle | 14° | — |
| Scale length | 25.50 | — |
| Nut width | 1.6875 | — |

The contour used in the assets is **faceted**: every segment is a straight
edge at 30°, 45° or 60°, so the guitar's curves are resolved into a
sequence of chamfers. The treble-side upper horn is extended and pointed;
the bass-side horn is shorter and blunter — the asymmetry is what makes it
read as a *Strat* and not a generic guitar.

#### THE TEN RULES

1. **The void rule.** The instrument exists only as absence. It is produced
   by a `<mask>` that punches the silhouette out of the tessera layer. It is
   *never* stroked, never filled, never outlined.

2. **The grout rule.** The void channel must be the *same width* as the
   grout between tesserae (±0 px). The Strat must read as one more channel
   in the tessellation, not as a hole punched through it. A wider void reads
   as a cut-out; an equal-width void reads as structure.

3. **The facet rule.** Every contour segment lies on a Zellige-legal angle
   (15° / 30° / 45° / 60° / 90°). No curved edges. A curve would betray the
   drawing; a facet set looks like it was *cut*.

4. **The registration rule.** Horn tips and the waist terminations must land
   **exactly on tessera vertices** — never on an edge, never floating inside
   a tessera. A tip that lands on a vertex looks structural; a tip that
   lands mid-tessera looks accidental.

5. **The scale rule.** The instrument spans **at most one rosette cell**
   (≤ 1 tessera unit) and never crosses more than two rosettes. Above that
   scale the illusion inverts: the viewer stops seeing the pattern and starts
   seeing a guitar. Sub-scale, the pattern dominates and the guitar is a
   texture. The illusion lives only in the narrow band between.

6. **The void-to-solid ratio.** The void occupies **18–25%** of the local
   cell area. Below 18% it disappears. Above 25% it reads as a cut-out.
   Measured on the shipped `medfender-strat-negative.svg`: **21.4%**.

7. **The rotation rule.** The instrument is rotated **−8°** off the lattice
   axes. A perfectly aligned instrument reads as a diagram. An off-axis
   instrument reads as an accident of the pattern — which is the entire
   ambition.

8. **The lighting rule.** One key light at **135° (north-west)**. Only the
   *south-east* walls of the void catch a gold arris highlight (a clipped
   stroke, 0.42% of canvas width). The void is **engraved**, not drawn: it
   has one lit wall and three dark walls. Highlighting the whole contour
   destroys the illusion instantly.

9. **The frequency rule.** The instrument appears **once per composition**.
   Repeated, it becomes wallpaper. Singular, it becomes a discovery.

10. **The legibility threshold.** Below **120 px** of total length the
    instrument is not legible. At that size, drop it entirely and use pure
    geometry. An illegible hidden guitar is noise; the eye will hunt for a
    shape it cannot resolve and read the whole composition as broken.

#### Verified outcome

Local-vision review of the shipped asset returned: *"the Strat emerges from
the tile gaps… it feels inherent to the pattern… the instrument is growing
out of the tilework itself."* This is rule 1 and rule 9 working.

---

### 1.3 DIMENSIONALITY & TEXTURES

The identity is rendered as **glazed fired ceramic suspended in velvet**.
Four surface treatments, applied in a fixed order:

#### 1.3.1 Obsidian / Midnight Black velvet depth

* Base: `--med-obsidian` #0B0F19 over a radial field to `--med-obsidian-deep`
  #05070D (72% ellipse at 50%/42%).
* **Velvet grain:** `feTurbulence type="fractalNoise" baseFrequency="0.85"
  numOctaves="4" seed="11"`, luminance-only, alpha 0.055, over the whole
  canvas at 0.9 opacity. The grain is *light*, not dark — it reads as the
  nap of the pile catching a light from above, never as noise.
* **Vignette:** a 6%-of-canvas `--med-obsidian-deep` stroke at 0.55 opacity.
  Cinematic, and it pushes the eye to the rosette.

#### 1.3.2 Burnished gold / brass specular highlights

Gold is **never a fill**. It is an arris — the 1–2 px lit edge where a
glazed tessera turns away from the key light.

* The arris gradient runs 135° (matching the key light): `#F5D6A8` at 0.9
  opacity → `#F5D6A8` at 0.12 by 38% → transparent.
* Applied as a `stroke` on the *same path* as every tessera fill, 1.8 px in
  the tile, 0.32% of canvas in the hero. It follows the tessera's own
  bounding-box gradient, so the highlight always falls on the upper-left
  edge regardless of where the tessera sits.
* For large type and the logotype, gold uses the **five-stop metallic ramp**
  `--med-gold-gradient`: `#6E4A1C → #D4A574 → #F5D6A8 → #D4A574 → #6E4A1C`.
  The double-dark ends are what make it read as turned metal rather than
  flat paint.

#### 1.3.3 Iridescent Hendrix Royal Purple light response

Purple is the *iridescence*, not the pigment. It appears as:

* a gradient terminus on every liquid spline (`#7B2FBE → #A855F7`),
* the 2-of-4 colour slot in the rosette rhythm,
* the fill of the 12-point star inlays inside the logotype's `d` counters,
* a 0.24 alpha outer glow (`--med-shadow-purple`).

The iridescent quality comes from **two purples meeting at a gradient seam**,
never from a single flat purple. A flat purple is a colour; a seam between
two purples is a light.

#### 1.3.4 Fired-glaze surface grain

The tesserae are ceramic, not vector. A `feTurbulence` grain pass at 0.7
frequency / 4 octaves, alpha 0.09, sits over the tile plane. It is
deliberately *not* applied as a displacement — the geometry stays razor-sharp
while the surface gains tooth. This is the resolution of the central
apparent conflict in the brief: *sharpness* comes from the edge, *texture*
comes from the surface, and the two are independent.

#### 1.3.5 The seamless-tile rule

A repeating tile that carries a **directional gradient** will always show a
seam, because a gradient's value at the left edge of the tile is not its
value at the right edge. The glaze therefore obeys a hard rule:

> **The glaze is radial, never directional.** Its last stop is reached at
> `r = 50%`, so every edge and corner of the tile carries an identical value
> and the sheet tiles invisibly. Directional light belongs to the *page plane*
> (`.med-glaze`), never to a repeating cell.

The grain obeys the matching rule: `feTurbulence` must be pinned to a
user-space filter region (`filterUnits="userSpaceOnUse"`, `x=0 y=0`) with
`stitchTiles="stitch"`, so the noise continues across the boundary instead of
restarting at it.

This is verified numerically, not by eye. The test:

```
seam_transition = |column(x+1) − column(x)| at the tile boundary
z = (seam_transition − mean(interior transitions)) / std(interior transitions)
```

A seamless tile scores **|z| < 1** — the boundary is statistically
indistinguishable from an interior transition. The measured result for
`medfender-zellige-tile.svg` after the fix:

| Axis | Before | After | Threshold |
|---|---|---|---|
| Column seam | z = +1.38 | **z = +0.35** | < 1 |
| Row seam | z = +2.49 | **z = +0.11** | < 1 |
| Brightness step | — | z = +0.50 / +0.61 | < 1 |

Note that a correctly tiled Zellige field *does* contain long straight
lines — the 12-fold spokes of the corner rosettes continue across the
boundary by construction. That is structural continuity, not a seam. A seam
is a **brightness discontinuity**: a step in value where the pattern should
continue.

---

## 2. TYPOGRAPHY & CUSTOM LOGOTYPE ARCHITECTURE

### 2.1 The logotype construction grid

The wordmark is a **geometric monoline construction**, not a typeface. Every
curve is a true arc on the grid; every stem is a single stroke.

```
  em                    100 units
  cap height            100
  x-height               70
  ascender             100   (the 'd' and 'f' reach cap height)
  baseline                0   (no descenders — "Medfender" has none)
  stroke weight          11   (11% of cap height)
  terminal               square
  join                   miter
```

### 2.2 Glyph construction table

| Glyph | Advance | Construction | Micro-pattern | Tone |
|---|---|---|---|---|
| **M** | 92 | Two verticals + a 45° double diagonal, apex at 46% cap height | two 8-point stars, r = 13, in the lower counters | royal purple |
| **e** | 70 | Ovoid bowl (rx 35, ry 34.2 — 2.8% off circle) + full-width bar + 45° terminal | **none — deliberately clean** | — |
| **d** | 70 | Ovoid bowl + full-height right stem | 12-point star, r = 27, centred in the counter | burnt crimson |
| **f** | 46 | Stem + 22-unit quarter-circle hook + crossbar | 12-point star, r = 6.5, at (7.25, 30) — **punched as a void** | obsidian void + lit arris |
| **n** | 60 | Left stem + 30-unit semicircular shoulder + right stem | 12-point star, r = 22, in the counter | royal purple |
| **r** | 34 | Stem + 28-unit quarter-arc arm | none | — |

**Why `e` is left clean.** "Medfender" contains three `e`s. They are the
resonance of the word — the vowels the eye rests on. Filling every counter
with a star would turn the wordmark into a texture and destroy the
legibility of the most repeated letter. The stars are rationed: they appear
only in `M`, `d`, `f` and `n`. Restraint is the luxury signal.

**Why `f` carries a void, not a fill.** The `f` crossbar is gold. A gold star
on a gold bar is invisible, so the inlay is punched out of the bar instead —
filled with obsidian-deep and given a `GOLD_LIGHT` arris on its edge. The
ornament is a hole that catches the light, not a brighter patch of the same
metal. Its radius is 6.5 and it sits at (7.25, 30), on the left arm of the
crossbar, clear of both the stem and the hook.

**Why `n` is r = 22, not 26.** At r = 26 the star's points crossed the
shoulder stroke. The counter of an `n` is a shallow crescent, not a circle:
the star has to be rationed to fit the void it lives in.

**Why the bowls are ovoid, not circular.** A perfect circle is a Futura
stencil; it reads boxy and mechanical against the fluid Zellige field. 2.8%
off-circle is below the threshold of conscious notice but above the threshold
of felt coldness. The letterform is structurally exact and psychologically
warm — which is exactly the brand thesis.

### 2.3 Tracking, kerning, weight distribution

**Tracking:**

| Context | Tracking | Rationale |
|---|---|---|
| **Primary wordmark** | **0.30 em** | The luxury lockup. 30% of the cap height of air between glyphs. At cap height 160 px the wordmark ink measures 1300.8 × 160 — a ratio of **8.13 : 1**. |
| Compact lockup (favicon, app icon, nav strip) | 0.06 em | 8.13 : 1 becomes illegible below ~14 px cap height. The compact lockup drops the advance to 621 units (6.21 : 1) and is the mark the navigation bar ships. |
| Eyebrow / overline labels | 0.25 em, uppercase | Ties to the wordmark's air without copying it. |
| Body copy | 0 em | Never track body text. |

**Kerning — the four manual pairs.** The grid advance is the default; these
four pairs override it:

| Pair | Adjustment | Reason |
|---|---|---|
| `M` → `e` | **−0.04 em** | The M's 45° diagonal overshoots its advance into the `e`'s sidebearing. Without this the pair reads as two separate letters. |
| `d` → `e` | +0.02 em | The `d` bowl is a full circle; it needs air against the `e` bar. |
| `e` → `r` | −0.02 em | The `e`'s 45° terminal reaches right; the `r` arm needs clearance from the *next* glyph, not this one. |
| `f` → `e` | −0.05 em | The `f` hook is the widest element of its glyph and overhangs its advance by design. |

**Weight distribution.** Monoline throughout — this is a non-negotiable
constraint of the construction, not a style choice. The perceived weight
variation comes from three places only: stroke density (the `M` and `n` are
locally denser), the metallic gradient (the light side of each stroke reads
heavier), and the ink waver (§2.5).

### 2.4 Type tiers

| Tier | Font | Size | Tracking | Weight | Case |
|---|---|---|---|---|---|
| Display | display serif | `--med-font-6xl` → `--med-font-7xl` | 0 | 400 | Sentence |
| Wordmark | SVG lockup | cap 96–160 px | 0.30 em | monoline 11 | Medfender |
| Sub-display | display serif | `--med-font-4xl` | −0.02 em | 400 | Sentence |
| Eyebrow | body sans | `--med-font-xs` | 0.25 em | 500 | UPPER |
| Body | body sans | `--med-font-md` | 0 | 400 | Sentence |
| Caption | body sans | `--med-font-sm` | 0.05 em | 400 | Sentence |
| Data | mono | `--med-font-sm` | 0 | 400 | — |

### 2.5 The ink waver — where the fluid enters the letterforms

The logotype's *skeleton* is exact. Its *edge* is not.

```
  feTurbulence type="fractalNoise" baseFrequency="0.021" numOctaves="2" seed="3"
  feDisplacementMap in="SourceGraphic" scale="1.7"
                      xChannelSelector="R" yChannelSelector="G"
```

A 1.7-unit waver on a 100-unit em. At the shipping cap height of 160 px that
is **2.7 px** of irregularity — visible as hand-drawn energy, invisible as
error. Review verdict: *"the waver prevents the logo from feeling like a
sterile, vector-perfect stamp."* It is the mechanism that lets a razor-sharp
Zellige identity carry 1960s line-art warmth without blurring either.

**Never increase the waver above 3 units.** At 3+ the logotype reads as
melted. At 1.7 it reads as drawn.

---

## 3. COLOUR SYSTEM & LIGHTING ENGINE

### 3.1 The five core palette elements

CMYK is the naive sRGB→CMYK conversion (no ICC compensation) — a print
target, not a press separation.

#### ① Obsidian / Midnight Black — *Cinematic Base & Depth*
*Role:* the void the brand is lit out of. ~80% of every screen.

| Token | Hex | RGB | CMYK |
|---|---|---|---|
| `--med-obsidian` | `#0B0F19` | 11, 15, 25 | 56, 40, 0, 90 |
| `--med-obsidian-deep` | `#05070D` | 5, 7, 13 | 62, 46, 0, 95 |
| `--med-obsidian-raised` | `#141A2B` | 20, 26, 43 | 53, 40, 0, 83 |

#### ② Hendrix Royal Purple — *Iridescent Accent*
*Role:* the soul. Gradient terminations, iridescent rim light, royal-paisley
motifs. Never body copy.

| Token | Hex | RGB | CMYK |
|---|---|---|---|
| `--med-purple` | `#7B2FBE` | 123, 47, 190 | 35, 75, 0, 25 |
| `--med-purple-light` | `#A855F7` | 168, 85, 247 | 32, 66, 0, 3 |
| `--med-purple-deep` | `#3B1D6E` | 59, 29, 110 | 46, 74, 0, 57 |

#### ③ Electric Cobalt Blue — *Primary Kinetic Energy*
*Role:* movement, and the default interactive accent.

| Token | Hex | RGB | CMYK |
|---|---|---|---|
| `--med-cobalt` | `#1B4DE4` | 27, 77, 228 | 88, 66, 0, 11 |
| `--med-cobalt-light` | `#4C8DFF` | 76, 141, 255 | 70, 45, 0, 0 |
| `--med-cobalt-deep` | `#0E2A7A` | 14, 42, 122 | 89, 66, 0, 52 |

#### ④ Burnt Crimson — *Focal Point Harmonic Energy*
*Role:* the singular heat. Always scarce; one focal point per composition.

| Token | Hex | RGB | CMYK |
|---|---|---|---|
| `--med-crimson` | `#9B2226` | 155, 34, 38 | 0, 78, 75, 39 |
| `--med-crimson-light` | `#E4515A` | 228, 81, 90 | 0, 64, 61, 11 |
| `--med-crimson-deep` | `#4A0E14` | 74, 14, 20 | 0, 81, 73, 71 |

#### ⑤ Burnished Gold / Brass — *Luxury Specular Highlight*
*Role:* the arris. Specular edges, hairline inlay, fine type. Never a fill.

| Token | Hex | RGB | CMYK |
|---|---|---|---|
| `--med-gold` | `#D4A574` | 212, 165, 116 | 0, 22, 45, 17 |
| `--med-gold-light` | `#F5D6A8` | 245, 214, 168 | 0, 13, 31, 4 |
| `--med-gold-deep` | `#6E4A1C` | 110, 74, 28 | 0, 33, 75, 57 |

### 3.2 The accessibility contract (measured, not assumed)

WCAG 2.1 contrast against `--med-obsidian` (#0B0F19):

| Colour | Ratio | Grade | Permitted use |
|---|---|---|---|
| `--med-gold-light` | 13.74 : 1 | AAA | text at any size |
| `--med-gold` | 8.60 : 1 | AAA | text at any size |
| `--med-cobalt-light` | 5.98 : 1 | AA | text at any size |
| `--med-crimson-light` | 5.13 : 1 | AA | text at any size |
| `--med-purple-light` | 4.84 : 1 | AA | text at any size |
| `--med-cobalt` | 2.94 : 1 | **FAIL** | graphics / large type (≥ 24 px) only |
| `--med-purple` | 2.73 : 1 | **FAIL** | graphics / large type (≥ 24 px) only |
| `--med-crimson` | 2.42 : 1 | **FAIL** | graphics / large type (≥ 24 px) only |

> **RULE — the base-colour ban.**
> `--med-purple`, `--med-cobalt` and `--med-crimson` are **never** used for
> body copy, UI labels, or any text under 24 px. Only their `-light`
> variants are permitted as text on the obsidian base. This is the single
> most common way a brand system like this breaks in production, so it is
> written into the token file as `--med-text-*` roles rather than left to
> memory.

`--med-gold` is the only base colour that may carry body text. This is why
gold is the hover colour throughout the site — it is the one jewel tone that
survives the contrast test at every size.

### 3.3 Light mode — the Alabaster inversion

The identity **inverts, it does not lighten**. Obsidian becomes Alabaster
(#F4F1EA) and the jewel tones deepen so they hold their contrast on a light
field. Measured on `#F4F1EA`: purple-deep 11.73 : 1, cobalt-deep 11.42 : 1,
crimson 7.02 : 1, gold-deep 7.00 : 1, ink 16.98 : 1.

| Token | Dark | Light | Rationale |
|---|---|---|---|
| base | `#0B0F19` | `#F4F1EA` | obsidian ⇄ alabaster |
| deep | `#05070D` | `#E6E0D4` | shadow ⇄ shadow |
| raised | `#141A2B` | `#FFFFFF` | glass ⇄ glass |
| purple | `#7B2FBE` | `#5E1E93` | deepened for AA on light |
| cobalt | `#1B4DE4` | `#12379E` | deepened for AA on light |
| crimson | `#9B2226` | `#7E1A1D` | deepened for AA on light |
| gold | `#D4A574` | `#8A5F28` | deepened for AA on light |

**The liquid soul does not survive the inversion.** In light mode the
Hendrix layer is dropped to 25% opacity and the Zellige layer carries the
composition. Liquid light requires darkness to exist.

### 3.4 UI interaction states

Every interactive element declares all five states. **Hover is a lift in
light, never a colour swap** — a colour swap breaks the illusion that the
object is a physical object in a lit space.

| State | Treatment | Duration |
|---|---|---|
| **Rest** | base fill; `--med-border-default` hairline | — |
| **Hover** | `translateY(-2px)`, `--med-shadow-raised`, border → `--med-border-gold`, accent colour → gold | 150 ms |
| **Active** | `translateY(1px)`, brightness 0.94, shadow collapsed to inset | 150 ms |
| **Focus-visible** | 2 px solid `--med-border-focus` (gold-light), 3 px offset | instant |
| **Disabled** | opacity 0.38, no shadow, no transform | — |

**Focus is gold, not cobalt.** Gold is the only jewel tone that passes AA at
every size, and focus rings must be legible at every size. Cobalt is
reserved for *selection* (`::selection` uses `--med-purple-deep`).

### 3.5 The lighting engine

One key light, fixed, at **135° (north-west)**. Shadows cast to the
south-east. Every specular arris in the identity follows this rule; if a
highlight appears on the wrong side of a form, it is wrong.

```
  --med-light-key:  135deg
  --med-light-fill: 315deg
```

* **Gold arris gradient** runs 135°: bright at the upper-left, transparent by
  38%, absent thereafter.
* **Shadows** are near-black with high alpha (0.55) and large blur
  (−12 px): the shadow of a large object in a dark room, not a UI drop
  shadow.
* **Glows** (purple 0.24, cobalt 0.30, crimson 0.28, gold 0.16) are outer
  light, not inner. They are used on focus and on the harmonic core only.

---

## 4. SVG LAYOUT & VECTOR BLUEPRINT

### 4.1 Asset manifest

| File | Size | Purpose |
|---|---|---|
| `public/brand/medfender-core.svg` | 1000×1000 | Hero core — rosette, liquid soul, Strat void. |
| `public/brand/medfender-zellige-tile.svg` | 240×240 | **Seamless** repeating pattern. `background-repeat`. |
| `public/brand/medfender-monogram.svg` | 512×512 | M-in-rosette. Avatar, hero mark, large-format emblem. |
| `public/brand/medfender-monogram-outline.svg` | 512×512 | Gold-line version of the monogram, for reverse fields. |
| `public/brand/medfender-wordmark.svg` | 1318.4×208 | Primary wordmark with counter inlays. |
| `public/brand/medfender-lockup.svg` | 1445.12×320 | **Primary lockup.** Rosette + wordmark, 0.55 em gap, cap 128. |
| `public/brand/medfender-lockup-compact.svg` | 1199.36×320 | Compact lockup — same construction, tracking 0.06 em. The navigation bar ships this. |
| `public/brand/medfender-icon.svg` | 512×512 | App icon — the monogram lit out of the obsidian field. |
| `public/brand/medfender-favicon.svg` | 512×512 | Small-size mark — the twelve-point star silhouette. |
| `public/brand/medfender-strat-negative.svg` | 900×900 | The negative-space study — the reference for rule compliance. |

All are generated by `tools/brand_assets_generator.py`. **Do not hand-edit
them.** Change the generator, regenerate, review.

The generator also writes `src/components/brand/brand-assets.ts` — the typed
manifest the React layer reads for asset paths and intrinsic sizes, so a stale
dimension can never reach the DOM. `tools/make_favicon.py` packs the same
star into `src/app/favicon.ico` (16 / 32 / 48), `src/app/icon.svg` and
`src/app/apple-icon.png`.

**Why the favicon is not the monogram.** Below ~24 px the rosette's twelve
tesserae stop separating and the emblem turns into a purple-blue blob with a
gold speck in it. The favicon is therefore a separate, single-weight mark:
the twelve-point star silhouette in gold on obsidian. At 16 px it still
reads as a radiating star; the monogram at 16 px does not read as an M.

### 4.1.1 The lockup in the product

| Surface | Variant | Rendered height |
|---|---|---|
| Navigation bar | `lockup-compact` | 40 px (cap ≈ 16 px) |
| Footer | `lockup` | 54 px (cap ≈ 21 px) |
| Brand specimen | `lockup` + `lockup-compact` | fluid |
| Favicon / app icon | `favicon` / `icon` | 16–48 px / 180 px |

### 4.2 The 12-point core geometry, in SVG

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
  <defs>
    <!-- Two-band turbulence: slow swell + fine bleed = ink in water -->
    <filter id="liquid" x="-30%" y="-30%" width="160%" height="160%">
      <feTurbulence type="fractalNoise" baseFrequency="0.007 0.011"
                    numOctaves="3" seed="7" result="n1"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.055 0.075"
                    numOctaves="2" seed="10" result="n2"/>
      <feDisplacementMap in="n1" in2="n2" scale="11.9"
                         xChannelSelector="R" yChannelSelector="G" result="d1"/>
      <feDisplacementMap in="SourceGraphic" in2="d1" scale="34"
                         xChannelSelector="R" yChannelSelector="G"/>
      <feGaussianBlur stdDeviation="0.9"/>
    </filter>

    <!-- The Strat exists only as absence: white field, black silhouette -->
    <mask id="strat-void" maskUnits="userSpaceOnUse">
      <rect width="1000" height="1000" fill="#fff"/>
      <g fill="#000" transform="translate(200,0) rotate(-8 500 500)">
        <path d="…"/>  <!-- body -->
        <path d="…"/>  <!-- neck  -->
        <path d="…"/>  <!-- headstock, swept back 14° -->
      </g>
    </mask>
  </defs>

  <!-- 1. the void -->
  <rect width="1000" height="1000" fill="url(#obsidian-field)"/>

  <!-- 2. the liquid soul — behind geometry, never defining it -->
  <g filter="url(#liquid)">
    <path d="M … C … C … C …" fill="none" stroke="url(#liquid-cobalt)"
          stroke-width="34" stroke-linecap="round" opacity="0.52"/>
    <!-- 34 splines total -->
  </g>

  <!-- 3. the crimson harmonic core — the only heat -->
  <circle cx="500" cy="500" r="90" fill="url(#crimson-core)"
          opacity="0.55" filter="url(#glow)"/>

  <!-- 4. the skeleton, with the Strat punched out of it -->
  <g mask="url(#strat-void)">
    <!-- 12 rhombic tesserae: centre, inner vertex, tip, inner vertex -->
    <path d="M 500,500 L … L … L … Z" fill="url(#royal-purple)"
          stroke="#05070D" stroke-width="6" stroke-linejoin="round"/>
    <!-- the specular arris on the SAME path -->
    <path d="M 500,500 L … L … L … Z" fill="none" stroke="url(#arris)"
          stroke-width="3.2" stroke-linejoin="round"/>
    <!-- inner 8-point skeleton -->
    <path d="…" fill="none" stroke="#F5D6A8" stroke-width="2.2" opacity="0.75"/>
  </g>
</svg>
```

### 4.3 CSS variables — Dark Mode (Obsidian) and Light Mode (Alabaster)

```css
:root {                                   /* DARK — obsidian base */
  --med-obsidian: #0B0F19;
  --med-purple:    #7B2FBE;
  --med-cobalt:    #1B4DE4;
  --med-crimson:   #9B2226;
  --med-gold:      #D4A574;

  --med-text-primary:   #F5F6FA;   /* 17.1:1 */
  --med-text-secondary: #A8B0C4;   /*  8.4:1 */
  --med-text-accent:    var(--med-gold);
  --med-text-cobalt:    var(--med-cobalt-light);  /* 5.98:1 — not --med-cobalt */
}

[data-theme="light"] {                   /* LIGHT — alabaster inversion */
  --med-obsidian: #F4F1EA;
  --med-purple:    #5E1E93;
  --med-cobalt:    #12379E;
  --med-crimson:   #7E1A1D;
  --med-gold:      #8A5F28;

  --med-text-primary:   var(--med-ink);        /* 16.98:1 */
  --med-text-secondary: var(--med-ink-soft);   /*  8.77:1 */
  --med-text-accent:    var(--med-gold-deep);  /*  7.00:1 */
}
```

Full token file: `src/styles/brand-tokens.css` (single source of truth).

### 4.4 Using the pattern in the app

```css
.hero {
  background-image: url("/brand/medfender-zellige-tile.svg");
  background-size: 240px 240px;   /* must equal --med-zellige-tile */
  background-repeat: repeat;
}
```

The tile is **provably seamless**: every tessera is generated from the same
lattice, and the tile's corners carry quarter-rosettes that complete across
the repeat boundary. Verified by A/B render — no visible seam at any
repeat offset.

---

## 5. AI GENERATION PROMPTS

See **[`docs/brand/AI-PROMPTS.md`](./AI-PROMPTS.md)** for the tuned
Midjourney v6 and DALL-E 3 prompt library: seamless tiles, hero wallpapers,
merchandise mockups, and the negative-prompt set that keeps generative
output inside the identity.

---

## 6. GOVERNANCE

### Do

* Use `tools/brand_assets_generator.py` to change any vector asset.
* Run `python tools/vision_check.py <render.png>` — **local Ollama only** —
  for visual review of any brand asset.
* Quote the exact hex values. "Royal purple" is not a spec.
* Keep crimson singular per composition.

### Don't

* Don't blur, distort, rotate or scale the Zellige tesserae individually.
* Don't place the liquid layer above the geometry.
* Don't outline the Strat.
* Don't use `--med-purple`, `--med-cobalt` or `--med-crimson` for body text.
* Don't repeat the Strat within one composition.
* Don't tint the gold. Gold is `#D4A574` or it is not gold.

### The one-line test

> *Would a Moroccan zellige master and a Fillmore poster artist recognise
> each other's hand in this?*

If not, the fusion has become compromise.
