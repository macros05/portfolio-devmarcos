import { Language } from '../services/language.service';

/** Plain string, or copy for both site languages. */
export interface ProposalCopy {
  es: string;
  en: string;
}

export type ProposalText = string | ProposalCopy;

/** Looping street plate. Paths are public URLs, e.g. `/assets/proposals/street.mp4`. */
export interface ProposalVideoBackground {
  kind: 'video';
  /** H.264, 1080p, 6–10s, meant to loop. */
  mp4: string;
  /** VP9, same picture. Played when the browser supports it. */
  webm?: string;
  /** Still shown before the first frame, and when motion is off. */
  poster: string;
  /** Narrow-screen loop. Omitted means the desktop file is used. */
  mobileMp4?: string;
  mobileWebm?: string;
}

export type ProposalBackground =
  | { kind: 'none' }
  | { kind: 'gradient' }
  | ProposalVideoBackground;

export interface ProposalPoint {
  title: ProposalText;
  detail?: ProposalText;
}

export interface ProposalPhase {
  name: ProposalText;
  /** Already formatted, e.g. "2 weeks". */
  duration?: ProposalText;
  detail?: ProposalText;
}

export interface ProposalPriceRow {
  concept: ProposalText;
  detail?: ProposalText;
  /** Display string. Do not put a real figure in sample data. */
  amount: ProposalText;
}

export interface ProposalCase {
  title: ProposalText;
  summary: ProposalText;
  /** Site path or absolute URL. Omit when there is nothing public to open. */
  href?: string;
}

export interface ProposalSectionCopy {
  heading?: ProposalText;
  paragraphs?: ProposalText[];
}

/**
 * One commercial proposal. Omit a block to hide that part of the page.
 * Set `lang` and use plain strings when the document exists in one language.
 */
export interface Proposal {
  /** URL segment: `/propuestas/<slug>`. */
  slug: string;
  /** Pins the page, including chrome, to one language. */
  lang?: Language;
  /** Renders the visible sample banner. The shipped example keeps this on. */
  example?: boolean;
  client: ProposalText;
  /** Already formatted. Not parsed as a date. */
  date: ProposalText;
  title: ProposalText;
  subtitle?: ProposalText;
  preparedBy?: ProposalText;
  /**
   * Page background. Omit it to use the shared street loop
   * (`DEFAULT_PROPOSAL_BACKGROUND`). `none` is a flat dark field.
   * `gradient` is the still stand-in. `video` points at files in `public/`.
   */
  background?: ProposalBackground;
  context?: ProposalSectionCopy & { paragraphs: ProposalText[] };
  solution?: ProposalSectionCopy & { points?: ProposalPoint[] };
  scope?: ProposalSectionCopy & {
    deliverables: ProposalPoint[];
    outOfScope?: ProposalText[];
  };
  phases?: {
    heading?: ProposalText;
    items: ProposalPhase[];
  };
  investment?: {
    heading?: ProposalText;
    note?: ProposalText;
    rows: ProposalPriceRow[];
    total?: { label?: ProposalText; amount: ProposalText };
  };
  why?: ProposalSectionCopy & { cases?: ProposalCase[] };
  nextSteps?: {
    heading?: ProposalText;
    steps: ProposalText[];
  };
  contact?: {
    heading?: ProposalText;
    name?: ProposalText;
    role?: ProposalText;
    email?: string;
    phone?: string;
    web?: string;
    note?: ProposalText;
  };
}

export type ProposalSectionId =
  | 'context'
  | 'solution'
  | 'scope'
  | 'phases'
  | 'investment'
  | 'why'
  | 'next'
  | 'contact';

export interface ProposalSectionLabels {
  context: string;
  solution: string;
  scope: string;
  phases: string;
  investment: string;
  why: string;
  next: string;
  contact: string;
}

export interface ProposalSectionView {
  id: ProposalSectionId;
  index: string;
  heading: string;
}
