import NoDataAvailable from '@/components/common/NoDataAvailable';
import StoryblokResourceShortPage, {
  StoryblokResourceShortPageProps,
} from '@/components/storyblok/StoryblokResourceShortPage';
import { routing } from '@/i18n/routing';
import { getStoryblokStories, getStoryblokStory } from '@/lib/storyblok';
import { getStoryblokApi, ISbStoriesParams } from '@storyblok/react/rsc';

export const dynamicParams = false;
export const revalidate = 14400; // invalidate every 4 hours

export async function generateStaticParams() {
  let paths: { slug: string; locale: string }[] = [];

  const locales = routing.locales;
  const storyblokApi = getStoryblokApi();

  let sbParams: ISbStoriesParams = {
    version: 'published',
    starts_with: 'shorts/',
    filter_query: {
      component: {
        in: 'resource_short',
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

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const locale = (await params).locale;
  const slug = (await params).slug;

  const story = await getStoryblokStory(`shorts/${slug}`, locale, {
    resolve_relations: [
      'resource_short_video.related_content',
      'resource_short_video.related_session',
      'resource_short_video.related_session.course',
    ],
  });

  const relatedCourse = await getStoryblokStories(
    locale,
    {},
    story?.content.related_session[0].content.course,
  );

  if (!story) {
    return <NoDataAvailable />;
  }

  return (
    <StoryblokResourceShortPage
      {...(story.content as StoryblokResourceShortPageProps)}
      related_course={relatedCourse ? relatedCourse[0] : undefined}
      storyId={story.id}
    />
  );
}
