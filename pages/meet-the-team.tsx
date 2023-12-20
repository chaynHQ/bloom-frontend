import { ISbStoryData, useStoryblokState } from '@storyblok/react';
import { GetStaticPropsContext, NextPage } from 'next';
import NoDataAvailable from '../components/common/NoDataAvailable';
import StoryblokMeetTheTeamPage, {
  StoryblokMeetTheTeamPageProps,
} from '../components/storyblok/StoryblokMeetTheTeamPage';
import { columnStyle, rowStyle } from '../styles/common';
import { getStoryblokPageProps } from '../utils/getStoryblokPageProps';

const coreContainerStyle = {
  backgroundColor: 'secondary.light',
} as const;

const supportingContainerStyle = {
  backgroundColor: 'primary.light',
} as const;

const cardColumnStyle = {
  ...columnStyle,
  justifyContent: 'flex-start',
  width: { xs: '100%', sm: 'calc(50% - 1rem)' },
  gap: { xs: 0, sm: 2, md: 4 },
} as const;

const cardColumnRowStyle = {
  ...rowStyle,
  marginTop: { xs: 2, md: 5 },
} as const;

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
