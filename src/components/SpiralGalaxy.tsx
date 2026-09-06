'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const STAR_COUNT = 18_000;

function generateStarfield() {
  const pos = new Float32Array(STAR_COUNT * 3);
  const sz  = new Float32Array(STAR_COUNT);
  const col = new Float32Array(STAR_COUNT * 3);

  const C_WHITE = new THREE.Color(0.90, 0.92, 0.96);
  const C_GREY  = new THREE.Color(0.55, 0.58, 0.65);
  const C_BLUE  = new THREE.Color(0.40, 0.62, 1.00);
  const C_WARM  = new THREE.Color(1.00, 0.85, 0.55);

  for (let i = 0; i < STAR_COUNT; i++) {
    // Wide Y-axis spread: from Y = -50 to Y = 10 (massive vertical universe to scroll through)
    const r = Math.exp(Math.random() * 1.8) * 0.7 + Math.random() * 5.0;
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = Math.random() * 60 - 50; // Y from -50 to +10
    pos[i * 3 + 2] = (Math.random() - 0.5) * 3.0;

    const isGiant = Math.random() < 0.008;
    sz[i] = isGiant ? (0.8 + Math.random() * 1.2) : (0.15 + Math.pow(Math.random(), 5) * 0.6);

    const roll = Math.random();
    let c: THREE.Color;
    if (roll < 0.90) {
      c = roll < 0.70 ? C_WHITE : C_GREY;
    } else if (roll < 0.95) {
      c = C_BLUE;
    } else {
      c = C_WARM;
    }
    c.multiplyScalar(0.5 + Math.random() * 0.5);
    col[i * 3]     = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  return { pos, sz, col };
}

function StarField() {
  const pts = useRef<THREE.Points>(null);
  const g = useMemo(() => generateStarfield(), []);

  const geo = useMemo(() => {
    const g2 = new THREE.BufferGeometry();
    g2.setAttribute('position', new THREE.BufferAttribute(g.pos, 3));
    g2.setAttribute('aSize',    new THREE.BufferAttribute(g.sz,  1));
    g2.setAttribute('aColor',   new THREE.BufferAttribute(g.col, 3));
    return g2;
  }, [g]);

  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `
      attribute float aSize;
      attribute vec3  aColor;
      uniform float uTime;
      uniform float uPixelRatio;
      varying vec3  vColor;
      varying float vDepth01;
      void main() {
        vColor = aColor;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        float depth = max(-mvPosition.z, 0.5);
        vDepth01 = smoothstep(2.0, 80.0, depth);
        gl_PointSize = aSize * (300.0 / depth) * uPixelRatio;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3  vColor;
      varying float vDepth01;
      void main() {
        float r = length(gl_PointCoord.xy - vec2(0.5));
        if (r > 0.5) discard;
        float alpha = exp(-r * 15.0);
        if (alpha < 0.05) discard;
        float depthFade = mix(1.0, 0.4, vDepth01);
        alpha *= depthFade;
        vec3 col = vColor * (1.0 + (1.0 - vDepth01) * 0.3);
        gl_FragColor = vec4(vColor * (1.0 + (1.0 - vDepth01) * 0.3), alpha * 0.92);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: 2 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), []);

  // Slow ambient drift on Y-axis (not rotation) so the universe feels alive even at rest
  useFrame((state, delta) => {
    if (!pts.current) return;
    pts.current.rotation.y += delta * 0.015;

    // Scroll → camera dives through the galaxy at 1:1 ratio
    state.camera.position.y = -(window.scrollY * 0.01);
  });

  return <points ref={pts} geometry={geo} material={mat} />;
}

export default function SpiralGalaxyBackground() {
  const glRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (glRef.current) {
        glRef.current.dispose();
        glRef.current = null;
      }
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed inset-0 w-screen h-screen -z-10 pointer-events-none"
      style={{ background: '#020305' }}
    >
      <Canvas
        camera={{ position: [0, 0, 14], fov: 60 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
        }}
        dpr={[1, 2]}
        style={{ width: '100vw', height: '100vh' }}
        onCreated={({ gl, size }) => {
          glRef.current = gl;
          gl.setClearColor(0x020305, 1);
          gl.setSize(size.width, size.height);
        }}
      >
        <StarField />
      </Canvas>
    </div>
  );
}
