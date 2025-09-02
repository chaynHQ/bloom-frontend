'use client';

import Video from '@/components/video/Video';
import VideoTranscriptModal from '@/components/video/VideoTranscriptModal';
import { useCompleteResourceMutation, useStartResourceMutation } from '@/lib/api';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import {
  RESOURCE_SINGLE_VIDEO_COMPLETE_ERROR,
  RESOURCE_SINGLE_VIDEO_COMPLETE_REQUEST,
  RESOURCE_SINGLE_VIDEO_COMPLETE_SUCCESS,
  RESOURCE_SINGLE_VIDEO_STARTED_ERROR,
  RESOURCE_SINGLE_VIDEO_STARTED_REQUEST,
  RESOURCE_SINGLE_VIDEO_STARTED_SUCCESS,
  RESOURCE_SINGLE_VIDEO_TRANSCRIPT_CLOSED,
  RESOURCE_SINGLE_VIDEO_TRANSCRIPT_OPENED,
} from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import logEvent from '@/lib/utils/logEvent';
import { Link, Typography } from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';
import { StoryblokReferenceProps } from '../storyblok/StoryblokTypes';

interface ResourceSingleVideoProps {
  eventData: { [key: string]: any };
  resourceProgress: PROGRESS_STATUS;
  name: string;
  references: StoryblokReferenceProps[];
  storyUuid: string;
  video: { url: string };
  video_transcript: StoryblokRichtext;
}

export const ResourceSingleVideo = (props: ResourceSingleVideoProps) => {
  const { eventData, storyUuid, resourceProgress, name, references, video_transcript, video } =
    props;
  const [openTranscriptModal, setOpenTranscriptModal] = useState<boolean | null>(null);
  const [startResourceVideo] = useStartResourceMutation();
  const [completeResourceVideo] = useCompleteResourceMutation();
  const isLoggedIn = useTypedSelector((state) => Boolean(state.user.id));
  const rollbar = useRollbar();

  const t = useTranslations('Resources');

  const callStartResourceVideo = useCallback(async () => {
    logEvent(RESOURCE_SINGLE_VIDEO_STARTED_REQUEST, eventData);

    const startResourceVideoResponse = await startResourceVideo({
      storyblokUuid: storyUuid,
    });

    if (startResourceVideoResponse.data) {
      logEvent(RESOURCE_SINGLE_VIDEO_STARTED_SUCCESS, eventData);
    }

    if (startResourceVideoResponse.error) {
      const error = startResourceVideoResponse.error;

      logEvent(RESOURCE_SINGLE_VIDEO_STARTED_ERROR, eventData);
      rollbar.error('ResourceSingleVideo started error', error);

      throw error;
    }
  }, [startResourceVideo, eventData, storyUuid, rollbar]);

  const callCompleteResourceVideo = useCallback(async () => {
    logEvent(RESOURCE_SINGLE_VIDEO_COMPLETE_REQUEST, eventData);

    const completeResourceVideoResponse = await completeResourceVideo({
      storyblokUuid: storyUuid,
    });

    if (completeResourceVideoResponse.data) {
      logEvent(RESOURCE_SINGLE_VIDEO_COMPLETE_SUCCESS, eventData);
    }

    if (completeResourceVideoResponse.error) {
      const error = completeResourceVideoResponse.error;

      logEvent(RESOURCE_SINGLE_VIDEO_COMPLETE_ERROR, eventData);
      rollbar.error('ResourceSingleVideo completed error', error);

      throw error;
    }
  }, [completeResourceVideo, eventData, storyUuid, rollbar]);

  useEffect(() => {
    if (openTranscriptModal === null) return;

    logEvent(
      openTranscriptModal
        ? RESOURCE_SINGLE_VIDEO_TRANSCRIPT_OPENED
        : RESOURCE_SINGLE_VIDEO_TRANSCRIPT_CLOSED,
      eventData,
    );
    if (isLoggedIn && openTranscriptModal && resourceProgress === PROGRESS_STATUS.NOT_STARTED) {
      callStartResourceVideo();
    }
  }, [callStartResourceVideo, openTranscriptModal, eventData, name, resourceProgress, isLoggedIn]);

  const videoStarted = () => {
    if (isLoggedIn && resourceProgress === PROGRESS_STATUS.NOT_STARTED) {
      callStartResourceVideo();
    }
  };

  const videoFinished = () => {
    if (isLoggedIn && resourceProgress !== PROGRESS_STATUS.COMPLETED) {
      callCompleteResourceVideo();
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
          eventPrefix="RESOURCE_SINGLE_VIDEO"
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
          references={references.filter((r) => !r.is_key_reference)}
          setOpenTranscriptModal={setOpenTranscriptModal}
          openTranscriptModal={openTranscriptModal}
        />
      </>
    )
  );
};
