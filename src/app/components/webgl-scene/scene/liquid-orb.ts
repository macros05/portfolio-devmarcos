import * as THREE from 'three';
import { ORB_VERTEX, ORB_FRAGMENT } from './shaders';
import { PALETTE } from './palette';

export interface LiquidOrb {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  uniforms: Record<string, THREE.IUniform>;
  dispose(): void;
}

/**
 * Builds the hero centrepiece — a high-subdivision icosphere whose surface is
 * displaced in the vertex shader to read like breathing liquid metal.
 *
 * @param detail Icosahedron subdivision (5 ≈ 10k verts desktop, 4 ≈ 2.5k mobile).
 */
export function createLiquidOrb(detail: number): LiquidOrb {
  const geometry = new THREE.IcosahedronGeometry(1, detail);

  const uniforms: Record<string, THREE.IUniform> = {
    uTime: { value: 0 },
    uDisplace: { value: 0.2 },
    uFreq: { value: 1.1 },
    uSpeed: { value: 0.13 },
    uRim: { value: 1 },
    uColorDeep: { value: new THREE.Color(PALETTE.surface).multiplyScalar(0.55) },
    uColorSteel: { value: new THREE.Color(PALETTE.steel) },
    uColorChamp: { value: new THREE.Color(PALETTE.champagne) },
    uColorSoft: { value: new THREE.Color(PALETTE.soft) },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: ORB_VERTEX,
    fragmentShader: ORB_FRAGMENT,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.scale.setScalar(1.8);

  return {
    mesh,
    material,
    uniforms,
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
