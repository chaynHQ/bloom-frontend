import { expect } from '@jest/globals';
import { act, renderHook } from '@testing-library/react';
import Cookies from 'js-cookie';
import { setPwaDismissed } from '../store/userSlice';
import { useAppDispatch, useTypedSelector } from './store';
import { notifyCookieConsentDecided } from './useCookieConsentDecided';
import usePWA from './usePwa';

// Mocking track functions for vercel and GA4
jest.mock('@vercel/analytics/react', () => ({
  track: jest.fn(),
}));
jest.mock('@next/third-parties/google', () => ({
  sendGAEvent: jest.fn(),
}));

jest.mock('js-cookie');
jest.mock('./store', () => ({
  useTypedSelector: jest.fn(),
  useAppDispatch: jest.fn(),
}));
jest.mock('../store/userSlice', () => ({
  setPwaDismissed: jest.fn(() => ({ type: 'SET_PWA_DISMISSED' })),
}));

describe('usePWA hook', () => {
  let dispatchMock: jest.Mock;
  const originalUserAgent = navigator.userAgent;
  const originalMatchMedia = window.matchMedia;

  // The PWA banner only shows once the cookie banner has been answered, so every test needs to
  // declare the cookies that are set — `analyticsConsent` is written on accept ('true') and on
  // decline ('false').
  const mockCookies = (cookies: Record<string, string>) => {
    Cookies.get = jest.fn((name?: string) =>
      name ? cookies[name] : cookies,
    ) as unknown as typeof Cookies.get;
  };

  beforeEach(() => {
    dispatchMock = jest.fn();
    (useAppDispatch as jest.MockedFunction<typeof useAppDispatch>).mockReturnValue(dispatchMock);
    (useTypedSelector as jest.MockedFunction<typeof useTypedSelector>).mockImplementation(() => ({
      cookiesAccepted: true,
      pwaDismissed: false,
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
    });

    mockCookies({ analyticsConsent: 'true' });
    Cookies.set = jest.fn();

    // Reset global variable between tests
    (window as any).beforeinstallpromptEvent = undefined;
  });

  afterEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'navigator', {
      value: { userAgent: originalUserAgent },
      writable: true,
    });
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia,
    });
  });

  it('should show Generic banner initially', () => {
    (window as any).beforeinstallpromptEvent = {};

    const { result } = renderHook(() => usePWA());
    expect(result.current.bannerState).toBe('Generic');
  });

  it('should hide banner if dismissed in cookies', () => {
    mockCookies({ analyticsConsent: 'true', pwaBannerDismissed: 'true' });

    const { result } = renderHook(() => usePWA());
    expect(result.current.bannerState).toBe('Hidden');
  });

  it('should hide the banner until the cookie banner has been answered', () => {
    (window as any).beforeinstallpromptEvent = {};
    mockCookies({});

    const { result } = renderHook(() => usePWA());
    expect(result.current.bannerState).toBe('Hidden');
  });

  it('should show the banner when cookies were declined', () => {
    (window as any).beforeinstallpromptEvent = {};
    mockCookies({ analyticsConsent: 'false' });

    const { result } = renderHook(() => usePWA());
    expect(result.current.bannerState).toBe('Generic');
  });

  it('should show the banner as soon as the cookie banner is answered', () => {
    (window as any).beforeinstallpromptEvent = {};
    mockCookies({});

    const { result } = renderHook(() => usePWA());
    expect(result.current.bannerState).toBe('Hidden');

    act(() => {
      mockCookies({ analyticsConsent: 'true' });
      notifyCookieConsentDecided();
    });

    expect(result.current.bannerState).toBe('Generic');
  });

  it('should hide banner if already dismissed', () => {
    (useTypedSelector as jest.MockedFunction<typeof useTypedSelector>).mockImplementation(() => ({
      cookiesAccepted: false,
      pwaDismissed: true,
    }));

    const { result } = renderHook(() => usePWA());
    expect(result.current.bannerState).toBe('Hidden');
  });

  it('should open install prompt when user clicks install', () => {
    const promptMock = jest.fn().mockResolvedValue(undefined);
    (window as any).beforeinstallpromptEvent = {
      prompt: promptMock,
    };

    const { result } = renderHook(() => usePWA());

    act(() => {
      result.current.install();
    });

    expect(promptMock).toHaveBeenCalled();
  });

  it('should hide the banner when the user declines PWA installation', async () => {
    const { result } = renderHook(() => usePWA());

    await act(async () => {
      await result.current.declineInstallation();
    });

    expect(result.current.bannerState).toBe('Hidden');
  });

  it('should not set cookie when cookiesAccepted is false', async () => {
    (useTypedSelector as jest.MockedFunction<typeof useTypedSelector>).mockImplementation(() => ({
      cookiesAccepted: false,
      pwaDismissed: false,
    }));
    // Cookies were declined, so no analytics cookie may be written.
    mockCookies({ analyticsConsent: 'false' });

    const { result } = renderHook(() => usePWA());

    await act(async () => {
      await result.current.declineInstallation();
    });

    expect(Cookies.set).not.toHaveBeenCalledWith('pwaBannerDismissed', 'true');
  });

  it('should persist dismissal when the user declines PWA installation', async () => {
    const { result } = renderHook(() => usePWA());

    await act(async () => {
      await result.current.declineInstallation();
    });

    expect(Cookies.set).toHaveBeenCalledWith('pwaBannerDismissed', 'true');
    expect(dispatchMock).toHaveBeenCalledWith(setPwaDismissed(true));
  });

  it('should respond to appinstalled event', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const { result } = renderHook(() => usePWA());

    act(() => {
      // Simulate user click on pwa banner (custom banner ui) install button - this will open the native browser install modal
      result.current.install();
      // Simulate user clicked on install on native pwa modal - this will fire an appinstalled event.
      const handler = addEventListenerSpy.mock.calls.find(
        ([event]) => event === 'appinstalled',
      )?.[1] as EventListener;

      handler?.(new Event('appinstalled'));
    });

    expect(result.current.bannerState).toBe('Hidden');
  });

  it('should set banner state to `Ios` on install attempt in iOS environment', () => {
    // Simulate iOS environment
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'iPhone',
      configurable: true,
    });
    // iOS does not support beforeinstallprompt
    (window as any).beforeinstallpromptEvent = undefined;

    const { result } = renderHook(() => usePWA());

    act(() => {
      result.current.install();
    });

    expect(result.current.bannerState).toBe('Ios');
  });

  it('should hide the banner in unsupported browsers like Firefox', () => {
    // Simulate environment where pwa are not supported
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
      configurable: true,
    });
    (window as any).beforeinstallpromptEvent = undefined;
    (useTypedSelector as jest.MockedFunction<typeof useTypedSelector>).mockImplementation(() => ({
      cookiesAccepted: true,
      pwaDismissed: false,
    }));
    mockCookies({ analyticsConsent: 'true' });
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
    });

    const { result } = renderHook(() => usePWA());

    expect(result.current.bannerState).toBe('Hidden');
  });

  it('should hide the banner when app is running in standalone mode', () => {
    // Simulate standalone mode (running the pwa)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: query === '(display-mode: standalone)', // returns true only for standalone
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
    });
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'iPhone',
      configurable: true,
    });

    (window as any).beforeinstallpromptEvent = {};
    (useTypedSelector as jest.MockedFunction<typeof useTypedSelector>).mockImplementation(() => ({
      cookiesAccepted: true,
      pwaDismissed: false,
    }));

    mockCookies({ analyticsConsent: 'true' });

    const { result } = renderHook(() => usePWA());

    expect(result.current.bannerState).toBe('Hidden');
  });
});
