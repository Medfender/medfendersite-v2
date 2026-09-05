# Visual QA — LOCAL VISION ONLY

> **Permanent user rule:** Vision is 100% local (Ollama gemma4:12b on RTX 3070). Remote
> vision APIs (gemini, openrouter, nvidia) are BLOCKED by default. They repeatedly return
> HTTP 400 with "not available in active live catalog" and schema mismatch errors — they block
> work and waste time. There is no scenario where remote vision is preferred over local.

## Quick Command

```bash
# ONE safe path — local only, VRAM managed automatically
python tools/vision_check.py temp_screenshots/<name>.png --provider ollama

# No args also defaults to ollama
python tools/vision_check.py temp_screenshots/<name>.png
```

## Two-Step Visual QA

**Step 1 — Structural check (always):** use `take_snapshot` (Chrome DevTools MCP) to get the
text accessibility tree. Verify component presence, text content, and hierarchy. No vision needed.

**Step 2 — Visual judgment (only when needed):** if the snapshot isn't enough to judge color,
gradients, alignment, glow effects, or layout proportions, take a screenshot and run vision:

```bash
python tools/vision_check.py temp_screenshots/<name>.png --provider ollama
```

The script will:
1. Probe Ollama for an installed vision model.
2. Free VRAM by unloading non-vision models if needed.
3. Warm-load the vision model.
4. Run the prompt and return the analysis.

**Never pass PNG files to Claude's `Read` tool directly** — it lacks vision and returns 500.

## Console Check

- Open browser DevTools console or Playwright console output.
- Flag any `Error`-level console messages as blocking.
- `Warning`-level messages are informational but should be noted.

## What `vision_check.py` Does (Full Pipeline)

```
1. ensure_local_vision()          → probe Ollama /api/tags for vision model
                                    → if none: pull gemma4:12b
                                    → unload other models to free VRAM
                                    → warm-load vision model

2. ollama_describe()              → POST to /api/chat with base64 PNG + prompt
                                    → returns text analysis

3. (remote, --allow-remote only) → try gemini/openrouter/nvidia
                                    → on transient error: fallback to Ollama
```

Remote providers (gemini/openrouter/nvidia) are **only reachable** with `--allow-remote` and
**only for emergencies** — they are never preferred. They fail with HTTP 400 catalog errors:
- `gemini-3.1-flash-tts-preview` — TTS-only, no image input
- `gemini-3.5-flash` — schema mismatch on function declarations
- `meta/llama-3.2-90b-vision-instruct` — wrong prefix (nvidia/), not in NVIDIA catalog
- `nvidia/...` — wrong prefix everywhere

`vision_check.py` has hard guards: if you pass `--provider gemini` without `--allow-remote`,
it exits with code 3 and prints a clear error message.

## If Ollama Is Not Running

```bash
ollama serve &
# then retry:
python tools/vision_check.py temp_screenshots/<name>.png --provider ollama
```

## File Changes

- Screenshots go in `temp_screenshots/`.
- Clean up `temp_screenshots/` after the user approves.
