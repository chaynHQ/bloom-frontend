'use client';

import { SignUpBanner } from '@/components/banner/SignUpBanner';
import PageSection from '@/components/common/PageSection';
import ProgressStatus from '@/components/common/ProgressStatus';
import ResourceFeedbackForm from '@/components/forms/ResourceFeedbackForm';
import Header from '@/components/layout/Header';
import { ResourceCompleteButton } from '@/components/resources/ResourceCompleteButton';
import { ResourceConversationAudio } from '@/components/resources/ResourceConversationAudio';
import { PROGRESS_STATUS, RESOURCE_CATEGORIES, STORYBLOK_COLORS } from '@/lib/constants/enums';
import { RESOURCE_CONVERSATION_VIEWED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { Resource } from '@/lib/store/resourcesSlice';
import logEvent from '@/lib/utils/logEvent';
import { RichTextOptions } from '@/lib/utils/richText';
import userHasAccessToPartnerContent from '@/lib/utils/userHasAccessToPartnerContent';
import illustrationCourses from '@/public/illustration_courses.svg';
import { rowStyle } from '@/styles/common';
import { Box, Container, Typography } from '@mui/material';
import { ISbRichtext, storyblokEditable } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';
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
  storyId: number;
  _uid: string;
  _editable: string;
  name: string;
  seo_description: string;
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
    storyId,
    _uid,
    _editable,
    name,
    seo_description,
    description,
    header_image,
    audio,
    audio_transcript,
    page_sections,
    related_content,
    related_exercises,
  } = props;

  const t = useTranslations('Resources');
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
      resource_storyblok_id: storyId,
      resource_progress: resourceProgress,
    };
  }, [name, storyId, resourceProgress]);

  useEffect(() => {
    const userResource = resources.find((resource: Resource) => resource.storyblokId === storyId);

    if (userResource) {
      userResource.completed
        ? setResourceProgress(PROGRESS_STATUS.COMPLETED)
        : setResourceProgress(PROGRESS_STATUS.STARTED);
      setResourceId(userResource.id);
    } else {
      setResourceProgress(PROGRESS_STATUS.NOT_STARTED);
    }
  }, [resources, storyId]);

  useEffect(() => {
    logEvent(RESOURCE_CONVERSATION_VIEWED, eventData);
  }, []);

  return (
    <Box
      {...storyblokEditable({
        _uid,
        _editable,
        name,
        seo_description,
        description,
        audio,
        audio_transcript,
        page_sections,
        related_content,
        related_exercises,
      })}
    >
      <Header
        title={name}
        introduction={
          <Box display="flex" flexDirection="column" gap={3}>
            {render(description, RichTextOptions)}
            <Box sx={audioContainerStyle}>
              <ResourceConversationAudio
                eventData={eventData}
                resourceProgress={resourceProgress}
                name={name}
                storyId={storyId}
                audio={audio.filename}
                audio_transcript={audio_transcript}
              />
            </Box>
            <Box>
              {resourceId && (
                <Box sx={progressStyle}>
                  {resourceProgress && <ProgressStatus status={resourceProgress} />}
                  {resourceProgress !== PROGRESS_STATUS.COMPLETED && (
                    <ResourceCompleteButton
                      category={RESOURCE_CATEGORIES.SHORT_VIDEO}
                      storyId={storyId}
                      eventData={eventData}
                    />
                  )}
                </Box>
              )}
            </Box>
          </Box>
        }
        imageSrc={header_image ? header_image.filename : illustrationCourses}
      />
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
      {resourceId && (
        <Container sx={{ bgcolor: 'background.paper' }}>
          <ResourceFeedbackForm
            resourceId={resourceId}
            category={RESOURCE_CATEGORIES.CONVERSATION}
          />
        </Container>
      )}
      {!isLoggedIn && <SignUpBanner />}
    </Box>
  );
};

export default StoryblokResourceConversationPage;
