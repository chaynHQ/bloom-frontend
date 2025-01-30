import NoDataAvailable from '@/lib/components/common/NoDataAvailable';
import StoryblokMeetTheTeamPage, {
  StoryblokMeetTheTeamPageProps,
} from '@/lib/components/storyblok/StoryblokMeetTheTeamPage';
import { getStoryblokStory } from '@/lib/storyblok';

export const revalidate = 14400; // invalidate every 4 hours

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale;
  const story = await getStoryblokStory('meet-the-team', locale);

  if (!story) {
    return <NoDataAvailable />;
  }

  return <StoryblokMeetTheTeamPage {...(story.content as StoryblokMeetTheTeamPageProps)} />;
}
