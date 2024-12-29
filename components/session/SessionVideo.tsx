import SlowMotionVideoIcon from '@mui/icons-material/SlowMotionVideo';
import { Link as MuiLink, Typography } from '@mui/material';
import { ISbRichtext } from '@storyblok/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { PROGRESS_STATUS } from '../../constants/enums';
import {
  SESSION_STARTED_ERROR,
  SESSION_STARTED_REQUEST,
  SESSION_STARTED_SUCCESS,
  SESSION_VIDEO_TRANSCRIPT_CLOSED,
  SESSION_VIDEO_TRANSCRIPT_OPENED,
  SESSION_VIEWED,
} from '../../constants/events';
import { useStartSessionMutation } from '../../store/api';
import logEvent, { EventUserData } from '../../utils/logEvent';
import SessionContentCard from '../cards/SessionContentCard';
import Video from '../video/Video';
import VideoTranscriptModal from '../video/VideoTranscriptModal';

export interface EventData extends EventUserData {
  session_name: string;
  session_storyblok_id: number;
  session_progress: PROGRESS_STATUS;
  course_name: string;
  course_storyblok_id: number;
}
interface SessionVideoProps {
  eventData: EventData;
  sessionProgress: PROGRESS_STATUS;
  name: string;
  storyId: number;
  video: { url: string };
  video_transcript: ISbRichtext;
}
export const SessionVideo = (props: SessionVideoProps) => {
  const { eventData, storyId, sessionProgress, name, video_transcript, video } = props;
  const t = useTranslations('Courses');
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
      storyblokId: storyId,
    });

    if (startSessionResponse.data) {
      logEvent(SESSION_STARTED_SUCCESS, eventData);
    }

    if (startSessionResponse.error) {
      const error = startSessionResponse.error;

      logEvent(SESSION_STARTED_ERROR, eventData);
      (window as any).Rollbar?.error('Session started error', error);

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
