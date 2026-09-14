'use client';

import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import type { ReactNode } from 'react';

export type QuoteTextSize = 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';

const FONT_SIZE: Record<QuoteTextSize, { xs: string; md: string }> = {
  'extra-small': { xs: '0.75rem', md: '0.875rem' },
  small: { xs: '0.875rem', md: '0.875rem' },
  medium: { xs: '1rem', md: '1.125rem' },
  large: { xs: '1.125rem', md: '1.25rem' },
  'extra-large': { xs: '1.25rem', md: '1.375rem' },
};

const cardStyle = (background: string) =>
  ({
    m: 0,
    backgroundColor: background,
    borderRadius: '8px',
    p: { xs: 2, md: 2.5 },
  }) as const;

const quoteMarkStyle = {
  position: 'relative',
  width: 28,
  height: 22,
  mb: 1.5,
} as const;

const quoteTextStyle = (size: QuoteTextSize) =>
  ({
    m: 0,
    fontFamily: 'headingFontFamily',
    fontStyle: 'italic',
    fontSize: FONT_SIZE[size],
    lineHeight: 1.6,
  }) as const;

const attributionStyle = {
  display: 'block',
  mt: 1.5,
  fontStyle: 'normal',
  color: 'grey.700',
} as const;

export function QuoteCard({
  text,
  attribution,
  textSize = 'small',
  background = 'primary.light',
  qaId,
}: {
  text: ReactNode;
  // Usually blank — survivor quotes are anonymous unless consent is explicit.
  attribution?: string;
  textSize?: QuoteTextSize;
  background?: string;
  qaId?: string;
}) {
  return (
    <Box component="figure" qa-id={qaId} sx={cardStyle(background)}>
      <Box sx={quoteMarkStyle}>
        <Image alt="" src="/pink_quotes.svg" fill sizes="28px" style={{ objectFit: 'contain' }} />
      </Box>
      <Typography component="blockquote" sx={quoteTextStyle(textSize)}>
        {text}
      </Typography>
      {attribution && (
        <Typography component="figcaption" variant="body2" sx={attributionStyle}>
          {attribution}
        </Typography>
      )}
    </Box>
  );
}
