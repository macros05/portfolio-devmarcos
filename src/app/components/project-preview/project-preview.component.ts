import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MotionService } from '../../services/motion.service';
import { LanguageService } from '../../services/language.service';

/**
 * 16:9 preview. Poster first. If `src` is set, the file is fetched only
 * when the card is hovered or on screen, then it loops muted.
 * Reduced motion keeps the poster until someone hits play.
 */
@Component({
  selector: 'app-project-preview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-preview.component.html',
  styleUrl: './project-preview.component.css',
})
export class ProjectPreviewComponent implements AfterViewInit, OnDestroy {
  readonly src = input<string | undefined>();
  readonly poster = input('');
  readonly label = input('');
  /** True while the pointer is over the whole card. */
  readonly hovered = input(false);

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly motion = inject(MotionService);
  private readonly lang = inject(LanguageService);
  private readonly videoRef = viewChild<ElementRef<HTMLVideoElement>>('video');

  protected readonly t = this.lang.t;
  protected readonly reduced = this.motion.reduced;
  protected readonly playing = signal(false);

  private readonly inView = signal(false);
  private readonly forced = signal(false);
  private observer: IntersectionObserver | null = null;

  constructor() {
    effect(() => {
      const clip = this.src();
      const want =
        !!clip &&
        (this.forced() || (!this.reduced() && (this.hovered() || this.inView())));
      if (want) this.start(clip!);
      else this.stop();
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (typeof IntersectionObserver !== 'function') return;
    this.observer = new IntersectionObserver(
      entries => this.inView.set(entries.some(entry => entry.isIntersecting)),
      { threshold: 0.45 },
    );
    this.observer.observe(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.videoRef()?.nativeElement.pause();
  }

  protected onFrame(): void {
    const video = this.videoRef()?.nativeElement;
    if (video && video.currentTime > 0.08 && !video.paused) this.playing.set(true);
  }

  protected toggle(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.forced.update(on => !on);
  }

  private start(clip: string): void {
    const video = this.videoRef()?.nativeElement;
    if (!video) return;
    if (video.getAttribute('src') !== clip) {
      video.src = clip;
      video.load();
    }
    video.muted = true;
    void video.play().then(() => this.playing.set(true)).catch(() => this.playing.set(false));
  }

  private stop(): void {
    const video = this.videoRef()?.nativeElement;
    if (!video) return;
    video.pause();
    this.playing.set(false);
  }
}
