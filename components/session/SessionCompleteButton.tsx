import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Button, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useCompleteSessionMutation } from '../../app/api';
import {
  SESSION_COMPLETE_ERROR,
  SESSION_COMPLETE_REQUEST,
  SESSION_COMPLETE_SUCCESS,
} from '../../constants/events';
import logEvent, { EventUserData } from '../../utils/logEvent';

import { Dots } from '../common/Dots';

const errorStyle = {
  color: 'primary.dark',
  marginTop: 2,
  fontWeight: 600,
} as const;

interface SessionCompleteButtonProps {
  storyId: number;
  eventData: EventUserData;
}

export const SessionCompleteButton = (props: SessionCompleteButtonProps) => {
  const { storyId, eventData } = props;

  const t = useTranslations('Courses');

  const [error, setError] = useState<string | null>(null);

  const [completeSession] = useCompleteSessionMutation();

  const completeSessionAction = async () => {
    logEvent(SESSION_COMPLETE_REQUEST, eventData);

    const completeSessionResponse = await completeSession({
      storyblokId: storyId,
    });

    if (completeSessionResponse.data) {
      logEvent(SESSION_COMPLETE_SUCCESS, eventData);
      window.scrollTo(0, 0);
    }

    if (completeSessionResponse.error) {
      const error = completeSessionResponse.error;

      logEvent(SESSION_COMPLETE_ERROR, eventData);
      (window as any).Rollbar?.error('Session complete error', error);

      setError(t('errors.completeSessionError'));
      throw error;
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
      >
        {t('sessionDetail.sessionComplete')}
      </Button>
      {error && <Typography sx={errorStyle}>{error}</Typography>}
    </>
  );
};
