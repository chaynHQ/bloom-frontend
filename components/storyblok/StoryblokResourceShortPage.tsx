'use client';

import { ContentUnavailable } from '@/components/common/ContentUnavailable';
import { ResourcePageLayout } from '@/components/resources/ResourcePageLayout';
import Video from '@/components/video/Video';
import { RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import {
  RESOURCE_SHORT_VIDEO_TRANSCRIPT_CLOSED,
  RESOURCE_SHORT_VIDEO_TRANSCRIPT_OPENED,
  RESOURCE_SHORT_VIDEO_VIEWED,
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

export interface StoryblokResourceShortPageProps extends ResourceStoryContent {
  _uid: string;
  _editable: string;
  description: StoryblokRichtext;
  duration: string;
  video: { url: string };
  video_transcript: StoryblokRichtext;
  team_members_section?: StoryblokTeamMembersSectionProps[];
  page_sections: SbBlokData[];
  related_content: StoryblokRelatedContentStory[];
  component: 'resource_short_video';
}

const EVENT_PREFIX = 'RESOURCE_SHORT_VIDEO' as const;

const StoryblokResourceShortPage = ({ story: initialStory }: { story: ISbStoryData }) => {
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
    relatedSessionHref,
    userContentPartners,
    start,
    complete,
  } = useStoryblokResourcePage<StoryblokResourceShortPageProps>({
    initialStory,
    category: RESOURCE_CATEGORIES.SHORT_VIDEO,
    eventPrefix: EVENT_PREFIX,
    viewedEvent: RESOURCE_SHORT_VIDEO_VIEWED,
  });

  const {
    _uid,
    _editable,
    name,
    description,
    video,
    video_transcript,
    team_members_section,
    page_sections,
    related_content,
    related_session,
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
        video,
        video_transcript,
        team_members_section,
        page_sections,
        related_content,
        related_session,
      })}
    >
      <ResourcePageLayout
        format="video"
        name={name}
        storyUuid={storyUuid}
        category={RESOURCE_CATEGORIES.SHORT_VIDEO}
        eventPrefix={EVENT_PREFIX}
        resourceProgress={resourceProgress}
        resourceId={resourceId}
        isSignedIn={isSignedIn}
        contentAccessStatus={contentAccessStatus}
        eventData={eventData}
        description={description}
        transcript={video_transcript}
        transcriptEvents={{
          opened: RESOURCE_SHORT_VIDEO_TRANSCRIPT_OPENED,
          closed: RESOURCE_SHORT_VIDEO_TRANSCRIPT_CLOSED,
        }}
        onTranscriptStart={start}
        contributors={contributors}
        teamMembersSection={team_members_section?.[0]}
        pageSections={page_sections}
        relatedGrounding={relatedGrounding}
        relatedContent={related_content}
        userContentPartners={userContentPartners}
        relatedSessionHref={relatedSessionHref}
        media={
          <Video
            url={video.url}
            eventPrefix="RESOURCE_SHORT"
            eventData={eventData}
            setVideoStarted={() => start()}
            setVideoFinished={() => complete()}
            containerStyles={{ maxWidth: '100%', mt: 0 }}
          />
        }
      />
    </Box>
  );
};

export default StoryblokResourceShortPage;
