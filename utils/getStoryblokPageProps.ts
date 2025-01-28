import { getStoryblokApi } from '@/lib/storyblok';
import { ISbStoriesParams, ISbStoryParams, StoryblokClient } from '@storyblok/react/rsc';

export const getStoryblokPageProps = async (
  slug: string | undefined,
  locale: string | undefined,
  params?: Partial<ISbStoriesParams>,
) => {
  if (!slug) {
    return {
      story: null,
      locale: locale || null,
      error: 'No slug provided',
    };
  }

  const sbParams: ISbStoriesParams = {
    version: process.env.NEXT_PUBLIC_ENV === 'production' ? 'published' : 'draft',
    language: locale || 'en',
    ...(params && params),
  };

  try {
    const storyblokApi: StoryblokClient = getStoryblokApi();
    let { data } = await storyblokApi.get(`cdn/stories/${slug}`, sbParams, { cache: 'no-store' });
    return {
      story: data ? data.story : null,
      locale: locale || null,
    };
  } catch (error) {
    console.log('Error getting storyblok data for page', slug, sbParams, error);
  }
};

export const getStoryblokPagesByUuids = async (
  uuids: string,
  locale: string | undefined,
  params: Partial<ISbStoryParams>,
) => {
  const sbParams: ISbStoriesParams = {
    version: process.env.NEXT_PUBLIC_ENV === 'production' ? 'published' : 'draft',
    language: locale || 'en',
    by_uuids: uuids,
    ...(params && params),
  };

  try {
    const storyblokApi = getStoryblokApi();

    let { data } = await storyblokApi.get(`cdn/stories`, sbParams, { cache: 'no-store' });

    return {
      stories: data ? data.stories : null,
      locale: locale || null,
    };
  } catch (error) {
    console.log('Error getting storyblok data for page', uuids, sbParams, error);
  }
};
