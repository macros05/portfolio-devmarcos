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
  private readonly host = inject(ElementRef<HTMLElement>);
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

    const visible = (on: boolean) => {
      if (!this.autoplay()) return;
      if (on && !this.motion.reduced()) this.play();
      else {
        video.pause();
        this.paused.set(true);
      }
    };

    if (typeof IntersectionObserver !== 'function') {
      visible(true);
      return;
    }

    this.observer = new IntersectionObserver(entries => {
      visible(entries.some(entry => entry.isIntersecting));
    }, { threshold: 0.35 });
    this.observer.observe(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.videoRef()?.nativeElement.pause();
  }

  protected toggle(event: Event): void {
    event.stopPropagation();
    const video = this.videoRef()?.nativeElement;
    if (!video) return;
    if (video.paused) this.play();
    else {
      video.pause();
      this.paused.set(true);
    }
  }

  private play(): void {
    const video = this.videoRef()?.nativeElement;
    if (!video || !this.src()) return;
    if (video.dataset['clip'] !== this.src()) {
      video.dataset['clip'] = this.src();
      video.src = this.src();
    }
    video.muted = true;
    this.armed.set(true);
    void video.play().then(() => this.paused.set(false)).catch(() => this.paused.set(true));
  }

  protected onPlay(): void {
    this.paused.set(false);
  }

  protected onPause(): void {
    this.paused.set(true);
  }
}
