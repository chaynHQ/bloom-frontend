import StoryblokResourceVideoPage from '@/components/storyblok/StoryblokResourceVideoPage';
import { getOptionalStoryblokStory, resourceFolderStaticParams } from '@/lib/storyblok';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Transitional route: `video/` fills when step 7c moves `shorts/*` + `videos/*` into it. Until
// then a request can be for a story still in either old folder, so fall back to those and resolve
// relations under the old component names too. `dynamicParams` goes back to `false` with a real
// `generateStaticParams` in step 7d, once every story has moved.
export const dynamicParams = true;
export const revalidate = 14400; // invalidate every 4 hours

type Params = Promise<{ locale: string; slug: string }>;

const RESOLVE_RELATIONS = [
  'resource_video.related_content',
  'resource_video.related_grounding',
  'resource_video.related_session',
  'resource_short_video.related_content',
  'resource_short_video.related_grounding',
  'resource_short_video.related_session',
  'resource_single_video.related_content',
  'resource_single_video.related_grounding',
  'resource_single_video.related_session',
];

async function getStory(locale: string, slug: string) {
  const params = { resolve_relations: RESOLVE_RELATIONS };
  return (
    (await getOptionalStoryblokStory(`video/${slug}`, locale, params)) ??
    (await getOptionalStoryblokStory(`shorts/${slug}`, locale, params)) ??
    (await getOptionalStoryblokStory(`videos/${slug}`, locale, params))
  );
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'Resources' });
  const story = await getStory(locale, slug);

  if (!story) return;

  return generateMetadataBasic({
    title: story.content.name,
    titleParent: t('video'),
    description: story.content.seo_description,
  });
}

export function generateStaticParams() {
  return resourceFolderStaticParams('video');
}

export default async function Page({ params }: { params: Params }) {
  const { locale, slug } = await params;

  const story = await getStory(locale, slug);

  if (!story) {
    notFound();
  }

  return <StoryblokResourceVideoPage story={story} />;
}
