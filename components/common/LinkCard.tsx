'use client';

import DirectionalIcon from '@/components/common/DirectionalIcon';
import { Link as i18nLink } from '@/i18n/routing';
import { isExternalHref } from '@/lib/utils/links';
import { cardShadow } from '@/styles/common';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import { Box, Card, CardActionArea, Typography } from '@mui/material';
import Image, { type StaticImageData } from 'next/image';
import type { ReactNode } from 'react';

// A titled card that links somewhere, optionally leading with an icon and closing with an arrow in
// a tinted panel. Used by the "Get support" section and the Storyblok `link_card` blok.

// `small` fits three across a row; `large` is taller and fits two.
export type LinkCardSize = 'small' | 'large';

const SIZE: Record<
  LinkCardSize,
  { minHeight: object | number; arrowWidth: object | number; radius: string }
> = {
  small: { minHeight: 84, arrowWidth: 64, radius: '8px' },
  large: { minHeight: { xs: 132, md: 180 }, arrowWidth: { xs: 56, md: 72 }, radius: '16px' },
};

const cardStyle = (size: LinkCardSize) =>
  ({
    m: 0,
    height: '100%',
    borderRadius: SIZE[size].radius,
    boxShadow: cardShadow,
    overflow: 'hidden',
  }) as const;

const actionAreaStyle = (size: LinkCardSize, background: string) =>
  ({
    p: 0,
    height: '100%',
    display: 'flex',
    alignItems: 'stretch',
    minHeight: SIZE[size].minHeight,
    backgroundColor: background,
    '&:hover': { backgroundColor: 'common.white' },
  }) as const;

const bodyStyle = {
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: 0.75,
  p: 2,
} as const;

const titleRowStyle = { display: 'flex', alignItems: 'center', gap: 1 } as const;

const arrowPanelStyle = (size: LinkCardSize, color: string) =>
  ({
    flexShrink: 0,
    width: SIZE[size].arrowWidth,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color,
  }) as const;

export interface LinkCardProps {
  title: string;
  description?: ReactNode;
  // Omit for a card with no icon. Decorative, so it renders with empty alt text.
  iconSrc?: StaticImageData | string;
  href: string;
  // Detected from the href; pass it only to override that.
  external?: boolean;
  size?: LinkCardSize;
  // Theme palette tokens, e.g. 'common.white' or 'cardSurface'.
  background?: string;
  arrowColor?: string;
  hideArrow?: boolean;
  qaId?: string;
  onSelect?: () => void;
}

export function LinkCard({
  title,
  description,
  iconSrc,
  href,
  external,
  size = 'small',
  background = 'cardSurface',
  arrowColor = 'secondary.light',
  hideArrow = false,
  qaId,
  onSelect,
}: LinkCardProps) {
  // Links off Bloom get a plain anchor and a new tab; in-app links keep their locale.
  const opensInNewTab = external ?? isExternalHref(href);

  return (
    <Card sx={cardStyle(size)}>
      <CardActionArea
        qa-id={qaId}
        aria-label={title}
        onClick={onSelect}
        sx={actionAreaStyle(size, background)}
        {...(opensInNewTab
          ? { component: 'a', href, target: '_blank', rel: 'noreferrer' }
          : { component: i18nLink, href })}
      >
        <Box sx={bodyStyle}>
          <Box sx={titleRowStyle}>
            {iconSrc && (
              <Image alt="" src={iconSrc} width={44} height={44} style={{ objectFit: 'contain' }} />
            )}
            <Typography variant="h4">{title}</Typography>
          </Box>
          {description && (
            <Typography variant="body2" component="div" sx={{ color: 'grey.800' }}>
              {description}
            </Typography>
          )}
        </Box>
        {!hideArrow && (
          <Box sx={arrowPanelStyle(size, arrowColor)}>
            <DirectionalIcon>
              <ArrowForwardRounded sx={{ color: 'grey.700' }} />
            </DirectionalIcon>
          </Box>
        )}
      </CardActionArea>
    </Card>
  );
}
