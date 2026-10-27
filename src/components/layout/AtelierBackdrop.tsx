"use client";

import { useEffect, useRef } from "react";

/**
 * Atelier Backdrop — Marrakech, after dusk.
 *
 * A single fixed WebGL layer behind the page: near-black ink, a late sun
 * raking across a carved zellige screen, a brass lantern that follows the
 * pointer, dust suspended in the light, and a thin shimmer of courtyard
 * water at the base. It is intentionally quiet — the lattice never competes
 * with type; it only catches the light where the light happens to fall.
 *
 * Engineering notes:
 *  - No dependencies. WebGL1 + one fullscreen quad.
 *  - Resolution is DPR-capped and pixel-budgeted; the loop pauses when the
 *    tab is hidden and never starts under `prefers-reduced-motion` (a single
 *    still frame is drawn instead).
 *  - Pointer / scroll / hover are eased in the render loop, so the motion
 *    trails the input instead of snapping to it.
 *  - If WebGL is unavailable the CSS underlay (a graded ink wash) remains.
 */

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform vec2  u_res;
uniform vec2  u_ptr;
uniform float u_time;
uniform float u_scroll;
uniform float u_hover;
uniform float u_intensity;

const vec3 INK    = vec3(0.0075, 0.0072, 0.0070);
const vec3 GOLD   = vec3(0.890, 0.636, 0.286);
const vec3 GOLD2  = vec3(0.988, 0.836, 0.556);
const vec3 EMBER  = vec3(0.735, 0.330, 0.150);
const vec3 IVORY  = vec3(0.974, 0.958, 0.924);

float hash21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

/* Khatam tracery: the outline of the eight-point star (two squares, one
   turned 45 degrees), with a small rosette where four tiles meet. */
float khatam(vec2 q, float scale, float a, float w) {
  vec2 r = q * scale;
  vec2 g = fract(r) - 0.5;
  float sq = max(abs(g.x), abs(g.y));
  float di = (abs(g.x) + abs(g.y)) * 0.70710678;
  float line = smoothstep(w, 0.0, abs(min(sq, di) - a));

  vec2 h = fract(r + 0.5) - 0.5;
  float hs = max(abs(h.x), abs(h.y));
  float hd = (abs(h.x) + abs(h.y)) * 0.70710678;
  float joint = smoothstep(w * 0.85, 0.0, abs(min(hs, hd) - 0.050));

  return line + 0.55 * joint;
}

/* Suspended dust: one mote per hash cell, sparse, drifting up and to the
   right, brighter where the light is. */
float motes(vec2 p, float t, float scale, float seed) {
  vec2 g = p * scale + vec2(t * 0.012, -t * 0.019) + seed + u_ptr * 0.30;
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  float h = hash21(id + seed);
  vec2 off = vec2(hash21(id + 11.3), hash21(id + 47.1)) - 0.5;
  float d = length(f - off * 0.70);
  float size = 0.015 + 0.028 * h;
  float core = smoothstep(size, 0.0, d);
  float twinkle = 0.40 + 0.60 * sin(t * (0.22 + h * 0.55) + h * 31.0);
  return core * step(0.880, h) * max(twinkle, 0.0);
}

void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - u_res) / min(u_res.x, u_res.y);
  vec2 uv = gl_FragCoord.xy / u_res;

  float t = u_time;
  vec2 ptr = u_ptr;

  /* ---- The room: near-black ink, warm only where the light lands ------- */
  vec3 col = INK;
  col += vec3(0.013, 0.0095, 0.0062) * smoothstep(0.16, 1.02, uv.y);
  col += vec3(0.0060, 0.0044, 0.0030) * smoothstep(0.86, 0.10, uv.y);

  float breath = 0.955 + 0.045 * sin(t * 0.11);

  /* ---- Key light: a low sun through a high window, upper right --------- */
  vec2 kc = vec2(0.665 + 0.020 * sin(t * 0.041),
                 0.735 + 0.018 * cos(t * 0.037) - u_scroll * 0.10);
  vec2 kd = (uv - kc) / vec2(0.46, 0.45);
  float kr = dot(kd, kd);
  float key  = exp(-kr * 3.60);
  float halo = exp(-kr * 0.90);

  /* ---- Lantern: the pointer -------------------------------------------- */
  vec2 ld = (uv - ptr) / vec2(0.34, 0.34);
  float lantern = exp(-dot(ld, ld) * 3.4) * (0.24 + 0.76 * u_hover);

  /* ---- Shafts: light combed through the screen ------------------------- */
  vec2 bd = uv - kc;
  float ca = -0.55;
  mat2 rm = mat2(cos(ca), -sin(ca), sin(ca), cos(ca));
  vec2 b = rm * bd;
  float shafts = pow(0.5 + 0.5 * cos(b.x * 13.0 + t * 0.035), 7.0)
               * exp(-length(bd) * 2.4);

  float light = (key * 0.90 + halo * 0.12 + lantern * 0.62 + shafts * 0.30) * breath;

  /* The beam is a raking wedge: the screen is only legible inside it. */
  float beam = smoothstep(0.16, 0.70,
                 (uv.x * 0.55 + uv.y * 0.92) - 0.54);

  /* ---- The screen ------------------------------------------------------ */
  vec2 wall = vec2(p.x, p.y + u_scroll * 0.58);
  wall += (ptr - vec2(0.5, 0.52)) * 0.085;
  /* a whisper of perspective: tiles shrink toward the top of the wall */
  wall *= 1.0 / (1.0 + 0.055 * (p.y + 0.55));

  float aperture = khatam(wall, 5.6, 0.300, 0.0100);
  float bloom    = khatam(wall, 5.6, 0.300, 0.0950);
  float screenF  = aperture * 0.74 + bloom * 0.26;

  /* It lives on the wall, above the pool, and only where light reaches. */
  float wallMask = smoothstep(-0.60, -0.16, p.y);
  float lit = smoothstep(0.045, 0.480, light);
  screenF *= wallMask * lit * (0.06 + 0.94 * beam);

  /* Carved edge: a whisper of highlight on the fillet of each line. */
  float rim = aperture * aperture;

  /* ---- Courtyard water at the base ------------------------------------- */
  float pool = smoothstep(-0.46, -1.06, p.y);
  float ripple = sin(p.y * 26.0 + sin(uv.x * 7.0 + t * 0.30) * 2.2 + t * 0.18);
  float caustic = pow(max(ripple, 0.0), 9.0) * pool * (0.20 + 0.80 * halo);

  float ledge = exp(-pow((p.y + 0.500) * 13.0, 2.0));
  float ledge2 = exp(-pow((p.y + 0.585) * 22.0, 2.0));

  /* ---- Dust ------------------------------------------------------------ */
  float dust = motes(p, t, 5.6, 0.0)
             + 0.58 * motes(p, t * 1.31, 9.1, 2.7)
             + 0.34 * motes(p, t * 0.83, 14.2, 6.1);

  /* ---- Composite ------------------------------------------------------- */
  col += vec3(0.930, 0.700, 0.380) * key  * 0.185 * (1.0 - u_scroll * 0.12);
  col += vec3(0.760, 0.500, 0.250) * halo * 0.030;
  col += GOLD2 * shafts * 0.010;
  col += EMBER * lantern * 0.040;

  col += mix(GOLD, GOLD2, 0.20 + 0.42 * key) * screenF * 0.400;
  col += GOLD2 * rim * screenF * 0.020;

  col += GOLD * caustic * 0.020;
  col += GOLD * ledge * 0.020 * (0.30 + 0.70 * halo);
  col += mix(GOLD, IVORY, 0.55) * ledge2 * 0.010 * halo;

  col += mix(GOLD, IVORY, 0.60) * dust * (0.06 + 0.94 * light) * 0.82;

  /* ---- Frame ----------------------------------------------------------- */
  vec2 vc = (uv - vec2(0.5, 0.54)) * vec2(1.02, 1.30);
  float vig = smoothstep(0.86, 0.10, length(vc));
  col *= mix(0.34, 1.0, vig);

  float grain = hash21(gl_FragCoord.xy + fract(t) * 137.0);
  col += (grain - 0.5) * 0.011;

  /* Soft shoulder: keep the highlights filmlike instead of washing out. */
  col = 1.0 - exp(-col * 1.45);

  col *= u_intensity;

  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("[atelier] shader:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function AtelierBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext("webgl", {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "low-power",
        preserveDrawingBuffer: false,
      }) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    if (!gl) {
      canvas.dataset.fallback = "true";
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();
    if (!vs || !fs || !program) {
      canvas.dataset.fallback = "true";
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      canvas.dataset.fallback = "true";
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_res");
    const uPtr = gl.getUniformLocation(program, "u_ptr");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uScroll = gl.getUniformLocation(program, "u_scroll");
    const uHover = gl.getUniformLocation(program, "u_hover");
    const uIntensity = gl.getUniformLocation(program, "u_intensity");

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    /* ── Eased state ── */
    const pointer = { x: 0.5, y: 0.58, tx: 0.5, ty: 0.58 };
    const scroll = { value: 0, target: 0 };
    const hover = { value: 0.25, target: 0.25 };

    let width = 0;
    let height = 0;
    let raf = 0;
    let running = false;
    let start = performance.now();

    const resize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const budget = 2_900_000;
      let dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      if (vw * vh * dpr * dpr > budget) {
        dpr = Math.sqrt(budget / (vw * vh));
      }

      width = Math.max(1, Math.round(vw * dpr));
      height = Math.max(1, Math.round(vh * dpr));

      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);

      draw(performance.now(), true);
    };

    const draw = (now: number, force = false) => {
      const ease = force ? 1 : 0.055;

      pointer.x += (pointer.tx - pointer.x) * ease;
      pointer.y += (pointer.ty - pointer.y) * ease;
      scroll.value += (scroll.target - scroll.value) * (force ? 1 : 0.075);
      hover.value += (hover.target - hover.value) * (force ? 1 : 0.05);

      /* gl_FragCoord is y-up; pointer is y-down. */
      gl.uniform2f(uRes, width, height);
      gl.uniform2f(uPtr, pointer.x, 1 - pointer.y);
      gl.uniform1f(uTime, ((now - start) / 1000) % 1000);
      gl.uniform1f(uScroll, scroll.value);
      gl.uniform1f(uHover, hover.value);
      gl.uniform1f(uIntensity, 1.0);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now: number) => {
      if (!running) return;
      draw(now);
      raf = requestAnimationFrame(loop);
    };

    const startLoop = () => {
      if (running || reduceMotion) return;
      running = true;
      start = performance.now();
      raf = requestAnimationFrame(loop);
    };

    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.tx = event.clientX / Math.max(1, window.innerWidth);
      pointer.ty = event.clientY / Math.max(1, window.innerHeight);
      hover.target = 1;
    };

    const onPointerLeave = () => {
      hover.target = 0.15;
      pointer.tx = 0.5;
      pointer.ty = 0.55;
    };

    const onPointerEnter = () => {
      hover.target = 1;
    };

    const onScroll = () => {
      const max =
        document.documentElement.scrollHeight - window.innerHeight || 1;
      scroll.target = Math.min(1, Math.max(0, window.scrollY / max));
    };

    const onVisibility = () => {
      if (document.hidden) stopLoop();
      else if (!reduceMotion) startLoop();
    };

    const onContextLost = (event: Event) => {
      event.preventDefault();
      stopLoop();
    };

    const onContextRestored = () => {
      window.location.reload();
    };

    resize();
    onScroll();

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });
    window.addEventListener("pointerenter", onPointerEnter, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    if (reduceMotion) {
      draw(performance.now() + 4200, true);
    } else {
      startLoop();
    }

    return () => {
      stopLoop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("pointerenter", onPointerEnter);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);

      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      /* Do not force-lose the context: React StrictMode mounts, cleans up and
         mounts again on the same canvas, and a lost context cannot be revived
         by a second getContext() call. The browser reclaims it on its own. */
    };
  }, []);

  return (
    <div aria-hidden className="atelier-backdrop fixed inset-0 -z-10 overflow-hidden">
      {/* CSS underlay — what you see if WebGL is unavailable, and the warm
          floor the canvas composites over while it boots. */}
      <div className="atelier-underlay absolute inset-0" />

      <canvas ref={canvasRef} className="atelier-canvas" />

      {/* Edges: the room recedes into shadow at the frame. */}
      <div className="atelier-edge absolute inset-0" />
    </div>
  );
}
