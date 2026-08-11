import { expect } from '@jest/globals';
import { act, renderHook } from '@testing-library/react';
import Cookies from 'js-cookie';
import useCookieConsentDecided, { notifyCookieConsentDecided } from './useCookieConsentDecided';

jest.mock('js-cookie');

describe('useCookieConsentDecided hook', () => {
  const mockConsentCookie = (value?: string) => {
    Cookies.get = jest.fn((name?: string) =>
      name === 'analyticsConsent' ? value : undefined,
    ) as unknown as typeof Cookies.get;
  };

  beforeEach(() => {
    mockConsentCookie(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be false when the cookie banner has not been answered', () => {
    const { result } = renderHook(() => useCookieConsentDecided());

    expect(result.current).toBe(false);
  });

  it('should be true when cookies were accepted', () => {
    mockConsentCookie('true');

    const { result } = renderHook(() => useCookieConsentDecided());

    expect(result.current).toBe(true);
  });

  it('should be true when cookies were declined', () => {
    mockConsentCookie('false');

    const { result } = renderHook(() => useCookieConsentDecided());

    expect(result.current).toBe(true);
  });

  it('should update when the cookie banner is answered', () => {
    const { result } = renderHook(() => useCookieConsentDecided());
    expect(result.current).toBe(false);

    act(() => {
      mockConsentCookie('true');
      notifyCookieConsentDecided();
    });

    expect(result.current).toBe(true);
  });

  it('should stop listening once unmounted', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useCookieConsentDecided());
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'cookieConsentDecided',
      expect.any(Function),
    );

    removeEventListenerSpy.mockRestore();
  });
});
