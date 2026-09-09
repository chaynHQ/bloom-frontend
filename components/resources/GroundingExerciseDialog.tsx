'use client';

import { EXERCISE_CATEGORIES } from '@/lib/constants/enums';
import { RESOURCE_GROUNDING_CLOSED, RESOURCE_GROUNDING_VIEWED } from '@/lib/constants/events';
import logEvent from '@/lib/utils/logEvent';
import { RichTextOptions } from '@/lib/utils/richText';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { Box, Button, Dialog, IconButton, Typography } from '@mui/material';
import { ISbStoryData } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { render, type StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

// A pale `sectionSurface` sheet holding a bordered `cardSurface` card. Below `sm` it's a
// bottom sheet closed by a full-width button in a sticky bar; from `sm` up it's a centred
// dialog closed by a floating icon button.
const dialogPaperStyle = {
  m: 0,
  width: { xs: '100%', sm: 'calc(100% - 48px)' },
  maxWidth: { xs: '100%', sm: 648 },
  borderRadius: { xs: '28px 28px 0 0', sm: '20px' },
  position: { xs: 'fixed', sm: 'static' },
  bottom: { xs: 0, sm: 'auto' },
  backgroundColor: 'sectionSurface',
} as const;

// Fills the paper so the sticky mobile close bar still anchors to its bottom edge.
const dialogInnerStyle = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
} as const;

const contentAreaStyle = {
  p: { xs: 2, sm: 3 },
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
} as const;

const closeButtonRowStyle = {
  display: { xs: 'none', sm: 'flex' },
  justifyContent: 'flex-end',
} as const;

const closeIconButtonStyle = {
  backgroundColor: 'common.white',
  '&:hover': { backgroundColor: 'grey.100' },
} as const;

const cardStyle = {
  backgroundColor: 'cardSurface',
  border: '1px solid',
  borderColor: 'cardBorder',
  borderRadius: '16px',
  p: 2,
} as const;

const badgeStyle = {
  display: 'inline-flex',
  px: 1,
  height: 32,
  alignItems: 'center',
  borderRadius: '8px',
  border: '1px solid',
  borderColor: 'chipBackground',
  backgroundColor: 'secondary.light',
  fontFamily: 'headingFontFamily',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'grey.700',
  mb: 2,
} as const;

const mobileCloseBarStyle = {
  display: { xs: 'flex', sm: 'none' },
  justifyContent: 'center',
  position: 'sticky',
  bottom: 0,
  backgroundColor: 'sectionSurface',
  px: 2.5,
  py: 2.25,
  boxShadow: '0px -2px 6px rgba(0,0,0,0.05), 0px 2px 10px rgba(0,0,0,0.15)',
} as const;

interface GroundingExerciseDialogProps {
  story: ISbStoryData;
  onClose: () => void;
  openMethod: 'card' | 'deep_link';
}

export const GroundingExerciseDialog = ({
  story,
  onClose,
  openMethod,
}: GroundingExerciseDialogProps) => {
  const t = useTranslations('Resources');
  const tMoment = useTranslations('Resources.moment');
  const { name, body } = story.content as { name: string; body: StoryblokRichtext };

  useEffect(() => {
    const eventData = {
      resource_category: EXERCISE_CATEGORIES.GROUNDING,
      resource_name: name,
      resource_storyblok_uuid: story.uuid,
      grounding_open_method: openMethod,
    };
    logEvent(RESOURCE_GROUNDING_VIEWED, eventData);
    return () => logEvent(RESOURCE_GROUNDING_CLOSED, eventData);
    // Once per opened exercise, not on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story.uuid]);

  return (
    <Dialog
      open
      onClose={onClose}
      slotProps={{ paper: { sx: dialogPaperStyle } }}
      sx={{ '& .MuiDialog-container': { alignItems: { xs: 'flex-end', sm: 'center' } } }}
    >
      {/* qa-id sits on this wrapper (not the card) so it spans the close controls too. */}
      <Box qa-id="grounding-exercise-dialog" sx={dialogInnerStyle}>
        <Box sx={contentAreaStyle}>
          <Box sx={closeButtonRowStyle}>
            <IconButton
              aria-label={t('grounding.close')}
              onClick={onClose}
              sx={closeIconButtonStyle}
              qa-id="grounding-exercise-close-button"
            >
              <CloseRounded />
            </IconButton>
          </Box>
          <Box sx={cardStyle}>
            <Box component="span" sx={badgeStyle}>
              {tMoment('groundingLabel')}
            </Box>
            <Typography variant="h3" component="h2">
              {name}
            </Typography>
            <Box>{render(body, RichTextOptions)}</Box>
          </Box>
        </Box>
        <Box sx={mobileCloseBarStyle}>
          <Button
            variant="outlined"
            fullWidth
            onClick={onClose}
            qa-id="grounding-exercise-close-button"
          >
            {t('grounding.close')}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};
