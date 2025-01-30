import NoDataAvailable from '@/components/common/NoDataAvailable';
import { getStoryblokStory } from '@/lib/storyblok';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import NotesPage from '../../../../components/pages/NotesPage';

export const revalidate = 14400; // invalidate every 4 hours

type Params = Promise<{ locale: string; slug: string }>;

async function getStory(locale: string) {
  return await getStoryblokStory('subscription/whatsapp', locale);
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  const story = await getStory(locale);

  if (!story) return;

  return generateMetadataBasic({
    title: story.content.title,
    description: story.content.seo_description,
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale;
  const story = await getStory(locale);

  if (!story) {
    return <NoDataAvailable />;
  }

  return <NotesPage story={story} />;
}
