import { Component, Input, inject } from '@angular/core';
import { Project } from '../../models/project.model';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { LanguageService } from '../../services/language.service';

type ProjectId = 'tecnoambiente' | 'sentinel' | 'lead-scout';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.css'
})
export class ProjectCardComponent {
  @Input({ required: true }) project!: Project;
  @Input() even: boolean = false;

  readonly t = inject(LanguageService).t;

  get projectTexts() {
    return this.t().projects.items[this.project.id as ProjectId];
  }
}
