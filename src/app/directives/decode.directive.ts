import {
  Directive,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MotionService } from '../services/motion.service';

/**
 * [decode] — typewriter / glyph-scramble reveal for mono headlines.
 *
 * On first scroll into view, the element's text "decodes": characters resolve
 * left-to-right while the not-yet-resolved tail flickers through a technical
 * glyph set, settling on the final string. Operates on text content only; if
 * the host has element children it leaves them untouched.
 *
 * Honors prefers-reduced-motion (MotionService.reduced) — then the final text
 * is shown immediately with no animation.
 */
@Directive({
  selector: '[decode]',
  standalone: true,
})
export class DecodeDirective implements OnInit, OnDestroy {
  /** Total decode duration in ms. */
  @Input() decodeDuration = 900;
  /** Delay before the decode starts once in view, in ms. */
  @Input() decodeDelay = 0;
  /** Run only the first time it enters the viewport. */
  @Input() decodeOnce = true;

  private static readonly GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789/\\<>[]{}=+*#%&$@';

  private motion = inject(MotionService);
  private observer?: IntersectionObserver;
  private raf = 0;
  private target = '';

  constructor(
    private el: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const el = this.el.nativeElement;
    // Only decode plain-text hosts; skip if it wraps markup.
    if (el.childElementCount > 0) return;

    this.target = (el.textContent ?? '').trim();
    if (!this.target) return;

    if (this.motion.reduced()) return; // leave final text as-is

    this.observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (this.decodeOnce) this.observer?.unobserve(el);
          if (this.decodeDelay > 0) {
            setTimeout(() => this.run(), this.decodeDelay);
          } else {
            this.run();
          }
        }
      },
      { threshold: 0.4 },
    );
    this.observer.observe(el);
  }

  private run(): void {
    const el = this.el.nativeElement;
    const text = this.target;
    const len = text.length;
    const start = performance.now();
    const glyphs = DecodeDirective.GLYPHS;

    const frame = (now: number) => {
      const p = Math.min(1, (now - start) / this.decodeDuration);
      // Eased number of resolved characters (slight ease-out).
      const resolved = Math.floor(len * (1 - Math.pow(1 - p, 2)));
      let out = '';
      for (let i = 0; i < len; i++) {
        const ch = text[i];
        if (i < resolved || ch === ' ' || ch === '\n') {
          out += ch;
        } else {
          out += glyphs[(Math.random() * glyphs.length) | 0];
        }
      }
      el.textContent = out;
      if (p < 1) {
        this.raf = requestAnimationFrame(frame);
      } else {
        el.textContent = text;
      }
    };
    this.raf = requestAnimationFrame(frame);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.raf) cancelAnimationFrame(this.raf);
  }
}
