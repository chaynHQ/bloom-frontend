import NoDataAvailable from '@/components/common/NoDataAvailable';
import StoryblokResourceConversationPage, {
  StoryblokResourceConversationPageProps,
} from '@/components/storyblok/StoryblokResourceConversationPage';
import { routing } from '@/i18n/routing';
import { getStoryblokStory } from '@/lib/storyblok';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { getStoryblokApi, ISbStoriesParams } from '@storyblok/react/rsc';
import { getTranslations } from 'next-intl/server';

export const dynamicParams = false;
export const revalidate = 14400; // invalidate every 4 hours

type Params = Promise<{ locale: string; slug: string }>;

async function getStory(locale: string, slug: string) {
  return await getStoryblokStory(`conversations/${slug}`, locale, {
    resolve_relations: ['resource_conversation.related_content'],
  });
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'Resources' });
  const story = await getStory(locale, slug);

  if (!story) return;

  return generateMetadataBasic({
    title: story.content.name,
    titleParent: t('conversations'),
    description: story.content.seo_description,
  });
}

export async function generateStaticParams() {
  let paths: { slug: string; locale: string }[] = [];

  const locales = routing.locales;
  const storyblokApi = getStoryblokApi();

  let sbParams: ISbStoriesParams = {
    version: 'published',
    starts_with: 'conversations/',
    filter_query: {
      component: {
        in: 'resource_conversation',
      },
    },
  };

  const { data } = await storyblokApi.get('cdn/links/', sbParams);

  Object.keys(data.links).forEach((linkKey) => {
    const story = data.links[linkKey];

    if (!story.slug || !story.published) return;

    const slug = story.slug.split('/')[1];

    for (const locale of locales) {
      paths.push({ slug, locale });
    }
  });
  return paths;
}

export default async function Page({ params }: { params: Params }) {
  const locale = (await params).locale;
  const slug = (await params).slug;

  const story = await getStory(locale, slug);

  if (!story) {
    return <NoDataAvailable />;
  }

  return (
    <StoryblokResourceConversationPage
      {...(story.content as StoryblokResourceConversationPageProps)}
      storyId={story.id}
    />
  );
}
