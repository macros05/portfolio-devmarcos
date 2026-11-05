/** Persistent abstract field. One plane, one shader, resolution capped. */

export interface FieldHandle {
  destroy: () => void;
  setChapter: (index: number) => void;
  setPointer: (x: number, y: number) => void;
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
  uniform float uChapter;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.02 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return v;
  }

  vec3 tone(float ch) {
    vec3 silver = vec3(0.62, 0.66, 0.74);
    vec3 copper = vec3(0.82, 0.40, 0.24);
    vec3 steel  = vec3(0.38, 0.52, 0.56);
    vec3 amber  = vec3(0.78, 0.58, 0.30);
    vec3 ash    = vec3(0.55, 0.54, 0.52);
    vec3 dusk   = vec3(0.42, 0.36, 0.48);
    float k = clamp(ch, 0.0, 5.0);
    if (k < 1.0) return mix(silver, copper, k);
    if (k < 2.0) return mix(copper, steel, k - 1.0);
    if (k < 3.0) return mix(steel, amber, k - 2.0);
    if (k < 4.0) return mix(amber, ash, k - 3.0);
    return mix(ash, dusk, k - 4.0);
  }

  void main() {
    vec2 p = (vUv - 0.5);
    p.x *= uRes.x / max(uRes.y, 1.0);
    float ch = clamp(uChapter, 0.0, 5.0);
    float scale = mix(1.15, 2.6, ch / 5.0);
    float warp = 0.85 + 0.55 * sin(ch * 1.1);
    float drift = uTime * (0.035 + 0.012 * ch);
    vec2 q = p * scale + uMouse * 0.22;
    q += vec2(drift, drift * 0.6);
    vec2 d = vec2(fbm(q), fbm(q + vec2(5.2, 1.3)));
    vec2 r = vec2(
      fbm(q + d * warp + vec2(1.7, 9.2)),
      fbm(q + d * warp + vec2(8.3, 2.8))
    );
    float f = fbm(q + r * warp);

    vec3 base = vec3(0.025, 0.026, 0.03);
    vec3 ink = tone(ch);
    vec3 col = mix(base, ink * 0.55, smoothstep(0.25, 0.72, f));
    col += vec3(0.95, 0.93, 0.9) * smoothstep(0.78, 0.96, f) * 0.45;
    col += ink * smoothstep(0.55, 0.7, f) * 0.25;

    float g = hash(vUv * uRes + fract(uTime) * 40.0);
    col += (g - 0.5) * 0.035;
    float vig = smoothstep(1.35, 0.2, length(p));
    col *= mix(0.45, 1.0, vig);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export async function mountField(canvas: HTMLCanvasElement): Promise<FieldHandle> {
  const THREE = await import('three');
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x070708, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uniforms = {
    uRes: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uChapter: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERT,
    fragmentShader: FRAG,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(mesh);

  const mouse = { x: 0, y: 0 };
  const targetMouse = { x: 0, y: 0 };
  let chapter = 0;
  let chapterNow = 0;
  let running = true;
  let raf = 0;
  const clock = new THREE.Clock();

  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    let ratio = Math.min(window.devicePixelRatio || 1, w < 800 ? 1 : 1.25);
    if (w * ratio > 1600) ratio = 1600 / w;
    renderer.setPixelRatio(ratio);
    renderer.setSize(w, h, false);
    uniforms.uRes.value.set(w * ratio, h * ratio);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  const onHide = () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else raf = requestAnimationFrame(loop);
  };
  document.addEventListener('visibilitychange', onHide);

  const loop = () => {
    if (!running || document.hidden) return;
    const t = clock.getElapsedTime();
    mouse.x += (targetMouse.x - mouse.x) * 0.05;
    mouse.y += (targetMouse.y - mouse.y) * 0.05;
    chapterNow += (chapter - chapterNow) * 0.04;
    uniforms.uTime.value = t;
    uniforms.uMouse.value.set(mouse.x, mouse.y);
    uniforms.uChapter.value = chapterNow;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  return {
    setChapter(index: number) {
      chapter = index;
    },
    setPointer(x: number, y: number) {
      targetMouse.x = x;
      targetMouse.y = y;
    },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener('visibilitychange', onHide);
      mesh.geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
