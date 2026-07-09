import { getLibraryStories } from '@/components/library/getLibraryStories';
import { THEME_KEYS, type ContentType, type ThemeKey } from '@/components/library/libraryData';
import LibraryPage from '@/components/pages/LibraryPage';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { getTranslations } from 'next-intl/server';

// The library is Bloom's unified content hub: it mixes courses with single sessions (shorts,
// somatic videos, and audio conversations) behind one guided search, all backed by real
// Storyblok content (including each story's `theme`).

export const revalidate = 14400; // invalidate every 4 hours, matching the other content pages

type Params = Promise<{ locale: string }>;
type SearchParams = Promise<{ type?: string; theme?: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Library' });

  return generateMetadataBasic({
    title: t('metadata.title'),
    description: t('metadata.description'),
  });
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { locale } = await params;
  const { type, theme } = await searchParams;
  // Links like /library?type=course or /library?theme=healing-journey (e.g. from other pages)
  // pre-select the relevant filters. `type=course` ticks the "Courses" content-type filter.
  const initialContentTypes: ContentType[] = type === 'course' ? ['course'] : [];
  const initialThemes =
    theme && (THEME_KEYS as string[]).includes(theme) ? [theme as ThemeKey] : [];

  const stories = await getLibraryStories(locale);

  return (
    <LibraryPage
      stories={stories}
      initialContentTypes={initialContentTypes}
      initialThemes={initialThemes}
    />
  );
}
