import NoDataAvailable from '@/components/common/NoDataAvailable';
import StoryblokSessionPage, {
  StoryblokSessionPageProps,
} from '@/components/storyblok/StoryblokSessionPage';
import { routing } from '@/i18n/routing';
import { getStoryblokStory } from '@/lib/storyblok';
import { getStoryblokApi, ISbStoriesParams } from '@storyblok/react/rsc';

export const dynamicParams = false;
export const revalidate = 14400; // invalidate every 4 hours

export async function generateStaticParams() {
  let paths: { slug: string; locale: string }[] = [];

  const locales = routing.locales;
  const storyblokApi = getStoryblokApi();

  let sbParams: ISbStoriesParams = {
    version: 'published',
    starts_with: 'courses/',
    content_type: 'session',
  };

  let { data } = await storyblokApi.get('cdn/links', sbParams, { cache: 'no-store' });

  Object.keys(data.links).forEach((linkKey) => {
    const session = data.links[linkKey];

    if (!session.slug || !session.published || session.is_startpage || session.is_folder) return;

    // get array for slug because of catch all
    const courseSlug = session.slug.split('/')[1];
    const sessionSlug = session.slug.split('/')[2];

    if (locales) {
      // create additional languages
      for (const locale of locales) {
        paths.push({ slug: `/${courseSlug}/${sessionSlug}`, locale });
      }
    }
  });

  return paths;
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string; sessionSlug: string }>;
}) {
  const locale = (await params).locale;
  const slug = (await params).slug;
  const sessionSlug = (await params).sessionSlug;

  const fullSlug = `courses/${slug}/${sessionSlug}`;

  const story = await getStoryblokStory(fullSlug, locale, {
    resolve_relations: ['Session.course', 'session_iba.course'],
  });

  if (!story) {
    return <NoDataAvailable />;
  }

  const content = story.content as StoryblokSessionPageProps;

  return (
    <StoryblokSessionPage
      {...content}
      storyId={story.id}
      storyUuid={story.uuid}
      storyPosition={story.position}
    />
  );
}
