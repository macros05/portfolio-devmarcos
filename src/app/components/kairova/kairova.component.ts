import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Copy, Project } from '../../models/project.model';
import { LanguageService } from '../../services/language.service';
import { RevealDirective } from '../../directives/reveal.directive';
import { ProjectPreviewComponent } from '../project-preview/project-preview.component';

@Component({
  selector: 'app-kairova',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RevealDirective, ProjectPreviewComponent],
  templateUrl: './kairova.component.html',
  styleUrl: './kairova.component.css',
})
export class KairovaComponent {
  readonly project = input.required<Project>();

  private readonly lang = inject(LanguageService);
  readonly t = this.lang.t;
  protected readonly hover = signal(false);

  protected text(copy: Copy): string {
    return copy[this.lang.lang()];
  }

  protected poster(): string {
    const project = this.project();
    return project.video?.poster || project.imageUrl || '';
  }
}
