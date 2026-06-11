import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
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

  // Watermark letters fill with light over the last stretch of the page.
  protected fillProgress = computed(() => {
    const sp = this.motion.scrollProgress();
    return Math.min(1, Math.max(0, (sp - 0.8) / 0.19));
  });

  protected marqueeItems = [
    'ANGULAR', 'TYPESCRIPT', 'PYTHON', 'FASTAPI', 'REACT', 'NEXT.JS',
    'CLAUDE AI', 'GEMINI AI', 'WATSONX', 'MCP', 'DOCKER', 'ASYNCIO',
  ];
}
