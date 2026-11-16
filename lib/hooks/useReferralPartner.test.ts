import { expect } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import Cookies from 'js-cookie';
import { usePathname } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { setEntryPartnerReferral } from '../store/userSlice';
import { useAppDispatch } from './store';
import useReferralPartner from './useReferralPartner';
import { useLaunchedPartners } from '@/lib/partners/PartnersProvider';
import { launchedPartners, launchedPartnersWithBff } from '@/lib/partners/partnerFixtures';

// Bumble and Badoo are launched, as today; Fruitz isn't. Tests that need Bumble For Friends
// launched say so.
jest.mock('@/lib/partners/PartnersProvider', () => ({ useLaunchedPartners: jest.fn() }));
jest.mock('@/i18n/routing', () => ({
  usePathname: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));
jest.mock('js-cookie');
jest.mock('./store', () => ({
  useTypedSelector: jest.fn(),
  useAppDispatch: jest.fn(),
}));
jest.mock('../store/userSlice', () => ({
  setEntryPartnerReferral: jest.fn((value) => ({ type: 'SET_ENTRY_PARTNER_REFERRAL', value })),
  setEntryPartnerAccessCode: jest.fn((value) => ({ type: 'SET_ENTRY_PARTNER_ACCESS_CODE', value })),
}));

const makeSearchParams = (params: Record<string, string>) =>
  ({ get: (key: string) => params[key] ?? null }) as unknown as ReturnType<typeof useSearchParams>;

describe('useReferralPartner - UTM detection', () => {
  let dispatchMock: jest.Mock;

  beforeEach(() => {
    dispatchMock = jest.fn();
    (useAppDispatch as jest.MockedFunction<typeof useAppDispatch>).mockReturnValue(dispatchMock);
    (useLaunchedPartners as jest.Mock).mockReturnValue(launchedPartners);
    (usePathname as jest.Mock).mockReturnValue('/');
    Cookies.set = jest.fn();
    Cookies.get = jest.fn();
  });

  afterEach(() => jest.clearAllMocks());

  it('attributes the referral when a partner name is in utm_source', () => {
    (useSearchParams as jest.Mock).mockReturnValue(makeSearchParams({ utm_source: 'bumble' }));

    renderHook(() => useReferralPartner());

    expect(setEntryPartnerReferral).toHaveBeenCalledWith('bumble');
    expect(Cookies.set).toHaveBeenCalledWith('referralPartner', 'bumble');
  });

  it('detects a partner name embedded within a utm_campaign value', () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      makeSearchParams({ utm_campaign: 'badoo-june-2026' }),
    );

    renderHook(() => useReferralPartner());

    expect(setEntryPartnerReferral).toHaveBeenCalledWith('badoo');
  });

  it('ignores UTM data that does not contain a known partner', () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      makeSearchParams({ utm_source: 'newsletter', utm_campaign: 'spring' }),
    );

    renderHook(() => useReferralPartner());

    expect(setEntryPartnerReferral).not.toHaveBeenCalled();
    expect(Cookies.set).not.toHaveBeenCalled();
  });

  it('sets the referral cookie without requiring analytics consent', () => {
    (useSearchParams as jest.Mock).mockReturnValue(makeSearchParams({ utm_source: 'bumble' }));

    renderHook(() => useReferralPartner());

    // No cookiesAccepted state is provided, yet the functional cookie is still written
    expect(Cookies.set).toHaveBeenCalledWith('referralPartner', 'bumble');
  });

  it('rehydrates Redux from the cookie when no referral is in the URL (e.g. after a reload)', () => {
    (useSearchParams as jest.Mock).mockReturnValue(makeSearchParams({}));
    (Cookies.get as jest.Mock).mockReturnValue('bumble');

    renderHook(() => useReferralPartner());

    expect(setEntryPartnerReferral).toHaveBeenCalledWith('bumble');
    // It rehydrates state but does not re-write the cookie when nothing new was detected
    expect(Cookies.set).not.toHaveBeenCalled();
  });

  it('prefers the welcome path partner over UTM data', () => {
    (usePathname as jest.Mock).mockReturnValue('/welcome/bumble');
    (useSearchParams as jest.Mock).mockReturnValue(makeSearchParams({ utm_source: 'badoo' }));

    renderHook(() => useReferralPartner());

    expect(setEntryPartnerReferral).toHaveBeenCalledWith('bumble');
    expect(setEntryPartnerReferral).not.toHaveBeenCalledWith('badoo');
  });
});

describe('useReferralPartner - launched partners only', () => {
  let dispatchMock: jest.Mock;

  beforeEach(() => {
    dispatchMock = jest.fn();
    (useAppDispatch as jest.MockedFunction<typeof useAppDispatch>).mockReturnValue(dispatchMock);
    (useLaunchedPartners as jest.Mock).mockReturnValue(launchedPartners);
    (usePathname as jest.Mock).mockReturnValue('/');
    (useSearchParams as jest.Mock).mockReturnValue(makeSearchParams({}));
    Cookies.set = jest.fn();
    Cookies.get = jest.fn();
  });

  afterEach(() => jest.clearAllMocks());

  it('/welcome/bumble-for-friends sets the referral once Bumble For Friends is launched', () => {
    (useLaunchedPartners as jest.Mock).mockReturnValue(launchedPartnersWithBff);
    (usePathname as jest.Mock).mockReturnValue('/welcome/bumble-for-friends');

    renderHook(() => useReferralPartner());

    expect(setEntryPartnerReferral).toHaveBeenCalledWith('bumble-for-friends');
    expect(Cookies.set).toHaveBeenCalledWith('referralPartner', 'bumble-for-friends');
  });

  it.each(['/welcome/bumble-for-friends', '/welcome/fruitz', '/welcome/nonsense'])(
    '%s does not set a referral while that partner is not launched',
    (pathname) => {
      (usePathname as jest.Mock).mockReturnValue(pathname);

      renderHook(() => useReferralPartner());

      expect(setEntryPartnerReferral).not.toHaveBeenCalled();
      expect(Cookies.set).not.toHaveBeenCalled();
    },
  );

  it.each<Record<string, string>>([{ utm_source: 'bumble' }, { utm_campaign: 'bumble-june-2026' }])(
    'attributes Bumble from %p',
    (params) => {
      (useSearchParams as jest.Mock).mockReturnValue(makeSearchParams(params));

      renderHook(() => useReferralPartner());

      expect(setEntryPartnerReferral).toHaveBeenCalledWith('bumble');
      expect(Cookies.set).toHaveBeenCalledWith('referralPartner', 'bumble');
    },
  );

  it('utm_source=bumble-for-friends attributes Bumble For Friends, not Bumble', () => {
    (useLaunchedPartners as jest.Mock).mockReturnValue(launchedPartnersWithBff);
    (useSearchParams as jest.Mock).mockReturnValue(
      makeSearchParams({ utm_source: 'bumble-for-friends' }),
    );

    renderHook(() => useReferralPartner());

    expect(setEntryPartnerReferral).toHaveBeenCalledTimes(1);
    expect(setEntryPartnerReferral).toHaveBeenCalledWith('bumble-for-friends');
  });

  it('before Bumble For Friends launches, utm_source=bumble-for-friends attributes Bumble, as today', () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      makeSearchParams({ utm_source: 'bumble-for-friends' }),
    );

    renderHook(() => useReferralPartner());

    expect(setEntryPartnerReferral).toHaveBeenCalledTimes(1);
    expect(setEntryPartnerReferral).toHaveBeenCalledWith('bumble');
  });

  it('a UTM naming Fruitz, which is not launched, attributes nobody', () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      makeSearchParams({ utm_campaign: 'fruitz-spring' }),
    );

    renderHook(() => useReferralPartner());

    expect(setEntryPartnerReferral).not.toHaveBeenCalled();
    expect(Cookies.set).not.toHaveBeenCalled();
  });
});
