import { CardStatusBadge } from '@/components/cards/CardStatusBadge';
import { FormatBadge } from '@/components/common/FormatBadge';
import { Link as i18nLink } from '@/i18n/routing';
import { getImageSizes } from '@/lib/utils/imageSizes';
import { type ContentType, type LibraryItem } from '@/lib/utils/libraryData';
import { cardShadow } from '@/styles/common';
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import PlaylistPlayRounded from '@mui/icons-material/PlaylistPlayRounded';
import RouteRounded from '@mui/icons-material/RouteRounded';
import { Box, Card, CardActionArea, Divider, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type { ReactNode } from 'react';

// `illustrated` heads the card with the course illustration and drops the theme line and type
// badge; `compact` is the text-only card.
export type LibraryCardLayout = 'compact' | 'illustrated';

const cardStyle = {
  m: 0,
  height: '100%',
  position: 'relative',
  borderRadius: '16px',
  boxShadow: cardShadow,
  backgroundColor: 'cardSurface',
  border: '1px solid transparent',
  transition: 'border-color 150ms ease',
  '&:hover, &:focus-within': { borderColor: 'secondary.dark' },
} as const;

const actionAreaStyle = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  backgroundColor: 'cardSurface',
  '&:hover': { backgroundColor: 'common.white' },
} as const;

const imagePanelStyle = {
  position: 'relative',
  height: { xs: 140, md: 160 },
  flexShrink: 0,
  backgroundColor: 'secondary.light',
} as const;

// A compact card always reserves room at the top for the corner badge, so the title sits in the
// same place whether or not a badge is present. Under `illustrated` the badge sits over the image.
const contentStyle = (layout: LibraryCardLayout) =>
  ({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    p: 2,
    pt: layout === 'compact' ? 6 : 2,
  }) as const;

const themeStyle = {
  color: 'grey.800',
  mb: 0.5,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} as const;

const descriptionStyle = {
  color: 'grey.800',
  mt: 2,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
} as const;

const metaRowStyle = { display: 'flex', alignItems: 'flex-start', gap: 2 } as const;

const metaStyle = { display: 'flex', gap: 0.5, color: 'grey.800' } as const;

const metaLabelStyle = {
  fontFamily: 'headingFontFamily',
  fontSize: '0.875rem',
  fontWeight: 500,
} as const;

const spacerStyle = { flexGrow: 1 } as const;

function Meta({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <Box sx={metaStyle}>
      <Box sx={{ mt: 0.25 }}>{icon}</Box>
      <Typography sx={metaLabelStyle}>{text}</Typography>
    </Box>
  );
}

export function LibraryCard({
  item,
  layout = 'compact',
  showAccountNeeded = false,
  onSelect,
}: {
  item: LibraryItem;
  layout?: LibraryCardLayout;
  showAccountNeeded?: boolean;
  onSelect?: () => void;
}) {
  const t = useTranslations('Library');
  const isCourse = item.kind === 'course';
  const badgeType: ContentType = isCourse ? 'course' : (item.format ?? 'video');
  const showAccountBadge = showAccountNeeded && !item.progress && item.requiresAccount;
  const isIllustrated = layout === 'illustrated' && Boolean(item.imageSrc);

  return (
    <Card qa-id="library-card" data-kind={item.kind} data-format={item.format ?? ''} sx={cardStyle}>
      <CardActionArea
        component={i18nLink}
        href={item.href}
        aria-label={item.title}
        onClick={onSelect}
        sx={actionAreaStyle}
      >
        <CardStatusBadge
          qaId="library-card"
          progress={item.progress}
          accountNeeded={showAccountBadge}
        />

        {isIllustrated && (
          <Box sx={imagePanelStyle}>
            <Image
              alt=""
              src={item.imageSrc!}
              fill
              sizes={getImageSizes({ xs: '100vw', md: '340px' })}
              style={{ objectFit: 'contain', padding: '1rem' }}
            />
          </Box>
        )}

        <Box sx={contentStyle(isIllustrated ? 'illustrated' : 'compact')}>
          {!isIllustrated && (
            <Typography variant="body2" sx={themeStyle}>
              {item.themes.map((theme) => t(`themes.${theme}.label`)).join(' · ')}
            </Typography>
          )}
          <Typography variant="h4" sx={{ mb: 1 }}>
            {item.title}
          </Typography>
          {!isIllustrated && <FormatBadge type={badgeType} />}
          <Typography variant="body2" sx={{ ...descriptionStyle, ...(isIllustrated && { mt: 0 }) }}>
            {item.description}
          </Typography>

          <Box sx={spacerStyle} />
          <Divider sx={{ my: 2, borderColor: 'cardBorder' }} />
          <Box sx={metaRowStyle}>
            {isCourse ? (
              <Meta
                icon={<PlaylistPlayRounded sx={{ fontSize: 16 }} />}
                text={t('sessionCount', { count: item.sessionCount ?? 0 })}
              />
            ) : item.minutes != null ? (
              <Meta
                icon={<AccessTimeRounded sx={{ fontSize: 16 }} />}
                text={t('duration', { minutes: item.minutes })}
              />
            ) : (
              item.courseTitle && (
                <Meta
                  icon={<RouteRounded sx={{ fontSize: 16 }} />}
                  text={t('partOfCourse', { course: item.courseTitle })}
                />
              )
            )}
            <Box sx={spacerStyle} />
            <ArrowForwardRounded sx={{ fontSize: 18, color: 'secondary.dark', my: 'auto' }} />
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
}
