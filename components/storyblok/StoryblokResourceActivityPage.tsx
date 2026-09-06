'use client';

import { RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import { RESOURCE_ACTIVITY_VIEWED } from '@/lib/constants/events';
import { ISbStoryData, SbBlokData } from '@storyblok/react/rsc';
import { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';
import { StoryblokRelatedContentStory } from './StoryblokRelatedContent';
import { StoryblokTeamMembersSectionProps } from './StoryblokTeamMembersSection';
import { StoryblokTextResourcePage } from './StoryblokTextResourcePage';

export interface StoryblokResourceActivityPageProps {
  _uid: string;
  _editable: string;
  name: string;
  description: StoryblokRichtext;
  header_image: { filename: string; alt: string };
  duration: string;
  body: StoryblokRichtext;
  login_required: boolean;
  contributor_images?: { filename: string; alt: string }[];
  contributors_description?: string;
  team_members_section?: StoryblokTeamMembersSectionProps[];
  page_sections: SbBlokData[];
  related_content: StoryblokRelatedContentStory[];
  related_grounding: ISbStoryData[];
  languages: string[];
  component: 'resource_activity';
  included_for_partners: string[];
}

const StoryblokResourceActivityPage = ({ story }: { story: ISbStoryData }) => (
  <StoryblokTextResourcePage
    initialStory={story}
    format="activity"
    category={RESOURCE_CATEGORIES.ACTIVITY}
    eventPrefix="RESOURCE_ACTIVITY"
    viewedEvent={RESOURCE_ACTIVITY_VIEWED}
  />
);

export default StoryblokResourceActivityPage;
