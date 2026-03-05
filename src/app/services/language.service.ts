import { Injectable, signal, computed } from '@angular/core';
import { ES } from '../i18n/es';
import { EN } from '../i18n/en';

export type Language = 'es' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly _lang = signal<Language>(
    (localStorage.getItem('lang') as Language) ?? 'es'
  );

  readonly lang = this._lang.asReadonly();

  readonly t = computed(() => this._lang() === 'es' ? ES : EN);

  toggle(): void {
    const next: Language = this._lang() === 'es' ? 'en' : 'es';
    this._lang.set(next);
    localStorage.setItem('lang', next);
  }
}
