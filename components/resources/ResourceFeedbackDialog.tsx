'use client';

import ResourceFeedbackForm from '@/components/forms/ResourceFeedbackForm';
import { RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import { RESOURCE_FEEDBACK_DISMISSED, RESOURCE_FEEDBACK_VIEWED } from '@/lib/constants/events';
import logEvent from '@/lib/utils/logEvent';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { Box, Dialog, IconButton } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

// Bottom-anchored sheet on mobile, centred dialog on desktop.
const dialogPaperStyle = {
  m: 0,
  width: '100%',
  maxWidth: 480,
  borderRadius: { xs: '16px 16px 0 0', sm: '16px' },
  position: { xs: 'fixed', sm: 'static' },
  bottom: { xs: 0, sm: 'auto' },
} as const;

const bodyStyle = { position: 'relative', p: 3, textAlign: 'center' } as const;

interface ResourceFeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  resourceId: string;
  category: RESOURCE_CATEGORIES;
  eventData?: Record<string, unknown>;
}

export const ResourceFeedbackDialog = ({
  open,
  onClose,
  resourceId,
  category,
  eventData,
}: ResourceFeedbackDialogProps) => {
  const t = useTranslations('Resources.resourceFeedback');

  // Suppresses the dismiss event on the form's own auto-close after a submission.
  const submitted = useRef(false);
  useEffect(() => {
    if (!open) return;
    submitted.current = false;
    logEvent(RESOURCE_FEEDBACK_VIEWED, { ...eventData, category });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => {
    if (!submitted.current) logEvent(RESOURCE_FEEDBACK_DISMISSED, { ...eventData, category });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{ paper: { sx: dialogPaperStyle } }}
      sx={{ '& .MuiDialog-container': { alignItems: { xs: 'flex-end', sm: 'center' } } }}
    >
      <Box sx={bodyStyle}>
        <IconButton
          aria-label={t('close')}
          onClick={handleClose}
          sx={{ position: 'absolute', top: 8, insetInlineEnd: 8 }}
        >
          <CloseRounded />
        </IconButton>
        <ResourceFeedbackForm
          resourceId={resourceId}
          category={category}
          eventData={eventData}
          onSubmitted={() => {
            submitted.current = true;
            setTimeout(onClose, 1200);
          }}
        />
      </Box>
    </Dialog>
  );
};
