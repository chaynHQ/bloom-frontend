'use client';

import SessionContentCard from '@/components/cards/SessionContentCard';
import Video from '@/components/video/Video';
import VideoTranscriptModal from '@/components/video/VideoTranscriptModal';
import { useStartSessionMutation } from '@/lib/api';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import {
  SESSION_STARTED_ERROR,
  SESSION_STARTED_REQUEST,
  SESSION_STARTED_SUCCESS,
  SESSION_VIDEO_TRANSCRIPT_CLOSED,
  SESSION_VIDEO_TRANSCRIPT_OPENED,
  SESSION_VIEWED,
} from '@/lib/constants/events';
import logEvent from '@/lib/utils/logEvent';
import SlowMotionVideoIcon from '@mui/icons-material/SlowMotionVideo';
import { Link as MuiLink, Typography } from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { ISbRichtext } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface SessionVideoProps {
  eventData: { [key: string]: any };
  sessionProgress: PROGRESS_STATUS;
  name: string;
  storyUuid: string;
  video: { url: string };
  video_transcript: ISbRichtext;
}
export const SessionVideo = (props: SessionVideoProps) => {
  const { eventData, storyUuid, sessionProgress, name, video_transcript, video } = props;
  const t = useTranslations('Courses');
  const rollbar = useRollbar();

  const [videoStarted, setVideoStarted] = useState<boolean>(false);
  const [openTranscriptModal, setOpenTranscriptModal] = useState<boolean | null>(null);
  const [startSession] = useStartSessionMutation();

  async function callStartSession() {
    logEvent(SESSION_STARTED_REQUEST, {
      ...eventData,
      session_name: name,
      course_name: name,
    });

    const startSessionResponse = await startSession({
      storyblokUuid: storyUuid,
    });

    if (startSessionResponse.data) {
      logEvent(SESSION_STARTED_SUCCESS, eventData);
    }

    if (startSessionResponse.error) {
      const error = startSessionResponse.error;

      logEvent(SESSION_STARTED_ERROR, eventData);
      rollbar.error('Session started error', error);

      throw error;
    }
  }

  useEffect(() => {
    if (openTranscriptModal === null) return;

    logEvent(
      openTranscriptModal ? SESSION_VIDEO_TRANSCRIPT_OPENED : SESSION_VIDEO_TRANSCRIPT_CLOSED,
      {
        ...eventData,
        session_name: name,
        course_name: name,
      },
    );
    if (openTranscriptModal && sessionProgress === PROGRESS_STATUS.NOT_STARTED) {
      callStartSession();
    }
  }, [openTranscriptModal]);

  useEffect(() => {
    if (!videoStarted || sessionProgress !== PROGRESS_STATUS.NOT_STARTED) return;

    if (videoStarted) {
      callStartSession();
    }
  }, [videoStarted]);

  useEffect(() => {
    logEvent(SESSION_VIEWED, eventData);
  }, []);

  return (
    video && (
      <SessionContentCard
        title={t('sessionDetail.videoTitle')}
        titleIcon={SlowMotionVideoIcon}
        eventPrefix="SESSION_VIDEO"
        eventData={eventData}
        initialExpanded={true}
      >
        <Typography mb={3}>
          {t.rich('sessionDetail.videoDescription', {
            transcriptLink: (children) => (
              <MuiLink
                component="button"
                variant="body1"
                onClick={() => setOpenTranscriptModal(true)}
              >
                {children}
              </MuiLink>
            ),
          })}
        </Typography>
        <Video
          url={video.url}
          setVideoStarted={setVideoStarted}
          eventData={eventData}
          eventPrefix="SESSION"
          containerStyles={{ mx: 'auto', my: 2 }}
        />
        <VideoTranscriptModal
          videoName={name}
          content={video_transcript}
          setOpenTranscriptModal={setOpenTranscriptModal}
          openTranscriptModal={openTranscriptModal}
        />
      </SessionContentCard>
    )
  );
};
