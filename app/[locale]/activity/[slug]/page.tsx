import StoryblokResourceActivityPage from '@/components/storyblok/StoryblokResourceActivityPage';
import { getStoryblokStory, resourceFolderStaticParams } from '@/lib/storyblok';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const dynamicParams = false;
export const revalidate = 14400; // invalidate every 4 hours

type Params = Promise<{ locale: string; slug: string }>;

async function getStory(locale: string, slug: string) {
  return await getStoryblokStory(`activity/${slug}`, locale, {
    resolve_relations: [
      'resource_activity.related_content',
      'resource_activity.related_grounding',
      'resource_activity.related_session',
    ],
  });
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'Resources' });
  const story = await getStory(locale, slug);

  if (!story) return;

  return generateMetadataBasic({
    title: story.content.name,
    titleParent: t('activity'),
    description: story.content.seo_description,
  });
}

export function generateStaticParams() {
  return resourceFolderStaticParams('activity');
}

export default async function Page({ params }: { params: Params }) {
  const { locale, slug } = await params;

  const story = await getStory(locale, slug);

  if (!story) {
    notFound();
  }

  return <StoryblokResourceActivityPage story={story} />;
}
