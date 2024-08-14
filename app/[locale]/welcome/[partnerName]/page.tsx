import { getStoryblokApi, ISbStoriesParams, ISbStoryData } from '@storyblok/react';
import { locales } from '../../../../i18n/config';
import { getStoryblokPageProps } from '../../../../utils/getStoryblokPageProps';
import Welcome from './welcome';

export const revalidate = 3600;

export default async function Page({
  params,
}: {
  params: { partnerName: string; locale: string };
}) {
  const preview = false;
  const locale = params.locale;
  const partnerName = params?.partnerName;
  const storyblokProps = await getStoryblokPageProps(`welcome/${partnerName}`, locale, preview);
  return <Welcome story={storyblokProps?.story}></Welcome>;
}

export async function generateStaticParams() {
  let sbParams: ISbStoriesParams = {
    published: true,
    starts_with: 'partnership/',
  };

  const storyblokApi = getStoryblokApi();
  let data = await storyblokApi.getAll('cdn/links', sbParams);

  let paths: any = [];

  data.forEach((story: Partial<ISbStoryData>) => {
    if (!story.slug) return;

    // get array for slug because of catch all
    let splittedSlug = story.slug.split('/');

    if (locales) {
      // create additional languages
      for (const locale of locales) {
        paths.push({ params: { partnerName: splittedSlug[1] } });
      }
    }
  });

  return paths;
}
