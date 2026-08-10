import LibraryPage from '@/components/pages/LibraryPage';
import { getLibraryStories } from '@/lib/utils/getLibraryStories';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

// Bloom's unified content hub: courses and single sessions behind one guided search.
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

  // LibraryPage reads the `?type=` / `?theme=` filters with `useSearchParams`, which needs a
  // Suspense boundary above it.
  return (
    <Suspense>
      <LibraryPage stories={stories} />
    </Suspense>
  );
}
