import {
  Component,
  inject,
  OnInit,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Project } from '../../models/project.model';
import { PROJECTS } from '../../data/project.data';
import { LanguageService } from '../../services/language.service';
import { MotionService } from '../../services/motion.service';
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
  private platformId = inject(PLATFORM_ID);
  readonly t = inject(LanguageService).t;
  readonly reduced = inject(MotionService).reduced;

  project: Project | undefined;
  isPlaying = false;
  readonly isBrowser = isPlatformBrowser(this.platformId);

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

  /** Index of this project in the full list (1-based), zero-padded. */
  get projectIndex(): string {
    if (!this.project) return '00';
    const i = PROJECTS.findIndex(p => p.id === this.project!.id);
    return String(i + 1).padStart(2, '0');
  }

  /** Total number of projects, zero-padded. */
  get projectTotal(): string {
    return String(PROJECTS.length).padStart(2, '0');
  }

  /** Faux path shown in the app-window title bar. */
  get mockWindowPath(): string {
    if (!this.project) return '/';
    if (this.project.demoUrl) {
      try {
        return new URL(this.project.demoUrl).hostname;
      } catch {
        return this.project.demoUrl;
      }
    }
    return `/${this.project.id}`;
  }

  toggleVideo() {
    if (!this.isBrowser) return;
    const video = this.videoRef?.nativeElement;
    if (!video) return;
    if (video.paused) {
      video.play();
      this.isPlaying = true;
    } else {
      video.pause();
      this.isPlaying = false;
    }
  }
}
