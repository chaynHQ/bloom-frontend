import StoryblokResourceWrittenPage from '@/components/storyblok/StoryblokResourceWrittenPage';
import { getStoryblokStory, resourceFolderStaticParams } from '@/lib/storyblok';
import { getCachedCourseStories } from '@/lib/utils/getLibraryStories';
import { courseItemUuids } from '@/lib/utils/libraryData';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { isPublicContent } from '@/lib/utils/partnerContentAccess';
import { breadcrumbJsonLd, JsonLd, resourceJsonLd } from '@/lib/utils/structuredData';
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
    description: story.content.seo_description || story.content.description,
    locale,
    path: `/written/${slug}`,
    languages: story.content.languages,
    noIndex: !isPublicContent(story.content.included_for_partners),
    image: story.content.header_image?.filename,
  });
}

export function generateStaticParams() {
  return resourceFolderStaticParams('written');
}

export default async function Page({ params }: { params: Params }) {
  const { locale, slug } = await params;

  const [story, courseStories] = await Promise.all([
    getStory(locale, slug),
    getCachedCourseStories(locale),
  ]);

  if (!story) {
    notFound();
  }

  const partOfCourseStories = courseStories.filter((course) =>
    courseItemUuids(course).includes(story.uuid),
  );
  const breadcrumbs = await breadcrumbJsonLd(locale, [{ name: story.content.name }]);

  return (
    <>
      <JsonLd data={resourceJsonLd('Article', story, locale, `/written/${slug}`)} />
      <JsonLd data={breadcrumbs} />
      <StoryblokResourceWrittenPage story={story} partOfCourseStories={partOfCourseStories} />
    </>
  );
}
