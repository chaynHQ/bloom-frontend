import { expect } from '@jest/globals';
import { act, renderHook } from '@testing-library/react';
import Cookies from 'js-cookie';
import { setPwaDismissed } from '../store/userSlice';
import { useAppDispatch, useTypedSelector } from './store';
import usePWA from './usePwa';

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

    Cookies.get = jest.fn();
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
    Cookies.get = jest.fn().mockReturnValue(undefined);

    const { result } = renderHook(() => usePWA());
    expect(result.current.bannerState).toBe('Generic');
  });

  it('should hide banner if dismissed in cookies', () => {
    Cookies.get = jest
      .fn()
      .mockImplementation((key) => (key === 'pwaBannerDismissed' ? 'true' : undefined));

    const { result } = renderHook(() => usePWA());
    expect(result.current.bannerState).toBe('Hidden');
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
    Cookies.get = jest.fn().mockReturnValue(undefined);
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

    Cookies.get = jest.fn().mockReturnValue(undefined);

    const { result } = renderHook(() => usePWA());

    expect(result.current.bannerState).toBe('Hidden');
  });
});
