import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';

/**
 * Thin typed wrapper around three's GPUComputationRenderer for a classic
 * position/velocity particle simulation. The two compute fragment shaders
 * receive `texturePosition`, `textureVelocity` and `resolution` automatically;
 * any extra uniforms are merged in before init().
 */
export interface GpgpuConfig {
  positionShader: string;
  velocityShader: string;
  fillPosition: (data: Float32Array) => void;
  fillVelocity: (data: Float32Array) => void;
  posUniforms?: Record<string, THREE.IUniform>;
  velUniforms?: Record<string, THREE.IUniform>;
}

export interface Gpgpu {
  compute(): void;
  getPosition(): THREE.Texture;
  getVelocity(): THREE.Texture;
  posUniforms: Record<string, THREE.IUniform>;
  velUniforms: Record<string, THREE.IUniform>;
  dispose(): void;
}

/** Build and initialise a square (size×size) GPGPU simulation. Throws on init failure. */
export function createGpgpu(
  renderer: THREE.WebGLRenderer,
  size: number,
  cfg: GpgpuConfig,
): Gpgpu {
  const gpu = new GPUComputationRenderer(size, size, renderer);

  const posTex = gpu.createTexture();
  const velTex = gpu.createTexture();
  cfg.fillPosition(posTex.image.data as unknown as Float32Array);
  cfg.fillVelocity(velTex.image.data as unknown as Float32Array);

  const posVar = gpu.addVariable('texturePosition', cfg.positionShader, posTex);
  const velVar = gpu.addVariable('textureVelocity', cfg.velocityShader, velTex);

  gpu.setVariableDependencies(posVar, [posVar, velVar]);
  gpu.setVariableDependencies(velVar, [posVar, velVar]);

  if (cfg.posUniforms) Object.assign(posVar.material.uniforms, cfg.posUniforms);
  if (cfg.velUniforms) Object.assign(velVar.material.uniforms, cfg.velUniforms);

  const err = gpu.init();
  if (err) throw new Error(`GPUComputationRenderer init failed: ${err}`);

  return {
    compute: () => gpu.compute(),
    getPosition: () => gpu.getCurrentRenderTarget(posVar).texture,
    getVelocity: () => gpu.getCurrentRenderTarget(velVar).texture,
    posUniforms: posVar.material.uniforms,
    velUniforms: velVar.material.uniforms,
    dispose: () => gpu.dispose(),
  };
}
