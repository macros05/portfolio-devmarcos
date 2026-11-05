import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { LanguageService } from '../../services/language.service';

const INTRO = '/assets/films/intro.mp4';
const COVER = '/assets/films/intro-cover.webp';

/**
 * The general intro sits under the opening. Only the poster loads with the
 * page. A tap opens a top-layer dialog and attaches the file then.
 */
@Component({
  selector: 'app-showreel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './showreel.component.html',
  styleUrl: './showreel.component.css',
})
export class ShowreelComponent {
  private readonly lang = inject(LanguageService);
  readonly t = this.lang.t;

  protected readonly cover = COVER;
  protected readonly open = signal(false);
  private readonly stage = viewChild<ElementRef<HTMLDialogElement>>('stage');
  private readonly film = viewChild<ElementRef<HTMLVideoElement>>('film');

  protected play(stage: HTMLDialogElement, video: HTMLVideoElement): void {
    if (video.dataset['ready'] !== '1') {
      video.dataset['ready'] = '1';
      video.src = INTRO;
    }
    if (!stage.open) stage.showModal();
    this.open.set(true);
    video.muted = true;
    void video.play().catch(() => undefined);
    const native = video as HTMLVideoElement & { webkitEnterFullscreen?: () => void };
    if (stage.requestFullscreen) {
      void stage.requestFullscreen().catch(() => native.webkitEnterFullscreen?.());
    } else {
      native.webkitEnterFullscreen?.();
    }
  }

  protected close(): void {
    const video = this.film()?.nativeElement;
    const stage = this.stage()?.nativeElement;
    video?.pause();
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    if (stage?.open) stage.close();
    this.open.set(false);
  }

  protected onCancel(event: Event): void {
    event.preventDefault();
    this.close();
  }
}
