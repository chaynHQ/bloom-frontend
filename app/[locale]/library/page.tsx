import { getLibraryStories } from '@/components/library/getLibraryStories';
import LibraryPage from '@/components/pages/LibraryPage';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

// The library is Bloom's unified content hub: it mixes courses with single sessions (course
// lessons, shorts, somatic videos, and audio conversations) behind one guided search, all
// backed by real Storyblok content (including each story's `themes`).

export const revalidate = 14400; // invalidate every 4 hours, matching the other content pages

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Library' });

  return generateMetadataBasic({
    title: t('metadata.title'),
    description: t('metadata.description'),
  });
}

export default async function Page({ params }: { params: Params }) {
  const { locale } = await params;
  const stories = await getLibraryStories(locale);

  // The `?type=` / `?theme=` deep-link filters are read in LibraryPage with `useSearchParams`,
  // as the courses page read its own `?section=` param — they only seed client filter state, so
  // there is nothing for the server to do with them, and taking them as a server `searchParams`
  // prop would keep this route from ever being prerendered. `useSearchParams` needs a Suspense
  // boundary above it.
  return (
    <Suspense>
      <LibraryPage stories={stories} />
    </Suspense>
  );
}
