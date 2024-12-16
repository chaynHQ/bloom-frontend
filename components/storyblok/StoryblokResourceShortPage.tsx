import { Box, Container, Typography } from '@mui/material';
import { ISbRichtext, storyblokEditable } from '@storyblok/react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';
import { PROGRESS_STATUS, RESOURCE_CATEGORIES } from '../../constants/enums';
import {
  RESOURCE_SHORT_VIDEO_TRANSCRIPT_CLOSED,
  RESOURCE_SHORT_VIDEO_TRANSCRIPT_OPENED,
  RESOURCE_SHORT_VIDEO_VIEWED,
} from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import { Resource } from '../../store/resourcesSlice';
import { getEventUserData, logEvent } from '../../utils/logEvent';
import { RichTextOptions } from '../../utils/richText';
import { SignUpBanner } from '../banner/SignUpBanner';
import ResourceFeedbackForm from '../forms/ResourceFeedbackForm';
import { ResourceCompleteButton } from '../resources/ResourceCompleteButton';
import { ResourceShortVideo } from '../resources/ResourceShortVideo';
import { StoryblokPageSectionProps } from './StoryblokPageSection';
import { StoryblokRelatedContent, StoryblokRelatedContentStory } from './StoryblokRelatedContent';
import { StoryblokSessionPageProps } from './StoryblokSessionPage';
import { videoConfig } from './StoryblokVideo';
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

export interface StoryblokResourceShortPageProps {
  storyId: number;
  _uid: string;
  _editable: string;
  name: string;
  seo_description: string;
  description: ISbRichtext;
  video: { url: string };
  video_transcript: ISbRichtext;
  page_sections: StoryblokPageSectionProps[];
  related_session: StoryblokSessionPageProps;
  related_content: StoryblokRelatedContentStory[];
  related_exercises: string[];
}

const StoryblokResourceShortPage = (props: StoryblokResourceShortPageProps) => {
  const {
    storyId,
    _uid,
    _editable,
    name,
    seo_description,
    description,
    video,
    video_transcript,
    page_sections,
    related_session,
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
    logEvent(RESOURCE_SHORT_VIDEO_VIEWED, eventData);
  }, []);

  useEffect(() => {
    if (openTranscriptModal === null) {
      return;
    }

    logEvent(
      openTranscriptModal
        ? RESOURCE_SHORT_VIDEO_TRANSCRIPT_OPENED
        : RESOURCE_SHORT_VIDEO_TRANSCRIPT_CLOSED,
      {
        ...eventData,
        name,
      },
    );
  }, [openTranscriptModal, name, eventData]);

  const videoOptions = videoConfig(video);

  return (
    <Box
      {...storyblokEditable({
        _uid,
        _editable,
        name,
        seo_description,
        description,
        video,
        video_transcript,
        page_sections,
        related_session,
        related_content,
        related_exercises,
      })}
    >
      <Head>
        <title>{`${t('shorts')} • ${name} • Bloom`}</title>
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
        <ResourceShortVideo
          eventData={eventData}
          resourceProgress={resourceProgress}
          name={name}
          storyId={storyId}
          video={video}
          video_transcript={video_transcript}
        />
        {resourceProgress !== PROGRESS_STATUS.COMPLETED && (
          <ResourceCompleteButton
            category={RESOURCE_CATEGORIES.SHORT_VIDEO}
            storyId={storyId}
            eventData={eventData}
          />
        )}
        <Typography variant="h2" mt={6}>
          Related content
        </Typography>
        <StoryblokRelatedContent
          relatedContent={related_content}
          relatedExercises={related_exercises}
        />
      </Container>
      {resourceId && (
        <Container sx={{ bgcolor: 'background.paper' }}>
          <ResourceFeedbackForm
            resourceId={resourceId}
            category={RESOURCE_CATEGORIES.SHORT_VIDEO}
          />
        </Container>
      )}
      {!isLoggedIn && <SignUpBanner />}
    </Box>
  );
};

export default StoryblokResourceShortPage;
