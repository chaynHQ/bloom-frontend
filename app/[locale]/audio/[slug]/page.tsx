import StoryblokResourceAudioPage from '@/components/storyblok/StoryblokResourceAudioPage';
import { getStoryblokStory, resourceFolderStaticParams } from '@/lib/storyblok';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { isPublicContent } from '@/lib/utils/partnerContentAccess';
import { breadcrumbJsonLd, JsonLd, resourceJsonLd } from '@/lib/utils/structuredData';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const dynamicParams = false;
export const revalidate = 14400; // invalidate every 4 hours

type Params = Promise<{ locale: string; slug: string }>;

async function getStory(locale: string, slug: string) {
  return await getStoryblokStory(`audio/${slug}`, locale, {
    resolve_relations: [
      'resource_audio.related_content',
      'resource_audio.related_grounding',
      'resource_audio.related_session',
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
    titleParent: t('audio'),
    description: story.content.seo_description || story.content.description,
    locale,
    path: `/audio/${slug}`,
    languages: story.content.languages,
    noIndex: !isPublicContent(story.content.included_for_partners),
    image: story.content.header_image?.filename,
  });
}

export function generateStaticParams() {
  return resourceFolderStaticParams('audio');
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
      <JsonLd data={resourceJsonLd('AudioObject', story, locale, `/audio/${slug}`)} />
      <JsonLd data={breadcrumbs} />
      <StoryblokResourceAudioPage story={story} />
    </>
  );
}
