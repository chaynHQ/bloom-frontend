import StoryblokResourceVideoPage from '@/components/storyblok/StoryblokResourceVideoPage';
import { getStoryblokStory, resourceFolderStaticParams } from '@/lib/storyblok';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { isPublicContent } from '@/lib/utils/partnerContentAccess';
import { breadcrumbJsonLd, JsonLd, videoJsonLd } from '@/lib/utils/structuredData';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const dynamicParams = false;
export const revalidate = 14400; // invalidate every 4 hours

type Params = Promise<{ locale: string; slug: string }>;

async function getStory(locale: string, slug: string) {
  return await getStoryblokStory(`video/${slug}`, locale, {
    resolve_relations: [
      'resource_video.related_content',
      'resource_video.related_grounding',
      'resource_video.related_session',
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
    titleParent: t('video'),
    description: story.content.seo_description || story.content.description,
    locale,
    path: `/video/${slug}`,
    languages: story.content.languages,
    noIndex: !isPublicContent(story.content.included_for_partners),
    image: story.content.preview_image?.filename,
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

  const breadcrumbs = await breadcrumbJsonLd(locale, [{ name: story.content.name }]);

  return (
    <>
      <JsonLd data={videoJsonLd(story, locale, `/video/${slug}`)} />
      <JsonLd data={breadcrumbs} />
      <StoryblokResourceVideoPage story={story} />
    </>
  );
}
