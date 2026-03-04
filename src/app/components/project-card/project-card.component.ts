import { Component, Input } from '@angular/core';
import { Project } from '../../models/project.model';
import { RouterLink } from '@angular/router';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.css'
})
export class ProjectCardComponent {
  @Input({ required: true }) project!: Project;
  @Input() even: boolean = false; // Nueva entrada para alternar diseño
}
