import { Box, Button, Container, Typography } from '@mui/material';
import { ISbRichtext, ISbStoryData, storyblokEditable } from '@storyblok/react';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import { PROGRESS_STATUS, RESOURCE_CATEGORIES } from '../../constants/enums';
import {
  RESOURCE_SHORT_VIDEO_TRANSCRIPT_CLOSED,
  RESOURCE_SHORT_VIDEO_TRANSCRIPT_OPENED,
  RESOURCE_SHORT_VIDEO_VIEWED,
  RESOURCE_SHORT_VIDEO_VISIT_SESSION,
} from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import { Resource } from '../../store/resourcesSlice';
import { columnStyle, rowStyle } from '../../styles/common';
import { getEventUserData, logEvent } from '../../utils/logEvent';
import { SignUpBanner } from '../banner/SignUpBanner';
import Link from '../common/Link';
import ProgressStatus from '../common/ProgressStatus';
import ResourceFeedbackForm from '../forms/ResourceFeedbackForm';
import { ResourceCompleteButton } from '../resources/ResourceCompleteButton';
import { ResourceShortVideo } from '../resources/ResourceShortVideo';
import { StoryblokPageSectionProps } from './StoryblokPageSection';
import { StoryblokRelatedContent, StoryblokRelatedContentStory } from './StoryblokRelatedContent';

const headerStyle = { ...rowStyle, flexWrap: { xs: 'wrap', md: 'no-wrap' }, gap: 5 } as const;
const headerRightStyle = {
  ...columnStyle,
  justifyContent: 'flex-end',
  flex: { md: 1 },
  width: { md: '100%' },
  height: { md: 290 },
} as const;

const headerLeftStyles = {
  width: 514, // >515px enables the "watch on youtube" button
  maxWidth: '100%',
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
  related_session: ISbStoryData[];
  related_course: ISbStoryData | null;
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
    related_course,
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

  const redirectToSession = () => {
    logEvent(RESOURCE_SHORT_VIDEO_VISIT_SESSION, {
      ...eventData,
      shorts_name: name,
      session_name: related_session[0].name,
    });
  };

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
        <Box sx={headerStyle}>
          <Box sx={headerLeftStyles}>
            <ResourceShortVideo
              eventData={eventData}
              resourceProgress={resourceProgress}
              name={name}
              storyId={storyId}
              video={video}
              video_transcript={video_transcript}
            />
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
          </Box>
          <Box sx={headerRightStyle}>
            {/* {render(description, RichTextOptions)} */}

            <Typography component="h2" mb={2}>
              {t('sessionDetail', {
                sessionNumber: related_session[0].position / 10 - 1,
                sessionName: related_session[0].name,
                courseName: related_course?.content.name,
              })}
            </Typography>
            <Button
              component={Link}
              href={`/${related_session[0].full_slug}`}
              onClick={redirectToSession}
              variant="contained"
              color="secondary"
              sx={{ mr: 'auto' }}
            >
              {t('sessionButtonLabel')}
            </Button>
          </Box>
        </Box>
      </Container>
      {resourceId && (
        <Container sx={{ bgcolor: 'background.paper' }}>
          <ResourceFeedbackForm
            resourceId={resourceId}
            category={RESOURCE_CATEGORIES.SHORT_VIDEO}
          />
        </Container>
      )}
      <Container>
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
