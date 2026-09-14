import { expect } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { useContentAccessStatus } from './useContentAccessStatus';
import { useUserAuthStatus, type UserAuthStatus } from './useUserAuthStatus';

jest.mock('./useUserAuthStatus', () => ({
  useUserAuthStatus: jest.fn(),
}));

const mockUserAuthStatus = (status: UserAuthStatus) =>
  (useUserAuthStatus as jest.Mock).mockReturnValue(status);

const run = (args: { contentRequiresLogin: boolean; hasPageAccess: boolean }) =>
  renderHook(() => useContentAccessStatus(args)).result.current;

describe('useContentAccessStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('while auth is resolving', () => {
    beforeEach(() => mockUserAuthStatus('resolving'));

    it("is 'resolving' for login-gated content", () => {
      expect(run({ contentRequiresLogin: true, hasPageAccess: true })).toBe('resolving');
    });

    it("is 'resolving' when the logged-out entitlement check has not passed", () => {
      expect(run({ contentRequiresLogin: false, hasPageAccess: false })).toBe('resolving');
    });

    it("is 'accessGranted' immediately for content that is open to everyone", () => {
      expect(run({ contentRequiresLogin: false, hasPageAccess: true })).toBe('accessGranted');
    });
  });

  describe('for a signed-out visitor', () => {
    beforeEach(() => mockUserAuthStatus('signedOut'));

    it("is 'signInRequired' for a login_required block", () => {
      expect(run({ contentRequiresLogin: true, hasPageAccess: true })).toBe('signInRequired');
    });

    it("is 'signInRequired' for partner content they have not identified into", () => {
      expect(run({ contentRequiresLogin: false, hasPageAccess: false })).toBe('signInRequired');
    });

    it("is 'accessGranted' for content open to everyone", () => {
      expect(run({ contentRequiresLogin: false, hasPageAccess: true })).toBe('accessGranted');
    });
  });

  describe('for a signed-in visitor', () => {
    beforeEach(() => mockUserAuthStatus('signedIn'));

    it("is 'accessGranted' when entitled, even for a login_required block", () => {
      expect(run({ contentRequiresLogin: true, hasPageAccess: true })).toBe('accessGranted');
    });

    it("is 'accessDenied' when their account lacks the entitlement", () => {
      expect(run({ contentRequiresLogin: false, hasPageAccess: false })).toBe('accessDenied');
    });
  });
});
