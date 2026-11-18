import { Injectable, signal, computed } from '@angular/core';
import { ES } from '../i18n/es';
import { EN } from '../i18n/en';

export type Language = 'es' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly _lang = signal<Language>((localStorage.getItem('lang') as Language) ?? 'en');

  /** A single-language proposal pins the UI without touching the stored choice. */
  private readonly _locked = signal<Language | null>(null);

  readonly lang = computed(() => this._locked() ?? this._lang());
  readonly locked = computed(() => this._locked() !== null);

  readonly t = computed(() => (this.lang() === 'es' ? ES : EN));

  lock(lang: Language): void {
    this._locked.set(lang);
  }

  unlock(): void {
    this._locked.set(null);
  }

  toggle(): void {
    if (this._locked()) return;
    const next: Language = this._lang() === 'es' ? 'en' : 'es';
    this._lang.set(next);
    localStorage.setItem('lang', next);
  }
}
