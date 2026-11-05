import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { PROJECTS } from '../../data/project.data';
import { Copy, Project } from '../../models/project.model';
import { LanguageService } from '../../services/language.service';
import { ProjectPreviewComponent } from '../project-preview/project-preview.component';

@Component({
  selector: 'app-projects-gallery',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProjectPreviewComponent],
  templateUrl: './projects-gallery.component.html',
  styleUrl: './projects-gallery.component.css',
})
export class ProjectsGalleryComponent {
  private readonly lang = inject(LanguageService);
  readonly t = this.lang.t;

  protected readonly leads: Project[] = PROJECTS.filter(project => project.lead);
  protected readonly rest: Project[] = PROJECTS.filter(project => !project.lead);
  protected readonly hover = signal<string | null>(null);

  protected text(copy: Copy): string {
    return copy[this.lang.lang()];
  }

  protected scene(i: number): string {
    return 'SC.' + String(i + 1).padStart(2, '0');
  }

  protected poster(project: Project): string {
    return project.video?.poster || project.imageUrl || '';
  }
}
