import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Project } from '../../models/project.model';
import { PROJECTS } from '../../data/project.data';
import { LanguageService } from '../../services/language.service';

type ProjectId = 'tecnoambiente' | 'sentinel' | 'lead-scout';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.css'
})
export class ProjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  readonly t = inject(LanguageService).t;

  project: Project | undefined;
  isPlaying = false;

  @ViewChild('projectVideo') videoRef!: ElementRef<HTMLVideoElement>;

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.project = PROJECTS.find(p => p.id === projectId);
    }
  }

  get projectTexts() {
    if (!this.project) return null;
    return this.t().projects.items[this.project.id as ProjectId];
  }

  toggleVideo() {
    const video = this.videoRef.nativeElement;
    if (video.paused) {
      video.play();
      this.isPlaying = true;
    } else {
      video.pause();
      this.isPlaying = false;
    }
  }
}
