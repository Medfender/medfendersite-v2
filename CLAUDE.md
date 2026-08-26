@AGENTS.md

# CLAUDE.md — Frontend Website Rules

## Always Do First
- Invoke the `invoke-frontend-design` skill (via `.claude/skills/invoke-frontend-design.md`) before writing any frontend code.
- Read target files fully before editing; never overwrite without checking current content.
- Do not call unknown/non-existent skills.

## Reference Images / Assets
- Check `brand_assets/` and `public/` for logos, palettes, local media.
- If no reference: design with bespoke typography, dark glassmorphism (`#0b0f19`), cyan (`#00d8f6`), strict symmetry.

## Design Guardrails
- Pair display font (headings) with clean sans (body). Tight tracking (`-0.03em`) on display; relaxed line-height (`1.7`) on body.
- Layer soft colored-tint shadows with low opacity (`shadow-[0_0_15px_rgba(0,216,246,0.15)]`).
- Use gradient masks (`bg-gradient-to-t from-black/80`) over images.
- Animate only `transform` and `opacity` with spring easing; never `transition-all`.
- Every interactive needs `:hover`, `:focus-visible`, `:active`.

## Technical Rules
- Verify build (`npm run build`) before finishing.
- Capture screenshots via `node screenshot.mjs http://localhost:3000` when polishing.
- Do not push to GitHub until explicitly instructed.
