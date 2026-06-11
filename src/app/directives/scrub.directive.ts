import { Directive, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MotionService } from '../services/motion.service';

export type ScrubMode = 'travel' | 'exit' | 'pin';

/**
 * Maps the host's scroll position to a CSS custom property `--progress` (0 → 1)
 * so that styles can be scroll-driven without per-frame JS styling.
 *
 * Modes:
 *  - `travel` (default): 0 when the element's top enters the viewport bottom,
 *    1 when its bottom leaves the viewport top. For light-up titles, parallax.
 *  - `exit`: 0 at natural position, 1 after scrolling `scrubDistance` viewports
 *    past it. For hero "recede into the page" exits.
 *  - `pin`: progress through a taller-than-viewport section with sticky content
 *    inside. 0 when the section top pins, 1 when its bottom reaches the fold.
 */
@Directive({
  selector: '[scrub]',
  standalone: true,
})
export class ScrubDirective implements OnInit, OnDestroy {
  @Input('scrub') mode: ScrubMode | '' = 'travel';
  /** `exit` mode: viewport fraction scrolled for full progress. */
  @Input() scrubDistance = 0.8;
  /** Emits the quantized progress so components can drive JS effects (counters). */
  @Output() scrubProgress = new EventEmitter<number>();

  private motion = inject(MotionService);
  private ticking = false;
  private lastValue = -1;

  constructor(
    private el: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.motion.reduced()) {
      // Final state for reduced motion: everything fully revealed.
      this.el.nativeElement.style.setProperty('--progress', '1');
      this.scrubProgress.emit(1);
      return;
    }

    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onScroll, { passive: true });
    this.update();
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
  }

  private onScroll = () => {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      this.ticking = false;
      this.update();
    });
  };

  private update(): void {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    let p: number;

    switch (this.mode || 'travel') {
      case 'exit':
        p = -rect.top / (vh * this.scrubDistance);
        break;
      case 'pin':
        p = -rect.top / Math.max(rect.height - vh, 1);
        break;
      default:
        p = (vh - rect.top) / (vh + rect.height);
    }

    p = Math.min(1, Math.max(0, p));
    // Quantize to avoid style writes on sub-pixel scroll jitter.
    const q = Math.round(p * 1000) / 1000;
    if (q !== this.lastValue) {
      this.lastValue = q;
      this.el.nativeElement.style.setProperty('--progress', String(q));
      this.scrubProgress.emit(q);
    }
  }
}
