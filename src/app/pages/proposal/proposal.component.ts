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
import { ProposalText } from '../../proposals/proposal.model';
import { readProposalText } from '../../proposals/proposal-text';
import { FooterComponent } from '../../components/footer/footer.component';
import { ProposalBackdropComponent } from '../../components/proposal-backdrop/proposal-backdrop.component';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-proposal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FooterComponent, ProposalBackdropComponent],
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
  private readonly previousTitle = this.title.getTitle();

  protected readonly t = this.language.t;

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
    if (this.isBrowser) this.doc.body.classList.add('proposal-doc');

    effect(() => {
      const current = this.proposal();
      if (current?.lang) this.language.lock(current.lang);
      else this.language.unlock();

      const labels = this.t().proposal;
      if (!current) {
        this.title.setTitle(labels.notFoundTitle);
      } else {
        const lang = this.language.lang();
        const client = readProposalText(current.client, lang);
        const name = readProposalText(current.title, lang);
        this.title.setTitle(`${client} — ${name}`);
      }
      this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    });

    this.destroyRef.onDestroy(() => {
      this.language.unlock();
      this.meta.removeTag('name="robots"');
      this.title.setTitle(this.previousTitle);
      if (this.isBrowser) this.doc.body.classList.remove('proposal-doc');
    });
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
