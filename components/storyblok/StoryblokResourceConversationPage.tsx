'use client';

import { ContentUnavailable } from '@/components/common/ContentUnavailable';
import { ResourceAudioPlayer } from '@/components/resources/ResourceAudioPlayer';
import { ResourcePageLayout } from '@/components/resources/ResourcePageLayout';
import { RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import {
  RESOURCE_CONVERSATION_TRANSCRIPT_CLOSED,
  RESOURCE_CONVERSATION_TRANSCRIPT_OPENED,
  RESOURCE_CONVERSATION_VIEWED,
} from '@/lib/constants/events';
import {
  useStoryblokResourcePage,
  type ResourceStoryContent,
} from '@/lib/hooks/useStoryblokResourcePage';
import { Box } from '@mui/material';
import { ISbStoryData, SbBlokData, storyblokEditable } from '@storyblok/react/rsc';
import { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';
import { StoryblokRelatedContentStory } from './StoryblokRelatedContent';
import { StoryblokTeamMembersSectionProps } from './StoryblokTeamMembersSection';

export interface StoryblokResourceConversationPageProps extends ResourceStoryContent {
  _uid: string;
  _editable: string;
  description: StoryblokRichtext;
  header_image: { filename: string; alt: string };
  duration: string;
  audio: { filename: string };
  audio_transcript: StoryblokRichtext;
  team_members_section?: StoryblokTeamMembersSectionProps[];
  page_sections: SbBlokData[];
  related_content: StoryblokRelatedContentStory[];
  component: 'resource_conversation';
}

const EVENT_PREFIX = 'RESOURCE_CONVERSATION' as const;

// `resource_conversation` merges into `resource_audio` in step 7, so it never gained the
// `related_session` field the other resource types have — hence no `relatedSessionHref` here.

const StoryblokResourceConversationPage = ({ story: initialStory }: { story: ISbStoryData }) => {
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
  } = useStoryblokResourcePage<StoryblokResourceConversationPageProps>({
    initialStory,
    category: RESOURCE_CATEGORIES.CONVERSATION,
    eventPrefix: EVENT_PREFIX,
    viewedEvent: RESOURCE_CONVERSATION_VIEWED,
    // Block predates the `login_required` field, so gate until it lands.
    loginRequiredByDefault: true,
  });

  const {
    _uid,
    _editable,
    name,
    description,
    header_image,
    audio,
    audio_transcript,
    team_members_section,
    page_sections,
    related_content,
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
        team_members_section,
        page_sections,
        related_content,
      })}
    >
      <ResourcePageLayout
        format="audio"
        name={name}
        storyUuid={storyUuid}
        category={RESOURCE_CATEGORIES.CONVERSATION}
        eventPrefix={EVENT_PREFIX}
        resourceProgress={resourceProgress}
        resourceId={resourceId}
        onComplete={complete}
        isSignedIn={isSignedIn}
        contentAccessStatus={contentAccessStatus}
        eventData={eventData}
        description={description}
        transcript={audio_transcript}
        transcriptEvents={{
          opened: RESOURCE_CONVERSATION_TRANSCRIPT_OPENED,
          closed: RESOURCE_CONVERSATION_TRANSCRIPT_CLOSED,
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

export default StoryblokResourceConversationPage;
