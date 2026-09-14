'use client';

import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import DonutLargeRounded from '@mui/icons-material/DonutLargeRounded';
import LockOutlined from '@mui/icons-material/LockOutlined';
import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

export type CardProgress = 'started' | 'completed';

// Notched into the card's top inline-end corner, so it reads as a stamp on the card rather than
// part of its content. Cards that carry one inset their content to clear it.
const badgeStyle = {
  position: 'absolute',
  top: 0,
  insetInlineEnd: 0,
  zIndex: 1,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.5,
  py: 1,
  pl: 1,
  pr: 1.5,
  backgroundColor: 'panelSurface',
  borderInlineStart: '1px solid',
  borderBottom: '1px solid',
  borderColor: 'cardBorder',
  borderEndStartRadius: '8px',
} as const;

const labelStyle = {
  fontFamily: 'headingFontFamily',
  fontSize: '0.75rem',
  fontWeight: 500,
  color: 'grey.800',
} as const;

interface CardStatusBadgeProps {
  qaId: string;
  progress?: CardProgress;
  accountNeeded?: boolean;
}

export function CardStatusBadge({ qaId, progress, accountNeeded }: CardStatusBadgeProps) {
  const t = useTranslations('Library');
  const tS = useTranslations('Shared');

  if (progress) {
    return (
      <Box qa-id={`${qaId}-progress`} data-progress={progress} sx={badgeStyle}>
        {progress === 'completed' ? (
          <CheckCircleRounded sx={{ fontSize: 16, color: 'secondary.dark' }} />
        ) : (
          <DonutLargeRounded sx={{ fontSize: 14, color: 'grey.700' }} />
        )}
        <Typography sx={labelStyle}>{tS(`progressStatus.${progress}`)}</Typography>
      </Box>
    );
  }

  if (accountNeeded) {
    return (
      <Box qa-id={`${qaId}-account-needed`} sx={badgeStyle}>
        <LockOutlined sx={{ fontSize: 14, color: 'grey.700' }} />
        <Typography sx={labelStyle}>{t('accountNeeded')}</Typography>
      </Box>
    );
  }

  return null;
}
