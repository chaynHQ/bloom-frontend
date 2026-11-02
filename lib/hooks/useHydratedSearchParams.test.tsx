import { expect } from '@jest/globals';
import { render, renderHook } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import { useHydratedSearchParams } from './useHydratedSearchParams';

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

const urlParams = new URLSearchParams('partner=bumble');

function Partner({ seen }: { seen: (string | null)[] }) {
  const searchParams = useHydratedSearchParams();
  const partner = searchParams === null ? null : searchParams.get('partner');
  seen.push(partner);
  return <p>{partner ?? 'no params'}</p>;
}

describe('useHydratedSearchParams', () => {
  beforeEach(() => {
    (useSearchParams as jest.Mock).mockReturnValue(urlParams);
  });

  afterEach(() => jest.restoreAllMocks());

  it('returns the URL params straight away on a client-only render', () => {
    const { result } = renderHook(() => useHydratedSearchParams());

    expect(result.current?.get('partner')).toBe('bumble');
  });

  it('returns null while hydrating server HTML rendered without params, then the URL params', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const windowErrors: unknown[] = [];
    const onWindowError = (event: ErrorEvent) => windowErrors.push(event.error);
    window.addEventListener('error', onWindowError);

    const container = document.createElement('div');
    container.innerHTML = '<p>no params</p>';
    document.body.appendChild(container);
    const seen: (string | null)[] = [];

    render(<Partner seen={seen} />, { container, hydrate: true });
    window.removeEventListener('error', onWindowError);

    expect(seen).toEqual([null, 'bumble']);
    expect(container.textContent).toBe('bumble');
    expect(consoleError).not.toHaveBeenCalled();
    expect(windowErrors).toEqual([]);
  });
});
