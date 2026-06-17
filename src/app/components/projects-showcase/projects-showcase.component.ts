import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PROJECTS } from '../../data/project.data';
import { Project } from '../../models/project.model';
import { LanguageService } from '../../services/language.service';
import { RevealDirective } from '../../directives/reveal.directive';
import { ScrubDirective } from '../../directives/scrub.directive';
import { TiltDirective } from '../../directives/tilt.directive';
import { MagneticDirective } from '../../directives/magnetic.directive';

type ProjectId = 'ai-reels-factory' | 'trading-bot' | 'pr-party' | 'seo-costa-del-sol' | 'tecnoambiente';

/**
 * Cinematic project showcase — big alternating panels with scroll-driven
 * parallax media (via [scrub] → --progress), dramatic reveals, 3D tilt on
 * hover and a parallaxed ghost index. Spectacle lives in the motion; the
 * palette stays dark and corporate.
 */
@Component({
  selector: 'app-projects-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RevealDirective, ScrubDirective, TiltDirective, MagneticDirective],
  templateUrl: './projects-showcase.component.html',
  styleUrl: './projects-showcase.component.css',
})
export class ProjectsShowcaseComponent {
  readonly t = inject(LanguageService).t;
  protected readonly projects = PROJECTS;

  protected indexLabel(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  protected shortDescription(id: string): string {
    return this.t().projects.items[id as ProjectId]?.shortDescription ?? '';
  }
}
