import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Button, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { StoryData } from 'storyblok-js-client';
import { useCompleteSessionMutation } from '../../app/api';
import rollbar from '../../config/rollbar';
import {
  SESSION_COMPLETE_ERROR,
  SESSION_COMPLETE_REQUEST,
  SESSION_COMPLETE_SUCCESS,
} from '../../constants/events';
import logEvent from '../../utils/logEvent';

import { Dots } from '../common/Dots';

const errorStyle = {
  color: 'primary.dark',
  marginTop: 2,
  fontWeight: 600,
} as const;

interface SessionCompleteButtonProps {
  story: StoryData;
  eventData: any;
}

export const SessionCompleteButton = (props: SessionCompleteButtonProps) => {
  const { story, eventData } = props;

  const [completeSession] = useCompleteSessionMutation();

  const t = useTranslations('Courses');
  const [error, setError] = useState<string | null>(null);

  const completeSessionAction = async () => {
    logEvent(SESSION_COMPLETE_REQUEST, eventData);

    const completeSessionResponse = await completeSession({
      storyblokId: story.id,
    });

    if ('data' in completeSessionResponse) {
      logEvent(SESSION_COMPLETE_SUCCESS, eventData);
      window.scrollTo(0, 0);
    }

    if ('error' in completeSessionResponse) {
      const error = completeSessionResponse.error;

      logEvent(SESSION_COMPLETE_ERROR, eventData);
      rollbar.error('Session complete error', error);

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
