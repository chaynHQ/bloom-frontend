import { ISbStoryData, useStoryblokState } from '@storyblok/react';
import { GetStaticPropsContext, NextPage } from 'next';
import NoDataAvailable from '../components/common/NoDataAvailable';
import StoryblokMeetTheTeamPage, {
  StoryblokMeetTheTeamPageProps,
} from '../components/storyblok/StoryblokMeetTheTeamPage';
import { getStoryblokPageProps } from '../utils/getStoryblokPageProps';

interface Props {
  story: ISbStoryData | null;
}

const MeetTheTeam: NextPage<Props> = ({ story }) => {
  story = useStoryblokState(story);

  if (!story) {
    return <NoDataAvailable />;
  }

  return <StoryblokMeetTheTeamPage {...(story.content as StoryblokMeetTheTeamPageProps)} />;
};

export async function getStaticProps({ locale, preview = false }: GetStaticPropsContext) {
  const storyblokProps = await getStoryblokPageProps('meet-the-team', locale, preview);

  return {
    props: {
      ...storyblokProps,
      messages: {
        ...require(`../messages/shared/${locale}.json`),
        ...require(`../messages/navigation/${locale}.json`),
      },
    },
    revalidate: 3600, // revalidate every hour
  };
}

export default MeetTheTeam;
