'use client';

import { RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import { RESOURCE_WRITTEN_VIEWED } from '@/lib/constants/events';
import { ISbStoryData, SbBlokData } from '@storyblok/react/rsc';
import { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';
import { StoryblokRelatedContentStory } from './StoryblokRelatedContent';
import { StoryblokTeamMembersSectionProps } from './StoryblokTeamMembersSection';
import { StoryblokTextResourcePage } from './StoryblokTextResourcePage';

export interface StoryblokResourceWrittenPageProps {
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
  component: 'resource_written';
  included_for_partners: string[];
}

const StoryblokResourceWrittenPage = ({ story }: { story: ISbStoryData }) => (
  <StoryblokTextResourcePage
    initialStory={story}
    format="written"
    category={RESOURCE_CATEGORIES.WRITTEN}
    eventPrefix="RESOURCE_WRITTEN"
    viewedEvent={RESOURCE_WRITTEN_VIEWED}
  />
);

export default StoryblokResourceWrittenPage;
