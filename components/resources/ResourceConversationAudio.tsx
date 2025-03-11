'use client';

import Audio from '@/components/video/Audio';
import VideoTranscriptModal from '@/components/video/VideoTranscriptModal';
import { useCompleteResourceMutation, useStartResourceMutation } from '@/lib/api';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import {
  RESOURCE_CONVERSATION_COMPLETE_ERROR,
  RESOURCE_CONVERSATION_COMPLETE_REQUEST,
  RESOURCE_CONVERSATION_COMPLETE_SUCCESS,
  RESOURCE_CONVERSATION_STARTED_ERROR,
  RESOURCE_CONVERSATION_STARTED_REQUEST,
  RESOURCE_CONVERSATION_STARTED_SUCCESS,
  RESOURCE_CONVERSATION_TRANSCRIPT_CLOSED,
  RESOURCE_CONVERSATION_TRANSCRIPT_OPENED,
} from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import logEvent from '@/lib/utils/logEvent';
import { Link, Typography } from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { ISbRichtext } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

interface ResourceConversationAudioProps {
  eventData: { [key: string]: any };
  resourceProgress: PROGRESS_STATUS;
  name: string;
  storyUuid: string;
  audio: string;
  audio_transcript: ISbRichtext;
}

export const ResourceConversationAudio = (props: ResourceConversationAudioProps) => {
  const { eventData, storyUuid, resourceProgress, name, audio_transcript, audio } = props;
  const [openTranscriptModal, setOpenTranscriptModal] = useState<boolean | null>(null);
  const [startResourceConversation] = useStartResourceMutation();
  const [completeResourceConversation] = useCompleteResourceMutation();
  const isLoggedIn = useTypedSelector((state) => Boolean(state.user.id));
  const rollbar = useRollbar();

  const t = useTranslations('Resources');

  const callStartResourceConversation = useCallback(async () => {
    logEvent(RESOURCE_CONVERSATION_STARTED_REQUEST, eventData);

    const startResourceConversationResponse = await startResourceConversation({
      storyblokUuid: storyUuid,
    });

    if (startResourceConversationResponse.data) {
      logEvent(RESOURCE_CONVERSATION_STARTED_SUCCESS, eventData);
    }

    if (startResourceConversationResponse.error) {
      const error = startResourceConversationResponse.error;

      logEvent(RESOURCE_CONVERSATION_STARTED_ERROR, eventData);
      rollbar.error('ResourceConversation started error', error);

      throw error;
    }
  }, [startResourceConversation, eventData, storyUuid, rollbar]);

  const callCompleteResourceConversation = useCallback(async () => {
    logEvent(RESOURCE_CONVERSATION_COMPLETE_REQUEST, eventData);

    const completeResourceConversationResponse = await completeResourceConversation({
      storyblokUuid: storyUuid,
    });

    if (completeResourceConversationResponse.data) {
      logEvent(RESOURCE_CONVERSATION_COMPLETE_SUCCESS, eventData);
    }

    if (completeResourceConversationResponse.error) {
      const error = completeResourceConversationResponse.error;

      logEvent(RESOURCE_CONVERSATION_COMPLETE_ERROR, eventData);
      rollbar.error('ResourceConversation completed error', error);

      throw error;
    }
  }, [completeResourceConversation, eventData, storyUuid, rollbar]);

  useEffect(() => {
    if (openTranscriptModal === null) return;

    logEvent(
      openTranscriptModal
        ? RESOURCE_CONVERSATION_TRANSCRIPT_OPENED
        : RESOURCE_CONVERSATION_TRANSCRIPT_CLOSED,
      eventData,
    );
    if (isLoggedIn && openTranscriptModal && resourceProgress === PROGRESS_STATUS.NOT_STARTED) {
      callStartResourceConversation();
    }
  }, [
    callStartResourceConversation,
    openTranscriptModal,
    eventData,
    name,
    resourceProgress,
    isLoggedIn,
  ]);

  const audioStarted = () => {
    if (isLoggedIn && resourceProgress === PROGRESS_STATUS.NOT_STARTED) {
      callStartResourceConversation();
    }
  };

  const audioFinished = () => {
    if (isLoggedIn && resourceProgress !== PROGRESS_STATUS.COMPLETED) {
      callCompleteResourceConversation();
    }
  };

  return (
    <>
      <Audio
        url={audio}
        setAudioStarted={audioStarted}
        setAudioFinished={audioFinished}
        eventData={eventData}
        eventPrefix="RESOURCE_CONVERSATION"
      />
      <Typography sx={{ my: '1rem !important' }}>
        {t.rich('conversationTranscriptLink', {
          link: (children) => <Link onClick={() => setOpenTranscriptModal(true)}>{children}</Link>,
        })}
      </Typography>

      <VideoTranscriptModal
        videoName={name}
        content={audio_transcript}
        setOpenTranscriptModal={setOpenTranscriptModal}
        openTranscriptModal={openTranscriptModal}
      />
    </>
  );
};
