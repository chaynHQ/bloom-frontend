'use client';

import { useCompleteResourceMutation } from '@/lib/api';
import {
  RESOURCE_CONVERSATION_COMPLETE_ERROR,
  RESOURCE_CONVERSATION_COMPLETE_REQUEST,
  RESOURCE_CONVERSATION_COMPLETE_SUCCESS,
  RESOURCE_SHORT_VIDEO_COMPLETE_ERROR,
  RESOURCE_SHORT_VIDEO_COMPLETE_REQUEST,
  RESOURCE_SHORT_VIDEO_COMPLETE_SUCCESS,
} from '@/lib/constants/events';
import logEvent from '@/lib/utils/logEvent';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Button, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import { useRollbar } from '@rollbar/react';

const errorStyle = {
  color: 'primary.dark',
  marginTop: 2,
  fontWeight: 600,
} as const;

interface ResourceCompleteButtonProps {
  category: RESOURCE_CATEGORIES;
  storyId: number;
  eventData: { [key: string]: any };
}

export const ResourceCompleteButton = (props: ResourceCompleteButtonProps) => {
  const { category, storyId, eventData } = props;

  const t = useTranslations('Resources');
  const rollbar = useRollbar();

  const [error, setError] = useState<string | null>(null);

  const [completeResource] = useCompleteResourceMutation();

  const completeResourceAction = async () => {
    logEvent(
      category === RESOURCE_CATEGORIES.SHORT_VIDEO
        ? RESOURCE_SHORT_VIDEO_COMPLETE_REQUEST
        : RESOURCE_CONVERSATION_COMPLETE_REQUEST,
      eventData,
    );

    const completeResourceResponse = await completeResource({
      storyblokId: storyId,
    });

    if (completeResourceResponse.data) {
      logEvent(
        category === RESOURCE_CATEGORIES.SHORT_VIDEO
          ? RESOURCE_SHORT_VIDEO_COMPLETE_SUCCESS
          : RESOURCE_CONVERSATION_COMPLETE_SUCCESS,
        eventData,
      );
      window.scrollTo(0, 0);
    }

    if (completeResourceResponse.error) {
      const error = completeResourceResponse.error;

      logEvent(
        category === RESOURCE_CATEGORIES.SHORT_VIDEO
          ? RESOURCE_SHORT_VIDEO_COMPLETE_ERROR
          : RESOURCE_CONVERSATION_COMPLETE_ERROR,
        eventData,
      );
      rollbar.error('Resource complete error', error);

      setError(t('errors.completeResourceError'));
      throw error;
    }
  };

  return (
    <>
      <Button
        color="primary"
        size="medium"
        variant="outlined"
        onClick={completeResourceAction}
        startIcon={<CheckCircleIcon color="error" />}
      >
        {t('completed')}
      </Button>
      {error && <Typography sx={errorStyle}>{error}</Typography>}
    </>
  );
};
