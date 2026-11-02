/**
 * @jest-environment node
 */
import { createHmac } from 'crypto';
import { revalidatePath } from 'next/cache';
import { POST } from './route';

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

const SECRET = 'test-secret';
const body = JSON.stringify({ action: 'published', full_slug: 'courses/managing-anxiety' });
const sign = (payload: string, secret = SECRET) =>
  createHmac('sha1', secret).update(payload).digest('hex');

const webhook = (signature?: string) =>
  new Request('http://localhost/api/revalidate', {
    method: 'POST',
    body,
    headers: signature ? { 'webhook-signature': signature } : {},
  });

describe('POST /api/revalidate', () => {
  beforeEach(() => {
    process.env.STORYBLOK_WEBHOOK_SECRET = SECRET;
    jest.clearAllMocks();
  });

  it('revalidates the site for a correctly signed Storyblok webhook', async () => {
    const response = await POST(webhook(sign(body)));

    expect(response.status).toBe(200);
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
  });

  it('rejects a missing or wrong signature', async () => {
    expect((await POST(webhook())).status).toBe(401);
    expect((await POST(webhook(sign(body, 'other-secret')))).status).toBe(401);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('rejects every request while no secret is configured', async () => {
    delete process.env.STORYBLOK_WEBHOOK_SECRET;

    expect((await POST(webhook(sign(body)))).status).toBe(401);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
