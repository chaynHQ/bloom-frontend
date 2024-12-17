import { Box, Container, Link, Typography } from '@mui/material';
import { ISbRichtext, storyblokEditable } from '@storyblok/react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Image from 'next/image';
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
import { rowStyle } from '../../styles/common';
import theme from '../../styles/theme';
import { getEventUserData, logEvent } from '../../utils/logEvent';
import { RichTextOptions } from '../../utils/richText';
import { SignUpBanner } from '../banner/SignUpBanner';
import ProgressStatus from '../common/ProgressStatus';
import ResourceFeedbackForm from '../forms/ResourceFeedbackForm';
import { ResourceCompleteButton } from '../resources/ResourceCompleteButton';
import VideoTranscriptModal from '../video/VideoTranscriptModal';
import { StoryblokPageSectionProps } from './StoryblokPageSection';
import { StoryblokRelatedContent, StoryblokRelatedContentStory } from './StoryblokRelatedContent';
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

const headerStyle = { ...rowStyle, flexWrap: { xs: 'wrap', md: 'no-wrap' }, gap: 5 } as const;

const headerLeftStyles = {
  width: { xs: '100%', md: '60%' },
  maxWidth: '100%',
} as const;

const headerRightStyle = {
  flex: { md: 1 },
  width: '100%',
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: 200,
  height: 200,
  marginLeft: 'auto',
  marginRight: { xs: '8%', md: '0' },
} as const;

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

      <Container sx={{ background: theme.palette.bloomGradient }}>
        <Box sx={headerStyle}>
          <Box sx={headerLeftStyles}>
            <Typography variant="h1" maxWidth={600}>
              {name}
            </Typography>
            {render(description, RichTextOptions)}
            <Box sx={audioContainerStyle}>
              <ReactPlayer width="100%" height="50px" url={audio.filename} controls />
            </Box>

            <Typography>
              {t.rich('conversationTranscriptLink', {
                link: (children) => (
                  <Link onClick={() => setOpenTranscriptModal(true)}>{children}</Link>
                ),
              })}
            </Typography>
            <VideoTranscriptModal
              videoName={name}
              content={audio_transcript}
              setOpenTranscriptModal={setOpenTranscriptModal}
              openTranscriptModal={openTranscriptModal}
            />
            {isLoggedIn && (
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
          <Box sx={headerRightStyle}>
            {header_image && (
              <Box sx={imageContainerStyle}>
                <Image
                  alt={header_image.alt}
                  src={header_image.filename}
                  fill
                  sizes="500px"
                  style={{
                    objectFit: 'contain',
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Container>

      {resourceId && (
        <Container sx={{ bgcolor: 'background.paper' }}>
          <ResourceFeedbackForm
            resourceId={resourceId}
            category={RESOURCE_CATEGORIES.CONVERSATION}
          />
        </Container>
      )}
      <Container sx={{ bgcolor: 'secondary.main' }}>
        <Typography variant="h2" mb={4}>
          {tS('relatedContent.title')}
        </Typography>
        <StoryblokRelatedContent
          relatedContent={related_content}
          relatedExercises={related_exercises}
        />
      </Container>

      {!isLoggedIn && <SignUpBanner />}
    </Box>
  );
};

export default StoryblokResourceConversationPage;
