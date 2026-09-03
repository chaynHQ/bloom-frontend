'use client';

import { ResourceFeedbackDialog } from '@/components/resources/ResourceFeedbackDialog';
import { PROGRESS_STATUS, RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import { useResourceProgress, type ResourceEventPrefix } from '@/lib/hooks/useResourceProgress';
import { Box, Button, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

const barStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
  p: 2,
  borderRadius: '8px',
  border: '1px solid',
  borderColor: 'cardBorder',
  backgroundColor: 'pageBackground',
} as const;

interface ResourceActionsProps {
  storyUuid: string;
  resourceId?: string;
  category: RESOURCE_CATEGORIES;
  eventPrefix: ResourceEventPrefix;
  resourceProgress: PROGRESS_STATUS;
  eventData: Record<string, unknown>;
}

export const ResourceActions = ({
  storyUuid,
  resourceId,
  category,
  eventPrefix,
  resourceProgress,
  eventData,
}: ResourceActionsProps) => {
  const t = useTranslations('Resources');
  const { complete } = useResourceProgress({ storyUuid, eventPrefix, resourceProgress, eventData });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const markComplete = async () => {
    setLoading(true);
    setError(null);
    const { ok } = await complete();
    setLoading(false);

    if (!ok) {
      setError(t('errors.completeResourceError'));
      return;
    }
    window.scrollTo(0, 0);
    if (resourceId) setFeedbackOpen(true);
  };

  return (
    <Box qa-id="resource-actions" sx={barStyle}>
      <Button
        qa-id="resource-complete-button"
        variant="contained"
        color="error"
        onClick={markComplete}
        disabled={loading}
      >
        {t('actions.finish')}
      </Button>
      {error && (
        <Typography sx={{ width: '100%', color: 'primary.dark', fontWeight: 500 }}>
          {error}
        </Typography>
      )}
      {resourceId && (
        <ResourceFeedbackDialog
          open={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          resourceId={resourceId}
          category={category}
        />
      )}
    </Box>
  );
};
