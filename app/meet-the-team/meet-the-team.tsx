'use client';

import { ISbStoryData, useStoryblokState } from '@storyblok/react';
import NoDataAvailable from '../../components/common/NoDataAvailable';
import StoryblokMeetTheTeamPage, {
  StoryblokMeetTheTeamPageProps,
} from '../../components/storyblok/StoryblokMeetTheTeamPage';
import { columnStyle, rowStyle } from '../../styles/common';

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

const MeetTheTeam = ({ story }: { story: ISbStoryData }) => {
  const storyData = useStoryblokState(story);

  if (!storyData) {
    return <NoDataAvailable />;
  }

  return <StoryblokMeetTheTeamPage {...(storyData.content as StoryblokMeetTheTeamPageProps)} />;
};

export default MeetTheTeam;
