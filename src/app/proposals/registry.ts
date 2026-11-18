import { ejemplo } from './data/ejemplo';
import { Proposal } from './proposal.model';

/**
 * One entry per file in `data/`. A new file is invisible until it is listed
 * here: the production build does not glob these modules.
 */
export const PROPOSALS: readonly Proposal[] = [ejemplo];

export function getProposal(slug: string | null | undefined): Proposal | undefined {
  if (!slug) return undefined;
  return PROPOSALS.find((proposal) => proposal.slug === slug);
}
