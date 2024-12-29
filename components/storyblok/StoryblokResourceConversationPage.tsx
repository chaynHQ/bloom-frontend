import { Box, Container, Typography } from '@mui/material';
import { ISbRichtext, storyblokEditable } from '@storyblok/react';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';
import { PROGRESS_STATUS, RESOURCE_CATEGORIES, STORYBLOK_COLORS } from '../../constants/enums';
import {
  RESOURCE_CONVERSATION_TRANSCRIPT_CLOSED,
  RESOURCE_CONVERSATION_TRANSCRIPT_OPENED,
  RESOURCE_CONVERSATION_VIEWED,
} from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import illustrationCourses from '../../public/illustration_courses.svg';
import { Resource } from '../../store/resourcesSlice';
import { rowStyle } from '../../styles/common';
import { getEventUserData, logEvent } from '../../utils/logEvent';
import { RichTextOptions } from '../../utils/richText';
import userHasAccessToPartnerContent from '../../utils/userHasAccessToPartnerContent';
import { SignUpBanner } from '../banner/SignUpBanner';
import PageSection from '../common/PageSection';
import ProgressStatus from '../common/ProgressStatus';
import ResourceFeedbackForm from '../forms/ResourceFeedbackForm';
import Header from '../layout/Header';
import { ResourceCompleteButton } from '../resources/ResourceCompleteButton';
import { ResourceConversationAudio } from '../resources/ResourceConversationAudio';
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
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const userId = useTypedSelector((state) => state.user.id);

  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const resources = useTypedSelector((state) => state.resources);
  const isLoggedIn = useTypedSelector((state) => Boolean(state.user.id));
  const [resourceProgress, setResourceProgress] = useState<PROGRESS_STATUS>(
    PROGRESS_STATUS.NOT_STARTED,
  );
  const [resourceId, setResourceId] = useState<string>();
  const [openTranscriptModal, setOpenTranscriptModal] = useState<boolean | null>(null);

  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);

  const eventData = useMemo(() => {
    return {
      ...eventUserData,
      resource_category: RESOURCE_CATEGORIES.CONVERSATION,
      resource_name: name,
      resource_storyblok_id: storyId,
      resource_progress: resourceProgress,
    };
  }, [eventUserData, name, storyId, resourceProgress]);

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

  useEffect(() => {
    if (openTranscriptModal === null) {
      return;
    }

    logEvent(
      openTranscriptModal
        ? RESOURCE_CONVERSATION_TRANSCRIPT_OPENED
        : RESOURCE_CONVERSATION_TRANSCRIPT_CLOSED,
      eventData,
    );
  }, [openTranscriptModal, name, eventData]);

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
      <Head>
        <title>{`${t('conversations')} • ${name} • Bloom`}</title>
        <meta property="og:title" content={name} key="og-title" />
        {seo_description && (
          <>
            <meta name="description" content={seo_description} key="description" />
            <meta property="og:description" content={seo_description} key="og-description" />
          </>
        )}
      </Head>
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
                      resourceName={name}
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
        <Typography variant="h2" fontWeight={600}>
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
