import StoryblokResourceConversationPage from '@/components/storyblok/StoryblokResourceConversationPage';
import { getStoryblokStory, resourceFolderStaticParams } from '@/lib/storyblok';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const dynamicParams = false;
export const revalidate = 14400; // invalidate every 4 hours

type Params = Promise<{ locale: string; slug: string }>;

async function getStory(locale: string, slug: string) {
  return await getStoryblokStory(`conversations/${slug}`, locale, {
    resolve_relations: [
      'resource_conversation.related_content',
      'resource_conversation.related_grounding',
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
    titleParent: t('conversations'),
    description: story.content.seo_description,
  });
}

export function generateStaticParams() {
  return resourceFolderStaticParams('conversations');
}

export default async function Page({ params }: { params: Params }) {
  const { locale, slug } = await params;

  const story = await getStory(locale, slug);

  if (!story) {
    notFound();
  }

  return <StoryblokResourceConversationPage story={story} />;
}
