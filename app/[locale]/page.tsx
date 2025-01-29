import { getStoryblokStory } from '@/lib/storyblok';
import HomePage from './page-client';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale;

  const story = await getStoryblokStory('home', locale);
  return <HomePage story={story} />;
}
