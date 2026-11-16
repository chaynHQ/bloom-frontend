'use client';

import { RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import { RESOURCE_GROUNDING_VIEWED } from '@/lib/constants/events';
import { type ResourcePageContextProps } from '@/lib/hooks/useStoryblokResourcePage';
import { ISbStoryData } from '@storyblok/react/rsc';
import { StoryblokTextResourcePage } from './StoryblokTextResourcePage';

// A grounding exercise listed by a modular course. Outside a course it opens in a dialog on
// `/grounding`; inside one it's a course step, marked done like a written resource.
const StoryblokResourceGroundingPage = ({
  story,
  ...context
}: { story: ISbStoryData } & ResourcePageContextProps) => (
  <StoryblokTextResourcePage
    {...context}
    initialStory={story}
    format="grounding"
    category={RESOURCE_CATEGORIES.GROUNDING}
    eventPrefix="RESOURCE_GROUNDING"
    viewedEvent={RESOURCE_GROUNDING_VIEWED}
  />
);

export default StoryblokResourceGroundingPage;
