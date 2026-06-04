import LibraryPage from '@/components/pages/LibraryPage';
import { THEMES, type ThemeKey } from '@/components/pages/library/libraryData';

// NOTE: This is a static illustrative prototype of a unified "library" pattern that mixes
// courses with individual resources (the "sessions" in the new designs) behind one guided
// search. Content is hard-coded dummy data — no Storyblok/Redux wiring yet. See LibraryPage.tsx.

export const metadata = {
  title: 'Library | Bloom',
  description: 'Explore Bloom courses and single sessions in one place.',
};

type SearchParams = Promise<{ type?: string; theme?: string }>;

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const { type, theme } = await searchParams;
  // Links like /library?type=course or /library?theme=healing-journey (e.g. from the
  // homepage) pre-select the relevant filters.
  const initialKind = type === 'course' || type === 'session' ? type : 'all';
  const themeKeys = THEMES.map((t) => t.key) as string[];
  const initialThemes = theme && themeKeys.includes(theme) ? [theme as ThemeKey] : [];
  return <LibraryPage initialKind={initialKind} initialThemes={initialThemes} />;
}
