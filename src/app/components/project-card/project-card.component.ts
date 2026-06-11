import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { Project } from '../../models/project.model';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { TiltDirective } from '../../directives/tilt.directive';
import { RevealDirective } from '../../directives/reveal.directive';
import { MagneticDirective } from '../../directives/magnetic.directive';

type ProjectId = 'ai-reels-factory' | 'trading-bot' | 'pr-party' | 'seo-costa-del-sol' | 'tecnoambiente';

@Component({
  selector: 'app-project-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TiltDirective, RevealDirective, MagneticDirective],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.css',
  host: {
    '[style.--stack-i]': 'index',
  },
})
export class ProjectCardComponent {
  @Input({ required: true }) project!: Project;
  @Input() index: number = 0;

  readonly t = inject(LanguageService).t;

  get projectTexts() {
    return this.t().projects.items[this.project.id as ProjectId];
  }

  get indexLabel(): string {
    return String(this.index + 1).padStart(2, '0');
  }
}
