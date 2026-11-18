import { Language } from '../services/language.service';
import {
  Proposal,
  ProposalSectionId,
  ProposalSectionLabels,
  ProposalSectionView,
  ProposalText,
} from './proposal.model';
import { readProposalText } from './proposal-text';

export function listProposalSections(
  proposal: Proposal,
  lang: Language,
  labels: ProposalSectionLabels,
): ProposalSectionView[] {
  const heading = (value: ProposalText | undefined, fallback: string) =>
    readProposalText(value, lang) || fallback;
  const items: { id: ProposalSectionId; heading: string }[] = [];

  if (proposal.context && proposal.context.paragraphs.length > 0) {
    items.push({ id: 'context', heading: heading(proposal.context.heading, labels.context) });
  }

  if (
    proposal.solution &&
    ((proposal.solution.paragraphs?.length ?? 0) > 0 || (proposal.solution.points?.length ?? 0) > 0)
  ) {
    items.push({ id: 'solution', heading: heading(proposal.solution.heading, labels.solution) });
  }

  if (
    proposal.scope &&
    (proposal.scope.deliverables.length > 0 ||
      (proposal.scope.outOfScope?.length ?? 0) > 0 ||
      (proposal.scope.paragraphs?.length ?? 0) > 0)
  ) {
    items.push({ id: 'scope', heading: heading(proposal.scope.heading, labels.scope) });
  }

  if (proposal.phases && proposal.phases.items.length > 0) {
    items.push({ id: 'phases', heading: heading(proposal.phases.heading, labels.phases) });
  }

  if (proposal.investment && proposal.investment.rows.length > 0) {
    items.push({
      id: 'investment',
      heading: heading(proposal.investment.heading, labels.investment),
    });
  }

  if (
    proposal.why &&
    ((proposal.why.paragraphs?.length ?? 0) > 0 || (proposal.why.cases?.length ?? 0) > 0)
  ) {
    items.push({ id: 'why', heading: heading(proposal.why.heading, labels.why) });
  }

  if (proposal.nextSteps && proposal.nextSteps.steps.length > 0) {
    items.push({ id: 'next', heading: heading(proposal.nextSteps.heading, labels.next) });
  }

  if (hasContact(proposal.contact)) {
    items.push({ id: 'contact', heading: heading(proposal.contact?.heading, labels.contact) });
  }

  return items.map((item, index) => ({
    ...item,
    index: String(index + 1).padStart(2, '0'),
  }));
}

function hasContact(contact: Proposal['contact']): boolean {
  if (!contact) return false;
  return Boolean(
    readProposalText(contact.heading, 'es') ||
    readProposalText(contact.name, 'es') ||
    readProposalText(contact.role, 'es') ||
    readProposalText(contact.note, 'es') ||
    contact.email ||
    contact.phone ||
    contact.web,
  );
}
