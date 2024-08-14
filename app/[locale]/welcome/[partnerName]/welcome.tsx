'use client';

import { ISbStoryData, useStoryblokState } from '@storyblok/react';
import NoDataAvailable from '../../../../components/common/NoDataAvailable';
import StoryblokWelcomePage, {
  StoryblokWelcomePageProps,
} from '../../../../components/storyblok/StoryblokWelcomePage';

interface WelcomeProps {
  story: ISbStoryData | null;
}

const Welcome = ({ story }: WelcomeProps) => {
  story = useStoryblokState(story);

  if (!story) {
    return <NoDataAvailable />;
  }

  return (
    <StoryblokWelcomePage
      {...(story.content as StoryblokWelcomePageProps)}
      storySlug={story.slug}
    />
  );
};

export default Welcome;
