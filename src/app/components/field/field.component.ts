import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  afterNextRender,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MotionService } from '../../services/motion.service';

/**
 * One fullscreen shader for the whole page. Scroll picks a chapter and the
 * field morphs. Three.js is imported only here, and only when motion is allowed.
 */
@Component({
  selector: 'app-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <canvas #canvas [class.is-off]="!live()" aria-hidden="true"></canvas>
    <div class="still" [class.is-off]="live()" aria-hidden="true"></div>
  `,
  styles: [`
    :host {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      background: #070708;
    }
    canvas, .still { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
    canvas.is-off { visibility: hidden; }
    .still {
      background:
        radial-gradient(ellipse 80% 60% at 70% 40%, rgba(180, 170, 160, 0.18), transparent 60%),
        radial-gradient(ellipse 50% 40% at 20% 80%, rgba(90, 100, 120, 0.16), transparent 55%),
        #070708;
    }
    .still.is-off { display: none; }
  `],
})
export class FieldComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly motion = inject(MotionService);
  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  protected readonly live = signal(false);

  private readonly ready = signal(false);
  private handle: { destroy: () => void; setChapter: (n: number) => void; setPointer: (x: number, y: number) => void } | null = null;
  private starting = false;
  private chapter = 0;
  private pointer = { x: 0, y: 0 };
  private onMove = (e: PointerEvent) => {
    this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    this.handle?.setPointer(this.pointer.x, this.pointer.y);
  };
  private onOrient = (e: DeviceOrientationEvent) => {
    if (e.gamma == null || e.beta == null) return;
    this.pointer.x = Math.max(-1, Math.min(1, e.gamma / 32));
    this.pointer.y = Math.max(-1, Math.min(1, (e.beta - 35) / 40));
    this.handle?.setPointer(this.pointer.x, this.pointer.y);
  };
  private onDown = () => {
    const orientation = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    orientation.requestPermission?.().then(state => {
      if (state === 'granted') window.addEventListener('deviceorientation', this.onOrient);
    }).catch(() => undefined);
  };
  private onScroll = () => {
    const nodes = document.querySelectorAll<HTMLElement>('[data-chapter]');
    const mid = window.innerHeight * 0.45;
    let best = 0;
    let bestDist = Infinity;
    nodes.forEach(node => {
      const rect = node.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const dist = Math.abs(rect.top + rect.height * 0.35 - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = Number(node.dataset['chapter'] ?? 0);
      }
    });
    if (best !== this.chapter) {
      this.chapter = best;
      this.handle?.setChapter(best);
    }
  };

  constructor() {
    afterNextRender(() => this.ready.set(true));
    effect(() => {
      if (!this.ready() || !isPlatformBrowser(this.platformId)) return;
      if (this.motion.reduced() || !this.webgl()) {
        this.live.set(false);
        this.teardown();
        return;
      }
      this.live.set(true);
      void this.start();
    });
  }

  ngOnDestroy(): void {
    this.teardown();
  }

  private webgl(): boolean {
    try {
      return !!document.createElement('canvas').getContext('webgl2');
    } catch {
      return false;
    }
  }

  private async start(): Promise<void> {
    if (this.handle || this.starting) return;
    this.starting = true;
    try {
      const canvas = this.canvasRef()?.nativeElement;
      if (!canvas || this.motion.reduced()) return;
      const { mountField } = await import('./field-scene');
      if (this.motion.reduced() || !this.live()) return;
      const handle = await mountField(canvas);
      if (this.motion.reduced() || !this.live()) {
        handle.destroy();
        return;
      }
      this.handle = handle;
      handle.setChapter(this.chapter);
      window.addEventListener('pointermove', this.onMove, { passive: true });
      window.addEventListener('pointerdown', this.onDown);
      window.addEventListener('deviceorientation', this.onOrient);
      window.addEventListener('scroll', this.onScroll, { passive: true });
      this.onScroll();
    } finally {
      this.starting = false;
    }
  }

  private teardown(): void {
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerdown', this.onDown);
    window.removeEventListener('deviceorientation', this.onOrient);
    window.removeEventListener('scroll', this.onScroll);
    this.handle?.destroy();
    this.handle = null;
  }
}
