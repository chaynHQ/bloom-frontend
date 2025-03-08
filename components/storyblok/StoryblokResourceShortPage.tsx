'use client';

import { SignUpBanner } from '@/components/banner/SignUpBanner';
import PageSection from '@/components/common/PageSection';
import ResourceFeedbackForm from '@/components/forms/ResourceFeedbackForm';
import { PROGRESS_STATUS, RESOURCE_CATEGORIES, STORYBLOK_COLORS } from '@/lib/constants/enums';
import { RESOURCE_SHORT_VIDEO_VIEWED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { Resource } from '@/lib/store/resourcesSlice';
import logEvent from '@/lib/utils/logEvent';
import userHasAccessToPartnerContent from '@/lib/utils/userHasAccessToPartnerContent';
import { Box, Container, Typography } from '@mui/material';
import { ISbRichtext, ISbStoryData, storyblokEditable } from '@storyblok/react/rsc';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { ResourceShortHeader } from '../resources/ResourceShortsHeader';
import { StoryblokPageSectionProps } from './StoryblokPageSection';
import { StoryblokRelatedContent, StoryblokRelatedContentStory } from './StoryblokRelatedContent';

export interface StoryblokResourceShortPageProps {
  storyUuid: string;
  _uid: string;
  _editable: string;
  name: string;
  description: ISbRichtext;
  duration: string;
  video: { url: string };
  video_transcript: ISbRichtext;
  page_sections: StoryblokPageSectionProps[];
  related_session: ISbStoryData;
  related_course: ISbStoryData;
  related_content: StoryblokRelatedContentStory[];
  related_exercises: string[];
  languages: string[];
  component: 'resource_short_video';
  included_for_partners: string[];
}

const StoryblokResourceShortPage = (props: StoryblokResourceShortPageProps) => {
  const {
    storyUuid,
    _uid,
    _editable,
    name,
    description,
    video,
    video_transcript,
    page_sections,
    related_session,
    related_course,
    related_content,
    related_exercises,
  } = props;

  const tS = useTranslations('Shared');

  const entryPartnerReferral = useTypedSelector((state) => state.user.entryPartnerReferral);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const resources = useTypedSelector((state) => state.resources);
  const userId = useTypedSelector((state) => state.user.id);
  const isLoggedIn = useTypedSelector((state) => Boolean(state.user.id));

  const [resourceProgress, setResourceProgress] = useState<PROGRESS_STATUS>(
    PROGRESS_STATUS.NOT_STARTED,
  );
  const [resourceId, setResourceId] = useState<string>();

  const getContentPartners = useMemo(() => {
    const referralPartner = Cookies.get('referralPartner') || entryPartnerReferral;

    return userHasAccessToPartnerContent(
      partnerAdmin?.partner,
      partnerAccesses,
      referralPartner,
      userId,
    );
  }, [entryPartnerReferral, partnerAccesses, partnerAdmin, userId]);

  const eventData = useMemo(() => {
    return {
      resource_category: RESOURCE_CATEGORIES.SHORT_VIDEO,
      resource_name: name,
      resource_storyblok_uuid: storyUuid,
      resource_progress: resourceProgress,
    };
  }, [name, storyUuid, resourceProgress]);

  useEffect(() => {
    const userResource = resources.find((resource: Resource) => resource.storyblokUuid === storyUuid);

    if (userResource) {
      userResource.completed
        ? setResourceProgress(PROGRESS_STATUS.COMPLETED)
        : setResourceProgress(PROGRESS_STATUS.STARTED);
      setResourceId(userResource.id);
    } else {
      setResourceProgress(PROGRESS_STATUS.NOT_STARTED);
    }
  }, [resources, storyUuid]);

  useEffect(() => {
    logEvent(RESOURCE_SHORT_VIDEO_VIEWED, eventData);
  }, []);

  return (
    <Box
      {...storyblokEditable({
        _uid,
        _editable,
        name,
        description,
        video,
        video_transcript,
        page_sections,
        related_session,
        related_content,
        related_exercises,
      })}
    >
      <ResourceShortHeader
        {...{
          storyUuid,
          name,
          resourceProgress,
          // during the migration from multiple related sessions to a single related session
          // I am leaving this array option
          relatedSession: Array.isArray(related_session) ? related_session[0] : related_session,
          relatedCourse: related_course,
          video,
          video_transcript,
          eventData,
        }}
      />
      {resourceId && (
        <Container sx={{ bgcolor: 'background.paper' }}>
          <ResourceFeedbackForm
            resourceId={resourceId}
            category={RESOURCE_CATEGORIES.SHORT_VIDEO}
          />
        </Container>
      )}

      <PageSection alignment="flex-start" color={STORYBLOK_COLORS.SECONDARY_MAIN}>
        <Typography variant="h2" fontWeight={500}>
          {tS('relatedContent.title')}
        </Typography>
        <StoryblokRelatedContent
          relatedContent={related_content}
          relatedExercises={related_exercises}
          userContentPartners={getContentPartners}
        />
      </PageSection>

      {!isLoggedIn && <SignUpBanner />}
    </Box>
  );
};

export default StoryblokResourceShortPage;
