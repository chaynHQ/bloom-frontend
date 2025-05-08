import NoDataAvailable from '@/components/common/NoDataAvailable';
import { getStoryblokStory } from '@/lib/storyblok';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import BookTherapyPage from './BookTherapyPage';

type Params = Promise<{ locale: string }>;

async function getStory(locale: string) {
  return await getStoryblokStory('therapy/book-session', locale);
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
  const { locale } = await params;
  const story = await getStory(locale);

  if (!story) {
    return <NoDataAvailable />;
  }

  return <BookTherapyPage story={story} />;
}

export const revalidate = 14400; // invalidate every 4 hours
