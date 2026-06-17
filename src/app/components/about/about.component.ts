import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TECH_ICONS } from '../../data/about.data';
import { LanguageService } from '../../services/language.service';
import { MotionService } from '../../services/motion.service';
import { RevealDirective } from '../../directives/reveal.directive';
import { DecodeDirective } from '../../directives/decode.directive';

export type TechDomain = 'frontend' | 'backend' | 'AI' | 'infra' | 'tooling';

export interface TechRow {
  index: string;
  name: string;
  icon: string;
  url: string;
  invert?: boolean;
  domain: TechDomain;
}

const DOMAIN_MAP: Record<string, TechDomain> = {
  Angular:      'frontend',
  TypeScript:   'frontend',
  Python:       'backend',
  React:        'frontend',
  'Next.js':    'frontend',
  Java:         'backend',
  'Spring Boot':'backend',
  FastAPI:      'backend',
  MySQL:        'backend',
  'Google Cloud':'infra',
  Docker:       'infra',
  Git:          'tooling',
};

@Component({
  selector: 'app-about',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, DecodeDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent {
  private readonly langService = inject(LanguageService);
  readonly motion = inject(MotionService);
  readonly t = this.langService.t;
  readonly lang = this.langService.lang;

  readonly techRows: TechRow[] = TECH_ICONS.map((tech, i) => ({
    ...tech,
    index: String(i + 1).padStart(2, '0'),
    domain: DOMAIN_MAP[tech.name] ?? 'tooling',
  }));

  hoveredRow: string | null = null;

  onRowEnter(name: string): void {
    this.hoveredRow = name;
  }

  onRowLeave(): void {
    this.hoveredRow = null;
  }
}
