'use client';

import ResourceFeedbackForm from '@/components/forms/ResourceFeedbackForm';
import { RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { Box, Dialog, IconButton } from '@mui/material';
import { useTranslations } from 'next-intl';

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
}

export const ResourceFeedbackDialog = ({
  open,
  onClose,
  resourceId,
  category,
}: ResourceFeedbackDialogProps) => {
  const t = useTranslations('Resources.resourceFeedback');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: dialogPaperStyle } }}
      sx={{ '& .MuiDialog-container': { alignItems: { xs: 'flex-end', sm: 'center' } } }}
    >
      <Box sx={bodyStyle}>
        <IconButton
          aria-label={t('close')}
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, insetInlineEnd: 8 }}
        >
          <CloseRounded />
        </IconButton>
        <ResourceFeedbackForm
          resourceId={resourceId}
          category={category}
          onSubmitted={() => setTimeout(onClose, 1200)}
        />
      </Box>
    </Dialog>
  );
};
