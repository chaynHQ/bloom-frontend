import { expect } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { useTypedSelector } from './store';
import { useUserAuthStatus } from './useUserAuthStatus';

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

describe('useUserAuthStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("is 'resolving' while firebase auth state is still settling", () => {
    mockUserState({ id: null, token: null, loading: false, authStateLoading: true });
    expect(renderHook(() => useUserAuthStatus()).result.current).toBe('resolving');
  });

  it("is 'resolving' for a signing-in visitor whose user record has not arrived yet", () => {
    mockUserState({ id: null, token: 'token', loading: false, authStateLoading: false });
    expect(renderHook(() => useUserAuthStatus()).result.current).toBe('resolving');
  });

  it("is 'signedIn' once the signed-in user is fully loaded", () => {
    mockUserState({ id: 'user-1', token: 'token', loading: false, authStateLoading: false });
    expect(renderHook(() => useUserAuthStatus()).result.current).toBe('signedIn');
  });

  it("is 'signedOut' for a settled visitor with no token to wait on", () => {
    mockUserState({ id: null, token: null, loading: false, authStateLoading: false });
    expect(renderHook(() => useUserAuthStatus()).result.current).toBe('signedOut');
  });
});
