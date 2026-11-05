/**
 * Full-viewport film gate. One plane, one fragment shader.
 * The mouse drags an anamorphic slit; scroll closes the gate.
 * Three.js stays in this lazy chunk.
 */
export interface GateHandle {
  destroy: () => void;
  setPointer: (x: number, y: number) => void;
  setScroll: (closed: number) => void;
}

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform vec2 uRes;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uGate;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec2 p = vUv - 0.5;
    p.x *= uRes.x / max(uRes.y, 1.0);

    float open = mix(0.015, 0.46, uGate);
    float edge = abs(p.y);
    float gate = smoothstep(open, open + 0.012, edge);

    float y = p.y - uMouse.y * 0.12;
    float x = p.x - uMouse.x * 0.28;
    float streak = exp(-pow(y * 14.0, 2.0)) * exp(-pow(x * 1.15, 2.0));
    float core = exp(-pow(y * 48.0, 2.0)) * exp(-pow(x * 1.6, 2.0));
    float breathe = 0.82 + 0.18 * sin(uTime * 0.7);

    vec3 col = vec3(0.028, 0.027, 0.025);
    col += vec3(0.86, 0.28, 0.12) * streak * 0.75 * breathe;
    col += vec3(1.0, 0.93, 0.84) * core * 0.95;

    float grain = hash(vUv * uRes.xy + fract(uTime * 13.0));
    col += (grain - 0.5) * 0.045;

    float scratch = step(0.992, hash(vec2(floor(vUv.x * uRes.x * 0.5), floor(uTime * 8.0))));
    col += scratch * 0.05;

    col *= 1.0 - gate * 0.94;
    float vig = smoothstep(1.25, 0.25, length(p));
    col *= mix(0.55, 1.0, vig);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export async function mountGate(canvas: HTMLCanvasElement): Promise<GateHandle> {
  const THREE = await import('three');
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x070706, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uniforms = {
    uRes: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uGate: { value: 1 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERT,
    fragmentShader: FRAG,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(mesh);

  const pointer = { x: 0, y: 0 };
  const mouse = { x: 0, y: 0 };
  let gate = 1;
  let running = true;
  let visible = true;
  let raf = 0;
  const clock = new THREE.Clock();

  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(ratio);
    renderer.setSize(w, h, false);
    uniforms.uRes.value.set(w, h);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  const io = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    if (visible && running) raf = requestAnimationFrame(loop);
  });
  io.observe(canvas);

  const onHide = () => {
    if (document.hidden) visible = false;
  };
  document.addEventListener('visibilitychange', onHide);

  const loop = () => {
    if (!running || !visible || document.hidden) return;
    const t = clock.getElapsedTime();
    mouse.x += (pointer.x - mouse.x) * 0.08;
    mouse.y += (pointer.y - mouse.y) * 0.08;
    uniforms.uTime.value = t;
    uniforms.uMouse.value.set(mouse.x, mouse.y);
    uniforms.uGate.value = gate;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  return {
    setPointer(x, y) {
      pointer.x = x;
      pointer.y = y;
    },
    setScroll(closed) {
      gate = 1 - Math.min(1, Math.max(0, closed));
    },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onHide);
      mesh.geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
