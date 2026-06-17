import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { MotionService } from '../../services/motion.service';
import { RevealDirective } from '../../directives/reveal.directive';
import { DecodeDirective } from '../../directives/decode.directive';

export type SubmitStatus = 'idle' | 'sending' | 'success' | 'error';

@Component({
  selector: 'app-contact',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, DecodeDirective],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {
  readonly t = inject(LanguageService).t;
  readonly motion = inject(MotionService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly status = signal<SubmitStatus>('idle');

  async onSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!isPlatformBrowser(this.platformId)) return;

    this.status.set('sending');
    const form = event.target as HTMLFormElement;
    const data = new FormData(form);

    try {
      const res = await fetch('https://formspree.io/f/mkovawav', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        this.status.set('success');
        form.reset();
      } else {
        this.status.set('error');
      }
    } catch {
      this.status.set('error');
    }
  }
}
