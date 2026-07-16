import { Link as i18nLink } from '@/i18n/routing';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import { Box, Card, CardActionArea, Typography } from '@mui/material';
import Image, { type StaticImageData } from 'next/image';

import { CARD_SHADOW, HEADING_FONT, PANEL_SURFACE, SUPPORT_ARROW_PANEL } from './libraryTokens';

// Two-tone "Get support" card: a light body (illustration inline with the title, supporting text
// below) and a soft-pink panel on the trailing edge holding the arrow.
export function SupportCard({
  title,
  description,
  iconSrc,
  href,
  onSelect,
}: {
  title: string;
  description: string;
  iconSrc?: StaticImageData;
  href: string;
  onSelect?: () => void;
}) {
  return (
    <Card sx={{ m: 0, borderRadius: '16px', boxShadow: CARD_SHADOW, overflow: 'hidden' }}>
      <CardActionArea
        component={i18nLink}
        href={href}
        aria-label={title}
        onClick={onSelect}
        sx={{
          p: 0,
          display: 'flex',
          alignItems: 'stretch',
          minHeight: { xs: 132, md: 180 },
          backgroundColor: PANEL_SURFACE,
          '&:hover': { backgroundColor: 'common.white' },
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 0.75,
            p: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {iconSrc && (
              <Image src={iconSrc} alt="" width={44} height={44} style={{ objectFit: 'contain' }} />
            )}
            <Typography
              sx={{
                fontFamily: HEADING_FONT,
                fontSize: '1.125rem',
                fontWeight: 500,
                letterSpacing: '0.15px',
              }}
            >
              {title}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'grey.800' }}>
            {description}
          </Typography>
        </Box>
        <Box
          sx={{
            flexShrink: 0,
            width: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: SUPPORT_ARROW_PANEL,
          }}
        >
          <ArrowForwardRounded sx={{ color: 'grey.700' }} />
        </Box>
      </CardActionArea>
    </Card>
  );
}
