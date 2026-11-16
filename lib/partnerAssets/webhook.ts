import { ENVIRONMENT } from '@/lib/constants/common';
import { serverInstance as rollbar } from '@/lib/rollbar';
import { generatePartnerAssets } from './generate';

export function publishedPartnerStoryId(body: string): number | null {
  try {
    const { action, full_slug, story_id } = JSON.parse(body) ?? {};
    const isPartnerPublish =
      action === 'published' &&
      typeof full_slug === 'string' &&
      full_slug.startsWith('partners/') &&
      typeof story_id === 'number';
    return isPartnerPublish ? story_id : null;
  } catch {
    return null;
  }
}

let warnedMissingToken = false;

// Run after the webhook has responded. Never throws: generation must not affect revalidation.
export async function generatePartnerAssetsSafely(storyId: number) {
  // Staging shares production's Storyblok space and receives the same webhooks, so generating on
  // both would upload everything twice and race on the same draft.
  if (ENVIRONMENT === 'staging') return;

  if (!process.env.STORYBLOK_OAUTH_TOKEN || !process.env.STORYBLOK_SPACE_ID) {
    if (!warnedMissingToken) {
      console.warn(
        'Partner assets not generated: STORYBLOK_OAUTH_TOKEN or STORYBLOK_SPACE_ID is not set',
      );
      warnedMissingToken = true;
    }
    return;
  }

  try {
    await generatePartnerAssets(storyId);
  } catch (error) {
    rollbar.error(`Partner asset generation failed for story ${storyId}`, error as Error);
    // The function can stop as soon as after()'s task resolves, so let Rollbar send first.
    await new Promise<void>((resolve) => rollbar.wait(resolve));
  }
}
