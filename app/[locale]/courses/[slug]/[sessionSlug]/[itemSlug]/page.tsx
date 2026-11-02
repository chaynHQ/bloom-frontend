import StoryblokResourceAudioPage from '@/components/storyblok/StoryblokResourceAudioPage';
import StoryblokResourceVideoPage from '@/components/storyblok/StoryblokResourceVideoPage';
import StoryblokResourceWrittenPage from '@/components/storyblok/StoryblokResourceWrittenPage';
import { routing } from '@/i18n/routing';
import { STORYBLOK_ENVIRONMENT } from '@/lib/constants/common';
import { type CourseContext } from '@/lib/hooks/useStoryblokResourcePage';
import { getStoryblokStory } from '@/lib/storyblok';
import { getCourseSessions, isModularCourse } from '@/lib/utils/courseSessions';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { getDefaultFullSlug } from '@/lib/utils/getDefaultFullSlug';
import { getCachedCourseStories } from '@/lib/utils/getLibraryStories';
import { courseItemUuids, normaliseSlug } from '@/lib/utils/libraryData';
import { isPublicContent } from '@/lib/utils/partnerContentAccess';
import { breadcrumbJsonLd, JsonLd } from '@/lib/utils/structuredData';
import { getStoryblokApi } from '@storyblok/react/rsc';
import { notFound } from 'next/navigation';

// A modular course's piece, shown inside the course: `/courses/<course>/<folder>/<slug>`.
// `sessionSlug` holds the piece's folder, which keeps the path apart from the old two-segment
// session URLs and from pieces that share a slug across folders.
export const dynamicParams = false;
export const revalidate = 14400; // invalidate every 4 hours

type Params = Promise<{ locale: string; slug: string; sessionSlug: string; itemSlug: string }>;

const RESOURCE_PAGES = {
  video: StoryblokResourceVideoPage,
  audio: StoryblokResourceAudioPage,
  written: StoryblokResourceWrittenPage,
} as const;

type Folder = keyof typeof RESOURCE_PAGES;

const isFolder = (folder: string): folder is Folder => folder in RESOURCE_PAGES;

async function getCourse(locale: string, slug: string) {
  return await getStoryblokStory(`courses/${slug}`, locale, {
    resolve_relations: 'Course.sessions',
  });
}

// Fetched with the same relations as the piece's own route.
async function getItem(locale: string, folder: Folder, itemSlug: string) {
  return await getStoryblokStory(`${folder}/${itemSlug}`, locale, {
    resolve_relations: [
      `resource_${folder}.related_content`,
      `resource_${folder}.related_grounding`,
      `resource_${folder}.related_session`,
    ],
  });
}

// The course and piece, or undefined when the piece isn't in this locale's list for the course.
async function getCourseItem(locale: string, slug: string, folder: string, itemSlug: string) {
  if (!isFolder(folder)) return undefined;
  const [course, item] = await Promise.all([
    getCourse(locale, slug),
    getItem(locale, folder, itemSlug),
  ]);
  if (!course || !item || !isModularCourse(course.content)) return undefined;
  const items = getCourseSessions(course, locale);
  if (!items.some((courseItem) => courseItem.uuid === item.uuid)) return undefined;
  return { course, item, items, folder };
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, slug, sessionSlug, itemSlug } = await params;
  const courseItem = await getCourseItem(locale, slug, sessionSlug, itemSlug);
  if (!courseItem) return;
  const { course, item } = courseItem;

  // Canonical is the piece's own page: the course URL is another route to the same content.
  return generateMetadataBasic({
    title: item.content.name,
    titleParent: course.content.name,
    description: item.content.seo_description || item.content.description,
    locale,
    path: `/${sessionSlug}/${itemSlug}`,
    languages: item.content.languages,
    noIndex:
      !isPublicContent(course.content.included_for_partners) ||
      !isPublicContent(item.content.included_for_partners),
  });
}

export async function generateStaticParams() {
  const includeDrafts = STORYBLOK_ENVIRONMENT === 'draft';
  const storyblokApi = getStoryblokApi();
  const folderLinks = await Promise.all(
    Object.keys(RESOURCE_PAGES).map((folder) =>
      storyblokApi.get('cdn/links/', { version: STORYBLOK_ENVIRONMENT, starts_with: `${folder}/` }),
    ),
  );
  const linksByUuid = new Map<string, { slug: string; published: boolean }>(
    folderLinks.flatMap(({ data }) =>
      Object.values(
        data.links as Record<string, { uuid: string; slug: string; published: boolean }>,
      )
        .filter((link) => link.slug)
        .map((link) => [link.uuid, link]),
    ),
  );

  const paths: { locale: string; slug: string; sessionSlug: string; itemSlug: string }[] = [];

  for (const locale of routing.locales) {
    const courses = await getCachedCourseStories(locale);
    for (const course of courses) {
      const slug = getDefaultFullSlug(normaliseSlug(course.full_slug), locale).split('/')[2];
      for (const uuid of courseItemUuids(course)) {
        const link = linksByUuid.get(uuid);
        if (!slug || !link || (!link.published && !includeDrafts)) continue;
        const [sessionSlug, itemSlug] = link.slug.split('/');
        paths.push({ locale, slug, sessionSlug, itemSlug });
      }
    }
  }

  return paths;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, slug, sessionSlug, itemSlug } = await params;

  const [courseItem, courseStories] = await Promise.all([
    getCourseItem(locale, slug, sessionSlug, itemSlug),
    getCachedCourseStories(locale),
  ]);

  if (!courseItem) {
    notFound();
  }

  const { course, item, items, folder } = courseItem;
  const courseHref = getDefaultFullSlug(normaliseSlug(course.full_slug), locale);
  const courseContext: CourseContext = {
    courseName: course.content.name,
    courseHref,
    courseUuid: course.uuid,
    courseIncludedForPartners: course.content.included_for_partners ?? [],
    items,
  };
  const partOfCourseStories = courseStories.filter((story) =>
    courseItemUuids(story).includes(item.uuid),
  );

  const breadcrumbs = await breadcrumbJsonLd(locale, [
    { name: course.content.name, path: `/courses/${slug}` },
    { name: item.content.name },
  ]);

  const ResourcePage = RESOURCE_PAGES[folder];

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <ResourcePage
        story={item}
        courseContext={courseContext}
        partOfCourseStories={partOfCourseStories}
      />
    </>
  );
}
