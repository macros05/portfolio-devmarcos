import { isProposalPath, skipTarget } from './proposal-path';

describe('proposal paths', () => {
  it('treats the bare path and a slug as a proposal', () => {
    expect(isProposalPath('/propuestas')).toBe(true);
    expect(isProposalPath('/propuestas/ejemplo')).toBe(true);
    expect(isProposalPath('/propuestas/ejemplo?x=1')).toBe(true);
    expect(isProposalPath('/')).toBe(false);
    expect(isProposalPath('/proyecto/kairova')).toBe(false);
  });

  it('keeps the skip link on the proposal, not on the home hash', () => {
    expect(skipTarget('/propuestas/ejemplo')).toBe('/propuestas/ejemplo#propuesta');
    expect(skipTarget('/propuestas')).toBe('/propuestas#propuesta');
    expect(skipTarget('/')).toBe('#work');
  });
});
