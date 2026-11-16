'use client';

import { ResourceFeedbackDialog } from '@/components/resources/ResourceFeedbackDialog';
import { RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import { type CompleteResource } from '@/lib/hooks/useResourceProgress';
import { Box, Button, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { type ReactNode, useState } from 'react';

const barStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 2,
  p: 2,
  borderRadius: '8px',
  border: '1px solid',
  borderColor: 'cardBorder',
  backgroundColor: 'pageBackground',
} as const;

interface ResourceActionsProps {
  resourceId?: string;
  category: RESOURCE_CATEGORIES;
  eventData: Record<string, unknown>;
  onComplete: CompleteResource;
  nextButton?: ReactNode;
}

export const ResourceActions = ({
  resourceId,
  category,
  eventData,
  onComplete,
  nextButton,
}: ResourceActionsProps) => {
  const t = useTranslations('Resources');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const markComplete = async () => {
    setLoading(true);
    setError(null);
    const { ok } = await onComplete('manual');
    setLoading(false);

    if (!ok) {
      setError(t('errors.completeResourceError'));
      return;
    }
    window.scrollTo(0, 0);
    if (resourceId) setFeedbackOpen(true);
  };

  return (
    // Inside a course this matches the session page's action bar; on its own the button stays centred.
    <Box
      qa-id="resource-actions"
      sx={{ ...barStyle, justifyContent: nextButton ? 'flex-end' : 'center' }}
    >
      <Button
        qa-id="resource-complete-button"
        variant={nextButton ? 'outlined' : 'contained'}
        color={nextButton ? 'primary' : 'error'}
        onClick={markComplete}
        disabled={loading}
      >
        {t('actions.finish')}
      </Button>
      {nextButton}
      {error && (
        <Typography
          sx={{ width: '100%', textAlign: 'center', color: 'primary.dark', fontWeight: 500 }}
        >
          {error}
        </Typography>
      )}
      {resourceId && (
        <ResourceFeedbackDialog
          open={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          resourceId={resourceId}
          category={category}
          eventData={eventData}
        />
      )}
    </Box>
  );
};
