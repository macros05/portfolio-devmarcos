import { Component, inject, OnInit, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Project } from '../../models/project.model';
import { PROJECTS } from '../../data/project.data';
import { LanguageService } from '../../services/language.service';
import { RevealDirective } from '../../directives/reveal.directive';

type ProjectId = 'ai-reels-factory' | 'trading-bot' | 'pr-party' | 'seo-costa-del-sol' | 'tecnoambiente';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RevealDirective],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.css',
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

  /** Ordered body sections, numbered in the template; AI is optional. */
  get sections(): { label: string; body: string }[] {
    const tx = this.projectTexts;
    if (!tx) return [];
    const d = this.t().projects.detailSections;
    const out = [{ label: d.overview, body: tx.fullDescription }];
    if (tx.aiIntegration) out.push({ label: d.ai, body: tx.aiIntegration });
    out.push({ label: d.challenges, body: tx.challenges });
    return out;
  }

  /** Next project in the lineup (wraps), for the case-study footer link. */
  get nextProject(): Project | null {
    if (!this.project) return null;
    const i = PROJECTS.findIndex((p) => p.id === this.project!.id);
    return PROJECTS[(i + 1) % PROJECTS.length] ?? null;
  }

  sectionLabel(i: number): string {
    return String(i + 1).padStart(2, '0');
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
