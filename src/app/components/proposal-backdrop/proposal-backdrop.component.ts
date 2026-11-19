import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  input,
  signal,
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
  /** True only after the file answers. A missing loop must not cover the plate. */
  private readonly available = signal(false);

  protected readonly mode = computed(() => {
    const allowed = proposalVideoMode({
      background: this.background(),
      reduced: this.reduced(),
      saveData: this.saveData(),
      failed: this.failed(),
    });
    return allowed === 'video' && this.available() ? 'video' : 'still';
  });

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
    effect((onCleanup) => {
      const sources = this.sources();
      const allowed =
        proposalVideoMode({
          background: this.background(),
          reduced: this.reduced(),
          saveData: this.saveData(),
          failed: this.failed(),
        }) === 'video';
      this.available.set(false);
      if (!allowed || !sources || !isPlatformBrowser(this.platformId)) return;
      const url = sources.webm || sources.mp4;
      if (!url) return;
      const controller = new AbortController();
      onCleanup(() => controller.abort());
      void fetch(url, { method: 'HEAD', signal: controller.signal })
        .then((response) => {
          const type = response.headers.get('content-type') ?? '';
          const isVideo = type.startsWith('video/') || type === 'application/octet-stream';
          if ((response.ok && isVideo) || response.status === 405) this.available.set(true);
        })
        .catch(() => undefined);
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

  protected onVideoError(): void {
    this.failed.set(true);
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
