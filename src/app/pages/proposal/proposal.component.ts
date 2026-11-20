import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  DOCUMENT,
  PLATFORM_ID,
  computed,
  effect,
  inject,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { resolveProposalBackground } from '../../proposals/background';
import { getProposal } from '../../proposals/registry';
import { listProposalSections } from '../../proposals/proposal-sections';
import { Proposal, ProposalText } from '../../proposals/proposal.model';
import { readProposalText } from '../../proposals/proposal-text';
import { FooterComponent } from '../../components/footer/footer.component';
import { ProposalBackdropComponent } from '../../components/proposal-backdrop/proposal-backdrop.component';
import { RevealDirective } from '../../directives/reveal.directive';
import { LanguageService } from '../../services/language.service';
import { HOME_DOCUMENT, SITE_ORIGIN } from '../../site-meta';

@Component({
  selector: 'app-proposal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FooterComponent, ProposalBackdropComponent, RevealDirective],
  templateUrl: './proposal.component.html',
  styleUrl: './proposal.component.css',
})
export class ProposalComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly language = inject(LanguageService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly kairovaPreload = '/assets/films/kairova-launch.webp';
  private removedPreload: HTMLLinkElement | null = null;

  protected readonly t = this.language.t;

  private readonly slug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug'))),
    { initialValue: this.route.snapshot.paramMap.get('slug') },
  );

  protected readonly proposal = toSignal(
    this.route.paramMap.pipe(map((params) => getProposal(params.get('slug')))),
    { initialValue: getProposal(this.route.snapshot.paramMap.get('slug')) },
  );

  protected readonly backdrop = computed(() => resolveProposalBackground(this.proposal()));

  protected readonly sections = computed(() => {
    const current = this.proposal();
    if (!current) return [];
    return listProposalSections(current, this.language.lang(), this.t().proposal.sections);
  });

  constructor() {
    this.language.enterProposal();
    if (this.isBrowser) {
      this.doc.body.classList.add('proposal-doc');
      this.dropKairovaPreload();
    }

    effect(() => {
      const current = this.proposal();
      if (current?.lang) this.language.lock(current.lang);
      else this.language.unlock();
      this.writeMeta(current, this.slug());
    });

    this.destroyRef.onDestroy(() => {
      this.language.leaveProposal();
      this.restoreHomeMeta();
      this.restoreKairovaPreload();
      if (this.isBrowser) this.doc.body.classList.remove('proposal-doc');
    });
  }

  private writeMeta(current: Proposal | undefined, slug: string | null): void {
    const lang = this.language.lang();
    const labels = this.t().proposal;
    const locale = lang === 'es' ? 'es_ES' : 'en_US';
    const path = slug ? `/propuestas/${slug}` : '/propuestas';
    const url = `${SITE_ORIGIN}${path}`;
    const pageTitle = current
      ? `${readProposalText(current.client, lang)} — ${readProposalText(current.title, lang)}`
      : labels.notFoundTitle;
    const description = current
      ? readProposalText(current.subtitle, lang) || pageTitle
      : labels.notFound;
    const image = current ? proposalImage(current) : '';

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:locale', content: locale });
    if (image) this.meta.updateTag({ property: 'og:image', content: image });
    else this.meta.removeTag('property="og:image"');
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    if (image) this.meta.updateTag({ name: 'twitter:image', content: image });
    else this.meta.removeTag('name="twitter:image"');
    this.setCanonical(url);
  }

  private setCanonical(href: string): void {
    let link = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.rel = 'canonical';
      this.doc.head.appendChild(link);
    }
    link.href = href;
  }

  private restoreHomeMeta(): void {
    const home = HOME_DOCUMENT;
    this.title.setTitle(home.title);
    this.meta.updateTag({ name: 'description', content: home.description });
    this.meta.removeTag('name="robots"');
    this.meta.updateTag({ property: 'og:title', content: home.ogTitle });
    this.meta.updateTag({ property: 'og:description', content: home.ogDescription });
    this.meta.updateTag({ property: 'og:url', content: home.ogUrl });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:locale', content: home.ogLocale });
    this.meta.updateTag({ property: 'og:image', content: home.ogImage });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: home.twitterTitle });
    this.meta.updateTag({ name: 'twitter:description', content: home.twitterDescription });
    this.meta.updateTag({ name: 'twitter:image', content: home.twitterImage });
    this.doc.querySelector('link[rel="canonical"]')?.remove();
  }

  private dropKairovaPreload(): void {
    const link = this.doc.querySelector<HTMLLinkElement>(
      `link[rel="preload"][href="${this.kairovaPreload}"]`,
    );
    if (!link) return;
    this.removedPreload = link;
    link.remove();
  }

  private restoreKairovaPreload(): void {
    const link = this.removedPreload;
    this.removedPreload = null;
    if (!link || this.doc.querySelector(`link[rel="preload"][href="${this.kairovaPreload}"]`)) return;
    this.doc.head.appendChild(link);
  }

  protected text(value: ProposalText | undefined): string {
    return readProposalText(value, this.language.lang());
  }

  protected hasPriceDetail(rows: { detail?: ProposalText }[]): boolean {
    return rows.some((row) => this.text(row.detail).length > 0);
  }

  protected isExternal(href: string): boolean {
    return /^https?:\/\//i.test(href);
  }

  protected clientLines(name: string): string[] {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length < 2) return [name.trim()];
    const last = parts[parts.length - 1] ?? '';
    return [parts.slice(0, -1).join(' '), last];
  }

  protected indexLabel(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  protected print(): void {
    if (!this.isBrowser) return;
    window.print();
  }
}

function proposalImage(proposal: Proposal): string {
  const background = proposal.background;
  if (!background || background.kind !== 'video' || !background.poster) return '';
  return new URL(background.poster, SITE_ORIGIN).href;
}
