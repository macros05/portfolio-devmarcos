import { Directive, ElementRef, Inject, Input, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MotionService } from '../services/motion.service';

export type RevealVariant = 'up' | 'down' | 'left' | 'right' | 'scale' | 'blur' | 'fade';

/**
 * Scroll reveal driven by a real spring (stiffness / damping), the same
 * idea as Motion's default spring — a little overshoot, then it settles.
 * Reduced motion leaves the element where it is.
 */
@Directive({
  selector: '[reveal]',
  standalone: true,
})
export class RevealDirective implements OnInit, OnDestroy {
  @Input('reveal') variant: RevealVariant | '' = 'up';
  @Input() revealDelay = 0;
  /** Kept so older templates can still bind it. The spring settles on its own. */
  @Input() revealDuration = 900;
  @Input() revealThreshold = 0.12;

  private readonly motion = inject(MotionService);
  private observer: IntersectionObserver | null = null;
  private frame = 0;

  constructor(
    private el: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.motion.reduced()) return;

    const node = this.el.nativeElement;
    const from = this.offset((this.variant || 'up') as RevealVariant);
    node.style.opacity = '0';
    node.style.transform = this.transform(from.x, from.y);
    node.style.willChange = 'transform, opacity';

    this.observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        this.observer?.disconnect();
        this.observer = null;
        this.springTo(node, from.x, from.y, this.revealDelay);
      }
    }, { threshold: this.revealThreshold });

    this.observer.observe(node);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.frame) cancelAnimationFrame(this.frame);
  }

  private offset(variant: RevealVariant): { x: number; y: number } {
    switch (variant) {
      case 'down': return { x: 0, y: -28 };
      case 'left': return { x: -32, y: 0 };
      case 'right': return { x: 32, y: 0 };
      case 'scale': return { x: 0, y: 16 };
      case 'blur': return { x: 0, y: 18 };
      case 'fade': return { x: 0, y: 0 };
      default: return { x: 0, y: 28 };
    }
  }

  private transform(x: number, y: number): string {
    return `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
  }

  /** Under-damped spring. stiffness 170, damping 18, mass 1. */
  private springTo(node: HTMLElement, fromX: number, fromY: number, delay: number): void {
    const stiffness = 170;
    const damping = 18;
    let x = fromX;
    let y = fromY;
    let vx = 0;
    let vy = 0;
    let opacity = 0;
    let vo = 0;
    let start = 0;

    const tick = (now: number) => {
      if (!start) start = now;
      if (now - start < delay) {
        this.frame = requestAnimationFrame(tick);
        return;
      }
      const dt = 1 / 60;
      vx += (-stiffness * x - damping * vx) * dt;
      x += vx * dt;
      vy += (-stiffness * y - damping * vy) * dt;
      y += vy * dt;
      vo += (-stiffness * (opacity - 1) - damping * vo) * dt;
      opacity += vo * dt;

      node.style.transform = this.transform(x, y);
      node.style.opacity = String(Math.max(0, Math.min(1, opacity)));

      const settled =
        Math.abs(x) < 0.3 && Math.abs(y) < 0.3 &&
        Math.abs(vx) < 0.3 && Math.abs(vy) < 0.3 &&
        Math.abs(opacity - 1) < 0.01;
      if (settled) {
        node.style.transform = '';
        node.style.opacity = '';
        node.style.willChange = '';
        this.frame = 0;
        return;
      }
      this.frame = requestAnimationFrame(tick);
    };

    this.frame = requestAnimationFrame(tick);
  }
}
