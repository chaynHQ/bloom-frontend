import { ISbStoriesParams, ISbStoryParams, getStoryblokApi } from '@storyblok/react';

export const getStoryblokPageProps = async (
  slug: string | undefined,
  locale: string | undefined,
  preview: boolean,
  params?: Partial<ISbStoriesParams>,
) => {
  if (!slug) {
    return {
      story: null,
      preview,
      locale: locale || null,
      error: 'No slug provided',
    };
  }

  const sbParams: ISbStoriesParams = {
    version: preview ? 'draft' : 'published',
    language: locale || 'en',
    ...(params && params),
  };

  try {
    const storyblokApi = getStoryblokApi();
    let { data } = await storyblokApi.get(`cdn/stories/${slug}`, sbParams);
    return {
      story: data ? data.story : null,
      preview,
      locale: locale || null,
    };
  } catch (error) {
    console.log('Error getting storyblok data for page', slug, sbParams, error);
  }
};

export const getStoryblokPagesByUuids = async (
  uuids: string,
  locale: string | undefined,
  preview: boolean,
  params: Partial<ISbStoryParams>,
) => {
  const sbParams: ISbStoriesParams = {
    version: preview ? 'draft' : 'published',
    language: locale || 'en',
    by_uuids: uuids,
    ...(params && params),
  };

  try {
    const storyblokApi = getStoryblokApi();

    let { data } = await storyblokApi.get(`cdn/stories`, sbParams);

    return {
      stories: data ? data.stories : null,
      preview,
      locale: locale || null,
    };
  } catch (error) {
    console.log('Error getting storyblok data for page', uuids, sbParams, error);
  }
};
