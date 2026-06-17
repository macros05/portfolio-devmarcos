import {
  ChangeDetectionStrategy,
  Component,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PROJECTS } from '../../data/project.data';
import { Project } from '../../models/project.model';
import { LanguageService } from '../../services/language.service';
import { MotionService } from '../../services/motion.service';
import { RevealDirective } from '../../directives/reveal.directive';
import { TiltDirective } from '../../directives/tilt.directive';

type ProjectId =
  | 'ai-reels-factory'
  | 'trading-bot'
  | 'pr-party'
  | 'seo-costa-del-sol'
  | 'tecnoambiente';

/** CSS-only procedural preview motifs (one per thumbnail). */
export type PreviewMotif = 'dot-matrix' | 'radar' | 'scanlines' | 'waveform' | 'squares';

const MOTIFS: PreviewMotif[] = ['dot-matrix', 'radar', 'scanlines', 'waveform', 'squares'];

/**
 * three.js-examples-style gallery — monochrome HUD chrome, procedural CSS
 * preview thumbnails, hairline panels, registration ticks.
 * Featured panel (PROJECTS[0]) + responsive grid of remaining projects.
 */
@Component({
  selector: 'app-projects-gallery',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RevealDirective, TiltDirective],
  templateUrl: './projects-gallery.component.html',
  styleUrl: './projects-gallery.component.css',
})
export class ProjectsGalleryComponent {
  readonly t = inject(LanguageService).t;
  readonly motion = inject(MotionService);

  private readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  protected readonly featured: Project = PROJECTS[0];
  protected readonly gridProjects: Project[] = PROJECTS.slice(1);
  protected readonly totalCount: string = String(PROJECTS.length).padStart(2, '0');

  protected indexLabel(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  /** Grid index labels start at 02 (featured is 01). */
  protected gridIndexLabel(i: number): string {
    return String(i + 2).padStart(2, '0');
  }

  protected shortDescription(id: string): string {
    return this.t().projects.items[id as ProjectId]?.shortDescription ?? '';
  }

  protected motif(i: number): PreviewMotif {
    return MOTIFS[i % MOTIFS.length];
  }
}
