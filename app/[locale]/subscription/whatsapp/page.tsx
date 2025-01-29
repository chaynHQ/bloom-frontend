import NoDataAvailable from '@/components/common/NoDataAvailable';
import { getStoryblokStory } from '@/lib/storyblok';
import NotesPage from '../../../../components/pages/NotesPage';

export const revalidate = 14400; // invalidate every 4 hours

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale;
  const story = await getStoryblokStory('subscription/whatsapp', locale);

  if (!story) {
    return <NoDataAvailable />;
  }

  return <NotesPage story={story} />;
}
