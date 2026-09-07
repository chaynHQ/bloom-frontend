'use client';

import { ContentUnavailable } from '@/components/common/ContentUnavailable';
import { ResourceAudioPlayer } from '@/components/resources/ResourceAudioPlayer';
import { ResourcePageLayout } from '@/components/resources/ResourcePageLayout';
import { RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import {
  RESOURCE_AUDIO_TRANSCRIPT_CLOSED,
  RESOURCE_AUDIO_TRANSCRIPT_OPENED,
  RESOURCE_AUDIO_VIEWED,
} from '@/lib/constants/events';
import { useStoryblokResourcePage } from '@/lib/hooks/useStoryblokResourcePage';
import { Box } from '@mui/material';
import { ISbStoryData, SbBlokData, storyblokEditable } from '@storyblok/react/rsc';
import { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';
import { StoryblokRelatedContentStory } from './StoryblokRelatedContent';
import { StoryblokTeamMembersSectionProps } from './StoryblokTeamMembersSection';

export interface StoryblokResourceAudioPageProps {
  _uid: string;
  _editable: string;
  name: string;
  description: StoryblokRichtext;
  header_image: { filename: string; alt: string };
  duration: string;
  audio: { filename: string };
  audio_transcript: StoryblokRichtext;
  login_required: boolean;
  contributor_images?: { filename: string; alt: string }[];
  contributors_description?: string;
  team_members_section?: StoryblokTeamMembersSectionProps[];
  page_sections: SbBlokData[];
  related_content: StoryblokRelatedContentStory[];
  related_grounding: ISbStoryData[];
  languages: string[];
  component: 'resource_audio';
  included_for_partners: string[];
}

const EVENT_PREFIX = 'RESOURCE_AUDIO' as const;

const StoryblokResourceAudioPage = ({ story: initialStory }: { story: ISbStoryData }) => {
  const {
    content,
    storyUuid,
    isSignedIn,
    contentAccessStatus,
    resourceProgress,
    resourceId,
    eventData,
    contributors,
    relatedGrounding,
    userContentPartners,
    start,
    complete,
  } = useStoryblokResourcePage<StoryblokResourceAudioPageProps>({
    initialStory,
    category: RESOURCE_CATEGORIES.AUDIO,
    eventPrefix: EVENT_PREFIX,
    viewedEvent: RESOURCE_AUDIO_VIEWED,
  });

  const {
    _uid,
    _editable,
    name,
    description,
    header_image,
    audio,
    audio_transcript,
    login_required,
    team_members_section,
    page_sections,
    related_content,
    related_grounding,
  } = content;

  if (contentAccessStatus === 'accessDenied') {
    return <ContentUnavailable />;
  }

  return (
    <Box
      {...storyblokEditable({
        _uid,
        _editable,
        name,
        description,
        audio,
        audio_transcript,
        login_required,
        team_members_section,
        page_sections,
        related_content,
        related_grounding,
      })}
    >
      <ResourcePageLayout
        format="audio"
        name={name}
        storyUuid={storyUuid}
        category={RESOURCE_CATEGORIES.AUDIO}
        eventPrefix={EVENT_PREFIX}
        resourceProgress={resourceProgress}
        resourceId={resourceId}
        isSignedIn={isSignedIn}
        contentAccessStatus={contentAccessStatus}
        eventData={eventData}
        description={description}
        transcript={audio_transcript}
        transcriptEvents={{
          opened: RESOURCE_AUDIO_TRANSCRIPT_OPENED,
          closed: RESOURCE_AUDIO_TRANSCRIPT_CLOSED,
        }}
        onTranscriptStart={start}
        hero={{ imageSrc: header_image?.filename || undefined, imageAlt: header_image?.alt }}
        contributors={contributors}
        teamMembersSection={team_members_section?.[0]}
        pageSections={page_sections}
        relatedGrounding={relatedGrounding}
        relatedContent={related_content}
        userContentPartners={userContentPartners}
        media={
          <ResourceAudioPlayer
            url={audio.filename}
            eventPrefix={EVENT_PREFIX}
            eventData={eventData}
            onStart={start}
            onFinish={complete}
          />
        }
      />
    </Box>
  );
};

export default StoryblokResourceAudioPage;
