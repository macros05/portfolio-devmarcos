import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { LanguageService } from '../../services/language.service';

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

  protected marqueeItems = [
    'ANGULAR', 'TYPESCRIPT', 'PYTHON', 'FASTAPI', 'JAVA', 'SPRING BOOT',
    'TAILWIND', 'GEMINI AI', 'DOCKER', 'MYSQL', 'GIT', 'VITEST',
  ];
}
