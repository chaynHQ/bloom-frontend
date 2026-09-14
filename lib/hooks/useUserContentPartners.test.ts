import { expect } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { useTypedSelector } from './store';
import { useCookieReferralPartner } from './useCookieReferralPartner';
import { useUserContentPartners } from './useUserContentPartners';

jest.mock('./store', () => ({ useTypedSelector: jest.fn() }));
jest.mock('./useCookieReferralPartner', () => ({ useCookieReferralPartner: jest.fn() }));

interface State {
  user: { id: string | null };
  partnerAccesses: { partner: { name: string } }[];
  partnerAdmin: { partner: { name: string } | null };
}

const mockState = (state: State, referralPartner: string | null = null) => {
  (useTypedSelector as unknown as jest.Mock).mockImplementation((selector) =>
    selector(state as never),
  );
  (useCookieReferralPartner as jest.Mock).mockReturnValue(referralPartner);
};

const emptyAdmin = { partner: null };

describe('useUserContentPartners', () => {
  beforeEach(() => jest.clearAllMocks());

  it('is the public audience for a logged-out visitor with no referral', () => {
    mockState({ user: { id: null }, partnerAccesses: [], partnerAdmin: emptyAdmin });
    expect(renderHook(() => useUserContentPartners()).result.current).toEqual(['public']);
  });

  it('scopes a logged-out referred visitor to their partner', () => {
    mockState({ user: { id: null }, partnerAccesses: [], partnerAdmin: emptyAdmin }, 'Bumble');
    expect(renderHook(() => useUserContentPartners()).result.current).toEqual(['bumble']);
  });

  it("lists a signed-in user's partner accesses", () => {
    mockState({
      user: { id: 'user-1' },
      partnerAccesses: [{ partner: { name: 'Bumble' } }],
      partnerAdmin: emptyAdmin,
    });
    expect(renderHook(() => useUserContentPartners()).result.current).toEqual(['bumble']);
  });
});
