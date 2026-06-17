import { TestBed } from '@angular/core/testing';

import { LanguageService } from './language.service';
import { ES } from '../i18n/es';
import { EN } from '../i18n/en';

describe('LanguageService', () => {
  let service: LanguageService;

  beforeEach(() => {
    // Reset stored lang so tests are deterministic.
    localStorage.removeItem('lang');

    TestBed.configureTestingModule({});
    service = TestBed.inject(LanguageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── Key presence in the active dictionary ─────────────────────────────────

  it('t().nav.sections.index is non-empty', () => {
    const val = service.t().nav?.sections?.index;
    expect(val).toBeTruthy();
  });

  it('t().hud.fps is non-empty', () => {
    const val = service.t().hud?.fps;
    expect(val).toBeTruthy();
  });

  it('t().hud.points is non-empty', () => {
    const val = service.t().hud?.points;
    expect(val).toBeTruthy();
  });

  it('t().lab.items.curl.title is non-empty', () => {
    const items = service.t().lab?.items as Record<string, { title: string; blurb: string }>;
    expect(items?.['curl']?.title).toBeTruthy();
  });

  it('t().contact.prompt is non-empty', () => {
    const val = service.t().contact?.prompt;
    expect(val).toBeTruthy();
  });

  it('t().projects.galleryHint is non-empty', () => {
    const val = service.t().projects?.galleryHint;
    expect(val).toBeTruthy();
  });

  it('t().footer.viewSource is non-empty', () => {
    const val = service.t().footer?.viewSource;
    expect(val).toBeTruthy();
  });

  // ── ES / EN parity ─────────────────────────────────────────────────────────

  it('ES and EN have the same top-level keys', () => {
    expect(Object.keys(ES).sort()).toEqual(Object.keys(EN).sort());
  });

  it('both ES and EN have nav.sections', () => {
    expect(ES.nav?.sections).toBeTruthy();
    expect(EN.nav?.sections).toBeTruthy();
  });

  it('both ES and EN have a hud section', () => {
    expect(ES.hud).toBeTruthy();
    expect(EN.hud).toBeTruthy();
  });

  it('both ES and EN have a lab section', () => {
    expect(ES.lab).toBeTruthy();
    expect(EN.lab).toBeTruthy();
  });

  it('both ES and EN have lab.items', () => {
    expect(ES.lab?.items).toBeTruthy();
    expect(EN.lab?.items).toBeTruthy();
  });

  // ── Language toggle ────────────────────────────────────────────────────────

  it('toggle() switches the active language', () => {
    const initial = service.lang();
    service.toggle();
    expect(service.lang()).not.toBe(initial);
  });

  it('t() returns EN dictionary after toggling from ES', () => {
    // Ensure we start from ES
    if (service.lang() !== 'es') service.toggle();

    service.toggle(); // now EN
    expect(service.t().hud.fps).toBe(EN.hud.fps);
  });
});
