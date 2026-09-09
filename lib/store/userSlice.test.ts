import { expect } from '@jest/globals';

// userSlice pulls in lib/api -> firebase, which the jsdom env can't load. The reducer logic
// under test doesn't touch the API, so a stub with the endpoint matchers is enough.
jest.mock('@/lib/api', () => {
  const neverMatches = () => false;
  const endpoint = { matchFulfilled: neverMatches };
  return {
    api: {
      endpoints: new Proxy({}, { get: () => endpoint }),
    },
  };
});

import reducer, { clearUserSlice, setLoadError, setUserToken } from './userSlice';

describe('userSlice', () => {
  it('clearUserSlice resets the slice but keeps loadError so the login form can show it', () => {
    let state = reducer(undefined, setUserToken('token-123'));
    state = reducer(state, setLoadError('Failed to fetch'));

    const cleared = reducer(state, clearUserSlice());

    expect(cleared.token).toBeNull();
    expect(cleared.id).toBeNull();
    expect(cleared.loadError).toBe('Failed to fetch');
  });

  it('setLoadError(null) clears a previous error', () => {
    const state = reducer(undefined, setLoadError('boom'));
    expect(reducer(state, setLoadError(null)).loadError).toBeNull();
  });
});
