import * as THREE from 'three';
import { PARTICLE_VERTEX, PARTICLE_FRAGMENT } from './shaders';
import { PALETTE } from './palette';

export interface ParticleField {
  points: THREE.Points;
  uniforms: Record<string, THREE.IUniform>;
  dispose(): void;
}

/**
 * Ambient dust — additive points scattered through a deep box volume to give
 * the scene parallax and a faint champagne shimmer.
 */
export function createParticles(count: number, pixelRatio: number): ParticleField {
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const seeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;
    scales[i] = 0.3 + Math.random() * 0.7;
    seeds[i] = Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

  const uniforms: Record<string, THREE.IUniform> = {
    uTime: { value: 0 },
    uPixelRatio: { value: pixelRatio },
    uSize: { value: 1.6 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uScroll: { value: 0 },
    uFade: { value: 1 },
    uColor: { value: new THREE.Color(PALETTE.steel) },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: PARTICLE_VERTEX,
    fragmentShader: PARTICLE_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;

  return {
    points,
    uniforms,
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
