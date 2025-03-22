'use client';

import { useCompleteSessionMutation } from '@/lib/api';
import {
  SESSION_COMPLETE_ERROR,
  SESSION_COMPLETE_REQUEST,
  SESSION_COMPLETE_SUCCESS,
} from '@/lib/constants/events';
import logEvent from '@/lib/utils/logEvent';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Button, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Dots } from '@/components/common/Dots';
import { useRollbar } from '@rollbar/react';

const errorStyle = {
  color: 'primary.dark',
  marginTop: 2,
  fontWeight: 600,
} as const;

interface SessionCompleteButtonProps {
  storyUuid: string;
  eventData: { [key: string]: any };
}

// Define possible error types
type SessionError = {
  message: string;
  code?: string;
  status?: number;
};

export const SessionCompleteButton = (props: SessionCompleteButtonProps) => {
  const { storyUuid, eventData } = props;

  const t = useTranslations('Courses');
  const rollbar = useRollbar();

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [completeSession] = useCompleteSessionMutation();

  const completeSessionAction = async () => {
    try {
      setIsLoading(true);
      setError(null);

      logEvent(SESSION_COMPLETE_REQUEST, eventData);

      const completeSessionResponse = await completeSession({
        storyblokUuid: storyUuid,
      });

      if (completeSessionResponse.data) {
        logEvent(SESSION_COMPLETE_SUCCESS, eventData);
      }

      if (completeSessionResponse.error) {
        const error = completeSessionResponse.error as SessionError;
        logEvent(SESSION_COMPLETE_ERROR, { ...eventData, error });
        rollbar.error('Session complete error', error);
        setError(t('errors.completeSessionError'));
      }
    } catch (err) {
      const error = err as Error;
      logEvent(SESSION_COMPLETE_ERROR, { ...eventData, error: error.message });
      rollbar.error('Unexpected session complete error', error);
      setError(t('errors.completeSessionError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dots />
      <Button
        color="secondary"
        size="large"
        variant="contained"
        onClick={completeSessionAction}
        startIcon={<CheckCircleIcon color="error" />}
        disabled={isLoading}
      >
        {t('sessionDetail.sessionComplete')}
      </Button>
      {error && <Typography sx={errorStyle}>{error}</Typography>}
    </>
  );
};
