import NoDataAvailable from '@/components/common/NoDataAvailable';
import StoryblokWelcomePage, {
  StoryblokWelcomePageProps,
} from '@/components/storyblok/StoryblokWelcomePage';
import { routing } from '@/i18n/routing';
import { getStoryblokPageProps } from '@/utils/getStoryblokPageProps';
import { ISbResult, ISbStoriesParams, ISbStoryData, getStoryblokApi } from '@storyblok/react/rsc';

export const revalidate = 14400; // invalidate every 4 hour

export async function generateStaticParams() {
  let paths: { slug: string; locale: string }[] = [];

  const locales = routing.locales;

  let sbParams: ISbStoriesParams = {
    version: 'published',
    starts_with: 'welcome/',
  };

  const storyblokApi = getStoryblokApi();

  const { data } = (await storyblokApi.get('cdn/links', sbParams, {
    cache: 'no-store',
  })) as ISbResult;

  Object.keys(data.links).forEach((linkKey: string) => {
    const story = data.links[linkKey];

    if (story.is_folder || !story.published) return;

    const slug = story.slug;

    if (locales) {
      for (const locale of locales) {
        paths.push({ slug, locale });
      }
    }
  });

  return paths;
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; partnerName: string }>;
}) {
  const locale = (await params).locale;
  const partnerName = (await params).partnerName;

  const pageProps = await getStoryblokPageProps(`welcome/${partnerName}`, locale);
  const story = pageProps?.story as ISbStoryData;

  if (!story) {
    return <NoDataAvailable />;
  }

  return (
    <StoryblokWelcomePage
      {...(story.content as StoryblokWelcomePageProps)}
      storySlug={story.slug}
    />
  );
}
