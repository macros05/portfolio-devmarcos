import { Directive, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MotionService } from '../services/motion.service';

/**
 * Keynote-style stacked deck. Apply to a container whose direct children are
 * sticky cards: as card N+1 scrolls over card N, this sets `--covered` (0 → 1)
 * on card N so CSS can recede it (scale down, dim, blur).
 *
 * Cards must keep `transform-origin` on their top edge — coverage is measured
 * from the card's (stable) top plus its untransformed offsetHeight, so the
 * scale applied by CSS never feeds back into the measurement.
 */
@Directive({
  selector: '[deck]',
  standalone: true,
})
export class DeckDirective implements OnInit, OnDestroy {
  private motion = inject(MotionService);
  private ticking = false;

  constructor(
    private el: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.motion.reduced()) return;

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
    const items = Array.from(this.el.nativeElement.children) as HTMLElement[];
    const vh = window.innerHeight || 1;

    for (let i = 0; i < items.length; i++) {
      if (i === items.length - 1) {
        items[i].style.setProperty('--covered', '0');
        continue;
      }
      const cur = items[i].getBoundingClientRect();
      // Skip work while the pair is far from the viewport.
      if (cur.top > vh * 2 || cur.bottom < -vh) continue;

      const nextTop = items[i + 1].getBoundingClientRect().top;
      const height = items[i].offsetHeight || 1;
      const covered = Math.min(1, Math.max(0, (cur.top + height - nextTop) / height));
      items[i].style.setProperty('--covered', String(Math.round(covered * 1000) / 1000));
    }
  }
}
