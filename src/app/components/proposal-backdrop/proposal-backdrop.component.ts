import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ProposalBackground } from '../../proposals/proposal.model';
import { DEFAULT_PROPOSAL_BACKGROUND, proposalVideoMode } from '../../proposals/background';
import { MotionService } from '../../services/motion.service';

interface NetworkInformation extends EventTarget {
  saveData?: boolean;
  effectiveType?: string;
}

@Component({
  selector: 'app-proposal-backdrop',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './proposal-backdrop.component.html',
  styleUrl: './proposal-backdrop.component.css',
})
export class ProposalBackdropComponent {
  readonly background = input<ProposalBackground>(DEFAULT_PROPOSAL_BACKGROUND);

  private readonly platformId = inject(PLATFORM_ID);
  private readonly reduced = inject(MotionService).reduced;
  private readonly saveData = signal(false);
  private readonly failed = signal(false);
  protected readonly posterFailed = signal(false);
  /** Hides the hard cut when the 8s loop restarts. */
  protected readonly seam = signal(false);
  private readonly narrow = signal(false);
  private readonly reel = viewChild<ElementRef<HTMLVideoElement>>('reel');
  /** Shown only when the browser refuses muted autoplay. */
  readonly needsPlay = signal(false);

  protected readonly mode = computed(() =>
    proposalVideoMode({
      background: this.background(),
      reduced: this.reduced(),
      saveData: this.saveData(),
      failed: this.failed(),
    }),
  );

  protected readonly poster = computed(() => {
    const background = this.background();
    return background.kind === 'video' ? background.poster : '';
  });

  protected readonly sources = computed(() => {
    const background = this.background();
    if (background.kind !== 'video') return null;
    if (this.narrow() && (background.mobileMp4 || background.mobileWebm)) {
      return {
        mp4: background.mobileMp4 ?? '',
        webm: background.mobileWebm ?? '',
      };
    }
    return { mp4: background.mp4, webm: background.webm ?? '' };
  });

  constructor() {
    effect(() => {
      const video = this.reel()?.nativeElement;
      if (!video || !isPlatformBrowser(this.platformId)) return;
      if (this.reduced()) {
        video.pause();
        this.needsPlay.set(false);
        return;
      }
      this.play();
    });

    if (!isPlatformBrowser(this.platformId)) return;

    const narrowQuery = window.matchMedia('(max-width: 800px)');
    this.narrow.set(narrowQuery.matches);
    narrowQuery.addEventListener('change', (event) => this.narrow.set(event.matches));

    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    const read = () => {
      const slow = connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g';
      this.saveData.set(!!connection?.saveData || !!slow);
    };
    read();
    connection?.addEventListener('change', read);
  }

  /** Muted loop. A rejection is the only case that needs a tap. */
  play(): void {
    const video = this.reel()?.nativeElement;
    if (!video || this.reduced()) return;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    const pending = video.play();
    if (!pending) {
      this.needsPlay.set(false);
      return;
    }
    void pending.then(() => this.needsPlay.set(false)).catch(() => this.needsPlay.set(true));
  }

  protected onVideoError(): void {
    this.failed.set(true);
    this.needsPlay.set(false);
  }

  protected onTime(event: Event): void {
    const video = event.target as HTMLVideoElement;
    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;
    const left = duration - video.currentTime;
    const nearEnd = video.currentTime > 0.2 && left < 0.5;
    if (nearEnd !== this.seam()) this.seam.set(nearEnd);
  }

  protected onPosterError(): void {
    this.posterFailed.set(true);
  }
}
