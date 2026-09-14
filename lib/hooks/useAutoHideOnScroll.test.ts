import { act, renderHook } from '@testing-library/react';
import { useAutoHideOnScroll } from './useAutoHideOnScroll';

const setScrollY = (value: number) => {
  Object.defineProperty(window, 'scrollY', { value, configurable: true, writable: true });
  window.dispatchEvent(new Event('scroll'));
};

describe('useAutoHideOnScroll', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    setScrollY(0);
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('stays visible near the top', () => {
    const { result } = renderHook(() => useAutoHideOnScroll());
    act(() => setScrollY(20));
    expect(result.current).toBe(false);
  });

  it('hides immediately when scrolling straight down past the threshold', () => {
    const { result } = renderHook(() => useAutoHideOnScroll());
    act(() => setScrollY(400));
    expect(result.current).toBe(true);
  });

  it('lingers for 2s when the user reveals then scrolls back down', () => {
    const { result } = renderHook(() => useAutoHideOnScroll());
    act(() => setScrollY(400)); // hidden
    act(() => setScrollY(300)); // scroll up -> revealed
    expect(result.current).toBe(false);
    act(() => setScrollY(400)); // scroll back down -> linger
    act(() => jest.advanceTimersByTime(1999));
    expect(result.current).toBe(false);
    act(() => jest.advanceTimersByTime(1));
    expect(result.current).toBe(true);
  });

  it('cancels a pending hide when the user scrolls up again', () => {
    const { result } = renderHook(() => useAutoHideOnScroll());
    act(() => setScrollY(400));
    act(() => setScrollY(300));
    act(() => setScrollY(400));
    act(() => setScrollY(250));
    act(() => jest.advanceTimersByTime(2000));
    expect(result.current).toBe(false);
  });
});
