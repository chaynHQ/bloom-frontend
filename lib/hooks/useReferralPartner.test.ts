import { expect } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import Cookies from 'js-cookie';
import { usePathname } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { setEntryPartnerReferral } from '../store/userSlice';
import { useAppDispatch } from './store';
import useReferralPartner from './useReferralPartner';

// Mock partners constants to avoid pulling in SVG asset imports (the `@/` alias
// resolves before the svg fileMock, so the real module fails to load under Jest).
jest.mock('@/lib/constants/partners', () => ({
  partnerKeys: ['bumble', 'badoo'],
}));
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
