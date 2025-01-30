'use client';

import { useCompleteResourceMutation, useStartResourceMutation } from '@/lib/api';
import Video from '@/lib/components/video/Video';
import VideoTranscriptModal from '@/lib/components/video/VideoTranscriptModal';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import {
  RESOURCE_SHORT_VIDEO_COMPLETE_ERROR,
  RESOURCE_SHORT_VIDEO_COMPLETE_REQUEST,
  RESOURCE_SHORT_VIDEO_COMPLETE_SUCCESS,
  RESOURCE_SHORT_VIDEO_STARTED_ERROR,
  RESOURCE_SHORT_VIDEO_STARTED_REQUEST,
  RESOURCE_SHORT_VIDEO_STARTED_SUCCESS,
  RESOURCE_SHORT_VIDEO_TRANSCRIPT_CLOSED,
  RESOURCE_SHORT_VIDEO_TRANSCRIPT_OPENED,
} from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import logEvent from '@/lib/utils/logEvent';
import { Link, Typography } from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { ISbRichtext } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

interface ResourceShortVideoProps {
  eventData: { [key: string]: any };
  resourceProgress: PROGRESS_STATUS;
  name: string;
  storyId: number;
  video: { url: string };
  video_transcript: ISbRichtext;
}

export const ResourceShortVideo = (props: ResourceShortVideoProps) => {
  const { eventData, storyId, resourceProgress, name, video_transcript, video } = props;
  const [openTranscriptModal, setOpenTranscriptModal] = useState<boolean | null>(null);
  const [startResourceShort] = useStartResourceMutation();
  const [completeResourceShort] = useCompleteResourceMutation();
  const isLoggedIn = useTypedSelector((state) => Boolean(state.user.id));
  const rollbar = useRollbar();

  const t = useTranslations('Resources');

  const callStartResourceShort = useCallback(async () => {
    logEvent(RESOURCE_SHORT_VIDEO_STARTED_REQUEST, eventData);

    const startResourceShortResponse = await startResourceShort({
      storyblokId: storyId,
    });

    if (startResourceShortResponse.data) {
      logEvent(RESOURCE_SHORT_VIDEO_STARTED_SUCCESS, eventData);
    }

    if (startResourceShortResponse.error) {
      const error = startResourceShortResponse.error;

      logEvent(RESOURCE_SHORT_VIDEO_STARTED_ERROR, eventData);
      rollbar.error('ResourceShort started error', error);

      throw error;
    }
  }, [startResourceShort, eventData, storyId]);

  const callCompleteResourceShort = useCallback(async () => {
    logEvent(RESOURCE_SHORT_VIDEO_COMPLETE_REQUEST, eventData);

    const completeResourceShortResponse = await completeResourceShort({
      storyblokId: storyId,
    });

    if (completeResourceShortResponse.data) {
      logEvent(RESOURCE_SHORT_VIDEO_COMPLETE_SUCCESS, eventData);
    }

    if (completeResourceShortResponse.error) {
      const error = completeResourceShortResponse.error;

      logEvent(RESOURCE_SHORT_VIDEO_COMPLETE_ERROR, eventData);
      rollbar.error('ResourceShort completed error', error);

      throw error;
    }
  }, [completeResourceShort, eventData, storyId]);

  useEffect(() => {
    if (openTranscriptModal === null) return;

    logEvent(
      openTranscriptModal
        ? RESOURCE_SHORT_VIDEO_TRANSCRIPT_OPENED
        : RESOURCE_SHORT_VIDEO_TRANSCRIPT_CLOSED,
      eventData,
    );
    if (isLoggedIn && openTranscriptModal && resourceProgress === PROGRESS_STATUS.NOT_STARTED) {
      callStartResourceShort();
    }
  }, [callStartResourceShort, openTranscriptModal, eventData, name, resourceProgress, isLoggedIn]);

  const videoStarted = () => {
    if (isLoggedIn && resourceProgress === PROGRESS_STATUS.NOT_STARTED) {
      callStartResourceShort();
    }
  };

  const videoFinished = () => {
    if (isLoggedIn && resourceProgress !== PROGRESS_STATUS.COMPLETED) {
      callCompleteResourceShort();
    }
  };

  return (
    video && (
      <>
        <Video
          url={video.url}
          setVideoStarted={videoStarted}
          setVideoFinished={videoFinished}
          eventData={eventData}
          eventPrefix="RESOURCE_SHORT"
          autoplay={true}
          lightMode={true}
        />
        <Typography sx={{ my: '1rem !important' }}>
          {t.rich('videoTranscriptLink', {
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
