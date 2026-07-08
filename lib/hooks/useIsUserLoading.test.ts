import { expect } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { useTypedSelector } from './store';
import { useIsUserLoading } from './useIsUserLoading';

jest.mock('./store', () => ({
  useTypedSelector: jest.fn(),
}));

type UserState = {
  id: string | null;
  token: string | null;
  loading: boolean;
  authStateLoading: boolean;
};

const mockUserState = (user: UserState) => {
  (useTypedSelector as unknown as jest.Mock).mockImplementation((selector) =>
    selector({ user } as any),
  );
};

describe('useIsUserLoading', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('is true while firebase auth state is still settling', () => {
    mockUserState({ id: null, token: null, loading: false, authStateLoading: true });
    expect(renderHook(() => useIsUserLoading()).result.current).toBe(true);
  });

  it('is true while the getUser query is in flight', () => {
    mockUserState({ id: null, token: 'token', loading: true, authStateLoading: false });
    expect(renderHook(() => useIsUserLoading()).result.current).toBe(true);
  });

  it('is true when a token exists but the user record has not arrived yet', () => {
    // Closes the gap between authStateLoading flipping false and user.loading being set true.
    mockUserState({ id: null, token: 'token', loading: false, authStateLoading: false });
    expect(renderHook(() => useIsUserLoading()).result.current).toBe(true);
  });

  it('is false for a fully loaded signed-in user', () => {
    mockUserState({ id: 'user-1', token: 'token', loading: false, authStateLoading: false });
    expect(renderHook(() => useIsUserLoading()).result.current).toBe(false);
  });

  it('is false for a settled logged-out user (no token to wait on)', () => {
    mockUserState({ id: null, token: null, loading: false, authStateLoading: false });
    expect(renderHook(() => useIsUserLoading()).result.current).toBe(false);
  });
});
