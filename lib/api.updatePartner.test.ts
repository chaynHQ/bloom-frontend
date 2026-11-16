/**
 * @jest-environment node
 */
import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';

jest.mock('./auth', () => ({ getAuthToken: jest.fn() }));
jest.mock('./constants/common', () => ({
  ...jest.requireActual('./constants/common'),
  API_URL: 'http://api.test/api/v1',
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const makeStore = () =>
  configureStore({
    reducer: { [api.reducerPath]: api.reducer, user: () => ({ token: 'token' }) },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });

const sentBody = async () => {
  const request = mockFetch.mock.calls[0][0] as Request;
  return { method: request.method, url: request.url, body: await request.json() };
};

describe('updatePartner', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue(new Response('{}', { status: 200 }));
  });

  it.each([[{ therapySessionsPerCode: 3 }], [{ automaticAccessCode: true }], [{ active: false }]])(
    'PATCHes partner/:id with only %j',
    async (changes) => {
      const store = makeStore();
      await store.dispatch(api.endpoints.updatePartner.initiate({ id: 'partner-id', ...changes }));

      const { method, url, body } = await sentBody();
      expect(method).toBe('PATCH');
      expect(url).toMatch(/\/partner\/partner-id$/);
      expect(body).toEqual(changes);
    },
  );
});
