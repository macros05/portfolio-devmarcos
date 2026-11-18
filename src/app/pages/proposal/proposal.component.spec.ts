import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from '../../app.routes';
import { LanguageService } from '../../services/language.service';
import { ProposalComponent } from './proposal.component';

@Component({ standalone: true, template: 'home' })
class BlankHome {}

describe('proposal routes', () => {
  it('registers the private route before the wildcard', () => {
    const proposal = routes.findIndex((route) => route.path === 'propuestas/:slug');
    const wildcard = routes.findIndex((route) => route.path === '**');
    expect(proposal).toBeGreaterThanOrEqual(0);
    expect(proposal).toBeLessThan(wildcard);
  });
});

describe('ProposalComponent', () => {
  async function open(url: string): Promise<RouterTestingHarness> {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'propuestas/:slug', component: ProposalComponent },
          { path: '', component: BlankHome },
        ]),
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    return harness;
  }

  it('renders the example in English and marks it noindex', async () => {
    localStorage.removeItem('lang');
    const harness = await open('/propuestas/ejemplo');
    const text = harness.routeNativeElement?.textContent ?? '';

    expect(text).toContain('Example Client');
    expect(text).toContain('Sample proposal');
    expect(text).toContain('€ ----');
    expect(text).not.toContain('Cliente Ejemplo');
    expect(document.body.classList.contains('proposal-doc')).toBe(true);
    expect(TestBed.inject(Meta).getTag('name="robots"')?.content).toBe('noindex, nofollow');
    expect(TestBed.inject(Title).getTitle()).toContain('Example Client');
  });

  it('follows the site language', async () => {
    localStorage.setItem('lang', 'es');
    const harness = await open('/propuestas/ejemplo');
    expect(harness.routeNativeElement?.textContent).toContain('Cliente Ejemplo');

    TestBed.inject(LanguageService).toggle();
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('Example Client');
  });

  it('shows a private not-found state', async () => {
    localStorage.setItem('lang', 'en');
    const harness = await open('/propuestas/no-existe');
    const text = harness.routeNativeElement?.textContent ?? '';
    expect(text).toContain('Proposal not found');
    expect(text).not.toContain('Example Client');
    expect(TestBed.inject(Meta).getTag('name="robots"')?.content).toBe('noindex, nofollow');
  });

  it('clears noindex when leaving the document', async () => {
    localStorage.setItem('lang', 'en');
    const harness = await open('/propuestas/ejemplo');
    expect(TestBed.inject(Meta).getTag('name="robots"')).not.toBeNull();

    await harness.navigateByUrl('/');
    expect(TestBed.inject(Meta).getTag('name="robots"')).toBeNull();
    expect(document.body.classList.contains('proposal-doc')).toBe(false);
    expect(TestBed.inject(Title).getTitle()).not.toContain('Example Client');
  });
});
