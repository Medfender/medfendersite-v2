# MEDFENDER — AI IMAGE GENERATION PROMPT LIBRARY
## Midjourney v6 & DALL-E 3

> Companion to [`MEDFENDER-BRAND-SYSTEM.md`](./MEDFENDER-BRAND-SYSTEM.md).
> Read §1 (anatomy), §3 (colour) and §4 (vector blueprint) first — these
> prompts are for the imagery the vector system *sets up*, not a replacement
> for it.

### House rules for every prompt in this file

1. **State the palette in hex.** Generators weight named colours loosely.
   Include `#0B0F19 #7B2FBE #1B4DE4 #9B2226 #D4A574` explicitly. It anchors
   the hue family more reliably than "purple and blue".
2. **Name the material.** "Fired glazed ceramic", "burnished brass inlay",
   "liquid acrylic ink dispersing in water", "black velvet backdrop".
3. **Always append the negative set** (§6). The failure mode of this
   aesthetic is generic sacred-geometry clipart, and the negative set is the
   only thing preventing it.
4. **Generate at 2× and downsample.** Midjourney's `--q 2` plus a 2×
   upscale is the difference between "textured" and "vector-clean".
5. **Never let a generator produce the wordmark.** AI text is unusable at
   this standard. Use `medfender-wordmark.svg` and composite.

---

## 1. THE COLOUR CONSTANT

Paste this into any prompt that needs the brand's chroma:

```
obsidian #0B0F19 base, royal purple #7B2FBE, electric cobalt blue #1B4DE4,
burnt crimson #9B2226 focal accent, burnished gold #D4A574 specular inlay
```

---

## 2. SEAMLESS TILEABLE BACKGROUNDS

### 2.1 The brand pattern tile — the Zellige field

**Midjourney v6**

```
/imagine prompt: seamless tileable Moroccan Zellige mosaic pattern, 12-point
star rosettes built from two overlapping hexagons rotated 30 degrees, 8-point
star rosettes in the interstices, hand-cut fired glazed ceramic tesserae with
dark grout lines, flat single-colour glaze per tessera with a subtle fired
glaze sheen, obsidian #0B0F19 base, royal purple #7B2FBE and electric cobalt
blue #1B4DE4 tesserae, burnished gold #D4A574 hairline inlay along the
north-west edge of each tile, black velvet void behind, single key light from
the north-west, flat top-down orthographic view, no perspective, no shadows
cast across the pattern, ultra detailed, octane render level of detail
--tile --ar 1:1 --style raw --stylize 180 --chaos 0 --seed 20240607 --v 6
```

**Parameter notes**

| Flag | Value | Why |
|---|---|---|
| `--tile` | on | Midjourney's tile mode. The only reliable seamless-tiling mechanism. |
| `--style raw` | on | Removes Midjourney's house beautification, which pushes hard toward painterly. Raw keeps the geometry legible. |
| `--stylize` | 180 | Low. Higher values trade geometric precision for atmosphere — the exact opposite of what this brand needs. |
| `--chaos` | 0 | Zero. Chaos introduces variation *between* generations, which breaks a mathematically-locked tile. |
| `--seed` | fixed | Lock it. A fixed seed makes the pattern reproducible across re-runs. |
| `--v 6` | 6 | Current Midjourney version. |

**DALL-E 3**

```
Create a seamless, repeating Moroccan Zellige mosaic tile pattern on a square
canvas. The pattern is composed of 12-pointed star rosettes — each formed
from two overlapping hexagons rotated 30 degrees — arranged on a square
lattice, with 8-pointed star rosettes nested in the interstices between them.
Every shape is a hand-cut piece of fired glazed ceramic with visible dark
grout lines between tesserae. Each tessera is a single flat colour with a
soft glazed sheen, never a gradient: obsidian #0B0F19 as the base, royal
purple #7B2FBE and electric cobalt blue #1B4DE4 for the star tesserae, and a
single hairline of burnished gold #D4A574 along the upper-left edge of each
tile where the light catches it. One key light from the north-west, no cast
shadows, flat orthographic top-down view. The tile must repeat perfectly in
all four directions with no visible seam. Extremely detailed, museum-quality
ceramic photography, octane render level of detail.
```

**DALL-E 3 limitation note:** DALL-E 3 cannot guarantee true seamlessness.
Treat its output as a *source texture*. Either (a) use Midjourney `--tile`
for the shipping asset, or (b) generate at 2048², then seam the 4 quadrants
in an image editor and crop the centre 1024². Always verify the seam by
offsetting the tile by 50% and checking for a discontinuity.

### 2.2 The liquid layer — Hendrix bleed

```
/imagine prompt: abstract liquid light show, luminous cobalt blue and royal
purple #7B2FBE ink diffusing and bleeding into obsidian #0B0F19 water,
high-key specular highlights on the surface tension, tendrils of pigment
radiating from a central point, swirling marbled fluid, microscopic
iridescence, deep black velvet backdrop, cinematic moody lighting, single
directional key light from the north-west, shot on medium format, 100mm macro
lens, shallow depth of field, octane render level of detail --ar 1:1
--style raw --stylize 400 --chaos 12 --seed 777 --v 6
```

**Note the inversion:** the liquid layer uses *high* stylize (400) and
*some* chaos (12). It is the only part of the identity that wants
imperfection. The geometry layer wants the opposite.

### 2.3 Velvet depth — the background field

```
/imagine prompt: pure black velvet fabric backdrop in deep midnight, subtle
nap texture catching a soft raking light from the north-west, gentle folds
falling into pure shadow, obsidian #0B0F19, no objects, no texture
imperfections, studio product photography, cinematic moody lighting, octane
render level of detail --ar 16:9 --style raw --stylize 100 --chaos 0
--seed 42 --v 6
```

---

## 3. HERO WALLPAPER & KEY VISUALS

### 3.1 The hero key visual — the full identity

```
/imagine prompt: luxury music brand key visual, centred 12-point Zellige
star rosette built from two overlapping hexagons, radiating outward into
cobalt blue and royal purple #7B2FBE liquid ink swirls dispersing into
obsidian #0B0F19, burnished gold #D4A574 hairline inlay tracing the
geometry, a single burnt crimson #9B2226 glow at the exact centre, black
velvet background, the faint silhouette of a double-cutaway electric guitar
hidden in the negative space between the mosaic tiles, engraved not outlined,
cinematic moody lighting, single key light from the north-west, octane render
level of detail, hyper-detailed, 8k --ar 16:9 --style raw --stylize 250
--chaos 8 --seed 20240607 --v 6
```

**DALL-E 3**

```
A cinematic luxury brand key visual on a deep obsidian #0B0F19 velvet
background. At the centre, a 12-pointed Moroccan Zellige star rosette
constructed from two overlapping hexagons rotated 30 degrees, rendered as
hand-cut fired glazed ceramic with dark grout. Fine burnished gold #D4A574
hairlines trace the geometry and catch a single key light from the
north-west. From the rosette, tendrils of electric cobalt blue #1B4DE4 and
royal purple #7B2FBE liquid ink bleed and disperse outward into the darkness
like ink dropped in water. A single concentrated burnt crimson #9B2226 glow
sits at the exact centre. Subtle in the negative space between the mosaic
tiles, the void faintly traces the silhouette of a double-cutaway electric
guitar — it is an absence, not an outline. Cinematic moody lighting, deep
shadows, extreme material detail, octane render level of detail.
```

### 3.2 Hero wallpaper — banner crop

```
/imagine prompt: panoramic luxury brand wallpaper, extreme close-up of
Moroccan Zellige mosaic tesserae in royal purple #7B2FBE and electric cobalt
blue #1B4DE4 with dark grout, edges of the tesserae catching burnished gold
#D4A574 specular highlights, a band of liquid cobalt ink bleeding across the
lower third, black velvet void, cinematic moody lighting, macro texture,
octane render level of detail --ar 21:9 --style raw --stylize 200 --chaos 6
--seed 31337 --v 6
```

### 3.3 Square social / avatar

```
/imagine prompt: 12-point Zellige star rosette centred in frame, fired
glazed ceramic tesserae, royal purple #7B2FBE and electric cobalt blue
#1B4DE4, single burnt crimson #9B2226 hexagonal knot at the centre,
burnished gold #D4A574 hairline inlay, obsidian #0B0F19 background, flat
orthographic view, even studio light, octane render level of detail
--ar 1:1 --style raw --stylize 150 --chaos 0 --seed 20240607 --v 6
```

### 3.4 The negative-space study

```
/imagine prompt: an electric guitar shape formed entirely by the empty space
between Moroccan Zellige ceramic tiles, no outline, no drawn edges, the
double-cutaway body and angled headstock defined purely by the dark gaps
between the glazed tesserae, obsidian #0B0F19 void, cobalt blue #1B4DE4 and
royal purple #7B2FBE tiles, one gold #D4A574 hairline catching light on the
lower-right edges only, macro ceramic texture, cinematic moody lighting,
octane render level of detail --ar 4:5 --style raw --stylize 150 --chaos 4
--seed 909 --v 6
```

---

## 4. LUXURY MERCHANDISE MOCKUPS

### 4.1 Vinyl record sleeve

```
/imagine prompt: luxury vinyl record sleeve mockup, front cover artwork is a
centred Moroccan Zellige 12-point star rosette in cobalt blue #1B4DE4 and
royal purple #7B2FBE glazed ceramic with burnished gold #D4A574 inlay and a
single burnt crimson #9B2226 centre, obsidian #0B0F19 field, matte card
stock with a subtle uncoated texture, perfectly square, flat front-on
product photography, studio softbox lighting, no perspective distortion,
octane render level of detail --ar 1:1 --style raw --stylize 120 --chaos 0
--v 6
```

### 4.2 Tote bag / textile

```
/imagine prompt: black heavyweight cotton tote bag, screen-printed with a
Moroccan Zellige 12-point star rosette pattern in cobalt blue #1B4DE4 and
royal purple #7B2FBE with a single burnished gold #D4A574 star at the
centre, ink sitting in the weave of the fabric, obsidian #0B0F19 bag,
studio product photography on a seamless grey backdrop, soft directional
light, macro detail on the fabric texture, octane render level of detail
--ar 4:5 --style raw --stylize 150 --chaos 4 --v 6
```

### 4.3 Guitar headstock inlay

```
/imagine prompt: extreme macro of a rosewood guitar headstock with an
inlaid Moroccan Zellige 12-point star rosette, pearloid and abalone shell
inlay catching the light, burnished gold #D4A574 pinstripe border, warm
mahogany edge, studio macro product photography, shallow depth of field,
raking light, octane render level of detail --ar 1:1 --style raw --stylize
200 --chaos 6 --v 6
```

### 4.4 Statement hoodie / heavy jersey

```
/imagine prompt: black heavyweight brushed-cotton hoodie laid flat on a
concrete surface, screen print across the chest showing a Moroccan Zellige
12-point star rosette in cobalt blue #1B4DE4 and royal purple #7B2FBE with a
burnished gold #D4A574 hairline outline, print texture sitting in the fabric,
cinematic moody lighting, top-down product photography, octane render level
of detail --ar 4:5 --style raw --stylize 150 --chaos 4 --v 6
```

### 4.5 Gallery print / framed art

```
/imagine prompt: a large framed art print on a dark gallery wall, the print
is a Moroccan Zellige 12-point star rosette in cobalt blue #1B4DE4 and royal
purple #7B2FBE with burnished gold #D4A574 inlay and a single burnt crimson
#9B2226 centre, deep obsidian #0B0F19 ground, matte black frame with a
floated mount, gallery spot lighting from above, architectural interior
photography, octane render level of detail --ar 3:2 --style raw --stylize
180 --chaos 4 --v 6
```

---

## 5. ALBUM & PRODUCT ARTWORK

### 5.1 Album cover

```
/imagine prompt: album cover artwork, obsidian #0B0F19 ground, a single
Moroccan Zellige 8-point star floating in the centre with liquid cobalt blue
#1B4DE4 ink bleeding from its edges, burnished gold #D4A574 hairline, one
burnt crimson #9B2226 point catching light, vast negative space, cinematic
moody lighting, minimal, dark, octane render level of detail --ar 1:1
--style raw --stylize 220 --chaos 10 --seed 555 --v 6
```

### 5.2 CD / cassette

```
/imagine prompt: matte black CD jewel case standing on a dark surface,
cover insert showing a Moroccan Zellige 12-point star rosette in cobalt blue
#1B4DE4 and royal purple #7B2FBE on obsidian #0B0F19, burnished gold
#D4A574 inlay, plastic case catching a single specular highlight, studio
product photography, cinematic moody lighting, octane render level of detail
--ar 4:3 --style raw --stylize 150 --chaos 4 --v 6
```

---

## 6. THE NEGATIVE PROMPT SET

Append to every Midjourney prompt. This is the single most important part
of the file.

```
--no flat vector, clip art, cartoon, childish, generic sacred geometry, clip
art sacred geometry, pentagram, magic circle, mandala clip art, low contrast
washed out, pastel, rainbow, neon rainbow, psychedelic poster text, text,
lettering, words, typography, watermark, logo, signature, jpeg artifacts,
blurry, out of focus, heavy vignette, chromatic aberration, lens flare, busy
background, cluttered composition, chrome, plastic gloss, 3d render, octane
render, cgi, uncanny valley, stock photo watermark, symmetry errors,
malformed geometry, lopsided, diagonal lighting gradient across the tile,
directional sheen overlay, visible tile seam
```

**What each exclusion is actually defending against**

| Exclusion | Defends against |
|---|---|
| `flat vector, clip art` | The generic-sacred-geometry failure. |
| `pentagram, magic circle, mandala clip art` | The occult reading. Medfender is Moroccan craft, not mysticism. |
| `pastel, rainbow, neon rainbow` | The 1960s psychedelic poster cliché, which reads novelty rather than luxury. |
| `3d render, octane render, cgi` | The plastic-chrome look. Only the **ceramic** render is wanted. |
| `text, lettering, words` | Unusable AI type. Use the SVG wordmark. |
| `symmetry errors, lopsided, malformed geometry` | Broken sacred geometry. If the model can't hold 12-fold symmetry, the output is worse than no output. |
| `diagonal lighting gradient across the tile, directional sheen overlay, visible tile seam` | The single most common failure of a generated Zellige tile: a directional key-light gradient that resets at every tile edge and announces the repeat. In the Medfender system the glaze is **radial** and the light lives on the page plane — see §1.3.5 of the brand book. |

---

## 7. MODEL-SPECIFIC ADVICE

### Midjourney v6

* `--style raw` on **every** prompt in this file. The default style pushes
  hard toward atmospheric painterly work, which destroys geometric
  precision.
* `--stylize` maps to *how much the model prioritises aesthetics over your
  prompt*. Geometry wants **150–250**. Liquid art wants **400**.
* `--chaos` maps to *variation between candidate images*. Set **0** for
  anything that must tile or lock to a grid.
* `--no` is **not** a stylize-down. It is a hard exclusion list, and it is
  the only reliable way to keep a model out of the sacred-geometry-clipart
  zone.
* `--seed` locks the composition. Always set it for brand assets.
* `--repeat` is useful for exploring ratios of a locked seed.

### DALL-E 3

* No parameters, no seeds, no negative prompts, no tiling. **Everything
  must go in the prose.**
* Be maximally explicit about the palette (hex codes), the material
  ("fired glazed ceramic", not just "mosaic"), the light direction
  ("single key light from the north-west"), and the projection
  ("flat orthographic top-down view, no perspective").
* DALL-E 3 will happily draw text, symbols and outlines you did not ask for.
  Add "no text, no lettering, no logos, no symbols" to the prose.
* DALL-E 3 struggles with **exact** radial symmetry. For anything requiring
  verified 12-fold symmetry, use the SVG generator, not a generative model.

---

## 8. POST-GENERATION HOUSE CHECKLIST

Before any generated image ships, verify:

- [ ] Palette within the five brand colours (no stray pastels, no pure black).
- [ ] The Zellige geometry is **razor-sharp** — no blur, no warping.
- [ ] The liquid layer is behind the geometry, never over it.
- [ ] Crimson appears **once**.
- [ ] Gold appears only as a specular edge or hairline, never as a fill.
- [ ] The Strat is an absence, not an outline.
- [ ] No text, no watermark, no logo.
- [ ] Tiles seam cleanly (offset-test at 50%).
- [ ] Reviewed by **local Ollama vision** before sign-off:
      `python tools/vision_check.py <file.png>`
