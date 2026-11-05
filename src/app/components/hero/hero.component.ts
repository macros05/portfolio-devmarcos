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
import { LanguageService } from '../../services/language.service';
import { MotionService } from '../../services/motion.service';
import { RevealDirective } from '../../directives/reveal.directive';
import { MediaSlotComponent } from '../media-slot/media-slot.component';
import { HERO_REEL } from '../../data/film.data';
import type { HeroField } from './hero-field';

@Component({
  selector: 'app-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, MediaSlotComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent implements OnDestroy {
  private readonly lang = inject(LanguageService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly motion = inject(MotionService);
  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('field');

  readonly t = this.lang.t;
  protected readonly reel = HERO_REEL;
  /** Canvas is in the DOM only when the quiet WebGL object is allowed. */
  protected readonly showField = signal(false);

  private readonly viewReady = signal(false);
  /** The object covers the headline on a phone, so it stays desktop-only. */
  private readonly narrow = signal(false);
  private field: HeroField | null = null;
  private starting = false;
  private supportChecked = false;
  private supported = false;

  constructor() {
    afterNextRender(() => {
      const mq = window.matchMedia('(max-width: 760px)');
      const apply = () => this.narrow.set(mq.matches);
      apply();
      mq.addEventListener('change', apply);
      this.viewReady.set(true);
    });

    effect(() => {
      const ready = this.viewReady();
      const reduced = this.motion.reduced();
      const narrow = this.narrow();
      if (!ready || !isPlatformBrowser(this.platformId)) return;
      if (reduced || narrow || !this.webglOk()) {
        this.showField.set(false);
        this.teardown();
        return;
      }
      this.showField.set(true);
      void this.start();
    });
  }

  ngOnDestroy(): void {
    this.teardown();
  }

  protected caption(): string {
    return this.reel.caption[this.lang.lang()];
  }

  protected onPointer(event: PointerEvent): void {
    if (!this.field || event.pointerType !== 'mouse') return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    this.field.setPointer(x, y);
  }

  private webglOk(): boolean {
    if (this.supportChecked) return this.supported;
    this.supportChecked = true;
    try {
      const canvas = document.createElement('canvas');
      this.supported = !!canvas.getContext('webgl2');
    } catch {
      this.supported = false;
    }
    return this.supported;
  }

  private async start(): Promise<void> {
    if (this.field || this.starting) return;
    this.starting = true;
    try {
      await Promise.resolve();
      const canvas = this.canvasRef()?.nativeElement;
      if (!canvas || this.motion.reduced()) return;
      const { mountHeroField } = await import('./hero-field');
      if (this.motion.reduced() || !this.showField()) return;
      const handle = await mountHeroField(canvas);
      if (this.motion.reduced() || !this.showField()) {
        handle.destroy();
        return;
      }
      this.field = handle;
    } finally {
      this.starting = false;
    }
  }

  private teardown(): void {
    this.field?.destroy();
    this.field = null;
  }
}
