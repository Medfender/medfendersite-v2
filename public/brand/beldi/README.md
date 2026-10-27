# MEDFENDER — Beldi mark system

The 2026 logo rebuild. Deliberately unrelated to the previous identity
(`../medfender-*.svg`, obsidian + zellige rosette + negative-space Strat,
Hendrix liquid swirls). This system takes the *other* Morocco:

> **"The Strat hung in the riad doorway."**
> A Stratocaster body hung in a horseshoe arch of a riad doorway, carved
> like a Beldi vessel: the three single coils read as the raised rims of a
> mouth-blown **Beldi glass**, a **seed bubble** sits in the wood the way
> every hand-blown Beldi glass has one, and six strings rise through the
> arch into its neck pocket — the instrument passes *through the door*.

## The four files

| File | Use |
|---|---|
| `medfender-beldi-mark.svg` | **Primary mark.** App tile, hero, merch, lockup art. |
| `medfender-beldi-mark-saffron.svg` | Warm colorway (brass arch, terracotta body). Stress-tested for varied placement. |
| `medfender-beldi-badge.svg` | Round badge — avatar, social, sticker, merch print. |
| `medfender-beldi-favicon.svg` | Favicon / tiny sizes: silhouette only, chrome-weight details that survive 16–32 px. |

## Palette (Beldi craft colors — no obsidian, no gradients)

| Role | Hex | Where it appears |
|---|---|---|
| Cream field | `#F3EBD9` | Ground, tuners/pickups rim, strings |
| Terracotta | `#C2603E` | Arch wall (or body in the saffron colorway), favicon body |
| Brass | `#B98A44` | Body (primary), arch (saffron) |
| Deep clay | `#6E3B2A` | Screenprint shadow, ribs, bridge |
| Ink outline | `#3A2418` | The hand-cut conté edge on every element |

Everything is **flat fill + one offset screenprint shadow** — the whole
system is meant to feel like a hand-pulled poster print from a Marrakech
print shop, not a vector-rendered product.

## Style rules (the Beldi five)

1. Flat fills only. No gradients, no glows, no bevels.
2. The two-plane shadow is always offset down-right (+12, +12 at 512 px scale).
3. The S-field (strings, nut, rims, bubble) is always cream; it never darkens.
4. The ink outline (#3A2418) is 3–5 units and rides every cream element.
5. The seed bubble appears exactly once per composition.

## How the shapes are generated

The geometry is code, same as the old system:

- `tools/beldi_path.py` — generic closed/open Catmull-Rom→bezier spline.
- `tools/beldi_body_path.py` — the Strat body landmarks come from
  `tools/brand_assets_generator.py :: strat_body_faceted()` (the measured
  18.1×12.6 body: long treble horn, short bass horn, deep cutaways,
  asymmetric waist). They are re-splined into *organic* curves — the
  faceting of the old brand is deliberately abandoned.
- `tools/beldi_headstock_path.py` — the head-study landmarks (kept for
  reference; the body reads better and ships).

Do not hand-edit the path data inside the SVGs; re-run the generator and
re-inject (see the call history in git).
