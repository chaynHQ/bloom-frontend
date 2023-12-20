import { ISbStoriesParams, getStoryblokApi } from '@storyblok/react';

export const getStoryblokPageProps = async (
  slug: string | undefined,
  locale: string | undefined,
  preview: boolean,
  params?: Partial<ISbStoriesParams>,
) => {
  if (!slug) {
    return {
      story: null,
      key: false,
      preview,
      error: 'No slug provided',
    };
  }

  const sbParams: ISbStoriesParams = {
    version: preview ? 'draft' : 'published',
    language: locale || 'en',
    ...(params && params),
  };

  const storyblokApi = getStoryblokApi();
  let { data } = await storyblokApi.get(`cdn/stories/${slug}`, sbParams);

  return {
    story: data ? data.story : null,
    key: data ? data.story.id : false,
    preview,
  };
};
