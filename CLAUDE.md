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
- **Visual QA (enforced):** After any CSS, Tailwind, or UI layout changes you MUST navigate the local dev server (`http://localhost:3000/audio` or relevant page), take a screenshot via Chrome DevTools / Playwright MCP, visually verify design compliance, and check the console for errors — see `docs/agents/visual-qa.md`. No exceptions.
- **NEVER pass PNG files to the `Read` tool directly** — the active model lacks vision and returns 500. For visual judgment, save screenshot to `temp_screenshots/` then run `python tools/vision_check.py <png> --provider ollama`. See `docs/agents/visual-qa.md`.
- **VISION IS LOCAL-ONLY (permanent user rule):** Never call remote vision APIs (gemini, openrouter, nvidia) directly via tool calls, MCP, or API — they repeatedly fail with HTTP 400 catalog errors that block work. Use `tools/vision_check.py --provider ollama` (or with no `--provider`, which defaults to ollama). `vision_check.py` handles VRAM freeing and model loading automatically.
- Do not push to GitHub until explicitly instructed.

## Permissions (permanently granted)
- **Full, unrestricted permissions** for this project — modifications, model installations/removals, system configs, file creation, dependency changes, local services, no need to ask for confirmation.
- All keys live in `.env` (gitignored): `OPENROUTER_API_KEY`, `GEMINI_KEY`, `NVIDIA_API_KEY`, `OMNIRouter_KEY`.
