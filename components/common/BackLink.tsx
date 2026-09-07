'use client';

import DirectionalIcon from '@/components/common/DirectionalIcon';
import { Link as i18nLink } from '@/i18n/routing';
import { breadcrumbButtonStyle } from '@/styles/common';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import { Button, Link, Typography, type SxProps, type Theme } from '@mui/material';

const inlineStyle = {
  display: { xs: 'none', md: 'inline-flex' },
  alignItems: 'center',
  alignSelf: 'flex-start',
  gap: 1,
  color: 'text.secondary',
  textDecoration: 'none',
  '&:hover': { color: 'primary.dark' },
} as const;

const inlineLabelStyle = {
  fontFamily: 'headingFontFamily',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'inherit',
} as const;

// Below md the inline link is replaced by a floating white button, level with the fixed
// "Leave this site" button.
const floatingStyle = {
  ...breadcrumbButtonStyle,
  display: { xs: 'inline-flex', md: 'none' },
  gap: 0.5,
  py: 0.5,
  pl: 1,
  pr: 1.5,
  minWidth: 0,
  textTransform: 'none',
  fontFamily: 'headingFontFamily',
  fontSize: '0.75rem',
  fontWeight: 500,
  color: 'text.secondary',
} as const;

const iconStyle = { fontSize: 20, color: 'primary.dark' } as const;

interface BackLinkProps {
  label: string;
  // When omitted the control is a button driven by `onSelect` (e.g. router.back()).
  href?: string;
  onSelect?: () => void;
  // Contextual back links ("Back to library") show an inline link on desktop and a labelled
  // floating button below md. A generic `router.back()` control passes `false`: nothing on
  // desktop, and an icon-only floating button.
  inlineOnDesktop?: boolean;
  qaId?: string;
  sx?: SxProps<Theme>;
}

export function BackLink({
  label,
  href,
  onSelect,
  inlineOnDesktop = true,
  qaId,
  sx,
}: BackLinkProps) {
  const navProps = href
    ? { component: i18nLink, href }
    : { component: 'button' as const, type: 'button' as const };

  return (
    <>
      {inlineOnDesktop && (
        <Link
          {...navProps}
          qa-id={qaId}
          onClick={onSelect}
          aria-label={label}
          sx={[inlineStyle, ...(Array.isArray(sx) ? sx : [sx])]}
        >
          <DirectionalIcon>
            <ArrowBackRounded sx={iconStyle} />
          </DirectionalIcon>
          <Typography component="span" sx={inlineLabelStyle}>
            {label}
          </Typography>
        </Link>
      )}
      <Button
        {...navProps}
        qa-id={qaId ? `${qaId}-mobile` : undefined}
        onClick={onSelect}
        aria-label={label}
        size="small"
        sx={[floatingStyle, !inlineOnDesktop && { pr: 1 }]}
      >
        <DirectionalIcon>
          <ArrowBackRounded sx={iconStyle} />
        </DirectionalIcon>
        {inlineOnDesktop && label}
      </Button>
    </>
  );
}
