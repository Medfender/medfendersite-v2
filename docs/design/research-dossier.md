# Medfender — Research Dossier

**Date:** 2026-10-25
**Scope:** reference corpus, verified observations, transferable principles, rejected ideas.
**Evidence key:** `[B]` inspected in a real browser (agent-browser, headless Chromium, 1440×900, desktop UA) · `[S]` inspected via server-rendered HTML/text only · `[M]` metadata (title/description) only — no visual claim made.

> All observations below are of publicly reachable pages on the date above. Nothing here reproduces another site's assets, copy, or composition. Principles only.

---

## 1. The corpus

| # | Reference | URL | Evidence | Why it belongs |
|---|---|---|---|---|
| 1 | teenage engineering | https://teenage.engineering/ | [B] | Instrument-maker web design: hardware as the composition, diagrammatic chrome |
| 2 | Collings Guitars | https://www.collingsguitars.com/ | [B] | Luthier materiality; instrument geometry cutting the frame |
| 3 | Ableton | https://www.ableton.com/ | [B] | Music-tool editorial: hard-edged modular blocks, flat colour zones |
| 4 | The Pudding | https://pudding.cool/ | [B] | Explanatory visual essays; numbered archival issue system |
| 5 | musictheory.net | https://www.musictheory.net/ | [B] | Pedagogy clarity; notation-first lesson structure |
| 6 | Hooktheory | https://www.hooktheory.com/ | [B] | Counter-example: capable theory product with generic SaaS art direction |
| 7 | Radiooooo | https://radiooooo.com/ | [B] | Instrument metaphor carried through navigation and every control |
| 8 | Strum Machine | https://www.strummachine.com/ | [B] | Counter-example: practice-tool UI conventions, no authored identity |
| 9 | Rick Creates — Site of the Year teardowns | https://rickcreates.com/year | [B] | Documented teardowns of Awwwards/FWA winners (concept → build) |
| 10 | Lusion | https://lusion.co/ | [M] | Real-time craft studio; WebGL only where it serves a story |
| 11 | Active Theory | https://activetheory.net/ | [M] | Interaction-led studio practice |
| 12 | Are.na | https://www.are.na/ | [S] | Knowledge organisation without algorithmic feeds |
| 13 | Bandcamp | https://bandcamp.com/ | [S] | Artist-first music commerce; editorial dignity over growth-hacking |
| 14 | Recent | https://recent.design/ | [S] | Contemporary curation index (typography, motion, 3D) |
| 15 | SiteInspire | https://www.siteinspire.com/ | blocked (429 / checkpoint) | Index only; no claims made |
| 16 | Works in Progress | https://worksinprogress.co/ | [M] | Long-form editorial typography and reading rhythm |
| 17 | Open Music Theory (Pressbooks) | https://viva.pressbooks.pub/openmusictheory/ | [S] | Open textbook structure for theory knowledge |
| 18 | Zellij (Moroccan geometric tilework) | https://en.wikipedia.org/wiki/Zellige | [S] | Structural geometry reference for a Moroccan-rooted system (used as mathematics, not pastiche) |

**Not inspected:** Awwwards and FWA listing pages returned mostly client-rendered shells and promotional copy; I did not treat their thumbnails as evidence. No claim in this dossier depends on them. `rickcreates.com/year` supplied verified textual teardowns of actual winners.

---

## 2. Verified findings, one reference at a time

### 2.1 teenage engineering `[B]`
- **Thesis:** the object is the page. A single hardware unit floats in a black void at the optical centre of the first viewport; nothing competes with it.
- **Chrome:** navigation is drawn as thin geometric line-icons — a flower, a box, a film frame, a printed-circuit glyph — set beside two-line labels. The nav reads as a legend on an engineering drawing, not as a menu.
- **Type:** one custom grotesque (`te-20`) at very small sizes; no display typography at all. Personality comes from the objects and the icons.
- **Space:** ~70% of the first viewport is empty. Nothing is centred "for balance"; the object is centred because it is the subject.
- **Motion:** minimal and mechanical; the page does not animate to prove itself.
- **Transferable principle:** let one instrument-shaped object own the first viewport, and treat navigation/labels as annotations on a technical drawing.
- **Rejected:** the all-black void and the total absence of a reading voice. Medfender needs to carry text, lessons, and prices.

### 2.2 Collings Guitars `[B]`
- **Thesis:** craft is proven by closeness. A sunburst acoustic is cropped so the strings and soundhole cut across the frame at an angle; the instrument exceeds the viewport.
- **Composition:** type sits in the instrument's shadow, bottom-left, while the instrument's diagonal carries the eye from top-right to bottom-left. A patterned textile in the background supplies a second, quieter rhythm.
- **Type:** condensed uppercase grotesque for the claim, small humanist sans for the paragraph, hard rectangular button with a single word of action.
- **Transferable principle:** crop the instrument so its geometry — strings, frets, soundhole — becomes the page's compositional line. Never place a guitar in a centred card.
- **Rejected:** the automotive-grade polish and the "BUILT FROM THE SOUND UP" register. Medfender is a working player, not a luxury manufacturer.

### 2.3 Ableton `[B]`
- **Thesis:** a music-tools company that publishes like a design studio. Content is arranged as hard-edged modules of unequal width; photography bleeds off one edge while a flat acid-green block carries a single commercial message.
- **Colour:** one saturated flat colour per zone, used functionally (an announcement, a promotion) — never as a gradient wash behind everything.
- **Type:** a wide grotesque at an unusually large scale, tight leading, sentence case.
- **Transferable principle:** coloured rectangles can carry information (state, section, price) without decoration, provided the geometry is strict and the palette is small.
- **Rejected:** the half-photo/half-colour split as a hero device. It is now a template.

### 2.4 The Pudding `[B]`
- **Thesis:** an archive of numbered visual essays. Each story gets an issue number, a date, and a saturated field colour; the data visualisation itself is the cover art.
- **Navigation:** search plus a small set of human categories ("Our faves", "Popular", "Updating"), drawn as hand-lettered icons. The archive is legible at a glance.
- **Type:** a script logotype against tiny uppercase labels — an editorial voice plus a filing system.
- **Transferable principle:** number the educational pieces and give each one a stable visual identity, so the library feels like a body of work rather than a feed.
- **Rejected:** the maximal colour-block aesthetic. It would drown a site that also sells products and books gigs.

### 2.5 musictheory.net `[B]`
- **Strengths:** notation is always the primary object; lessons are dense, sequential, and unambiguous; the exercise model (identify, then check) is genuinely good pedagogy.
- **Weakness (verified):** no art direction — grey boxes, default blue links, stock device mockups. The teaching is excellent; the experience is not authored.
- **Transferable principle:** every theory claim must be paired with a precise, legible diagram, and interaction should be *checkable* (the user can verify an answer), not merely decorative.
- **Rejected:** the utilitarian layout and default browser aesthetics.

### 2.6 Hooktheory `[B]` — counter-example
- Dark blurred laptop photograph, centred bold sans headline, two blue rounded buttons, a stat card. The theory depth is invisible above the fold.
- **Use:** evidence that a theory product defaults to SaaS art direction when nobody art-directs it. Medfender must show the *musical object* in the first viewport.

### 2.7 Radiooooo `[B]`
- **Thesis:** the site is a car radio. A world map is the dial; decades are physical buttons; the "now playing" panel is a dashboard.
- **Strength:** every control belongs to one metaphor, so the interface teaches itself.
- **Weakness (verified):** skeuomorphic clutter, a cookie wall covering the map, competing typefaces and saturated colours.
- **Transferable principle:** commit to *one* instrument metaphor and let it govern control shape and feedback — but keep the number of visual dialects to two or three.

### 2.8 Strum Machine `[B]` — counter-example
- White page, rounded pill nav, blue underlined headline, green pill CTA, floating product screenshot. Clear, friendly, entirely interchangeable with any SaaS.
- **Use:** confirms that the *practice-tool* category has no visual leader. A theory/practice instrument with real art direction is genuinely differentiated.

### 2.9 Rick Creates teardowns `[B]`
Verified teardown text for recent winners described:
- **Bruno's Portfolio (2025):** one island, one jeep; content lives where the jeep can drive. The sky follows the real clock.
- **Lando Norris (2025):** the racing helmet is "the thread that runs from the opening portrait through a hall of fame of helmets to the footer"; the portrait shrinks into a card as you scroll.
- **Food for Fish (2024):** one hand-built WebGPU engine; a single continuous world with game logic rather than page sections.

**Pattern across all three:** a single *thread/object* recurs at every scale of the experience, and the technology exists to serve that thread. Not "sections with effects".

**Transferable principle:** choose one physical object as the through-line and let it recur — in the hero, in section rules, in the interactive instrument, in the footnote marks.

### 2.10 Are.na `[S]`, Bandcamp `[S]`
- Are.na: knowledge is organised in channels; there is no engagement metric in the primary reading path.
- Bandcamp: the artist's page is the product; commerce is embedded but never louder than the work.
- **Transferable principle:** let the archive/library be a first-class place, and let commerce sit beside the work rather than above it.

### 2.11 Zellij `[S]`
- Moroccan tilework is constructed from a small set of repeating polygons around an 8-fold symmetry; the pattern is generated by rule, not drawn freehand.
- **Transferable principle:** use *rule-generated geometry* (fret spacing, inlay positions, string gauges) as the ornamental system. It is culturally rooted in construction, not in motifs pasted onto a page.
- **Rejected:** literal zellige tessellation as a background texture. It would read as décor and compete with the fretboard.

---

## 3. Cross-cutting principles extracted

1. **One object owns the first viewport.** (TE, Collings, Rick Creates teardowns)
2. **The instrument's own geometry is the grid.** Fret ratios, string gauges, inlay positions give a layout system nobody else can copy without becoming a guitar site. (Collings, TE)
3. **Two type voices maximum, plus a measurement voice.** A display/reading voice, an interface voice, and a mono for numbers/labels. (Ableton, Pudding)
4. **Colour is functional before it is atmospheric.** One paper ground, one ink ground, two accents with assigned musical meaning. (Ableton)
5. **Number the knowledge.** Courses, etudes, and reference pages carry stable indices; the library reads as an archive. (Pudding, Are.na)
6. **Motion is a consequence, not a demonstration.** A plucked string settles; it does not perform. (TE)
7. **The interactive artefact must be checkable.** A theory tool earns trust by showing intervals, common tones, and voice movement that the user can verify. (musictheory.net, Pudding)
8. **Negative space is a material.** It is what makes an instrument look expensive.

---

## 4. Ideas deliberately rejected

| Idea | Source | Why rejected for Medfender |
|---|---|---|
| All-black void with a floating 3D object | teenage engineering | Medfender is text-, price-, and lesson-heavy; a void hero would hide the product |
| Full-bleed sunburst guitar hero | Collings | Beautiful but generic "guitar brand"; and we do not manufacture instruments |
| Saturated colour-block archive | The Pudding | Competes with photography and product imagery; too loud for a working musician |
| Skeuomorphic radio/dashboard | Radiooooo | Would trivialise the theory engine into a toy |
| Dark neon / electric-blue glow | (category default) | Explicitly out of bounds; also the previous build's failure mode |
| Glassmorphic cards + gradient text | (2024–26 template) | No conceptual work being done; damages legibility |
| Literal zellige tiling | Moroccan craft reference | Décor, not structure; would fight the fretboard |

---

## 5. The gap this creates

No inspected reference combines:
- an **editorial reading voice** (Pudding, WIP, Bandcamp),
- **instrument-grade technical clarity** (TE, musictheory.net),
- a **real, accurate interactive fretboard** as the signature artefact,
- and a **working musician's commercial reality** (bookings, lessons, presets).

That intersection is Medfender's territory. It could not emerge from copying any single music website, because no inspected music website occupies it.
