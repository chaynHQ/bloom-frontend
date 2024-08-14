'use client';

import { ISbStoryData, useStoryblokState } from '@storyblok/react';
import NoDataAvailable from '../../../components/common/NoDataAvailable';
import StoryblokMeetTheTeamPage, {
  StoryblokMeetTheTeamPageProps,
} from '../../../components/storyblok/StoryblokMeetTheTeamPage';

interface MeetTheTeamProps {
  story: ISbStoryData | null;
}

const MeetTheTeam = ({ story }: MeetTheTeamProps) => {
  const storyData = useStoryblokState(story);

  if (!storyData) {
    return <NoDataAvailable />;
  }

  return <StoryblokMeetTheTeamPage {...(storyData.content as StoryblokMeetTheTeamPageProps)} />;
};

export default MeetTheTeam;
