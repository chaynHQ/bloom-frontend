'use client';

import SessionContentCard from '@/components/cards/SessionContentCard';
import { TranscriptAccordion } from '@/components/common/TranscriptAccordion';
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
import { Typography } from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { render, StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

interface SessionMediaCardProps {
  name: string;
  description: string | StoryblokRichtext;
  video: { url: string };
  video_transcript: StoryblokRichtext;
  storyUuid: string;
  sessionProgress: PROGRESS_STATUS;
  // The logged-out first-session preview passes false: no account, so no progress to record.
  trackProgress?: boolean;
  eventData: { [key: string]: any };
}

export const SessionMediaCard = ({
  name,
  description,
  video,
  video_transcript,
  storyUuid,
  sessionProgress,
  trackProgress = true,
  eventData,
}: SessionMediaCardProps) => {
  const t = useTranslations('Courses');
  const rollbar = useRollbar();

  const [videoStarted, setVideoStarted] = useState(false);
  const [startSession] = useStartSessionMutation();

  const callStartSession = useCallback(async () => {
    if (!trackProgress) return;
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
  }, [trackProgress, eventData, storyUuid, startSession, rollbar]);

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
        <TranscriptAccordion
          content={video_transcript}
          name={name}
          sx={{ mt: 2 }}
          onToggle={(open) => {
            logEvent(
              open ? SESSION_VIDEO_TRANSCRIPT_OPENED : SESSION_VIDEO_TRANSCRIPT_CLOSED,
              eventData,
            );
            if (open && sessionProgress === PROGRESS_STATUS.NOT_STARTED) callStartSession();
          }}
        />
      )}
    </SessionContentCard>
  );
};
