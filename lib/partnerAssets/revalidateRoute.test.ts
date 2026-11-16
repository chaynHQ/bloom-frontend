/**
 * @jest-environment node
 */
// The webhook route's side of asset generation; the route's own behaviour is in its route.test.ts.
import { maxDuration, POST } from '@/app/api/revalidate/route';
import { serverInstance as rollbar } from '@/lib/rollbar';
import { createHmac } from 'crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { after } from 'next/server';
import { generatePartnerAssets } from './generate';

jest.mock('next/cache', () => ({ revalidatePath: jest.fn(), revalidateTag: jest.fn() }));
jest.mock('next/server', () => ({ after: jest.fn() }));
jest.mock('@/lib/rollbar', () => ({
  serverInstance: { error: jest.fn(), wait: jest.fn((done: () => void) => done()) },
}));
jest.mock('./generate', () => ({ generatePartnerAssets: jest.fn() }));

const SECRET = 'test-secret';
const generate = generatePartnerAssets as jest.Mock;
const scheduled = after as jest.Mock;

const webhook = (payload: object) => {
  const body = JSON.stringify(payload);
  return new Request('http://localhost/api/revalidate', {
    method: 'POST',
    body,
    headers: { 'webhook-signature': createHmac('sha1', SECRET).update(body).digest('hex') },
  });
};
const partnerPublished = {
  action: 'published',
  story_id: 2,
  full_slug: 'partners/bumble-for-friends',
};

const runScheduled = () => Promise.all(scheduled.mock.calls.map(([task]) => task()));

describe('POST /api/revalidate: partner asset generation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STORYBLOK_WEBHOOK_SECRET = SECRET;
    process.env.STORYBLOK_OAUTH_TOKEN = 'mapi-token';
    process.env.STORYBLOK_SPACE_ID = '142459';
  });

  it('schedules generation after the response when a partner story is published', async () => {
    const response = await POST(webhook(partnerPublished));

    expect(response.status).toBe(200);
    expect(scheduled).toHaveBeenCalledTimes(1);
    expect(generate).not.toHaveBeenCalled();

    await runScheduled();
    expect(generate).toHaveBeenCalledWith(2);
  });

  it('gives generation a minute to run', () => {
    expect(maxDuration).toBe(60);
  });

  it('schedules nothing for other stories or actions', async () => {
    await POST(webhook({ action: 'published', story_id: 3, full_slug: 'welcome/bumble' }));
    await POST(webhook({ ...partnerPublished, action: 'unpublished' }));

    expect(scheduled).not.toHaveBeenCalled();
  });

  it('schedules nothing for an unsigned request', async () => {
    const unsigned = new Request('http://localhost/api/revalidate', {
      method: 'POST',
      body: JSON.stringify(partnerPublished),
    });

    expect((await POST(unsigned)).status).toBe(401);
    expect(scheduled).not.toHaveBeenCalled();
  });

  it.each([
    ['rejects', () => generate.mockRejectedValueOnce(new Error('Storyblok POST /assets → 422'))],
    [
      'throws',
      () =>
        generate.mockImplementationOnce(() => {
          throw new Error('boom');
        }),
    ],
  ])('leaves the response and revalidation unchanged when generation %s', async (_, fail) => {
    fail();

    const response = await POST(webhook(partnerPublished));
    await expect(runScheduled()).resolves.toBeDefined();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ revalidated: true });
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
    expect(revalidateTag).toHaveBeenCalledWith('course-stories', { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith('partners', { expire: 0 });
    expect(rollbar.error).toHaveBeenCalled();
  });
});
