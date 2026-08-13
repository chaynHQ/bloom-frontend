'use client';

import { Link as i18nLink } from '@/i18n/routing';
import { useCompleteSessionMutation } from '@/lib/api';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import {
  SESSION_COMPLETE_ERROR,
  SESSION_COMPLETE_REQUEST,
  SESSION_COMPLETE_SUCCESS,
  SESSION_NEXT_CLICKED,
} from '@/lib/constants/events';
import { type CourseSession } from '@/lib/utils/courseSessions';
import logEvent from '@/lib/utils/logEvent';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import { Box, Button, Typography } from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

const barStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  // Full-width stacked buttons on the narrowest screens, trailing-aligned once they fit in a row.
  flexDirection: { xs: 'column', sm: 'row' },
  alignItems: { xs: 'stretch', sm: 'center' },
  justifyContent: 'flex-end',
  gap: 2,
  p: 2,
  borderRadius: '16px',
  border: '1px solid',
  borderColor: 'cardBorder',
  backgroundColor: 'cardSurface',
} as const;

const errorStyle = { width: '100%', color: 'primary.dark', fontWeight: 500 } as const;

interface SessionActionsProps {
  storyUuid: string;
  sessionProgress: PROGRESS_STATUS;
  nextSession?: CourseSession;
  eventData: { [key: string]: any };
}

export const SessionActions = ({
  storyUuid,
  sessionProgress,
  nextSession,
  eventData,
}: SessionActionsProps) => {
  const t = useTranslations('Courses');
  const rollbar = useRollbar();

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [completeSession] = useCompleteSessionMutation();

  const isCompleted = sessionProgress === PROGRESS_STATUS.COMPLETED;

  const completeSessionAction = async () => {
    try {
      setIsLoading(true);
      setError(null);

      logEvent(SESSION_COMPLETE_REQUEST, eventData);

      const completeSessionResponse = await completeSession({ storyblokUuid: storyUuid });

      if (completeSessionResponse.data) {
        logEvent(SESSION_COMPLETE_SUCCESS, eventData);
      }

      if (completeSessionResponse.error) {
        const responseError = completeSessionResponse.error;
        logEvent(SESSION_COMPLETE_ERROR, { ...eventData, error: responseError });
        rollbar.error('Session complete error', responseError);
        setError(t('errors.completeSessionError'));
      }
    } catch (err) {
      const caughtError = err as Error;
      logEvent(SESSION_COMPLETE_ERROR, { ...eventData, error: caughtError.message });
      rollbar.error('Unexpected session complete error', caughtError);
      setError(t('errors.completeSessionError'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isCompleted && !nextSession) return null;

  return (
    <Box qa-id="session-actions" sx={barStyle}>
      {!isCompleted && (
        <Button
          qa-id="session-complete-button"
          variant="contained"
          color="secondary"
          onClick={completeSessionAction}
          startIcon={<CheckCircleRounded color="error" />}
          disabled={isLoading}
        >
          {t('sessionDetail.sessionComplete')}
        </Button>
      )}
      {nextSession && (
        <Button
          qa-id="session-next-button"
          variant="contained"
          color="error"
          component={i18nLink}
          href={nextSession.href}
          onClick={() =>
            logEvent(SESSION_NEXT_CLICKED, {
              ...eventData,
              next_session_name: nextSession.name,
              next_session_storyblok_uuid: nextSession.uuid,
            })
          }
        >
          {t('sessionDetail.nextSession')}
        </Button>
      )}
      {error && <Typography sx={errorStyle}>{error}</Typography>}
    </Box>
  );
};
