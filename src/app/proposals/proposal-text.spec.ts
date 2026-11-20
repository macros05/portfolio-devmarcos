import { ejemplo } from './data/ejemplo';
import { listProposalSections } from './proposal-sections';
import { Proposal } from './proposal.model';
import { readProposalText } from './proposal-text';
import { PROPOSALS, getProposal } from './registry';
import { EN } from '../i18n/en';
import { ES } from '../i18n/es';

describe('proposal copy', () => {
  it('reads a plain string in either language', () => {
    expect(readProposalText('Hola', 'en')).toBe('Hola');
  });

  it('reads the active language and falls back', () => {
    expect(readProposalText({ es: 'Hola', en: 'Hello' }, 'en')).toBe('Hello');
    expect(readProposalText({ es: 'Hola', en: '' }, 'en')).toBe('Hola');
  });

  it('registers only the fictional example', () => {
    expect(PROPOSALS.map((proposal) => proposal.slug)).toEqual(['ejemplo']);
    expect(getProposal('ejemplo')).toBe(ejemplo);
    expect(getProposal('otro')).toBeUndefined();
    expect(ejemplo.example).toBe(true);
    expect(ejemplo.client).toEqual({ es: 'Cliente Ejemplo', en: 'Example Client' });
  });

  it('uses fictional but realistic sample amounts', () => {
    const amounts = ejemplo.investment!.rows.map((row) => readProposalText(row.amount, 'es'));
    expect(amounts).toEqual(['1.800 €', '2.400 €', '4.800 €']);
    expect(readProposalText(ejemplo.investment!.total!.amount, 'es')).toBe('9.000 €');
    expect(readProposalText(ejemplo.investment!.total!.amount, 'en')).toBe('€9,000');
    expect(readProposalText(ejemplo.phases!.total, 'es')).toBe('7 semanas en total');
  });

  it('lists every block the example fills, in order', () => {
    const sections = listProposalSections(ejemplo, 'es', ES.proposal.sections);
    expect(sections.map((section) => section.id)).toEqual([
      'context',
      'solution',
      'scope',
      'phases',
      'investment',
      'why',
      'next',
      'contact',
    ]);
    expect(sections[0]?.index).toBe('01');
    expect(sections[0]?.heading).toBe(ES.proposal.sections.context);
  });

  it('drops a block that the data omits', () => {
    const minimal: Proposal = {
      slug: 'minimo',
      client: 'Cliente',
      date: 'hoy',
      title: 'Título',
      context: { paragraphs: ['Solo esto.'] },
    };
    const sections = listProposalSections(minimal, 'en', EN.proposal.sections);
    expect(sections.map((section) => section.id)).toEqual(['context']);
  });
});
