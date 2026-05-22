import { Directive, ElementRef, Inject, Input, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MotionService } from '../services/motion.service';

export type RevealVariant = 'up' | 'down' | 'left' | 'right' | 'scale' | 'blur' | 'fade';

@Directive({
  selector: '[reveal]',
  standalone: true,
})
export class RevealDirective implements OnInit {
  @Input('reveal') variant: RevealVariant | '' = 'up';
  @Input() revealDelay = 0;
  @Input() revealDuration = 900;
  @Input() revealThreshold = 0.12;

  private motion = inject(MotionService);

  constructor(
    private el: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const el = this.el.nativeElement;
    const v: RevealVariant = (this.variant || 'up') as RevealVariant;

    const reduced = this.motion.reduced();
    if (reduced) return;

    const initialTransform = this.getInitialTransform(v);
    const initialFilter = v === 'blur' ? 'blur(14px)' : '';

    el.style.opacity = '0';
    el.style.transform = initialTransform;
    if (initialFilter) el.style.filter = initialFilter;
    el.style.transition = `opacity ${this.revealDuration}ms cubic-bezier(0.16, 1, 0.3, 1) ${this.revealDelay}ms, transform ${this.revealDuration}ms cubic-bezier(0.16, 1, 0.3, 1) ${this.revealDelay}ms, filter ${this.revealDuration}ms cubic-bezier(0.16, 1, 0.3, 1) ${this.revealDelay}ms`;
    el.style.willChange = 'opacity, transform, filter';

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translate3d(0,0,0) scale(1)';
          if (initialFilter) el.style.filter = 'blur(0)';
          observer.unobserve(el);
          setTimeout(() => {
            el.style.willChange = '';
          }, this.revealDuration + this.revealDelay + 100);
        }
      });
    }, { threshold: this.revealThreshold });

    observer.observe(el);
  }

  private getInitialTransform(v: RevealVariant): string {
    switch (v) {
      case 'up':    return 'translate3d(0, 40px, 0)';
      case 'down':  return 'translate3d(0, -40px, 0)';
      case 'left':  return 'translate3d(-40px, 0, 0)';
      case 'right': return 'translate3d(40px, 0, 0)';
      case 'scale': return 'scale(0.92)';
      case 'blur':  return 'translate3d(0, 20px, 0)';
      case 'fade':  return 'none';
      default:      return 'translate3d(0, 40px, 0)';
    }
  }
}
