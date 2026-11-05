import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { PROJECTS } from '../../data/project.data';
import { Copy, Project } from '../../models/project.model';
import { LanguageService } from '../../services/language.service';
import { RevealDirective } from '../../directives/reveal.directive';
import { KairovaComponent } from '../kairova/kairova.component';
import { ProjectPreviewComponent } from '../project-preview/project-preview.component';

@Component({
  selector: 'app-projects-gallery',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, KairovaComponent, ProjectPreviewComponent],
  templateUrl: './projects-gallery.component.html',
  styleUrl: './projects-gallery.component.css',
})
export class ProjectsGalleryComponent {
  private readonly lang = inject(LanguageService);
  readonly t = this.lang.t;

  protected readonly featured: Project | undefined = PROJECTS.find(project => project.featured);
  protected readonly projects: Project[] = PROJECTS.filter(project => !project.featured);
  protected readonly hoverId = signal<string | null>(null);

  protected text(copy: Copy): string {
    return copy[this.lang.lang()];
  }

  protected index(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  protected primaryHref(project: Project): string | null {
    return project.demoUrl ?? project.githubUrl ?? null;
  }

  protected poster(project: Project): string {
    return project.video?.poster || project.imageUrl || '';
  }
}
