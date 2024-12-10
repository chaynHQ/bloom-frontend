import { Box, Button, Container, Typography } from '@mui/material';
import { ISbRichtext, storyblokEditable } from '@storyblok/react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';
import { PROGRESS_STATUS } from '../../constants/enums';
import {
  RESOURCE_SHORT_TRANSCRIPT_CLOSED,
  RESOURCE_SHORT_TRANSCRIPT_OPENED,
  RESOURCE_SHORT_VIEWED,
} from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import { Resource } from '../../store/resourcesSlice';
import { getEventUserData, logEvent } from '../../utils/logEvent';
import { RichTextOptions } from '../../utils/richText';
import { SignUpBanner } from '../banner/SignUpBanner';
import VideoTranscriptModal from '../video/VideoTranscriptModal';
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
      !!userResource.completedAt
        ? setResourceProgress(PROGRESS_STATUS.COMPLETED)
        : setResourceProgress(PROGRESS_STATUS.STARTED);
    } else {
      setResourceProgress(PROGRESS_STATUS.NOT_STARTED);
    }
  }, [resources, storyId]);

  useEffect(() => {
    logEvent(RESOURCE_SHORT_VIEWED, eventData);
  }, []);

  useEffect(() => {
    if (openTranscriptModal === null) {
      return;
    }

    logEvent(
      openTranscriptModal ? RESOURCE_SHORT_TRANSCRIPT_OPENED : RESOURCE_SHORT_TRANSCRIPT_CLOSED,
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
        <title>{`${t('short')} • ${name} • Bloom`}</title>
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
        {render(description, RichTextOptions)}
        <Box>
          <ReactPlayer light={true} url={video.url} controls modestbranding={1} {...videoOptions} />
        </Box>
        <Button variant="contained" sx={{ my: 3 }} onClick={() => setOpenTranscriptModal(true)}>
          Open transcript
        </Button>
        <VideoTranscriptModal
          videoName={name}
          content={video_transcript}
          setOpenTranscriptModal={setOpenTranscriptModal}
          openTranscriptModal={openTranscriptModal}
        />
        <Typography variant="h2">Related content</Typography>
        <StoryblokRelatedContent
          relatedContent={related_content}
          relatedExercises={related_exercises}
        />
      </Container>
      {!isLoggedIn && <SignUpBanner />}
    </Box>
  );
};

export default StoryblokResourceShortPage;
