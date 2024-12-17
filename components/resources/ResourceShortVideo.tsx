import { Link, Typography } from '@mui/material';
import { ISbRichtext } from '@storyblok/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { PROGRESS_STATUS } from '../../constants/enums';
import {
  RESOURCE_SHORT_VIDEO_COMPLETE_ERROR,
  RESOURCE_SHORT_VIDEO_COMPLETE_REQUEST,
  RESOURCE_SHORT_VIDEO_COMPLETE_SUCCESS,
  RESOURCE_SHORT_VIDEO_STARTED_ERROR,
  RESOURCE_SHORT_VIDEO_STARTED_REQUEST,
  RESOURCE_SHORT_VIDEO_STARTED_SUCCESS,
  RESOURCE_SHORT_VIDEO_TRANSCRIPT_CLOSED,
  RESOURCE_SHORT_VIDEO_TRANSCRIPT_OPENED,
  RESOURCE_SHORT_VIDEO_VIEWED,
} from '../../constants/events';
import { useCompleteResourceMutation, useStartResourceMutation } from '../../store/api';
import logEvent, { EventUserData } from '../../utils/logEvent';
import Video from '../video/Video';
import VideoTranscriptModal from '../video/VideoTranscriptModal';

export interface EventData extends EventUserData {
  resource_name: string;
  resource_storyblok_id: number;
  resource_progress: PROGRESS_STATUS;
}

interface ResourceShortVideoProps {
  eventData: EventData;
  resourceProgress: PROGRESS_STATUS;
  name: string;
  storyId: number;
  video: { url: string };
  video_transcript: ISbRichtext;
}

export const ResourceShortVideo = (props: ResourceShortVideoProps) => {
  const { eventData, storyId, resourceProgress, name, video_transcript, video } = props;
  const [videoStarted, setVideoStarted] = useState<boolean>(false);
  const [videoFinished, setVideoFinished] = useState<boolean>(false);
  const [openTranscriptModal, setOpenTranscriptModal] = useState<boolean | null>(null);
  const [startResourceShort] = useStartResourceMutation();
  const [completeResourceShort] = useCompleteResourceMutation();
  const t = useTranslations('Resources');

  async function callStartResourceShort() {
    logEvent(RESOURCE_SHORT_VIDEO_STARTED_REQUEST, {
      ...eventData,
      resource_name: name,
    });

    const startResourceShortResponse = await startResourceShort({
      storyblokId: storyId,
    });

    if (startResourceShortResponse.data) {
      logEvent(RESOURCE_SHORT_VIDEO_STARTED_SUCCESS, eventData);
    }

    if (startResourceShortResponse.error) {
      const error = startResourceShortResponse.error;

      logEvent(RESOURCE_SHORT_VIDEO_STARTED_ERROR, eventData);
      (window as any).Rollbar?.error('ResourceShort started error', error);

      throw error;
    }
  }

  async function callCompleteResourceShort() {
    logEvent(RESOURCE_SHORT_VIDEO_COMPLETE_REQUEST, {
      ...eventData,
      resource_name: name,
    });

    const completeResourceShortResponse = await completeResourceShort({
      storyblokId: storyId,
    });

    if (completeResourceShortResponse.data) {
      logEvent(RESOURCE_SHORT_VIDEO_COMPLETE_SUCCESS, eventData);
    }

    if (completeResourceShortResponse.error) {
      const error = completeResourceShortResponse.error;

      logEvent(RESOURCE_SHORT_VIDEO_COMPLETE_ERROR, eventData);
      (window as any).Rollbar?.error('ResourceShort completed error', error);

      throw error;
    }
  }

  useEffect(() => {
    if (openTranscriptModal === null) return;

    logEvent(
      openTranscriptModal
        ? RESOURCE_SHORT_VIDEO_TRANSCRIPT_OPENED
        : RESOURCE_SHORT_VIDEO_TRANSCRIPT_CLOSED,
      {
        ...eventData,
        resource_name: name,
        course_name: name,
      },
    );
    if (openTranscriptModal && resourceProgress === PROGRESS_STATUS.NOT_STARTED) {
      callStartResourceShort();
    }
  }, [openTranscriptModal, eventData, name, resourceProgress]);

  useEffect(() => {
    if (!videoStarted || resourceProgress !== PROGRESS_STATUS.NOT_STARTED) return;

    if (videoStarted) {
      callStartResourceShort();
    }
  }, [videoStarted, resourceProgress]);

  useEffect(() => {
    if (!videoFinished || resourceProgress === PROGRESS_STATUS.COMPLETED) return;

    if (videoFinished) {
      callCompleteResourceShort();
    }
  }, [videoFinished, resourceProgress]);

  useEffect(() => {
    logEvent(RESOURCE_SHORT_VIDEO_VIEWED, eventData);
  }, []);

  return (
    video && (
      <>
        <Video
          url={video.url}
          setVideoStarted={setVideoStarted}
          setVideoFinished={setVideoFinished}
          eventData={eventData}
          eventPrefix="RESOURCE_SHORT"
          autoplay={true}
        />
        <Typography sx={{ my: '1rem !important' }}>
          {t.rich('transcriptLink', {
            link: (children) => (
              <Link onClick={() => setOpenTranscriptModal(true)}>{children}</Link>
            ),
          })}
        </Typography>
        <VideoTranscriptModal
          videoName={name}
          content={video_transcript}
          setOpenTranscriptModal={setOpenTranscriptModal}
          openTranscriptModal={openTranscriptModal}
        />
      </>
    )
  );
};
