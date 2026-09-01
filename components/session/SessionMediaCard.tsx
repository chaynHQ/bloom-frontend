'use client';

import SessionContentCard from '@/components/cards/SessionContentCard';
import Video from '@/components/video/Video';
import { useStartSessionMutation } from '@/lib/api';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import {
  SESSION_STARTED_ERROR,
  SESSION_STARTED_REQUEST,
  SESSION_STARTED_SUCCESS,
  SESSION_VIDEO_TRANSCRIPT_CLOSED,
  SESSION_VIDEO_TRANSCRIPT_OPENED,
} from '@/lib/constants/events';
import logEvent from '@/lib/utils/logEvent';
import { RichTextOptions } from '@/lib/utils/richText';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  type Theme,
  Typography,
} from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { render, StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

// A quiet, scrollable panel with grey body text keeps the video the focus of the card; the
// scrollbar is tinted in the brand pink, as the design shows it running down the panel's edge.
const accordionStyle = (theme: Theme) => ({
  mt: 2,
  backgroundColor: 'transparent',
  boxShadow: 'none',
  '&::before': { display: 'none' },
  '& .MuiAccordionSummary-root': { minHeight: 0, px: 0 },
  '& .MuiAccordionDetails-root': {
    px: 2,
    py: 1.5,
    maxHeight: 320,
    overflowY: 'auto',
    borderRadius: '8px',
    backgroundColor: theme.palette.panelSurface,
    color: theme.palette.grey[700],
    '& p': { color: theme.palette.grey[700] },
    scrollbarWidth: 'thin',
    scrollbarColor: `${theme.palette.primary.dark} transparent`,
    '&::-webkit-scrollbar': { width: '6px' },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.primary.dark,
      borderRadius: '3px',
    },
  },
});

const summaryLabelStyle = {
  fontFamily: 'headingFontFamily',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'grey.700',
} as const;

interface SessionMediaCardProps {
  name: string;
  description: string | StoryblokRichtext;
  video: { url: string };
  video_transcript: StoryblokRichtext;
  storyUuid: string;
  sessionProgress: PROGRESS_STATUS;
  eventData: { [key: string]: any };
}

export const SessionMediaCard = ({
  name,
  description,
  video,
  video_transcript,
  storyUuid,
  sessionProgress,
  eventData,
}: SessionMediaCardProps) => {
  const t = useTranslations('Courses');
  const tS = useTranslations('Shared');
  const rollbar = useRollbar();

  const [videoStarted, setVideoStarted] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState<boolean | null>(null);
  const [startSession] = useStartSessionMutation();

  const callStartSession = useCallback(async () => {
    logEvent(SESSION_STARTED_REQUEST, eventData);

    const startSessionResponse = await startSession({ storyblokUuid: storyUuid });

    if (startSessionResponse.data) {
      logEvent(SESSION_STARTED_SUCCESS, eventData);
    }

    if (startSessionResponse.error) {
      const error = startSessionResponse.error;

      logEvent(SESSION_STARTED_ERROR, eventData);
      rollbar.error('Session started error', error);
    }
  }, [eventData, storyUuid, startSession, rollbar]);

  useEffect(() => {
    if (transcriptOpen === null) return;

    logEvent(
      transcriptOpen ? SESSION_VIDEO_TRANSCRIPT_OPENED : SESSION_VIDEO_TRANSCRIPT_CLOSED,
      eventData,
    );
    if (transcriptOpen && sessionProgress === PROGRESS_STATUS.NOT_STARTED) {
      callStartSession();
    }
  }, [transcriptOpen, eventData, sessionProgress, callStartSession]);

  useEffect(() => {
    if (!videoStarted || sessionProgress !== PROGRESS_STATUS.NOT_STARTED) return;
    callStartSession();
  }, [videoStarted, callStartSession, sessionProgress]);

  if (!video) return null;

  return (
    <SessionContentCard
      qaId="session-media-card"
      title={t('sessionDetail.learnTitle')}
      eventPrefix="SESSION_VIDEO"
      eventData={eventData}
      initialExpanded
    >
      {typeof description === 'string' ? (
        <Typography>{description}</Typography>
      ) : (
        render(description, RichTextOptions)
      )}
      <Video
        url={video.url}
        setVideoStarted={setVideoStarted}
        eventData={eventData}
        eventPrefix="SESSION"
        containerStyles={{ mt: 2, maxWidth: '100%' }}
      />
      {video_transcript && (
        <Accordion
          disableGutters
          expanded={Boolean(transcriptOpen)}
          onChange={(_, expanded) => setTranscriptOpen(expanded)}
          sx={accordionStyle}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreRounded sx={{ color: 'grey.700' }} />}
            aria-label={`${tS('videoTranscript.title')} ${name}`}
          >
            <Typography sx={summaryLabelStyle}>{tS('videoTranscript.title')}</Typography>
          </AccordionSummary>
          <AccordionDetails>{render(video_transcript, RichTextOptions)}</AccordionDetails>
        </Accordion>
      )}
    </SessionContentCard>
  );
};
