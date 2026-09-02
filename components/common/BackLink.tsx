'use client';

import DirectionalIcon from '@/components/common/DirectionalIcon';
import { Link as i18nLink } from '@/i18n/routing';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import { Link, Typography, type SxProps, type Theme } from '@mui/material';

const linkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  alignSelf: 'flex-start',
  gap: 1,
  color: 'grey.700',
  textDecoration: 'none',
  '&:hover': { color: 'primary.dark' },
} as const;

const labelStyle = {
  fontFamily: 'headingFontFamily',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'inherit',
} as const;

interface BackLinkProps {
  href: string;
  label: string;
  onSelect?: () => void;
  qaId?: string;
  sx?: SxProps<Theme>;
}

export function BackLink({ href, label, onSelect, qaId, sx }: BackLinkProps) {
  return (
    <Link
      qa-id={qaId}
      component={i18nLink}
      href={href}
      onClick={onSelect}
      aria-label={label}
      sx={[linkStyle, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <DirectionalIcon>
        <ArrowBackRounded sx={{ fontSize: 20 }} />
      </DirectionalIcon>
      <Typography component="span" sx={labelStyle}>
        {label}
      </Typography>
    </Link>
  );
}
