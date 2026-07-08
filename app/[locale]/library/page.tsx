import { getLibraryStories } from '@/components/library/getLibraryStories';
import { THEMES, type ThemeKey } from '@/components/library/libraryData';
import LibraryPage from '@/components/pages/LibraryPage';

// The library is Bloom's unified content hub: it mixes courses with single sessions (shorts,
// somatic videos, and audio conversations) behind one guided search, all backed by real
// Storyblok content (including each story's `theme`).

export const revalidate = 14400; // invalidate every 4 hours, matching the other content pages

export const metadata = {
  title: 'Library | Bloom',
  description: 'Explore Bloom courses and single sessions in one place.',
};

type Params = Promise<{ locale: string }>;
type SearchParams = Promise<{ type?: string; theme?: string }>;

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
  // pre-select the relevant filters.
  const initialKind = type === 'course' || type === 'session' ? type : 'all';
  const themeKeys = THEMES.map((t) => t.key) as string[];
  const initialThemes = theme && themeKeys.includes(theme) ? [theme as ThemeKey] : [];

  const stories = await getLibraryStories(locale);

  return <LibraryPage stories={stories} initialKind={initialKind} initialThemes={initialThemes} />;
}
