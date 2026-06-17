import { Component, ChangeDetectionStrategy, computed, inject, PLATFORM_ID } from '@angular/core';
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
  private motion = inject(MotionService);
  private platformId = inject(PLATFORM_ID);

  // Watermark letters fill with light over the last stretch of the page (monochrome).
  protected fillProgress = computed(() => {
    const sp = this.motion.scrollProgress();
    return Math.min(1, Math.max(0, (sp - 0.8) / 0.19));
  });

  protected reduced = computed(() => this.motion.reduced());

  protected marqueeItems = [
    'ANGULAR', 'TYPESCRIPT', 'PYTHON', 'FASTAPI', 'REACT', 'NEXT.JS',
    'CLAUDE AI', 'GEMINI AI', 'WATSONX', 'MCP', 'DOCKER', 'ASYNCIO',
  ];

  protected scrollToTop(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.scrollTo({ top: 0, behavior: this.motion.reduced() ? 'auto' : 'smooth' });
  }
}
