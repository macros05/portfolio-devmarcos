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

/**
 * Lazy video frame. The file is not requested until the slot is near
 * the viewport. Hero reels autoplay muted; other slots wait for a tap
 * and expose native controls (so the sound can come on).
 */
@Component({
  selector: 'app-media-slot',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './media-slot.component.html',
  styleUrl: './media-slot.component.css',
})
export class MediaSlotComponent implements AfterViewInit, OnDestroy {
  readonly src = input.required<string>();
  readonly poster = input('');
  readonly label = input('');
  readonly width = input(16);
  readonly height = input(9);
  /** Hero treatment: muted loop, play/pause control. */
  readonly autoplay = input(false);
  readonly playLabel = input('Play');
  readonly pauseLabel = input('Pause');

  private readonly platformId = inject(PLATFORM_ID);
  private readonly motion = inject(MotionService);
  private readonly videoRef = viewChild<ElementRef<HTMLVideoElement>>('video');

  protected readonly paused = signal(true);
  protected readonly armed = signal(false);

  private observer: IntersectionObserver | null = null;

  constructor() {
    effect(() => {
      if (!this.motion.reduced()) return;
      const video = this.videoRef()?.nativeElement;
      if (!video) return;
      video.pause();
      this.paused.set(true);
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const video = this.videoRef()?.nativeElement;
    if (!video || !this.src()) return;

    const arm = () => {
      if (this.armed()) return;
      this.armed.set(true);
      video.src = this.src();
      video.load();
      if (this.autoplay() && !this.motion.reduced()) {
        video.muted = true;
        void video.play().then(() => this.paused.set(false)).catch(() => this.paused.set(true));
      }
    };

    if (typeof IntersectionObserver !== 'function') {
      arm();
      return;
    }

    this.observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        arm();
        this.observer?.disconnect();
        this.observer = null;
      }
    }, { rootMargin: '280px 0px' });
    this.observer.observe(video);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.videoRef()?.nativeElement.pause();
  }

  protected toggle(event: Event): void {
    event.stopPropagation();
    const video = this.videoRef()?.nativeElement;
    if (!video) return;
    if (!this.armed()) {
      this.armed.set(true);
      video.src = this.src();
      video.load();
    }
    if (video.paused) {
      video.muted = true;
      void video.play().then(() => this.paused.set(false)).catch(() => this.paused.set(true));
    } else {
      video.pause();
      this.paused.set(true);
    }
  }

  protected onPlay(): void {
    this.paused.set(false);
  }

  protected onPause(): void {
    this.paused.set(true);
  }
}
