'use client';

import { RichTextOptions } from '@/lib/utils/richText';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  type SxProps,
  type Theme,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { render, type StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

// A quiet, scrollable panel with grey body text keeps the media the focus of the card; the
// scrollbar is tinted in the brand pink, as the design shows it running down the panel's edge.
const accordionStyle = (theme: Theme) => ({
  backgroundColor: 'transparent',
  boxShadow: 'none',
  '&::before': { display: 'none' },
  '& .MuiAccordionSummary-root': { minHeight: 0, px: 0 },
  '& .MuiAccordionDetails-root': {
    px: 2,
    py: 1.5,
    maxHeight: 320,
    overflowY: 'auto',
    borderRadius: '8px',
    backgroundColor: theme.palette.panelSurface,
    color: theme.palette.grey[700],
    '& p': { color: theme.palette.grey[700] },
    scrollbarWidth: 'thin',
    scrollbarColor: `${theme.palette.primary.dark} transparent`,
    '&::-webkit-scrollbar': { width: '6px' },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.primary.dark,
      borderRadius: '3px',
    },
  },
});

const summaryLabelStyle = {
  fontFamily: 'headingFontFamily',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'grey.700',
} as const;

interface TranscriptAccordionProps {
  content: StoryblokRichtext;
  // The media title, appended to the summary's aria-label to tell multiple transcripts apart.
  name: string;
  onToggle?: (open: boolean) => void;
  sx?: SxProps<Theme>;
}

export const TranscriptAccordion = ({ content, name, onToggle, sx }: TranscriptAccordionProps) => {
  const tS = useTranslations('Shared');
  const [open, setOpen] = useState(false);

  return (
    <Accordion
      disableGutters
      expanded={open}
      onChange={(_, expanded) => {
        setOpen(expanded);
        onToggle?.(expanded);
      }}
      sx={[accordionStyle, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreRounded sx={{ color: 'grey.700' }} />}
        aria-label={`${tS('videoTranscript.title')} ${name}`}
      >
        <Typography sx={summaryLabelStyle}>{tS('videoTranscript.title')}</Typography>
      </AccordionSummary>
      <AccordionDetails>{render(content, RichTextOptions)}</AccordionDetails>
    </Accordion>
  );
};
