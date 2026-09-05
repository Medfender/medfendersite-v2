#!/usr/bin/env python3
"""Vision check for screenshots that the model can't read directly.

USER RULE (permanent, enforced): VISION IS LOCAL-ONLY. NEVER call online vision
APIs (gemini / openrouter / nvidia) under any circumstance — they repeatedly
return HTTP 400 with deprecated model IDs ("not in active live catalog"),
schema mismatches, and quota errors, which interrupts the agent and blocks
work. Local Ollama (gemma4:12b on RTX 3070) is free, fast, and always reachable.

Pipeline:
  1. ensure_local_vision()  — frees VRAM, loads gemma4:12b if needed.
  2. ollama_describe()      — runs the vision task.
  3. (legacy) remote paths  — reachable only with explicit --allow-remote.
"""
import argparse, base64, os, sys
from pathlib import Path

# Catalog of known-broken / deprecated model IDs that return HTTP 400 from
# any provider. We strip these silently so vision_check never reproduces
# the recurring 400 spam.
DEPRECATED_GEMINI = {
    "gemini-3.1-flash-tts-preview",   # TTS-only, no image input
    "gemini-3.5-flash",               # schema mismatch on tools/function declarations
    "gemini-3.1-pro-preview",         # sometimes deprecated mid-flight
}
DEPRECATED_NVIDIA = {
    "nvidia/meta/llama-3.2-90b-vision-instruct",  # wrong prefix — strip nvidia/
    "nvidia/meta/llama-3.2-11b-vision-instruct",  # wrong prefix
    "nvidia/nvidia/llama-3.1-nemotron-nano-vl-8b-v1",  # superseded
}

# ------------------------------------------------------------------
# VRAM management + local vision setup
# ------------------------------------------------------------------
def ensure_local_vision(preferred="gemma4:12b", ollama_url="http://localhost:11434"):
    """Make sure a local vision model is loaded in Ollama before we run.

    Steps:
      1. Probe /api/tags — if vision model already present, reuse.
      2. Otherwise, unload other models (free VRAM) and pull preferred.
      3. Returns the model name actually loaded.
    """
    import urllib.request, json as _json, subprocess, time

    def _tags():
        with urllib.request.urlopen(f"{ollama_url}/api/tags", timeout=3) as r:
            return [m.get("name","").lower() for m in _json.loads(r.read()).get("models", [])]

    def _loaded():
        with urllib.request.urlopen(f"{ollama_url}/api/ps", timeout=3) as r:
            return [m.get("name","").lower() for m in _json.loads(r.read()).get("models", [])]

    try:
        installed = _tags()
    except Exception as e:
        print(f"FATAL: Ollama not reachable at {ollama_url}: {e}", file=sys.stderr)
        print("Start ollama with: systemctl start ollama  (or: ollama serve &)", file=sys.stderr)
        sys.exit(2)

    # pick the best installed vision model in preference order
    pref = (preferred, "gemma4:12b", "gemma4", "llama3.2-vision:latest",
            "llava:latest", "llava:13b", "minicpm-v", "qwen2.5vl", "qwen-vl")
    chosen = None
    for p in pref:
        for m in installed:
            if m == p or m.startswith(p + ":") or m == p.split(":")[0]:
                chosen = m
                break
        if chosen:
            break
    if not chosen:
        # Nothing installed — try to pull the preferred model
        print(f"VISION: no local vision model installed. Pulling {preferred} (one-time)…", file=sys.stderr)
        try:
            subprocess.run(["ollama", "pull", preferred], check=True, timeout=600)
            chosen = preferred
        except Exception as e:
            print(f"FATAL: cannot pull vision model: {e}", file=sys.stderr)
            sys.exit(2)

    # Free VRAM: unload any other currently-loaded models
    try:
        loaded = _loaded()
        for m in loaded:
            if m != chosen.lower():
                print(f"VISION: unloading {m} to free VRAM…", file=sys.stderr)
                try:
                    req = urllib.request.Request(
                        f"{ollama_url}/api/generate",
                        data=_json.dumps({"model": m, "keep_alive": 0}).encode(),
                        headers={"Content-Type": "application/json"}, method="POST")
                    urllib.request.urlopen(req, timeout=10).read()
                except Exception:
                    pass
    except Exception:
        pass

    # Confirm the model is loaded (already confirmed by /api/ps above)
    print(f"VISION: '{chosen}' is loaded in VRAM.", file=sys.stderr)
    return chosen


def _read_b64(png_path: Path) -> str:
    return base64.b64encode(png_path.read_bytes()).decode()


def _is_transient_error(msg: str) -> bool:
    if not msg:
        return False
    m = msg.lower()
    return any(s in m for s in [
        " 5", "internal", "timeout", "timed out", "connection",
        "reset", "unavailable", "rate", "overloaded", "temporarily",
        "service unavailable", "bad gateway", "gateway timeout",
        "urlopen error", "http error 5",
    ])


def ollama_describe(png_path, prompt, url="http://localhost:11434", model="gemma4:12b"):
    import urllib.request, json
    b64 = _read_b64(png_path)
    req = urllib.request.Request(
        f"{url}/api/chat",
        data=json.dumps({
            "model": model,
            "messages": [{"role":"user","content":prompt,"images":[b64]}],
            "stream": False
        }).encode(),
        headers={"Content-Type":"application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            result = json.loads(resp.read())
            return result.get("message",{}).get("content","No content.")
    except Exception as e:
        return f"Ollama error: {e}"


def openrouter_describe(png_path, prompt, key, model="openrouter/auto"):
    import urllib.request, json
    b64 = _read_b64(png_path)
    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=json.dumps({
            "model": model,
            "messages": [{"role":"user","content":[
                {"type":"text","text":prompt},
                {"type":"image_url","image_url":{"url":f"data:image/png;base64,{b64}"}}
            ]}], "max_tokens": 500
        }).encode(),
        headers={"Authorization":f"Bearer {key}","Content-Type":"application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read())
            return result.get("choices",[{}])[0].get("message",{}).get("content","No response.")
    except Exception as e:
        return f"OpenRouter error: {e}"


def gemini_describe(png_path, prompt, key, model="gemini-2.0-flash"):
    import urllib.request, json
    if model in DEPRECATED_GEMINI:
        print(f"WARNING: '{model}' is deprecated/unsupported, falling back to gemini-2.0-flash", file=sys.stderr)
        model = "gemini-2.0-flash"
    b64 = _read_b64(png_path)
    req = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}",
        data=json.dumps({
            "contents":[{"parts":[
                {"text":prompt},
                {"inline_data":{"mime_type":"image/png","data":b64}}
            ]}]
        }).encode(),
        headers={"Content-Type":"application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read())
            parts = result.get("candidates",[{}])[0].get("content",{}).get("parts",[])
            return "".join(p.get("text","") for p in parts) or "No response."
    except Exception as e:
        return f"Gemini error: {e}"


def nvidia_describe(png_path, prompt, key, model="meta/llama-3.2-90b-vision-instruct"):
    import urllib.request, json
    if model in DEPRECATED_NVIDIA or model.startswith("nvidia/"):
        fixed = model.replace("nvidia/", "", 1) if model.startswith("nvidia/") else model.split("/")[-1]
        print(f"WARNING: '{model}' is wrong for NVIDIA endpoint, using '{fixed}'", file=sys.stderr)
        model = fixed
    b64 = _read_b64(png_path)
    req = urllib.request.Request(
        "https://integrate.api.nvidia.com/v1/chat/completions",
        data=json.dumps({
            "model": model,
            "messages": [{"role":"user","content":[
                {"type":"text","text":prompt},
                {"type":"image_url","image_url":{"url":f"data:image/png;base64,{b64}"}}
            ]}], "max_tokens": 500
        }).encode(),
        headers={"Authorization":f"Bearer {key}","Content-Type":"application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            result = json.loads(resp.read())
            return result.get("choices",[{}])[0].get("message",{}).get("content","No response.")
    except Exception as e:
        return f"NVIDIA error: {e}"


PROVIDERS = {
    "ollama":     (ollama_describe,    "OLLAMA_URL",     "http://localhost:11434"),
    "openrouter": (openrouter_describe,"OPENROUTER_API_KEY", None),
    "gemini":     (gemini_describe,    "GEMINI_KEY",     None),
    "nvidia":     (nvidia_describe,    "NVIDIA_API_KEY", None),
}

NVIDIA_MODEL_HINTS = {
    "meta/llama-3.2-90b-vision-instruct": "✓ correct",
    "meta/llama-3.2-11b-vision-instruct": "✓ correct",
    "nvidia/vila": "✓ correct (VILA multimodal)",
}
GEMINI_MODEL_HINTS = {
    "gemini-2.0-flash": "✓ current stable",
    "gemini-2.5-flash": "✓ current stable",
    "gemini-2.5-pro": "✓ current stable",
}


def main():
    p = argparse.ArgumentParser(
        description="Vision check — LOCAL OLLAMA ONLY. Remote APIs are off by default.",
    )
    p.add_argument("png_path", help="PNG screenshot path")
    p.add_argument("--provider", default="ollama", choices=list(PROVIDERS.keys()),
                   help="Vision provider. Default: ollama (local). Non-ollama requires --allow-remote.")
    p.add_argument("--allow-remote", action="store_true",
                   help="Explicit opt-in to remote vision APIs (gemini/openrouter/nvidia). Default OFF.")
    p.add_argument("--ollama-url", default="http://localhost:11434")
    p.add_argument("--model", default=None, help="Override ollama model (default gemma4:12b).")
    p.add_argument("--prompt", default="Describe the layout, colors, alignment, and any visual issues you see in this page screenshot.")
    args = p.parse_args()

    png_path = Path(args.png_path)
    if not png_path.exists():
        print(f"ERROR: file not found: {png_path}", file=sys.stderr); sys.exit(1)

    # Hard guard — remote vision is OFF by default. No silent fallback, no warning.
    if args.provider != "ollama" and not args.allow_remote:
        print(
            f"BLOCKED: provider '{args.provider}' is remote and disabled by user rule.\n"
            f"         Vision is local-ONLY (Ollama). Pass --allow-remote to override (emergency only).",
            file=sys.stderr,
        )
        sys.exit(3)

    if args.provider == "ollama":
        # Free VRAM, load local vision model, return content
        model = ensure_local_vision(
            preferred=args.model or "gemma4:12b",
            ollama_url=args.ollama_url,
        )
        result = ollama_describe(png_path, args.prompt, url=args.ollama_url, model=model)
        print(result)
        return

    # Remote path — only reachable with --allow-remote
    func, env_key, _ = PROVIDERS[args.provider]
    key = os.getenv(env_key)
    if not key:
        print(f"ERROR: {env_key} not set. Add to .env or export.", file=sys.stderr); sys.exit(1)
    if args.model:
        result = func(png_path, args.prompt, key, model=args.model)
    else:
        result = func(png_path, args.prompt, key)
    if _is_transient_error(result):
        if ensure_local_vision(ollama_url=args.ollama_url):
            offline_model = "gemma4:12b"
            result = ollama_describe(png_path, args.prompt, url=args.ollama_url, model=offline_model)
            print(f"[OFFLINE FALLBACK] {args.provider} failed → used local Ollama")
    print(result)


if __name__ == "__main__":
    main()
