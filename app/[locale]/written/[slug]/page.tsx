import StoryblokResourceWrittenPage from '@/components/storyblok/StoryblokResourceWrittenPage';
import { getStoryblokStory, resourceFolderStaticParams } from '@/lib/storyblok';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const dynamicParams = false;
export const revalidate = 14400; // invalidate every 4 hours

type Params = Promise<{ locale: string; slug: string }>;

async function getStory(locale: string, slug: string) {
  return await getStoryblokStory(`written/${slug}`, locale, {
    resolve_relations: [
      'resource_written.related_content',
      'resource_written.related_grounding',
      'resource_written.related_session',
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
    titleParent: t('written'),
    description: story.content.seo_description,
  });
}

export function generateStaticParams() {
  return resourceFolderStaticParams('written');
}

export default async function Page({ params }: { params: Params }) {
  const { locale, slug } = await params;

  const story = await getStory(locale, slug);

  if (!story) {
    notFound();
  }

  return <StoryblokResourceWrittenPage story={story} />;
}
