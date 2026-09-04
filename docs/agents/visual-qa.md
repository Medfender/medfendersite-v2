# Visual QA Rule — OFFLINE / LOCAL VISION ONLY

> **User rule (enforced): always use only local model visions when a vision function is needed.**
> Remote APIs (gemini/openrouter/nvidia) cause recurring HTTP 400 errors (deprecated model IDs, schema mismatches, unavailable catalogs). Only `ollama` (local) is used for vision. If you need to override (emergency only), pass `--allow-remote` to `vision_check.py`.

## Two-Step Visual QA (Snapshot First, Vision on Demand)

**Step 1 — Structural check (always):** use `take_snapshot` (Chrome DevTools MCP) to get the text accessibility tree. Verify component presence, text content, and hierarchy. No vision needed.

**Step 2 — Visual judgment (only when needed):** if the snapshot isn't enough to judge color, gradients, alignment, glow effects, or layout proportions, save a screenshot + run the vision tool:

```bash
# Preferred: local Ollama ONLY (gemma4:12b — local GPU/CPU, free, no API errors)
python tools/vision_check.py temp_screenshots/<name>.png --provider ollama

# Remote providers are BLOCKED by default (see user rule above). Never call them.
# Only pass --provider openrouter/gemini/nvidia together with --allow-remote (emergency / never routine).
# vision_check.py guards deprecated IDs (gemini-3.1-flash-tts-preview, gemma-3.5-flash, nvidia/meta/...) and auto-falls back to ollama.
```

**Never pass PNG files to Claude's `Read` tool directly** — it lacks vision support and returns a 500 error.

## Enforcement

- If the dev server is not running, ask the user to start it before proceeding.
- `take_snapshot` is always available — never skip it.
- `take_screenshot` + `vision_check.py` only when snapshot is insufficient.

## Console Check

- Open browser DevTools console or Playwright console output.
- Flag any `Error`-level console messages as blocking.
- `Warning`-level messages are informational but should be noted.

## Offline Agent Fallback Rule

**Always use local Ollama vision — never remote vision APIs.** Remote providers (gemini/openrouter/nvidia) are blocked by default; they repeatedly return HTTP 400 errors with deprecated model IDs, schema mismatches, and "model not in live catalog" failures. There is no scenario where calling them is preferred over local Ollama.

```bash
# Explicit offline path — only path allowed (free, no API key, no 400 errors)
python tools/vision_check.py temp_screenshots/<name>.png --provider ollama

# vision_check.py also auto-detects any non-ollama attempt and forces ollama
# (see vision_check.py lines enforced by --provider guard + --allow-remote gate).
```
**Never block a visual QA step on a paid/remote API error — offline agents complete it.**

## File Changes

- Screenshots go in `temp_screenshots/`.
- Clean up `temp_screenshots/` after the user approves.
