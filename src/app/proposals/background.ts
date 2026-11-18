import { Proposal, ProposalBackground, ProposalVideoBackground } from './proposal.model';

/**
 * Shared default. Drop the finished loop on these paths and every proposal
 * that does not set `background` picks it up. See `README.md`.
 */
export const DEFAULT_PROPOSAL_BACKGROUND: ProposalVideoBackground = {
  kind: 'video',
  mp4: '/assets/proposals/street.mp4',
  webm: '/assets/proposals/street.webm',
  poster: '/assets/proposals/street-poster.jpg',
};

export function resolveProposalBackground(proposal: Proposal | undefined): ProposalBackground {
  return proposal?.background ?? DEFAULT_PROPOSAL_BACKGROUND;
}

export function proposalVideoMode(input: {
  background: ProposalBackground;
  reduced: boolean;
  saveData: boolean;
  failed: boolean;
}): 'video' | 'still' {
  if (input.background.kind !== 'video') return 'still';
  if (input.reduced || input.saveData || input.failed) return 'still';
  if (!input.background.mp4 && !input.background.webm) return 'still';
  return 'video';
}
