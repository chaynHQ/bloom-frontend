import { getStoryblokStory } from '@/lib/storyblok';
import HomePage from '../../components/pages/HomePage';

export const revalidate = 14400; // invalidate every 4 hours

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const story = await getStoryblokStory('home', locale, {
    resolve_relations: ['resource_carousel.resources'],
  });
  return <HomePage story={story} />;
}
