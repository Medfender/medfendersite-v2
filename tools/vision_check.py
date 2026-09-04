#!/usr/bin/env python3
"""Vision check for screenshots that the model can't read directly.
Routes to the best available vision provider. Default: local Ollama (gemma4:12b, free).
Fallback chain: --provider openrouter, --provider gemini, --provider nvidia.

Never reads PNG via Claude's Read tool — always sends base64 to a vision API.

Model defaults (verified against live catalogs, Sep 2026):
  - ollama:     gemma4:12b                                (local)
  - openrouter: openrouter/auto                           (router)
  - gemini:     gemini-2.0-flash                          (stable GA)
  - nvidia:     meta/llama-3.2-90b-vision-instruct        (NB: meta/ NOT nvidia/meta/)
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

def _read_b64(png_path: Path) -> str:
    return base64.b64encode(png_path.read_bytes()).decode()

def _is_transient_error(msg: str) -> bool:
    """True if the error looks like 5xx, timeout, network, or rate-limit."""
    if not msg:
        return False
    m = msg.lower()
    return any(s in m for s in [
        " 5", "internal", "timeout", "timed out", "connection",
        "reset", "unavailable", "rate", "overloaded", "temporarily",
        "service unavailable", "bad gateway", "gateway timeout",
        "urlopen error", "http error 5",
    ])

def _is_offline_compatible() -> bool:
    """Probe local Ollama; return True if a vision model is loaded and reachable."""
    import urllib.request, urllib.error
    try:
        with urllib.request.urlopen("http://localhost:11434/api/tags", timeout=3) as r:
            import json as _json
            models = _json.loads(r.read()).get("models", [])
            # any multimodal / vision tag counts
            for m in models:
                name = m.get("name", "").lower()
                if any(k in name for k in ("vision", "vl", "gemma4", "llava", "minicpm-v", "qwen-vl")):
                    return True
        return False
    except Exception:
        return False

def _pick_offline_model() -> str:
    """Best offline vision model on this box. Order of preference."""
    import urllib.request, json as _json
    try:
        with urllib.request.urlopen("http://localhost:11434/api/tags", timeout=3) as r:
            models = [m.get("name","").lower() for m in _json.loads(r.read()).get("models", [])]
    except Exception:
        return "gemma4:12b"  # global default assumption
    # Preference order — local GPU/CPU, no API key, no cost
    for pref in ("gemma4:12b", "gemma4", "llama3.2-vision:latest", "llava:latest",
                 "llava:13b", "minicpm-v", "qwen2.5vl", "qwen-vl"):
        for m in models:
            if m == pref or m.startswith(pref):
                return m
    return models[0] if models else "gemma4:12b"

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
    # The NVIDIA Integrate API uses bare meta/ prefix — never nvidia/meta/.
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

# Models that are NOT known-broken but commonly mis-typed — show hint when used.
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
    p = argparse.ArgumentParser()
    p.add_argument("png_path", help="PNG screenshot path")
    p.add_argument("--provider", default="ollama", choices=list(PROVIDERS.keys()),
                   help="Vision provider — ALWAYS local ollama (default). Remote providers blocked unless --allow-remote passed.")
    p.add_argument("--allow-remote", action="store_true",
                   help="Explicit opt-in to remote vision APIs (gemini/openrouter/nvidia) — default OFF per user rule")
    p.add_argument("--ollama-url", default="http://localhost:11434")
    p.add_argument("--model", default=None, help="Override model (e.g. google/gemini-2.5-flash for openrouter)")
    p.add_argument("--prompt", default="Describe the layout, colors, alignment, and any visual issues you see in this page screenshot.")
    args = p.parse_args()

    png_path = Path(args.png_path)
    if not png_path.exists():
        print(f"ERROR: file not found: {png_path}", file=sys.stderr); sys.exit(1)

    # User rule: only local model visions — never remote APIs unless explicitly allowed
    if args.provider != "ollama" and not args.allow_remote:
        print(f"BLOCKED: provider '{args.provider}' requires --allow-remote. Using local ollama instead (per user: offline vision only).", file=sys.stderr)
        args.provider = "ollama"
        args.allow_remote = False

    func, env_key, default_url = PROVIDERS[args.provider]
    key = os.getenv(env_key)
    if args.provider != "ollama" and not key:
        print(f"ERROR: {env_key} not set. Add to .env or export.", file=sys.stderr); sys.exit(1)

    # OFFLINE-ONLY RULE: remote vision APIs never used for vision tasks.
    # If user passes --provider gemini/openrouter/nvidia without --allow-remote,
    # force ollama. The fallback chain below only activates when --allow-remote is set.
    if args.provider != "ollama" and not args.allow_remote:
        print(f"OFFLINE ONLY: forcing ollama (local vision) — '{args.provider}' blocked.", file=sys.stderr)
        args.provider = "ollama"

    # After determination, if still remote and allowed but failed, fall back to ollama
    if args.provider == "ollama":
        model = args.model or "gemma4:12b"
        result = func(png_path, args.prompt, url=args.ollama_url, model=model)
    else:
        if args.model:
            result = func(png_path, args.prompt, key, model=args.model)
        else:
            result = func(png_path, args.prompt, key)
        # OFFLINE FALLBACK RULE: if online vision is down / not free / 5xx / unavailable,
        # complete with local Ollama agents — never block on paid APIs.
        if _is_transient_error(result) or ("No response" in result and result.startswith("Ollama") is False):
            if _is_offline_compatible():
                offline_model = _pick_offline_model()
                offline_result = ollama_describe(png_path, args.prompt, url=args.ollama_url, model=offline_model)
                # Only override if offline actually returned content (not another error)
                if not offline_result.startswith("Ollama error") and offline_result not in ("No content.", "No response."):
                    print(f"[OFFLINE FALLBACK] Online {args.provider} unavailable/error → using local Ollama ({offline_model})")
                    result = offline_result
            else:
                print(f"[OFFLINE FALLBACK] Online {args.provider} error; Ollama vision not loaded — try: ollama pull {offline_model}")
    print(result)

if __name__ == "__main__":
    main()
