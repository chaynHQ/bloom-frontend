import StoryblokResourceAudioPage from '@/components/storyblok/StoryblokResourceAudioPage';
import StoryblokResourceGroundingPage from '@/components/storyblok/StoryblokResourceGroundingPage';
import StoryblokResourceVideoPage from '@/components/storyblok/StoryblokResourceVideoPage';
import StoryblokResourceWrittenPage from '@/components/storyblok/StoryblokResourceWrittenPage';
import { routing } from '@/i18n/routing';
import { STORYBLOK_ENVIRONMENT } from '@/lib/constants/common';
import { type CourseContext } from '@/lib/hooks/useStoryblokResourcePage';
import { getStoryblokStory, resolveCourseResources } from '@/lib/storyblok';
import { getCourseSessions, isModularCourse } from '@/lib/utils/courseSessions';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { getDefaultFullSlug } from '@/lib/utils/getDefaultFullSlug';
import { getCachedCourseStories } from '@/lib/utils/getLibraryStories';
import { courseResourceUuids, normaliseSlug } from '@/lib/utils/libraryData';
import { isPublicContent } from '@/lib/utils/partnerContentAccess';
import { breadcrumbJsonLd, JsonLd } from '@/lib/utils/structuredData';
import { getStoryblokApi } from '@storyblok/react/rsc';
import { notFound } from 'next/navigation';

// A modular course's resource, shown inside the course: `/courses/<course>/<folder>/<slug>`.
// The folder is needed because a slug can exist in more than one folder (`what-are-boundaries` is
// both a video and an audio). Next.js requires this segment to share the session route's
// `sessionSlug` name.
export const revalidate = 14400; // invalidate every 4 hours

type Params = Promise<{ locale: string; slug: string; sessionSlug: string; resourceSlug: string }>;

const RESOURCE_PAGES = {
  video: StoryblokResourceVideoPage,
  audio: StoryblokResourceAudioPage,
  written: StoryblokResourceWrittenPage,
  grounding: StoryblokResourceGroundingPage,
} as const;

type Folder = keyof typeof RESOURCE_PAGES;

const isFolder = (folder: string): folder is Folder => folder in RESOURCE_PAGES;

async function getCourse(locale: string, slug: string) {
  const course = await getStoryblokStory(`courses/${slug}`, locale, {
    resolve_relations: 'Course.sessions',
  });
  return await resolveCourseResources(course, locale);
}

// Fetched with the same relations as the resource's own route.
async function getResource(locale: string, folder: Folder, resourceSlug: string) {
  return await getStoryblokStory(`${folder}/${resourceSlug}`, locale, {
    resolve_relations: [
      `resource_${folder}.related_content`,
      `resource_${folder}.related_grounding`,
      `resource_${folder}.related_session`,
    ],
  });
}

// The course and resource, or undefined when the resource isn't in this locale's list for the course.
async function getCourseResource(
  locale: string,
  slug: string,
  folder: string,
  resourceSlug: string,
) {
  if (!isFolder(folder)) return undefined;
  const [course, resource] = await Promise.all([
    getCourse(locale, slug),
    getResource(locale, folder, resourceSlug),
  ]);
  if (!course || !resource || !isModularCourse(course.content)) return undefined;
  const resources = getCourseSessions(course, locale);
  if (!resources.some((courseSession) => courseSession.uuid === resource.uuid)) return undefined;
  return { course, resource, resources, folder };
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, slug, sessionSlug, resourceSlug } = await params;
  const courseResource = await getCourseResource(locale, slug, sessionSlug, resourceSlug);
  if (!courseResource) return;
  const { course, resource } = courseResource;

  // Canonical is the resource's own page: the course URL is another route to the same content.
  return generateMetadataBasic({
    title: resource.content.name,
    titleParent: course.content.name,
    description: resource.content.seo_description || resource.content.description,
    locale,
    path: `/${sessionSlug}/${resourceSlug}`,
    languages: resource.content.languages,
    noIndex:
      !isPublicContent(course.content.included_for_partners) ||
      !isPublicContent(resource.content.included_for_partners),
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

  const paths: { locale: string; slug: string; sessionSlug: string; resourceSlug: string }[] = [];

  for (const locale of routing.locales) {
    const courses = await getCachedCourseStories(locale);
    for (const course of courses) {
      const slug = getDefaultFullSlug(normaliseSlug(course.full_slug), locale).split('/')[2];
      for (const uuid of courseResourceUuids(course)) {
        const link = linksByUuid.get(uuid);
        if (!slug || !link || (!link.published && !includeDrafts)) continue;
        const [sessionSlug, resourceSlug] = link.slug.split('/');
        paths.push({ locale, slug, sessionSlug, resourceSlug });
      }
    }
  }

  return paths;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, slug, sessionSlug, resourceSlug } = await params;

  const [courseResource, courseStories] = await Promise.all([
    getCourseResource(locale, slug, sessionSlug, resourceSlug),
    getCachedCourseStories(locale),
  ]);

  if (!courseResource) {
    notFound();
  }

  const { course, resource, resources, folder } = courseResource;
  const courseHref = getDefaultFullSlug(normaliseSlug(course.full_slug), locale);
  const courseContext: CourseContext = {
    courseName: course.content.name,
    courseHref,
    courseUuid: course.uuid,
    courseIncludedForPartners: course.content.included_for_partners ?? [],
    resources,
  };
  const partOfCourseStories = courseStories.filter((story) =>
    courseResourceUuids(story).includes(resource.uuid),
  );

  const breadcrumbs = await breadcrumbJsonLd(locale, [
    { name: course.content.name, path: `/courses/${slug}` },
    { name: resource.content.name },
  ]);

  const ResourcePage = RESOURCE_PAGES[folder];

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <ResourcePage
        story={resource}
        courseContext={courseContext}
        partOfCourseStories={partOfCourseStories}
      />
    </>
  );
}
