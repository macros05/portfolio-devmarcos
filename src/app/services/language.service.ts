import { Injectable, signal, computed } from '@angular/core';
import { ES } from '../i18n/es';
import { EN } from '../i18n/en';

export type Language = 'es' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly _lang = signal<Language>(readStoredLang());

  /** A single-language proposal pins the UI without touching the stored choice. */
  private readonly _locked = signal<Language | null>(null);

  /**
   * Bilingual proposals open in Spanish. The toggle changes only this visit,
   * so the portfolio language stored for the home stays as it was.
   */
  private readonly _proposal = signal<Language | null>(null);

  readonly lang = computed(() => this._locked() ?? this._proposal() ?? this._lang());
  readonly locked = computed(() => this._locked() !== null);

  readonly t = computed(() => (this.lang() === 'es' ? ES : EN));

  lock(lang: Language): void {
    this._locked.set(lang);
  }

  unlock(): void {
    this._locked.set(null);
  }

  /** First call on a proposal pins Spanish. Later calls leave a toggle in place. */
  enterProposal(): void {
    if (this._proposal() === null) this._proposal.set('es');
  }

  leaveProposal(): void {
    this._proposal.set(null);
    this._locked.set(null);
  }

  toggle(): void {
    if (this._locked()) return;
    const next: Language = this.lang() === 'es' ? 'en' : 'es';
    if (this._proposal() !== null) {
      this._proposal.set(next);
      return;
    }
    this._lang.set(next);
    try {
      localStorage.setItem('lang', next);
    } catch {
      /* Ignore private-mode storage. */
    }
  }
}

function readStoredLang(): Language {
  try {
    const value = globalThis.localStorage?.getItem('lang');
    return value === 'es' || value === 'en' ? value : 'en';
  } catch {
    return 'en';
  }
}
