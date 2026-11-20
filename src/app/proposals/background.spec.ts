import { ejemplo } from './data/ejemplo';
import {
  DEFAULT_PROPOSAL_BACKGROUND,
  proposalVideoMode,
  resolveProposalBackground,
} from './background';
import { Proposal } from './proposal.model';

describe('proposal background', () => {
  it('uses the shared street loop when a proposal omits background', () => {
    const bare: Proposal = {
      slug: 'minimo',
      client: 'Cliente',
      date: 'hoy',
      title: 'Título',
    };
    expect(resolveProposalBackground(bare)).toEqual(DEFAULT_PROPOSAL_BACKGROUND);
    expect(resolveProposalBackground(undefined)).toEqual(DEFAULT_PROPOSAL_BACKGROUND);
  });

  it('keeps an explicit choice', () => {
    expect(resolveProposalBackground({ ...ejemplo, background: { kind: 'none' } })).toEqual({
      kind: 'none',
    });
  });

  it('plays video only when motion and data allow it', () => {
    const background = DEFAULT_PROPOSAL_BACKGROUND;
    expect(
      proposalVideoMode({ background, reduced: false, saveData: false, failed: false }),
    ).toBe('video');
    expect(
      proposalVideoMode({ background, reduced: true, saveData: false, failed: false }),
    ).toBe('still');
    expect(
      proposalVideoMode({ background, reduced: false, saveData: true, failed: false }),
    ).toBe('still');
    expect(
      proposalVideoMode({ background, reduced: false, saveData: false, failed: true }),
    ).toBe('still');
    expect(
      proposalVideoMode({
        background: { kind: 'gradient' },
        reduced: false,
        saveData: false,
        failed: false,
      }),
    ).toBe('still');
  });
});