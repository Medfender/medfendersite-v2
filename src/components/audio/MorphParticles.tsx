'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 15000;

import { vertexShader, fragmentShader } from '@/shaders/morphParticles';

export interface FrequencyBands {
  high: number;
  mid: number;
  low: number;
}

interface MorphParticlesProps {
  scrollRef: React.RefObject<number>;
  mouseRef: React.RefObject<{ x: number; y: number }>;
  getFrequencyBands: () => FrequencyBands;
}

/**
 * Renders ~15,000 particles as a single THREE.Points draw call.
 * Three BufferAttributes (positionA/B/C) are interpolated in the vertex
 * shader to morph between waveform, vinyl, and nebula shapes based on
 * uScroll. Audio + mouse uniforms modulate the morph each frame.
 *
 * The JavaScript useFrame loop ONLY writes uniform values — geometry
 * attributes are never updated, keeping the per-frame cost minimal.
 */
export default function MorphParticles({
  scrollRef,
  mouseRef,
  getFrequencyBands,
}: MorphParticlesProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Shape A: Audio waveform grid (20x20x8 with sine-undulating Y)
  const positionA = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    const cols = 20;
    const rows = 20;
    const depth = 8;
    const spacing = 0.09;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols) % rows;
      const dep = Math.floor(i / (cols * rows)) % depth;
      const x = (col - cols / 2 + 0.5) * spacing;
      const y = (row - rows / 2 + 0.5) * spacing;
      const z = (dep - depth / 2 + 0.5) * spacing;
      const wave = Math.sin(col * 0.6) * 0.18 + Math.cos(row * 0.8) * 0.12;
      arr[i * 3] = x;
      arr[i * 3 + 1] = y + wave;
      arr[i * 3 + 2] = z;
    }
    return arr;
  }, []);

  // Shape B: Vinyl record (concentric rings with groove detail)
  const positionB = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    const radiusMax = 2.8;
    const rings = 40;
    const grooveDetail = 12;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ring = i % rings;
      const seg = Math.floor(i / rings) % grooveDetail;
      const jitter = ((i / rings / grooveDetail) % 1) * 0.3 - 0.15;
      const r = (ring / rings) * radiusMax + jitter * 0.05;
      const theta = (seg / grooveDetail) * Math.PI * 2 + (ring % 2) * 0.04;
      const grooveAmp = ring % 3 === 0 ? 0.06 : 0.02;
      arr[i * 3] = Math.cos(theta) * r;
      arr[i * 3 + 1] = Math.sin(theta) * r;
      arr[i * 3 + 2] = Math.sin(ring * 0.9 + seg * 0.3) * grooveAmp;
    }
    return arr;
  }, []);

  // Shape C: Nebula sphere (randomized spherical distribution)
  const positionC = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = 2.2 + (Math.random() - 0.5) * 0.8;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  // Single BufferGeometry with all three position attributes.
  // NOTE: 'position' (lowercase) is required — THREE.Points reads it by default.
  // positionA/B/C are additional custom attributes for the morph shader.
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positionA, 3));
    geo.setAttribute('positionA', new THREE.BufferAttribute(positionA, 3));
    geo.setAttribute('positionB', new THREE.BufferAttribute(positionB, 3));
    geo.setAttribute('positionC', new THREE.BufferAttribute(positionC, 3));
    return geo;
  }, [positionA, positionB, positionC]);

  // Uniforms — created once, mutated in useFrame.
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uAudioLow: { value: 0 },
      uAudioMid: { value: 0 },
      uAudioHigh: { value: 0 },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;

    u.uTime.value = clock.getElapsedTime();
    u.uScroll.value = scrollRef.current ?? 0;

    if (mouseRef.current) {
      u.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);
    }

    const { high, mid, low } = getFrequencyBands();
    u.uAudioLow.value = low;
    u.uAudioMid.value = mid;
    u.uAudioHigh.value = high;
  });

  return (
    <>
      <points geometry={geometry} frustumCulled={false}>
        <pointsMaterial color="#00E5CC" size={8} sizeAttenuation transparent />
      </points>
    </>
  );
}
