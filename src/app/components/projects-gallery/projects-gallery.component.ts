import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PROJECTS } from '../../data/project.data';
import { Copy } from '../../models/project.model';
import { LanguageService } from '../../services/language.service';
import { RevealDirective } from '../../directives/reveal.directive';
import { KairovaComponent } from '../kairova/kairova.component';

@Component({
  selector: 'app-projects-gallery',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, KairovaComponent],
  templateUrl: './projects-gallery.component.html',
  styleUrl: './projects-gallery.component.css',
})
export class ProjectsGalleryComponent {
  private readonly lang = inject(LanguageService);
  readonly t = this.lang.t;
  protected readonly projects = PROJECTS;

  protected text(copy: Copy): string {
    return copy[this.lang.lang()];
  }

  protected index(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  protected primaryHref(project: (typeof PROJECTS)[number]): string | null {
    return project.demoUrl ?? project.githubUrl ?? null;
  }
}
