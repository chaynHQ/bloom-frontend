'use client';

import { ContentUnavailable } from '@/components/common/ContentUnavailable';
import References from '@/components/common/References';
import { ResourcePageLayout } from '@/components/resources/ResourcePageLayout';
import Video from '@/components/video/Video';
import { RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import {
  RESOURCE_VIDEO_TRANSCRIPT_CLOSED,
  RESOURCE_VIDEO_TRANSCRIPT_OPENED,
  RESOURCE_VIDEO_VIEWED,
} from '@/lib/constants/events';
import {
  useStoryblokResourcePage,
  type ResourceStoryContent,
} from '@/lib/hooks/useStoryblokResourcePage';
import { Box, Typography } from '@mui/material';
import { ISbStoryData, SbBlokData, storyblokEditable } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';
import { StoryblokRelatedContentStory } from './StoryblokRelatedContent';
import { StoryblokTeamMembersSectionProps } from './StoryblokTeamMembersSection';
import { StoryblokReferenceProps } from './StoryblokTypes';

// `resource_video` is the merge of the old `resource_short_video` and `resource_single_video`
// blocks (step 7). During the transition a story may still carry either old component name — the
// fields below are a superset of both, and this page renders it regardless.
export interface StoryblokResourceVideoPageProps extends ResourceStoryContent {
  _uid: string;
  _editable: string;
  subtitle?: string;
  description: StoryblokRichtext;
  duration: string;
  video: { url: string };
  video_transcript: StoryblokRichtext;
  references?: StoryblokReferenceProps[];
  login_required?: boolean;
  team_members_section?: StoryblokTeamMembersSectionProps[];
  page_sections: SbBlokData[];
  related_content: StoryblokRelatedContentStory[];
  related_grounding?: ISbStoryData[];
  component: 'resource_video' | 'resource_short_video' | 'resource_single_video';
}

const EVENT_PREFIX = 'RESOURCE_VIDEO' as const;

const StoryblokResourceVideoPage = ({ story: initialStory }: { story: ISbStoryData }) => {
  const t = useTranslations('Resources');
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
    relatedSessionName,
    userContentPartners,
    start,
    complete,
  } = useStoryblokResourcePage<StoryblokResourceVideoPageProps>({
    initialStory,
    category: RESOURCE_CATEGORIES.VIDEO,
    eventPrefix: EVENT_PREFIX,
    viewedEvent: RESOURCE_VIDEO_VIEWED,
    // Shorts have always been public and only gain an explicit `login_required` when step 7c moves
    // them; the old somatic-video block predates the field and gates by default. Keep both true to
    // form until every story carries the flag.
    loginRequiredByDefault: initialStory.content.component !== 'resource_short_video',
  });

  const {
    _uid,
    _editable,
    name,
    subtitle,
    description,
    video,
    video_transcript,
    references,
    login_required,
    team_members_section,
    page_sections,
    related_content,
    related_session,
  } = content;

  const keyReferences = useMemo(
    () => references?.filter((r) => r.is_key_reference) ?? [],
    [references],
  );

  if (contentAccessStatus === 'accessDenied') {
    return <ContentUnavailable />;
  }

  return (
    <Box
      {...storyblokEditable({
        _uid,
        _editable,
        name,
        subtitle,
        description,
        video,
        video_transcript,
        references,
        login_required,
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
        category={RESOURCE_CATEGORIES.VIDEO}
        eventPrefix={EVENT_PREFIX}
        resourceProgress={resourceProgress}
        resourceId={resourceId}
        onComplete={complete}
        isSignedIn={isSignedIn}
        contentAccessStatus={contentAccessStatus}
        eventData={eventData}
        description={description}
        transcript={video_transcript}
        transcriptEvents={{
          opened: RESOURCE_VIDEO_TRANSCRIPT_OPENED,
          closed: RESOURCE_VIDEO_TRANSCRIPT_CLOSED,
        }}
        onTranscriptStart={start}
        hero={{ subtitle }}
        contributors={contributors}
        teamMembersSection={team_members_section?.[0]}
        pageSections={page_sections}
        relatedGrounding={relatedGrounding}
        relatedContent={related_content}
        userContentPartners={userContentPartners}
        relatedSessionHref={relatedSessionHref}
        relatedSessionName={relatedSessionName}
        beforeSections={
          keyReferences.length > 0 && (
            <Box>
              <Typography sx={{ mb: 1 }}>{t('references.keyReferences')}</Typography>
              <References references={keyReferences} />
            </Box>
          )
        }
        media={
          <Video
            url={video.url}
            eventPrefix={EVENT_PREFIX}
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

export default StoryblokResourceVideoPage;
