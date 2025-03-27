'use client';

import { SignUpBanner } from '@/components/banner/SignUpBanner';
import PageSection from '@/components/common/PageSection';
import ResourceFeedbackForm from '@/components/forms/ResourceFeedbackForm';
import { PROGRESS_STATUS, RESOURCE_CATEGORIES, STORYBLOK_COLORS } from '@/lib/constants/enums';
import { RESOURCE_CONVERSATION_VIEWED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { Resource } from '@/lib/store/resourcesSlice';
import logEvent from '@/lib/utils/logEvent';
import userHasAccessToPartnerContent from '@/lib/utils/userHasAccessToPartnerContent';
import { rowStyle } from '@/styles/common';
import { Box, Container, Typography } from '@mui/material';
import { ISbRichtext, storyblokEditable } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { ResourceConversationHeader } from '../resources/ResourceConversationHeader';
import { StoryblokPageSectionProps } from './StoryblokPageSection';
import { StoryblokRelatedContent, StoryblokRelatedContentStory } from './StoryblokRelatedContent';

const audioContainerStyle = {
  mt: { xs: 4, md: 6 },
  mb: 3,
} as const;

const progressStyle = {
  ...rowStyle,
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: 3,
  mt: 2,
  '.MuiBox-root': {
    mt: 0,
  },
} as const;

export interface StoryblokResourceConversationPageProps {
  storyUuid: string;
  _uid: string;
  _editable: string;
  name: string;
  description: ISbRichtext;
  header_image: { filename: string; alt: string };
  duration: string;
  audio: { filename: string };
  audio_transcript: ISbRichtext;
  page_sections: StoryblokPageSectionProps[];
  related_content: StoryblokRelatedContentStory[];
  related_exercises: string[];
  languages: string[];
  component: 'resource_conversation';
  included_for_partners: string[];
}

const StoryblokResourceConversationPage = (props: StoryblokResourceConversationPageProps) => {
  const {
    storyUuid,
    _uid,
    _editable,
    name,
    description,
    header_image,
    audio,
    audio_transcript,
    page_sections,
    related_content,
    related_exercises,
  } = props;

  const tS = useTranslations('Shared');
  const userId = useTypedSelector((state) => state.user.id);

  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const resources = useTypedSelector((state) => state.resources);
  const isLoggedIn = useTypedSelector((state) => Boolean(state.user.id));
  const [resourceProgress, setResourceProgress] = useState<PROGRESS_STATUS>(
    PROGRESS_STATUS.NOT_STARTED,
  );
  const [resourceId, setResourceId] = useState<string>();

  const eventData = useMemo(() => {
    return {
      resource_category: RESOURCE_CATEGORIES.CONVERSATION,
      resource_name: name,
      resource_storyblok_uuid: storyUuid,
      resource_progress: resourceProgress,
    };
  }, [name, storyUuid, resourceProgress]);

  useEffect(() => {
    const userResource = resources.find(
      (resource: Resource) => resource.storyblokUuid === storyUuid,
    );

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
    logEvent(RESOURCE_CONVERSATION_VIEWED, eventData);
  }, []);

  return (
    <Box
      {...storyblokEditable({
        _uid,
        _editable,
        name,
        description,
        audio,
        audio_transcript,
        page_sections,
        related_content,
        related_exercises,
      })}
    >
      <ResourceConversationHeader
        {...{
          storyUuid,
          name,
          description,
          header_image,
          resourceProgress,
          audio,
          audio_transcript,
          eventData,
        }}
      />
      {resourceId && (
        <Container sx={{ bgcolor: 'background.paper' }}>
          <ResourceFeedbackForm
            resourceId={resourceId}
            category={RESOURCE_CATEGORIES.CONVERSATION}
          />
        </Container>
      )}
      <PageSection color={STORYBLOK_COLORS.SECONDARY_MAIN} alignment="left">
        <Typography variant="h2" fontWeight={500}>
          {tS('relatedContent.title')}
        </Typography>
        <StoryblokRelatedContent
          relatedContent={related_content}
          relatedExercises={related_exercises}
          userContentPartners={userHasAccessToPartnerContent(
            partnerAdmin?.partner,
            partnerAccesses,
            null,
            userId,
          )}
        />
      </PageSection>
      {!isLoggedIn && <SignUpBanner />}
    </Box>
  );
};

export default StoryblokResourceConversationPage;
