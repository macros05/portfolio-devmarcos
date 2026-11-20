import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from '../../app.routes';
import { LanguageService } from '../../services/language.service';
import { HOME_DOCUMENT, SITE_ORIGIN } from '../../site-meta';
import { ProposalComponent } from './proposal.component';

@Component({ standalone: true, template: 'home' })
class BlankHome {}

describe('proposal routes', () => {
  it('registers the private routes before the wildcard', () => {
    const bare = routes.findIndex((route) => route.path === 'propuestas');
    const proposal = routes.findIndex((route) => route.path === 'propuestas/:slug');
    const wildcard = routes.findIndex((route) => route.path === '**');
    expect(bare).toBeGreaterThanOrEqual(0);
    expect(proposal).toBeGreaterThan(bare);
    expect(proposal).toBeLessThan(wildcard);
  });
});

describe('ProposalComponent', () => {
  async function open(url: string): Promise<RouterTestingHarness> {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'propuestas', component: ProposalComponent },
          { path: 'propuestas/:slug', component: ProposalComponent },
          { path: '', component: BlankHome },
        ]),
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    return harness;
  }

  it('opens in Spanish, with its own noindex meta', async () => {
    localStorage.setItem('lang', 'en');
    const harness = await open('/propuestas/ejemplo');
    const text = harness.routeNativeElement?.textContent ?? '';
    const meta = TestBed.inject(Meta);

    expect(text).toContain('Cliente Ejemplo');
    expect(text).toContain('1.800 €');
    expect(text).toContain('9.000 €');
    expect(text).toContain('7 semanas en total');
    expect(text).not.toContain('three.js');
    expect(text).not.toContain('Example Client');
    expect(document.body.classList.contains('proposal-doc')).toBe(true);
    expect(meta.getTag('name="robots"')?.content).toBe('noindex, nofollow');
    expect(meta.getTag('property="og:locale"')?.content).toBe('es_ES');
    expect(meta.getTag('property="og:title"')?.content).toContain('Cliente Ejemplo');
    expect(meta.getTag('name="description"')?.content).toContain('ficticios');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      `${SITE_ORIGIN}/propuestas/ejemplo`,
    );
    expect(TestBed.inject(Title).getTitle()).toContain('Cliente Ejemplo');
    expect(localStorage.getItem('lang')).toBe('en');
  });

  it('switches to English without changing the stored site language', async () => {
    localStorage.setItem('lang', 'en');
    const harness = await open('/propuestas/ejemplo');
    TestBed.inject(LanguageService).toggle();
    harness.detectChanges();

    const text = harness.routeNativeElement?.textContent ?? '';
    expect(text).toContain('Example Client');
    expect(text).toContain('€9,000');
    expect(TestBed.inject(Meta).getTag('property="og:locale"')?.content).toBe('en_US');
    expect(localStorage.getItem('lang')).toBe('en');
  });

  it('shows a private not-found state', async () => {
    localStorage.setItem('lang', 'en');
    const harness = await open('/propuestas/no-existe');
    const text = harness.routeNativeElement?.textContent ?? '';
    expect(text).toContain('Propuesta no encontrada');
    expect(text).not.toContain('Cliente Ejemplo');
    expect(TestBed.inject(Meta).getTag('name="robots"')?.content).toBe('noindex, nofollow');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      `${SITE_ORIGIN}/propuestas/no-existe`,
    );
  });

  it('uses the same not-found state when the slug is missing', async () => {
    const harness = await open('/propuestas');
    const text = harness.routeNativeElement?.textContent ?? '';
    expect(text).toContain('Propuesta no encontrada');
    expect(text).not.toContain('Cliente Ejemplo');
    expect(TestBed.inject(Meta).getTag('name="robots"')?.content).toBe('noindex, nofollow');
  });

  it('clears noindex when leaving the document', async () => {
    localStorage.setItem('lang', 'en');
    const harness = await open('/propuestas/ejemplo');
    expect(TestBed.inject(Meta).getTag('name="robots"')).not.toBeNull();

    await harness.navigateByUrl('/');
    const meta = TestBed.inject(Meta);
    expect(meta.getTag('name="robots"')).toBeNull();
    expect(meta.getTag('property="og:locale"')?.content).toBe('en_US');
    expect(meta.getTag('property="og:title"')?.content).toBe(HOME_DOCUMENT.ogTitle);
    expect(document.body.classList.contains('proposal-doc')).toBe(false);
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(TestBed.inject(Title).getTitle()).not.toContain('Cliente Ejemplo');
  });
});
