import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MotionService } from '../../services/motion.service';
import type { SceneHandle, SceneState } from './scene/scene-engine';
import type { HudStats } from '../hud/hud.component';

/**
 * Host for the global liquid-metal WebGL background. Renders one fixed canvas
 * behind all content and lazily loads the Three.js engine only in the browser,
 * only when motion is allowed and WebGL2 is available. Otherwise it renders
 * nothing and the CSS aurora fallback (app-aurora-background) remains visible.
 *
 * A reactive effect keeps this honest: toggling the OS "reduce motion" setting
 * at runtime tears the scene down (restoring the static fallback) or rebuilds it.
 */
@Component({
  selector: 'app-webgl-scene',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #canvas class="webgl-canvas" aria-hidden="true"></canvas>`,
  styleUrl: './webgl-scene.component.css',
})
export class WebglSceneComponent implements OnDestroy {
  private readonly motion = inject(MotionService);
  private readonly doc = inject(DOCUMENT);
  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  /** Live render stats consumed by the HUD; null while the scene is down. */
  readonly stats = signal<HudStats | null>(null);

  private readonly viewReady = signal(false);
  private handle: SceneHandle | null = null;
  private initializing = false;
  private supportChecked = false;
  private supported = false;

  /** Single reused state object — avoids allocating a literal every frame. */
  private readonly stateBuf: SceneState = { cursorX: 0, cursorY: 0, scroll: 0 };

  constructor() {
    afterNextRender(() => this.viewReady.set(true));

    // Drives (re)entry reactively: needs the view rendered, motion allowed,
    // and WebGL2 available. Re-runs whenever prefers-reduced-motion changes.
    effect(() => {
      const ready = this.viewReady();
      const reduced = this.motion.reduced();
      if (ready && !reduced && this.webglSupported()) {
        void this.init();
      } else if (ready) {
        this.teardown();
      }
    });
  }

  private readonly getState = (): SceneState => {
    const c = this.motion.cursor();
    this.stateBuf.cursorX = c.x;
    this.stateBuf.cursorY = c.y;
    this.stateBuf.scroll = this.motion.scrollProgress();
    return this.stateBuf;
  };

  private async init(): Promise<void> {
    if (this.handle || this.initializing) return;
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return;

    this.initializing = true;
    try {
      const { createLiquidScene } = await import('./scene/scene-engine');
      // The chunk loads async — bail if reduced-motion flipped meanwhile.
      if (this.motion.reduced()) return;
      this.handle = createLiquidScene(canvas, this.getState, {
        quality: this.detectQuality(),
        onLost: () => this.teardown(),
      });
      this.doc.body.classList.add('webgl-on');
      canvas.classList.add('is-ready');
    } catch {
      this.teardown();
    } finally {
      this.initializing = false;
    }
  }

  ngOnDestroy(): void {
    this.teardown();
  }

  private teardown(): void {
    const h = this.handle;
    this.handle = null;
    h?.dispose();
    this.stats.set(null);
    this.doc.body.classList.remove('webgl-on');
    this.canvasRef()?.nativeElement?.classList.remove('is-ready');
  }

  private detectQuality(): 'high' | 'low' {
    const win = this.doc.defaultView;
    if (!win) return 'low';
    const coarse = win.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const small = win.innerWidth < 768;
    const cores = win.navigator.hardwareConcurrency ?? 8;
    if (coarse || small || cores <= 2) return 'low';
    return 'high';
  }

  private webglSupported(): boolean {
    if (this.supportChecked) return this.supported;
    this.supportChecked = true;
    try {
      const canvas = this.doc.createElement('canvas');
      this.supported = !!(
        (this.doc.defaultView as any)?.WebGL2RenderingContext &&
        canvas.getContext('webgl2')
      );
    } catch {
      this.supported = false;
    }
    return this.supported;
  }
}
