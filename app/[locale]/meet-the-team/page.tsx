import NoDataAvailable from '@/components/common/NoDataAvailable';
import StoryblokMeetTheTeamPage, {
  StoryblokMeetTheTeamPageProps,
} from '@/components/storyblok/StoryblokMeetTheTeamPage';
import { getStoryblokStory } from '@/lib/storyblok';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';

export const revalidate = 14400; // invalidate every 4 hours

type Params = Promise<{ locale: string }>;

async function getStory(locale: string) {
  return await getStoryblokStory('meet-the-team', locale);
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  const story = await getStory(locale);

  if (!story) return;

  return generateMetadataBasic({
    title: story.content.title,
    description: story.content.seo_description || story.content.description,
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const story = await getStory(locale);

  if (!story) {
    return <NoDataAvailable />;
  }

  return <StoryblokMeetTheTeamPage {...(story.content as StoryblokMeetTheTeamPageProps)} />;
}
