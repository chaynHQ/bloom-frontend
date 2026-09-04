'use client';

import { EXERCISE_CATEGORIES } from '@/lib/constants/enums';
import { RESOURCE_GROUNDING_VIEWED } from '@/lib/constants/events';
import logEvent from '@/lib/utils/logEvent';
import { RichTextOptions } from '@/lib/utils/richText';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { Box, Button, Dialog, IconButton, Typography } from '@mui/material';
import { ISbStoryData } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { render, type StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

// Matches Figma nodes 1117:37371 (desktop) / 1117:37542 (mobile): a pale `sectionSurface` sheet
// holding a bordered `cardSurface` card, at both breakpoints. Desktop closes via a floating icon
// in the sheet; mobile via a full-width button in its own bar below the card.
const dialogPaperStyle = {
  m: 0,
  width: { xs: '100%', sm: 'calc(100% - 48px)' },
  maxWidth: { xs: '100%', sm: 648 },
  borderRadius: { xs: '28px 28px 0 0', sm: '20px' },
  position: { xs: 'fixed', sm: 'static' },
  bottom: { xs: 0, sm: 'auto' },
  backgroundColor: 'sectionSurface',
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

const mobileCloseButtonStyle = {} as const;

interface GroundingExerciseDialogProps {
  story: ISbStoryData;
  onClose: () => void;
}

export const GroundingExerciseDialog = ({ story, onClose }: GroundingExerciseDialogProps) => {
  const t = useTranslations('Resources');
  const tMoment = useTranslations('Resources.moment');
  const { name, body } = story.content as { name: string; body: StoryblokRichtext };

  useEffect(() => {
    logEvent(RESOURCE_GROUNDING_VIEWED, {
      resource_category: EXERCISE_CATEGORIES.GROUNDING,
      resource_name: name,
      resource_storyblok_uuid: story.uuid,
    });
    // Fire once per opened exercise, not on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story.uuid]);

  return (
    <Dialog
      open
      onClose={onClose}
      slotProps={{ paper: { sx: dialogPaperStyle } }}
      sx={{ '& .MuiDialog-container': { alignItems: { xs: 'flex-end', sm: 'center' } } }}
    >
      <Box sx={contentAreaStyle}>
        <Box sx={closeButtonRowStyle}>
          <IconButton aria-label={t('grounding.close')} onClick={onClose} sx={closeIconButtonStyle}>
            <CloseRounded />
          </IconButton>
        </Box>
        <Box sx={cardStyle} qa-id="grounding-exercise-dialog">
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
        <Button variant="outlined" fullWidth onClick={onClose} sx={mobileCloseButtonStyle}>
          {t('grounding.close')}
        </Button>
      </Box>
    </Dialog>
  );
};
