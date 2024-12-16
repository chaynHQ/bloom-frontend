import { Box, Button, Container, Typography } from '@mui/material';
import { ISbRichtext, storyblokEditable } from '@storyblok/react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';
import { PROGRESS_STATUS, RESOURCE_CATEGORIES } from '../../constants/enums';
import {
  RESOURCE_CONVERSATION_TRANSCRIPT_CLOSED,
  RESOURCE_CONVERSATION_TRANSCRIPT_OPENED,
  RESOURCE_CONVERSATION_VIEWED,
} from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import { Resource } from '../../store/resourcesSlice';
import { getEventUserData, logEvent } from '../../utils/logEvent';
import { RichTextOptions } from '../../utils/richText';
import { SignUpBanner } from '../banner/SignUpBanner';
import ResourceFeedbackForm from '../forms/ResourceFeedbackForm';
import { ResourceCompleteButton } from '../resources/ResourceCompleteButton';
import VideoTranscriptModal from '../video/VideoTranscriptModal';
import { StoryblokPageSectionProps } from './StoryblokPageSection';
import { StoryblokRelatedContent, StoryblokRelatedContentStory } from './StoryblokRelatedContent';
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

export interface StoryblokResourceConversationPageProps {
  storyId: number;
  _uid: string;
  _editable: string;
  name: string;
  seo_description: string;
  description: ISbRichtext;
  audio: { filename: string };
  audio_transcript: ISbRichtext;
  page_sections: StoryblokPageSectionProps[];
  related_content: StoryblokRelatedContentStory[];
  related_exercises: string[];
}

const StoryblokResourceConversationPage = (props: StoryblokResourceConversationPageProps) => {
  const {
    storyId,
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
  } = props;

  const t = useTranslations('Resources');
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const resources = useTypedSelector((state) => state.resources);
  const isLoggedIn = useTypedSelector((state) => Boolean(state.user.id));
  const [resourceProgress, setResourceProgress] = useState<PROGRESS_STATUS>(
    PROGRESS_STATUS.NOT_STARTED,
  );
  const [resourceId, setResourceId] = useState<string>();
  const [openTranscriptModal, setOpenTranscriptModal] = useState<boolean | null>(null);
  console.log(props);
  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);

  const eventData = useMemo(() => {
    return {
      ...eventUserData,
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
      {
        ...eventData,
        name,
      },
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
      <Container>
        <Typography variant="h1">{name}</Typography>
        <Typography variant="h3">Progress: {resourceProgress}</Typography>
        {render(description, RichTextOptions)}
        <Box position="relative">
          <ReactPlayer width="100%" height="50px" url={audio.filename} controls />
        </Box>
        <Button variant="contained" sx={{ my: 3 }} onClick={() => setOpenTranscriptModal(true)}>
          Open transcript
        </Button>
        <VideoTranscriptModal
          videoName={name}
          content={audio_transcript}
          setOpenTranscriptModal={setOpenTranscriptModal}
          openTranscriptModal={openTranscriptModal}
        />
        {resourceProgress !== PROGRESS_STATUS.COMPLETED && (
          <ResourceCompleteButton
            category={RESOURCE_CATEGORIES.CONVERSATION}
            storyId={storyId}
            eventData={eventData}
          />
        )}
        <Typography variant="h2">Related content</Typography>
        <StoryblokRelatedContent
          relatedContent={related_content}
          relatedExercises={related_exercises}
        />
      </Container>
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
