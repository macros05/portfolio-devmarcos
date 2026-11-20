import { Component, ChangeDetectionStrategy, inject, input, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { MotionService } from '../../services/motion.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  readonly t = inject(LanguageService).t;
  /** The proposal document drops the framework credit. The home keeps it. */
  readonly showCredit = input(true);
  private motion = inject(MotionService);
  private platformId = inject(PLATFORM_ID);

  protected scrollToTop(event: Event): void {
    if (!isPlatformBrowser(this.platformId)) return;
    (event.currentTarget as HTMLElement | null)?.blur();
    const root = document.scrollingElement ?? document.documentElement;
    if (this.motion.reduced()) {
      root.scrollTop = 0;
      return;
    }
    // On a proposal, native smooth scroll is cancelled and stops short of the top.
    if (document.body.classList.contains('proposal-doc')) {
      const from = root.scrollTop;
      if (from <= 0) return;
      const start = performance.now();
      const duration = 450;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - (1 - t) * (1 - t);
        root.scrollTop = Math.round(from * (1 - eased));
        if (t < 1) requestAnimationFrame(tick);
        else root.scrollTop = 0;
      };
      requestAnimationFrame(tick);
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
