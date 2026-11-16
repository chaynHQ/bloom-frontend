import { createHmac, timingSafeEqual } from 'crypto';
import { COURSE_STORIES_CACHE_TAG, PARTNERS_CACHE_TAG } from '@/lib/constants/common';
import { generatePartnerAssetsSafely, publishedPartnerStoryId } from '@/lib/partnerAssets/webhook';
import { revalidatePath, revalidateTag } from 'next/cache';
import { after } from 'next/server';

// Partner asset generation runs after the response, within this limit.
export const maxDuration = 60;

// Storyblok signs each webhook with the shared secret: a hex HMAC-SHA1 of the raw body.
function isValidSignature(body: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const expected = Buffer.from(createHmac('sha1', secret).update(body).digest('hex'));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

// Called by a Storyblok webhook when content changes (see docs/configure-env.md). Listings such as
// the library and home page draw on many stories, so the whole site is revalidated; each page
// re-renders on its next visit rather than all at once.
export async function POST(request: Request) {
  const secret = process.env.STORYBLOK_WEBHOOK_SECRET;
  const body = await request.text();

  if (!secret || !isValidSignature(body, request.headers.get('webhook-signature'), secret)) {
    return Response.json({ revalidated: false }, { status: 401 });
  }

  revalidatePath('/', 'layout');
  revalidateTag(COURSE_STORIES_CACHE_TAG, { expire: 0 });
  revalidateTag(PARTNERS_CACHE_TAG, { expire: 0 });

  const partnerStoryId = publishedPartnerStoryId(body);
  if (partnerStoryId) after(() => generatePartnerAssetsSafely(partnerStoryId));

  return Response.json({ revalidated: true });
}
