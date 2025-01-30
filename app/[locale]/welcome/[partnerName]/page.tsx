import NoDataAvailable from '@/components/common/NoDataAvailable';
import StoryblokWelcomePage, {
  StoryblokWelcomePageProps,
} from '@/components/storyblok/StoryblokWelcomePage';
import { routing } from '@/i18n/routing';
import { getStoryblokStory } from '@/lib/storyblok';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { ISbResult, ISbStoriesParams, getStoryblokApi } from '@storyblok/react/rsc';

export const revalidate = 14400; // invalidate every 4 hours

type Params = Promise<{ locale: string; partnerName: string }>;

async function getStory(locale: string, partnerName: string) {
  return await getStoryblokStory(`welcome/${partnerName}`, locale);
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, partnerName } = await params;
  const story = await getStory(locale, partnerName);

  if (!story) return;

  return generateMetadataBasic({
    title: story.content.title,
    description: story.content.seo_description,
  });
}

export async function generateStaticParams() {
  let paths: { slug: string; locale: string }[] = [];

  const locales = routing.locales;

  let sbParams: ISbStoriesParams = {
    version: 'published',
    starts_with: 'welcome/',
  };

  const storyblokApi = getStoryblokApi();

  const { data } = (await storyblokApi.get('cdn/links', sbParams)) as ISbResult;

  Object.keys(data.links).forEach((linkKey: string) => {
    const story = data.links[linkKey];

    if (story.is_folder || !story.published) return;

    const slug = story.slug;

    for (const locale of locales) {
      paths.push({ slug, locale });
    }
  });

  return paths;
}

export default async function Page({ params }: { params: Params }) {
  const locale = (await params).locale;
  const partnerName = (await params).partnerName;

  const story = await getStory(locale, partnerName);

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
