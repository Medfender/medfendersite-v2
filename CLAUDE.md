@AGENTS.md

# CLAUDE.md — Frontend Website Rules

## Always Do First
- Apply high-craft frontend design guardrails before writing any frontend code, every session, no exceptions.

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (`https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.

## Local Server & Screenshot Workflow
- **Dev Server:** Ensure dev server is active (`pnpm dev` on `http://localhost:3000`).
- **Puppeteer Screenshots:** Run `node screenshot.mjs http://localhost:3000` (saves to `./temporary screenshots/screenshot-N.png`).
- After screenshotting, inspect the PNG from `temporary screenshots/` using the Read tool.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px".
- Check: spacing/padding, font size/weight/line-height, exact hex colors, alignment, border-radius, depth/shadows.

## Brand & Design Guardrails
- **Brand Assets:** Check `brand_assets/` for logos, palettes, or SVGs before using placeholders.
- **Colors:** Never use default Tailwind palette (`indigo-500`, `blue-600`). Define custom hex variables or Tailwind theme extensions.
- **Shadows & Depth:** Layer soft, colored-tint shadows with low opacity instead of flat `shadow-md`. Use z-plane surface tiers (base → elevated → floating).
- **Typography:** Pair a display font for headings with a clean sans for body. Use tight tracking (`-0.03em`) on display text and relaxed line-height (`1.7`) on body.
- **Animations:** Animate only `transform` and `opacity` with spring easing. Never use `transition-all`.
- **Interactions:** Every clickable element must have distinct `:hover`, `:focus-visible`, and `:active` states.
- **Images:** Apply layered gradient masks (`bg-gradient-to-t from-black/80`) and blend modes (`mix-blend-multiply`) over visuals.

## Hard Rules
- Do not add sections or features omitted from reference designs.
- Do not stop after a single screenshot pass.
- Do not use `transition-all`.
- Do not default to stock Tailwind blue/indigo accents.
