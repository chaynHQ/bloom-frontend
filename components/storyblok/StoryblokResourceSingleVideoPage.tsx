'use client';

import { ContentUnavailable } from '@/components/common/ContentUnavailable';
import References from '@/components/common/References';
import { ResourcePageLayout } from '@/components/resources/ResourcePageLayout';
import Video from '@/components/video/Video';
import { RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import {
  RESOURCE_SINGLE_VIDEO_TRANSCRIPT_CLOSED,
  RESOURCE_SINGLE_VIDEO_TRANSCRIPT_OPENED,
  RESOURCE_SINGLE_VIDEO_VIEWED,
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

export interface StoryblokResourceSingleVideoPageProps extends ResourceStoryContent {
  _uid: string;
  _editable: string;
  subtitle: string;
  description: StoryblokRichtext;
  duration: string;
  video: { url: string };
  video_transcript: StoryblokRichtext;
  team_members_section?: StoryblokTeamMembersSectionProps[];
  page_sections: SbBlokData[];
  related_content: StoryblokRelatedContentStory[];
  references: StoryblokReferenceProps[];
  component: 'resource_single_video';
}

const EVENT_PREFIX = 'RESOURCE_SINGLE_VIDEO' as const;

const StoryblokResourceSingleVideoPage = ({ story: initialStory }: { story: ISbStoryData }) => {
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
    userContentPartners,
    start,
    complete,
  } = useStoryblokResourcePage<StoryblokResourceSingleVideoPageProps>({
    initialStory,
    category: RESOURCE_CATEGORIES.SINGLE_VIDEO,
    eventPrefix: EVENT_PREFIX,
    viewedEvent: RESOURCE_SINGLE_VIDEO_VIEWED,
    // Block predates the `login_required` field, so gate until it lands.
    loginRequiredByDefault: true,
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
        team_members_section,
        references,
        page_sections,
        related_content,
        related_session,
      })}
    >
      <ResourcePageLayout
        format="video"
        name={name}
        storyUuid={storyUuid}
        category={RESOURCE_CATEGORIES.SINGLE_VIDEO}
        eventPrefix={EVENT_PREFIX}
        resourceProgress={resourceProgress}
        resourceId={resourceId}
        isSignedIn={isSignedIn}
        contentAccessStatus={contentAccessStatus}
        eventData={eventData}
        description={description}
        transcript={video_transcript}
        transcriptEvents={{
          opened: RESOURCE_SINGLE_VIDEO_TRANSCRIPT_OPENED,
          closed: RESOURCE_SINGLE_VIDEO_TRANSCRIPT_CLOSED,
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

export default StoryblokResourceSingleVideoPage;
