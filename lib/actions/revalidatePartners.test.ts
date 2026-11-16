/**
 * @jest-environment node
 */
import { PARTNERS_CACHE_TAG } from '@/lib/constants/common';
import { revalidateTag } from 'next/cache';
import { revalidatePartners } from './revalidatePartners';

jest.mock('next/cache', () => ({ revalidateTag: jest.fn() }));
jest.mock('@/lib/constants/common', () => ({
  ...jest.requireActual('@/lib/constants/common'),
  API_URL: 'http://api.test/api/v1',
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const respond = (status: number, body: unknown) =>
  mockFetch.mockResolvedValueOnce({ ok: status < 400, status, json: async () => body });

describe('revalidatePartners', () => {
  beforeEach(() => jest.clearAllMocks());

  it("sends the caller's token to GET user/me", async () => {
    respond(200, { user: { isSuperAdmin: true } });
    await revalidatePartners('token-123');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/user/me',
      expect.objectContaining({
        headers: expect.objectContaining({ authorization: 'Bearer token-123' }),
      }),
    );
  });

  it('revalidates the partners tag for a super admin', async () => {
    respond(200, { user: { isSuperAdmin: true } });
    await revalidatePartners('token-123');

    expect(revalidateTag).toHaveBeenCalledWith(PARTNERS_CACHE_TAG, { expire: 0 });
  });

  it('refuses anyone who is not a super admin', async () => {
    respond(200, { user: { isSuperAdmin: false } });
    await expect(revalidatePartners('token-123')).rejects.toThrow();
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('refuses when the backend rejects the token', async () => {
    respond(401, { message: 'Unauthorized' });
    await expect(revalidatePartners('bad-token')).rejects.toThrow();
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('refuses without a token, without calling the backend', async () => {
    await expect(revalidatePartners('')).rejects.toThrow();
    expect(mockFetch).not.toHaveBeenCalled();
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
