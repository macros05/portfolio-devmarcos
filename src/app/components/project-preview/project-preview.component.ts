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

/** Only one preview decodes at a time. */
let activeClip: HTMLVideoElement | null = null;

/**
 * 16:9 preview. The poster is a real image with a locked frame.
 * The file is fetched only once the frame is on screen, and the
 * video stays hidden until its first frame is actually playing.
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
  /** Kept so the plate can still mark hover. Playback follows the viewport. */
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
      const want = !!clip && (this.forced() || (!this.reduced() && this.inView()));
      if (want) this.start(clip!);
      else this.stop();
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (typeof IntersectionObserver !== 'function') return;
    this.observer = new IntersectionObserver(
      entries => this.inView.set(entries.some(entry => entry.isIntersecting)),
      { threshold: 0.35 },
    );
    this.observer.observe(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.stop();
  }

  protected onTime(event: Event): void {
    if (this.playing()) return;
    const video = event.target as HTMLVideoElement;
    if (video.currentTime > 0.2) this.playing.set(true);
  }

  protected toggle(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.forced.update(on => !on);
  }

  private start(clip: string): void {
    const video = this.videoRef()?.nativeElement;
    if (!video) return;
    if (activeClip && activeClip !== video) activeClip.pause();
    activeClip = video;
    if (video.dataset['clip'] !== clip) {
      video.dataset['clip'] = clip;
      video.src = clip;
    }
    video.muted = true;
    if (!video.paused && video.readyState >= 2) {
      this.playing.set(true);
      return;
    }
    void video.play().catch(() => this.playing.set(false));
  }

  private stop(): void {
    const video = this.videoRef()?.nativeElement;
    if (!video) return;
    if (activeClip === video) activeClip = null;
    video.pause();
    this.playing.set(false);
  }
}
