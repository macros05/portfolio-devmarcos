import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { ScrubDirective } from '../../directives/scrub.directive';
import { PROJECTS } from '../../data/project.data';
import { TECH_ICONS } from '../../data/about.data';

interface StatementWord {
  text: string;
  accent: boolean;
}

/** Words that light up with the aurora gradient instead of plain white. */
const ACCENT_WORDS = new Set([
  'piensa', 'respira', 'ia', 'natural',
  'thinks', 'breathes', 'ai',
]);

@Component({
  selector: 'app-statement',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrubDirective],
  templateUrl: './statement.component.html',
  styleUrl: './statement.component.css',
})
export class StatementComponent {
  readonly t = inject(LanguageService).t;

  readonly words = computed<StatementWord[]>(() =>
    this.t().statement.line.split(' ').map(text => ({
      text,
      accent: ACCENT_WORDS.has(text.toLowerCase().replace(/[.,!?¿¡]/g, '')),
    })),
  );

  // Systems currently deployed/running, beyond the featured cards:
  // Tecnoambiente, SEO Costa del Sol, AI Reels Factory, Personal Assistant,
  // SEObot, Trading Bot, Polymarket bot. Update when something ships/retires.
  private static readonly IN_PRODUCTION = 7;

  protected readonly stats = [
    { value: StatementComponent.IN_PRODUCTION, key: 'projects' as const },
    { value: TECH_ICONS.length, key: 'technologies' as const },
    { value: PROJECTS.filter(p => p.aiIntegration).length, key: 'ai' as const },
  ];

  /** Pinned-scene progress, fed by the [scrub] directive. */
  protected readonly progress = signal(0);

  // Counters roll slowly: they climb across the last ~40% of the pinned
  // scene (0.58 → 0.97), with a gentle ease-out so they land softly.
  private readonly countProgress = computed(() => {
    const raw = Math.min(1, Math.max(0, (this.progress() - 0.58) / 0.39));
    return 1 - Math.pow(1 - raw, 2);
  });

  protected display(value: number): string {
    return Math.round(value * this.countProgress())
      .toString()
      .padStart(2, '0');
  }
}
