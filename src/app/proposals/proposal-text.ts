import { Language } from '../services/language.service';
import { ProposalText } from './proposal.model';

export function readProposalText(value: ProposalText | undefined, lang: Language): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[lang] || value.es || value.en;
}
